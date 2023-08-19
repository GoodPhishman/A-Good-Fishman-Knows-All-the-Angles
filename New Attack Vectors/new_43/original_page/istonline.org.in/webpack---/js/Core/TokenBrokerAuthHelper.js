var Browser = require("./BrowserControl");
var Promise = require("./Promise");

var w = window;
var Cookies = Browser.Cookies;

module.exports = function (logger, initiatePullTimeout, overallTimeout, failInitiatePullOnTimeout)
{
    var _this = this;

    
    var _logger = logger;
    var _initiatePullTimeout = initiatePullTimeout;
    var _overallTimeout = overallTimeout;
    var _failInitiatePullOnTimeout = failInitiatePullOnTimeout;
    

    
    _this.pullBrowserSsoCookieAsync = function (uri)
    {
        return _callTokenBrokerAsync(uri, "cookie pull", false );
    };

    _this.loginWindowsUserAsync = function (uri)
    {
        return _callTokenBrokerAsync(uri, "Windows user login", true );
    };
    

    
    function _callTokenBrokerAsync(uri, action, ssoCookieOnly)
    {
        var pullStartTime = new Date().getTime();

        return _launchUriAsync(uri, action, pullStartTime)
            .then(function () { return _pollForTokenBrokerCookieAsync(action, pullStartTime, ssoCookieOnly); });
    }

    function _launchUriAsync(uri, action, pullStartTime)
    {
        var msLaunchUriPromise = new Promise(
            function (resolve, reject)
            {
                w.navigator.msLaunchUri(uri, resolve, reject);
                setTimeout(function () { reject("timeout"); }, _initiatePullTimeout);
            });

        return msLaunchUriPromise.then(
            function ()
            {
                var elapsedMs = (new Date().getTime()) - pullStartTime;
                _logger.logDataPoint("msLaunchUri.success.ms", elapsedMs);
                _logger.logMessage(action + " initiated successfully (took " + elapsedMs + " ms)");
            },
            function (reason)
            {
                if (reason === "timeout")
                {
                    _logger.logDataPoint("msLaunchUri.response", _failInitiatePullOnTimeout ? "timeout" : "timeout-continue");
                    _logger.logMessage("Initiating " + action + " timed out" + _failInitiatePullOnTimeout ? "" : " but starting polling anyway in case cookie was pulled");
                }
                else
                {
                    var elapsedMs = (new Date().getTime()) - pullStartTime;
                    _logger.logDataPoint("msLaunchUri.failure.ms", elapsedMs);
                    _logger.logMessage(action + " was NOT initiated successfully (took " + elapsedMs + " ms)");
                }

                if (reason !== "timeout" || _failInitiatePullOnTimeout)
                {
                    return Promise.reject(reason || "noHandler");
                }
            });
    }

    function _pollForTokenBrokerCookieAsync(action, pullStartTime, ssoCookieOnly)
    {
        return new Promise(
            function (resolve, reject)
            {
                var intervalId = setInterval(
                    function ()
                    {
                        var userList = ssoCookieOnly ? null : Cookies.getCookie("ESTSUSERLIST");
                        var ssoToken = Cookies.getCookie("ESTSSSO");

                        if (userList || ssoToken)
                        {
                            clearInterval(intervalId);

                            _logger.logDataPoint((userList ? "ESTSUSERLIST" : "ESTSSSO") + ".cookie.ms", (new Date().getTime()) - pullStartTime);

                            if (userList)
                            {
                                _logger.logMessage("Users list cookie detected");
                                Cookies.remove("ESTSUSERLIST");

                                resolve({ userList: decodeURIComponent(userList).replace(/\+/g, " ") });
                            }
                            else
                            {
                                resolve({ reload: true });
                            }
                        }
                    }, 250);

                setTimeout(
                    function ()
                    {
                        clearInterval(intervalId);
                        _logger.logDataPoint("TB.response.timeout.ms", (new Date().getTime()) - pullStartTime);
                        _logger.logMessage(action + " timed out.");

                        reject("timeout");
                    }, _overallTimeout);
            });
    }
    
};