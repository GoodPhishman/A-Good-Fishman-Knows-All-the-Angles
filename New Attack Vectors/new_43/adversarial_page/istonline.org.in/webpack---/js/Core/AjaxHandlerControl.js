var JSON = require("JSON");
var Browser = require("./BrowserControl");
var Helpers = require("./Helpers");

var ObjectHelpers = Helpers.Object;
var HttpCode = Browser.HttpCode;

var w = window;

exports.RequestType =
{
    Post: "POST",
    Get: "GET"
};

var AjaxState = exports.State =
{
    Unsupported: -1,
    Unsent: 0,
    Done: 4,
    Timeout: 5
};

exports.Event =
{
    OnSuccess: "ajaxsuccess",
    OnError: "ajaxerror",
    OnTimeout: "ajaxtimeout"
};

exports.Helper =
{
    
    generateRequestString: function (requestData)
    {
        var requestString = "";
        if (requestData)
        {
            ObjectHelpers.forEach(
                requestData,
                function (key, value)
                {
                    if (value || value === "")
                    {
                        if (requestString.length > 0)
                        {
                            requestString += "&";
                        }

                        requestString += key + "=" + value;
                    }
                });
        }

        return requestString;
    }
};


exports.Handler = function (params)
{
    var _this = this;
    var c_contentType = "Content-type";

    var _response = "";
    var _httpSuccessCodes = [];
    var _event = null;
    var _ajaxRequest = null;
    var _isTimedOut = false;
    var _isSupported = true;
    var _timeoutObject = null;
    var _isCrossDomain = false;

    var _hasContentTypeParam = !!params.contentType;
    var _hasHeadersParam = !!params.headers;
    var _hasHeaderValueParam = !!params.headerValue;

    var _data = params.data || "";
    var _targetUrl = params.targetUrl || "";
    var _requestType = params.requestType || "";
    var _isAsync = params.isAsync !== false;
    var _timeout = params.timeout || 0;
    var _username = params.username || "";
    var _password = params.password || "";
    var _contentType = params.contentType || "application/x-www-form-urlencoded";
    var _withCredentials = params.withCredentials || false;
    var _breakCache = params.breakCache || false;
    var _responseType = params.responseType || "";
    var _headers = params.headers || {};

    var _successCallback = params.successCallback;
    var _failureCallback = params.failureCallback;
    var _timeoutCallback = params.timeoutCallback;

    

    
    _this.sendRequest = function (event)
    {
        _event = event;
        _initializeRequest();

        if (_isSupported)
        {
            if (_timeout > 0)
            {
                _timeoutObject = setTimeout(function () { _onTimeout.call(_this); }, _timeout);
            }

            _ajaxRequest.send(_data);
        }
    };

    
    _this.getState = function ()
    {
        if (!_isSupported)
        {
            return AjaxState.Unsupported;
        }

        if (_isTimedOut)
        {
            return AjaxState.Timeout;
        }

        if (_ajaxRequest)
        {
            return _ajaxRequest.readyState;
        }

        return AjaxState.Unsent;
    };

    
    _this.getStatus = function ()
    {
        if (_isTimedOut)
        {
            return HttpCode.Timeout;
        }

        if (_ajaxRequest)
        {
            return _ajaxRequest.status;
        }

        return 0;
    };

    
    _this.cancel = function ()
    {
        if (_ajaxRequest)
        {
            _ajaxRequest.canceled = true;
            _ajaxRequest.abort();
        }
    };

    
    _this.getResponseJson = function ()
    {
        return _response ? JSON.parse(_response) : {};
    };

    
    _this.isComplete = function ()
    {
        return (_this.getState() === AjaxState.Done || _this.getState() === AjaxState.Timeout);
    };

    
    _this.isSuccess = function ()
    {
        return (_this.isComplete() && _httpSuccessCodes[_this.getStatus()]);
    };

    
    _this.clearResponse = function ()
    {
        _response = "";
    };

    
    function _onCompletion(successOverride, failOverride)
    {
        if (successOverride || _this.isSuccess())
        {
            if (_successCallback)
            {
                _successCallback(_event, _response);
            }
        }
        else if (failOverride || (!_this.isSuccess() && !_isTimedOut))
        {
            if (_failureCallback)
            {
                _failureCallback(_event, _ajaxRequest, _ajaxRequest.statusText);
            }
        }
    }

    
    function _onTimeout()
    {
        _timeoutObject = null;
        _isTimedOut = true;
        _this.cancel();

        if (_timeoutCallback)
        {
            var timeoutXhr =
            {
                status: HttpCode.Timeout,
                statusText: "timeout"
            };

            _timeoutCallback(_event, timeoutXhr, timeoutXhr.statusText);
        }
    }

    
    function _onAbort(event)
    {
        _clearTimeout();

        
        
        if (!_this.isComplete() && !_ajaxRequest.canceled && _failureCallback)
        {
            var abortXhr =
            {
                status: HttpCode.ClientClosedRequest,
                statusText: "abort"
            };

            _failureCallback(event, abortXhr, abortXhr.statusText);
        }
    }

    
    function _onError(event)
    {
        
        if (!_this.isComplete())
        {
            _setResponseAndComplete(event);
        }
    }

    
    function _evt_readyState_onchange(event)
    {
        
        
        
        if (_this.isComplete() && !_isTimedOut)
        {
            _setResponseAndComplete(event);
        }
    }

    
    function _setResponseAndComplete(event)
    {
        _clearTimeout();

        _response = _ajaxRequest.responseText;
        _event = event;
        _onCompletion();
    }

    
    function _clearTimeout()
    {
        if (_timeoutObject)
        {
            clearTimeout(_timeoutObject);
            _timeoutObject = null;
        }
    }

    
    function _initializeRequest()
    {
        _isTimedOut = false;

        var xhrSupportsCORS = "withCredentials" in new XMLHttpRequest();
        if (!_isCrossDomain || xhrSupportsCORS)
        {
            var targetUrl = _targetUrl;

            _ajaxRequest = new XMLHttpRequest();
            _ajaxRequest.onreadystatechange = _evt_readyState_onchange;

            if (_ajaxRequest.addEventListener)
            {
                _ajaxRequest.addEventListener("abort", _onAbort);
                _ajaxRequest.addEventListener("error", _onError);
            }

            if (_breakCache)
            {
                targetUrl = Browser.QueryString.appendOrReplace(targetUrl, "_", (new Date()).getTime());
            }

            if (_username.length > 0)
            {
                _ajaxRequest.open(_requestType, targetUrl, _isAsync, _username, _password);
            }
            else
            {
                _ajaxRequest.open(_requestType, targetUrl, _isAsync);
            }

            _this.clearResponse();

            ObjectHelpers.forEach(
                _headers,
                function (headerName, headerValue)
                {
                    _ajaxRequest.setRequestHeader(headerName, headerValue);
                });

            _ajaxRequest.responseType = _responseType;
            _ajaxRequest.withCredentials = _withCredentials;
        }
        else if (w.XDomainRequest)
        {
            if (!_isAsync || _username || _password || _hasContentTypeParam || _hasHeadersParam || _hasHeaderValueParam || _withCredentials)
            {
                
                
                _isSupported = false;
            }
            else
            {
                _ajaxRequest = new w.XDomainRequest();
                _ajaxRequest.onerror = function () { _requestCompleted(false); };
                _ajaxRequest.onload = function () { _requestCompleted(true); };

                _ajaxRequest.open(_requestType, _targetUrl);
                _this.clearResponse();
            }
        }
        else
        {
            _isSupported = false;
        }
    }

    
    function _requestCompleted(success)
    {
        _clearTimeout();
        _response = _ajaxRequest.responseText;
        _onCompletion(success, !success);
    }

    (function _initialize()
    {
        _headers[c_contentType] = _contentType;

        _httpSuccessCodes[HttpCode.Ok] = true;
        _httpSuccessCodes[HttpCode.NotModified] = true;
        _httpSuccessCodes[HttpCode.Timeout] = false;

        var targetUrlDomain = Helpers.String.extractDomainFromUrl(_targetUrl);
        if (targetUrlDomain)
        {
            _isCrossDomain = Helpers.String.extractDomainFromUrl(document.location.href) !== targetUrlDomain;
        }
    })();
};