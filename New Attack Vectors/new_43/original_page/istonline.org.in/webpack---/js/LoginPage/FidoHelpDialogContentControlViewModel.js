var ko = require("knockout");
var Browser = require("../Core/BrowserControl");
var ComponentEvent = require("../Core/ComponentEvent");

var w = window;


function FidoHelpDialogContentControl(params)
{
    var _this = this;

    
    var _isPlatformAuthenticatorAvailable = params.isPlatformAuthenticatorAvailable;
    

    
    _this.isPlatformAuthenticatorAvailable = _isPlatformAuthenticatorAvailable;
    

    
    _this.onRegisterDialog = ComponentEvent.create();
    _this.onUnregisterDialog = ComponentEvent.create();
    
}

ko.components.register("fido-help-dialog-content-control",
    {
        viewModel: FidoHelpDialogContentControl,
        template: require("html/LoginPage/Controls/FidoHelpDialogContentControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = FidoHelpDialogContentControl;