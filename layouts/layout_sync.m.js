'use strict';

var m = require('mithril');

module.exports = {
  controller: function (file, metalsmith) {

  },
  view: function (ctrl, file, metalsmith) {
    return m('main', m.trust(file.contents.toString()));
  }
};
