var Promise = require("./Promise");


exports.throwUnhandledExceptionOnRejection = function (promise)
{
    promise["catch"](
        function (error)
        {
            var ex = error;

            if (!(error instanceof Error))
            {
                ex = new Error("Unhandled Promise rejection: " + error);
            }

            
            
            setTimeout(
                function ()
                {
                    throw ex;
                }, 0);
        });
};


exports.newPromiseWithTimeout = function (func, timeout, result)
{
    return new Promise(
        function (resolve, reject)
        {
            Promise.resolve(func()).then(resolve, reject);
            setTimeout(function () { resolve(result); }, timeout);
        }
    );
};