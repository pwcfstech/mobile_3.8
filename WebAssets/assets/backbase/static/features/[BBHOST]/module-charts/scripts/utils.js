define(function (require, exports, module) {
    'use strict';

    var d3 = require('d3');

    var utils = {};

    utils.isSVGAvailable = function() {
        return document.implementation && document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1');
    };

    utils.endAll = function (transition, callback) {
        var size = typeof transition.size === 'function'
            ? transition.size()
            : transition.length ? transition.length : 0;
        if (size === 0) {
            callback();
            return;
        }

        var n = 0;
        transition
            .each(function () { ++n; })
            .each('end', function () { if (!--n) { callback.apply(this, arguments); } });
    };

    utils.ticks = function () {
        var FACTORS = [2, 3, 4, 6];
        var width = 0;
        var size = 50;
        var step = function (date, offset) {
            date.setMonth(date.getMonth() + offset);
        };

        var main = function (t0, t1) {
            for (var time = d3.time.month.ceil(t0), times = []; time < t1; step(time, 1)) {
                times.push(new Date(+time));
            }

            var i;
            var evenMonth = function (d) {
                return d.getMonth() % FACTORS[i] === 0;
            };
            var maxCount = Math.floor(width / size);
            for (i = 0; times.length > maxCount; i++) {
                times = times.filter(evenMonth);
            }

            return times;
        };

        main.width = function (w) {
            width = w;
        };

        main.size = function (s) {
            size = s;
        };

        main.step = function (stepFn) {
            step = stepFn;
        };

        return main;
    };

    module.exports = utils;

});
