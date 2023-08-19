var w = window;
var document = w.document;
var documentMode = document.documentMode;
var navigator = w.navigator;

(function ()
{
    var ieVersion = null;
    var userAgent = navigator.userAgent;
    var userAgentOverride = null;

    var matches = userAgent.match(/MSIE ([^ ]+)/);
    if (matches)
    {
        ieVersion = parseInt(matches[1]);
    }

    
    
    if (typeof w.Symbol === "function" && userAgent.match(/AppleWebKit\/601/))
    {
        w.Symbol = null;
    }

    
    
    
    
    
    if (ieVersion
        && documentMode
        && ieVersion !== documentMode
        && Object.defineProperty)
    {
        try
        {
            Object.defineProperty(
                navigator,
                "userAgent",
                {
                    get: function ()
                    {
                        return userAgentOverride;
                    }
                });

            userAgentOverride = userAgent.replace(/MSIE [^ ]+/, "MSIE " + documentMode + ".0");
            module.exports = require("ko");
            userAgentOverride = userAgent;
        }
        catch (e)
        {
            module.exports = require("ko");
        }
    }
    else
    {
        module.exports = require("ko");
    }
})();