define(function (require, exports, module) {
    'use strict';

    var template = '' +
        '<div class="lp-widget-body clearfix">' +
        '    <div>' +
        '        <div class="col-xs-12 col-sm-6 chart-horizontal">' +
        '            <div class="panel-body lp-chart-balances">' +
        '                <div class="h4">Balance<br /><span ng-bind="timePeriod"></span></div>' +
        '                <div progress-indicator="loading" class="chart-progress-indicator"></div>' +
        '                <div ng-show="!loading && !emptyBalances" lp-line-chart="lp-line-chart" lp-chart-options="accountBalanceChartOptions" class="accountsChart lp-chart"></div>' +
        '                <div ng-show="emptyBalances" class="chart-empty-data" lp-i18n="There is no data available for this period of time"></div>' +
        '            </div>' +
        '            <div class="panel-body">' +
        '                <div class="controls clearfix">' +
        '                    <div class="col-xs-2">' +
        '                        <button class="btn btn-primary btn-block arrow" ng-click="prevPeriod()">&lt;</button>' +
        '                    </div>' +
        '                    <div class="col-xs-8 text-center">' +
        '                        <button class="btn btn-default" ng-class="{\'btn-primary\':scale==\'WEEK\'}" ng-click="setScale(\'WEEK\')">7D</button>' +
        '                        <button class="btn btn-default" ng-class="{\'btn-primary\':scale==\'MONTH\'}" ng-click="setScale(\'MONTH\')">1M</button>' +
        '                    </div>' +
        '                    <div class="col-xs-2">' +
        '                        <button class="btn btn-primary btn-block arrow" ng-click="nextPeriod()" ng-show="showNextPeriod()">&gt;</button>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '        <div class="col-xs-12 col-sm-6 chart-horizontal">' +
        '            <div class="panel-body lp-chart-turnovers">' +
        '                <div class="h4">Transactions<br /><span ng-bind="timePeriod"></span></div>' +
        '                <div progress-indicator="loading" class="chart-progress-indicator"></div>' +
        '                <div ng-show="!loading && !emptyTurnovers" lp-bar-chart="lp-bar-chart" lp-chart-options="transactionsChartOptions" class="transactionsChart lp-chart"></div>' +
        '                <div ng-show="emptyTurnovers" class="chart-empty-data" lp-i18n="There is no data available for this period of time"></div>' +
        '            </div>' +
        '            <div class="panel-body">' +
        '                <div class="controls clearfix text-center">' +
        '                    <button class="btn btn-default" ng-class="{\'btn-primary\':series==\'WITHDRAWAL\'}" ng-click="setSeries(\'WITHDRAWAL\')">Spending</button>' +
        '                    <button class="btn btn-default" ng-class="{\'btn-primary\':series==\'DEPOSIT\'}" ng-click="setSeries(\'DEPOSIT\')">Income</button>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>';

    return template;
});
