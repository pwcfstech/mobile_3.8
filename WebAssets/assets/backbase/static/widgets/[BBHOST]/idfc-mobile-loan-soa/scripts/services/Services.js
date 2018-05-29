/**
* Models
* @module models
*/
define(function (require, exports) {

    'use strict';

    var angular = require('base').ng;
    var Blob = window.Blob || require('../libs/Blob');
	  var FileSaver = require('../libs/FileSaver');

  	if (Blob.initialize) {
  		Blob.initialize(window);
  	}


    //@ngInject
    function loanSOAService($http) {
        var config = {};
        return {
            setup: function (localConfig) {
                config = angular.extend(config, localConfig);
                return this;
            },
      			getLoanAcctListService: function () {
      				return $http({
      					method: 'GET',
      					url: config.loanAccountListUrl,
      					headers: {
      						'Accept': 'application/json',
      						'Content-Type': 'application/x-www-form-urlencoded;'
      					}
      				})
      			},
            getLoanSOAService: function () {
              return $http({
                  method: 'POST',
        					url: config.getLoanSoaURL,
        					data: config.data,
        					headers: {
        							'Accept': 'application/json',
        							'Content-Type': 'application/x-www-form-urlencoded;'
        					}
              });
            },
            getHomesaverSOAService:function(){
              return $http({
      					method: 'POST',
      					url: config.getHomesaverSOAUrl,
                data: config.data,
      					headers: {
      						'Accept': 'application/json',
      						'Content-Type': 'application/x-www-form-urlencoded;'
      					}
      				})
            },
			getSOApdfService: function () {
                return $http({
                    method: 'POST',
          					url: config.pdfDataURL,
          					data: config.data,
          					headers: {
          							'Accept': 'application/json',
          							'Content-Type': 'application/x-www-form-urlencoded;'
          					},
					          responseType: 'arraybuffer'
                });
            },
	         getSOAemailService: function () {
              return $http({
                method: 'POST',
      					url: config.pdfDataURL,
      					data: config.data,
      					headers: {
      							'Accept': 'application/json',
      							'Content-Type': 'application/x-www-form-urlencoded;'
      					}
              });
            },
            getSOAHomeSaverPDFService: function(){
          			return $http({
          				method: 'POST',
          				url:config.pdfGenerationEndpoint,
                  data:config.data,
          				responseType: 'arraybuffer',
          				headers: {
          					'Accept': 'application/json',
          					'Content-Type': 'application/x-www-form-urlencoded;'
          				}
          			})
            },
            getSOAHomeSaverPrintService: function(){
                return $http({
                  method: 'POST',
                  url:config.pdfGenerationEndpoint,
                  data:config.data,
                  responseType: 'arraybuffer',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                  }
                });
            },
            loadAllAccounts: function(){
          			return $http({
          				method: 'GET',
          				url:config.loadAllAccountsURL,
                  headers: {
        						'Accept': 'application/json',
        						'Content-Type': 'application/x-www-form-urlencoded;'
        					}
          			});
            }

	      };
    }
    exports.loanSOAService = loanSOAService;

});
