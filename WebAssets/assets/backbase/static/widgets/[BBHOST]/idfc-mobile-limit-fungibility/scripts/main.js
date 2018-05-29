/**
 *  ----------------------------------------------------------------
 *  Copyright © IDFC BANK
 *  Filename : main.js
 *  Description: Provides user to manage the daily transfer limit.
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-limit-fungibility';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
	//var otpGenerate = require('idfc-otp-generate');
	var errorSpin = require('idfc-error-spin');
	var idfcUtils = require('idfc-utils-module');
	//var refresh = require('idfc-refresh-module');
	var piechart  = require('n3-pie-chart')
    var cq = require('idfc-cq');

    var deps = [
        core.name,
        ui.name,
		//otpGenerate.name,
		errorSpin.name,
		idfcUtils.name,
		'uiSwitch',
		'ngTouch',
		//refresh.name,
        'n3-pie-chart',
         cq.name
    ];

    // @ngInject
    function run($http) {
		$http.defaults.headers.get = { 'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache'};
	}

    module.exports = base.createModule(module.name, deps)
        .controller(require('./controllers/controller'))
		.service(require('./services/LimitFungibilityService'))
        .run(run);
});
