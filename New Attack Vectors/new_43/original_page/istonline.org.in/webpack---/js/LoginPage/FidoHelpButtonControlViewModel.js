var ko = require("knockout");
var Browser = require("../Core/BrowserControl");
var ComponentEvent = require("../Core/ComponentEvent");
var Constants = require("../Core/Constants");

var w = window;
var DialogId = Constants.DialogId;


function FidoHelpButtonControl(params)
{
    var _this = this;

    
    var _isPlatformAuthenticatorAvailable = params.isPlatformAuthenticatorAvailable;
    

    
    _this.onRegisterDialog = ComponentEvent.create();
    _this.onUnregisterDialog = ComponentEvent.create();
    _this.onShowDialog = ComponentEvent.create();
    

    
    _this.isPlatformAuthenticatorAvailable = _isPlatformAuthenticatorAvailable;

    _this.hasFocus = ko.observable(false);
    

    
    _this.fidoHelp_onClick = function ()
    {
        _this.onShowDialog(DialogId.FidoHelp)
            .then(
                function ()
                {
                    _this.hasFocus(true);
                });
    };
    
}

ko.components.register("fido-help-button-control",
    {
        viewModel: FidoHelpButtonControl,
        template: require("html/LoginPage/Controls/FidoHelpButtonControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = FidoHelpButtonControl;