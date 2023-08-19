var ko = require("knockout");
var Browser = require("./BrowserControl");
var Helpers = require("./Helpers");
var ComponentEvent = require("./ComponentEvent");
var ApiRequest = require("./ApiRequest");
var DebugDetailsExtensions = require("./DebugDetailsKnockoutExtensions");

var w = window;

var DateTimeHelpers = Helpers.DateTime;
var BrowserHelper = Browser.Helper;

DebugDetailsExtensions.applyExtensions(ko);

function DebugDetailsViewModel(params)
{
    
    var _this = this;

    var _username = null;
    

    
    var _debugDetails = params.debugDetails;
    var _serverData = params.serverData;
    var _isDebugTracingEnabled = params.isDebugTracingEnabled;
    var _useWiderWidth = params.useWiderWidth;
    

    
    var _exceptionMessage = _serverData.strServiceExceptionMessage;
    var _setDebugModeUrl = _serverData.urlSetDebugMode;
    var _postUsername = _serverData.sPOST_Username;
    var _signinName = _serverData.sSigninName;
    var _strings = _serverData.str;
    var _errorCode = _serverData.sErrorCode;
    

    
    _this.onCloseBanner = ComponentEvent.create();
    _this.onSetDebugTracing = ComponentEvent.create();
    

    
    _this.debugModeError = ko.observable();
    _this.isDebugTracingEnabled = ko.observable(_isDebugTracingEnabled);
    _this.sending = ko.observable(false);
    _this.showBanner = ko.observable(true);
    _this.showDebugDetailsCopyMessage = ko.observable(false);
    _this.isFocusActivated = ko.observable(false);

    _this.unsafe_exceptionMessage = null;
    _this.debugDetails = null;
    _this.useWiderWidth = _useWiderWidth;
    

    
    _this.hideBanner_onClick = function ()
    {
        _this.onCloseBanner();
        _this.showBanner(false);
    };

    _this.setDebugMode_onClick = function ()
    {
        if (_this.sending())
        {
            return;
        }

        var apiRequest = new ApiRequest();

        _this.sending(true);
        _this.debugModeError("");

        var postData =
        {
            mode: _this.isDebugTracingEnabled() ? 0 : 1,
            user: _username
        };

        apiRequest.Json(
            {
                url: _setDebugModeUrl
            },
            postData,
            _setDebugMode_onSuccess,
            _setDebugMode_onError);
    };

    _this.activateFocus = function ()
    {
        this.isFocusActivated(true);
    };
    

    
    function _setDebugMode_onSuccess()
    {
        _this.sending(false);
        _this.isDebugTracingEnabled(!_this.isDebugTracingEnabled());
        _this.onSetDebugTracing();
    }

    function _setDebugMode_onError()
    {
        _this.sending(false);
        _this.debugModeError(_strings["STR_Error_Details_Debug_Mode_Failure"]);
    }

    (function _initialize()
    {
        _username = _postUsername || _signinName || "";
        _this.unsafe_exceptionMessage = BrowserHelper.htmlUnescape(_exceptionMessage);

        _this.debugDetails = _debugDetails || {};

        if (_errorCode)
        {
            _this.debugDetails.errorCode = _errorCode;
        }

        if (!_this.debugDetails.timestamp)
        {
            _this.debugDetails.timestamp = DateTimeHelpers.getUTCString();
        }
    })();
    
}

ko.components.register("debug-details-control",
    {
        viewModel: DebugDetailsViewModel,
        template: require("html/Shared/Controls/DebugDetailsControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = DebugDetailsViewModel;