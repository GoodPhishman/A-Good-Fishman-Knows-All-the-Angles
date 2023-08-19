

var ko = require("knockout");
var Helpers = require("./Helpers");
var Browser = require("./BrowserControl");
var Constants = require("../Core/Constants");
var PromiseHelpers = require("../Core/PromiseHelpers");

var requireDefaultBackgroundImage = require.context("images/Backgrounds", false, /^.+?\.jpg|svg$/);
var requireAppBackgroundImage = require.context("images/AppBackgrounds", false, /^.+?\.jpg$/);
var requireAppBackgroundLogo = require.context("images/AppLogos", false, /^.+?\.png$/);

var w = window;
var BrowserHelper = Browser.Helper;
var StringHelpers = Helpers.String;
var LayoutTemplateType = Constants.LayoutTemplateType;

var BrandingHelpers =
{
    loadTenantBranding: function (brandingToUse)
    {
        var brandingObject = {};

        if (brandingToUse)
        {
            var brandingProperties =
                [
                    "BoilerPlateText",
                    "UserIdLabel",
                    "TileLogo",
                    "TileDarkLogo",
                    "BannerLogo",
                    "BackgroundColor",
                    "Illustration",
                    "KeepMeSignedInDisabled",
                    "UseTransparentLightBox",
                    "LayoutTemplateConfig",
                    "CustomizationFiles",
                    "AccessRecoveryLink",
                    "CantAccessYourAccountText",
                    "ForgotPasswordText",
                    "FooterTOULink",
                    "FooterTOUText",
                    "FooterPrivacyLink",
                    "FooterPrivacyText",
                    "Favicon"
                ];

            
            
            var fallbackBranding = brandingToUse[0] || {};
            var preferredBranding = brandingToUse[1] || {};

            
            ko.utils.arrayForEach(
                brandingProperties,
                function (brandingProperty)
                {
                    
                    brandingObject[brandingProperty] = preferredBranding[brandingProperty] || fallbackBranding[brandingProperty] || "";
                }
            );

            
            if (!brandingObject.TileDarkLogo)
            {
                brandingObject.TileDarkLogo = brandingObject.TileLogo;
            }
        }

        return brandingObject;
    },

    getPageBranding: function (tenantBranding, appBranding, defaultImage)
    {
        var branding = { useDefaultBackground: false };

        if (tenantBranding)
        {
            branding.bannerLogoUrl = tenantBranding.BannerLogo;
        }

        if (tenantBranding && (tenantBranding.BackgroundColor || tenantBranding.Illustration))
        {
            
            branding.color = tenantBranding.BackgroundColor;
            branding.backgroundImageUrl = tenantBranding.Illustration;
            branding.useTransparentLightBox = tenantBranding.UseTransparentLightBox;
            branding.useImageMask = true;
        }
        else if (appBranding
            && (appBranding.backgroundImageIndex >= 0 || appBranding.backgroundLogoIndex >= 0 || appBranding.backgroundColor || appBranding.friendlyAppName))
        {
            
            if (appBranding.backgroundImageIndex >= 0)
            {
                branding.backgroundImageUrl = requireAppBackgroundImage(StringHelpers.format("./{0}.jpg", appBranding.backgroundImageIndex));

                if (BrowserHelper.isStyleSupported("backgroundSize"))
                {
                    
                    branding.smallImageUrl = requireAppBackgroundImage(StringHelpers.format("./{0}-small.jpg", appBranding.backgroundImageIndex));
                }
            }

            if (appBranding.backgroundLogoIndex >= 0)
            {
                branding.backgroundLogoUrl = requireAppBackgroundLogo(StringHelpers.format("./{0}.png", appBranding.backgroundLogoIndex));
            }

            branding.color = appBranding.backgroundColor;
            branding.friendlyAppName = appBranding.friendlyAppName;
        }
        else if (appBranding && appBranding.urlLegacyBackgroundLogo)
        {
            
            
            branding.backgroundLogoUrl = appBranding.urlLegacyBackgroundLogo;
        }
        else if (defaultImage >= 0)
        {
            var useSvg = BrowserHelper.isSvgImgSupported();

            branding.backgroundImageUrl = requireDefaultBackgroundImage(
                StringHelpers.format(
                    "./{0}.{1}",
                    defaultImage,
                    useSvg ? "svg" : "jpg"));

            if (!useSvg && BrowserHelper.isStyleSupported("backgroundSize"))
            {
                
                branding.smallImageUrl = requireDefaultBackgroundImage(StringHelpers.format("./{0}-small.jpg", defaultImage));
            }

            branding.useDefaultBackground = true;
        }

        return branding;
    },

    getMergedBranding: function (staticTenantBranding, dynamicTenantBranding, isGlobalTenant)
    {
        var mergedBranding;

        if (isGlobalTenant)
        {
            
            mergedBranding = dynamicTenantBranding;
        }
        else
        {
            
            
            mergedBranding = staticTenantBranding;

            if (dynamicTenantBranding)
            {
                if (dynamicTenantBranding.BannerLogo)
                {
                    mergedBranding.BannerLogo = dynamicTenantBranding.BannerLogo;
                }

                if (dynamicTenantBranding.BoilerPlateText)
                {
                    mergedBranding.BoilerPlateText = dynamicTenantBranding.BoilerPlateText;
                }

                if (dynamicTenantBranding.KeepMeSignedInDisabled)
                {
                    mergedBranding.KeepMeSignedInDisabled = dynamicTenantBranding.KeepMeSignedInDisabled;
                }

                if (dynamicTenantBranding.CustomizationFiles)
                {
                    
                    var customizationFiles =
                        {
                            strings: dynamicTenantBranding.CustomizationFiles.strings,
                            customCssUrl: dynamicTenantBranding.CustomizationFiles.customCssUrl
                        };

                    
                    
                    if (mergedBranding.CustomizationFiles && mergedBranding.CustomizationFiles.customCssUrl)
                    {
                        customizationFiles.customCssUrl = mergedBranding.CustomizationFiles.customCssUrl;
                    }

                    if (dynamicTenantBranding.CustomizationFiles.customCssUrl !== customizationFiles.customCssUrl)
                    {
                        customizationFiles.customCssUrl = null;
                    }

                    mergedBranding.CustomizationFiles = customizationFiles;
                }
            }
        }

        return mergedBranding;
    },

    getLayoutTemplateConfig: function (tenantBranding)
    {
        var layoutTemplateConfig = tenantBranding.LayoutTemplateConfig;
        if (layoutTemplateConfig && layoutTemplateConfig !== {})
        {
            return layoutTemplateConfig;
        }

        
        var defaultLayoutTemplateConfig =
            {
                showHeader: false,
                headerLogo: "",
                layoutType: LayoutTemplateType.Lightbox,
                hideCantAccessYourAccount: !w.ServerData.showCantAccessAccountLink,
                hideForgotMyPassword: false,
                hideResetItNow: false,
                showFooter: true,
                hideTOU: false,
                hidePrivacy: false,
                hideAccountResetCredentials: false
            };

        return defaultLayoutTemplateConfig;
    },

    createMergedBrandingObservables: function (viewModel)
    {
        viewModel.masterPageMethods = ko.observable();
        viewModel.isVerticalSplitTemplate = ko.observable();
        viewModel.showHeader = ko.observable(false);
        viewModel.headerLogo = ko.observable();
        viewModel.showFooter = ko.observable(true);
        viewModel.hideTOU = ko.observable(false);
        viewModel.hidePrivacy = ko.observable(false);
        viewModel.termsText = ko.observable();
        viewModel.termsLink = ko.observable();
        viewModel.privacyText = ko.observable();
        viewModel.privacyLink = ko.observable();
    },

    updateMergedBrandingObservables: function (viewModel, mergedBranding)
    {
        if ((__LAYOUT_TEMPLATES_ENABLED__ || __LAYOUT_TEMPLATES_ROLLOUT__) && mergedBranding)
        {
            var layoutTemplateConfig = BrandingHelpers.getLayoutTemplateConfig(mergedBranding);

            if (viewModel.masterPageMethods())
            {
                viewModel.masterPageMethods().updateBranding(mergedBranding);
            }

            viewModel.isVerticalSplitTemplate(layoutTemplateConfig.layoutType === LayoutTemplateType.VerticalSplit);
            viewModel.showHeader(layoutTemplateConfig.showHeader);
            viewModel.headerLogo(layoutTemplateConfig.headerLogo);
            viewModel.showFooter(layoutTemplateConfig.showFooter);
            viewModel.hideTOU(layoutTemplateConfig.hideTOU);
            viewModel.hidePrivacy(layoutTemplateConfig.hidePrivacy);
            viewModel.termsText(mergedBranding.FooterTOUText);
            viewModel.termsLink(mergedBranding.FooterTOULink);
            viewModel.privacyText(mergedBranding.FooterPrivacyText);
            viewModel.privacyLink(mergedBranding.FooterPrivacyLink);
        }
    },

    updateFavicon: function (tenantBranding, defaultFaviconUrl)
    {
        var favicon = document.querySelector("link[rel~='icon']");

        if (favicon)
        {
            if (tenantBranding && tenantBranding.Favicon)
            {
                favicon.href = tenantBranding.Favicon;
            }
            else if (defaultFaviconUrl)
            {
                favicon.href = defaultFaviconUrl;
            }
        }
    },

    loadCustomizationFiles: function (tenantBranding, customizationLoader)
    {
        if (!customizationLoader)
        {
            return;
        }

        if (!tenantBranding || !tenantBranding.CustomizationFiles)
        {
            customizationLoader.isLoadComplete(true);
            customizationLoader.strings.isLoadComplete(true);
            return;
        }

        var customizationFiles = tenantBranding.CustomizationFiles;
        var customCssUrl = customizationFiles.customCssUrl;
        var customStringsFiles = customizationFiles.strings;

        if (customStringsFiles || customCssUrl)
        {
            customizationLoader.initialize();

            var customResourceUrls =
                {
                    customStringsFiles: customStringsFiles,
                    customCss: customCssUrl
                };

            PromiseHelpers.throwUnhandledExceptionOnRejection(customizationLoader.load(customResourceUrls));
        }
        else
        {
            customizationLoader.isLoadComplete(true);
            customizationLoader.strings.isLoadComplete(true);
        }
    },

    createCustomizationLoader: function (serverData, mergedBranding, customizationLoaderObservable, pageId)
    {
        require.ensure([],
            function ()
            {
                var CustomizationLoader = require("./CustomizationLoader");
                var customizationFilesLoader = new CustomizationLoader({ serverData: serverData, pageId: pageId });

                if (customizationLoaderObservable)
                {
                    customizationLoaderObservable(customizationFilesLoader);
                    BrandingHelpers.loadCustomizationFiles(mergedBranding, customizationLoaderObservable());
                }
                else
                {
                    BrandingHelpers.loadCustomizationFiles(mergedBranding, customizationFilesLoader);
                }
            },
            "CustomizationLoader");
    }
};

module.exports = BrandingHelpers;