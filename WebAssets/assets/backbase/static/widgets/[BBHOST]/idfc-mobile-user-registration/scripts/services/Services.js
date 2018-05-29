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
		loadUcicAuthentication: function() {
			return this.$http({
				method: 'POST',
				url: this.config.authenticateUCICEndpoint,
				data: this.config.postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		validateDebitAccount: function() {
			return this.$http({
				method: 'POST',
				url: this.config.debitAccountServiceEndpoint,
				data: this.config.postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		validateDebitCard: function() {
			return this.$http({
				method: 'POST',
				url: this.config.debitCardServiceEndpoint,
				data: this.config.postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		generateOtp: function() {
			return this.$http({
				method: 'POST',
				url: this.config.generateOTPServiceURL,
				data: this.config.generateOtpPostData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		verifyOtp: function() {
			return this.$http({
				method: 'POST',
				url: this.config.verifyOTPServiceURL,
				data: this.config.verifyOtpPostData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		register: function() {
			return this.$http({
				method: 'POST',
				url: this.config.registerUserServiceEndpoint,
				data: this.config.postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		checkAvailability: function() {
			return this.$http({
				method: 'POST',
				url: this.config.userNameServiceEndpoint,
				data: this.config.postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		},
		loadList: function() {
			this.$http({
				method: 'POST',
				url: this.config.cardBinListServiceEndpoint,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			}).success(function(data, status, headers, config) {
				return data;
			});
		},
        /* PwC Neha Chandak*/
        	validateLoanAccount: function() {
			return this.$http({
				method: 'POST',
				url: this.config.loanAccountServiceEndpoint,
				data: this.config.postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
		}
        /*PwC Neha Chandak */
	};
	exports.Services = Services;
});
