/**
 * ---------------------------------------------------------------- Copyright ©
 * Backbase B.V.
 * ---------------------------------------------------------------- Filename :
 * main.js Description: user registration
 * ----------------------------------------------------------------
 */
define(function(require, exports, module) {
	'use strict';
	module.name = 'idfc-user-registration';
	
	var base = require('base');
	var core = require('core');
	var ui = require('ui');
	var idfcutils = require('idfc-utils-module');
	var refresh = require('idfc-refresh-module');
	
	var deps = [ 
		core.name, 
		ui.name,
		idfcutils.name,
		refresh.name
	];
	/**
	 * @ngInject
	 */
	function run($http) {
		$http.defaults.headers.get = {
			'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT',
			'Cache-Control': 'no-cache',
			'Pragma': 'no-cache'
		};
	}
	module.exports = base.createModule(module.name, deps).constant(
			'WIDGET_NAME', module.name).controller(require('./controllers/controllers'))
			.service(require('./services/Services')).run(run);
});
