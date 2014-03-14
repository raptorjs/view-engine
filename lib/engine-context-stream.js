module.exports = function(loadedTemplate, templateData, context) {
    var engine = this;
    context.beginAsync(function(asyncContext, done) {
        engine.stream(loadedTemplate, templateData)
            .on('data', function(data) {
                asyncContext.write(data);
            })
            .on('error', function(err) {
                done(err || 'error');
            })
            .on('end', function() {
                done();
            });
    });
};