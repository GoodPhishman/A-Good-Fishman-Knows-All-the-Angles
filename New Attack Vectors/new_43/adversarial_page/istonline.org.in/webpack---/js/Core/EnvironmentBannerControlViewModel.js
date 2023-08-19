var ko = require("knockout");
var Browser = require("./BrowserControl");

var w = window;

ko.components.register("environment-banner-control",
    {
        template: require("html/Shared/Controls/EnvironmentBannerControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents)
    });