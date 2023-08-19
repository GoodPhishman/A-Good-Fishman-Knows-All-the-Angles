var ko = require("knockout");
var Browser = require("./BrowserControl");

var w = window;

function BackgroundImageControl()
{
    var _this = this;

    
    _this.isAppBranding = ko.observable(false);
    _this.backgroundStyle = ko.observable();
    _this.smallImageUrl = ko.observable();
    _this.backgroundImageUrl = ko.observable();
    _this.useImageMask = ko.observable(false);
    _this.useTransparentLightBox = ko.observable(false);

    
    _this.updateBranding = function (branding)
    {
        _this.isAppBranding(!!branding.backgroundLogoUrl);
        _this.backgroundStyle(branding.color);
        _this.smallImageUrl(branding.smallImageUrl);
        _this.backgroundImageUrl(branding.backgroundImageUrl);
        _this.useImageMask(!!branding.useImageMask);
        _this.useTransparentLightBox(!!branding.useTransparentLightBox);
    };
}

ko.components.register("background-image-control",
    {
        viewModel: BackgroundImageControl,
        template: require("html/Shared/Controls/BackgroundImageControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = BackgroundImageControl;