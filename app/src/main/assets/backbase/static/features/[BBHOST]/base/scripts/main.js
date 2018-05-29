/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : main.js
 *  Description: Base library for creating Launchpad components/widgets/modules
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {

    'use strict';

    var config = require('./config'); /// Launchpad configuration
    var global = window;
    var NS = config.NS;
    // Create the global launchpad object is doesn't exists
    global[NS] = global[NS] || {};
    /*----------------------------------------------------------------*/
    /* Launchpad NameSpace
    /*----------------------------------------------------------------*/
    exports.NS = NS;
    /*----------------------------------------------------------------*/
    /* 3rd parties
    /*----------------------------------------------------------------*/
    exports.$ = require('jquery'); // @todo export $.noConflict();
    require('angular');// angular from window, it doesn't export
    exports.ng = window.angular; // export angular

    /*----------------------------------------------------------------*/
    /* Modules
    /*----------------------------------------------------------------*/
    exports.utils = require('./modules/utils/main'); // lodash + custom utils;
    exports.bus = require('./modules/bus/main');
    exports.Promise = require('./modules/async/Promise');
    exports.fetch = require('./modules/async/fetch');
    exports.log = require('./modules/log/main');
    exports.error = require('./modules/error/main');
    exports.queue = require('./modules/queue/main');
    exports.notification = require('./modules/notifications/main');

   /*----------------------------------------------------------------*/
   /* Extensions
   /*----------------------------------------------------------------*/
    exports.Widget = require('./modules/b$-extension/widget');
    exports.portal = require('./modules/portal/portal');

    /*----------------------------------------------------------------*/
    /* Public utility libraries
    /*----------------------------------------------------------------*/
    exports.startPortal = require('./libs/start-portal');
    exports.getWidgetsInfo = require('./libs/get-widgets-info');
    exports.createModule = require('./libs/create-module');
    exports.performance = require('./modules/performance/performance');

    /*----------------------------------------------------------------*/
    /* Helpers
    /*----------------------------------------------------------------*/
    exports.requireWidget = global.requireWidget || require('./require-widget');

    /*----------------------------------------------------------------*/
    /* Angular related functions
    /*----------------------------------------------------------------*/
     /**
     * Angular Boostrap alias
     * @param  {HTMLElement} el   DOM element
     * @param  {Array} deps angular dependencies
     * @todo move to the ng module
     * @example
     * base.bootstrap( DOMNODE, [angular, dependencies])
     * @return {object}
     */

    exports.bootstrap = function(el, deps) {
        return exports.ng.bootstrap(el, deps);
    };
    /**
     * Angular DI helper
     * @param  {string} lib    Recuired library
     * @param  {string} moduleName Module name default is ng
     * @example
     * <pre>
     *    var utils = base.inject('lpCoreUtils', require('core').name);
     *    var fetch = base.inject('$http');
     * </pre>
     * @return {object}        Required library
     * @todo move to the ng module
     */
    exports.inject = function(lib, moduleName) {
        var deps = ['ng'];
        if(!exports.utils.isEmpty(moduleName)){
            // get angular default module
            deps.push(moduleName);
        }
        return exports.ng.injector(deps).get(lib);
    };
});
