/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';   

    var angular = require('base').ng;

    //@ngInject
    function viewProfileDetails($http, lpCoreUtils) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            /*getprofileDetails: function () {
                return $http({
                    method: 'GET',
					url: config.urlProfileDetailsEndpoint,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			  pinNumberService: function (data) {
                return $http({
                    method: 'POST',
                    url: config.getPinMasterListsURL,
                    data: lpCoreUtils.buildQueryString(data),
                   headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			createServiceRUrl: function (data) {
				return $http({
					method: 'POST',
					url: config.createSRUrlEndPoint,
					data: config.postData,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			},
			getStateCategoryMasterListsService: function (data) {
                return $http({
                    method: 'POST',
					url: config.getStateCategoryMasterListsURL,
					data: lpCoreUtils.buildQueryString(data),
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
                });
            },
			savingAccount: function (data) {
				return $http({
					method: 'GET',
					url: config.savingAccountUrlEndPoint,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			},
			getOtpValue: function (data) {
				return $http({
					method: 'POST',
					url: config.otpValueEndPoint,
					data: config.postData,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			},*/
			
            validateDetails: function() {
                return $http({
                    method: 'POST',
                    url: config.urlOtpEndPoint,
                    data: config.data,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            },
            getTokenUrl: function () {  
				return $http({   
					method: 'GET',           
					url: config.tokenEndPoint,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});   
            }
	      };
    }
    exports.viewProfileDetails = viewProfileDetails;
});
