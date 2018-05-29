define(function (require, exports, module) {
    'use strict';

    var d3 = require('d3');

    function parse(data, parsers) {
        function layer(name) {
            return {
                name: name,
                data: data.map(function (d) {
                    return {
                        x: parsers.x(d),
                        y: parsers.y(d)[name]
                    };
                })
            };
        }

        return Object.keys(parsers.y(data[0])).map(layer);
    }

    function getData(d) {
        return d.data;
    }

    module.exports = function (state) {
        var x = state.xScale;
        var y = state.yScale;
        var node = state.node.append('svg:g');
        var data, itemAttr;

        var stack = d3.layout.stack().values(getData);

        var area = d3.svg.area()
            .x(function (d) {
                return x(d.x);
            })
            .y0(function (d) {
                return y(d.y0);
            })
            .y1(function (d) {
                return y(d.y0 + d.y);
            });

        function path(d) {
            return area(getData(d));
        }

        function render() {
            if (!data) { return; }

            var items = node.selectAll('path').data(data);

            items.enter().append('svg:path');
            items.exit().remove();

            items.attr('d', path);

            if (itemAttr) {
                items.attr(itemAttr);
            }
        }

        var api = {
            set: function (d) {
                data = stack(parse(d, state.parsers));
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
