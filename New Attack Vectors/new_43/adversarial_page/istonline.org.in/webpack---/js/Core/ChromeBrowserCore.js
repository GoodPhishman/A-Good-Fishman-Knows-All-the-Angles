var JSON = require("JSON");
var Browser = require("./BrowserControl");
var Promise = require("./Promise");

var w = window;
var document = w.document;
var QueryString = Browser.QueryString;
var Cookies = Browser.Cookies;

var OsError =
    {
        AAD_BROWSERCORE_E_INVALID_REQUEST_METHOD: -2147186943
    };

function ChromeBrowserCore(logger, nonce, cookieDomain, setNonSecureCookies, trimChromeBssoUrl)
{
    var _this = this;

    
    var c_channelId = "53ee284d-920a-4b59-9d30-a60315b26836";
    var c_preferredExtensionId = "ppnbnpeolgkicgegkbkbjmhlideopiji";
    

    
    var _logger = logger;
    var _nonce = nonce;
    var _cookieDomain = cookieDomain;
    var _setNonSecureCookies = setNonSecureCookies;
    var _trimChromeBssoUrl = trimChromeBssoUrl;
    

    
    var _responseMap = {};
    var _msgid = 0;
    var _extListNode = null;
    var _getCookieUri = null;
    var _cookieAttributes = null;
    var _openChannelPromise = null;
    

    
    _this.getCookiesAsync = function ()
    {
        return _openChannelAsync().then(
            function (extensionId)
            {
                _logger.logMessage("Pulling SSO cookies");

                return _sendMessageAsync({ method: "GetCookies", uri: _getCookieUri }, extensionId)
                    .then(null, _fallbackOnGetCookiesMethodNotFound)
                    .then(_parseCookies);
            });
    };
    

    
    function _window_onMessage(event)
    {
        
        if (event.source !== w)
        {
            return;
        }

        var request = event.data;
        var channel = request && request.channel;
        var responseId = request && request.responseId;
        var body = request && request.body;
        var method = body && body.method;

        if (channel === c_channelId
            && responseId
            && (method === "CreateProviderAsync" || method === "Response"))
        {
            _logger.logMessage("Received message for method " + method);

            var resolveHandler = _responseMap[responseId];
            delete _responseMap[responseId];

            
            
            
            setTimeout(
                function ()
                {
                    resolveHandler(body.response || {});
                }, 0);
        }
    }

    function _sendMessageAsync(request, extensionId)
    {
        var sendMessagePromise = new Promise(
            function (resolve)
            {
                var message =
                {
                    channel: c_channelId,
                    responseId: ++_msgid,
                    body: request
                };

                if (extensionId)
                {
                    message.extensionId = extensionId;
                }

                _responseMap[message.responseId] = resolve;

                _logger.logMessage("Sending message for method " + (request || {}).method || "");

                w.postMessage(message, "*");
            });

        return sendMessagePromise.then(
            function (response)
            {
                if (response.status === "Success")
                {
                    return Promise.resolve(response.result || {});
                }

                return Promise.reject(new ChromeBrowserCore.Error(response.code, response.description, response.ext));
            });
    }

    function _openChannelAsync()
    {
        
        if (!_openChannelPromise)
        {
            if (w.addEventListener)
            {
                w.addEventListener("message", _window_onMessage);
            }

            _logger.logMessage("Creating ChromeBrowserCore provider");


            
            
            
            _openChannelPromise = _sendMessageAsync({ method: "CreateProviderAsync", response: { status: "Success" } })
                .then(_getExtensionId);
        }

        return _openChannelPromise;
    }

    function _getExtensionId()
    {
        var extensionId = null;
        var extension = _extListNode.firstChild;

        while (extension)
        {
            if (extension.id && (extensionId === null || extension.id === c_preferredExtensionId))
            {
                extensionId = extension.id;
            }

            _extListNode.removeChild(extension);
            extension = _extListNode.firstChild;
        }

        if (!extensionId)
        {
            throw new ChromeBrowserCore.Error("NoExtension", "Extension is not installed.", null);
        }

        _logger.logDataPoint("extension.id", extensionId);
        _logger.logMessage("Using Chrome extension with id " + extensionId);

        return extensionId;
    }

    function _fallbackOnGetCookiesMethodNotFound(error)
    {
        if (error.code === "OSError" && error.externalData && error.externalData.error === OsError.AAD_BROWSERCORE_E_INVALID_REQUEST_METHOD)
        {
            _logger.logMessage("GetCookies method not found, falling back to GetCookie");

            return _openChannelAsync().then(
                function (extensionId)
                {
                    return _sendMessageAsync({ method: "GetCookie", uri: _getCookieUri }, extensionId);
                });
        }

        return Promise.reject(error);
    }

    function _parseCookies(result)
    {
        var cookies = result.response || [];

        if (cookies && cookies.length)
        {
            for (var i = 0, len = cookies.length; i < len; ++i)
            {
                var cookieValue = cookieValue = cookies[i].data || "";
                var existingAttributesIndex = cookieValue.indexOf(";");

                if (existingAttributesIndex !== -1)
                {
                    
                    cookieValue = cookieValue.substr(0, existingAttributesIndex);
                }

                cookies[i].data = cookieValue + _cookieAttributes;
            }
        }

        return cookies;
    }

    (function _initialize()
    {
        _getCookieUri = QueryString.appendOrReplace(w.location.href, "sso_nonce", _nonce);

        
        
        
        if (_trimChromeBssoUrl)
        {
            var parsedUrl = QueryString.parse(_getCookieUri);

            if (parsedUrl.fragment)
            {
                parsedUrl.fragment = null;
                _getCookieUri = QueryString.join(parsedUrl);
            }
        }

        _cookieAttributes = "; path=/; domain=" + _cookieDomain + (_setNonSecureCookies ? "" : "; secure");

        var channelElementId = "ch-" + c_channelId;
        _extListNode = document.getElementById(channelElementId);

        if (!_extListNode)
        {
            _extListNode = document.createElement("div");
            _extListNode.id = channelElementId;

            document.body.appendChild(_extListNode);
        }
    })();
    
}

ChromeBrowserCore.Error = function (code, description, externalData)
{
    var _this = this;

    var _code = code;
    var _description = description;
    var _externalData = externalData;

    _this.code = _code;
    _this.description = _description;
    _this.externalData = _externalData;

    _this.toString = function ()
    {
        var errorString = "ChromeBrowserCore error " + (_code || "") + ": " + (_description || "");

        if (_externalData)
        {
            errorString += " (ext: " + JSON.stringify(_externalData) + ")";
        }

        return errorString;
    };

    _this.toCookieString = function ()
    {
        var cookieString = "NA";

        if (Cookies.isCookieSafeValue(_code))
        {
            cookieString += "|" + _code;

            var externalDataJson = _externalData ? encodeURIComponent(JSON.stringify(_externalData)) : null;

            if (externalDataJson && Cookies.isCookieSafeValue(externalDataJson))
            {
                cookieString += "|" + externalDataJson;
            }
        }

        return cookieString;
    };
};

module.exports = ChromeBrowserCore;