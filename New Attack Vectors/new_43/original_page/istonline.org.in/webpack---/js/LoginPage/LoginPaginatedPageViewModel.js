

var ko = require("knockout");
var Helpers = require("../Core/Helpers");
var BrandingHelpers = require("../Core/BrandingHelpers");
var CanaryValidationHelper = require("../Core/CanaryValidationHelper");
var Constants = require("../Core/Constants");
var Browser = require("../Core/BrowserControl");
var BrowserCapabilitiesHelper = require("../Core/BrowserCapabilitiesHelper");
var BrowserSso = require("../Core/BrowserSso");
var Promise = require("../Core/Promise");
var GetCredentialTypeRequestHelper = require("../Core/GetCredentialTypeHelpers");
var TileHelpers = require("../Core/TileHelpers");
var Fido = require("../Core/Fido");
var PromiseHelpers = require("../Core/PromiseHelpers");
var ClientTracingHelper = require("../Core/ClientTracingHelper").getInstance(window.ServerData);
var LoginConstants = require("./LoginConstants");
var PaginationControlHelper = require("../Core/PaginationControlHelper");

var requireFedIcon = require.context("images", false, /^.+\/signin-.+\.(png|svg)$/);
var Host = null;
var HostExtensions = null;
var BrandingLivePreviewFactory = null;

if (!__IS_MSA__)
{
    BrandingLivePreviewFactory = require("../Core/BrandingLivePreviewFactory");
}

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

    
    if (__IS_WINDOWS_AUTOPILOT_SUPPORTED__)
    {
        HostExtensions = require("./Win10AutopilotExtensionHost");
    }
}
else if (__IS_INCLUSIVE_OOBE__)
{
    Host = require("./InclusiveWin10LoginHost.js");

    
    if (__IS_WINDOWS_AUTOPILOT_SUPPORTED__)
    {
        HostExtensions = require("./Win10AutopilotExtensionHost");
    }
}
else if (__IS_XBOX__)
{
    Host = require("../Core/XboxHost");
}

var w = window;
var Error = Constants.Error;
var EstsError = Constants.EstsError;
var StringHelpers = Helpers.String;
var ObjectHelpers = Helpers.Object;
var ErrorData = Helpers.ErrorData;
var LoginMode = Constants.LoginMode;
var PaginatedState = Constants.PaginatedState;
var CredentialType = Constants.CredentialType;
var AnimationState = Constants.AnimationState;
var AnimationName = Constants.AnimationName;
var BrowserHelper = Browser.Helper;
var QueryString = Browser.QueryString;
var Cookies = Browser.Cookies;
var GctResultAction = GetCredentialTypeRequestHelper.GctResultAction;
var GctRequestHelperFlags = GetCredentialTypeRequestHelper.GctRequestHelperFlags;
var CanaryValidationSuccessAction = CanaryValidationHelper.CanaryValidationSuccessAction;

module.exports = function (serverData)
{
    var _this = this;

    var c_fedCredButtonIdPrefix = "fedCredButton";
    var c_signinOptions = "signinOptions";

    var _serverData = serverData;
    var _unseenSessions = [];
    var _gctRequestHelper = null;
    var _dialogs = {};
    var _initializationPromises = [];
    var _canaryValidationViewId = null;
    var _isSvgImageSupported = false;
    var _showDialogPromiseHandlers = null;
    var _brandingLivePreview = null;

    var _flowTokenOverride = ko.observable();
    var _showFedCredButtons = ko.observable(false);
    var _credShownOnlyOnPicker = ko.observable(false);

    
    var _strings = _serverData.str;
    var _htmlStrings = _serverData.html;
    var _loginMode = _serverData.iLoginMode;
    var _loginBody = _serverData.iLBodyDefault;
    var _isForceSigninPost = _serverData.fPOST_ForceSignin;
    var _flowTokenTag = _serverData.sFTTag;
    var _flowTokenCookieName = _serverData.sFTCookieName;
    var _originalRequest = _serverData.sCtx;
    var _isCloudBuild = _serverData.fIsCloudBuild;
    var _allowCancel = _serverData.fAllowCancel;
    var _postUrl = _serverData.urlPost;
    var _cancelUrl = _serverData.urlCancel;
    var _backUrl = _serverData.urlBack;
    var _resetPasswordUrl = _serverData.urlResetPassword;
    var _hipScriptUrl = _serverData.urlHIPScript;
    var _prefillUsername = _serverData.sPrefillUsername;
    var _signInUsername = _serverData.sSignInUsername;
    var _postedUsername = _serverData.sPOST_Username;
    var _ztdUpnHint = _serverData.sZtdUpnHint;
    var _foundNames = _serverData.sFoundMSAs || "";
    var _lockUsername = _serverData.fLockUsername;
    var _errorText = _serverData.sErrTxt;
    var _validationErrors = _serverData.arrValErrs;
    var _prefixCookieDomainEnabled = _serverData.fPrefixCookieDomainEnabled;
    var _staticTenantBranding = _serverData.staticTenantBranding;
    var _appCobranding = _serverData.oAppCobranding;
    var _backgroundImage = _serverData.iBackgroundImage;
    var _resetPasswordUsernamePrefillParam = _serverData.sResetPasswordPrefillParam || "mn";
    var _rawQueryString = _serverData.sRawQueryString;
    var _sessions = _serverData.arrSessions;
    var _otherIdpRedirectUrl = _serverData.urlGoToAADError;
    var _otherIdpRedirectPostParams = _serverData.oUrlOtherIdpPostParams;
    var _cancelPostParams = _serverData.oCancelPostParams;
    var _desktopSsoConfig = _serverData.desktopSsoConfig;
    var _getCredTypeResultFromServer = _serverData.oGetCredTypeResult;
    var _postedPaginatedState = _serverData.sPOST_PaginatedLoginState;
    var _postedSessionIdentifier = _serverData.sPOST_PaginatedLoginStateRNGCSLK;
    var _postedEntropy = _serverData.sPOST_PaginatedLoginStateRNGCEntropy;
    var _postedRngcDefaultType = _serverData.sPOST_PaginatedLoginStateRNGCDefaultType;
    var _postedIsSignupPost = _serverData.fPOST_IsSignupPost;
    var _fidoAllowList = _serverData.arrFidoAllowList;
    var _promotedFedCredType = _serverData.iPromotedFedCredType;
    var _linkedInFedUrl = _serverData.urlLinkedInFed;
    var _gitHubFedUrl = _serverData.urlGitHubFed;
    var _enableCssAnimation = _serverData.fEnableCssAnimation;
    var _proofConfirmation = _serverData.sProofConfirm;
    var _isFidoSupportedHint = !!_serverData.fIsFidoSupported;
    var _needsExternalCanaryValidation = !!_serverData.sExternalCanary;
    var _sessionPullType = _serverData.iSessionPullType;
    var _isDebugTracingEnabled = _serverData.fIsDebugTracingEnabled;
    var _detectBrowserCapabilities = _serverData.fDetectBrowserCapabilities;
    var _isWriteWloptCookieDisallowed = _serverData.fIsWriteWloptCookieDisallowed;
    var _otherIdpSignUpUrl = _serverData.urlOtherIdpSignup;
    var _googleFedSignUpUrl = _serverData.urlGoogleFedSignup;
    var _facebookFedSignUpUrl = _serverData.urlFacebookFedSignup;
    var _isGlobalTenant = _serverData.isGlobalTenant;
    var _allowAutopilotProvisioningNavigation = _serverData.fAutopilotProvisioningNavigation;
    var _showTilesAfterSessionPull = _serverData.fShowTilesAfterSessionPull;
    var _showSignup = _serverData.fCBShowSignUp;
    var _signupUrl = _serverData.urlSignUp;
    var _showSignInOptionsAsButton = _serverData.fShowSignInOptionsAsButton;
    var _showForgotUsernameLink = _serverData.fShowForgotUsernameLink;
    var _showRemoteConnectLocationPage = _serverData.fShowRemoteConnectLocationPage;
    var _isRestrictedWsi = _serverData.fIsRestrictedWsi;
    var _enableUserStateFix = _serverData.fEnableUserStateFix;
    var _oidcDiscoveryEndpointFormatUrl = _serverData.urlOidcDiscoveryEndpointFormat;
    var _defaultFaviconUrl = _serverData.urlDefaultFavicon;
    var _livePreviewAllowedOrigins = _serverData.arrLivePreviewOrigins;
    

    
    _this.learnMore = null;
    _this.initialViewId = null;
    _this.currentViewId = null;
    _this.postCanaryValidationAction = null;
    _this.initialSharedData = {};
    _this.prefillNames = [];
    _this.agreementType = null;
    _this.asyncTileRequestCount = 0;
    _this.useCssAnimations = false;
    _this.sessionPullType = _sessionPullType;
    _this.isDebugTracingEnabled = _isDebugTracingEnabled;
    _this.showFedCredAndNewSession = true;

    _this.paginationControlMethods = ko.observable();
    _this.backgroundControlMethods = ko.observable();
    _this.learnMoreMethods = ko.observable();
    _this.instrumentationMethods = ko.observable();
    _this.footerMethods = ko.observable();
    _this.debugDetailsMethods = ko.observable();
    _this.asyncInitReady = ko.observable(false);
    _this.ctx = ko.observable();
    _this.postUrl = ko.observable();
    _this.userClickedCentipede = ko.observable(false);
    _this.pageSubmitted = ko.observable(false);
    _this.forceSubmit = ko.observable(false);
    _this.ariaHidden = ko.observable(false);
    _this.wasLearnMoreShown = ko.observable(false);
    _this.postRedirect = ko.observable();
    _this.postedLoginStateViewId = ko.observable();
    _this.postedLoginStateViewRNGCEntropy = ko.observable();
    _this.postedLoginStateViewRNGCDefaultType = ko.observable();
    _this.postedLoginStateViewRNGCSLK = ko.observable();
    _this.password = ko.observable();
    _this.isRequestPending = ko.observable(false);
    _this.showLightboxProgress = ko.observable(false);
    _this.bannerLogoUrl = ko.observable();
    _this.backgroundLogoUrl = ko.observable();
    _this.useDefaultBackground = ko.observable(false);
    _this.newSession = ko.observable();
    _this.fadeInLightBox = ko.observable(false);
    _this.activeDialog = ko.observable();
    _this.isFidoSupported = ko.observable(false).extend({ logValue: ClientTracingHelper.getPropertyLogOption(_this, { eventId: LoginConstants.ClientTracingEventIds.PropertyValue_LoginPaginatedPageView_IsFidoSupported, tracingChange: false }) });
    _this.showDebugDetails = ko.observable(false);
    _this.isSignupPost = ko.observable(false);
    _this.isRecoveryAttemptPost = ko.observable(false);
    _this.loadBannerLogo = ko.observable(false);
    _this.availableCredsWithoutUsername = ko.observableArray([]);
    _this.paginationControlHelper = new PaginationControlHelper(_serverData, _this.paginationControlMethods, _this.backgroundLogoUrl);

    _this.animate = ko.utils.extend(ko.observable(AnimationName.None),
        {
            isSlideOutNext: ko.pureComputed(function () { return _this.animate() === AnimationName.SlideOutNext; }),
            isSlideInNext: ko.pureComputed(function () { return _this.animate() === AnimationName.SlideInNext; }),
            isSlideOutBack: ko.pureComputed(function () { return _this.animate() === AnimationName.SlideOutBack; }),
            isSlideInBack: ko.pureComputed(function () { return _this.animate() === AnimationName.SlideInBack; })
        });

    _this.flowToken = ko.pureComputed(
        function ()
        {
            
            
            return _flowTokenOverride() || _serverData.sFT;
        });

    _this.newSessionInfo = ko.pureComputed(
        function ()
        {
            if (_this.newSession())
            {
                var newSessionInfo = {};
                var newSession = _this.newSession();
                var unsafe_newSessionDisplayName = BrowserHelper.htmlUnescape(newSession.displayName);
                var unsafe_fullName = BrowserHelper.htmlUnescape(newSession.fullName);
                var unsafe_signedInFullName = newSession.isSignedIn && unsafe_fullName;

                if (unsafe_signedInFullName)
                {
                    newSessionInfo.unsafe_newSessionFullName = unsafe_signedInFullName;
                    newSessionInfo.unsafe_newSessionDisplayName = unsafe_newSessionDisplayName;
                }
                else
                {
                    newSessionInfo.unsafe_newSessionFullName = unsafe_newSessionDisplayName;
                }

                return newSessionInfo;
            }

            return null;
        });

    _this.showFedCredButtons = ko.pureComputed(
        function ()
        {
            if (_this.useCssAnimations)
            {
                _this.animate(AnimationName.None);
                return _showFedCredButtons();
            }

            return _currentViewHasOtherSigninOptionButtons();
        });

    _this.otherSigninOptions = ko.pureComputed(
        function ()
        {
            var credTypeArray = [];
            var otherSigninOptions = [];

            if (!_currentViewUsesOtherSigninOptionButtons() || _isRestrictedWsi)
            {
                return null;
            }

            if (_promotedFedCredType)
            {
                credTypeArray.push(_promotedFedCredType);
            }

            ko.utils.arrayForEach(
                credTypeArray,
                function (credType)
                {
                    otherSigninOptions.push(_createFedCredButton(credType));
                });

            var multipleSigninOptionsAvailable = _this.availableCredsWithoutUsername().length > 0 || _showForgotUsernameLink || _oidcDiscoveryEndpointFormatUrl;
            var showCredsOnlyOnPicker = _this.availableCredsWithoutUsername().length === 1 && _credShownOnlyOnPicker();

            if (_showSignInOptionsAsButton
                && (multipleSigninOptionsAvailable || showCredsOnlyOnPicker))
            {
                otherSigninOptions.push(_createSigninOptionsButton());
            }

            return otherSigninOptions;
        });
    

    
    _this.dispose = function ()
    {
        if (!__IS_MSA__ && _brandingLivePreview)
        {
            _brandingLivePreview.removeListener(_setTenantBranding);
        }
    };

    _this.getServerError = function ()
    {
        var errorText = null;
        var remediationText = null;

        if (_errorText)
        {
            errorText = _errorText;
        }
        else if (_validationErrors && _validationErrors.length)
        {
            
            switch (_validationErrors[0])
            {
                case Error.EmptyFields:
                case Error.UsernameInvalid:
                case Error.PP_E_MISSING_MEMBERNAME:
                case Error.PP_E_NAME_INVALID:
                case Error.PP_E_EMAIL_RIGHT_TOO_LONG:
                case Error.PP_E_NAME_TOO_LONG:
                case Error.PP_E_INVALID_PHONENUMBER:
                case Error.PP_E_LIBPHONENUMBERINTEROP_NUMBERPARSE_EXCEPTION:
                    errorText = _strings["CT_PWD_STR_Error_InvalidUsername"];
                    break;
                case Error.PP_E_EXCLUDED:
                    errorText = _strings["CT_PWD_STR_SSSU_Error_InvalidEmailOrPassword"] || _htmlStrings["CT_PWD_STR_Error_WrongCreds"];
                    break;
                case Error.PP_E_BAD_PASSWORD:
                case Error.PP_E_PREVIOUS_PASSWORD:
                case Error.PP_E_INVALID_MEMBERNAME:
                case Error.PP_E_DB_MEMBERDOESNOTEXIST:
                case Error.PP_E_PE_RULEFALSE:
                case EstsError.InvalidUserNameOrPassword:
                case EstsError.ProtectedKeyMisuse:
                case EstsError.InvalidPasswordExpiredPassword:
                case EstsError.UserAccountNotFound:
                case EstsError.UserAccountDeleted:
                case EstsError.UserAccountNotFoundNotConfiguredForRemoteNgc:
                case EstsError.UserAccountNotFoundFailedToCreateRemoteSignIn:
                case EstsError.UserUnauthorizedApiVersionNotSupported:
                case EstsError.UserUnauthorizedMsaGuestUsersNotSupported:
                case EstsError.InvalidTenantName:
                case EstsError.InvalidTenantNameEmptyGuidIdentifier:
                case EstsError.InvalidTenantNameEmptyIdentifier:
                case EstsError.InvalidTenantNameFormat:
                case EstsError.InvalidDomainName:
                    errorText = _strings["CT_PWD_STR_SSSU_Error_InvalidEmailOrPassword"] || _htmlStrings[_hipScriptUrl ? "CT_IHL_STR_Error_WrongHip" : "CT_PWD_STR_Error_WrongCreds"];
                    break;
                case EstsError.UserUnauthorized:
                    errorText = _htmlStrings["CT_PWD_STR_Error_UsernameNotExist_Guest_SignupAllowed"];
                    break;
                case EstsError.InvalidPassword:
                    errorText = _strings["CT_PWD_STR_Error_InvalidPassword"];
                    break;
                case Error.PP_E_OLD_SKYPE_PASSWORD:
                    errorText = _strings["CT_IL_STR_Error_OldSkypePwd"];
                    break;
                case Error.PP_E_ALIAS_AUTH_NOTPERMITTED:
                    errorText = _strings["CT_PWD_STR_Error_AliasNotAllowed"];
                    break;
                case Error.PP_E_FEDERATION_INLINELOGIN_DISALLOWED:
                    errorText = _strings["CT_PWD_STR_Error_FedNotAllowed"];
                    break;
                case Error.PasswordEmpty:
                case Error.PP_E_MISSING_PASSWORD:
                case EstsError.InvalidPasswordNullPassword:
                    errorText = _strings["CT_PWD_STR_Error_MissingPassword"];
                    break;
                case Error.PP_E_IDP_LINKEDIN_BINDING_NOT_ALLOWED:
                    errorText = _strings["CT_STR_Error_FedUserNotFound_LinkedIn"];
                    break;
                case Error.PP_E_IDP_GOOGLE_BINDING_NOT_ALLOWED:
                    errorText = _strings["CT_STR_Error_FedUserNotFound_Google"];
                    break;
                case Error.PP_E_IDP_GITHUB_BINDING_NOT_ALLOWED:
                    errorText = _strings["CT_STR_Error_FedUserNotFound_GitHub"];
                    break;
                case Error.PP_E_OTT_DATA_INVALID:
                case Error.PP_E_OTT_ALREADY_CONSUMED:
                case Error.PP_E_OTT_INVALID_PURPOSE:
                case Error.PP_E_PPSA_RPT_NOTOADDRESS:
                case EstsError.InvalidOneTimePasscode:
                case EstsError.ExpiredOneTimePasscode:
                case EstsError.OneTimePasscodeCacheError:
                case EstsError.OneTimePasscodeEntryNotExist:
                case EstsError.InvalidOneTimePasscodeOTPNotGiven:
                case EstsError.PublicIdentifierSasEndCallNonRetriableError:
                case EstsError.PublicIdentifierSasEndCallRetriableError:
                    errorText = _strings["CT_OTC_STR_Error_CodeIncorrect"];
                    break;
                case EstsError.FlowTokenExpired:
                    errorText = _strings["CT_PWD_STR_Error_FlowTokenExpired"];
                    break;
                case EstsError.IdsLocked:
                    errorText = _strings["CT_PWD_STR_SSSU_Error_AccountLocked"] || _strings["CT_PWD_STR_Error_IdsLocked"];
                    break;
                case EstsError.UserDisabled:
                case EstsError.GuestUserDisabled:
                    errorText = _strings["CT_PWD_STR_Error_UserDisabled"];
                    break;
                case EstsError.MissingCustomSigningKey:
                    errorText = _strings["CT_PWD_STR_Error_MissingCustomSigningKey"];
                    break;
                case EstsError.BlockedAdalVersion:
                    errorText = _strings["CT_PWD_STR_Error_BlockedAdalVersion"];
                    break;
                case EstsError.BlockedClientId:
                    errorText = _strings["CT_PWD_STR_Error_BlockedClientId"];
                    break;
                case EstsError.UserAccountSelectionInvalid:
                    errorText = _strings["CT_PWD_STR_Error_SelectedAccountInvalid"];
                    break;
                case EstsError.IdpLoopDetected:
                    errorText = _strings["CT_PWD_STR_Error_IdpLoopDetected"];
                    break;
                case EstsError.InvalidPasswordLastPasswordUsed:
                    errorText = _strings["CT_PWD_STR_Error_LastPasswordUsed"];
                    break;
                case EstsError.PhoneSignInBlockedByUserCredentialPolicy:
                    errorText = _strings["STR_UserCredentialPolicy_Blocked"];
                    remediationText = _strings["STR_UserCredentialPolicy_Blocked_PhoneSignIn_Remediation"];
                    break;
                case EstsError.PublicIdentifierAuthUserNotAllowedByPolicy:
                    errorText = _strings["STR_UserCredentialPolicy_Blocked"];
                    break;
                case EstsError.FidoBlockedByPolicy:
                    errorText = _strings["STR_UserCredentialPolicy_Blocked"];
                    remediationText = _strings["STR_UserCredentialPolicy_Blocked_Fido_Remediation"];
                    break;
                case EstsError.UserAccountNotFoundForFidoSignIn:
                    errorText = _strings["CT_FIDO_STR_Error_NotFound"];
                    break;
                case EstsError.AccessPassBlockedByPolicy:
                    errorText = _strings["CT_PWD_STR_Error_AccessPassBlocked"];
                    break;
                case EstsError.InvalidAccessPass:
                    errorText = _strings["CT_PWD_STR_Error_IncorrectAccessPass"];
                    break;
                case EstsError.AccessPassExpired:
                    errorText = _strings["CT_PWD_STR_Error_AccessPassExpired"];
                    break;
                case EstsError.AccessPassAlreadyUsed:
                    errorText = _strings["CT_PWD_STR_Error_AccessPassAlreadyUsed"];
                    break;
                case EstsError.CertificateValidationBlockedByPolicy:
                    errorText = _strings["STR_CertBaseAuthPolicy_Block"];
                    break;
                case EstsError.InvalidCredentialDueToMfaClassification:
                case EstsError.ProofupBlockedDueToMfaClassification:
                    errorText = _strings["STR_InvalidCredentialDueToMfaClassification"];
                    break;
                default:
                    errorText = null;
            }
        }
        else if (_getCredTypeResultFromServer)
        {
            
            var gctResult = _gctRequestHelper.getResult(_this.initialSharedData.otherIdpRedirectUrl, _this.initialSharedData.displayName, _getCredTypeResultFromServer, false );

            if (gctResult.action === GctResultAction.ShowError)
            {
                errorText = gctResult.error;
            }
        }

        if (errorText)
        {
            return new ErrorData(errorText, remediationText);
        }

        return null;
    };
    

    
    _this.fetchSessions_onUpdateUserTiles = function (newSessions, tilesStateQuery)
    {
        setTimeout(function ()
        {
            
            
            _updateUserTiles(newSessions, tilesStateQuery);
        });
    };

    _this.fetchSessions_onIncrementAsyncTileRequestCount = function ()
    {
        _this.asyncTileRequestCount++;
    };

    _this.fetchSessions_onDecrementAsyncTileRequestCount = function ()
    {
        _this.asyncTileRequestCount--;
    };

    _this.fetchSessions_onExecuteGctResult = function ()
    {
        PromiseHelpers.throwUnhandledExceptionOnRejection(
            Promise.all(_initializationPromises).then(
                function ()
                {
                    var gctResult = _gctRequestHelper.getResult(_this.initialSharedData.otherIdpRedirectUrl, BrowserHelper.htmlUnescape(_prefillUsername), _getCredTypeResultFromServer, _this.isFidoSupported());

                    switch (gctResult.action)
                    {
                        case GctResultAction.ShowError:
                            _this.paginationControlMethods().view_onSwitchView(PaginatedState.Username, true);
                            break;

                        case GctResultAction.SwitchView:
                            _this.paginationControlMethods().view_onSwitchView(gctResult.viewId, true);
                            break;

                        case GctResultAction.Redirect:
                            _this.view_onRedirect(
                                {
                                    url: gctResult.redirectUrl,
                                    eventOptions:
                                        {
                                            eventId: gctResult.eventId
                                        }
                                });
                            break;
                    }
                }));
    };

    _this.paginationControl_onCancel = function ()
    {
        if (_allowCancel && _cancelUrl)
        {
            var url = _cancelUrl;

            
            if (_signInUsername)
            {
                if (_cancelPostParams)
                {
                    _cancelPostParams.username = _signInUsername;
                }
                else
                {
                    url = QueryString.appendOrReplace(url, "username", _signInUsername);
                }
            }

            _this.view_onRedirect(url, _cancelPostParams);
        }
        else if (_backUrl)
        {
            _this.view_onSetPendingRequest(true);
            _navigateToUrl(_backUrl, true );
        }
        else if (Host && Host.handleOnFinalBack)
        {
            Host.handleOnFinalBack(_serverData);
        }
    };

    _this.view_onSubmitReady = function (useViewProgress)
    {
        var viewId = _this.paginationControlMethods().getCurrentViewId();
        var sharedData = _this.paginationControlMethods().getSharedData();

        _this.postedLoginStateViewRNGCDefaultType(sharedData.remoteNgcParams.defaultType);
        _this.postedLoginStateViewRNGCEntropy(sharedData.remoteNgcParams.entropy);
        _this.postedLoginStateViewRNGCSLK(sharedData.remoteNgcParams.sessionIdentifier);
        _this.isSignupPost(sharedData.isSignupPost);
        _this.isRecoveryAttemptPost(sharedData.isRecoveryAttemptPost);

        
        if (viewId === PaginatedState.Hip)
        {
            viewId = PaginatedState.Password;
        }

        _this.postedLoginStateViewId(viewId);

        if (!_flowTokenOverride() && sharedData.flowToken)
        {
            
            _flowTokenOverride(sharedData.flowToken);
        }

        var userTrackerDestroy = (w.UserTracker || {}).destroy;
        if (userTrackerDestroy)
        {
            try
            {
                userTrackerDestroy();
            }
            catch (e) { }
        }

        _updateWLPerfCookie(_prefixCookieDomainEnabled);
        _this.instrumentationMethods().recordSubmit();
        _this.pageSubmitted(true);
        _this.forceSubmit(true);
        _this.isRequestPending(true);
        _this.showLightboxProgress(!useViewProgress);
    };

    _this.view_onRedirect = function (redirectData, postParams, isIdpRedirect, useViewProgress)
    {
        var parameters = { postParams: postParams, isIdpRedirect: isIdpRedirect, useViewProgress: useViewProgress };
        var url = ClientTracingHelper.logRedirection(redirectData, parameters);
        if (isIdpRedirect && _flowTokenCookieName && _this.flowToken())
        {
            
            
            Cookies.write(_flowTokenCookieName, _this.flowToken(), !_isCloudBuild);
        }

        if (postParams)
        {
            _this.postRedirect({ url: url, postParams: postParams });
        }
        else
        {
            _navigateToUrl(url);
        }

        _this.isRequestPending(true);
        _this.showLightboxProgress(!useViewProgress);
    };

    _this.view_onLoadView = function (viewId)
    {
        var loadViewPromise = _createLoadViewPromise(viewId);

        if (!loadViewPromise)
        {
            return null;
        }

        _this.view_onSetPendingRequest(true);

        return loadViewPromise.then(function ()
        {
            _this.view_onSetPendingRequest(false);
        });
    };

    _this.view_onShow = function (viewMetadata, viewId)
    {
        if (!_livePreviewAllowedOrigins)
        {
            var tenantBranding = viewMetadata.dynamicBranding
                ? _this.paginationControlMethods().getSharedDataItem("userTenantBranding")
                : BrandingHelpers.loadTenantBranding(_staticTenantBranding);

            _setTenantBranding(tenantBranding);
        }

        if (viewId !== PaginatedState.Username)
        {
            
            _this.newSession(null);
        }

        if (_unseenSessions.length > 0)
        {
            if (viewId === PaginatedState.Username
                || viewId === PaginatedState.Tiles)
            {
                if (viewId === PaginatedState.Username)
                {
                    
                    
                    _this.newSession(_unseenSessions[0]);
                }

                
                
                _unseenSessions = [];
            }
        }
    };

    _this.view_onRestoreIsRecoveryAttemptPost = function ()
    {
        _this.paginationControlMethods().setSharedDataItem("isRecoveryAttemptPost", false);
    };

    _this.view_onUpdateFlowToken = function (flowToken)
    {
        _flowTokenOverride(flowToken);
        _this.paginationControlMethods().setSharedDataItem("flowToken", flowToken);
    };

    _this.view_onUpdateAvailableCreds = function (availableCreds)
    {
        _this.availableCredsWithoutUsername(availableCreds);

        if (availableCreds.length === 1)
        {
            _credShownOnlyOnPicker(!!availableCreds[0].shownOnlyOnPicker);
        }
    };

    _this.view_onUpdateRemoteNgcParams = function (sessionIdentifier, entropy, defaultType)
    {
        var remoteNgcParams = _this.paginationControlMethods().getSharedDataItem("remoteNgcParams");
        remoteNgcParams.sessionIdentifier = sessionIdentifier;
        remoteNgcParams.entropy = entropy;
        remoteNgcParams.defaultType = defaultType;
    };

    _this.view_onSetLightBoxFadeIn = function (fadeIn)
    {
        _this.fadeInLightBox(fadeIn);
    };

    _this.view_onSetPendingRequest = function (pending)
    {
        _this.isRequestPending(pending);
        _this.showLightboxProgress(pending);
    };

    _this.footer_agreementClick = function (agreementType)
    {
        _this.agreementType = agreementType;

        _this.paginationControlMethods().view_onSwitchView(PaginatedState.ViewAgreement);
    };

    _this.closeDebugDetails_onClick = function ()
    {
        _setDebugDetailsState(false);

        if (_this.footerMethods())
        {
            _this.footerMethods().setDebugDetailsState(false);
        }
    };

    _this.toggleDebugDetails_onClick = function ()
    {
        var toggledDebugDetailsState = !_this.showDebugDetails();

        _setDebugDetailsState(toggledDebugDetailsState, true);
    };

    _this.setDebugTracing_onClick = function ()
    {
        _this.isDebugTracingEnabled = !_this.isDebugTracingEnabled;
    };

    _this.learnMore_onShow = function ()
    {
        _this.ariaHidden(true);
        _this.wasLearnMoreShown(true);
        _this.learnMoreMethods().open();
    };

    _this.learnMore_onHide = function ()
    {
        _this.ariaHidden(false);
        _this.paginationControlMethods().setDefaultFocus();
    };

    _this.passwordView_onResetPassword = function (displayName)
    {
        _navigateToUrl(_updateMembernamePrefill(
            _resetPasswordUrl,
            _resetPasswordUsernamePrefillParam,
            displayName));

        _this.view_onSetPendingRequest(true);
    };

    _this.newSession_onClick = function ()
    {
        var session = _this.newSession();

        if (session.isOtherIdp)
        {
            var unsafe_username = StringHelpers.trim(session.displayName);
            var otherIdpRedirectUrl = QueryString.appendOrReplace(_this.initialSharedData.otherIdpRedirectUrl, "username", encodeURIComponent(unsafe_username));
            var otherIdpRedirectPostParams = _otherIdpRedirectPostParams ? ObjectHelpers.clone(_otherIdpRedirectPostParams) : null;

            if (otherIdpRedirectPostParams)
            {
                otherIdpRedirectPostParams.username = unsafe_username;
            }

            _this.view_onRedirect(otherIdpRedirectUrl, otherIdpRedirectPostParams, true);
        }
        else if (session.isWindowsSso)
        {
            var browserSsoHelper = new BrowserSso(_serverData);

            PromiseHelpers.throwUnhandledExceptionOnRejection(
                browserSsoHelper.loginWindowsUserAsync(session.ssoLink)
                    .then(null,
                        function ()
                        {
                            
                            return null;
                        })
                    .then(
                        function (redirectUrl)
                        {
                            if (redirectUrl)
                            {
                                _this.view_onRedirect(redirectUrl);
                            }
                        }));
        }
    };

    _this.newSessionClose_onClick = function ()
    {
        _this.newSession(null);
    };

    _this.otherSigninOptionsButton_onClick = function (fedCredButton)
    {
        if (fedCredButton.testId === c_signinOptions)
        {
            _this.paginationControlMethods().setSharedDataItem("availableCreds", _this.availableCredsWithoutUsername());

            if (_enableUserStateFix)
            {
                
                _this.paginationControlMethods().setSharedDataItem("useCredWithoutUsername", true);
            }

            _this.paginationControlMethods().view_onSwitchView(PaginatedState.CredentialPicker);
        }
        else
        {
            _this.view_onRedirect(fedCredButton.signInUrl);
        }
    };

    _this.paginationControl_onAnimationStateChange = function (animationState, animateBack, hasPreviousView)
    {
        var viewHasOtherSigninOptionButtons = _currentViewHasOtherSigninOptionButtons();

        switch (animationState)
        {
            case AnimationState.Begin:
                if (viewHasOtherSigninOptionButtons && hasPreviousView)
                {
                    _this.animate(animateBack ? AnimationName.SlideOutBack : AnimationName.SlideOutNext);
                }

                break;

            case AnimationState.RenderNewView:
                _showFedCredButtons(false);
                break;

            case AnimationState.AnimateNewView:
                if (viewHasOtherSigninOptionButtons)
                {
                    _showFedCredButtons(true);
                    _this.animate(animateBack ? AnimationName.SlideInBack : AnimationName.SlideInNext);
                }

                break;

            case AnimationState.End:
                _showFedCredButtons(viewHasOtherSigninOptionButtons);
                _this.animate(AnimationName.None);
                break;
        }
    };

    _this.view_onRegisterDialog = function (dialogId, dialogInfo)
    {
        _dialogs[dialogId] = { templateNodes: dialogInfo.templateNodes, data: dialogInfo.data };
    };

    _this.view_onUnregisterDialog = function (dialogId)
    {
        delete _dialogs[dialogId];
    };

    _this.view_onShowDialog = function (dialogId)
    {
        _this.activeDialog(_dialogs[dialogId]);

        
        
        
        setTimeout(
            function ()
            {
                _this.activeDialog(_dialogs[dialogId]);
            }, 0);

        var showDialogPromise = new Promise(
            function (resolve)
            {
                _showDialogPromiseHandlers = { resolve: resolve };
            });

        return showDialogPromise;
    };

    _this.dialog_onClose = function ()
    {
        _this.activeDialog(null);

        _this.paginationControlMethods()
            .getCurrentView()
            .viewInterface
            .setDefaultFocus();

        if (_showDialogPromiseHandlers)
        {
            _showDialogPromiseHandlers.resolve();
        }
    };
    

    
    _this.dispose = function ()
    {
        
        if (HostExtensions && HostExtensions.removeEventListener && _allowAutopilotProvisioningNavigation)
        {
            HostExtensions.removeEventListener();
        }
    };

    function _createLoadViewPromise(viewId)
    {
        if (__IS_OLD_WEBPACK__)
        {
            return null;
        }

        var lazyViewIds = [PaginatedState.Password, PaginatedState.ProofConfirmation, PaginatedState.OneTimeCode, PaginatedState.OneTimeCodeRecovery, PaginatedState.ConfirmSignup,
            PaginatedState.ConfirmRecoverUsername, PaginatedState.LearnMore, PaginatedState.ResetPasswordSplitter, PaginatedState.RemoteNGC,
            PaginatedState.PhoneDisambiguation, PaginatedState.IdpDisambiguation, PaginatedState.IdpRedirect, PaginatedState.IdpRedirectSpeedbump,
            PaginatedState.ViewAgreement, PaginatedState.ConfirmSend, PaginatedState.CredentialPicker, PaginatedState.Fido,
            PaginatedState.FedConflict, PaginatedState.ProofFedConflict, PaginatedState.AadFedConflict, PaginatedState.FedLink,
            PaginatedState.RemoteConnectCanaryValidation, PaginatedState.FetchSessionsProgress, PaginatedState.Tiles, PaginatedState.LwaConsent,
            PaginatedState.Hip, PaginatedState.RemoteLoginPolling, PaginatedState.TenantDisambiguation, PaginatedState.SearchOrganization,
            PaginatedState.AccessPass, PaginatedState.SignupUsername, PaginatedState.SignupCredentialPicker, PaginatedState.LearnMoreOfflineAccount,
            PaginatedState.RemoteConnectLocation, PaginatedState.WebNativeBridge];

        var matchedLazyViewId = ko.utils.arrayFirst(
            lazyViewIds,
            function (id)
            {
                return viewId === id;
            }
        );

        if (!matchedLazyViewId)
        {
            return null;
        }

        return new Promise(function (resolve)
        {
            switch (viewId)
            {
                case PaginatedState.Password:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginPaginatedPasswordViewModel");
                            resolve();
                        }, "Password");
                    break;

                case PaginatedState.ProofConfirmation:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginProofConfirmationViewModel");
                            resolve();
                        }, "ProofConfirmation");
                    break;

                case PaginatedState.OneTimeCode:
                case PaginatedState.OneTimeCodeRecovery:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginPaginatedOtcViewModel");
                            resolve();
                        }, "OneTimeCode");
                    break;

                case PaginatedState.ConfirmSignup:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginConfirmSignupViewModel");
                            resolve();
                        }, "ConfirmSignup");
                    break;

                case PaginatedState.ConfirmRecoverUsername:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginConfirmRecoverUsernameViewModel");
                            resolve();
                        }, "ConfirmRecoveryUsername");
                    break;

                case PaginatedState.LearnMore:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginLearnMoreViewModel");
                            resolve();
                        }, "LearnMore");
                    break;

                case PaginatedState.ResetPasswordSplitter:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginResetPasswordSplitterViewModel");
                            resolve();
                        }, "ResetPasswordSplitter");
                    break;

                case PaginatedState.RemoteNGC:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginRemoteNgcViewModel");
                            resolve();
                        }, "RemoteNgc");
                    break;

                case PaginatedState.PhoneDisambiguation:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginPhoneDisambiguationViewModel");
                            resolve();
                        }, "PhoneDisambiguation");
                    break;

                case PaginatedState.IdpDisambiguation:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginIdpDisambiguationViewModel");
                            resolve();
                        }, "IdpDisambiguation");
                    break;

                case PaginatedState.IdpRedirect:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginIdpRedirectViewModel");
                            resolve();
                        }, "IdpRedirect");
                    break;

                case PaginatedState.IdpRedirectSpeedbump:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginIdpRedirectSpeedbumpViewModel");
                            resolve();
                        }, "IdpRedirectSpeedbump");
                    break;

                case PaginatedState.ViewAgreement:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginViewAgreementViewModel");
                            resolve();
                        }, "ViewAgreement");
                    break;

                case PaginatedState.ConfirmSend:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginConfirmSendViewModel");
                            resolve();
                        }, "ConfirmSend");
                    break;

                case PaginatedState.CredentialPicker:
                case PaginatedState.SignupCredentialPicker:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginCredentialPickerViewModel");
                            resolve();
                        }, "CredentialPicker");
                    break;

                case PaginatedState.Fido:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginFidoViewModel");
                            resolve();
                        }, "Fido");
                    break;

                case PaginatedState.FedConflict:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginFedConflictViewModel");
                            resolve();
                        }, "FedConflict");
                    break;

                case PaginatedState.ProofFedConflict:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginProofFedConflictViewModel");
                            resolve();
                        }, "ProofFedConflict");
                    break;

                case PaginatedState.AadFedConflict:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginAadFedConflictViewModel");
                            resolve();
                        }, "AadFedConflict");
                    break;

                case PaginatedState.FedLink:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginFedLinkViewModel");
                            resolve();
                        }, "FedLink");
                    break;

                case PaginatedState.RemoteConnectCanaryValidation:
                    require.ensure([],
                        function ()
                        {
                            require("./RemoteConnectCanaryValidationViewModel");
                            resolve();
                        }, "RemoteConnectCanaryValidation");
                    break;

                case PaginatedState.RemoteConnectLocation:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginRemoteConnectLocationViewModel");
                            resolve();
                        }, "RemoteConnectLocation");
                    break;

                case PaginatedState.FetchSessionsProgress:
                    require.ensure([],
                        function ()
                        {
                            require("./FetchSessionsProgressViewModel");
                            resolve();
                        }, "FetchSessionsProgress");
                    break;

                case PaginatedState.Tiles:
                    require.ensure([],
                        function ()
                        {
                            require("../Core/TilesViewModel");
                            resolve();
                        }, "Tiles");
                    break;

                case PaginatedState.LwaConsent:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginPaginatedLwaConsentViewModel");
                            resolve();
                        }, "Alt");
                    break;

                case PaginatedState.Hip:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginPaginatedHipViewModel");
                            resolve();
                        }, "Alt");
                    break;

                case PaginatedState.RemoteLoginPolling:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginRemoteLoginPollingViewModel");
                            resolve();
                        }, "ESTSLogin_RemoteLoginPoll");
                    break;

                case PaginatedState.TenantDisambiguation:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginTenantDisambiguationViewModel");
                            resolve();
                        }, "ESTSLogin_TenantDisambiguation");
                    break;

                case PaginatedState.AccessPass:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginAccessPassViewModel");
                            resolve();
                        }, "ESTSLogin_AccessPass");
                    break;

                case PaginatedState.SignupUsername:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginSignupUsernameViewModel");
                            resolve();
                        }, "ESTSLogin_SignupUsername");
                    break;

                case PaginatedState.SearchOrganization:
                    require.ensure([],
                        function ()
                        {
                            require("./SearchOrganizationViewModel");
                            resolve();
                        }, "ESTSLogin_SearchOrganization");
                    break;

                case PaginatedState.LearnMoreOfflineAccount:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginViewLearnMoreOfflineAccountViewModel");
                            resolve();
                        }, "LearnMoreOfflineAccount");
                    break;

                case PaginatedState.WebNativeBridge:
                    require.ensure([],
                        function ()
                        {
                            require("./LoginWebNativeBridgeViewModel");
                            resolve();
                        }, "WebNativeBridge");
                    break;
            }
        });
    }

    function _updateUserTiles(newSessions, tilesStateQuery)
    {
        var paginationControlMethods = _this.paginationControlMethods();
        var currentView = paginationControlMethods.getCurrentView();

        var otherIdpRedirectUrl = paginationControlMethods.getSharedDataItem("otherIdpRedirectUrl");
        otherIdpRedirectUrl = QueryString.add(otherIdpRedirectUrl, tilesStateQuery);
        paginationControlMethods.setSharedDataItem("otherIdpRedirectUrl", otherIdpRedirectUrl);

        
        
        _unseenSessions = _unseenSessions.concat(TileHelpers.mergeSessions(paginationControlMethods.getSharedDataItem("sessions"), newSessions));

        if (!currentView)
        {
            return;
        }

        
        if (_this.asyncTileRequestCount <= 0)
        {
            if (currentView.viewId === PaginatedState.Tiles)
            {
                
                currentView.viewInterface.addNewSessions(_unseenSessions);
                _unseenSessions = [];
            }
            else if (currentView.viewId === PaginatedState.Username)
            {
                
                
                if (!_this.newSession() && _unseenSessions.length > 0)
                {
                    _this.newSession(_unseenSessions[0]);
                }

                _unseenSessions = [];
            }
        }
    }

    function _setDebugDetailsState(state, activateDebugDetailsFocus)
    {
        if (__IS_OLD_WEBPACK__)
        {
            _this.showDebugDetails(state);

            if (state && activateDebugDetailsFocus)
            {
                _activateDebugDetailsFocus();
            }
        }
        else
        {
            if (state)
            {
                require.ensure([],
                    function ()
                    {
                        require("js/Core/DebugDetailsControlViewModel");
                        _this.showDebugDetails(true);

                        if (activateDebugDetailsFocus)
                        {
                            _activateDebugDetailsFocus();
                        }
                    },
                    "DebugDetails");
            }
            else
            {
                _this.showDebugDetails(false);
            }
        }

        if (!state && _this.footerMethods())
        {
            _this.footerMethods().focusMoreInfoLink();
        }
    }

    function _activateDebugDetailsFocus()
    {
        if (_this.debugDetailsMethods())
        {
            _this.debugDetailsMethods().activateFocus();
        }
    }

    function _handleCanaryValidationFailure(error)
    {
        if (!error || !error.confirmationViewId)
        {
            throw "No view ID was specified to handle the canary validation failure.";
        }

        _canaryValidationViewId = error.confirmationViewId;
        _this.postCanaryValidationAction = error.postConfirmationAction;
    }

    function _handleCanaryValidationSuccess(result)
    {
        _this.postCanaryValidationAction = result;
    }

    function _updateMembernamePrefill(rootUrl, queryParameter, currentUsername)
    {
        if (currentUsername)
        {
            return QueryString.appendOrReplace(rootUrl, queryParameter, encodeURIComponent(StringHelpers.trim(currentUsername)));
        }

        return rootUrl;
    }

    function _getPostUrl()
    {
        var url = _postUrl;

        
        if (_rawQueryString)
        {
            ko.utils.objectForEach(
                StringHelpers.doubleSplit(_rawQueryString, "&", "="),
                function (key, value)
                {
                    url = QueryString.addIfNotExist(url, key, value);
                });
        }

        return url;
    }

    function _updateWLPerfCookie(prefixCookieDomain)
    {
        
        
        try
        {
            var wlidperf = Cookies.getObject("wlidperf");
            wlidperf["FR"] = "L";
            wlidperf["ST"] = new Date().getTime();

            Cookies.write("wlidperf", wlidperf, true , true , true , prefixCookieDomain);
        }
        catch (exc)
        {
        }
    }

    function _extractFlowToken(html)
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

    function _currentViewUsesOtherSigninOptionButtons()
    {
        return _this.paginationControlMethods()
            && _this.paginationControlMethods().currentViewHasMetadata("showFedCredButton")
            && !_isRestrictedWsi;
    }

    function _currentViewHasOtherSigninOptionButtons()
    {
        return _currentViewUsesOtherSigninOptionButtons() && (_this.otherSigninOptions() && _this.otherSigninOptions().length > 0);
    }

    function _setInitialSharedData(username, isFidoSupported)
    {
        var dynamicTenantBranding = BrandingHelpers.loadTenantBranding(_getCredTypeResultFromServer
            && _getCredTypeResultFromServer.EstsProperties
            && _getCredTypeResultFromServer.EstsProperties.UserTenantBranding);
        var staticTenantBranding = BrandingHelpers.loadTenantBranding(_staticTenantBranding);
        var mergedBranding = BrandingHelpers.getMergedBranding(staticTenantBranding, dynamicTenantBranding, _isGlobalTenant);

        _this.initialSharedData =
            {
                username: StringHelpers.cleanseUsername(username),
                displayName: username,
                remoteNgcParams:
                {
                    sessionIdentifier: _postedSessionIdentifier,
                    entropy: _postedEntropy,
                    defaultType: _postedRngcDefaultType
                },
                otcParams: {},
                fidoParams:
                {
                    allowList: _fidoAllowList
                },
                hipRequiredForUsername: _hipScriptUrl ? StringHelpers.cleanseUsername(username) : "",
                sessions: _sessions || [],
                
                flowToken: _extractFlowToken(_serverData.sFT) || _serverData.sFT || _extractFlowToken(_flowTokenTag),
                userTenantBranding: mergedBranding || {},
                callMetadata: {},
                availableCreds: [],
                evictedCreds: [],
                otcCredential: {},
                showCredViewBrandingDesc: !!(_appCobranding && _appCobranding.showDescOnCredViews),
                
                
                unsafe_desktopSsoDomainToUse: _desktopSsoConfig && _desktopSsoConfig.startDesktopSsoOnPageLoad ? _desktopSsoConfig.hintedDomainName : null,
                isSignupPost: _postedIsSignupPost,
                otherIdpRedirectUrl: _otherIdpRedirectUrl,
                recoveryCredentialsData: {}
            };

        
        if (_getCredTypeResultFromServer)
        {
            
            
            var paginatedState = parseInt(_postedPaginatedState) || PaginatedState.Unknown;

            if (paginatedState === PaginatedState.OneTimeCode)
            {
                if (_getCredTypeResultFromServer.Credentials
                    && _getCredTypeResultFromServer.Credentials.PrefCredential !== CredentialType.PublicIdentifierCode
                    && _getCredTypeResultFromServer.Credentials.PrefCredential !== CredentialType.NoPreferredCredential)
                {
                    _getCredTypeResultFromServer.Credentials.PrefCredential = CredentialType.OneTimeCode;
                }

                if (_proofConfirmation)
                {
                    _this.initialSharedData.proofConfirmation = _proofConfirmation;
                }
            }

            var gctSharedData = _gctRequestHelper.getGctSharedData(_getCredTypeResultFromServer, isFidoSupported, false);

            _this.initialSharedData.preferredCredential = gctSharedData.preferredCredential;
            _this.initialSharedData.availableCreds = gctSharedData.availableCreds || [];
            _this.initialSharedData.evictedCreds = gctSharedData.evictedCreds || [];
            _this.initialSharedData.otcCredential = gctSharedData.otcCredential;
            _this.initialSharedData.otcParams = gctSharedData.otcParams;
            _this.initialSharedData.idpRedirectUrl = gctSharedData.fedRedirectParams.idpRedirectUrl;
            _this.initialSharedData.idpRedirectPostParams = gctSharedData.fedRedirectParams.idpRedirectPostParams;
            _this.initialSharedData.idpRedirectProvider = gctSharedData.fedRedirectParams.idpRedirectProvider;
            _this.initialSharedData.supportsNativeCredentialRecovery = gctSharedData.supportsNativeCredentialRecovery;
        }

        
        
        
        if (_loginMode === LoginMode.Signup
            || (_showSignup
                && !_signupUrl))
        {
            _this.initialSharedData.availableSignupCreds = _getAvailableSignupCreds();
        }
    }

    function _setInitialView(unsafe_username, isFidoSupported)
    {
        var forceSigninLoginModes = [LoginMode.ForceSignin, LoginMode.ForceSigninMobile, LoginMode.ForceSigninHost];
        var isForceSignin = ko.utils.arrayIndexOf(forceSigninLoginModes, _loginMode) !== -1 || _isForceSigninPost;
        var initialViewId = !isForceSignin && _sessions && _sessions.length ? PaginatedState.Tiles : PaginatedState.Username;
        var currentViewId = initialViewId;

        switch (_loginMode)
        {
            case LoginMode.LWAConsent:
                initialViewId = currentViewId = PaginatedState.LwaConsent;
                break;

            case LoginMode.Tiles:
                initialViewId = currentViewId = PaginatedState.Tiles;
                break;

            case LoginMode.FedConflict:
                initialViewId = currentViewId = PaginatedState.FedConflict;
                break;

            case LoginMode.ProofFedConflict:
                initialViewId = currentViewId = PaginatedState.ProofFedConflict;
                break;

            case LoginMode.AadFedConflict:
                initialViewId = currentViewId = PaginatedState.AadFedConflict;
                break;

            case LoginMode.FedLink:
                initialViewId = currentViewId = PaginatedState.FedLink;
                break;

            case LoginMode.Win10Host_HIP_Login:
            case LoginMode.Win10Host_HIP_Login_PhoneSignIn:
                initialViewId = currentViewId = PaginatedState.Password;
                break;

            case LoginMode.Fido:
                initialViewId = currentViewId = PaginatedState.Fido;
                break;

            case LoginMode.UserCredentialPolicyBlocked:
            case LoginMode.CredentialPicker:
                initialViewId = currentViewId = PaginatedState.CredentialPicker;
                break;

            case LoginMode.FedBoundLink:
                currentViewId = PaginatedState.FedLink;
                break;

            case LoginMode.Signup:
                currentViewId = _this.initialSharedData.availableSignupCreds.length > 0
                    ? PaginatedState.SignupCredentialPicker
                    : PaginatedState.SignupUsername;
                break;

            default:
                
                var paginatedState = parseInt(_postedPaginatedState) || PaginatedState.Unknown;

                if (paginatedState !== PaginatedState.Unknown
                    && paginatedState !== PaginatedState.FetchSessionsProgress)
                {
                    currentViewId = paginatedState;
                }
                else if (_getCredTypeResultFromServer)
                {
                    var gctResult = _gctRequestHelper.getResult(_this.initialSharedData.otherIdpRedirectUrl, unsafe_username, _getCredTypeResultFromServer, isFidoSupported);

                    switch (gctResult.action)
                    {
                        case GctResultAction.ShowError:
                            if (_loginMode === LoginMode.FetchSessionsProgress)
                            {
                                currentViewId = PaginatedState.FetchSessionsProgress;
                            }
                            else
                            {
                                
                                currentViewId = initialViewId;
                            }

                            break;

                        case GctResultAction.SwitchView:
                            ko.utils.extend(_this.initialSharedData, ko.utils.extend(gctResult.sharedData, gctResult.viewParams || {}));

                            if (_loginMode === LoginMode.FetchSessionsProgress)
                            {
                                currentViewId = PaginatedState.FetchSessionsProgress;
                            }
                            else
                            {
                                currentViewId = gctResult.viewId;
                            }

                            break;

                        case GctResultAction.Redirect:
                            if (_loginMode !== LoginMode.FetchSessionsProgress || !_showTilesAfterSessionPull)
                            {
                                _this.view_onRedirect(
                                    {
                                        url: gctResult.redirectUrl,
                                        eventOptions:
                                            {
                                                eventId: gctResult.eventId
                                            }
                                    },
                                    gctResult.redirectPostParams,
                                    gctResult.isIdpRedirect);
                                break;
                            }
                    }
                }
                else if (_loginMode === LoginMode.FetchSessionsProgress)
                {
                    currentViewId = PaginatedState.FetchSessionsProgress;
                }
                else if (_postedUsername && _this.getServerError())
                {
                    
                    currentViewId = PaginatedState.Username;
                }

                
                
                
                
                if (_prefillUsername || isForceSignin || _lockUsername || _ztdUpnHint)
                {
                    initialViewId = currentViewId;
                }
                break;
        }

        if (_showRemoteConnectLocationPage)
        {
            initialViewId = currentViewId = PaginatedState.RemoteConnectLocation;
        }

        _this.initialViewId = initialViewId;
        _this.currentViewId = currentViewId;
    }

    function _initializeWithFidoSupportedResult(isFidoSupported, unsafe_username)
    {
        _this.isFidoSupported(isFidoSupported);
        _setInitialSharedData(unsafe_username, isFidoSupported);
        _setInitialView(unsafe_username, isFidoSupported);

        if (Host && Host.logEvent)
        {
            Host.logEvent("Identity.Fido.Supported", isFidoSupported);

            if (isFidoSupported)
            {
                _logPlatformAuthenticatorAvailable();
            }
        }
    }

    function _logPlatformAuthenticatorAvailable()
    {
        PromiseHelpers.throwUnhandledExceptionOnRejection(
            Fido.isPlatformAuthenticatorAvailable()
                .then(null, function () { return false; })
                .then(
                    function (isPlatformAuthenticatorAvailable)
                    {
                        Host.logEvent("Identity.Fido.PlatformAuthenticatorAvailable", isPlatformAuthenticatorAvailable);
                    }));
    }

    function _getFedProviderIconImageName(providerName, useLight)
    {
        return StringHelpers.format(
            "./signin-{0}{1}.{2}",
            providerName,
            useLight ? "-white" : "",
            _isSvgImageSupported ? "svg" : "png");
    }

    function _createFedCredButton(fedCredButtonCredType)
    {
        var fedCredButton = {};
        var text = null;
        var signInUrl = null;
        var lightIconUrl = null;
        var darkIconUrl = null;

        switch (fedCredButtonCredType)
        {
            case CredentialType.LinkedIn:
                text = _strings["CT_PWD_STR_UseLinkedIn_Link"];
                signInUrl = _linkedInFedUrl;
                lightIconUrl = requireFedIcon(_getFedProviderIconImageName("linkedin", true));
                darkIconUrl = requireFedIcon(_getFedProviderIconImageName("linkedin", false));
                break;

            case CredentialType.GitHub:
                text = _strings["CT_PWD_STR_UseGitHub_Link"];
                signInUrl = _gitHubFedUrl;
                lightIconUrl = requireFedIcon(_getFedProviderIconImageName("github", true));
                darkIconUrl = requireFedIcon(_getFedProviderIconImageName("github", false));
                break;
        }

        fedCredButton =
            {
                text: text,
                signInUrl: signInUrl,
                lightIconUrl: lightIconUrl,
                darkIconUrl: darkIconUrl,
                credType: fedCredButtonCredType,
                testId: c_fedCredButtonIdPrefix + fedCredButtonCredType
            };

        return fedCredButton;
    }

    function _createSigninOptionsButton()
    {
        return {
            text: _strings["CT_PWD_STR_SwitchToCredPicker_Link_NoUser"],
            lightIconUrl: requireFedIcon(_getFedProviderIconImageName("options", true)),
            darkIconUrl: requireFedIcon(_getFedProviderIconImageName("options", false)),
            testId: c_signinOptions
        };
    }

    function _getAvailableSignupCreds()
    {
        return [].concat(
            _otherIdpSignUpUrl
                ? { credType: CredentialType.OtherMicrosoftIdpFederation, redirectUrl: _otherIdpSignUpUrl } : [],
            _googleFedSignUpUrl
                ? { credType: CredentialType.Google, redirectUrl: _googleFedSignUpUrl } : [],
            _facebookFedSignUpUrl
                ? { credType: CredentialType.Facebook, redirectUrl: _facebookFedSignUpUrl } : []);
    }

    function _navigateToUrl(url, replaceHistory)
    {
        if (replaceHistory)
        {
            document.location.replace(url);
        }
        else
        {
            document.location.assign(url);
        }
    }

    function _setTenantBranding(tenantBranding)
    {
        BrandingHelpers.updateMergedBrandingObservables(_this, tenantBranding);
        BrandingHelpers.updateFavicon(tenantBranding, _defaultFaviconUrl);

        if (__CUSTOMIZATION_LOADER_ENABLED__)
        {
            BrandingHelpers.createCustomizationLoader(_serverData, tenantBranding);
        }

        var branding = BrandingHelpers.getPageBranding(tenantBranding, _appCobranding, _backgroundImage);
        if (_this.backgroundControlMethods())
        {
            _this.backgroundControlMethods().updateBranding(branding);
        }

        _this.bannerLogoUrl(branding.bannerLogoUrl);
        _this.backgroundLogoUrl(branding.backgroundLogoUrl);
        _this.useDefaultBackground(branding.useDefaultBackground);
        _this.loadBannerLogo(_this.paginationControlHelper.showLogo());
    }

    (function _initialize()
    {
        BrandingHelpers.createMergedBrandingObservables(_this);

        if (!__IS_MSA__ && _livePreviewAllowedOrigins)
        {
            _brandingLivePreview = BrandingLivePreviewFactory.getInstance(_livePreviewAllowedOrigins);
            _brandingLivePreview.addListener(_setTenantBranding);
        }

        _isSvgImageSupported = BrowserHelper.isSvgImgSupported();

        
        if (_detectBrowserCapabilities)
        {
            var browserCapabilitiesHelper = new BrowserCapabilitiesHelper();
            browserCapabilitiesHelper.writeCookie();
        }

        _gctRequestHelper = new GetCredentialTypeRequestHelper(
            _serverData,
            GctRequestHelperFlags.DisableDesktopSsoPreferredCred
                | GctRequestHelperFlags.DisableAutoSend
                | GctRequestHelperFlags.IsPostRequest);

        var prefillNames = _foundNames ? _foundNames.split(",") : [];
        var unsafe_username = BrowserHelper.htmlUnescape(
            _postedUsername
                || _signInUsername
                || _prefillUsername
                || _ztdUpnHint
                || "");

        prefillNames.sort();
        _this.prefillNames = _this.prefillNames.concat(ko.utils.arrayMap(prefillNames, BrowserHelper.htmlUnescape));
        _this.useCssAnimations = _enableCssAnimation && BrowserHelper.isCSSAnimationSupported();

        
        if (Host && Host.handleClearPassword)
        {
            Host.handleClearPassword();
        }

        _this.ctx(_originalRequest);
        _this.postUrl(_getPostUrl());

        var initializeWithFidoPromise = BrowserHelper.isFidoSupportedAsync(_isFidoSupportedHint)
            .then(
                function (isFidoSupported) { _initializeWithFidoSupportedResult(isFidoSupported, unsafe_username); },
                function () { _initializeWithFidoSupportedResult(false, unsafe_username); });

        _initializationPromises.push(initializeWithFidoPromise);

        _initializationPromises.push(ClientTracingHelper.createLoadClientTracingPromise());

        
        var canaryValidationHelper = new CanaryValidationHelper(serverData);

        if (_needsExternalCanaryValidation)
        {
            _this.view_onSetPendingRequest(true);
            var canaryValidationPromise = canaryValidationHelper.validateAsync()
                .then(_handleCanaryValidationSuccess, _handleCanaryValidationFailure);

            _initializationPromises.push(canaryValidationPromise);
        }

        if (!_isWriteWloptCookieDisallowed && _loginBody)
        {
            var credType = StringHelpers.format("[{0}]", _loginBody);
            var wlopt = Cookies.getObject("WLOpt");

            var act = wlopt["act"] || "";
            if (act.indexOf(credType) === -1)
            {
                act += credType;
            }

            wlopt["act"] = act;
            Cookies.write("WLOpt", wlopt, false, true);
        }

        var browserSsoHelper = new BrowserSso(_serverData);

        if (browserSsoHelper.isEnabled())
        {
            _this.asyncTileRequestCount++;

            PromiseHelpers.throwUnhandledExceptionOnRejection(
                browserSsoHelper.pullBrowserSsoCookieAsync()
                    .then(null,
                        function ()
                        {
                            
                            return null;
                        })
                    .then(
                        function (result)
                        {
                            _this.asyncTileRequestCount--;

                            result = result || {};

                            if (result.newSessions)
                            {
                                _updateUserTiles(TileHelpers.parseBssoSessions(result.newSessions));
                            }
                            else if (result.redirectUrl)
                            {
                                _navigateToUrl(result.redirectUrl, true );
                            }
                            else
                            {
                                
                                _updateUserTiles([]);
                            }
                        }));
        }

        if (Host && Host.initialize)
        {
            Host.initialize();
        }

        
        if (HostExtensions && HostExtensions.addEventListener && _allowAutopilotProvisioningNavigation)
        {
            HostExtensions.addEventListener();
        }

        PromiseHelpers.throwUnhandledExceptionOnRejection(
            Promise.all(_initializationPromises)
                .then(
                    function ()
                    {
                        if (_this.postCanaryValidationAction)
                        {
                            if (_this.postCanaryValidationAction.action === CanaryValidationSuccessAction.SwitchView)
                            {
                                
                                _this.postCanaryValidationAction.viewId = _this.currentViewId;
                            }

                            if (_canaryValidationViewId)
                            {
                                
                                
                                
                                _this.initialViewId = _this.currentViewId = _canaryValidationViewId;
                            }
                            else if (_this.postCanaryValidationAction.action === CanaryValidationSuccessAction.Redirect)
                            {
                                
                                _this.view_onRedirect(_this.postCanaryValidationAction.redirectUrl, _this.postCanaryValidationAction.redirectPostParams, _this.postCanaryValidationAction.isIdpRedirect);
                            }
                        }

                        _this.view_onSetPendingRequest(false);

                        
                        ClientTracingHelper.setPageViewModel(_this);
                        _this.asyncInitReady(true);
                    }));
    })();
    
};