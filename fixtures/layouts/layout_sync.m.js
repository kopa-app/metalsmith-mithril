"use strict";

var m = require("mithril");

module.exports = {
  controller: function(file, metalsmith) {},
  view: function(ctrl, file, metalsmith) {
    return [m("h1", file.title), m("main", m.trust(file.contents.toString()))];
  }
};
