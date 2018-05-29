define(function(require, exports, module) {
	'use strict';

             /**
            *filter on the selection of CR/DR
            *
            *@returns txn, selectedCrDr
            */
          // @ngInject
        exports.companyFilter = function() {
                				return function(txn, selectedCrDr) {
                					// alert('Hello pls checkAll'+txn);
                					if (!angular.isUndefined(txn)
                							&& !angular.isUndefined(selectedCrDr)
                							&& selectedCrDr.length > 0) {
                						var tempClients = [];
                						angular.forEach(selectedCrDr, function(
                								creditDebitIndicator) {
                							// alert('check check'+selectedCrDr);
                							angular.forEach(txn, function(client) {
                								if (angular.equals(client.creditDebitIndicator,
                										creditDebitIndicator)) {
                									tempClients.push(client);
                								}
                							});
                						});
                						return tempClients;
                					} else {
                						return txn;
                					}
                				};
                			}


});