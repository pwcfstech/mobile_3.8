/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : directives.js
 *  Description:  Transactions Search Component
 *  ----------------------------------------------------------------
 */
define(function(require, exports) {

    'use strict';

    var $ = window.jQuery;

    // @ngInject
    exports.lpTransactionsSearch = function($templateCache, lpCoreBus) {
        $templateCache.put('$transactions/sortDropdownOption.html', require('../templates/dropdownOption'));

        function linkFn(scope, elem, attrs) {

            /*----------------------------------------------------------------*/
            /* Private methods & variables
            /*----------------------------------------------------------------*/
            var currentSuggestion;
            var suggestionType = {
                date: function(result) {
                    var data = {
                        fromDate: result.from.getTime(),
                        toDate: result.to.getTime()
                    };
                    lpCoreBus.publish('launchpad-retail.transactionsDateSearch', data);
                    return data;
                },

                amount: function(result) {
                    return {
                        fromAmount: result.from,
                        toAmount: result.to
                    };
                },

                contact: function(result) {
                    return {
                        contact: result.contact
                    };
                },

                category: function(result) {
                    lpCoreBus.publish('launchpad-retail.transactionsCategorySearch', currentSuggestion.category);
                    return {
                        category: result.category
                    };
                },

                query: function(result) {
                    return {
                        query: result.query
                    };
                }
            };

            // Sorting options
            var baseIconClass = 'lp-icon';
            var newestOnTopClass = baseIconClass + ' lp-icon-new_top';
            var oldestOnTopClass = baseIconClass + ' lp-icon-old_top';
            var largestAmountOnTopClass = baseIconClass + ' lp-icon-big_to_small';
            var smallestAmountOnTopClass = baseIconClass + ' lp-icon-small_to_big';

            scope.sort = {
                options: [
                    { label: 'Newest on Top', icon: newestOnTopClass, sort: '-bookingDateTime', aria: 'Decreasing' },
                    { label: 'Oldest on Top', icon: oldestOnTopClass, sort: 'bookingDateTime', aria: 'Increasing' },
                    { label: 'Largest Amount on Top', icon: largestAmountOnTopClass, sort: '-transactionAmount', aria: 'Decreasing' },
                    { label: 'Smallest Amount on Top', icon: smallestAmountOnTopClass, sort: 'transactionAmount', aria: 'Increasing' }
                ]
            };
            scope.sort.selected = scope.sort.options[0];

            /*----------------------------------------------------------------*/
            /* Watchers
            /*----------------------------------------------------------------*/
            scope.$on('$destroy', function() {
                // clean up
            });

            /*----------------------------------------------------------------*/
            /* Events
            /*----------------------------------------------------------------*/


            /*----------------------------------------------------------------*/
            /* Public methods & properties
            /*----------------------------------------------------------------*/
            scope.doSearch = function() {
                var filters;

                if (currentSuggestion) {
                    var type = currentSuggestion.search.query ? 'query' : currentSuggestion.type;
                    filters = suggestionType[type](currentSuggestion.search);
                } else {
                    filters = {};
                }

                scope.onPerformSearch({ filters: filters });
            };

            scope.selectSuggestion = function(suggestion) {
                currentSuggestion = suggestion;
                scope.doSearch();
            };

            scope.clearSuggestion = function() {
                scope.onClearSearch();
            };

            scope.updateSuggestion = function() {
                scope.onUpdateSearch();
            };

            scope.changeSort = function() {
                var value = scope.sort.selected;
                scope.onChangeSort({ value: value });
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
                accounts: '=',
                contacts: '=',
                transactionsCategories: '=',
                onPerformSearch: '&',
                onClearSearch: '&',
                onUpdateSearch: '&',
                onChangeSort: '&'
            },
            restrict: 'AE',
            require: '?^ngModel',
            compile: compileFn,
            template: require('../templates/search')
        };
    };

    // @ngInject
    exports.lpSmartsuggest = function(lpCoreBus, lpCoreUtils, SmartSuggestEngine, SmartSuggestFormatter) {

        return {
            restrict: 'A',
            scope: {
                'smartsuggestSelect': '=',
                'smartsuggestClear': '=',
                'smartsuggestUpdate': '=',
                'currency': '=',
                'contacts': '=',
                'categories': '='
            },
            link: function(scope, element, attrs) {

                // TAGS: here we check if to use tags
                scope.tagsInput = !$(element).closest('form').find('.lp-tags').length ? false : true;
                if (scope.tagsInput === true) {
                    // let know the input field we use
                    lpCoreBus.publish('lpTagsInputField', element[0]);
                }

                //setup the smart suggest engine
                var smartSuggest = new SmartSuggestEngine();
                smartSuggest.addSuggester({
                    data: [],
                    suggest: SmartSuggestEngine.builtIn.getContactSuggestions
                });
                smartSuggest.addSuggester({
                    type: SmartSuggestEngine.types.AMOUNT,
                    suggest: SmartSuggestEngine.builtIn.getAmountSuggestions
                });
                smartSuggest.addSuggester({
                    type: SmartSuggestEngine.types.DATE,
                    suggest: SmartSuggestEngine.builtIn.getDateSuggestions
                });
                smartSuggest.addSuggester({
                    type: SmartSuggestEngine.types.GENERAL,
                    suggest: SmartSuggestEngine.builtIn.getGeneralSuggestions
                });

                var formatter = new SmartSuggestFormatter({
                    locale: 'en-US',
                    currency: scope.currency
                });

                scope.$watch('currency', function(currency) {
                    formatter.currency = currency;
                });

                scope.$watch('contacts', function(contacts) {
                    //TODO: why is this not an empty array when empty?
                    if(lpCoreUtils.isArray(contacts)) {
                        smartSuggest.addSuggester({
                            data: contacts,
                            suggest: SmartSuggestEngine.builtIn.getContactSuggestions
                        });
                    }
                });

                scope.$watch('categories', function(categories) {
                    formatter.categories = categories;
                    smartSuggest.addSuggester({
                        data: scope.categories,
                        type: SmartSuggestEngine.types.CATEGORY,
                        suggest: SmartSuggestEngine.builtIn.getCategorySuggestions
                    });
                });

                $(element).autosuggest({
                    lookup: function(q) {
                        var suggs = smartSuggest.getSuggestions(q);
                        suggs = suggs.map(function(suggestion) {
                            var values = formatter.format(suggestion);

                            var displayValue;
                            if(suggestion.contact) {
                                displayValue = suggestion.contact.name;
                            } else if(values.length === 2) {
                                displayValue = values[0] + ' to ' + values[1];
                            } else {
                                displayValue = values[0];
                            }

                            return {
                                data: suggestion,
                                value: displayValue
                            };
                        });
                        return suggs;
                    },
                    onSelect: function (suggestion) {
                        if(scope.smartsuggestSelect) {
                            lpCoreBus.publish('lpSearchSelectValue', {type: suggestion.data.type, text: suggestion.value, icon: formatter.getSuggestionIcon(suggestion.data, true)});
                            scope.$apply(function() {
                                scope.smartsuggestSelect.call({}, suggestion.data);
                            });
                        }
                    },
                    onClear: function() {
                        if(scope.smartsuggestClear && !scope.tagsInput) {
                            scope.$apply(function() {
                                scope.smartsuggestClear.call({});
                            });
                        }
                    },
                    onChangeModel: function() {
                        if(scope.smartsuggestUpdate && scope.tagsInput) {
                            scope.$apply(function() {
                                scope.smartsuggestUpdate.call({}, true);
                            });
                        }
                    },
                    formatResult: function(suggestion) {
                        return formatter.getSuggestionHtml(suggestion.data);
                    },
                    autoSelectFirst: true
                });
            }
        };
    };
});
