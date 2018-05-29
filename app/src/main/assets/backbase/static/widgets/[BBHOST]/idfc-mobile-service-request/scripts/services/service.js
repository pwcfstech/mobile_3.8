/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';   

    var angular = require('base').ng;

    //@ngInject
    function creatServiceRequest($http,lpCoreUtils) { 
        var config = {};
        return { 
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
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
            }
	      };  
    }
    exports.creatServiceRequest = creatServiceRequest;
});
