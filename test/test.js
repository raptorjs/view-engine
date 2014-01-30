'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var path = require('path');

describe('view-engine' , function() {

    beforeEach(function(done) {
        for (var k in require.cache) {
            if (require.cache.hasOwnProperty(k)) {
                delete require.cache[k];
            }
        }

        require('raptor-promises').enableLongStacks();

        require('raptor-logging').configureLoggers({
            'raptor-optimizer': 'WARN'
        });

        done();
    });

    it('should render a simple template to a stream', function(done) {
        var viewEngine = require('../');

        var template = viewEngine
            .loader(module)
            .require('./templates/hello-dust');


        var output = '';

        template.stream({
                name: 'John'
            })
            .on('data', function(data) {
                output += data;
            })
            .on('end', function() {
                expect(output).to.equal('Hello John');
                done();
            })
            .on('error', done);
    });

    it('should render a simple template with a callback', function(done) {
        var viewEngine = require('../');

        var template = viewEngine
            .loader(module)
            .require('./templates/hello-dust');


        template.render({
                name: 'John'
            },
            function(err, data) {
                if (err) {
                    done(err);
                }

                expect(data).to.equal('Hello John');
                done();
            });
    });
});

