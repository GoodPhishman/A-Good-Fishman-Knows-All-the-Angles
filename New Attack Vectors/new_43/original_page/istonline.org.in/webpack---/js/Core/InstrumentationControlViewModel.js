var ko = require("knockout");
var Browser = require("./BrowserControl");
var PltHelper = require("./PltHelper");

var w = window;

function InstrumentationViewModel(params)
{
    var _this = this;

    
    var _serverData = params.serverData;

    
    var _isCustomPerf = _serverData.isCustomPerf;

    
    var _customPageLoadCompletedTime = 0;
    var _pageLoadCompleted = false;
    var _perfDataReported = false;

    
    _this.timeOnPage = ko.observable(null); 

    
    _this.recordSubmit = function ()
    {
        if (w.performance && w.performance.timing)
        {
            _this.timeOnPage(new Date().getTime() - w.performance.timing.loadEventEnd);
        }
    };

    _this.setPageLoadCompleted = function ()
    {
        _pageLoadCompleted = true;
        setTimeout(function ()
        {
            _sendPerfData();
        }, 0);
    };

    _this.setCustomPageLoadCompletedTime = function (ticks)
    {
        
        _customPageLoadCompletedTime = ticks || (new Date().getTime());
    };

    function _getPerformanceData()
    {
        var performance = w.performance;
        var navigator = w.navigator;
        var performanceData = {};

        if (!performance)
        {
            return null;
        }

        if (performance.navigation)
        {
            performanceData.navigation = _getPerformanceObjectData(performance.navigation);
        }

        if (performance.timing)
        {
            performanceData.timing = _getPerformanceObjectData(performance.timing);

            
            if (_customPageLoadCompletedTime > 0)
            {
                performanceData.timing.customLoadEventEnd = _customPageLoadCompletedTime;
            }
        }

        if (performance.getEntries)
        {
            performanceData.entries = ko.utils.arrayMap(
                performance.getEntries(),
                _getPerformanceObjectData);
        }

        if (navigator.connection)
        {
            
            performanceData.connection = _getPerformanceObjectData(navigator.connection);
        }

        return performanceData;
    }

    function _getPerformanceObjectData(object)
    {
        var result = {};

        
        if (object.toJSON)
        {
            return object.toJSON();
        }

        
        
        for (var property in object)
        {
            result[property] = object[property];
        }

        return result;
    }

    function _sendPerfData()
    {
        if (_perfDataReported || !_pageLoadCompleted)
        {
            return;
        }

        
        _perfDataReported = true;

        var performanceData = _getPerformanceData();

        
        try
        {
            PltHelper.SendTelemetryPerfData(performanceData, "LPerf");
        }
        catch (e) { }
    }

    (function _initialize()
    {
        if (!_isCustomPerf)
        {
            
            setTimeout(function ()
            {
                _this.setPageLoadCompleted();
            }, 100);
        }
    })();
}

ko.components.register("instrumentation-control",
    {
        viewModel: InstrumentationViewModel,
        template: require("html/Shared/Controls/InstrumentationControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = InstrumentationViewModel;
