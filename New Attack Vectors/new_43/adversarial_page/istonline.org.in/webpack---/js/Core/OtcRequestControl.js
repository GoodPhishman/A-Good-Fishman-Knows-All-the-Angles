var Ajax = require("./AjaxHandlerControl");
var Browser = require("./BrowserControl");

var AjaxHelpers = Ajax.Helper;
var QueryStringHelpers = Browser.QueryString;

var c_timeout = 30000;

var OtcProperties = exports.Properties =
{
    State: "State",
    SessionLookupKey: "SessionLookupKey",
    DisplaySignForUI: "DisplaySignForUI",
    FlowToken: "FlowToken"
};

var OtcPurpose = exports.Purpose =
{
    Password: "eOTT_OneTimePassword",
    RemoteNGC: "eOTT_RemoteNGC",
    NoPassword: "eOTT_NoPasswordAccountLoginCode",
    OtcLogin: "eOTT_OtcLogin",
    XboxRemoteConnect: "RemoteSignInWithUserCode"
};

var OtcChannel = exports.Channel =
{
    Authenticator: "Authenticator",
    MobileSms: "SMS",
    EmailAddress: "Email",
    VoiceCall: "Voice",
    PushNotifications: "PushNotifications"
};

var OtcType = exports.Type =
{
    EmailAddress: "AltEmail",
    EmailAddressEncrypted: "AltEmailE",
    Mobile: "MobileNum",
    MobileEncrypted: "MobileNumE",
    SessionApprover: "SAPId"
};

exports.Event =
{
    OnSend: "otcsend",
    OnSendFail: "otcsendfailed",
    OnFlowExpired: "otcflowexpired"
};

var OtcRequestParam = exports.RequestParam =
{
    Username: "login",
    Purpose: "purpose",
    FlowToken: "flowtoken",
    CanaryFlowToken: "canaryFlowToken",
    Channel: "channel",
    UIMode: "UIMode",
    PhoneCountry: "MobileCountry",
    PhoneCountryCode: "MobileCC",
    UnauthSessionId: "uaid",
    ProofConfirmation: "ProofConfirmation"
};

var OtcStatus = exports.Status =
{
    None: 0,
    Error: 200,
    Success: 201,
    HIPError: 202,
    FTError: 203,
    InputError: 204,
    DestinationError: 205,
    Timeout: 300
};

var ProofTypeToChannel = exports.ProofTypeToChannel = function (type)
{
    
    
    
    
    

    var value = null;
    switch (type)
    {
        case PROOF.Type.SMS:
            value = OtcChannel.MobileSms;
            break;
        case PROOF.Type.Voice:
            value = OtcChannel.VoiceCall;
            break;
        case PROOF.Type.Email:
        case PROOF.Type.AltEmail:
            value = OtcChannel.EmailAddress;
            break;
        case PROOF.Type.TOTPAuthenticatorV2:
            value = OtcChannel.PushNotifications;
            break;
    }
    return value;
};

var ProofTypeToOtcType = exports.ProofTypeToOtcType = function (type, isEncrypted)
{
    
    
    
    
    

    var value = null;
    switch (type)
    {
        case PROOF.Type.Voice:
        case PROOF.Type.SMS:
            value = (isEncrypted ? OtcType.MobileEncrypted : OtcType.Mobile);
            break;
        case PROOF.Type.Email:
        case PROOF.Type.AltEmail:
            value = (isEncrypted ? OtcType.EmailAddressEncrypted : OtcType.EmailAddress);
            break;
        case PROOF.Type.TOTPAuthenticatorV2:
            value = OtcType.SessionApprover;
            break;
    }
    return value;
};

exports.Proof = function (params)
{
    var _this = this;

    var _username = params.username || "";
    var _flowToken = params.flowToken || "";
    var _purpose = params.purpose || OtcPurpose.Password;
    var _proofType = params.proofType;
    var _proofData = params.proofData || "";
    var _isEncrypted = params.isEncrypted;
    var _uiMode = params.uiMode;
    var _lcid = params.lcid;
    var _phoneCountry = params.phoneCountry || "";
    var _phoneCountryCode = params.phoneCountryCode || "";
    var _unauthSessionId = params.unauthSessionId;
    var _proofConfirmation = params.proofConfirmation;
    var _canaryFlowToken = params.canaryFlowToken;

    _this[OtcRequestParam.Username] = _username;
    _this[OtcRequestParam.FlowToken] = _flowToken;
    _this[OtcRequestParam.Purpose] = _purpose;
    _this[OtcRequestParam.Channel] = ProofTypeToChannel(_proofType);
    _this[ProofTypeToOtcType(_proofType, _isEncrypted)] = _proofData;

    if (_uiMode)
    {
        _this[OtcRequestParam.UIMode] = _uiMode;
    }

    if (_lcid)
    {
        _this.lcid = _lcid;
    }

    
    if (!_isEncrypted && (_proofType === PROOF.Type.SMS || _proofType === PROOF.Type.Voice))
    {
        _this[OtcRequestParam.PhoneCountry] = _phoneCountry;
        _this[OtcRequestParam.PhoneCountryCode] = _phoneCountryCode;
    }

    
    if (_unauthSessionId)
    {
        _this[OtcRequestParam.UnauthSessionId] = _unauthSessionId;
    }

    
    if (_proofConfirmation)
    {
        _this[OtcRequestParam.ProofConfirmation] = _proofConfirmation;
    }

    
    if (_canaryFlowToken)
    {
        _this[OtcRequestParam.CanaryFlowToken] = _canaryFlowToken;
    }
};

exports.Request = function (params)
{
    var c_url = "GetOneTimeCode.srf";

    var _this = this;

    var _status = OtcStatus.None;
    var _sessionKey = "";
    var _displaySign = "";
    var _flowToken = "";

    var _data = params.data;
    var _onSend = params.onSend;
    var _onSendFail = params.onSendFail;
    var _onFlowExpired = params.onFlowExpired;
    var _timeout = params.timeout || c_timeout;
    var _siteId = params.siteId;
    var _clientId = params.clientId;
    var _forwardedClientId = params.forwardedClientId;
    var _noPaBubbleVersion = params.noPaBubbleVersion;

    _this.getOtcStatus = function ()
    {
        
        
        
        

        if (_this.isComplete())
        {
            return _status;
        }

        return OtcStatus.None;
    };

    _this.getSessionKey = function ()
    {
        
        
        
        

        if (_this.isComplete())
        {
            return _sessionKey;
        }

        return "";
    };

    _this.getDisplaySign = function ()
    {
        
        
        
        

        if (_this.isComplete())
        {
            return _displaySign;
        }

        return "";
    };

    _this.getFlowToken = function ()
    {
        
        
        
        

        if (_this.isComplete())
        {
            return _flowToken;
        }

        return "";
    };

    function _evt_AJAX_onsuccess(event)
    {
        
        
        

        var isFailed = false;
        var json = _this.getResponseJson();

        _flowToken = json[OtcProperties.FlowToken] || "";

        if (json[OtcProperties.State])
        {
            _status = json[OtcProperties.State];
            _sessionKey = json[OtcProperties.SessionLookupKey] || "";
            _displaySign = json[OtcProperties.DisplaySignForUI] || "";
            isFailed = _status !== OtcStatus.Success;
        }
        else
        {
            _status = OtcStatus.Error;
            _sessionKey = "";
            _displaySign = "";
            isFailed = true;
        }

        if (isFailed)
        {
            if (_status === OtcStatus.FTError)
            {
                _onFlowExpired(event, _this);
            }
            else
            {
                _onSendFail(event, _this);
            }
        }
        else
        {
            _onSend(event);
        }
    }

    function _evt_AJAX_onerror()
    {
        
        
        

        _flowToken = "";
        _status = OtcStatus.Error;
        _sessionKey = "";
        _displaySign = "";

        _onSendFail(_this);
    }

    function _evt_AJAX_ontimeout()
    {
        
        
        

        _status = OtcStatus.Timeout;
        _sessionKey = "";
        _displaySign = "";
        _flowToken = "";
        _onSendFail(_this);
    }

    (function _initialize()
    {
        var url = c_url;
        var market = QueryStringHelpers.extract("mkt");
        var lcid = QueryStringHelpers.extract("lc");

        var qsParams = [].concat(
            market ? [["mkt", market]] : [],
            lcid ? [["lcid", lcid]] : [],
            _siteId ? [["id", _siteId]] : [],
            _clientId ? [["client_id", _clientId]] : [],
            _forwardedClientId ? [["fci", _forwardedClientId]] : [],
            _noPaBubbleVersion ? [["nopa", _noPaBubbleVersion]] : []);

        var ajaxParams =
            {
                targetUrl: QueryStringHelpers.add(url, qsParams),
                requestType: Ajax.RequestType.Post,
                data: AjaxHelpers.generateRequestString(_data),
                isAsync: true,
                timeout: _timeout,
                successCallback: _evt_AJAX_onsuccess,
                failureCallback: _evt_AJAX_onerror,
                timeoutCallback: _evt_AJAX_ontimeout
            };

        Ajax.Handler.call(_this, ajaxParams);
    })();
};