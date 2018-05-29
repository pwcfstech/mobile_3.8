/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : main.js
 *  Description: Offer users single location to manage and interact with their (finance related) contacts.
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module){

    'use strict';

    module.name = 'widget-addressbook';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');


    var contacts = require('module-contacts');
    var cq = require('idfc-cq');

    var deps = [
        core.name,
        ui.name,
        contacts.name,
        cq.name
    ];

	function run(lpWidget, lpCoreUtils, lpCoreBus, $http) {
		$http.defaults.headers.get = { 'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache'};

        lpCoreBus.publish('cxp.item.loaded', {id: 5});
    }

    module.exports = base.createModule(module.name, deps)
	    .service(require('./Services'))
		.directive(require('./directives'))		
        .controller(require('./controllers'))
        .run(run);
});
