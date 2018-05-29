/**
 * Widget Transactions Spendings Component
 * @module widget-transactions
 */
define(function (require, exports, module) {

    'use strict';

    module.name = 'component.transactions-spendings';

    var base = require('base');
    var deps = [
    ];

    module.exports = base.createModule(module.name, deps)
        .factory( require('./factories') )
        .directive( require('./directives') );
});
