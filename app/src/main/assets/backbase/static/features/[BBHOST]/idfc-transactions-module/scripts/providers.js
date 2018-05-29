 /**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : providers.js
 *  Description: Retrieves a list of transactions from the server and maintains their state
 *  ----------------------------------------------------------------
 */
define(function (require, exports, module) {

    'use strict';

    // @ngInject
    exports.lpTransactions = function() {

        // @ngInject
        this.$get = function($http, $q, lpCoreUtils, lpCoreError, lpTagsUtils) {

            var decorateTransactionsWithAccountsName = function(account, list) {
                var names = account.accountsNames;

                if (names && lpCoreUtils.isObject(names)) {
                    lpCoreUtils.forEach(list, function (transaction) {
                        transaction.accountName = names[transaction.accountId] || '';
                    });
                }

                return list;
            };

            var config = {
                transactionsEndpoint: '/mock/v1/current-accounts/$(accountId)/transactions',
                transactionDetailsEndpoint: '/mock/v1/current-accounts/transaction/$(transactionId)/details',
                pageSize: 20,
                from: 0,
                sort: '-bookingDateTime'
            };

            function API() {

                var TransactionsModel = function() {
                    this.from = config.from;
                    this.sort = config.sort;
                    this.transactions = [];
                    this.moreAvailable = true;
                    this.account = null;
                    this.errorCode = null;
                };

                TransactionsModel.prototype.availableFilters = {
                    QUERY: 'query',
                    FROM_DATE: 'fromDate',
                    TO_DATE: 'toDate',
                    FROM_AMOUNT: 'fromAmount',
                    TO_AMOUNT: 'toAmount',
                    CONTACT: 'contact',
                    CATEGORY: 'category',
                    DEBITCREDIT: 'bk'
                };

                /**
                 * Clears list of transactions and resets from counter
                 */
                TransactionsModel.prototype.clearTransactionsList = function() {
                    this.transactions = [];
                    this.moreAvailable = true;
                    this.from = config.from;
                    this.errorCode = null;
                    return this;
                };

                /**
                 * Sets the search filters to be used when next loading transactions from the server
                 * @param filters
                 */
                TransactionsModel.prototype.setFilters = function(filters) {
                    if (lpTagsUtils) {
                        lpTagsUtils.setFilter(filters);
                        this.filters = lpTagsUtils.getFilters();
                    } else {
                        this.filters = filters;
                    }
                    return this;
                };

                /**
                 * Clears any current search filters
                 */
                TransactionsModel.prototype.clearFilters = function() {
                    if (lpTagsUtils) {
                        this.filters = lpTagsUtils.clearFilters();
                    } else {
                        this.filters = {};
                    }
                    return this;
                };

                /**
                 * Updates current search filters
                 */
                TransactionsModel.prototype.updateFilters = function() {
                    if (lpTagsUtils) {
                        this.filters = lpTagsUtils.getFilters();
                    } else {
                        this.filters = {};
                    }
                    return this;
                };

                /**
                 * Enriches data with presentation logic
                 * @param transactions
                 * @returns {*}
                 */
                TransactionsModel.prototype.preprocessTransactions = function(transactions) {
                    var lastTransaction = this.transactions[this.transactions.length - 1] || null;
                    var moment = lpCoreUtils.date;

                    if(transactions) {
                        transactions = lpCoreUtils.map(transactions, function(transaction, i) {
                            //figure out if the date should be displayed as a new date
                            var prevTransaction = transactions[i - 1] || lastTransaction || null;
                            var prevDate = prevTransaction
                                ? moment(prevTransaction.bookingDateTime)
                                : moment().add(1, 'days');
                            var currDate = moment(transaction.bookingDateTime);

                            transaction.newDate =
                                prevDate.date() !== currDate.date() ||
                                prevDate.month() !== currDate.month() ||
                                prevDate.year() !== currDate.year();

                            //normalize empty details to be null
                            if(!transaction.details) {
                                transaction.details = null;
                            }

                            //create details tab boolean values
                            transaction.detailTabs = {
                                details: true,
                                categories: false
                            };

                            //move this to view?
                            if(transaction.creditDebitIndicator === 'DBIT') {
                                transaction.transactionAmount *= -1;
                            }

                            return transaction;
                        });
                    }
                    return transactions;
                };

                /**
                 * Load transactions
                 * @param account (pass account only for first load)
                 */
                TransactionsModel.prototype.loadMoreTransactions = function() {

                    var self = this;
                    var availableFilters = this.availableFilters;
                    var deferred = $q.defer();
                    var debitCredit;

                    if(!this.account) {
                        lpCoreError.throwException(new Error('No account specified'));
                    }

                    if (this.account.allAccounts) {
                        this.account.id = '';
                    }

                    var queryParams = {
                        f: this.from,
                        l: config.pageSize + 1
                    };

                    this.loading = true;

                    // Key:
                    // a: action
                    // q: query
                    // df: Date from
                    // dt: Date to
                    // af: Amount from,
                    // at: Amount to
                    // ca: counter party account
                    // categoryIds: category ids
                    // crdb (bk): debit: (1) DBIT, credit: (2) CRDT
                    if (this.filters) {

                        debitCredit = parseInt(this.filters[availableFilters.DEBITCREDIT], 10);

                        if (this.filters.query) {
                            queryParams.a = 'search';
                            queryParams.q = this.filters[availableFilters.QUERY];
                        }
                        if (this.filters[availableFilters.FROM_DATE] && this.filters[availableFilters.TO_DATE]) {
                            queryParams.df = this.filters[availableFilters.FROM_DATE];
                            queryParams.dt = this.filters[availableFilters.TO_DATE];
                        }
                        if (
                            !lpCoreUtils.isUndefined(this.filters[availableFilters.FROM_AMOUNT]) &&
                            !lpCoreUtils.isUndefined(this.filters[availableFilters.TO_AMOUNT])
                        ) {
                            queryParams.af = this.filters[availableFilters.FROM_AMOUNT];
                            queryParams.at = this.filters[availableFilters.TO_AMOUNT];
                        }
                        if (this.filters[availableFilters.CONTACT]) {
                            queryParams.ca = this.filters[availableFilters.CONTACT];
                        }
                        if (this.filters[availableFilters.CATEGORY]) {
                            queryParams.categoryIds = this.filters[availableFilters.CATEGORY];
                        }
                        if (this.filters[availableFilters.DEBITCREDIT]) {
                            queryParams.crdb = debitCredit === 1 ? 'DBIT' : 'CRDT';
                        }
                    }

                    //the minus here means descending order
                    queryParams.sort = this.sort;

                    //update paging info
                    this.from = this.from + config.pageSize;

					var postData = {accountId: this.account.id || this.account.ids || ''};
					var data1 = $.param(postData || {});
                     $http.post(config.transactionsEndpoint, data1,{
                        data: {
                            accountId: this.account.id || this.account.ids || ''
                        },
                        params: queryParams,
						headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/x-www-form-urlencoded;',
								'Cache-Control': 'no-cache, no-store, must-revalidate',
								'Pragma': 'no-cache',
								'Expires': '0'
							}
                    })
                    .success(function(data) {
                        self.errorCode = null;
                        //need to normalize null data to empty array
                        if(data === null || data === 'null') {
                            data = [];
                        }

                        var newTransactions = self.preprocessTransactions(lpCoreUtils.compact(data));
                        if (newTransactions && newTransactions.length <= config.pageSize) {
                            self.moreAvailable = false;
                        }
//                             else if (newTransactions) {
//                            newTransactions.pop();
                      //  }

                        self.transactions = self.transactions.concat(newTransactions);
                        self.transactions = decorateTransactionsWithAccountsName(self.account, self.transactions);
                        deferred.resolve(self.transactions);
                    })
                    .error(function(data) {
                        self.errorCode = data.errorCode || 500;
                    })
                    ['finally'](function() {
                        self.loading = false;
                    });

                    return deferred.promise;
                };

                /**
                 * Loads a new set of transactions for the given account
                 * @param account
                 */
                TransactionsModel.prototype.loadTransactions = function(account) {

                    this.clearTransactionsList();

                    this.account = account;
                    return this.loadMoreTransactions();
                };

                /**
                 * Enriches/updates data ready for view rendering
                 * @param transactions
                 * @returns {*}
                 */
                TransactionsModel.prototype.preprocessTransactionDetails = function(details, transaction) {

                    var specialDetails = [];
                    var customDetails = [];

                    var detailsToOmit = [
                        'location'
                    ];
                    var specialDetailsKeys = [
                        'address',
                        'merchantType',
                        'bookingDateTime'
                    ];

                    var longValueKeys = [
                        'transactionId'
                    ];

                    if(details) {
                        if(lpCoreUtils.isObject(details.location)) {
                            //special case for map data
                            var latLong = details.location.latitude + ',' + details.location.longitude;
                            var mapParams = [
                                'size=' + '160x90',
                                'center=' + latLong,
                                'zoom=' + 12,
                                'format=' + 'jpg',
                                'sensor=' + false,
                                'markers=' + encodeURIComponent('size:med|color:red|') + latLong
                            ];
                            details.location.mapUrl = 'http://maps.googleapis.com/maps/api/staticmap?' + mapParams.join('&');
                        }
                        //add date to details for convenience
                        details.bookingDateTime = transaction.bookingDateTime;

                        //NOTE: angular 1.1.5 breaks when iterating over a map with duplicate values!
                        //need to convert to an array of objects for happy view rendering. This will be fixed in 1.2
                        for(var key in details) {
                            if(details.hasOwnProperty(key) && detailsToOmit.indexOf(key) < 0) {
                                var detailData = {
                                    name: key,
                                    value: details[key],
                                    longValue: longValueKeys.indexOf(key) > -1
                                };
                                if(specialDetailsKeys.indexOf(key) > -1) {
                                    specialDetails.push(detailData);
                                } else {
                                    customDetails.push(detailData);
                                }
                            }
                        }

                        details.special = specialDetails;
                        details.custom = customDetails;
                    }
                    return details;
                };

                /**
                 * Enriches data with presentation logic
                 * @param transactions
                 * @returns {*}
                 */
                TransactionsModel.prototype.loadTransactionDetails = function(transaction) {
                    var self = this;

                    if (!transaction.details || lpCoreUtils.isEmpty(transaction.details)) {
                        transaction.loading = true;

                        return $http.get(config.transactionDetailsEndpoint, {
                            params: {
                                transactionId: transaction.id
                            }
                        })
                        .then(function(response) {
                            transaction.loading = false;
                            transaction.details = {};
                            return lpCoreUtils.assign(transaction.details, self.preprocessTransactionDetails(response.data, transaction));
                        }, function(response) {
                            transaction.loading = false;
                            transaction.errorCode = response.data.errorCode || 500;
                        });
                    } else {
                        return $q.when(transaction.details);
                    }
                };

                TransactionsModel.prototype.updateTransactionCategory = function(transaction, categoryId) {
                    return $http.put(config.transactionsEndpoint + '/' + transaction.id, {
                        accountId: this.account.id,
                        categoryId: categoryId
                    })
                    .success(function(data) {
                        transaction.categoryId = categoryId;
                    })
                    .error(function(data) {
                        transaction.errorCode = data.errorCode || 500;
                    });
                };

                TransactionsModel.prototype.updateSimilarTransactionCategory = function(transaction, categoryId) {
                    return $http.put(config.transactionsEndpoint + '/' + transaction.id, {
                        accountId: this.account.id,
                        categoryId: categoryId,
                        condition: 'SIMILAR'
                    })
                    .success(function(data) {
                        transaction.categoryId = categoryId;
                    })
                    .error(function(data) {
                        transaction.errorCode = data.errorCode || 500;
                    });
                };

                /**
                 * Checks for errors while loading transactions
                 * @returns {boolean}
                 */
                TransactionsModel.prototype.allowMoreResults = function() {
                    var allowMoreResults = (!this.loading && this.moreAvailable) && !this.errorCode;
                    return allowMoreResults;
                };

                /**
                 * Checks for errors during download and ensures that no transactions have been loaded
                 * @returns {boolean}
                 */
                TransactionsModel.prototype.noTransactionsFound = function() {

                    var noTransactionsFound = (!this.loading && this.transactions.length === 0) && !this.errorCode;
                    return noTransactionsFound;
                };

                /**
                 * Checks whether or not there are search filters set
                 * @returns {boolean}
                 */
                TransactionsModel.prototype.isSearching = function() {

                    //searching if filters in not empty
                    if(this.filters) {
                        for(var key in this.filters) {
                            if(this.filters.hasOwnProperty(key)) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                return new TransactionsModel();
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
