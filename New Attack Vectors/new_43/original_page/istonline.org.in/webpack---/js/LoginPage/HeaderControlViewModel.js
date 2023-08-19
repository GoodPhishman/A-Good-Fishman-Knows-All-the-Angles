var ko = require("knockout");
var Browser = require("../Core/BrowserControl");
var Helpers = require("../Core/Helpers");

var w = window;
var StringHelpers = Helpers.String;

function HeaderControl(params)
{
    
    var _this = this;
    

    
    var _serverData = params.serverData;
    var _title = params.title;
    var _subtitle = params.subtitle;
    var _useSubtitle = params.useSubtitle !== false;
    var _isSignUpView = params.isSignUpView;
    

    
    var _appCobranding = _serverData.oAppCobranding;
    var _strings = _serverData.str;
    var _isSelfServiceSignupUxEnabled = _serverData.fIsSelfServiceSignupUxEnabled;
    var _companyDisplayName = _serverData.sCompanyDisplayName;
    

    
    _this.title = null;
    _this.subtitle = null;
    _this.headerDescription = null;
    

    (function _initialize()
    {
        var isAppNamePresent = !!(_appCobranding && _appCobranding.friendlyAppName);
        _this.isSubtitleVisible = _useSubtitle && (isAppNamePresent || _subtitle);
        _this.title = _title;
        _this.subtitle = _subtitle;

        if (_isSelfServiceSignupUxEnabled)
        {
            
            
            if (_companyDisplayName)
            {
                var headerDescriptionDefaultString = _isSignUpView ? _strings["STR_SSSU_SignUp_HeaderDescription"] : _strings["STR_SSSU_SignIn_HeaderDescription"];
                _this.headerDescription = StringHelpers.format(headerDescriptionDefaultString, _companyDisplayName);
            }
        }
    })();
}

ko.components.register("header-control",
    {
        viewModel: HeaderControl,
        template: require("html/LoginPage/Controls/HeaderControlHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents)
    });

module.exports = HeaderControl;