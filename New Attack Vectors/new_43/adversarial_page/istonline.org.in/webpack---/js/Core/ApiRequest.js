var JSON = require("JSON");
var Ajax = require("./AjaxHandlerControl");
var Constants = require("./Constants");
var Helpers = require("./Helpers");
var Browser = require("./BrowserControl");
var ClientTracingHelper = require("./ClientTracingHelper").getInstance(window.ServerData);
var ClientTracingConstants = require("./ClientTracingConstants");

var w = window;
var $config = w.$Config || w.ServerData || {};

var ObjectHelpers = Helpers.Object;
var QueryString = Browser.QueryString;


module.exports = function (params)
{
    params = params || {};

    var _this = this;

    var c_requestTimeout = 30000; 

    var c_callGenericErrorCode = 8000;
    var c_callTimeoutErrorCode = 8001;
    var c_callAbortedErrorCode = 8002;

    var c_maxErrors = 100;
    var c_correlationIdHeader = "client-request-id";
    var c_acceptHeader = "application/json";

    
    var _checkApiCanary = params.checkApiCanary !== false;
    var _withCredentials = params.withCredentials || false;
    var _breakCache = params.breakCache || false;
    var _responseType = params.responseType || "";
    var _notifyOnClientAbort = params.notifyOnClientAbort || false;

    
    _this.Errors = [];

    

    

    
    _this.Json = function (requestData, postData, successCallback, failureCallback, requestTimeout)
    {
        
        var expectResponse = !!(successCallback || failureCallback);
        var startTime = (new Date()).getTime();

        var requestUrl = requestData.url;

        
        function _parseError(xhr, textStatus)
        {
            var response = {};

            
            if (xhr.status === 500)
            {
                try
                {
                    response = (JSON.parse(xhr.responseText) || {});
                }
                catch (e) {  }
            }

            
            if (!response.error)
            {
                
                var isFatal = false;
                var code = c_callGenericErrorCode;
                var message = "Request Failed -- No Response from Server";

                
                switch (textStatus)
                {
                    case "timeout":
                        code = c_callTimeoutErrorCode;
                        message = "Timeout Error";
                        isFatal = true;
                        break;

                    case "abort":
                        code = c_callAbortedErrorCode;
                        message = "Aborted";
                        break;

                    case "error":
                        if (xhr.status >= 400)
                        {
                            isFatal = true;
                        }

                        break;

                    case "parsererror":
                        message = "Unable to parse response";
                        isFatal = true;
                        break;
                }

                response.error =
                    {
                        code: code,
                        message: message,
                        debugMessage: "(xhr status " + xhr.status + ") xhr.responseText: " + xhr.responseText,
                        stackTrace: "",
                        isFatal: isFatal
                    };
            }

            return response;
        }

        
        function _handleResponse(dataObject)
        {
            
            dataObject = dataObject || {};

            var stackTrace;
            var error = dataObject.error || null;

            var requestStats =
                {
                    startTime: startTime,
                    endTime: (new Date()).getTime()
                };

            if (dataObject.apiCanary)
            {
                
                $config.apiCanary = dataObject.apiCanary;
                delete dataObject.apiCanary;
            }

            if (error)
            {
                stackTrace = error.stackTrace;
                stackTrace = (stackTrace && stackTrace.encodeJson) ? stackTrace.encodeJson() : "";

                var errorString = JSON.stringify(
                    {
                        code: error.code,
                        message: error.message,
                        debug: error.debugMessage,
                        stacktrace: stackTrace,
                        requestUrl: requestUrl
                    });

                _this.Errors.push(errorString);

                if (_this.Errors.length > c_maxErrors)
                {
                    _this.Errors.shift();
                }

                
                
                if (error.code !== c_callAbortedErrorCode || _notifyOnClientAbort)
                {
                    if (failureCallback)
                    {
                        failureCallback(dataObject, requestStats);
                    }
                }
            }
            else if (successCallback)
            {
                successCallback(dataObject, requestStats);
            }
        }

        function _failRequest()
        {
            
            setTimeout(
                function ()
                {
                    var response =
                        {
                            error:
                                {
                                    code: c_callAbortedErrorCode,
                                    message: "Request Failed!",
                                    isFatal: true
                                }
                        };

                    _handleResponse(response);
                }, 0);

            
            return null;
        }

        if (_checkApiCanary && !$config.apiCanary)
        {
            
            
            return _failRequest();
        }

        var jsonPostData = _constructJsonPostData(postData);

        _this.Post(
            requestData,
            Constants.ContentType.Json,
            jsonPostData,
            function (ev, dataString)
            {
                if (expectResponse)
                {
                    var dataObject = JSON.parse(dataString);
                    _handleResponse(dataObject);
                }
            },
            function (ev, xhr, textStatus, errorThrown)
            {
                if (expectResponse)
                {
                    _handleResponse(_parseError(xhr, textStatus, errorThrown));
                }
            },
            requestTimeout);
    };

    
    _this.Post = function (requestData, contentType, postDataString, successCallback, failureCallback, requestTimeout)
    {
        var requestUrl = requestData.url;
        var tracingObject = {};
        var noCallback = false;

        if (!successCallback && !failureCallback)
        {
            noCallback = true;
        }

        _traceBeginRequest(tracingObject, requestData, Ajax.RequestType.Post, requestTimeout, contentType, noCallback);

        var ajaxParams =
            {
                targetUrl: requestUrl,
                contentType: contentType,
                data: postDataString,
                requestType: Ajax.RequestType.Post,
                timeout: requestTimeout || c_requestTimeout,
                successCallback: function (ev, dataString)
                {
                    _traceEndRequest(
                        tracingObject,
                        "Success",
                        dataString,
                        true ,
                        function ()
                        {
                            if (successCallback)
                            {
                                successCallback(ev, dataString);
                            }
                        });
                },
                failureCallback: function (ev, xhr, textStatus)
                {
                    _traceEndRequest(
                        tracingObject,
                        "Failed",
                        _getErrorForTrace(xhr, textStatus),
                        false  ,
                        function ()
                        {
                            if (failureCallback)
                            {
                                failureCallback(ev, xhr, textStatus);
                            }
                        });
                },
                timeoutCallback: function (ev, xhr, textStatus)
                {
                    _traceEndRequest(
                        tracingObject,
                        "Timeout",
                        _getErrorForTrace(xhr, textStatus),
                        false  ,
                        function ()
                        {
                            if (failureCallback)
                            {
                                failureCallback(ev, xhr, textStatus);
                            }
                        });
                }
            };

        _addCommonRequestParameters(ajaxParams);

        Ajax.Handler.call(_this, ajaxParams);
        _this.sendRequest();
    };

    
    _this.Get = function (requestData, contentType, successCallback, failureCallback, requestTimeout)
    {
        var requestUrl = requestData.url;
        var tracingObject = {};
        var noCallback = false;
        if (!successCallback && !failureCallback)
        {
            noCallback = true;
        }

        _traceBeginRequest(tracingObject, requestData, Ajax.RequestType.Get, requestTimeout, contentType, noCallback);
        var ajaxParams =
            {
                targetUrl: requestUrl,
                contentType: contentType,
                requestType: Ajax.RequestType.Get,
                timeout: requestTimeout || c_requestTimeout,
                successCallback: function (ev, dataString)
                {
                    _traceEndRequest(
                        tracingObject,
                        "Success",
                        dataString,
                        true ,
                        function ()
                        {
                            if (successCallback)
                            {
                                successCallback(ev, dataString);
                            }
                        });
                },
                failureCallback: function (ev, xhr, textStatus)
                {
                    _traceEndRequest(
                        tracingObject,
                        "Failed",
                        _getErrorForTrace(xhr, textStatus),
                        false ,
                        function ()
                        {
                            if (failureCallback)
                            {
                                failureCallback(ev, xhr, textStatus);
                            }
                        });
                },
                timeoutCallback: function (ev, xhr, textStatus)
                {
                    _traceEndRequest(
                        tracingObject,
                        "Timeout",
                        _getErrorForTrace(xhr, textStatus),
                        false ,
                        function ()
                        {
                            if (failureCallback)
                            {
                                failureCallback(ev, xhr, textStatus);
                            }
                        });
                }
            };

        _addCommonRequestParameters(ajaxParams);

        Ajax.Handler.call(_this, ajaxParams);
        _this.sendRequest();
    };

    
    _this.Beacon = function (requestData, postData, successCallback, failureCallback, requestTimeout)
    {
        var qsParams = [];
        var headers = _constructCommonHeaders(true );

        ObjectHelpers.forEach(
            headers,
            function (key, value)
            {
                qsParams.push([key, value]);
            });

        
        var requestUrl = requestData.url;
        requestUrl = QueryString.add(requestUrl, qsParams);
        requestData.url = requestUrl;
        if (navigator.sendBeacon)
        {
            var tracingObject = {};
            var noCallback = false;
            _traceBeginRequest(tracingObject, requestData, "Beacon", requestTimeout, null, noCallback);

            var jsonPostData = _constructJsonPostData(postData);

            var result = navigator.sendBeacon(requestUrl, jsonPostData);

            
            _traceEndRequest(
                tracingObject,
                result ? "Success" : "Failed",
                null,
                result,
                function ()
                {
                    if (result && successCallback)
                    {
                        successCallback();
                    }
                    else if (!result && failureCallback)
                    {
                        failureCallback();
                    }
                });
        }
        else
        {
            _this.Json(requestData, postData, successCallback, failureCallback, requestTimeout);
        }
    };

    

    
    function _constructCommonHeaders(constructForQueryString)
    {
        var headers =
            {
                hpgid: $config.hpgid || 0,
                hpgact: $config.hpgact || 0    
            };

        if (!constructForQueryString)
        {
            headers.Accept = c_acceptHeader;

            if (_checkApiCanary && $config.apiCanary)
            {
                headers.canary = $config.apiCanary;
            }
        }

        if ($config.correlationId)
        {
            headers[c_correlationIdHeader] = $config.correlationId;
        }

        if ($config.sessionId)
        {
            headers.hpgrequestid = $config.sessionId;
        }

        return headers;
    }

    
    function _constructJsonPostData(postData)
    {
        
        var jsonPostData = postData;
        if (postData && !_isString(postData))
        {
            
            
            
            var data = {};

            ObjectHelpers.forEach(
                postData,
                function (key, value)
                {
                    if (key.substr(0, 7) === "unsafe_")
                    {
                        key = key.substr(7);
                    }

                    data[key] = value;
                });

            jsonPostData = JSON.stringify(data);
        }

        
        if (jsonPostData)
        {
            jsonPostData = jsonPostData.replace(/\?/g, "\\u003F");
        }

        return jsonPostData;
    }

    
    function _addCommonRequestParameters(ajaxParams)
    {
        ajaxParams.headers = _constructCommonHeaders();
        ajaxParams.withCredentials = _withCredentials;
        ajaxParams.breakCache = _breakCache;
        ajaxParams.responseType = _responseType;
    }

    
    function _isString(obj)
    {
        return typeof obj === "string";
    }

    function _traceBeginRequest(tracingObject, requestData, requestType, requestTimeout, contentType, noCallback)
    {
        var eventData = null;
        if (requestData)
        {
            var eventOptions = requestData.eventOptions || {};
            eventOptions.eventId = requestData.eventId || eventOptions.eventId;
            if (!eventOptions.hasOwnProperty("hidingMode"))
            {
                eventOptions.hidingMode = ClientTracingConstants.HidingMode.None;
            }

            if (eventOptions.eventId)
            {
                eventData = {};
                eventData.eventType = requestType;
                eventData.eventId = eventOptions.eventId;
                eventData.eventLevel = eventOptions.eventLevel || ClientTracingConstants.EventLevel.ApiRequest;
                var eventArgs = {};
                eventArgs.requestTimeout = requestTimeout;
                if (contentType)
                {
                    eventArgs.contentType = contentType;
                }

                eventArgs.requestType = requestType;

                if (noCallback)
                {
                    eventArgs.noCallback = true;
                }

                eventData.eventArgs = eventArgs;
                eventData.eventOptions = eventOptions;

                ClientTracingHelper.traceBeginRequest(tracingObject, eventData);
            }
        }

        tracingObject.eventData = eventData;
    }

    function _traceEndRequest(tracingObject, result, data, succeeded, handler)
    {
        ClientTracingHelper.traceEndRequest(tracingObject, result, data, succeeded, handler);
    }

    function _getErrorForTrace(xhr, textStatus)
    {
        var error = {};
        if (xhr)
        {
            error.xhr_status = xhr.status;
        }

        error.textStatus = textStatus;
        return error;
    }
};