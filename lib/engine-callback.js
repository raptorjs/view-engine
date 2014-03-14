var viewEngine = require('./view-engine');
var StringBuilder = require('raptor-strings/StringBuilder');

module.exports = function(loadedTemplate, templateData, callback) {
    var stringBuilder = new StringBuilder();
    var context = viewEngine.createRenderContext(stringBuilder);
    this.context(loadedTemplate, templateData, context);
    context
        .on('error', callback)
        .on('end', function() {
            callback(null, stringBuilder.toString());
        })
        .end();
};