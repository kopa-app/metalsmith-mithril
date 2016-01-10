# Metalsmith - mithril

[Metalsmith](http://www.metalsmith.io/) plugin that creates html out of [mithril.js](http://mithril.js.org/) code.

## Installation

```bash
npm install metalsmith-mithril --save
```

## Usage

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
  controller: function (/*[file,] [metalsmith,] [callback]*/) {
    // call callback when controller is done
    // if callback is ommitted in arguments, controller is supposed to be sync
    callback();
  },
  view: function (controller, /*[file,] [metalsmith]*/) {
    return m('h1', file.title);
  }
};
```
