/**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {
	'use strict';
	var angular = require('base').ng;
	var enciphering = require('./../support/production/angular-rsa-encrypt');
    var readKey = require('./../support/rsaKeySetup/rsaKeySetup');

	/**
	 * Main controller - NewUserController
	 * @ngInject
	 * @constructor
	 */
	function NewUserController($scope, $timeout, httpService, lpWidget, lpCoreUtils, lpCoreBus, lpPortal, Services, IdfcUtils, 
								IdfcConstants, IdfcError, LauncherDeckRefreshContent) {
        gadgets.pubsub.subscribe('launchpad-retail.goToCreateUsername');
		var ALERT_TIMEOUT = 10;
		var newUserRegCtrl = this;
		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
		 var acceptdir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/pdf';
		var cardBinServiceEndPoint = lpWidget
			.getPreference('verifyDebitCardBin');
		var customerIDServiceEndPoint = lpWidget
			.getPreference('customerIDService');
		//var accountNumberServiceEndPoint = lpWidget
		//	.getPreference('accountNumberService');

		newUserRegCtrl.requireUcicError = false;
		newUserRegCtrl.ucicErrorLength = false;
		newUserRegCtrl.ucicErrorPattern = false;

		newUserRegCtrl.requiredMobileNumberError = false;
		newUserRegCtrl.mobileNumberErrorLength = false;
		newUserRegCtrl.mobileNumberPattern = false;
        /*PwC Neha Chandak*/
//		var loanAccountNumberServiceEndPoint = lpWidget
//			.getPreference('loanAccountNumberService');
        /*PwC Neha Chandak end*/
        var accountNumberServiceEndPoint = lpWidget
            .getPreference('validateLoanCasaAccnt');
        
        
		var enquireCardNumberServiceEndPoint = lpWidget
			.getPreference('enquireDebitCardNumberService');
		var userNameServiceEndPoint = lpWidget.getPreference('userNameService');
		var registerUserServiceEndPoint = lpWidget
			.getPreference('registerUserService');
		var generateOTPServiceEndPoint = lpWidget
			.getPreference('generateOTPService');
		var verifyOTPServiceEndPoint = lpWidget
			.getPreference('verifyOTPService');
        
        /* PwC NehaChandak */
        var loanAccountNumberServiceEndPoint = lpWidget
			.getPreference('validateLoanAccountNumber');
        /* PWC - End */
        
		var matchPasswordCount;
		var customerFirstName;
		var customerDOB;
		var customerMob;
		var profitCntrCode = '';
		var verifyCardList;
		var emailId;

		newUserRegCtrl.forms = {};
		newUserRegCtrl.errors = {};

		// code started for debit card first six digits verification
		// while intialization get all debit bin list form DB.
		function getCardBinList() {
			var verifyCardBinServiceURL = lpCoreUtils
				.resolvePortalPlaceholders(cardBinServiceEndPoint, {
					servicesPath: lpPortal.root
				});
			verifyCardList = Services.setup({
				cardBinListServiceEndpoint: verifyCardBinServiceURL
			}).loadList();
		}
		// verification of debit card first six digits
		newUserRegCtrl.validateCardFirstSixDigits = function (cardNumber) {
			if (verifyCardList.length > 0) {
				if (cardNumber !== null) {
					var cardNoLength = cardNumber.toString().length;
					var flag = false;
					if (cardNoLength > 0 && cardNoLength < 7) {
						for (var i = 0; i < verifyCardList.length; i++) {
							if (cardNumber === verifyCardList[i].toString()
								.substring(0, cardNoLength)) {
								flag = true;
								break;
							}
						}
						if (flag) {
							newUserRegCtrl.forms.debitCardForm.digits = false;
						} else {
							newUserRegCtrl.forms.debitCardForm.digits = true;
						}
					}
				}
			}
		};
		// code ended for debit card first six digits verification
		newUserRegCtrl.changeTab = function () {
			if (!newUserRegCtrl.cancelTransaction) {
				newUserRegCtrl.note = false;
				newUserRegCtrl.OTPFlag = true;
				newUserRegCtrl.lockFields = false;
			}
			/*//if switch the tab, when otp screen displayed on 1st choosen TAb
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });*/
		};
		/**
		 * resetUcicForm method@desc clears UCIC form fields
		 */
		newUserRegCtrl.resetUcicForm = function () {
			newUserRegCtrl.control.ucic.value = '';
			newUserRegCtrl.alerts = [];
			newUserRegCtrl.UcicForm.submitted = false;
			newUserRegCtrl.control.mobilenumber.value='';
            newUserRegCtrl.requireUcicError = false;
            newUserRegCtrl.ucicErrorLength = false;
            newUserRegCtrl.ucicErrorPattern = false;
            newUserRegCtrl.requiredMobileNumberError = false;
            newUserRegCtrl.mobileNumberErrorLength = false;
            newUserRegCtrl.mobileNumberPattern = false;


		};
		/**
		 * resetCustomerAccountForm method
		 * @desc clears Account form fields
		 */
		newUserRegCtrl.resetCustomerAccountForm = function () {
			newUserRegCtrl.control.accountNumber.value = '';
			newUserRegCtrl.alerts = [];
			newUserRegCtrl.forms.customerAccountForm.submitted = false;
		};
		/**
		 * resetCardForm method@desc clears Card form fields
		 */
		newUserRegCtrl.resetCardForm = function () {
			newUserRegCtrl.control.cardNumber.value = '';
			newUserRegCtrl.control.cvv.value = '';
			newUserRegCtrl.control.expiryMonth.value = '';
			newUserRegCtrl.control.expiryYear.value = '';
			newUserRegCtrl.alerts = [];
			newUserRegCtrl.forms.debitCardForm.submitted = false;
			newUserRegCtrl.forms.debitCardForm.digits = false;
			newUserRegCtrl.disableInvalidCardNext = false;
		};
		/**
		 * resetCustomerLoanForm method@desc clears Loan form fields
		 */
		newUserRegCtrl.resetCustomerLoanForm = function () {
			newUserRegCtrl.control.loanAccount.value = '';
			newUserRegCtrl.forms.customerLoanForm.submitted = false;
		};
		newUserRegCtrl.resetalert = function () {
			newUserRegCtrl.errors['idCheck'] = false;
		};
		newUserRegCtrl.resetpass = function () {
			newUserRegCtrl.errors['confirmPass'] = false;
			newUserRegCtrl.errors['cancelTransaction'] = false;
		};
		/**
		 * resetRegistrationForm method@desc clears Registration form fields
		 */
		newUserRegCtrl.resetRegistrationForm = function () {
			//lpCoreBus.publish('launchpad-retail.closeActivePanel');
			newUserRegCtrl.control.loginId.value = "";
			newUserRegCtrl.control.password.value = "";
			newUserRegCtrl.control.confirmPassword.value = "";
			newUserRegCtrl.loginIdAvailable = false;
			newUserRegCtrl.loginIdNotAvailable = false;
			newUserRegCtrl.errors["idCheck"] = false;
			newUserRegCtrl.enableSubmit = true;
       newUserRegCtrl.registrationForm.submitted = false;
			//newUserRegCtrl.control.cnfrmloginId.value = "";
		};
		/**
		 * validatePassword method@desc checks whether Password and Confirm
		 * Password fields match
		 */
		function validatePassword(username, password1, password2) {
			if (password1 !== password2) {
				matchPasswordCount = matchPasswordCount + 1;
				console.log('return - unmatch');
				return 'unmatch';
			}
			if (password1.toLowerCase() === username.toLowerCase()) {
				console.log('return - containsLoginId');
				return 'containsLoginId';
			}
		}
		/**
		 * validateID method@desc checks Login Id is valid
		 */
		function validateID(Number) {
			var result = false;
			var re = /^[a-zA-Z0-9._-]{6,10}$/;
			if (!re.test(Number)) {
				result = true;
			}
			return result;
		}
		/**
		 * validateUCIC method@desc checks UCIC is valid
		 */
		/*function validateUCIC(uid) {
			var result = false;
			if (uid.length !== 10) {
				result = true;
			}
			return result;
		}*/

		// Checks whether the CustID is 10 digits or not
		$scope.$watch('newUserRegCtrl.control.ucic.value', function (value) {
			if (value.length == 10) {
				newUserRegCtrl.disableNextB = false;
				newUserRegCtrl.errorForLength['ucicCheckLength'] = false;
			} else {
				newUserRegCtrl.disableNextB = true;
				if (value.length > 10) {
					newUserRegCtrl.errorForLength['ucicCheckLength'] = true;
				} else {
					newUserRegCtrl.errorForLength['ucicCheckLength'] = false;
				}
			}
		});

		/**
		 * validateDebitCardNumber method@desc validates the debit card number
		 */
		function validateDebitCardNumber() {
			var xhr;
			var debitCardNumberServiceURL = lpCoreUtils
				.resolvePortalPlaceholders(
					enquireCardNumberServiceEndPoint, {
						servicesPath: lpPortal.root
					});
			var postData = {
				'customerId': newUserRegCtrl.control.ucic.value,
				'debitCardNumber': newUserRegCtrl.control.cardNumber.value
			};
			postData = lpCoreUtils.buildQueryString(postData);
			xhr = Services.setup({
				debitCardServiceEndpoint: debitCardNumberServiceURL,
				postData: postData
			}).validateDebitCard();
			return xhr;
		}
		/**
		 * validateCardNumber method@desc checks debit card number is valid
		 */
		function validateCardNumber(value) {
            newUserRegCtrl.alerts=[];
			newUserRegCtrl.errors['debitCardNumberCheck'] = false;
			if (value.length === IdfcConstants.DEBIT_CARD_LENGTH) {
				var xhr;
				newUserRegCtrl.errorSpin = true;
				xhr = validateDebitCardNumber();
				xhr.success(function (data, status, headers, config) {
					newUserRegCtrl.errorSpin = false;
					if ((IdfcUtils.hasContentData(data))) {
						newUserRegCtrl.errors['debitCardNumberCheck'] = false;
					}
				});
				xhr
					.error(function (error, status, headers, config) {
						newUserRegCtrl.errorSpin = false;
						if(status==0){
                            gadgets.pubsub.publish("no.internet");
                        }else{
                        // If service not available, set error flag
                            if (error.cd && error.cd !== 'CID05' && error.cd !== '203') {
                                newUserRegCtrl.serviceError = IdfcError
                                    .checkGlobalError(error);
                                newUserRegCtrl.alert = {
                                    messages: {
                                        cd: error.rsn
                                    }
                                };
                                newUserRegCtrl.addAlert('cd', 'error', false);
                                newUserRegCtrl.disableInvalidCardNext = true;
                            } else {
                                newUserRegCtrl.errors['debitCardNumberCheck'] = true;
                            }
						}
					});
			}
		}
		/**
		 * validateDebit method@desc checks debit card number is valid
		 */
		function validateDebit(debitCard) {
			var result = false;
			if (debitCard.length !== IdfcConstants.DEBIT_CARD_LENGTH) {
				result = true;
			}
			return result;
		}
		/**
		 * validateAccount method@desc checks account number is valid
		 */
		function validateAccount(accountNo) {
			var result = false;
			if (accountNo.length !== IdfcConstants.ACCOUNT_NUMBER_LENGTH) {
				result = true;
			}
			return result;
		}
		/**
		 * validateLoanAccount method@desc checks account number is valid
		 */
		function validateLoanAccount(loanAccountNo) {
			var result = false;
			if (loanAccountNo.length != IdfcConstants.LOAN_ACCOUNT_NUMBER_LENGTH) {
				result = true;
			}
			return result;
		}
		/**
		 * validateDetails method@desc validate fields
		 */
		function validateDetails() {
			var result = false;
			var checkPassword = validatePassword(
				newUserRegCtrl.control.loginId.value, newUserRegCtrl.control.password.value, newUserRegCtrl.control.confirmPassword.value);
			if (checkPassword === 'unmatch') {
				console.log('in unmatch');
				newUserRegCtrl.errors['confirmPass'] = true;
				newUserRegCtrl.errors['containsLoginId'] = false;
				if (matchPasswordCount >= 5) {
					newUserRegCtrl.errors['cancelTransaction'] = true;
					newUserRegCtrl.cancelTransaction = true;
					initialize();
				}
			} else if (checkPassword === 'containsLoginId') {
				console.log('in containsLoginId');
				newUserRegCtrl.errors['confirmPass'] = false;
				newUserRegCtrl.errors['containsLoginId'] = true;
			} else {
				console.log('in else');
				newUserRegCtrl.errors['confirmPass'] = false;
				newUserRegCtrl.errors['cancelTransaction'] = false;
				newUserRegCtrl.errors['containsLoginId'] = false;
				result = true;
			}
			return result;
		}
		/**
		 * validateLoginId method@desc validate login id
		 */
		function validateLoginId() {
			var result = false;
			var IDCheck = validateID(newUserRegCtrl.control.loginId.value);
			if (IDCheck) {
				newUserRegCtrl.errors['idCheck'] = IDCheck;
				newUserRegCtrl.enableSubmit = true;
			} else {
				newUserRegCtrl.errors['idCheck'] = false;
				result = true;
			}
			return result;
		}
		/**
		 * validUCIC method@desc validate UCIC
		 */
		/*function validUCIC() {
			var result = false;
			var UCICcheck = validateUCIC(newUserRegCtrl.control.ucic.value);
			if (UCICcheck) {
				newUserRegCtrl.errors['ucicCheck'] = UCICcheck;
				result = false;
			} else {
				newUserRegCtrl.errors['ucicCheck'] = false;
				result = true;
			}
			return result;
		}*/

		function validateMobileNumber(mobNumber)
		{
		    var result = false;
		    if (mobNumber.length !== 10) {
    			result = true;
        	}

		}
		/**
		 * validDebitCard method@desc validate debit card
		 */
		function validDebitCard() {
			var result = false;
			var debitCardCheck = validateDebit(newUserRegCtrl.control.cardNumber.value);
			if (debitCardCheck) {
				newUserRegCtrl.errors['debitCheck'] = debitCardCheck;
				result = false;
			} else {
				newUserRegCtrl.errors['debitCheck'] = false;
				result = true;
			}
			return result;
		}
		/**
		 * validAccountNo method@desc validate Account Number
		 */
		function validAccountNo() {
			var result = false;
			var accountNumberCheck = validateAccount(newUserRegCtrl.control.accountNumber.value);
			if (accountNumberCheck) {
				var loanAccountNumberCheck = validateLoanAccount(newUserRegCtrl.control.accountNumber.value);
				if (loanAccountNumberCheck) {
					newUserRegCtrl.errors['accountCheck'] = loanAccountNumberCheck;
					result = false;
				}
				else{
					newUserRegCtrl.errors['accountCheck'] = false;
					result = true;
				}
			} else {
				newUserRegCtrl.errors['accountCheck'] = false;
				result = true;
			}
			return result;
		}
		/**
		 * validLoanAccountNo method@desc validate Loan Account Number
		 */
		/*function validLoanAccountNo() {
			var result = false;
			var loanAccountNumberCheck = validateLoanAccount(newUserRegCtrl.control.loanAccount.value);
			if (loanAccountNumberCheck) {
				newUserRegCtrl.errors['loanAccountCheck'] = loanAccountNumberCheck;
				result = false;
			} else {
				newUserRegCtrl.errors['loanAccountCheck'] = false;
				result = true;
			}
			return result;
		}*/
		// finds out current month
		function getMonth(date) {
			var month = date.getMonth() + 1;
			return month < 10 ? '0' + month : '' + month;
		}
		var d = new Date();
		var m = getMonth(d);
		var y = d.getFullYear();
		// Checks whether the Debit Card Number is valid and belongs to customer
		$scope.$watch('newUserRegCtrl.control.cardNumber.value', function (value) {
			if (value) {
				validateCardNumber(value);
			}
		});
		// Checks whether the Expiry Month is valid or not
		$scope.$watch('newUserRegCtrl.control.expiryMonth.value', function (
			value) {
			if (value < m && newUserRegCtrl.control.expiryYear.value === y) {
				newUserRegCtrl.checkMonth = true;
			} else {
				newUserRegCtrl.checkMonth = false;
			}
		});
		// Checks whether the Expiry Year is valid or not
		$scope.$watch('newUserRegCtrl.control.expiryYear.value', function (value) {
			if (value < m && newUserRegCtrl.control.expiryYear.value === y) {
				newUserRegCtrl.checkMonth = true;
			} else {
				newUserRegCtrl.checkMonth = false;
			}
		});
		// Checks whether the login id changed since last validation
		$scope.$watch('newUserRegCtrl.control.loginId.value', function (
			newValue, oldValue) {
			if (newValue && newUserRegCtrl.loginIdAvailable) {
				if (newValue !== oldValue) {
					newUserRegCtrl.enableSubmit = true;
					newUserRegCtrl.loginIdAvailable = false;
				}
			} else if (newValue !== oldValue) {
				newUserRegCtrl.loginIdAvailable = false;
				newUserRegCtrl.enableSubmit = true;
			}
		});
		// Checks whether the login id changed since last validation
		$scope.$watch('newUserRegCtrl.control.password.value', function (
			newValue, oldValue) {
			if (newUserRegCtrl.errors['containsLoginId']) {
				newUserRegCtrl.errors['containsLoginId'] = false;
			}
		});
		/**
		 * checkAvailability method@desc checks whether Login Id is available or
		 * not
		 */
		newUserRegCtrl.checkAvailability = function () {
			newUserRegCtrl.alerts = [];
			if (!newUserRegCtrl.control.loginId.value || !validateLoginId() || newUserRegCtrl.cancelTransaction) {
				return false;
			}
			var userNameServiceURL = lpCoreUtils.resolvePortalPlaceholders(
				userNameServiceEndPoint, {
					servicesPath: lpPortal.root
				});
			var postData = {
				'username': newUserRegCtrl.control.loginId.value,
				'customerId': newUserRegCtrl.control.ucic.value,
				'firstName': customerFirstName,
				'dateOfBirth': customerDOB,
				'mobileNumber': customerMob
			};
			postData = lpCoreUtils.buildQueryString(postData);
			newUserRegCtrl.errorSpin = true;
			var xhr = Services.setup({
				userNameServiceEndpoint: userNameServiceURL,
				postData: postData
			}).checkAvailability();
			xhr.success(function (data, status, headers, config) {
				newUserRegCtrl.errorSpin = false;
				if (data && data !== 'null') {
					newUserRegCtrl.enableSubmit = false;
					newUserRegCtrl.loginIdAvailable = true;
					newUserRegCtrl.loginIdNotAvailable = false;
					newUserRegCtrl.userIdSuggestion1 = '';
					newUserRegCtrl.userIdSuggestion2 = '';
					newUserRegCtrl.userIdSuggestion3 = '';
				}
			});
			xhr.error(function (error, status, headers, config) {
				newUserRegCtrl.errorSpin = false;
				newUserRegCtrl.enableSubmit = true;
				newUserRegCtrl.loginIdAvailable = false;
				newUserRegCtrl.loginIdNotAvailable = true;
				if(status==0){
                    gadgets.pubsub.publish("no.internet");
                }
                else{
				// If service not available, set error flag
                    if (error.cd) {
                        newUserRegCtrl.serviceError = IdfcError
                            .checkGlobalError(error);
                    }
                    var code = error.cd;
                    if (code === 'CID02') {
                        newUserRegCtrl.userIdSuggestion1 = error.suggestion1;
                        newUserRegCtrl.userIdSuggestion2 = error.suggestion2;
                        newUserRegCtrl.userIdSuggestion3 = error.suggestion3;
                    } else {
                        newUserRegCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        newUserRegCtrl.addAlert('cd', 'error', false);
                    }
				}
			});
			return xhr;
		};
       
		newUserRegCtrl.openTnC = function (isFormValid) {

                gadgets.pubsub.publish("js.back", {
                            data: "ENABLE_BACK"
                });
                newUserRegCtrl.control.acceptTnC = false;
                console.log("Inside tnc");
                newUserRegCtrl.acceptbtn = true;
                newUserRegCtrl.showPdfForm = true;
                $('.pageContainer').addClass('ng-modal-overlay');
                window.CallParentfunction = function() {
                    console.log("Inside parent");
                    newUserRegCtrl.control.acceptTnC = true;
                    $('.newuserregistration-form-control').trigger('click');
                };
       
                //SOB2 UAT issue fix - CPU-5116
                // newUserRegCtrl.EnableSubmit();
                //SOB2 UAT issue fix - CPU -5110
                localStorage.setItem("navigationFlag",true);
            };

       
			/*newUserRegCtrl.control.acceptTnC = true;
			if (!validateDetails() || !isFormValid) {
				return false;
			}
			//newUserRegCtrl.openTermsAndConditions = true;
			//newUserRegCtrl.showSuccessForm = true;

             };*/

       /**
		 * authenticateUCIC method@desc validates the UCIC
		 */
		function authenticateUCIC() {
			var customerIDServiceURL = lpCoreUtils.resolvePortalPlaceholders(
				customerIDServiceEndPoint, {
					servicesPath: lpPortal.root
				});
			var postData = {
				'customerId': newUserRegCtrl.control.ucic.value,
				'requestType': 'newUser',
				'transaction': 'createUsername',
				'mobilenumber': newUserRegCtrl.control.mobilenumber.value
			};
			postData = lpCoreUtils.buildQueryString(postData);
			var xhr = Services.setup({
				authenticateUCICEndpoint: customerIDServiceURL,
				postData: postData
			}).loadUcicAuthentication();
			return xhr;
		}
		/**
		 * validate method@desc validates the user
		 */
		function validate(type) {
			var xhr;
			// For Debit Accounts
			if (type === 'Account') {
				var accountNumberServiceURL = lpCoreUtils
					.resolvePortalPlaceholders(
						accountNumberServiceEndPoint, {
							servicesPath: lpPortal.root
						});
				var postData = {
					'customerId': newUserRegCtrl.control.ucic.value,
					'accountNumber': newUserRegCtrl.control.accountNumber.value,
					'transaction': 'createUsername'
				};
				postData = lpCoreUtils.buildQueryString(postData);
				xhr = Services.setup({
					debitAccountServiceEndpoint: accountNumberServiceURL,
					postData: postData
				}).validateDebitAccount();
			}
			// For Loan Accounts
//			else if ((type === 'LoanAccount')) {
//                var loanNumberServiceURL = lpCoreUtils
//					.resolvePortalPlaceholders(
//						loanAccountNumberServiceEndPoint, {
//							servicesPath: lpPortal.root
//						});
//                var postData = {
//					'customerId': newUserRegCtrl.control.ucic.value,
//					'loanAccNo':  newUserRegCtrl.control.loanAccount.value
//				};
//                postData = lpCoreUtils.buildQueryString(postData);
//                
//                xhr = Services.setup({
//					loanAccountServiceEndpoint: loanNumberServiceURL,
//					postData: postData
//				}).validateLoanAccount();
//                
//                /* PwC Neha Chandak */
//                /*var databaseService = httpService.getInstance({
//					endpoint: loanAccountNumberServiceEndPoint,
//					urlVars: {
//						customerId: newUserRegCtrl.control.ucic.value
//					}
//				});
//				xhr = databaseService.read();*/
//                /*PwC Neha Chandak end*/
//			}
			return xhr;
		}
		/**
		 * openRegistrationForm method@desc opens login id creation form
		 */
		newUserRegCtrl.openRegistrationForm = function (isValid, type) {
		    gadgets.pubsub.publish(
                            "js.back", {
                                data: "ENABLE_BACK"
                           });
			if (newUserRegCtrl.errors['debitCardNumberCheck']) {
				return false;
			}
			if (newUserRegCtrl.forms.debitCardForm != null && newUserRegCtrl.forms.debitCardForm.digits) {
				return false;
			}
			newUserRegCtrl.errors = {};

			newUserRegCtrl.alerts = [];
			if (type === 'DebitCard') {
				if (!validDebitCard() || !isValid) {
					return false;
				}
				if (newUserRegCtrl.checkMonth || newUserRegCtrl.checkYear) {
					return false;
				}
			} else if (type === 'Account') {
				if (!validAccountNo() || !isValid) {
					return false;
				}
			} 
		//	else if (type === 'LoanAccount') {
		//		if (!validLoanAccountNo() || !isValid) {
		//			return false;
		//		}
		//	}
			
			// Validate if the Account Number belongs to user
			if (type === 'Account') {
				var xhr;
				newUserRegCtrl.errorSpin = true;
				xhr = validate(type);
				xhr.success(function (data, status, headers, config) {
					newUserRegCtrl.errorSpin = false;
					if (data && data !== 'null') {
					//if ((IdfcUtils.hasContentData(data))) {
						newUserRegCtrl.errorSpin = true;
						newUserRegCtrl.note = false;
						//newUserRegCtrl.generateOTP('send');
						$scope.readSMS('send');

					}
				});
				xhr.error(function (error, status, headers, config) {
					newUserRegCtrl.errorSpin = false;
					var code = error.cd;
					if(status==0){
                        gadgets.pubsub.publish("no.internet");
                    }
                    else{
                        // If service not available, set error flag
                        if (error.cd) {
                            newUserRegCtrl.serviceError = IdfcError
                                .checkGlobalError(error);
                        }
                        if (code === 'CID02') {
                            newUserRegCtrl.errors['validAccount'] = true;
                        } else {
                            newUserRegCtrl.alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            newUserRegCtrl.addAlert('cd', 'error', false);
                        }
                     }
				});
			}
			// Validate if the Loan Account Number belongs to user
		//	else if (type === 'LoanAccount') {

                /* PwC Neha Chandak*/
          /*      newUserRegCtrl.errorSpin = true;
				xhr = validate(type);				
				xhr.success(function(data, status, headers, config) {
					newUserRegCtrl.errorSpin = false;
					if (data && data !== 'null') {
						newUserRegCtrl.errorSpin = true;
						newUserRegCtrl.errors['validLoanAccount'] = false;
						//newUserRegCtrl.generateOTP('send');
						$scope.readSMS('send');
						console.log("after readsms call in success");
					}
				});
				xhr.error(function(error, status, headers, config) {
					newUserRegCtrl.errorSpin = false;
					var code = error.cd;
					if(status==0){
                        gadgets.pubsub.publish("no.internet");
                    }
                    else{
                        // If service not available, set error flag
                        if (error.cd) {
                            newUserRegCtrl.serviceError = IdfcError
                                    .checkGlobalError(error);
                        }
                        if(code == "511" && error.rsn == "Customer Number is not valid."){
                            newUserRegCtrl.errors['validLoanAccount'] = true;
                        }
                        else if (code  == "CID02"){
                            newUserRegCtrl.errors['validLoanAccount'] = true;
                        }
                        else {
                            newUserRegCtrl.alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            newUserRegCtrl.addAlert('cd', 'error', false);
                        }
                    }
				});*/
//				newUserRegCtrl.errorSpin = true;
//				xhr = validate(type);
//				xhr
//					.success(function (data, status, headers, config) {
//						newUserRegCtrl.errorSpin = false;
//						if ((IdfcUtils.hasContentData(data))) {
//							// Get all the loan accounts for the customer
//							var loanAccountList = data.loanAccountList;
//							var accountExists = false;
//							// Check in the loan account list for customer
//							// if entered account exists or not
//							angular
//								.forEach(
//									loanAccountList,
//									function (loanAccount) {
//										if (!accountExists) {
//											if (loanAccount.accountNo === newUserRegCtrl.control.loanAccount.value) {
//												accountExists = true;
//											}
//										}
//									});
//							if (!accountExists) {
//								newUserRegCtrl.errors['validLoanAccount'] = true;
//							} else {
//								newUserRegCtrl.errors['validLoanAccount'] = false;
//								newUserRegCtrl.errorSpin = true;
//								newUserRegCtrl.generateOTP('send');
//							}
//						}
//					});
//				xhr.error(function (error, status, headers, config) {
//					newUserRegCtrl.errorSpin = false;
//					// If service not available, set error flag
//					if (error.cd) {
//						newUserRegCtrl.serviceError = IdfcError
//							.checkGlobalError(error);
//					}
//					newUserRegCtrl.alert = {
//						messages: {
//							cd: error.rsn
//						}
//					};
//					newUserRegCtrl.addAlert('cd', 'error', false);
//				});
       //}
                /*PwC Neha Chandak*/
			 else if (type === 'DebitCard') {
				newUserRegCtrl.errorSpin = true;
				//newUserRegCtrl.generateOTP('send');
				$scope.readSMS('send');
			}
		};
		/**
		 * submitForm method@desc submit the login id creation form
		 */
		function submitForm() {
			var registerUserServiceURL = lpCoreUtils.resolvePortalPlaceholders(
				registerUserServiceEndPoint, {
					servicesPath: lpPortal.root
				});
			// Added for Profit Center Code
		    var pubKey, exp, mod;
            pubKey = readKey.getValues("publicKeyValue");
            exp = readKey.getValues("exp");
            mod = readKey.getValues("mod");
            enciphering.setEncodeKey(pubKey, mod, exp);
            newUserRegCtrl.control.password.value = enciphering.setEncrpt(newUserRegCtrl.control.password.value);
			
			var postData = {
				'customerId': newUserRegCtrl.control.ucic.value,
				'username': newUserRegCtrl.control.loginId.value,
				'password': newUserRegCtrl.control.password.value,
				'emailId': emailId,
				'mobileNumber': customerMob,
				'firstName': customerFirstName,
				'emailFormat': 'newUserReg',
				'profitCntrCode': profitCntrCode,
				 auth_token: 'required',
                 requiredECheck: 'required'
			};
			postData = lpCoreUtils.buildQueryString(postData);
			var xhr = Services.setup({
				registerUserServiceEndpoint: registerUserServiceURL,
				postData: postData
			}).register();
			return xhr;
		}

		//SMS Reading -- Start
        		//To receive events if user has cliked on resend OTP
                gadgets.pubsub.subscribe("resend.otp", function(evt){
                    console.log(evt.resendOtpFlag)
                    //Call function that is called on a click of "Resend OTP" button available on Widget
                    $scope.readSMS('resend');
                });

        $scope.navigateToSetupMpin = function(){
            localStorage.setItem('isMpinSetupVisitedBefore', 'true');
            localStorage.setItem('customerId',  newUserRegCtrl.control.ucic.value);
            console.log('navigate to launchpad-setupmpin');
            gadgets.pubsub.publish('launchpad-setupmpin');
        };

        $scope.navigateExistingLogin = function() {
            localStorage.setItem('isMpinSetupVisitedBefore', '');
            localStorage.setItem('customerId', '');
            console.log('navigate to getBackToLoginScreen');
            resetMVisaLoginFlag();
            resetScanAndPayFlag();
            gadgets.pubsub.publish('getBackToLoginScreen');
        };

        //mvisa-clear flag to clear earlier scanned qr or key entry data if app killed or repopend
        var resetScanAndPayFlag = function(){
            console.log("called clearScanAndPayFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin1){
                globalVariablePlugin1.clearScanAndPayFlag(null,null,'');
            }
            else{
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

         var resetMVisaLoginFlag = function(){
            console.log("called resetMVisaLoginFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin1){
                globalVariablePlugin1.clearMVisaLoginFlag(null,null,'');
            }
            else{
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        $scope.readSMS = function(resendFlag){
            console.log('Read SMS called');
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            console.log("smsPlugin: "+smsPlugin);
            if(smsPlugin){
                var isCheckSuccessCallback = function(data) {
                    if(data) {
                        var smsPermissionFlag = data['successFlag'];

                        if(smsPermissionFlag){
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS",{
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "NewUserRegistration"
                            });

                            //Step 2. Send request to "sendOTP service
                            console.log('Resend flag->'+resendFlag);
                            newUserRegCtrl.generateOTP(resendFlag);

                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("NewUserRegistration", function(evt){
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: '+evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver",{
                                    data:"Stop Reading OTP"
                                });


                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp'+receivedOtp);
                                newUserRegCtrl.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :'+newUserRegCtrl.otpValue);
                                angular.element('#verifyOTP-btn-user-registration').triggerHandler('click');



                            });
                        }
                        else{
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            console.log('Resend flag->'+resendFlag);
                            newUserRegCtrl.generateOTP(resendFlag);
                        }

                    } else {
                        console.log('Some error. Dont initiate SMS reading');
                        //1. Send request to "sendOTP" service
                    }
                };
                var isCheckErrorCallback = function(data) {
                    console.log('Some error: Dont initiate SMS reading');
                };

                smsPlugin.checkSMSReadPermission(
                    isCheckSuccessCallback,
                    isCheckErrorCallback
                );
            }
        };

         //SMS Reading -- End

		/**
		 * registerUser method@desc confirms if form is valid and registers the
		 * user
		 */
		newUserRegCtrl.registerUser = function (isFormValid) {
			//newUserRegCtrl.showSuccessPage = true;
			//newUserRegCtrl.openTermsAndConditions = false;
			//newUserRegCtrl.control.acceptTnC = true;

			 /**
                new functionality developed by pwc
            **/
            console.log('$scope.registerUser function:::');
            if(localStorage.getItem('isMpinSetupVisited') == 'true') {
                $scope.isMpinSetupVisited = true;
            }else{
                // Show set up mpin ralated message
                $scope.isMpinSetupVisited = false;
            }
            console.log('after set the value' +$scope.isMpinSetupVisited);
            /**
            new functionality developed by pwc
            **/
            $scope.errors = {};

			console.log("newUserRegCtrl.control.acceptTnC:",newUserRegCtrl.control.acceptTnC);
			if (!validateDetails() || !isFormValid || !newUserRegCtrl.control.acceptTnC) {
				return false;
			}
			newUserRegCtrl.errors = {};
			var xhr;
			newUserRegCtrl.errorSpin = true;
			xhr = submitForm();
			xhr.success(function (data, status, headers, config) {

			 gadgets.pubsub.publish(
                        "js.back", {
                            data: "ENABLE_HOME"
                       });
				newUserRegCtrl.errorSpin = false;
				if ((IdfcUtils.hasContentData(data))) {
					/*if (data.rsaEnabled === 'true') {
						newUserRegCtrl.rsaEnabled = true;
					}*/
					newUserRegCtrl.showSuccessForm = true;
					newUserRegCtrl.showSuccessPage = true;

					if($scope.isMpinSetupVisited){
                        //If user is via mpin set up widget , then after successful creation of user/pwd , It will navigate to mpin set up.
                        localStorage.setItem('isMpinSetupVisitedBefore', 'true');
                        localStorage.setItem('customerId', newUserRegCtrl.control.ucic.value);
                        gadgets.pubsub.publish('launchpad-setupmpin');
                    }else{
                        //Show success msg
                        console.log('$scope.isMpinSetupVisited::: '+$scope.isMpinSetupVisited);
                        newUserRegCtrl.showSuccessForm = true;
                    }
				}
			});
			xhr.error(function (error, status, headers, config) {
				newUserRegCtrl.errorSpin = false;
				if(status==0){
                    gadgets.pubsub.publish("no.internet");
                }
                else{
                    // If service not available, set error flag
                    if (error.cd) {
                        newUserRegCtrl.serviceError = IdfcError
                            .checkGlobalError(error);
                    }
                    if (error.cd === 'CID02') {
                        newUserRegCtrl.enableSubmit = true;
                        newUserRegCtrl.loginIdAvailable = false;
                        newUserRegCtrl.loginIdNotAvailable = true;
                        newUserRegCtrl.userIdSuggestion1 = '';
                        newUserRegCtrl.userIdSuggestion2 = '';
                        newUserRegCtrl.userIdSuggestion3 = '';
                    } else {
                        newUserRegCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        newUserRegCtrl.addAlert('cd', 'error', false);
                    }
                }
			});
		};
		/**
		 * openTabs method@desc validates UCIC and show the shows tha next form
		 */
		newUserRegCtrl.openTabs = function () {

		newUserRegCtrl.requireUcicError = false;
        newUserRegCtrl.ucicErrorLength = false;
        newUserRegCtrl.ucicErrorPattern = false;
        newUserRegCtrl.requiredMobileNumberError = false;
        newUserRegCtrl.mobileNumberErrorLength = false;
        newUserRegCtrl.mobileNumberPattern = false;

		var returnValue = false;
		var ucicNo = newUserRegCtrl.control.ucic.value;
		var MobNo = newUserRegCtrl.control.mobilenumber.value;
		if(ucicNo == undefined){
		ucicNo = "";
		}
		if(MobNo == undefined){
		MobNo = "";
		}
		if(ucicNo.length == 0){
		    newUserRegCtrl.requireUcicError = true;
            newUserRegCtrl.ucicErrorLength = false;
            newUserRegCtrl.ucicErrorPattern = false;
		    if(ucicNo.length != 10 && ucicNo.length > 0){
		        newUserRegCtrl.requireUcicError = false;
                newUserRegCtrl.ucicErrorLength = true;
                newUserRegCtrl.ucicErrorPattern = false;
		    }
		    returnValue = true;
		}
		if(MobNo.length == 0){
		    newUserRegCtrl.requiredMobileNumberError = true;
            newUserRegCtrl.mobileNumberErrorLength = false;
            newUserRegCtrl.mobileNumberPattern = false;
		    if(MobNo.length != 10 && MobNo.length > 0){
                newUserRegCtrl.requiredMobileNumberError = false;
                newUserRegCtrl.mobileNumberErrorLength = true;
                newUserRegCtrl.mobileNumberPattern = false;
            }
		    returnValue = true;
		}
		if(ucicNo.length != 10 && ucicNo.length > 0){
		    newUserRegCtrl.requireUcicError = false;
            newUserRegCtrl.ucicErrorLength = true;
            newUserRegCtrl.ucicErrorPattern = false;
            returnValue = true;
		}
         if(MobNo.length != 10 && MobNo.length > 0){
            newUserRegCtrl.requiredMobileNumberError = false;
            newUserRegCtrl.mobileNumberErrorLength = true;
            newUserRegCtrl.mobileNumberPattern = false;
            returnValue = true;
         }

           var mobileRegex = /^[0-9]+$/;
           var mobNoCheckResule = mobileRegex.test(MobNo);
             if( mobNoCheckResule == false && newUserRegCtrl.requiredMobileNumberError != true && newUserRegCtrl.mobileNumberErrorLength != true){
                newUserRegCtrl.requiredMobileNumberError = false;
		        newUserRegCtrl.mobileNumberErrorLength = false;
		        newUserRegCtrl.mobileNumberPattern = true;
               returnValue = true;
             }
             var ucicRegex = /^[0-9]+$/;
             var ucicCheckResule = ucicRegex.test(ucicNo);

             if( ucicCheckResule == false && newUserRegCtrl.requireUcicError != true && newUserRegCtrl.ucicErrorLength != true){
               newUserRegCtrl.requireUcicError = false;
                newUserRegCtrl.ucicErrorLength = false;
                newUserRegCtrl.ucicErrorPattern = true;
               returnValue = true;
             }




         if(returnValue ==  true){
            return;
         }
		console.log("check for next click");
			newUserRegCtrl.errors = {};
			newUserRegCtrl.alerts = [];
			/*if (!validUCIC()) {
				return false;
			}*/
			var xhr;
			newUserRegCtrl.errorSpin = true;
			xhr = authenticateUCIC();
			xhr.success(function (data, status, headers, config) {
				newUserRegCtrl.errorSpin = false;
				if ((IdfcUtils.hasContentData(data))) {
				    localStorage.setItem("navigationFlag",true);
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_BACK"
                    });
					customerFirstName = data.custFrstNm;
					customerDOB = data.dob;
					customerMob = data.mobNb;
					emailId = data.eMail;
					newUserRegCtrl.customerMobMasked = '******' + customerMob.substr(customerMob.length - 4);
					newUserRegCtrl.showTabs = !newUserRegCtrl.showTabs;
					// Added for Profit Center Code
					profitCntrCode = data.profCntr;
				}
			});
			xhr.error(function (error, status, headers, config) {
				newUserRegCtrl.errorSpin = false;
				// If service not available, set error flag
				if(status==0)
                {
                    gadgets.pubsub.publish("no.internet");
                }else{
                    if (error.cd) {
                        newUserRegCtrl.serviceError = IdfcError
                            .checkGlobalError(error);
                    }
                    newUserRegCtrl.alert = {
                        messages: {
                            cd: error.rsn
                        }
                    };
                    newUserRegCtrl.addAlert('cd', 'error', false);
				}
			});
		};
		newUserRegCtrl.showChallenge = function () {
			//localStorage.setItem("mobNo", newUserRegCtrl.control.mobilenumber.value);
			gadgets.pubsub.publish('openCQ');
		};
		newUserRegCtrl.showChallengeLater = function () {
			newUserRegCtrl.challengelater = true;
			//gadgets.pubsub.publish("launchpad-retail.backToDashboard");
		};
		/**
		 * generateOTP method@desc Generates OTP and send to customer mobile
		 */
		newUserRegCtrl.generateOTP = function (value) {
			if (angular.isUndefined(customerMob) || customerMob === '') {
				newUserRegCtrl.addAlert('NO_MOBILE_REGISTERED', 'error', false);
				return false;
			}
			var resendOTP = null;
			var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
				generateOTPServiceEndPoint, {
					servicesPath: lpPortal.root
				});
			if (value === 'resend') {
				resendOTP = true;
			} else {
				resendOTP = false;
			}
			var postData = {
				'customerId': newUserRegCtrl.control.ucic.value,
				'mobileNumber': customerMob,
				'resendOTP': resendOTP,
				'transaction': 'createUsername'

			};
			postData = lpCoreUtils.buildQueryString(postData);
			var xhr = Services.setup({
				generateOTPServiceURL: generateOTPServiceURL,
				generateOtpPostData: postData
			}).generateOtp();
			newUserRegCtrl.errorSpin = true;
			/* Check whether the HTTP Request is successful or not. */
			xhr.success(function (data) {
			   /* gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                 });*/
				newUserRegCtrl.errorSpin = false;
				newUserRegCtrl.success = {
					happened: true,
					msg: IdfcConstants.OTP_SUCCESS_MESSAGE
				};
				newUserRegCtrl.error = {
					happened: false,
					msg: ''
				};
				newUserRegCtrl.OTPFlag = false;
				newUserRegCtrl.lockFields = true;
			}).error(
				function (error, status, headers, config) {
					newUserRegCtrl.errorSpin = false;
					gadgets.pubsub.publish("stopReceiver",{data:"Stop Reading OTP"});
                    if(status==0){
                        gadgets.pubsub.publish("no.internet");
                    }else{
                        // If service not available, set error flag
                        if (error.cd && error.cd === '501') {
                            newUserRegCtrl.serviceError = IdfcError
                                .checkGlobalError(error);
                            newUserRegCtrl.alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            newUserRegCtrl.addAlert('cd', 'error', false);
                        }
                        if (error.cd && error.cd === '701') {
                            /*
                            to hide duplicate error msg of otp 5 times sent
                            alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            addAlert('cd', 'error', false);*/

                            newUserRegCtrl.cancelTransaction = true;

                            console.log("cancelTransaction:"+newUserRegCtrl.cancelTransaction);
                        }
                        newUserRegCtrl.error = {
                            happened: true,
                            msg: error.rsn
                        };
                        newUserRegCtrl.success = {
                            happened: false,
                            msg: ''
                        };
					}
				});
		};

		gadgets.pubsub.subscribe("native.back", function(evt) {
                                        angular.forEach(document.getElementsByClassName("tooltip"),function(e){
                                                     	    e.style.display='none';
                                                     	})
                                 console.log("in native back:showPdfForm: ",newUserRegCtrl.showPdfForm);
                                 // $scope.backToFirstScreen();
                                 if (newUserRegCtrl.showPdfForm) {
                                 //$scope.backToFirstScreen();
                                    newUserRegCtrl.decline();
                                    $scope.$apply();
                                 } else {
                                    $scope.backToFirstScreen();
                                 }
                });

                gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
                 if(localStorage.getItem("navigationFlag")) {
                     angular.forEach(document.getElementsByClassName("tooltip"),function(e){
                            e.style.display='none';
                     })
                     //$scope.backToFirstScreen();
                     gadgets.pubsub.publish("js.back", {
                                                       data: "ENABLE_HOME"
                                     });
                     if (newUserRegCtrl.showPdfForm) {
                        //$scope.backToFirstScreen();
                         newUserRegCtrl.decline();
                         $scope.$apply();
                     } else {
                         $scope.backToFirstScreen();
                          gadgets.pubsub.publish("js.back", {
                                                              data: "ENABLE_HOME"
                                            });
                        localStorage.clear();
                     }
                 }else {
                     gadgets.pubsub.publish("device.GoBack");
                 }
             });

         $scope.backToFirstScreen = function() {
               newUserRegCtrl.showRegistrationForm=false;
               newUserRegCtrl.showTabs=false;
               newUserRegCtrl.showPdfForm = false;
               newUserRegCtrl.OTPFlag=true;
               newUserRegCtrl.OTPform.submitted=false;
                newUserRegCtrl.otpValue='';
                newUserRegCtrl.resetCustomerAccountForm();
                newUserRegCtrl.resetCustomerLoanForm();
                newUserRegCtrl.resetCardForm();
                newUserRegCtrl.control.accountNumber.value='';
                newUserRegCtrl.control.loanAccount.value='';
                newUserRegCtrl.control.cardNumber.value='';
                newUserRegCtrl.control.password.value='';
                newUserRegCtrl.control.confirmPassword.value='';
                newUserRegCtrl.control.acceptTnC=false;
                newUserRegCtrl.resetRegistrationForm();
                newUserRegCtrl.resetUcicForm();
               newUserRegCtrl.changeTab();
               newUserRegCtrl.OTPform.submitted=false;
               $scope.$apply();
         };

        $scope.accept = function ()
        {
            console.log("inside accept");
            $scope.showPdfForm = false;
            $scope.control.acceptbtn = true;
            $scope.control.declinebtn = false;
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        }

        newUserRegCtrl.decline = function ()
        {
            console.log("Decline");
            newUserRegCtrl.showPdfForm = false;
            gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
            });
        }

        $scope.getBack = function() {
            resetMVisaLoginFlag();
            resetScanAndPayFlag();
            gadgets.pubsub.publish("getBackToLoginScreen");
        };

		/**
		 * verifyOTP method@desc Verifies OTP entered by customer
		 */
		newUserRegCtrl.verifyOTP = function (isFormValid) {
			if (!isFormValid) {
				return false;
			}
			var verifyOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
				verifyOTPServiceEndPoint, {
					servicesPath: lpPortal.root
				});
			var postData = {
				'customerId': newUserRegCtrl.control.ucic.value,
				'otpValue': newUserRegCtrl.otpValue,
				'requestType': 'verifyOTP',
				'transaction': 'createUsername'
			};
			postData = lpCoreUtils.buildQueryString(postData);
			newUserRegCtrl.errorSpin = true;
			var xhr = Services.setup({
				verifyOTPServiceURL: verifyOTPServiceURL,
				verifyOtpPostData: postData
			}).verifyOtp();
			/* Check whether the HTTP Request is successful or not. */
			xhr.success(function (data) {
				newUserRegCtrl.errorSpin = false;
				//console.log("data.sts "+data.sts +" "+data.sts === "00" +" " +data.sts === "ACPT");
				
				if (data.sts === "00" || data.sts === "ACPT") {
					newUserRegCtrl.OTPFlag = true;
					newUserRegCtrl.OTPError = false;
					newUserRegCtrl.showRegistrationForm = !newUserRegCtrl.showRegistrationForm;
				} else {
					//added for showing error in case OTP is manipulated and we come to success block
					newUserRegCtrl.OTPError = true;
				}
			}).error(
				function (error, status, headers, config) {
					newUserRegCtrl.errorSpin = false;
					if(status==0){
                        gadgets.pubsub.publish("no.internet");
                    }
                    else{
                        // If service not available, set error flag
                        if (error.cd && error.cd === '501') {
                            newUserRegCtrl.serviceError = IdfcError
                                .checkGlobalError(error);
                            newUserRegCtrl.alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            newUserRegCtrl.addAlert('cd', 'error', false);
                        }
                        newUserRegCtrl.cancelTransaction = IdfcError
                            .checkOTPError(error);
                        newUserRegCtrl.error = {
                            happened: true,
                            msg: error.rsn
                        };
                        newUserRegCtrl.success = {
                            happened: false,
                            msg: ''
                        };
					}
				});
		};
		/**
		 * Alerts
		 */
		newUserRegCtrl.addAlert = function (code, type, timeout) {
			var customAlert = {
				type: type || 'error',
				msg: newUserRegCtrl.alert.messages[code]
			};
			newUserRegCtrl.alerts.push(customAlert);
			if (timeout !== false) {
				$timeout(function () {
					newUserRegCtrl.closeAlert(newUserRegCtrl.alerts
						.indexOf(customAlert));
				}, ALERT_TIMEOUT);
			}
		};
		// Remove specific alert
		newUserRegCtrl.closeAlert = function (index) {
			newUserRegCtrl.alerts.splice(index, 1);
		};
		// Clear arr alert messages
		newUserRegCtrl.clearAlerts = function () {
			newUserRegCtrl.alerts = [];
		};
		// Code for UI field validations
		newUserRegCtrl.fieldValidationsAND = function (field1, field2, field3, field4, field5) {
			if (angular.isUndefined(field1)) {
				return false;
			}
			if (angular.isUndefined(field2)) {
				if (angular.isUndefined(field3) && angular.isUndefined(field4)) {
					return field1;
				} else {
					return false;
				}
			}
			if (angular.isUndefined(field3)) {
				if (angular.isUndefined(field4)) {
					return field1 && field2;
				} else {
					return false;
				}
			}
			if (angular.isUndefined(field4)) {
				return field1 && field2 && field3;
			}
			if (angular.isUndefined(field5)) {
				return field1 && field2 && field3 && field4;
			}
			return field1 && field2 && field3 && field4 && field5;
		};

		newUserRegCtrl.fieldValidationsOR = function (field1, field2, field3, field4) {
			return (field1 || field2 || field3 || field4);
		};
		// Initialize all the data for the widget
		function initialize() {
			newUserRegCtrl.errorForLength = {};
			newUserRegCtrl.disableNextB = true;
			newUserRegCtrl.OTPError = false;
			newUserRegCtrl.toggleTabs = {
				newone1: true,
				newone2: false,
				newone3: false
			};
			newUserRegCtrl.openTermsAndConditions = false;
			newUserRegCtrl.showSuccessPage = false;
			getCardBinList();
			newUserRegCtrl.OTPFlag = true;
			newUserRegCtrl.otpValue = '';
			newUserRegCtrl.rsaEnabled = false;
			newUserRegCtrl.showTabs = false;
			newUserRegCtrl.loginIdAvailable = false;
			newUserRegCtrl.loginIdNotAvailable = false;
			newUserRegCtrl.showRegistrationForm = false;
			newUserRegCtrl.showSuccessForm = false;
			newUserRegCtrl.enableSubmit = true;
			matchPasswordCount = 0;
			newUserRegCtrl.cancelTransaction = false;
			newUserRegCtrl.errors = {};
			customerFirstName = '';
			customerDOB = '';
			customerMob = '';
			newUserRegCtrl.userIdSuggestion1 = '';
			newUserRegCtrl.userIdSuggestion2 = '';
			newUserRegCtrl.userIdSuggestion3 = '';
			newUserRegCtrl.customerMobMasked = '';
			newUserRegCtrl.lockFields = false;
			newUserRegCtrl.challengelater = false;
			newUserRegCtrl.expiryYearList = [];
			newUserRegCtrl.expiryMonthList = ['01', '02', '03', '04', '05'
					, '06', '07', '08', '09', '10', '11', '12'];
			newUserRegCtrl.passwordPolicy = '/^(?=.*\\d)(?=.*[a-zA-Z])[^ ]{6,15}$/';
			newUserRegCtrl.note = true;
			newUserRegCtrl.serviceError = false;
			newUserRegCtrl.errorSpin = false;
			profitCntrCode = '';
			newUserRegCtrl.disableInvalidCardNext = false;
			newUserRegCtrl.alert = {
				messages: {
					NO_MOBILE_REGISTERED: IdfcConstants.ERR_NO_MOBILE_REGISTERED
				}
			};
			// Resetting forms and values
			newUserRegCtrl.control = {
				loginId: {
					value: '',
					disable: false,
					errors: [],
					loading: false
				},
				password: {
					value: '',
					errors: [],
					loading: false
				},
				confirmPassword: {
					value: '',
					errors: [],
					loading: false
				},
				securityQuestion: {
					value: '',
					options: [{
						'value': 'value1',
						'text': 'What is your nickname?'
					}, {
						'value': 'value2',
						'text': 'What is your hometown?'
					}],
					loading: false
				},
				securityAnswer: {
					value: '',
					errors: [],
					loading: false
				},
				locale: {
					value: '',
					options: [{
						'value': 'en',
						'text': 'English'
					}, {
						'value': 'fr',
						'text': 'French'
					}, {
						'value': 'nl',
						'text': 'Dutch'
					}, {
						'value': 'it',
						'text': 'Italian'
					}],
					loading: false
				},
				otp: {
					value: '',
					errors: [],
					loading: false
				},
				marketingContent: {
					value: ''
				},
				customerType: {
					value: ''
				},
				cardNumber: {
					value: '',
					errors: [],
					loading: false
				},
				cvv: {
					value: '',
					errors: [],
					loading: false
				},
				expiryMonth: {
					value: '',
					errors: [],
					loading: false
				},
				expiryYear: {
					value: '',
					errors: [],
					loading: false
				},
				accountNumber: {
					value: '',
					errors: [],
					loading: false
				},
				ucic: {
					value: '',
					errors: [],
					loading: false
				},
				mobilenumber:{
					value: '',
					errors: [],
					loading: false
				},
				loanAccount: {
					value: '',
					errors: [],
					loading: false
				},
				acceptTnC: false
			};
			/**
			 * template
			 * @desc creates a template for NewUserLogin.html
			 */
			newUserRegCtrl.templates = {
				newUser: partialsDir + '/NewUserLogin.html',
            acceptTC: acceptdir + '/index.html',
				successful: partialsDir + '/Success.html'
			};
			newUserRegCtrl.alerts = [];
			newUserRegCtrl.UcicForm = {};
			newUserRegCtrl.UcicForm.submitted = false;
			newUserRegCtrl.forms.customerAccountForm = {};
			newUserRegCtrl.resetUcicForm();
			newUserRegCtrl.forms.debitCardForm = {};
			newUserRegCtrl.resetCustomerAccountForm();
			newUserRegCtrl.forms.customerLoanForm = {};
			newUserRegCtrl.resetCustomerLoanForm();
			newUserRegCtrl.forms.debitCardForm = {};
			newUserRegCtrl.resetCardForm();
			newUserRegCtrl.resetalert();
			newUserRegCtrl.resetpass();
			newUserRegCtrl.registrationForm = {};
			newUserRegCtrl.registrationForm.submitted = false;
			newUserRegCtrl.OTPform = {};
			newUserRegCtrl.OTPform.submitted = false;
		}
		// Code to refresh lpWidget on reload
		LauncherDeckRefreshContent.setup(lpCoreBus, initialize).listen(lpWidget);
        initialize();
          // $timeout(function(){
          //       gadgets.pubsub.publish('cxp.item.loaded', {
          //           id: widget.id
          //       });
          //   }, 10);
	}
	/**
	 * Export Controllers
	 */
	exports.NewUserController = NewUserController;
});