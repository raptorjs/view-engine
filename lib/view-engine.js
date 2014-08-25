var configLoader = require('./config-loader');
var Context = require('raptor-render-context').Context;
var engineContextCallback = require('./engine-context-callback');
var engineContextStream = require('./engine-context-stream');
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
        // Callback is actually a context object
        var context = callback;
        var shouldEnd = false;

        if (!context.isRenderContext) {
            // Assume the "context" is really a stream
            context = new Context(context);
            shouldEnd = true;
        }

        if (engine.buildTemplateData) {
            templateData = engine.buildTemplateData(this.loadedTemplate, templateData, context);
        }

        engine.context(loadedTemplate, templateData, context);

        if (shouldEnd) {
            context.end(); // End the context and the underlying stream
        }
        
        return context; // Support chaining on context
    }
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

    // Start with making sure the engine has a "context" which
    // can serve as the basis for all other required methods
    if (!engine.context) {
        if (engine.callback) {
            engine.context = engineContextCallback;
        } else if (engine.stream) {
            engine.context = engineContextStream;
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

function load(path, context) {
    var lastDot = path.lastIndexOf('.');
    if (lastDot === -1) {
        throw new Error('Unable to determine view engine. Path has no extension: ' + path);
    }
    var ext = path.substring(lastDot+1);
    var engine = engines[ext];
    if (!engine) {
        throw new Error('No engine registered for extension: ' + ext);
    }

    var template = engine.load ? engine.load(path) : path;

    if (engine.passThrough) {
        return template;
    }

    return new Template(template, engine);
}

function configure(config) {
    configLoader(exports, config);
}

function createRenderContext(writer) {
    return new Context(writer);
}

exports.register = registerEngine;
exports.configure = configure;
exports.load = load;
exports.createRenderContext = createRenderContext;
