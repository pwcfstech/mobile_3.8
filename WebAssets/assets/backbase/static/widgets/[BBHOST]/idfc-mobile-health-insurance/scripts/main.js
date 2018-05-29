/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: idfc-health-insurance
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-health-insurance';

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
    function run() {
        // Module is Bootstrapped
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
		.controller(require('./controllers/HealthInsuranceControllers'))
        .service(require('./services/HealthInsuranceService'))
        .run( run );
});
