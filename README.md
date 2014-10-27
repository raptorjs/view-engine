view-engine
-----------

The `view-engine` module provides a small abstraction layer to make it easier to work with multiple templating languages on both the server and the browser. This module provides the following benefits:

* Browser and Server Support
    - Browser-support requires using a Node.js module bundler such as [RaptorJS Optimizer](https://github.com/raptorjs3/optimizer) or [browserify](https://github.com/substack/node-browserify)
* Normalized Rendering API
* Multiple Rendering Styles
    - Callbacks
    - Streams
    - Asynchronous rendering
* Mixed-Mode Template Rendering
    - Multiple templating engines can asynchronously render out to the same output stream
    - That is, template engines can now play nice with each other
* Encapsulation
    - Each view engine can have special logic to resolve and render templates


# Installation

```
npm install view-engine
```

You will then need to install additional modules to use your favorite templating language. For example:

* [Marko](https://github.com/raptorjs3/marko):
  `npm install view-engine-marko`
* [Dust](https://github.com/linkedin/dustjs):
  `npm install view-engine-dust`

# Usage

## Configuration

Registering view engines:

```javascript
var viewEngine = require('view-engine');
viewEngine.register('marko', require('view-engine-marko'));
viewEngine.register('dust', require('view-engine-dust'));
viewEngine.register('jade', require('view-engine-jade'));
```

## Template Rendering

### Render with a Callback

```javascript
var templatePath = require.resolve('./hello.marko');
var template = require('view-engine').load(templatePath);

template.render({
        name: 'John Doe'
    },
    function(err, output) {
        if (err) {
            console.error('Failed to render template: ' + e);
            return;
        }

        console.log(output);
    })
```

### Render to a Stream

```javascript
var templatePath = require.resolve('./hello.marko');
var template = require('view-engine').load(templatePath);

template.stream({
        name: 'John Doe'
    })
    .pipe(out);
```

NOTE: The template file extension is required in order to determine which view engine to use.

Piping out to a response as part of Express middleware:

```javascript
var templatePath = require.resolve('./hello.marko');
var template = require('view-engine').load(templatePath);

app.get('/test', function(req, res) {
    template.stream({
            name: 'John Doe'
        })
        .pipe(res);  
})
```

Alternatively, you can render directly to an existing stream to avoid creating an intermediate stream:

```javascript
var templatePath = require.resolve('./hello.marko');
var template = require('view-engine').load(templatePath);

app.get('/test', function(req, res) {
    template.render({
            name: 'John Doe'
        }, res);
})
```

_NOTE:_ This will end the target output stream.

### Render to an Existing Async Writer

It's also possible render a template to a previously created async writer that supports asynchronous rendering (described more later):

```javascript
var templatePath = require.resolve('./hello.marko');
var template = require('view-engine').load(templatePath);

template.render({
        name: 'John Doe'
    }, out);
```

#### Asynchronous Rendering

The `view-engine` module supports rendering output asynchronously to an output stream as shown in the following example code:

```javascript
var viewEngine = require('view-engine');
var fooTemplate = viewEngine.load(require.resolve('./foo.dust'));
var barTemplate = viewEngine.load(require.resolve('./bar.marko'));
var through = require('through');

var stream = through();
var out = viewEngine.createWriter(stream /* underlying writer or stream */);

fooTemplate.render({
        name: 'John Doe'
    },
    out);

var asyncOut = out.beginAsync();
setTimeout(function() {
    asyncOut.write('Hello World Async');
    asyncOut.end();
}, 1000);

out.write('Hello World')

barTemplate.render({
        message: 'Hello World'
    },
    out);

out.on('end', function() {
    /*
    This callback will be invoked when all of the async rendering has completed.

    The output is written to the underlying writer/stream. For this example, the
    order of the output will be the following:

    1) Output of rendering fooTemplate
    2) "Hello World Async"
    3) "Hello World"
    4) Output of rendering barTemplate
    */
});

out.end();
```

The [async writer](https://github.com/raptorjs3/async-writer) module does the hard work of ensuring that the output of each fragment is flushed out in the correct order. Content that is rendered before it is ready to be flushed is buffered and immediately flushed as soon it is ready.

# Available View Engines

Below is a list of available view engines:

* [Dust](https://github.com/linkedin/dustjs): [view-engine-dust](https://github.com/patrick-steele-idem/view-engine-dust)
* [Handlebars](https://github.com/wycats/handlebars.js): [view-engine-handlebars](https://github.com/patrick-steele-idem/view-engine-handlebars)
* [Jade](http://jade-lang.com/): [view-engine-jade](https://github.com/patrick-steele-idem/view-engine-jade)
* [Marko](https://github.com/raptorjs3/marko): [view-engine-marko](https://github.com/patrick-steele-idem/view-engine-marko)

If you create your own, please send a Pull Request so that it will show up on this page. Also, don't forget to tag your module with `view-engine` so that users can find it in `npm`.

# Additional Reading

## Creating Your Own View Engine

Each view engine provider is a module that exports a factory function as shown below:

```javascript
module.exports = function create(config) {
    return {
        // View engine methods
    }
}
```

The object returned by the factory function can contain any of the following methods:

* `load(path) : <Object>` (optional)
* One or more of the following rendering methods:
    - `callback(loadedTemplate, templateData, callback)`
    - `stream(loadedTemplate, templateData) : <Stream>`
    - `out(loadedTemplate, templateData, out)`

Rendering methods that are not implemented will automatically be filled in by the `view-engine` module using one of the implemented methods. The `load(path)` method is optional, but if implemented it should return a loaded template that will be passed as the first argument to any of the rendering methods. If a `load(path)` method is not provided then the data path will be passed to the rendering methods.

Example implementation for the [jade](https://github.com/visionmedia/jade) templating language:
```javascript
var jade = require('jade');

module.exports = function create(config) {
    return {
        callback: function(path, templateData, callback) {
            var html = jade.renderFile(path, templateData);
            callback(null, html);
        }
    }
}
```

## UI Components

One of the motivations behind creating the `view-engine` module was to support the concept of building universal UI components that render HTML. The `view-engine` module allows UI components to be treated as a black box as far as rendering is concerned. That is, the user of the UI component renderer should not need to care how the renderer was implemented. Assuming every UI component renderer standardizes on the following method signature:

```javascript
module.exports = function render(data, out) {
    // Render HTML to the asynchronous async writer based on the provided data
}
```

The UI component can then be implemented using any supported templating engine or no templating engine at all:

_Using no templating engine:_

```javascript
module.exports = function render(data, out) {
    out.write('Hello ' + data.name + '!');
}
```

_Using Marko:_

```javascript
var template = viewEngine.load(require.resolve('./foo.marko'));
module.exports = function render(data, out) {
    template.render({ name: data.name }, out);
}
```

_Using Dust:_

```javascript
var template = viewEngine.load(require.resolve('./bar.dust'));
module.exports = function render(data, out) {
    template.render({ name: data.name }, out);
}
```

With this approach, a UI component can even render its output asynchronously. For example:

```javascript
var request = require('request');
module.exports = function render(data, out) {
    var asyncOut = out.beginAsync();
    request('http://foo.com/some/service', function (error, response, body) {
        if (error) {
            asyncOut.error(error);
            return
        }

        asyncOut.write(body); // Just write out the response verbatim...
        asyncOut.end();
    });
}
```

## Comparison to Consolidate.js

The [consolidate](https://github.com/visionmedia/consolidate.js/) module is a template consolidation engine that only works on the server and is designed to only work with Express. In addition, it only supports the less efficient callback-style rendering which means that an HTML string will only start to be flushed out to the client after the entire output is generated and stored in memory.

In comparision, the `view-engine` module works on both the server and the client and it is not tied to any one framework. In addition, it supports very efficient asynchronous rendering and streaming.
