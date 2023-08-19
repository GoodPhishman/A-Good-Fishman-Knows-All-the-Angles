

var ko = require("knockout");
var Browser = require("../Core/BrowserControl");
var ComponentEvent = require("../Core/ComponentEvent");
var HostExtensions = null;

if (__IS_WEBWIZARD_ENABLED__ || __REQUIRE_WIZARD_IN_CORE__)
{
    if (__REQUIRE_WIZARD_IN_CORE__)
    {
        HostExtensions = require("./WizardFooterButtonExtensions");
    }
    else
    {
        require.ensure([],
            function ()
            {
                HostExtensions = require("./WizardFooterButtonExtensions");
            },
            "Wizard");
    }
}
else if (__IS_INCLUSIVE_OOBE__)
{
    HostExtensions = require("./Win10InclusiveOOBEFooterButtonExtensions");
}
else if (__IS_XBOX__)
{
    HostExtensions = require("./XboxFooterButtonExtensions");
}

var w = window;



function FooterButtonsViewModel(params)
{
    params = params || {};

    var _this = this;

    var _serverData = params.serverData;
    var _primaryButtonId = params.primaryButtonId;
    var _secondaryButtonId = params.secondaryButtonId;
    var _primaryButtonText = params.primaryButtonText;
    var _secondaryButtonText = params.secondaryButtonText;
    var _isPrimaryButtonVisible = params.isPrimaryButtonVisible !== false; 
    var _isSecondaryButtonVisible = params.isSecondaryButtonVisible !== false;
    var _isPrimaryButtonEnabled = params.isPrimaryButtonEnabled !== false;
    var _isSecondaryButtonEnabled = params.isSecondaryButtonEnabled !== false;
    var _focusOnPrimaryButton = params.focusOnPrimaryButton || false; 
    var _focusOnSecondaryButton = params.focusOnSecondaryButton || false;
    var _primaryButtonDescribedBy = params.primaryButtonDescribedBy;
    var _secondaryButtonDescribedBy = params.secondaryButtonDescribedBy;
    var _primaryButtonCss = params.primaryButtonCss;
    var _secondaryButtonCss = params.secondaryButtonCss;
    var _primaryButtonType = params.primaryButtonType || "submit";
    var _removeBottomMargin = params.removeBottomMargin;
    var _primaryButtonPreventTabbing = params.primaryButtonPreventTabbing || { direction: "none" };

    
    _this.primaryButtonId = _primaryButtonId;
    _this.secondaryButtonId = _secondaryButtonId;

    _this.primaryButtonCss = _primaryButtonCss;
    _this.secondaryButtonCss = _secondaryButtonCss;

    _this.primaryButtonText = ko.observable(_primaryButtonText);
    _this.secondaryButtonText = ko.observable(_secondaryButtonText);

    _this.isPrimaryButtonVisible = ko.observable(_isPrimaryButtonVisible);
    _this.isSecondaryButtonVisible = ko.observable(_isSecondaryButtonVisible);

    _this.isPrimaryButtonEnabled = ko.observable(_isPrimaryButtonEnabled);
    _this.isSecondaryButtonEnabled = ko.observable(_isSecondaryButtonEnabled);

    _this.focusOnPrimaryButton = ko.observable(_focusOnPrimaryButton);
    _this.focusOnSecondaryButton = ko.observable(_focusOnSecondaryButton);

    _this.hasOneButtonVisible = ko.pureComputed(
        function ()
        {
            var visibleButtons = 0;

            if (_this.isPrimaryButtonVisible())
            {
                visibleButtons++;
            }

            if (_this.isSecondaryButtonVisible())
            {
                visibleButtons++;
            }

            return visibleButtons === 1;
        });

    
    
    _this.primaryButtonDescribedBy = _primaryButtonDescribedBy;
    _this.secondaryButtonDescribedBy = _secondaryButtonDescribedBy;

    _this.removeBottomMargin = _removeBottomMargin;
    _this.primaryButtonPreventTabbing = _primaryButtonPreventTabbing;

    _this.primaryButtonAttributes = ko.pureComputed(
        function ()
        {
            var buttonAttributes = {
                "id": _this.primaryButtonId || "idSIButton9",
                "aria-describedby": _this.primaryButtonDescribedBy
            };

            if (Browser.Helper.isChangingInputTypeSupported())
            {
                buttonAttributes.type = _primaryButtonType;
            }

            return buttonAttributes;
        });

    
    _this.onPrimaryButtonClick = ComponentEvent.create();
    _this.onSecondaryButtonClick = ComponentEvent.create();

    
    _this.setTextPrimaryButton = function (text)
    {
        _this.primaryButtonText(text);
    };

    _this.setTextSecondaryButton = function (text)
    {
        _this.secondaryButtonText(text);
    };

    _this.setVisibilityPrimaryButton = function (isButtonVisible)
    {
        _this.isPrimaryButtonVisible(isButtonVisible);
    };

    _this.setVisibilitySecondaryButton = function (isButtonVisible)
    {
        _this.isSecondaryButtonVisible(isButtonVisible);
    };

    _this.setEnabledPrimaryButton = function (isButtonEnabled)
    {
        _this.isPrimaryButtonEnabled(isButtonEnabled);
    };

    _this.setEnabledSecondaryButton = function (isButtonEnabled)
    {
        _this.isSecondaryButtonEnabled(isButtonEnabled);
    };

    _this.primaryButton_onClick = function ()
    {
        _this.onPrimaryButtonClick();
    };

    _this.secondaryButton_onClick = function ()
    {
        _this.onSecondaryButtonClick();
    };

    (function initialize()
    {
        if (HostExtensions && HostExtensions.initialize)
        {
            HostExtensions.initialize(_this, _serverData, params);
        }
    })();
}

ko.components.register("footer-buttons-field",
    {
        viewModel: FooterButtonsViewModel,
        template: require("html/LoginPage/Fields/FooterButtons/FooterButtonsFieldHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = FooterButtonsViewModel;