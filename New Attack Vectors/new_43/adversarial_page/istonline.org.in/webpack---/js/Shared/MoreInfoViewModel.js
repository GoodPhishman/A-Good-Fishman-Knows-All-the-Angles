

var ko = require("knockout");

var Browser = require("../Core/BrowserControl");
var ComponentEvent = require("../Core/ComponentEvent");
var Constants = require("../Core/Constants");

var w = window;
var PaginatedState = Constants.PaginatedState;
var Host = null;

if (__IS_CXH_ENABLED__)
{
    Host = require("../LoginPage/Win10LoginHost");
}

function MoreInfoViewModel(params)
{
    
    var _this = this;
    

    
    var _serverData = params.serverData;
    var _isInitialView = params.isInitialView;
    var _moreInfoTitle = params.moreInfoTitle;
    var _moreInfo = params.moreInfo;
    var _showErrorText = !!params.showErrorText;
    

    
    var _showButtons = _serverData.fShowButtons;
    var _allowCancel = _serverData.fAllowCancel;
    

    
    _this.onSwitchView = ComponentEvent.create();
    _this.onSetBackButtonState = ComponentEvent.create();
    

    
    _this.moreInfoTitle = _moreInfoTitle;
    _this.moreInfo = _moreInfo;
    _this.showErrorText = _showErrorText;
    

    
    _this.getState = function ()
    {
    };

    _this.restoreState = function ()
    {
    };
    

    
    _this.secondaryButton_onClick = function ()
    {
        if (Host && Host.handleOnFinalBack && _isInitialView)
        {
            Host.handleOnFinalBack(_serverData);
        }
        else
        {
            _this.onSwitchView(PaginatedState.Previous);
        }
    };
    

    
    (function _initialize()
    {
        _this.onSetBackButtonState(_showButtons && (!_isInitialView || _allowCancel) );

        if (Host && Host.handleBackButton)
        {
            Host.handleBackButton(_this.secondaryButton_onClick.bind(_this));
        }
    })();
    
}

ko.components.register("more-info-view",
    {
        viewModel: MoreInfoViewModel,
        template: require("html/Shared/Views/ConvergedMoreInfoViewHtml.html"),
        synchronous: !w.ServerData.iMaxStackForKnockoutAsyncComponents || Browser.Helper.isStackSizeGreaterThan(w.ServerData.iMaxStackForKnockoutAsyncComponents),
        enableExtensions: true
    });

module.exports = MoreInfoViewModel;