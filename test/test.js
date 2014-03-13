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

    it('should render a raptor template with a callback', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-raptor': {
                    extensions: ['rhtml']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.rhtml'));

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

    it('should render a template to a stream', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-raptor': {
                    extensions: ['rhtml']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.rhtml'));
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

    

    it('should render a raptor template to a render context', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-raptor': {
                    extensions: ['rhtml']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.rhtml'));
        var context = viewEngine.createRenderContext();
        template.render({
                name: 'John'
            }, context)
            .on('end', function() {
                expect(context.getOutput()).to.equal('Hello John!');
                done();
            })
            .on('error', done);
    });

    // Dust:
    it('should render a Dust template with a callback', function(done) {
        var viewEngine = require('../');
        viewEngine.configure({
            engines: {
                'view-engine-raptor': {
                    extensions: ['rhtml']
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
                'view-engine-raptor': {
                    extensions: ['rhtml']
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
                'view-engine-raptor': {
                    extensions: ['rhtml']
                },
                'view-engine-dust': {
                    extensions: ['dust']
                }
            }
        });

        var template = viewEngine.load(require.resolve('./templates/hello.dust'));
        var context = viewEngine.createRenderContext();
        template.render({
                name: 'John'
            }, context)
            .on('end', function() {
                expect(context.getOutput()).to.equal('Hello John!');
                done();
            })
            .on('error', done);
    });
});

