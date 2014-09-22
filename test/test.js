'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var path = require('path');

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



    it('should render a marko template to a render context', function(done) {
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
        var context = viewEngine.createWriter();
        template.render({
                name: 'John'
            }, context)
            .on('end', function() {
                expect(context.getOutput()).to.equal('Hello John!');
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



    it('should render a Dust template to a render context', function(done) {
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
        var context = viewEngine.createWriter();
        template.render({
                name: 'John'
            }, context)
            .on('end', function() {
                expect(context.getOutput()).to.equal('Hello John!');
                done();
            })
            .end();
    });
});

