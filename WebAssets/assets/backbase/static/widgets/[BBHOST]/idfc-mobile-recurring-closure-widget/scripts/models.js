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
// 	//code to fix browser caching issues
//	function $http($http){
//	 if (!$http.defaults.headers.get) {
//        $http.defaults.headers.get = {};
//    }
//    //disable IE ajax request caching
//    $http.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
//    $http.defaults.headers.get['Cache-Control'] = 'no-cache';
//    $http.defaults.headers.get['Pragma'] = 'no-cache';
//	}
//
//	function $httpProvider($httpProvider){
//	//initialize get if not there
//    if (!$httpProvider.defaults.headers.get) {
//        $httpProvider.defaults.headers.get = {};
//    }
//    //disable IE ajax request caching
//    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
//    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
//    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
//	}
    /**
     * Export Models
     */
//	exports.$http = $http;
//	exports.$httpProvider = $httpProvider;
	exports.WidgetModel = WidgetModel;

});
