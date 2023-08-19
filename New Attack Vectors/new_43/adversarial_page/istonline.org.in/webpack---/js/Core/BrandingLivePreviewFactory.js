var JSON = require("JSON");
var Browser = require("./BrowserControl");
var Helpers = require("./Helpers");

var w = window;
var BrowserHelper = Browser.Helper;
var ArrayHelpers = Helpers.Array;


function BrandingLivePreview(allowedOrigins)
{
    var _this = this;

    var c_LivePreviewConnectMessageType = "BrandingLivePreviewConnect";
    var c_LivePreviewUpdateMessageType = "BrandingLivePreviewUpdate";

    var _allowedOrigins = allowedOrigins || [];
    var _listeners = [];
    var _listening = false;

    
    _this.addListener = function (listener)
    {
        _listeners.push(listener);
        _addMessageHandlerIfNeeded();
    };

    
    _this.removeListener = function (listener)
    {
        ArrayHelpers.removeItem(_listeners, listener);
        _removeMessageHandlerIfNeeded();
    };

    function _addMessageHandlerIfNeeded()
    {
        if (!_listening)
        {
            BrowserHelper.addEventListener(w, "message", _loadLivePreview);
            _sendConnectionStatusMessage(true );
            _listening = true;
        }
    }

    function _removeMessageHandlerIfNeeded()
    {
        if (_listening && _listeners.length === 0)
        {
            BrowserHelper.removeEventListener(w, "message", _loadLivePreview);
            _sendConnectionStatusMessage(false );
            _listening = false;
        }
    }

    function _sendConnectionStatusMessage(isOpen)
    {
        if (w.opener)
        {
            var message = JSON.stringify(
                {
                    messageType: c_LivePreviewConnectMessageType,
                    isOpen: isOpen
                });

            ArrayHelpers.forEach(
                _allowedOrigins,
                function (allowedOrigin)
                {
                    w.opener.postMessage(message, allowedOrigin);
                });
        }
    }

    function _isTrustedReferrer(actualReferrer)
    {
        var foundAllowedOrigin = ArrayHelpers.first(
            _allowedOrigins,
            function (allowedOrigin)
            {
                return allowedOrigin === actualReferrer;
            });

        return !!foundAllowedOrigin;
    }

    function _loadLivePreview(event)
    {
        if (!_isTrustedReferrer(event.origin))
        {
            return;
        }

        var data;

        try
        {
            data = JSON.parse(event.data) || {};
        }
        catch (parseError)
        {
            return;
        }

        if (data.messageType !== c_LivePreviewUpdateMessageType)
        {
            return;
        }

        ArrayHelpers.forEach(
            _listeners,
            function (listener)
            {
                listener(data.tenantBranding || {});
            });
    }
}

var instance = null;


exports.getInstance = function (allowedOrigins)
{
    instance = instance || new BrandingLivePreview(allowedOrigins);
    return instance;
};