/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';   

    var angular = require('base').ng;

    //@ngInject
    function otpGenerateService($http, lpCoreUtils) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
           
			getOtpValue: function (data) {
				console.log('Rajeev + Satish  =' + data);
					return $http({
						method: 'POST',
						url: config.generateOTPEndPoint,
						data: lpCoreUtils.buildQueryString(data),
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
