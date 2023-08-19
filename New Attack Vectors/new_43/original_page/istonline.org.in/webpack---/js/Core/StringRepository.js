var w = window;

function StringRepository()
{
    var _this = this;
    var _sources = {};

    _this.registerSource = function (sourceName, source)
    {
        _sources[sourceName] = _sources[sourceName] || [];
        _sources[sourceName].push(source);
    };

    _this.getStrings = function (sourceName, serverData)
    {
        var strings = {};
        var sources = _sources[sourceName] || [];

        for (var i = 0, length = sources.length; i < length; i++)
        {
            sources[i](strings, serverData);
        }

        return strings;
    };
}

w.StringRepository = module.exports = w.StringRepository || new StringRepository();