var ko = require("knockout");
var Constants = require("./Constants");
var Browser = require("./BrowserControl");
var ComponentEvent = require("./ComponentEvent");

var w = window;
var BrowserHelper = Browser.Helper;
var KeyCode = Constants.KeyCode;


function DialogControl(params)
{
    var _this = this;

    
    var _data = params.data;
    var _templateNodes = params.templateNodes;
    

    
    _this.data = _data;
    _this.templateNodes = _templateNodes;
    

    
    _this.onClose = ComponentEvent.create();
    

    
    _this.dispose = function ()
    {
        BrowserHelper.removeEventListener(document.body, "keydown", _body_onKeyDown);
    };
    

    
    _this.overlay_onClick = function ()
    {
        
        
        return true;
    };

    _this.primaryButton_onClick = function ()
    {
        _this.onClose();
    };
    

    
    function _body_onKeyDown(e)
    {
        e = e || w.event;

        if (e.code === "Escape" || e.keyCode === KeyCode.Escape)
        {
            _this.onClose();
        }
    }

    (function _initialize()
    {
        BrowserHelper.addEventListener(document.body, "keydown", _body_onKeyDown);
    })();
    
}

ko.components.register("dialog-control",
    {
        viewModel: DialogControl,
        template: require("html/Shared/Controls/DialogControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = DialogControl;