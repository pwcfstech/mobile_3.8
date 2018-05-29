define(function (require, exports, module){
    'use strict';
    var base = require('base'),
        deps = [];

    module.name = 'idfc-utils-module';

    module.exports = base.createModule(module.name, deps)
        .value(require('./values'))
        .value(require('./constants'))
        .value(require('./error'));
});