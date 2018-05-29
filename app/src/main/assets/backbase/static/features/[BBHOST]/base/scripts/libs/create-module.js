/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : create-module.js
 *  ----------------------------------------------------------------
 */
/**
 * Create angular module
 * @param  {string} name Module name
 * @param  {array} deps Module dependencies
 * @return {object}      Angular module
 */
define(function(require, exports, module) {

    'use strict';

    var NS = require('../config').NS;
    require('angular'); // angular from window, it doesn't export
    var angular = window.angular;
    /**
     * Check if module with `name` exists.
     * TODO: Make a better check using decorated version of the angular.module that would store registered modules.
     * @param name {string}
     * @returns {boolean}
     */
    var moduleRegistered = function(name) {
        try {
            angular.module(name);
        }
        catch (e) {
            return false;
        }
        return true;
    };

    module.exports = function(name, deps) {

        name = [NS, name].join('.');

        var ngModule;

        // Inject templates module only into widgets modules.
        if (name.indexOf('widget-') > -1) {

            var templatesModuleName = name + '.templates';

            if (moduleRegistered(templatesModuleName)) {

                deps.push(templatesModuleName);

                // Create templateCacheInjector service
                ngModule = angular.module(name, deps);

                // @ngInject
                ngModule.factory('templateCacheInjector', function($templateCache, lpCoreTemplate) {
                    return {
                        put: function(key, value) {
                            key = lpCoreTemplate.resolvePath(key);
                            return $templateCache.put(key, value);
                        }
                    };
                });
            }
            else {
                ngModule = angular.module(name, deps);
            }
        }
        else {
            ngModule = angular.module(name, deps);
        }

        return ngModule;
    };
});
