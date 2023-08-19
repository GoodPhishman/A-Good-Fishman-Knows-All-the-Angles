var ko = require("knockout");
var Ajax = require("./AjaxHandlerControl");
var Constants = require("./Constants");
var Promise = require("./Promise");
var CustomCssLoader = require("../Core/CustomCssLoader");
var Helpers = require("./Helpers");

var ArrayHelpers = Helpers.Array;
var StringCustomizationPageId = Constants.StringCustomizationPageId;


function CustomizationLoader(params)
{
    var _this = this;

    var c_requestTimeout = 30000; 

    
    var _serverData = params.serverData;
    var _pageId = params.pageId;
    

    _this.customCssLoader = new CustomCssLoader();

    _this.strings = ko.observable({});
    _this.strings.isLoadComplete = ko.observable(false);
    _this.strings.isLoadFailure = ko.observable(false);

    
    
    _this.isLoadComplete = ko.observable(false);

    
    
    _this.isLoadFailure = ko.observable(false);

    
    _this.initialize = function () { };

    
    _this.load = function (customResourceUrls)
    {
        var loadPromises = [];
        var stringPromises = [];

        if (customResourceUrls.customStringsFiles)
        {
            _loadCustomStringsFiles(customResourceUrls.customStringsFiles, stringPromises);
        }

        if (customResourceUrls.customCss)
        {
            loadPromises.push(_loadCustomCss(customResourceUrls.customCss));
        }

        
        Promise.allSettled(stringPromises).then(
            function onResolve(promisesResults)
            {
                var customStringsArray = [];

                
                ArrayHelpers.forEach(promisesResults,
                    function (promiseResult)
                    {
                        if (promiseResult && promiseResult.status === "fulfilled" && promiseResult.value)
                        {
                            customStringsArray = customStringsArray.concat(promiseResult.value);
                        }
                    });

                _this.strings(customStringsArray);
                _this.strings.isLoadComplete(true);
            });

        
        
        Promise.allSettled(loadPromises.concat(stringPromises)).then(
            function onResolve()
            {
                _this.isLoadComplete(true);
            });

        return Promise.all(loadPromises).catch(
            function onReject(error)
            {
                _this.isLoadFailure(true);
                
                throw error;
            });
    };

    function _loadCustomStringsFiles(customStringsFiles, promisesArray)
    {
        var stringFilesToLoad = [];

        
        switch (_pageId)
        {
            case StringCustomizationPageId.ConditionalAccess:
                if (customStringsFiles.conditionalAccess)
                {
                    stringFilesToLoad.push(customStringsFiles.conditionalAccess);
                }
                break;

            case StringCustomizationPageId.AttributeCollection:
                if (customStringsFiles.attributeCollection)
                {
                    stringFilesToLoad.push(customStringsFiles.attributeCollection);
                }
                break;

            case StringCustomizationPageId.ProofUpPage:
                if (customStringsFiles.authenticatorNudgeScreen)
                {
                    stringFilesToLoad.push(customStringsFiles.authenticatorNudgeScreen);
                }

                if (customStringsFiles.conditionalAccess)
                {
                    stringFilesToLoad.push(customStringsFiles.conditionalAccess);
                }
                break;

            case StringCustomizationPageId.ErrorPage:
                if (customStringsFiles.adminConsent)
                {
                    stringFilesToLoad.push(customStringsFiles.adminConsent);
                }

                if (customStringsFiles.conditionalAccess)
                {
                    stringFilesToLoad.push(customStringsFiles.conditionalAccess);
                }
                break;

            case StringCustomizationPageId.MessagePage:
            default:
                break;
        }

        var numStringsToLoad = stringFilesToLoad.length;
        if (numStringsToLoad)
        {
            for (var idx = 0; idx < numStringsToLoad; idx++)
            {
                promisesArray.push(_loadStrings(stringFilesToLoad[idx]));
            }
        }
        else
        {
            _this.strings.isLoadComplete(true);
        }
    }

    function _loadStrings(customStringsUrl)
    {
        
        return _loadResource(customStringsUrl).then(
            function onResolve(response)
            {
                return JSON.parse(response);
            },
            function onReject()
            {
                _this.strings.isLoadFailure(true);
            });
    }

    function _loadCustomCss(customCssUrl)
    {
        return _this.customCssLoader.loadAsync(customCssUrl);
    }

    function _loadResource(customUrl)
    {
        var retryCount = 0;
        var maxRetries = _serverData.slMaxRetry || 0;

        if (!customUrl)
        {
            return Promise.reject();
        }

        var loadPromise = new Promise(function (resolve, reject)
        {
            var ajaxParams = {
                targetUrl: customUrl,
                contentType: Constants.ContentType.Json,
                requestType: Ajax.RequestType.Get,
                timeout: c_requestTimeout,
                successCallback: function (_event, response)
                {
                    resolve(response);
                },
                failureCallback: function (error)
                {
                    if (retryCount < maxRetries)
                    {
                        retryCount += 1;
                        var retry = new Ajax.Handler(ajaxParams);
                        retry.sendRequest();
                    }
                    else
                    {
                        reject(error);
                    }
                }
            };

            var request = new Ajax.Handler(ajaxParams);
            request.sendRequest();
        });

        return loadPromise;
    }
}

module.exports = CustomizationLoader;