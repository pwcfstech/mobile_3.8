 define(function(require, exports, module) {

    'use strict';

    var _ = require('lodash');

    /**
     * use to warn for deprecated methods
     * @return console warn and calls the aliased function
     */
    exports.deprecate = function(fn, tpl, data) {

        var NODEP = window.launchpad && window.launchpad.config && window.launchpad.config.usemin;
        if (NODEP) {
            return fn;
        }

        var warned = false;

        function warn(msg) {
            var compiled = _.template(msg);
            var c = window.console;
            var warning = compiled(data);

            if (!warned && _.isObject(c) ) {
                c.warn(warning);
                warned = true;
            }
        }

        function deprecated() {
            warn(tpl);
            return fn.apply(this, arguments);
        }

        return (_.isString(fn) || !NODEP) ? warn(fn) : deprecated;
    };

});
