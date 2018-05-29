define(function (require, exports, module){
    'use strict';
    var base = require('base'),
        deps = [];

    module.name = 'idfc-rsa';

    module.exports = base.createModule(module.name, deps)
        .value(require('./provider'));
});