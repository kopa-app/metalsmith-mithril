const m = require('mithril');

module.exports = {
  metadata: {
    title: 'Sub page'
  },
  controller(file, metalsmith, callback) {
    setTimeout(callback, 100);
  },
  view(ctrl, file) {
    return m('h1', file.title);
  }
};
