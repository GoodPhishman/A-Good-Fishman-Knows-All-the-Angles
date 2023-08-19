var Browser = require("./BrowserControl");

var BrowserHelper = Browser.Helper;
var Cookies = Browser.Cookies;

var BrowserCapabilities =
{
    None: 0x0,
    OnTouchStartEventPresent: 0x1
};

function BrowserCapabilitiesHelper()
{
    var _this = this;

    
    var c_browserCapabilitiesCookie = "brcap";
    

    
    var _browserCapabilities = BrowserCapabilities.None;
    

    
    _this.writeCookie = function ()
    {
        Cookies.write(c_browserCapabilitiesCookie, _browserCapabilities, true , true );
    };
    

    
    function _detectCapabilities()
    {
        if (BrowserHelper.isOnTouchStartEventSupported())
        {
            _browserCapabilities = _browserCapabilities | BrowserCapabilities.OnTouchStartEventPresent;
        }
    }
    

    (function _initialize()
    {
        _detectCapabilities();
    })();
}

module.exports = BrowserCapabilitiesHelper;
