var ko = require("knockout");
var Browser = require("./BrowserControl");
var ComponentEvent = require("./ComponentEvent");
var Constants = require("./Constants");

var w = window;
var AgreementType = Constants.AgreementType;
var BrowserHelper = Browser.Helper;
var PaginatedState = Constants.PaginatedState;

function FooterControl(params)
{
    
    var _this = this;
    

    
    var _serverData = params.serverData;
    var _showLogo = params.showLogo;
    var _showLinks = params.showLinks;
    var _hideFooter = params.hideFooter;
    var _debugDetails = params.debugDetails;
    var _showDebugDetails = params.showDebugDetails;
    var _hasDarkBackground = params.hasDarkBackground;
    var _useDefaultBackground = params.useDefaultBackground;
    var _showFooter = params.showFooter;
    var _hideTOU = params.hideTOU;
    var _hidePrivacy = params.hidePrivacy;
    var _termsText = params.termsText;
    var _privacyText = params.privacyText;
    var _customTermsLink = params.termsLink;
    var _customPrivacyLink = params.privacyLink;
    

    
    var _strings = _serverData.str;
    var _isHosted = _serverData.fIsHosted;
    var _isChinaDc = _serverData.fIsChinaDc;
    var _termsLink = _serverData.urlFooterTOU || _serverData.urlHostedTOULink;
    var _privacyLink = _serverData.urlFooterPrivacy || _serverData.urlHostedPrivacyLink;
    var _impressumLink = _serverData.urlImpressum;
    var _a11yConformeLink = _serverData.a11yConformeLink;
    var _icpLink = _serverData.urlGallatinIcp;
    

    
    _this.onAgreementClick = ComponentEvent.create();
    _this.onShowDebugDetails = ComponentEvent.create();
    _this.onSwitchView = ComponentEvent.create();
    

    
    _this.showDebugDetails = ko.observable(!!_showDebugDetails);
    _this.focusMoreInfo = ko.observable(false).extend({ notify: "always" });

    _this.showFooter = (_showFooter !== undefined) ? _showFooter : true;
    _this.hideTOU = _hideTOU || false;
    _this.hidePrivacy = _hidePrivacy || false;
    _this.termsText = BrowserHelper.htmlUnescape(_termsText) || _strings["MOBILE_STR_Footer_Terms"];
    _this.privacyText = BrowserHelper.htmlUnescape(_privacyText) || _strings["MOBILE_STR_Footer_Privacy"];
    _this.termsLink = _customTermsLink || _termsLink;
    _this.privacyLink = _customPrivacyLink || _privacyLink;
    _this.showLogo = _showLogo && !_isChinaDc;
    _this.showLinks = _showLinks;
    _this.hideFooter = _hideFooter;
    _this.showIcpLicense = _isChinaDc;
    _this.debugDetails = _debugDetails;
    _this.impressumLink = _impressumLink;
    _this.a11yConformeLink = _a11yConformeLink;
    _this.icpLink = _icpLink;
    _this.hasDarkBackground = _hasDarkBackground;
    _this.useDefaultBackground = _useDefaultBackground;
    

    
    _this.privacyLink_onClick = function ()
    {
        handleLegalLink(AgreementType.Privacy, _this.privacyLink);
    };

    _this.termsLink_onClick = function ()
    {
        handleLegalLink(AgreementType.Tou, _this.termsLink);
    };

    _this.impressumLink_onClick = function ()
    {
        handleLegalLink(AgreementType.Impressum, _this.impressumLink);
    };

    _this.services_onClick = function ()
    {
        _this.onSwitchView(PaginatedState.SeeHowDataIsManaged);
    };

    _this.a11yConformeLink_onClick = function ()
    {
        handleLegalLink(AgreementType.A11yConforme, _this.a11yConformeLink);
    };

    _this.moreInfo_onClick = function ()
    {
        _this.setDebugDetailsState(!_this.showDebugDetails());
        _this.onShowDebugDetails();

        if (!_this.showDebugDetails())
        {
            _this.focusMoreInfo(true);
        }
    };

    _this.setDebugDetailsState = function (state)
    {
        _this.showDebugDetails(state);
    };

    _this.focusMoreInfoLink = function ()
    {
        _this.focusMoreInfo(true);
    };
    

    
    function handleLegalLink(agreementType, url)
    {
        if (_isHosted && !_isChinaDc)
        {
            _this.onAgreementClick(agreementType);
        }
        else
        {
            w.open(url, "_blank");
        }
    }
    
}

ko.components.register("footer-control",
    {
        viewModel: FooterControl,
        template: require("html/Shared/Controls/FooterControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = FooterControl;