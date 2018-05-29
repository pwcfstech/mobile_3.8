define(function (require, exports, module) {
    'use strict';

    var d3 = require('d3');

    function setTicks(axis, ticks) {
        if (ticks !== undefined) {
            axis[Array.isArray(ticks) ? 'tickValues' : 'ticks'](ticks);
        }
    }

    module.exports = function (config) {
        var node = config.node;

        var xAxis = d3.svg.axis()
            .scale(config.xScale)
            .tickPadding(10)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(config.yScale)
            .tickPadding(10)
            .orient('left');

        var xAxisNode = node.append('svg:g').attr('class', 'x axis');
        var yAxisNode = node.append('svg:g').attr('class', 'y axis');

        function render() {
            xAxis.tickFormat(config.formatters.x);
            yAxis.tickFormat(config.formatters.y);

            xAxisNode.call(xAxis);
            yAxisNode.call(yAxis);
        }

        function resize(width, height) {
            xAxis.tickSize(-height);
            yAxis.tickSize(-width);
            xAxisNode.attr('transform', 'translate(0,' + height + ')');
        }

        var api = {
            x: xAxis,
            y: yAxis,
            ticks: function (ticks) {
                setTicks(xAxis, ticks.x);
                setTicks(yAxis, ticks.y);
                return api;
            },
            resize: resize,
            render: render
        };

        return api;
    };

});
