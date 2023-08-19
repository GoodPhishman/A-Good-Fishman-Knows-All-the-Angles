

var Constants = require("./Constants");
var LoginConstants = require("../LoginPage/LoginConstants");
var Promise = require("./Promise");
var BrandingHelpers = require("./BrandingHelpers");
var Browser = require("./BrowserControl");
var Helpers = require("./Helpers");
var ApiRequest = require("./ApiRequest");
var ClientTracingConstants = require("./ClientTracingConstants");

var BrowserHelper = Browser.Helper;
var QueryString = Browser.QueryString;
var StringHelpers = Helpers.String;
var ObjectHelpers = Helpers.Object;
var CredentialType = Constants.CredentialType;
var RemoteNgcType = Constants.RemoteNgcType;
var Error = Constants.Error;
var ApiErrorCodes = Constants.ApiErrorCodes;
var EstsError = Constants.EstsError;
var PaginatedState = Constants.PaginatedState;
var IfExistsResult = Constants.IfExistsResult;
var ThrottleStatus = Constants.ThrottleStatus;
var DomainType = Constants.DomainType;
var BindProvider = Constants.BindProvider;
var AllowedIdentitiesType = LoginConstants.AllowedIdentitiesType;
var SessionPullFlags = Constants.SessionPullFlags;
var Host = null;

if (__IS_CXH_ENABLED__)
{
    Host = require("../LoginPage/Win10LoginHost");
}
else if (__IS_INCLUSIVE_OOBE__)
{
    Host = require("../LoginPage/InclusiveWin10LoginHost.js");
}


var GctResultAction = GetCredentialTypeRequestHelper.GctResultAction =
{
    ShowError: 1,
    SwitchView: 2,
    Redirect: 3
};


var GctRequestHelperFlags = GetCredentialTypeRequestHelper.GctRequestHelperFlags =
{
    CheckCurrentIdpOnly: 1 << 0,
    IsPhoneNumberFullyQualified: 1 << 1,
    DisableDesktopSsoPreferredCred: 1 << 2,
    DisableAutoSend: 1 << 3,
    ForceOtcLogin: 1 << 4,
    IsPostRequest: 1 << 5,
    IsSignup: 1 << 6
};




function GetCredentialTypeRequestHelper(serverData, flags)
{
    
    var _this = this;

    var _isOtherIdpSupported = false;
    var _useAltUsernameExistenceErrorPromise = null;
    var _isFidoSupportedPromise = null;
    var _getPoPAuthenticatorPromise = null;
    var _wamMessageHandlerInstance = null;
    var _cache = {};
    var _isTapRestrictedWsi = null;

    var _serverData = serverData;
    var _checkCurrentIdpOnly = (flags & GctRequestHelperFlags.CheckCurrentIdpOnly) !== 0;
    var _isPhoneNumberFullyQualified = (flags & GctRequestHelperFlags.IsPhoneNumberFullyQualified) !== 0;
    var _disableDesktopSsoPreferredCred = (flags & GctRequestHelperFlags.DisableDesktopSsoPreferredCred) !== 0;
    var _disableAutoSend = (flags & GctRequestHelperFlags.DisableAutoSend) !== 0;
    var _forceOtcLogin = (flags & GctRequestHelperFlags.ForceOtcLogin) !== 0;
    var _isPostRequest = (flags & GctRequestHelperFlags.IsPostRequest) !== 0;
    var _isSignup = (flags & GctRequestHelperFlags.IsSignup) !== 0;
    

    
    var _strings = _serverData.str;
    var _unauthSessionID = _serverData.sUnauthSessionID;
    var _allowedIdentities = _serverData.iAllowedIdentities;
    var _isFederationDisabled = _serverData.fIsFedDisabled;
    var _isRemoteNGCSupported = !!_serverData.fIsRemoteNGCSupported;
    var _showCookieBanner = !!_serverData.fShowCookieBanner;
    var _isFidoSupportedHint = !!_serverData.fIsFidoSupported;
    var _isOtcLoginDisabled = _serverData.fIsOtcLoginDisabled;
    var _isNoPaOtcDisabled = _serverData.fIsNoPaOtcDisabled;
    var _isExternalFederationDisallowed = !!_serverData.fIsExternalFederationDisallowed;
    var _isPassthroughDisallowed = !!_serverData.fIsPassthroughDisallowed;
    var _isPhoneNumberSignupDisallowed = !!_serverData.fIsPhoneNumberSignupDisallowed;
    var _originalRequest = _serverData.sCtx;
    var _redirectToSignupOnNotExists = _serverData.fDoIfExists; 
    var _checkProofForAliases = _serverData.fCheckProofForAliases; 
    var _checkApiCanary = _serverData.fCheckApiCanary;
    var _getCredentialTypeUrl = _serverData.urlGetCredentialType;
    var _isSignupAllowed = _serverData.fCBShowSignUp;
    var _allowSkype = _serverData.fAllowSkypeNameLogin;
    var _msaSignupUrl = serverData.urlMsaSignUp;
    var _signupUrl = _serverData.urlSignUp;
    var _signupUrlPostParams = _serverData.oSignUpPostParams;
    var _useConsumerEmailError = _serverData.fUseConsumerEmailError;
    var _otherIdpRedirectPostParams = _serverData.oUrlOtherIdpPostParams;
    var _desktopSsoConfig = _serverData.desktopSsoConfig;
    var _federationRedirectQueryString = _serverData.sFedQS;
    var _staticTenantBranding = _serverData.staticTenantBranding;
    var _dynamicTenantBranding = _serverData.dynamicTenantBranding;
    var _isGlobalTenant = _serverData.isGlobalTenant;
    var _checkForWindowsSku = _serverData.fCheckForWindowsSku;
    var _country = _serverData.country;
    var _userProofData = _serverData.arrProofData || {};
    var _postProofType = parseInt(_serverData.sProofType);
    var _changePasswordUrl = _serverData.urlChangePassword;
    var _remoteConnectEnabled = !!_serverData.fAllowRemoteConnect;
    var _bindCookiesUsingPoP = _serverData.fBindCookiesUsingPoP;
    var _gctFederationFlags = _serverData.iGctFederationFlags || 0;
    var _ignoreViralUsers = _serverData.fIgnoreViralUsers;
    var _isAccessPassSupported = _serverData.fAccessPassSupported;
    var _hidePhoneCobasiInOtherSignIn = _serverData.fHidePhoneCobasiInOtherSignIn;
    var _isRestrictedWsi = _serverData.fIsRestrictedWsi;
    var _useResetPasswordUrlInPasswordRequiredError = _serverData.fUseResetPwdUrlForPwdRequiredErr;
    var _resetPasswordUrl = _serverData.urlResetPassword;
    var _isSelfServiceSignupUxEnabled = _serverData.fIsSelfServiceSignupUxEnabled;
    var _enableWebNativeBridge = _serverData.fEnableWebNativeBridge;
    var _updateLoginHint = _serverData.fUpdateLoginHint;
    

    
    _this.sendAsync = function (otherIdpRedirectUrl, unsafe_username, flowToken)
    {
        var unsafe_cleansedUsername = _getCleansedUsername(unsafe_username);
        var cachedResponse = _cache[unsafe_cleansedUsername] ? _cache[unsafe_cleansedUsername] : null;
        var isCachedResponse = !!cachedResponse;

        var gctPromise = cachedResponse
            ? Promise.resolve(cachedResponse)
            : _callGetCredentialTypeAsync(unsafe_cleansedUsername, flowToken);

        return Promise.all([_useAltUsernameExistenceErrorPromise, gctPromise, _isFidoSupportedPromise]).then(
            function (results)
            {
                var useAltUsernameExistenceError = results[0];
                var response = results[1];
                var isFidoSupported = results[2];

                return _parseGetCredentialTypeResponse(otherIdpRedirectUrl, unsafe_cleansedUsername, useAltUsernameExistenceError, response, isFidoSupported, isCachedResponse);
            },
            _handleGetCredentialTypeError);
    };

    _this.getResult = function (otherIdpRedirectUrl, unsafe_username, response, isFidoSupported)
    {
        
        
        
        
        
        
        
        

        return _parseGetCredentialTypeResponse(
            otherIdpRedirectUrl,
            _getCleansedUsername(unsafe_username),
            false ,
            response,
            isFidoSupported,
            false );
    };

    _this.getState = function ()
    {
        return { cache: _cache };
    };

    _this.restoreState = function (state)
    {
        if (state)
        {
            _cache = state.cache || {};
        }
    };

    _this.cacheResponse = function (unsafe_username, response)
    {
        _cache[_getCleansedUsername(unsafe_username)] = response;
    };

    _this.getSignupRedirectGctResult = function (unsafe_username)
    {
        var unsafe_cleansedUsername = _getCleansedUsername(unsafe_username);
        var cachedResponse = _cache[unsafe_cleansedUsername] ? _cache[unsafe_cleansedUsername] : null;
        return _getSignupRedirectGctResultForResponse(unsafe_cleansedUsername, cachedResponse);
    };

    _this.getOtherIdpRedirectGctResult = function (otherIdpRedirectUrl, unsafe_username)
    {
        return _getOtherIdpRedirectGctResult(otherIdpRedirectUrl, _getCleansedUsername(unsafe_username));
    };

    _this.getGctSharedData = function (response, isFidoSupported, isCachedResponse)
    {
        var sharedData = {};
        var preferredCredential = _getPreferredCredential(response, isFidoSupported);
        var availableCredentials = response.Credentials || {};
        var ngcParams = availableCredentials.RemoteNgcParams;
        var fidoParams = availableCredentials.FidoParams;
        var estsProperties = response.EstsProperties || {};
        var remoteNgcDefaultType = ngcParams ? ngcParams.DefaultType : null;
        var remoteNgcShowAnimatedGifWhilePolling = ngcParams ? ngcParams.ShowAnimatedGifWhilePolling : false;
        var remoteNgcStyleCredSwitchLinkAsButton = ngcParams ? ngcParams.StyleCredSwitchLinkAsButton : false;
        var dynamicTenantBranding = BrandingHelpers.loadTenantBranding(estsProperties.UserTenantBranding || _dynamicTenantBranding);
        var staticTenantBranding = BrandingHelpers.loadTenantBranding(_staticTenantBranding);
        var fedRedirectParams = _getFedRedirectParams(response.Username, response, isFidoSupported);

        sharedData.preferredCredential = preferredCredential;
        sharedData.location = response.Location;
        sharedData.fedRedirectParams = fedRedirectParams;
        sharedData.isTapRestrictedWsi = _isTapRestrictedWsi;
        sharedData.supportsNativeCredentialRecovery = response.SupportsNativeCredentialRecovery;
        sharedData.isSignup = response.IfExistsResult === IfExistsResult.NotExist && _isSelfServiceSignupUxEnabled;

        if (response.Display)
        {
            sharedData.displayName = response.Display;
        }

        sharedData.availableCreds = _getAvailableCreds(response, isFidoSupported);
        sharedData.evictedCreds = _getEvictedCreds(response, isFidoSupported);

        if (preferredCredential === CredentialType.OneTimeCode)
        {
            sharedData.otcCredential = Helpers.Array.first(
                sharedData.availableCreds,
                function (credential)
                {
                    return credential.credType === CredentialType.OneTimeCode && credential.proof.otcSent;
                });

            
            sharedData.useEvictedCredentials = false;
        }

        sharedData.remoteNgcParams =
            {
                requestSent: !_disableAutoSend && !isCachedResponse && preferredCredential === CredentialType.RemoteNGC && ngcParams && ngcParams.hasOwnProperty("Entropy"),
                sessionIdentifier: ngcParams ? ngcParams.SessionIdentifier : null,
                entropy: ngcParams ? ngcParams.Entropy : null,
                defaultType: remoteNgcDefaultType,
                showAnimatedGifWhilePolling: remoteNgcShowAnimatedGifWhilePolling,
                styleCredSwitchLinkAsButton: remoteNgcStyleCredSwitchLinkAsButton
            };

        sharedData.otcParams =
            {
                
                requestSent: ((preferredCredential === CredentialType.OneTimeCode) || (preferredCredential === CredentialType.PublicIdentifierCode))
                    && (response.IfExistsResult !== IfExistsResult.ExistsBothIDPs)
            };

        if (fidoParams && fidoParams.AllowList)
        {
            sharedData.fidoParams =
            {
                allowList: fidoParams.AllowList
            };
        }

        sharedData.callMetadata = estsProperties && estsProperties.CallMetadata ? estsProperties.CallMetadata : {};
        sharedData.userTenantBranding = BrandingHelpers.getMergedBranding(staticTenantBranding, dynamicTenantBranding, _isGlobalTenant);

        return sharedData;
    };
    

    
    function _buildGetCredentialTypeRequest(unsafe_username, flowToken, isFidoSupported, popAuthenticator)
    {
        var postData =
            {
                unsafe_username: unsafe_username,
                uaid: _unauthSessionID,
                isOtherIdpSupported: _isOtherIdpSupported,
                isFederationDisabled: _isFederationDisabled,
                checkPhones: StringHelpers.isPhoneNumber(unsafe_username),
                isRemoteNGCSupported: _isRemoteNGCSupported,
                isCookieBannerShown: _showCookieBanner,
                isFidoSupported: isFidoSupported,
                originalRequest: _originalRequest,
                country: _country,
                forceotclogin: _forceOtcLogin,
                otclogindisallowed: _isOtcLoginDisabled,
                isExternalFederationDisallowed: _isExternalFederationDisallowed,
                isRemoteConnectSupported: _remoteConnectEnabled,
                federationFlags: _gctFederationFlags,
                isSignup: _isSignup,
                flowToken: flowToken
            };

        if (_checkProofForAliases)
        {
            postData.checkProofForAliases = true;
        }

        if (_isNoPaOtcDisabled)
        {
            postData.noPaOtcDisallowed = true;
        }

        if (_isPassthroughDisallowed)
        {
            postData.isPassthroughDisallowed = true;
        }

        if (_isPhoneNumberSignupDisallowed)
        {
            postData.isPhoneNumberSignupDisallowed = true;
        }

        if (_ignoreViralUsers)
        {
            postData.ignoreViralUsers = true;
        }

        if (_bindCookiesUsingPoP)
        {
            popAuthenticator = popAuthenticator || { cpa: "", err: "Authenticator not generated." };
            postData.cpa = popAuthenticator.cpa;
            postData.cpa_err = popAuthenticator.err;
        }

        if (_isAccessPassSupported)
        {
            postData.isAccessPassSupported = true;
        }

        return postData;
    }

    function _buildOtcCredentials(response, isDefault, isFidoSupported)
    {
        var otcLoginEligibleProofs = response.Credentials && response.Credentials.OtcLoginEligibleProofs;
        var otcCredentials = [];

        if (otcLoginEligibleProofs)
        {
            var isCobasiApp = response.Credentials && response.Credentials.HasPhone && response.Credentials.CobasiApp;
            Helpers.Array.forEach(
                otcLoginEligibleProofs,
                function (eligibleProof)
                {
                    if (eligibleProof.isDefault !== isDefault)
                    {
                        return;
                    }

                    var otcCredential =
                    {
                        credType: CredentialType.OneTimeCode,
                        proof: eligibleProof
                    };

                    otcCredential.proof.isEncrypted = true;

                    switch (eligibleProof.type)
                    {
                        case PROOF.Type.SMS:
                        case PROOF.Type.Voice:
                            if (!eligibleProof.isVoiceOnly)
                            {
                                var smsCredential = ObjectHelpers.clone(otcCredential);

                                if (smsCredential.proof.otcSent && _isPostRequest && _postProofType === PROOF.Type.Voice)
                                {
                                    smsCredential.proof.otcSent = false;
                                }

                                smsCredential.proof.type = PROOF.Type.SMS;

                                if (_hidePhoneCobasiInOtherSignIn && !isCobasiApp)
                                {
                                    smsCredential.shownOnlyOnPicker = true;
                                }

                                otcCredentials.push(smsCredential);
                            }

                            if (eligibleProof.voiceEnabled)
                            {
                                var voiceCredential = ObjectHelpers.clone(otcCredential);

                                if (voiceCredential.proof.otcSent && !(_isPostRequest && _postProofType === PROOF.Type.Voice))
                                {
                                    voiceCredential.proof.otcSent = false;
                                }

                                voiceCredential.proof.type = PROOF.Type.Voice;
                                otcCredentials.push(voiceCredential);
                            }
                            break;

                        case PROOF.Type.Email:
                            otcCredentials.push(ObjectHelpers.clone(otcCredential));
                            break;
                    }
                });
        }

        if (isDefault && otcCredentials.length === 0 && _getPreferredCredential(response, isFidoSupported) === CredentialType.OneTimeCode)
        {
            var hasPassword = response.Credentials && response.Credentials.HasPassword;
            var otcCredential =
            {
                credType: CredentialType.OneTimeCode,
                proof:
                {
                    display: response.Display,
                    data: StringHelpers.cleanseUsername(response.Display),
                    otcSent: true,
                    isEncrypted: false,
                    isDefault: true,
                    isNopa: !hasPassword,
                    type: StringHelpers.isEmailAddress(response.Username) ? PROOF.Type.Email : PROOF.Type.SMS
                }
            };

            otcCredentials.push(otcCredential);
        }

        return otcCredentials;
    }

    function _buildOtcProofStrings(otcCredential)
    {
        
        
        otcCredential.proof.str = {};
        ObjectHelpers.extend(otcCredential.proof.str, _userProofData[otcCredential.proof.type] || {});

        ObjectHelpers.forEach(
            otcCredential.proof.str,
            function (id, str)
            {
                if (str)
                {
                    otcCredential.proof.str[id] = StringHelpers.format(str, otcCredential.proof.display + "\u200e", otcCredential.proof.clearDigits || "");
                }
            });
    }

    function _callGetCredentialTypeAsync(unsafe_username, flowToken)
    {
        var promises = [_isFidoSupportedPromise].concat(_getPoPAuthenticatorPromise || []);
        return Promise.all(promises).then(
            function (values)
            {
                var isFidoSupported = values[0];
                var popAuthenticator = values[1];
                return new Promise(
                    function (resolve, reject)
                    {
                        var apiRequest = new ApiRequest({ checkApiCanary: _checkApiCanary });
                        apiRequest.Json(
                            {
                                url: _getCredentialTypeUrl,
                                eventId: ClientTracingConstants.EventIds.Api_GetCredentialType
                            },
                            _buildGetCredentialTypeRequest(unsafe_username, flowToken, isFidoSupported, popAuthenticator),
                            resolve,
                            reject,
                            Constants.DefaultRequestTimeout);
                    });
            }
        );
    }

    function _isDesktopSsoAttemptedUsernameMatch(unsafe_username)
    {
        return unsafe_username && _desktopSsoConfig.lastUsernameTried && unsafe_username.toLowerCase() === _desktopSsoConfig.lastUsernameTried.toLowerCase();
    }

    function _parseGetCredentialTypeResponse(otherIdpRedirectUrl, unsafe_username, useAltUsernameExistenceError, response, isFidoSupported, isCachedResponse)
    {
        var gctResult = {};
        var desktopSsoEnabled = _desktopSsoConfig && response.EstsProperties && response.EstsProperties.DesktopSsoEnabled && !_isDesktopSsoAttemptedUsernameMatch(unsafe_username);
        var errorHr = response.ErrorHR;
        var fedRedirectParams = _getFedRedirectParams(unsafe_username, response, isFidoSupported);
        var sharedData = _this.getGctSharedData(response, isFidoSupported, isCachedResponse);

        sharedData.username = unsafe_username;

        if (errorHr === Error.PP_E_INVALID_PHONENUMBER || errorHr === Error.PP_E_LIBPHONENUMBERINTEROP_NUMBERPARSE_EXCEPTION)
        {
            gctResult = _getInvalidPhoneNumberGctResult(errorHr);
        }
        else if (errorHr === Error.PP_E_NAME_INVALID || errorHr === Error.PP_E_INVALIDARG)
        {
            gctResult = _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_InvalidUsername"]);
        }
        else if (errorHr === Error.PP_E_FEDERATION_INLINELOGIN_DISALLOWED)
        {
            gctResult = _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_FedNotAllowed"], true );
        }
        else if (errorHr === Error.PP_E_LOGIN_NOPA_USER_PASSWORD_REQUIRED)
        {
            if (_useResetPasswordUrlInPasswordRequiredError)
            {
                gctResult = _getGctResultShowErrorAction(StringHelpers.format(_strings["CT_STR_Error_PasswordRequired"], QueryString.stripQueryStringAndFragment(_resetPasswordUrl)));
            }
            else
            {
                gctResult = _getGctResultShowErrorAction(StringHelpers.format(_strings["CT_STR_Error_PasswordRequired"], QueryString.stripQueryStringAndFragment(_changePasswordUrl)));
            }
        }
        else if (response.RequiresPhoneDisambiguation)
        {
            gctResult = _getGctResultSwitchViewAction(PaginatedState.PhoneDisambiguation);
        }
        else if (response.AliasDisabledForLogin)
        {
            return _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_AliasDisabled"], true );
        }
        else if (response.IfExistsResult === IfExistsResult.NotExist)
        {
            gctResult = _getUsernameNotFoundGctResult(unsafe_username, useAltUsernameExistenceError, response, isFidoSupported);
        }
        else if (response.IfExistsResult === IfExistsResult.ExistsBothIDPs)
        {
            gctResult = _getGctResultSwitchViewAction(
                PaginatedState.IdpDisambiguation,
                {
                    desktopSsoEnabled: desktopSsoEnabled,
                    idpRedirectUrl: fedRedirectParams.idpRedirectUrl,
                    idpRedirectPostParams: fedRedirectParams.idpRedirectPostParams,
                    idpRedirectProvider: fedRedirectParams.idpRedirectProvider
                });
        }
        else if (response.IfExistsResult === IfExistsResult.ExistsInOtherMicrosoftIDP)
        {
            gctResult = _getOtherIdpRedirectGctResult(otherIdpRedirectUrl, unsafe_username);
        }
        else if (_isOtherIdpSupported
            && (response.IfExistsResult === IfExistsResult.Error
                || response.IfExistsResult === IfExistsResult.Throttled
                || (response.ThrottleStatus & ThrottleStatus.MsaThrottled) !== 0))
        {
            
            
            gctResult = _getGctResultSwitchViewAction(
                PaginatedState.IdpDisambiguation,
                {
                    hasIdpDisambigError: true,
                    desktopSsoEnabled: desktopSsoEnabled,
                    idpRedirectUrl: fedRedirectParams.idpRedirectUrl,
                    idpRedirectPostParams: fedRedirectParams.idpRedirectPostParams,
                    idpRedirectProvider: fedRedirectParams.idpRedirectProvider
                });
        }
        else if (response.ShowRemoteConnect)
        {
            gctResult = _getGctResultSwitchViewAction(PaginatedState.RemoteLoginPolling);
        }
        else
        {
            var isProofConfirmationRequired = sharedData.otcCredential && sharedData.otcCredential.proof.clearDigits;

            gctResult = _getUsernameFoundGctResult(unsafe_username, desktopSsoEnabled, fedRedirectParams, response, isProofConfirmationRequired, isFidoSupported);
        }

        
        gctResult.flowToken = response.FlowToken || null;

        if (!gctResult.bypassCache)
        {
            _cache[unsafe_username] = response;

            
            _cache[unsafe_username].FlowToken = null;
        }

        gctResult.sharedData = sharedData;

        return gctResult;
    }

    function _handleGetCredentialTypeError(response)
    {
        var gctResult = {};

        if (response && response.error)
        {
            switch (response.error.code)
            {
                case ApiErrorCodes.AuthFailure:
                    gctResult = _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_FlowTokenExpired"]);
                    break;

                case EstsError.PublicIdentifierSasBeginCallNonRetriableError:
                case EstsError.PublicIdentifierSasBeginCallRetriableError:
                    gctResult = _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_GetCredentialTypeError"], false , true );
                    break;

                default:
                    gctResult = _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_GetCredentialTypeError"]);
                    break;
            }
        }
        else
        {
            gctResult = _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_GetCredentialTypeError"]);
        }

        gctResult.flowToken = response.FlowToken || null;

        return gctResult;
    }

    function _getPreferredCredential(response, isFidoSupported)
    {
        var preferredCredential = CredentialType.Password;
        var credentials = response.Credentials;

        if (credentials)
        {
            preferredCredential = credentials.PrefCredential;

            if (preferredCredential === CredentialType.Fido && !isFidoSupported)
            {
                
                preferredCredential = credentials.RemoteNgcParams && credentials.RemoteNgcParams.SessionIdentifier
                    ? CredentialType.RemoteNGC
                    : CredentialType.Password;
            }
        }

        return preferredCredential;
    }

    function _getAvailableCreds(response, isFidoSupported)
    {
        var availableCredentials = response.Credentials || {};
        var sasParams = availableCredentials.SasParams;
        var linkedInParams = availableCredentials.LinkedInParams;
        var gitHubParams = availableCredentials.GitHubParams;
        var googleParams = availableCredentials.GoogleParams;
        var facebookParams = availableCredentials.FacebookParams;
        var certAuthParams = availableCredentials.CertAuthParams;
        var estsProperties = response.EstsProperties || {};

        
        
        var credentials = [].concat(
            availableCredentials.HasPassword && (estsProperties.DomainType !== DomainType.Federated) ? { credType: CredentialType.Password }: [],
            availableCredentials.FederationRedirectUrl && (estsProperties.DomainType === DomainType.Federated) ? { credType: CredentialType.Federation } : [],
            availableCredentials.FederationRedirectUrl && (estsProperties.DomainType === DomainType.CloudFederated) ? { credType: CredentialType.CloudFederation } : [],
            availableCredentials.HasRemoteNGC ? { credType: CredentialType.RemoteNGC } : [],
            availableCredentials.HasFido && isFidoSupported ? { credType: CredentialType.Fido } : [],
            availableCredentials.HasPhone && sasParams ? { credType: CredentialType.PublicIdentifierCode } : [],
            availableCredentials.HasLinkedInFed && linkedInParams ? { credType: CredentialType.LinkedIn, redirectUrl: linkedInParams.LinkedInRedirectUrl } : [],
            availableCredentials.HasGitHubFed && gitHubParams ? { credType: CredentialType.GitHub, redirectUrl: gitHubParams.GithubRedirectUrl } : [],
            availableCredentials.HasGoogleFed && googleParams ? { credType: CredentialType.Google, redirectUrl: googleParams.GoogleRedirectUrl } : [],
            availableCredentials.HasFacebookFed && facebookParams ? { credType: CredentialType.Facebook, redirectUrl: facebookParams.FacebookRedirectUrl } : [],
            availableCredentials.HasAccessPass ? { credType: CredentialType.AccessPass } : [],
            availableCredentials.HasCertAuth ? { credType: CredentialType.Certificate, redirectUrl: certAuthParams.CertAuthUrl, redirectPostParams: _getCertAuthParams(response.FlowToken) } : []);

        
        if (_userProofData[PROOF.Type.Email] && _userProofData[PROOF.Type.SMS] && _userProofData[PROOF.Type.Voice])
        {
            var otcCredentials = _buildOtcCredentials(response, true , isFidoSupported);

            if (otcCredentials.length > 0)
            {
                Helpers.Array.forEach(otcCredentials, _buildOtcProofStrings);
                credentials = credentials.concat(otcCredentials);
            }
        }

        return credentials;
    }

    function _getEvictedCreds(response, isFidoSupported)
    {
        var credentials = [];

        
        if (_userProofData[PROOF.Type.Email] && _userProofData[PROOF.Type.SMS] && _userProofData[PROOF.Type.Voice])
        {
            var otcCredentials = _buildOtcCredentials(response, false , isFidoSupported);

            if (otcCredentials.length > 0)
            {
                Helpers.Array.forEach(otcCredentials, _buildOtcProofStrings);
                credentials = credentials.concat(otcCredentials);

                if (Helpers.Array.first(
                    otcCredentials,
                    function (otcCredential)
                    {
                        return !otcCredential.proof.isNopa;
                    }))
                {
                    credentials = credentials.concat({ credType: CredentialType.Password, isDefault: false });
                }
            }
        }

        return credentials;
    }

    function _getInvalidPhoneNumberGctResult(errorHr)
    {
        if (_isPhoneNumberFullyQualified)
        {
            return _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_InvalidPhoneNumber"], true );
        }

        return _getGctResultSwitchViewAction(PaginatedState.PhoneDisambiguation, { phoneDisambigError: errorHr });
    }

    function _getUsernameNotFoundGctResult(unsafe_username, useAltUsernameExistenceError, response, isFidoSupported)
    {
        var errorString;
        var isSignupAllowedForUsername = _isSignupAllowedForUsername(unsafe_username, response);
        var estsProperties = response.EstsProperties || {};
        var isAadVerifiedDomain = estsProperties.DomainType
            && estsProperties.DomainType !== DomainType.Unknown
            && estsProperties.DomainType !== DomainType.Consumer;

        if (response.IsProofForAlias)
        {
            
            return _getGctResultSwitchViewAction(PaginatedState.ConfirmRecoverUsername);
        }
        else if (_isSignupAllowed && isSignupAllowedForUsername && _isCombinedSignInSignUp())
        {
            if (_redirectToSignupOnNotExists)
            {
                
                return _getSignupRedirectGctResultForResponse(unsafe_username, response);
            }

            
            return _getGctResultSwitchViewAction(PaginatedState.ConfirmSignup);
        }

        
        if (_isSelfServiceSignupUxEnabled)
        {
            errorString = _strings["CT_PWD_STR_SSSU_Error_EmailAccountNotFound"];
        }
        else if (useAltUsernameExistenceError)
        {
            if (response.ThrottleStatus === ThrottleStatus.NotThrottled && isAadVerifiedDomain)
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_Alternate_VerifiedDomain"];
            }
            else
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_Alternate"];
            }
        }
        else if (_getPreferredCredential(response, isFidoSupported) === CredentialType.OneTimeCode)
        {
            
            
            if (response.ThrottleStatus === ThrottleStatus.MsaThrottled)
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExists_EmailOtpAllowed_MsaFailed"];
            }
            else
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExists_EmailOtpAllowed"];
            }
        }
        else if (_useConsumerEmailError && estsProperties.DomainType === DomainType.Consumer)
        {
            errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_ConsumerEmail"];
        }
        else if (response.ThrottleStatus === ThrottleStatus.NotThrottled && isAadVerifiedDomain)
        {
            if (isSignupAllowedForUsername)
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_VerifiedDomain_SignupAllowed"];
            }
            else
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_VerifiedDomain"];
            }
        }
        else if (response.ThrottleStatus === ThrottleStatus.MsaThrottled)
        {
            if (isAadVerifiedDomain && isSignupAllowedForUsername)
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_VerifiedDomain_MsaFailed_SignupAllowed"];
            }
            else if (isAadVerifiedDomain)
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_VerifiedDomain_MsaFailed"];
            }
            else if (_isSignupAllowed && !_signupUrl)
            {
                errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_Guest_SignupAllowed_MsaFailed"];
            }
            else
            {
                errorString = _strings["CT_PWD_STR_Error_UnknownDomain_MsaFailed"];
            }
        }
        else if (_isSignup && !isAadVerifiedDomain)
        {
            errorString = _strings["CT_PWD_STR_Error_UsernameNotExist_Guest_Signup"];
        }
        else if (_isPhoneNumberFullyQualified)
        {
            errorString = _strings["CT_PWD_STR_Error_InvalidPhoneNumber"];
        }
        else
        {
            errorString = _strings["CT_PWD_STR_Error_UsernameNotExist"];
        }

        
        
        return _getGctResultShowErrorAction(
            StringHelpers.format(
                errorString,
                BrowserHelper.htmlEscape(StringHelpers.extractDomain(unsafe_username)),
                BrowserHelper.htmlEscape(unsafe_username)),
            true );
    }

    function _getOtherIdpRedirectGctResult(otherIdpRedirectUrl, unsafe_username)
    {
        
        
        var encodedUsername = encodeURIComponent(unsafe_username).replace(new RegExp("'", "g"), "%27");

        
        otherIdpRedirectUrl = QueryString.appendOrReplace(otherIdpRedirectUrl, "username", encodedUsername);
        otherIdpRedirectUrl = QueryString.appendOrReplace(otherIdpRedirectUrl, "login_hint", encodedUsername);

        var otherIdpRedirectPostParams = _otherIdpRedirectPostParams ? ObjectHelpers.clone(_otherIdpRedirectPostParams) : null;

        if (otherIdpRedirectPostParams)
        {
            otherIdpRedirectPostParams.unsafe_username = unsafe_username;
        }

        return _getGctResultRedirectAction(otherIdpRedirectUrl, otherIdpRedirectPostParams, true  , ClientTracingConstants.EventIds.Redirect_OtherIdpRedirection);
    }

    function _getUsernameFoundGctResult(unsafe_username, desktopSsoEnabled, fedRedirectParams, response, isProofConfirmationRequired, isFidoSupported)
    {
        var preferredCredential = _getPreferredCredential(response, isFidoSupported);

        if (_isRestrictedWsi)
        {
            
            if (!response.Credentials.HasPassword
                && !response.Credentials.HasGoogleFed
                && !response.Credentials.HasCertAuth
                && !response.Credentials.HasFido
                && !response.Credentials.HasRemoteNGC
                && !response.Credentials.HasPhone
                && !response.Credentials.HasFacebookFed)
            {
                _isTapRestrictedWsi = true;

                if (preferredCredential !== CredentialType.AccessPass)
                {
                    return _getGctResultSwitchViewAction(PaginatedState.MoreInfo);
                }
            }
        }

        if (!_disableDesktopSsoPreferredCred && desktopSsoEnabled)
        {
            return _getGctResultSwitchViewAction(
                PaginatedState.FetchSessionsProgress,
                {
                    unsafe_desktopSsoDomainToUse: StringHelpers.extractDomain(unsafe_username),
                    sessionPullType: SessionPullFlags.Dsso
                });
        }

        if (response.NativeBridgeRequest && (!_wamMessageHandlerInstance || !_wamMessageHandlerInstance.isBridgeUnavailable()))
        {
            return _getGctResultSwitchViewAction(
                PaginatedState.WebNativeBridge,
                {
                    request: response.NativeBridgeRequest
                });
        }

        var idpRedirectViewParams =
            {
                idpRedirectUrl: fedRedirectParams.idpRedirectUrl,
                idpRedirectPostParams: fedRedirectParams.idpRedirectPostParams,
                idpRedirectProvider: fedRedirectParams.idpRedirectProvider
            };

        switch (preferredCredential)
        {
            case CredentialType.OneTimeCode:
                var paginatedState = PaginatedState.OneTimeCode;

                if (_disableAutoSend)
                {
                    paginatedState = isProofConfirmationRequired ? PaginatedState.ProofConfirmation : PaginatedState.ConfirmSend;
                }

                return _getGctResultSwitchViewAction(paginatedState);

            case CredentialType.PublicIdentifierCode:
                
                if (!_disableAutoSend && (!response.Credentials.SasParams || !response.Credentials.SasParams.Success))
                {
                    return _getGctResultShowErrorAction(_strings["CT_PWD_STR_Error_GetCredentialTypeError"], false , true );
                }

                return _getGctResultSwitchViewAction(_disableAutoSend ? PaginatedState.ConfirmSend : PaginatedState.OneTimeCode);

            case CredentialType.Fido:
                return _getGctResultSwitchViewAction(PaginatedState.Fido);

            case CredentialType.RemoteNGC:
                var isPushNotification = response.Credentials.RemoteNgcParams.DefaultType === RemoteNgcType.PushNotification;
                return _getGctResultSwitchViewAction(
                    _disableAutoSend && isPushNotification ? PaginatedState.ConfirmSend : PaginatedState.RemoteNGC,
                    idpRedirectViewParams);

            case CredentialType.Federation:
            case CredentialType.CloudFederation:
                return _getGctResultSwitchViewAction(PaginatedState.IdpRedirect, idpRedirectViewParams);

            case CredentialType.LinkedIn:
            case CredentialType.GitHub:
            case CredentialType.Google:
            case CredentialType.Facebook:
                return _getGctResultSwitchViewAction(
                    (_getAvailableCreds(response, isFidoSupported).length > 1 || _getEvictedCreds(response, isFidoSupported).length > 0) ? PaginatedState.IdpRedirectSpeedbump : PaginatedState.IdpRedirect,
                    idpRedirectViewParams);

            case CredentialType.AccessPass:
                return _getGctResultSwitchViewAction(PaginatedState.AccessPass, idpRedirectViewParams);

            case CredentialType.NoPreferredCredential:
                return _getGctResultSwitchViewAction(PaginatedState.CredentialPicker, idpRedirectViewParams);

            case CredentialType.OtherMicrosoftIdpFederation:
                return _getSignupRedirectGctResultForResponse(unsafe_username, response, _msaSignupUrl);

            case CredentialType.Certificate:
                return _getGctResultRedirectAction(response.Credentials.CertAuthParams.CertAuthUrl, _getCertAuthParams(response.FlowToken));

            case CredentialType.Password:
            default:
                return _getGctResultSwitchViewAction(PaginatedState.Password);
        }
    }

    function _getSignupRedirectGctResultForResponse(unsafe_username, response, signupUrl)
    {
        signupUrl = signupUrl || _signupUrl;
        signupUrl = QueryString.remove(signupUrl, "username");

        if (_updateLoginHint)
        {
            signupUrl = QueryString.remove(signupUrl, "login_hint");
        }

        var signupUrlPostParams = _signupUrlPostParams ? ObjectHelpers.clone(_signupUrlPostParams) : null;

        
        if (response
            && (response.IfExistsResult === IfExistsResult.NotExist
                || (response.IsUnmanaged && response.IfExistsResult === IfExistsResult.Exists)))
        {
            if (_isSignupAllowedForUsername(unsafe_username, response))
            {
                if (signupUrlPostParams)
                {
                    signupUrlPostParams.unsafe_username = unsafe_username;
                }
                else
                {
                    signupUrl = QueryString.appendOrReplace(signupUrl, "username", encodeURIComponent(unsafe_username));

                    if (_updateLoginHint)
                    {
                        signupUrl = QueryString.appendOrReplace(signupUrl, "login_hint", encodeURIComponent(unsafe_username));
                    }
                }
            }
        }

        return _getGctResultRedirectAction(signupUrl, signupUrlPostParams, false  , ClientTracingConstants.EventIds.Redirect_MSASignUpPage);
    }

    function _getFedRedirectParams(unsafe_username, response, isFidoSupported)
    {
        var fedRedirectParams = {};
        var preferredCredential = _getPreferredCredential(response, isFidoSupported);
        var estsProperties = response.EstsProperties || {};

        if (!response.Credentials
            || (!response.Credentials.FederationRedirectUrl
                && !response.Credentials.LinkedInParams
                && !response.Credentials.GitHubParams
                && !response.Credentials.GoogleParams
                && !response.Credentials.FacebookParams))
        {
            
            return fedRedirectParams;
        }

        switch (preferredCredential)
        {
            case CredentialType.RemoteNGC:
            case CredentialType.Federation:
            case CredentialType.AccessPass:
            case CredentialType.NoPreferredCredential:
                if (estsProperties
                    && estsProperties.SamlRequest
                    && estsProperties.RelayState)
                {
                    fedRedirectParams.idpRedirectUrl = response.Credentials.FederationRedirectUrl;
                    fedRedirectParams.idpRedirectPostParams =
                        {
                            SAMLRequest: estsProperties.SamlRequest,
                            RelayState: estsProperties.RelayState,
                            unsafe_username: unsafe_username
                        };
                }
                else
                {
                    fedRedirectParams.idpRedirectUrl = _buildFederationRedirectUrl(
                        response.Credentials.FederationRedirectUrl,
                        unsafe_username);
                }

                break;

            case CredentialType.CloudFederation:
                fedRedirectParams.idpRedirectUrl = response.Credentials.FederationRedirectUrl;
                break;

            case CredentialType.LinkedIn:
                fedRedirectParams.idpRedirectUrl = response.Credentials.LinkedInParams.LinkedInRedirectUrl;
                fedRedirectParams.idpRedirectProvider = BindProvider.LinkedIn;
                break;

            case CredentialType.GitHub:
                fedRedirectParams.idpRedirectUrl = response.Credentials.GitHubParams.GithubRedirectUrl;
                fedRedirectParams.idpRedirectProvider = BindProvider.GitHub;
                break;

            case CredentialType.Google:
                fedRedirectParams.idpRedirectUrl = response.Credentials.GoogleParams.GoogleRedirectUrl;
                fedRedirectParams.idpRedirectProvider = BindProvider.Google;
                break;

            case CredentialType.Facebook:
                fedRedirectParams.idpRedirectUrl = response.Credentials.FacebookParams.FacebookRedirectUrl;
                fedRedirectParams.idpRedirectProvider = BindProvider.Facebook;
                break;

            default:
                break;
        }

        return fedRedirectParams;
    }

    function _buildFederationRedirectUrl(fedUrl, unsafe_username)
    {
        if (_federationRedirectQueryString)
        {
            var fedQs = QueryString.appendOrReplace(
                "?" + _federationRedirectQueryString,
                "wctx",
                "LoginOptions%3D3%26" + QueryString.extract("wctx", "?" + _federationRedirectQueryString));

            fedQs = fedQs.substr(1);

            fedUrl = QueryString.append(fedUrl, fedQs);
        }
        else
        {
            fedUrl = QueryString.appendOrReplace(
                fedUrl,
                "wctx",
                "LoginOptions%3D3%26" + QueryString.extract("wctx", fedUrl));
        }

        fedUrl = QueryString.appendOrReplace(fedUrl, "cbcxt", encodeURIComponent(decodeURIComponent(QueryString.extract("cbcxt"))));
        fedUrl = QueryString.appendOrReplace(fedUrl, "username", encodeURIComponent(unsafe_username));
        fedUrl = QueryString.appendOrReplace(fedUrl, "mkt", encodeURIComponent(decodeURIComponent(QueryString.extract("mkt"))));
        fedUrl = QueryString.appendOrReplace(fedUrl, "lc", encodeURIComponent(decodeURIComponent(QueryString.extract("lc"))));

        return fedUrl;
    }

    function _getCertAuthParams(flowToken)
    {
        var certAuthParams =
            {
                ctx: _originalRequest,
                flowToken: flowToken
            };

        return certAuthParams;
    }

    function _getCleansedUsername(unsafe_username)
    {
        return StringHelpers.cleanseUsername(unsafe_username, true );
    }

    function _isSignupAllowedForUsername(unsafe_username, response)
    {
        
        var isSkypeName = _allowSkype && StringHelpers.isSkypeName(unsafe_username);
        var estsProperties = response.EstsProperties || {};
        var isAadVerifiedDomain = estsProperties.DomainType
            && estsProperties.DomainType !== DomainType.Unknown
            && estsProperties.DomainType !== DomainType.Consumer;

        if (isAadVerifiedDomain)
        {
            return response.IsSignupDisallowed === false;
        }

        return !response.IsSignupDisallowed && !isSkypeName;
    }

    function _isCombinedSignInSignUp()
    {
        return _redirectToSignupOnNotExists || _checkProofForAliases;
    }

    function _getGctResultSwitchViewAction(viewId, viewParams)
    {
        return { action: GctResultAction.SwitchView, viewId: viewId, viewParams: viewParams };
    }

    function _getGctResultShowErrorAction(error, isBlockingError, bypassCache)
    {
        return { action: GctResultAction.ShowError, error: error, isBlockingError: isBlockingError, bypassCache: bypassCache };
    }

    function _getGctResultRedirectAction(redirectUrl, redirectPostParams, isIdpRedirect, eventId)
    {
        return { action: GctResultAction.Redirect, redirectUrl: redirectUrl, redirectPostParams: redirectPostParams, isIdpRedirect: isIdpRedirect, eventId: eventId };
    }

    (function _initialize()
    {
        _isOtherIdpSupported = !_checkCurrentIdpOnly && _allowedIdentities === AllowedIdentitiesType.Both;

        _useAltUsernameExistenceErrorPromise = Promise.resolve(false);

        if (_checkForWindowsSku && Host && Host.isMsaProviderAllowedAsync)
        {
            _useAltUsernameExistenceErrorPromise = Host.isMsaProviderAllowedAsync();
        }

        _isFidoSupportedPromise = BrowserHelper.isFidoSupportedAsync(_isFidoSupportedHint);

        if (_bindCookiesUsingPoP)
        {
            require.ensure([],
                function ()
                {
                    var proofOfPossessionGenerator = require("./ProofOfPossessionGenerator");
                    _getPoPAuthenticatorPromise = proofOfPossessionGenerator.computePoPAuthenticator("POST", _getCredentialTypeUrl).then(
                        function (authenticator)
                        {
                            return { cpa: authenticator, err: null };
                        },
                        function (err)
                        {
                            return { cpa: "", err: err.message };
                        });
                },
                "PoP");
        }

        if (_enableWebNativeBridge)
        {
            require.ensure([],
                function ()
                {
                    _wamMessageHandlerInstance = require("../WebNativeBridge/WebNativeBridgeMessageHandler");
                },
                "WebNativeBridge");
        }
    })();
    
}

module.exports = GetCredentialTypeRequestHelper;