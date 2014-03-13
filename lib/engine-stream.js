var STREAM_MODULE = 'stream';
var viewEngine = require('./view-engine');

function Readable() {
    Readable.$super.call(this);
    this._rendered = false;
}

Readable.prototype = {
    init: function() {
        this._args = arguments;
    },
    _read: function() {
        if (this._rendered) {
            return;
        }

        this._rendered = true;

        var context = viewEngine.createRenderContext(this);
        context.beginRender();
        this._engine.context(this._template, this._templateData, context);
        context.endRender();
    }
};

require('raptor-util').inherit(Readable, require(STREAM_MODULE).Readable);

module.exports = function(loadedTemplate, templateData) {
    var readable = new Readable();
    readable._engine = this;
    readable._template = loadedTemplate;
    readable._templateData = templateData;
    return readable;
};

