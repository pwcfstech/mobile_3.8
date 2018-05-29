/**
 * Models
 *
 * @module models
 */
define(function(require, exports) {
 'use strict';


 //@ngInject
 function LoanRepayService($http){
  return {
    getLoanAccountLists: function(loanAccountUrl) {
    				return $http({
    					method: 'GET',
    					url: loanAccountUrl,
    					headers: {
    						'Accept': 'application/json',
    						'Content-Type': 'application/x-www-form-urlencoded;'
    					}
    				});
    			},
    getLoanDetailsByAcc: function(getloanRepaymentScheduleUrl, dataPost) {
                    return $http({
                    	method: 'POST',
                    	url: getloanRepaymentScheduleUrl,
                    	data: dataPost,
                    	headers: {
                    			'Accept': 'application/json',
                    			'Content-Type': 'application/x-www-form-urlencoded;'
                    			}
                    	});
                    },
    getLoanSOA: function(getLoanSoaUrl, postData) {
                    return $http({
                    	method: 'POST',
                    	url: getLoanSoaUrl,
                    	data: postData,
                    	headers: {
                    			'Accept': 'application/json',
                    			'Content-Type': 'application/x-www-form-urlencoded;'
                    			}
                    	});
                    },
	getPDFGeneration: function(pdfGenUrl, postData) {
                    return $http({
                    	method: 'POST',
                    	url: pdfGenUrl,
                    	data: postData,
                    	headers: {
                    			'Accept': 'application/json',
                    			'Content-Type': 'application/x-www-form-urlencoded;'
                    			},
						responseType: 'arraybuffer'
                    	});
                    }
    };
 }
 
 exports.LoanRepayService = LoanRepayService;
});
