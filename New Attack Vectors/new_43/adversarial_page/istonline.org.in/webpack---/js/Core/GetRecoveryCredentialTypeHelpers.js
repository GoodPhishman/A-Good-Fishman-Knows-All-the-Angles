var Constants = require("./Constants");
var Promise = require("./Promise");
var Helpers = require("./Helpers");
var ApiRequest = require("./ApiRequest");
var ClientTracingConstants = require("./ClientTracingConstants");

var StringHelpers = Helpers.String;
var ObjectHelpers = Helpers.Object;
var CredentialType = Constants.CredentialType;
var ApiErrorCodes = Constants.ApiErrorCodes;
var EstsError = Constants.EstsError;
var PaginatedState = Constants.PaginatedState;


var GrctResultAction = GetRecoveryCredentialTypeRequestHelper.GrctResultAction =
{
    ShowError: 1,
    SwitchView: 2
};


var GrctRequestHelperFlags = GetRecoveryCredentialTypeRequestHelper.GrctRequestHelperFlags =
{
    DisableAutoSend: 1 << 0
};




function GetRecoveryCredentialTypeRequestHelper(serverData, flags)
{
    
    var _this = this;

    var _cache = {};

    var _serverData = serverData;
    var _disableAutoSend = (flags & GrctRequestHelperFlags.DisableAutoSend) !== 0;
    

    
    var _strings = _serverData.str;
    var _checkApiCanary = _serverData.fCheckApiCanary;
    var _getRecoveryCredentialTypeUrl = _serverData.urlGetRecoveryCredentialType;
    var _userProofData = _serverData.arrProofData || {};
    var _isRestrictedWsi = _serverData.fIsRestrictedWsi;
    

    
    _this.sendAsync = function (unsafe_username, flowToken, targetCredential)
    {
        var unsafe_cleansedUsername = StringHelpers.cleanseUsername(unsafe_username, true );
        var cachedResponse = _cache[unsafe_cleansedUsername] ? _cache[unsafe_cleansedUsername] : null;

        
        var grctPromise = cachedResponse
            ? cachedResponse
            : _callGetRecoveryCredentialTypeAsync(targetCredential, flowToken);

        
        
        
        
        return Promise.all([grctPromise]).then(
            function (results)
            {
                var response = results[0];

                return _parseGetRecoveryCredentialTypeResponse(unsafe_cleansedUsername, response);
            },
            _handleGetRecoveryCredentialTypeError);
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

    _this.getGrctSharedData = function (unsafe_username, response)
    {
        var sharedData = {};
        var preferredCredential = _getPreferredCredential(response);
        sharedData.preferredCredential = preferredCredential;
        sharedData.availableRecoveryCreds = _getAvailableCreds(unsafe_username, response);

        if (preferredCredential === CredentialType.OneTimeCode)
        {
            sharedData.otcCredential = Helpers.Array.first(
                sharedData.availableRecoveryCreds,
                function (credential)
                {
                    return credential.credType === CredentialType.OneTimeCode && credential.proof.otcSent;
                });
        }

        sharedData.otcParams =
            {
                requestSent: preferredCredential === CredentialType.OneTimeCode
            };

        return sharedData;
    };
    

    
    function _buildOtcCredentials(unsafe_username, response)
    {
        var otcCredentials = [];

        if (_getPreferredCredential(response) === CredentialType.OneTimeCode)
        {
            var otcCredential =
            {
                credType: CredentialType.OneTimeCode,
                proof:
                {
                    display: unsafe_username,
                    data: StringHelpers.cleanseUsername(unsafe_username),
                    otcSent: true,
                    isEncrypted: false,
                    isDefault: true,
                    isNopa: true,
                    type: PROOF.Type.Email
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
    }

    function _callGetRecoveryCredentialTypeAsync(targetCredential, flowToken)
    {
        return new Promise(
            function (resolve, reject)
            {
                var apiRequest = new ApiRequest({ checkApiCanary: _checkApiCanary });
                apiRequest.Json(
                    { 
                        url: _getRecoveryCredentialTypeUrl,
                        eventId: ClientTracingConstants.EventIds.Api_GetRecoveryCredentialType
                    },
                    { 
                        targetCredential: targetCredential,
                        flowToken: flowToken
                    },
                    resolve,
                    reject,
                    Constants.DefaultRequestTimeout);
            });
    }

    function _parseGetRecoveryCredentialTypeResponse(unsafe_username, response)
    {
        var grctResult = {};
        var sharedData = _this.getGrctSharedData(unsafe_username, response);

        grctResult = _getUsernameFoundGrctResult(response);

        
        grctResult.flowToken = response.FlowToken || null;

        if (!grctResult.bypassCache)
        {
            _cache[unsafe_username] = response;

            
            _cache[unsafe_username].FlowToken = null;
        }

        grctResult.sharedData = sharedData;

        return grctResult;
    }

    function _handleGetRecoveryCredentialTypeError(response)
    {
        var grctResult = {};

        if (response && response.error)
        {
            switch (response.error.code)
            {
                case ApiErrorCodes.AuthFailure:
                    grctResult = _getGrctResultShowErrorAction(_strings["CT_PWD_STR_Error_FlowTokenExpired"]);
                    break;

                case EstsError.TenantDoesNotSupportNativeCredentialRecovery:
                case EstsError.UserDoesNotSupportNativeCredentialRecovery:
                case EstsError.CredentialDoesNotSupportNativeRecovery:
                    grctResult = _getGrctResultShowErrorAction(_strings["CT_PWD_STR_Error_CredentialDoesNotSupportNativeRecovery"]);
                    break;

                default:
                    grctResult = _getGrctResultShowErrorAction(_strings["CT_PWD_STR_Error_GetRecoveryCredentialTypeError"]);
                    break;
            }
        }
        else
        {
            grctResult = _getGrctResultShowErrorAction(_strings["CT_PWD_STR_Error_GetRecoveryCredentialTypeError"]);
        }

        grctResult.flowToken = response.FlowToken || null;

        return grctResult;
    }

    function _getPreferredCredential(response)
    {
        var credentials = response.Credentials;
        var preferredCredential = null;

        if (credentials)
        {
            preferredCredential = credentials.PrefCredential;
        }

        return preferredCredential;
    }

    function _getAvailableCreds(unsafe_username, response)
    {
        var credentials = [];

        
        if (_userProofData[PROOF.Type.Email])
        {
            var otcCredentials = _buildOtcCredentials(unsafe_username, response);

            if (otcCredentials.length > 0)
            {
                Helpers.Array.forEach(otcCredentials, _buildOtcProofStrings);
                credentials = credentials.concat(otcCredentials);
            }
        }

        return credentials;
    }

    function _getUsernameFoundGrctResult(response)
    {
        var preferredCredential = _getPreferredCredential(response);

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
                if (preferredCredential !== CredentialType.AccessPass)
                {
                    return _getGrctResultSwitchViewAction(PaginatedState.MoreInfo);
                }
            }
        }

        switch (preferredCredential)
        {
            case CredentialType.OneTimeCode:
                var paginatedState = PaginatedState.OneTimeCodeRecovery;

                if (_disableAutoSend)
                {
                    paginatedState = PaginatedState.ConfirmSend;
                }

                return _getGrctResultSwitchViewAction(paginatedState);

            
            default:
                return _getGrctResultShowErrorAction(_strings["CT_PWD_STR_Error_GetRecoveryCredentialTypeError"], false , true );
        }
    }

    function _getGrctResultSwitchViewAction(viewId, viewParams)
    {
        return { action: GrctResultAction.SwitchView, viewId: viewId, viewParams: viewParams };
    }

    function _getGrctResultShowErrorAction(error, isBlockingError, bypassCache)
    {
        return { action: GrctResultAction.ShowError, error: error, isBlockingError: isBlockingError, bypassCache: bypassCache };
    }
    
}

module.exports = GetRecoveryCredentialTypeRequestHelper;