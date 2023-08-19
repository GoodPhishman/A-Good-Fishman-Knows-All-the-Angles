var JSON = require("JSON");
var Helpers = require("./Helpers");
var Browser = require("./BrowserControl");
var ApiRequest = require("./ApiRequest");
var Promise = require("./Promise");
var ChromeBrowserCore = require("./ChromeBrowserCore");
var TokenBrokerAuthHelper = require("./TokenBrokerAuthHelper");

var w = window;
var QueryString = Browser.QueryString;
var Cookies = Browser.Cookies;
var ArrayHelpers = Helpers.Array;


module.exports = function (serverData)
{
    var _this = this;

    
    var _serverData = serverData;
    

    
    var _bssoConfig = _serverData.bsso || { enabled: false };
    var _isCloudBuild = _serverData.fIsCloudBuild;
    var _trimChromeBssoUrl = _serverData.fTrimChromeBssoUrl;
    var _checkApiCanary = _serverData.checkApiCanary !== false;
    

    
    var _cookieNames = _bssoConfig.cookieNames;
    var _bssoTelemetry = null;
    

    
    
    _this.loginWindowsUserAsync = function (uri)
    {
        if (!_bssoConfig.enabled)
        {
            
            return Promise.reject("bssoDisabled");
        }

        return _loginWindowsUserAsync(uri)
            .then(_reportSuccessTelemetryAsync, _reportErrorTelemetryAsync);
    };

    
    _this.pullBrowserSsoCookieAsync = function ()
    {
        var pullCookiePromise;
        var isSilentCookiePull = _bssoConfig.failureRedirectUrl || _bssoConfig.reloadOnFailure;
        var bssoType = _bssoConfig.type;

        if (!_bssoConfig.enabled)
        {
            
            return Promise.reject("bssoDisabled");
        }

        if (bssoType === "windows")
        {
            pullCookiePromise = _pullBrowserSsoCookieAsync();
        }
        else if (bssoType === "chrome")
        {
            pullCookiePromise = _pullChromeBrowserSsoCookieAsync();
        }

        return pullCookiePromise
            .then(
                function (result)
                {
                    if (isSilentCookiePull && !result.redirectUrl)
                    {
                        return Promise.reject("silentPullFailed");
                    }

                    return result;
                })
            .then(_reportSuccessTelemetryAsync, _reportErrorTelemetryAsync)
            .then(null,
                function (error)
                {
                    if (isSilentCookiePull)
                    {
                        if (_bssoConfig.reloadOnFailure)
                        {
                            return { redirectUrl: _getReloadUrlAndSetThrottlingCookie() };
                        }

                        return { redirectUrl: _bssoConfig.failureRedirectUrl };
                    }

                    return Promise.reject(error);
                });
    };

    
    _this.isEnabled = function ()
    {
        return !!_bssoConfig.enabled;
    };
    

    
    
    function _loginWindowsUserAsync(uri)
    {
        if (!w.navigator || typeof (w.navigator.msLaunchUri) !== "function")
        {
            _logDataPoint("BSSO.info", "not-supported");
            _logMessage("window.navigator.msLaunchUri is not available for _loginWindowsUser");

            return Promise.reject("bssoNotSupported");
        }

        var failInitiatePullOnTimeout = _bssoConfig.initiatePullTimeoutAction === "abort";
        var tokenBrokerAuthHelper = new TokenBrokerAuthHelper(
            {
                logMessage: _logMessage,
                logDataPoint: _logDataPoint
            },
            _bssoConfig.initiatePullTimeoutMs,
            _bssoConfig.overallTimeoutMs,
            failInitiatePullOnTimeout);

        return tokenBrokerAuthHelper
            .loginWindowsUserAsync(uri)
            .then(
                function (result)
                {
                    if (result.reload)
                    {
                        _logMessage("SSO cookie detected. Refreshing page.");
                        return _getReloadUrlAndSetThrottlingCookie();
                    }

                    return Promise.reject("error");
                });
    }

    
    function _pullBrowserSsoCookieAsync()
    {
        if (!w.navigator || typeof (w.navigator.msLaunchUri) !== "function")
        {
            _logDataPoint("BSSO.info", "not-supported");
            _logMessage("window.navigator.msLaunchUri is not available for _pullBrowserSsoCookie");

            return Promise.reject("bssoNotSupported");
        }

        var useTiles = Cookies.getCookie(_cookieNames.ssoTiles) || _bssoConfig.forceTiles;

        if (!useTiles && Cookies.getCookie(_cookieNames.ssoPulled))
        {
            _logDataPoint("BSSO.info", "throttled");
            _logMessage("Cookie pull throttled");

            return Promise.reject("throttled");
        }

        var baseUri = "tbauth://login.windows.net?" +
            "context=" + encodeURIComponent(w.location.href.split("/", 3).join("/")) +  
            (_bssoConfig.nonce ? ("&request_nonce=" + encodeURIComponent(_bssoConfig.nonce)) : "") +
            (_bssoConfig.rid ? ("&rid=" + encodeURIComponent(_bssoConfig.rid)) : "");

        
        var uri = baseUri;
        if (useTiles)
        {
            
            uri = QueryString.appendOrReplace(uri, "user_id", "*");
            Cookies.remove(_cookieNames.ssoTiles);
        }

        var failInitiatePullOnTimeout = _bssoConfig.initiatePullTimeoutAction === "abort";
        var tokenBrokerAuthHelper = new TokenBrokerAuthHelper(
            {
                logMessage: _logMessage,
                logDataPoint: _logDataPoint
            },
            _bssoConfig.initiatePullTimeoutMs,
            _bssoConfig.overallTimeoutMs,
            failInitiatePullOnTimeout);

        return tokenBrokerAuthHelper
            .pullBrowserSsoCookieAsync(uri)
            .then(
                function (result)
                {
                    if (result.reload)
                    {
                        _logMessage("SSO cookie detected. Refreshing page.");
                        return { redirectUrl: _getReloadUrlAndSetThrottlingCookie() };
                    }
                    else if (result.userList)
                    {
                        var newSessions = _processUsersList(result.userList, baseUri);

                        if (newSessions.length > 0)
                        {
                            return { newSessions: newSessions };
                        }

                        return Promise.reject("noUsers");
                    }
                });
    }

    
    function _pullChromeBrowserSsoCookieAsync()
    {
        var chromeBrowserCore = new ChromeBrowserCore(
            {
                logMessage: _logMessage,
                logDataPoint: _logDataPoint
            },
            _bssoConfig.nonce,
            "login.microsoftonline.com",
            _isCloudBuild,
            _trimChromeBssoUrl);

        return chromeBrowserCore
            .getCookiesAsync()
            .then(
                function (cookies)
                {
                    if (!cookies || !cookies.length)
                    {
                        return Promise.reject(new ChromeBrowserCore.Error("PageException", "Extension returned no cookies"));
                    }

                    for (var i = 0, len = cookies.length; i < len; ++i)
                    {
                        var cookieValue = cookies[i].data;
                        if (cookieValue.indexOf(";") !== -1)
                        {
                            cookieValue = cookieValue.substr(0, cookieValue.indexOf(";"));
                        }

                        Cookies.write(cookies[i].name, cookieValue, !_isCloudBuild);
                    }

                    _logMessage("SSO cookie detected. Refreshing page.");
                    return { redirectUrl: _getReloadUrlAndSetThrottlingCookie() };
                })
            .then(null,
                function (error)
                {
                    Cookies.write(_cookieNames.aadSso, error.toCookieString(), !_isCloudBuild);
                    _logMessage("Error: " + error.toString());

                    return Promise.reject(error);
                });
    }

    
    function _getReloadUrlAndSetThrottlingCookie()
    {
        var expiresOn = new Date();
        expiresOn.setSeconds(expiresOn.getSeconds() + 60);    

        Cookies.writeWithExpiration(_cookieNames.ssoPulled, "1", !_isCloudBuild, expiresOn.toUTCString());

        var url = w.location.href;
        url = QueryString.appendOrReplace(url, "sso_reload", "true");

        if (!_bssoConfig.reloadOnFailure && QueryString.extract("prompt").toLowerCase() === "select_account")
        {
            url = QueryString.appendOrReplace(url, "prompt", "");
        }

        return url;
    }

    
    function _processUsersList(users_json, baseUri)
    {
        var newSessions = [];
        var userList = JSON.parse(users_json).users;

        if (userList && userList.length > 0)
        {
            ArrayHelpers.forEach(
                userList,
                function (user)
                {
                    var windowsUserTiles =
                        {
                            ssoUniqueId: user.unique_id,
                            displayName: user.display_name || "",
                            name: user.upn,
                            isWindowsSso: true,
                            isSignedIn: true,
                            url: baseUri
                        };

                    newSessions.push(windowsUserTiles);
                });

            _logMessage("User list processed. List: " + JSON.stringify(newSessions));
        }
        else
        {
            _logMessage("User list is empty.");
        }

        return newSessions;
    }

    
    function _logMessage(message)
    {
        _bssoTelemetry.traces.push(message);
    }

    
    function _logDataPoint(key, value)
    {
        _bssoTelemetry.data[key] = value;
    }

    
    function _reportSuccessTelemetryAsync(result)
    {
        _bssoTelemetry.result = result.newSessions ? "UserList" : "Reload";

        return _reportTelemetryAsync().then(
            function ()
            {
                return result;
            });
    }

    
    function _reportErrorTelemetryAsync(error)
    {
        _bssoTelemetry.result = "Error";

        if (error instanceof ChromeBrowserCore.Error)
        {
            if (error.code === "OSError" && error.externalData && error.externalData.error)
            {
                _bssoTelemetry.error = error.externalData.error;
            }
            else
            {
                _bssoTelemetry.error = error.code;
            }
        }
        else
        {
            _bssoTelemetry.error = error;
        }

        return _reportTelemetryAsync().then(
            function ()
            {
                return Promise.reject(error);
            });
    }

    
    function _reportTelemetryAsync()
    {
        return new Promise(
            function (resolve)
            {
                try
                {
                    if (w.console)
                    {
                        w.console.info("BSSO Telemetry: " + JSON.stringify(_bssoTelemetry));
                    }
                }
                catch (e)
                {
                }

                if (_bssoConfig.telemetry.url)
                {
                    
                    var apiRequest = new ApiRequest({ checkApiCanary: _checkApiCanary });
                    apiRequest.Beacon(
                        {
                            url: _bssoConfig.telemetry.url
                        },
                        _bssoTelemetry,
                        resolve,
                        resolve,
                        500);
                }
                else
                {
                    resolve();
                }
            });
    }

    
    (function _initialize()
    {
        if (_bssoConfig.enabled)
        {
            _bssoTelemetry =
            {
                result: null,
                error: null,
                type: _bssoConfig.telemetry.type || null,
                data: {},
                traces: []
            };

            _bssoConfig.initiatePullTimeoutMs = _bssoConfig.initiatePullTimeoutMs || _bssoConfig.overallTimeoutMs;
            _bssoConfig.initiatePullTimeoutAction = _bssoConfig.initiatePullTimeoutAction || "abort";

            _logMessage("BrowserSSO Initialized");
        }
    })();
    
};