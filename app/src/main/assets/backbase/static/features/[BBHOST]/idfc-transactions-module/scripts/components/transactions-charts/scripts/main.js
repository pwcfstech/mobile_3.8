/**
 * Widget Transactions Charts Component
 * @module widget-transactions
 */
define(function (require, exports, module) {

    'use strict';

    module.name = 'component.transactions-charts';

    var base = require('base');
    var ui = require('ui');
    var chart = require('module-charts');

    var deps = [
        ui.name,
        chart.name
    ];

    module.exports = base.createModule(module.name, deps)
        .factory( require('./factories') )
        .directive( require('./directives') );
});
