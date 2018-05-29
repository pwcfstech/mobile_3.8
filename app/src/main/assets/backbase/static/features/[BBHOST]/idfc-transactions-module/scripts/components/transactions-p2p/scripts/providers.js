 /**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : providers.js
 *  Description: Retrieves a list of p2p transactions from the server and maintains their state
 *  ----------------------------------------------------------------
 */
define(function (require, exports, module) {
    'use strict';

    // @ngInject
    exports.lpP2PTransactions = function(lpCoreUtils) {

        // @ngInject
        this.$get = function($http, $q) {
            var config = {
                transactionsEndpoint: '/mock/v1/p2p-payments',
                pageSize: 20,
                from: 1
            };

            function API() {
                /**
                 * P2P Transactions service constructor
                 * @param config
                 * @constructor
                 */
                var TransactionsP2PModel = function() {
                    this.transactions = [];
                    this.from = config.from;
                    this.moreAvailable = true;
                    this.accountsArray = [];
                    this.errorCode = null;
                };

                /**
                 * Clears list of transactions and resets pageOffset counter
                 */
                TransactionsP2PModel.prototype.clearTransactionsList = function() {
                    this.transactions = [];
                    this.moreAvailable = true;
                    this.from = config.from;
                };

                /**
                 * Loads a new set of transactions for the given list of accounts
                 * @param accounts
                 */
                TransactionsP2PModel.prototype.loadTransactions = function(accounts) {
                    this.clearTransactionsList();
                    this.accountsArray = accounts;

                    return this.loadMoreTransactions();
                };

                /**
                 * Loads a new set of transactions for the given list of accounts
                 * @param accounts
                 */
                TransactionsP2PModel.prototype.loadTransactions = function(accounts) {
                    this.clearTransactionsList();
                    this.accountsArray = accounts;

                    return this.loadMoreTransactions();
                };

                /**
                 * Load transactions
                 * @param account (pass account only for first load)
                 */
                TransactionsP2PModel.prototype.loadMoreTransactions = function() {
                    var self = this;
                    var deferred = $q.defer();

                    this.loading = true;

                    var queryParams = {
                        accountIds: this.accountsArray.join(','),
                        offset: this.from,
                        limit: config.pageSize
                    };

                    $http.get(config.transactionsEndpoint, {
                        params: queryParams
                    })
                    .success(function(data) {
                        // success callback
                        self.from += config.pageSize;

                        var newTransactions = self.preprocessTransactions(data);
                        if (newTransactions && newTransactions.length < config.pageSize) {
                            self.moreAvailable = false;
                        }

                        self.transactions = self.transactions.concat(newTransactions);
                        deferred.resolve(self.transactions);
                    })
                    .error(function(data) {
                        // error callback
                        self.errorCode = data.errorCode || 500;
                    })
                    ['finally'](function() {
                        self.loading = false;
                    });

                    return deferred.promise;
                };

                /**
                 * Enriches data with presentation logic
                 * @param transactions
                 * @returns {*}
                 */
                TransactionsP2PModel.prototype.preprocessTransactions = function(transactions) {
                    var result = [];

                    if (transactions && transactions.length > 0) {
                        result = lpCoreUtils.map(transactions, function(currentValue, index) {
                            var currDate = new Date(currentValue.initiationDateTime);

                            // handle date show/hide
                            currentValue.showDate = true;
                            if (index > 0) {
                                var prevDate = new Date(transactions[index - 1].initiationDateTime);
                                currentValue.showDate = prevDate.getDate() !== currDate.getDate() ||
                                    prevDate.getMonth() !== currDate.getMonth() ||
                                    prevDate.getFullYear() !== currDate.getFullYear();
                            }

                            // add accept and reject buttons on transactions
                            currentValue.requiresUserAction = false;
                            if (currentValue.creditDebitIndicator === 'CREDIT' && currentValue.status === 'PENDING') {
                                currentValue.requiresUserAction = true;
                            }

                            return currentValue;
                        });
                    }

                    return result;
                };

                /**
                 * Checks for errors while loading transactions
                 * @returns {boolean}
                 */
                TransactionsP2PModel.prototype.allowMoreResults = function() {
                    return (!this.loading && this.moreAvailable) && !this.errorCode;
                };

                /**
                 * Checks for errors during download and ensures that no transactions have been loaded
                 * @returns {boolean}
                 */
                TransactionsP2PModel.prototype.noTransactionsFound = function() {
                    return (!this.loading && this.transactions.length === 0) && !this.errorCode;
                };

                return new TransactionsP2PModel();
            }

            return {
                setConfig: function(options) {
                    config = lpCoreUtils(options).chain()
                        .mapValues(lpCoreUtils.resolvePortalPlaceholders)
                        .defaults(config)
                        .value();
                    return this;
                },

                getConfig: function(prop) {
                    if (prop && lpCoreUtils.isString(prop)) {
                        return config[prop];
                    } else {
                        return config;
                    }
                },

                api: API
            };
        };
    };
});
