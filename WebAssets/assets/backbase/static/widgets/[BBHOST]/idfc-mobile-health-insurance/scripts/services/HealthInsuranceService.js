/**
 * Models
 * @module models
 */
define(function (require, exports) {

    'use strict';

    var angular = require('base').ng;

    //@ngInject
    function HealthInsuranceService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            healthInsuranceBenefitsService : function (postData) {
                return $http({
                    method: 'POST',
                    url: config.getHealthInsuranceBenefitsEndPoint,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            }
        };
    }
    exports.HealthInsuranceService = HealthInsuranceService;
});
