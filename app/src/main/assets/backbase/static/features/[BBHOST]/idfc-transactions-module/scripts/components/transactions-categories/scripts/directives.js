define(function (require, exports, module) {

    'use strict';

    var Hammer = require('hammerjs');
    var $ = window.jQuery;
    // TODO: put in core.utils
    function rgb2hsl() {
        var r = arguments[0] / 255,
            g = arguments[1] / 255,
            b = arguments[2] / 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max === min){
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h = h / 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    // @ngInject
    exports.lpCategoryDisplay = function($templateCache, lpCoreBus) {
        $templateCache.put('$categoryDisplay.html',
            '<div class="lp-transaction-category" ng-click="onClick($event, transaction)">' +
                '<span class="category-marker" ng-style="markerStyle"></span>' +
                '<div class="category-name"><span class="h4">{{category.name}}</span></div>' +
            '</div>'
        );

        return {
            restrict: 'A',
            replace: true,
            require: 'ngModel',
            scope: {
                isCategoryView: '=lpCategoryView',
                categoryList: '=lpCategoryList',
                transaction: '=ngModel',
                categoryClick: '&',
                categorySwipe: '&',
                categoryStartSwipe: '&',
                categoryEndSwipe: '&'
            },
            template: $templateCache.get('$categoryDisplay.html'),
            link: function (scope, element, attrs) {

                var transactionRow = element.parent().parent(),
                    dragStartWidth = 0;

                scope.markerStyle = {};
                scope.category = null;

                scope.onClick = function (event, transaction) {
                    scope.categoryClick({
                        $event: event,
                        transaction: scope.transaction
                    });
                };

                var gestures = {}, swipeHammer = transactionRow.data('touch');

                var panright = function (event) {
                    event.srcEvent.stopPropagation();
                    event.preventDefault();
                    element.parent().addClass('no-animation');
                    var newWidth = dragStartWidth + Math.floor(event.deltaX);
                    if (newWidth > 160) {
                        newWidth = 160;
                    }
                    if (newWidth > dragStartWidth) {
                        element.parent().css('width', newWidth + 'px');
                    }
                    scope.categorySwipe({
                        $event: event,
                        transaction: scope.transaction
                    });
                };

                var panstart = function (event) {
                    event.srcEvent.stopPropagation();
                    event.preventDefault();
                    dragStartWidth = parseInt(element.css('width'), 10);
                    scope.categoryStartSwipe({
                        $event: event,
                        transaction: scope.transaction
                    });
                };

                var panend = function (event) {
                    event.srcEvent.stopPropagation();
                    event.preventDefault();
                    element.parent().removeClass('no-animation');
                    var newWidth = dragStartWidth + Math.floor(event.deltaX);
                    if (newWidth > 160) {
                        newWidth = 160;
                    }
                    if (newWidth > 150) {
                        scope.categoryClick({
                            $event: null,
                            transaction: scope.transaction
                        });
                    }
                    element.parent().css('width', '');
                    scope.categoryEndSwipe({
                        event: event,
                        transaction: scope.transaction
                    });
                };

                if (!scope.isCategoryView && typeof Hammer !== 'undefined') {
                    if (!swipeHammer) {
                        swipeHammer = new Hammer( transactionRow[0]);
                        transactionRow.data('touch', swipeHammer);
                    }


                    gestures.panright = swipeHammer.on('panright', panright);

                    gestures.panstart = swipeHammer.on('panstart', panstart);

                    gestures.panend = swipeHammer.on('panend', panend);
                }

                scope.$on('$destroy', function() {
                    Object.keys(gestures).forEach(function(eventType) {
                        var ev = gestures[eventType];
                        ev.off(eventType, ev.handlers[eventType][0]);
                    });
                });

                scope.$watch('transaction.categoryId', function(value) {
                    scope.setCategory(value);
                });

                scope.setCategory = function (id) {
                    if (scope.categoryList) {
                        for (var i = 0; i < scope.categoryList.length; i++) {
                            if (scope.categoryList[i].id === id) {
                                scope.category = scope.categoryList[i];
                            }
                        }
                    }

                    if (scope.category && id) {
                        scope.markerStyle.backgroundColor = scope.category.color;
                    } else {
                        // temporary fix to set 'Uncategorised' if transaction category id isn't valid
                        scope.transaction.categoryId = '00cc9919-ba0c-4702-917b-1fba4c256b4d';
                    }
                };

                lpCoreBus.subscribe('launchpad-retail.categoryDelete', function(data) {
                    if (data.id === scope.transaction.categoryId) {
                        scope.setCategory();
                    }
                });
            }
        };
    };

    // @ngInject
    exports.lpCategoryItem = function() {
        return {
            restrict: 'A',
            replace: true,
            template:
                '<div class="category-item btn btn-block btn-default" tabIndex="{{category.id !== transaction.categoryId ? 0 : -1}}" ng-style="{\'background-color\': category.id === newCategoryId ? category.color : \'#ffffff\'}" ng-click="markNewCategory(category.id)" ng-keydown="categoryKeyDown($event, category)">' +
                    '<div class="marker" ng-style="{\'background-color\':category.color}"></div>' +
                    '<span class="name" ng-class="{ light: (category.id === newCategoryId && getTextColor(category.color)) }">{{category.name}}</span>' +
                    '<button type="button" class="close" aria-hidden="true" ng-click="deleteCategory($event, category)" ng-if="category.type ===\'NORMAL\'">&times;</button>' +
                '</div>'
        };
    };

    // @ngInject
    exports.lpCategorySelect = function($templateCache, $timeout, lpCoreBus, lpCoreUtils) {
        $templateCache.put('$categorySelect.html',
            '<div class="lp-category-select clearfix">' +
                '<div class="clearfix">' +
                    '<label class="control-label pull-left" lp-i18n="Current Category:"></label>' +
                    '<div ng-repeat="category in transactionCategories | orderBy:\'-priority\' | selectedCategory:this" class="col-xs-6 col-sm-4 col-md-4">' +
                        '<div lp-category-item="lp-category-item"></div>' +
                    '</div>' +
                '</div>' +
                '<label class="control-label pull-left" lp-i18n="Change category to:"></label>' +
                '<form class="form category-search clearfix" role="form" ng-submit="createCategory()">' +
                    '<input type="text" ng-model="categoryFilter" class="form-control" placeholder="{{\'Search categories / Create category\'|translate}}" maxlength="40" ng-disabled="showColorPicker" />' +
                '</form>' +
                '<div class="category-list col-xs-12 col-sm-12 col-md-9">' +
                    '<div class="new-category col-xs-12 col-sm-12 col-md-12" ng-if="!categoryExists() && !showColorPicker && categoryFilter.length > 0">' +
                        '<label class="control-label pull-left" lp-i18n="Create new category:"></label>' +
                        '<div ng-repeat="category in newCategory" class="col-xs-6 col-sm-6 col-md-6">' +
                            '<div lp-category-item="lp-category-item"></div>' +
                        '</div>' +
                    '</div>' +
                    '<ul class="category-list col-xs-12 col-sm-12 col-md-12">' +
                        '<li ng-repeat="category in transactionCategories | orderBy:\'-priority\' | categoryList:this" class="col-xs-6 col-sm-4 col-md-4" ng-show="!showColorPicker">' +
                            '<div lp-category-item="lp-category-item"></div>' +
                        '</li>' +
                        '<div id="{{\'transaction-\' + transaction.id + \'-category-step-2\'}}" class="clearfix" ng-if="showColorPicker">' +
                            '<label class="clearfix" lp-i18n="Choose a color for the new category:"></label>' +
                            '<div lp-color-picker="lp-color-picker" select-color="selectColor"></div>' +
                        '</div>' +
                    '</ul>' +
                '</div>' +
                '<div id="{{\'transaction-\' + transaction.id + \'-category-step-3\'}}" class="col-xs-12 col-sm-12 col-md-3 category-apply" ng-if="(smallLayout && newCategoryId.length) || !smallLayout">' +
                    '<div class="row" ng-if="smallLayout">' +
                        '<div class="col-xs-12 col-sm-12 clearfix">' +
                            '<label class="control-label pull-left" lp-i18n="You\'ve selected:"></label>' +
                            '<div ng-repeat="category in transactionCategories | orderBy:\'-priority\' | markedCategory:this" class="col-xs-7 col-sm-6 col-md-4">' +
                                '<div lp-category-item="lp-category-item"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="col-xs-12 col-sm-12 clearfix">' +
                            '<p lp-i18n="Would you like to change the category for only this transaction or all similar transactions?"></p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row">' +
                        '<div class="col-sm-12 col-md-12" ng-if="!smallLayout">' +
                            '<p lp-i18n="Apply category change to?"></p>' +
                        '</div>' +
                        '<div class="col-xs-6 col-sm-6 col-md-12">' +
                            '<button type="button" class="btn btn-default btn-block" ng-click="changeCategory(newCategoryId)" ng-disabled="!newCategoryId.length" lp-i18n="Only This"></button>' +
                        '</div>' +
                        '<div class="col-xs-6 col-sm-6 col-md-12">' +
                            '<button type="button" class="btn btn-default btn-block" ng-click="changeCategory(newCategoryId, true)" ng-disabled="!newCategoryId.length" lp-i18n="All Similar"></button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );

        return {
            restrict: 'A',
            replace: false,
            require: 'ngModel',
            scope: {
                model: '=ngModel',
                transaction: '=',
                update: '=',
                smallLayout: '=',
                offsetTopCorrection: '='
            },
            template: $templateCache.get('$categorySelect.html'),
            link: function (scope, element, attrs) {

                scope.showColorPicker = false;
                scope.searchResultNumber = scope.model.categories.length;

                var cloneCategoryList = function() {
                    scope.transactionCategories = [];
                    for (var i = 0; i < scope.model.categories.length; i++) {
                        scope.transactionCategories.push(lpCoreUtils.cloneDeep(scope.model.categories[i]));
                    }
                };
                cloneCategoryList();

                var goToCategoryStep = function(stepNumber) {
                    if (scope.smallLayout) {
                        $timeout(function() {
                            $('body').animate({
                                scrollTop: $('#transaction-' + scope.transaction.id + (stepNumber > 1 ? '-category-step-' + stepNumber : '')).offset().top - 5 - (scope.offsetTopCorrection || 0)
                            }, 500);
                        }, 0);
                    }
                };

                var focusChangeButton = function() {
                    $timeout(function() {
                        $(element).find('button[ng-click^="changeCategory"]')[0].focus();
                    }, 0);
                };

                scope.$watch('categoryFilter', function(value) {
                    scope.newCategory = [{
                        id: null,
                        name: value,
                        color: '#cccccc'
                    }];
                });

                scope.categoryExists = function() {
                    var result = false;

                    if (scope.categoryFilter && scope.categoryFilter.length > 0) {
                        for (var i = 0; i < scope.model.categories.length; i++) {
                            if (scope.categoryFilter.toLowerCase() === scope.model.categories[i].name.toLowerCase()) {
                                result = true;
                            }
                        }
                    }

                    return result;
                };

                scope.getTextColor = function(hexColor) {
                    var result = true,
                        r = hexColor.substr(1, 2),
                        g = hexColor.substr(3, 2),
                        b = hexColor.substr(5, 2);

                    if (hexColor.length === 4) {
                        r = hexColor.substr(1, 1) + hexColor.substr(1, 1);
                        g = hexColor.substr(2, 1) + hexColor.substr(2, 1);
                        b = hexColor.substr(3, 1) + hexColor.substr(3, 1);
                    }

                    r = parseInt(r, 16);
                    g = parseInt(g, 16);
                    b = parseInt(b, 16);

                    if (rgb2hsl(r, g, b).l > 45) {
                        result = false;
                    }

                    return result;
                };

                scope.newCategoryId = '';
                scope.markNewCategory = function(categoryId) {
                    if (categoryId === null) {
                        scope.createCategory();
                        return;
                    }
                    if (scope.transaction.categoryId === categoryId) {
                        return;
                    }
                    if (scope.newCategoryId === categoryId) {
                        scope.newCategoryId = '';
                        return;
                    }
                    scope.newCategoryId = categoryId;

                    goToCategoryStep(3);
                    focusChangeButton();
                };

                scope.categoryKeyDown = function(event, category) {
                    if (event.which === 13 || event.which === 32) {
                        event.preventDefault();
                        event.stopPropagation();

                        if (event.target.tagName.toLowerCase() === 'button') {
                            scope.deleteCategory(event, category);
                            return;
                        }
                        scope.markNewCategory(category.id);
                    }
                };

                scope.createCategory = function() {
                    var notInList = !scope.categoryExists() && scope.categoryFilter.length > 0;

                    if (notInList) {
                        scope.showColorPicker = true;

                        goToCategoryStep(2);
                    } else {
                        if (scope.searchResultNumber) {
                            $timeout(function() {
                                $('.category-list .category-item')[0].focus();
                            }, 0);
                        }
                    }
                };

                scope.selectColor = function(color) {
                    scope.model.create({
                        name: scope.categoryFilter,
                        color: color
                    }).then(function(response) {
                        scope.categoryFilter = '';
                        scope.showColorPicker = false;
                        cloneCategoryList();
                        scope.markNewCategory(response.id);
                        lpCoreBus.publish('launchpad-retail.categoryListUpdate', null, true);

                        goToCategoryStep(3);
                        focusChangeButton();
                    }, function(response) {
                        lpCoreBus.publish('launchpad.add-notification', {
                            notification: {
                                id: 'category-create-duplicate',
                                level: 'SEVERE',
                                message: response.data.error,
                                closable: true
                            }
                        }, true);

                        scope.categoryFilter = '';
                        scope.showColorPicker = false;
                    });
                };

                scope.deleteCategory = function(event, category) {
                    event.stopPropagation();

                    if (category.type === 'NORMAL') {
                        scope.model.removeById(category.id)
                        .then(function() {
                            if (scope.newCategoryId === category.id) {
                                scope.newCategoryId = '';
                            }
                            cloneCategoryList();
                            lpCoreBus.publish('launchpad-retail.categoryDelete', {id: category.id}, true);
                            lpCoreBus.publish('launchpad-retail.categoryListUpdate', null, true);
                        });
                    }
                };

                scope.changeCategory = function(id, similar) {
                    scope.newCategoryId = '';
                    scope.categoryFilter = '';
                    scope.update(scope.transaction, id, similar);

                    $timeout(function() {
                        scope.transaction.showDetails = false;
                    }, 100);

                    goToCategoryStep(1);
                    $('#transaction-' + scope.transaction.id)[0].focus();
                };

                lpCoreBus.subscribe('launchpad-retail.categoryListUpdate', function() {
                    cloneCategoryList();
                });
            }
        };
    };
});
