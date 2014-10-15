var viewEngine = require('./view-engine');
var StringBuilder = require('raptor-strings/StringBuilder');

module.exports = function(loadedTemplate, templateData, callback) {
    var stringBuilder = new StringBuilder();
    var out = viewEngine.createWriter(stringBuilder);

    out
        .on('error', callback)
        .on('finish', function() {
            callback(null, stringBuilder.toString());
        });

    this.writer(loadedTemplate, templateData, out);

    out.end();
};