module.exports = function(loadedTemplate, templateData, context) {
    var engine = this;
    var asyncContext = context.beginAsync();

    engine.callback(loadedTemplate, templateData, function(err, data) {
        if (err) {
            asyncContext.error(err);
            return;
        }

        asyncContext.end(data);
    });
    
};