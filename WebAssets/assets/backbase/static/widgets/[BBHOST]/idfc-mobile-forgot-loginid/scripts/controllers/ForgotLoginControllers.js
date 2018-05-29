/**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {
		'use strict';
		var $ = require('jquery');

		/**
		 * Main controller
		 * @ngInject
		 * @constructor
		 */

		function ForgotLoginIdCtrl($scope, $timeout, lpWidget, lpCoreUtils, lpCoreBus, lpPortal, forgotLoginService, IdfcUtils, 
									IdfcConstants, IdfcError, LauncherDeckRefreshContent) {

            gadgets.pubsub.subscribe('launchpad-retail.goToForgotUsername');
			var forgotIdCtrl = this,
				customerFirstName, customerDOB, customerMob, customerIDServiceEndPoint, accountNumberServiceEndPoint, 
				debitCardServiceEndPoint, enquireCardNumberServiceEndPoint, generateOTPServiceEndPoint, verifyOTPServiceEndPoint,
				forgotLoginIdServiceEndPoint, verifyDebitCardBinServiceEndPoint, partialsDir, date, verifyCardList, cardNoLength, 
				emailId, dob, checkMonth, checkYear, alert, databaseService, retVar, loanNumberServiceEndPoint, ALERT_TIMEOUT = 9000;

			var DEBIT_CARD_LENGTH = IdfcConstants.DEBIT_CARD_LENGTH;
			var OTP_SUCCESS_MESSAGE = IdfcConstants.OTP_SUCCESS_MESSAGE;
            
            /*Loan PL*/
            var LOAN_ACCOUNT_NUMBER_LENGTH = IdfcConstants.LOAN_ACCOUNT_NUMBER_LENGTH;
            /*Loan PL end*/

			function initialize() {
				$('.forgotLoginId-panelwidth').closest('.lp-launcher-area').css('max-width', '630px');
				forgotIdCtrl.toggleTabs = {
					newone1: true,
					newone2: false,
					newone3: false
				};
				forgotIdCtrl.lockFieldsOTP = false;
				customerIDServiceEndPoint = lpWidget.getPreference('customerIDService');
				//accountNumberServiceEndPoint = lpWidget.getPreference('accountNumberService');
                accountNumberServiceEndPoint = lpWidget.getPreference('validateLoanCasaAccnt');
				debitCardServiceEndPoint = lpWidget.getPreference('debitCardService');
				enquireCardNumberServiceEndPoint = lpWidget.getPreference('enquireDebitCardNumberService');
				generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
				verifyOTPServiceEndPoint = lpWidget.getPreference('verifyOTPService');
				forgotLoginIdServiceEndPoint = lpWidget.getPreference('forgotLoginIdService');
				verifyDebitCardBinServiceEndPoint = lpWidget.getPreference('verifyDebitCardBin');
                /*Loan PL start */
                loanNumberServiceEndPoint = lpWidget.getPreference('validateLoanAccountNumber');
                console.log("loanNumberServiceEndPoint: "+loanNumberServiceEndPoint);
                /*Loan PL end*/
                getCardBinList();
				clearAlerts();
				customerFirstName = '';
				customerDOB = '';
				customerMob = '';
				partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
				date = new Date();
				alert = {
					messages: {
						SAVED_SUCCESSFULLY: 'No mobile number registered. Please contact customer care.'
					}
				};

				forgotIdCtrl.errors = {};
				forgotIdCtrl.customerMobMasked = '';
				forgotIdCtrl.lockFields = false;
				forgotIdCtrl.successForm = false;
				forgotIdCtrl.note = true;
				forgotIdCtrl.serviceError = false;
				forgotIdCtrl.errorSpin = false;
				forgotIdCtrl.showTabs = false;
				forgotIdCtrl.OTPFlag = false;
				forgotIdCtrl.alerts = [];
				forgotIdCtrl.otpValue = '';
				forgotIdCtrl.cardNoReqError = false;
				forgotIdCtrl.cardNolenError = false;
				forgotIdCtrl.wrongCardNo = false;
				forgotIdCtrl.accNoReqError = false;
				forgotIdCtrl.accNolenError = false;
				forgotIdCtrl.wrongAccNo = false;
				forgotIdCtrl.otpReqError = false;
				forgotIdCtrl.otpMinLengthError = false;
				forgotIdCtrl.otpMaxLengthError = false;
				forgotIdCtrl.inValidOTP = false;
				forgotIdCtrl.OTPError = false;

				forgotIdCtrl.control = {
					otp: {
						value: '',
						errors: [],
						loading: false
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
					}

				};

				/**
				 * template
				 * @desc creates a template for Success.html
				 */
				forgotIdCtrl.templates = {

					successful: partialsDir + '/Success.html'

				};
			};


			/**
				Get debit card number list
			**/
			function getCardBinList() {

				var verifyCardBinServiceURL = lpCoreUtils.resolvePortalPlaceholders(verifyDebitCardBinServiceEndPoint, {
					servicesPath: lpPortal.root
				});


				forgotLoginService
					.setup({
						verifyCardBinServiceURL: verifyCardBinServiceURL + '?cnvId=OTD',
						data: null
					})
					.verifyCardBinService()
					.success(function (data, status, headers, config) {
						verifyCardList = data;
					}).error(function (error, status, headers, config) {
						verifyCardList = [];
					});
			}

			/**
			 *  validateCardNumber method
			 * @desc checks debit card number is valid
			 */
			function validateCardNumber(value) {
				forgotIdCtrl.errors['debitCardNumberCheck'] = false;
				if (value != null && value.length === DEBIT_CARD_LENGTH) {
					var xhr;
					forgotIdCtrl.errorSpin = true;
					xhr = validateDebitCardNumber();

					xhr.success(function (data, status, headers, config) {
						forgotIdCtrl.errorSpin = false;
						if (IdfcUtils.hasContentData(data)) {
							forgotIdCtrl.errors['debitCardNumberCheck'] = false;
						}
					});
					xhr.error(function (error, status, headers, config) {
						forgotIdCtrl.errorSpin = false;
						forgotIdCtrl.errors['debitCardNumberCheck'] = true;
						forgotIdCtrl.serviceError = IdfcError.checkGlobalError(error);
						
					});
				}
			}

			/**
			 *  validUCIC method
			 * @desc checks UCIC is valid
			 */
			function validUCIC() {
				var UCICcheck = IdfcUtils.validateUCIC(forgotIdCtrl.control.ucic.value);
				if (UCICcheck) {
					forgotIdCtrl.errors['ucicCheck'] = UCICcheck;
				} else {
					return true;
				}
			}

			/**
			 *  validDebitCard method
			 * @desc checks Debit Card number is valid
			 */
			function validDebitCard() {
				var debitCardCheck = IdfcUtils.validateDebit(forgotIdCtrl.control.cardNumber.value);
				if (debitCardCheck) {
					forgotIdCtrl.errors['debitCheck'] = debitCardCheck;
				} else {
					forgotIdCtrl.errors['debitCheck'] = false;
					return true;
				}
			};

			/**
			 *  validAccountNo method
			 * @desc checks account number is valid
			 */
			function validAccountNo() {
				var accountNumberCheck = IdfcUtils.validateAccount(forgotIdCtrl.control.accountNumber.value);
				if (accountNumberCheck) {
                    var loanAccountNumberCheck = validateLoanAccount(forgotIdCtrl.control.accountNumber.value);
                    if(loanAccountNumberCheck){
                        forgotIdCtrl.errors['accountCheck'] = accountNumberCheck;
                    }
                    else{
                        return true;
                    }
				} else {
					return true;
				}
			}

            /*Loan PL start*/
            /**
			 *  validLoanAccountNo method
			 * @desc checks loan account number is valid
			 */
            function validateLoanAccount(loanAccountNo) {
                if(loanAccountNo.length > LOAN_ACCOUNT_NUMBER_LENGTH){
                    return true;
                }
                if(loanAccountNo.length < LOAN_ACCOUNT_NUMBER_LENGTH){
                    return true;
                }
                return false;
            };
            
//            function validLoanAccountNo(){
//                var loanAccountNumberCheck = validateLoanAccount(forgotIdCtrl.control.loanAccount.value);
//                if(loanAccountNumberCheck){
//                    forgotIdCtrl.errors['loanAccountCheck'] = loanAccountNumberCheck;
//                }
//                else{
//                    return true;
//                }
//            };
            /*Loan PL end*/
            
            
			/**
			 *  validate method
			 * @desc validates the user
			 */
			function validate(type) {

				var xhr;
				var accountNumberServiceURL = lpCoreUtils.resolvePortalPlaceholders(accountNumberServiceEndPoint, {
					servicesPath: lpPortal.root
				});

				if (type === 'Account') {
					var postData = {
						'customerId': forgotIdCtrl.control.ucic.value,
						'accountNumber': forgotIdCtrl.control.accountNumber.value,
						'transaction': 'forgetUsername'
					};
					postData = $.param(postData || {});

					xhr = forgotLoginService
						.setup({
							accountNumberServiceURL: accountNumberServiceURL,
							data: postData
						})
						.accountNumberService();
				}
                
                /*Loan PL start*/
//                else if (type === 'LoanAccount') {
//                    
//                    var loanNumberServiceURL = lpCoreUtils.resolvePortalPlaceholders(loanNumberServiceEndPoint, {
//					   servicesPath: lpPortal.root
//				    });
//                    var postData = {
//				        'customerId': forgotIdCtrl.control.ucic.value,
//				        'loanAccNo':  forgotIdCtrl.control.loanAccount.value
//				    };
//                    postData = $.param(postData || {});
//		            
//                    xhr = forgotLoginService
//                    .setup({
//							loanNumberServiceURL: loanNumberServiceURL,
//							data: postData
//						})
//				    .loanNumberService();
//                }
                /*Loan PL end*/
				return xhr;
			}

			/**
			 *  validateDebitCardNumber method
			 * @desc validates the debit card number
			 */
			function validateDebitCardNumber() {

				var xhr;

				var debitCardNumberServiceURL = lpCoreUtils.resolvePortalPlaceholders(enquireCardNumberServiceEndPoint, {
					servicesPath: lpPortal.root
				});

				var postData = {
					'customerId': forgotIdCtrl.control.ucic.value,
					'debitCardNumber': forgotIdCtrl.control.cardNumber.value
				};

				postData = $.param(postData || {});

				return forgotLoginService
					.setup({
						debitCardNumberServiceURL: debitCardNumberServiceURL,
						data: postData
					})
					.debitCardNumberService();
			}


			/**
				Checks whether the Debit Card Number is valid and belongs to customer
        	**/
			$scope.$watch('forgotIdCtrl.control.cardNumber.value', function (value) {
				validateCardNumber(value);
			});

			/**
				Checks whether the Expiry Month is valid or not
			**/
			$scope.$watch('forgotIdCtrl.control.expiryMonth.value', function (value) {
				if (value > 12 || value === '00') {
					checkMonth = true;
				} else if (value < getMonth() && forgotIdCtrl.control.expiryYear.value === 15) {
					checkMonth = true;
				} else {
					checkMonth = false;
				}
			});

			/**
				Checks whether the Expiry Year is valid or not
			**/
			$scope.$watch('forgotIdCtrl.control.expiryYear.value', function (value) {
				if (value > 50 || value === '00' || (value < 15 && value > 0)) {
					checkYear = true;
					checkMonth = false;
				} else if (value === 15 && forgotIdCtrl.control.expiryMonth.value < getMonth()) {
					checkMonth = true;
				} else if (value > 15 && forgotIdCtrl.control.expiryMonth.value < getMonth()) {
					checkMonth = false;
				} else {
					checkYear = false;
				}
			});

			/**
			 *  verifyOTP method
			 * @desc validates the UCIC
			 */
			function authenticateUCIC() {

				var customerIDServiceURL = lpCoreUtils.resolvePortalPlaceholders(customerIDServiceEndPoint, {
					servicesPath: lpPortal.root
				});
                console.log("customerIDServiceURL: "+customerIDServiceURL);
				var postData = {
					'customerId': forgotIdCtrl.control.ucic.value,
					'requestType': 'credential',
					'transaction': 'forgetUsername',
					'mobilenumber': forgotIdCtrl.control.mobilenumber.value
				};
				postData = $.param(postData || {});

				return forgotLoginService
					.setup({
						customerIDServiceURL: customerIDServiceURL,
						data: postData
					})
					.customerIDService12();
			}

			/**
			 *  authenticateUser method
			 * @desc validates the user
			 */
			function authenticateUser() {

				forgotLoginService
					.setup({
						customerIDService: customerIDService,
						data: forgotIdCtrl.control.ucic.value
					})
					.customerIDService34()
					.success(function (data, status, headers, config) {}).error(function (error, status, headers, config) {});
			};


			/**
				finds out current month
			**/
			function getMonth() {
				var month = date.getMonth() + 1;
				return month < 10 ? '0' + month : '' + month;
			}

			/**
				Sending Email
			**/
			function sendEmail() {
				var forgotLoginIdServiceURL = lpCoreUtils.resolvePortalPlaceholders(forgotLoginIdServiceEndPoint, {
					servicesPath: lpPortal.root
				});

				var postData = {
					'customerId': forgotIdCtrl.control.ucic.value,
					'emailId': emailId,
					'dob': dob,
					'customerFirstName': customerFirstName,
					'mobileNumber': customerMob

				};
				postData = $.param(postData || {});
				forgotIdCtrl.errorSpin = true;
				var xhr = forgotLoginService
					.setup({
						forgotLoginIdServiceURL: forgotLoginIdServiceURL,
						data: postData
					})
					.forgotLoginIdService();

				xhr.success(function (data) {

					forgotIdCtrl.errorSpin = false;
					forgotIdCtrl.successForm = !forgotIdCtrl.successForm;
					forgotIdCtrl.loginId = data.username;
				});
				xhr.error(function (error) {

					forgotIdCtrl.errorSpin = false;
					forgotIdCtrl.error = {
						happened: true,
						msg: error.rsn
					};
				});

			}


			/**
				Alerts
         	**/
			function addAlert(code, type, timeout) {
				var customAlert = {
					type: type || 'error',
					msg: alert.messages[code]
				};

				forgotIdCtrl.alerts.push(customAlert);

				if (timeout !== false) {
					$timeout(function () {
						forgotIdCtrl.closeAlert(forgotIdCtrl.alerts.indexOf(customAlert));
					}, ALERT_TIMEOUT);
				}

			}

			/**
			Clear arr alert messages
        **/
			function clearAlerts() {
				forgotIdCtrl.alerts = [];
			};

			//Scope Functions
			/**
				verification of debit card first six digits
			**/
			forgotIdCtrl.validateCardFirstSixDigits = function (cardNumber) {
				forgotIdCtrl.cardForm.digits = false;

				if (verifyCardList.length > 0) {
					if (cardNumber != null) {
						cardNoLength = cardNumber.toString().length;
					}
					var flag = false;
					if (cardNoLength > 0 && cardNoLength < 7) {
						for (var i = 0; i < verifyCardList.length; i++) {
							if (cardNumber === verifyCardList[i].toString().substring(0, cardNoLength)) {
								flag = true;
								break;
							}
						}
						if (flag) {
							forgotIdCtrl.cardForm.digits = false;
						} else {
							forgotIdCtrl.cardForm.digits = true;
							forgotIdCtrl.cardNolenError = false;
							forgotIdCtrl.wrongCardNo = false;

						}
					}
				}
			};

			/**
			 *  changeTab method
			 * @desc changes tab
			 */
			forgotIdCtrl.changeTab = function () {
			    gadgets.pubsub.publish("js.back", {
                     data: "ENABLE_BACK"
                });
				forgotIdCtrl.note = false;
				forgotIdCtrl.OTPFlag = true;
				forgotIdCtrl.lockFields = false;

			};
			/**
			 *  resetUcicForm method
			 * @desc clears UCIC form fields
			 */

			forgotIdCtrl.resetUcicForm = function () {
				forgotIdCtrl.control.ucic.value = '';
				forgotIdCtrl.alerts = [];
				forgotIdCtrl.customerIdReqError = false;
				forgotIdCtrl.customerIdLenError = false;
				forgotIdCtrl.customerIdPatternError = false;
				forgotIdCtrl.mobNumberReqError = false;
				forgotIdCtrl.mobNumberPatternError = false;
				forgotIdCtrl.mobNumberLenError = false;
				forgotIdCtrl.control.mobilenumber.value='';
			};

			/**
			 *  resetCustomerAccountForm method
			 * @desc clears Account form fields
			 */
			forgotIdCtrl.resetCustomerAccountForm = function () {
				forgotIdCtrl.control.accountNumber.value = '';
				forgotIdCtrl.alerts = [];
				forgotIdCtrl.accNoReqError = false;
				forgotIdCtrl.accNolenError = false;
				forgotIdCtrl.wrongAccNo = false;
			};
            
            forgotIdCtrl.resetErrorMessage = function () {
				forgotIdCtrl.alerts = [];
				forgotIdCtrl.accNoReqError = false;
				forgotIdCtrl.accNolenError = false;
				forgotIdCtrl.wrongAccNo = false;
			};
            
            
			/**
			 *  resetCardForm method
			 * @desc clears Card form fields
			 */
			forgotIdCtrl.resetCardForm = function () {
				forgotIdCtrl.control.cardNumber.value = '';
				forgotIdCtrl.control.cvv.value = '';
				forgotIdCtrl.control.expiryMonth.value = '';
				forgotIdCtrl.control.expiryYear.value = '';
				forgotIdCtrl.alerts = [];
				forgotIdCtrl.cardNoReqError = false;
				forgotIdCtrl.cardNolenError = false;
				forgotIdCtrl.wrongCardNo = false;
				forgotIdCtrl.cardForm.digits = false;
			};
            
            
            /*Loan PL start - reset customer loan form*/
            forgotIdCtrl.resetCustomerLoanForm = function() {
                forgotIdCtrl.customerLoanForm.submitted = false;
                forgotIdCtrl.control.loanAccount.value = '';
                forgotIdCtrl.control.mobilenumber.value='';
                forgotIdCtrl.alerts = [];
            };
            /*Loan PL end*/

			/**
			 * openRegistrationForm method
			 * @desc opens login id creation form
			 */
			forgotIdCtrl.openRegistrationForm = function (openForm, type) {

				 if(forgotIdCtrl.errors['debitCardNumberCheck']) {
				    return false;
				} 
				forgotIdCtrl.errors = {};
				forgotIdCtrl.alerts = [];
				var xhr;
				if (type === 'DebitCard') {
					if (openForm.submitted && openForm.cardNo.$error.required) {
						forgotIdCtrl.cardNoReqError = true;
					} else {
						forgotIdCtrl.cardNoReqError = false;
					}

					if (!validDebitCard() || !openForm.$valid) {

						if (openForm.submitted && forgotIdCtrl.errors['debitCheck'] &&
							!(openForm.cardNo.$error.required) && (openForm.cardNo.$error.pattern)) {
							forgotIdCtrl.cardNolenError = true;
						} else {
							forgotIdCtrl.cardNolenError = false;
						}
						if (forgotIdCtrl.errors['debitCardNumberCheck'] &&
							!(openForm.cardNo.$error.pattern) && !(openForm.cardNo.$error.required)) {
							forgotIdCtrl.wrongCardNo = true;
						} else {
							forgotIdCtrl.wrongCardNo = false;
						}
						if (openForm.digits) {
							forgotIdCtrl.cardNolenError = false;
							forgotIdCtrl.wrongCardNo = false;
						}
						retVar = false;

					} else if (checkMonth || checkYear) {
						retVar = false;
					} else {
						forgotIdCtrl.cardNolenError = false;
						forgotIdCtrl.errorSpin = true;
						//forgotIdCtrl.generateOTP('send');
						$scope.readSMS('send');
					}

				} else if (type === 'Account') {
					if (openForm.submitted && openForm.accountNo.$error.required) {
						forgotIdCtrl.accNoReqError = true;
					} else {
						forgotIdCtrl.accNoReqError = false;
					}
					if (!validAccountNo() || !openForm.$valid) {
						if (openForm.submitted && forgotIdCtrl.errors['accountCheck'] &&
							!(openForm.accountNo.$error.required) && !(openForm.accountNo.$error.pattern)) {
							forgotIdCtrl.wrongAccNo = false;
							forgotIdCtrl.accNolenError = true;
						} else {
							forgotIdCtrl.accNolenError = false;
						}
						retVar = false;
					} else {
						forgotIdCtrl.errorSpin = true;
						xhr = validate(type);
						xhr.success(function (data, status, headers, config) {
							forgotIdCtrl.errorSpin = false;
							forgotIdCtrl.wrongAccNo = false;
							forgotIdCtrl.accNolenError = false;
							if (data && data !== 'null') {
							/*if ((IdfcUtils.hasContentData(data))) {*/
								forgotIdCtrl.errorSpin = true;
								//forgotIdCtrl.generateOTP('send');
								$scope.readSMS('send');
                                gadgets.pubsub.publish(
                                "js.back", {
                                    data: "ENABLE_HOME"
                                });
							}
						});
						xhr.error(function (error, status, headers, config) {
							forgotIdCtrl.errorSpin = false;
							forgotIdCtrl.accNolenError = false;
							 if (status == 0) {
                                gadgets.pubsub.publish(
                                    "no.internet");
                            } else {
                                var code = error.cd;
                                if (code === 'CID02') {
                                    forgotIdCtrl.errors['validAccount'] = true;
                                    if (openForm.submitted && forgotIdCtrl.errors['validAccount'] &&
                                        !(openForm.accountNo.$error.required) && !(openForm.accountNo.$error.pattern)) {
                                        forgotIdCtrl.wrongAccNo = true;
                                    } else {
                                        forgotIdCtrl.wrongAccNo = false;
                                    }
                                } else {
                                    alert = {
                                        messages: {
                                            cd: error.rsn
                                        }
                                    };
                                    addAlert('cd', 'error', false);
							    }
							}
						});
					}
				}
                /*Loan PL start*/
                else if(type === 'LoanAccount'){
                console.log("in openregistration form");
                    if(!validLoanAccountNo() || !openForm.$valid){
                        return false;
                    }
                    forgotIdCtrl.errorSpin = true;
				    xhr = validate(type);

				    xhr.success(function(data, status, headers, config) {
				    console.log("in openregistration form success");
					   forgotIdCtrl.errorSpin = false;
					   if (data && data !== 'null') {
                           forgotIdCtrl.errorSpin = true;
                           //forgotIdCtrl.generateOTP('send');
                           $scope.readSMS('send');
                           forgotIdCtrl.errors['validLoanAccount'] = false;
					   }
				    });
				    xhr.error(function(error, status, headers, config) {
				    console.log("in openregistration form error");
					   forgotIdCtrl.errorSpin = false;
					   if (status == 0) {
                           gadgets.pubsub.publish(
                               "no.internet");
                       } else {
                           var code = error.cd;
                        // If service not available, set error flag
                       /* $scope.serviceError = checkGlobalError(data);*/
                           if(code === 'CID02')
                           {
                               forgotIdCtrl.errors['validLoanAccount'] = true;
                           }
                           else if(code == "511" && error.rsn == "Customer Number is not valid."){
                               forgotIdCtrl.errors['validLoanAccount'] = true;
                           }
                           else {
                              forgotIdCtrl.alert = {
                                  messages: {
                                      cd: error.rsn
                                  }
                              };
                              addAlert('cd', 'error', false);
                           }
					   }
                    });
                }
                /*Loan PL end*/
				/* if(type === 'Account')  */
				/* else if(type === 'DebitCard') */
				return retVar;
			};

			/**
			 * openTabs method
			 * @desc validates UCIC and show the shows the next form
			 */

			 gadgets.pubsub.subscribe("native.back", function(evt) {
                 angular.forEach(document.getElementsByClassName(
                     "tooltip"), function(e) {
                     e.style.display = 'none';
                 })
                 //document.getElementById("firstform").reset();
                 //document.getElementById("secondForm").reset();
                 //document.getElementById("thirdform").reset();

                 //Mobile adding this to clear account number on back button
                 $scope.control.accountNumber.value = '';
                 $scope.alerts = [];
                 //Mobile adding this to clear debit card details on back button
                 $scope.control.cardNumber.value = '';
                 $scope.control.cvv.value = '';
                 $scope.control.expiryMonth.value = '';
                 $scope.control.expiryYear.value = '';
                 $scope.alerts = [];

                 $scope.backToFirstScreen();
             });

             gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
                 if($scope.showTabs && $scope.OTPFlag) {
                     angular.forEach(document.getElementsByClassName(
                                      "tooltip"), function(e) {
                                      e.style.display = 'none';
                                  })
                                  //document.getElementById("firstform").reset();
                                  //document.getElementById("secondForm").reset();
                                  //document.getElementById("thirdform").reset();

                                  //Mobile adding this to clear account number on back button
                                  $scope.control.accountNumber.value = '';
                                  $scope.alerts = [];
                                  //Mobile adding this to clear debit card details on back button
                                  $scope.control.cardNumber.value = '';
                                  $scope.control.cvv.value = '';
                                  $scope.control.expiryMonth.value = '';
                                  $scope.control.expiryYear.value = '';
                                  $scope.alerts = [];

                                  $scope.backToFirstScreen();
                 }else {
                     gadgets.pubsub.publish("device.GoBack");
                 }
             });


			forgotIdCtrl.openTabs = function (UcicForm) {

				forgotIdCtrl.errors = {};
				forgotIdCtrl.alerts = [];
				forgotIdCtrl.OTPFlag = true;
				var returnValue =  false;

				var mobNo;
				var ucicNo;
                var testUcicNo = forgotIdCtrl.control.ucic;
                var testMobNo = forgotIdCtrl.control.mobilenumber;
                if(testMobNo != undefined){
                    mobNo = forgotIdCtrl.control.mobilenumber.value;
                    if(mobNo == undefined){
                        mobNo = "";
                    }
                }
                else{
                    mobNo = ""
                }
                if(testUcicNo != undefined){
                    ucicNo = forgotIdCtrl.control.ucic.value;
                    if(ucicNo == undefined){
                        ucicNo = "";
                    }
                }else{
                    ucicNo = "";
                }

                if(ucicNo.length == 0 && forgotIdCtrl.customerIdReqError == false){
                    forgotIdCtrl.customerIdReqError = true;
                    forgotIdCtrl.customerIdPatternError = false;
                    forgotIdCtrl.customerIdLenError = false;
                    if(ucicNo.length != 10 && ucicNo.length > 0){
                        forgotIdCtrl.customerIdReqError = false;
                        forgotIdCtrl.customerIdPatternError = false;
                        forgotIdCtrl.customerIdLenError = true;
                    }
                    returnValue = true;
                }

                if(mobNo.length == 0 && forgotIdCtrl.mobNumberReqError == false){
                    forgotIdCtrl.mobNumberReqError = true;
                    forgotIdCtrl.mobNumberPatternError = false;
                    forgotIdCtrl.mobNumberLenError = false;
                    if(mobNo.length != 10 && mobNo.length > 0){
                        forgotIdCtrl.mobNumberReqError = false;
                        forgotIdCtrl.mobNumberPatternError = false;
                        forgotIdCtrl.mobNumberLenError = true;
                    }
                    returnValue = true;
                }
                if(ucicNo.length != 10 && ucicNo.length > 0){
                        forgotIdCtrl.customerIdReqError = false;
                        forgotIdCtrl.customerIdPatternError = false;
                        forgotIdCtrl.customerIdLenError = true;
                        returnValue = true;
                 }
                 if(mobNo.length != 10 && mobNo.length > 0){
                        forgotIdCtrl.mobNumberReqError = false;
                        forgotIdCtrl.mobNumberPatternError = false;
                        forgotIdCtrl.mobNumberLenError = true;
                        returnValue = true;
                 }

                   var mobileRegex = /^[0-9]+$/;
                   var mobNoCheckResule = mobileRegex.test(mobNo);
                   if( mobNoCheckResule == false && forgotIdCtrl.mobNumberLenError != true && forgotIdCtrl.mobNumberReqError != true){
                        forgotIdCtrl.mobNumberReqError = false;
                        forgotIdCtrl.mobNumberPatternError = true;
                        forgotIdCtrl.mobNumberLenError = false;
                       returnValue = true;
                   }
                   var ucicRegex = /^[0-9]+$/;
                   var ucicCheckResule = ucicRegex.test(ucicNo);

                     if( ucicCheckResule == false && forgotIdCtrl.customerIdLenError != true && forgotIdCtrl.customerIdReqError != true){
                        forgotIdCtrl.customerIdReqError = false;
                        forgotIdCtrl.customerIdPatternError = true;
                        forgotIdCtrl.customerIdLenError = false;
                        returnValue = true;
                     }

                 if(returnValue ==  true){
                    return;
                 }

				/*if (UcicForm.submitted && UcicForm.uid.$error.required) {
					forgotIdCtrl.customerIdReqError = true;
					forgotIdCtrl.customerIdPatternError = false;
					forgotIdCtrl.customerIdLenError = false;
					returnValue ==  true;

				}

                if (UcicForm.submitted && UcicForm.mobilenumber.$error.required) {
                    forgotIdCtrl.mobNumberReqError = true;
                    forgotIdCtrl.mobNumberPatternError = false;
                    forgotIdCtrl.mobNumberLenError = false;
                    returnValue ==  true;
                }*/




				/*if (UcicForm.submitted && forgotIdCtrl.errors['ucicCheck'] && !(UcicForm.uid.$error.required) &&
					!(UcicForm.uid.$error.pattern)) {
					forgotIdCtrl.customerIdLenError = true;
				} else {
					forgotIdCtrl.customerIdLenError = false;
				}*/
/*console.log("validUCIC");
console.log("validUCIC: "+validUCIC());
console.log("UcicForm.$valid: "+UcicForm.$valid);*/
				if (validUCIC() && UcicForm.$valid) {
					var xhr;
					forgotIdCtrl.errorSpin = true;
					xhr = authenticateUCIC();

					xhr.success(function (data, status, headers, config) {
					console.log("success ");
						forgotIdCtrl.errorSpin = false;
						if ((IdfcUtils.hasContentData(data))) {
							customerFirstName = data.custFrstNm;
							dob = data.dob;
							customerMob = data.mblNm;
							emailId = data.emailId;
							forgotIdCtrl.customerMobMasked = '******' + customerMob.substr(customerMob.length - 4);
							forgotIdCtrl.showTabs = !forgotIdCtrl.showTabs;
							gadgets.pubsub.publish("js.back", {
                                data: "ENABLE_BACK"
                            });
						}
					});
					xhr.error(function (error, status, headers, config) {
					console.log("err: "+error.rsn);
						forgotIdCtrl.errorSpin = false;
						 if (status == 0) {
                            gadgets.pubsub.publish(
                                "no.internet");
                        } else {
                            alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            addAlert('cd', 'error', false);
						}
					});
				}
			};

        $scope.getBack = function() {
            resetMVisaLoginFlag();
            resetScanAndPayFlag();
            gadgets.pubsub.publish("getBackToLoginScreen");
        };

        //mvisa-clear flag to break mvisa flow-show four limks and menu icon
        var resetMVisaLoginFlag = function(){
            console.log("called clearMVisaLoginFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin1){
                globalVariablePlugin1.clearMVisaLoginFlag(null,null,'');
            }
            else{
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

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

        //SMS Reading -- Start
         //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt){
            console.log(evt.resendOtpFlag)
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.readSMS('resend');
        });

        $scope.readSMS = function(resendFlag){
            console.log('Read SMS called');
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
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
                                data: "ForgotUsername"
                            });

                            //Step 2. Send request to "sendOTP service
                            console.log('Resend flag->'+resendFlag);
                            //Fix for issue 5328

                                forgotIdCtrl.generateOTP(resendFlag);



                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("ForgotUsername", function(evt){
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
                                forgotIdCtrl.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :'+forgotIdCtrl.otpValue);
                                angular.element('#verifyOTP-btn-forgot-username').triggerHandler('click');
                                //angular.element('#myselector').trigger('click');


                            });
                        }
                        else{
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            console.log('Resend flag->'+resendFlag);
                                forgotIdCtrl.generateOTP(resendFlag);

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



			/**
			 * generateOTP method
			 * @desc generates OTP
			 */
			forgotIdCtrl.generateOTP = function (value) {
				if (!customerMob || customerMob === '') {
					addAlert('SAVED_SUCCESSFULLY', 'error', false);
					retVar = false;
				} else {
					var resendOTP = null;
					var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(generateOTPServiceEndPoint, {
						servicesPath: lpPortal.root
					});

					if (value === 'resend') {
						resendOTP = true;
					} else {
						resendOTP = false;
					}
					var postData = {
						'customerId': forgotIdCtrl.control.ucic.value,
						'mobileNumber': customerMob,
						'resendOTP': resendOTP,
						'transaction': 'forgetUsername'
					};

					postData = $.param(postData || {});

					var xhr = forgotLoginService
						.setup({
							generateOTPServiceURL: generateOTPServiceURL,
							data: postData
						})
						.generateOTPService();
						forgotIdCtrl.errorSpin = true;
					/* Check whether the HTTP Request is successful or not. */
					xhr.success(function (data) {
					    gadgets.pubsub.publish("js.back", {
                            data: "ENABLE_HOME"
                        });
						forgotIdCtrl.errorSpin = false;
						forgotIdCtrl.success = {
							happened: true,
							msg: OTP_SUCCESS_MESSAGE
						};
						forgotIdCtrl.error = {
							happened: false,
							msg: ''
						};

						forgotIdCtrl.OTPFlag = false;
						forgotIdCtrl.lockFields = true;

					}).error(function (error, status, headers, config) {

						gadgets.pubsub.publish("stopReceiver",{
                            data:"Stop Reading OTP"
                        });
                        forgotIdCtrl.errorSpin = false;
                        if (status == 0) {
                            gadgets.pubsub.publish(
                                "no.internet");
                        } else {
                            if (error.cd && error.cd === '501') {
                                alert = {
                                    messages: {
                                        cd: error.rsn
                                    }
                                };
                                addAlert('cd', 'error', false);

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

                                forgotIdCtrl.lockFieldsOTP = true;
                            }
                            forgotIdCtrl.error = {
                                happened: true,
                                msg: error.rsn
                            };
                            forgotIdCtrl.success = {
                                happened: false,
                                msg: ''
                            };
                        }
					});
				}
				return retVar;
			};


			/**
			 * verifyOTP method
			 * @desc verifies OTP
			 */
			forgotIdCtrl.verifyOTP = function (OTPform) {
				if (OTPform.submitted && OTPform.otp.$error.required) {
					forgotIdCtrl.otpReqError = true;
				} else {
					forgotIdCtrl.otpReqError = false;
				}

				if (OTPform.submitted && OTPform.otp.$error.minlength) {
					forgotIdCtrl.otpMinLengthError = true;
				} else {
					forgotIdCtrl.otpMinLengthError = false;
				}

				if (OTPform.submitted && OTPform.otp.$error.maxlength) {
					forgotIdCtrl.otpMaxLengthError = true;
				} else {
					forgotIdCtrl.otpMaxLengthError = false;
				}

				if (OTPform.otp.$error.pattern) {
					forgotIdCtrl.inValidOTP = true;
				} else {
					forgotIdCtrl.inValidOTP = false;
				}

				if (OTPform.$valid) {
					var verifyOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(verifyOTPServiceEndPoint, {
						servicesPath: lpPortal.root
					});

					var postData = {
						'customerId': forgotIdCtrl.control.ucic.value,
						'otpValue': forgotIdCtrl.otpValue,
						'requestType': 'verifyOTP',
						'transaction': 'forgetUsername'

					};

					postData = $.param(postData || {});
					forgotIdCtrl.errorSpin = true;
					var xhr = forgotLoginService
						.setup({
							verifyOTPServiceURL: verifyOTPServiceURL,
							data: postData
						})
						.verifyOTPService();

					/* Check whether the HTTP Request is successful or not. */
					xhr.success(function (data) {
						if (data.sts === "00" || data.sts === "ACPT") {
						    gadgets.pubsub.publish("js.back", {
                                data: "ENABLE_HOME"
                            });
							forgotIdCtrl.errorSpin = false;
							forgotIdCtrl.OTPFlag = true;
							forgotIdCtrl.OTPError = false;
							sendEmail();
						} else {
							//added for showing error in case OTP is manipulated and we come to success block
							forgotIdCtrl.OTPError = true;
						}
					});

					xhr.error(function (error, status, headers, config) {
						forgotIdCtrl.errorSpin = false;
						if (status == 0) {
                            gadgets.pubsub.publish(
                                "no.internet");
                        } else {
                            if (error.cd && error.cd === '501') {
                                alert = {
                                    messages: {
                                        cd: error.rsn
                                    }
                                };
                                addAlert('cd', 'error', false);
                            }

                            forgotIdCtrl.lockFieldsOTP = IdfcError.checkOTPError(error);
                            forgotIdCtrl.error = {
                                happened: true,
                                msg: error.rsn
                            };

                            forgotIdCtrl.success = {
                                happened: false,
                                msg: ''
                            };
                        }
					});
				}
			};

			// Remove specific alert
			forgotIdCtrl.closeAlert = function (index) {
				forgotIdCtrl.alerts.splice(index, 1);
			};

			forgotIdCtrl.debitCardError = function (errPattern) {
				if (forgotIdCtrl.cardForm.cardNo.$error.pattern) {
					forgotIdCtrl.cardNoReqError = false;
					forgotIdCtrl.cardNolenError = false;
					forgotIdCtrl.wrongCardNo = false;
					forgotIdCtrl.cardForm.digits = false;
					retVar = true;
				} else {
					retVar = false;
				}
				return retVar;
			};

			forgotIdCtrl.AccountError = function (errPattern) {
				if (forgotIdCtrl.customerAccountForm.accountNo.$error.pattern) {
					forgotIdCtrl.accNoReqError = false;
					forgotIdCtrl.accNolenError = false;
					forgotIdCtrl.wrongAccNo = false;
					retVar = true;
				} else {
					retVar = false;
				}
				return retVar;
			};

			/* widget refresh code */
			LauncherDeckRefreshContent.setup(lpCoreBus, initialize).listen(lpWidget);
            initialize();
              $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
		}
		 

		/**
		 * Export Controllers
		 */
		exports.ForgotLoginIdCtrl = ForgotLoginIdCtrl;
	}

);
