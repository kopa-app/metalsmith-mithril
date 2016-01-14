'use strict';

require('es6-promise-series')(Promise);
var path = require('path');
var render = require('mithril-node-render');
var debug = require('debug')('metalsmith-mithril');
var fs = require('fs');
var minimatch = require('minimatch');

function renderComponent(component, file, metalsmith, callback) {
	var ctrl;
	var Ctrl = component.ctrl || null;
	var view = component.view || null;

	function done(err) {
		if (err) {
			return callback(err);
		}

		// render view
		callback(null, new Buffer(render(view(ctrl, file, metalsmith))));
	}

	// do not process files without a view
	if (!view) {
		return callback(null);
	}

	// create controller instance
	if (Ctrl) {
		if (Ctrl.length >= 3) {
			// async controller
			ctrl = new Ctrl(file, metalsmith, done);
		} else {
			// sync controller
			ctrl = new Ctrl(file, metalsmith);
			done();
		}
	} else {
		// proceed without controller
		done();
	}
}

function plugin(options) {
	options = options || {};
	options.ext = options.ext || '.m.js';
	options.concurrent = options.concurrent || null;

	function filterFile(filename) {
		return filename.toLowerCase().substr(-options.ext.length) === options.ext;
	}

	return function (files, metalsmith, callback) {
		var source = metalsmith.source();

		function resolvePath(filename) {
			return path.join(source, filename);
		}

		function workFile(filename) {
			return function () {
				return new Promise(function (resolve, reject) {
					var htmlFilename = filename.substr(0, filename.length - options.ext.length) + '.html';
					var file = files[filename];
					var component = require(resolvePath(filename));
					var metadata = component.metadata || {};

					// extend files metadata
					Object.keys(metadata).forEach(function (key) {
						file[key] = metadata[key];
					});

					function done(err, contents) {
						if (err) {
							return reject(err);
						}

						// render view
						file.contents = contents;

						// replace file
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
				.filter(filterFile)
				.map(workFile),
			options.concurrent
		)
			.then(function () {
				callback();
			})
			.catch(callback);
	};
}

plugin.layouts = function (options) {
	options = options || {};
	options.default = options.default || null;
	options.directory = options.directory || 'layouts';
	options.ext = options.ext || '.m.js';
	options.pattern = options.pattern || '**/*.html';
	options.concurrent = options.concurrent || null;

	var templates = {};

	if (!fs.existsSync(options.directory)) {
		throw new Error('Directory ' + options.directory + ' does not exists');
	}

	fs.readdirSync(options.directory)
		.forEach(function (file) {
			// skip files with wrong extension
			if (file.toLowerCase().substr(-options.ext.length) !== options.ext) {
				return;
			}

			templates[file] = require(path.join(path.resolve(options.directory), file));
		});

	return function (files, metalsmith, callback) {
		var metadata = metalsmith.metadata();

		function filterFile(filepath) {
			return options.pattern && minimatch(filepath, options.pattern);
		}

		function workFile(filepath) {
			return function () {
				return new Promise(function (resolve, reject) {
					var file = files[filepath];
					var layout = file.layout || options.default;
					var component = templates[layout] || null;

					if (!component) {
						throw new Error('Layout ' + layout + ' does not exist.');
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
				.filter(filterFile)
				.map(workFile),
			options.concurrent
		)
			.then(function () {
				callback();
			})
			.catch(callback);
	};
};

module.exports = plugin;
