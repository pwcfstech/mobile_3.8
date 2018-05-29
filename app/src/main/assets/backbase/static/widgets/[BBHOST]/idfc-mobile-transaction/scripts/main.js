/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: Transaction widget to show tranaction details to IDFC users and i
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-transaction';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
    var accounts = require('module-accounts');
    var contacts = require('module-contacts');
    var transactions = require('module-transactions');



    var deps = [

        'ui.bootstrap',
        core.name,
        ui.name,
        accounts.name,
        contacts.name,
        contacts.name,
        transactions.name
       // payments.name

    ];

    /**
     * @ngInject
     */
    function run(lpWidget, lpTransactions) {
        // Module is Bootstrapped

         lpTransactions.setConfig({
                    'transactionsEndpoint': lpWidget.getPreference('transactionsDataSrc'),
                    //'transactionDetailsEndpoint': lpWidget.getPreference('transactionDetailsDataSrc'),
                    'pageSize': parseInt(lpWidget.getPreference('transactionsPageSize'), 10) || undefined
                });
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
       .service( require('./models') )
        .filter(require('./filter'))
        .controller( require('./controllers') )
        .run( run );
});
