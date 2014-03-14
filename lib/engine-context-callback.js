module.exports = function(loadedTemplate, templateData, context) {
    var engine = this;
    context.beginAsync(function(asyncContext, done) {
        engine.callback(loadedTemplate, templateData, function(err, data) {
            if (err) {
                done(err);
                return;
            }

            done(null, data);
        });
    });
    
};