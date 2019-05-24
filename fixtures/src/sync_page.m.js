const m = require('mithril');

module.exports = {
  metadata: {
    title: 'Test page'
  },
  view(ctrl, file) {
    return m('h1', file.title);
  }
};
