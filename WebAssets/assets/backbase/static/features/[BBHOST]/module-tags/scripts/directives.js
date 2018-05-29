define( function (require, exports, module) {
    'use strict';

    // @ngInject
    exports.lpTags = function($templateCache, lpTagsUtils, lpCoreBus) {
        $templateCache.put('$lpTagsTemplate.html',
            '<div ng-repeat="tag in model.tags" class="lpTag {{tag.icon}}" title="{{ tag.text }}">' +
                '&nbsp;<span title="Click to edit this filter" class="lpTagText" ng-click="removeTagEdit($index)">{{ tag.text }}</span>' +
                '<span title="Remove filter" class="lpTag lp-icon lp-icon-small lp-icon-remove lpTagClose" ng-click="removeTag($index)"></span>' +
            '</div>'
        );

        return {
            restrict: 'A',
            scope: {
                empty: '@'
            },
            template: $templateCache.get('$lpTagsTemplate.html'),
            link: function ($scope, element, attrs) {
                $scope.model = {};
                $scope.model.tags = [];
                $scope.empty = $scope.empty || '';

                // Event: tags model changed
                lpCoreBus.subscribe('lpTagsChangeView', function(tags) {
                    $scope.model.tags = tags;
                });

                // initiate removing a filter
                $scope.removeTag = function(index) {
                    lpCoreBus.publish('lpTagsRemove', index);
                };

                // remove filter and edit it
                $scope.removeTagEdit = function(index) {
                    lpCoreBus.publish('lpTagsRemoveEdit', index);
                };
            }
        };

    };

    // @ngInject
    exports.lpTagsFilters = function($templateCache, lpTagsUtils, lpCoreBus) {
        $templateCache.put('$lpFiltersTemplate.html',
        '<div class="btn-group" dropdown is-open="model.isOpen">' +
            '<button type="button" ng-click="toggleDropdown()" class="btn btn-default dropdown-toggle" dropdown-toggle>' +
                '<i class="lp-icon lp-icon-filter"></i>' +
            '</button>' +
            '<ul class="dropdown-menu" role="menu">' +
                '<li>' +
                    '<div class="debit-credit-wrapper">' +
                        '<header class="header">Transactions:</header>' +
                        '<div class="btn-group">' +
                            '<label class="btn btn-default btn-sm" ng-model="model.debitCredit" btn-radio="0">All</label>' +
                            '<label class="btn btn-default btn-sm" ng-model="model.debitCredit" btn-radio="1">Debit</label>' +
                            '<label class="btn btn-default btn-sm" ng-model="model.debitCredit" btn-radio="2">Credit</label>' +
                        '</div>' +
                    '</div>' +
                '</li>' +
            '</ul>' +
        '</div>');

        return {
            restrict: 'A',
            scope: {},
            template: $templateCache.get('$lpFiltersTemplate.html'),
            link: function ($scope, element, attrs) {
                $scope.model = {};
                $scope.model.isOpen = false;
                $scope.model.debitCredit = 0;
                $scope.debitCreditName = 'bk';

                $scope.toggleDropdown = function() {
                    $scope.model.isOpen = !$scope.model.isOpen;
                };

                // Filter: debit-credit
                $scope.$watch('model.debitCredit', function(v) {
                    if (v === undefined) {
                        return;
                    }
                    if (v === 0) {
                        lpCoreBus.publish('lpTagsRemoveByName', $scope.debitCreditName);
                        return;
                    }
                    var name = v === 1 ? 'Debit' : 'Credit';
                    var filterItem = {};
                    filterItem[$scope.debitCreditName] = v;

                    lpCoreBus.publish('lpFilterSet', {
                        filterItem: filterItem,
                        msg: {icon: 'lpTag lp-icon lp-icon-small lp-icon-filter', text: name, type: 'filter'}
                    });
                });

                // feedback from search
                lpCoreBus.subscribe('lpTagsChange', function(filters) {
                    // handle debit-credit
                    if (!filters[$scope.debitCreditName]) {
                        $scope.model.debitCredit = 0;
                    }
                });
            }
        };

    };
});
