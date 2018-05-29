/**
 * Models
 * @module models
 */
define(function(require, exports) {
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
	 *@constructor
	 * @ngInject
	 */
	function sharedProperties(lpWidget) {
		this.data = [];
		this.widget = lpWidget;
		var deposit = {
			subProductType: '',
			accountNumber: '',
			amount: '',
			interestPayout: '',
			interestPayoutTmp: '',
			prodVariantLabel: '',
			tenureYears: '',
			tenureDays: '',
			autoRenewal: '',
			rateOfInterest: '',
			itemCode: '',
			productType: '',
			taxSaverFlag: '',
			sweepInFlag: ''
		};
		var homeBrnchCode = '';
		var modeOfOperation = '';
		var response = {
			accountNumber: ''
		};
		var depositNomination = {
			subProductType: '',
			productType: '',
			accountNumber: '',
			amount: '',
			interestPayout: '',
			interestPayoutTmp: '',
			prodVariantLabel: '',
			tenureYears: '',
			tenureDays: '',
			autoRenewal: '',
			rateOfInterest: '',
			nomineeName: '',
			nomineeDOB: '',
			relationship: '',
			nomineeAddressLine1: '',
			nomineeAddressLine2: '',
			nomineeState: '',
			nomineeCity: '',
			nomineeId: '',
			guardianName: '',
			isMinor: '',
			guardianRelationship: '',
			guardianAddress1: '',
			guardianAddress2: '',
			guardianState: '',
			guardianCity: '',
			taxSaverFlag: '',
			homeBranchCode: '',
			openDepositDetails: ''
		};
		var nomineeDetails = {
			nomineeName: '',
			nomineeRelationship: ''
		};
		return {
			getModeOfOperation: function(){
			return modeOfOperation;
			},
			setModeOfOperation: function(value){
			modeOfOperation = value;
			console.log("modeOfOperation",modeOfOperation);
			},
			getHomeBrnchCode: function () {
                return homeBrnchCode;
            },
			setHomeBrnchCode: function(value) {
				homeBrnchCode = value;
			},
			getProperty: function() {
				return deposit;
			},
			setProperty: function(value) {
				// alert(value.amount);
				deposit.subProductType = value.subProductType;
				deposit.accountNumber = value.accountNumber;
				deposit.interestPayout = value.interestPayout;
				deposit.interestPayoutTmp = value.interestPayoutTmp;
				deposit.prodVariantLabel = value.prodVariantLabel;
				deposit.tenureYears = value.tenureYears;
				deposit.tenureDays = value.tenureDays;
				deposit.autoRenewal = value.autoRenewal;
				deposit.amount = value.amount;
				// deposit.rateOfInterest = '10.00';
				deposit.rateOfInterest = value.rateOfInterest;
				deposit.itemCode = value.itemCode;
				deposit.productType = value.productType;
				deposit.taxSaverFlag = value.taxSaverFlag;
				deposit.sweepInFlag = value.sweepInFlag;
			},
			getNominee: function() {
				return nomineeDetails;
			},
			setNominee: function(value) {
				nomineeDetails.nomineeName = value.nomineeName;
				nomineeDetails.nomineeRelationship = value.nomineeRelationship;
			},
			getDepositNomination: function() {
				return depositNomination;
			},
			setDepositNomination: function(value) {
				// nomineeDetails.nomineeName = value.nomineeName;
				// nomineeDetails.nomineeRelationship =
				// value.nomineeRelationship;
				depositNomination.productType = value.productType;
				depositNomination.subProductType = value.subProductType;
				depositNomination.accountNumber = value.accountNumber;
				depositNomination.interestPayout = value.interestPayout;
				depositNomination.interestPayoutTmp = value.interestPayoutTmp;
				depositNomination.prodVariantLabel = value.prodVariantLabel;
				depositNomination.tenureYears = value.tenureYears;
				depositNomination.tenureDays = value.tenureDays;
				depositNomination.autoRenewal = value.autoRenewal;
				depositNomination.amount = value.amount;
				depositNomination.rateOfInterest = value.rateOfInterest;
				// ////Nomination
				depositNomination.nomineeName = value.nomineeName;
				depositNomination.nomineeDOB = value.nomineeDOB;
				depositNomination.relationship = value.relationship;
				depositNomination.nomineeAddressLine1 = value.nomineeAddressLine1;
				depositNomination.nomineeAddressLine2 = value.nomineeAddressLine2;
				depositNomination.nomineeState = value.nomineeState;
				depositNomination.nomineeCity = value.nomineeCity;
				depositNomination.nomineeId = value.nomineeId;
				depositNomination.guardianName = value.guardianName;
				// /
				// depositNomination.guardianDOB = value.guardianDOB;
				depositNomination.isMinor = value.isMinor;
				depositNomination.guardianRelationship = value.guardianRelationship;
				depositNomination.guardianAddress1 = value.guardianAddress1;
				depositNomination.guardianAddress2 = value.guardianAddress2;
				depositNomination.guardianState = value.guardianState;
				depositNomination.guardianCity = value.guardianCity;
				depositNomination.taxSaverFlag = value.taxSaverFlag;
				depositNomination.homeBranchCode = value.homeBranchCode;
				depositNomination.modeOfOperation = value.modeOfOperation;
			},
			getResponse: function() {
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
	exports.WidgetModel = WidgetModel;
	exports.sharedProperties = sharedProperties;
});
