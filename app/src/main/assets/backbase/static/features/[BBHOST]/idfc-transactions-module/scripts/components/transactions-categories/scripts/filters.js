define(function (require, exports, module) {
    'use strict';

    // @ngInject
    exports.categoryList = function() {
        return function(input, scope) {
            var result = input;

            if (!scope.initialSelected) {
                scope.initialSelected = scope.transaction.categoryId;
            }

            // Remove "Pending" from the selectable list of categories
            for (var i = 0; i < result.length; i++) {
                if (result[i].type === 'TEMPORARY') {
                    result.splice(i, 1);
                    i--;
                    continue;
                }
                // add/reset priority property
                result[i].priority = 1;
                if (result[i].type === 'CONTROL') {
                    result[i].priority = 0;
                }
                if (result[i].id === scope.initialSelected) {
                    result[i].priority = 2;
                }
            }

            for (i = 0; i < result.length; i++) {
                // Filter out the categories that don't contain the string in the input
                if (scope.categoryFilter && scope.categoryFilter.length && result[i].name.toLowerCase().indexOf(scope.categoryFilter.toLowerCase()) === -1) {
                    result.splice(i, 1);
                    i--;
                    continue;
                }
                // Move the selected category to the first position
                if (result[i].id === scope.transaction.categoryId) {
                    result.splice(i, 1);
                    i--;
                }
            }

            scope.searchResultNumber = result.length;
            return result;
        };
    };

    // @ngInject
    exports.selectedCategory = function() {
        return function(input, scope) {
            var result = input;

            for (var i = 0; i < result.length; i++) {
                if (result[i].id !== scope.transaction.categoryId) {
                    result.splice(i, 1);
                    i--;
                }
            }

            return result;
        };
    };

    // @ngInject
    exports.markedCategory = function() {
        return function(input, scope) {
            var result = input;

            for (var i = 0; i < result.length; i++) {
                if (result[i].id !== scope.newCategoryId) {
                    result.splice(i, 1);
                    i--;
                }
            }

            return result;
        };
    };
});
