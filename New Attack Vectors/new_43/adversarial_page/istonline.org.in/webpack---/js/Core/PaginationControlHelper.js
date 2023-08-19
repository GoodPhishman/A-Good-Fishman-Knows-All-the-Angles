var ko = require("knockout");


function PaginationControlHelper(serverData, paginationControlMethods, backgroundLogoUrl)
{
    var _this = this;
    var _serverData = serverData;
    var _hideFooter = _serverData.fHideFooter;
    var _showPageLevelTitleAndDesc = _serverData.fShowPageLevelTitleAndDesc;
    var _persistedViewId = null;

    _this.paginationControlMethods = paginationControlMethods || ko.observable();
    _this.backgroundLogoUrl = backgroundLogoUrl || ko.observable();

    
    _this.animationEnd = ko.pureComputed(
        function ()
        {
            return _this.paginationControlMethods() && _this.paginationControlMethods().view_onAnimationEnd;
        });

    _this.showBackgroundLogoHolder = ko.pureComputed(
        function ()
        {
            return _this.backgroundLogoUrl() && _this.showLogo();
        });

    _this.showErrorPageDebugDetails = ko.pureComputed(
        function ()
        {
            return _this.paginationControlMethods() && _this.paginationControlMethods().currentViewHasMetadata("extraDebugDetails");
        });

    _this.showFooterControl = ko.pureComputed(
        function ()
        {
            return !_hideFooter && _this.paginationControlMethods() && _this.paginationControlMethods().hasInitialViewShown();
        });

    _this.showLogo = ko.pureComputed(
        function ()
        {
            return !(_this.paginationControlMethods() && _this.paginationControlMethods().currentViewHasMetadata("hideLogo"));
        });

    _this.showLwaDisclaimer = ko.pureComputed(
        function ()
        {
            return _this.paginationControlMethods() && !_this.paginationControlMethods().currentViewHasMetadata("hideLwaDisclaimer");
        });

    _this.showPageLevelTitleControl = ko.pureComputed(
        function ()
        {
            return _showPageLevelTitleAndDesc && !(_this.paginationControlMethods() && _this.paginationControlMethods().currentViewHasMetadata("hidePageLevelTitleAndDesc"));
        });

    _this.useWiderWidth = ko.pureComputed(
        function ()
        {
            return _this.paginationControlMethods() && _this.paginationControlMethods().currentViewHasMetadata("wide");
        });

    
    _this.onLoad = function ()
    {
        _this.paginationControlMethods().restoreState(_persistedViewId);
        _persistedViewId = null;
    };

    _this.onUnload = function (currentViewId)
    {
        _persistedViewId = currentViewId;
    };
}

module.exports = PaginationControlHelper;