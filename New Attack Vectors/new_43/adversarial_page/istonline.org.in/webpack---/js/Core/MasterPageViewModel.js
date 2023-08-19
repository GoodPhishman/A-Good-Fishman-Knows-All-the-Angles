

var ko = require("knockout");
var Helpers = require("./Helpers");
var Browser = require("./BrowserControl");
var ComponentEvent = require("./ComponentEvent");
var BrandingHelpers = null;
var Constants = null;

var requireCentipede = require.context("images/AppCentipede", false, /^.+?\.(png|svg)$/);

var w = window;
var LayoutTemplateType = null;

if (__LAYOUT_TEMPLATES_ENABLED__ || __LAYOUT_TEMPLATES_ROLLOUT__)
{
    BrandingHelpers = require("./BrandingHelpers");
    Constants = require("./Constants");

    LayoutTemplateType = Constants.LayoutTemplateType;
}

function PageViewModel(params, templateNodes)
{
    
    var _this = this;

    var _isSvgImageSupported = false;
    

    
    var _serverData = params.serverData;
    var _showButtons = params.showButtons || false;
    var _showFooterLinks = params.showFooterLinks;
    var _showFooterLogo = params.showFooterLogo !== false; 
    var _useWizardBehavior = params.useWizardBehavior;
    var _hideFromAria = params.hideFromAria || ko.observable(false);
    

    
    var _productIcon = _serverData.iProductIcon;
    var _isLayoutTemplatesEnabled = _serverData.fEnableBranding;
    

    
    _this.useLayoutTemplates = __LAYOUT_TEMPLATES_ENABLED__ || _isLayoutTemplatesEnabled;
    _this.templateNodes = {};
    _this.showButtons = _showButtons;

    _this.footer =
        {
            showLinks: _showFooterLinks,
            showLogo: _showFooterLogo
        };

    _this.centipede =
        {
            getLightUrl: function ()
            {
                return requireCentipede(_mapProductIconToImageName(_productIcon, true ));
            },
            getDarkUrl: function ()
            {
                return requireCentipede(_mapProductIconToImageName(_productIcon, false ));
            }
        };

    _this.hideFromAria = _hideFromAria;
    _this.isInternalModeEnabled = Browser.QueryString.extract("psi") === "1";
    _this.viewModel = null;

    _this.viewAgreement = ko.observable(false);
    _this.agreementType = ko.observable();
    _this.isLightboxTemplate = ko.observable(true);
    _this.isVerticalSplitTemplate = ko.observable(false);
    _this.isTemplateLoaded = ko.observable(false);
    

    
    _this.onFooterAgreementClick = ComponentEvent.create();
    

    
    _this.footer_agreementClick = function (agreementType)
    {
        _this.onFooterAgreementClick(agreementType);
    };

    _this.agreement_backButtonClick = function ()
    {
        _this.viewAgreement(false);
    };
    

    
    _this.showAgreement = function (agreementType)
    {
        _this.agreementType(agreementType);
        _this.viewAgreement(true);
    };

    _this.updateBranding = function (branding)
    {
        _initializeTemplate(branding);
    };
    

    
    function _mapProductIconToImageName(iconId, useLight)
    {
        var iconNames = [
            "Microsoft", "OneDrive", "Skype", "Bing",
            "Xbox", "Word", "Outlook", "Office",
            "Excel", "PowerPoint", "Cortana", "SkypeDialer",
            "Health", "MileIQ", "Beam", "MSN", "Minecraft"];

        if (iconId < 0 || iconId >= iconNames.length)
        {
            iconId = 0;
        }

        return Helpers.String.format(
            "./AppCentipede_{0}{1}.{2}",
            iconNames[iconId],
            useLight ? "_white" : "",
            _isSvgImageSupported ? "svg" : "png");
    }

    function _initializeTemplate(tenantBranding)
    {
        if (__LAYOUT_TEMPLATES_ENABLED__ || !!(__LAYOUT_TEMPLATES_ROLLOUT__ && _this.useLayoutTemplates))
        {
            var layoutTemplateConfig = BrandingHelpers.getLayoutTemplateConfig(tenantBranding);
            var layoutType = layoutTemplateConfig.layoutType;
            var isVerticalSplitTemplate = layoutType === LayoutTemplateType.VerticalSplit;

            if (__IS_OLD_WEBPACK__)
            {
                _this.isTemplateLoaded(true);
                return;
            }

            if (isVerticalSplitTemplate)
            {
                _this.isLightboxTemplate(false);
                _this.isVerticalSplitTemplate(true);

                require.ensure([],
                    function ()
                    {
                        require("./VerticalSplitTemplateViewModel");
                        _this.isTemplateLoaded(true);
                    },
                    "VerticalSplitTemplate");
            }
            else
            {
                _this.isVerticalSplitTemplate(false);
                _this.isLightboxTemplate(true);
            }
        }
    }

    (function _initialize()
    {
        _isSvgImageSupported = Browser.Helper.isSvgImgSupported();

        if (templateNodes)
        {
            ko.utils.arrayForEach(
                templateNodes,
                function (node)
                {
                    if (node.id)
                    {
                        _this.templateNodes[node.id] = node.childNodes;
                    }
                });
        }

        if (_useWizardBehavior)
        {
            var WizardControl = null;

            if (__REQUIRE_WIZARD_IN_CORE__)
            {
                WizardControl = require("./WizardControl");
                _this.viewModel = new WizardControl(params);
            }
            else if (__IS_OLD_WEBPACK__)
            {
                require.ensure([],
                    function ()
                    {
                        WizardControl = require("./WizardControl");
                        _this.viewModel = new WizardControl(params);
                    },
                    "Wizard");
            }
        }
    }
    )();
    
}

ko.components.register("master-page",
    {
        viewModel:
            {
                createViewModel: function (params, componentInfo)
                {
                    return new PageViewModel(params, componentInfo.templateNodes);
                }
            },
        template: require("html/Shared/Masters/MasterPageHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = PageViewModel;
