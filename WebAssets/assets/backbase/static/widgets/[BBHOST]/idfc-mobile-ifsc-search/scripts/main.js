/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: Ifsc search
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-ifsc-search';

    // External Dependencies
    var base = require('base');
    var core = require('core');
    var ui = require('ui');
	var contacts = require('module-contacts');

    // Internal Dependencies
    var Model = require('./model');
    var MainCtrl = require('./controllers/controller');

    var deps = [
        core.name,
        ui.name,
		contacts.name
    ];

    /**
     * @ngInject
     */
    function run(lpWidget, lpCoreUtils, lpCoreBus, $http) {
		$http.defaults.headers.get = { 'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache'};
        //lpCoreBus.publish('cxp.item.loaded', {id: 5});
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
	    .service(require('./Services'))
		.directive(require('./directives'))			
        .controller(MainCtrl)
        .factory( 'model', Model )
        .run( run );
});
