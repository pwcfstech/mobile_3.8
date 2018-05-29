/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: pay bill
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-add-biller';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
    var $ = require('jquery');
    var cq = require('idfc-cq');

    var deps = [
        core.name,
        ui.name,
        cq.name
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
