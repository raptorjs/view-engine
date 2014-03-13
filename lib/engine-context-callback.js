module.exports = function(loadedTemplate, templateData, context) {
    var engine = this;
    context.beginAsyncFragment(function(asyncContext, asyncFragment) {
        engine.callback(loadedTemplate, templateData, function(err, data) {
            if (err) {
                asyncFragment.end(err);
                return;
            }

            asyncContext.write(data);
            asyncFragment.end();
        });
    });
    
};