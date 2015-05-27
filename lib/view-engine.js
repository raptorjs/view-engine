var configLoader = require('./config-loader');
var AsyncWriter = require('async-writer').AsyncWriter;
var engineWriterCallback = require('./engine-writer-callback');
var engineWriterStream = require('./engine-writer-stream');
var engineCallback = require('./engine-callback');
var engineStream = require('./engine-stream');
var extend = require('raptor-util/extend');

function Template(loadedTemplate, engine) {
    this.loadedTemplate = loadedTemplate;
    this.engine = engine;
}

Template.prototype.render = function(templateData, callback) {
    var engine = this.engine;
    var loadedTemplate = this.loadedTemplate;
    if (typeof callback === 'function') {
        // Callback is actually a callback function
        engine.callback(loadedTemplate, templateData, callback);
    } else {
        // Callback is actually an AsyncWriter or Stream object
        var out = callback;
        var shouldEnd = false;

        if (!out.isAsyncWriter) {
            // Assume the "out" is really a stream
            out = new AsyncWriter(out);
            shouldEnd = true;
        }

        if (engine.buildTemplateData) {
            templateData = engine.buildTemplateData(this.loadedTemplate, templateData, out);
        }

        engine.writer(loadedTemplate, templateData, out);

        if (shouldEnd) {
            out.end(); // End the out and the underlying stream
        }

        return out; // Support chaining on out
    }
};

Template.prototype.renderSync = function(templateData) {
    // Callback is actually an AsyncWriter or Stream object
    var out = new AsyncWriter(out);
    var engine = this.engine;
    var loadedTemplate = this.loadedTemplate;

    if (engine.buildTemplateData) {
        templateData = engine.buildTemplateData(this.loadedTemplate, templateData, out);
    }

    engine.writer(loadedTemplate, templateData, out);

    out.end(); // End the out and the underlying stream

    return out.getOutput(); // Support chaining on out
};

Template.prototype.stream = function(templateData) {
    var engine = this.engine;
    var loadedTemplate = this.loadedTemplate;
    return engine.stream(loadedTemplate, templateData);
};

var engines = {};

function registerEngine(ext, provider, config) {
    if (typeof provider === 'function') {
        provider = provider(config || {}, exports);
    }

    var engine = extend({}, provider);

    // Start with making sure the engine has a "out" which
    // can serve as the basis for all other required methods
    if (!engine.writer) {
        if (engine.callback) {
            engine.writer = engineWriterCallback;
        } else if (engine.stream) {
            engine.writer = engineWriterStream;
        } else if (engine.load) {
            engine.passThrough = true;
            engines[ext] = engine;
            return;
        } else {
            throw new Error('Engine missing required render method: ' + ext);
        }
    }


    if (!engine.callback) {
        engine.callback = engineCallback;
    }

    if (!provider.stream) {
        engine.stream = engineStream;
    }

    engines[ext] = engine;
}

function load(path, engineName) {
    if (typeof path.render === 'function') {
        // Assume the path is already a loaded template
        return path;
    }

    if (!engineName) {

        if (typeof path === 'string') {
            var lastDot = path.lastIndexOf('.');
            if (lastDot === -1) {
                throw new Error('Unable to determine view engine. Path has no extension: ' + path);
            }

            engineName = path.substring(lastDot+1);
        } else {
            engineName = path.viewEngine;
            if (!engineName) {
                throw new Error('Unable to resolve view engine');
            }
        }
    }

    var engine = engines[engineName];
    if (!engine) {
        throw new Error('No engine registered for type: ' + engineName);
    }

    var template = engine.load ? engine.load(path) : path;

    if (engine.passThrough) {
        return template;
    }

    return new Template(template, engine);
}

function configure(config) {
    if (!config) {
        return;
    }

    configLoader(exports, config);
}

function createWriter(writer) {
    return new AsyncWriter(writer);
}

exports.register = registerEngine;
exports.configure = configure;
exports.load = load;
exports.createWriter = createWriter;
