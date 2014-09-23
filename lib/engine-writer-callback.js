module.exports = function(loadedTemplate, templateData, out) {
    var engine = this;
    var asyncOut = out.beginAsync();

    engine.callback(loadedTemplate, templateData, function(err, data) {
        if (err) {
            asyncOut.error(err);
            return;
        }

        asyncOut.end(data);
    });

};