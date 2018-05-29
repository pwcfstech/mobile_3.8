/**
 * Models
 * @module models
 */
define(function (require, exports) {

    'use strict';

    var angular = require('base').ng;

    //@ngInject
    function LifeInsuranceService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            lifeInsuranceGetQuoteService: function (postData) {
                return $http({
                    method: 'POST',
                    url: config.getLifeInsuranceQuoteEndPoint,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            }
        };
    }
    exports.LifeInsuranceService = LifeInsuranceService;
});
