"use strict";

require("es6-promise-series")(Promise);

global.window = {
  document: {
    createDocumentFragment: function() {}
  },
  history: {
    pushState: function() {}
  }
};

const { join, resolve } = require("path");
const render = require("mithril-node-render");
const debug = require("debug")("metalsmith-mithril");
const fs = require("fs");
const minimatch = require("minimatch");

function renderComponent(component, file, metalsmith, callback) {
  var ctrl;
  const Ctrl = component.ctrl || null;
  const view = component.view || null;

  function done(err) {
    if (err) {
      return callback(err);
    }

    render(view(ctrl, file, metalsmith)).then(function(html) {
      debug(`Successfully rendered layout: ${file.layout}!`);
      callback(null, Buffer.from(html));
    });
  }

  if (!view) {
    return callback(null);
  }

  if (Ctrl) {
    if (Ctrl.length >= 3) {
      // async controller
      ctrl = new Ctrl(file, metalsmith, done);
    } else {
      ctrl = new Ctrl(file, metalsmith);
      done();
    }
  } else {
    done();
  }
}

function plugin(options) {
  options = options || {};
  options.ext = options.ext || ".m.js";
  options.concurrent = options.concurrent || null;

  function isLayout(filename) {
    return filename.toLowerCase().substr(-options.ext.length) === options.ext;
  }

  return function(files, metalsmith, callback) {
    var source = metalsmith.source();

    function resolvePath(filename) {
      return join(source, filename);
    }

    function render(filename) {
      return function() {
        return new Promise(function(resolve, reject) {
          var htmlFilename = filename.replace(options.ext, ".html");
          var file = files[filename];
          var component = require(resolvePath(filename));
          var metadata = component.metadata || {};

          Object.keys(metadata).forEach(function(key) {
            file[key] = metadata[key];
          });

          function done(err, contents) {
            if (err) {
              return reject(err);
            }

            file.contents = contents;
            delete files[filename];
            files[htmlFilename] = file;
            resolve(file);
          }

          renderComponent(component, file, metalsmith, done);
        });
      };
    }

    Promise.series(
      Object.keys(files)
        .filter(isLayout)
        .map(render),
      options.concurrent
    )
      .then(function() {
        callback();
      })
      .catch(callback);
  };
}

plugin.layouts = function(options) {
  options = options || {};
  options.default = options.default || null;
  options.directory = options.directory || "layouts";
  options.ext = options.ext || ".m.js";
  options.pattern = options.pattern || "**/*.html";
  options.concurrent = options.concurrent || null;

  var templates = {};

  function isLayout(filename) {
    return filename.toLowerCase().substr(-options.ext.length) === options.ext;
  }

  function isHTML(filepath) {
    return minimatch(filepath, options.pattern);
  }

  if (!fs.existsSync(options.directory)) {
    throw new Error(`Directory ${options.directory} does not exists`);
  }

  fs.readdirSync(options.directory)
    .filter(isLayout)
    .forEach(filename => {
      templates[filename] = require(join(
        resolve(options.directory),
        filename
      ));
    });

  return function(files, metalsmith, callback) {
    var metadata = metalsmith.metadata();


    function render(filepath) {
      return function() {
        return new Promise(function(resolve, reject) {
          var file = files[filepath];
          var layout = file.layout || options.default;
          var component = templates[layout] || null;

          if (!component) {
            throw new Error(`Layout ${layout} does not exist.`);
          }

          function done(err, contents) {
            if (err) {
              return reject(err);
            }

            file.contents = contents;
            resolve(file);
          }

          renderComponent(component, file, metalsmith, done);
        });
      };
    }

    Promise.series(
      Object.keys(files)
        .filter(isHTML)
        .map(render),
      options.concurrent
    )
      .then(function() {
        callback();
      })
      .catch(callback);
  };
};

module.exports = plugin;
