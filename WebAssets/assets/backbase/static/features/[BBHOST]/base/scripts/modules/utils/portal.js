define(function(require, exports, module) {
    'use strict';

    var _ = require('lodash');

    /**
     * Replace all portal placeholders
     * @param  {string} string Template used
     * @return {string}        Resolved string
     * @todo
     *     - pass in the resolver as well so is more flexible
     *     - move to portal module as utility
     */
    exports.resolvePortalPlaceholders = function(string) {
        var replaceWith = _.get(window, 'b$.portal.config.serverRoot', '');
        if ( _.isString(string) ) {
            var replacements = [
                '$(contextRoot)',
                '$(contextPath)',
                '$(servicesPath)'
            ];
            string = _.reduce(replacements, function(str, replace) {
                return str.replace(replace, replaceWith);
            }, string);
        }
        return string;
    };

});
