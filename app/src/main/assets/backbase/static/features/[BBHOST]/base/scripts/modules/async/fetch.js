/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : fetch.js
 *  Description:
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {
    'use strict';

    require('angular'); // angular from window, it doesn't export
    var angular = window.angular;
    var xsrf = (function () {
        var requestHeaderName = 'X-BBXSRF';
        var cookieName = 'BBXSRF';

        return {
            getToken: getToken,
            getRequestHeaderName: getRequestHeaderName
        };

        function getToken () {
            var value = '; ' + document.cookie,
                parts = '',
                cookie = getCookieName();

            parts = value.split('; ' + cookie + '=');
            if (parts.length == 2) {
                var token = parts.pop().split(';').shift();
                return token;
            }
            return undefined;
        }

        function getCookieName () {
            return cookieName;
        }

        function getRequestHeaderName () {
            return requestHeaderName;
        }
    }());


    /**
     * Use Angular $http Service
     */
    module.exports = (function(http) {
        return function(url, options) {
            options = (typeof url === 'object' ? url : options) || {};
            if (options.xsrf !== false && options.method && options.method.toUpperCase() !== 'GET') {
                options.headers = options.headers || {};
                options.headers[xsrf.getRequestHeaderName()] = xsrf.getToken();
            }

            return http(angular.extend({
                url: url,
                method: 'get',
                responseHeaders: {
                    'cache-control': 'no-cache' // for old IE
                }
            }, options));
        };
    })(angular.injector(['ng']).get('$http'));
});
