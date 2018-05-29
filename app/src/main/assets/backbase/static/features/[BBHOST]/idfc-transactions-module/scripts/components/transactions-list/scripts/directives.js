/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : directives.js
 *  Description:  Transaction list directive
 *  ----------------------------------------------------------------
 */
define(function(require, exports) {

    'use strict';

    var $ = window.jQuery;

    /**
     * Check if the current browser is ES3 compliant only
     *
     * @returns {boolean}
     */
    function isES3Browser() {
        var es3Browser = false;
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) { /* this is ES3 Browser */
            es3Browser = true;
        }
        return es3Browser;
    }

    // @ngInject
    exports.lpTransactionsList = function(lpWidget, $timeout, $compile, $templateCache, lpCoreBus, lpCoreUtils, lpCoreTemplate) {
        var customTemplateSrc = lpWidget.getPreference('customTemplateSrc');
        var customTemplateCache = customTemplateSrc && $templateCache.get(customTemplateSrc);
        var customTemplatePath = customTemplateSrc && lpCoreTemplate.resolvePath(customTemplateSrc);

        var enableVerticalScrollbar = function(element) {
            $timeout(function() {
                // Handle fixed height with scrollbar
                var rawElement = element.length ? element[0] : element;
                var currentHeight = rawElement.offsetHeight;

                if (currentHeight) {
                    rawElement.style.height = currentHeight + 'px';
                    rawElement.style.overflowY = 'auto';
                }
            });
        };

        function findTransactionElem (transaction) {
            return $('#transaction-' + transaction.id);
        }

        function findTransactionCategoryElem (transaction) {
            return findTransactionElem(transaction).find('[data-role="transactions-list-item-category"]');
        }

        function linkFn(scope, elem, attrs) {
            /*----------------------------------------------------------------*/
            /* Private methods & variables
            /*----------------------------------------------------------------*/
            var isOldBrowser = isES3Browser();
            var ie8CategoryFull = 160;
            var ie8CategoryCollapsed = 9;

            /*----------------------------------------------------------------*/
            /* Watchers
            /*----------------------------------------------------------------*/
            scope.$watch('accounts.selected', function(account) {
                if (account) {
                    scope.transactions
                    .loadTransactions(account)
                    .then(function() {
                        lpCoreBus.publish('widget-transactions:transactions:ready', scope.transactions.transactions);
                        if (scope.showScrollbar) {
                            enableVerticalScrollbar(elem.find('.transactions-list-wrapper'));
                        }
                    });
                }
            });

            scope.$on('$destroy', function() {
                // clean up
            });

            /*----------------------------------------------------------------
            /* Public methods & properties
            /*----------------------------------------------------------------*/
            scope.previewAll = false;

            scope.showCategoriesToggle = !lpCoreUtils.isUndefined(scope.showCategoriesToggle)
                ? scope.showCategoriesToggle
                : true;

            scope.transactionKeydown = function(evt, transaction) {
                if (evt.which === 13 || evt.which === 32) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    scope.loadTransactionDetails(transaction);
                    scope.openDetails(transaction);
                }
            };

            scope.loadTransactionDetails = function(transaction) {
                transaction.isLoading = true;
                scope.transactions.loadTransactionDetails(transaction)
                .then(function(details) {
                    if (transaction.categoryId) {
                        scope.transactionsCategories.getById(transaction.categoryId).then(function (category) {
                            details.category = category;
                        });
                    }
                })
                ['finally'](function() {
                    transaction.isLoading = false;
                });
            };

            scope.loadMoreTransactions = function() {
                scope.transactionsLoading = true;
                if (scope.transactions.loading) {
                    return;
                }
                var length = scope.transactions.transactions.length;
                scope.transactions.loadMoreTransactions().then(function() {
                    setTimeout(function() {
                        // var selector = scope.tabs.combined === true ? '.lp-transactions-combined .transactions-list-row' : '.transactions-list-row';
                        var row = $(lpWidget.body).find('.transactions-list-row').eq(length);
                        row.focus();
                    }, 100);
                    scope.transactionsLoading = false;
                });
            };

            scope.updateTransactionCategory = function(transaction, categoryId, similar) {
                var promise;
                if (!similar) {
                    promise = scope.transactions.updateTransactionCategory(transaction, categoryId);
                } else {
                    promise = scope.transactions.updateSimilarTransactionCategory(transaction, categoryId);
                }

                promise.success(function() {
                    // console.log('updateTransactionCategory', transaction.id, categoryId);
                });
            };

            scope.openDetails = function(transaction, selectedTab) {
                var $transaction = elem.find('#transaction-details-' + transaction.id);

                transaction.showDetails = !transaction.showDetails;

                if (!$transaction.children().size()) {
                    var $details = $(require('../templates/info'));
                    $transaction.append($details);
                    $compile($details)($transaction.scope());
                }

                var setDetailTabValues = function(tabs, selectedDetailTab) {
                    for (var tab in tabs){
                        if (tabs.hasOwnProperty(selectedDetailTab)) {
                            tabs[tab] = false;
                            if (tab === selectedDetailTab) {
                                tabs[tab] = true;
                            }
                        }
                    }
                };

                if (selectedTab === null || selectedTab === undefined) {
                    selectedTab = 'details';
                }

                if (transaction.showDetails) {
                    $timeout(function() {
                        setDetailTabValues(transaction.detailTabs, selectedTab);
                    }, 0);
                }
                if (selectedTab === 'details') {
                    scope.loadTransactionDetails(transaction);
                }
                scope.closePreview(transaction);

                if (scope.categorySmallLayout && transaction.showDetails) {
                    $('body').animate({
                        scrollTop: $('#transaction-' + transaction.id).offset().top - 5 - (scope.offsetTopCorrection || 0)
                    }, 500);
                }

                // fix for chrome redraw issue
                var transactionTabs = document.getElementById('transactions-tabs');
                if (!scope.showDetails && transactionTabs) {
                    transactionTabs.style.display = 'none';
                    transactionTabs.style.display = 'block';
                }
            };

            scope.selectDetailsTab = function(transaction) {
                scope.loadTransactionDetails(transaction);
            };

            scope.openPreview = function(transaction) {
                transaction.preview = true;
                if (!transaction.showDetails) {
                    if (isOldBrowser) {
                        // support IE8
                        $('#transaction-' + transaction.id + ' .categories').width(ie8CategoryFull);
                    } else {
                        $('#transaction-' + transaction.id).addClass('preview');
                    }
                }
            };

            scope.closePreview = function(transaction) {
                transaction.preview = false;

                if (isOldBrowser) {
                    // support IE8
                    $('#transaction-' + transaction.id + ' .categories').width(ie8CategoryCollapsed);
                } else {
                    $('#transaction-' + transaction.id).removeClass('preview');
                }

                findTransactionElem(transaction)
                    .removeClass('lp-transactions-list-item-head-noanim')
                    .css('padding-left', '');

                findTransactionCategoryElem(transaction).css('width', '');
            };

            scope.categoryClick = function(event, transaction) {
                if (event !== null && event !== undefined) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                scope.openDetails(transaction, 'categories');
            };

            scope.categorySwipeStart = function swipeStart (event, transaction) {
                findTransactionElem(transaction).addClass('lp-transactions-list-item-head-noanim');
            };

            scope.categorySwipe = function swipe (event, transaction) {
                var $category = findTransactionCategoryElem(transaction);
                var width = Math.max(event.deltaX, 0);
                var calculatedWidth;

                $category.width(width);
                calculatedWidth = $category.width();

                findTransactionElem(transaction).css('padding-left', calculatedWidth);
            };

            scope.categorySwipeEnd = function swipeEnd (event, transaction) {
                scope.closePreview(transaction);
            };

            // Service is returning Array[0] when empty
            // so we have to check for that
            var parseTransactionAttribute = function(attribute) {
                if (lpCoreUtils.isString(attribute)) {
                    return lpCoreUtils.trim(attribute);
                } else if (lpCoreUtils.isArray(attribute) && !attribute.length) {
                    return '';
                }

                return attribute || '';
            };

            scope.getTransactionDescription = function(transaction) {
                var counterpartyName = parseTransactionAttribute(transaction.counterpartyName);
                var description = parseTransactionAttribute(transaction.transactionDescription);
                var type = parseTransactionAttribute(transaction.transactionType);

                return counterpartyName || description || type;
            };

            scope.getTransactionSubDescription = function(transaction) {
                var accountName = parseTransactionAttribute(transaction.accountName);
                var counterpartyName = parseTransactionAttribute(transaction.counterpartyName);
                var description = parseTransactionAttribute(transaction.transactionDescription);
                var transactionType = parseTransactionAttribute(transaction.transactionType);

                if (accountName) {
                    return accountName;
                } else if (counterpartyName || description) {
                    return transactionType;
                } else {
                    return '';
                }
            };

            scope.toggleCategoryView = function() {
                scope.previewAll = !scope.previewAll;
            };
        }

        /**
         * Compile function
         * @param  {object} el    angular dom el object
         * @param  {object} attrs el attributes
         * @return {function}       link controller function
         */
        function compileFn(elem, attrs) {
            return linkFn;
        }

        // Directive configuration
        return {
            scope: {
                accounts: '=lpAccounts',
                transactions: '=lpTransactions',
                transactionsCategories: '=lpTransactionsCategories',
                categoryLayout: '=',
                showCategories: '=',
                showCategoriesToggle: '=?',
                showTransactionIcons: '=',
                showDatesAllTransactions: '=',
                hideDetailsPreference: '=',
                offsetTopCorrection: '=?',
                showScrollbar: '='
            },
            restrict: 'AE',
            compile: compileFn,
            templateUrl: !customTemplateCache && customTemplatePath,
            template: customTemplateCache || (!customTemplateSrc && require('../templates/list'))
        };
    };

    // @ngInject
    exports.lpTransactionsListDetails = function($templateCache, $timeout, lpCoreUtils) {
        function linkFn(scope, elem, attrs) {}

        function compileFn(elem, attrs) {
            return linkFn;
        }

        return {
            restrict: 'AE',
            scope: {
                transaction: '=',
                categories: '=',
                isLoading: '='
            },
            compile: compileFn,
            template: require('../templates/details')
        };
    };
});
