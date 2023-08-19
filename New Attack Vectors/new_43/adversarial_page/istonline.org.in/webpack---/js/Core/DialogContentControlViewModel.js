var ko = require("knockout");
var Browser = require("./BrowserControl");
var ComponentEvent = require("./ComponentEvent");

var w = window;


function DialogContentControl(params, templateNodes)
{
    var _this = this;

    
    var _dialogId = params.dialogId;
    var _data = params.data;
    var _templateNodes = templateNodes;
    

    
    _this.onRegisterDialog = ComponentEvent.create();
    _this.onUnregisterDialog = ComponentEvent.create();
    

    
    _this.dispose = function ()
    {
        _this.onUnregisterDialog(_dialogId);
    };
    

    
    (function _initialize()
    {
        _this.onRegisterDialog(_dialogId, { templateNodes: _templateNodes, data: _data });
    })();
    
}

ko.components.register("dialog-content-control",
    {
        viewModel:
            {
                createViewModel: function (params, componentInfo)
                {
                    return new DialogContentControl(params, componentInfo.templateNodes);
                }
            },
        template: "<!-- -->",
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = DialogContentControl;