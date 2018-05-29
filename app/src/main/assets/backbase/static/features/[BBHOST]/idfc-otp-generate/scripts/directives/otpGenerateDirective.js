define(function(require, exports, module) {
	'use strict';
	var $ = require('jquery');
	exports.otpGenerate = function() {
		return {
			restrict : 'E',
			replace: true,
			controller: 'otpGenerateController',
			templateUrl : '/portalserver/static/launchpad/modules/idfc-otp-generate/templates/directives/otpGenerateDirective.html'
			
			
		};
	};
});
