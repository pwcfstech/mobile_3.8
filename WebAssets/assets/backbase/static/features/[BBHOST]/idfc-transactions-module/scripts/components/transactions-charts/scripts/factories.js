/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : providers.js
 *  Description:
 *  Transactions Charts Component Provider
 *  ----------------------------------------------------------------
 */

define(function (require, exports, module) {

    'use strict';

    var _ = require('base').utils;

    var normalizeData = function(data, type) {
        if (data && data.length) {
            if (data[0].hasOwnProperty(type)) {
                return _.chain(data)
                    .map(function(current) {
                        return current[type];
                    })
                    .reduce(function(acc, current) {
                        return acc.concat(current);
                    }, [])
                    .value();
            } else {
                return data;
            }
        } else {
            return [];
        }
    };

    // @ngInject
    exports.lpAccountsChartData = function(lpCoreUtils, $http) {
        var defaults = {
            accountsChartEndpoint: '',
            allAccountsChartEndpoint: '',
            accountId: null
        };

        /**
         * Accounts Chart service constructor
         * @param config
         * @constructor
         */
        var AccountsChartModel = function(config) {
            this.config = lpCoreUtils.extend({}, defaults, config);
            this.chartData = null;
            this.error = false;
        };

        AccountsChartModel.prototype.setId = function(id, allAccounts) {
            this.config.allAccounts = !!allAccounts;
            this.config.accountId = id;
        };

        /**
         * Load data from server
         * @param queryParams {}
         */
        AccountsChartModel.prototype.load = function(queryParams) {
            var self = this;
            var url;
            var options = {};

            if (!queryParams) {
                queryParams = {};
            }

            if (this.config.allAccounts) {
                url = this.config.allAccountsChartEndpoint;
                queryParams.accountIds = this.config.accountId;
            } else {
                url = this.config.accountsChartEndpoint;
                options.data = {
                    accountId: this.config.accountId
                };
            }
            options.params = queryParams;
            return $http.get(url, options)
                .then(function(response){
                    self.chartData = normalizeData(response.data, 'balances');
                    return self.chartData;
                }, function(response){
                    if(response.errors) {
                        self.error = response.errors[0].code;
                    }
                });
        };

        return {
            getInstance: function(config) {
                return new AccountsChartModel(config);
            }
        };
    };

    // @ngInject
    exports.lpTransactionsChartData = function(lpCoreUtils, $http) {
        var defaults = {
            transactionsChartEndpoint: '',
            allTransactionsChartEndpoint: '',
            accountId: null
        };

        /**
         * Transactions Chart service constructor
         * @param config
         * @constructor
         */
        var TransactionsChartModel = function(config) {
            this.config = lpCoreUtils.extend({}, defaults, config);
            this.chartData = null;
            this.error = false;
        };

        TransactionsChartModel.prototype.setId = function(id, allAccounts) {
            this.config.allAccounts = !!allAccounts;
            this.config.accountId = id;
        };

        /**
         * Load data from server
         * @param queryParams {}
         */
        TransactionsChartModel.prototype.load = function(queryParams) {
            var self = this;
            var url;
            var options = {};

            if (!queryParams) {
                queryParams = {};
            }

            if (this.config.allAccounts) {
                url = this.config.allTransactionsChartEndpoint;
                queryParams.accountIds = this.config.accountId;
            } else {
                url = this.config.transactionsChartEndpoint;
                options.data = {
                    accountId: this.config.accountId
                };
            }
            options.params = queryParams;

            return $http.get(url, options)
                .then(function(response){
                    self.chartData = normalizeData(response.data, 'turnovers');
                    return self.chartData;
                }, function(response){
                    if(response.errors) {
                        self.error = response.errors[0].code;
                    }
                });
        };

        return {
            getInstance: function(config) {
                return new TransactionsChartModel(config);
            }
        };
    };
});
