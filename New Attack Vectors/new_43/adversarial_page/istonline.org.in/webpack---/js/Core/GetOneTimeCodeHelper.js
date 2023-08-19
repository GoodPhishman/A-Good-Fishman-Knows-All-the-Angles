var Otc = require("./OtcRequestControl");
var ClientTracingConstants = require("./ClientTracingConstants");
var ClientTracingHelper = require("./ClientTracingHelper").getInstance(window.ServerData);

module.exports = function (params)
{
    var _this = this;

    var _request = null;

    var _username = params.username;
    var _proofData = params.proofData;
    var _proofType = params.proofType;
    var _purpose = params.purpose || Otc.Purpose.Password;
    var _flowToken = params.flowToken;
    var _canaryFlowToken = params.canaryFlowToken;
    var _isEncrypted = params.isEncrypted !== false; 
    var _uiMode = params.uiMode;
    var _lcid = params.lcid;
    var _unauthSessionId = params.unauthSessionId;
    var _proofConfirmation = params.proofConfirmation;
    var _phoneCountry = params.phoneCountry;
    var _phoneCountryCode = params.phoneCountryCode;
    var _siteId = params.siteId;
    var _clientId = params.clientId;
    var _forwardedClientId = params.forwardedClientId;
    var _noPaBubbleVersion = params.noPaBubbleVersion;

    var _successCallback = params.successCallback;
    var _failureCallback = params.failureCallback;

    var _clientTracingOptions = params.clientTracingOptions;
    var _trackingObject = {};

    
    _this.sendRequest = function ()
    {
        var otcRequestParams =
            {
                data: _getSendOtcProof(),
                siteId: _siteId,
                clientId: _clientId,
                forwardedClientId: _forwardedClientId,
                noPaBubbleVersion: _noPaBubbleVersion,
                onSend: _sendOneTimeCode_onSuccess,
                onSendFail: _sendOneTimeCode_onFail,
                onFlowExpired: _sendOneTimeCode_onFail
            };

        var eventArgs = {};
        eventArgs.proofType = _proofType;
        eventArgs.purpose = _purpose;
        eventArgs.uiMode = _uiMode;
        eventArgs.lcid = _lcid;
        eventArgs.phoneCountry = _phoneCountry;
        eventArgs.phoneCountryCode = _phoneCountryCode;
        _traceBeginRequest(_trackingObject, eventArgs);

        _request = new Otc.Request(otcRequestParams);
        _request.sendRequest();
    };

    
    function _traceBeginRequest(tracingObject, eventArgs)
    {
        var eventOptions = _clientTracingOptions || {};
        if (!eventOptions.hasOwnProperty("eventId"))
        {
            
            eventOptions.eventId = ClientTracingConstants.EventIds.Api_GetOneTimeToken;
        }

        if (eventOptions.eventId)
        {
            var eventData =
                {
                    eventType: "POST",
                    eventId: eventOptions.eventId,
                    eventLevel: eventOptions.eventLevel || ClientTracingConstants.EventLevel.Info,
                    eventArgs: eventArgs,
                    eventOptions: eventOptions
                };

            ClientTracingHelper.traceBeginRequest(tracingObject, eventData);
        }
    }

    function _traceEndRequest(tracingObject, result, error, succeeded, handler)
    {
        ClientTracingHelper.traceEndRequest(tracingObject, result, error, succeeded, handler);
    }

    function _getSendOtcProof()
    {
        var proofParams =
            {
                username: _username,
                proofData: _proofData,
                proofType: _proofType,
                purpose: _purpose,
                flowToken: _flowToken,
                canaryFlowToken: _canaryFlowToken,
                isEncrypted: _isEncrypted,
                uiMode: _uiMode,
                lcid: _lcid,
                unauthSessionId: _unauthSessionId,
                proofConfirmation: _proofConfirmation,
                phoneCountry: _phoneCountry,
                phoneCountryCode: _phoneCountryCode
            };

        return new Otc.Proof(proofParams);
    }

    function _sendOneTimeCode_onSuccess()
    {
        _traceEndRequest(
            _trackingObject,
            "Success",
            null,
            true  ,
            function ()
            {
                if (_successCallback)
                {
                    _successCallback(_request);
                }
            });
    }

    function _sendOneTimeCode_onFail()
    {
        var error = _getOtcError();
        _traceEndRequest(
            _trackingObject,
            "Failed",
            error,
            false  ,
            function ()
            {
                if (_failureCallback)
                {
                    _failureCallback(_request);
                }
            });
    }

    function _getOtcError()
    {
        return { otcStatus: _request.getOtcStatus() };
    }
};