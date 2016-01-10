'use strict';

var metalsmith = require('metalsmith');
var mithril = require('./index');
var expect = require('expect.js');
var fs = require('fs');

describe('metalsmith-mithril', function () {
	it('should parse *.m.js files', function (done) {
		metalsmith(__dirname)
		.source('./src')
		.destination('./build')
		.use(mithril())
		.build(function (err, files) {
			expect(Object.keys(files)).to.eql([
				'not_parsed.js',
				'sync_page.html',
				'subpages/async_subpage.html'
			]);

			expect(files['not_parsed.js'].contents.toString()).to.be(
				fs.readFileSync('./src/not_parsed.js', 'utf8')
			);

			expect(files['sync_page.html'].contents).to.be(
				'<h1>Test page</h1>'
			);

			expect(files['subpages/async_subpage.html'].contents).to.be(
				'<h1>Sub page</h1>'
			);

			done(err);
		});
	});
});
