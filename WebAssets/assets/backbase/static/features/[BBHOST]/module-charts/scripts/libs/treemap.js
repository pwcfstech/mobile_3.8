define(function (require, exports, module) {
    'use strict';

    var d3 = require('d3');

    var style = {
        left: function (d) {
            return d.x + 'px';
        },
        top: function (d) {
            return d.y + 'px';
        },
        width: function (d) {
            return Math.max(0, d.dx) + 'px';
        },
        height: function (d) {
            return Math.max(0, d.dy) + 'px';
        }
    };
    style['line-height'] = style.height;

    module.exports = function (state) {
        var node = state.node.append('div');
        var itemAttr, on;

        function sorter(a, b) {
            return state.parser(a) - state.parser(b);
        }

        var treemap = d3.layout.treemap()
            .sort(sorter)
            .value(state.parser);

        function resize(width, height) {
            treemap.size([width, height]);
        }

        function render() {
            if (!state.data) { return; }

            var items = node.datum(state.data)
                .selectAll('.node')
                .data(treemap.nodes);

            items.enter().append('div');
            items.exit().remove();

            items
                .style(style)
                .html(state.formatter);

            if (itemAttr) {
                items.attr(itemAttr);
            }

            if (on) {
                items.on(on);
            }

            items.classed('node', true);
        }

        var api = {
            attr: function (name, val) {
                node.attr(name, val);
                return api;
            },
            itemAttr: function (attr) {
                itemAttr = attr;
                return api;
            },
            on: function (attr) {
                on = attr;
                return api;
            },
            resize: resize,
            render: render
        };

        return api;
    };

});
