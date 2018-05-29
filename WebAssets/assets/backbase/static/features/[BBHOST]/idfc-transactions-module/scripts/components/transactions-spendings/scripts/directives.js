define(function(require, exports, module) {
    'use strict';

    var d3 = require('d3');
    var utils = require('base').utils;

    // @ngInject
    exports.lpCategoriesSpendings = function($q, $timeout, $templateCache, lpCoreBus, CategorySpendingsResource, CategoriesResource) {
        function parse(data) {
            var categoriesSpendings = data.spendings.categoriesSpendings;
            var categories = data.categories;

            categoriesSpendings
                .sort(function (a, b) {
                    return a.amount - b.amount;
                })
                .forEach(function (categorySpending) {
                    var category = utils.find(categories, function (currentCategory) {
                        return currentCategory.id === categorySpending.categoryId;
                    });

                    categorySpending.name = category.name;
                    categorySpending.color = category.color;
                    categorySpending.currency = data.spendings.currency;
                });
            return categoriesSpendings;
        }

        function linkFn(scope, elem, attrs) {
            scope.options = utils.assign({}, scope.options, scope.lpCategoriesSpendings);
            scope.accountId = null;
            scope.fromDate = null;
            scope.toDate = null;

            scope.viewLoading = true;
            scope.missingData = false;
            scope.showChart = false;

            scope.$watchCollection('[viewLoading,missingData]', function(newVals, oldVals) {
                var viewLoading = newVals[0];
                var missingData = newVals[1];
                scope.showChart = !viewLoading && !missingData;
            });

            scope.selectItem = function (item) {
                $timeout(function () {
                    scope.selectedItem = item;
                    lpCoreBus.publish('launchpad-retail.donutCategoryChartSelection', item);
                });
            };

            scope.resize = function (width, height) {
                $timeout(function () {
                    scope.width = width;
                });
            };

            /**
             * Updates both categories and spending data, based on changed
             * query values for CategorySpendingsResource
             */
            scope.updateData = function() {
                var params = {
                    accountIds: scope.accountId || null,
                    start: scope.fromDate,
                    end: scope.toDate
                };
                $q.all({
                    spendings: CategorySpendingsResource.get(params).$promise,
                    categories: CategoriesResource.get().$promise
                }).then(function(result) {
                    if(result.spendings.categoriesSpendings.length === 0) {
                        scope.missingData = true;
                        scope.viewLoading = false;
                        return;
                    }

                    scope.viewLoading = false;
                    scope.missingData = false;
                    scope.options = utils.assign({}, scope.options, {
                        data: parse(result)
                    });
                }, function(error) {
                    scope.viewLoading = false;
                    scope.missingData = true;
                });
            };

            //Listen for user accounts data load
            var accountIds;
            var onAccountsLoaded = function(accounts) {
                utils.forEach(accounts, function(account) {
                    if (account.ids) {
                        accountIds = account.ids;
                    }
                });

                scope.accountId = accountIds;
            };
            lpCoreBus.subscribe('launchpad-retail.accountsLoaded', onAccountsLoaded);
            lpCoreBus.subscribe('lpAccounts.loaded', onAccountsLoaded);

            var removeWatch = scope.$watch('lpAccounts.selected', function(account) {
                if(!account) {
                    return;
                }

                //Listen for user account selection
                lpCoreBus.subscribe('launchpad-retail.accountSelected', function(params) {
                    scope.accountId = params.allAccounts ? accountIds : params.accountId;
                    scope.updateData();
                });

                scope.accountId = account.id;
                scope.updateData();

                removeWatch();
            });

            //Listen for transaction filtering by date
            lpCoreBus.subscribe('launchpad-retail.transactionsDateSearch', function(params) {
                scope.fromDate = params.fromDate;
                scope.toDate = params.toDate;
                scope.updateData();
            });

            lpCoreBus.subscribe('launchpad-retail.transactionsCategorySearch', function(categories) {
                if (categories.length === 1) {
                    var spending = utils.find(scope.options.data, function(s) {
                        return s.categoryId === categories[0].id;
                    });

                    scope.selectItem(spending);
                }
            });

            scope.$on('tabSelected', function (event, tab) {
                if (tab === 'donut') {
                    scope.options = utils.assign({}, scope.options); // force update
                }
            });
        }

        function compileFn(elem, attrs) {
            return linkFn;
        }

        // retrieve template
        function templateFn() {
            return (
                '<div class="ng-cloak" ng-class="responsiveClass">' +
                '	<div class="lp-widget-content widget widget-default" role="application">' +
                '		<div class="lp-widget-body">' +
                '			<div ng-if="missingData" class="panel-message" >' +
                '				<div class="panel-body text-center">You have no data available.</div>' +
                '			</div>' +
                '			<div ng-if="viewLoading" class="panel-message loading-panel" role="alert">' +
                '				<i class="lp-icon lp-icon-spinner2 lp-spin loading-icon"></i>' +
                '				<span class="sr-only">Busy</span>' +
                '			</div>' +
                '			<div lp-donut-chart options="options" class="category-spendings-chart" on-select="selectItem" item="selectedItem" on-resize="resize" ng-show="showChart">' +
                '                           <div category-details ng-model="selectedItem" width="width"></div>' +
                '                       </div>' +
                '		</div>' +
                '	</div>' +
                '</div>'
            );
        }

        // Directive configuration
        return {
            scope: {
                lpCategoriesSpendings: '=?',
                lpAccounts: '=',
                options: '=?'
            },
            restrict: 'AE',
            compile: compileFn,
            template: templateFn,
            replace: true
        };
    };

    function wrapText(textNode, text) {
        textNode.selectAll('tspan').remove();

        var textNodeWidth = textNode.attr('width');
        var tspanCount = 1;
        var tspan = textNode.append('tspan');
        var words = text.split(/\s+/);
        var lineHeight = 20;

        if(words.length === 1 && text.length > 15) {
            tspan.text(text.slice(0, 12) + '...');
            return textNode;
        }

        for (var i = 0; i < words.length; i++) {
            var node = tspan.node();
            if(node && node.getComputedTextLength && node.getComputedTextLength() > textNodeWidth) {
                tspanCount++;

                // allow only two lines of text, otherwise end title with ellipsis
                if(tspanCount >= 3) {
                    tspan.text(tspan.text() + '...');
                    break;
                }

                tspan = textNode.append('tspan').attr({x: 0, dy: lineHeight});
            }

            tspan.text(tspan.text() + ' ' + words[i]);
        }

        return textNode;
    }

    function formatPercentage(val) {
        return (val * 100).toFixed(2) + '%';
    }

    // @ngInject
    exports.categoryDetails = function (lpCoreI18n) {
        function link(scope, element) {

            var canvases = element.find('svg');
            var canvas = canvases.length ? d3.select(canvases[0]) : d3.select(element[0]).append('svg:svg');
            var node = canvas.append('svg:g');

            node.append('svg:text').attr('class', 'name');
            node.append('svg:text').attr('class', 'amount');
            node.append('svg:text').attr('class', 'share');
            node.append('svg:text').attr('class', 'delta');

            function resize(width, height) {
                if (!width) { return; }

                var radius = width / 2;
                var innerRadius = radius * 0.55;

                node.attr('transform', 'translate(' + radius + ',' + radius + ')');
                var unitSize = width / 20;
                node.select('.name').attr({y: -0.34 * innerRadius, width: innerRadius}).style('font-size', unitSize + 'px');
                node.select('.amount').attr({y: 0.15 * innerRadius}).style('font-size', 1.4 * unitSize + 'px');
                node.select('.share').attr({y: 0.5 * innerRadius}).style('font-size', unitSize + 'px');
                node.select('.delta').attr({y: 0.5 * innerRadius}).style('font-size', unitSize + 'px');
            }

            function update(data) {
                if (!data) { return; }

                wrapText(node.select('.name'), data.name);

                var delta = data.historicalChangeFactor || 1;
                var symbol = delta < 0 ? '↓' :
                             delta > 0 ? '↑' : '';

                node.select('.amount').text(lpCoreI18n.formatCurrency(data.amount, data.currency));
                node.select('.share').text(formatPercentage(data.totalFraction) + ' ');
                node.select('.delta').text(' ' + symbol + formatPercentage(Math.abs(delta)));
            }

            scope.$watch('width', resize);
            scope.$watch('data', update);
        }

        return {
            restrict: 'EA',
            link: link,
            scope: {
                data: '=ngModel',
                width: '='
            }
        };
    };
});
