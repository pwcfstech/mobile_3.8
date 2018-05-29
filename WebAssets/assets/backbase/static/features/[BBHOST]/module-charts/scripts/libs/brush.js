define(function (require, exports, module) {
    'use strict';

    var d3 = require('d3');

    module.exports = function (state) {
        var x = state.xScale;
        var brush = d3.svg.brush().x(x);
        var range;

        var node = state.node
            .append('svg:g')
            .attr('class', 'brush')
            .call(brush);

        var resizers = node.selectAll('.resize');

        var draggables = resizers.append('svg:rect').attr({
            'class': 'drag',
            width: 5,
            x: function (d, i) {
                return i ? 0 : -5.5;
            }
        });

        resizers.append('svg:path').attr('d', function (d, i) {
            return i ? 'M1,16v20M3,16v20' : 'M-2,16v20M-4,16v20';
        });

        function resize(width, height) {
            node.selectAll('rect').attr('height', height);
            draggables.attr({
                height: height / 2,
                y: height / 4
            });
        }

        function render() {
            brush.extent(range);
            node.call(brush);
        }

        var api = {
            on: brush.on,
            range: function (val) {
                if (val) {
                    range = val;
                    return api;
                } else {
                    return brush.empty() ? x.domain() : brush.extent();
                }
            },
            resize: resize,
            render: render
        };

        return api;
    };

});
