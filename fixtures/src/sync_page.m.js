var m = require("mithril");

module.exports = {
  metadata: {
    title: "Test page"
  },
  view: function(ctrl, file) {
    return m("h1", file.title);
  }
};
