define(function(require, exports) {
	'use strict';

	var angular = require('base').ng;

	//@ngInject
	function FundTransferServices($http) {
		this.config = {};
		this.$http = $http;
	}

	FundTransferServices.prototype = {
		setup: function(config) {
			this.config = angular.extend(this.config, config);
			return this;
		},

		checkForTanking: function(tankingDataForm) {
			return this.$http({
				method: 'POST',
				url: this.config.tankingEndPoint,
				data: tankingDataForm,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		}

	};


	exports.FundTransferServices = FundTransferServices;
});
