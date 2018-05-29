define(function(require, exports, module) {
	'use strict';

             /**
            *filter on the selection of CR/DR
            *
            *@returns txn, selectedCrDr
            */
          // @ngInject
        exports.dateRange = function() {
        			        return function(records, fromD, toD) {
        				    return records.filter(function(loanDeatils) {
        					return loanDeatils.tDate >= fromD && loanDeatils.tDate <= toD;
                      });
            
        			}
                }


});