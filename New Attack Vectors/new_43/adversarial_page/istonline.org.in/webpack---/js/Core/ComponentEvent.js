var ko = require("knockout");


exports.create = function (tracingOptions)
{
    var handlerResponse;
    var triggered = false;

    function event()
    {
        triggered = true;

        
        
        event.eventArgs(Array.prototype.slice.call(arguments));

        return handlerResponse;
    }

    event.eventArgs = ko.observable().extend({ notify: "always" });

    event.tracingOptions = tracingOptions;

    event.subscribe = function (callback)
    {
        event.eventArgs.subscribe(
            function (eventArgsValue)
            {
                handlerResponse = callback(eventArgsValue);
            });

        if (triggered)
        {
            handlerResponse = callback(event.eventArgs.peek());
        }
    };

    return event;
};

exports.isComponentEvent = function (event)
{
    return event && ko.isObservable(event.eventArgs);
};