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
    
//  //code to fix browser caching issues
//	function $http($http){
//	 if (!$http.defaults.headers.get) {
//        $http.defaults.headers.get = {};
//    }
//    //disable IE ajax request caching
//    $http.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
//    $http.defaults.headers.get['Cache-Control'] = 'no-cache';
//    $http.defaults.headers.get['Pragma'] = 'no-cache';
//	}
	
	function sharedProperties() {
	var deposit = {
subProductType: '',
accountNumber: '',
amount: '',
tenureYears: '',
tenureDays: '',
tenureMonths: '',
autoRenewal: '',
rateOfInterest:'',
itemCode:'',
productType:'',
taxSaverFlag:'',
maturityAmount:'',
maturityDate:'',
interest:'',
availableBalance:'',
hmBrnchCd:'',
modeOfOperation:''
}

var response = {
accountNumber: '',
}
var depositNomination = {
/*  subProductType: '',
productType: '', */
accountNumber: '',
amount: '',
/*  interestPayout: '',
interestPayoutTmp: '',   */
tenureYears: '',
tenureMonths: '',
rateOfInterest:'',
nomineeRequired:'',
nomineeName :'',
nomineeDOB :'',
relationship:'',
nomineeAddressLine1:'',
nomineeAddressLine2 :'',
nomineeState :'',
nomineeCity :'',
nomineePinCode:'',
nomineeAddr:'',
nomineeId :'',
guardianName :'',
isMinor:'',
guardianRelationship :'',
guardianAddress1 :'',
guardianAddress2 :'',
guardianState :'',
guardianCity :'',
guardianPinCode :'',
guardianAddr:'',
displayNominee : '',
guardianDOB:'',
hmBrnchCd:'',
modeOfOperation:''
}
	
	 var copyDepositNomination = {
            /*  subProductType: '',
				productType: '', */
             accountNumber: '',
             amount: '',
            /*  interestPayout: '',
				interestPayoutTmp: '',	 */			
             tenureYears: '',
             tenureMonths: '',
				rateOfInterest:'',
				nomineeRequired:'',
				nomineeName :'', 
				nomineeDOB :'', 
				relationship:'',
				nomineeAddressLine1:'',
				nomineeAddressLine2 :'',
				nomineeState :'',
				nomineeCity :'',
				nomineeId :'',
				guardianName :'',
				isMinor:'',				
				guardianRelationship :'',
				guardianAddress1 :'',
				guardianAddress2 :'',
				guardianState :'',
				guardianCity :'',
				hmBrnchCd:'',
				modeOfOperation:''
         }

var nomineeDetails = {
nomineeName : '',
nomineeRelationship : ''
}

var maturityDetails = {
rateOfInterest: '',
maturityAmount:'',
maturityDate:''

}

return {
getProperty: function () {
return deposit;
},
setProperty: function(value) {
       
       //alert("in set property amount"+value.amount);
//alert(value.amount);
//deposit.subProductType = value.subProductType;
deposit.accountNumber = value.accountNumber;
//deposit.interestPayout = value.interestPayout;
//deposit.interestPayoutTmp = '';
deposit.tenureYears = value.tenureYears;
//deposit.tenureDays = value.tenureDays;
deposit.tenureMonths = value.tenureMonths;
//deposit.autoRenewal = value.autoRenewal;
deposit.amount = value.amount;
//deposit.rateOfInterest = '10.00';
deposit.rateOfInterest = value.rateOfInterest;
//deposit.itemCode = value.itemCode;
//deposit.productType = value.productType;
//deposit.taxSaverFlag = 'true';
deposit.maturityAmount = value.maturityAmount;
deposit.maturityDate = value.maturityDate;
deposit.interest = value.interest;
deposit.hmBrnchCd = value.hmBrnchCd;
deposit.modeOfOperation = value.modeOfOperation;
deposit.availableBalance = value.availableBalance;

},
getMaturityDetails: function () {
return maturityDetails;
},
setMaturityDetails: function (value) {
	//alert('inside models.sharedproperties.setmaturitydetails');
	//alert(value.interestRate);
	//alert(value.maturityAmount);
	//alert(value.maturityDate);
maturityDetails.rateOfInterest = value.interestRate;
maturityDetails.maturityAmount = value.maturityAmount;
maturityDetails.maturityDate = value.maturityDate;
},
getNominee: function () {
return nomineeDetails;
},
setNominee: function (value) {
nomineeDetails.nomineeName = value.nomineeName;
nomineeDetails.nomineeRelationship = value.nomineeRelationship;
},
getDepositNomination: function () {
	//alert('depositNomination.tenureYears');
return depositNomination;
},
setDepositNomination: function (value) {
//nomineeDetails.nomineeName = value.nomineeName;
//nomineeDetails.nomineeRelationship = value.nomineeRelationship;

//depositNomination.productType = value.productType;
//depositNomination.subProductType = value.subProductType;
depositNomination.accountNumber = value.accountNumber;
//depositNomination.interestPayout = value.interestPayout;
//depositNomination.interestPayoutTmp = '';
depositNomination.tenureYears = value.tenureYears;
depositNomination.tenureMonths = value.tenureMonths;
//depositNomination.autoRenewal = value.autoRenewal;
depositNomination.amount = value.amount;
depositNomination.rateOfInterest = value.rateOfInterest;

//////Nomination
depositNomination.nomineeRequired = value.nomineeRequired;
depositNomination.nomineeName = value.nomineeName;
depositNomination.nomineeDOB = value.nomineeDOB;
depositNomination.relationship = value.relationship;
depositNomination.nomineeAddressLine1 = value.nomineeAddressLine1;
depositNomination.nomineeAddressLine2 = value.nomineeAddressLine2;
depositNomination.nomineeState = value.nomineeState;
depositNomination.nomineeCity = value.nomineeCity;
//depositNomination.nomineeId = value.nomineeId;
depositNomination.guardianName = value.guardianName;


//depositNomination.guardianDOB = value.guardianDOB;
depositNomination.isMinor=value.isMinor;

depositNomination.guardianRelationship = value.guardianRelationship;
depositNomination.guardianAddress1 = value.guardianAddress1;
depositNomination.guardianAddress2 = value.guardianAddress2;
depositNomination.guardianState = value.guardianState;
depositNomination.guardianCity = value.guardianCity;
//depositNomination.taxSaverFlag = value.taxSaverFlag;
depositNomination.hmBrnchCd = value.hmBrnchCd;
depositNomination.modeOfOperation = value.modeOfOperation;

},
getCopyDepositNomination: function () {
	return copyDepositNomination;
},      
setCopyDepositNomination: function (value) {
	copyDepositNomination.accountNumber = value.accountNumber;
	copyDepositNomination.tenureYears = value.tenureYears;
	copyDepositNomination.tenureMonths = value.tenureMonths;
	copyDepositNomination.amount = value.amount;
	copyDepositNomination.rateOfInterest = value.rateOfInterest;			
	
	//////Nomination
	copyDepositNomination.nomineeRequired = value.nomineeRequired;
	copyDepositNomination.nomineeName = value.nomineeName;
	copyDepositNomination.nomineeDOB = value.nomineeDOB;
	copyDepositNomination.relationship = value.relationship;
	copyDepositNomination.nomineeAddressLine1 = value.nomineeAddressLine1;
	copyDepositNomination.nomineeAddressLine2 = value.nomineeAddressLine2;
	copyDepositNomination.nomineeState = value.nomineeState;
	copyDepositNomination.nomineeCity = value.nomineeCity;
	copyDepositNomination.guardianName = value.guardianName;			
	copyDepositNomination.isMinor=value.isMinor;      
	copyDepositNomination.guardianRelationship = value.guardianRelationship;				
	copyDepositNomination.guardianAddress1 = value.guardianAddress1;
	copyDepositNomination.guardianAddress2 = value.guardianAddress2;
	copyDepositNomination.guardianState = value.guardianState;
	copyDepositNomination.guardianCity = value.guardianCity;
	copyDepositNomination.hmBrnchCd = value.hmBrnchCd;
	copyDepositNomination.modeOfOperation = value.modeOfOperation;
	},
getRecurringDepositNomination: function () {
	//alert(depositNomination.nomineeRequired);
return depositNomination;
},
setRecurringDepositNomination: function (value) {
//nomineeDetails.nomineeName = value.nomineeName;
//nomineeDetails.nomineeRelationship = value.nomineeRelationship;

/* depositNomination.productType = value.productType;
depositNomination.subProductType = value.subProductType; */
depositNomination.accountNumber = value.accountNumber;
/* depositNomination.interestPayout = value.interestPayout;
depositNomination.interestPayoutTmp = ''; */
depositNomination.tenureYears = value.tenureYears;
depositNomination.tenureDays = value.tenureDays;
depositNomination.autoRenewal = value.autoRenewal;
depositNomination.amount = value.amount;
depositNomination.rateOfInterest = value.rateOfInterest;

//////Nomination
depositNomination.nomineeName = value.nomineeName;
depositNomination.nomineeDOB = value.nomineeDOB;
depositNomination.relationship = value.relationship;
depositNomination.nomineeAddressLine1 = value.nomineeAddressLine1;
depositNomination.nomineeAddressLine2 = value.nomineeAddressLine2;
depositNomination.nomineeState = value.nomineeState;
//
depositNomination.nomineeCity = value.nomineeCity;
depositNomination.nomineeId = value.nomineeId;
depositNomination.guardianName = value.guardianName;


//depositNomination.guardianDOB = value.guardianDOB;
depositNomination.isMinor=value.isMinor;

depositNomination.guardianRelationship = value.guardianRelationship;
depositNomination.guardianAddress1 = value.guardianAddress1;
depositNomination.guardianAddress2 = value.guardianAddress2;
depositNomination.guardianState = value.guardianState;
depositNomination.guardianCity = value.guardianCity;
depositNomination.taxSaverFlag = value.taxSaverFlag;
depositNomination.hmBrnchCd = value.hmBrnchCd;
depositNomination.modeOfOperation = value.modeOfOperation;

},
getResponse: function () {
return response;
},
setResponse: function(value) {
response.accountNumber = value.accountNumber;
}

};
	}
	
    /**
     * Export Models
     */
//	exports.$http = $http;
    exports.WidgetModel = WidgetModel;
exports.sharedProperties = sharedProperties;
});
