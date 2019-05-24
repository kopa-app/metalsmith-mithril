'use strict';

const fs = require('fs');
const metalsmith = require('metalsmith');
const expect = require('expect.js');
const mithril = require('.');

describe('metalsmith-mithril', () => {
  it('should parse *.m.js files', done => {
    metalsmith(__dirname)
      .source('./fixtures/src')
      .destination('./build')
      .use(mithril())
      .build((err, files) => {
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

  it('should parse *.m.js layout files', done => {
    metalsmith(__dirname)
      .source('./fixtures/src_layouts')
      .destination('./build')
      .use(mithril.layouts({
        directory: './fixtures/layouts'
      }))
      .build((err, files) => {
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
