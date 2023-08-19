var FidoConstants = require("./FidoConstants");
var Helpers = require("./Helpers");
var Promise = require("./Promise");
var PromiseHelpers = require("./PromiseHelpers");

var ObjectHelpers = Helpers.Object;
var StringHelpers = Helpers.String;
var ArrayHelpers = Helpers.Array;

var w = window;
var isEdge = null;
var isIEOlderThan = {};
var isFirefoxNewerThan = {};
var isChromeNewerThan = {};
var isChrome = null;
var isIOSSafari = null;
var isIOSUIWebView = null;
var isQtCarBrowser = null;
var isEdgeClientBrowser = null;
var isHighContrast = null;
var isPlaceholderAttributeAllowed = null;
var isHistorySupported = null;
var useSameSite = !!w.ServerData.fUseSameSite;
var detectMultiHighContrastThemes = !!w.ServerData.fDetectMultiHighContrastThemes;
var isSvgSupported = null;

exports.HttpCode =
{
    Ok: 200,
    NotModified: 304,
    Timeout: 408,
    ClientClosedRequest: 499
};

var BrowserHelper = exports.Helper =
{
    isIEOlderThan: function (version)
    {
        if (isIEOlderThan[version] === undefined)
        {
            var ieVersion = BrowserHelper.getIEVersion();
            isIEOlderThan[version] = ieVersion && (ieVersion < version + 1);
        }

        return isIEOlderThan[version];
    },

    isEdge: function ()
    {
        if (isEdge === null)
        {
            isEdge = false;

            var windowsVersion = BrowserHelper.getWindowsVersion();
            if (windowsVersion !== null && windowsVersion >= 10.0) 
            {
                var ieVersion = BrowserHelper.getIEVersion();
                isEdge = ieVersion !== null && ieVersion >= 12; 
            }
        }

        return isEdge;
    },

    isChrome: function ()
    {
        if (isChrome === null)
        {
            isChrome = navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
        }

        return isChrome;
    },

    isFirefoxNewerThan: function (version)
    {
        if (isFirefoxNewerThan[version] === undefined)
        {
            var firefoxVersion = BrowserHelper.getFirefoxVersion();
            isFirefoxNewerThan[version] = firefoxVersion && (firefoxVersion > version);
        }

        return isFirefoxNewerThan[version];
    },

    isChromeNewerThan: function (version)
    {
        if (isChromeNewerThan[version] === undefined)
        {
            var chromeVersion = BrowserHelper.getChromeVersion();
            isChromeNewerThan[version] = chromeVersion && (chromeVersion > version);
        }

        return isChromeNewerThan[version];
    },

    isIOSSafari: function ()
    {
        if (isIOSSafari === null)
        {
            var userAgent = w.navigator.userAgent.toLowerCase();
            isIOSSafari = /safari/.test(userAgent) &&
                            /iphone|ipod|ipad/.test(userAgent) && !w.MSStream;
        }

        return isIOSSafari;
    },

    isIOSUIWebView: function ()
    {
        if (isIOSUIWebView === null)
        {
            
            
            var userAgent = w.navigator.userAgent.toLowerCase();
            isIOSUIWebView = /safari/.test(userAgent) === false &&
                                /iphone|ipod|ipad/.test(userAgent) && !w.MSStream;
        }

        return isIOSUIWebView;
    },

    isQtCarBrowser: function ()
    {
        
        if (isQtCarBrowser === null)
        {
            isQtCarBrowser = navigator.userAgent.toLowerCase().indexOf("qtcarbrowser") > -1;
        }

        return isQtCarBrowser;
    },

    isEdgeClientBrowser: function ()
    {
        if (isEdgeClientBrowser === null)
        {
            
            
            
            isEdgeClientBrowser = navigator.userAgent.toLowerCase().indexOf("edgeclient/") > -1;
        }

        return isEdgeClientBrowser;
    },

    isOnTouchStartEventSupported: function ()
    {
        return "ontouchstart" in document.documentElement;
    },

    getIEVersion: function ()
    {
        
        var ua = w.navigator.userAgent;

        var msie = ua.indexOf("MSIE ");
        if (msie > 0)
        {
            
            return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
        }

        var trident = ua.indexOf("Trident/");
        if (trident > 0)
        {
            
            var rv = ua.indexOf("rv:");
            return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
        }

        var edge = ua.indexOf("Edge/");
        if (edge > 0)
        {
            
            return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
        }

        
        return null;
    },

    getFirefoxVersion: function ()
    {
        
        var ua = w.navigator.userAgent;

        var match = ua.match(/(firefox(?=\/))\/?\s*(\d+)/i);
        if (match && match.length === 3 && match[1].toLowerCase() === "firefox")
        {
            return parseInt(match[2]);
        }

        return null;
    },

    getChromeVersion: function ()
    {
        
        var ua = w.navigator.userAgent;

        var match = ua.match(/(chrome(?=\/))\/?\s*(\d+)/i);
        if (match && match.length === 3 && match[1].toLowerCase() === "chrome")
        {
            return parseInt(match[2]);
        }

        return null;
    },

    getWindowsVersion: function ()
    {
        if (new RegExp("Windows NT ([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent) !== null)
        {
            return parseFloat(RegExp.$1);
        }

        return null;
    },

    htmlEscape: function (text)
    {
        if (!text)
        {
            return "";
        }

        var textArea = document.createElement("textarea");
        textArea.innerText = text;

        return textArea.innerHTML;
    },

    htmlUnescape: function (html)
    {
        
        

        if (!html)
        {
            return "";
        }

        
        
        if (html.match(/<[^<>]+>/))
        {
            return html;
        }

        var textArea = document.createElement("textarea");
        textArea.innerHTML = html;

        return textArea.value;
    },

    getStackSize: function (maxUpperLimitOfStackSize)
    {
        var stackSize = 0;
        var isUnlimited = typeof maxUpperLimitOfStackSize === "undefined" || maxUpperLimitOfStackSize === null;

        function recurse()
        {
            stackSize++;
            if (isUnlimited || stackSize <= maxUpperLimitOfStackSize)
            {
                recurse();
            }
        }

        try
        {
            recurse();
        }
        catch (e)
        {
        }

        return stackSize;
    },

    getAnimationEndEventName: function ()
    {
        var testDiv = document.createElement("div");
        var animations =
            {
                "animation": "animationend",
                "OAnimation": "oAnimationEnd",
                "MozAnimation": "animationend",
                "WebkitAnimation": "webkitAnimationEnd"
            };

        for (var key in animations)
        {
            
            if (testDiv.style[key] !== undefined)
            {
                return animations[key];
            }
        }

        return "";
    },

    isStackSizeGreaterThan: function (stackSize)
    {
        stackSize = stackSize || 0;
        return BrowserHelper.getStackSize(stackSize) > stackSize;
    },

    isSvgImgSupported: function ()
    {
        if (isSvgSupported === null)
        {
            
            
            isSvgSupported = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
        }

        return isSvgSupported;
    },

    isPlaceholderAttributeAllowed: function (isHosted)
    {
        if (isPlaceholderAttributeAllowed === null)
        {
            
            isPlaceholderAttributeAllowed = BrowserHelper.isChromeNewerThan(16)
                || BrowserHelper.isEdge()
                || BrowserHelper.isFirefoxNewerThan(14)
                || (isHosted && BrowserHelper.isIOSUIWebView())
                || BrowserHelper.isIOSSafari()
                || BrowserHelper.isQtCarBrowser();
        }

        return isPlaceholderAttributeAllowed;
    },

    isCSSAnimationSupported: function ()
    {
        var supported = false;
        var prefixes = ["Webkit", "Moz", "O"];
        var testDiv = document.createElement("div");

        supported = testDiv.style.animationName !== undefined;

        if (!supported)
        {
            var supportedPrefix = ArrayHelpers.first(
                prefixes,
                function (prefix)
                {
                    return testDiv.style[prefix + "AnimationName"] !== undefined;
                });

            
            
            
            supported = !!supportedPrefix;
        }

        return supported;
    },

    isStyleSupported: function (styleName)
    {
        return styleName in document.documentElement.style;
    },

    isCORSSupported: function ()
    {
        return w.XDomainRequest || (w.XMLHttpRequest && "withCredentials" in new XMLHttpRequest());
    },

    isHistorySupported: function ()
    {
        if (isHistorySupported === null)
        {
            var dummyState = "__history_test";
            isHistorySupported = w.history && w.history.pushState && typeof w.history.state !== "undefined" && typeof w.onpopstate !== "undefined";

            if (isHistorySupported)
            {
                try
                {
                    w.history.replaceState(dummyState, "");

                    if (w.history.state !== dummyState)
                    {
                        
                        isHistorySupported = false;
                    }
                    else if (BrowserHelper.isEdgeClientBrowser())
                    {
                        isHistorySupported = false;
                    }
                }
                catch (e)
                {
                    
                    isHistorySupported = false;
                }
            }
        }

        return isHistorySupported;
    },

    isFidoSupportedAsync: function (isFidoSupportedHint)
    {
        var supportsStandard = w.navigator.credentials !== undefined
            && w.navigator.credentials.create !== undefined
            && w.navigator.credentials.get !== undefined
            && w.PublicKeyCredential !== undefined
            && w.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== undefined;

        if (!supportsStandard)
        {
            
            return Promise.resolve(false);
        }

        if (w.PublicKeyCredential.isExternalCTAP2SecurityKeySupported)
        {
            
            return PromiseHelpers.newPromiseWithTimeout(w.PublicKeyCredential.isExternalCTAP2SecurityKeySupported, FidoConstants.PromiseTimeout, false);
        }

        
        return Promise.resolve(isFidoSupportedHint);
    },

    isChangingInputTypeSupported: function ()
    {
        return !BrowserHelper.isIEOlderThan(9);
    },

    isHighContrast: function ()
    {
        
        
        

        if (isHighContrast === null)
        {
            var span = document.createElement("span");
            span.style.borderLeftColor = "red";
            span.style.borderRightColor = "blue";
            span.style.position = "absolute";
            span.style.top = "-999px";
            document.body.appendChild(span);

            var style = BrowserHelper.getComputedStyle(span);
            isHighContrast = style.borderLeftColor === style.borderRightColor;

            document.body.removeChild(span);
        }

        return isHighContrast;
    },

    getHighContrastTheme: function ()
    {
        if (BrowserHelper.isHighContrast())
        {
            var body = document.getElementsByTagName("body")[0];
            var style = BrowserHelper.getComputedStyle(body);
            if (style.backgroundColor)
            {
                var backgroundColor = style.backgroundColor.toLowerCase().replace(new RegExp(" ", "g"), "");

                var blackHighContrastTheme = backgroundColor === "rgb(0,0,0)" || backgroundColor === "#000000" || backgroundColor === "#000";
                var whiteHighContrastTheme = backgroundColor === "rgb(255,255,255)" || backgroundColor === "#ffffff" || backgroundColor === "#fff";
                var aquaticTheme = backgroundColor === "rgb(32,32,32)" || backgroundColor === "#202020";
                var duskTheme = backgroundColor === "rgb(45,50,54)" || backgroundColor === "#2d3236";
                var desertTheme = backgroundColor === "rgb(255,250,239)" || backgroundColor === "#fffaef";

                if (blackHighContrastTheme || (detectMultiHighContrastThemes && (aquaticTheme || duskTheme)))
                {
                    return "black";
                }
                else if (whiteHighContrastTheme || (detectMultiHighContrastThemes && (desertTheme)))
                {
                    return "white";
                }
            }
        }
    },

    getComputedStyle: function (element)
    {
        if (document.defaultView && document.defaultView.getComputedStyle)
        {
            return document.defaultView.getComputedStyle(element, null);
        }
        else if (element.currentStyle)
        {
            return element.currentStyle;
        }

        return {};
    },

    history:
    {
        pushState: function (state, title)
        {
            if (BrowserHelper.isHistorySupported())
            {
                w.history.pushState(state, title);
            }
        },
        replaceState: function (state, title)
        {
            if (BrowserHelper.isHistorySupported())
            {
                w.history.replaceState(state, title);
            }
        }
    },

    addEventListener: function (element, eventType, handler, useCapture)
    {
        if (element.addEventListener)
        {
            element.addEventListener(eventType, handler, useCapture);
        }
        else if (element.attachEvent)
        {
            element.attachEvent("on" + eventType, handler);
        }
    },

    removeEventListener: function (element, eventType, handler, useCapture)
    {
        if (element.removeEventListener)
        {
            element.removeEventListener(eventType, handler, useCapture);
        }
        else if (element.detachEvent)
        {
            element.detachEvent("on" + eventType, handler);
        }
    },

    getEventTarget: function (event)
    {
        if (!event)
        {
            return null;
        }

        if (event.target)
        {
            return event.target;
        }

        if (event.srcElement)
        {
            return event.srcElement;
        }

        return null;
    }
};

var QueryStringHelper = exports.QueryString =
{
    

    
    parse: function (url)
    {
        var originAndPath = url;
        var query = null;
        var fragment = null;

        if (url)
        {
            var queryStartIndex = url.indexOf("?");
            var fragmentStartIndex = url.indexOf("#");

            if (fragmentStartIndex !== -1
                && (queryStartIndex === -1 || fragmentStartIndex < queryStartIndex))
            {
                
                originAndPath = url.substring(0, fragmentStartIndex);
                fragment = StringHelpers.doubleSplit(url.substring(fragmentStartIndex + 1), "&", "=");
            }
            else if (queryStartIndex !== -1 && fragmentStartIndex === -1)
            {
                
                originAndPath = url.substring(0, queryStartIndex);
                query = StringHelpers.doubleSplit(url.substring(queryStartIndex + 1), "&", "=");
            }
            else if (queryStartIndex !== -1 && fragmentStartIndex !== -1)
            {
                
                originAndPath = url.substring(0, queryStartIndex);
                query = StringHelpers.doubleSplit(url.substring(queryStartIndex + 1, fragmentStartIndex), "&", "=");
                fragment = StringHelpers.doubleSplit(url.substring(fragmentStartIndex + 1), "&", "=");
            }
        }

        var parsedUrl =
            {
                originAndPath: originAndPath,
                query: query,
                fragment: fragment
            };

        return parsedUrl;
    },

    
    join: function (parsedUrl)
    {
        var url = parsedUrl.originAndPath || "";

        if (parsedUrl.query)
        {
            url += "?" + ObjectHelpers.join(parsedUrl.query, "&", "=");
        }

        if (parsedUrl.fragment)
        {
            url += "#" + ObjectHelpers.join(parsedUrl.fragment, "&", "=");
        }

        return url;
    },

    
    appendCurrentQueryParameterIfNotExist: function (url)
    {
        var currentUrlFullQueryString = QueryStringHelper.parse(window.location.href);

        ObjectHelpers.forEach(currentUrlFullQueryString.query,
            function (key, value)
            {
                url = QueryStringHelper.addIfNotExist(url, key, value);
            });

        return url;
    },

    
    append: function (url, queryString)
    {
        var parsedUrl = QueryStringHelper.parse(url);
        var params = StringHelpers.doubleSplit(queryString, "&", "=");

        parsedUrl.query = parsedUrl.query || {};

        ObjectHelpers.forEach(
            params,
            function (key, value)
            {
                parsedUrl.query[key] = value || null;
            });

        return QueryStringHelper.join(parsedUrl);
    },

    
    addIfNotExist: function (url, key, value)
    {
        value = value || "";

        var parsedUrl = QueryStringHelper.parse(url);
        if (ObjectHelpers.findOwnProperty(parsedUrl.query || {}, key, true) === null)
        {
            parsedUrl.query = parsedUrl.query || {};
            parsedUrl.query[key.toLowerCase()] = value;
        }

        return QueryStringHelper.join(parsedUrl);
    },

    
    add: function (url, keyValuePairs)
    {
        var parsedUrl = QueryStringHelper.parse(url);
        if (url && keyValuePairs && keyValuePairs.length)
        {
            parsedUrl.query = parsedUrl.query || {};

            ArrayHelpers.forEach(
                keyValuePairs,
                function (keyValuePair)
                {
                    parsedUrl.query[keyValuePair[0]] = keyValuePair[1];
                });
        }

        return QueryStringHelper.join(parsedUrl);
    },

    
    appendOrReplace: function (url, param, value, maxLength)
    {
        var parsedUrl = QueryStringHelper.parse(url);
        parsedUrl.query = parsedUrl.query || {};

        var existingParam = ObjectHelpers.findOwnProperty(parsedUrl.query, param, true);
        if (existingParam)
        {
            delete parsedUrl.query[existingParam];
        }

        parsedUrl.query[param.toLowerCase()] = value;

        var modifiedUrl = QueryStringHelper.join(parsedUrl);
        return (maxLength && modifiedUrl.length > maxLength) ? url : modifiedUrl;
    },

    
    remove: function (url, param)
    {
        var parsedUrl = QueryStringHelper.parse(url);
        parsedUrl.query = parsedUrl.query || {};

        var existingParam = ObjectHelpers.findOwnProperty(parsedUrl.query, param, true);
        if (existingParam)
        {
            delete parsedUrl.query[existingParam];
        }

        return QueryStringHelper.join(parsedUrl);
    },

    
    extract: function (param, urlOrQueryString)
    {
        if (!urlOrQueryString && urlOrQueryString !== "")
        {
            urlOrQueryString = document.location.search;
        }

        var parsedUrl = QueryStringHelper.parse(urlOrQueryString);
        parsedUrl.query = parsedUrl.query || {};

        var existingParam = ObjectHelpers.findOwnProperty(parsedUrl.query, param, true);
        return existingParam ? parsedUrl.query[existingParam] : "";
    },

    
    appendOrReplaceFromCurrentUrl: function (url, param)
    {
        var currentValue = QueryStringHelper.extract(param);
        return currentValue ? QueryStringHelper.appendOrReplace(url, param, currentValue) : url;
    },

    
    stripQueryStringAndFragment: function (url)
    {
        return QueryStringHelper.parse(url).originAndPath;
    }
};

var CookieHelpers = exports.Cookies =
{
    expireDate: "Thu, 30-Oct-1980 16:00:00 GMT",
    persistTTLDays: 390, 
    cookieSafeRegex: /^[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]+$/,

    enabled: function ()
    {
        var date = new Date();
        var cookieValue = "G" + date.getTime();
        var cookieName = "CkTst";

        CookieHelpers.write(cookieName, cookieValue);
        var cookiesEnabled = !!CookieHelpers.getCookie(cookieName);
        CookieHelpers.remove(cookieName);

        return cookiesEnabled;
    },

    getCookie: function (name)
    {
        var cookies = StringHelpers.doubleSplit(document.cookie, ";", "=", false, StringHelpers.trim);

        if (cookies[name])
        {
            return cookies[name];
        }

        return null;
    },

    getObject: function (name)
    {
        var cookie = CookieHelpers.getCookie(name) || "";

        return StringHelpers.doubleSplit(cookie, "&", "=");
    },

    remove: function (name, domain, path)
    {
        var domainName = domain || document.location.hostname;
        var hostParts = domainName.split(".");
        var partCount = hostParts.length;

        var cookieDomain = hostParts[partCount - 2] + "." + hostParts[partCount - 1];
        var cookiePath = path || "/";
        var secure = (document.location.protocol === "https:");
        var secureContent = secure ? ";secure" : "";
        var sameSiteContent = CookieHelpers.getDefaultSameSiteAttribute(secure);
        document.cookie = StringHelpers.format("{0}= ;domain=.{1};path={2};expires={3}{4}{5}", name, cookieDomain, cookiePath, CookieHelpers.expireDate, secureContent, sameSiteContent);
        document.cookie = StringHelpers.format("{0}= ;domain=.{1};path={2};expires={3}{4}{5}", name, domainName, cookiePath, CookieHelpers.expireDate, secureContent, sameSiteContent);
    },

    
    write: function (name, value, secure, persist, topLevel, addDomainPrefix, path, sameSite)
    {
        var prefix = addDomainPrefix ? "." : "";
        var parts = document.domain.split(".");

        if (topLevel)
        {
            parts.splice(0, Math.max(0, parts.length - 2));
        }

        var cookieDomain = prefix + parts.join(".");

        CookieHelpers.writeWithExpiration(name, value, secure, persist ? CookieHelpers.getPersistDate() : null, cookieDomain, path, sameSite);
    },

    
    writeWithExpiration: function (name, value, secure, expiresOn, domain, path, sameSite)
    {
        if (value === "")
        {
            CookieHelpers.remove(name, domain);
        }
        else
        {
            if (typeof value === "object")
            {
                value = ObjectHelpers.join(value, "&", "=");
            }

            var expiration = expiresOn ? (";expires=" + expiresOn) : "";
            var cookieDomain = domain ? (";domain=" + domain) : "";
            var cookiePath = path || "/";
            var secureContent = secure ? ";secure" : "";

            
            var sameSiteContent;
            if (!sameSite || sameSite.toLowerCase() === "none")
            {
                sameSiteContent = CookieHelpers.getDefaultSameSiteAttribute(secure);
            }
            else
            {
                sameSiteContent = ";SameSite=" + sameSite;
            }

            var cookieToWrite = StringHelpers.format("{0}={1}{2};path={3}{4}{5}{6}", name, value, cookieDomain, cookiePath, expiration, secureContent, sameSiteContent);

            document.cookie = cookieToWrite;
        }
    },

    
    isCookieSafeValue: function (str)
    {
        return CookieHelpers.cookieSafeRegex.test(str);
    },

    getDefaultSameSiteAttribute: function (secure)
    {
        if (secure && useSameSite)
        {
            return ";SameSite=None";
        }

        return "";
    },

    getPersistDate: function ()
    {
        var date = new Date();
        date.setDate(date.getDate() + CookieHelpers.persistTTLDays);
        return date.toUTCString();
    }
};