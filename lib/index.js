var nodePath = require('path');
var ok = require('assert').ok;

var extensions = {};

function registerEngine(ext, engine) {
    extensions[ext] = engine;
}

function loader(module) {
    ok(module, '"module" is required');

    var dirname;

    if (typeof module === 'string') {
        dirname = module;
    }
    else if (module.filename) {
        dirname = nodePath.dirname(module.filename);
    }

    ok(dirname, 'Invalid loader context: ' + require('util').inspect(module));
}

registerEngine('.dust', require('./engine-dust'));

exports.loader = loader;
exports.registerEngine = registerEngine;