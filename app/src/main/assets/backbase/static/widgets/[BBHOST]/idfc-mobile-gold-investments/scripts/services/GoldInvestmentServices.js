/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';

    var angular = require('base').ng;
    	var angular = require('base').ng;
    	var Blob = window.Blob || require('../libs/Blob');
    	var FileSaver = require('../libs/FileSaver');
    	var saveAs;

    	if (Blob.initialize) {
    		Blob.initialize(window);
    	}

    	saveAs = FileSaver.saveAs;

    //@ngInject
    function goldInvestments($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },            
            fetchPerGramRate : function () {
                return $http({
                    method: 'GET',
                    url: config.urlFetchPerGramRateEndPoint,
                    headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            },
            saveGoldInvestmentDetails: function () {
                return $http({
                    method: 'POST',
                    url: config.urlSaveGoldInvstEndPoint,
                    data: config.data,
                    headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            },
            fetchAccounts : function () {
                return $http({
                    method: 'GET',
                    url: config.urlFetchAccountsEndPoint,
                    data: config.data,
                    headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            },
            profileDetails : function () {
                return $http({
                    method: 'POST',
                    url: config.urlFetchProfileDetails,
					data: config.data,
                    headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            },
			generatePDF : function () {
			console.log("pdf method called")
				return $http({
					method: 'POST',
					url: config.urlPDFEndPoint,
					data: config.data,
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded;'
					},
					 responseType: 'arraybuffer'
				});
			},
			fetchAccessDatesForGoldInvestments: function () {
                return $http({
                    method: 'GET',
                    url: config.urlFetchAccessDatesEndPoint,
                    headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
            }
			
        }
    }
    exports.goldInvestments = goldInvestments;
});
