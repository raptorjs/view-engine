module.exports = function(loadedTemplate, templateData, context) {
    var engine = this;

    var asyncContext = context.beginAsync();

    engine.stream(loadedTemplate, templateData)
        .on('data', function(data) {
            asyncContext.write(data);
        })
        .on('error', function(err) {
            asyncContext.error(err);
        })
        .on('end', function() {
            asyncContext.end();
        });
};