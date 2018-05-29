/**
 * Models
 * @module models
 */
define(function (require, exports) {

    'use strict';

    var angular = require('base').ng;

    //@ngInject
    function TravelInsuranceService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            travelInsuranceBenefitsService : function (postData) {
                return $http({
                    method: 'POST',
                    url: config.getTravelInsuranceBenefitsEndPoint,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            }
        };
    }
    exports.TravelInsuranceService = TravelInsuranceService;
});
