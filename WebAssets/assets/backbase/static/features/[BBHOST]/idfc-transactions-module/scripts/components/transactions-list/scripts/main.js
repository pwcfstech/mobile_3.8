/**
 * Widget Transactions List Component
 * @module widget-transactions
 */
define(function (require, exports, module) {

    'use strict';

    module.name = 'component.transactions-list';

    var base = require('base');
    var ui = require('ui');
    var tags = require('module-tags');

    var deps = [
        ui.name,
        tags.name
    ];

    module.exports = base.createModule(module.name, deps)
        .directive(require('./details'))
        .directive(require('./directives'));
});
