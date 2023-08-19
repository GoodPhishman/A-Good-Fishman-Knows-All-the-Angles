var ko = require("knockout");
var Browser = require("./BrowserControl");

var w = window;

ko.components.register("cookie-banner-control",
    {
        template: require("html/Shared/Controls/CookieBannerControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents)
    });