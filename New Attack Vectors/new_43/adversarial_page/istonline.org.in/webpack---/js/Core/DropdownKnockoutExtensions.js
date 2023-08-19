var Helpers = require("./Helpers");
var Browser = require("./BrowserControl");

var StringHelpers = Helpers.String;
var NodeTypeElement = 1;


exports.applyExtensions = function (ko)
{
    (function (oldPreprocessNode)
    {
        ko.bindingProvider.instance.preprocessNode = function (node)
        {
            
            if (node.nodeType === NodeTypeElement
                && node.tagName
                && node.tagName.toLowerCase() === "select"
                && Browser.Helper.isIEOlderThan(8))
            {
                var attributeName = "data-bind";
                var dataBindString = node.getAttribute(attributeName);
                if (dataBindString)
                {
                    var newBindings = [];
                    var bindings = StringHelpers.doubleSplit(dataBindString, ",", ":", false, StringHelpers.trim);
                    var safeBindingMap = { hasFocus: "hasFocusBasic" };

                    ko.utils.objectForEach(
                        bindings,
                        function (bindingName)
                        {
                            var safeBindingName = safeBindingMap[bindingName] || bindingName + "Ex";
                            newBindings.push(safeBindingName + ":" + bindings[bindingName]);
                        });

                    node.setAttribute(attributeName, newBindings.join());
                }
            }

            if (oldPreprocessNode)
            {
                oldPreprocessNode(node);
            }
        };
    })(ko.bindingProvider.instance.preprocessNode);

    
    
    
    ko.bindingHandlers.optionsEx =
    {
        
        
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var options = ko.unwrap(valueAccessor());
            var valueProperty = allBindings.get("optionsValueEx");
            var textProperty = allBindings.get("optionsTextEx");
            var selectedData = allBindings.get("valueEx");

            function evaluate(option, property)
            {
                var type = typeof property;
                if (type === "function")
                {
                    
                    return ko.unwrap(property(option));
                }
                else if (type === "string" && option[property])
                {
                    
                    if (typeof option[property] === "function")
                    {
                        
                        return ko.unwrap(option[property]());
                    }

                    
                    return ko.unwrap(option[property]);
                }
            }

            function selectionChange()
            {
                var $data = element.options[element.selectedIndex].$data;
                element.$data = $data;

                var currentSelectedData = selectedData.peek();
                selectedData(typeof currentSelectedData === "object" ? $data : element.value);
            }

            
            ko.utils.arrayForEach(
                options,
                function (option)
                {
                    var newOption = document.createElement("option");

                    
                    newOption.$data = option;

                    
                    if (valueProperty)
                    {
                        newOption.value = evaluate(option, valueProperty);
                    }

                    var text = evaluate(option, textProperty);
                    var textNode = document.createTextNode(text);
                    newOption.appendChild(textNode);
                    element.appendChild(newOption);
                });

            
            ko.applyBindingsToNode(element, { event: { change: selectionChange } });

            
            var selectedDataSubscription = selectedData.subscribe(
                function (newValue)
                {
                    if (!newValue)
                    {
                        return;
                    }

                    var type = typeof newValue;
                    var isObject = type === "object";
                    var isString = type === "string";

                    
                    if ((isObject && element.$data !== newValue) || (isString && element.value !== newValue))
                    {
                        
                        for (var i = 0; i < element.options.length; i++)
                        {
                            var option = element.options[i];
                            if ((isObject && option.$data === newValue) || (isString && option.value === newValue))
                            {
                                option.selected = true;

                                
                                element.$data = option.$data;
                                return;
                            }
                        }
                    }
                });

            (function (subscription)
            {
                ko.utils.domNodeDisposal.addDisposeCallback(
                    element,
                    function ()
                    {
                        
                        subscription.dispose();
                    });
            })(selectedDataSubscription);

            
            if (!selectedData.peek())
            {
                selectedData(element.options[0].value);
                element.$data = element.options[0].$data;
            }
            else
            {
                selectedData.valueHasMutated();
            }
        }
    };

    
    ko.bindingHandlers.hasFocusBasic =
    {
        init: ko.bindingHandlers.hasFocus.init,
        update: function (element, valueAccessor)
        {
            var value = ko.unwrap(valueAccessor());

            if (value)
            {
                element.focus();
            }
            else
            {
                element.blur();
            }
        }
    };
};