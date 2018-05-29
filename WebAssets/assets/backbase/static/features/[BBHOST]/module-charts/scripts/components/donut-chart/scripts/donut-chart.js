define(function(require, exports, module) {
    'use strict';

    var base = require('base');
    var angular = base.ng;
    var utils = base.utils;
    var $ = require('jquery');
    var d3 = require('d3');
    var chartUtils = require('../../../utils');
    var isSVGAvailable = require('../../../utils').isSVGAvailable();

    function color(d) {
        return d.data.color;
    }

    function radiansToDegree(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Donut Chart directive
     */

    // @ngInject
    exports.lpDonutChart = function ($window) {
        function link(scope, element) {
            scope.options = utils.assign({}, scope.options);
            var animationDirectionReverse = scope.options.animationDirection === 'anticlockwise';
            var arcGenerator = d3.svg.arc();

            var pie = d3.layout.pie()
                .sort(null)
                .value(function (d) {
                    return d.amount;
                });

            var canvases = element.find('svg');
            if(!isSVGAvailable) {
                element.empty();
            }
            var canvas = canvases.length && isSVGAvailable ? d3.select(canvases[0]) : d3.select(element[0]).append('svg:svg');

            var svg = canvas.append('svg:g');
            svg.append('svg:g').attr('class', 'arcs');
            svg.append('svg:g').attr('class', 'arrow-group').append('svg:path').attr({
                'class': 'arrow',
                fill: 'none'
            });

            var size;
            function resize() {
                var parent = element.parent();
                var maxHeight = parseInt(element.css('max-height'), 10);
                var s = maxHeight ? Math.min(maxHeight, parent.innerWidth()) : parent.innerWidth();
                if (s <= 0) { return; }

                var margins = element.outerWidth(true) - element.outerWidth();
                size = s - margins;

                element
                    .width(size)
                    .height(size);

                element.find('svg')
                    .width(size)
                    .height(size);
                if (scope.onResize) { scope.onResize(size, size); }

                var radius = size / 2;
                var innerRadius = radius * 0.55;
                arcGenerator
                    .outerRadius(radius)
                    .innerRadius(innerRadius);

                svg.select('.arcs').selectAll('.arc').attr('d', arcGenerator);
                svg.attr('transform', 'translate(' + radius + ',' + radius + ')');

                var unitSize = size / 20;
                svg.select('.arrow').attr({
                    transform: 'translate(0,' + -0.85 * innerRadius + ')',
                    d: 'M0,0 l-' + 0.5 * unitSize + ',-' + 0.866 * unitSize + ' l' + unitSize + ',0'
                });
            }

            function selectItem(data) {
                if (!data) { return; }

                var categoryArc = svg.selectAll('.arc').filter(function (arc) {
                    return arc.data === data;
                });

                if (categoryArc[0].length > 0) {
                    var datum = categoryArc.datum();

                    svg.select('.arrow').attr({
                        fill: data.color
                    });

                    svg.selectAll('.arrow-group').attr({
                        transform: 'rotate(' + radiansToDegree((datum.endAngle + datum.startAngle) / 2) + ')'
                    });
                }

                if (scope.onSelect) { scope.onSelect(data); }
            }

            var prevState;

            function arcTween(a) {
                var i = d3.interpolate(this.current, a);
                this.current = i(0);
                return function (t) {
                    return arcGenerator(i(t));
                };
            }

            function render() {
                if (!isSVGAvailable) {
                    element.empty();
                }
                canvas = canvases.length && isSVGAvailable ? d3.select(canvases[0]) : d3.select(element[0]).append('svg:svg');

                if (!isSVGAvailable) {
                    svg = canvas.append('svg:g');
                    svg.append('svg:g').attr('class', 'arcs');
                    svg.append('svg:g').attr('class', 'arrow-group').append('svg:path').attr({
                        'class': 'arrow',
                        fill: 'none'
                    });
                }

                var data = scope.options.data;
                if (!size || !data || !data.length) { return; }

                if (!prevState) {
                    prevState = data.map(function (d) {
                        return {
                            color: d.color,
                            amount: Number.MIN_VALUE
                        };
                    });

                    prevState[animationDirectionReverse ? 'unshift' : 'push']({
                        color: 'none',
                        amount: Number.MAX_VALUE
                    });
                }

                var currState = data.concat();

                while (currState.length < prevState.length) {
                    currState[animationDirectionReverse ? 'unshift' : 'push']({
                        color: 'none',
                        amount: Number.MIN_VALUE
                    });
                }
                while (data.length > prevState.length) {
                    prevState[animationDirectionReverse ? 'push' : 'unshift']({
                        color: '#fff',
                        amount: Number.MIN_VALUE
                    });
                }

                var arc = svg.select('.arcs').selectAll('.arc').data(pie(prevState));

                prevState = data.concat();

                arc.enter().append('svg:path')
                    .attr('class', 'arc')
                    .on('click', utils.compose(selectItem, utils.property('data')));

                arc.attr('d', arcGenerator)
                    .style('fill', color)
                    .each(function (d) {
                        this.current = d;
                    });

                arc.exit().remove();

                if (!isSVGAvailable) {
                    $('.category-spendings-chart>div').height(size);
                }

                var duration = scope.options.animation || 500;

                arc.data(pie(currState)).transition().duration(duration)
                    .attrTween('d', arcTween)
                    .style('fill', color)
                    .call(chartUtils.endAll, function () {
                        // Selecting largest item:
                        selectItem(data[data.length - 1]);
                    });
            }

            angular.element($window).on('resize', utils.debounce(resize, 250));
            scope.$watch('options', function () {
                resize();
                render();
            });
            scope.$watch('item', selectItem);
        }

        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            link: link,
            scope: {
                item: '=',
                onSelect: '=',
                onResize: '=',
                options: '='
            },
            template: '<div ng-transclude></div>'
        };
    };
});
