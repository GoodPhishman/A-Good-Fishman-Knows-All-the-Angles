
var w = window;


var Promise = null;
var iteratePromises = null;
var createPromiseAllHandlerFunction = null;
var createPromiseRaceCallResolveFunction = null;
var PromiseStatePending = 0;
var PromiseStateFulfilled = 1;
var PromiseStateRejected = 2;

if (__IS_OLD_WEBPACK__)
{
    Promise = function (executor)
    {
        var _this = this;

        var _state = PromiseStatePending;
        var _settledValue = null;
        var _queue = [];

        _this.then = function (onFulfilled, onRejected)
        {
            return new Promise(
                function (resolve, reject)
                {
                    
                    
                    _enqueue(onFulfilled, onRejected, resolve, reject);
                });
        };

        _this["catch"] = function (onRejected)
        {
            return _this.then(null, onRejected);
        };

        function _enqueue(onFulfilled, onRejected, resolve, reject)
        {
            _queue.push(
                function ()
                {
                    var value;

                    try
                    {
                        
                        
                        
                        if (_state === PromiseStateFulfilled)
                        {
                            value = typeof onFulfilled === "function" ? onFulfilled(_settledValue) : _settledValue;
                        }
                        else
                        {
                            value = typeof onRejected === "function" ? onRejected(_settledValue) : _settledValue;
                        }
                    }
                    catch (error)
                    {
                        
                        
                        reject(error);
                        return;
                    }

                    if (value instanceof Promise)
                    {
                        
                        
                        value.then(resolve, reject);
                    }
                    else if (_state === PromiseStateRejected && typeof onRejected !== "function")
                    {
                        
                        
                        reject(value);
                    }
                    else
                    {
                        
                        
                        
                        
                        
                        resolve(value);
                    }
                });

            
            
            if (_state !== PromiseStatePending)
            {
                _processQueue();
            }
        }

        function _processQueue()
        {
            if (_queue.length > 0)
            {
                
                
                var pending = _queue.slice();
                _queue = [];

                setTimeout(
                    function ()
                    {
                        for (var i = 0, len = pending.length; i < len; ++i)
                        {
                            pending[i]();
                        }
                    }, 0);
            }
        }

        function _resolve(value)
        {
            if (_state === PromiseStatePending)
            {
                _settledValue = value;
                _state = PromiseStateFulfilled;
                _processQueue();
            }
        }

        function _reject(reason)
        {
            if (_state === PromiseStatePending)
            {
                _settledValue = reason;
                _state = PromiseStateRejected;
                _processQueue();
            }
        }

        (function _initialize()
        {
            if (typeof executor !== "function")
            {
                throw new TypeError("Promise: argument is not a Function object");
            }

            try
            {
                executor(_resolve, _reject);
            }
            catch (error)
            {
                
                
                _reject(error);
            }
        })();
    };

    createPromiseAllHandlerFunction = function (values, index, doneCheck, rejectOnError, isFulfilled)
    {
        
        
        
        
        
        
        
        
        
        
        

        var fn =
            function (value)
            {
                
                
                
                if (rejectOnError)
                {
                    values[index] = value;
                }
                else
                {
                    if (isFulfilled)
                    {
                        values[index] = { status: "fulfilled", value: value };
                    }
                    else
                    {
                        values[index] = { status: "rejected", reason: value };
                    }
                }

                doneCheck();
            };

        return fn;
    };

    iteratePromises = function (iterable, rejectOnError)
    {
        if (!iterable || !iterable.length)
        {
            
            
            return Promise.resolve([]);
        }

        return new Promise(
            function (resolve, reject)
            {
                var values = [];
                var pending = 0;

                for (var i = 0, len = iterable.length; i < len; ++i)
                {
                    var item = iterable[i];

                    
                    
                    
                    
                    
                    
                    
                    if (item instanceof Promise)
                    {
                        pending++;

                        var doneCheck =
                            function ()
                            {
                                if (--pending === 0)
                                {
                                    resolve(values);
                                }
                            };

                        
                        
                        
                        if (rejectOnError)
                        {
                            item.then(
                                createPromiseAllHandlerFunction(values, i, doneCheck, rejectOnError),
                                reject);
                        }
                        else
                        {
                            item.then(
                                createPromiseAllHandlerFunction(values, i, doneCheck, rejectOnError, true),
                                createPromiseAllHandlerFunction(values, i, doneCheck, rejectOnError, false));
                        }
                    }
                    else
                    {
                        values[i] = item;
                    }
                }

                
                
                
                if (pending === 0)
                {
                    setTimeout(
                        function ()
                        {
                            resolve(values);
                        }, 0);
                }
            });
    };

    Promise.all = function (iterable)
    {
        return iteratePromises(iterable, true);
    };

    Promise.allSettled = function (iterable)
    {
        return iteratePromises(iterable, false);
    };

    createPromiseRaceCallResolveFunction = function (resolve, item)
    {
        
        
        
        
        
        

        var fn =
            function ()
            {
                resolve(item);
            };

        return fn;
    };

    Promise.race = function (iterable)
    {
        return new Promise(
            function (resolve, reject)
            {
                
                
                if (!iterable || !iterable.length)
                {
                    return;
                }

                for (var i = 0, len = iterable.length; i < len; ++i)
                {
                    var item = iterable[i];

                    
                    
                    
                    
                    
                    
                    
                    if (item instanceof Promise)
                    {
                        item.then(resolve, reject);
                    }
                    else
                    {
                        setTimeout(
                            createPromiseRaceCallResolveFunction(resolve, item), 0);
                    }
                }
            });
    };

    Promise.reject = function (reason)
    {
        return new Promise(
            function (resolve, reject)
            {
                reject(reason);
            });
    };

    Promise.resolve = function (value)
    {
        if (value instanceof Promise)
        {
            
            return value;
        }
        else if (value && typeof value.then === "function")
        {
            
            
            return new Promise(
                function (resolve, reject)
                {
                    value.then(resolve, reject);
                });
        }

        
        
        return new Promise(
            function (resolve)
            {
                resolve(value);
            });
    };

    var promise = w.Promise || Promise;

    if (!promise.all)
    {
        promise.all = Promise.all;
    }

    if (!promise.allSettled)
    {
        promise.allSettled = Promise.allSettled;
    }

    if (!promise.race)
    {
        promise.race = Promise.race;
    }

    if (!promise.reject)
    {
        promise.reject = Promise.reject;
    }

    if (!promise.resolve)
    {
        promise.resolve = Promise.resolve;
    }

    module.exports = promise;
}
else
{
    module.exports = w.Promise;
}