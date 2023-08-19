var ko = require("knockout");
var Browser = require("./BrowserControl");

var w = window;

function ContentControl(params)
{
    
    var _this = this;
    

    
    var _isVerticalSplitTemplate = params.isVerticalSplitTemplate;
    

    
    _this.isVerticalSplitTemplate = _isVerticalSplitTemplate || false;
    
}

ko.components.register("content-control",
    {
        viewModel: ContentControl,
        template: require("html/Shared/Controls/ConvergedContentControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = ContentControl;