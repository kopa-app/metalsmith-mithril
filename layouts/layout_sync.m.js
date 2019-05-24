'use strict';

const m = require('mithril');

module.exports = {
  controller() {

  },
  view(ctrl, file) {
    return m('main', m.trust(file.contents.toString()));
  }
};
