


var Constants = require("./Constants");
var Helpers = require("./Helpers");
var Browser = require("./BrowserControl");
var ComponentEvent = require("./ComponentEvent");
var ClientTracingHelper = require("./ClientTracingHelper").getInstance(window.ServerData);

var StringHelpers = Helpers.String;
var BrowserHelper = Browser.Helper;
var KeyCode = Constants.KeyCode;

var c_keyDown = "keydown";
var c_scroll = "scroll";
var c_resize = "resize";


exports.applyExtensions = function (ko)
{
    var _componentIdIndex = 1;
    var _componentExtensions = {};

    function applyComponentExtensions(componentViewModel, element)
    {
        var componentId = element.componentId;

        
        if (componentId && _componentExtensions[componentId])
        {
            var componentExtension = _componentExtensions[componentId];
            var parentViewModel = componentExtension.parentViewModel;
            var componentAlias = componentExtension.alias;
            var componentEvents = ko.unwrap(componentExtension.events) || {};

            if (componentAlias)
            {
                if (typeof componentAlias === "string")
                {
                    componentAlias = parentViewModel[componentAlias];
                }

                if (ko.isWritableObservable(componentAlias))
                {
                    componentAlias(componentViewModel);
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () { componentAlias(null); });
                }
            }

            ko.utils.objectForEach(
                componentEvents,
                function (eventName, handler)
                {
                    if (eventName && handler)
                    {
                        if (eventName === "load")
                        {
                            handler.call(parentViewModel, componentViewModel);
                        }
                        else
                        {
                            eventName = "on" + eventName.charAt(0).toUpperCase() + eventName.substr(1);
                            if (ComponentEvent.isComponentEvent(componentViewModel[eventName]))
                            {
                                
                                componentViewModel[eventName].subscribe(
                                    function (eventArgs)
                                    {
                                        
                                        if (componentViewModel[eventName].tracingOptions)
                                        {
                                            ClientTracingHelper.logComponentEvent(componentViewModel, componentViewModel[eventName].tracingOptions, eventName, eventArgs);
                                        }

                                        return handler.apply(parentViewModel, eventArgs);
                                    });
                            }
                        }
                    }
                });
        }
    }

    
    
    ko.components.loaders.unshift(
        {
            loadComponent: function (componentName, config, callback)
            {
                
                ko.components.defaultLoader.loadComponent(
                    componentName,
                    config,
                    function (resolvedConfig)
                    {
                        if (config.enableExtensions)
                        {
                            
                            (function (viewModelFactory)
                            {
                                resolvedConfig.createViewModel = function (params, componentInfo)
                                {
                                    var viewModel = viewModelFactory(params, componentInfo);
                                    applyComponentExtensions(viewModel, componentInfo.element);

                                    return viewModel;
                                };
                            })(resolvedConfig.createViewModel);
                        }

                        callback(resolvedConfig);
                    });
            }
        }
    );

    (function (componentInit)
    {
        ko.bindingHandlers.component.init = function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var value = ko.unwrap(valueAccessor());
            if (typeof value !== "string")
            {
                var componentAlias = value["publicMethods"];
                var componentEvents = value["event"];

                if (value["disabled"])
                {
                    return;
                }

                if (componentAlias || componentEvents)
                {
                    
                    
                    
                    var componentId = element.componentId = _componentIdIndex++;
                    _componentExtensions[componentId] =
                        {
                            parentViewModel: viewModel,
                            alias: componentAlias,
                            events: componentEvents
                        };

                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () { delete _componentExtensions[componentId]; });
                }
            }

            return componentInit(element, valueAccessor, allBindings, viewModel, bindingContext);
        };
    })(ko.bindingHandlers.component.init);

    ko.bindingHandlers.pageViewComponent =
    {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var value = ko.unwrap(valueAccessor());
            value.publicMethods = viewModel.viewInterfaces[bindingContext.$index()];
            value.event = value.event || {};
            value.event.load = viewModel.view_onLoad;
            value.event.switchView = viewModel.view_onSwitchView;

            var updatedValueAccessor = function () { return value; };

            return ko.bindingHandlers.component.init(element, updatedValueAccessor, allBindings, viewModel, bindingContext);
        }
    };

    ko.bindingHandlers.component.preprocess = function (value)
    {
        
        if (value && (value.charAt(0) === "\"" || value.charAt(0) === "'"))
        {
            return StringHelpers.format("{ name: {0}, params: { } }", value);
        }

        return value;
    };

    ko.bindingHandlers.defineGlobals =
    {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            function ExtractFlowToken(html)
            {
                var token = "";

                try
                {
                    var div = document.createElement("div");
                    div.innerHTML = html;

                    if (div.childNodes.length > 0 && div.childNodes[0].value)
                    {
                        token = div.childNodes[0].value;
                    }
                }
                catch (exc)
                {
                }

                return token;
            }

            var serverData = ko.unwrap(valueAccessor());

            
            
            serverData.sFT = ExtractFlowToken(serverData.sFT) || serverData.sFT || ExtractFlowToken(serverData.sFTTag);

            var innerBindingContext = bindingContext.extend(
                {
                    svr: serverData,
                    str: serverData.str,
                    html: serverData.html,
                    $location: ko.observable()
                });

            innerBindingContext.$location.subscribe(
                function (value)
                {
                    if (value)
                    {
                        document.location.replace(value);
                    }
                });

            if (allBindings.has("bodyCssClass"))
            {
                var ieVersion = BrowserHelper.getIEVersion();
                if (ieVersion)
                {
                    
                    var cssBinding = { css: {} };
                    cssBinding.css["IE_M" + ieVersion] = true;
                    ko.applyBindingsToNode(element, cssBinding);
                }

                var isHighContrast = BrowserHelper.isHighContrast();
                if (isHighContrast)
                {
                    var theme = BrowserHelper.getHighContrastTheme();
                    var isHighContrastBlackTheme = theme === "black";
                    var isHighContrastWhiteTheme = theme === "white";

                    if (isHighContrastBlackTheme || isHighContrastWhiteTheme)
                    {
                        var themeClass = isHighContrastBlackTheme ? "theme-dark" : "theme-light";

                        var themeCssBinding = { css: {} };
                        themeCssBinding.css[themeClass] = true;
                        ko.applyBindingsToNode(element, themeCssBinding);
                    }
                }
            }

            ko.applyBindingsToDescendants(innerBindingContext, element);

            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers.autoSubmit =
    {
        update: function (element, valueAccessor)
        {
            var binding = valueAccessor();

            if (ko.unwrap(binding))
            {
                if (ko.isWritableObservable(binding))
                {
                    
                    binding(false);
                }

                element.submit();
            }
        }
    };

    ko.bindingHandlers.postRedirectForm =
    {
        init: function (element)
        {
            element.setAttribute("method", "POST");
            element.setAttribute("aria-hidden", "true");
            element.setAttribute("target", "_top");
        },
        update: function (element, valueAccessor)
        {
            var binding = ko.unwrap(valueAccessor());

            if (binding && binding.url)
            {
                element.setAttribute("action", binding.url);

                if (binding.target)
                {
                    element.setAttribute("target", binding.target);
                }

                if (binding.postParams)
                {
                    ko.utils.objectForEach(
                        binding.postParams,
                        function (name, value)
                        {
                            
                            
                            
                            if (name.substr(0, 7) === "unsafe_")
                            {
                                name = name.substr(7);
                            }

                            
                            if ((value === null) || (value === undefined))
                            {
                                value = "";
                            }

                            var hiddenInput = document.createElement("input");
                            hiddenInput.setAttribute("type", "hidden");
                            hiddenInput.setAttribute("name", name);
                            hiddenInput.setAttribute("value", value);

                            element.appendChild(hiddenInput);
                        });
                }

                element.submit();
            }
        }
    };

    ko.bindingHandlers.href =
    {
        update: function (element, valueAccessor)
        {
            ko.bindingHandlers.attr.update(
                element,
                function ()
                {
                    return { href: valueAccessor() };
                });
        }
    };

    ko.bindingHandlers.placeholder =
    {
        update: function (element, valueAccessor)
        {
            ko.bindingHandlers.attr.update(
                element,
                function ()
                {
                    return { placeholder: valueAccessor() };
                });
        }
    };

    ko.bindingHandlers.ariaLabel =
    {
        update: function (element, valueAccessor)
        {
            ko.bindingHandlers.attr.update(
                element,
                function ()
                {
                    return { "aria-label": valueAccessor() };
                });
        }
    };

    ko.bindingHandlers.ariaDescribedBy =
    {
        
        
        
        update: function (element, valueAccessor)
        {
            ko.bindingHandlers.attr.update(
                element,
                function ()
                {
                    return { "aria-describedby": valueAccessor() };
                });
        }
    };

    ko.bindingHandlers.htmlWithBindings =
    {
        init: function ()
        {
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            ko.utils.setHtml(element, valueAccessor());

            var childBindings = allBindings.get("childBindings");
            if (childBindings)
            {
                for (var id in childBindings)
                {
                    if (childBindings.hasOwnProperty(id))
                    {
                        var child = document.getElementById(id);
                        if (child)
                        {
                            ko.applyBindingsToNode(child, childBindings[id], bindingContext);
                        }
                    }
                }
            }

            ko.applyBindingsToDescendants(bindingContext, element);
        }
    };

    ko.bindingHandlers.backgroundImage =
    {
        update: function (element, valueAccessor)
        {
            
            
            var url = valueAccessor();

            function setBackgroundImg(imgUrl)
            {
                element.style.backgroundImage = imgUrl ? StringHelpers.format("url('{0}')", imgUrl) : "";
            }

            var $Loader = window.$Loader;
            var image = new Image();
            image.onerror = function ()
            {
                if ($Loader && $Loader.On)
                {
                    $Loader.On(image, true, setBackgroundImg);
                }
            };

            image.src = url;

            setBackgroundImg(url);
        }
    };

    ko.bindingHandlers.wizardCssCheck =
    {
        
        
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            if (CSSLoadFail())
            {
                var mainDiv = document.getElementById("mainDiv");
                if (mainDiv)
                {
                    mainDiv.style.display = "none";
                }
            }
        }
    };

    ko.bindingHandlers.withProperties =
    {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var innerBindingContext = bindingContext.extend(valueAccessor);
            ko.applyBindingsToDescendants(innerBindingContext, element);

            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers.clickExpr =
    {
        preprocess: function (value)
        {
            return "function ($data, $event) { " + value + " }";
        },
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            return ko.bindingHandlers.click.init.call(this, element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    };

    ko.bindingHandlers.imgSrc =
    {
        init: function (element)
        {
            var $Loader = window.$Loader;
            element.onerror = function ()
            {
                if ($Loader && $Loader.On)
                {
                    return $Loader.On(element, true, function (imgUrl)
                    {
                        element.src = imgUrl;
                    });
                }
            };

            if (BrowserHelper.isSvgImgSupported())
            {
                element.src = element.getAttribute("svgSrc");
            }
            else
            {
                element.src = element.getAttribute("pngSrc");
            }
        }
    };

    ko.bindingHandlers.svgSrc =
    {
        update: function (element, valueAccessor, allBindings)
        {
            var value = ko.unwrap(valueAccessor());

            ko.bindingHandlers.attr.update(
                element,
                function ()
                {
                    if (value && BrowserHelper.isSvgImgSupported())
                    {
                        value = value.replace(new RegExp(".png$"), ".svg");
                    }

                    var format = allBindings.get("format");
                    if (format)
                    {
                        for (var token in format)
                        {
                            if (format.hasOwnProperty(token) && !format[token])
                            {
                                
                                value = value.replace(token, "");
                            }
                        }
                    }

                    return { src: value };
                });
        }
    };

    ko.bindingHandlers.injectScript =
    {
        init: function (element, valueAccessor)
        {
            var url = ko.unwrap(valueAccessor());
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;

            element.appendChild(script);

            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers.injectIframe =
    {
        init: function (element, valueAccessor)
        {
            var params = ko.unwrap(valueAccessor());
            if (params && params.url)
            {
                var frame = document.createElement("iframe");
                frame.height = "0";
                frame.width = "0";
                frame.style.display = "none";
                frame.src = ko.unwrap(params.url);

                if (params.onload)
                {
                    frame.onload = function () { params.onload(frame); };
                }

                element.appendChild(frame);
            }

            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers.injectDfpIframe =
    {
        init: function (element, valueAccessor)
        {
            var params = ko.unwrap(valueAccessor());
            if (params && params.url)
            {
                var dfpIframe = document.createElement("iframe");
                dfpIframe.id = "iDeviceFingerPrinting";
                dfpIframe.setAttribute("style", "color:#000000;float:left;visibility:hidden;position:absolute;width:1px;height:1px;left:-10000px;top:-10000px;border:0px");
                dfpIframe.src = ko.unwrap(params.url);

                if (params.onload)
                {
                    dfpIframe.onload = function () { params.onload(dfpIframe); };
                }

                element.appendChild(dfpIframe);
            }

            return { controlsDescendantBindings: true };
        }
    };

    
    
    ko.bindingHandlers.hasFocusEx =
    {
        init: ko.bindingHandlers.hasFocus.init,
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            ko.bindingHandlers.hasFocus.update(element, valueAccessor, allBindings, viewModel, bindingContext);

            var value = ko.unwrap(valueAccessor());
            if (value)
            {
                if (element.value)
                {
                    
                    var length = element.value.length;
                    if ("selectionStart" in element)
                    {
                        setTimeout(function ()
                        {
                            try
                            {
                                element.selectionStart = length;
                                element.selectionEnd = length;
                            }
                            catch (e)
                            {
                                
                            }
                        }, 0);
                    }
                    else if ("createTextRange" in element)
                    {
                        
                        var inputRange = element.createTextRange();
                        inputRange.moveStart("character", length);
                        inputRange.collapse();
                        inputRange.moveEnd("character", length);
                        inputRange.select();
                    }
                }

                element.focus();
            }
            else
            {
                element.blur();
            }
        }
    };

    ko.bindingHandlers.preventTabbing =
    {
        init: function (element, valueAccessor)
        {
            var value = ko.unwrap(valueAccessor()) || {};

            function ignoreTab(e)
            {
                e = e || window.event;
                if (e.code === "Tab" || e.keyCode === KeyCode.Tab)
                {
                    if (!value.direction
                        || value.direction === "both"
                        || (value.direction === "up" && e.shiftKey)
                        || (value.direction === "down" && !e.shiftKey))
                    {
                        _preventDefaultEventAction(e);
                        return false;
                    }
                }

                return true;
            }

            if (value.direction !== "none")
            {
                ko.utils.registerEventHandler(element, c_keyDown, ignoreTab);
            }
        }
    };

    ko.bindingHandlers.ariaHidden =
    {
        update: function (element, valueAccessor)
        {
            ko.bindingHandlers.attr.update(
                element,
                function ()
                {
                    return { "aria-hidden": ko.unwrap(valueAccessor()) };
                });
        }
    };

    ko.bindingHandlers.moveOffScreen =
    {
        update: function (element, valueAccessor)
        {
            var value = ko.unwrap(valueAccessor());

            if (typeof value !== "object")
            {
                var defaultValue = value !== false;
                value =
                    {
                        setClass: defaultValue,
                        setTabIndex: defaultValue,
                        setAriaHidden: defaultValue
                    };
            }

            
            ko.bindingHandlers.css.update(
                element,
                function ()
                {
                    return { moveOffScreen: value.setClass !== false };
                });

            
            ko.bindingHandlers.attr.update(
                element,
                function ()
                {
                    return { tabindex: value.setTabIndex !== false ? -1 : 0 };
                });

            
            ko.bindingHandlers.ariaHidden.update(
                element,
                function ()
                {
                    return value.setAriaHidden !== false;
                });
        }
    };

    ko.bindingHandlers.pressEnter =
    {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var callback = ko.unwrap(valueAccessor());
            var data = bindingContext.$data;

            function onKeyDown(e)
            {
                e = e || window.event;
                if (e.code === "Enter" || e.keyCode === KeyCode.Enter)
                {
                    _preventDefaultEventAction(e);
                    callback(data, e);
                    return false;
                }

                return true;
            }

            ko.utils.registerEventHandler(element, c_keyDown, onKeyDown);
        }
    };

    
    ko.bindingHandlers.isScrolledToBottom =
    {
        init: function (element, valueAccessor)
        {
            var params = ko.unwrap(valueAccessor());

            var disabled = params.disabled;
            var valueObservable = params.value;
            var sticky = params.sticky;

            if (disabled || !ko.isWritableObservable(valueObservable))
            {
                return;
            }

            function onScrollOrResize()
            {
                var isScrolledToBottom = element.scrollTop + element.offsetHeight >= element.scrollHeight;
                valueObservable(isScrolledToBottom);

                if (sticky && isScrolledToBottom)
                {
                    
                    
                    removeEventHandlers();
                }

                return isScrolledToBottom;
            }

            function removeEventHandlers()
            {
                BrowserHelper.removeEventListener(element, c_scroll, onScrollOrResize);
                BrowserHelper.removeEventListener(window, c_resize, onScrollOrResize);
            }

            
            if (sticky && onScrollOrResize())
            {
                
                return;
            }

            BrowserHelper.addEventListener(element, c_scroll, onScrollOrResize);
            BrowserHelper.addEventListener(window, c_resize, onScrollOrResize);

            ko.utils.domNodeDisposal.addDisposeCallback(element, removeEventHandlers);
        },
        update: function (element, valueAccessor)
        {
            var params = ko.unwrap(valueAccessor());
            if (params.value())
            {
                
                element.scrollTop = element.scrollHeight;
            }
        }
    };

    ko.bindingHandlers.animationEnd =
    {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var eventName = BrowserHelper.getAnimationEndEventName();
            if (!eventName)
            {
                return;
            }

            ko.bindingHandlers.event.init(
                element,
                function ()
                {
                    var binding = {};
                    binding[eventName] = ko.unwrap(valueAccessor());

                    return binding;
                }, allBindings, viewModel, bindingContext);
        }
    };

    
    ko.bindingHandlers.htmlWithMods =
    {
        init: function (element, valueAccessor, allBindings)
        {
            var htmlContent = ko.unwrap(valueAccessor());
            if (!htmlContent)
            {
                return;
            }

            function getLinkInnerText(innerText, parentheticalText)
            {
                if (innerText !== parentheticalText)
                {
                    return innerText + " (" + parentheticalText + ")";
                }

                return innerText;
            }

            var params = allBindings.get("htmlMods");
            if (params && params.filterLinks)
            {
                var div = document.createElement("div");
                div.innerHTML = htmlContent;

                var links = div.getElementsByTagName("a");

                for (var i = links.length - 1; i >= 0; i--)
                {
                    var link = links[i];
                    var innerText = link.innerText;
                    var protocol = link.protocol;

                    if (protocol === "mailto:" || protocol === "tel:")
                    {
                        if (params.allowContactProtocols !== false)
                        {
                            continue;
                        }
                        else
                        {
                            innerText = getLinkInnerText(innerText, link.pathname);
                        }
                    }
                    else
                    {
                        innerText = getLinkInnerText(innerText, link.getAttribute("href"));
                    }

                    var span = document.createElement("span");
                    span.innerText = innerText;
                    link.parentNode.replaceChild(span, link);
                }

                htmlContent = div.innerHTML;
            }

            ko.utils.setHtml(element, htmlContent);
        }
    };

    ko.bindingHandlers.externalCss =
    {
        update: function (element, valueAccessor)
        {
            ko.utils.objectForEach(
                ko.unwrap(valueAccessor()),
                function (className, value)
                {
                    var addClass = ko.unwrap(value);

                    ko.utils.toggleDomNodeCssClass(element, className, addClass);
                    ko.utils.toggleDomNodeCssClass(element, "ext-" + className, addClass);
                });
        }
    };

    ko.virtualElements.allowedBindings.withProperties = true;
    (ko.options = ko.options || {}).createChildContextWithAs = true;

    if (__FIX_IE7_DROPDOWNS__)
    {
        var DropdownKnockoutExtensions = require("./DropdownKnockoutExtensions");
        DropdownKnockoutExtensions.applyExtensions(ko);
    }
};

function _preventDefaultEventAction(e)
{
    if (e.preventDefault)
    {
        e.preventDefault();
    }
    else
    {
        e.returnValue = false;
    }
}