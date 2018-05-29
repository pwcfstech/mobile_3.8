define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');
    var FRGT_PWD_MAX_INVALID_ATEMPT_ERRMSG = idfcConstants.FRGT_PWD_MAX_INVALID_ATEMPT_ERRMSG;
    var FRGT_PWD_MAX_INVALID_ATEMPT_COUNT = idfcConstants.FRGT_PWD_MAX_INVALID_ATEMPT_COUNT
    var FRGT_PWD_ERR_CODE_INVALID_USERNAME = idfcConstants.FRGT_PWD_ERR_CODE_INVALID_USERNAME;
    var widget;
 /** Mobile 2.5 **/
    /** Encrypting password. Similar to web **/

       var enciphering = require('./support/production/angular-rsa-encrypt');
       var readKey = require('./support/rsaKeySetup/rsaKeySetup');


    function NewUserCtrl(lpCoreUtils, lpCoreError, $scope, $http,
        httpService, lpWidget, lpCoreBus, $timeout, lpPortal,
        $window, CQService) {
        gadgets.pubsub.subscribe(
            'launchpad-retail.goToForgotPassword');
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        $scope.passwordPolicy =
            '/^(?=.*\\d)(?=.*[a-zA-Z])[^ ]{6,15}$/';
        $scope.ValidateUsernameServiceEndPoint = lpWidget.getPreference(
            'ValidateUsernameService');
        $scope.accountNumberServiceEndPoint = lpWidget.getPreference(
            'accountNumberService');
        $scope.debitCardServiceEndPoint = lpWidget.getPreference(
            'debitCardService');
        $scope.userNameServiceEndPoint = lpWidget.getPreference(
            'userNameService');
        $scope.ForgotPasswordEndPoint = lpWidget.getPreference(
            'ForgetPassword');
        $scope.generateOTPServiceEndPoint = lpWidget.getPreference(
            'generateOTPService');
        $scope.showTabs = false;
        var xhrTemp = $http({
                        method: 'POST',
                        url: lpCoreUtils.resolvePortalPlaceholders(
                                             $scope.ValidateUsernameServiceEndPoint, {
                                                 servicesPath: lpPortal.root
                                             }),
                        data: '',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                        }
                    });

        // RSA changes by Xebia start
        $scope.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        // to fetch mobile specific data
        gadgets.pubsub.publish("getMobileSdkData");
        gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
           $scope.mobileSdkData = response.data;
        });

        $scope.showSetupCQMessage = false;
        $scope.showCancelTransactionMessage = false;
        $scope.challengeQuestion={};
        $scope.showCQError = "";
        $scope.challengeQuestionCounter = 0;
        $scope.showDenyMessage = false;
        $scope.showWrongAnswerMessage = false;
        // RSA changes by Xebia ends

        var ALERT_TIMEOUT = 9000;
        $scope.ShowForgotPasswordForm = false;
        $scope.showSuccessForm = false;
        $scope.enableSubmit = true;
        $scope.disableSubmit = false;
        $scope.errors = {};
        $scope.hideOTPFlag = true;
        $scope.errorSpin = false;
        $scope.maxAttemptErrMsg =
            FRGT_PWD_MAX_INVALID_ATEMPT_ERRMSG;
        $scope.maxAttemptCount = FRGT_PWD_MAX_INVALID_ATEMPT_COUNT;
        $scope.maxAttemptErrCd = FRGT_PWD_ERR_CODE_INVALID_USERNAME;
        $scope.customerFirstName = '';
		$scope.OTPError = false;
        $scope.cancelOTP = function() {
            lpWidget.refreshHTML();
        };
        $scope.validateAttempt = function() {
            $scope.disableSubmit = false;
            $scope.invalidUsernameCount = 0;
        };
        $scope.validateAttempt();
        $scope.frezeSubmitAttempt = function() {
            return $scope.disableSubmit;
        };
        $scope.internalBackEnable = false;
        $scope.control = {
            loginId: {
                value: '',
                disable: false,
                errors: [],
                loading: false
            },
            otpValue : '',
            cnfrmloginId: {
                value: '',
                disable: false,
                errors: [],
                loading: false
            },
            password: {
                value: '',
                errors: [],
                disable: false,
                loading: false
            },
            confirmPassword: {
                value: '',
                errors: [],
                disable: false,
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
            username: {
                value: '',
                errors: [],
                loading: false
            }
        };
        $scope.resetCardForm = function() {
            $scope.control.cardNumber = null;
            $scope.control.cvv = null;
            $scope.control.expiryMonth = null;
            $scope.control.expiryYear = null;
            $scope.alerts = [];
        };
        gadgets.pubsub.subscribe("native.back", function(evt) {
            angular.forEach(document.getElementsByClassName(
                "tooltip"), function(e) {
                e.style.display = 'none';
            })
            $scope.backToFirstScreen();
	        $scope.resetUsernameForm();
            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion={};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends
            $scope.$apply();
            localStorage.clear();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
        				 if(localStorage.getItem("navigationFlag") || $scope.internalBackEnable) {
        					 angular.forEach(document.getElementsByClassName(
                                             "tooltip"), function(e) {
                                             e.style.display = 'none';
                                         })
                                         $scope.backToFirstScreen();
                             	        $scope.resetUsernameForm();
                                        // RSA changes by Xebia start
                                        $scope.showSetupCQMessage = false;
                                        $scope.showCancelTransactionMessage = false;
                                        $scope.challengeQuestion={};
                                        $scope.showCQError = "";
                                        $scope.challengeQuestionCounter = 0;
                                        $scope.showDenyMessage = false;
                                        $scope.showWrongAnswerMessage = false;
                                        // RSA changes by Xebia ends
                                         $scope.$apply();
                                         localStorage.clear();
        				 }else {
        					 gadgets.pubsub.publish("device.GoBack");
        				 }
        			 });

        $scope.resetShowForgotPasswordForm = function() {
            $scope.enableSubmit = true;
            $('#inputPassword').val('');
            $('#confirmPass').val('');
            $scope.control.confirmPassword.value = '';
            $scope.control.password.value = '';
        };
        $scope.validatePassword = function(username, password1,
            password2) {
            if (password1 !== password2) {
                return 'unmatch';
            }
            if (password1.toLowerCase() === username.toLowerCase()) {
                return 'containsLoginId';
            }
            return false;
        };
        var setdeviceprint = function() {
            return encode_deviceprint();
        };
        var validateConfirmPass = function() {
            $scope.errorsConfirmPass = {};
            var checkPassword = $scope.validatePassword($scope.control
                .username.value, $scope.control.password.value,
                $scope.control.confirmPassword.value);
            if (checkPassword === 'unmatch') {
                $scope.errorsConfirmPass['confirmPass'] = true;
            } else if (checkPassword === 'containsLoginId') {
                $scope.errors['containsLoginId'] = true;
            } else {
                $scope.errorsConfirmPass['confirmPass'] = false;
                $scope.errors['containsLoginId'] = false;
                return true;
            }
        };
        $scope.$watch('control.expiryMonth.value', function(value) {
            if (value > 12) {
                $scope.checkMonth = true;
            } else {
                $scope.checkMonth = false;
            }
        });
        $scope.$watch('control.expiryYear.value', function(value) {
            if (value > 50 && value < 15) {
                $scope.checkYear = true;
            } else {
                $scope.checkYear = false;
            }
        });
        $scope.validateUCIC = function(username) {
            if (username.length >= 20) {
                return true;
            }
            return false;
        };
        var validUCIC = function() {
            var UCICcheck = $scope.validateUCIC($scope.control.username
                .value);
            if (UCICcheck) {
                $scope.errors['ucicCheck'] = UCICcheck;
            } else {
                return true;
            }
        };
        $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) +
            '/templates/partial';
        $scope.templates = {
            forgotPassword: $scope.partialsDir +
                '/ForgotPassword.html',
            successful: $scope.partialsDir + '/Success.html'
        };
        $scope.hideOTPFlag = true;
        $scope.hideQuesFlag = true;
        $scope.challengeQuesAnswers = [{
            'answer': '',
            'question': ''
        }];
        $scope.showQuestionDiv = false;
        $scope.lockFields = false;
        $scope.btnFlag = true;
        $scope.hideCombineFlag = true;

        $scope.openDebitForm = function(isUcicValid) {
        $scope.wrongOTPcount=0;
//alert("$scope.wrongOTPcount: "+$scope.wrongOTPcount);
            if (!validUCIC() || !isUcicValid) {
                return false;
            }
            $scope.error = {
                happened: false,
                msg: ''
            };
            $scope.errors = {};
            $scope.alerts = [];
            var xhr;
            $scope.errorSpin = true;
            xhr = $scope.authenticateUCIC(isUcicValid);

            xhr.success(function(data, status, headers, config) {

                $scope.control.otpValue = ''; //1 mar
                $scope.errorSpin = false;
                $scope.validateAttempt();
                if (data && data !== 'null') {
                    $scope.showDebitForm = !$scope.showDebitForm;
                    $scope.customerId = data.custId;
                    console.log('CustomerID >>>>>>>>>>>>>>>>>'+ $scope.customerId);
                    $scope.customerMob = data.mblNm;
                    $scope.customerFirstName = data.custFrstNm;
                    /*if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob !== null)) {
                        $scope.customerMobMasked = 'XXXXXX' + $scope.customerMob.substr($scope.customerMob.length - 4);
                    }*/
                    var res;
                    var rsaAnalyzeService = lpCoreUtils
                        .resolvePortalPlaceholders(
                            lpWidget.getPreference(
                                'rsaAnalyzeService'), {
                                servicesPath: lpPortal.root
                            });
                    $scope.postData = {
			        'username': $scope.control.username.value,
                        'customerId': $scope.customerId,
                        'mobileNumber': $scope.customerMob,
                        'resendOTP': false
                    };
                    $scope.postData.devicePrint = setdeviceprint();
                    // to fetch mobile specific data
                    gadgets.pubsub.publish("getMobileSdkData");
                    gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
                      $scope.mobileSdkData = response.data;
                    });
                    $scope.postData.mobileSdkData = JSON.stringify($scope.mobileSdkData);
                    $scope.postData.transaction = 'forgetPassword';

                    var data1 = $.param($scope.postData || {});

                    res = $http({
                        method: 'POST',
                        url: rsaAnalyzeService,
                        data: data1,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                        }
                    });
                    res.success(function(data2) {

                        // to remove RSA response temporary
                        data2.actionStatus = 'ALLOW';
                        data2.userStatus = 'VERIFIED';

                        // RSA changes by Xebia start
                        if (data2.actionStatus === 'DENY' || data2.userStatus === 'DELETE' || data2.userStatus === 'LOCKOUT' ) 
                        {
                                $scope.errorSpin = false;
                                $scope.showDenyMessage = true;
                                $scope.btnFlag = false;
                        }
                        else if(data2.userStatus === 'UNVERIFIED' || data2.userStatus === 'NOTENROLLED' || data2.userStatus === 'UNLOCKED' )
                            {
                                $scope.showSetupCQMessage = true;
                                $scope.errorSpin = false;
                                $scope.btnFlag = false;
                            }  
                        else if ( data2.actionStatus === 'ALLOW' &&  ( data2.userStatus === 'VERIFIED' ) ) 
                            {
                                $scope.errorSpin = true;
                                $scope.generateOTP("generate");
                                $scope.readSMS('');
                            } 
                        else if (data2.actionStatus === 'CHALLENGE' && data2.userStatus === 'VERIFIED' )
                            {
                                $scope.errorSpin = false;
                                $scope.showCQError=CQService.CHALLENGE_MESSAGE;
                                $scope.challengeQuestionCounter++;
                                $scope.challengeQuestions = data2.challengeQuestionList[0].questionText;
                                $scope.challengeQuestionsId = data2.challengeQuestionList[0].questionId;
                                $scope.hideQuesFlag = false;
                                $scope.btnFlag = false;
                                $scope.showQuestionDiv = true;
                                $scope.hideOTPFlag = true;
                                $scope.hideCombineFlag = true;
                            }
                        // RSA changes by Xebia ends

                    }).error(function(data2,
                        status1, headers1,
                        config1) {
                        $scope.errorSpin =
                            false;
                        $scope.error = {
                            happened: true,
                            msg: data2.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    });
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    if (data.cd === $scope.maxAttemptErrCd) {
                        $scope.invalidUsernameCount =
                            $scope.invalidUsernameCount +
                            1;
                    }
                    if ($scope.invalidUsernameCount >=
                        $scope.maxAttemptCount) {
                        $scope.disableSubmit = true;
                        $scope.error = {
                            happened: true,
                            msg: $scope.maxAttemptErrMsg
                        };
                    } else {
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                    }
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        };


        // showSetupCQ function by Xebia
        $scope.showSetupCQ = function()
        {
            localStorage.setItem("login_name", $scope.control.username.value);
            localStorage.setItem("mobNo", $scope.control.mobile.value);
            gadgets.pubsub.publish('openCQ');
        }

        // cancel Transaction function by Xebia
        $scope.cancelRSATransaction = function()
        {
            gadgets.pubsub.publish("launchpad-retail.backToDashboard");  
        }

        // verify challenge question answer function by Xebia
        $scope.verifyCQAnswer = function()
        {
            $scope.errorSpin = true;
            var postdata = {
                questionID : $scope.challengeQuestionsId,
                question : $scope.challengeQuestions,
                answer : $scope.challengeQuestion.answer,
                credentialType : 'QUESTION'
            }
            // to fetch mobile specific data
            gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
                $scope.mobileSdkData = response.data;
            });
            postdata.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            postdata= $.param(postdata);

            var verifyRoute = lpCoreUtils.resolvePortalPlaceholders(
                    lpWidget.getPreference('verifyRouteService'), {
                        servicesPath: lpPortal.root
                    });
                    
            var xhr = $http({
                                method: 'POST',
                                url: verifyRoute,
                                data: postdata,
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/x-www-form-urlencoded;'
                                }
                            });

            xhr.success(function(response){
                    if(response.correctlyAnswered)
                    {
                        $scope.errorSpin = true;
                        $scope.hideQuesFlag = true;
                        $scope.showQuestionDiv = false;
                        $scope.showWrongAnswerMessage = false;
                        $scope.generateOTP("generate");  
                        $scope.readSMS(''); 
                    }
                    else
                    {
                        if($scope.challengeQuestionCounter <= 2)
                        {
                            $scope.errorSpin = false;
                            $scope.showCQError = CQService.WRONG_CQ_ANSWER;
                            $scope.showWrongAnswerMessage = true;
                            $scope.showQuestionDiv = false;   
                        }
                        else
                        {
                            $scope.errorSpin = false;
                            $scope.showQuestionDiv = false;  
                            $scope.showCQError = CQService.CQ_ANSWER_ATTEMPT_EXCEED;
                        }
                    }
                    
                    
                })
            xhr.error(function (data, status) {
                        $scope.errorSpin = false;
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    });

        };

        // fetch challenge question function by Xebia
        $scope.fetchCQ = function()
        {
            $scope.errorSpin = true;
            $scope.challengeQuestion.answer="";
            $scope.showCQError="";
            var postdata = {};
            
            var xhr = CQService.challengeRSA(getChallengeQuestionUrl, postdata);

            xhr.success(function(response){
                $scope.showWrongAnswerMessage = false;
                $scope.challengeQuestionCounter++;
                $scope.challengeQuestionsId = response.challengeQuestionList[0].questionId;
                $scope.challengeQuestions = response.challengeQuestionList[0].questionText;
                $scope.errorSpin = false;
                $scope.hideQuesFlag = false;
                $scope.showQuestionDiv = true;
                $scope.btnFlag = false;
                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;
            })

            xhr.error(function (data, status) {
                        $scope.errorSpin = false;
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                });
        };

        //SMS Reading -- Start
            gadgets.pubsub.subscribe("resend.otp", function(evt){
                //console.log('Resend hit native');
                console.log ('evt.resendOtpFlag:'+evt.resendOtpFlag);
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
                                    data: "ForgotPassword"
                                });

                                //Step 2. Send request to "sendOTP service
                                console.log('Resend flag->'+resendFlag);
                                if(resendFlag==='resend'){
                                    $scope.generateOTP(resendFlag);
                                }


                                //Step 3: Subscribes for the event for receiving OTP
                                //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                                gadgets.pubsub.subscribe("ForgotPassword", function(evt){
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
                                    $scope.control.otpValue = receivedOtp;
                                    $scope.$apply();
                                    console.log('OTP value :'+$scope.control.otpValue);
                                    angular.element('#verifyOTP-btn-forgot-password').triggerHandler('click');



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

         //SMS Reading -- End
        // handling for forgotpassword otp changes minor release 2.0
                        var count=0;
                      		 $scope.resendfunction = function(){
                      			 if(count== 3){

                                   $scope.stop = true;
                      			 ++count;
                      		}
                             else
                             {
                      		     ++count;
                      			return count;
                                  $scope.stop = false;
                             }

                       	 }

                      		   var count1=0;
                      	 $scope.submitfunction = function(){

                                 if(count1== 3){
                      		  //alert("count1"+count1);
                                   $scope.lockFieldsOTP = true;
                      			 $scope.stop = true;

                             }
                             else
                             {
                                  $scope.lockFieldsOTP = false;
                             }

                   	}
        $scope.generateOTP = function(value) {
            var resendOTP = null;
            $scope.errorSpin = true;
            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.generateOTPServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            if (value === 'resend') {
                resendOTP = true;
            } else {
                resendOTP = false;
            }
            console.log($scope.customerId);
            console.log($scope.customerMob);
            var postData = {
					'username': $scope.control.username.value,
                'customerId': $scope.customerId,
                'mobileNumber': $scope.customerMob,
                'resendOTP': resendOTP,
                'transaction' : 'forgetPassword'
            };
            postData = $.param(postData || {});
            var xhr = $http({
                method: 'POST',
                url: generateOTPServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data) {
                $scope.errorSpin = false;
                if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob !== null)) {
                        $scope.customerMobMasked = 'XXXXXX' + $scope.customerMob.substr($scope.customerMob.length - 4);
                    }
                $scope.hideOTPFlag = false;
                $scope.btnFlag = false;    
               /* $scope.success = {
                    happened: true,
                    msg: 'OTP has been successfully sent to your registered mobile number'
                };
                $scope.error = {
                    happened: false,
                    msg: ''
                };*/
                $scope.lockFields = true;
                 // handling for forgot password otp changes minor release 2.0
                                                	if(count < 4)
                                                	{
                                                			$scope.success = {
                                                							    	happened: true,
                                                									msg: 'OTP has been successfully sent to your registered mobile number'
                                                								};
                                                								$scope.error = {
                                                									happened: false,
                                                									msg: ''
                                                								};
                                                	}


                                                	if(count== 4)
                                                	{
                                                					$scope.success =
                                                					{
                                                						happened: false,
                                                						msg: ''
                                                					};

                                                					$scope.error =
                                                					{
                                                						happened: true,
                                                						msg: 'We have tried 5 times to send you a code.'
                                                                    };
                                                	}
                                               //close handling for forgot password  otp changes minor release 2.0
                //OTP reading function call
                //$scope.readSMS();


            }).error(function(data, status3, headers3,
                config3) {
                $scope.errorSpin = false;
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
            });
        };
        $scope.verifyQuestionOTP = function(isFormValid, action) {

            if (!isFormValid) {
                return false;
            }

             if($scope.wrongOTPcount==5){
                    $scope.error.msg="3 strikes and you are out! You entered the wrong code thrice. Start the process again please.";

             }
              else{
                $scope.errorSpin = true;
                $scope.postDataforVerify = {
                    'customerId': $scope.customerId,
                    'mobileNumber': $scope.customerMob,
                    'username': $scope.control.username.value
                };
                var verifyRoute = lpCoreUtils.resolvePortalPlaceholders(
                    lpWidget.getPreference('verifyRouteService'), {
                        servicesPath: lpPortal.root
                    });
                if (action === 'QUESTION' || action === 'OTPANDQUESTION') {
                    $scope.postDataforVerify.length = $scope.challengeQuesAnswers
                        .length;
                }
                if (action === 'OTP' || action === 'OTPANDQUESTION') {

                    $scope.postDataforVerify.otpValue = $scope.control.otpValue;
                    $scope.postDataforVerify.requestType = 'verifyOTP';     //check for ISG
                }
                $scope.postDataforVerify.credentialType = action;
            $scope.postDataforVerify.transaction = 'forgetPassword';
                var data = $.param($scope.postDataforVerify || {});
                var request = $http({
                    method: 'POST',
                    url: verifyRoute,
                    data: data,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
                 count1++;
                request.success(function(response, data3, status) {
                    console.log("response is equal to: " + response);
                    console.log("response is equal to: " + response.sts);

                    $scope.errorSpin = false;

                    if(response.sts === "00" || response.sts === "ACPT"){
                                        $scope.OTPError=false;
                       console.log("inside if");
                       $scope.internalBackEnable = true;
                        gadgets.pubsub.publish("js.back", {
                            data: "ENABLE_BACK"
                        });
                        $scope.hideQuesFlag = true;
                        $scope.hideCombineFlag = true;
                        $scope.hideOTPFlag = true;
                        $scope.btnFlag = true;
                        $scope.lockfields = false;
                        for (var k = 0; k < $scope.challengeQuesAnswers.length; k++) {
                            $scope.challengeQuesAnswers[k].answer = '';
                        }
                        $scope.ShowForgotPasswordForm = !$scope.ShowForgotPasswordForm;
                        $scope.error = {
                            happened: false,
                            msg: ''
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    }
                    else{
                    //added for showing error in case OTP is manipulated and we come to success block
                                        $scope.OTPError=true;

                        $scope.error = {
                            happened: true,
                            msg: "That's the wrong code. Please try again later."
                        };
    //                    $scope.wrongOTPcount++;
    //                    alert("$scope.wrongOTPcount: "+ $scope.wrongOTPcount);
    //                    if($scope.wrongOTPcount==5);
    //                    alert("3 strikes msg");

                    }
                });
                request.error(function(data4, status4, headers4,
                    config4) {
                    $scope.errorSpin = false;
                    if (status4 == 0) {
                        gadgets.pubsub.publish(
                            "no.internet");
                    } else {
                                        if(count1== 3)
                                      {
                                         $scope.error = {
                                                   happened: true,
                                                   msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                                                        };
                                        }
                                        else{
                                          $scope.error = {
                                              happened: true,
                                              msg: data4.rsn
                                          };
                                          $scope.success = {
                                              happened: false,
                                              msg: ''
                                          };
                                          }
                            }
                     $scope.wrongOTPcount++;
                     //alert("count increased to "+ $scope.wrongOTPcount);

                });
            }
        };
        $scope.clearOTP = function() {
            $scope.control.otpValue = '';
        };
        $scope.clearOTPQUES = function() {
            $scope.control.otpValue = '';
            for (var i = 0; i < $scope.challengeQuesAnswers.length; i++) {
                $scope.challengeQuesAnswers[i].answer = '';
            }
        };

        $scope.changePassword = function(isFormValid) {
            $scope.alerts = [];
            if (!validateConfirmPass() || !isFormValid) {
                return false;
            } else {
                $scope.errorSpin = true;
                var xhr;
                xhr = $scope.submitForm();
                xhr.success(function(data, status5, headers5,
                    config5) {
	                            gadgets.pubsub.publish("js.back", {
                                                   data: "ENABLE_HOME"
                                });
                    $scope.success = {
                        happened: true,
                        msg: data.successMsg
                    };
                    $scope.errorSpin = false;
                    $scope.showSuccessForm = true;
                });
                xhr.error(function(data, status, headers,
                    config) {
                    $scope.errorSpin = false;
                    if (status == 0) {
                        gadgets.pubsub.publish(
                            "no.internet");
                    } else {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error',
                            false);
                        $scope.resetShowForgotPasswordForm();
                    }
                });
            }
        };
        $scope.submitForm = function() {

        var pubKey, exp, mod;
            pubKey = readKey.getValues("publicKeyValue");
            exp = readKey.getValues("exp");
            mod = readKey.getValues("mod");

            enciphering.setEncodeKey(pubKey, mod, exp);
       //console.log(enciphering.setEncrpt(vc.user.password));
            $scope.control.confirmPassword.value= enciphering.setEncrpt($scope.control.confirmPassword.value);
            $scope.control.password.value=  $scope.control.confirmPassword.value;

            console.log("newUsrCtrl.control.confirmPassword.value "+$scope.control.confirmPassword.value);
       console.log("newUsrCtrl.control.password.value "+ $scope.control.password.value);

            var registerUserServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.ForgotPasswordEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'username': $scope.control.username.value,
                'confirmNewPassword': $scope.control.confirmPassword
                    .value,
                'newPassword': $scope.control.password.value,
                'firstName': $scope.customerFirstName,
                'transaction':'forgetPassword',
                'auth_token': 'required',
                'requiredECheck' : 'required'

            };
            postData = $.param(postData || {});
            var xhr = $http({
                method: 'POST',
                url: registerUserServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            return xhr;
        };
        $scope.resetUsernameForm = function() {
            $scope.control.username = null;
            $scope.control.mobile.value = null;
            $scope.alerts = [];
        };

        $scope.authenticateUCIC = function() {
            var customerIDServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.ValidateUsernameServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'username': $scope.control.username.value,
                'mobilenumber': $scope.control.mobile.value,
                    'requestType': 'credential',
                    'transaction':'forgetPassword'
            };
            postData = $.param(postData || {});
            var xhr = $http({
                method: 'POST',
                url: customerIDServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            return xhr;
        };

        $scope.alert = {
            messages: {
                SAVED_SUCCESSFULLY: 'Contact was saved successfully.',
                SAVED_ERROR: 'There was an error while saving contact.',
                SERVICE_UNAVAILABLE: 'Unfortunately, this service is unavailable.'
            }
        };
        $scope.alerts = [];
        $scope.addAlert = function(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };
            $scope.alerts.push(customAlert);
            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(
                        customAlert));
                }, ALERT_TIMEOUT);
            }
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
        $scope.getBack = function() {
            // Send a pub/sub event to the application that will use this event by checking if there's a matching page in the behaviour map		            $scope.ShowForgotPasswordForm = false;
            //Will Go to Sign-In page.
            resetScanAndPayFlag();
            resetMVisaLoginFlag();
            gadgets.pubsub.publish("getBackToLoginScreen");
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

        $scope.backToFirstScreen = function() {
            //debugger;
            $scope.hideOTPFlag = true;
            $(".lp-alerts").hide();
            $scope.showDebitForm = false;
            $scope.ShowForgotPasswordForm = false;
            $scope.btnFlag = true;
            console.log("backToFirstScreen called");
            $scope.internalBackEnable = false;
            gadgets.pubsub.publish("js.back", {
                                    data: "ENABLE_HOME"
                                });
            $scope.$apply();
        };
        $scope.getBackToFgPw = function() {
            if ($scope.showSuccessForm && $scope.hideOTPFlag) {
                $scope.ShowForgotPasswordForm = true;
            }
        };

        $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }
    exports.NewUserCtrl = NewUserCtrl;
});