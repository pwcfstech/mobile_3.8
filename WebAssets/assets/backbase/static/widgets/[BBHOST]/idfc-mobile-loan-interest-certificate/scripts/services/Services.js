define(function(require, exports) {
	'use strict';
	var angular = require('base').ng;
	// @ngInject
	function Services($http) {
		this.config = {};
		this.$http = $http;
	}
	Services.prototype = {
		setup: function(config) {
			this.config = angular.extend(this.config, config);
			return this;
		},
		loadLoanAcctList: function() {
			return this.$http({
				method: 'GET',
				url: this.config.loanAccountListUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		loadLoanIntCert: function() {
			return this.$http({
				method: 'POST',
				url: this.config.getloanInterestCertificate,
				data: this.config.postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		loadPDF: function() {
			return this.$http({
				method: 'POST',
				url: this.config.pdfUrl,
				data: this.config.postData,
				responseType: 'arraybuffer',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		}
	};
	exports.Services = Services;
});
