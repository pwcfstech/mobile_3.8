define(function (require, exports, module){
    'use strict';
    var base = require('base'),
        deps = [];

    module.name = 'idfc-cq';
    var Model = require('./service');

    /*module.exports = base.createModule(module.name, deps)
         .value(require('./service'));*/

    module.exports = base.createModule(module.name, deps)
         .service('CQService', Model);
});
