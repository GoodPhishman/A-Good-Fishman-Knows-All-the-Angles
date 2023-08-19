
var ko = require("knockout");
var Constants = require("./Constants");
var Browser = require("./BrowserControl");
var BrowserHistory = require("./BrowserHistory");
var ComponentEvent = require("./ComponentEvent");
var PromiseHelpers = require("../Core/PromiseHelpers");
var TelemetryFactory = require("./TelemetryFactory");
var ClientTracingHelper = require("./ClientTracingHelper").getInstance(window.ServerData);
var ClientTracingConstants = require("./ClientTracingConstants");

var w = window;
var doc = document;
var head = doc.head;
var HtmlElementNodeType = 1;
var PreviousPaginatedState = Constants.PaginatedState.Previous;
var AnimationState = Constants.AnimationState;
var AnimationName = Constants.AnimationName;
var AnimationTimeout = Constants.AnimationTimeout;
var BrowserHelper = Browser.Helper;


function PaginationControl(params, views, viewInterfaces, viewMetadata)
{
    var _this = this;

    
    var _serverData = w.ServerData;
    var _initialViewId = params.initialViewId || null;
    var _currentViewId = params.currentViewId || null;
    var _initialSharedData = params.initialSharedData || {};
    var _initialError = params.initialError;
    var _enableCssAnimation = params.enableCssAnimation;
    var _disableAnimationIfAnimationEndUnsupported = params.disableAnimationIfAnimationEndUnsupported;
    var _telemetry = TelemetryFactory.getInstance(_serverData);
    

    
    var _removeMinWidthFromLightBox = _serverData.fRemoveMinWidthFromLightBox;
    

    
    var _viewInterfaces = viewInterfaces;
    var _viewMetadata = viewMetadata;
    var _history = null;
    var _currentAnimationState = AnimationState.End;
    var _animateBack = false;
    var _previousViewId = null;
    var _newViewId = null;
    var _useCssAnimations = false;
    var _disableAnimationTimeout = null;

    var _viewId = ko.observable();
    

    
    _this.views = views;
    _this.viewInterfaces = viewInterfaces;
    _this.sharedData = _initialSharedData;
    _this.initialError = _initialError;
    _this.isInitialState = false;
    _this.showLogo = params.showLogo || false;
    _this.bannerLogoUrl = params.bannerLogoUrl || "";

    _this.isBackButtonVisible = ko.observable(false);
    _this.isBackButtonFocused = ko.observable(false);
    _this.backButtonDescribedBy = ko.observable(null);
    _this.hasInitialViewShown = ko.observable(false);
    _this.unsafe_displayName = ko.observable();

    _this.hidePaginatedView = ko.utils.extend(ko.observable(false), { hideSubView: ko.observable(false) });
    _this.animate = ko.utils.extend(ko.observable(AnimationName.None),
        {
            animateBanner: ko.observable(false),
            isSlideOutNext: ko.pureComputed(function () { return _this.animate() === AnimationName.SlideOutNext; }),
            isSlideInNext: ko.pureComputed(function () { return _this.animate() === AnimationName.SlideInNext; }),
            isSlideOutBack: ko.pureComputed(function () { return _this.animate() === AnimationName.SlideOutBack; }),
            isSlideInBack: ko.pureComputed(function () { return _this.animate() === AnimationName.SlideInBack; })
        });

    _this.showIdentityBanner = ko.pureComputed(
        function ()
        {
            var viewId = _viewId();
            return (viewId && _viewMetadata[viewId].metadata && _viewMetadata[viewId].metadata["showIdentityBanner"]);
        });

    _this.currentViewIndex = ko.pureComputed(
        function ()
        {
            var viewId = _viewId();

            if (_viewMetadata[viewId] && !isNaN(_viewMetadata[viewId].index))
            {
                return _viewMetadata[viewId].index;
            }

            return -1;
        });

    

    
    _this.onCancel = ComponentEvent.create();
    _this.onUnload = ComponentEvent.create();
    _this.onLoadView = ComponentEvent.create();
    _this.onShowView = ComponentEvent.create();
    _this.onSetLightBoxFadeIn = ComponentEvent.create();
    _this.onAnimationStateChange = ComponentEvent.create();

    
    _this.dispose = function ()
    {
        _this.onUnload(_history.getState().viewId);
        _history.dispose();
    };

    _this.setDefaultFocus = function ()
    {
        var viewInterface = _getCurrentViewInterface();
        if (viewInterface && viewInterface.setDefaultFocus)
        {
            viewInterface.setDefaultFocus();
        }
    };

    _this.getCurrentViewId = function ()
    {
        return _viewId();
    };

    _this.getSharedData = function ()
    {
        return _this.sharedData || {};
    };

    _this.getSharedDataItem = function (key)
    {
        return _this.getSharedData()[key];
    };

    _this.getCurrentView = function ()
    {
        return { viewId: _viewId(), viewInterface: _getCurrentViewInterface() };
    };

    _this.setSharedDataItem = function (key, value)
    {
        if (!_this.sharedData)
        {
            _this.sharedData = {};
        }

        _this.sharedData[key] = value;
    };

    _this.saveSharedDataOnCurrentView = function ()
    {
        var viewInterface = _getCurrentViewInterface();

        if (viewInterface)
        {
            viewInterface.saveSharedData(_this.sharedData);
        }
    };

    _this.currentViewHasMetadata = function (property)
    {
        var viewId = _viewId();

        if (_viewMetadata[viewId])
        {
            return !!_viewMetadata[viewId].metadata[property];
        }

        return false;
    };

    _this.submitCurrentView = function ()
    {
        var viewInterface = _getCurrentViewInterface();
        if (viewInterface && viewInterface.submit)
        {
            viewInterface.submit();
        }
    };

    _this.identityBanner_onBackButtonClick = function ()
    {
        _this.view_onSwitchView(PreviousPaginatedState);
    };

    _this.restoreState = function (persistedViewId)
    {
        if (__LAYOUT_TEMPLATES_ENABLED__ || __LAYOUT_TEMPLATES_ROLLOUT__)
        {
            
            var historyState = _history.getState();

            
            if (persistedViewId && persistedViewId !== _currentViewId)
            {
                _currentViewId = persistedViewId;
                historyState = { viewId: _currentViewId };
                _history.pushState(historyState);
            }

            
            setTimeout(function ()
            {
                _showView(historyState.viewId);
            }, 0);
        }
    };

    
    _this.view_onLoad = function ()
    {
        var historyState = _history.getState();
        var viewInterface = _getCurrentViewInterface();

        
        if (viewInterface)
        {
            viewInterface.restoreState(historyState ? historyState.viewState : null);

            
            
            var viewId = _this.getCurrentViewId();
            ClientTracingHelper.setViewViewModel(viewInterface, viewId, _viewMetadata[viewId].metadata);
            ClientTracingHelper.logViewState(viewInterface);

            if (_telemetry && viewId)
            {
                try
                {
                    _telemetry.set("viewId", viewId, true);
                }
                catch (e) { }
            }

            _this.setDefaultFocus();
        }
    };

    _this.view_onSwitchView = function (viewId, replaceHistory, forceTransitionAnimation)
    {
        ClientTracingHelper.logEvent(
            {
                eventType: "view_onSwitchView",
                eventId: ClientTracingConstants.EventIds.Event_PaginationControl_ViewSwitch,
                eventLevel: ClientTracingConstants.EventLevel.Critical,
                eventArgs: { viewId: viewId, replaceHistory: replaceHistory },
                eventOptions: { hidingMode: ClientTracingConstants.HidingMode.None }
            });

        ClientTracingHelper.switchView(_getCurrentViewInterface());

        var historyState = _history.getState() || {};

        if (forceTransitionAnimation)
        {
            historyState.forceTransitionAnimation = forceTransitionAnimation;
            _history.replaceState(historyState);
        }

        _this.initialError = null;
        if (viewId === PreviousPaginatedState)
        {
            _animateBack = true;
            if (historyState.isInitialState)
            {
                _this.onCancel();
            }
            else
            {
                _history.goBack();
            }
        }
        else
        {
            _animateBack = false;
            _saveCurrentViewState(true );

            
            
            
            
            replaceHistory |= (viewId === _viewId() && replaceHistory !== false);

            if (replaceHistory)
            {
                
                historyState.viewId = viewId;
                historyState.viewState = null;
                _history.replaceState(historyState);
            }
            else
            {
                
                historyState = { viewId: viewId };
                _history.pushState(historyState);
            }

            _showView(viewId, forceTransitionAnimation);
        }
    };

    _this.view_onCancel = function ()
    {
        _this.onCancel();
    };

    _this.view_onSetIdentityBackButtonState = function (visible, hasFocus, describedBy)
    {
        _this.isBackButtonVisible(visible || false);
        _this.isBackButtonFocused(hasFocus || false);
        _this.backButtonDescribedBy(describedBy || null);
    };

    _this.view_onAnimationEnd = function ()
    {
        
        

        _this.onAnimationStateChange(_currentAnimationState, _animateBack, !!_previousViewId );

        switch (_currentAnimationState)
        {
            case AnimationState.Begin:
                
                _this.animate(AnimationName.None);
                _this.animate.animateBanner(!_previousViewId || _viewMetadata[_previousViewId].metadata["showIdentityBanner"] !== _viewMetadata[_newViewId].metadata["showIdentityBanner"]);

                
                _currentAnimationState = AnimationState.RenderNewView;
                if (_previousViewId)
                {
                    _this.animate(_animateBack ? AnimationName.SlideOutBack : AnimationName.SlideOutNext);
                }
                else
                {
                    _this.view_onAnimationEnd();
                }
                break;

            case AnimationState.RenderNewView:
                _renderNewView(_newViewId);
                _this.animate.animateBanner() ? _this.hidePaginatedView(true) : _this.hidePaginatedView.hideSubView(true);
                _this.unsafe_displayName(_this.showIdentityBanner() ? BrowserHelper.htmlUnescape(_this.sharedData.displayName || w.ServerData.sPOST_Username) : "");

                
                _currentAnimationState = AnimationState.AnimateNewView;
                if (_previousViewId)
                {
                    setTimeout(_this.view_onAnimationEnd, 0);
                }
                else
                {
                    _this.onSetLightBoxFadeIn(true);
                }
                break;

            case AnimationState.AnimateNewView:
                
                if (_disableAnimationTimeout)
                {
                    clearTimeout(_disableAnimationTimeout);
                    _disableAnimationTimeout = null;
                }

                _currentAnimationState = AnimationState.End;
                _this.hidePaginatedView(false);
                _this.hidePaginatedView.hideSubView(false);
                _this.animate(_animateBack ? AnimationName.SlideInBack : AnimationName.SlideInNext);
                break;
        }
    };

    
    function _getCurrentViewInterface()
    {
        var viewIndex = _this.currentViewIndex();
        if (_viewInterfaces[viewIndex])
        {
            return _viewInterfaces[viewIndex]();
        }

        return null;
    }

    function _renderNewView(viewId)
    {
        
        _viewId(null);
        _this.view_onSetIdentityBackButtonState();

        _this.isInitialState = _history.getState().isInitialState;

        
        _this.onShowView(_viewMetadata[viewId].metadata, viewId);

        
        _viewId(viewId);

        
        _this.hasInitialViewShown(true);

        var activeContainer = document.querySelectorAll("[data-viewid]");

        if (_telemetry && activeContainer && activeContainer.length > 0)
        {
            try
            {
                
                _telemetry.applyClientEventBindings(activeContainer[0]);
            }
            catch (e) { }
        }
    }

    function _showView(viewId, forceTransitionAnimation)
    {
        var currentViewId = _viewId();
        var loadViewPromise = _this.onLoadView(viewId);

        
        
        if (_telemetry && currentViewId)
        {
            try
            {
                _telemetry.set("viewId", currentViewId, true);
                _telemetry.post(true);
            }
            catch (e) { }
        }

        
        if (!loadViewPromise)
        {
            _animateToNewView(currentViewId, viewId, forceTransitionAnimation);

            return;
        }

        PromiseHelpers.throwUnhandledExceptionOnRejection(
            loadViewPromise.then(function ()
            {
                _animateToNewView(currentViewId, viewId, forceTransitionAnimation);
            })
        );
    }

    
    function _animateToNewView(currentViewId, viewId, forceTransitionAnimation)
    {
        var isTransitionAnimated = (currentViewId !== viewId) || forceTransitionAnimation;

        if (_useCssAnimations && isTransitionAnimated && (!_initialError || currentViewId))
        {
            if (_disableAnimationIfAnimationEndUnsupported && _previousViewId === null)
            {
                _disableAnimationTimeout = setTimeout(
                    function ()
                    {
                        _useCssAnimations = false;
                        _this.hidePaginatedView(false);
                        _this.hidePaginatedView.hideSubView(false);
                        _this.onSetLightBoxFadeIn(false);
                        _currentAnimationState = AnimationState.End;
                        _showView(viewId);
                    }, AnimationTimeout);
            }

            _previousViewId = currentViewId;
            _newViewId = viewId;

            _currentAnimationState = AnimationState.Begin;
            _this.view_onAnimationEnd();
        }
        else
        {
            _this.animate(AnimationName.None);
            _this.view_onAnimationEnd();

            _renderNewView(viewId);
            _this.unsafe_displayName(_this.showIdentityBanner() ? BrowserHelper.htmlUnescape(_this.sharedData.displayName || w.ServerData.sPOST_Username) : "");
        }
    }

    function _saveCurrentViewState(saveSharedData)
    {
        var currentViewInterface = _getCurrentViewInterface();

        if (!currentViewInterface)
        {
            return;
        }

        if (saveSharedData)
        {
            
            currentViewInterface.saveSharedData(_this.sharedData);
        }

        
        var viewState = currentViewInterface.getState();
        var historyState = _history.getState();

        historyState.viewState = viewState;
        _history.replaceState(historyState);
    }

    function _history_onBack()
    {
        _animateBack = true;
        _saveCurrentViewState(false );
    }

    function _history_onForward()
    {
        _animateBack = false;
    }

    function _history_onPopState(historyState)
    {
        _this.initialError = null;
        _showView(historyState.viewId, historyState.forceTransitionAnimation);
    }

    (function _initialize()
    {
        _useCssAnimations = _enableCssAnimation && BrowserHelper.isCSSAnimationSupported();
        _history = new BrowserHistory(_history_onBack, _history_onForward, _history_onPopState);

        var historyState = null;

        if (_initialViewId !== null || _currentViewId !== null)
        {
            
            _initialViewId = _initialViewId === null ? _currentViewId : _initialViewId;
            _currentViewId = _currentViewId === null ? _initialViewId : _currentViewId;

            
            historyState = { viewId: _initialViewId, isInitialState: true };
            _history.replaceState(historyState);
        }

        
        if (_currentViewId !== _initialViewId)
        {
            historyState = { viewId: _currentViewId };
            _history.pushState(historyState);
        }

        if (!(__LAYOUT_TEMPLATES_ENABLED__ || __LAYOUT_TEMPLATES_ROLLOUT__) && historyState !== null)
        {
            
            setTimeout(function ()
            {
                _showView(historyState.viewId);
            }, 0);
        }

        
        
        
        
        
        if (__IS_CONVERGEDUX__)
        {
            if (_removeMinWidthFromLightBox)
            {
                var _minWidthCssNode = doc.createElement("style");
                _minWidthCssNode.type = "text/css";
                _minWidthCssNode.innerHTML = ".inner,.promoted-fed-cred-box,.sign-in-box,.new-session-popup-v2sso,.debug-details-banner,.vertical-split-content{min-width:0;}";
                head.appendChild(_minWidthCssNode);
            }
        }
    })();
}

function PaginationControlFactory(params, componentInfo)
{
    var views = [];
    var viewInterfaces = [];
    var viewMetadata = {};
    var index = 0;

    ko.utils.arrayForEach(
        componentInfo.templateNodes,
        function (templateNode)
        {
            var viewId;

            
            if (templateNode.nodeType === HtmlElementNodeType)
            {
                viewId = templateNode.getAttribute("data-viewid");

                if (viewId !== null)
                {
                    views.push(templateNode);
                    viewInterfaces.push(ko.observable());

                    viewId = isNaN(viewId) ? viewId : parseInt(viewId);

                    viewMetadata[viewId] =
                        {
                            index: index++,
                            metadata: _buildViewMetadata(templateNode)
                        };
                }
            }
        });

    return new PaginationControl(params, views, viewInterfaces, viewMetadata);
}

function _buildViewMetadata(templateNode)
{
    var metadata = {};
    var supportedMetadataAttributes =
        [
            "wide",
            "hideLogo",
            "hideDefaultLogo",
            "dynamicBranding",
            "hideLwaDisclaimer",
            "showIdentityBanner",
            "showFedCredButton",
            "hidePageLevelTitleAndDesc",
            "extraDebugDetails"
        ];

    ko.utils.arrayForEach(
        supportedMetadataAttributes,
        function (attributeName)
        {
            var value = templateNode.getAttribute("data-" + attributeName);
            if (value)
            {
                metadata[attributeName] = value.toLowerCase() === "true";
            }
        }
    );

    return metadata;
}

ko.components.register("pagination-control",
    {
        viewModel: { createViewModel: PaginationControlFactory },
        template: require("html/Shared/Controls/PaginationControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });