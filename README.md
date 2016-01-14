[![Build Status](https://travis-ci.org/kopa-app/metalsmith-mithril.svg)](https://travis-ci.org/kopa-app/metalsmith-mithril)

# Metalsmith - mithril

[Metalsmith](http://www.metalsmith.io/) plugin that creates html out of [mithril.js](http://mithril.js.org/) code.

## Installation

```bash
npm install metalsmith-mithril --save
```

## Usage

### With source files

```javascript
var Metalsmith = require('metalsmith');
var mithril = require('metalsmith-mithril');

Metalsmith(__dirname)
  .use(mithril({
    ext: '.m.js', // default
    concurrent: 2 // how many files will be processed in parallel, default is none
  }))
```

`example.m.js`

```javascript
var m = require('mitrhil');

module.exports = {
  metadata: {
    title: 'Page title'
  },
  controller: function (file, metalsmith, callback) {
    // call callback when controller is done
    // if callback is ommitted in arguments, controller is supposed to be sync
    callback();
  },
  view: function (controller, file, metalsmith) {
    return m('h1', file.title);
  }
};
```

### With layouts

```javascript
var Metalsmith = require('metalsmith');
var mithril = require('metalsmith-mithril');

Metalsmith(__dirname)
  .use(mithril.layouts({
    pattern: '**/*.html', // default
    ext: '.m.js', // default
    directory: 'layouts', // default
    default: 'example.m.js', // default layout to use if none is provided
    concurrent: 2 // how many files will be processed in parallel, default is none
  }))
```

`layouts/example.m.js`

```javascript
var m = require('mitrhil');

module.exports = {
  controller: function (file, metalsmith, callback) {
    // call callback when controller is done
    // if callback is ommitted in arguments, controller is supposed to be sync
    callback();
  },
  view: function (controller, file, metalsmith) {
    return [
      m('h1', file.title),
      m('main', file.contents.toString())
    ];
  }
};
```

`example.html`


```html
---
title: Example
---
This is the content.
```

Results in:

```html
<h1>Example</h1>
<main>This is the content.</main>
```

## Development

To run the tests do:

```bash
npm test
```
