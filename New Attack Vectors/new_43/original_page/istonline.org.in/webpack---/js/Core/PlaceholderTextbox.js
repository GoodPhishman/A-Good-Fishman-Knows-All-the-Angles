var ko = require("knockout");
var Helpers = require("../Core/Helpers");

var StringHelpers = Helpers.String;

module.exports = function (errorComputed, defaultValue)
{
    var _this = this;

    var _valueSubscription = null;

    _this.placeholderTextboxMethods = ko.observable();
    
    _this.value = ko.observable(defaultValue || "");
    _this.focused = ko.observable(false).extend({ notify: "always" });
    _this.error = errorComputed;

    _this.textbox_onUpdateFocus = function (isFocused)
    {
        _this.focused(isFocused);
    };

    _this.getTrimmedValue = function (maxLength)
    {
        var trimmedValue = StringHelpers.trim(_this.value() || "");

        if (maxLength && maxLength > 0)
        {
            trimmedValue = trimmedValue.substring(0, maxLength);
        }

        return trimmedValue;
    };

    function _setupPlaceholderVisibility(placeholderTextboxMethods)
    {
        
        var currentValue = _this.value.peek();
        placeholderTextboxMethods.toggleVisibility(!currentValue);

        _valueSubscription = _this.value.subscribe(
            function (value)
            {
                
                placeholderTextboxMethods.toggleVisibility(!value);
            });
    }

    (function _initialize()
    {
        
        _this.placeholderTextboxMethods.subscribe(
            function (placeholderTextboxMethods)
            {
                if (placeholderTextboxMethods && !_valueSubscription)
                {
                    _setupPlaceholderVisibility(placeholderTextboxMethods);
                }
            }
        );
    })();
};