var ApiRequest = require("./ApiRequest");
var Constants = require("./Constants");
var Promise = require("../Core/Promise");
var ClientTracingConstants = require("../Core/ClientTracingConstants");




var CanaryPurposeData =
{
    DeviceAuth: { PageId: "ConvergedRemoteConnect", ActionId: "OAuth2DeviceAuth", ConfirmationViewId: Constants.PaginatedState.RemoteConnectCanaryValidation },
    FidoAuth: { PageId: "PaginatedLogin", ActionId: "FidoGet", ConfirmationViewId: Constants.PaginatedState.PartnerCanaryValidation }
};

var PartnerCanaryScenario = CanaryValidationHelper.PartnerCanaryScenario =
{
    Undefined: 0,
    Fido: 1
};

var CanaryValidationSuccessAction = CanaryValidationHelper.CanaryValidationSuccessAction =
{
    SwitchView: 1,
    Redirect: 2
};

function CanaryValidationHelper(serverData)
{
    
    var _this = this;

    var _serverData = serverData;
    

    
    var _externalCanary = _serverData.sExternalCanary;
    var _canaryValidationUrl = _serverData.urlCanaryValidation;
    var _isRemoteConnectFlow = !!_serverData.sRemoteConnectAppName;
    var _isRemoteConnectSignup = !!_serverData.fIsRemoteConnectSignup;
    var _signupUrl = _serverData.urlSignUp;
    var _signupUrlPostParams = _serverData.oSignUpPostParams;
    var _partnerCanaryScenario = _serverData.iPartnerCanaryScenario;
    

    
    _this.validateAsync = function ()
    {
        return new Promise(
            function (resolve, reject)
            {
                var data = _getCanaryPurposeData();
                data.Canary = _externalCanary;

                var successAction = _getSuccessAction();

                var apiRequest = new ApiRequest({ checkApiCanary: false, withCredentials: true });

                apiRequest.Json(
                    {
                        url: _canaryValidationUrl,
                        eventId: ClientTracingConstants.EventIds.Api_CanaryValidation
                    },
                    data,
                    function () { resolve(successAction); },
                    function (innerError) { reject(new CanaryValidationHelper.CanaryValidationError(innerError, data.ConfirmationViewId, successAction)); },
                    Constants.DefaultRequestTimeout);
            });
    };
    

    
    function _getCanaryPurposeData()
    {
        if (_isRemoteConnectFlow)
        {
            return CanaryPurposeData.DeviceAuth;
        }
        else if (_partnerCanaryScenario === PartnerCanaryScenario.Fido)
        {
            return CanaryPurposeData.FidoAuth;
        }

        throw "Canary Validation: Flow IDs not known.";
    }

    function _getSuccessAction()
    {
        if (_isRemoteConnectSignup)
        {
            return { action: CanaryValidationSuccessAction.Redirect, redirectUrl: _signupUrl, redirectPostParams: _signupUrlPostParams, isIdpRedirect: false };
        }

        
        return { action: CanaryValidationSuccessAction.SwitchView };
    }
    
}

CanaryValidationHelper.CanaryValidationError = function (innerError, confirmationViewId, postConfirmationAction)
{
    var _this = this;

    _this.name = "CanaryValidationError";
    _this.message = "Canary validation failed, user confirmation required.";
    _this.stack = (new Error()).stack;
    _this.innerError = innerError;
    _this.confirmationViewId = confirmationViewId;
    _this.postConfirmationAction = postConfirmationAction;
};

module.exports = CanaryValidationHelper;