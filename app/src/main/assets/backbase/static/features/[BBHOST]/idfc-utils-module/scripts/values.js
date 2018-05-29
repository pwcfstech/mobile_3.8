define(function (require, exports, module) {
    'use strict';
	var idfcConstants = require('idfccommon').idfcConstants;

    exports.IdfcUtils = {
		
        hasContentData: function (data) {
          if(typeof data === 'string' || data instanceof String){
            return data.trim().length;
          }else if(typeof data === 'number' || typeof data === 'boolean' || typeof data === 'function'){
            return true;
          }else{
            return data && Object.keys(data).length > 0;
          }

        },

        /**
         * Check if the current browser is ES3 compliant only
         *
         * @returns {boolean}
         */
        isES3Browser: function () {
            var es3Browser = false;
            try {
                Object.defineProperty({}, 'x', {});
            } catch (e) { /* this is ES3 Browser */
                es3Browser = true;
            }
            return es3Browser;
        },
		
		/**
         * returns the age
         *
         * @returns {int}
         */
		 getAge: function(dob) {
			var dateString = dob;
			var today = new Date();
			dateString= dateString.replace(/-/g," ");
			var birthDate = new Date(dateString);
			var age = today.getFullYear() - birthDate.getFullYear();
			var m = today.getMonth() - birthDate.getMonth();
			if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}
			return age;
		},
		
		/**
         * returns the date
         *
         * @returns {date}
         */
		formatDate: function(date) {
			var formattedDate = new Date(date).format('dd-mmm-yyyy');
			return formattedDate;
		},
		
		/**
         * returns the date
         *
         * @returns {date}
         */
		convertToDate: function (stringDate){
			
			if(stringDate !== null && stringDate !== '') {
					dateT = stringDate.split(':');
					dateS = dateT[0].split('-');
					dateR = dateS[2] + '-' + dateS[1] + '-' + dateS[0];
			}
			return dateR;
		},
		
		/**
         * returns mask Mobile
         *
         * @returns {String}
         */
		mobileMask: function (mobileNumber){
			var customerMobMasked;
			if ((typeof mobileNumber !== 'undefined') && (mobileNumber !== null)) {
				customerMobMasked = '******'+ mobileNumber.substr(mobileNumber.length - 4);
			} else {
				customerMobMasked = false;
			}
			return customerMobMasked;
		},
		
		validateAccount: function(accountNo) {
			var retVar = false;
            if(accountNo != null && accountNo.length !== idfcConstants.ACCOUNT_NUMBER_LENGTH){
                retVar = true;
            }
            return retVar;
        },
		
		/**
        *  validateDebit method
        * @desc checks debit card number is valid
        */
        validateDebit: function (debitCard) {
			var retVar = false;
            if(debitCard != null && debitCard.length !== idfcConstants.DEBIT_CARD_LENGTH){
               retVar = true;
            }
            return retVar;
        },
		
		/**
        *  validateUCIC method
        * @desc checks UCIC is valid
        */
        validateUCIC: function (uid) {
			var retVar = false;
            if(uid != null && uid.length > idfcConstants.UCIC_LENGTH){
               retVar = true;
            }
            return retVar;
        },

		/* Mask Account Number */
		maskAccountNo : function(listOfAccNo) {
			
			var repeat = function(String, count){
				return count > 0 ? String + repeat(String, count - 1) : String;
			};
			
			for (var countNo in listOfAccNo){
				var accountNumber = listOfAccNo[countNo].acctNb;
				var nonMaskedAccStart = accountNumber.substring(0,4);
				var nonMaskedAccEnd = accountNumber.substring(accountNumber.length-4,accountNumber.length);
				var maskPart = repeat('X', accountNumber.length-9);
				listOfAccNo[countNo].acctNbMask = nonMaskedAccStart+maskPart+nonMaskedAccEnd;
			}
			return listOfAccNo;
		},
		
		
		
    };
});