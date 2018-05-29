define(function(require, exports, module) {
	'use strict';
	var $ = require('jquery');
	exports.errorSpin = function() {
		return {
			restrict : 'E',
			 scope:{
				data: '='
			},
			templateUrl : '/static/launchpad/modules/idfc-error-spin/templates/directives/errorSpin.html'
			
		};
	};
});
