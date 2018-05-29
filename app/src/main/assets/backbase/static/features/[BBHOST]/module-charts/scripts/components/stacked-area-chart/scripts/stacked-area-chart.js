define(function(require, exports, module) {
    'use strict';

    var base = require('base');
    var angular = base.ng;
    var utils = base.utils;
    var d3 = require('d3');
    var axesFactory = require('../../../libs/axes');
    var stackFactory = require('../../../libs/stack');

    /**
     * Stacked Area Chart directive.
     *
     * Use the 'options' attribute to pass the configuration for the chart. Available options are:
     *
     * {
     *      data: {Array},
     *      parsers: {
     *          x: {Function},
     *          y: {Function}
     *      },
     *      formatters: {
     *          x: {Function},
     *          y: {Function}
     *      }
     * }
     *
     * Parsers are used to get data from the array, and formatters define axis labels.
     */

    // @ngInject
    exports.lpStackedAreaChart = function($window){
        function link(scope, element) {
            var svg = d3.select(element.find('svg')[0]);
            var graph = svg.append('g');

            var x = d3.time.scale();
            var y = d3.scale.linear();

            var state = {
                node: graph,
                xScale: x,
                yScale: y
            };

            var stack = stackFactory(state).itemAttr({
                class: function (d, i) {
                    return 'item-' + i;
                }
            });

            var axes = axesFactory(state);
            axes.x.tickPadding(-20);

            function render() {
                if (!state.formatters) { return; }
                axes.render();
                stack.render();
            }

            function resize() {
                var width = element.innerWidth(),
                    height = element.innerHeight();
                if (width <= 0 || height <= 0) {
                    return;
                }

                svg.attr({
                    width: width,
                    height: height
                });
                x.range([0, width]);
                y.range([0, height]);
                axes.resize(width, height);

                render();
            }

            function update(options) {
                if (!options) { return; }
                utils.assign(state, options);
                x.domain(d3.extent(options.data, state.parsers.x));
                var max = d3.max(options.data, utils.flow(state.parsers.y, d3.values, d3.sum));
                y.domain([0, max]);
                stack.set(options.data);
                render();
            }

            resize();

            angular.element($window).on('resize', utils.debounce(resize, 250));
            scope.$watch('options', update);
        }

        return {
            restrict: 'EA',
            replace: true,
            link: link,
            template: '<div class="lp-stacked-area-chart"><svg></svg></div>',
            scope: {
                options: '=options'
            }
        };
    };
});
