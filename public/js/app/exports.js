//window.$ = window.jQuery = require('jquery');
//window._ = require('underscore');
//require('../vendor/bootstrap');

require('./view/view3d');

$(function() {

    var twitterNodes = window.twitterNodes || {};
        twitterNodes.View3d = require('./view/view3d');

    window.twitterNodes = twitterNodes;

    if(window.init && _.isFunction(window.init)){
        window.init();
    }
});