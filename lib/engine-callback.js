var viewEngine = require('./view-engine');
var StringBuilder = require('raptor-strings/StringBuilder');

module.exports = function(loadedTemplate, templateData, callback) {
    var stringBuilder = new StringBuilder();
    var context = viewEngine.createRenderContext(stringBuilder);
    context.beginRender();
    this.context(loadedTemplate, templateData, context);
    context.endRender();
    context.on('error', callback);
    context.on('end', function() {
        callback(null, stringBuilder.toString());
    });
};