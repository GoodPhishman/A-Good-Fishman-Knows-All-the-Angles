
exports.applyExtensions = function (ko)
{
    ko.bindingHandlers.copySource =
    {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var textareaId = ko.unwrap(valueAccessor());
            var textarea = document.getElementById(textareaId);

            if (!textarea)
            {
                textarea = document.createElement("textarea");
                textarea.id = textareaId;
                document.body.appendChild(textarea);

                ko.bindingHandlers.moveOffScreen.update(
                    textarea,
                    function ()
                    {
                        return true;
                    }
                );
            }

            ko.bindingEvent.subscribe(
                element,
                "descendantsComplete",
                function ()
                {
                    textarea.value = element.innerText;
                });

            
            var innerBindingContext = ko.bindingEvent.startPossiblyAsyncContentBinding(element, bindingContext);

            ko.applyBindingsToDescendants(innerBindingContext, element);

            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers.clickToCopy =
    {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var copyConfig = ko.unwrap(valueAccessor());
            var textareaId = copyConfig.textareaId;
            var showNotificationObservable = copyConfig.showNotification;

            ko.bindingHandlers.click.init(
                element,
                function ()
                {
                    return function ()
                    {
                        copyToClipboard(textareaId, showNotificationObservable, element);
                    };
                },
                allBindings,
                viewModel,
                bindingContext);
        }
    };
};

function copyToClipboard(textareaId, showNotificationObservable, element)
{
    var textarea = document.getElementById(textareaId);
    if (!textarea)
    {
        return;
    }

    textarea.select();

    document.execCommand("copy");
    element.focus();

    showCopyNotification(showNotificationObservable);
}

function showCopyNotification(showNotificationObservable)
{
    if (showNotificationObservable())
    {
        showNotificationObservable(false);
    }

    setTimeout(function ()
    {
        showNotificationObservable(true);
    }, 0);
}