var ko = require("knockout");
var Browser = require("../Core/BrowserControl");
var ComponentEvent = require("../Core/ComponentEvent");
var Constants = require("../Core/Constants");

var w = window;
var PaginatedState = Constants.PaginatedState;

function SeeHowDataIsManagedViewModel(params)
{
    var _this = this;

    
    var _serverData = params.serverData;
    

    
    var _oobeServicesInformationLinkUrl = _serverData.urlOobeServicesInformationLink;
    

    
    _this.onSwitchView = ComponentEvent.create();
    

    
    _this.serverData = _serverData;
    _this.iFrameReady = ko.observable(false);
    

    
    _this.iFrameTarget = function ()
    {
        return _oobeServicesInformationLinkUrl;
    };

    
    _this.saveSharedData = function () {};
    _this.getState = function () { return null; };
    _this.restoreState = function () {};
    

    
    _this.secondaryButton_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.Previous);
    };
    

    
    
    
    
    _this.iframeMessage = function (ev)
    {
        var expectedOrigin = new URL(_oobeServicesInformationLinkUrl).origin;
        
        if (ev.origin === expectedOrigin)
        {
            var oIFrame = document.getElementById("sdxiframe");
            if (oIFrame)
            {
                oIFrame.style.height = ev.data;
                oIFrame.style.setProperty("visibility", "visible");
            }
            
            _this.iFrameReady(true);
        }
    };

    (function initialize()
    {
        window.addEventListener("message", _this.iframeMessage, false);
    })();
    
}

ko.components.register("see-how-data-is-managed-view",
    {
        viewModel: SeeHowDataIsManagedViewModel,
        template: require("html/LoginPage/SeeHowDataIsManagedHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = SeeHowDataIsManagedViewModel;