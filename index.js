'use strict';

require('es6-promise-series')(Promise);
global.window = {
	document: {
		createDocumentFragment: function () {}
	},
	history: {
		pushState: function () {}
	}
};
const path = require('path');
const render = require('mithril-node-render');
const debug = require('debug')('metalsmith-mithril');
const fs = require('fs');
const minimatch = require('minimatch');

function renderComponent(component, file, metalsmith, callback) {
	let ctrl;
	const Ctrl = component.ctrl || null;
	const view = component.view || null;

	function done(err) {
		if (err) {
			return callback(err);
		}

		// render view
		render(view(ctrl, file, metalsmith))
    .then(function (html) {
      callback(null, new Buffer(html));
    });
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
		return minimatch(filename.toLowerCase(), `**/*${options.ext}`);
	}

	return function (files, metalsmith, callback) {
		const source = metalsmith.source();

		function resolvePath(filename) {
			return path.join(source, filename);
		}

		function workFile(filename) {
			return function () {
				return new Promise(function (resolve, reject) {
					const htmlFilename = filename.substr(0, filename.length - options.ext.length) + '.html';
					const file = files[filename];
					const component = require(resolvePath(filename));
					const metadata = component.metadata || {};

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

	const templates = {};

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
		const metadata = metalsmith.metadata();

		function filterFile(filepath) {
			return options.pattern && minimatch(filepath, options.pattern);
		}

		function workFile(filepath) {
			return function () {
				return new Promise(function (resolve, reject) {
					const file = files[filepath];
					const layout = file.layout || options.default;
					const component = templates[layout] || null;

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
