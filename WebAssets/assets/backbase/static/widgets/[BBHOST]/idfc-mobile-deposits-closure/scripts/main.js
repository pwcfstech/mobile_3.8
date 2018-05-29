/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: deposits-closure-widget
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'deposits-closure';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
    var idfcUtils = require('idfc-utils-module');

    var deps = [
        core.name,
        ui.name,
        idfcUtils.name
    ];

    /**
     * @ngInject
     */
    function run($http) {
		$http.defaults.headers.get = { 'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache'};
	}

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
        .controller( require('./controllers') )
        .service( require('./models') )
        .run( run );
});
