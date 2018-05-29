/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {


    'use strict';
    var $ = require('jquery');
    //var idfcConstants = require('idfccommon').idfcConstants;
    var idfcerror = require('idfcerror');
    var idfcConstants = require('idfccommon').idfcConstants;
    var OTP_SUCCESS_MESSAGE = idfcConstants.OTP_SUCCESS_MESSAGE;

    /**
     * Main controller
     * @ngInject
     * @constructor
     */

    function BlockCardWidgetController(WidgetModel, lpCoreBus, lpCoreUtils, lpPortal, lpCoreError, $scope, $http, lpWidget, $timeout, i18nUtils, $sce, CQService) {

        // RSA changes by Xebia start
        $scope.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('verifyCQAnswerUrl'));
        // to fetch mobile specific data 3.6 change
        /*  gadgets.pubsub.publish("getMobileSdkData");
          gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
            $scope.mobileSdkData = response.data;
          }); */
        var globalPreferences = cxp.mobile.plugins['GlobalVariables']; //3.6 change
        if (globalPreferences) {
            var rsaSuccessCallback = function(data) {
                var rsaObj = data['rsaData'];
                var rsaJson = JSON.parse(rsaObj);
                $scope.mobileSdkData = rsaJson.data;
            };
            var rsaErrorCallback = function(data) {
                console.log('Something really bad happened');
            };
            globalPreferences.getRSAObject(
                rsaSuccessCallback,
                rsaErrorCallback
            );
        } else {
            console.log('Cant find Plugin');
        }
        // RSA changes by Xebia ends

        var initialize = function() {

            //Session Management Call
            idfcerror.validateSession($http);
        };

        $scope.errorSpin = true;
        $scope.errorMessage = null;
        $scope.backFlag = false;
        $scope.tdError = false;
        $scope.OTPFlag = true;
        $scope.unblockFlow = false;
        $scope.showButton = true;
        $scope.hideSubmit = false;
        $scope.reasonSelected = 'HL';
        $scope.transaction = null;
        //$scope.successClose = false;

        // RSA changes by Xebia start
        $scope.showSetupCQMessage = false;
        $scope.showCancelTransactionMessage = false;
        $scope.challengeQuestion = {};
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
        $scope.buttonSuccess = false;
        $scope.hideOTPFlag = true;

        $scope.hideQuesFlag = true;
        $scope.hideCombineFlag = true;
        $scope.globalerror = false;

        $scope.challengeQuesAnswers = [{
            'answer': '',
            'question': ''
        }]

        $scope.controlPass = {
            otpValue: ''
        };


        this.model = WidgetModel;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        var deckPanelOpenHandler;

        deckPanelOpenHandler = function(activePanelName) {
            console.log('::::::DECK PANEL OPENHANDLER:::::::');
            if (activePanelName === lpWidget.parentNode.model.name) {
                console.log('DECK PANEL OPENHANDLER>>' + activePanelName + ' ' + lpWidget.parentNode.model.name);
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView) {
                    lpWidget.parentNode = bresView.parentNode;
                });
            }
        };

        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
        $scope.detail = [];
        $scope.issue = '';
        $scope.detail1 = {};
        var blockCardDetails = {
            acctNb: '',
            vlu: ''
        };
        var blockPermCardDetails = {
            acctNb: '',
            vlu: ''
        };
        var unblockCardDetails = {
            acctNb: '',
            vlu: ''
        };


        $scope.cardDetailsEndPoint = lpWidget.getPreference('cardDetailsSrc');

        var cardDetailsURL = lpCoreUtils.resolvePortalPlaceholders($scope.cardDetailsEndPoint, {
            servicesPath: lpPortal.root
        });
        var request = $http({
            method: 'GET',
            url: cardDetailsURL,
            data: null,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;'
            }

        });
        request.success(function(data, status, headers, config) {
            //$scope.issue = dateFormat(data.crdDtls[0].actvtnDt, 'dd-mmm-yyyy');
            $scope.detail = data.crdDtls;
            $scope.detail.sort(sortByName);
            //Uncommenting for replacing - with space
            $scope.maskAccountNo($scope.detail);
            console.log("no cards issue, in success");
            $scope.changeStatusFormat($scope.detail); //method call for change status format
            for (var i = 0; i < $scope.detail.length; i++) {
                for (var innerCount = 0; innerCount < $scope.detail[i].acctDtls.length; innerCount++) {
                    $scope.detail[i].acctDtls[innerCount].acctNb = $scope.detail[i].acctDtls[innerCount].acctNb.replace(/^0+/, '');
                }
            }
            $scope.openFirstCardsDetails();

            /*for(var i = 0; i < $scope.detail.length; i++)
            {
            	$scope.detail[i].expryDt = dateFormat($scope.detail[i].expryDt, 'dd-mmm-yyyy');
            }*/

            $scope.errorSpin = false;

        })['catch'](function(error) {
            //ctrl.loading = false;
            console.log("no cards issue, in error");
            $scope.tdError = true;
            $scope.errorSpin = false;
            if (error.data.cd) {
                //alert("data.cd.ordersModel.."+data.cd);
                // If session timed out, redirect to login page
                idfcerror.checkTimeout(error.data);
                // If service not available, set error flag
                $scope.globalerror = idfcerror.checkGlobalError(error.data);


                if ((error.data.cd === '302')) {

                    $scope.error = {
                        happened: true,
                        msg: "None of your cards can be blocked. Please get your card activated or re-issued if it is blocked permanently." //error.data.rsn
                        //msg: "Oops, none of your cards are active right now."//error.data.rsn
                    };
                } else {
                    $scope.error = {
                        happened: true,
                        msg: error.data.rsn //"Oops, none of your cards are active right now."//error.data.rsn
                    };
                }
                //                error = {
                //                    happened: true,
                //                    msg: error.data.rsn
                //                };
                $scope.errorMessage = $scope.error.msg; //"Oops, none of your cards are active right now.";// error.msg;
                console.log("no cards issue, inner msg: " + $scope.errorMessage);
            }
            $scope.errorMessage = $scope.error.msg; //"Oops, none of your cards are active right now."; // error.msg;
            console.log("no cards issue, outer msg: " + $scope.errorMessage);
        });

        function sortByName(x, y) {
            return ((x.crdSts == y.crdSts) ? 0 : ((x.crdSts > y.crdSts) ? 1 : -1));
        }


        $scope.changeStatusFormat = function(detail) { //method definition for changing status format
            $scope.activeTempCardFlag = false;
            $scope.activeTempCardList = [];
            var count = -1;
            for (var i = 0; i < $scope.detail.length; i++) {
                if ($scope.detail[i].crdSts == 'ACTIVE') {

                    $scope.detail[i].crdSts = 'Active';
                    count++;
                    $scope.activeTempCardList[count] = $scope.detail[i];

                } else if ($scope.detail[i].crdSts == 'BLOCKED') {

                    $scope.detail[i].crdSts = 'Temporarily Blocked';
                    count++;
                    $scope.activeTempCardList[count] = $scope.detail[i];

                } else if ($scope.detail[i].crdSts == 'INACTIVE') {

                    $scope.detail[i].crdSts = 'Inactive';
                    $scope.detail[i].actvtnDt = 'Not Activated';

                } else {

                    $scope.detail[i].crdSts = 'Permanently Blocked';
                }
            }
            if ($scope.activeTempCardList.length == 0) {
                $scope.activeTempCardFlag = true;
            } else {
                $scope.activeTempCardFlag = false;
            }

        };
        $scope.maskAccountNo = function(listOfAccNo) {

            for (var countNo in listOfAccNo) {
                var accountNumber = listOfAccNo[countNo].crdNb;
                var nonMaskedAccStart = accountNumber.substring(0, 4);
                var nonMaskedAccEnd = accountNumber.substring(accountNumber.length - 4, accountNumber.length);
                var maskPart = repeat('X', accountNumber.length - 9);
                //$scope.detail[countNo].maskCrdNb = nonMaskedAccStart + ' ' + maskPart.substring(0, 4) + ' ' + maskPart.substring(4, 8) + ' ' + nonMaskedAccEnd;
                $scope.detail[countNo].crdNb = nonMaskedAccStart + ' ' + maskPart.substring(0, 4) + ' ' + maskPart.substring(4, 8) + ' ' + nonMaskedAccEnd;
                //$scope.cardnumber = nonMaskedAccEnd;
            }
        };

        var repeat = function(String, count) {
            return count > 0 ? String + repeat(String, count - 1) : String;
        };

        $scope.getCardDetails = function(x, screen) {
            $scope.secondScreen = true;
            $scope.screen = screen;
            $scope.permFlag = false;
            $scope.hideQuesFlag = true;
            $scope.hideOTPFlag = true;
            $scope.hideCombineFlag = true;

        };
        $scope.getCardDetailsUnblock = function(x, screen) {
            $scope.secondScreen = true;
            $scope.permFlag = false;
            $scope.screen = screen;
            $scope.hideQuesFlag = true;
            $scope.hideOTPFlag = true;
            $scope.hideCombineFlag = true;


        };



        $scope.permProceed = function(screen) {
            $scope.permFlag = true;
            $scope.reasonValue = 'Damaged';
            $scope.replacementValue = 'False';
            $scope.secondScreen = true;
            $scope.screen = screen;
            $scope.hideQuesFlag = true;
            $scope.hideOTPFlag = true;
            $scope.hideCombineFlag = true;


        }


        $scope.setReasonValue = function(reasonValue) {
            $scope.reasonSelected = reasonValue;
        }


        $scope.backOnScreen = function(backOnScreenObject) {
            $(window).scrollTop(0);
            $scope.secondScreen = false;
            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion = {};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            $scope.hideQuesFlag = true;
            // RSA changes by Xebia ends
            //  lpWidget.refreshHTML();
            //  $scope.backFlag = true;
            //  $scope.backOnScreenObject = backOnScreenObject ;

        };
        $scope.cardSummaryTransfer = function() {
            //lpCoreBus.publish('launchpad-retail.cardSummary',$scope.detail1);
            //added for mobile
            gadgets.pubsub.publish('launchpad-retail.cardSummary', $scope.detail1);
        };


        $scope.confirmBlockCard = function() {
            //RSA Integration
            //auto read otp
            $scope.enableDisableOTPorQuestion();
            //$scope.readSMS('');
            //RSA Integration
        };

        /**var contactFeature = cxp.mobile.plugins['ContactFeature'];

        		if(contactFeature) {

        			// Enable the call button
        			$scope.callUsEnabled = true;

        			// Define the method that is triggered when the user clicks the call button
        			$scope.callUs = function(obj) {
               			var str1="#";
               			var id1=obj.target.attributes.id.value;
               			var id1=str1.concat(id1);
               			var data1 = $(id1).text();

        				// Call phone number
        				contactFeature.callPhoneNumber(data1);
        			};
        		}**/

        $scope.callFeature = function(tel) {
            console.log(tel);
            var callPlugin = cxp.mobile.plugins['ContactFeature'];
            if (callPlugin) {
                callPlugin.callPhoneNumber(null, null, tel);
            } else {
                console.log('Plugin not accessible');
            }

        }



        var setdeviceprint = function() {
            return encode_deviceprint();
        };


        $scope.cardUnblockAnalyze = function() {
            $scope.errorSpin = true;
            $scope.controlPass.otpValue = '';
            $scope.lockFieldsOTP = false;
            $scope.lockOTPTextSubmit = false;

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

            //alert($scope.detail1.crdNb+"-----------")
            $scope.postData = {
                'customerId': $scope.customerId,
                'mobileNumber': $scope.customerMob,
                'resendOTP': false,
                'acctNb': $scope.detail1.acctDtls[0].acctNb,
                'vlu': $scope.detail1.crdNb,
                'transaction': 'dcmsUnblock',
            };

            $scope.postData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            /* gadgets.pubsub.publish("getMobileSdkData");
             gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
               $scope.mobileSdkData = response.data;
             });*/
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

                $scope.errorSpin = false;
                $scope.credentialType = data.credentialType;
                $scope.transaction = 'dcmsUnblock';
                console.log('Credential Type for cardUnblockAnalyze >>>>>>>>>>>>>>' + data.credentialType);

                // RSA changes by Xebia starting
                if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT') {
                    $scope.errorSpin = false;
                    $scope.showDenyMessage = true;
                } else if (data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED') {
                    $scope.showSetupCQMessage = true;
                    $scope.errorSpin = false;
                } else if (data.actionStatus === 'ALLOW' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                    $scope.errorSpin = true;
                    $scope.generateOTP("generate");
                    $scope.readSMS('');
                } else if (data.actionStatus === 'CHALLENGE' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                    $scope.errorSpin = false;
                    $scope.showCQError = CQService.CHALLENGE_MESSAGE;
                    $scope.challengeQuestionCounter++;
                    $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                    $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                    $scope.hideQuesFlag = false;
                    $scope.showQuestionDiv = true;
                    $scope.hideOTPFlag = true;
                    $scope.hideCombineFlag = true;
                }
                // RSA changes by Xebia ends

                window.scrollTo(0, 0);

            });
            res.error(function(data) {
                ////$scope.hidePayDivOnRsaCall=false;
                $scope.errorSpin = false;
                idfcerror.checkTimeout(data);
                $scope.globalerror = idfcerror.checkGlobalError(data);
                if ($scope.globalerror) {
                    $scope.dcmsAndCrmError = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.buttonError = true;
                }
                $scope.dcmsAndCrmError = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
                $scope.successClose = true;

            });

            window.scrollTo(0, 0);
        };

        //SMS Reading -- Start

        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            console.log('Resend hit native');
            console.log('evt.resendOtpFlag:' + evt.resendOtpFlag);
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.readSMS('resend');
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
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS", {
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "CardBlock"
                            });

                            //Step 2. Send request to "sendOTP service
                            console.log('Resend flag->' + resendFlag);
                            //$scope.generateOTP(resendFlag);
                            if ('resend' === resendFlag) {
                                $scope.generateOTP(resendFlag);
                            }


                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("CardBlock", function(evt) {
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: ' + evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver", {
                                    data: "Stop Reading OTP"
                                });

                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp' + receivedOtp);
                                $scope.controlPass.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :' + $scope.controlPass.otpValue);
                                angular.element('#verifyOTP-btn-block-card-temp').triggerHandler('click');



                            });
                        } else {
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            console.log('Resend flag->' + resendFlag);
                            if ('resend' === resendFlag) {
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

        $scope.enableDisableOTPorQuestion = function() {
            $scope.errorSpin = true;
            $scope.controlPass.otpValue = '';
            $scope.lockFieldsOTP = false;
            $scope.lockOTPTextSubmit = false;
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



            blockPermCardDetails.acctNb = $scope.detail1.acctDtls[0].acctNb;
            blockPermCardDetails.vlu = $scope.detail1.crdNb;


            if ($scope.permFlag) {
                $scope.postData = {
                    'customerId': $scope.customerId,
                    'mobileNumber': $scope.customerMob,
                    'resendOTP': false,
                    'acctNb': $scope.detail1.acctDtls[0].acctNb,
                    'vlu': $scope.detail1.crdNb,
                    'transaction': 'dcmsPermCardBlock',
                    'blockReason': $scope.reasonSelected,
                    'blockType': 'Permanent'
                };
            } else {
                $scope.postData = {
                    'customerId': $scope.customerId,
                    'mobileNumber': $scope.customerMob,
                    'resendOTP': false,
                    'acctNb': $scope.detail1.acctDtls[0].acctNb,
                    'vlu': $scope.detail1.crdNb,
                    'transaction': 'dcmsTempCardBlock',
                    'blockType': 'Temporary'
                };
            }
            $scope.postData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            /* gadgets.pubsub.publish("getMobileSdkData");
             gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
               $scope.mobileSdkData = response.data;
             });*/
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
                console.log('Data :: ' + JSON.stringify(data));
                $scope.errorSpin = false;
                $scope.credentialType = data.credentialType;
                $scope.transaction = 'dcmsBlock';
                console.log("$scope.credentialType>>>>>>>>" + data.credentialType);


                // RSA changes by Xebia starting
                if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT') {
                    $scope.errorSpin = false;
                    $scope.showDenyMessage = true;
                    $scope.rsaAuthRequired = true;
                } else if (data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED') {
                    $scope.showSetupCQMessage = true;
                    $scope.errorSpin = false;
                    $scope.rsaAuthRequired = true;
                } else if (data.actionStatus === 'ALLOW' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                    $scope.errorSpin = true;
                    blockCard(true, '');
                    $scope.rsaAuthRequired = true;
                } else if (data.actionStatus === 'CHALLENGE' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                    $scope.errorSpin = false;
                    $scope.showCQError = CQService.CHALLENGE_MESSAGE;
                    $scope.challengeQuestionCounter++;
                    $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                    $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                    $scope.hideQuesFlag = false;
                    $scope.showQuestionDiv = true;
                    $scope.hideOTPFlag = true;
                    $scope.hideCombineFlag = true;
                    $scope.rsaAuthRequired = true;
                }
                // RSA changes by Xebia ends
                else if (!$scope.rsaAuthRequired) {
                    console.log('$scope.rsaAuthRequired in if' + $scope.rsaAuthRequired);
                    if ($scope.permFlag) {
                        //without OTP Permanent Block Success Screen code
                        var accNumber = blockPermCardDetails.vlu;
                        //   alert(	accNumber +"$$$$$$$"+blockPermCardDetails.vlu);
                        var last4digitAccNo = accNumber.substring((accNumber.length) - 4, accNumber.length);

                        if (data.csSts === 'Success') {
                            console.log('1111111111111111111111');
                            //alert(last4digitAccNo +""+blockPermCardDetails.vlu);
                            $scope.htmlMessage = {
                                'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been </p><p>blocked permanently.</p>'
                            };
                            $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);
                            if (data.csId != null && data.csId != '') {
                                console.log('222222222222222222222');
                                $scope.dcmsAndCrmSuccess = {
                                    happened: true,
                                    msg: $scope.successMessage
                                };

                            } else if (data.csId === null || data.csId === '') {
                                $scope.dcmsAndCrmSuccess = {
                                    happened: true,
                                    msg: $scope.successMessage
                                };
                            } else {
                                $scope.dcmsAndCrmSuccess = {
                                    happened: true,
                                    msg: $scope.successMessage
                                };
                            }


                            // Reissue Service Call
                            if ($scope.replacementValue == 'True') {
                                var urlcardReissue = {};

                                blockPermCardDetails.acctNb = $scope.detail1.acctDtls[0].acctNb;
                                blockPermCardDetails.vlu = $scope.detail1.crdNb;
                                var data1 = $.param(blockPermCardDetails || {});

                                urlcardReissue = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('cardReissueSrc'), {
                                    servicesPath: lpPortal.root
                                });

                                var request = $http({
                                    method: 'POST',
                                    url: urlcardReissue + '?cnvId=OTD',
                                    data: data1,
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/x-www-form-urlencoded;'
                                    }

                                }).success(function(data, status, headers, config) {
                                    var accNumber = blockPermCardDetails.vlu;
                                    console.log(urlcardReissue + '------------------');
                                    var last4digitAccNo = accNumber.substring((accNumber.length) - 4, accNumber.length);
                                    $scope.detail1.last4digitAccNo = last4digitAccNo;

                                    if (data.csSts === 'Success') {
                                        console.log('********************************************8');
                                        $scope.htmlMessage = {
                                            'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been </p><p>blocked permanently.You will get your new card within the next 7 days at your registered address.</p>'
                                        };

                                        console.log('$sce in card reissue bef0re');
                                        $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);
                                        console.log('$sce in card reissue after');

                                        $scope.reissueSuccess = {
                                            happened: true,
                                            msg: $scope.successMessage
                                        };
                                    } else if (data.csSts.indexOf('DCMS Status : Success') > -1) {
                                        $scope.htmlMessage = {
                                            'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been </p><p>blocked permanently.You will get your new card within the next 7 days at your registered address.</p>'
                                        };
                                        $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                                        $scope.reissueSuccess = {
                                            happened: true,
                                            msg: $scope.successMessage
                                        };
                                    } else {
                                        $scope.reissueError = {
                                            happened: true,
                                            msg: 'Your Card ending with ' + last4digitAccNo + ' has been blocked permanently. Currently we are unable to re-issue you a new card. Please call us on 1800-419-4332 for reissuance of your card.'
                                        };
                                    }
                                }).error(function(data, status, headers, config) {

                                    $scope.successClose = true;
                                    // idfcHanlder.checkTimeout(data);
                                    $scope.reissueError = {
                                        happened: true,
                                        msg: 'Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while.'
                                    };
                                    $scope.errorSpin = false;
                                });
                            }



                        } else if (data.csSts.indexOf('DCMS Status : Success') > -1) {
                            $scope.replacementValue = 'False';
                            $scope.htmlMessage = {
                                'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been </p><p>blocked permanently.</p>'
                            };
                            $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);


                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };

                        } else {
                            $scope.replacementValue = 'False';
                            $scope.dcmsAndCrmError = {
                                happened: true,
                                msg: 'Sorry your card is NOT BLOCKED. Please call 1800 419 4332 to block the card'
                            };
                        }
                        console.log('line 727');
                        $scope.errorSpin = false;
                        $scope.successClose = true;
                        $scope.secondScreen = true;

                        console.log('line 732' + $scope.successClose);


                    } else {
                        console.log('Temporary Confirm Block');
                        console.log('Temp block' + data.csSts + ' ' + data.csId);
                        blockCardDetails.vlu = $scope.detail1.crdNb;
                        //Without OTP Temporarily Block Card Success Screen Code
                        var accNumber = blockCardDetails.vlu;

                        var last4digitAccNo = accNumber.substring((accNumber.length) - 4, accNumber.length);

                        if (data.csSts === 'Success') {
                            //	alert(last4digitAccNo +"@@@@@@@@"+blockPermCardDetails.vlu);
                            console.log('--line 745--');
                            $scope.htmlMessage = {
                                'text': '<img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> is blocked.'
                            };
                            console.log('--line $sce line 749--');
                            $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);
                            console.log('--line $sce line 751--');
                            if (data.csId != null || data.csId != '') {

                                $scope.dcmsAndCrmSuccess = {
                                    happened: true,
                                    msg: $scope.successMessage
                                };

                            } else if (data.csId === null || data.csId === '') {
                                $scope.dcmsAndCrmSuccess = {
                                    happened: true,
                                    msg: $scope.successMessage
                                };
                            } else {
                                $scope.dcmsAndCrmSuccess = {
                                    happened: true,
                                    msg: $scope.successMessage
                                };
                            }
                        } else if (data.csSts.indexOf('DCMS Status : Success') > -1) {
                            $scope.htmlMessage = {
                                'text': '<img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> is blocked.'
                            };
                            $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };
                        } else {
                            console.log('Temp block error dcms');
                            $scope.dcmsAndCrmError = {
                                happened: true,
                                msg: 'Sorry your card is NOT BLOCKED. Please call 1800 419 4332 to block the card'
                            };
                        }
                        console.log('$scope.successClose before block temp success>>>' + $scope.successClose + ' ' + $scope.permFlag);
                        $scope.errorSpin = false;
                        //$scope.successClose = $scope.successClose || 'false';
                        $scope.successClose = true;
                        $scope.secondScreen = true;
                        console.log('$scope.successClose after block temp success>>>' + $scope.successClose);


                    }


                    //$scope.payBillSuccessData = data;
                    //$scope.successPage = false;
                    //$scope.errorSpin = false;
                    //$scope.paySuccess= true;

                    //lpCoreBus.publish('launchpad-retail.refreshAccountSummary');
                }

                window.scrollTo(0, 0);

            });
            res.error(function(data) {
                ////$scope.hidePayDivOnRsaCall=false;
                console.log('Error Data :: ' + JSON.stringify(data));
                $scope.replacementValue = 'False';
                $scope.errorSpin = false;
                idfcerror.checkTimeout(data);
                $scope.globalerror = idfcerror.checkGlobalError(data);
                if ($scope.globalerror) {
                    $scope.dcmsAndCrmError = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.buttonError = true;
                }
                $scope.dcmsAndCrmError = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
                $scope.successClose = true;
                if (data.rsn === undefined) {

                    $scope.successClose = true;
                    // idfcHanlder.checkTimeout(data);
                    if ((data.cd === 'NARR999')) {
                        // $scope.serviceError = idfcHanlder.checkGlobalError(data);
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Something went wrong while unblocking your card, please try in sometime.'

                        };
                    } else {
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while.'

                        };
                    }
                }

                window.scrollTo(0, 0);
            });
        };

        // showSetupCQ function by Xebia
        $scope.showSetupCQ = function() {
            gadgets.pubsub.publish('openCQ');
        }

        // cancel Transaction function by Xebia
        $scope.cancelRSATransaction = function() {
            gadgets.pubsub.publish("launchpad-retail.backToDashboard")
        }

        // verify challenge question answer function by Xebia
        $scope.verifyCQAnswer = function(transaction) {
            $scope.errorSpin = true;
            var postdata = {
                questionID: $scope.challengeQuestionsId,
                question: $scope.challengeQuestions,
                answer: $scope.challengeQuestion.answer,
                credentialType: 'QUESTION'
            }
            postdata.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            postdata = $.param(postdata);

            var xhr = CQService.verifyRSA(verifyCQAnswerUrl, postdata);
            xhr.success(function(response) {
                if (response.correctlyAnswered) {
                    $scope.errorSpin = true;
                    $scope.hideQuesFlag = true;
                    $scope.showQuestionDiv = false;
                    $scope.showWrongAnswerMessage = false;
                    if (transaction === "dcmsBlock") {
                        blockCard(true, '');
                    } else if (transaction === "dcmsUnblock") {
                        $scope.generateOTP("generate");
                        $scope.readSMS('');
                    }

                } else {
                    if ($scope.challengeQuestionCounter <= 2) {
                        $scope.errorSpin = false;
                        $scope.showCQError = CQService.WRONG_CQ_ANSWER;
                        $scope.showWrongAnswerMessage = true;
                        $scope.showQuestionDiv = false;
                    } else {
                        $scope.errorSpin = false;
                        $scope.showQuestionDiv = false;
                        $scope.showCQError = CQService.CQ_ANSWER_ATTEMPT_EXCEED;
                    }
                }


            })
            xhr.error(function(data, status) {
                $scope.errorSpin = false;
                idfcerror.checkTimeout(data);
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
        $scope.fetchCQ = function() {
            $scope.errorSpin = true;
            $scope.challengeQuestion.answer = "";
            $scope.showCQError = "";
            var postdata = {};

            var xhr = CQService.challengeRSA(getChallengeQuestionUrl, postdata);

            xhr.success(function(response) {
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

            xhr.error(function(data, status) {
                $scope.errorSpin = false;
                idfcerror.checkTimeout(data);
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



        //for blocking a  card

        /*$scope.$watch($scope.successClose, function(val){
            console.log('Inside watch for block card');
            $scope.successClose = val;
        });*/

        var blockCard = function(isFormValid, action) {

            if (!isFormValid) {

                return false;
            }
            $(window).scrollTop(0);

            var urlcardBlock = {};
            $scope.errorSpin1 = true;
            //for checking if a card is to be blocked permanently -permFlag is true
            if ($scope.permFlag) {

                blockPermCardDetails.acctNb = $scope.detail1.acctDtls[0].acctNb;
                blockPermCardDetails.vlu = $scope.detail1.crdNb;
                blockPermCardDetails.blockReason = $scope.reasonSelected;

                blockPermCardDetails.credentialType = action;

                var data1 = $.param(blockPermCardDetails || {});
                urlcardBlock = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('cardHotlistSrc'), {
                    servicesPath: lpPortal.root
                });

                var request = $http({
                    method: 'POST',
                    url: urlcardBlock + '?cnvId=OTD',
                    data: data1,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }

                }).success(function(data, status, headers, config) {
                    var accNumber = blockPermCardDetails.vlu;

                    var last4digitAccNo = accNumber.substring((accNumber.length) - 4, accNumber.length);
                    // alert(last4digitAccNo +"%%%%%%%%%"+blockPermCardDetails.vlu);
                    if (data.csSts === 'Success') {
                        $scope.htmlMessage = {
                            'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been </p><p>blocked permanently.</p>'
                        };
                        $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);
                        if (data.csId != null && data.csId != '') {

                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };

                        } else if (data.csId === null || data.csId === '') {
                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };
                        } else {
                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };
                        }

                        // Reissue Service Call
                        if ($scope.replacementValue == 'True') {
                            var urlcardReissue = {};

                            blockPermCardDetails.acctNb = $scope.detail1.acctDtls[0].acctNb;
                            blockPermCardDetails.vlu = $scope.detail1.crdNb;
                            var data1 = $.param(blockPermCardDetails || {});

                            urlcardReissue = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('cardReissueSrc'), {
                                servicesPath: lpPortal.root
                            });

                            var request = $http({
                                method: 'POST',
                                url: urlcardReissue + '?cnvId=OTD',
                                data: data1,
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/x-www-form-urlencoded;'
                                }

                            }).success(function(data, status, headers, config) {
                                var accNumber = blockPermCardDetails.vlu;

                                var last4digitAccNo = accNumber.substring((accNumber.length) - 4, accNumber.length);

                                if (data.csSts === 'Success') {

                                    $scope.htmlMessage = {
                                        'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been </p><p>blocked permanently.You will get your new card within the next 7 days at your registered address.</p>'
                                    };
                                    $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                                    $scope.reissueSuccess = {
                                        happened: true,
                                        msg: $scope.successMessage
                                    };
                                } else if (data.csSts.indexOf('DCMS Status : Success') > -1) {

                                    $scope.htmlMessage = {
                                        'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been </p><p>blocked permanently.You will get your new card within the next 7 days at your registered address.</p>'
                                    };
                                    $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                                    $scope.reissueSuccess = {
                                        happened: true,
                                        msg: $scope.successMessage
                                    };

                                } else {
                                    $scope.reissueError = {
                                        happened: true,
                                        msg: 'Your Card ending with ' + last4digitAccNo + ' has been blocked permanently. Currently we are unable to re-issue you a new card. Please call us on 1800-419-4332 for reissuance of your card.'
                                    };
                                }
                            }).error(function(data, status, headers, config) {
                                $scope.errorSpin = false;
                                $scope.successClose = true;
                                // idfcHanlder.checkTimeout(data);
                                $scope.reissueError = {
                                    happened: true,
                                    msg: 'Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while.'
                                };
                            });
                        }




                    } else if (data.csSts.indexOf('DCMS Status : Success') > -1) {
                        $scope.replacementValue = 'False';

                        $scope.htmlMessage = {
                            'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been </p><p>blocked permanently.</p>'
                        };
                        $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                        $scope.dcmsAndCrmSuccess = {
                            happened: true,
                            msg: $scope.successMessage
                        };
                    } else {
                        $scope.replacementValue = 'False';
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry your card is NOT BLOCKED. Please call 1800 419 4332 to block the card'
                        };
                    }

                    $scope.errorSpin = false;
                    $scope.successClose = true;
                    $scope.secondScreen = true;

                    window.scrollTo(0, 0);


                }).error(function(data, status, headers, config) {
                    $scope.hideCombineFlag = true;
                    $scope.hideOTPFlag = true;
                    $scope.hideQuesFlag = true;

                    $scope.successClose = true;
                    // idfcHanlder.checkTimeout(data);
                    if ((data.cd === 'NARR999')) {
                        // $scope.serviceError = idfcHanlder.checkGlobalError(data);
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry your card is NOT BLOCKED. Please call 1800 419 4332 to block the card.'

                        };
                    } else if (data.cd === '02' || data.cd === '04') {

                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.successClose = false;
                        //$scope.secondScreen = false;
                        if (action == 'OTP' || action == 'RSAOTP') {
                            $scope.hideOTPFlag = false;
                        }
                        if (action == 'RSAOTPANDQUESTION' || action == 'OTPANDQUESTION') {
                            $scope.hideCombineFlag = false;
                        }

                    } else if (data.cd === '08') {

                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.successClose = false;
                        //$scope.secondScreen = false;
                        if (action == 'OTP' || action == 'RSAOTP') {
                            $scope.hideOTPFlag = false;
                        }
                        if (action == 'RSAOTPANDQUESTION' || action == 'OTPANDQUESTION') {
                            $scope.hideCombineFlag = false;
                        }
                        $scope.lockFieldsOTP = true;
                        $scope.lockOTPTextSubmit = true;
                    } else if (data.cd === '09' || data.cd === '03') {
                        // $scope.serviceError = idfcHanlder.checkGlobalError(data);
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: data.rsn

                        };
                    } else {
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while.'

                        };
                    }
                    $scope.errorSpin = false;

                    window.scrollTo(0, 0);
                });

            } else {

                //for temp blocking a card -when permFlag is false
                blockCardDetails.acctNb = $scope.detail1.acctDtls[0].acctNb;
                blockCardDetails.vlu = $scope.detail1.crdNb;

                blockCardDetails.credentialType = action;


                var data2 = $.param(blockCardDetails || {})

                urlcardBlock = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('cardBlockSrc'), {
                    servicesPath: lpPortal.root
                });

                var request = $http({
                    method: 'POST',
                    url: urlcardBlock + '?cnvId=OTD',
                    data: data2,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }

                }).success(function(data, status, headers, config) {
                    var accNumber = blockCardDetails.vlu;

                    var last4digitAccNo = accNumber.substring((accNumber.length) - 4, accNumber.length);

                    if (data.csSts === 'Success') {
                        $scope.htmlMessage = {
                            'text': '<img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> is blocked.'
                        };
                        $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);
                        if (data.csId != null || data.csId != '') {

                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };

                        } else if (data.csId === null || data.csId === '') {
                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };
                        } else {
                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };
                        }
                    } else if (data.csSts.indexOf('DCMS Status : Success') > -1) {
                        $scope.htmlMessage = {
                            'text': '<img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> is blocked.'
                        };
                        $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                        $scope.dcmsAndCrmSuccess = {
                            happened: true,
                            msg: $scope.successMessage
                        };
                    } else {
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry your card is NOT BLOCKED. Please call 1800 419 4332 to block the card'
                        };
                    }

                    $scope.errorSpin = false;
                    $scope.successClose = true;
                    $scope.secondScreen = true;

                    window.scrollTo(0, 0);


                }).error(function(data, status, headers, config) {
                    $scope.hideCombineFlag = true;
                    $scope.hideOTPFlag = true;
                    $scope.hideQuesFlag = true;
                    $scope.errorSpin = false;
                    $scope.successClose = true;
                    // idfcHanlder.checkTimeout(data);
                    if ((data.cd === 'NARR999')) {
                        // $scope.serviceError = idfcHanlder.checkGlobalError(data);
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry your card is NOT BLOCKED. Please call 1800 419 4332 to block the card.'

                        };
                    } else if (data.cd === '02' || data.cd === '04') {

                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.successClose = false;
                        //$scope.secondScreen = false;


                        if (action == 'OTP' || action == 'RSAOTP') {
                            $scope.hideOTPFlag = false;
                        }
                        if (action == 'RSAOTPANDQUESTION' || action == 'OTPANDQUESTION') {
                            $scope.hideCombineFlag = false;
                        }

                    } else if (data.cd === '08') {

                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.successClose = false;
                        //$scope.secondScreen = false;
                        if (action == 'OTP' || action == 'RSAOTP') {
                            $scope.hideOTPFlag = false;
                        }
                        if (action == 'RSAOTPANDQUESTION' || action == 'OTPANDQUESTION') {
                            $scope.hideCombineFlag = false;
                        }
                        $scope.lockFieldsOTP = true;
                        $scope.lockOTPTextSubmit = true;
                    } else if (data.cd === '09' || data.cd === '03') {
                        // $scope.serviceError = idfcHanlder.checkGlobalError(data);
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: data.rsn

                        };
                    } else {
                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while.'

                        };
                    }

                    window.scrollTo(0, 0);
                });

            }
        };


        $scope.cnfirm = function(isFormValid, action, transaction) {
            console.log('Credential Type , Transaction   >>>>>>>>>>>>>>>' + action + ',' + transaction);
            if (transaction === "dcmsBlock") {
                console.log("kkk", "block");
                blockCard(isFormValid, action);
            }
            if (transaction === "dcmsUnblock") {
                console.log("kkk", "unblock");
                if (isFormValid) {
                    submitUnblockRequest(isFormValid, action);
                    $scope.hideOTPFlag = true;
                } else {
                    $scope.hideOTPFlag = false;

                }

                //alert(action);
            }
            $scope.hideQuesFlag = true;
            //$scope.hideOTPFlag = true;
            $scope.hideCombineFlag = true;
        };

        $scope.sendUnblockCardOTP = function() {
            //alert("sendUnblockCardOTP");
            $scope.errorSpin = true;
            $scope.generateOTP('send');
            //$scope.readSMS('send');
        };

        $scope.generateOTP = function(value)

        {
            $scope.errorSpin = true;
            var resendOTP = null;
            // var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generateOTPService'));
            $scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.generateOTPServiceEndPoint, {

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
                // url:"http://localhost:8080/portalserver/rs/v1/generateOTP",
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
                        //	alert("success");

                        $scope.success = {

                            happened: true,

                            msg: 'OTP has been successfully sent to your registered mobile number'

                        };

                        $scope.error = {

                            happened: false,

                            msg: ''

                        };

                        $scope.OTPFlag = false;
                        $scope.hideOTPFlag = false;
                        //	$scope.passbookFlag = false;
                        //	$scope.lockFields = true;
                        //	$scope.confirmButton = false;
                        //	$scope.nomineeButton = false;

                        $scope.customerMob = data.mobileNumber;

                        $scope.customerMobMasked = '******' +
                            $scope.customerMob
                            .substr($scope.customerMob.length - 4);
                        $scope.errorSpin = false;
                    }).error(
                    function(data, status, headers, config) {
                        //   alert("error");
                        $scope.OTPFlag = true;

                        //added for 5 times otp close popup
                        gadgets.pubsub.publish("stopReceiver", {
                            data: "Stop Reading OTP"
                        });

                        if (data.cd) {
                            idfcerror.checkTimeout(data);

                            if ((data.cd === '501')) {
                                $scope.serviceError = idfcerror
                                    .checkGlobalError(data);
                                // $scope.errorSpin = false;
                                $scope.alert = {
                                    messages: {
                                        cd: data.rsn
                                    }
                                };
                                $scope.addAlert('cd', 'error', false);
                                $scope.globalError = true;
                                $scope.error = {
                                    happened: true,
                                    msg: data.rsn
                                };

                            } else if ((data.cd === '701')) {

                                $scope.success.happened = false;
                                $scope.error = {
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
                                $scope.errorSpin = false;
                                $scope.error = {
                                    happened: true,
                                    msg: data.rsn
                                };
                            }
                        }

                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                        $scope.errorSpin = false;
                    });

        };


        $scope.setReplacementValue = function(replacementValue) {
            $scope.replacementValue = replacementValue;
        }
        /**
         * Alerts
         */
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

        // Remove specific alert
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        // Clear alert messages
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };



        /* 	//for unblocking a temp blocked card check if form is valid
        $scope.submitUnblockcardFormOTP = function(isFormValid,action) {
        	if (!isFormValid) {
        		return true;
        	}
        		$scope.errorSpin1 = true;
        		$scope.submitUnblockRequest();

        }; */
        $scope.submitUnblockcardFormOTP = function(isFormValid, action) {

            if (!isFormValid) {
                return true;
            }
            $scope.controlPass.otpValue = '';
            $scope.lockFieldsOTP = false;
            $scope.lockOTPTextSubmit = false;
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
                'customerId': $scope.customerId,
                'mobileNumber': $scope.customerMob,
                'resendOTP': false,
                'acctNb': $scope.detail1.acctDtls[0].acctNb,
                'vlu': $scope.detail1.crdNb,
                'transaction': 'unblockBlockedCard',
            };
            $scope.postData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            /*gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });*/
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

                    $scope.errorSpin = false;
                    $scope.credentialType = data.credentialType;
                    $scope.unblockFlow = true;

                    // RSA changes by Xebia starts
                    if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT') {
                        $scope.errorSpin = false;
                        $scope.showDenyMessage = true;
                        $scope.rsaAuthRequired = true;
                    } else if (data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED') {
                        $scope.showSetupCQMessage = true;
                        $scope.errorSpin = false;
                        $scope.rsaAuthRequired = true;
                    } else if (data.actionStatus === 'ALLOW' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                        $scope.errorSpin = true;
                        $scope.generateOTP("generate");
                        $scope.readSMS('');
                        $scope.rsaAuthRequired = true;
                    } else if (data.actionStatus === 'CHALLENGE' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                        $scope.errorSpin = false;
                        $scope.showCQError = CQService.CHALLENGE_MESSAGE;
                        $scope.challengeQuestionCounter++;
                        $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                        $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                        $scope.hideQuesFlag = false;
                        $scope.showQuestionDiv = true;
                        $scope.hideOTPFlag = true;
                        $scope.hideCombineFlag = true;
                        $scope.rsaAuthRequired = true;
                    }
                    // RSA changes by Xebia ends
                    else if (!$scope.rsaAuthRequired) {
                        var accNumber = unblockCardDetails.vlu;

                        var last4digitAccNo = accNumber.substring((accNumber.length) - 4, accNumber.length);

                        if (data.csSts === 'Success') {

                            if (null != data.csId && data.csId != '') {
                                $scope.htmlMessage = {
                                    'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Congratulations ! We have successfully</p><p> unblocked your card.</p>'
                                };
                                $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                                $scope.dcmsAndCrmSuccess = {
                                    happened: true,
                                    msg: $scope.successMessage
                                    // msg:'Congratulations ! We have successfully un-blocked your card.'
                                };

                            } else if (data.csId === null || data.csId === '') {

                                $scope.htmlMessage = {
                                    'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been</p> <p>successfully unblocked.' + '</span></p>'
                                };
                                $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);
                                $scope.dcmsAndCrmSuccess = {
                                    happened: true,
                                    msg: $scope.successMessage
                                };
                            } else {

                                $scope.dcmsAndCrmError = {
                                    happened: true,
                                    msg: 'Something went wrong while unblocking your card, please try in sometime.'


                                };
                            }
                        } else if (data.csSts.indexOf('DCMS Status : Success') > -1) {

                            $scope.htmlMessage = {
                                'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Congratulations ! We have successfully</p><p> unblocked your card.</p>'
                            };
                            $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                            $scope.dcmsAndCrmSuccess = {
                                happened: true,
                                msg: $scope.successMessage
                            };
                        } else {

                            $scope.dcmsAndCrmError = {

                                happened: true,
                                msg: 'Something went wrong while unblocking your card, please try in sometime.'

                            };

                        }


                        $scope.errorSpin = false;
                        $scope.successClose = true;
                        $scope.secondScreen = true;


                    }

                    window.scrollTo(0, 0);
                })
                .error(function(data, status, headers, config) {
                    $scope.OTPFlag = true;
                    $scope.errorSpin1 = false;
                    if (data.cd) {
                        idfcerror.checkTimeout(data);
                        if ((data.cd === '501')) {
                            $scope.serviceError = idfcerror.checkGlobalError(data);
                            $scope.alert = {
                                messages: {
                                    cd: data.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error', false);
                            $scope.globalError = true;
                        } else {
                            $scope.alert = {
                                messages: {
                                    cd: data.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error', false);
                            $scope.globalError = true;
                        }
                    }
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };

                    window.scrollTo(0, 0);
                });
        };



        //for unblocking a temp blocked card
        var submitUnblockRequest = function(isFormValid, action) {
            console.log("kkk,submitUnblockRequest called");
            console.log("kkk,isFormValid: " + isFormValid);
            if (!isFormValid) {
                return true;
            }
            $scope.errorSpin = true;
            $(window).scrollTop(0);
            $scope.OTPFlag = true;

            unblockCardDetails.acctNb = $scope.detail1.acctDtls[0].acctNb;
            unblockCardDetails.vlu = $scope.detail1.crdNb;

            console.log("kkk,action: " + action);

            unblockCardDetails.otpValue = $scope.controlPass.otpValue;
            unblockCardDetails.credentialType = action;

            var urlcardunBlock = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('cardUnBlockSrc'), {
                servicesPath: lpPortal.root
            });
            var data1 = $.param(unblockCardDetails || {});
            var request = $http({
                method: 'POST',
                url: urlcardunBlock + '?cnvId=OTD',
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }

            }).success(function(data, status, headers, config) {
                console.log('Unblock result' + data.csSts + ' ' + data.csId);
                var accNumber = unblockCardDetails.vlu;

                var last4digitAccNo = accNumber.substring((accNumber.length) - 4, accNumber.length);

                if (data.csSts === 'Success') {
                    if (null != data.csId && data.csId != '') {
                        console.log('-----------line 1725---------');
                        $scope.htmlMessage = {
                            'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Congratulations ! We have successfully</p><p> unblocked your card.</p>'
                        };
                        console.log('before $sce lin 1729');
                        $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);
                        console.log('before $sce lin 1731');
                        console.log($scope.successMessage);
                        $scope.dcmsAndCrmSuccess = {
                            happened: true,
                            msg: $scope.successMessage
                            // msg:'Congratulations ! We have successfully un-blocked your card.'
                        };

                    } else if (data.csId === null || data.csId === '') {
                        console.log('error in line 1740');
                        $scope.htmlMessage = {
                            'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Your Card ending with <span class="account-no">' + last4digitAccNo + '</span> has been</p> <p>successfully unblocked.' + '</span></p>'
                        };
                        $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);
                        $scope.dcmsAndCrmSuccess = {
                            happened: true,
                            msg: $scope.successMessage
                        };
                    } else {

                        $scope.dcmsAndCrmError = {
                            happened: true,
                            msg: 'Something went wrong while unblocking your card, please try in sometime.'


                        };
                    }
                } else if (data.csSts.indexOf('DCMS Status : Success') > -1) {

                    $scope.htmlMessage = {
                        'text': '<p><img class="img-right-tick" src="static/features/[BBHOST]/theme-idfc/images/tick.png"></img>Congratulations ! We have successfully</p><p> unblocked your card.</p>'
                    };
                    $scope.successMessage = $sce.trustAsHtml($scope.htmlMessage.text);

                    $scope.dcmsAndCrmSuccess = {
                        happened: true,
                        msg: $scope.successMessage
                    };

                } else {

                    $scope.dcmsAndCrmError = {

                        happened: true,
                        msg: 'Something went wrong while unblocking your card, please try in sometime.'

                    };

                };

                console.log('Here I am');
                $scope.errorSpin = false;
                $scope.successClose = true;
                $scope.secondScreen = true;
                console.log('Here I am' + $scope.successClose);

                $scope.hideQuesFlag = true;
                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;

                window.scrollTo(0, 0);
            }).error(function(data, status, headers, config) {

                $scope.successClose = true;
                // idfcHanlder.checkTimeout(data);
                $scope.hideQuesFlag = true;

                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;
                if ((data.cd === 'NARR999')) {
                    // $scope.serviceError = idfcHanlder.checkGlobalError(data);
                    $scope.dcmsAndCrmError = {
                        happened: true,
                        msg: 'Something went wrong while unblocking your card, please try in sometime.'

                    };
                } else if (data.cd === '02' || data.cd === '04') {

                    $scope.success.happened = false;
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.successClose = false;
                    //$scope.secondScreen = false;
                    if (action == 'OTP' || action == 'RSAOTP') {
                        $scope.hideOTPFlag = false;
                    }
                    if (action == 'RSAOTPANDQUESTION' || action == 'OTPANDQUESTION') {
                        $scope.hideCombineFlag = false;
                    }



                } else if (data.cd === '08') {

                    $scope.success.happened = false;
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.successClose = false;
                    //$scope.secondScreen = false;
                    if (action == 'OTP' || action == 'RSAOTP') {
                        $scope.hideOTPFlag = false;
                    }
                    if (action == 'RSAOTPANDQUESTION' || action == 'OTPANDQUESTION') {
                        $scope.hideCombineFlag = false;
                    }
                    $scope.lockFieldsOTP = true;
                    $scope.lockOTPTextSubmit = true;
                } else if (data.cd === '09' || data.cd === '03') {
                    // $scope.serviceError = idfcHanlder.checkGlobalError(data);
                    $scope.dcmsAndCrmError = {
                        happened: true,
                        msg: data.rsn

                    };
                } else {
                    $scope.dcmsAndCrmError = {
                        happened: true,
                        msg: 'Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while.'

                    };
                }

                $scope.errorSpin = false;

                window.scrollTo(0, 0);
            });
        };
        $scope.openCardsDetails = function(cardSummaryObj) {

            $scope.detail1 = cardSummaryObj;
            for (var cardSummaryObjCount in $scope.detail) {
                if (cardSummaryObj.crdNb != $scope.detail[cardSummaryObjCount].crdNb) {
                    $scope.detail[cardSummaryObjCount].showfull = false;
                }
            }
            /*
            cardSummaryObj.showfull = !cardSummaryObj.showfull; */
            var cardSummaryNo = cardSummaryObj.crdNb;
            console.log('cardSummaryNo>>>>>>>>>>>' + cardSummaryNo);
            if (cardSummaryNo.indexOf('-') != -1) {
                cardSummaryNo = cardSummaryNo.replace(/\-/g, ' ');
                console.log('cardSummaryNo>>>>>>>>>>>' + cardSummaryNo);
            }
            cardSummaryObj.crdNb = cardSummaryNo;

            cardSummaryObj.showfull = !cardSummaryObj.showfull;
            $(this).addClass('bgcolor');

        };

        $scope.openFirstCardsDetails = function() {

            $scope.detail1 = $scope.detail[0];

            $scope.detail1.showfull = true;
            $(this).addClass('bgcolor');

        };



        $scope.close = function() {

            //lpCoreBus.publish('launchpad-retail.closeActivePanel');
            //added for mobile
            gadgets.pubsub.publish('launchpad-retail.closeActivePanel');
        };

        //added for mobile
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });
    }
    /**
     * Export Controllers
     */
    exports.BlockCardWidgetController = BlockCardWidgetController;
});