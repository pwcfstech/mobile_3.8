/**
 * Widget Transactions List Component
 * @module widget-transactions
 */
define(function (require, exports, module) {

    'use strict';

    module.name = 'component.transactions-list-authorizations';

    var base = require('base');

    var deps = [];

    // @ngInject
    function run(lpWidget, lpTransactionsAuth) {
        lpTransactionsAuth.setConfig({
            'accountHoldsEndpoint': lpWidget.getPreference('accountHolds')
        });
    }

    module.exports = base.createModule(module.name, deps)
        .provider( require('./providers') )
        .directive( require('./directives') )
        .run( run );
});
