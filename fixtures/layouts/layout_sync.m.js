'use strict';

const m = require('mithril');

module.exports = {
  controller() {

  },
  view(ctrl, file) {
    return [
      m('h1', file.title),
      m('main', m.trust(file.contents.toString()))
    ];
  }
};
