define(function (require, exports, module) {
    'use strict';

    var d3 = require('d3');

    function animatePath(path, duration, direction) {
        var node = path.node();

        // doesn't work in ie8 (r2d3 doesn't support getTotalLength on path.node())
        if (typeof node.getTotalLength !== 'function') { return; }

        var length = node.getTotalLength();
        path
            .attr('class', 'line')
            .attr('stroke-dasharray', length + ' ' + length)
            .attr('stroke-dashoffset', direction === 'right' ? length : -length)
            .transition()
            .duration(duration)
            .attr('stroke-dashoffset', 0);
    }

    module.exports = function (config) {
        var x = config.xScale;
        var y = config.yScale;
        var node = config.node.append('svg:g');
        var duration;

        var line = d3.svg.line()
            .x(function (d) {
                return x(config.parsers.x(d));
            })
            .y(function (d) {
                return y(config.parsers.y(d));
            });

        var path = node
            .append('svg:path')
            .attr('class', 'line');

        function render() {
            path.datum(config.data)
                .attr('d', line);

            animatePath(path, duration, config.animation && config.animation.direction);
        }

        var api = {
            duration: function (val) {
                duration = val;
                return api;
            },
            render: render
        };

        return api;
    };

});
