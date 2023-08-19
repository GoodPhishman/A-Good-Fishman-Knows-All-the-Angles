var ko = require("knockout");
var Browser = require("./BrowserControl");

var w = window;
var BrowserHelper = Browser.Helper;
var NodeTypeElement = 1;

function AccessibleImageControl(params, lightImageNode, darkImageNode)
{
    var _this = this;

    var _hasDarkBackground = params.hasDarkBackground;

    _this.isHighContrastBlackTheme = false;
    _this.isHighContrastWhiteTheme = false;
    _this.hasDarkBackground = _hasDarkBackground;
    _this.lightImageNode = lightImageNode;
    _this.darkImageNode = darkImageNode;

    (function _initialize()
    {
        var isHighContrast = BrowserHelper.isHighContrast();
        if (isHighContrast)
        {
            var theme = BrowserHelper.getHighContrastTheme();
            _this.isHighContrastBlackTheme = theme === "black";
            _this.isHighContrastWhiteTheme = theme === "white";
        }
    })();
}

ko.components.register("accessible-image-control",
    {
        viewModel:
            {
                createViewModel: function (params, componentInfo)
                {
                    var templateElements = ko.utils.arrayFilter(
                        componentInfo.templateNodes,
                        function (templateNode)
                        {
                            return templateNode.nodeType === NodeTypeElement;
                        });

                    
                    return new AccessibleImageControl(params, templateElements[0], templateElements[1]);
                }
            },
        template: require("html/Shared/Controls/AccessibleImageControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents)
    });

module.exports = AccessibleImageControl;