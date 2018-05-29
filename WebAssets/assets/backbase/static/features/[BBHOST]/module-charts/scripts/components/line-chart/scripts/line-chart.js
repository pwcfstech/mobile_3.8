define(function(require, exports, module) {
    'use strict';

    var base = require('base');
    var angular = base.ng;
    var utils = base.utils;
    var d3 = require('d3');
    var axesFactory = require('../../../libs/axes');
    var tooltipFactory = require('../../../libs/tooltip');
    var lineFactory = require('../../../libs/line');
    var pointsFactory = require('../../../libs/points');
    var isSVGAvailable = require('../../../utils').isSVGAvailable();

    function getTicks(data) {
        // If the data are 7 days print them all, otherwise it is a month so take data
        // each 4 days to print 7 representative days
        return data.length <= 7 ? data : data.filter(function(value, index) {
            return index % 4 === 0;
        });
    }

    /**
     * Line Chart directive.
     *
     * Use lp-chart-options attribute to pass the configuration for the chart. Available options are:
     *
     * {
     *      data: {Array},
     *      height: {number},
     *      width: {number}
     *      padding: {Array[number]},
     *      parsers: {
     *          x : {callback},
     *          y : {callback}
     *      },
     *      formatters: {
     *          y : {callback},
     *          x : {callback},
     *          tooltip : {callback}
     *      },
     *      animation : {
     *          direction : {string}
     *      }
     * }
     *
     * Height, width & padding define the size of the canvas & chart position.
     *
     * Parsers are used to get data from the array, and formatters define axis labels & tooltip.
     *
     * This chart supports animation, you can also define the direction of animation.
     *
     */

    // @ngInject
    exports.lpLineChart = function($window){
        function link(scope, element) {
            var $canvas = element.find('.canvas');
            var svg, graph;

            if (isSVGAvailable) {
                svg = d3.select(element.find('svg')[0]);
                graph = svg.append('g');
            } else {
                $canvas.empty();
                svg = d3.select($canvas[0]).append('svg:svg');
                svg.attr('class', 'chart');
                graph = svg.append('svg:g');
            }

            var x = d3.time.scale();
            var y = d3.scale.linear();

            var config = {
                node: graph,
                xScale: x,
                yScale: y
            };
            var pointsConfig = Object.create(config);

            var axes = axesFactory(config);
            var line = lineFactory(config);
            var points = pointsFactory(pointsConfig).attr('class', 'points');
            var tooltip = isSVGAvailable ? tooltipFactory(config) : null;


            function render() {
                line.render();
                points.render();
                axes.render();
            }

            function resize() {
                var width = $canvas.width();
                var height = config.height || $canvas.height();

                svg.attr('width', width);
                svg.attr('height', height);

                width -= config.padding[1] + config.padding[3];
                height -= config.padding[0] + config.padding[2];

                if (width <= 0) { return; }

                x.range([0, width]);
                y.range([height, 0]);

                axes.resize(width, height);
                if (isSVGAvailable) { tooltip.resize(width, height); }

                render();
            }

            var subscribe = utils.once(function () {
                angular.element($window).on('resize', utils.debounce(resize, 250));
            });

            function update(options) {
                if (!options) { return; }

                utils.assign(config, options);

                x.domain(d3.extent(config.data, config.parsers.x));
                y.domain([
                    Math.min(0, d3.min(config.data, config.parsers.y)),
                    Math.max(0, d3.max(config.data, config.parsers.y))
                ]);

                graph.attr('transform', 'translate(' + config.padding[3] + ',' + config.padding[0] + ')');

                var ticks = getTicks(config.data);

                axes.ticks({
                    x: ticks.map(config.parsers.x),
                    y: 3
                });

                pointsConfig.data = ticks;

                line.duration(2000);
                points.duration(2000);
                resize();
                line.duration(0);
                points.duration(0);

                subscribe();
            }

            scope.$watch('options', update);
        }

        return {
            restrict: 'EA',
            replace: true,
            link: link,
            template: '<div class="lp-line-chart">' +
                        '<div class="canvas"><svg class="chart"></svg></div>' +
                      '</div>',
            scope: {
                options: '=lpChartOptions'
            }
        };
    };
});
