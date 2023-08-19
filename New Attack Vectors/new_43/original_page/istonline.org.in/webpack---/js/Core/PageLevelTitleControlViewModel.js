var ko = require("knockout");
var Browser = require("./BrowserControl");

var w = window;

ko.components.register("page-level-title-control",
    {
        template: require("html/Shared/Controls/PageLevelTitleControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents)
    });