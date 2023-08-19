
require("telemetry/EClientEvent");
var Telemetry = require("telemetry/TelemetryHelper");

function _initializeTelemetry(serverData)
{
    
    var _config = serverData || {};
    var _browserSense = serverData.browser || {};
    var _clientEventsConfig = _config.clientEvents || {};
    var _serverDetails = _config.serverDetails || {};
    var _uaid = _config.correlationId ? _config.correlationId : "";
    

    _clientEventsConfig.correlationID = _uaid;
    _clientEventsConfig.hostPageID = _config.hpgid;
    _clientEventsConfig.pageName = _config.pgid || _config.sPageId;
    _clientEventsConfig.actorID = _config.hpgact || _config.sCID;
    _clientEventsConfig.appId = _config.appId;

    
    _clientEventsConfig["environment"] = _config.environment;
    _clientEventsConfig["serverDetails"] = {
        datacenter: _getDCAndRI(_serverDetails,"dc"),
        role: _getDCAndRI(_serverDetails, "r"),
        roleInstance: _getDCAndRI(_serverDetails, "ri"),
        version: _getBuildVersion(_serverDetails)
    };

    
    
    if (_browserSense.IE && _clientEventsConfig.appInsightsConfig)
    {
        if (_clientEventsConfig.appInsightsConfig.PostChannel)
        {
            _clientEventsConfig.appInsightsConfig.PostChannel.disableXhrSync = true;
        }
        else
        {
            _clientEventsConfig.appInsightsConfig.PostChannel = {
                disableXhrSync: true
            };
        }
    }

    return new Telemetry.TelemetryHelper(_clientEventsConfig);
}


function _getDCAndRI(serverDetails, name)
{
    if (serverDetails && serverDetails[name])
    {
        return serverDetails[name];
    }

    return "";
}

function _getBuildVersion(serverDetails)
{
    if (!serverDetails || !serverDetails.ver)
    {
        return "";
    }

    var buildVersion = serverDetails.ver.v || serverDetails.ver || "";

    if (Array.isArray(buildVersion) && buildVersion.length > 0)
    {
        return buildVersion.join(".");
    }

    return buildVersion;
}


var instance = null;


exports.getInstance = function (serverData)
{
    if (serverData.fEnableOneDSClientTelemetry)
    {
        try
        {
            instance = instance || _initializeTelemetry(serverData);
        }
        catch (e) { }
    }

    return instance;
};