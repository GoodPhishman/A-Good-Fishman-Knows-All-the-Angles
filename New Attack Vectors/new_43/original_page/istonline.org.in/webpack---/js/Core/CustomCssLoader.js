var postcss = require("postcss");
var postcssValueParser = require("postcss-value-parser");
var Helpers = require("./Helpers");
var ApiRequest = require("./ApiRequest");
var Promise = require("./Promise");
var ClientTracingConstants = require("./ClientTracingConstants");

var doc = document;
var head = doc.head;
var ArrayHelpers = Helpers.Array;


function CustomCssLoader()
{
    var _this = this;

    var c_AllowedCssAtRules =
        [
            "font-face",
            "media"
        ];

    var c_AllowedCssSelectors =
        [
            "body",
            "a",
            ".ext-header",
            ".ext-header-logo",
            ".ext-header-description",
            ".ext-background-image",
            ".ext-background-overlay",
            ".ext-sign-in-box",
            ".ext-title",
            ".ext-subtitle",
            ".ext-button.ext-primary",
            ".ext-button.ext-secondary",
            ".ext-error",
            ".ext-input.ext-text-box",
            ".ext-input.ext-text-box.ext-has-error",
            ".ext-banner-logo",
            ".ext-password-reset-links-container",
            ".ext-button-field-container",
            ".ext-button-item",
            ".ext-boilerplate-text",
            ".ext-vertical-split-main-section",
            ".ext-vertical-split-background-image-container",
            ".ext-middle",
            ".ext-promoted-fed-cred-box",
            ".ext-footer",
            ".ext-footer.ext-has-background",
            ".ext-footer.ext-has-background.ext-background-always-visible",
            ".ext-footer-links",
            ".ext-footer-content.ext-footer-item",
            ".ext-footer-content.ext-footer-item.ext-has-background",
            ".ext-footer-content.ext-footer-item.ext-has-background.ext-background-always-visible",
            ".ext-footer-content.ext-footer-item.ext-debug-item",
            ".ext-footer-content.ext-footer-item.ext-debug-item.ext-has-background",
            ".ext-footer-content.ext-footer-item.ext-debug-item.ext-has-background.ext-background-always-visible"
        ];

    var c_DisallowedCssProperties =
        [
            "behavior",
            "content",
            "-moz-binding",
            "-o-link"
        ];

    
    var c_AllowedCssCharactersRegex = /^[\x0A\x0D\x20-\x7E]*$/;
    var c_AllowedCssPseudoSelectorRegex = /(:active|:focus|:focus-within|:hover|:link|:visited)$/i;
    var c_AllowedCssUrlSchemesRegex = /^https:\/\//i;

    var _customCssNode = null;

    
    _this.loadAsync = function (customCssUrl)
    {
        return _loadInternalAsync(customCssUrl)
            .then(_sanitizeCss)
            .then(
                function (sanitizedCss)
                {
                    _unload();

                    _customCssNode = doc.createElement("style");
                    _customCssNode.type = "text/css";
                    _customCssNode.innerHTML = sanitizedCss;
                    head.appendChild(_customCssNode);
                });
    };

    function _unload()
    {
        if (_customCssNode)
        {
            head.removeChild(_customCssNode);
            _customCssNode = null;
        }
    }

    function _loadInternalAsync(customCssUrl)
    {
        return new Promise(
            function (resolve)
            {
                var apiRequest = new ApiRequest({ checkApiCanary: false });
                apiRequest.Get(
                    {
                        url: customCssUrl,
                        eventId: ClientTracingConstants.EventIds.Api_GetCustomCss
                    },
                    null,
                    function (event, customCss)
                    {
                        resolve(customCss);
                    });
            });
    }

    function _sanitizeCss(css)
    {
        var parsedCss = postcss.parse(css);
        parsedCss.walk(
            function (node)
            {
                switch (node.type)
                {
                    case "atrule":
                        _sanitizeAtRule(node);
                        break;

                    case "rule":
                        _sanitizeRule(node);
                        break;

                    case "decl":
                        _sanitizeProperty(node);
                        break;

                    default:
                        node.remove();
                        break;
                }
            });

        return parsedCss.toString();
    }

    function _sanitizeAtRule(node)
    {
        if (!c_AllowedCssCharactersRegex.test(node.name)
            || !c_AllowedCssCharactersRegex.test(node.params)
            || c_AllowedCssAtRules.indexOf(node.name.toLowerCase()) === -1)
        {
            node.remove();
        }
    }

    function _sanitizeRule(node)
    {
        if (!c_AllowedCssCharactersRegex.test(node.selector))
        {
            node.remove();
            return;
        }

        var filteredSelectors = ArrayHelpers.arrayFilter(
            node.selectors,
            function (selector)
            {
                while (c_AllowedCssPseudoSelectorRegex.test(selector))
                {
                    selector = selector.replace(c_AllowedCssPseudoSelectorRegex, "");
                }

                return c_AllowedCssSelectors.indexOf(selector) !== -1;
            });

        if (filteredSelectors.length > 0)
        {
            node.selectors = filteredSelectors;
        }
        else
        {
            node.remove();
        }
    }

    function _sanitizeProperty(node)
    {
        if (!c_AllowedCssCharactersRegex.test(node.prop)
            || c_DisallowedCssProperties.indexOf(node.prop.toLowerCase()) !== -1)
        {
            node.remove();
            return;
        }

        _sanitizePropertyValue(node, node.value);
    }

    function _sanitizePropertyValue(node, propertyValue)
    {
        if (!c_AllowedCssCharactersRegex.test(propertyValue))
        {
            node.remove();
            return;
        }

        var parsedNodes = postcssValueParser(propertyValue).nodes || [];

        for (var i = 0, len = parsedNodes.length; i < len; ++i)
        {
            var parsedNode = parsedNodes[i];

            if (parsedNode.type === "function")
            {
                switch (parsedNode.value.toLowerCase())
                {
                    case "expression":
                        node.remove();
                        return;

                    case "url":
                        if (!c_AllowedCssUrlSchemesRegex.test(parsedNode.nodes[0].value))
                        {
                            node.remove();
                            return;
                        }

                        break;

                    default:
                        break;
                }
            }
        }
    }
}

module.exports = CustomCssLoader;