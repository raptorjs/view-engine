module.exports = function(loadedTemplate, templateData, out) {
    var engine = this;
    var asyncContext = out.beginAsync();

    engine.callback(loadedTemplate, templateData, function(err, data) {
        if (err) {
            asyncContext.error(err);
            return;
        }

        asyncContext.end(data);
    });

};