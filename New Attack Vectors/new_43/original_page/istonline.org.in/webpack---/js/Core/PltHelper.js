var TelemetryFactory = require("./TelemetryFactory");

var c_MaxCachedResourceThresholdTimeMs = 50.0;
var w = window;




exports.SendTelemetryPerfData = function (perfData, pageSource)
{
    
    var _telemetry = TelemetryFactory.getInstance(w.ServerData);
    var _pltMetrics = {};
    var _getPltMetrics = {};
    

    if (_telemetry)
    {
        _getPltMetrics = _telemetry.get("pltMetrics") || {};
    }

    _pltMetrics.apiTimingInfo = _getPltMetrics.apiTimingInfo || [];

    _pltMetrics.isPlt1 = _isPlt1(perfData.entries);
    _pltMetrics.plt = _getCalculatedPlt(perfData.timing);
    _pltMetrics.timing = perfData.timing;
    _pltMetrics.pltOverallTransferBucket = _getPltTransferBucketData(perfData.entries);
    _pltMetrics.dns = _getTcpDnsInfo("DNS", perfData.timing);
    _pltMetrics.tcp = _getTcpDnsInfo("TCP", perfData.timing);
    _pltMetrics.pageSource = pageSource;

    if (_telemetry)
    {
        
        _telemetry.set("pltMetrics", _pltMetrics);
    }
    else
    {
        throw "PltMetrics failed to post";
    }
};



function _getTcpDnsInfo(name, timing)
{
    if (timing
        && timing.domainLookupStart
        && timing.domainLookupEnd
        && name === "DNS")
    {
        return timing.domainLookupEnd - timing.domainLookupStart;
    }

    if (timing
        && timing.connectStart
        && timing.connectEnd
        && name === "TCP")
    {
        return timing.connectEnd - timing.connectStart;
    }

    return null;
}

function _getCalculatedPlt(timing)
{
    if (!timing)
    {
        return 0;
    }

    
    
    var endTime = timing.customLoadEventEnd;
    var fromFetchTime = true;

    if (!endTime || (timing.loadEventEnd && endTime < timing.loadEventEnd))
    {
        endTime = timing.loadEventEnd;
    }

    return _elapsedPltValue(timing, endTime, fromFetchTime);
}

function _elapsedPltValue(data, value, fromFetchTime)
{
    if (data && value > 0)
    {
        var baseValue = _getBaseValueStartTime(data, fromFetchTime);
        if (baseValue && value >= baseValue)
        {
            return value - baseValue;
        }
    }
    return 0;
}

function _getBaseValueStartTime(data, fromFetchTime)
{
    if (data.fetchStart > 0
        && fromFetchTime
        && data.fetchStart < Number.MAX_VALUE)
    {
        return data.fetchStart;
    }

    if (data.navigationStart > 0)
    {
        return data.navigationStart;
    }

    return null;
}


function _isPlt1(resources)
{
    var isPlt1 = null; 

    if (!resources)
    {
        return null;
    }

    for (var i = 0; i < resources.length; i++)
    {
        var entry = resources[i];
        
        if (_isResource(entry.entryType)
            && !_isSubDocument(entry.initiatorType)
            && !_isDocument(entry.name))
        {
            
            
            var resourcePlt1 = _isResourcePlt1(entry);
            if (resourcePlt1 === true)
            {
                
                isPlt1 = true;
            }
            else if (resourcePlt1 === false)
            {
                
                isPlt1 = false;
                break;
            }
        }
    }

    return isPlt1;
}

function _isResourcePlt1(resource)
{
    if (resource.duration > 0)
    {
        if (resource.duration < c_MaxCachedResourceThresholdTimeMs)
        {
            
            return true;
        }

        return false;
    }

    return null;
}

function _isSubDocument(initiatorType)
{
    return initiatorType === "subdocument";
}

function _isResource(entryType)
{
    return entryType === "resource";
}

function _isDocument(name)
{
    return name === "document";
}

function _getPltTransferBucketData(performanceData)
{
    if (!performanceData || performanceData.length === 0)
    {
        return null;
    }

    var overallTransferRateData = _getOverallTransferRate(performanceData);
    var overallTransferBucket = _getTransferBucket(overallTransferRateData);

    return overallTransferBucket;
}

function _getTransferBucket(transferRate)
{
    if (!transferRate)
    {
        return null;
    }

    
    var value = 12.5;
    var previous = value;
    var bucket = 0;

    while (transferRate >= value && bucket < 20)
    {
        bucket++;
        var hold = value;
        value += previous;
        previous = hold;
    }

    return bucket;
}

function _getOverallTransferRate(performanceData)
{
    var transferSize = 0;
    var transferTime = 0;
    var resourceMetrics = _getResourceMetrics(performanceData);

    if (resourceMetrics.length > 0)
    {
        for (var i = 0; i < resourceMetrics.length; i++)
        {
            if (resourceMetrics[i].TransferSize > 0 && resourceMetrics[i].TransferTime > 0)
            {
                transferSize += resourceMetrics[i].TransferSize;
                transferTime += resourceMetrics[i].TransferTime;
            }
        }
    }

    if (transferTime > 0)
    {
        
        return _calcKbRatePerSecond(transferSize, transferTime);
    }

    return null;
}

function _calcKbRatePerSecond(transferSize, transferTime)
{
    if (transferSize > 0 && transferTime > 0)
    {
        
        var millisecondRate = transferSize / transferTime;

        
        return (millisecondRate * 1000.0) / 1024.0;
    }

    return null;
}

function _getDomainHost(Name)
{
    if (Name === "document")
    {
        return document.location.hostname;
    }

    if (_isAbsoluteUrl(Name))
    {
        return _extractHostname(Name);
    }

    return document.location.hostname;
}


function _extractHostname(url)
{
    if (url)
    {
        var element = document.createElement("a");
        element.href = url;

        
        return element.hostname;
    }

    return "";
}

function _isAbsoluteUrl(input)
{
    var RgExp = new RegExp("^(?:[a-z]+:)?//", "i");
    if (RgExp.test(input))
    {
        return true;
    }

    return false;
}

function _getTransferTimeAndSize(entry)
{
    var transferInfo = {};
    var responseTime = _calcTimespan(_getStart(entry), entry.responseEnd);
    var size = entry.transferSize;

    if (_isResourcePlt1(entry) !== true)
    {
        if (size > 0 && responseTime > 0)
        {
            
            transferInfo.TransferSize = size;
            transferInfo.TransferTime = responseTime;
        }
        else
        {
            transferInfo.TransferSize = null;
            transferInfo.TransferTime = null;
        }
    }

    return transferInfo;
}

function _getStart(entry)
{
    var start = entry.responseStart;

    if (entry)
    {
        start = entry.responseStart;
    }

    if (!start)
    {
        var fetchStart = _getBaseStartTime(entry);

        if (fetchStart > 0)
        {
            return fetchStart;
        }
    }

    return start;
}

function _getBaseStartTime(data)
{
    if (data && data.fetchStart > 0 && data.fetchStart < Number.MAX_VALUE)
    {
        return data.fetchStart;
    }

    return null;
}

function _getResourceMetrics(response)
{
    var metrics = {};
    var metricsValues = [];

    if (!response)
    {
        return metricsValues;
    }

    for (var i = 0; i < response.length; i++)
    {
        var domainHost = _getDomainHost(response[i].name) || "";

        if (!metrics[domainHost] && domainHost !== "")
        {
            metrics[domainHost] = _getTransferTimeAndSize(response[i]);
        }
    }

    for (var val in metrics)
    {
        if (metrics.hasOwnProperty(val))
        {
            metricsValues.push(metrics[val]);
        }
    }

    return metricsValues;
}

function _calcTimespan(start, end)
{
    if (!start || !end)
    {
        return null;
    }

    if (end < start)
    {
        return 0;
    }

    return end - start;
}
