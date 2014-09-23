module.exports = function(loadedTemplate, templateData, out) {
    var engine = this;

    var asyncOut = out.beginAsync();

    engine.stream(loadedTemplate, templateData)
        .on('data', function(data) {
            asyncOut.write(data);
        })
        .on('error', function(err) {
            asyncOut.error(err);
        })
        .on('end', function() {
            asyncOut.end();
        });
};