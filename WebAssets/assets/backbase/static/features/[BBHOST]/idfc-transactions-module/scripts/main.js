/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : main.js
 *  Description:
 *  Main File Module Transactions
 *  ----------------------------------------------------------------
 */

define(function (require, exports, module) {

    'use strict';

    module.name = 'module-transactions-3';

    var base = require('base');
    var core = require('core');
    var tags = require('module-tags');
    var charts = require('module-charts');

    // Custom components
    var categories = require('./components/transactions-categories/scripts/main');
    var p2p = require('./components/transactions-p2p/scripts/main');
    var currency = require('./components/transactions-currency/scripts/main');
    var transactionsList = require('./components/transactions-list/scripts/main');
    var transactionsListAuth = require('./components/transactions-list-authorizations/scripts/main');
    var transactionsSearch = require('./components/transactions-search/scripts/main');
    var spendingsChart = require('./components/transactions-spendings/scripts/main');
    var transactionsCharts = require('./components/transactions-charts/scripts/main');
    var transactionsCurrency = require('./components/transactions-currency/scripts/main');

    var deps = [
        core.name,
        tags.name,
        charts.name,
        categories.name,
        p2p.name,
        currency.name,
        transactionsList.name,
        transactionsListAuth.name,
        transactionsSearch.name,
        spendingsChart.name,
        transactionsCharts.name,
        transactionsCurrency.name
    ];

    module.exports = base.createModule(module.name, deps)
        .provider( require('./providers') )
        .directive( require('./directives') );
});
