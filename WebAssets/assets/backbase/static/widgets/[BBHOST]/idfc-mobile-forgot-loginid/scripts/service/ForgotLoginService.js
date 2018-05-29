/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';   

    var angular = require('base').ng;

    //@ngInject
    function forgotLoginService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            debitCardNumberService: function () {
                return $http({
                    method: 'POST',
					url: config.debitCardNumberServiceURL,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			verifyCardBinService: function () {
                return $http({
                    method: 'GET',
					url: config.verifyCardBinServiceURL,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			customerIDService12: function () {
                return $http({
                    method: 'POST',
					url: config.customerIDServiceURL,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			customerIDService34: function () {
                return $http({
                    method: 'POST',
					url: config.customerIDService,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			forgotLoginIdService: function () {
                return $http({
                    method: 'POST',
					url: config.forgotLoginIdServiceURL,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			generateOTPService: function () {
                return $http({
                    method: 'POST',
					url: config.generateOTPServiceURL,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			verifyOTPService: function () {
                return $http({
                    method: 'POST',
					url: config.verifyOTPServiceURL,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			accountNumberService: function () {
                return $http({
                    method: 'POST',
					url: config.accountNumberServiceURL,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
            loanNumberService: function () {
                return $http({
                    method: 'POST',
					url: config.loanNumberServiceURL,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            }
			
	      };
    }
    exports.forgotLoginService = forgotLoginService;

});
