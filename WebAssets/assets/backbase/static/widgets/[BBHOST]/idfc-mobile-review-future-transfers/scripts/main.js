define(function (require, exports, module) {

    'use strict';

    module.name = 'widget-review-transfers';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');

    var accounts = require('module-accounts');
    var payments = require('module-payments');
    var sharedProperties = function () {
        var property = '';

        return {
            getProperty: function () {
                return property;
            },
            setProperty: function (value) {
                property = value;
            }
        };
    };


    var deps = [
        core.name,
        ui.name,
        accounts.name,
        payments.name
    ];

    function run(lpWidget, lpAccounts, lpCoreBus, lpPayments) {
        lpAccounts.setConfig({
            'accountsEndpoint': lpWidget.getPreference('accountsDataSrc')
        });
        lpPayments.setConfig({
            'paymentsEndpoint': lpWidget.getPreference('pendingPaymentOrdersDataSrc')
        });

        if (lpWidget && lpWidget.model && lpWidget.model.name) {
            lpCoreBus.publish('cxp.item.loaded', {
                id: lpWidget.model.name
            });
        }
    }

    module.exports = base.createModule(module.name, deps)
        .constant(require('./constants'))
        .controller(require('./controllers'))
        .service(require('./models'))
        .service('sharedProperties', sharedProperties)
        .run(run);
});