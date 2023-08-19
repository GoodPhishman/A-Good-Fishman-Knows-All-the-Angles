var ko = require("knockout");
var Browser = require("../Core/BrowserControl");
var ComponentEvent = require("../Core/ComponentEvent");
var Constants = require("../Core/Constants");
var Fido = require("../Core/Fido");
var PromiseHelpers = require("../Core/PromiseHelpers");
var GetOneTimeCodeHelper = require("../Core/GetOneTimeCodeHelper");
var Otc = require("../Core/OtcRequestControl");
var Helpers = require("../Core/Helpers");

var w = window;
var StringHelpers = Helpers.String;
var PaginatedState = Constants.PaginatedState;
var CredentialType = Constants.CredentialType;
var DialogId = Constants.DialogId;

function CredSwitchLinkControl(params)
{
    var _this = this;

    
    var _serverData = params.serverData;
    var _username = params.username;
    var _availableCreds = params.availableCreds || [];
    var _currentCred = params.currentCred || {};
    var _flowToken = params.flowToken;
    var _showForgotUsername = params.showForgotUsername;
    var _hideCredSwitchLink = params.hideCredSwitchLink;
    

    
    var _strings = _serverData.str;
    var _forgotUsernameUrl = _serverData.urlForgotUsername;
    var _siteId = _serverData.sSiteId;
    var _clientId = _serverData.sClientId;
    var _forwardedClientId = _serverData.sForwardedClientId;
    var _noPaBubbleVersion = _serverData.sNoPaBubbleVersion;
    var _showSignInOptionsAsButton = _serverData.fShowSignInOptionsAsButton;
    var _isOfflineAccountVisible = _serverData.fOfflineAccountVisible;
    

    
    var _credViewMap = [];
    var _selectedCred = null;

    var _fidoLinkText = ko.observable();
    

    
    _this.onSwitchView = ComponentEvent.create();
    _this.onRedirect = ComponentEvent.create();
    _this.onRegisterDialog = ComponentEvent.create();
    _this.onUnregisterDialog = ComponentEvent.create();
    _this.onShowDialog = ComponentEvent.create();
    _this.onSetPendingRequest = ComponentEvent.create();
    _this.onUpdateFlowToken = ComponentEvent.create();
    

    
    _this.credentialCount = 0;
    _this.selectedCredType = null;
    _this.selectedCredShownOnlyOnPicker = false;
    _this.switchToCredId = null;
    _this.switchToCredText = null;
    _this.showSwitchToCredPickerLink = false;
    _this.showForgotUsername = _showForgotUsername;
    _this.isUserKnown = !!_currentCred.credType;
    _this.displayHelp = !_currentCred.credType;
    _this.hideCredSwitchLink = _hideCredSwitchLink;
    _this.isOfflineAccountVisible = _isOfflineAccountVisible;

    _this.isPlatformAuthenticatorAvailable = ko.observable(false);
    _this.credLinkError = ko.observable();
    

    
    _this.fidoHelp_onClick = function ()
    {
        _this.onShowDialog(DialogId.FidoHelp);
    };

    _this.view_onUpdateFlowToken = function (token)
    {
        
        _flowToken = token;
    };
    

    
    _this.switchToCredPicker_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.CredentialPicker);
    };

    _this.switchToCred_onClick = function ()
    {
        var credType = (_selectedCred && _selectedCred.credType) || CredentialType.Password;

        _this.credLinkError("");

        switch (credType)
        {
            case CredentialType.OneTimeCode:
                
                
                if (_selectedCred.proof.clearDigits)
                {
                    _this.onSwitchView(PaginatedState.ProofConfirmation, false , _selectedCred);
                }
                else
                {
                    var otcParams = _getOneTimeCodeHelperParams();
                    var getOneTimeCodeHelper = new GetOneTimeCodeHelper(otcParams);

                    _this.onSetPendingRequest(true);
                    getOneTimeCodeHelper.sendRequest();
                }
                break;

            case CredentialType.OtherMicrosoftIdpFederation:
            case CredentialType.LinkedIn:
            case CredentialType.GitHub:
            case CredentialType.Google:
            case CredentialType.Facebook:
            case CredentialType.Certificate:
                _this.onRedirect(_selectedCred.redirectUrl, _selectedCred.redirectPostParams || null);
                break;

            default:
                _this.onSwitchView(_credViewMap[credType].viewId);
                break;
        }
    };

    _this.forgotUsername_onClick = function ()
    {
        document.location.assign(_forgotUsernameUrl);
    };

    _this.getSwitchToCredText = function ()
    {
        return ko.unwrap(_this.switchToCredText);
    };
    

    
    function _updateFidoLinkText()
    {
        PromiseHelpers.throwUnhandledExceptionOnRejection(
            Fido.isPlatformAuthenticatorAvailable()
                .then(null, function () { return false; })
                .then(
                    function (isPlatformAuthenticatorAvailable)
                    {
                        if (isPlatformAuthenticatorAvailable)
                        {
                            _fidoLinkText(_strings["CT_PWD_STR_SwitchToFido_Link"]);

                            _this.isPlatformAuthenticatorAvailable(true);
                        }
                    }));
    }

    function _getOneTimeCodeHelperParams()
    {
        var otcParams =
            {
                username: StringHelpers.cleanseUsername(_username),
                proofData: _selectedCred.proof.data,
                proofType: _selectedCred.proof.type,
                purpose: _selectedCred.proof.isNopa ? Otc.Purpose.NoPassword : Otc.Purpose.OtcLogin,
                flowToken: _flowToken,
                isEncrypted: _selectedCred.proof.isEncrypted,
                siteId: _siteId,
                clientId: _clientId,
                forwardedClientId: _forwardedClientId,
                noPaBubbleVersion: _noPaBubbleVersion,
                successCallback: _sendOneTimeCode_onSuccess,
                failureCallback: _sendOneTimeCode_onFail
            };

        if (otcParams.isEncrypted)
        {
            switch (_selectedCred.proof.type)
            {
                case PROOF.Type.Email:
                    otcParams.proofConfirmation = _selectedCred.proof.display;
                    break;
                case PROOF.Type.SMS:
                case PROOF.Type.Voice:
                    otcParams.proofConfirmation = StringHelpers.cleanseUsername(_selectedCred.proof.display).slice(-4);
                    break;
            }
        }

        return otcParams;
    }

    function _sendOneTimeCode_onSuccess(response)
    {
        _setFlowToken(response);

        _this.onSetPendingRequest(false);
        _this.onSwitchView(PaginatedState.OneTimeCode, false , _selectedCred);
    }

    function _sendOneTimeCode_onFail(response)
    {
        var errorString;
        var errorNumericId = response.getOtcStatus();

        _setFlowToken(response);

        switch (errorNumericId)
        {
            case Otc.Status.FTError:
                errorString = _strings["CT_OTC_STR_Error_FlowExpired"];
                break;
            default:
                errorString = _selectedCred.proof.str["CT_OTCS_STR_Error_SendCodeServer"] || "";
                break;
        }

        _this.onSetPendingRequest(false);
        _this.credLinkError(errorString);
    }

    function _setFlowToken(response)
    {
        if (response)
        {
            if (response.getFlowToken)
            {
                _flowToken = response.getFlowToken();
                _this.onUpdateFlowToken(_flowToken);
            }
            else if (response.FlowToken)
            {
                _flowToken = response.FlowToken;
                _this.onUpdateFlowToken(_flowToken);
            }
        }
    }

    (function _initialize()
    {
        _credViewMap[CredentialType.Password] =
            {
                viewId: PaginatedState.Password,
                credId: "idA_PWD_SwitchToPassword",
                credText: _strings["CT_RNGC_STR_SwitchToPassword_Link"]
            };

        _credViewMap[CredentialType.RemoteNGC] =
            {
                viewId: PaginatedState.RemoteNGC,
                credId: "idA_PWD_SwitchToRemoteNGC",
                credText: _strings["CT_PWD_STR_SwitchToRemoteNGC_Link"]
            };

        _credViewMap[CredentialType.Fido] =
            {
                viewId: PaginatedState.Fido,
                credId: "idA_PWD_SwitchToFido",
                credText: _fidoLinkText
            };

        _credViewMap[CredentialType.Certificate] =
            {
                credId: "idA_PWD_SwitchToCertificate",
                credText: _strings["CT_STR_CredentialPicker_Option_Certificate"]
            };

        _credViewMap[CredentialType.OtherMicrosoftIdpFederation] =
            {
                credId: "useMicrosoftLink",
                credText: _strings["CT_PWD_STR_UseMicrosoft_Link"]
            };

        _credViewMap[CredentialType.LinkedIn] =
            {
                credId: "useLinkedInLink",
                credText: _strings["CT_PWD_STR_UseLinkedIn_Link"]
            };

        _credViewMap[CredentialType.GitHub] =
            {
                credId: "useGitHubLink",
                credText: _strings["CT_PWD_STR_UseGitHub_Link"]
            };

        _credViewMap[CredentialType.Google] =
            {
                credId: "useGoogleLink",
                credText: _strings["CT_PWD_STR_UseGoogle_Link"]
            };

        _credViewMap[CredentialType.Facebook] =
            {
                credId: "useGoogleLink",
                credText: _strings["CT_PWD_STR_UseFacebook_Link"]
            };

        _credViewMap[CredentialType.Federation] =
            {
                viewId: PaginatedState.IdpRedirect,
                credId: "redirectToIdpLink",
                credText: _strings["CT_RNGC_STR_SwitchToFederated_Link"]
            };

        _credViewMap[CredentialType.RemoteLogin] =
            {
                viewId: PaginatedState.RemoteLoginPolling,
                credId: "remoteLoginLink",
                credText: _strings["CT_PWD_STR_RemoteLoginLink"]
            };

        _credViewMap[CredentialType.OneTimeCode] =
            {
                viewId: PaginatedState.OneTimeCode,
                credId: "otcLoginLink",
                credText: _strings["CT_PWD_STR_SwitchToOTC_Link"]
            };

        _credViewMap[CredentialType.AccessPass] =
            {
                viewId: PaginatedState.AccessPass,
                credId: "accessPassLink",
                credText: _strings["CT_PWD_STR_Login_SwitchToAccessPassLink"]
            };

        _fidoLinkText(_strings["CT_PWD_STR_SwitchToFidoCrossPlatform_Link"]);

        ko.utils.arrayForEach(
            _availableCreds,
            function (credential)
            {
                
                if (_credViewMap[credential.credType])
                {
                    var credMatch = credential.credType === _currentCred.credType;
                    var isCredTypeOtc = credential.credType === CredentialType.OneTimeCode;
                    var proofDataMatch = credMatch && isCredTypeOtc && credential.proof.data === _currentCred.proof.data;
                    var proofTypesMatch = credMatch && isCredTypeOtc && credential.proof.type === _currentCred.proof.type;

                    if (!credMatch || (isCredTypeOtc && !proofDataMatch) || (isCredTypeOtc && !proofTypesMatch))
                    {
                        _this.credentialCount++;
                        _selectedCred = credential;
                    }
                }

                if (credential.credType === CredentialType.Fido)
                {
                    _updateFidoLinkText();
                }

                if (credential.credType === CredentialType.OfflineAccount)
                {
                    _this.credentialCount++;
                    _this.selectedCredShownOnlyOnPicker = true;
                }
            });

        if (_selectedCred && _this.credentialCount === 1)
        {
            _this.selectedCredType = _selectedCred.credType;
            _this.selectedCredShownOnlyOnPicker = !!_selectedCred.shownOnlyOnPicker;
            _this.switchToCredId = _credViewMap[_this.selectedCredType || CredentialType.Password].credId;
            _this.switchToCredText = _credViewMap[_this.selectedCredType || CredentialType.Password].credText;

            if (_this.selectedCredType === CredentialType.OneTimeCode)
            {
                switch (_selectedCred.proof.type)
                {
                    case PROOF.Type.Email:
                        _this.switchToCredText = StringHelpers.format(_strings["CT_OTC_STR_SwitchToOtc_EmailLink"], _selectedCred.proof.display);
                        break;
                    case PROOF.Type.SMS:
                        _this.switchToCredText = StringHelpers.format(_strings["CT_OTC_STR_SwitchToOtc_SmsLink"], _selectedCred.proof.display);
                        break;
                    case PROOF.Type.Voice:
                        _this.switchToCredText = StringHelpers.format(_strings["CT_OTC_STR_SwitchToOtc_VoiceLink"], _selectedCred.proof.display);
                        break;
                }
            }
        }

        
        
        
        
        _this.showSwitchToCredPickerLink = (!_showSignInOptionsAsButton || _this.isUserKnown)
            && (_this.credentialCount > 1
                || (_this.credentialCount === 1
                    && (_showForgotUsername
                        || _this.selectedCredShownOnlyOnPicker)));
    })();
    
}

ko.components.register("cred-switch-link-control",
    {
        viewModel: CredSwitchLinkControl,
        template: require("html/LoginPage/Controls/CredSwitchLinkControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = CredSwitchLinkControl;