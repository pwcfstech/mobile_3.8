/**
 * Providers
 * @module transactions
 */
define(function(require, exports, module) {
    'use strict';

    // @ngInject
    exports.lpTransactionsCategory = function(lpCoreUtils) {
        var messages = {
            generic: 'Generic error',
            badId: 'The id must be a string'
        };

        // @ngInject
        this.$get = function($http, $q, lpCoreError) {
            var config = {
                endpoint: ''
            };

            function API() {
                function TransactionsCategoryModel() {
                    this.categories = [];
                }

                /**
                 * Returns all the categories
                 * @return {Object} A promise
                 */
                TransactionsCategoryModel.prototype.getAll = function() {
                    return $http.get(config.endpoint)
                        // success
                        .then(function(response) {
                            if (lpCoreUtils.isArray(response.data)) {
                                this.categories = response.data;
                                return this.categories;
                            } else {
                                lpCoreError.throwException(new Error(messages.generic));
                            }
                        }.bind(this),
                        // error
                        function(data, status, headers, options) {
                            lpCoreError.throwException(new Error(messages.generic));
                        });
                };

                /**
                 * Returns the category that corresponds to `id`
                 * @param  {String} id the `id` of the category
                 * @return {Object}    A promise
                 */
                TransactionsCategoryModel.prototype.getById = function(id) {
                    if (!lpCoreUtils.isString(id)) {
                        lpCoreError.throwException(new TypeError(messages.badId));
                    }

                    return $http.get(config.endpoint + '/' + id)
                        // success
                        .then(function(response) {
                            return response.data;
                        },
                        // error
                        function(response) {
                            lpCoreError.throwException(new Error(messages.generic));
                        });
                };

                /**
                 * Creates a new category
                 * @param  {Object} category The `category` to be created
                 * @param  {String} category.name
                 * @param  {String} category.color
                 * @return {Object}          A promise
                 */
                TransactionsCategoryModel.prototype.create = function(category) {
                    if (!lpCoreUtils.isObject(category) || !category.name || !category.color) {
                        lpCoreError.throwException(new Error('Bad category data: ' + category));
                    }

                    return $http.post(config.endpoint, category)
                        // success
                        .then(function(response) {
                            var newCategory = response.data;
                            this.categories.push(newCategory);
                            return newCategory;
                        }.bind(this),
                        // error
                        function(response) {
                            lpCoreError.throwException(new Error(messages.generic));
                        });
                };

                /**
                 * Deletes the category with a certain`id`
                 * @param  {String} id The `id` of the category
                 * @return {Object}    A promise
                 */
                TransactionsCategoryModel.prototype.removeById = function(id) {
                    if (!lpCoreUtils.isString(id)) {
                        lpCoreError.throwException(new TypeError(messages.badId));
                    }

                    return $http['delete'](config.endpoint + '/' + id)
                    // success
                    .then(function(response) {
                        var category = lpCoreUtils(this.categories).find({ id: id });
                        this.categories.splice(lpCoreUtils(this.categories).indexOf(category), 1);
                        return category;
                    }.bind(this),
                    // error
                    function(response) {
                        lpCoreError.throwException(new Error(messages.generic));
                    });
                };

                return new TransactionsCategoryModel();
            }

            return {
                setConfig: function(options) {
                    config = lpCoreUtils(options).chain()
                        .mapValues(lpCoreUtils.resolvePortalPlaceholders)
                        .defaults(config)
                        .value();
                    return this;
                },

                api: API
            };
        };
    };
});
