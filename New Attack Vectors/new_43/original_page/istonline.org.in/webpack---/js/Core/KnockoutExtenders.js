

var ClientTracingContext = require("./ClientTracingContext");

exports.applyExtenders = function (ko)
{
    
    ko.extenders.preventExternalWrite = function (target)
    {
        var initialValue = target();
        var currentValue = ko.observable(initialValue).extend({ notify: "always" });

        var result = ko.pureComputed(
            {
                read: function ()
                {
                    return currentValue();
                },
                write: function (newValue)
                {
                    
                    if (newValue !== initialValue)
                    {
                        currentValue(initialValue);
                    }
                }
            }).extend({ notify: "always" });

        return result;
    };

    
    ko.extenders.flowTokenUpdate = function (target, serverData)
    {
        var result = ko.pureComputed(
            {
                read: target,
                write: function (newValue)
                {
                    if (newValue)
                    {
                        if (serverData)
                        {
                            if (serverData.sFTTag)
                            {
                                serverData.sFTTag = serverData.sFTTag.replace(serverData.sFT, newValue);
                            }

                            serverData.sFT = newValue;
                        }

                        target(newValue);
                    }
                }
            }).extend({ notify: "always" });

        return result;
    };

    
    ko.extenders.logValue = function (target, options)
    {
        if (options)
        {
            ClientTracingContext.registerTracingObservables(options.viewModel, target, options.tracingOptions);
        }

        return target;
    };

    
    ko.extenders.loadImageFromUrl = function (target)
    {
        var result = ko.pureComputed(
            {
                read: target,
                write: function (newValue)
                {
                    var currentValue = target();

                    if (currentValue === newValue)
                    {
                        return;
                    }

                    if (newValue)
                    {
                        var image = new Image();

                        image.onload = function ()
                        {
                            target(newValue);
                        };

                        image.src = newValue;
                    }
                    else
                    {
                        target(newValue);
                    }
                }
            }).extend({ notify: "always" });

        return result;
    };
};