/**
 * Controllers
 * @module controllers 
 */
define(function (require, exports, module) {

    'use strict';
	var $ = require('jquery');
    var uiSwitch = require('uiSwitch');
    var angularTouch = require('angular-touch');
	var idfcHanlder = require('idfcerror');
	
	
    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function MvisaPaymentController($scope, model, lpWidget, lpCoreUtils, lpPortal, $http, $filter, $timeout) {
		$scope.errorMessage = null; 
        this.state = model.getState();
        this.utils = lpCoreUtils;
        this.widget = lpWidget;
		
		var mVisaPaymentCtrl = this;
		mVisaPaymentCtrl.showCards = true;
		mVisaPaymentCtrl.showCardSummary = false;
		mVisaPaymentCtrl.showPaymentPage = false;
		mVisaPaymentCtrl.isOTPSent = false;
		mVisaPaymentCtrl.isCardMissmatch = false;
		mVisaPaymentCtrl.transactionTimeout = false;
		mVisaPaymentCtrl.isAttemptthreeTimes = false;
		mVisaPaymentCtrl.customerId = '';
		
		mVisaPaymentCtrl.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
		mVisaPaymentCtrl.template = {
			cards: mVisaPaymentCtrl.partialsDir + '/cards.html',
			summary: mVisaPaymentCtrl.partialsDir + '/summary.html',
			payment: mVisaPaymentCtrl.partialsDir + '/payment.html'
		};		
		
		function getDate(){	
			var months = new Array(12);
			months[0] = "January";
			months[1] = "February";
			months[2] = "March";
			months[3] = "April";
			months[4] = "May";
			months[5] = "June";
			months[6] = "July";
			months[7] = "August";
			months[8] = "September";
			months[9] = "October";
			months[10] = "November";
			months[11] = "December";

			var current_date = new Date();
			current_date.setDate(current_date.getDate());
			var month_value = current_date.getMonth();
			var day_value = current_date.getDate();
			var year_value = current_date.getFullYear();
			
			return day_value + ' ' + months[month_value] + ' ' + year_value;
			//document.write("The current date is " + months[month_value] + " " + day_value + ", " + year_value);		
		}			
		
		mVisaPaymentCtrl.crdDetails = null;
		mVisaPaymentCtrl.detail = {};
		mVisaPaymentCtrl.issue = '';
		mVisaPaymentCtrl.activeCardList = [];
		mVisaPaymentCtrl.zeroActiveCard = false;
		mVisaPaymentCtrl.customerCardSummary = {};
		mVisaPaymentCtrl.accList = [];
		mVisaPaymentCtrl.customerInfo = {};
		mVisaPaymentCtrl.loadCardList_loaded = false;
		mVisaPaymentCtrl.loadAccounts_loaded = false;
		mVisaPaymentCtrl.mvisaForm = {};
		//var globalVariablePlugin =cxp.mobile.plugins['GlobalVariables'];
		//mVisaPaymentCtrl.merchantInfo = globalVariablePlugin.getMVisaJson();
              var inputType = 'payee';
              var globalVariablePlugin =  cxp.mobile.plugins['GlobalVariables'];
              if (globalVariablePlugin) {
				  console.log('calling pre :::::::::::::::::::::::');
                   var isMVisaQRJsonSuccessCallback = function(data) {
                      console.log('Response: ' + data);
					  console.log('merchant info without parse :::::::::::::::::::::::::::::::: ', data);
					  console.log('merchant info :::::::::::::::::::::::::::::::: ', angular.fromJson(data['mVisaJsonString']));
					  mVisaPaymentCtrl.merchantInfo = angular.fromJson(data['mVisaJsonString']);
					  mVisaPaymentCtrl.merchantInfo.trnDate = getDate();
					  mVisaPaymentCtrl.entryType = mVisaPaymentCtrl.merchantInfo.entryType;
					  console.log('mVisaPaymentCtrl.entryType :::::::::::::::: ', mVisaPaymentCtrl.entryType);
                     // mVisaPaymentCtrl.mVisaQRJSON = angular.fromJson(data['mVisaQRJSON']);
                     // console.log('QR JSON: ' + mVisaPaymentCtrl.mVisaQRJSON);
                     // $scope.$apply();
                      if(inputType == 'QR'){
                        //scanAndPayCtrl.parseQRJson();
                      }else{
                        //Define function when user has used payeekey
						//console.log('merchant info :::::::::::::::::::::::::::::::: ', JSON.parse(data));
						//mVisaPaymentCtrl.merchantInfo = 
                      }
                   };
                   var isMVisaQRJsonErrorCallback = function(data) {
                       console.log('Error happened while communicating between native and hybrid');
                   };

                   globalVariablePlugin.getMVisaJson(
                       isMVisaQRJsonSuccessCallback,
                       isMVisaQRJsonErrorCallback
                   );
                } else {
                   console.log('Cant find Plugin');
              }		
		
		/*mVisaPaymentCtrl.merchantInfo = {
											"entryType": "M",
											"merchantId": "456visamerchant",
											"mrchntPAN": "",
											"tnCurrencyCode": "356",
											"trnAmt": 110,
											"trnFee": 10,
											"tipCnvFeeInd": "",
											"cnvFeePer": "",
											"remarks": "Visamerchant remarks",
											"mrchntTp": "6012",
											"intrchgTp": "VISA",
											"acqInstCntryCd": "IN",
											"trm_Ownr": "",
											"trm_Cty": "",
											"trm_Cntry": "",
											"mrchntPstlCd": "",
											"custPAN": "",
											"sndNm": "",
											"posEntryMd": "010",
											"bilNb": "",
											"mobNb": "",
											"strID": "",
											"lytNb": "",
											"refID": "",
											"cnsmID": "",
											"prps": "",
											"pyldFrmtInd": "",
											"pntIntMtd": "",
											"trmnlId": "",
											"prmryId": "",
											"scndryId": "",
											"tipCnvFeeAmt": "",
											"crc": ""
										};*/

		
		function sortByName(x,y) {
		  return ((x.crdSts == y.crdSts) ? 0 : ((x.crdSts > y.crdSts) ? 1 : -1 ));
		}		

        $scope.err = {
            happened: false,
            msg: ""
        };
        $scope.error = {
            happened: false,
            msg: ""
        };
        $scope.success = {
            happened: false,
            msg: ""
        };	
		$scope.otpError = {
			happened: false,
			msg: ""
		};	
		$scope.paymentError = {
			happened: false,
			msg: ""
		};
		$scope.mailError = {
			happened: true,
			msg: ""
		};
        var clrAllMessages = function(){
			$scope.err = {
				happened: false,
				msg: ""
			};
			$scope.error = {
				happened: false,
				msg: ""
			};
			$scope.success = {
				happened: false,
				msg: ""
			};	
			$scope.otpError = {
				happened: false,
				msg: ""
			};	
			$scope.paymentError = {
				happened: false,
				msg: ""
			};	
			$scope.mailError = {
				happened: true,
				msg: ""
			};	
            //mVisaPaymentCtrl.mvisaForm.OTP = '';	
            mVisaPaymentCtrl.isCardMissmatch = false;			
		};
 		
        $scope.alerts = [];

        $scope.addAlert = function(code, type, timeout) {
            var alert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };

            $scope.alerts.push(alert);

            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(alert));
                }, ALERT_TIMEOUT);
            }
        };		
		/**
		* async loading check for default calling functions
		*
		**/				
		var isCompleteAllAsyncReq = function(){
			$scope.errorSpin = true;
			if(mVisaPaymentCtrl.loadCardList_loaded == true && mVisaPaymentCtrl.loadAccounts_loaded == true){
				$scope.errorSpin = false;
			}
		};	
		/**
		* load all cards info for loggedin customer
		*
		**/				
		var loadCardList = function(){ 
			var cardDetailsEndPoint = lpWidget.getPreference('cardDetailSrc');
			var cardDetailsURL = lpCoreUtils.resolvePortalPlaceholders(cardDetailsEndPoint, {
				servicesPath: lpPortal.root
			});
			console.log(cardDetailsURL);
			
			console.log(cardDetailsURL);
			var request = $http({
				method: 'GET',
				url: cardDetailsURL,
				data: null,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}

			});
			request.success(function (data, status, headers, config) { 
					mVisaPaymentCtrl.detail = data.crdDtls;
					mVisaPaymentCtrl.detail.sort(sortByName);
					
					//mVisaPaymentCtrl.maskAccountNo(mVisaPaymentCtrl.detail);
					//mVisaPaymentCtrl.changeStatusFormat(mVisaPaymentCtrl.detail);   
					//method call for change status format
					for(var i = 0; i < mVisaPaymentCtrl.detail.length; i++)
					{   
				        console.log('card details ::::::::::::: ', mVisaPaymentCtrl.detail[i]);
						console.log('lower case ::::::::::::::::: ', mVisaPaymentCtrl.detail[i].cardName.toLowerCase().search('visa'));
				        /*if(mVisaPaymentCtrl.detail[i].crdSts.toLowerCase() == 'active' && (mVisaPaymentCtrl.detail[i].cardName.toLowerCase().search('visa') > -1 || mVisaPaymentCtrl.detail[i].cardName.toLowerCase().search('rupay') > -1)){
				            mVisaPaymentCtrl.activeCardList.push(mVisaPaymentCtrl.detail[i]);
						}*/
						var updateAccDtls = [];
						for(var innerCount = 0; innerCount < mVisaPaymentCtrl.detail[i].acctDtls.length; innerCount++){
							if('PRIMARY OPEN'===mVisaPaymentCtrl.detail[i].acctDtls[innerCount].acctSts){
								mVisaPaymentCtrl.detail[i].acctDtls[innerCount].acctNb = mVisaPaymentCtrl.detail[i].acctDtls[innerCount].acctNb.replace(/^0+/, '');
								updateAccDtls.push(mVisaPaymentCtrl.detail[i].acctDtls[innerCount]);
								break;
							}
							
						}
						mVisaPaymentCtrl.detail[i].acctDtls = updateAccDtls;
						if(mVisaPaymentCtrl.detail[i].crdSts.toLowerCase() == 'active' && (mVisaPaymentCtrl.detail[i].cardName.toLowerCase().search('visa') > -1 || mVisaPaymentCtrl.detail[i].cardName.toLowerCase().search('rupay') > -1)){
				            mVisaPaymentCtrl.activeCardList.push(mVisaPaymentCtrl.detail[i]);
					    }
					}
					/*if($scope.fromCardWidgets){
						 for(var cardSummaryObjCount in $scope.detail) {
							if($scope.crdDetails.maskCrdNb == $scope.detail[cardSummaryObjCount].crdNb) {
								$scope.detail1 = $scope.detail[cardSummaryObjCount];
							}
						}
						$scope.detail1.showfull = true;
					
					}else{
						$scope.openFirstCardsDetails();
					}*/
					
					if(mVisaPaymentCtrl.activeCardList.length == 0){
					   mVisaPaymentCtrl.zeroActiveCard = true;
								$scope.error = {
								happened: true,
								msg: "It seems you do not have any active debit card or your card is not eligible for this transaction. Please try another payment method."//error.data.rsn
								};					   
					}   
					mVisaPaymentCtrl.customerId = Number(data.crdDtls[0].cstmrId);
					console.log('account no ::::::::::::::::::::::::: ', data.crdDtls[0].acctDtls[0].acctNb);
					console.log('account sts ::::::::::::::::::::::::: ', data.crdDtls[0].acctDtls[0].acctSts);
					console.log('card list :::::::::::::::::::::::::::::: ', data);
					console.log('Customer Id:::::::::::::::',mVisaPaymentCtrl.customerId);
					console.log('active list ::::::::::::::', mVisaPaymentCtrl.activeAccList);

				})['catch'](function (error) { 
					//ctrl.loading = false;
					console.log("err obj first time :::::::::::::::::::::::::::: :", error);
					if (error.data.cd) {
						// If session timed out, redirect to login page
						idfcHanlder.checkTimeout(error.data);
						// If service not available, set error flag
						if ((error.data.cd === '302')) {
							    mVisaPaymentCtrl.zeroActiveCard = true;
								$scope.error = {
								happened: true,
								//msg: "Oops, none of your cards are active right now."//error.data.rsn
								msg : "It seems you do not have any active debit card or your card is not eligible for this transaction. Please try another payment method."
								};
						}
						//added else if block to solve issue 5620
						else if ((error.data.cd === '799')) {
                                mVisaPaymentCtrl.zeroActiveCard = true;
								$scope.error = {
								happened: true,
								msg: "It seems you do not have any active debit card or your card is not eligible for this transaction. Please try another payment method."//error.data.rsn
								};
						}
						else{
							    mVisaPaymentCtrl.zeroActiveCard = true;
								$scope.error = {
								happened: true,
								msg: error.data.rsn //"Oops, none of your cards are active right now."//error.data.rsn
								};
						}

						$scope.errorMessage = error.msg; //"Oops, none of your cards are active right now.";//error.msg;
						console.log("err obj :", error);
					}
			}).finally(function(d){
						mVisaPaymentCtrl.loadCardList_loaded = true;
						isCompleteAllAsyncReq();
			});			
		};
		/**
		* format acc no
		*
		**/		
		mVisaPaymentCtrl.maskAccountNo = function(listOfAccNo) {
			for (var countNo in listOfAccNo){
				var accountNumber = listOfAccNo[countNo].crdNb;
				var nonMaskedAccStart = accountNumber.substring(0,4);
				var nonMaskedAccEnd = accountNumber.substring(accountNumber.length-4,accountNumber.length);
				var maskPart = repeat('X', accountNumber.length-9);
				mVisaPaymentCtrl.detail[countNo].crdNb = nonMaskedAccStart+' '+maskPart.substring(0,4)+' '+maskPart.substring(4,8)+' '+nonMaskedAccEnd;
			}
		};		
		/**
		* load all accounts for loggedin customer
		*
		**/			
		var loadAccounts = function(){
			var accountDetailsEndPoint = lpWidget.getPreference('accountDetailSrc');
			var accDetailsURL = lpCoreUtils.resolvePortalPlaceholders(accountDetailsEndPoint, {
				servicesPath: lpPortal.root
			});
			var request = $http({
				method: 'GET',
				url: accDetailsURL,
				data: null,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}

			});
			request.success(function (data, status, headers, config) { 
                    mVisaPaymentCtrl.accList = data;
					console.log('account list ::::::::::::::::::: ', mVisaPaymentCtrl.accList);
					if (mVisaPaymentCtrl.accList.currentAccount.length) {
					  mVisaPaymentCtrl.currAccList = mVisaPaymentCtrl.accList.currentAccount; 
					}
					if (mVisaPaymentCtrl.accList.savingAccount.length) {
					  mVisaPaymentCtrl.savingAccList = mVisaPaymentCtrl.accList.savingAccount;
					}
                    if (mVisaPaymentCtrl.accList.homesaver.length) {
                        mVisaPaymentCtrl.homesaverAccList = mVisaPaymentCtrl.accList.homesaver;
                    }
					console.log('curr list ::::::::::::::::::: ', mVisaPaymentCtrl.currAccList);
                    console.log('saving list ::::::::::::::::::: ', mVisaPaymentCtrl.savingAccList);					
				})['catch'](function (error) { 
					//$scope.assets.loadingNow = false;
					if (error.data.cd) {
						idfcHanlder.checkTimeout(error.data);
						$scope.globalerror = idfcHanlder.checkGlobalError(error.data);
						$scope.error = {
							happened: true,
							msg: error.data.rsn
						};
					}
			}).finally(function(d){
              mVisaPaymentCtrl.loadAccounts_loaded = true;	
              isCompleteAllAsyncReq();			  
			});				
			
		};
		/**
		* function for customer info
		*
		**/		
		var loadCustomerDetails = function(){
			$scope.errorSpin = true;
			var customerDetailsEndPoint = lpWidget.getPreference('registerSessionSvc');
			var customerDetailsURL = lpCoreUtils.resolvePortalPlaceholders(customerDetailsEndPoint, {
				servicesPath: lpPortal.root
			});
			
			var request = $http({
				method: 'GET',
				url: customerDetailsURL,
				data: null,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}

			});
			request.success(function (data, status, headers, config) { 
                    mVisaPaymentCtrl.customerInfo = data;
                    console.log('customer info ::::::::::::::::::: ', mVisaPaymentCtrl.customerInfo);					
				})['catch'](function (error) { 
					$scope.assets.loadingNow = false;
					if (error.data.cd) {
						idfcHanlder.checkTimeout(error.data);
						$scope.globalerror = idfcHanlder.checkGlobalError(error.data);
						$scope.error = {
							happened: true,
							msg: error.data.rsn
						};
					}
			}).finally(function(d){
				$scope.errorSpin = false;
			});				
			
		};
		
		/**
		* function for autoread otp
		*
		**/
		
             gadgets.pubsub.subscribe("resend.otp", function(evt){
                //console.log('Resend hit native');
                console.log ('evt.resendOtpFlag:'+evt.resendOtpFlag);
                //Call function that is called on a click of "Resend OTP" button available on Widget
                //$scope.readSMS('resend');
				//Sending event for stopping OTP reading
				gadgets.pubsub.publish("stopReceiver",{
					data:"Stop Reading OTP"
				});
				 mVisaPaymentCtrl.generateOTP('resend');
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
                                    data: "MvisaPayment"
                                });

                                //Step 2. Send request to "sendOTP service
                                //console.log('Resend flag->'+resendFlag);
                                /*if(resendFlag==='resend'){								
                                    mVisaPaymentCtrl.generateOTP(resendFlag);
                                }*/


                                //Step 3: Subscribes for the event for receiving OTP
                                //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                                gadgets.pubsub.subscribe("MvisaPayment", function(evt){
                                    //alert(evt.otp);
                                    //var receivedOtp = evt.data;
                                    var receivedOtp = evt.otp;
                                    console.log('OTP: '+evt.otp);
                                    //Sending event for stopping OTP reading
                                    gadgets.pubsub.publish("stopReceiver",{
                                        data:"Stop Reading OTP"
                                    });

                                //Step 3.1: To receive events if user has cliked on resend OTP


                                    //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                    console.log('receivedOtp'+receivedOtp);
                                    mVisaPaymentCtrl.mvisaForm.OTP = receivedOtp;
                                    //$scope.$apply();
                                    console.log('OTP value :'+mVisaPaymentCtrl.mvisaForm.OTP);
                                    angular.element('#verifyOTP-btn-mvispaymnt').click();



                                });
                            }
                            else{
                                //User has not provided permission for SMS reading
                                //1. Send request to "sendOTP" service
                                console.log('Resend flag->'+resendFlag);
                                if(resendFlag==='resend'){
                                    $scope.generateOTP(resendFlag);
                                }
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
         * generateOTP to generate OTP on click of submit button
         * @param value
         */
		mVisaPaymentCtrl.resendAttemptCount = 0; 
		mVisaPaymentCtrl.verifyOTPReq = {}; 
        mVisaPaymentCtrl.generateOTP = function(value)
        {
            mVisaPaymentCtrl.incorrectOtpCount=0;
            $scope.errorSpin = true;
            clrAllMessages();		
            var resendOTP = null;
            // var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generateOTP'));
            $scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTP');
            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.generateOTPServiceEndPoint, {
                    servicesPath: lpPortal.root
                });

            if (value === 'resend') {
                resendOTP = 'true';
				mVisaPaymentCtrl.mvisaForm.OTP = '';
				/*mVisaPaymentCtrl.resendAttemptCount++;	
				if(mVisaPaymentCtrl.resendAttemptCount == 5){
					$scope.errorSpin = false;
					$scope.globalError = true;
					$scope.success = {
					   happened: false,
					   msg: ''
					};					
					$scope.otpError = {
						happened: true,
						msg: 'We have tried 5 times to send you the OTP'
					};		
					gadgets.pubsub.publish("stopReceiver",{
                                        data:"Stop Reading OTP"
                                    });								
				}*/
                			
            } else {
                resendOTP = 'false';
            }

            var postData = {
                'resendOTP': resendOTP,
				'transaction' : 'mVisaPayment',
				'resendCount' : mVisaPaymentCtrl.resendAttemptCount
            };
            postData = $.param(postData || {});
            var xhr = $http({
                method: 'POST',
                url: generateOTPServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            // Check whether the HTTP Request is successful or not.
            xhr
                .success(
                    function(data) {
						//var data = {'mobileNumber':'987654321'};
						mVisaPaymentCtrl.isOTPSent = true;
                        console.log('success otp response :::::::::::::::::::: ', data);
                        $scope.success = {
                            happened: true,
                            msg: 'OTP has been successfully sent to your registered mobile number'
                        };
                        $scope.error = {
                            happened: false,
                            msg: ''
                        };
						mVisaPaymentCtrl.verifyOTPReq.credentialType = data.credentialType;
                        var customerMob = data.mobileNumber;
						$timeout(function(){
							// show error if mobile no not found 
							if(!customerMob){
									$scope.success = {
									   happened: false,
									   msg: ''
									};
								    console.log('if no is empty:::::::::::::::::');
									$scope.otpError = {
										happened: true,
										msg: 'Something went wrong. Please try again.'
									};	
                                //return;									
							}							
							
							mVisaPaymentCtrl.mvisaForm.customerMob = '******' +
								customerMob
								.substr(customerMob.length - 4);	
								
						});
						mVisaPaymentCtrl.resendAttemptCount++;			
						//OTP reading function call
						$scope.readSMS();							
                    }).error(
                    function(data, status, headers, config) {
                           //alert("error"); 
						   console.log('error ::::::::::::::::: ', data);
                        //added for 5 times otp close popup
                        gadgets.pubsub.publish("stopReceiver",{
                            data:"Stop Reading OTP"
                        });
                        if (data.cd) {
                            idfcHanlder.checkTimeout(data);
                            if ((data.cd === '501')) {
                                $scope.serviceError = idfcHanlder
                                    .checkGlobalError(data);
                                $scope.alert = {
                                    messages: {
                                        cd: data.rsn
                                    }
                                };
                                $scope.addAlert('cd', 'error', false);
                                $scope.globalError = true;
                                $scope.otpError = {
                                    happened: true,
                                    msg: data.rsn
                                };

                            } else if ((data.cd === '701')) {
								mVisaPaymentCtrl.resendAttemptCount = 6;
								gadgets.pubsub.publish("stopReceiver",{
									data:"Stop Reading OTP"
								});									
                                $scope.success.happened = false;
                                $scope.otpError = {
                                    happened: true,
                                    msg: data.rsn
                                };
                                $scope.successClose = false;
                                //$scope.secondScreen = false;
                                if ($scope.credentialType == 'OTP' || $scope.credentialType == 'RSAOTP') {
                                    $scope.hideOTPFlag = false;
                                }
                                if ($scope.credentialType == 'RSAOTPANDQUESTION' || $scope.credentialType == 'OTPANDQUESTION') {
                                    $scope.hideCombineFlag = false;
                                }
                                $scope.lockFieldsOTP = true;
                                $scope.lockOTPTextSubmit = false;
                            } else {
                                $scope.alert = {
                                    messages: {
                                        cd: data.rsn
                                    }
                                };
                                $scope.addAlert('cd', 'error', false);
                                $scope.globalError = true;
                                $scope.otpError = {
                                    happened: true,
                                    msg: data.rsn
                                };
                            }
                        }
						mVisaPaymentCtrl.resendAttemptCount++;
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                        
                    }).finally(function(d){
						$scope.errorSpin = false;
						
					});
        }; 
		/**
		* resend otp function
		*
		**/
		//mVisaPaymentCtrl.resendAttemptCount = 0;
		mVisaPaymentCtrl.resendOTP = function(){
			clrAllMessages();
			mVisaPaymentCtrl.generateOTP('resend');
			$scope.submitted = false;
		};
		/**
		* verify otp function once hit confirm
		*
		**/
		mVisaPaymentCtrl.verifyOTP = function(isvalid){ //alert(isvalid); 
			if(!isvalid){
				mVisaPaymentCtrl.submitted = true;
				return false;
			}
			
			clrAllMessages();
			$scope.errorSpin = true;
			//mVisaPaymentCtrl.pay();
            var verifyOTPServiceURL = lpCoreUtils
                .resolvePortalPlaceholders(lpWidget
                    .getPreference('verifyOTP'));

			mVisaPaymentCtrl.verifyOTPReq.otpvalue = mVisaPaymentCtrl.mvisaForm.OTP;
			var otpData = mVisaPaymentCtrl.verifyOTPReq;
			otpData.transaction = 'mVisaPayment';
			otpData.customerId = mVisaPaymentCtrl.customerId.toString();
			console.log('verify otp request ::::::::::::::::: ', otpData);		
			
            otpData = $.param(otpData || {});
            var xhr = $http({
                method: 'POST',
                url: verifyOTPServiceURL,
				data: otpData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            //Check whether the HTTP Request is successful or not. 
            xhr.success(function(data) { 
                console.log("Inside success", data);
                $scope.otpError = {
                    happened: false,
                    msg: ''
                };
                //$scope.fundsTransferQuickPay(isFormValid, action);
				mVisaPaymentCtrl.pay();
            }).error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                console.log("Inside error" + data.cd + data.rsn);

                //4/5/17-added to show incorrect otp msg after tring 3 times
                mVisaPaymentCtrl.incorrectOtpCount++;
                console.log('incorrectOtpCount:',mVisaPaymentCtrl.incorrectOtpCount);
                if(mVisaPaymentCtrl.incorrectOtpCount==3){
                    data.rsn = 'Strike 3 ! Sorry you will need to restart the transaction';
                     $scope.otpError = {
                        happened: true,
                        msg: data.rsn
                    };
                    mVisaPaymentCtrl.isAttemptthreeTimes = true;
                }
                //4/5/17-added to show incorrect otp msg after tring 3 times

                if (data.cd && data.cd === '02') {
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                }
                if (data.cd && data.cd === '501') {
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    //$scope.addAlert('cd', 'error', false);
                }
                if (data.cd && data.cd === '08') {
					mVisaPaymentCtrl.isAttemptthreeTimes = true;
                    //data.rsn = 'Strike 3 ! Sorry you will need to restart the transaction';
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    //$scope.addAlert('cd', 'error', false);
                }
                $scope.otpError = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
            }).finally(function(d){
				//$scope.errorSpin = false;
				//mVisaPaymentCtrl.mvisaForm.OTP = '';
			});		
						
		};
		
		/**
		* function for summary and otp page
		*
		**/
		mVisaPaymentCtrl.viewPaymentSummary = function(key){
		   //mVisaPaymentCtrl.resendAttemptCount = 0;
           mVisaPaymentCtrl.accSummary = {};
		   mVisaPaymentCtrl.isAttemptthreeTimes = false;
		   mVisaPaymentCtrl.mvisaForm.OTP = '';
		   gadgets.pubsub.publish("mvisa.header.title", {
				   data: "Review Transfer"
		   });			
			clrAllMessages();
		    mVisaPaymentCtrl.showCards = false;
		    mVisaPaymentCtrl.showCardSummary = true;
			mVisaPaymentCtrl.isOTPSent = false;
			console.log('active card list :::::::::::::::::::: ', mVisaPaymentCtrl.activeCardList);
			mVisaPaymentCtrl.customerCardSummary = mVisaPaymentCtrl.activeCardList[key];
			console.log('active card for summary page :::::::::::::::::::: ', mVisaPaymentCtrl.customerCardSummary);
			console.log("acc id :::::::::::::::::::::: ", mVisaPaymentCtrl.customerCardSummary.acctDtls[0].acctNb);
			var saving = $filter('filter')(mVisaPaymentCtrl.savingAccList, { id: mVisaPaymentCtrl.customerCardSummary.acctDtls[0].acctNb });
			var curr = $filter('filter')(mVisaPaymentCtrl.currAccList, { id: mVisaPaymentCtrl.customerCardSummary.acctDtls[0].acctNb });
            var homeSaver = $filter('filter')(mVisaPaymentCtrl.homesaverAccList, { id: mVisaPaymentCtrl.customerCardSummary.acctDtls[0].acctNb });
			console.log("filter saving :::::::::::::::::::::: ", saving);
			console.log("filter curr :::::::::::::::::::::: ", curr);
			if(saving && saving.length){
			   mVisaPaymentCtrl.accSummary = saving[0];
			}
			
			if(curr && curr.length){
			   console.log('this is curr ::::::::::::::::::::::::');	
			   mVisaPaymentCtrl.accSummary = curr[0];	
			}
       
            if(homeSaver && homeSaver.length){
                console.log('this is curr ::::::::::::::::::::::::');
                mVisaPaymentCtrl.accSummary = homeSaver[0];
            }
       
            console.log('account summary :::::::::::::::::::::::::: ', mVisaPaymentCtrl.accSummary);	
			//mVisaPaymentCtrl.generateOTP(false);
			var crdName = mVisaPaymentCtrl.customerCardSummary.cardName;
			console.log('customer card type ::::::::::::::: ', crdName.toLowerCase());
			if(typeof mVisaPaymentCtrl.merchantInfo.intrchgTp != 'undefined'){
                var interChTypeList = mVisaPaymentCtrl.merchantInfo.intrchgTp.split(',');
				var posEntryList = mVisaPaymentCtrl.merchantInfo.posEntryMd.split(',');
				var defaultPosList = {};
				//var defaultPosList = [];
				/*for(var j=0; j<posEntryList.length; j++){
					defaultPosList[j] = posEntryList[j];
				}*/
				//console.log('defaultPosList :::::::::::::::::: ', defaultPosList);
				console.log('merchant card type ::::::::::::::: ', mVisaPaymentCtrl.merchantInfo.intrchgTp.toLowerCase());
				/*if(crdName.toLowerCase().search(mVisaPaymentCtrl.merchantInfo.intrchgTp.toLowerCase()) < 0){
					mVisaPaymentCtrl.isCardMissmatch = true;
				} else {*/
				console.log('interChTypeList:::::::::::::::::' , interChTypeList.length);
				    var isMatched = 0;
					if(interChTypeList.length){
					   for(var i=0; i<interChTypeList.length; i++){
							  console.log('interChTypeList[i].toLowerCase() ::::::::::: ', interChTypeList[i].toLowerCase());
							  
							  if(posEntryList[i])
							    defaultPosList[interChTypeList[i].toLowerCase()] = posEntryList[i];
							
							  
							  console.log('defaultPosList ::::::::::::::::::::::::::: ', defaultPosList);
							  
							  if(interChTypeList[i].toLowerCase() == 'visa' && crdName.toLowerCase().search(interChTypeList[i].toLowerCase()) >= 0){
							     mVisaPaymentCtrl.merchantInfo.mrchntId = mVisaPaymentCtrl.merchantInfo.mVisaMerchantId?mVisaPaymentCtrl.merchantInfo.mVisaMerchantId:'';
								 mVisaPaymentCtrl.merchantInfo.mVisaMerchantId = mVisaPaymentCtrl.merchantInfo.mVisaMerchantPan?mVisaPaymentCtrl.merchantInfo.mVisaMerchantPan:''; 
							     mVisaPaymentCtrl.merchantInfo.intrchgTpV = interChTypeList[i].substr(0, 1).toUpperCase() + interChTypeList[i].substr(1).toLowerCase();
                                 isMatched = 1;
								 mVisaPaymentCtrl.merchantInfo.posEntryMdV = defaultPosList.visa;
								 
                                 break; 								 
							  }
							  else if(interChTypeList[i].toLowerCase() == 'rupay' && crdName.toLowerCase().search(interChTypeList[i].toLowerCase()) >= 0){
							     mVisaPaymentCtrl.merchantInfo.mrchntId = mVisaPaymentCtrl.merchantInfo.npciMerchantId?mVisaPaymentCtrl.merchantInfo.npciMerchantId:'';
								 mVisaPaymentCtrl.merchantInfo.mVisaMerchantId = mVisaPaymentCtrl.merchantInfo.npciid1?mVisaPaymentCtrl.merchantInfo.npciid1:'';
							     mVisaPaymentCtrl.merchantInfo.intrchgTpV = interChTypeList[i].substr(0, 1).toUpperCase() + interChTypeList[i].substr(1).toLowerCase();	
                                 isMatched = 1;
								 mVisaPaymentCtrl.merchantInfo.posEntryMdV = defaultPosList.rupay;
								 
                                 break;								 
                                 								 
							  }
							  else if(interChTypeList[i].toLowerCase() == 'mastercard' && crdName.toLowerCase().search(interChTypeList[i].toLowerCase()) >= 0){
							     mVisaPaymentCtrl.merchantInfo.mrchntId = mVisaPaymentCtrl.merchantInfo.masterCardMerchantId?mVisaPaymentCtrl.merchantInfo.masterCardMerchantId:'';
								 mVisaPaymentCtrl.merchantInfo.mVisaMerchantId = mVisaPaymentCtrl.merchantInfo.masterCardPan1?mVisaPaymentCtrl.merchantInfo.masterCardPan1:'';		
							     mVisaPaymentCtrl.merchantInfo.intrchgTpV = interChTypeList[i].substr(0, 1).toUpperCase() + interChTypeList[i].substr(1).toLowerCase();	
                                 isMatched = 1;
								 mVisaPaymentCtrl.merchantInfo.posEntryMdV = defaultPosList.mastercard;
								 
                                 break;								 
                                 								 
							  }	
					   }
					   if(!isMatched){
						  mVisaPaymentCtrl.isCardMissmatch = true; 
					   }
					   console.log('mVisaPaymentCtrl.merchantInfo.mVisaMerchantId ::::::::::: ', mVisaPaymentCtrl.merchantInfo.mVisaMerchantId);
					   console.log('interchange type ::::::::::::::::::: ', mVisaPaymentCtrl.merchantInfo.intrchgTpV);
					}					
				//}
			}
		};		

		
		
		/**
		* function for payment with mVisa
		*
		**/
        mVisaPaymentCtrl.paymentInfo = {};		
		mVisaPaymentCtrl.pay = function(){
			//alert('payment function called ::::::::::::::::::::');
			clrAllMessages();
			$scope.errorSpin = true;

			var paymentURLEndPoint = lpWidget.getPreference('makeMvisaPayment');
			var paymentURL = lpCoreUtils.resolvePortalPlaceholders(paymentURLEndPoint, {
				servicesPath: lpPortal.root
			});
			
			/*if(mVisaPaymentCtrl.merchantInfo.intrchgTp == 'Visa'){
				mVisaPaymentCtrl.merchantInfo.mrchntTp = lpWidget.getPreference('visaMrchntTp');
			} else if(mVisaPaymentCtrl.merchantInfo.intrchgTp == 'Rupay'){
				mVisaPaymentCtrl.merchantInfo.mrchntTp = mVisaPaymentCtrl.merchantInfo.mrchntTp;
			}*/
			
			var transactionAmt = mVisaPaymentCtrl.merchantInfo.transactionAmount?mVisaPaymentCtrl.merchantInfo.transactionAmount:'0';

			var transactionAmtWithoutFee = mVisaPaymentCtrl.merchantInfo.transactionAmount?(mVisaPaymentCtrl.merchantInfo.transactionAmount -
			                        (mVisaPaymentCtrl.merchantInfo.convenienceFeeAmount?mVisaPaymentCtrl.merchantInfo.convenienceFeeAmount:'0')):'0';
			
			var postData = {
				'entryType' : mVisaPaymentCtrl.merchantInfo.entryType?mVisaPaymentCtrl.merchantInfo.entryType:'',
				'mrchntPAN' : mVisaPaymentCtrl.merchantInfo.mVisaMerchantId?mVisaPaymentCtrl.merchantInfo.mVisaMerchantId:'',
				'mrchntId' : mVisaPaymentCtrl.merchantInfo.mrchntId?mVisaPaymentCtrl.merchantInfo.mrchntId:'',
				'trnCurrencyCode' : mVisaPaymentCtrl.merchantInfo.currencyCode?mVisaPaymentCtrl.merchantInfo.currencyCode:'',
				/*'trnAmt' : mVisaPaymentCtrl.merchantInfo.transactionAmount?mVisaPaymentCtrl.merchantInfo.transactionAmount.toString():'0',*/
				'trnAmt' : (parseFloat(transactionAmt).toFixed(2)).toString(),
				'trnAmtWithoutFee' : (parseFloat(transactionAmtWithoutFee).toFixed(2)).toString(),
				'trnFee' : mVisaPaymentCtrl.merchantInfo.convenienceFeeAmount?mVisaPaymentCtrl.merchantInfo.convenienceFeeAmount.toString():'0',
				'tipCnvFeeInd' : mVisaPaymentCtrl.merchantInfo.tipAndFeeIndicator?mVisaPaymentCtrl.merchantInfo.tipAndFeeIndicator:'',
				'cnvFeePer' : mVisaPaymentCtrl.merchantInfo.convenienceFeePercentage?mVisaPaymentCtrl.merchantInfo.convenienceFeePercentage:'',
				'remarks' : mVisaPaymentCtrl.merchantInfo.remarks?mVisaPaymentCtrl.merchantInfo.remarks:'',
				'mrchntTp' : mVisaPaymentCtrl.merchantInfo.mrchntTp?mVisaPaymentCtrl.merchantInfo.mrchntTp:'6012',
				/*'intrchgTp' : mVisaPaymentCtrl.merchantInfo.intrchgTp?mVisaPaymentCtrl.merchantInfo.intrchgTp:'',*/
				'intrchgTp' : mVisaPaymentCtrl.merchantInfo.intrchgTpV?mVisaPaymentCtrl.merchantInfo.intrchgTpV:'',
				'acqInstCntryCd' : mVisaPaymentCtrl.merchantInfo.currencyCode?mVisaPaymentCtrl.merchantInfo.currencyCode:'',
				'trm_Ownr' : mVisaPaymentCtrl.merchantInfo.merchantName?mVisaPaymentCtrl.merchantInfo.merchantName:'',
				'trm_Cty' : mVisaPaymentCtrl.merchantInfo.cityName?mVisaPaymentCtrl.merchantInfo.cityName:'',
				'trm_Cntry' : mVisaPaymentCtrl.merchantInfo.countryCode?mVisaPaymentCtrl.merchantInfo.countryCode:'',
				'trm_St' : mVisaPaymentCtrl.merchantInfo.trm_St?mVisaPaymentCtrl.merchantInfo.trm_St:'',
				'mrchntPstlCd' : mVisaPaymentCtrl.merchantInfo.postalCode?mVisaPaymentCtrl.merchantInfo.postalCode:'400001',
				'mrchntIFSCCd' : mVisaPaymentCtrl.merchantInfo.mrchntIFSCCd?mVisaPaymentCtrl.merchantInfo.mrchntIFSCCd:'',
				'mrchntAccNb' : mVisaPaymentCtrl.merchantInfo.mrchntAccNb?mVisaPaymentCtrl.merchantInfo.mrchntAccNb:'',
				'custPAN' : mVisaPaymentCtrl.customerCardSummary.crdNb?mVisaPaymentCtrl.customerCardSummary.crdNb:'',
				'sndNm' : mVisaPaymentCtrl.customerCardSummary.cstmrNm?mVisaPaymentCtrl.customerCardSummary.cstmrNm:'',
				'posEntryMd' : mVisaPaymentCtrl.merchantInfo.posEntryMdV?mVisaPaymentCtrl.merchantInfo.posEntryMdV:'010',
				'bilNb' : mVisaPaymentCtrl.merchantInfo.billId?mVisaPaymentCtrl.merchantInfo.billId:'',
				'mobNb' : mVisaPaymentCtrl.merchantInfo.mobileNumber?mVisaPaymentCtrl.merchantInfo.mobileNumber:'',
				'strID' : mVisaPaymentCtrl.merchantInfo.storeId?mVisaPaymentCtrl.merchantInfo.storeId:'',
				'lytNb' : mVisaPaymentCtrl.merchantInfo.loyaltyNumber?mVisaPaymentCtrl.merchantInfo.loyaltyNumber:'',
				'refID' : mVisaPaymentCtrl.merchantInfo.referenceId?mVisaPaymentCtrl.merchantInfo.referenceId:'',
				'cnsmID' : mVisaPaymentCtrl.merchantInfo.consumerId?mVisaPaymentCtrl.merchantInfo.consumerId:'',
				'prps' : mVisaPaymentCtrl.merchantInfo.prps?mVisaPaymentCtrl.merchantInfo.prps:'',
				'pyldFrmtInd' : mVisaPaymentCtrl.merchantInfo.payloadFormatIndicator?mVisaPaymentCtrl.merchantInfo.payloadFormatIndicator:'',
				'trmnlId' : mVisaPaymentCtrl.merchantInfo.terminalId?mVisaPaymentCtrl.merchantInfo.terminalId:'',
				'prmryId' : mVisaPaymentCtrl.merchantInfo.primaryId?mVisaPaymentCtrl.merchantInfo.primaryId:'',
				'scndryId' : mVisaPaymentCtrl.merchantInfo.secondaryId?mVisaPaymentCtrl.merchantInfo.secondaryId:'',
				'crc' : mVisaPaymentCtrl.merchantInfo.crc?mVisaPaymentCtrl.merchantInfo.crc:'',
				'linkedAccNo' : mVisaPaymentCtrl.customerCardSummary.acctDtls[0].acctNb?mVisaPaymentCtrl.customerCardSummary.acctDtls[0].acctNb:'',
				'pointOfInitiation':mVisaPaymentCtrl.merchantInfo.pointOfInitiation?mVisaPaymentCtrl.merchantInfo.pointOfInitiation:'',
				'tag08':mVisaPaymentCtrl.merchantInfo.tag08?mVisaPaymentCtrl.merchantInfo.tag08:''
			};
			postData = $.param(postData || {});
			console.log('payment post data :::::::::::::::: ', postData);
			var request = $http({
				method: 'POST',
				url: paymentURL,
				data: postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}

			});
			request.success(function (data, status, headers, config) {
                    $scope.errorSpin = false;				
                    console.log('payment success info ::::::::::::::::::: ', data);	
					if(data.cd == '500'){
					mVisaPaymentCtrl.showCardSummary = false;
					mVisaPaymentCtrl.showPaymentPage = true;
                    mVisaPaymentCtrl.payment = false;					
						$scope.paymentError = {
							happened: true,
							msg: data.rsn
						};						
					} else {
					mVisaPaymentCtrl.showCardSummary = false;
					mVisaPaymentCtrl.showPaymentPage = true;
					mVisaPaymentCtrl.payment = true;					
					mVisaPaymentCtrl.paymentInfo = data;
					}
				})['catch'](function (res) {
                    $scope.errorSpin = false;					
				    console.log('transaction:::::::::::::::::::', res);
					//$scope.assets.loadingNow = false;
					mVisaPaymentCtrl.showCardSummary = false;
					mVisaPaymentCtrl.showPaymentPage = true;
					mVisaPaymentCtrl.payment = false;						
					if(typeof res.data != 'undefined'){
						console.log('res.data :::::::::::::::::::');
						if (res.data.cd) {
							idfcHanlder.checkTimeout(res.data);
							$scope.globalerror = idfcHanlder.checkGlobalError(res.data);
							$scope.paymentError = {
								happened: true,
								msg: res.data.rsn
								//msg: 'Your transaction has failed as due to '+error.data.rsn+'. Please note your transaction ID - 1234'
							};
						}
					}
					
					if(typeof res.error != 'undefined'){
						    console.log('res.error :::::::::::::::::::');
							idfcHanlder.checkTimeout(res.error);
							$scope.globalerror = idfcHanlder.checkGlobalError(res.error);
							$scope.paymentError = {
								happened: true,
								msg: res.error.rsn
								//msg: 'Your transaction has failed as due to '+error.data.rsn+'. Please note your transaction ID - 1234'
							};						
					}	
					
					
					if(typeof res.rtrvalRfrnceNmbr != 'undefined'){
						console.log('res.rtrvalRfrnceNmbr :::::::::::::::::::');
						mVisaPaymentCtrl.transactionID = res.rtrvalRfrnceNmbr;
					}
					console.log('before res.cd :::::::::::::::::::');
					if (typeof res.cd != 'undefined') {
						console.log('res.cd :::::::::::::::::::');
						idfcHanlder.checkTimeout(res);
						$scope.globalerror = idfcHanlder.checkGlobalError(res);
						$scope.paymentError = {
							happened: true,
							msg: res.rsn
							//msg: 'Your transaction has failed as due to '+error.data.rsn+'. Please note your transaction ID - 1234'
						};
					}	

					if(typeof res.data != 'undefined'){
						console.log('res.data last :::::::::::::::::::', res.data.rtrvalRfrnceNmbr);
						mVisaPaymentCtrl.transactionID = res.data.rtrvalRfrnceNmbr; 
						idfcHanlder.checkTimeout(res.data);
						$scope.globalerror = idfcHanlder.checkGlobalError(res.data);

						var genericErrMsg = "Your Bharat QR payment of Rs. "+mVisaPaymentCtrl.merchantInfo.transactionAmount+" has timed out. Kindly check with merchant for payment status.  Just in case, your account is debited & merchant isn't credited, then your funds will be refunded within 24 hrs.";


						$scope.paymentError = {
							happened: true,
							msg: res.data.error.rsn?res.data.error.rsn:genericErrMsg
							//msg: 'Your transaction has failed as due to '+error.data.rsn+'. Please note your transaction ID - 1234'
						};						
					}					
					
			}).finally(function(d){
				//$scope.errorSpin = false;
			});					
			
		};
		
		
		
		
        /** 
		* back to home button function
		*/			
		mVisaPaymentCtrl.gotoDashboard = function(){ 
		   gadgets.pubsub.publish("launchpad-retail.backToDashboard");
		   gadgets.pubsub.publish("js.back", {
				   data: "ENABLE_HOME"
		   });			
		};		
		
        /** 
		* internal back button functions
		*/			
		mVisaPaymentCtrl.goToBackPage = function(){ 
		    
			if(mVisaPaymentCtrl.showCards){
				$timeout(function(){
				 //mVisaPaymentCtrl.gotoDashboard();
				 gadgets.pubsub.publish("device.GoBack");
				});
			}
			else if(mVisaPaymentCtrl.showCardSummary){
				$timeout(function(){
					clrAllMessages();
					mVisaPaymentCtrl.showCardSummary = false;
					mVisaPaymentCtrl.showPaymentPage = false;
					mVisaPaymentCtrl.showCards = true;	
				   gadgets.pubsub.publish("mvisa.header.title", {
						   data: "Card Selection"
				   });					
				   gadgets.pubsub.publish("js.back", {
						   data: "ENABLE_BACK"
				   });						
				});
			}
			else if(mVisaPaymentCtrl.showPaymentPage){
				$timeout(function(){
					/*mVisaPaymentCtrl.showCards = false;
					mVisaPaymentCtrl.showCardSummary = true;
					mVisaPaymentCtrl.showPaymentPage = false;
				   gadgets.pubsub.publish("js.back", {
						   data: "ENABLE_BACK"
				   });	*/   
                   mVisaPaymentCtrl.gotoDashboard();				   
				});
			}
			
		};		
		
		mVisaPaymentCtrl.showBackButton = function() {
			console.log('Back button called');
			gadgets.pubsub.publish("js.back", {
			data: "ENABLE_BACK"
			});
		};		
		
	  // For back buttton pub-sub // Satrajit code on old widget // Jay
	   gadgets.pubsub.subscribe("native.back", function() {
		   console.log("native.back handled");
				 // gadgets.pubsub.publish(formdata.callingWidget);
				 /* gadgets.pubsub.publish("js.back", {
						  data: "ENABLE_HOME"
				  });*/
				  mVisaPaymentCtrl.goToBackPage();
	   });

	   gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
		   console.log("device back GoBackInitiate handled");
		   if(localStorage.getItem("navigationFlag")) {
		   console.log("back if handled ");
			   gadgets.pubsub.publish("js.back", {
					   data: "ENABLE_HOME"
			   });
		   }else {
			   console.log("back else handled ");
			   //gadgets.pubsub.publish("device.GoBack");
			   mVisaPaymentCtrl.goToBackPage();
		   }
		  
	   });
			   
        /** 
		* mail function
		*/		
        mVisaPaymentCtrl.mailSent = false;
		mVisaPaymentCtrl.download = false;
		mVisaPaymentCtrl.dataRes = {'statusCode':'', 'msg':''};
        mVisaPaymentCtrl.sendMail = function(){
			var emailURLEndPoint = lpWidget.getPreference('generateMVisaReceipt');
			var mailURL = lpCoreUtils.resolvePortalPlaceholders(emailURLEndPoint, {
				servicesPath: lpPortal.root
			});			
			$scope.errorSpin = true;
			var postData = {'rtrvalRfrnceNmbr' : mVisaPaymentCtrl.paymentInfo.rtrvalRfrnceNmbr};
			console.log('mVisaPaymentCtrl.paymentInfo.rtrvalRfrnceNmbr :::::::::::::::::::: ', mVisaPaymentCtrl.paymentInfo.rtrvalRfrnceNmbr);
			
			postData = $.param(postData || {});
			var request = $http({
				method: 'POST',
				url: mailURL,
				data: postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}

			});
			request.success(function (data, status, headers, config) { 
                        console.log('email info ::::::::::::::::::: ', data);
						mVisaPaymentCtrl.dataRes.statusCode = data.mailSentMsg.code;
						mVisaPaymentCtrl.dataRes.msg = data.mailSentMsg.msg;					
				})['catch'](function (error) { 
					if (error.data.cd) {
						idfcHanlder.checkTimeout(error.data);
						$scope.globalerror = idfcHanlder.checkGlobalError(error.data);
						$scope.mailError = {
							happened: true,
							msg: error.data.rsn
						};
					}
			}).finally(function(d){
				$scope.errorSpin = false;
			});				
		};

		/**
		* initialize default function
		*
		**/		
		var initialize = function(){
			idfcHanlder.validateSession($http);
			mVisaPaymentCtrl.showBackButton();
			isCompleteAllAsyncReq();
			loadCardList();
            loadAccounts(); 			
		};
		
		/**
		* initialize call by default
		*
		**/		
		initialize();
				
    }

    //MvisaPaymentController.prototype.$onInit = function() {
        // Do initialization here
    //};

    module.exports = MvisaPaymentController;
});

