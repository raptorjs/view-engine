'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var nodePath = require('path');
var fs = require('fs');

var buildDir = nodePath.join(__dirname, 'build');
try {
    fs.mkdirSync(buildDir);
} catch(e) {
    // Assume directory already exists
}

describe('view-engine' , function() {

    beforeEach(function(done) {
        // for (var k in require.cache) {
        //     if (require.cache.hasOwnProperty(k)) {
        //         delete require.cache[k];
        //     }
        // }

        done();
    });

    it('should render a marko template with a callback', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-marko': {
                    extensions: ['marko']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.marko'));

        template.render(
            {
                name: 'John'
            },
            function(err, data) {
                if (err) {
                    done(err);
                }

                expect(data).to.equal('Hello John!');
                done();
            });
    });

    it('should create a stream that can be piped', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-marko': {
                    extensions: ['marko']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.marko'));
        var output = '';
        template.stream({
                name: 'John'
            })
            .on('data', function(data) {
                output += data;
            })
            .on('end', function() {
                expect(output).to.equal('Hello John!');
                done();
            })
            .on('error', done);
    });

    it('should render a template to an existing stream', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-marko': {
                    extensions: ['marko']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var output = '';
        var outStream = require('through')(
            function write(data) {
                output += data;
            },
            function end() {
                expect(output).to.equal('Hello John!');
                done();
            }
        );

        var template = viewEngine.load(require.resolve('./templates/hello.marko'));
        template.render({
                name: 'John'
            }, outStream)
            .on('error', done);
    });



    it('should render a marko template to an async writer', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-marko': {
                    extensions: ['marko']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.marko'));
        var out = viewEngine.createWriter();
        template.render({
                name: 'John'
            }, out)
            .on('finish', function() {
                expect(out.getOutput()).to.equal('Hello John!');
                done();
            })
            .on('error', done)
            .end();
    });

    // Dust:
    it('should render a Dust template with a callback', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-marko': {
                    extensions: ['marko']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.dust'));

        template.render(
            {
                name: 'John'
            },
            function(err, data) {
                if (err) {
                    done(err);
                }

                expect(data).to.equal('Hello John!');
                done();
            });
    });

    it('should render a Dust template to a stream', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-marko': {
                    extensions: ['marko']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.dust'));
        var output = '';
        template.stream({
                name: 'John'
            })
            .on('data', function(data) {
                output += data;
            })
            .on('end', function() {
                expect(output).to.equal('Hello John!');
                done();
            })
            .on('error', done);
    });

    it('should render a Dust template to an async writer', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-marko': {
                    extensions: ['marko']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.dust'));
        var out = viewEngine.createWriter();
        template.render({
                name: 'John'
            }, out)
            .on('finish', function() {
                expect(out.getOutput()).to.equal('Hello John!');
                done();
            })
            .end();
    });

    it('should render a Dust template to an existing writable stream', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-marko': {
                    extensions: ['marko']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var outFile = nodePath.join(buildDir, 'dust.txt');

        var out = fs.createWriteStream(outFile, 'utf8');
        out.on('close', function() {
            var result = fs.readFileSync(outFile, 'utf8');
            expect(result).to.equal('Hello John!');
            done();
        });

        var template = viewEngine.load(require.resolve('./templates/hello.dust'));

        template.render({
                name: 'John'
            }, out);
    });

    it('should render a Jade template to an existing writable stream', function(done) {
        var viewEngine = require('../');
        viewEngine.register('jade', require('./test-view-engine-jade'));

        var outFile = nodePath.join(buildDir, 'jade.txt');

        var out = fs.createWriteStream(outFile, 'utf8');
        out.on('close', function() {
            var result = fs.readFileSync(outFile, 'utf8');
            expect(result).to.equal('Hello John!');
            done();
        });

        var template = viewEngine.load(require.resolve('./templates/hello.jade'));

        template.render({
                name: 'John'
            }, out);
    });

    it('should render a Jade template synchronously', function(done) {
        var viewEngine = require('../');
        viewEngine.register('jade', require('./test-view-engine-jade'));

        var template = viewEngine.load(require.resolve('./templates/hello.jade'));

        var result = template.renderSync({
                name: 'John'
            });
        expect(result).to.equal('Hello John!');
        done();
    });

    it('should render a Jade template assynchronously', function(done) {
        var viewEngine = require('../');
        viewEngine.register('jade', require('./test-view-engine-jade'));

        var template = viewEngine.load(require.resolve('./templates/hello.jade'));

        template.render({
                name: 'John'
            }, function(err, result) {
                if (err) {
                    return done(err);
                }

                expect(result).to.equal('Hello John!');
                done();
            });
    });
});

