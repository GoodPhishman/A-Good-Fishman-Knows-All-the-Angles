var w = window;

__webpack_public_path__ = w.ServerData.urlCdn;


w.ServerData.urlImagePath = w.ServerData.urlCdn + "images/";

var ko = require("knockout");
var KnockoutExtensions = require("../Core/KnockoutExtensions");
var Constants = require("../Core/Constants");
var Browser = require("../Core/BrowserControl");
var StringRepository = require("../Core/StringRepository");
var LoginConstants = require("./LoginConstants");
var LoginPaginatedViewModel = require("./LoginPaginatedPageViewModel");

var LoginMode = Constants.LoginMode;
var BrowserHelper = Browser.Helper;
var QueryString = Browser.QueryString;
var Cookies = Browser.Cookies;
var LoginOption = LoginConstants.LoginOption;

var _onLoadFired = false;

KnockoutExtensions.applyExtensions(ko);

ko.utils.registerEventHandler(w, "load",
    function ()
    {
        var serverData = w.ServerData;
        serverData.str = StringRepository.getStrings("str", serverData);
        serverData.html = StringRepository.getStrings("html", serverData);
        serverData.arrProofData = StringRepository.getStrings("proofData");

        if (_onLoadFired || isRedirectNeeded(serverData))
        {
            return;
        }

        _onLoadFired = true;

        switch (serverData.iLoginMode)
        {
            case LoginMode.GenericError:
            case LoginMode.GenericErrorMobile:
            case LoginMode.GenericErrorHost:
            case LoginMode.SwitchUser:
            case LoginMode.SwitchUserMobile:
            case LoginMode.SwitchUserHost:
            case LoginMode.InviteBlocked:
            case LoginMode.ServiceBlocked:
            case LoginMode.IDPFailed:
            case LoginMode.HIP_Lockout:
            case LoginMode.HIP_LockoutMobile:
            case LoginMode.HIP_LockoutHost:
            case LoginMode.BindFailed:
                require.ensure([],
                    function ()
                    {
                        var LoginErrorViewModel = require("./LoginErrorPageViewModel");

                        document.body.appendChild(document.createElement("div")).innerHTML = require("html/LoginPage/LoginErrorPageHtml.html");
                        ko.applyBindings(new LoginErrorViewModel(serverData));
                        postLoad(serverData);
                    },
                    "Alt");

                break;
            default:
                document.body.appendChild(document.createElement("div")).innerHTML = require("html/LoginPage/LoginPaginatedPageHtml.html");
                ko.applyBindings(new LoginPaginatedViewModel(serverData));
                postLoad(serverData);
                break;
        }
    });

function postLoad(serverData)
{
    doAsyncIPv6ImageLoad(serverData.urlIPv6Experiment);
    doAsyncCertImageLoad(serverData);
}

function isRedirectNeeded(serverData)
{
    try
    {
        
        if (top !== self)
        {
            
            top.location.replace(self.location.href);
        }

        
        if (serverData.iFedState === 2 && serverData.urlFed)
        {
            doFedRedirect(serverData.urlFed, serverData.iDefaultLoginOptions, decodeURIComponent(QueryString.extract("username")), serverData);
            return true;
        }

        
        if (!Cookies.enabled())
        {
            document.location = serverData.urlNoCookies;
            return true;
        }
    }
    catch (exc)
    {
        serverData.iLoginMode = LoginMode.GenericError;
    }

    return false;
}

function doFedRedirect(fedUrl, loginOptions, username, serverData)
{
    var fedQs = serverData.sFedQS;

    if (loginOptions === LoginOption.NothingChecked)
    {
        fedQs = QueryString.appendOrReplace("?" + fedQs, "wctx", "LoginOptions%3D3%26" + QueryString.extract("wctx", "?" + fedQs)).substr(1);
    }

    fedUrl = QueryString.appendOrReplace(fedUrl, "cbcxt", encodeURIComponent(decodeURIComponent(QueryString.extract("cbcxt"))));
    fedUrl = QueryString.appendOrReplace(fedUrl, "vv", encodeURIComponent(decodeURIComponent(QueryString.extract("cbcxt"))));
    fedUrl = QueryString.appendOrReplace(fedUrl, "username", encodeURIComponent(username));
    fedUrl = QueryString.appendOrReplace(fedUrl, "mkt", encodeURIComponent(decodeURIComponent(QueryString.extract("mkt"))));
    fedUrl = QueryString.appendOrReplace(fedUrl, "lc", encodeURIComponent(decodeURIComponent(QueryString.extract("lc"))));

    document.location.replace(QueryString.append(fedUrl, fedQs));

    return true;
}

function doAsyncCertImageLoad(serverData)
{
    
    if (serverData.fUpgradeEVCert)
    {
        
        if ((new RegExp("Windows NT ([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent) !== null && parseFloat(RegExp.$1) < 6.0) &&
            BrowserHelper.getIEVersion() >= 7.0)  
        {
            try
            {
                
                var el = document.getElementById("ev");
                el.src = serverData.urlEVCertUpgrade;
            }
            catch (exc)
            {
            }
        }
    }
}


function doAsyncIPv6ImageLoad(experimentUrl)
{
    if (experimentUrl)
    {
        var img = new Image();
        img.src = experimentUrl;
    }
}