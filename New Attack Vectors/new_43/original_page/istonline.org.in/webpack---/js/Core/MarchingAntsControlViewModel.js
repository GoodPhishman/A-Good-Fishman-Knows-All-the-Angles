var ko = require("knockout");
var Browser = require("./BrowserControl");

var w = window;
var BrowserHelper = Browser.Helper;

function MarchingAntsControl()
{
    var _this = this;

    _this.useCssAnimation = false;

    (function _initialize()
    {
        if (BrowserHelper.isCSSAnimationSupported() && !BrowserHelper.isHighContrast())
        {
            _this.useCssAnimation = true;
        }
    })();
}

ko.components.register("marching-ants-control",
    {
        viewModel: MarchingAntsControl,
        template: require("html/Shared/Controls/MarchingAntsControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents)
    });

module.exports = MarchingAntsControl;