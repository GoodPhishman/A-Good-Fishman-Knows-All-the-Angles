var ko = require("knockout");


exports.errorComputed = function (getClientErrorCallback)
{
    var _asyncBlockingError = ko.observable();
    var _asyncNonBlockingError = ko.observable();
    var _clientError = ko.pureComputed(getClientErrorCallback).extend({ notify: "always" });

    var _blockingError = ko.pureComputed(
        function ()
        {
            if (_clientError())
            {
                return _clientError();
            }

            if (_asyncBlockingError())
            {
                var error = _asyncBlockingError();
                _asyncBlockingError(null);
                return error;
            }

            return null;
        });

    return ko.utils.extend(
        ko.pureComputed(
            function ()
            {
                if (_blockingError())
                {
                    return _blockingError();
                }

                if (_asyncNonBlockingError())
                {
                    var error = _asyncNonBlockingError();
                    _asyncNonBlockingError(null);
                    return error;
                }

                return null;
            }
        ),
        {
            isBlocking: function ()
            {
                return _blockingError() !== null;
            },

            setBlockingError: function (errorString)
            {
                _asyncBlockingError(errorString);
            },

            setNonBlockingError: function (errorString)
            {
                _asyncNonBlockingError(errorString);
            },

            setError: function (errorString, isBlockingError)
            {
                if (isBlockingError)
                {
                    _asyncBlockingError(errorString);
                }
                else
                {
                    _asyncNonBlockingError(errorString);
                }
            },

            clearNonBlockingError: function ()
            {
                _asyncNonBlockingError(null);

                
                _asyncNonBlockingError.valueHasMutated();
            }
        });
};