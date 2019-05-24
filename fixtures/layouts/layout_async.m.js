'use strict';

const m = require('mithril');

module.exports = {
  controller(file, metalsmith, callback) {
    setTimeout(callback, 100);
  },
  view(ctrl, file) {
    return [
      m('h1', file.title),
      m('main', m.trust(file.contents.toString()))
    ];
  }
};
