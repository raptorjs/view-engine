var configLoader = require('./config-loader');
var Context = require('raptor-render-context').Context;
var engineContextCallback = require('./engine-context-callback');
var engineContextStream = require('./engine-context-stream');
var engineCallback = require('./engine-callback');
var engineStream = require('./engine-stream');

function Template(loadedTemplate, engine) {
    this.loadedTemplate = loadedTemplate;
    this.engine = engine;
}

Template.prototype.render = function(input, callback) {
    var engine = this.engine;
    var loadedTemplate = this.loadedTemplate;
    if (typeof callback === 'function') {
        engine.callback(loadedTemplate, input, callback);
    } else {
        engine.context(loadedTemplate, input, callback);
        return callback; // Support chaining on context
    }
};

Template.prototype.stream = function(input) {
    var engine = this.engine;
    var loadedTemplate = this.loadedTemplate;
    return engine.stream(loadedTemplate, input);
};

var engines = {};

function registerEngine(ext, engine) {
    // Start with making sure the engine has a "context" which
    // can serve as the basis for all other required methods
    if (!engine.context) {
        if (engine.callback) {
            engine.context = engineContextCallback;
        } else if (engine.stream) {
            engine.context = engineContextStream;
        } else {
            throw new Error('Engine missing required render method: ' + ext);
        }
    }

    if (!engine.callback) {
        engine.callback = engineCallback;
    }

    if (!engine.stream) {
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
    return new Template(engine.load ? engine.load(path) : path, engine);
}

function configure(config) {
    configLoader(exports, config);
}

function createRenderContext(writer) {
    return new Context(writer);
}

exports.engine = registerEngine;
exports.configure = configure;
exports.load = load;
exports.createRenderContext = createRenderContext;
