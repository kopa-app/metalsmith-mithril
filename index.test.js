'use strict';

const metalsmith = require('metalsmith');
const mithril = require('./index');
const expect = require('expect.js');
const fs = require('fs');

describe('metalsmith-mithril', function () {
	it('should parse *.m.js files', function (done) {
		metalsmith(__dirname)
			.source('./fixtures/src')
			.destination('./build')
			.use(mithril())
			.build(function (err, files) {
				expect(Object.keys(files)).to.eql([
					'not_parsed.js',
					'sync_page.html',
					'subpages/async_subpage.html'
				]);

				expect(files['not_parsed.js'].contents.toString()).to.be(
					fs.readFileSync('./fixtures/src/not_parsed.js', 'utf8')
				);

				expect(files['sync_page.html'].contents.toString()).to.be(
					'<h1>Test page</h1>'
				);

				expect(files['subpages/async_subpage.html'].contents.toString()).to.be(
					'<h1>Sub page</h1>'
				);

				done(err);
			});
	});

	it('should parse *.m.js layout files', function (done) {
		metalsmith(__dirname)
			.source('./fixtures/src_layouts')
			.destination('./build')
			.use(mithril.layouts({
				directory: './fixtures/layouts'
			}))
			.build(function (err, files) {
				expect(Object.keys(files).sort()).to.eql([
					'async.html',
					'sync.html'
				]);

				expect(files['sync.html'].contents.toString()).to.be(
					'<h1>Sync</h1><main>This is the content.\n</main>'
				);

				expect(files['async.html'].contents.toString()).to.be(
					'<h1>Async</h1><main>This is the content.\n</main>'
				);

				done(err);
			});
	});
});
