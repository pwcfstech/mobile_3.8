define(function (require, exports, module) {
    'use strict';

    var d3 = require('d3');

    module.exports = function (config) {
        var x = config.xScale;
        var y = config.yScale;
        var node = config.node.append('svg:g');

        var area = d3.svg.area()
            .x(function (d) {
                return x(config.parsers.x(d));
            })
            .y(function (d) {
                return y(config.parsers.y(d));
            });

        var path = node.append('svg:path');

        function render() {
            path.datum(config.data)
                .attr('d', area);
        }

        function resize(width, height) {
            area.y0(height);
        }

        var api = {
            attr: function (name, val) {
                node.attr(name, val);
                return api;
            },
            resize: resize,
            render: render
        };

        return api;
    };

});
