define(function (require, exports, module) {
    'use strict';

    module.name = 'module-charts';

    var base = require('base');

    var barChart = require('./components/bar-chart/scripts/main');
    var donutChart = require('./components/donut-chart/scripts/main');
    var lineChart = require('./components/line-chart/scripts/main');

    var deps = [
        barChart.name,
        donutChart.name,
        lineChart.name
    ];
    return base.createModule(module.name, deps)

        .value('lpChartUtils', require('./utils'))

        .value('areaFactory', require('./libs/area'))
        .value('axesFactory', require('./libs/axes'))
        .value('barsFactory', require('./libs/bars'))
        .value('brushFactory', require('./libs/brush'))
        .value('lineFactory', require('./libs/line'))
        .value('pointsFactory', require('./libs/points'))
        .value('stackFactory', require('./libs/stack'))
        .value('tooltipFactory', require('./libs/tooltip'))
        .value('treemapFactory', require('./libs/treemap'));
});
