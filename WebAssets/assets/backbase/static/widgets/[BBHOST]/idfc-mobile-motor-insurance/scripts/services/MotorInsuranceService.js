/**
 * Models
 * @module models
 */
define(function (require, exports) {

    'use strict';

    var angular = require('base').ng;

    //@ngInject
    function MotorInsuranceService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            motorInsuranceBenefitsService : function (postData) {
                return $http({
                    method: 'POST',
                    url: config.getMotorInsuranceBenefitsEndPoint,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            }
        };
    }
    exports.MotorInsuranceService = MotorInsuranceService;
});
