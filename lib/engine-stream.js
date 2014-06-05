var stream = 'stream';

try {
    stream = require.resolve(stream);
} catch(e) {
    stream = null;
}

var Readable = null;

if (stream) {
    stream = require(stream);

    var viewEngine = require('./view-engine');

    Readable = function() {
        Readable.$super.call(this);
        this._rendered = false;
    };

    Readable.prototype = {
        init: function() {
            this._args = arguments;
        },
        write: function(data) {
            this.push(data);
        },
        end: function() {
            this.push(null);
        },
        _read: function() {
            if (this._rendered) {
                return;
            }

            this._rendered = true;

            var context = viewEngine.createRenderContext(this);
            this._engine.context(this._template, this._templateData, context);
            context.end();
        }
    };

    require('raptor-util').inherit(Readable, stream.Readable);
}


module.exports = function(loadedTemplate, templateData) {
    if (!Readable) {
        throw new Error('"stream" module not found');
    }

    var readable = new Readable();
    readable._engine = this;
    readable._template = loadedTemplate;
    readable._templateData = templateData;
    return readable;
};