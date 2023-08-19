var Helpers = require("./Helpers");
var Browser = require("./BrowserControl");

var w = window;
var ObjectHelpers = Helpers.Object;
var BrowserHelper = Browser.Helper;
var BrowserHistoryHelper = BrowserHelper.history;

module.exports = function (backCallback, forwardCallback, popStateCallback)
{
    var _this = this;

    var c_popState = "popstate";

    var _isHtml5HistorySupported = false;
    var _backCallback = backCallback;
    var _forwardCallback = forwardCallback;
    var _popStateCallback = popStateCallback;
    var _history = [null];
    var _historyIndex = 0;

    _this.dispose = function ()
    {
        if (_isHtml5HistorySupported)
        {
            BrowserHelper.removeEventListener(w, c_popState, _window_onPopState);
        }
    };

    _this.pushState = function (state)
    {
        _historyIndex++;
        _history.splice(_historyIndex, _history.length - _historyIndex, ObjectHelpers.clone(state));

        if (_isHtml5HistorySupported)
        {
            BrowserHistoryHelper.pushState(_historyIndex, "");
        }
    };

    _this.replaceState = function (state)
    {
        _history[_historyIndex] = ObjectHelpers.clone(state);
    };

    _this.goBack = function ()
    {
        if (_historyIndex > 0)
        {
            if (_isHtml5HistorySupported)
            {
                w.history.back();
            }
            else
            {
                _window_onPopState({ state: _historyIndex - 1 });
            }
        }
    };

    _this.getState = function ()
    {
        
        if (_historyIndex > _history.length)
        {
            _historyIndex = _history.length - 1;
        }
        else if (_historyIndex < 0)
        {
            _historyIndex = 0;
        }

        if (_history[_historyIndex] === null)
        {
            return null;
        }

        return ObjectHelpers.clone(_history[_historyIndex]);
    };

    function _window_onPopState(event)
    {
        if (!event || typeof event.state === "undefined" || event.state === null)
        {
            return;
        }

        var newHistoryIndex = event.state;
        if (newHistoryIndex < _historyIndex)
        {
            _backCallback();
        }
        else
        {
            _forwardCallback();
        }

        _historyIndex = newHistoryIndex;
        _popStateCallback(_this.getState());
    }

    (function _initialize()
    {
        _isHtml5HistorySupported = BrowserHelper.isHistorySupported();

        if (_isHtml5HistorySupported)
        {
            
            BrowserHistoryHelper.replaceState(_historyIndex, "");
            BrowserHelper.addEventListener(w, c_popState, _window_onPopState);
        }
    })();
};