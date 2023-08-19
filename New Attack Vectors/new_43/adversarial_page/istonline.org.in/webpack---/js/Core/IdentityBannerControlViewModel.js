var ko = require("knockout");
var Browser = require("./BrowserControl");
var ComponentEvent = require("./ComponentEvent");

var w = window;
var BrowserHelper = Browser.Helper;

function IdentityBannerControl(params)
{
    var _this = this;

    var _displayName = params.displayName;
    var _isBackButtonVisible = params.isBackButtonVisible;
    var _backButtonId = params.backButtonId;
    var _backButtonDescribedBy = params.backButtonDescribedBy;
    var _focusOnBackButton = params.focusOnBackButton || false;

    
    _this.onBackButtonClick = ComponentEvent.create();

    
    _this.unsafe_displayName = null;
    _this.isBackButtonVisible = _isBackButtonVisible;
    _this.backButtonId = _backButtonId;
    _this.backButtonDescribedBy = _backButtonDescribedBy;
    _this.focusOnBackButton = _focusOnBackButton;
    _this.showLogo = params.showLogo || false;
    _this.bannerLogoUrl = params.bannerLogoUrl || "";

    
    _this.backButton_onClick = function ()
    {
        _this.onBackButtonClick();
    };

    
    (function _initialize()
    {
        _this.unsafe_displayName = BrowserHelper.htmlUnescape(_displayName);
    })();
}

ko.components.register("identity-banner-control",
    {
        viewModel: IdentityBannerControl,
        template: require("html/Shared/Controls/IdentityBannerControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });