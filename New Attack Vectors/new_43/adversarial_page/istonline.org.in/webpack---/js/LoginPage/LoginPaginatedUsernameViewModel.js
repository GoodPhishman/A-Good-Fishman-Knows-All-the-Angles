

var ko = require("knockout");
var Constants = require("../Core/Constants");
var BrandingHelpers = require("../Core/BrandingHelpers");
var Browser = require("../Core/BrowserControl");
var Helpers = require("../Core/Helpers");
var GetCredentialTypeRequestHelper = require("../Core/GetCredentialTypeHelpers");
var Promise = require("../Core/Promise");
var PromiseHelpers = require("../Core/PromiseHelpers");
var ComponentEvent = require("../Core/ComponentEvent");
var AsyncValidation = require("../Core/AsyncValidationControl");
var ApiRequest = require("../Core/ApiRequest");
var PlaceholderTextbox = require("../Core/PlaceholderTextbox");
var LoginConstants = require("./LoginConstants");
var KnockoutExtenders = require("../Core/KnockoutExtenders");
var Otc = require("../Core/OtcRequestControl");
var GetOneTimeCodeHelper = require("../Core/GetOneTimeCodeHelper");
var Fido = require("../Core/Fido");
var ClientTracingHelper = require("../Core/ClientTracingHelper").getInstance(window.ServerData);
var ClientTracingConstants = require("../Core/ClientTracingConstants");
var Host = null;

if (__IS_WEBWIZARD_ENABLED__ || __REQUIRE_WIZARD_IN_CORE__)
{
    if (__REQUIRE_WIZARD_IN_CORE__)
    {
        Host = require("./WizardLoginHost");
    }
    else
    {
        require.ensure([],
            function ()
            {
                Host = require("./WizardLoginHost");
            },
            "Wizard");
    }
}
else if (__IS_CXH_ENABLED__)
{
    Host = require("./Win10LoginHost");
}
else if (__IS_INCLUSIVE_OOBE__)
{
    Host = require("./InclusiveWin10LoginHost.js");
}
else if (__IS_XBOX__)
{
    Host = require("../Core/XboxHost");
}

var w = window;
var PaginatedState = Constants.PaginatedState;
var CredentialType = Constants.CredentialType;
var ApiErrorCodes = Constants.ApiErrorCodes;
var BrowserHelper = Browser.Helper;
var Cookies = Browser.Cookies;
var QueryString = Browser.QueryString;
var StringHelpers = Helpers.String;
var AllowedIdentitiesType = LoginConstants.AllowedIdentitiesType;
var GctResultAction = GetCredentialTypeRequestHelper.GctResultAction;

KnockoutExtenders.applyExtenders(ko);


function LoginPaginatedUsernameView(params)
{
    var _this = this;

    
    var _serverData = params.serverData;
    var _serverError = params.serverError;
    var _isInitialView = params.isInitialView;
    var _displayName = params.displayName;
    var _prefillNames = params.prefillNames;
    var _flowTokenParam = params.flowToken;
    var _otherIdpRedirectUrl = params.otherIdpRedirectUrl;
    var _availableSignupCreds = params.availableSignupCreds || [];
    

    
    var _strings = _serverData.str;
    var _allowPhone = _serverData.fAllowPhoneSignIn || _serverData.fAllowPhoneInput;
    var _allowSkype = _serverData.fAllowSkypeNameLogin;
    var _checkWindowsFormat = _serverData.fCheckWindowsUsernameFormat;
    var _resetPasswordUrl = _serverData.urlResetPassword;
    var _getOneTimeCodeUrl = _serverData.urlGetOneTimeCode;
    var _skipZtdUrl = _serverData.urlSkipZtd;
    var _originalRequest = _serverData.sCtx;
    var _staticTenantBranding = _serverData.staticTenantBranding;
    var _allowedIdentities = _serverData.iAllowedIdentities;
    var _appName = _serverData.sRemoteConnectAppName;
    var _remoteClientIp = _serverData.sRemoteClientIp;
    var _remoteAppLocation = _serverData.sRemoteAppLocation;
    var _remoteLoginConfig = _serverData.remoteLoginConfig;
    var _userRoutingCookieConfig = _serverData.userRoutingCookieConfig;
    var _allowCancel = _serverData.fAllowCancel;
    var _isFidoSupportedHint = !!_serverData.fIsFidoSupported;
    var _checkApiCanary = _serverData.fCheckApiCanary;
    var _linkedInFedUrl = _serverData.urlLinkedInFed;
    var _gitHubFedUrl = _serverData.urlGitHubFed;
    var _googleFedUrl = _serverData.urlGoogleFed;
    var _facebookFedUrl = _serverData.urlFacebookFed;
    var _otherIdpSignUpUrl = _serverData.urlOtherIdpSignup;
    var _isTokenBroker = !!_serverData.fIsTokenBroker;
    var _isPreferAssociate = !!_serverData.fPreferAssociate;
    var _ztdTenantName = _serverData.sZtdTenantName;
    var _promotedFedCredType = _serverData.iPromotedFedCredType;
    var _showSignInWithGitHubOnlyOnCredPicker = !!_serverData.fShowSignInWithGitHubOnlyOnCredPicker;
    var _showFidoLinkInline = !!_serverData.fShowSignInWithFidoOnUsernameView;
    var _showOfflineAccountLearnMore = !!_serverData.fShowOfflineAccountLearnMore;
    var _unauthSessionId = _serverData.sUnauthSessionID;
    var _lcid = _serverData.iRequestLCID;
    var _hideOfflineAccountNewTitleString = !!_serverData.fHideOfflineAccountNewTitleString;
    var _getCredTypeResultFromServer = _serverData.oGetCredTypeResult;
    var _signupUrl = _serverData.urlSignUp;
    var _aadSignupUrl = _serverData.urlAadSignup;
    var _recoverUsernameUrl = _serverData.urlForgotUsername;
    var _siteId = _serverData.sSiteId;
    var _clientId = _serverData.sClientId;
    var _forwardedClientId = _serverData.sForwardedClientId;
    var _noPaBubbleVersion = _serverData.sNoPaBubbleVersion;
    var _showRemoteConnectLocationPage = _serverData.fShowRemoteConnectLocationPage;
    var _isOfflineAccountVisible = _serverData.fOfflineAccountVisible;
    var _isRestrictedWsi = _serverData.fIsRestrictedWsi;
    var _showSignInOptionsAsButton = _serverData.fShowSignInOptionsAsButton;
    var _showForgotUsernameLink = _serverData.fShowForgotUsernameLink;
    var _enableUserStateFix = _serverData.fEnableUserStateFix;
    var _msaServerLottieId = _serverData.iMsaServerLottieId;
    var _oidcDiscoveryEndpointFormatUrl = _serverData.urlOidcDiscoveryEndpointFormat;
    var _oobeDisplayServicesConsent = _serverData.fOobeDisplayServicesConsent;
    var _oobeDisplayUnifiedConsent = _serverData.fOobeDisplayUnifiedConsent;
    var _showCantAccessAccountLink = _serverData.showCantAccessAccountLink;
    var _oobeFlightAssignmentName = _serverData.sOobeFlightAssignmentName;
    

    
    var _useApiRequest = !!_getOneTimeCodeUrl;
    var _getOneTimeCodeState = {};
    var _unsafe_displayNameBrowserPrefill = null;
    var _useCredWithoutUsername = false;
    var _gctRequestHelper = null;
    var _gctResultSharedData = {};
    var _gctResultSharedDataForGctShowErrorResult = {};

    var _validationEnabled = ko.observable(false);
    var _flowToken = ko.observable(_flowTokenParam).extend({ flowTokenUpdate: _serverData });
    

    
    _this.onSwitchView = ComponentEvent.create();
    _this.onRedirect = ComponentEvent.create();
    _this.onSetPendingRequest = ComponentEvent.create();
    _this.onRegisterDialog = ComponentEvent.create();
    _this.onUnregisterDialog = ComponentEvent.create();
    _this.onShowDialog = ComponentEvent.create(ClientTracingHelper.getDefaultEventTracingOptions(LoginConstants.ClientTracingEventIds.ComponentEvent_LoginPaginatedUsernameView_onShowDialog, true));
    _this.onAgreementClick = ComponentEvent.create(ClientTracingHelper.getDefaultEventTracingOptions(LoginConstants.ClientTracingEventIds.ComponentEvent_LoginPaginatedUsernameView_onAgreementClick, true));
    _this.onUpdateAvailableCredsWithoutUsername = ComponentEvent.create();
    

    
    _this.usernameTextbox = new PlaceholderTextbox(AsyncValidation.errorComputed(_getError));
    _this.usernameTextbox.value.extend({ logValue: ClientTracingHelper.getPIITextBoxPropertyLogOption(_this, { eventId: LoginConstants.ClientTracingEventIds.PropertyValue_LoginPaginatedUsernameView_Username }) });
    _this.usernameTextbox.error.extend({ logValue: ClientTracingHelper.getPropertyLogOption(_this, { eventId: LoginConstants.ClientTracingEventIds.PropertyValue_LoginPaginatedUsernameView_ClientError }) });
    _this.passwordBrowserPrefill = ko.observable();
    _this.prefillNames = ko.observableArray();
    _this.isRequestPending = ko.observable(false);
    _this.isBackButtonVisible = ko.observable(false);
    _this.isSecondaryButtonVisible = ko.observable(false);
    _this.secondaryButtonText = ko.observable();
    _this.showTileLogo = ko.observable(false);
    _this.isPlatformAuthenticatorAvailable = ko.observable(false);
    _this.fidoLinkText = ko.observable();
    _this.hasFido = ko.observable(false);
    _this.availableCredsWithoutUsername = ko.observableArray([]);

    _this.tenantBranding = null;
    _this.isInitialView = _isInitialView;
    _this.pageDescription = null;
    _this.unsafe_pageTitle = null;
    _this.unsafe_subHeader = null;
    _this.showFidoLinkInline = _showFidoLinkInline;
    _this.hideCantAccessYourAccount = true;
    _this.unsafe_cantAccessYourAccountText = _strings["WF_STR_CantAccessAccount_Text"];
    _this.accessRecoveryLink = null;
    _this.showCredPicker = false;
    ClientTracingHelper.attachViewLoadClientTracingOptions(_this, { eventId: LoginConstants.ClientTracingEventIds.Event_LoginPaginatedUsernameView_onLoad });
    _this.isOfflineAccountVisible = _isOfflineAccountVisible;
    _this.allowRemoteLogin = false;
    

    
    _this.saveSharedData = function (sharedData)
    {
        if (_enableUserStateFix && sharedData.useCredWithoutUsername)
        {
            
            _useCredWithoutUsername = true;

            
            delete sharedData.useCredWithoutUsername;
        }

        var getOneTimeCodeResult = _getOneTimeCodeState.result;
        var unsafe_displayName = _useCredWithoutUsername ? "" : _this.usernameTextbox.value();

        sharedData.flowToken = _flowToken();
        
        
        sharedData.username = StringHelpers.cleanseUsername(unsafe_displayName);
        sharedData.displayName = unsafe_displayName;
        sharedData.passwordBrowserPrefill = _this.passwordBrowserPrefill();
        sharedData.remoteLoginUserCode = getOneTimeCodeResult ? getOneTimeCodeResult.userCode : null;
        sharedData.remoteLoginDeviceCode = getOneTimeCodeResult ? getOneTimeCodeResult.deviceCode : null;
        sharedData.proofConfirmation = "";
        sharedData.useEvictedCredentials = false;
        sharedData.showCredViewBrandingDesc = false;
        sharedData.isSignupPost = false;

        if (_useCredWithoutUsername)
        {
            sharedData.availableCreds = _this.availableCredsWithoutUsername();

            if (_enableUserStateFix && sharedData.fidoParams)
            {
                
                sharedData.fidoParams.allowList = null;
            }
        }

        ko.utils.extend(sharedData, _gctResultSharedData);
    };

    _this.getState = function ()
    {
        return { unsafe_displayName: _this.usernameTextbox.value(), gctRequestHelperState: _gctRequestHelper.getState() };
    };

    _this.restoreState = function (state)
    {
        if (state)
        {
            _gctRequestHelper.restoreState(state.gctRequestHelperState);
            _this.usernameTextbox.value(state.unsafe_displayName);
        }
    };

    _this.setDefaultFocus = function ()
    {
        _this.usernameTextbox.focused(true);
    };
    

    
    _this.primaryButton_onClick = function ()
    {
        _validationEnabled(true);

        if (_this.usernameTextbox.error.isBlocking())
        {
            _this.setDefaultFocus();
            return;
        }

        var unsafe_displayName = _this.usernameTextbox.value();

        _setUserRoutingCookie(unsafe_displayName);
        _setIsRequestPending(true);

        PromiseHelpers.throwUnhandledExceptionOnRejection(
            _gctRequestHelper.sendAsync(_otherIdpRedirectUrl, unsafe_displayName, _flowToken()).then(
                function (gctResult)
                {
                    _setIsRequestPending(false);

                    if (gctResult.flowToken)
                    {
                        _flowToken(gctResult.flowToken);
                    }

                    switch (gctResult.action)
                    {
                        case GctResultAction.ShowError:
                            _this.usernameTextbox.error.setError(gctResult.error, gctResult.isBlockingError);
                            _gctResultSharedDataForGctShowErrorResult = ko.utils.extend(gctResult.sharedData, gctResult.viewParams || {});
                            _this.setDefaultFocus();
                            break;

                        case GctResultAction.SwitchView:
                            _gctResultSharedData = ko.utils.extend(gctResult.sharedData, gctResult.viewParams || {});

                            
                            if (gctResult.viewId === PaginatedState.RemoteLoginPolling)
                            {
                                _this.remoteLogin_onClick();
                            }
                            else
                            {
                                _this.onSwitchView(gctResult.viewId);
                            }
                            break;

                        case GctResultAction.Redirect:
                            _redirect(gctResult);
                            break;
                    }
                }));
    };

    _this.secondaryButton_onClick = function ()
    {
        if (_showOfflineAccountLearnMore)
        {
            
            if (Host && Host.logEvent)
            {
                Host.logEvent("Identity.OOBE.Login.LearnMoreOfflineAccount.Clicked");
            }

            _this.onSwitchView(PaginatedState.LearnMoreOfflineAccount);
        }
        else
        {
            _this.onSwitchView(PaginatedState.Previous);
        }
    };

    _this.signup_onClick = function ()
    {
        if (_signupUrl)
        {
            _redirect(_gctRequestHelper.getSignupRedirectGctResult(_this.usernameTextbox.value()));
        }
        else
        {
            _this.onSwitchView(_availableSignupCreds.length > 0
                ? PaginatedState.SignupCredentialPicker
                : PaginatedState.SignupUsername);
        }
    };

    _this.aadSignup_onClick = function ()
    {
        _this.onRedirect(
            {
                url: QueryString.appendOrReplace(_aadSignupUrl, "email", encodeURIComponent(_this.usernameTextbox.value())),
                eventOptions:
                    {
                        eventId: ClientTracingConstants.EventIds.Redirect_AADSignUpPage
                    }
            });
    };

    _this.otherIdpLogin_onClick = function ()
    {
        _redirect(_gctRequestHelper.getOtherIdpRedirectGctResult(_otherIdpRedirectUrl, _this.usernameTextbox.value()));
    };

    _this.sendOtcLink_onClick = function ()
    {
        PromiseHelpers.throwUnhandledExceptionOnRejection(
            _getOneTimeCodeAsync(Otc.Channel.EmailAddress).then(
                function (result)
                {
                    if (result.success)
                    {
                        _gctResultSharedData = _gctResultSharedDataForGctShowErrorResult;
                        _this.onSwitchView(PaginatedState.OneTimeCode);
                    }
                }));
    };

    _this.recoverUsername_onClick = function ()
    {
        var recoverUsernameUrl = QueryString.appendOrReplace(_recoverUsernameUrl, "mn", encodeURIComponent(_this.usernameTextbox.value()));
        _this.onRedirect(
            {
                url: recoverUsernameUrl,
                eventOptions:
                    {
                        eventId: ClientTracingConstants.EventIds.Redirect_MSAUserRecoveryPage
                    }
            });
    };

    _this.skip_onClick = function ()
    {
        if (Host && Host.handleOnSkip)
        {
            Host.handleOnSkip(_serverData);
            _setIsRequestPending(true);
        }
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

    _this.tou_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.TermsOfUse);
    };

    _this.services_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.SeeHowDataIsManaged);
    };

    _this.footer_agreementClick = function (agreementType)
    {
        _this.onAgreementClick(agreementType);
    };

    _this.remoteLogin_onClick = function ()
    {
        PromiseHelpers.throwUnhandledExceptionOnRejection(
            _getOneTimeCodeAsync(null, Otc.Purpose.XboxRemoteConnect).then(
                function (result)
                {
                    if (result.success)
                    {
                        _getOneTimeCodeState.result = result;
                        _this.onSwitchView(PaginatedState.RemoteLoginPolling);
                    }
                }));
    };

    _this.learnMore_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.LearnMore);
    };

    _this.cantAccessAccount_onClick = function ()
    {
        if (_allowedIdentities === AllowedIdentitiesType.Both)
        {
            _this.onSwitchView(PaginatedState.ResetPasswordSplitter);
        }
        else
        {
            _this.onRedirect(
                {
                    url: _resetPasswordUrl,
                    eventOptions:
                        {
                            eventId: ClientTracingConstants.EventIds.Redirect_ResetPasswordPage
                        }
                });
        }
    };

    _this.switchToFidoCredLink_onClick = function ()
    {
        if (_enableUserStateFix)
        {
            _this.noUsernameCredSwitchLink_onSwitchView(PaginatedState.Fido);
        }
        else
        {
            _this.onSwitchView(PaginatedState.Fido);
        }
    };

    _this.noUsernameCredSwitchLink_onSwitchView = function (viewId)
    {
        _useCredWithoutUsername = true;

        switch (viewId)
        {
            case PaginatedState.RemoteLoginPolling:
                _this.remoteLogin_onClick();
                break;

            default:
                _this.onSwitchView(viewId);
                break;
        }
    };

    _this.tileLogo_onLoad = function ()
    {
        _this.showTileLogo(true);

        if (Host && Host.logEvent)
        {
            Host.logEvent("Identity.UsernameView.Branding.TileLogoLoaded");
        }
    };
    

    
    function _getOneTimeCodeAsync(channel, purpose)
    {
        var getOtcPromise = _useApiRequest
            ? _getOneTimeCodeApiRequestAsync(channel)
            : _getOneTimeCodeOtcHelperAsync(purpose);

        return getOtcPromise.then(_handleGetOneTimeCodeSuccess, _handleGetOneTimeCodeError);
    }

    function _getOneTimeCodeApiRequestAsync(channel)
    {
        return new Promise(
            function (resolve, reject)
            {
                _setIsRequestPending(true);

                var postData =
                    {
                        OriginalRequest: _originalRequest,
                        FlowToken: _flowToken()
                    };

                if (channel)
                {
                    postData.Channel = channel;
                }

                var apiRequest = new ApiRequest({ checkApiCanary: _checkApiCanary });
                apiRequest.Json(
                    {
                        url: _getOneTimeCodeUrl,
                        eventId: ClientTracingConstants.EventIds.Api_GetOneTimeCode
                    },
                    postData,
                    resolve,
                    reject,
                    Constants.DefaultRequestTimeout);
            });
    }

    function _getOneTimeCodeOtcHelperAsync(purpose)
    {
        return new Promise(
            function (resolve, reject)
            {
                _setIsRequestPending(true);

                var otcParams =
                    {
                        purpose: purpose,
                        flowToken: _flowToken(),
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
        _setIsRequestPending(false);

        if (!_useApiRequest && result.getResponseJson)
        {
            result = result.getResponseJson();
        }

        var getOtcResult =
            {
                success: true,
                userCode: result.UserCode,
                deviceCode: result.DeviceCode || result.SessionLookupKey
            };

        return getOtcResult;
    }

    function _handleGetOneTimeCodeError(response)
    {
        _setIsRequestPending(false);

        if (_useApiRequest && response && response.error)
        {
            switch (response.error.code)
            {
                case ApiErrorCodes.AuthFailure:
                    _this.usernameTextbox.error.setNonBlockingError(_strings["CT_PWD_STR_Error_FlowTokenExpired"]);
                    break;

                default:
                    _this.usernameTextbox.error.setNonBlockingError(_strings["CT_PWD_STR_Error_GetOneTimeCodeError"]);
                    break;
            }
        }
        else
        {
            _this.usernameTextbox.error.setNonBlockingError(_strings["CT_PWD_STR_Error_GetOneTimeCodeError"]);
        }

        _this.setDefaultFocus();

        return { success: false };
    }

    function _setPrefillData()
    {
        var subscription;

        if (_displayName)
        {
            _this.usernameTextbox.value(BrowserHelper.htmlUnescape(_displayName));
            return;
        }

        if (!_prefillNames || _prefillNames.length === 0)
        {
            return;
        }

        _this.usernameTextbox.value(_prefillNames[0]);

        if (_prefillNames.length > 1)
        {
            ko.utils.arrayForEach(
                _prefillNames,
                function (prefillName)
                {
                    _this.prefillNames.push({ text: prefillName, value: prefillName });
                });

            _this.prefillNames.push({ text: _strings["CT_WPIL_STR_Android_UseDifferentAddress"], value: null });

            subscription = _this.usernameTextbox.value.subscribe(
                function (unsafe_displayName)
                {
                    if (unsafe_displayName === null)
                    {
                        _this.prefillNames.removeAll();
                        subscription.dispose();

                        _validationEnabled(false);
                        _this.usernameTextbox.value("");
                        _this.usernameTextbox.focused(true);
                    }
                });
        }
    }

    function _handlePasswordPrefill()
    {
        _this.usernameTextbox.value.subscribe(
            function (unsafe_displayName)
            {
                if (unsafe_displayName)
                {
                    if (_unsafe_displayNameBrowserPrefill)
                    {
                        if (unsafe_displayName.toLowerCase() !== _unsafe_displayNameBrowserPrefill.toLowerCase())
                        {
                            
                            
                            _this.passwordBrowserPrefill(null);
                        }
                    }
                    else
                    {
                        
                        
                        
                        
                        _unsafe_displayNameBrowserPrefill = unsafe_displayName;
                    }
                }
            });
    }

    function _getError()
    {
        if (!_validationEnabled())
        {
            
            
            var error = _serverError || null;
            _serverError = null;
            return error;
        }

        return _getClientError();
    }

    function _getClientError()
    {
        var unsafe_username = _this.usernameTextbox.value();

        if (_checkWindowsFormat && unsafe_username && unsafe_username.indexOf("\\") > 0)
        {
            return _strings["CT_PWD_STR_Error_InvalidUsername_WindowsFormat"];
        }
        else if (!unsafe_username || (!StringHelpers.isEmailAddress(unsafe_username) && (!_allowPhone || !StringHelpers.isPhoneNumber(unsafe_username)) && (!_allowSkype || !StringHelpers.isSkypeName(unsafe_username))))
        {
            return _strings["CT_PWD_STR_Error_InvalidUsername"];
        }
        else if (!StringHelpers.isEmailAddress(unsafe_username) && (!_allowSkype || !StringHelpers.isSkypeName(unsafe_username)) && StringHelpers.isPhoneNumber(unsafe_username) && !unsafe_username.match(Constants.Regex.PhoneNumberValidation))
        {
            
            return _strings["CT_PWD_STR_Error_InvalidPhoneFormatting"];
        }

        return null;
    }

    function _setUserRoutingCookie(unsafe_username)
    {
        if (_userRoutingCookieConfig && Cookies.isCookieSafeValue(unsafe_username))
        {
            
            
            
            Cookies.writeWithExpiration(
                _userRoutingCookieConfig.name,
                unsafe_username,
                _userRoutingCookieConfig.secure,
                Cookies.getPersistDate(),
                _userRoutingCookieConfig.domain,
                _userRoutingCookieConfig.path);
        }
    }

    function _setIsRequestPending(pending)
    {
        _this.isRequestPending(pending);
        _this.onSetPendingRequest(pending);
    }

    function _redirect(gctResult)
    {
        _this.onRedirect(
            {
                url: gctResult.redirectUrl,
                eventOptions:
                    {
                        eventId: gctResult.eventId
                    }
            },
            gctResult.redirectPostParams,
            gctResult.isIdpRedirect);
    }

    function _setFidoLinkText()
    {
        _this.fidoLinkText(_strings["CT_PWD_STR_SwitchToFidoCrossPlatform_Link"]);

        PromiseHelpers.throwUnhandledExceptionOnRejection(
            Fido.isPlatformAuthenticatorAvailable()
                .then(null, function () { return false; })
                .then(
                    function (isPlatformAuthenticatorAvailable)
                    {
                        if (isPlatformAuthenticatorAvailable)
                        {
                            _this.fidoLinkText(_strings["CT_PWD_STR_SwitchToFido_Link"]);

                            _this.isPlatformAuthenticatorAvailable(true);
                        }
                    }));
    }

    function _initializeWithFidoSupportedResult(isFidoSupported)
    {
        _this.hasFido(isFidoSupported);

        _this.availableCredsWithoutUsername([].concat(
            !_appName && _this.allowRemoteLogin
                ? { credType: CredentialType.RemoteLogin } : [],
            isFidoSupported
                ? { credType: CredentialType.Fido } : [],
            _otherIdpRedirectUrl && _otherIdpSignUpUrl
                ? { credType: CredentialType.OtherMicrosoftIdpFederation, redirectUrl: _otherIdpRedirectUrl } : [],
            _linkedInFedUrl && !_otherIdpSignUpUrl && _promotedFedCredType !== CredentialType.LinkedIn
                ? { credType: CredentialType.LinkedIn, redirectUrl: _linkedInFedUrl } : [],
            _gitHubFedUrl && !_otherIdpSignUpUrl && _promotedFedCredType !== CredentialType.GitHub
                ? { credType: CredentialType.GitHub, redirectUrl: _gitHubFedUrl, shownOnlyOnPicker: _showSignInWithGitHubOnlyOnCredPicker } : [],
            _googleFedUrl
                ? { credType: CredentialType.Google, redirectUrl: _googleFedUrl } : [],
            _facebookFedUrl
                ? { credType: CredentialType.Facebook, redirectUrl: _facebookFedUrl } : [],
            _isOfflineAccountVisible
                ? { credType: CredentialType.OfflineAccount } : []));

        _this.onUpdateAvailableCredsWithoutUsername(_this.availableCredsWithoutUsername());

        if (isFidoSupported)
        {
            _setFidoLinkText();
        }
    }

    (function _initialize()
    {
        _this.allowRemoteLogin = _remoteLoginConfig && _remoteLoginConfig.allowRemoteLogin;

        _gctRequestHelper = new GetCredentialTypeRequestHelper(_serverData);

        if (_getCredTypeResultFromServer && _getCredTypeResultFromServer.Username)
        {
            _gctRequestHelper.cacheResponse(_getCredTypeResultFromServer.Username, _getCredTypeResultFromServer);
        }

        PromiseHelpers.throwUnhandledExceptionOnRejection(
            BrowserHelper.isFidoSupportedAsync(_isFidoSupportedHint)
                .then(_initializeWithFidoSupportedResult, function () { _initializeWithFidoSupportedResult(false); }));

        _this.showCredPicker = (_this.availableCredsWithoutUsername() > 0 || _oidcDiscoveryEndpointFormatUrl || _showForgotUsernameLink || _isOfflineAccountVisible) && !_showSignInOptionsAsButton && !_isRestrictedWsi;

        var tenantBranding = BrandingHelpers.loadTenantBranding(_staticTenantBranding);

        if (tenantBranding && tenantBranding.UserIdLabel)
        {
            tenantBranding.unsafe_userIdLabel = BrowserHelper.htmlUnescape(tenantBranding.UserIdLabel);
        }

        _this.tenantBranding = tenantBranding;

        
        if (_ztdTenantName)
        {
            var unsafe_tenantName = BrowserHelper.htmlUnescape(_ztdTenantName);

            _this.unsafe_pageTitle = StringHelpers.format(_strings["CT_Win10_STR_Username_Title_WithOrgDomain"], unsafe_tenantName);
            _this.unsafe_subHeader = StringHelpers.format(_strings["CT_Win10_STR_Username_SubHeader_WithOrgDomain"], unsafe_tenantName);
        }
        else
        {
            _this.unsafe_pageTitle = _strings["WF_STR_HeaderDefault_Title_With_Brand"];
            _this.unsafe_subHeader = _strings["CT_Win10_STR_SignInPage_UsernameLabel"];
        }

        if (_strings["WF_STR_Default_Desc"] && !_showRemoteConnectLocationPage)
        {
            _this.pageDescription = StringHelpers.format(_strings["WF_STR_Default_Desc"], _appName, _remoteClientIp || _remoteAppLocation);
        }

        _setPrefillData();
        _handlePasswordPrefill();

        if (Host)
        {
            if (Host.isBackButtonVisible && Host.handleBackButton)
            {
                Host.isBackButtonVisible(_serverData, function (isBackButtonVisible)
                {
                    if (isBackButtonVisible)
                    {
                        Host.handleBackButton(Host.handleOnFinalBack.bind(Host));
                    }
                    else
                    {
                        Host.handleBackButton(null);
                    }
                });
            }

            if (Host.showKeyboard)
            {
                Host.showKeyboard(true);
            }

            if (Host.logEvent)
            {
                var hasBoilerPlateText = (tenantBranding && tenantBranding.BoilerPlateText) ? "1" : "0";
                Host.logEvent("Identity.UsernameView.Branding.HasBoilerPlateText", hasBoilerPlateText);

                var hasTileLogo = (tenantBranding && tenantBranding.TileLogo) ? "1" : "0";
                Host.logEvent("Identity.UsernameView.Branding.HasTileLogo", hasTileLogo);

                Host.logEvent("Identity.Flight.IsEnabledHideOfflineAccountNewTitleString", _hideOfflineAccountNewTitleString);

                if (_isTokenBroker)
                {
                    var hostEventName = _isPreferAssociate ? "MSA.AssociateUpsell.UsernamePageLoad" : "MSA.ConnectUpsell.UsernamePageLoad";
                    Host.logEvent(hostEventName);
                }

                if (!_isOfflineAccountVisible)
                {
                    Host.logEvent("Identity.OOBE.Login.OfflineAccountLink.Hidden");
                }
            }

            if (Host.showGraphicAnimation && Host.logEvent)
            {
                
                if (!isNaN(_msaServerLottieId))
                {
                    Host.logEvent("Identity.OOBE.Login.MsaServerDrivenLottieId", _msaServerLottieId);

                    try
                    {
                        var hashedLottieFile = require("images/msaServerSignInLottie_"+_msaServerLottieId+".json");
                        if (hashedLottieFile)
                        {
                            var fullUrl;
                            if (window.location.hostname.toLowerCase() === "login.live-tst.com")
                            {
                                fullUrl = "https://" + window.location.host + hashedLottieFile;
                            }
                            else
                            {
                                
                                fullUrl = hashedLottieFile;
                            }
                            Host.showGraphicAnimation(fullUrl);
                        }
                    }
                    catch (error)
                    {
                        Host.logEvent("Identity.OOBE.Login.showGraphicAnimation", error.message);
                    }
                }
            }
        }

        
        
        if (_isInitialView)
        {
            if (Host && Host.isBackButtonSupportedOnInitialView)
            {
                Host.isBackButtonSupportedOnInitialView(_serverData,
                    function (isSupported, useCancelText)
                    {
                        _this.isBackButtonVisible(isSupported);

                        if (useCancelText)
                        {
                            _this.secondaryButtonText(_strings["CT_PWD_STR_Cancel_Button"]);
                            _this.isSecondaryButtonVisible(true);
                        }
                        else if (_showOfflineAccountLearnMore)
                        {
                            if (Host.logEvent)
                            {
                                Host.logEvent("Identity.OOBE.Login.LearnMoreOfflineAccount.Visible");
                            }

                            _this.secondaryButtonText(_strings["CT_Win10_STR_OfflineAccountLearnMore"]);
                            _this.isSecondaryButtonVisible(true);
                        }
                    });
            }
            else if (_allowCancel)
            {
                _this.isBackButtonVisible(true);
                _this.isSecondaryButtonVisible(true);
            }

            if ((_oobeDisplayServicesConsent || _oobeDisplayUnifiedConsent) && Host && Host.handleOobeMsaConsentDisplayed)
            {
                Host.handleOobeMsaConsentDisplayed();
            }

            if (_oobeFlightAssignmentName && Host && Host.logEvent)
            {
                Host.logEvent("OobeExperimentTriggerEvent", _oobeFlightAssignmentName);
            }
        }
        else
        {
            _this.isBackButtonVisible(true);
            _this.isSecondaryButtonVisible(true);
        }

        var layoutConfig = BrandingHelpers.getLayoutTemplateConfig(tenantBranding);
        _this.hideCantAccessYourAccount = !_showCantAccessAccountLink || layoutConfig.hideAccountResetCredentials || layoutConfig.hideCantAccessYourAccount;

        if (tenantBranding.CantAccessYourAccountText)
        {
            _this.unsafe_cantAccessYourAccountText = BrowserHelper.htmlUnescape(tenantBranding.CantAccessYourAccountText);
        }

        _this.accessRecoveryLink = tenantBranding.AccessRecoveryLink;

        if (_isRestrictedWsi)
        {
            _this.hideCantAccessYourAccount = true;
            _this.showFidoLinkInline = false;
        }
    })();
    
}

ko.components.register("login-paginated-username-view",
    {
        viewModel: LoginPaginatedUsernameView,
        template: require("html/LoginPage/LoginPaginatedUsernameViewHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = LoginPaginatedUsernameView;