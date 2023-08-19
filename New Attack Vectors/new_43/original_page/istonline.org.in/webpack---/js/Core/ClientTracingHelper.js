var ClientTracingConstants = require("./ClientTracingConstants");
var ClientTracingContext = require("./ClientTracingContext");
var Helpers = require("./Helpers");
var Promise = require("../Core/Promise");


function ClientTracingHelper(tracingConfig)
{
    var _this = this;
    var _initializingTime = Helpers.DateTime.getCurrentTime();
    var _tracingEnabled = _getIfTracingEnabled();
    var _clientTracing = null;

    
    
    

    
    _this.createLoadClientTracingPromise = function ()
    {
        var loadClientTracingPromise = new Promise(
            function (resolve)
            {
                if (_tracingEnabled && !_clientTracing)
                {
                    require.ensure([],
                        function ()
                        {
                            var clientTracing = require("./ClientTracing").getInstance(tracingConfig, _initializingTime);

                            if (!_clientTracing)
                            {
                                _clientTracing = clientTracing;
                            }

                            resolve();
                        },
                        "ClientTracing"); 
                }
                else
                {
                    resolve();
                }
            });

        return loadClientTracingPromise;
    };

    
    _this.logRedirection = function (redirectData, parameters)
    {
        var url = redirectData;
        var eventOptions = null;
        if (redirectData && typeof(redirectData) !== "string")
        {
            url = redirectData.url;
            eventOptions = redirectData.eventOptions;
            parameters = redirectData.traceParameters ? parameters : null;

            if (redirectData.traceUrl)
            {
                
                if (!parameters)
                {
                    parameters = url;
                }
                else
                {
                    parameters.url = url;
                }
            }
        }
        else
        {
            parameters = null;
        }

        if (eventOptions && eventOptions.eventId)
        {
            _this.logEvent(
                {
                    eventType: "onRedirect",
                    eventId: eventOptions.eventId,
                    eventLevel: eventOptions.eventLevel,
                    eventArgs: parameters,
                    eventOptions: eventOptions
                });
        }

        return url;
    };

    
    
    _this.getPropertyLogOption = function (viewModel, tracingOptions)
    {
        tracingOptions = tracingOptions || {};

        if (!tracingOptions.hasOwnProperty("tracingPropertyChange"))
        {
            tracingOptions.tracingPropertyChange = true;
        }

        tracingOptions.eventLevel = tracingOptions.eventLevel || ClientTracingConstants.EventLevel.Info;
        return { viewModel: viewModel, tracingOptions: tracingOptions };
    };

    
    _this.getDefaultTextBoxPropertyLogOption = function (viewModel, tracingOptions)
    {
        tracingOptions = tracingOptions || {};
        if (!tracingOptions.hasOwnProperty("hidingMode"))
        {
            tracingOptions.hidingMode = ClientTracingConstants.HidingMode.None;
        }

        tracingOptions.rateLimit =
            {
                method: "notifyWhenChangesStop"
            };

        return _this.getPropertyLogOption(
            viewModel,
            tracingOptions
        );
    };

    
    _this.getPIITextBoxPropertyLogOption = function (viewModel, tracingOptions)
    {
        tracingOptions = tracingOptions || {};
        tracingOptions.hidingMode = ClientTracingConstants.HidingMode.Mask;

        return _this.getDefaultTextBoxPropertyLogOption(
            viewModel,
            tracingOptions
        );
    };

    
    _this.getPasswordTextBoxPropertyLogOption = function (viewModel, tracingOptions)
    {
        tracingOptions = tracingOptions || {};
        tracingOptions.hidingMode = ClientTracingConstants.HidingMode.Hide;

        return _this.getDefaultTextBoxPropertyLogOption(
            viewModel,
            tracingOptions
        );
    };

    
    _this.getDefaultEventTracingOptions = function (eventId, traceEventArgs, eventLevel)
    {
        return {
            eventId: eventId,
            eventLevel: eventLevel || ClientTracingConstants.EventLevel.Info,
            hidingMode: traceEventArgs ? ClientTracingConstants.HidingMode.None : ClientTracingConstants.HidingMode.Hide
        };
    };
    

    
    
    _this.attachViewLoadClientTracingOptions = _createClientTracingContextWrapper("attachViewLoadClientTracingOptions");

    
    
    

    

    
    _this.logEvent = _createClientTracingWrapper("logEvent");

    
    _this.logUserInteractionEvent = _createClientTracingWrapper("logUserInteractionEvent");

    
    _this.traceBeginRequest = _createClientTracingWrapper("traceBeginRequest");

    
    _this.traceEndRequest = function (tracingObject, result, data, succeeded, handler)
    {
        if (_clientTracing)
        {
            _clientTracing.traceEndRequest(tracingObject, result, data, succeeded, handler);
        }
        else if (handler)
        {
            handler();
        }
    };

    
    _this.setPageViewModel = _createClientTracingWrapper("setPageViewModel");

    

    
    

    
    _this.logComponentEvent = _createClientTracingWrapper("logComponentEvent");

    
    _this.logViewState = _createClientTracingWrapper("logViewState");

    
    _this.setViewViewModel = _createClientTracingWrapper("setViewViewModel");

    
    _this.switchView = _createClientTracingWrapper("switchView");

    
    _this.postEvent = _createClientTracingWrapper("postEvent");
    
    

    function _getIfTracingEnabled()
    {
        return (tracingConfig && tracingConfig.fEnableClientTelemetry && tracingConfig.iClientLogLevel);
    }

    function _createClientTracingWrapper(methodName)
    {
        return function ()
        {
            if (_clientTracing)
            {
                return _clientTracing[methodName].apply(_clientTracing, arguments);
            }
        };
    }

    function _createClientTracingContextWrapper(methodName)
    {
        return function ()
        {
            if (ClientTracingContext)
            {
                return ClientTracingContext[methodName].apply(ClientTracingContext, arguments);
            }
        };
    }
}

var instance = null;

exports.getInstance = function (tracingConfig)
{
    instance = instance || new ClientTracingHelper(tracingConfig);
    return instance;
};