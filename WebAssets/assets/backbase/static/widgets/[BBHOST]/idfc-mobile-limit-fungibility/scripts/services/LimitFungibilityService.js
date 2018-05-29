/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';   

    var angular = require('base').ng;

    //@ngInject
    function limitFungibilityService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            getTransferLimit: function (data) {
                return $http({
					method: 'GET',
					url: config.getTransferLimitEndPoint,
					data: null,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			setTransferLimit: function (data) {
					return $http({
						method: 'POST',
						url: config.setTransferLimitEndPoint,
						data: config.postData,
						headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/x-www-form-urlencoded;'
						}
					});
			},
			generateOTP: function (data) {
				return $http({
					method: 'POST',
					url:  config.generateOTPEndPoint,
					data: config.postData,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			},
			flagChange: function (data) {
				return $http({
					method: 'POST',
					url:  config.limitChangeEndPoint,
					data: config.postData,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			}
	      };
    }
    exports.limitFungibilityService = limitFungibilityService;
});
