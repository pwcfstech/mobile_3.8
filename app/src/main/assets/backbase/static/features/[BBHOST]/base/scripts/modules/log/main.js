/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : main.js
 *  Description: Logging system
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {
    'use strict';

    require('angular'); // angular from window, it doesn't export
    var angular = window.angular;
    /**
     * Use Angular $log Service
     */
    module.exports = angular.injector(['ng']).get('$log');

});
