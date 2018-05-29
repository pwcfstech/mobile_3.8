/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

    'use strict';

    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');
    var OTP_SUCCESS_MESSAGE = idfcConstants.OTP_SUCCESS_MESSAGE;
    var $ = require('jquery');
    var resendFrom = '';

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function DthCtrl($scope, $rootScope, $timeout, $rootElement, lpWidget, lpCoreUtils, $http, httpService, lpCoreBus, lpPortal, transReceiptModule, CQService) {
        $scope.rechargeType = '';
        $scope.autoClickDTH = false;

        //RSA changes by Xebia start
        $scope.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('verifyCQAnswerUrl'));
        // to fetch mobile specific data
            gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });
        // RSA changes by Xebia ends

        gadgets.pubsub.subscribe("native.back", function(evt) {
            console.log(evt.text);
            $scope.errorSpin = false;

            if ($scope.tncflag) {
                //$scope.noSelection = true;
                $scope.tncflag = false;
                $scope.rechargeCheck();
                $scope.$apply();
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
            } else {
                $scope.cancelFormBack();
            }
            localStorage.clear();

        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if (localStorage.getItem("navigationFlag") || $scope.successValidateDthRechargeForm || $scope.tncflag) {
                console.log(evt.text);
                $scope.errorSpin = false;

                if ($scope.tncflag) {
                    //$scope.noSelection = true;
                    $scope.tncflag = false;
                    $scope.rechargeCheck();
                    $scope.$apply();
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_BACK"
                    });
                } else {
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                    });
                    gadgets.pubsub.publish("dTHActive", {
                        "data": false
                    });
                    $scope.cancelFormBack();
                }
                localStorage.clear();
            }
        });

        /**
         * Transaction Receipt
         * mailSent $on event
         * @desc Method to catch the mail sent event and display it on UI
         **/
        $scope.$on('mailSent', function(event, args) {
            $scope.errorSpin = false;
            $scope.showMailSuccess = true;
            $scope.mailSuccessMsg = args;
        });
        //Transaction Receipt - Ends Here


        var initialize = function() {
            ///////////////////////////////////////////////////
            $scope.showMailSuccess = false; //Transaction Receipt
            //Session Validation Call
            $scope.autoClickDTH = false;
            idfcHanlder.validateSession($http);

            $scope.termcondition = false;
            $scope.disableDeviceBack = false;
            $scope.OTPFlag = true;
            $scope.hideOTPFlag = true;
            $scope.dthNumber = '';
            $scope.amount = '';
            $scope.rechargeDthProviderMaster = [];
            $scope.rechargeDthProviderSelected = '';
            $scope.diableCheck = true;
            $scope.successValidateDthRechargeForm = false;
            $scope.validateRechargeDetailsResponse = '';
            $scope.paymentId = '';
            //$scope.accountSelected = [];
            $scope.validationError = '';
            $scope.confirmationSucess = false;
            $scope.acccountNumbers = '';
            $scope.CheckdthNM = false;
            $scope.controlPass = {
                otpValue: ''
            };
            $scope.confirmform = false;
            $scope.errorform = false;
            $scope.diableDthCheck = true;
            $scope.idSelectedVote = '';
            $scope.errorMessage = '';
            $scope.error = {
                happened: false,
                msg: ''
            };
            $scope.providerCheck = false;
            $scope.showButton = true;
            $rootScope.noSelection = false;
            $scope.tncflag = false;

            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion={};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends


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
            $scope.success.tranx = {
                happened: false,
                msg: ""
            };
            if ((typeof $scope.challengeQuesAnswers != 'undefined') && ($scope.challengeQuesAnswers != null)) {
                for (var i = 0; i < $scope.challengeQuesAnswers.length; i++) {
                    $scope.challengeQuesAnswers[i].answer = "";
                }
            }
            $("#trbd").show();
            $scope.showButton = true;
            $scope.hideSubmit = false;
            $scope.buttonSuccess = false;
            $scope.hideOTPFlag = true;
            //$scope.otpValue = "";
            $scope.hideQuesFlag = true;
            $scope.hideCombineFlag = true;
            $scope.globalerror = false;

            $scope.challengeQuesAnswers = [{
                'answer': '',
                'question': ''
            }]
            // 11 Service Calls  are there in Recharges Module

            $scope.operatorProviderListEndPoint = lpWidget.getPreference('OperatorMasterDataSrc');
            $scope.operatorCategoryListEndPoint = lpWidget.getPreference('operatorCategoryDataSrc');
            $scope.operatorCircleListEndPoint = lpWidget.getPreference('operatorCircleDataSrc');
            $scope.fetchOperatorPlanDetailsListEndPoint = lpWidget.getPreference('fetchOperatorPlanDetailsDataSrc');
            $scope.validateRechargeDetailsEndPoint = lpWidget.getPreference('validateRechargeDetailsDataSrc');
            $scope.accountsDataSrcListEndPoint = lpWidget.getPreference('accountsDataSrc');
            $scope.InitiateBillerPaymentEndPoint = lpWidget.getPreference('InitiateBillerPaymentDataSrc');
            $scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
            $scope.verifyOTPServiceEndPoint = lpWidget.getPreference('verifyOTPService');
            $scope.checkRechargeStatusEndPoint = lpWidget.getPreference('checkRechargeStatusDataSrc');
            $scope.billPaycbsfundtransfercnvIdEndPoint = lpWidget.getPreference('billPaycbsfundtransfercnvIdDataSrc');

            generateDTHOperatorProviderList();
            //$scope.getaccountDetailsDth();            // When the there is success get the ACCOUNT DETAILS.

        };

        $scope.$on('eventSuccessDTH', function(event, data) {
            $scope.hideTabDTH = data;
        });
        $scope.$on('eventErrorDTH', function(event, data) {
            $scope.hideTabDTH = data;
        });

        $scope.validateDthRechargeButton = function() {
            $scope.providerCheck = false;

            if (!angular.isUndefined($scope.rechargeDthProviderSelected) && $scope.rechargeDthProviderSelected != '' && $scope.rechargeDthProviderSelected != null) {

            } else {
                $scope.providerCheck = true;
            }

            if (!angular.isUndefined($scope.amount) && $scope.amount != '' && $scope.amount != null) {

                if (!angular.isUndefined($scope.amount) && $scope.amount != '' && $scope.amount != null) {
                    if ($scope.dthNumber.length >= 1) {
                        validateRechargeDetails();
                    }
                }
            } else {
                $scope.amountCheck = true;
            }
        }


        $scope.changeTab = function() {

            initialize();
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        }

        // Remove specific alert
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        /***
         *
         *Reset the widget
         */

        var count1 = 0;
        $scope.doAnotherDth = function() {

            //alert("doAnotherDth");
            $('#rechargeTabsUL >ul').css('display', 'inherit');
            $scope.confirmform = false;
            $rootScope.$broadcast('eventSuccessMobile', $scope.confirmform);
            $scope.errorform = false;
            $rootScope.$broadcast('eventErrorMobile', $scope.errorform);
            //console.log("Resetting.");

            //lpWidget.refreshHTML();
            $('#rechargeDthCheckBox').attr('checked', false);
            initialize();

            console.log("$scope.confirmform " + $scope.confirmform + "$scope.errorform" + $scope.errorform + "$scope.hideTabDTH" +
                $scope.hideTabDTH)
            //It was hiding DTH tab
            $scope.hideTabDTH = false;
            count1 = 0;
        }

        /**
         * Watch - DTH - dthNumber
         * @decs Watch function  which will hit Fetch operator Plan on Entering  mobileNumber (Five Digit)
         */


        $scope.$watch('dthNumber', function() {

            //console.log($scope.dthNumber);



            $scope.CheckdthNM = true;

            if (!angular.isUndefined($scope.dthNumber)) {

                if ($scope.dthNumber.match('^[0-9]{1,20}$')) {
                    //console.log($scope.dthNumber);

                }

                if ($scope.dthNumber.match('^[0-9]{1,20}$')) {
                    $scope.CheckdthNM = false;

                }

                if ($scope.dthNumber.length == 1) {

                    $scope.diableDthCheck = false; // field to disable the provider.

                }
            } else {

                $scope.rechargeDthProviderSelected = '';
                $scope.diableDthCheck = true;
            }
        });

        $scope.$watch('rechargeDthProviderSelected', function() {

            //console.log($scope.mobileNumber);
            //console.log($scope.rechargeProviderSelected);
            $scope.amount = '';

            if (!angular.isUndefined($scope.rechargeDthProviderSelected) && $scope.rechargeDthProviderSelected != '' && $scope.rechargeDthProviderSelected != null) {
                $scope.providerCheck = false;
            }


        }, true);

        $scope.$watch('amount', function() {
            if (!angular.isUndefined($scope.amount) && $scope.amount != '' && $scope.amount != null) {
                $scope.amountCheck = false;
            }

        }, true);

        //SMS Reading -- Start
        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            console.log(evt.resendOtpFlag)
            //Call function that is called on a click of "Resend OTP" button available on Widget
            if (resendFrom == 'dth') {
                console.log("issue 5701 called readsms from: " + resendFrom);
                $scope.readSMS('resend');
            }

        });

        $scope.readSMS = function(resendFlag) {
            console.log('Read SMS called');
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if (smsPlugin) {
                var isCheckSuccessCallback = function(data) {
                    if (data) {
                        var smsPermissionFlag = data['successFlag'];

                        if (smsPermissionFlag) {
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            resendFrom = 'dth';
                            console.log("issue 5701 resendFrom initialised :" + resendFrom);
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS", {
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "Recharge"
                            });

                            //Step 2. Send request to "sendOTP service
                            console.log('Resend flag->' + resendFlag);
                            if (resendFlag === 'resend') {
                                $scope.generateOTP(resendFlag);
                            } /*else {
                                $scope.enableDisableOTPorQuestion();
                            }*/


                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("Recharge", function(evt) {
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                console.log('Inside DTH Recharge');
                                var receivedOtp = evt.otp;
                                console.log('OTP: ' + evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver", {
                                    data: "Stop Reading OTP"
                                });

                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp' + receivedOtp);

                                //ctrl.otpValue = receivedOtp;
                                $scope.controlPass.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :' + $scope.controlPass.otpValue);
                                if (!$scope.autoClickDTH) {
                                    $scope.autoClickDTH = true;
                                    if ('recharge' === $scope.rechargeType) {
                                        angular.element('#verifyOTP-btn-recharge').triggerHandler('click');
                                    } else if ('dth-recharge' === $scope.rechargeType) {
                                        angular.element('#verifyOTP-btn-dth-recharge').triggerHandler('click');
                                    }
                                }

                                //angular.element('#myselector').trigger('click');


                            });
                        } else {
                            // logic changed after RSA implementation
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            /*console.log('Resend flag->' + resendFlag);
                            if (resendFlag === 'resend') {
                                $scope.generateOTP(resendFlag);
                            } else {
                                $scope.enableDisableOTPorQuestion();
                            }*/
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

        $scope.confirmationButton = function(transactionType) {
            //added below variable to identify
            //recharge or dth recharge to
            //automate respective OTP form click
            $scope.autoClickDTH = false;
            $scope.rechargeType = transactionType;
            $scope.validationError = '';

            $scope.balance = $scope.rechargeAvailableBalance;
            //console.log($scope.balance);

            $scope.amt_str = parseInt($scope.amount, 10);
            $scope.bal_str = parseInt($scope.balance, 10);

            if ($scope.rechargeAccountNumber == '') {
                $scope.accountSelected = false;
                $scope.amountCheck = true;
                $scope.validationError = "Please Select Account Number";
                $scope.confirmationSucess = false;
            } else {
                   $scope.confirmationSucess = true;
                   gadgets.pubsub.publish("js.back", {
                                           data: "ENABLE_HOME"
                   });
                                       //Automate OTP reading
                   $scope.enableDisableOTPorQuestion(); /*above 3 line added for OD acccount change 3.8*/
                /*if ($scope.bal_str >= $scope.amt_str) {
                    $scope.accountSelected = true;
                    $scope.confirmationSucess = true;
                    //$scope.hideOTPFlag = false;
                    $scope.amountCheck = false;
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                    });
                    //Automate OTP reading
                    $scope.enableDisableOTPorQuestion();
                    //$scope.readSMS('');
                } else {
                    $scope.accountSelected = false;
                    $scope.amountCheck = true;
                    $scope.validationError = "You dont have enough in your account to pay for this recharge. Please add money to your account or choose a different account.";
                    $scope.confirmationSucess = false;
                }*/ /*3.8 commented*/
            }

        }


        var setdeviceprint = function() {
            return encode_deviceprint();
        };



        $scope.enableDisableOTPorQuestion = function() {
            $scope.controlPass.otpValue = '';
            $scope.lockFieldsOTP = false;
            $scope.err = {
                happened: false,
                msg: ''
            };
            $scope.error = {
                happened: false,
                msg: ''
            };
            //alert("Inside enable disable");
            $scope.errors = {};
            $scope.alerts = [];
            $scope.buttonError = false;
            var xhr;

            var res;
            var challengeQuestions = [];

            var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("rsaAnalyzeService"));

            $scope.postData = {
                'transaction': 'recharge',
                'customerId': $scope.customerId,
                'mobileNumber': $scope.customerMob,
                'resendOTP': false,
                'accountNumber': $scope.acccountNumbers,
                'paymentMode': 'NON_RECURRING',
                'instructedAmount': $scope.amount,
                'txnMode': 'IFT',
                'ifscCode': 'IDFC00001' // BillPay IFSC Code
            };
            //$scope.postData.transaction='fundTransfer';
            $scope.postData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });
            $scope.postData.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            var data1 = $.param($scope.postData || {});

            res = $http({
                method: "POST",
                url: rsaAnalyzeService,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            res.success(function(data) {

                $scope.credentialType = data.credentialType;
                $scope.isRibUser = data.ribuser;

                // RSA changes by Xebia starting
                    if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT' ) 
                    {
                            $scope.errorSpin = false;
                            $scope.showDenyMessage = true;
                    }
                    else if(data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED')
                        {
                            $scope.showSetupCQMessage = true;
                            $scope.errorSpin = false;
                        }  
                    else if ( data.actionStatus === 'ALLOW' &&  ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) ) 
                        {
                            $scope.errorSpin = true;
                            $scope.hideOTPFlag = true;
                            $scope.generateOTP("generate");
                            $scope.readSMS('');
                        } 
                    else if (data.actionStatus === 'CHALLENGE' && ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) )
                        {
                            $scope.errorSpin = false;
                            $scope.showCQError=CQService.CHALLENGE_MESSAGE;
                            $scope.challengeQuestionCounter++;
                            $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                            $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                            $scope.hideQuesFlag = false;
                            $scope.showQuestionDiv = true;
                            $scope.hideOTPFlag = true;
                            $scope.hideCombineFlag = true;
                        }
                // RSA changes by Xebia ends

            });
            res.error(function(data) {
                idfcHanlder.checkTimeout(data);
                $scope.globalerror = idfcHanlder.checkGlobalError(data);
                if ($scope.globalerror) {
                    $scope.err = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.buttonError = true;
                }
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

        // showSetupCQ function by Xebia
        $scope.showSetupCQ = function()
        {
            gadgets.pubsub.publish('openCQ');
        }

        // cancel Transaction function by Xebia
        $scope.cancelRSATransaction = function()
        {
            gadgets.pubsub.publish("launchpad-retail.backToDashboard")  
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

            var xhr = CQService.verifyRSA(verifyCQAnswerUrl, postdata);
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
                        idfcHanlder.checkTimeout(data);
                        $scope.globalerror = idfcError.checkGlobalError(data);
                        if ($scope.globalerror) {
                            $scope.err = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.buttonError = true;
                        }
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
                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;
            })

            xhr.error(function (data, status) {
                $scope.errorSpin = false;
                        idfcHanlder.checkTimeout(data);
                        $scope.globalerror = idfcError.checkGlobalError(data);
                        if ($scope.globalerror) {
                            $scope.err = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.buttonError = true;
                        }
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

        
        $scope.initiateTransaction = function(isFormValid, action) {
            $('#rechargeTabsUL >ul').css('display', 'none');
            if (!isFormValid) {
                return false;
            }

            $scope.confirmform = false; // dont Show  Success form till success of FT
            billPaycbsfundtransferService(action); // Service call for Transaction and Initiate Payment for BillDesk
        }

        // handling for rechartge Dht otp changes minor release 2.0
        var count = 0;
        $scope.resendfunction = function() {
            if (count == 4) {

                $scope.stop = true;
                ++count;
                $scope.success = {
                    happened: false,
                    msg: ''
                };
                $scope.error = {
                    happened: true,
                    msg: 'We have tried 5 times to send you a code.'
                };

            } else {
                ++count;
                $scope.generateOTP('resend');

                $scope.stop = false;
                return count;
            }

        }


        $scope.submitfunction = function() {

            if (count1 == 3) {
                //alert("count1"+count1);
                $scope.lockFieldsOTP = true;
                $scope.stop = true;

            } else {
                $scope.lockFieldsOTP = false;
            }

        }
        /**
         * generateOTP to generate OTP on click of submit button
         * @param value
         */
        $scope.generateOTP = function(value) {
            $scope.errorSpin = true;
            $scope.errorSpinRecharge = true;
            var resendOTP = null;

            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.generateOTPServiceEndPoint, {
                servicesPath: lpPortal.root
            });
            if (value === 'resend') {
                resendOTP = true;
            } else {
                resendOTP = false;
            }
            var postData = {
                'resendOTP': resendOTP
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

            /* Check whether the HTTP Request is successful or not. */
            xhr.success(function(data) {
                console.log("issue 5701 in generateOTP success: " + resendFrom);
                $scope.errorSpinRecharge = false;
                $scope.errorSpin = false;
                $scope.hideOTPFlag = false;
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
                /*$scope.success = {
                	happened: true,
                	msg: OTP_SUCCESS_MESSAGE
                };
                $scope.error = {
                	happened: false,
                	msg: ''
                };*/
                if (count < 4) {
                    $scope.success = {
                        happened: true,
                        msg: OTP_SUCCESS_MESSAGE
                    };
                    $scope.error = {
                        happened: false,
                        msg: ''
                    };
                }


                if (count == 4) {
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };

                    $scope.error = {
                        happened: true,
                        msg: 'We have tried 5 times to send you a code.'
                    };
                }
                $scope.customerMob = data.mobileNumber;
                if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob !== null)) {
                    $scope.customerMobMasked = 'XXXXXX' + $scope.customerMob.substr($scope.customerMob.length - 4);
                    //$scope.OTPFlag = false;
                    $scope.lockFields = true;
                }
            }).error(function(data, status, headers, config) {
                console.log("issue 5701 in generateOTP error: " + resendFrom);
                gadgets.pubsub.publish("stopReceiver", {
                    data: "Stop Reading OTP"
                });
                console.log("issue 5701 in generateOTP error after stop receiver pubsub called");
                $scope.errorSpinRecharge = false;

                if (data.cd && data.cd === '501') {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    //$scope.addAlert('cd', 'error', false);
                }
                if (data.cd == "701") {
                    console.log("Inside 701: " + resendFrom);
                    $scope.resendDisabled = true;
                    $scope.stop = true;
                }
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


        /**
         *
         * @param isFormValid
         * @returns {boolean}
         */
        $scope.verifyOTP = function(isFormValid) {
            if (!isFormValid) {
                return false;
            }

            $scope.error = {
                happened: false,
                msg: ''
            };

            var verifyOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.verifyOTPServiceEndPoint, {
                servicesPath: lpPortal.root
            });

            var postData = {
                'otpValue': $scope.controlPass.otpValue,
                'requestType': 'verifyOTP'
            };

            postData = $.param(postData || {});

            var xhr = $http({
                method: 'POST',
                url: verifyOTPServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            /* Check whether the HTTP Request is successful or not. */
            xhr.success(function(data) {
                $('#rechargeTabsUL >ul').css('display', 'none');
                $scope.controlPass.otpValue = '';
                $scope.OTPFlag = true;
                $scope.initiateTransaction();
                /*$('#rechargeTabsUL >ul').css('display','none');*/

            }).error(function(data, status, headers, config) {

                if (data.cd && data.cd === '501') {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    //$scope.addAlert('cd', 'error', false);
                }
                /*$scope.cancelTransaction = checkOTPError(data);*/
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
            });
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        };


        /**
         *  ValidateRechargeDetails - This will validate the Recharge Amount.
         * @desc ValidateRechargeDetails - validate the recharge amount , whter it is correct or not
         * 		 and provide the Payment ID. for further processing
         *
         * In Java - Contoller
         *    billerName
         *    noOfAuthenticator
         *    Authenticator1 = DTH Number
         *    Authenticator2 = CircleID
         *    Authenticator3 = Recharge Type
         *    rchrgAmt = amount         	// Recharge Amount
         */
        var validateRechargeDetails = function(value) {

            $scope.alerts = [];
            $scope.errorSpin = true;
            $scope.errorMessage = '';
            var xhr;
            var validateRechargeDetailsURL = lpCoreUtils.resolvePortalPlaceholders($scope.validateRechargeDetailsEndPoint, {
                servicesPath: lpPortal.root
            });
            var postData = {
                'billerName': $scope.rechargeDthProviderSelected, // billerId
                'noOfAuthenticator': '3', // 3 AUTHS
                'Authenticator1': $scope.dthNumber, // DTH Number
                'Authenticator2': 'NA', // Circle Id selected
                'Authenticator3': 'NA', // Recharge Type
                'rchrgAmt': $scope.amount // Recharge Amount
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: validateRechargeDetailsURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
                $scope.errorSpin = false;
                $scope.successValidateDthRechargeForm = true;
                gadgets.pubsub.publish("dTHActive", {
                    "data": true
                });
                $scope.tncflag = false;
                $scope.enableButton = false;
                if (data && data !== 'null') {
                    //console.log(data);
                    $scope.validateRechargeDetailsResponse = data;
                    $scope.paymentId = $scope.validateRechargeDetailsResponse.pmtId;
                    //console.log($scope.paymentId);  //Payment ID
                }
                $scope.getaccountDetailsDth();
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                $scope.successValidateDthRechargeForm = false;
                if (data.cd) {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.errorMessage = data.rsn;
                $scope.addAlert('cd', 'error', false);
                $scope.successValidateDthRechargeForm = false;

            });
        };

        $scope.rechargeCheck = function() {
            if ($('#rechargeDthCheckBox').is(':checked')) {
                $scope.enableButton = true;
            } else {
                $scope.enableButton = false;
            }
        }

        $scope.selectedAccountNumber = function(value) {
            console.log("Inside selected account number" + value);
            if (value != null) {
                $scope.rechargeAccountNumber = value;
                $scope.rechargeAvailableBalance = value.availableBalance;
                $scope.accountCheck = true;
                $scope.accountSelected = true;
                $scope.amountCheck = false;
            } else {
                $scope.rechargeAccountNumber = '';
                $scope.rechargeAvailableBalance = '';
                $scope.validationError = "Please Select Account Number";
                $scope.accountCheck = false;
                $scope.accountSelected = false;
                $scope.amountCheck = true;

            }
        }


        /**
         *  DTH Operator/ Provider List
         *  For DTH Mandatory Fields
         *  requestId = 'SubCategory'
         *  billerSubCategory = 'PREPAID DTH'
         *
         * @desc Method to generate the dropdown list of Recharge operator/ Provider on the basics.
         */
        var generateDTHOperatorProviderList = function(value) {

            $scope.alerts = [];
            $scope.errorSpin = true;
            var xhr;
            var operatorProviderServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.operatorProviderListEndPoint, {
                servicesPath: lpPortal.root
            });

            var postData = {
                'requestId': 'SubCategory', // Constant From DB
                'billerSubCategory': 'PREPAID DTH' // Constant From DB
            };
            postData = $.param(postData || {});

            xhr = $http({
                method: 'POST',
                url: operatorProviderServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    //console.log(data);
                    $scope.rechargeDthProviderMaster = data;
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data.cd) {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                //$scope.addAlert('cd', 'error', false);

            });
        };


        /**
         * Get account Details in DTH
         * @returns {xhr}
         */
        $scope.getaccountDetailsDth = function() {
            $scope.errorSpin = true;
            $scope.alerts = [];
            var self = this;
            self.getaccountDetailsLists = httpService.getInstance({
                endpoint: lpWidget.getPreference('accountsDataSrc')
                //$scope.errorSpin = false;
            });

            var xhr = self.getaccountDetailsLists.read();

            xhr.success(function(data) {
                //alert(data);
                //console.log(data);
                $scope.rechargeAccountNumber = '';
                $scope.accountList = data;
                console.log($scope.accountList);
                $scope.accountCheck = false;
                //$scope.accountList = data;
                $scope.rechargeAvailableBalance = '';
                /*if($scope.accountList.length===1){
               $scope.accountCheck = true;
                               $scope.rechargeAccountNumber = $scope.accountList[0];
                              $scope.selectedAccountNumber($scope.accountList[0]);
                                }

*/

                $scope.enableButton = false;
                $('#rechargeDthCheckBox').attr('checked', false);
                $scope.validationError = '';
                $scope.errorSpin = false;
            });

            xhr.error(function(data) {
                $scope.errorSpin = false;
                //checkTimeout(data);
                //$scope.globalerror = checkGlobalError(data); //Commented For Now
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
            });

            return xhr;
        };

        /**
         *  FundTransfer and Transaction
         *  For Mobile Recharges Mandatory Fields
         *  Amount , AccountNumber , PaymentID, Mobile number
         *
         * @desc Method to do TXN and Initiate Payment
         */
        $scope.errorSpinRecharge = false;
        var billPaycbsfundtransferService = function(action) {



            $scope.errorSpin = false;
            $scope.errorSpinRecharge = true;

            //$scope.errorSpin = true;
            //$scope.errorSpin = true;
            $scope.alerts = [];
            var xhr;
            var billPaycbsfundtransferServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.billPaycbsfundtransfercnvIdEndPoint, {
                servicesPath: lpPortal.root
            });

            var now = new Date();
            var postData = {
                'amount': $scope.amount, // Amount
                'paymentId': $scope.paymentId, // Payment Id from Validate Recharge Details
                'billPaymentId': $scope.paymentId,
                'accountId': $scope.rechargeAccountNumber.id, // Account Number For Fund Transfer
                'counterpartyAccount': '10000306670', //Billpay Account number
                'counterpartyName': 'Bill Desk',
                'accountName': '',
                'instructedAmount': $scope.amount,
                'instructedCurrency': 'INR',
                'txnMode': 'IFT',
                'paymentMode': 'NON_RECURRING',
                'paymentDescription': 'Recharge',
                'type': 'Bank',
                'onDate': now.getTime(),
                'adBnfcry': 'N',
                'bllrAcctId': 'NA',
                'bllrId': $scope.rechargeDthProviderSelected,
                'bllId': $scope.rechargeDthProviderSelected,
                'bllNbr': 'NA',
                'billPaymentType': 'RNP',
                'pmtAmt': $scope.amount, // Amount
                'noOfAuthenticator': 2,
                'Authenticator1': $scope.dthNumber,
                'Authenticator2': $scope.rechargeCircleSelected,
                'cstId': '',
                'mobileNumber': $scope.dthNumber,
                'circle': $scope.rechargeCircleSelected,
                'operator': $scope.rechargeDthProviderSelected
            };

            count1++;
            //postData.requestType = 'verifyOTP';
            postData.otpValue = $scope.controlPass.otpValue;
            postData.credentialType = action;

            postData = $.param(postData || {});

            xhr = $http({
                method: 'POST',
                url: billPaycbsfundtransferServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {

                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });

                $scope.errorSpinRecharge = false;
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    //console.log(data);

                    if (data != null) {
                        $scope.rechargeProviderMaster = data;
                        $scope.confirmform = true;
                        $scope.data = data;
                        $rootScope.$broadcast('eventSuccessDTH', $scope.confirmform);
                        lpCoreBus.publish("launchpad-retail.refreshAccountSummary");
                        var transactionID = $scope.isEmptyVal(data.txnId) ? "-" : data.txnId;

                        var actionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("getTxnDateTime"));
                        console.log("Tets URL:", actionUrl);
                        var request = $http({
                            method: 'POST',
                            url: actionUrl,
                            data: JSON.stringify({ txnID: transactionID }),
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json;'
                            }
                        });
                        // Transaction Receipt start
                        request.success(function(response, status, headers, config) {
                                $scope.successItems = {}; //Transaction Receipt
                                $scope.successItems = {
                                    "successMessage": "Congratulations! Your DTH Recharge is successful.",
                                    "transactionReferenceNumber": $scope.isEmptyVal(data.txnId) ? "-" : data.txnId,
                                    "subscriberId": $scope.isEmptyVal($scope.dthNumber) ? "-" : $scope.dthNumber,
                                    "serviceProvider": $scope.isEmptyVal($scope.rechargeDthProviderSelected) ? "NA" : $scope.rechargeDthProviderSelected,
                                    "rechargeAmount": $scope.isEmptyVal($scope.amount) ? "0.00" : ($scope.amount).toString(),
                                    "dateOfRechargeTransaction": response.content.createdAt
                                };

                                $scope.items = [{ item: 'Transaction Ref No', value: $scope.successItems.transactionReferenceNumber, display: true }, { item: 'Subscriber ID', value: $scope.successItems.subscriberId, display: true }, { item: 'Service Provider', value: $scope.successItems.serviceProvider, display: true }, { item: 'Recharge Amount', value: $scope.successItems.rechargeAmount, display: true, currency: true }, { item: 'Date of Recharge', value: $scope.successItems.dateOfRechargeTransaction, display: true }];
                                $scope.actions = [{ button: "Email", className: "mailButton", transType: "dthRecharge", receiptType: 'email', tooltip: 'Mail this to your registered email ID' }];
                                $scope.buttons = [{ name: "Recharge Again", className: "btn btn-primary primary-btn-btn primary-btn-ft", param: 'rechargeAgain', style: "height:35px !important; width:100% !important;" }, { name: "Done", className: "btn secondary-btn-btn secondary-btn-ft btn-align review-button forDoneButton", param: 'accountSummary', style: "height:35px !important; width:100% !important;" }];
                         

                        $rootScope.$broadcast('eventSuccessMobile', $scope.confirmform);
                        lpCoreBus.publish("launchpad-retail.refreshAccountSummary");
                    })
                request.error(function(error) {
                    console.log("Date txn Date & Time:", error);
                    self.errorSpin = false;
                });
                        }
                        }
            });
            /*xhr.error(function(data, status, headers, config) {
            	$scope.confirmform=false;
            	$scope.errorSpin = false;
            	if(data.cd == '02' || data.cd == '04'){

            			$scope.error = {
            				happened: true,
            				msg: data.rsn
            			};
            			$scope.success.happened = false;

            		// If session timed out, redirect to login page
            		//checkTimeout(data);
            		// If service not available, set error flag
            		//$scope.serviceErrorAPIN = checkGlobalError(data);
            	}
            	else if(data.cd == '08' ){
            		$scope.error = {
            				happened: true,
            				msg: data.rsn
            			};
            			$scope.success.happened = false;
            			$scope.cancelTransaction = true;
            	}
            	else if(data.cd == 'ONREV999' || data.rsn ==='Recharge Pending'){
            		$scope.confirmform=false;
            		$scope.errorform = true;
            		$rootScope.$broadcast('eventErrorMobile', $scope.errorform);

            			$scope.alert = {
            		messages: {
            			cd: data.rsn
            		}
            	};
            	//$scope.addAlert('cd', 'error', false);
            		//$scope.errMessagedth = data.rsn;
            	}else{
            	$scope.confirmform=false;

            		$scope.alert = {
            		messages: {
            			cd: data.rsn
            		}
            	};
            	//$scope.addAlert('cd', 'error', false);

            	}

            });*/
            xhr.error(function(data, status, headers, config) {
                //count1++;
                $scope.confirmform = false;
                $scope.errorSpin = false;
                $scope.errorSpinRecharge = false;
                $scope.dataError = data;
                $scope.success.happened = false;
                if (count1 == 3)
                {

                    $scope.error = {
                        happened: true,
                        msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                    };
                }
                else if (data.cd == 'TRANS_LIMIT_EXCEEDED_01')
                {
                    console.log("billPayCbsErrorData.rsn test " + data.rsn);
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success.happened = false;

                } /* else {
                    $scope.error = {
                        happened: true,
                        msg: "That's the wrong code! Please try again."
                    };
                    $scope.success.happened = false;



                }*/
                else
               {
               console.log("data.rs@n" +data.rsn);
				if(data.cd == '02' || data.cd == '04')
				{

						$scope.error = {
							happened: true,
							msg: data.rsn
						};
						$scope.success.happened = false;

					// If session timed out, redirect to login page
					//checkTimeout(data);
					// If service not available, set error flag
					//$scope.serviceErrorAPIN = checkGlobalError(data);
				}
				else if(data.cd == '08' )
				{
					$scope.error = {
							happened: true,
							msg: data.rsn
						};
						$scope.success.happened = false;
						$scope.cancelTransaction = true;
				}
				else if(data.cd == 'ONREV999' || data.rsn ==='Recharge Pending')
				{
					$scope.confirmform=false;
					$scope.errorform = true;
					$rootScope.$broadcast('eventErrorMobile', $scope.errorform);

				   $scope.alert = {
					messages: {
						cd: data.rsn
					}
				};
				//$scope.addAlert('cd', 'error', false);
					//$scope.errMessagedth = data.rsn;
				}
				else
				{
				/*$scope.confirmform=false;

					$scope.alert = {
					messages: {
						cd: data.rsn
					}
				};*/
				$scope.error = {
                		happened: true,
                		msg: data.rsn
                		};
                $scope.success.happened = false;
				//$scope.addAlert('cd', 'error', false);
				}
             }
            });
        };

        /**
         * Transaction Receipt
         * Print, Download and Email method
         * @desc Method to carry out Download, Print and Email the Advice to user.
         */

        $scope.formatDate = function(dt, dateTime) {
            if (dateTime) {
                return dt.toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });
            } else {
                return dt.toLocaleString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
            }
        }
        $scope.transReceiptModule = new transReceiptModule();

        $scope.transReceipt = function(receiptType, transType) {
            $scope.errorSpin = true;
            $scope.showMailSuccess = false;
            // $scope.transReceiptModule.transReceipt(receiptType, transType, $scope.successItems);//commented to pass blank data to generate the receipt on back-end
            $scope.transReceiptModule.transReceipt(receiptType, transType, {});
        };
        // Transaction Receipt - Ends here

        /**
         * Comman Util Function
         * isEmptyVal method
         * @desc Method to check for empty val in string,object, array etc.
         */
        $scope.isEmptyVal = function(val) {
            if (val === undefined) {
                return true;
            }
            if (val === null) {
                return true;
            }
            if (val instanceof Object) {
                return Object.keys(val).length === 0;
            }

            if (val instanceof Array) {
                return val.length === 0;
            }

            if (val.toString().trim().length === 0) {
                return true;
            }
            return false;
        }
        //isEmptyVal - Ends

        /**
         * Transaction Receipt
         * successAction method
         * @desc Method to conditionally route the user to Account Summary page or to Recharge Again widget
         **/
        $scope.successAction = function(actionType) {
            document.getElementById("rechargeTabsUL").children[0].setAttribute("class", "nav nav-tabs")
            if (actionType == "rechargeAgain") {
                $scope.doAnotherDth();
            } else {
                gadgets.pubsub.publish("launchpad-retail.backToDashboard");
            }

        }

        //Transaction Receipt -Ends here

        /**
         * Go back to Previous Page from Validate Recharge Screen
         */
        $scope.cancelForm = function() {
            $scope.successValidateDthRechargeForm = false;
            $('#rechargeTabsUL >ul').css('display', 'inherit');
            //console.log("back");
            $scope.$apply();
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        }
        $scope.cancelFormBack = function() {
            $scope.successValidateDthRechargeForm = false;

            console.log("back");

            $scope.$apply();

        }

        /**
         * Go back to Previous Page from Otp Screen to select Account Number Screen (Validate Recharge Screen)
         */
        $scope.backFromOtp = function() {

            initialize();

        }
        $scope.tnc = function() {

            console.log("HELLO TNC00");
            $('#rechargeTabsUL >ul').css('display', 'none');
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });
            $scope.tncflag = true;
        };

        /**
         * Alerts to push Alerts on screen
         */
        $scope.alerts = [];

        $scope.addAlert = function(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };

            $scope.alerts.push(customAlert);

            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(customAlert));
                }, ALERT_TIMEOUT);
            }

        };


        $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
        $scope.template = {

            acceptTC: $scope.partialsDir + '/acceptTC.html',
            successful: $scope.partialsDir + '/ValidateDthRecharge.html',
            otpConfirm: $scope.partialsDir + '/dthOtpConfirm.html',
            success: $scope.partialsDir + '/dthSuccess.html',
            error: $scope.partialsDir + '/dthError.html',
            tncpage: $scope.partialsDir + '/acceptTC.html'

        };



        initialize();
    }


    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function RechargeCtrl($scope, $rootScope, $timeout, $rootElement, lpWidget, lpCoreUtils, $http, httpService, lpCoreBus, lpPortal, CQService) {

        //Session Validation Call
        idfcHanlder.validateSession($http);

        $scope.autoClickPrepaidMobile = false;

        $scope.rechargeType = '';

        // RSA changes by Xebia start
        $scope.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('verifyCQAnswerUrl'));
        // to fetch mobile specific data
            gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });
        // RSA changes by Xebia ends
	
	 /**
         * Transaction Receipt
         * mailSent $on event
         * @desc Method to catch the mail sent event and display it on UI
         **/
        $scope.$on('mailSent', function(event, args) {
            $scope.errorSpin = false;
            $scope.showMailSuccess = true;
            $scope.mailSuccessMsg = args;
        });
        //mailSent - Ends Here

        var initialize = function() {

            $scope.autoClickPrepaidMobile = false;
            ///////////////////////////////////////////////////
            $scope.errorSpinRecharge = false;
            $scope.errorSpin1 = false;
            $scope.errorSpin3 = false;
            // $scope.errorSpin1 = false;
            $scope.OTPFlag = true;
            $scope.hideOTPFlag = true;
            $scope.rechargeCircleSelected = '';
            $scope.disableDeviceBack = false;
            $scope.rechargeProviderSelected = '';
            $scope.rechargeCircleMaster = [];
            $scope.rechargeProviderMaster = [];
            $scope.planDetails = [];
            $scope.mobileNumber = '';
            $scope.amount = '';
            $scope.diableCheck = true;
            $scope.mobileNumberFlag = true;
            $scope.successValidateRechargeForm = false;
            $scope.validateRechargeDetailsResponse = '';
            $scope.paymentId = '';
            $scope.enableButton = false;

            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion={};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends

            $scope.validationError = '';
            $scope.confirmationSucess = false;
            $scope.acccountNumbers = '';
            $scope.controlPass = {
                otpValue: ''
            };
            $scope.confirmform = false;
            $scope.allowMoreResults = false;
            $scope.pagesShown = 1;
            $scope.pageSize = 5;
            $scope.hasMoreItemsToShow = false;
            $scope.amountCheck = false;
            $scope.circleCheck = false;
            $scope.providerCheck = false;

            $scope.CheckMobileNM = '';
            $scope.accountCheck = false;
            $rootScope.noSelection = false;
            $scope.tncflag = false;

            $scope.dthNumber = '';
            $scope.rechargeDthProviderMaster = [];
            $scope.rechargeDthProviderSelected = '';
            $scope.plans = '';
            $scope.noPlanDetails = false;
            $scope.ctgry = 'Full Talktime'; // Default will Be Full Talk time

            $scope.mutipleCallFlag = '1';
            $scope.error = {
                happened: false,
                msg: ''
            };
            $scope.showButton = true;
            $scope.hideSubmit = false;
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
            $scope.success.tranx = {
                happened: false,
                msg: ""
            };
            if ((typeof $scope.challengeQuesAnswers != 'undefined') && ($scope.challengeQuesAnswers != null)) {
                for (var i = 0; i < $scope.challengeQuesAnswers.length; i++) {
                    $scope.challengeQuesAnswers[i].answer = "";
                }
            }
            $("#trbd").show();
            $scope.showButton = true;
            $scope.hideSubmit = false;
            $scope.buttonSuccess = false;
            $scope.hideOTPFlag = true;
            //$scope.otpValue = "";
            $scope.hideQuesFlag = true;
            $scope.hideCombineFlag = true;
            $scope.globalerror = false;

            $scope.challengeQuesAnswers = [{
                'answer': '',
                'question': ''
            }]
            // 11 Service Calls  are there in Recharges Module

            $scope.operatorProviderListEndPoint = lpWidget.getPreference('OperatorMasterDataSrc');
            $scope.operatorCategoryListEndPoint = lpWidget.getPreference('operatorCategoryDataSrc');
            $scope.operatorCircleListEndPoint = lpWidget.getPreference('operatorCircleDataSrc');
            $scope.fetchOperatorPlanDetailsListEndPoint = lpWidget.getPreference('fetchOperatorPlanDetailsDataSrc');
            $scope.validateRechargeDetailsEndPoint = lpWidget.getPreference('validateRechargeDetailsDataSrc');
            $scope.accountsDataSrcListEndPoint = lpWidget.getPreference('accountsDataSrc');
            $scope.InitiateBillerPaymentEndPoint = lpWidget.getPreference('InitiateBillerPaymentDataSrc');
            $scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
            $scope.verifyOTPServiceEndPoint = lpWidget.getPreference('verifyOTPService');
            $scope.checkRechargeStatusEndPoint = lpWidget.getPreference('checkRechargeStatusDataSrc');
            $scope.billPaycbsfundtransfercnvIdEndPoint = lpWidget.getPreference('billPaycbsfundtransfercnvIdDataSrc');
            $scope.cancelTransaction = false;

            generateOperatorProviderList();
            generateCircleList();
        }

        $scope.$on('eventSuccessMobile', function(event, data) {
            $scope.hideTabMobile = data;
        });
        $scope.$on('eventErrorMobile', function(event, data) {
            $scope.hideTabMobile = data;
        });

        $scope.showMore = function(value) {
            $scope.allowMoreResults = true;
            $scope.paginationLimit = function(value) {
                return $scope.pageSize * $scope.pagesShown;
            };
            $scope.hasMoreItemsToShow = function() {
                return $scope.pagesShown < (value.length / $scope.pageSize);
            };
            $scope.showMoreItems = function() {
                $scope.pagesShown = $scope.pagesShown + 1;
            };

        };

        $scope.validateRechargeButton = function() {

            $scope.mobileNumberReq = false;
            $scope.circleCheck = false;
            $scope.amountCheck = false;
            $scope.providerCheck = false;
            if ($scope.mobileNumber == '' || angular.isUndefined($scope.mobileNumber)) {
                $scope.mobileNumberReq = true;
            }

            //console.log("Amount Captured:" + $scope.amount);
            if (!angular.isUndefined($scope.rechargeProviderSelected) && $scope.rechargeProviderSelected != '' && $scope.rechargeProviderSelected != null) {

                if (!angular.isUndefined($scope.rechargeCircleSelected) && $scope.rechargeCircleSelected != '' && $scope.rechargeCircleSelected != null) {


                    if (!angular.isUndefined($scope.amount) && $scope.amount != '' && $scope.amount != null) {
                        $scope.amountCheck = false;

                        if ($scope.mobileNumber.length >= 10) {

                            validateRechargeDetails();
                            gadgets.pubsub.publish("js.back", {
                                data: "ENABLE_BACK"
                            });
                        }

                    } else {
                        $scope.amountCheck = true;
                    }

                } else {

                    $scope.circleCheck = true;
                }


            } else {
                $scope.providerCheck = true;
            }

        }

        //SMS Reading -- Start

        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            console.log('Resend from popup :' + evt.resendOtpFlag)
            //Call function that is called on a click of "Resend OTP" button available on Widget
            if (resendFrom == 'prepaid') {
                console.log("issue 5701 called readsms from: " + resendFrom);
                $scope.readSMS('resend');
            }


        });

        $scope.readSMS = function(resendFlag) {
            console.log('Read SMS called');
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if (smsPlugin) {
                var isCheckSuccessCallback = function(data) {
                    if (data) {
                        var smsPermissionFlag = data['successFlag'];

                        if (smsPermissionFlag) {
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            resendFrom = 'prepaid';
                            console.log("issue 5701 resendFrom initialised: " + resendFrom);
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS", {
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "Recharge"
                            });

                            //Step 2. Send request to "sendOTP service
                            console.log('Resend flag->' + resendFlag);
                            if (resendFlag === 'resend') {
                                $scope.generateOTP(resendFlag);
                            } /*else {
                                $scope.enableDisableOTPorQuestion();
                            }*/


                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("Recharge", function(evt) {
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                console.log('Inside Prepaid Mobile Recharge');
                                var receivedOtp = evt.otp;
                                console.log('OTP: ' + evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver", {
                                    data: "Stop Reading OTP"
                                });

                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp' + receivedOtp);

                                //ctrl.otpValue = receivedOtp;
                                $scope.controlPass.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :' + $scope.controlPass.otpValue);

                                if (!$scope.autoClickPrepaidMobile) {
                                    $scope.autoClickPrepaidMobile = true;
                                    if ('recharge' === $scope.rechargeType) {
                                        angular.element('#verifyOTP-btn-recharge').triggerHandler('click');
                                    } else if ('dth-recharge' === $scope.rechargeType) {
                                        angular.element('#verifyOTP-btn-dth-recharge').triggerHandler('click');
                                    }
                                }
                                //angular.element('#myselector').trigger('click');


                            });
                        } else {
                            // logic changed after RSA implementation
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            /*console.log('Resend flag->' + resendFlag);
                            if (resendFlag === 'resend') {
                                $scope.generateOTP(resendFlag);
                            } else {
                                $scope.enableDisableOTPorQuestion();
                            }*/
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

        $scope.confirmationButton = function(transactionType) {

            //added below variable to identify
            //recharge or dth recharge to
            //automate respective OTP form click
            $scope.autoClickPrepaidMobile = false;
            $scope.rechargeType = transactionType;

            $scope.validationError = '';

            $scope.balance = $scope.rechargeAvailableBalance;
            //console.log($scope.balance);

            $scope.amt_str = parseInt($scope.amount, 10);
            $scope.bal_str = parseInt($scope.balance, 10);

            if ($scope.rechargeAccountNumber == '') {
                $scope.accountSelected = false;
                $scope.amountCheck = true;
                $scope.validationError = "Please Select Account Number";
                $scope.confirmationSucess = false;
            } else {
                    $scope.confirmationSucess = true;
                                       //$scope.hideOTPFlag = false;
                                       gadgets.pubsub.publish("js.back", {
                                           data: "ENABLE_HOME"
                                       });
                                       //$scope.generateOTP();
                                       //Automate OTP reading
                                       $scope.enableDisableOTPorQuestion();
                /*if ($scope.bal_str >= $scope.amt_str) {
                    $scope.accountSelected = true;
                    $scope.confirmationSucess = true;
                    //$scope.hideOTPFlag = false;
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                    });
                    //$scope.generateOTP();
                    //Automate OTP reading
                    $scope.enableDisableOTPorQuestion();
                    //$scope.readSMS('');
                    $scope.amountCheck = false;

                } else {
                    $scope.accountSelected = false;
                    $scope.validationError = "You dont have enough in your account to pay for this recharge. Please add money to your account or choose a different account.";
                    $scope.confirmationSucess = false;
                    $scope.amountCheck = true;
                }*/ /*3.8 commented oD changes*/
            }

        }

        gadgets.pubsub.subscribe("native.back", function(evt) {
            $scope.errorSpin = false;
            console.log(evt.text);
            if ($scope.tncflag) {
                //$scope.noSelection = true;
                $scope.tncflag = false;

                $scope.rechargeCheck();
                $scope.$apply();
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
            } else {
                $scope.cancelFormBack();
            }
            //$scope.$apply();
        });
        gadgets.pubsub.subscribe("dTHActive", function(data) {
            $scope.disableDeviceBack = data.data;
        });
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if (localStorage.getItem("navigationFlag") || $scope.successValidateRechargeForm || $scope.noSelection || $scope.tncflag) {
                $scope.errorSpin = false;
                console.log(evt.text);
                if ($scope.tncflag) {
                    //$scope.noSelection = true;
                    $scope.tncflag = false;

                    $scope.rechargeCheck();
                    $scope.$apply();
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_BACK"
                    });
                } else {
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                    });
                    $scope.cancelFormBack();
                }
            } else if (!$scope.disableDeviceBack) {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        var setdeviceprint = function() {
            return encode_deviceprint();
        };

        $scope.enableDisableOTPorQuestion = function() {
            $scope.errorSpin = true;
            $scope.controlPass.otpValue = '';
            $scope.lockFieldsOTP = false;
            $scope.err = {
                happened: false,
                msg: ''
            };
            $scope.error = {
                happened: false,
                msg: ''
            };
            //alert("Inside enable disable");
            $scope.errors = {};
            $scope.alerts = [];
            $scope.buttonError = false;
            var xhr;

            var res;
            var challengeQuestions = [];

            var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("rsaAnalyzeService"));

            $scope.postData = {
                'transaction': 'recharge',
                'customerId': $scope.customerId,
                'mobileNumber': $scope.customerMob,
                'resendOTP': false,
                'accountNumber': $scope.acccountNumbers,
                'paymentMode': 'NON_RECURRING',
                'instructedAmount': $scope.amount,
                'txnMode': 'IFT',
                'ifscCode': 'IDFC00001' // BillPay IFSC Code
            };
            //$scope.postData.transaction='fundTransfer';
            $scope.postData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });
            $scope.postData.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            var data1 = $.param($scope.postData || {});

            res = $http({
                method: "POST",
                url: rsaAnalyzeService,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            res.success(function(data) {

                $scope.credentialType = data.credentialType;
                $scope.isRibUser = data.ribuser;

                // RSA changes by Xebia starts
                    if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT' ) 
                    {
                            $scope.errorSpin = false;
                            $scope.showDenyMessage = true;
                    }
                    else if(data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED')
                        {
                            $scope.showSetupCQMessage = true;
                            $scope.errorSpin = false;
                        }  
                    else if ( data.actionStatus === 'ALLOW' &&  ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) ) 
                        {
                            $scope.errorSpin = true;
                            $scope.hideOTPFlag = true;
                            $scope.generateOTP("generate");
                            $scope.readSMS('');
                        } 
                    else if (data.actionStatus === 'CHALLENGE' && ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) )
                        {
                            $scope.errorSpin = false;
                            $scope.showCQError=CQService.CHALLENGE_MESSAGE;
                            $scope.challengeQuestionCounter++;
                            $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                            $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                            $scope.hideQuesFlag = false;
                            $scope.showQuestionDiv = true;
                            $scope.hideOTPFlag = true;
                            $scope.hideCombineFlag = true;
                        }
                // RSA changes by Xebia ends

            });
            res.error(function(data) {
                idfcHanlder.checkTimeout(data);
                $scope.globalerror = idfcHanlder.checkGlobalError(data);
                if ($scope.globalerror) {
                    $scope.err = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.buttonError = true;
                }
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

        // showSetupCQ function by Xebia
        $scope.showSetupCQ = function()
        {
            gadgets.pubsub.publish('openCQ');
        }

        // cancel Transaction function by Xebia
        $scope.cancelRSATransaction = function()
        {
            gadgets.pubsub.publish("launchpad-retail.backToDashboard")  
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

            var xhr = CQService.verifyRSA(verifyCQAnswerUrl, postdata);
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
                        idfcHanlder.checkTimeout(data);
                        $scope.globalerror = idfcError.checkGlobalError(data);
                        if ($scope.globalerror) {
                            $scope.err = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.buttonError = true;
                        }
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
                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;
            })

            xhr.error(function (data, status) {
                $scope.errorSpin = false;
                        idfcHanlder.checkTimeout(data);
                        $scope.globalerror = idfcError.checkGlobalError(data);
                        if ($scope.globalerror) {
                            $scope.err = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.buttonError = true;
                        }
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


        $scope.initiateTransaction = function(isFormValid, action) {

            //console.log("INTI TXN");
            $('#rechargeTabsUL >ul').css('display', 'none');
            $scope.alerts = [];
            if (!isFormValid) {
                return false;
            }

            $scope.confirmform = false; // dont Show  Success form till success of FT
            billPaycbsfundtransferService(action); // Service call for Transaction and Initiate Payment for BillDesk


        }

        $scope.changeTab = function() {
            initialize();
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        }

        /**
         *  FundTransfer and Transaction
         *  For Mobile Recharges Mandatory Fields
         *  Amount , AccountNumber , PaymentID, Mobile number
         *
         * @desc Method to do TXN and Initiate Payment
         */
        var billPaycbsfundtransferService = function(action) {

            $scope.errorSpin = false;
            $scope.errorSpinRecharge = true;

            $scope.alerts = [];
            var xhr;
            var billPaycbsfundtransferServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.billPaycbsfundtransfercnvIdEndPoint, {
                servicesPath: lpPortal.root
            });

            var now = new Date();
            var postData = {
                'amount': $scope.amount, // Amount
                'paymentId': $scope.paymentId, // Payment Id from Validate Recharge Details
                'billPaymentId': $scope.paymentId,
                'accountId': $scope.rechargeAccountNumber.id, // Account Number For Fund Transfer
                'counterpartyAccount': '10000306670', // billpay account Number
                'counterpartyName': 'Bill Desk',
                'accountName': '',
                'instructedAmount': $scope.amount,
                'instructedCurrency': 'INR',
                'txnMode': 'IFT',
                'paymentMode': 'NON_RECURRING',
                'paymentDescription': 'Recharge',
                'type': 'Bank',
                'onDate': now.getTime(),
                'adBnfcry': 'N',
                'bllrAcctId': 'NA',
                'bllrId': $scope.rechargeProviderSelected,
                'bllId': $scope.rechargeProviderSelected,
                'bllNbr': 'NA',
                'billPaymentType': 'RNP',
                'pmtAmt': $scope.amount, // Amount
                'noOfAuthenticator': 2,
                'Authenticator1': $scope.mobileNumber,
                'Authenticator2': $scope.rechargeCircleSelected,
                'cstId': '',
                'mobileNumber': $scope.mobileNumber,
                'circle': $scope.rechargeCircleSelected,
                'operator': $scope.rechargeProviderSelected
            };

            postData.otpValue = $scope.controlPass.otpValue;
            count1++;
            //postData.requestType = 'verifyOTP';
            postData.credentialType = action;
            postData = $.param(postData || {});

            xhr = $http({
                method: 'POST',
                url: billPaycbsfundtransferServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpinRecharge = false;
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
                $scope.errorSpin = false;
                if (data && data !== 'null') {

                    if (data != null) {

                        $scope.confirmform = true;
                        $scope.data = data;
                        $rootScope.$broadcast('eventSuccessDTH', $scope.confirmform);
                        $scope.isEmptyVal(data.txnId) ? "NA" : data.txnId
                        var transactionID = $scope.isEmptyVal(data.txnId) ? "-" : data.txnId;

                        var actionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("getTxnDateTime"));
                        console.log("Tets URL:", actionUrl);
                        var request = $http({
                            method: 'POST',
                            url: actionUrl,
                            data: JSON.stringify({ txnID: transactionID }),
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json;'
                            }
                        });
                        request.success(function(response, status, headers, config) {
                            $scope.successItems = {};
                            $scope.successItems = {
                                "successMessage": "Congratulations! Your Mobile Recharge is successful.",
                                "transactionReferenceNumber": $scope.isEmptyVal(data.txnId) ? "NA" : data.txnId,
                                "mobileNumber": $scope.isEmptyVal($scope.mobileNumber) ? "-" : $scope.mobileNumber,
                                "operatorName": $scope.isEmptyVal($scope.rechargeProviderSelected) ? "NA" : $scope.rechargeProviderSelected,
                                "operatorCircle": $scope.isEmptyVal($scope.rechargeCircleSelected) ? "NA" : $scope.rechargeCircleSelected,
                                "rechargeAmount": $scope.isEmptyVal($scope.amount) ? "0.00" : ($scope.amount).toString(),
                                "dateOfRechargeTransaction": response.content.createdAt
                            };

                            $scope.items = [{ item: 'Transaction Ref No', value: $scope.successItems.transactionReferenceNumber, display: true }, { item: 'Mobile Number', value: $scope.successItems.mobileNumber, display: true }, { item: 'Operator Name', value: $scope.successItems.operatorName, display: true }, { item: 'Operator Circle', value: $scope.successItems.operatorCircle, display: true }, { item: 'Recharge Amount', value: $scope.successItems.rechargeAmount, display: true, currency: true }, { item: 'Date of Recharge', value: $scope.successItems.dateOfRechargeTransaction, display: true }];
                            $scope.actions = [{ button: "Email", className: "mailButton", transType: "mobileRecharge", receiptType: 'email', tooltip: 'Mail this to your registered email ID' }];
                            $scope.buttons = [{ name: "Recharge Again", className: "btn btn-primary primary-btn-btn primary-btn-ft", param: 'rechargeAgain', style: "height:35px !important; width:100% !important;" }, { name: "Done", className: "btn secondary-btn-btn secondary-btn-ft btn-align review-button forDoneButton", param: 'accountSummary', style: "height:35px !important; width:100% !important;" }];
                            lpCoreBus.publish("launchpad-retail.refreshAccountSummary");
                        })
                        request.error(function(error) {
                            console.log("Date txn Date & Time:", error);
                            self.errorSpin = false;
                        });
                    }
                }




            });
            /*xhr.error(function(data, status, headers, config) {
				$scope.errorSpin = false;
                				 if(data.cd == '02' || data.cd == '04'){

                					$scope.error = {
                							happened: true,
                							msg: data.rsn
                						};
                					$scope.success.happened = false;

                                    // If session timed out, redirect to login page
                                    //checkTimeout(data);
                                    // If service not available, set error flag
                                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                                }
                				else if(data.cd == '08' ){
                					$scope.error = {
                							happened: true,
                							msg: data.rsn
                						};
                						$scope.success.happened = false;
                						$scope.cancelTransaction = true;
                				}
                				else if(data.cd == 'ONREV999' || data.rsn ==='Recharge Pending'){
                					$scope.confirmform=false;
                					$scope.errorform = true;
                					$rootScope.$broadcast('eventErrorDTH', $scope.errorform);

                						$scope.alert = {
                						messages: {
                						cd: data.rsn
                						}
                					};
                				//$scope.addAlert('cd', 'error', false);
                					//$scope.errMessagedth = data.rsn;
                				}else{
                					$scope.confirmform=false;
                						$scope.alert = {
                						messages: {
                							cd: data.rsn
                						}
                					};
                				//$scope.addAlert('cd', 'error', false);

                				}
			});*/

            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                $scope.errorSpinRecharge = false;
                $scope.dataError = data;
                $scope.success.happened = false;
                if (count1 == 3) {
                    $scope.error = {
                        happened: true,
                        msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                    };
                } else if (data.cd == 'TRANS_LIMIT_EXCEEDED_01') {
                    console.log("billPayCbsErrorData.rsn test " + data.rsn);
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success.happened = false;

                }
                /*else {
                    $scope.error = {
                        happened: true,
                        msg: "That's the wrong code! Please try again."
                    };
                    $scope.success.happened = false;



                }*/
                else
                        {
                            				 if(data.cd == '02' || data.cd == '04'){

                            					$scope.error = {
                            							happened: true,
                            							msg: data.rsn
                            						};
                            					$scope.success.happened = false;

                                                // If session timed out, redirect to login page
                                                //checkTimeout(data);
                                                // If service not available, set error flag
                                                //$scope.serviceErrorAPIN = checkGlobalError(data);
                                            }
                            				else if(data.cd == '08' ){
                            					$scope.error = {
                            							happened: true,
                            							msg: data.rsn
                            						};
                            						$scope.success.happened = false;
                            						$scope.cancelTransaction = true;
                            				}
                            				else if(data.cd == 'ONREV999' || data.rsn ==='Recharge Pending'){
                            					$scope.confirmform=false;
                            					$scope.errorform = true;
                            					$rootScope.$broadcast('eventErrorDTH', $scope.errorform);

                            						$scope.alert = {
                            						messages: {
                            						cd: data.rsn
                            						}
                            					};
                            				//$scope.addAlert('cd', 'error', false);
                            					//$scope.errMessagedth = data.rsn;
                            				}else{
                            					/*$scope.confirmform=false;
                            						$scope.alert = {
                            						messages: {
                            							cd: data.rsn
                            						}
                            					};*/
                            						$scope.error = {
                                                                      happened: true,
                                                                      msg: data.rsn
                                                                    };
                                                              	$scope.success.happened = false;
                            				//$scope.addAlert('cd', 'error', false);

                            				}
                        }
            });
        };

        $scope.cancelOtpForm = function() {

        }

        /**
         * Transaction Receipt
         * successAction method
         * @desc Method to conditionally route the user to Account Summary page or to Recharge Again widget
         **/
        $scope.successAction = function(actionType) {
            document.getElementById("rechargeTabsUL").children[0].setAttribute("class", "nav nav-tabs")
            if (actionType == "rechargeAgain") {
                $scope.doAnother()
            } else {
                gadgets.pubsub.publish("launchpad-retail.backToDashboard");
            }

        }
        //Transaction Receipt -Ends here

        /**
         * Comman Util Function
         * isEmptyVal method
         * @desc Method to check for empty val in string,object, array etc.
         */
        $scope.isEmptyVal = function(val) {
            if (val === undefined) {
                return true;
            }
            if (val === null) {
                return true;
            }
            if (val instanceof Object) {
                return Object.keys(val).length === 0;
            }

            if (val instanceof Array) {
                return val.length === 0;
            }

            if (val.toString().trim().length === 0) {
                return true;
            }
            return false;
        }

        //isEmptyVal - Ends

        /**
         * Transaction Receipt
         * FormatDate and transReceipt method
         * @desc Method to format Date and to carry out Download, Print and Email the Advice to user.
         */

        $scope.formatDate = function(dt, dateTime) {
            if (dateTime) {
                return dt.toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });
            } else {
                return dt.toLocaleString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
            }
        }
        $scope.transReceiptModule = new transReceiptModule();

        $scope.transReceipt = function(receiptType, transType) {
            $scope.errorSpin = true;
            $scope.showMailSuccess = false;
            $scope.transReceiptModule.transReceipt(receiptType, transType, {});
        };
        //Transaction Receipt -Ends here
        /***
         *
         *Reset the widget
         */
        $scope.doAnother = function() {
            /*Heading change on back*/
            //alert("doanother called");
            gadgets.pubsub.publish("js.back", { 
                data:   "ENABLE_HOME",
                  //widget name hard-codedtrSerID:"RECHARGES"
            });
            $('#rechargeTabsUL >ul').css('display', 'inherit');
            $scope.confirmform = false;
            $rootScope.$broadcast('eventSuccessDTH', $scope.confirmform);

            $scope.errorform = false;
            $rootScope.$broadcast('eventErrorDTH', $scope.errorform);
            //console.log("Resetting.");
            /* $('#rechargeTabsUL >ul').css('display','inherit');*/
            //lpWidget.refreshHTML();
            $('#rechargeCheckBox').attr('checked', false);
            initialize();

        }
        // handling for recharge otp changes minor release 2.0
        var count = 0;
        $scope.resendfunction = function() {
            if (count == 3) {

                $scope.stop = true;
                ++count;


            } else {
                ++count;
                return count;
                $scope.stop = false;
            }

        }

        var count1 = 0;
        $scope.submitfunction = function() {

            if (count1 == 3) {
                //alert("count1"+count1);
                $scope.lockFieldsOTP = true;
                $scope.stop = true;

                count1 = 0;

            } else {
                $scope.lockFieldsOTP = false;
            }

        }
        //close handling for rechargd otp changes minor release 2.0
        /**
         * generateOTP to generate OTP on click of submit button
         * @param value
         */
        $scope.generateOTP = function(value) {
            $scope.errorSpin = false;
            $scope.errorSpinRecharge = true;
            var resendOTP = null;
            $scope.alerts = [];

            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.generateOTPServiceEndPoint, {
                servicesPath: lpPortal.root
            });
            if (value === 'resend') {
                resendOTP = true;
            } else {
                resendOTP = false;
            }
            var postData = {
                'resendOTP': resendOTP
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

            /* Check whether the HTTP Request is successful or not. */
            xhr.success(function(data) {
                console.log("issue 5701 in generateOTP success:" + resendFrom);
                $scope.errorSpin = false;
                $scope.errorSpinRecharge = false;
                $scope.hideOTPFlag = false;
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME" //ENABLE_HOME
                });

                /*$scope.success = {
                	happened: true,
                	msg: OTP_SUCCESS_MESSAGE
                };
                $scope.error = {
                	happened: false,
                	msg: ''
                };*/

                // handling for recharge otp changes minor release 2.0
                if (count < 4) {
                    $scope.success = {
                        happened: true,
                        msg: OTP_SUCCESS_MESSAGE
                    };
                    $scope.error = {
                        happened: false,
                        msg: ''
                    };
                }


                if (count == 4) {
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };

                    $scope.error = {
                        happened: true,
                        msg: 'We have tried 5 times to send you a code.'
                    };
                }
                //close handling for recharge otp changes minor release 2.0
                $scope.customerMob = data.mobileNumber;
                if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob !== null)) {
                    $scope.customerMobMasked = 'XXXXXX' + $scope.customerMob.substr($scope.customerMob.length - 4);
                    //$scope.OTPFlag = false;
                    $scope.lockFields = true;
                }
            }).error(function(data, status, headers, config) {
                console.log("issue 5701 in generateOTP error: " + resendFrom);
                gadgets.pubsub.publish("stopReceiver", {
                    data: "Stop Reading OTP"
                });
                console.log("issue 5701 in generateOTP error after stop receiver pubsub called");
                $scope.errorSpin = false;
                $scope.errorSpinRecharge = false;
                if (data.cd && data.cd === '501') {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    //$scope.addAlert('cd', 'error', false);
                }
                if (data.cd == "701") {
                    console.log("Inside 701: " + resendFrom);
                    $scope.resendDisabled = true;
                    $scope.stop = true;
                    resendFrom = '';
                }
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




        /**
         *
         * @param isFormValid
         * @returns {boolean}
         */
        $scope.verifyOTP = function(isFormValid) {
            $scope.alerts = [];
            if (!isFormValid) {
                return false;
            }

            var verifyOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.verifyOTPServiceEndPoint, {
                servicesPath: lpPortal.root
            });

            var postData = {
                'otpValue': $scope.controlPass.otpValue,
                'requestType': 'verifyOTP'
            };

            postData = $.param(postData || {});

            var xhr = $http({
                method: 'POST',
                url: verifyOTPServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            /* Check whether the HTTP Request is successful or not. */
            xhr.success(function(data) {
                $('#rechargeTabsUL >ul').css('display', 'none');
                $scope.controlPass.otpValue = '';
                $scope.OTPFlag = true;
                $scope.initiateTransaction();
                /*      $('#rechargeTabsUL >ul').css('display','none');*/

            }).error(function(data, status, headers, config) {
                if (data.cd && data.cd === '501') {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    //$scope.addAlert('cd', 'error', false);
                }
                /*$scope.cancelTransaction = checkOTPError(data);*/
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
            });
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        };



        /**
         *  clearOTP method
         * @desc clears OTP form
         */
        $scope.clearOTP = function() {
            $scope.controlPass.otpValue = '';
        };

        /**
         *  cancelOTP method
         * @desc cancel the transaction
         */
        $scope.cancelOTP = function() {

            if ($scope.forms.OTPform) {
                $scope.forms.OTPform.$setPristine();
                $scope.forms.OTPform.submitted = false;
            }
            if ($scope.forms.changeAPINForm) {
                $scope.forms.changeAPINForm.$setPristine();
                $scope.forms.changeAPINForm.submitted = false;
            }
            $scope.cancelTransaction = false;
            initialize();
        };


        /**
         * Get account Details
         * @returns {xhr}
         */
        $scope.getaccountDetails = function() {
            $scope.errorSpin = true;
            $scope.rechargeAccountNumber = {};
            $scope.rechargeAvailableBalance = '';

            $scope.alerts = [];
            var self = this;
            self.getaccountDetailsLists = httpService.getInstance({
                endpoint: lpWidget.getPreference('accountsDataSrc')
            });

            var xhr = self.getaccountDetailsLists.read();

            xhr.success(function(data) {

                $scope.accountList = data;
                console.log("Account List = " + $scope.accountList.length);
                $scope.accountCheck = false;
                $scope.rechargeAccountNumber = '';
                $scope.rechargeAvailableBalance = '';
                /*if($scope.accountList.length === 1){

                        $scope.selectedAccountNumber($scope.accountList[0]);
                }
*/
                $scope.enableButton = false;
                /*$('#rechargeCheckBox').attr('checked', false); */
                $scope.validationError = '';
                $scope.errorSpin = false;
            });

            xhr.error(function(data) {
                $scope.errorSpin = false;
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
            });

            return xhr;
        };

        /**
         * Go back to Previous Page from Validate Recharge Screen
         */
        $scope.cancelForm = function() {
            $scope.successValidateRechargeForm = false;
            $rootScope.noSelection = false;
            $('#rechargeTabsUL >ul').css('display', 'inherit');
            //console.log("back");
            $('#rechargeCheckBox').attr('checked', false);
            $scope.$apply();
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        }
        $scope.cancelFormBack = function() {
            $scope.successValidateRechargeForm = false;
            $rootScope.noSelection = false;
            //       $scope.tncflag = false;
            //        $scope.enableButton = false;
            $('#rechargeTabsUL >ul').css('display', 'inherit');
            console.log("back");
            $('#rechargeCheckBox').attr('checked', false);

            $scope.$apply();

        }

        /**
         * Go back to Previous Page from Otp Screen to select Account Number Screen (Validate Recharge Screen)
         */
        $scope.backFromOtp = function() {
            //$scope.confirmationSucess=false;
            //$scope.successValidateRechargeForm=true;

            initialize();

            //console.log("backFromOtp");

        };

        $scope.tnc = function() {

            console.log("HELLO TNC00");
            $('#rechargeTabsUL >ul').css('display', 'none');
            /* window.open('./static/idfc/billpay/widgets/idfc-recharge/templates/partial/acceptTC.html', '_blank');*/
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });
            $scope.tncflag = true;
        };

        /**
         *  Recharge Operator/ Provider List
         *  For Mobile Recharges Mandatory Fields
         *  requestId = 'SubCategory'
         *  billerSubCategory = 'PREPAID MOBILE'
         *
         * @desc Method to generate the dropdown list of Recharge operator/ Provider on the basics.
         */
        var generateOperatorProviderList = function(value) {


            $scope.errorSpin = true;
            $scope.alerts = [];
            var xhr;
            var operatorProviderServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.operatorProviderListEndPoint, {
                servicesPath: lpPortal.root
            });

            var postData = {
                'requestId': 'SubCategory', // Constant From DB
                'billerSubCategory': 'PREPAID MOBILE' // Constant From DB
            };
            postData = $.param(postData || {});

            xhr = $http({
                method: 'POST',
                url: operatorProviderServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    //console.log(data);
                    $scope.rechargeProviderMaster = data;
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data.cd) {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                //$scope.addAlert('cd', 'error', false);

            });
        };




        /**
         *  Recharge Circle List
         * @desc Method to generate the dropdown list of Recharge Circle .
         */
        var generateCircleList = function(value) {


            $scope.errorSpin = true;
            $scope.alerts = [];
            var xhr;
            var circleListServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.operatorCircleListEndPoint, {
                servicesPath: lpPortal.root
            });

            xhr = $http({
                method: 'GET',
                url: circleListServiceURL,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    //console.log(data);
                    $scope.rechargeCircleMaster = data;
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data.cd) {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);

            });
        };

        $scope.browseplans = function() {
            if (!angular.isUndefined($scope.rechargeCircleSelected) && $scope.rechargeCircleSelected != '' &&
                $scope.rechargeCircleSelected != null) {
                var circlePlan = $scope.rechargeCircleSelected + " " + "Plans";
            }
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK",
                trSerID: circlePlan
            });
            $rootScope.noSelection = true;
            $('html,body').animate({
                scrollTop: 0
            }, 'fast');
            //TO be removed:Change the struture of file
            $('#rechargeTabsUL >ul').css('display', 'none');

        };



        $scope.amountSelect = function(value) {
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME",
                //widget name hard-coded
                trSerID: "RECHARGES"
            });
            $scope.amount = value;
            console.log($scope.amount);
            $scope.idSelectedVote = value;
            $rootScope.noSelection = false;
            $('#rechargeTabsUL >ul').css('display', 'inherit');
        };

        var fetchOperatorPlanDetailsWithMobileNumber = function(value) {


            $scope.errorSpin = true;
            $scope.mutipleCallFlag = '1';
            $scope.plans = [];
            $scope.alerts = [];
            var xhr;
            var circleServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.fetchOperatorPlanDetailsListEndPoint, {
                servicesPath: lpPortal.root
            });
            var postData = {
                'mblNbr': $scope.mobileNumber, // first Five digit Of Mobile Number
                'ctgry': $scope.ctgry // Default Plan
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: circleServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                /*$scope.noSelection=false;*/

                if (data && data !== 'null') {
                    //console.log(data);
                    $scope.planDetails = data;
                    //console.log($scope.planDetails.plnDtls.oprtr);
                    //console.log($scope.planDetails.plnDtls.crcl);

                    $scope.plans = $scope.planDetails.plnDtls.ctgryLst;



                    $scope.rechargeProviderSelected = $scope.planDetails.plnDtls.oprtr;
                    $scope.rechargeCircleSelected = $scope.planDetails.plnDtls.crcl;
                    $scope.mobileNumberFlag = false;

                    if ($scope.plans === []) {
                        $scope.noTransactionDetails = true;
                    } else {
                        $scope.noTransactionDetails = false;
                        $scope.transactionDetails = data.plans;
                        $scope.showMore($scope.plans);
                    }
                } else {
                    $rootScope.noSelection = true;
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                /**CPU-3515*/
                $rootScope.noSelection = false;
                /*if (data.cd) {
                */    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                /*}
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);*/
                $scope.mobileNumberFlag = true;


            });


        };


        /**
         * Alerts to push Alerts on screen
         */
        $scope.alerts = [];

        $scope.addAlert = function(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };

            $scope.alerts.push(customAlert);

            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(customAlert));
                }, ALERT_TIMEOUT);
            }

        };

        // Remove specific alert
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };


        /**
         *  Fetch Operator Plan Details - fetchOperatorPlanDetails
         * @desc Fetch Operator Plan Details - Fetch the details upon First Five Digit of Mobile Number
         *
         * In Java - Contoller - Mobile Length = 10 , then
         *    oprtr = "rechargeProviderSelected";
         *    lctn = "rechargeCircleSelected";
         *    plnDtlsFlg = "Y";         // if plnDtlsFlg is 'N' then Plan details Parameter will contains only operator and circle.
         *    ctgry = "ALL";            // Accepts Default input as 'ALL'
         *    ctgry = "A";          // 'A' - All Plans
         */
        var fetchOperatorPlanDetails = function(value) {

            $scope.allowMoreResults = false;
            $scope.pagesShown = 1;
            $scope.pageSize = 5;
            $scope.hasMoreItemsToShow = '';
            $scope.alerts = [];
            if ($scope.ctgry == 'Full Talktime' || $scope.ctgry == 'Special Tariff Voucher' || $scope.ctgry == '2G Mobile Data' || $scope.ctgry == '3G Mobile Data' || $scope.ctgry == 'Roaming' || $scope.ctgry == 'Topup' || $scope.ctgry == 'ISD Packs' || $scope.ctgry == 'SMS') {
                $scope.errorSpin = true;
            } else {
                $scope.errorSpin = true;
            }
            $scope.plans = [];

            var xhr;
            var circleServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.fetchOperatorPlanDetailsListEndPoint, {
                servicesPath: lpPortal.root
            });
            var postData = {
                'mblNbr': $scope.mobileNumber, // Recharge Mobile Number
                'lctn': $scope.rechargeCircleSelected, // Circle Id selected
                'oprtr': $scope.rechargeProviderSelected, // Recharge Biller ID
                'ctgry': $scope.ctgry // on click of Tab It Will Change
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: circleServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                $scope.errorSpin1 = false;
                /*$rootScope.noSelection = false;*/
                $scope.noPlanDetails = true;
                if (data && data !== 'null') {
                    //console.log(data);
                    $scope.planDetails = data;
                }

                //console.log($scope.planDetails.plnDtls.oprtr);
                //console.log($scope.planDetails.plnDtls.crcl);

                $scope.plans = $scope.planDetails.plnDtls.ctgryLst;

                if ($scope.plans === []) {
                    $scope.noTransactionDetails = true;
                } else {
                    $scope.noTransactionDetails = false;
                    $scope.transactionDetails = data.plans;
                    $scope.showMore($scope.plans);
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                $scope.errorSpin1 = false;
                if (data.cd === 'BPAY999') {
                    $scope.noPlanDetails = false;

                }
                if (data.cd) {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);

                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);

            });
        };


        /**
         *  ValidateRechargeDetails - This will validate the Recharge Amount.
         * @desc ValidateRechargeDetails - validate the recharge amount , whter it is correct or not
         * 		 and provide the Payment ID. for further processing
         *
         * In Java - Contoller
         *    billerName
         *    noOfAuthenticator
         *    Authenticator1 = Mobile Number
         *    Authenticator2 = CircleID
         *    Authenticator3 = Recharge Type
         *    rchrgAmt = amount         	// Recharge Amount
         */
        var validateRechargeDetails = function(value) {

            $scope.errorSpin = true;
            $scope.alerts = [];
            var xhr;
            var validateRechargeDetailsURL = lpCoreUtils.resolvePortalPlaceholders($scope.validateRechargeDetailsEndPoint, {
                servicesPath: lpPortal.root
            });
            var postData = {
                'billerName': $scope.rechargeProviderSelected, // billerId
                'noOfAuthenticator': '3', // 3 AUTHS
                'Authenticator1': $scope.mobileNumber, // Mobile Number
                'Authenticator2': 'NA', // Circle Id selected
                'Authenticator3': 'NA', // Recharge Type
                'rchrgAmt': $scope.amount // Recharge Amount
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: validateRechargeDetailsURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                var provider = $scope.rechargeDthProviderSelected;
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK",
                    trSerID: provider
                });
                $scope.errorSpin = false;
                $scope.successValidateRechargeForm = true;
                $scope.tncflag = false;
                $scope.enableButton = false;
                if (data && data !== 'null') {
                    //console.log(data);
                    $scope.validateRechargeDetailsResponse = data;
                    $scope.paymentId = $scope.validateRechargeDetailsResponse.pmtId;
                    //console.log($scope.paymentId);  //Payment ID
                }
                $scope.getaccountDetails();
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                $scope.successValidateRechargeForm = false;
                if (data.cd) {
                    // If session timed out, redirect to login page
                    //checkTimeout(data);
                    // If service not available, set error flag
                    //$scope.serviceErrorAPIN = checkGlobalError(data);
                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);
                $scope.successValidateRechargeForm = false;

            });
        };

        $scope.rechargeCheck = function() {
            if ($('#rechargeCheckBox').is(':checked')) {
                $scope.enableButton = true;
            } else {
                $scope.enableButton = false;
            }
        }

        $scope.selectedAccountNumber = function(value) {
            console.log("Inside selected account number" + value);
            if (value != null) {
                $scope.rechargeAccountNumber = value;
                $scope.rechargeAvailableBalance = value.availableBalance;
                $scope.accountCheck = true;
                $scope.accountSelected = true;
                $scope.amountCheck = false;
            } else {
                $scope.rechargeAccountNumber = '';
                $scope.rechargeAvailableBalance = '';
                $scope.validationError = "Please Select Account Number";
                $scope.accountCheck = false;
                $scope.accountSelected = false;
                $scope.amountCheck = true;
            }
        }

        /**
         * check the plan length to show/hide div if there are no plans
         */
        $scope.$watch('plans', function() {

            //console.log("Plan Length"+$scope.plans.length);
            if (!angular.isUndefined($scope.plans)) {

                if ($scope.plans.length >= 1) {
                    $scope.noPlanDetails = true;
                }
            } else {
                $scope.noPlanDetails = false;
            }

        }, true);


        /**
         *when click on Full TalkTime (changeTabFull) Tab ctgry will be changed
         *
         */
        $scope.changeTabFull = function() {
            $scope.idSelectedVote = '';
            if (!angular.isUndefined($scope.rechargeProviderSelected) || !angular.isUndefined($scope.$scope.rechargeProviderSelected)) {

                if ($scope.rechargeProviderSelected != null && $scope.rechargeCircleSelected != null) {

                    if ($scope.rechargeProviderSelected != '' && $scope.rechargeCircleSelected != '') {

                        $scope.ctgry = 'Full Talktime';
                        fetchOperatorPlanDetails();

                    }
                }
            }

        }

        /**
         *when click on Special Tariff Voucher (changeTabSpecial) Tab ctgry will be changed
         *
         */
        $scope.changeTabSpecial = function() {
            $scope.idSelectedVote = '';
            if (!angular.isUndefined($scope.rechargeProviderSelected) || !angular.isUndefined($scope.$scope.rechargeProviderSelected)) {

                if ($scope.rechargeProviderSelected != null && $scope.rechargeCircleSelected != null) {

                    if ($scope.rechargeProviderSelected != '' && $scope.rechargeCircleSelected != '') {

                        $scope.ctgry = 'Special Tariff Voucher';
                        fetchOperatorPlanDetails();

                    }
                }
            }

        }

        /**
         *when click on 2G Mobile Data (changeTab2g) Tab ctgry will be changed
         *
         */
        $scope.changeTab2g = function() {
            $scope.idSelectedVote = '';
            if (!angular.isUndefined($scope.rechargeProviderSelected) || !angular.isUndefined($scope.$scope.rechargeProviderSelected)) {

                if ($scope.rechargeProviderSelected != null && $scope.rechargeCircleSelected != null) {

                    if ($scope.rechargeProviderSelected != '' && $scope.rechargeCircleSelected != '') {

                        $scope.ctgry = '2G Mobile Data';
                        fetchOperatorPlanDetails();

                    }
                }
            }

        }

        /**
         *when click on 3G Mobile Data (changeTab3g) Tab ctgry will be changed
         *
         */
        $scope.changeTab3g = function() {
            $scope.idSelectedVote = '';
            if (!angular.isUndefined($scope.rechargeProviderSelected) || !angular.isUndefined($scope.$scope.rechargeProviderSelected)) {

                if ($scope.rechargeProviderSelected != null && $scope.rechargeCircleSelected != null) {

                    if ($scope.rechargeProviderSelected != '' && $scope.rechargeCircleSelected != '') {

                        $scope.ctgry = '3G Mobile Data';
                        fetchOperatorPlanDetails();

                    }
                }
            }

        }

        /**
         *when click on Roaming (changeTabRoaming) Tab ctgry will be changed
         *
         */
        $scope.changeTabRoaming = function() {
            $scope.idSelectedVote = '';
            if (!angular.isUndefined($scope.rechargeProviderSelected) || !angular.isUndefined($scope.$scope.rechargeProviderSelected)) {

                if ($scope.rechargeProviderSelected != null && $scope.rechargeCircleSelected != null) {

                    if ($scope.rechargeProviderSelected != '' && $scope.rechargeCircleSelected != '') {

                        $scope.ctgry = 'Roaming';
                        fetchOperatorPlanDetails();

                    }
                }
            }

        }

        /**
         *when click on Topup (changeTabTopUP) Tab ctgry will be changed
         *
         */
        $scope.changeTabTopUP = function() {
            $scope.idSelectedVote = '';
            if (!angular.isUndefined($scope.rechargeProviderSelected) || !angular.isUndefined($scope.$scope.rechargeProviderSelected)) {

                if ($scope.rechargeProviderSelected != null && $scope.rechargeCircleSelected != null) {

                    if ($scope.rechargeProviderSelected != '' && $scope.rechargeCircleSelected != '') {

                        $scope.ctgry = 'Topup';
                        fetchOperatorPlanDetails();
                    }
                }
            }

        }

        /**
         *when click on ISD Packs (changeTabTopUP) Tab ctgry will be changed
         *
         */
        $scope.changeTabISD = function() {
            $scope.idSelectedVote = '';
            if (!angular.isUndefined($scope.rechargeProviderSelected) || !angular.isUndefined($scope.$scope.rechargeProviderSelected)) {

                if ($scope.rechargeProviderSelected != null && $scope.rechargeCircleSelected != null) {

                    if ($scope.rechargeProviderSelected != '' && $scope.rechargeCircleSelected != '') {

                        $scope.ctgry = 'ISD Packs';
                        fetchOperatorPlanDetails();
                    }
                }
            }

        }

        /**
         *when click on SMS (changeTabSMS) Tab ctgry will be changed
         *
         */
        $scope.changeTabSMS = function() {
            $scope.idSelectedVote = '';
            if (!angular.isUndefined($scope.rechargeProviderSelected) || !angular.isUndefined($scope.$scope.rechargeProviderSelected)) {

                if ($scope.rechargeProviderSelected != null && $scope.rechargeCircleSelected != null) {

                    if ($scope.rechargeProviderSelected != '' && $scope.rechargeCircleSelected != '') {

                        $scope.ctgry = 'SMS';
                        fetchOperatorPlanDetails();
                    }
                }
            }

        }

        /**
         * Watch - mobileNumber
         * @decs Watch function  which will hit Fetch operator Plan on Entering  mobileNumber (Nine Digit)
         */

        $scope.$watch('amount', function() {
            if ($scope.amount == null) {
                $scope.amountCheck = true;
            }
            if ($scope.amount.length > 0) {
                $scope.amountCheck = false;
            }
        }, true);
        $scope.$watch('mobileNumber', function() {

            console.log($scope.mobileNumber);

            if (angular.isUndefined($scope.mobileNumber)) {
                /*Mobile*/
                //$rootScope.noSelection = true;
                $scope.rechargeCircleSelected = '';
                $scope.rechargeProviderSelected = '';
                $scope.noPlanDetails = false;
            }
            if ($scope.mobileNumber !== '' && $scope.mobileNumber.length < 10) {
                $scope.mobileNumberReq = false;
                $scope.CheckMobileNM = 'Please Enter Valid 10 digit Mobile Number';
            }


            if (!angular.isUndefined($scope.mobileNumber)) {
                if ($scope.mobileNumber.match('^[0-9]*$')) {
                    if ($scope.mobileNumber.length === 10) {
                        $scope.errorSpin = true;
                        $scope.mobileNumberFlag = true;
                        //console.log($scope.mobileNumber);
                        fetchOperatorPlanDetailsWithMobileNumber();
                    }
                }
                if ($scope.mobileNumber.match('^[0-9]{10,10}$')) {
                    $scope.CheckMobileNM = '';
                }
                if ($scope.mobileNumber.length == 10) {
                    $scope.diableCheck = false; // field to disable the provider and operator.
                    $scope.mobileNumberFlag = false;
                    $scope.mutipleCallFlag = '2';
                }
                if ($scope.mobileNumber.length <= 5) {
                    $scope.mobileNumberFlag = true;
                }
            } else {
                $scope.mobileNumberFlag = false
                $scope.rechargeProviderSelected = '';
                $scope.rechargeCircleSelected = '';
            }

        }, true);

        /**
         * Watch - rechargeProviderSelected
         * @decs Watch function  which will hit Fetch operator Plan on Entering  Changing of rechargeProviderSelected in case on MNP)
         */
        $scope.$watch('rechargeProviderSelected', function() {

            //console.log($scope.mobileNumber);
            //console.log($scope.rechargeProviderSelected);
            $scope.amount = '';

            if (!angular.isUndefined($scope.rechargeProviderSelected) && $scope.rechargeProviderSelected != '' && $scope.rechargeProviderSelected != null) {
                $scope.providerCheck = false;
            }

            if ($scope.mutipleCallFlag == '2') {
                if ($scope.mobileNumberFlag == false) {
                    //console.log("rechargeProviderSelected INSIDE");
                    if ($scope.rechargeProviderSelected != '' || $scope.rechargeProviderSelected != null) {
                        $scope.providerCheck = false;
                        if ($scope.mobileNumber != null || $scope.mobileNumber != '') {

                            if ($scope.rechargeCircleSelected != '' || $scope.rechargeCircleSelected != null) {

                                if (!angular.isUndefined($scope.rechargeProviderSelected) && !angular.isUndefined($scope.rechargeCircleSelected) && !angular.isUndefined($scope.mobileNumber)) {

                                    fetchOperatorPlanDetails();
                                }

                            }

                        }

                    }
                }
            }


        }, true);


        /**
         * Watch - rechargeCircleSelected / circle Id
         * @decs Watch function  which will hit Fetch operator Plan on Entering  Changing of rechargeProviderSelected in case on MNP)
         */
        $scope.$watch('rechargeCircleSelected', function() {

            if ($scope.mutipleCallFlag == '2') {
                if ($scope.mobileNumberFlag == false) {
                    //console.log("rechargeCircleSelected INSIDE");

                    if ($scope.rechargeCircleSelected != '' || $scope.rechargeCircleSelected != null) {
                        //console.log($scope.mobileNumber);
                        //console.log($scope.rechargeCircleSelected);

                        if ($scope.mobileNumber != null || $scope.mobileNumber != '') {

                            if ($scope.rechargeCircleSelected != '' || $scope.rechargeCircleSelected != null) {

                                if (!angular.isUndefined($scope.rechargeProviderSelected) && !angular.isUndefined($scope.rechargeCircleSelected) && !angular.isUndefined($scope.mobileNumber)) {

                                    fetchOperatorPlanDetails();
                                }
                            }

                        }
                    }
                }
            }

        }, true);




        $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
        $scope.template = {

            successful: $scope.partialsDir + '/ValidateRecharge.html',
            otpConfirm: $scope.partialsDir + '/otpConfirm.html',
            success: $scope.partialsDir + '/Success.html',
            error: $scope.partialsDir + '/error.html',
            browse: $scope.partialsDir + '/Browse.html',
            tncpage: $scope.partialsDir + '/acceptTC.html'

        };

        // Widget Refresh code
        var deckPanelOpenHandler;

        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView) {
                    lpWidget.parentNode = bresView.parentNode;
                });

            }
        };

        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
        // Widget Refresh code

        initialize();
        // $timeout(function(){
        //         gadgets.pubsub.publish('cxp.item.loaded', {
        //             id: widget.id
        //         });
        //     }, 10);

    }
    /**
     * Export Controllers
     */
    exports.RechargeCtrl = RechargeCtrl;
    exports.DthCtrl = DthCtrl;
});