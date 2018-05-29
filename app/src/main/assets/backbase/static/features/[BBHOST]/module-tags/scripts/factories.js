define( function (require, exports, module) {
    'use strict';

    var utils = require('base').utils;
    var $ = window.jQuery;

    /**
     * Main factory for batched search utils
     */
    // @ngInject
    exports.lpTagsUtils = function($timeout, lpCoreBus) {
        var currentIndex;
        var $INPUTS = [];
        var FILTERS = [];
        var MESSAGES = [];

        /**
         * Check if the item is valid
         *
         * @param filterItem
         * @returns {Boolean|boolean}
         * @private
         */
        var isValidItem = function(filterItem) {
            return utils.isPlainObject(filterItem) && utils.keys(filterItem).length;
        };

        /**
         * Check if already have the filter added to the model
         *
         * @param filterItem
         * @returns {boolean|number}
         * @private
         */
        var existInCollection = function(filterItem) {
            var inCollection = false;
            var props = utils.keys(filterItem);

            FILTERS.forEach(function(filter, index) {
                var common = utils.intersection(props, utils.keys(filter));
                if (common.length === props.length) {
                    inCollection = index;
                }
            });

            return inCollection;
        };

        /**
         * Add brand new filter to collection
         *
         * @param filterItem
         * @private
         */
        var addNewFilter = function(filterItem) {
            FILTERS.push(filterItem);
        };

        /**
         * Update existing filter with new values
         *
         * @param filterItem
         * @param inCollection
         * @private
         */
        var updateFilter = function(filterItem, inCollection) {
            currentIndex = inCollection;
            var props = utils.keys(filterItem);
            props.forEach(function(prop) {
                FILTERS[inCollection][prop] = filterItem[prop];
            });
        };

        /**
         * Clear input elements
         *
         * @private
         */
        var updateLayout = function(inputValue) {
            $INPUTS.forEach(function($input) {
                if($input.is(':visible')) {
                    if ($input.val()) {
                        $input.val('');
                    } else {
                        $input.autosuggest('changeModel');
                    }
                    $timeout(function() {
                        // adjust suggestions dropdown
                        $input.autosuggest('fixPosition');

                        // not just remove the filter, but allow to edit it
                        if (inputValue) {
                            $input.val(inputValue);
                        }
                    });
                }
            });
        };

        var updateViewMessages = function() {
            var msg = [];
            if (MESSAGES.length) {
                MESSAGES.forEach(function(m) {
                    msg.push(m);
                });
            } else {
                FILTERS.forEach(function(filter) {
                    var values = utils.values(filter);
                    msg.push({ text: values.join(' : '), icon: '' });
                });
            }
            return msg;
        };

        /**
         * Return filters model as an Object
         *
         * @returns {Array}
         */
        var getFiltersList = function() {
            var result = {};

            FILTERS.forEach(function(filter) {
                var keys = utils.keys(filter);
                var values = utils.values(filter);
                keys.forEach(function(key, index) {
                    result[key] = values[index];
                });
            });

            return utils.keys(result).length ? result : false;
        };

        /**
         * Update model and layout with updated data
         *
         * @private
         */
        var emitUpdatedData = function(inputValue) {
            $timeout(function() {
                updateLayout(inputValue);
                lpCoreBus.publish('lpTagsChangeView', updateViewMessages());
                lpCoreBus.publish('lpTagsChange', getFiltersList());
            });
        };

        /**
         * Set filter to the collection (or update existent one)
         *
         * @param filterItem
         * @returns {*}
         */
        var setFilter = function(filterItem) {
            currentIndex = undefined;
            if (!isValidItem(filterItem)) {
                return false;
            }

            var inCollection = existInCollection(filterItem);

            if (inCollection === false) {
                addNewFilter(filterItem);
            } else {
                updateFilter(filterItem, inCollection);
            }

            emitUpdatedData();
        };

        /**
         * Update Messages we will show in tags
         *
         * @param obj
         */
        var suggestionValueAdd = function(obj, atOnce) {
            var update = function(updateObj) {
                if (utils.isPlainObject(updateObj)) {
                    if (currentIndex === undefined) {
                        MESSAGES.push(updateObj);
                    } else {
                        MESSAGES[currentIndex] = updateObj;
                    }
                }
            };

            if (atOnce === true) {
                update(obj);
            } else {
                $timeout(function() { update(obj); });
            }
        };

        /**
         * Provider for additional source of filters
         *
         * @param filter
         */
        var setOuterFilter = function(filter) {
            setFilter(filter.filterItem);
            suggestionValueAdd(filter.msg, true);
        };

        /**
         * Remove filter from collection by index
         *
         * @param index
         */
        var removeFilter = function(index, withEdit) {
            var removedItems;
            FILTERS.splice(index, 1);
            if (MESSAGES[index]) {
                removedItems = MESSAGES.splice(index, 1);
            }

            if (withEdit) {
                emitUpdatedData(removedItems[0].text);
            } else {
                // no filter value edit, just removing it
                emitUpdatedData();
            }

        };

        /**
         * Remove filter from collection by name
         *
         * @param index
         */
        var removeFilterByName = function(propName) {
            FILTERS.forEach(function(filter, index) {
                if (filter.hasOwnProperty(propName)) {
                    removeFilter(index);
                }
            });
        };

        /**
         * Remove filter from collection
         *
         * @param index
         */
        var removeFilterEdit = function(index) {
            removeFilter(index, true);
        };

        /**
         * Clear all filters
         */
        var clearFilters = function() {
            FILTERS = [];
            MESSAGES = [];
            emitUpdatedData();

            return getFiltersList();
        };

        /**
         * Get input element
         *
         * @param el
         * @private
         */
        var setInputElement = function(el) {
            $INPUTS.push($(el));
        };

        // listen for outer events
        lpCoreBus.subscribe('lpTagsRemove', removeFilter);
        lpCoreBus.subscribe('lpTagsRemoveEdit', removeFilterEdit);
        lpCoreBus.subscribe('lpTagsRemoveByName', removeFilterByName);
        lpCoreBus.subscribe('lpTagsSet', setFilter);
        lpCoreBus.subscribe('lpFilterSet', setOuterFilter);
        lpCoreBus.subscribe('lpTagsInputField', setInputElement);
        lpCoreBus.subscribe('lpSearchSelectValue', suggestionValueAdd);

        // public API
        return {
            getFilters: getFiltersList,
            setFilter: setFilter,
            removeFilter: removeFilter,
            clearFilters: clearFilters
        };
    };
});
