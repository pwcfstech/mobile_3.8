/**
 * Models
 * @module models
 */
define( function (require, exports) {

    'use strict';

    /**
     * @constructor
     * @ngInject
     */
    function WidgetModel(lpWidget) {
        this.data = [];
        this.widget = lpWidget;
    }

    /**
     * @constructor
     * @ngInject
     */
    function $httpProvider($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    };

    /**
     * @constructor
     * @ngInject
     */
    function $http($http) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    };

    /**
     * Export Models
     */
    exports.WidgetModel = WidgetModel;
    exports.httpProvider = $httpProvider;
    exports.http = $http;

});
