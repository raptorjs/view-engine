module.exports = function(viewEngine, config) {
    var engines = config.engines;

    for (var engineModuleName in engines) {
        if (engines.hasOwnProperty(engineModuleName)) {
            var engineConfig = engines[engineModuleName];

            var extensions = engineConfig.extensions;

            var engine = require(engineModuleName)(engineConfig, viewEngine);
            if (!extensions) {
                extensions = engine.extensions || [];
            }

            for (var i=0; i<extensions.length; i++) {
                viewEngine.register(extensions[i], engine);
            }
        }
    }
};
