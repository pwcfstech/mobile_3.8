/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';   

    var angular = require('base').ng;

    //@ngInject
    function otpGenerateService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
           
			getOtpValue: function (data) {
					return $http({
						method: 'POST',
						url: config.generateOTPEndPoint,
						data: config.postData,
						headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/x-www-form-urlencoded;'
						}
					});
			}
			
	      };
    }
    exports.otpGenerateService = otpGenerateService;
});
