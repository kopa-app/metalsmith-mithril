var m = require("mithril");

module.exports = {
  metadata: {
    title: "Sub page"
  },
  controller: function(file, metalsmith, callback) {
    setTimeout(callback, 100);
  },
  view: function(ctrl, file) {
    return m("h1", file.title);
  }
};
