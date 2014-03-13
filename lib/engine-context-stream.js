module.exports = function(loadedTemplate, templateData, context) {
    var engine = this;
    context.beginRender();
    context.beginAsyncFragment(function(asyncContext, asyncFragment) {
        engine.stream(loadedTemplate, templateData)
            .on('data', function(data) {
                asyncContext.write(data);
            })
            .on('error', function(err) {
                asyncFragment.end(err);
            })
            .on('end', function() {
                asyncFragment.end();
            });
    });
    context.endRender();
};