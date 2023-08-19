

var stringToArrayBuffer = exports.stringToArrayBuffer = function (string)
{
    var arrayBuffer = new ArrayBuffer(string.length);
    var dataView = new Uint8Array(arrayBuffer);

    for (var i = 0, len = string.length; i < len; ++i)
    {
        dataView[i] = string.charCodeAt(i);
    }

    return arrayBuffer;
};

var arrayBufferToString = exports.arrayBufferToString = function (arrayBuffer)
{
    return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
};

exports.base64UrlStringToArrayBuffer = function (base64UrlString)
{
    var base64String = base64UrlString.replace(
        /[-_]/g,
        function (match)
        {
            switch (match)
            {
                case "-":
                    return "+";
                case "_":
                    return "/";
            }
        });

    var bytes = atob(base64String);
    return stringToArrayBuffer(bytes);
};

exports.arrayBufferToBase64UrlString = function (arrayBuffer)
{
    var bytes = arrayBufferToString(arrayBuffer);
    var base64String = btoa(bytes);
    return base64ToBase64UrlString(base64String);
};

exports.objectToBase64UrlString = function (object)
{
    if (object)
    {
        var string = JSON.stringify(object);
        var base64String = btoa(string);
        return base64ToBase64UrlString(base64String);
    }

    return null;
};

var base64ToBase64UrlString = exports.base64ToBase64UrlString = function (base64String)
{
    var base64UrlString = base64String.replace(
        /[+/=]/g,
        function (match)
        {
            switch (match)
            {
                case "+":
                    return "-";
                case "/":
                    return "_";
                case "=":
                    return "";
            }
        });

    return base64UrlString;
};