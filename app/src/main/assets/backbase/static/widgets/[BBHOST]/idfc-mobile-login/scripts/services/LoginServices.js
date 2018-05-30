define(function(require, exports) {
/*
    'use strict';
*/

    var angular,
        commonHeaders;

    angular = require('base').ng;
    commonHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    };

    //@ngInject
    exports.LoginService = function($http, lpCoreUtils) {
        var config = {};
        return {
            setup: function(localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },

            preLoginChk: function(data) {
                return $http({
                    method: 'POST',
                    url: config.profileChkEndpoint,
                    data: lpCoreUtils.buildQueryString(data),
                    headers: commonHeaders
                });
            },
            login: function(data) {
                return $http({
                    method: 'POST',
                    url: config.loginEndpoint + '?rd=' + new Date().getTime(),
                    data: lpCoreUtils.buildQueryString(data),
                    headers: commonHeaders
                });
            },
            lockSMS: function() {
                return $http({
                    method: 'GET',
                    url: config.lockSMSEndpoint,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            },
            preLoginChk: function (data) {
                              return $http({
                                  method: 'POST',
                                  url: config.profileChkEndpoint,
                                  data: lpCoreUtils.buildQueryString(data),
                                  headers: commonHeaders
                              });
                          },
                           notifyLoginFailRSA: function (data) {
                                          return $http({
                                              method: 'POST',
                                              url: config.rsaLoginFailNotifyEndpoint,
                                              data: lpCoreUtils.buildQueryString(data),
                                              headers: commonHeaders
                                          });
                                      }

        };
    };
});