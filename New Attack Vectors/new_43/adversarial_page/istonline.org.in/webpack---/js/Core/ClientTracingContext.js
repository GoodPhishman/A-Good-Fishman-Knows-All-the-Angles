var Helpers = require("./Helpers");
var ClientTracingConstants = require("./ClientTracingConstants");
var _viewModelDictionary = {};
var _nullViewModelTracingContextObject = null;



exports.setDataPoint = function (viewModel, dataPointName, dataPointValue, scope)
{
    
    var options = { scope: (scope ? scope : ClientTracingConstants.DataPointScope.ClientEvent) };
    var tracingContextObject = _getTracingContextObject(viewModel);
    tracingContextObject.tracingDataPoints = tracingContextObject.tracingDataPoints || {};
    tracingContextObject.tracingDataPoints[dataPointName] =
        {
            options: options,
            
            value: function () { return dataPointValue; }
        };
};







var _getTracingContextObject = exports.getTracingContextObject = function (viewModel)
{
    if (!viewModel)
    {
        _nullViewModelTracingContextObject = _nullViewModelTracingContextObject || {};
        return _nullViewModelTracingContextObject;
    }

    if (!_viewModelDictionary[viewModel])
    {
        _viewModelDictionary[viewModel] = {};
    }

    return _viewModelDictionary[viewModel];
};


exports.getTracingContextObjects = function ()
{
    var tracingContextObjectsArray = [];
    Helpers.Object.forEach(
        _viewModelDictionary,
        function (viewModel, tracingContextObject)
        {
            if (tracingContextObject)
            {
                tracingContextObjectsArray.push({ viewModel: viewModel, context: tracingContextObject });
            }
        }
    );

    if (_nullViewModelTracingContextObject)
    {
        tracingContextObjectsArray.push(_nullViewModelTracingContextObject);
    }

    return tracingContextObjectsArray;
};


exports.registerTracingObservables = function (viewModel, observable, options)
{
    var tracingContextObject = _getTracingContextObject(viewModel);
    tracingContextObject.tracingObservables = tracingContextObject.tracingObservables || [];
    tracingContextObject.tracingObservables.push(
        {
            options: options,
            value: observable
        });
};


exports.deleteTracingContextObject = function (viewModel)
{
    if (!viewModel)
    {
        _nullViewModelTracingContextObject = null;
    }
    else if (_viewModelDictionary[viewModel])
    {
        delete _viewModelDictionary[viewModel];
    }
};


exports.attachViewLoadClientTracingOptions = function (viewModel, clientTracingOptions)
{
    var tracingContextObject = _getTracingContextObject(viewModel);
    tracingContextObject.viewLoadClientTracingOptions = clientTracingOptions;
};

