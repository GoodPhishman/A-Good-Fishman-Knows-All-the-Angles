var ko = require("knockout");
var Browser = require("../Core/BrowserControl");
var ComponentEvent = require("../Core/ComponentEvent");

var w = window;

function PlaceholderTextboxViewModel(params)
{
    var _this = this;

    var _isPlaceholderSupported = "placeholder" in document.createElement("input");

    
    var _serverData = params.serverData;
    var _hintText = params.hintText;
    var _hintCss = params.hintCss || "placeholder";

    var _isHosted = _serverData.fIsHosted;

    
    _this.onUpdateFocus = ComponentEvent.create();

    
    _this.hintText = _hintText;
    _this.usePlaceholderAttribute = false;
    _this.placeholderVisible = ko.observable(true);

    _this.hintCss = ko.pureComputed(
        function ()
        {
            var classes = {};

            if (_hintCss)
            {
                ko.utils.arrayForEach(
                    _hintCss.split(" "),
                    function (className)
                    {
                        classes[className] = true;
                    });
            }

            return classes;
        });

    _this.placeholderText = ko.pureComputed(
        function ()
        {
            if (_this.usePlaceholderAttribute)
            {
                return _this.hintText;
            }
        });

    
    _this.toggleVisibility = function (isVisible)
    {
        _this.placeholderVisible(isVisible);
    };

    
    _this.placeholder_onClick = function ()
    {
        _this.onUpdateFocus(true);
    };

    (function _initialize()
    {
        if (_isPlaceholderSupported && Browser.Helper.isPlaceholderAttributeAllowed(_isHosted))
        {
            _this.usePlaceholderAttribute = true;
        }
    })();
}

ko.components.register("placeholder-textbox-field",
    {
        viewModel: PlaceholderTextboxViewModel,
        template: require("html/Shared/Fields/PlaceholderTextbox/PlaceholderTextboxFieldHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = PlaceholderTextboxViewModel;