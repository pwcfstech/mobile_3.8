/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : directives.js
 *  Description:  Transaction charts directive
 *  ----------------------------------------------------------------
 */
define(function(require, exports) {

    'use strict';

    var d3 = require('d3');
    var types = {
        vertical: '',
        horizontal: '-horizontal'
    };

    function buildCharts(type) {

        // @ngInject
        var controller = function($templateCache, lpCoreUtils, lpCoreI18n, $q, lpAccountsChartData, lpTransactionsChartData, lpWidget, lpCoreBus) {
            function linkFn(scope, elem, attrs) {
                var getNiceTimePeriod = function(startTime, endTime) {
                    var monthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

                    var start = new Date(startTime);
                    var end = new Date(endTime);

                    //Same dates are fed into the chart but days are cut off at the start of the chart
                    //This fix brings the display in line together
                    start.setDate(start.getDate() + 1);

                    //return nicely formatted time period
                    return start.getDate() + ' ' + monthNames[start.getMonth()] + ' - ' + end.getDate() + ' ' + monthNames[end.getMonth()];
                };

                var getStartDate = function(){
                    var result = new Date(scope.endDate);
                    switch(scope.scale) {
                        case 'WEEK':
                            result.setDate(result.getDate() - 7);
                            break;
                        case 'MONTH':
                            result.setMonth(result.getMonth() - 1);
                            break;

                    }
                    return result;
                };

                var setDateRange = function(endDate) {
                    scope.endDate = new Date(endDate);
                    scope.timePeriod = getNiceTimePeriod(getStartDate().getTime(), scope.endDate.getTime());
                };

                var onTransactionsReady = function(transactions) {
                    // get the date of the newest transaction
                    if (transactions && transactions.length) {
                        setDateRange(transactions[0].bookingDateTime);
                    }
                    lpCoreBus.unsubscribe('widget-transactions:transactions:ready', onTransactionsReady);
                };
                lpCoreBus.subscribe('widget-transactions:transactions:ready', onTransactionsReady);

                var updateCharts = function(direction, onlyTransactions) {
                    var params = {
                        start: getStartDate().getTime(),
                        end: scope.endDate.getTime()
                    };

                    //Refresh the nice time period
                    scope.timePeriod = getNiceTimePeriod(params.start, params.end);

                    var getDate = function(date){
                        var result = new Date(date);
                        result.setHours(0);
                        result.setMinutes(0);
                        result.setSeconds(0);
                        return result;
                    };

                    var getTransactionsValue = function(data){
                        if (scope.series === 'DEPOSIT') {
                            return data.deposit;
                        } else {
                            if (data.hasOwnProperty('withdrawal')) {
                                return data.withdrawal;
                            } else if (data.hasOwnProperty('withdraw')) {
                                return data.withdraw;
                            } else {
                                return 0;
                            }
                        }
                    };

                    var formatAmount = function(amount){
                        return lpCoreI18n.formatCurrency(amount, scope.lpAccounts.selected.currency);
                    };

                    scope.loading = true;
                    scope.emptyTurnovers = false;
                    scope.emptyBalances = false;

                    $q.all([
                        scope.transactionsChartModel.load(params),
                        scope.accountsChartModel.load(params)
                    ])
                    .then(function(results) {
                        // Decorate data here
                        return {
                            turnovers: results[0],
                            balances: results[1]
                        };
                    })
                    .then(function(results) {
                        scope.loading = false;
                        if (!results.turnovers.length) {
                            scope.emptyTurnovers = true;
                        } else {
                            scope.transactionsChartOptions = {
                                data: results.turnovers,
                                height: 200,
                                padding: [30, 30, 30, 90],
                                parsers: {
                                    x: function(data) {
                                        return getDate(data.date);
                                    },
                                    y: function(data) {
                                        return getTransactionsValue(data);
                                    }
                                },
                                formatters: {
                                    y: function(amount){
                                        return formatAmount(amount);
                                    },
                                    x: function(date) {
                                        return d3.time.format('%e')(date);
                                    },
                                    tooltip: function(data) {
                                        return d3.time.format('%B %e')(getDate(data.date)) + '<br>' + formatAmount(getTransactionsValue(data));
                                    }
                                }
                            };
                        }

                        if(!onlyTransactions){
                            if (!results.balances.length) {
                                scope.emptyBalances = true;
                            } else {
                                scope.accountBalanceChartOptions = {
                                    data: results.balances,
                                    height: 200,
                                    padding: [30, 30, 30, 90],
                                    parsers: {
                                        x: function(data) {
                                            return getDate(data.date);
                                        },
                                        y: function(data) {
                                            return data.amount;
                                        }
                                    },
                                    formatters: {
                                        y: function(amount){
                                            return formatAmount(amount);
                                        },
                                        x: function(date) {
                                            return d3.time.format('%e')(date);
                                        },
                                        tooltip: function(data) {
                                            return d3.time.format('%B %e')(getDate(data.date)) + '<br>' + formatAmount(data.amount);
                                        }
                                    },
                                    animation: {
                                        direction: direction === 'prev' ? 'left' : 'right'
                                    }
                                };
                            }
                        }

                    });
                };

                var updateChartsOnAccountSelected = function(accountId, allAccounts) {
                    scope.accountsChartModel.setId(accountId, allAccounts);
                    scope.transactionsChartModel.setId(accountId, allAccounts);
                    // If the account selected is a credit card the charts
                    // are not loaded, but if you loaded an account previously
                    // this listener is enabled and it will be called when a card account
                    // is selected.
                    // TODO: Fix sharing same provider for bank accounts and
                    //       card accounts
                    if (scope.lpAccounts.selected && !scope.lpAccounts.selected.cardId) {
                        updateCharts('prev');
                    }
                };

                var initialize = function() {
                    scope.now = new Date();
                    scope.scale = 'WEEK';
                    scope.series = 'WITHDRAWAL';
                    setDateRange(scope.now);

                    scope.accountsChartModel = lpAccountsChartData.getInstance({
                        accountsChartEndpoint: lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('accountBalanceChartDataSrc')),
                        allAccountsChartEndpoint: lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('allAccountsBalanceChartDataSrc'))
                    });

                    scope.transactionsChartModel = lpTransactionsChartData.getInstance({
                        transactionsChartEndpoint: lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('transactionsChartDataSrc')),
                        allTransactionsChartEndpoint: lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('allTransactionsChartDataSrc'))
                    });

                    var accountIds;
                    // Listen when accounts dropdown is ready and read the all accounts ids
                    lpCoreBus.subscribe('lpAccounts.loaded', function(accounts) {
                        accountIds = lpCoreUtils.result(lpCoreUtils.find(accounts, function(account) {
                            return !!account.ids;
                        }), 'ids');
                    });

                    var removeWatch = scope.$watch('lpAccounts.selected', function(account) {
                        if(!account) {
                            return;
                        }

                        // Listen for user account selection
                        lpCoreBus.subscribe('launchpad-retail.accountSelected', function(params) {
                            var accountId = params.allAccounts ? accountIds : params.accountId;
                            updateChartsOnAccountSelected(accountId, params.allAccounts);
                        });

                        updateChartsOnAccountSelected(account.id);
                        removeWatch();
                    });
                };

                scope.nextPeriod = function() {
                    switch(scope.scale) {
                        case 'WEEK':
                            scope.endDate.setDate(scope.endDate.getDate() + 7);
                            break;
                        case 'MONTH':
                            scope.endDate.setMonth(scope.endDate.getMonth() + 1);
                            break;
                    }

                    updateCharts('next');
                };

                scope.prevPeriod = function() {
                    switch(scope.scale) {
                        case 'WEEK':
                            scope.endDate.setDate(scope.endDate.getDate() - 7);
                            break;
                        case 'MONTH':
                            scope.endDate.setMonth(scope.endDate.getMonth() - 1);
                            break;
                    }
                    updateCharts('prev');
                };

                scope.setScale = function(scale) {
                    scope.scale = scale;
                    updateCharts('prev');
                };

                scope.setSeries = function(series) {
                    scope.series = series;
                    updateCharts('prev', true);
                };

                scope.showNextPeriod = function() {
                    return scope.now.getTime() > scope.endDate.getTime();
                };

                scope.$on('tabSelected', function(event, tab){
                    if (tab === 'chart' || tab === 'combined'){
                        updateCharts('prev');
                    }
                });

                initialize();
            }

            function compileFn(elem, attrs) {
                return linkFn;
            }

            // require template
            if (type === types.vertical) {
                $templateCache.put('$transactions/chartTemplate', require('../templates/charts'));
            } else {
                $templateCache.put('$transactions/chartTemplate-horizontal', require('../templates/charts-horizontal'));
            }

            // Directive configuration
            return {
                scope: {
                    lpAccounts: '='
                },
                restrict: 'AE',
                compile: compileFn,
                template: $templateCache.get('$transactions/chartTemplate' + type)
            };
        };

        return controller;
    }

    exports.lpTransactionsCharts = buildCharts(types.vertical);
    exports.lpTransactionsChartsHorizontal = buildCharts(types.horizontal);
});
