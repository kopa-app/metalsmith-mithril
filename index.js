'use strict';

require('es6-promise-series')(Promise);
var path = require('path');
var render = require('mithril-node-render');

module.exports = function (options) {
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
					var ctrl;
					var Ctrl = component.ctrl || null;
					var view = component.view || null;
					var metadata = component.metadata || {};

					// extend files metadata
					Object.keys(metadata).forEach(function (key) {
						file[key] = metadata[key];
					});

					function done(err) {
						if (err) {
							return reject(err);
						}

						// render view
						file.contents = render(view(ctrl, file, metalsmith));

						// replace file
						delete files[filename];
						files[htmlFilename] = file;

						resolve(file);
					}

					// do not process files without a view
					if (!view) {
						return resolve();
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
