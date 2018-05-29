/**
 * Models
 * @module models
 */
define(function(require, exports) {

    'use strict';

    var angular = require('base').ng;

    //@ngInject
    function loanSummaryService($http) {
        var config = {};
        return {
            setup: function(localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
            loanAcctListService: function() {
                return $http({
                    method: 'GET',
                    url: config.loanAcctListURL,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                })
            },
            loanAcctDetailsService: function() {
                return $http({
                    method: 'POST',
                    url: config.loanAccDetailRequestURL,
                    data: config.data,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            }
        };
    }
    exports.loanSummaryService = loanSummaryService;

});
