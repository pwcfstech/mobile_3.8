define(function (require, exports, module) {
    'use strict';

    // @ngInject
    exports.lpTransactionsCurrency = function(lpCoreUtils) {

        // @ngInject
        this.$get = function($http, $q) {
            var config = {
                defaultCurrencyEndpoint: '/mock/v1/currency-rates/default',
                currencyListEndpoint: '/mock/v1/currency-rates',
                disableExtraCurrencies: false
            };

            function API() {
                /**
                 * Constructor for the API
                 * @constructor
                 */
                var TransactionsCurrencyModel = function() {
                    this.groups = {
                        defaultCurrency: 'aDefault',
                        preferredCurrencies: 'bPreferred',
                        rest: 'cOther'
                    };

                    this.orderedCurrencies = [];
                };

                /**
                 * Loads the default currency from the service
                 */
                TransactionsCurrencyModel.prototype.loadDefaultCurrency = function() {
                    var self = this;
                    var deferred = $q.defer();

                    $http.get(config.defaultCurrencyEndpoint)
                    .success(function(data) {
                        deferred.resolve(data);
                    })
                    .error(function() {
                        self.error = 'currencyServiceError';
                    });

                    return deferred.promise;
                };

                /**
                 * Configures the currency models default currency based on data from the service
                 * @param defaultCurrencyData data object
                 */
                TransactionsCurrencyModel.prototype.configureDefaultCurrency = function(defaultCurrencyData) {
                    var dc = {
                        currency_code: defaultCurrencyData.currency_code, //eslint-disable-line camelcase
                        exchange_rate: 1.0, //eslint-disable-line camelcase
                        group: this.groups.defaultCurrency
                    };

                    this.defaultCurrency = dc;
                    this.selected = this.defaultCurrency;

                    //add the default currency to the top of the list
                    this.orderedCurrencies.push(this.defaultCurrency);
                };

                /**
                 * Loads the rest of the list of currencies
                 */
                TransactionsCurrencyModel.prototype.loadOtherCurrencies = function() {
                    var self = this;
                    var deferred = $q.defer();

                    $http.get(config.currencyListEndpoint, {
                        params: {
                            currency: this.defaultCurrency.currency_code
                        }
                    })
                    .success(function(data) {
                        if(data) {
                            self.sortCurrencies(data);
                        }
                        deferred.resolve(data);
                    })
                    .error(function() {
                        self.error = 'currencyServiceError';
                    });

                    return deferred.promise;
                };

                /**
                 * Formats and sorts the list of currencies from the service
                 * @param currencyData
                 */
                TransactionsCurrencyModel.prototype.sortCurrencies = function(currencyData) {
                    //add the preferred currencies to the top of the list under default
                    for (var i = 0; i < currencyData.preferred.length; i++) {
                        currencyData.preferred[i].group = this.groups.preferredCurrencies;
                    }

                    this.orderedCurrencies.push.apply(this.orderedCurrencies, currencyData.preferred);

                    if (!config.disableExtraCurrencies) {
                        for (var j = 0; j < currencyData.rest.length; j++) {
                            currencyData.rest[j].group = this.groups.rest;
                        }

                        currencyData.rest.sort(function(a, b) {
                            //sort rest of currencies alphabetically
                            var currencyA = a.currency_code.toLowerCase(), currencyB = b.currency_code.toLowerCase();

                            if(currencyA < currencyB) {
                                return -1;
                            } else if(currencyA > currencyB) {
                                return 1;
                            } else {
                                return 0;
                            }

                        });

                        //once the list has been sorted, and if it should be added, add the rest of the currencies to the list
                        this.orderedCurrencies.push.apply(this.orderedCurrencies, currencyData.rest);
                    }
                };

                /**
                 * Finds a currency by Currency name
                 * @param currencyCode
                 */
                TransactionsCurrencyModel.prototype.findCurrency = function(currencyCode) {
                    return lpCoreUtils.find(this.orderedCurrencies, function(currency) {
                        return currency.currency_code === currencyCode;
                    });
                };

                /**
                 * Selected a currency by Currency Name
                 * @param currencyCode the ISO code for the currency to select
                 */
                TransactionsCurrencyModel.prototype.selectCurrency = function(currencyCode) {
                    this.selected = this.findCurrency(currencyCode);
                };

                return new TransactionsCurrencyModel();
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
