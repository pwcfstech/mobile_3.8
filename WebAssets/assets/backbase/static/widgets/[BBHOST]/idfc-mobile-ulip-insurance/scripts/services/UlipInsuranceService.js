/**
 * Models
 * @module models
 */
define(function (require, exports) {

    'use strict';

    var angular = require('base').ng;

    //@ngInject
    function UlipInsuranceService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            ulipInsuranceGetQuoteService: function (postData) {
                return $http({
                    method: 'POST',
                    url: config.getUlipInsuranceQuoteEndPoint,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            }
        };
    }
    exports.UlipInsuranceService = UlipInsuranceService;
});
