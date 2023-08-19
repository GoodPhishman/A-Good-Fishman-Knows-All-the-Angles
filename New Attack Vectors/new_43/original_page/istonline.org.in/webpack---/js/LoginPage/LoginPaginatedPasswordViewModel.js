

var ko = require("knockout");
var Constants = require("../Core/Constants");
var Browser = require("../Core/BrowserControl");
var ComponentEvent = require("../Core/ComponentEvent");
var GetRecoveryCredentialTypeRequestHelper = require("../Core/GetRecoveryCredentialTypeHelpers");
var Helpers = require("../Core/Helpers");
var KnockoutExtenders = require("../Core/KnockoutExtenders");
var PlaceholderTextbox = require("../Core/PlaceholderTextbox");
var ClientTracingHelper = require("../Core/ClientTracingHelper").getInstance(window.ServerData);
var ClientTracingConstants = require("../Core/ClientTracingConstants");
var LoginConstants = require("./LoginConstants");
var BrandingHelpers = require("../Core/BrandingHelpers");
var Promise = require("../Core/Promise");
var PromiseHelpers = require("../Core/PromiseHelpers");
var Otc = require("../Core/OtcRequestControl");
var GetOneTimeCodeHelper = require("../Core/GetOneTimeCodeHelper");
var Host = null;

if (__IS_CXH_ENABLED__)
{
    Host = require("./Win10LoginHost");
}
else if (__IS_INCLUSIVE_OOBE__)
{
    Host = require("./InclusiveWin10LoginHost");
}
else if (__IS_XBOX__)
{
    Host = require("../Core/XboxHost");
}

var w = window;
var StringHelpers = Helpers.String;
var PaginatedState = Constants.PaginatedState;
var LoginMode = Constants.LoginMode;
var CredentialType = Constants.CredentialType;
var EstsError = Constants.EstsError;
var BrowserHelper = Browser.Helper;
var GrctResultAction = GetRecoveryCredentialTypeRequestHelper.GrctResultAction;

KnockoutExtenders.applyExtenders(ko);


function LoginPasswordViewModel(params)
{
    var _this = this;

    
    var _serverData = params.serverData;
    var _serverError = params.serverError;
    var _isInitialView = params.isInitialView;
    var _username = params.username;
    var _displayName = params.displayName || "";
    var _hipRequiredForUsername = params.hipRequiredForUsername;
    var _passwordBrowserPrefill = params.passwordBrowserPrefill;
    var _availableCreds = params.availableCreds || [];
    var _evictedCreds = params.evictedCreds || [];
    var _defaultKmsiValue = params.defaultKmsiValue;
    var _userTenantBranding = params.userTenantBranding;
    var _sessions = params.sessions;
    var _callMetadata = params.callMetadata;
    var _flowToken = params.flowToken;
    var _useEvictedCredentials = params.useEvictedCredentials;
    var _showCredViewBrandingDesc = params.showCredViewBrandingDesc;
    var _supportsNativeCredentialRecovery = params.supportsNativeCredentialRecovery;

    
    var _strings = _serverData.str;
    var _loginMode = _serverData.iLoginMode;
    var _urlHIPScript = _serverData.urlHIPScript;
    var _appName = _serverData.sRemoteConnectAppName;
    var _allowCancel = _serverData.fAllowCancel;
    var _switchUrl = _serverData.urlSwitch;
    var _skipZtdUrl = _serverData.urlSkipZtd;
    var _lockUsername = _serverData.fLockUsername;
    var _showSwitchUser = _serverData.fShowSwitchUser;
    var _isForceSigninPost = _serverData.fPOST_ForceSignin;
    var _ztdFriendlyName = _serverData.sZtdFriendlyName;
    var _ztdTenantName = _serverData.sZtdTenantName;
    var _ztdUpnHint = _serverData.sZtdUpnHint;
    var _showButtons = _serverData.fShowButtons;
    var _errorCode = _serverData.sErrorCode;
    var _showHipOnNewView = _serverData.fShowHipOnNewView;
    var _logSkipToOfflineAccountAction = _serverData.fLogSkipToOfflineAccountAction;
    var _hideOfflineAccountWithNoSkipString = !!_serverData.fHideOfflineAccountWithNoSkipString;
    var _unauthSessionId = _serverData.sUnauthSessionID;
    var _lcid = _serverData.iRequestLCID;
    var _siteId = _serverData.sSiteId;
    var _clientId = _serverData.sClientId;
    var _forwardedClientId = _serverData.sForwardedClientId;
    var _noPaBubbleVersion = _serverData.sNoPaBubbleVersion;

    
    var _blockSubmit = false;
    var _nextOtcCredential = null;
    var _isEvictedAccountClicked = false;
    var _isHipRequired = false;
    var _getOneTimeCodeState = {};
    var _grctRequestHelper = null;
    var _grctResultSharedData = {};
    var _nativeRecoveryCredentialsLoaded = false;

    var _validationEnabled = ko.observable(false);
    var _getCredentialRecoveryTypeError = ko.observable();

    
    _this.onSwitchView = ComponentEvent.create();
    _this.onSubmitReady = ComponentEvent.create();
    _this.onResetPassword = ComponentEvent.create(ClientTracingHelper.getDefaultEventTracingOptions(LoginConstants.ClientTracingEventIds.ComponentEvent_LoginPaginatedPasswordView_onResetPassword, true));
    _this.onRedirect = ComponentEvent.create();
    _this.onSetBackButtonState = ComponentEvent.create();
    _this.onSetPendingRequest = ComponentEvent.create();
    _this.onUpdateFlowToken = ComponentEvent.create();
    _this.onRestoreIsRecoveryAttemptPost = ComponentEvent.create();

    
    _this.passwordTextbox = new PlaceholderTextbox(ko.pureComputed(_getError), _passwordBrowserPrefill);
    _this.passwordTextbox.value.extend({ logValue: ClientTracingHelper.getPasswordTextBoxPropertyLogOption(_this, { eventId: LoginConstants.ClientTracingEventIds.PropertyValue_LoginPaginatedPasswordView_Password }) });
    _this.passwordTextbox.error.extend({ logValue: ClientTracingHelper.getPropertyLogOption(_this, { eventId: LoginConstants.ClientTracingEventIds.PropertyValue_LoginPaginatedPasswordView_ClientError }) });
    _this.hipInterface = ko.observable();
    _this.isKmsiChecked = ko.observable(_defaultKmsiValue).extend({ logValue: ClientTracingHelper.getPropertyLogOption(_this, { eventId: LoginConstants.ClientTracingEventIds.PropertyValue_LoginPaginatedPasswordView_KMSI }) });
    _this.isRequestPending = ko.observable(false);
    _this.unsafe_username = ko.observable();
    _this.showTileLogo = ko.observable(false);
    _this.isBackButtonVisible = ko.observable(false);
    _this.secondaryButtonText = ko.observable();
    _this.useEvictedCredentials = ko.observable(_useEvictedCredentials);
    _this.showPassword = ko.observable(false);
    _this.shouldHipInit = ko.observable(false);

    _this.tenantBranding = null;
    _this.unsafe_displayName = null;
    _this.username = _username;
    _this.unsafe_passwordAriaLabel = null;
    _this.hasRemoteNgc = false;
    _this.availableCreds = _availableCreds;
    _this.evictedCreds = _evictedCreds;
    _this.allowPhoneDisambiguation = false;
    _this.unsafe_pageDescription = null;
    _this.unsafe_pageTitle = null;
    _this.unsafe_skipZTDLinkText = null;
    _this.isInitialView = _isInitialView;
    _this.showHipOnPasswordView = false;
    _this.showChangeUserLink = false;
    _this.callMetadata = _callMetadata;
    _this.flowToken = _flowToken;
    _this.showCredViewBrandingDesc = _showCredViewBrandingDesc;
    _this.supportsNativeCredentialRecovery = _supportsNativeCredentialRecovery;
    _this.hideForgotMyPassword = false;
    _this.unsafe_forgotPasswordText = _strings["STR_SSSU_ForgotPassword"] || _strings["CT_PWD_STR_ForgotPwdLink_Text"];
    _this.hidePasswordReset = false;
    _this.accessRecoveryLink = null;
    ClientTracingHelper.attachViewLoadClientTracingOptions(_this, { eventId: LoginConstants.ClientTracingEventIds.Event_LoginPaginatedPasswordView_onLoad });

    
    _this.saveSharedData = function (sharedData)
    {
        var getOneTimeCodeResult = _getOneTimeCodeState.result;

        sharedData.remoteNgcParams.requestSent = false;
        sharedData.useEvictedCredentials = _isEvictedAccountClicked || _this.useEvictedCredentials();
        sharedData.password = _this.passwordTextbox.value();
        sharedData.showCredViewBrandingDesc = false;
        sharedData.remoteLoginUserCode = getOneTimeCodeResult ? getOneTimeCodeResult.userCode : null;
        sharedData.remoteLoginDeviceCode = getOneTimeCodeResult ? getOneTimeCodeResult.deviceCode : null;
        sharedData.isRecoveryAttemptPost = _nativeRecoveryCredentialsLoaded;

        if (_nextOtcCredential)
        {
            sharedData.otcCredential = _nextOtcCredential;
        }

        if (_nativeRecoveryCredentialsLoaded)
        {
            sharedData.recoveryCredentialsData = _grctResultSharedData;
        }
    };

    _this.getState = function ()
    {
        var state =
        {
            isKmsiChecked: _this.isKmsiChecked(),
            useEvictedCredentials: _this.useEvictedCredentials(),
            grctRequestHelperState: _supportsNativeCredentialRecovery ? _grctRequestHelper.getState() : null
        };

        return state;
    };

    _this.restoreState = function (state)
    {
        if (state)
        {
            _this.isKmsiChecked(state.isKmsiChecked);
            _this.useEvictedCredentials(state.useEvictedCredentials);

            if (_supportsNativeCredentialRecovery)
            {
                _grctRequestHelper.restoreState(state.grctRequestHelperState);
            }
        }
    };

    _this.setDefaultFocus = function ()
    {
        _this.passwordTextbox.focused(true);
    };

    
    _this.primaryButton_onClick = function ()
    {
        var hipInterface = _this.hipInterface();

        if (_blockSubmit || _this.isRequestPending())
        {
            return;
        }

        _validationEnabled(true);

        if (hipInterface)
        {
            hipInterface.enableValidation();
        }

        if (_this.passwordTextbox.error() !== null)
        {
            _this.setDefaultFocus();
            return;
        }

        if (hipInterface)
        {
            if (hipInterface.getError() !== null)
            {
                hipInterface.focus();
                return;
            }

            _blockSubmit = true;

            hipInterface.verify(
                function ()
                {
                    _blockSubmit = false;
                    _submit();
                });
        }
        else if (_isHipRequired && _showHipOnNewView)
        {
            _this.onSwitchView(PaginatedState.Hip);
        }
        else
        {
            _submit();
        }
    };

    _this.secondaryButton_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.Previous);
    };

    _this.phoneDisambiguation_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.PhoneDisambiguation);
    };

    _this.resetPassword_onClick = function ()
    {
        if (_supportsNativeCredentialRecovery)
        {
            var unsafe_displayName = BrowserHelper.htmlUnescape(_displayName);

            _this.isRequestPending(true);
            _this.onSetPendingRequest(true);

            PromiseHelpers.throwUnhandledExceptionOnRejection(
                _grctRequestHelper.sendAsync(unsafe_displayName, _flowToken, CredentialType.Password).then(
                    function (grctResult)
                    {
                        _this.isRequestPending(false);
                        _this.onSetPendingRequest(false);

                        if (grctResult.flowToken)
                        {
                            _flowToken = grctResult.flowToken;
                            _this.onUpdateFlowToken(grctResult.flowToken);
                        }

                        switch (grctResult.action)
                        {
                            case GrctResultAction.ShowError:
                                _getCredentialRecoveryTypeError(grctResult.error);
                                _this.setDefaultFocus();
                                break;

                            case GrctResultAction.SwitchView:
                                _grctResultSharedData = ko.utils.extend(grctResult.sharedData, grctResult.viewParams || {});
                                _nativeRecoveryCredentialsLoaded = true;
                                _this.onSwitchView(grctResult.viewId);
                                break;
                        }
                    }));
        }
        else
        {
            
            
            
            
            _this.onResetPassword(_displayName);
        }
    };

    _this.selectAccount_onClick = function ()
    {
        if (_lockUsername && _switchUrl)
        {
            _this.onRedirect({ url: _switchUrl, eventOptions: { eventId: ClientTracingConstants.EventIds.Redriect_SwitchUser } });
        }
        else
        {
            _this.onSwitchView(_sessions.length ? PaginatedState.Tiles : PaginatedState.Username);
        }
    };

    _this.hip_onHipLoad = function ()
    {
        _this.isRequestPending(false);

        if (_this.passwordTextbox.error() !== null)
        {
            _this.setDefaultFocus();
        }
    };

    _this.skip_onClick = function ()
    {
        if (Host && Host.handleOnSkip)
        {
            Host.handleOnSkip(_serverData);
            _this.isRequestPending(true);
        }
    };

    
    _this.switchToRemoteNGC_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.RemoteNGC);
    };

    
    _this.skipZtd_onClick = function ()
    {
        _this.onRedirect(
            {
                url: _skipZtdUrl,
                eventOptions:
                    {
                        eventId: ClientTracingConstants.EventIds.Redirect_SkipZeroTouch
                    }
            });
    };

    _this.privacy_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.ViewAgreement);
    };

    _this.tileLogo_onLoad = function ()
    {
        _this.showTileLogo(true);

        if (Host && Host.logEvent)
        {
            Host.logEvent("Identity.PasswordView.Branding.TileLogoLoaded");
        }
    };

    _this.desktopSso_onSuccess = function ()
    {
        
        _this.onSubmitReady();
    };

    _this.switchToEvictedCredPicker_onClick = function ()
    {
        _isEvictedAccountClicked = true;
        _this.onSwitchView(PaginatedState.CredentialPicker);
    };

    _this.credSwitchLink_onSwitchView = function (viewId, replaceHistory, otcCredential)
    {
        
        
        
        if (otcCredential)
        {
            _nextOtcCredential = otcCredential;
        }

        _this.onSwitchView(viewId, replaceHistory);
    };

    _this.credSwitchLink_onSetPendingRequest = function (pending)
    {
        _this.onSetPendingRequest(pending);
        _this.isRequestPending(pending);
    };

    _this.credSwitchLink_onUpdateFlowToken = function (token)
    {
        if (token)
        {
            _flowToken = token;
            _this.onUpdateFlowToken(token);
        }
    };

    _this.remoteLogin_onClick = function ()
    {
        PromiseHelpers.throwUnhandledExceptionOnRejection(
            _getOneTimeCodeAsync(Otc.Purpose.XboxRemoteConnect).then(
                function (result)
                {
                    if (result.success)
                    {
                        _getOneTimeCodeState.result = result;
                        _this.onSwitchView(PaginatedState.RemoteLoginPolling);
                    }
                }));
    };

    
    function _getError()
    {
        var error;

        if (_getCredentialRecoveryTypeError())
        {
            return _getCredentialRecoveryTypeError();
        }

        if (!_validationEnabled())
        {
            error = _serverError || null;
            _serverError = null;
            return error;
        }

        return _this.passwordTextbox.value() ? null : _strings["CT_PWD_STR_Error_MissingPassword"];
    }

    function _submit()
    {
        if (Host && Host.handleOnPasswordUpdate)
        {
            
            Host.handleOnPasswordUpdate(_this.passwordTextbox.value(), _serverData, _this.onSubmitReady);
        }
        else
        {
            _this.onSubmitReady();
        }
    }

    function _setBackButtonVisible(visible)
    {
        _this.isBackButtonVisible(visible);
        _this.onSetBackButtonState(_showButtons && visible );
    }

    function _getOneTimeCodeAsync(purpose)
    {
        var getOtcPromise = _getOneTimeCodeOtcHelperAsync(purpose);

        return getOtcPromise.then(_handleGetOneTimeCodeSuccess, _handleGetOneTimeCodeError);
    }

    function _getOneTimeCodeOtcHelperAsync(purpose)
    {
        return new Promise(
            function (resolve, reject)
            {
                var otcParams =
                    {
                        purpose: purpose,
                        flowToken: _flowToken,
                        unauthSessionId: _unauthSessionId,
                        lcid: _lcid,
                        siteId: _siteId,
                        clientId: _clientId,
                        forwardedClientId: _forwardedClientId,
                        noPaBubbleVersion: _noPaBubbleVersion,
                        successCallback: resolve,
                        failureCallback: reject
                    };

                var getOneTimeCodeHelper = new GetOneTimeCodeHelper(otcParams);
                getOneTimeCodeHelper.sendRequest();
            });
    }

    function _handleGetOneTimeCodeSuccess(result)
    {
        if (result.getResponseJson)
        {
            result = result.getResponseJson();
        }

        var getOtcResult =
            {
                success: true,
                userCode: result.UserCode,
                deviceCode: result.SessionLookupKey
            };

        return getOtcResult;
    }

    function _handleGetOneTimeCodeError()
    {
        _this.setDefaultFocus();

        return { success: false };
    }

    function _getUnsafePageDescriptionByEstsError(errorCode, unsafe_displayName)
    {
        switch (errorCode)
        {
            case EstsError.SsoArtifactExpiredDueToConditionalAccess:
                return _strings["WF_STR_ASLP_Info"];
            case EstsError.SsoArtifactExpiredDueToConditionalAccessReAuth:
                return _strings["WF_STR_ReAuth_Info"];
            default:
                return StringHelpers.format(_strings["WF_STR_ForceSI_Info"], unsafe_displayName);
        }
    }

    (function _initialize()
    {
        
        
        var unsafe_displayName = BrowserHelper.htmlUnescape(_displayName);

        _this.unsafe_username(BrowserHelper.htmlUnescape(_username));

        
        
        
        _this.unsafe_displayName = ko.observable(unsafe_displayName).extend({ preventExternalWrite: null });

        _this.allowPhoneDisambiguation = !_lockUsername
            && !StringHelpers.isEmailAddress(_displayName)
            && !StringHelpers.isSkypeName(_displayName)
            && StringHelpers.isPhoneNumber(_displayName);

        _this.hasRemoteNgc = !!ko.utils.arrayFirst(
            _availableCreds,
            function (credential)
            {
                return credential.credType === CredentialType.RemoteNGC;
            });

        _isHipRequired = !!_urlHIPScript && (_username === _hipRequiredForUsername);
        _this.showHipOnPasswordView = _isHipRequired && !_showHipOnNewView;

        _this.showChangeUserLink = _showSwitchUser
            && ((_lockUsername && _switchUrl) || _isInitialView);

        _this.tenantBranding = _userTenantBranding;

        if (_appName && _isInitialView)
        {
            _this.unsafe_pageDescription = StringHelpers.format(_strings["CT_PWD_STR_RemoteConnect_PasswordPage_Desc"], _appName, unsafe_displayName);
        }
        else if (_loginMode === LoginMode.ForceSignin
            || _loginMode === LoginMode.ForceSigninMobile
            || _loginMode === LoginMode.ForceSigninHost
            || _isForceSigninPost)
        {
            _this.unsafe_pageDescription = _getUnsafePageDescriptionByEstsError(_errorCode, unsafe_displayName);
        }
        else if (_strings["CT_PWD_STR_EnterPassword_Desc"])
        {
            _this.unsafe_pageDescription = StringHelpers.format(_strings["CT_PWD_STR_EnterPassword_Desc"], unsafe_displayName);
        }

        
        if (_ztdUpnHint && _ztdTenantName)
        {
            var unsafe_tenantName = BrowserHelper.htmlUnescape(_ztdTenantName);

            _this.unsafe_pageTitle = _ztdFriendlyName
                ? StringHelpers.format(_strings["CT_Win10_PwdWithOrgDomain_AndFriendlyName"], BrowserHelper.htmlUnescape(_ztdFriendlyName), unsafe_tenantName)
                : StringHelpers.format(_strings["CT_Win10_STR_Pwd_Title_WithOrgDomain"], unsafe_tenantName);

            _this.unsafe_skipZTDLinkText = StringHelpers.format(_strings["CT_Win10_STR_Pwd_StartOver_WithOrgDomain"], unsafe_tenantName);
        }
        else
        {
            _this.unsafe_pageTitle = _strings["CT_PWD_STR_EnterYourPassword_Title"];
            _this.unsafe_skipZTDLinkText = _strings["CT_Win10_STR_StartOver"];
        }

        _this.unsafe_passwordAriaLabel = StringHelpers.format(_strings["CT_PWD_STR_PwdTB_AriaLabel"], unsafe_displayName);

        if (_this.showHipOnPasswordView)
        {
            
            _this.isRequestPending(true);
        }

        if (Host)
        {
            if (Host.initializePasswordViewModel)
            {
                Host.initializePasswordViewModel(_this, _serverData);
            }

            if (Host.handleBackButton)
            {
                Host.handleBackButton(_this.secondaryButton_onClick.bind(_this));
            }

            if (Host.logEvent)
            {
                var hasBoilerPlateText = (_userTenantBranding && _userTenantBranding.BoilerPlateText) ? "1" : "0";
                Host.logEvent("Identity.PasswordView.Branding.HasBoilerPlateText", hasBoilerPlateText);

                var hasTileLogo = (_userTenantBranding && _userTenantBranding.TileLogo) ? "1" : "0";
                Host.logEvent("Identity.PasswordView.Branding.HasTileLogo", hasTileLogo);

                Host.logEvent("Identity.Flight.IsEnabledHideOfflineAccountWithNoSkipString", _hideOfflineAccountWithNoSkipString);

                if (_logSkipToOfflineAccountAction)
                {
                    
                    var errorcode = _serverData.arrValErrs.length > 0 ? _serverData.arrValErrs[0] : ""; 
                    Host.logEvent("Identity.OOBE.Login.ErrorSkipToLocalVisible", "[ErrorCode] " + errorcode);
                }
            }

            if (Host.showKeyboard)
            {
                Host.showKeyboard(true);
            }
        }

        _this.unsafe_displayName.subscribe(
            function ()
            {
                setTimeout(
                    function ()
                    {
                        
                        
                        _this.passwordTextbox.value(null);
                    }, 0);
            });

        
        
        if (_isInitialView)
        {
            if (Host && Host.isBackButtonSupportedOnInitialView)
            {
                Host.isBackButtonSupportedOnInitialView(_serverData,
                    function (isSupported, useCancelText)
                    {
                        _setBackButtonVisible(isSupported);

                        if (useCancelText)
                        {
                            _this.secondaryButtonText(_strings["CT_PWD_STR_Cancel_Button"]);
                        }
                    });
            }
            else if (_allowCancel)
            {
                _setBackButtonVisible(true);
            }
        }
        else
        {
            _setBackButtonVisible(true);
        }

        if (_urlHIPScript && _this.showHipOnPasswordView)
        {
            if (__IS_OLD_WEBPACK__)
            {
                _this.shouldHipInit(true);
                return;
            }

            require.ensure([],
                function ()
                {
                    require("js/Fields/HipFieldViewModel");
                    _this.shouldHipInit(true);
                },
                "Alt");
        }

        
        if (_userTenantBranding)
        {
            var layoutTemplateConfig = BrandingHelpers.getLayoutTemplateConfig(_userTenantBranding);

            if (_userTenantBranding.ForgotPasswordText)
            {
                _this.unsafe_forgotPasswordText = BrowserHelper.htmlUnescape(_userTenantBranding.ForgotPasswordText);
            }

            _this.accessRecoveryLink = _userTenantBranding.AccessRecoveryLink;
            _this.hideForgotMyPassword = layoutTemplateConfig.hideForgotMyPassword || layoutTemplateConfig.hideAccountResetCredentials;
            _this.hidePasswordReset = layoutTemplateConfig.hideResetItNow || layoutTemplateConfig.hideAccountResetCredentials;
        }

        if (_supportsNativeCredentialRecovery)
        {
            _grctRequestHelper = new GetRecoveryCredentialTypeRequestHelper(_serverData);
            _this.onRestoreIsRecoveryAttemptPost();
        }
    })();
}

ko.components.register("login-paginated-password-view",
    {
        viewModel: LoginPasswordViewModel,
        template: require("html/LoginPage/LoginPaginatedPasswordViewHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = LoginPasswordViewModel;