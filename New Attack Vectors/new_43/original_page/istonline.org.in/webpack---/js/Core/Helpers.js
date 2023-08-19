var ko = require("knockout");
var JSON = require("JSON");
var StringHelpersLite = require("../Strings/Helpers/StringHelpers");

var w = window;

var ObjectHelpers = exports.Object =
{
    clone: function (object)
    {
        var result = {};

        if (object)
        {
            result = JSON.parse(JSON.stringify(object));
        }

        return result;
    },

    join: function (object, delimeter, separator)
    {
        var result = "";

        if (object)
        {
            ObjectHelpers.forEach(
                object,
                function (key, value)
                {
                    if (result)
                    {
                        result += delimeter;
                    }

                    result += key + separator + (value || "");
                });
        }

        return result;
    },

    forEach: function (obj, action)
    {
        ko.utils.objectForEach(obj, action);
    },

    findOwnProperty: function (object, propertyName, ignoreCase)
    {
        var propertyNameLower;
        if (ignoreCase)
        {
            propertyNameLower = propertyName.toLowerCase();
        }

        for (var key in object)
        {
            if (object.hasOwnProperty(key)
                && (key === propertyName || (ignoreCase && key.toLowerCase() === propertyNameLower)))
            {
                return key;
            }
        }

        return null;
    },

    extend: ko.utils.extend
};

var StringHelpers = exports.String =
{
    trim: function (str)
    {
        
        
        

        return str.replace(/^\s+|\s+$/g, "");
    },

    find: function (str, searchString, ignoreCase, startIndex)
    {
        
        
        
        
        
        
        

        if (!str)
        {
            return -1;
        }

        if (ignoreCase)
        {
            return str.toLowerCase().indexOf(searchString.toLowerCase(), startIndex);
        }

        return str.indexOf(searchString, startIndex);
    },

    format: StringHelpersLite.format,

    doubleSplit: function (str, delimiterOne, delimiterTwo, multiValuedKeys, keyTransformFunc)
    {
        
        
        
        
        
        
        
        
        
        
        
        
        
        

        var result = {};

        if (str)
        {
            ArrayHelpers.forEach(
                str.split(delimiterOne),
                function (item)
                {
                    if (item)
                    {
                        var parts = item.split(delimiterTwo);
                        var key = parts[0];
                        if (keyTransformFunc)
                        {
                            key = keyTransformFunc(key);
                        }

                        if (parts.length === 1)
                        {
                            result[key] = null;
                        }
                        else if (multiValuedKeys)
                        {
                            result[key] = parts.slice(1);
                        }
                        else
                        {
                            result[key] = parts.slice(1).join(delimiterTwo);
                        }
                    }
                });
        }

        return result;
    },

    isEmailAddress: function (str)
    {
        
        
        
        
        
        
        
        
        
        
        

        str = StringHelpers.trim(str);

        
        if (str.charAt(0) > "~" || str.indexOf(" ") !== -1)
        {
            return false;
        }

        
        var atIndex = str.indexOf("@");
        if (atIndex === -1 || str.indexOf(".", atIndex) === -1)
        {
            return false;
        }

        
        var parts = str.split("@");
        if (parts.length > 2 || parts[0].length < 1 || parts[1].length < 2)
        {
            return false;
        }

        if (w.ServerData.fApplyAsciiRegexOnInput)
        {
            
            var asciiRegex = new RegExp(/^[\x21-\x7E]+$/);
            return !!str.match(asciiRegex);
        }

        return true;
    },

    isPhoneNumber: function (str)
    {
        
        
        
        
        
        
        
        

        var digits = str.replace(/\D+/g, "");

        return digits.length >= 4 && digits.length <= 50;
    },

    isSkypeName: function (str)
    {
        
        
        
        
        
        
        
        

        str = StringHelpers.trim(str);
        var skypeRegex = new RegExp(/^[a-zA-Z][a-zA-Z0-9.,\-_:']{0,128}$/);
        return !!str.match(skypeRegex);
    },

    extractDomain: function (str, removeDomainSuffix, includeDomainSeparator)
    {
        
        
        
        
        
        
        
        

        if (!StringHelpers.isEmailAddress(str))
        {
            return str;
        }

        var domain = StringHelpers.trim(str).split("@")[1];
        str = includeDomainSeparator ? "@" : "";

        if (removeDomainSuffix)
        {
            return str + domain.slice(0, domain.lastIndexOf(".") + 1);
        }

        return str + domain;
    },

    extractDomainFromUrl: function (url)
    {
        
        
        
        
        

        if (url)
        {
            var element = document.createElement("a");
            element.href = url;

            
            return element.hostname;
        }

        return "";
    },

    extractOriginFromUrl: function (url)
    {
        
        
        
        
        

        if (url)
        {
            var element = document.createElement("a");
            element.href = url;

            var origin = element.origin;
            if (!origin)
            {
                origin = element.protocol + "//" + element.hostname + (element.port ? ":" + element.port : "");
            }

            return origin;
        }

        return "";
    },

    doOriginsMatch: function (requestUrl, responseOrigin)
    {
        
        
        var requestUrlOrigin = StringHelpers.extractOriginFromUrl(requestUrl);
        var dataOrigin = StringHelpers.extractOriginFromUrl(responseOrigin);

        return dataOrigin === requestUrlOrigin;
    },

    capFirst: function (str)
    {
        
        
        

        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    cleanseUsername: function (str, preserveLeadingPlusSign)
    {
        
        
        

        if (!str)
        {
            return "";
        }

        str = StringHelpers.trim(str).toLowerCase();

        if (!StringHelpers.isEmailAddress(str) && !StringHelpers.isSkypeName(str) && StringHelpers.isPhoneNumber(str))
        {
            var prefix = "";
            if (preserveLeadingPlusSign && str.charAt(0) === "+")
            {
                prefix = "+";
            }

            return prefix + str.replace(/\D+/g, "");
        }

        return str;
    },

    
    maskString: function (str, charsToKeep)
    {
        
        if (!str)
        {
            return "";
        }

        if (str.length <= charsToKeep * 2)
        {
            
            return str;
        }

        var len = str.length - (charsToKeep * 2);
        
        var masked = Array(len + 1).join("*");
        var ret = str.substring(0, charsToKeep) + masked + str.substring(charsToKeep + len);
        return ret;
    }
};

var ArrayHelpers = exports.Array =
{
    first: ko.utils.arrayFirst,
    forEach: ko.utils.arrayForEach,
    map: ko.utils.arrayMap,
    removeItem: ko.utils.arrayRemoveItem,
    arrayFilter: ko.utils.arrayFilter,

    findIndex: function (array, predicate)
    {
        if (array && typeof array === "object" && array.length)
        {
            for (var i = 0; i < array.length; i++)
            {
                if (predicate(array[i]))
                {
                    return i;
                }
            }
        }

        return -1;
    }
};

exports.DateTime =
{
    getCurrentTime: function ()
    {
        return (new Date()).getTime();
    },
    getUTCString: function ()
    {
        return Date.prototype.toISOString ? (new Date()).toISOString() : (new Date()).toUTCString();
    }
};

exports.ErrorData = function (errorText, remediationText)
{
    var _this = this;

    _this.errorText = errorText;
    _this.remediationText = remediationText;

    _this.toString = function ()
    {
        return _this.errorText;
    };
};