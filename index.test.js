"use strict";

var metalsmith = require("metalsmith");
var mithril = require("./index");
var expect = require("expect.js");
var fs = require("fs");

function injectLayouts() {
  return function(files, metalsmith, done) {
    var layouts = ["layout_async.m.js", "layout_sync.m.js"];

    layouts.forEach(function(layout) {
      const contents = fs.readFileSync(`./fixtures/layouts/${layout}`);
      files[layout] = { contents };
    });

    return done();
  };
}

describe("metalsmith-mithril", function() {
  it("should parse *.m.js files", function(done) {
    metalsmith(__dirname)
      .source("./fixtures/src")
      .destination("./build")
      .use(mithril())
      .build(function(err, files) {
        expect(Object.keys(files)).to.eql([
          "not_parsed.js",
          "sync_page.html",
          "subpages/async_subpage.html"
        ]);

        expect(files["not_parsed.js"].contents.toString()).to.be(
          fs.readFileSync("./fixtures/src/not_parsed.js", "utf8")
        );

        expect(files["sync_page.html"].contents.toString()).to.be(
          "<h1>Test page</h1>"
        );

        expect(files["subpages/async_subpage.html"].contents.toString()).to.be(
          "<h1>Sub page</h1>"
        );

        done(err);
      });
  });

  it("should parse *.m.js layout files", function(done) {
    metalsmith(__dirname)
      .source("./fixtures/src_layouts")
      .destination("./build")
      .use(
        mithril.layouts({
          directory: "./fixtures/layouts"
        })
      )
      .build(function(err, files) {
        expect(Object.keys(files).sort()).to.eql(["async.html", "sync.html"]);

        expect(files["sync.html"].contents.toString()).to.be(
          "<h1>Sync</h1><main>This is the content.\n</main>"
        );

        expect(files["async.html"].contents.toString()).to.be(
          "<h1>Async</h1><main>This is the content.\n</main>"
        );

        done(err);
      });
  });

  it("should parse *.m.js virtual layout files", function(done) {
    metalsmith(__dirname)
      .source("./fixtures/src_layouts")
      .destination("./build")
      .use(injectLayouts())
      .use(mithril.layouts({ virtual: true }))
      .build(function(err, files) {
        expect(Object.keys(files).sort()).to.eql(["async.html", "sync.html"]);

        expect(files["sync.html"].contents.toString()).to.be(
          "<h1>Sync</h1><main>This is the content.\n</main>"
        );

        expect(files["async.html"].contents.toString()).to.be(
          "<h1>Async</h1><main>This is the content.\n</main>"
        );

        done(err);
      });
  });
});
