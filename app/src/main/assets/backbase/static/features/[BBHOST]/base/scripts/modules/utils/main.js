define(function(require, exports, module) {

    'use strict';

    var _ = require('lodash').noConflict();

    _.mixin(require('./is'));
    _.mixin(require('./portal'));
    _.mixin(require('./migrate'));
    //_.mixin(require('./ng'));

    module.exports = _;

});
