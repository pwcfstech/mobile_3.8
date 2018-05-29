/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : Promise.js
 *  Description:
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {
    'use strict';

    require('angular'); // angular from window, it doesn't export
    var angular = window.angular;
    /**
     * Use native Promise or angular $q Service
     */
    module.exports = window.Promise || function($q) {
            var P = angular.extend(function(resolver) {
                var deferred = $q.defer();
                resolver(deferred.resolve, deferred.reject);
                return deferred.promise;
            }, $q);

            P.resolve = function(data) {
                return $q.when(data);
            };

            return P;
        }(angular.injector(['ng']).get('$q'));
});
