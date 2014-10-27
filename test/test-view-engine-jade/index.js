var fs = require('fs');
var nodePath = require('path');
var writeFileAtomicSync = require('write-file-atomic').sync;

function lastModifiedSync(path) {
    try {
        return fs.statSync(path).mtime.getTime();
    } catch(e) {
        return -1;
    }
}

function loader(compiler, runtime, path) {

    if (!compiler) {
        compiler = require('jade');
    }

    if (!runtime) {
        runtime = require('jade/runtime');
    }

    function compileFile() {
        var src = fs.readFileSync(path, 'utf8');
        var compiledSrc = compiler.compileClient(src);
        return 'module.exports=function(jade) { return ' + compiledSrc + '\n};';
    }

    path = nodePath.resolve(process.cwd(), path);

    var compiledOutputFilename = path + '.js';

    // See if the template has already been compiled and if it is up-to-date...


    var inFileLastModified = lastModifiedSync(path);
    var outFileLastModified = lastModifiedSync(compiledOutputFilename);

    if (inFileLastModified === -1) {
        throw new Error('Template not found at path "' + path + '"');
    } else if (outFileLastModified === -1 || inFileLastModified > outFileLastModified) {
        // The compiled template has not been saved to disk

        // We need to compile the file

        var compiled = compileFile(path);

        writeFileAtomicSync(compiledOutputFilename, compiled, 'utf8');
    }

    return require(compiledOutputFilename)(runtime);
}

module.exports = function createEngine(config) {
    var compiler = config.compiler || config.jade;
    var runtime = config.runtime;

    if (!runtime) {
        if (compiler && compiler.runtime) {
            runtime = compiler.runtime;
        }
    }

    return {
        writer: function(templateFunc, templateData, out) {
            if (!templateData) {
                templateData = {};
            }

            var html = templateFunc(templateData);
            out.write(html);
        },
        buildTemplateData: function(path, templateData, out) {
            templateData.stream = out.stream;
            templateData.templatePath = path;
            return templateData;
        },
        load: function(path) {
            return loader(compiler, runtime, path);
        }
    };
};
