define(function (require, exports, module) {
    'use strict';

    module.exports = function (config) {
        var x = config.xScale;
        var y = config.yScale;
        var node = config.node.append('svg:g');
        var barWidth, duration, itemAttr;

        function render() {
            var bars = node.selectAll('rect').data(config.data);

            bars.enter().append('svg:rect');
            bars.exit().remove();

            if (duration > 0) {
                bars = bars.attr({
                        y: y(0),
                        height: 0
                    })
                    .transition()
                    .duration(duration);
            }

            bars.attr({
                width: x.rangeBand || barWidth,
                x: x.rangeBand ?
                    // ordinal scale
                    function (d) {
                        return x(config.parsers.x(d));
                    } :
                    // linear scale
                    function (d) {
                        return x(config.parsers.x(d)) - barWidth / 2;
                    },
                y: function (d) {
                    return Math.min(y(0), y(config.parsers.y(d)));
                },
                height: function (d) {
                    return Math.abs(y(0) - y(config.parsers.y(d)));
                }
            });

            if (itemAttr) {
                bars.attr(itemAttr);
            }
        }

        var api = {
            attr: function (name, val) {
                node.attr(name, val);
                return api;
            },
            barWidth: function (val) {
                barWidth = val;
                return api;
            },
            duration: function (val) {
                duration = val;
                return api;
            },
            itemAttr: function (attr) {
                itemAttr = attr;
                return api;
            },
            render: render
        };

        return api;
    };

});
