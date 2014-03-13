view-engine
-----------

The `view-engine` module provides a small abstraction layer to make it easier to work with multiple templating languages on both the server and the browser. This module provides the following benefits:

* Browser and Server Support
    - Browser-support requires using a Node.js module bundler such as [raptor-optimizer](https://github.com/raptorjs3/raptor-optimizer) or [browserify](https://github.com/substack/node-browserify)
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

* Raptor Templates:
  `npm install view-engine-raptor`
* Dust:
  `npm install view-engine-dust`

# Usage

## Configuration

Associate file extensions with a view engine:
```javascript
require('view-engine').configure({
    engines: {
        'view-engine-rhtml': {
            extensions: ['rhtml']
            // Any additional config...
        },
        'view-engine-dust': {
            extensions: ['dust']
            // Any additional config...
        }
    }
})
```

## Template Rendering

### Render to a Stream
```javascript
var template = require('view-engine').load(require.resolve('./hello.rhtml'));

template.stream({
        name: 'John Doe'
    })
    .pipe(out);
```

NOTE: The template file extension is required in order to determine which view engine to use.

Piping out to a response as part of Express middleware:

```javascript
var template = require('view-engine').load(require.resolve('./hello.rhtml'));

app.get('/test', function(req, res) {
    template.stream({
            name: 'John Doe'
        })
        .pipe(res);  
})
```

### Render with an Output Callback
```javascript
var template = require('view-engine').load(require.resolve('./hello.rhtml'));

template.render({
        name: 'John Doe'
    },
    function(err, data) {
        if (err) {
            console.error('Failed to render template: ' + e);
            return;
        }

        console.log(data);
    })
```

### Render to an Existing Render Context

It's also possible render a template to a previously created render context that supports asynchronous rendering (described more later):
```javascript
var template = require('view-engine').load(require.resolve('./hello.rhtml'));

template.render({
        name: 'John Doe'
    }, context);
```

#### Asynchronous Rendering

The `view-engine` module supports rendering output asynchronously to an output stream as shown in the following example code:

```javascript
var viewEngine = require('view-engine');
var fooTemplate = viewEngine.load(require.resolve('./foo.dust'));
var barTemplate = viewEngine.load(require.resolve('./bar.rhtml'));
var through = require('through');

var out = through();
var context = viewEngine.createRenderContext(out /* underlying writer/stream */);
context.beginRender();

fooTemplate.render({
        name: 'John Doe'
    },
    context);

context.beginAsyncFragment(function(asyncContext, asyncFragment) {
    setTimeout(function() {
        asyncContext.write('Hello World Async');
        asyncFragment.end();
    }, 1000);
});

context.write('Hello World')

barTemplate.render({
        message: 'Hello World'
    },
    context);

context.endRender();

context.on('end', function() {
    /*
    The output is written to the underlying writer/stream. For this
    example, the order of the output will be the following:
    1) Output of rendering fooTemplate
    2) "Hello World Async"
    3) "Hello World"
    4) Output of rendering barTemplate
    */
});
```

The [render context object](https://github.com/raptorjs3/raptor-render-context) does the hard work of ensuring that the output of each fragment is flushed out in the correct order. Content that is rendered before it is ready to be flushed is buffered and immediately flushed as soon it is ready.

# Available View Engines

Below is a list of available view engines:

* Dust: [view-engine-dust](https://github.com/patrick-steele-idem/view-engine-dust)
* Raptor Templates: [view-engine-raptor](https://github.com/patrick-steele-idem/view-engine-raptor)

If you create your own, please send a Pull Request so that it will show up on this page. Also, don't forget to tag your module with `view-engine` so that users can find it in `npm`.

# Additional Reading

## Creating Your Own View Engine

Each view engine provider is a module that that exports a factory function as shown below:

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
    - `context(loadedTemplate, templateData, context)`

Rendering methods that are not implemented will automatically be filled in by the `view-engine` module using one of the implemented methods. The `load(path)` method is optional, but if implemented it should return a loaded template that will be passed as the first argument to any of the rendering methods. If a `load(path)` method is not provided then the input path will be passed to the rendering methods.

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
module.exports = function render(input, context) {
    // Render HTML to the asynchronous render context based on the provided input
}
```

The UI component can then be implemented using any supported templating engine or no templating engine at all:

_Using no templating engine:_
```javascript
module.exports = function render(input, context) {
    context.write('Hello ' + input.name + '!');
}
```

_Using Raptor Templates:_
```javascript
var template = viewEngine.load(require.resolve('./foo.rhtml'));
module.exports = function render(input, context) {
    template.render({ name: input.name }, context);
}
```

_Using Dust:_
```javascript
var template = viewEngine.load(require.resolve('./bar.dust'));
module.exports = function render(input, context) {
    template.render({ name: input.name }, context);
}
```

With this approach, a UI component can even render its output asynchronously. For example:
```javascript
var request = require('request');
module.exports = function render(input, context) {
    context.beginAsyncFragment(function(asyncContext, asyncFragment) {
        request('http://foo.com/some/service', function (error, response, body) {
            if (error) {
                asyncFragment.end(error);
            }

            asyncContext.write(body); // Just write out the response verbatim...
            asyncFragment.end();
        });
    });
}
```



## Comparison to Consolidate.js
The [consolidate](https://github.com/visionmedia/consolidate.js/) module is a template consolidation engine that only works on the server and is designed to only work with Express. In addition, it only supports the less efficient callback-style rendering which means that an HTML string will only start to be flushed out to the client after the entire output is generated and stored in memory.

In comparision, the `view-engine` module works on both the server and the client and it is not tied to any one framework. In addition, it supports very efficient asynchronous rendering and streaming.
