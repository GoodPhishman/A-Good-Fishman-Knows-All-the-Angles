var ko = require("knockout");
var Browser = require("./BrowserControl");

var w = window;

function LightboxTemplate(params)
{
    
    var _this = this;
    

    
    var _serverData = params.serverData;
    var _showHeader = params.showHeader;
    var _headerLogo = params.headerLogo;
    

    
    var _hideHeader = _serverData.fHideHeader;
    

    
    _this.showHeader = _showHeader && !_hideHeader;
    _this.headerLogo = _headerLogo;
    
}

ko.components.register("lightbox-template",
    {
        viewModel: LightboxTemplate,
        template: require("html/Shared/Templates/ConvergedLightboxTemplateHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = LightboxTemplate;