/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {
    'use strict';

    var idfcError = require('idfcerror');
    var idfcConstants = require('idfccommon').idfcConstants;
    var OTP_SUCCESS_MESSAGE = idfcConstants.OTP_SUCCESS_MESSAGE;
    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function PaybillCtrl($scope, $timeout, $rootElement, lpWidget, lpCoreUtils,
        $http, httpService, lpCoreBus, lpPortal, transReceiptModule, CQService) {

        $scope.errorSpin = false;
        var wholeAmt;

        gadgets.pubsub.subscribe("native.back", function(evt) {
            console.log(evt.text);
            if ($scope.origin == 'Dashboard' && $scope.backtoDashboard) {
                gadgets.pubsub.publish("launchpad-retail.backToDashboard");

            } else {
                $scope.clickbackOnConfirm();
            }
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if (localStorage.getItem("navigationFlag") || $scope.internalBackEnable) {
                console.log(evt.text);
                if ($scope.origin == 'Dashboard' && $scope.backtoDashboard) {
                    gadgets.pubsub.publish("launchpad-retail.backToDashboard");

                } else {
                    $scope.internalBackEnable = false;
                    $scope.clickbackOnConfirm();
                }
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        gadgets.pubsub.subscribe("native-right-button-pressed", function(evt) {
            console.log(evt.text);
            $scope.openAddBiller();
        });

        // RSA changes by Xebia start
        $scope.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('verifyCQAnswerUrl'));
        // to fetch mobile specific RSA data
        /*gadgets.pubsub.publish("getMobileSdkData");
         gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
           $scope.mobileSdkData = response.data;
         });*/
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

        $scope.$on('mailSentError', function(event, args) {
                        self.errorSpin = false;
                        ctrl.loading = false;
                        $scope.showMailError = true;
                        $scope.mailSuccessMsg = args;
                        });

        $scope.goToEmailMod = function() {
                    localStorage.clear();
                    localStorage.setItem("navigationFlag",true);
                    localStorage.setItem("origin","Profile");
                    localStorage.setItem("target","ReviewTransfer");
                    localStorage.setItem("navigationData","Email Modification");
                    gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
                }
        //mailSent - Ends Here

        var initialize = function() {

            //Session Validation Call
            idfcError.validateSession($http);

            console.log("in go to bill details function");
            $scope.errorSpin = true;
            $scope.errorDisplay = false;
            $scope.payBillSuccessData = '';

            $scope.abc = 'abc';
            $scope.selectedBillAccordian = '';
            $scope.unselectedBillAccordian = '';
            $scope.isPayAllowed = false;
            $scope.internalBackEnable = false;
            $scope.viewBillForm = false;
            $scope.paySuccess = false;
            $scope.successPage = true;
            $scope.billsFound = true;
            $scope.selectedAuthList = [];
            $scope.selectedBill = {};
            $scope.billDeskAcNumber = '10000306670'; //Billdesk account Number
            $scope.auth = [];
            $scope.details = [];
            $scope.debitAccountsListforBill = [];
            $scope.otpError = '';
            $scope.showButton = true;
            $scope.hideSubmit = false;
            $scope.hidePayDivOnRsaCall = false;

            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion = {};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends


            $scope.OTPform = {
                submitted: false
            }
            $scope.availableBalanceChk = false;
            $scope.selectedBill.editedBillAmt = 0;
            $scope.selectedBill.decimalAmount = "00";
            $scope.selectedBill.availableBalance = 0;
            $scope.rsaAuthRequired = false;


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
            /*if((typeof $scope.challengeQuesAnswers != 'undefined') && ($scope.challengeQuesAnswers != null))
            {
            	for (var i = 0; i < $scope.challengeQuesAnswers.length; i++) {
            		$scope.challengeQuesAnswers[i].answer = "";
            	}
            }*/
            $("#trbd").show();
            $scope.buttonSuccess = false;
            $scope.hideOTPFlag = true;

            $scope.hideQuesFlag = true;
            $scope.hideCombineFlag = true;
            $scope.globalerror = false;

            /*$scope.challengeQuesAnswers =[
            	{
            		'answer' : '',
            		'question' : ''
            	}
            ]*/

            $scope.controlPass = {
                otpValue: ''
            };
            // Hitting BillPay 7001 service for Bill List
            $scope.getBillList();

            $scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
            $scope.backtoDashboard = false;
            $scope.origin = '';
            $scope.target = '';

        };
        // Back Button Click event
        $scope.goBackToBillList = function(bllrAcctId) {
            $scope.selectedBillAccordian = '';
        };
        // View Button Event Captured
        $scope.goToBillDetails = function(billdetail, amt) {
            $scope.internalBackEnable = true;
            $scope.backtoDashboard = false;

            $scope.errorSpin = true;

            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });

            // Hitting DB for Biller Detailsive
            $scope.getBillerDetailsFromDB(billdetail.bllrId);

            $scope.selectedBill = billdetail;
            $scope.showBillAmt = amt;
            $scope.selectedBill.editedBillAmt = $scope.showBillAmt.split(".")[0];
            $scope.viewBillForm = true;
            $scope.isPayAllowed = false;
            $scope.selectedBillAccordian = billdetail.bllrAcctId;
            $scope.showBillAmtDecimal = $scope.showBillAmt.split(".")[1];
            //$scope.selectedBill.bllAmt=$scope.showBillAmtDecimal[0];gfdsgs
            $scope.selectedBill.bllAmtNumber = $scope.showBillAmt.split(".")[0];
            if ($scope.showBillAmtDecimal && $scope.showBillAmtDecimal != "00") {
                $scope.selectedBill.decimalAmount = $scope.showBillAmtDecimal;
            } else {
                $scope.selectedBill.decimalAmount = "00";
            }
        };
        // PUB SUB to Open Add Biller
        $scope.openAddBiller = function() {
            //	lpCoreBus.publish('launchpad-billPay.add-biller');
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "view-bills");
            gadgets.pubsub.publish('launchpad-billPay.add-biller');

        };

        // Pay Button Event Captured
        $scope.clickPay = function() {
            $scope.viewBillForm = true;
            $scope.errorSpin = true;
            $scope.getDebitAccountsForBillPay();
        };
        // Pay Confirmation Button Event Captured
        $scope.clickPayConfirm = function(selectedBillFromPage, isValid) {

            //console.log("on pay click fn");
            if (!isValid) {
                //			$scope.enableDisableOTPorQuestion();

                return true;
            } else {
                // CBS Fund Transfer Service Call
                var amt = $scope.selectedBill.editedBillAmt;
                var deci = $('#pmtamt1').val();

                wholeAmt = amt + "." + deci;
                //  $scope.selectedBill.editedBillAmt =wholeAmt;


                /**********change made by Dixita***************/


                // CBS Fund Transfer Service Call
                if (wholeAmt <= $scope.selectedBill.availableBalance) {
                    if (wholeAmt > 0) {

                        // console.log("in if block");
                        // console.log("wholeamt"+wholeAmt);
                        $scope.errorSpin = true;
                        $scope.availableBalanceChk = false;
                        //  $scope.selectedBill.editedBillAmt=wholeAmt;
                        $scope.successData = $scope.selectedBill;
                        $scope.successAmount = parseFloat(wholeAmt);
                        $scope.enableDisableOTPorQuestion();
                    }
                } else {
                    $scope.availableBalanceChk = true;
                }
            }




        };
        /*Mobile adding this function for date formatting*/
        $scope.getformattedDate = function(data) {
            var d = new Date(data),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        var setdeviceprint = function() {
            return encode_deviceprint();
        };

        <!--- Enable disable OTP or Question-->
        $scope.enableDisableOTPorQuestion = function() {

            $scope.hidePayDivOnRsaCall = true;
            $scope.controlPass.otpValue = '';
            $scope.lockFieldsOTP = false;
            $scope.errorSpin = true;
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
            //var challengeQuestions = [];

            var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("rsaAnalyzeService"));

            $scope.postData = {
                'customerId': $scope.customerId,
                'mobileNumber': $scope.customerMob,
                'resendOTP': false,
                'accountNumber': $scope.acccountNumbers,
                'paymentMode': 'NON_RECURRING',
                /*'instructedAmount':$scope.selectedBill.editedBillAmt,*/
                'instructedAmount': wholeAmt,
                'txnMode': 'IFT',
                'ifscCode': 'IDFC00001' // BillPay IFSC Code
            };

            console.log("value of instruced amount" + $scope.postData.instructedAmount);
            $scope.postData.transaction = 'payBill';
            $scope.postData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            /*gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });*/
            $scope.postData.mobileSdkData = JSON.stringify($scope.mobileSdkData);


            $scope.postData.accountId = $scope.selectedBill.debitAccount;
            $scope.postData.counterpartyAccount = $scope.billDeskAcNumber;
            $scope.postData.counterpartyName = 'Bill Desk';
            $scope.postData.accountName = '';
            //$scope.postData.instructedAmount = $scope.selectedBill.editedBillAmt;
            $scope.postData.instructedCurrency = 'INR';
            $scope.postData.txnMode = 'IFT';
            //$scope.postData.paymentMode = 'NON_RECURRING';
            $scope.postData.paymentDescription = $scope.selectedBill.billPayDescription;
            $scope.postData.type = 'Bank';
            $scope.postData.cstId = '';
            var now = new Date();
            $scope.postData.onDate = now.getTime();
            $scope.postData.adBnfcry = 'N';
            // serviceData.bnfcryNm = 'bnfcryNm';
            // Bill Pay related data
            $scope.postData.bllrAcctId = $scope.selectedBill.bllrAcctId;
            $scope.postData.bllrId = $scope.selectedBill.bllrId;
            $scope.postData.bllId = $scope.selectedBill.bllId;
            $scope.postData.bllNbr = $scope.selectedBill.bllNbr;
            if (($scope.selectedBill.billerType === 'PAYEE') || ($scope.selectedBill.billerType === 'Payee')) {
                $scope.selectedBill.paymentType = 'PNY';
            } else {
                $scope.selectedBill.paymentType = 'RNP';
            }
            $scope.postData.paymentType = $scope.selectedBill.paymentType;
            $scope.postData.bllrNckNm = $scope.selectedBill.bllrNckNm;
            $scope.postData.bllDt = $scope.selectedBill.bllDt;
            if ($scope.selectedBill.billDueDt != 'NA') {
                //var formattedBillDueDate=new Date($scope.selectedBill.billDueDt).format('yyyy-mm-dd');
                var formattedBillDueDate1 = new Date($scope.selectedBill.billDueDt);
                var formattedBillDueDate = $scope.getformattedDate(formattedBillDueDate1);
                $scope.postData.billDueDt = formattedBillDueDate;
            } else {

                $scope.postData.billDueDt = 'NA';
            }
            $scope.postData.bllNbr = $scope.selectedBill.bllNbr;
            $scope.postData.bllrShrtNm = $scope.selectedBill.bllrShrtNm;
            $scope.postData.noOfAuthenticator = $scope.selectedAuthList.length;
            $scope.postData.pmtAmt = $scope.selectedBill.editedBillAmt;
            if ($scope.selectedAuthList.length > 0) {
                $scope.postData.Authenticator1 = $scope.selectedAuthList[0].authVal;
            }
            if ($scope.selectedAuthList.length > 1) {
                $scope.postData.Authenticator2 = $scope.selectedAuthList[1].authVal;
            }
            if ($scope.selectedAuthList.length > 2) {
                $scope.postData.Authenticator3 = $scope.selectedAuthList[2].authVal;
            }
            if ($scope.selectedAuthList.length > 3) {
                $scope.postData.Authenticator4 = $scope.selectedAuthList[3].authVal;
            }
            if ($scope.selectedAuthList.length > 4) {
                $scope.postData.Authenticator5 = $scope.selectedAuthList[4].authVal;
            }



            var data1 = $.param($scope.postData || {});

            res = $http({
                method: "POST",
                url: rsaAnalyzeService + "?cnvId=paybills",
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            res.success(function(data) {

                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
                $scope.errorSpin = false;
                $scope.credentialType = data.credentialType;
                $scope.isRibUser = data.ribuser;


                // RSA changes by Xebia starts
                if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT') {
                    $scope.errorSpin = false;
                    $scope.showDenyMessage = true;
                    $scope.isPayAllowed = false;
                    $scope.rsaAuthRequired = true;
                } else if (data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED') {
                    $scope.showSetupCQMessage = true;
                    $scope.errorSpin = false;
                    $scope.isPayAllowed = false;
                    $scope.rsaAuthRequired = true;
                } else if (data.actionStatus === 'ALLOW' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                    $scope.errorSpin = true;
                    $scope.fundsTransfer($scope.selectedBill, '');
                    $scope.rsaAuthRequired = true;
                } else if (data.actionStatus === 'CHALLENGE' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                    $scope.errorSpin = false;
                    $scope.showCQError = CQService.CHALLENGE_MESSAGE;
                    $scope.challengeQuestionCounter++;
                    $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                    $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                    $scope.hideQuesFlag = false;
                    $scope.isPayAllowed = false;
                    $scope.showQuestionDiv = true;
                    $scope.hideOTPFlag = true;
                    $scope.hideCombineFlag = true;
                    $scope.rsaAuthRequired = true;
                }
                // RSA changes by Xebia
                else if (!$scope.rsaAuthRequired) {
                    $scope.payBillSuccessData = data;
                    $scope.successPage = false;
                    $scope.errorSpin = false;
                    $scope.paySuccess = true;

                    lpCoreBus.publish('launchpad-retail.refreshAccountSummary');
                }

                var transactionID = $scope.isEmptyVal($scope.payBillSuccessData) ? "-" : $scope.payBillSuccessData;

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
                    // Transaction Receipt start
                    $scope.successItems = {};
                    $scope.successItems = {
                        "successMessage": 'Congratulations! Your Payment is successful.',
                        "transactionReferenceNumber": $scope.isEmptyVal($scope.payBillSuccessData) ? "-" : $scope.payBillSuccessData,
                        "nameOfTheBiller": $scope.isEmptyVal($scope.selectedBill.billerName) ? "NA" : $scope.selectedBill.billerName,
                        "nickname": $scope.isEmptyVal($scope.selectedBill.bllrShrtNm) ? "NA" : $scope.selectedBill.bllrShrtNm,
                        "amountDue": ($scope.isEmptyVal($scope.selectedBill.bllAmt) || $scope.selectedBill.bllAmt == "0.00") ? "" : $scope.selectedBill.bllAmt,
                        "dueDate": ($scope.isEmptyVal($scope.selectedBill.billDueDt) || $scope.selectedBill.bllAmt == "NA" || $scope.selectedBill.billDueDt == "NA") ? "" : $scope.selectedBill.billDueDt,
                        "amountPaid": $scope.isEmptyVal($scope.selectedBill.editedBillAmt) ? "-" : $scope.selectedBill.editedBillAmt,
                        "transactionTimeAndDate": $scope.formatDate(new Date())
                    }

                    $scope.customFields = {};
                    $scope.customFields = {
                        "customField1": $scope.isEmptyVal($scope.billsFound[0]) ? "" : $scope.billsFound[0].authLable,
                        "customField2": $scope.isEmptyVal($scope.billsFound[1]) ? "" : $scope.billsFound[1].authLable,
                        "customField3": $scope.isEmptyVal($scope.billsFound[2]) ? "" : $scope.billsFound[2].authLable
                    }

                    $scope.items = [{ item: 'Transaction Reference No.', value: $scope.successItems.transactionReferenceNumber, display: true }, { item: 'Name of the Biller', value: $scope.successItems.nameOfTheBiller, display: true }, { item: 'Nickname', value: $scope.successItems.nickname, display: true }, { item: ($scope.isEmptyVal($scope.billsFound[0]) ? "" : $scope.billsFound[0].authLable), value: $scope.isEmptyVal($scope.billsFound[0]) ? "" : $scope.billsFound[0].authVal, display: $scope.isEmptyVal($scope.billsFound[0]) ? false : true }, { item: ($scope.isEmptyVal($scope.billsFound[1]) ? "" : $scope.billsFound[1].authLable), value: $scope.isEmptyVal($scope.billsFound[1]) ? "" : $scope.billsFound[1].authVal, display: $scope.isEmptyVal($scope.billsFound[1]) ? false : true }, { item: ($scope.isEmptyVal($scope.billsFound[2]) ? "" : $scope.billsFound[2].authLable), value: $scope.isEmptyVal($scope.billsFound[2]) ? "" : $scope.billsFound[2].authVal, display: $scope.isEmptyVal($scope.billsFound[2]) ? false : true }, { item: 'Amount Due', value: $scope.successItems.amountDue, display: $scope.isEmptyVal($scope.successItems.amountDue) ? false : true, currency: true }, { item: 'Due Date', value: $scope.successItems.dueDate, display: $scope.isEmptyVal($scope.successItems.amountDue) ? false : true }, { item: 'Amount Paid', value: $scope.successItems.amountPaid, display: true, currency: true }, { item: 'Date and Time', value: $scope.successItems.transactionTimeAndDate, display: true }];
                    $scope.actions = [{ button: "Email", className: "mailButton", transType: "billPay", receiptType: 'email' }];
                    $scope.buttons = [{ name: "Make Another Payment", className: "btn btn-primary primary-btn-btn ng-binding", param: 'payAgain', style: "height:35px !important; width:100% !important;" }, { name: "Done", className: "btn secondary-btn-btn secondary-btn-ft btn-align review-button", param: 'accountSummary', style: "height:35px !important; width:100% !important;" }];
                })
                request.error(function(error) {
                    console.log("Date txn Date & Time:", error);
                    self.errorSpin = false;
                });

            });
            res.error(function(data) {
                $scope.successPage = true;
                $scope.errorSpin = false;
                idfcError.checkTimeout(data);
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
                if (data.cd === 'ONREV999') {
                    $scope.error = {
                        happened: true,
                        msg: 'Something went wrong during this bill payment / recharge. Please try in some time'
                    };
                }
                $scope.addAlert('cd', 'error', false);
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
        $scope.verifyCQAnswer = function() {
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
                    $scope.fundsTransfer($scope.selectedBill, '');
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
                idfcError.checkTimeout(data);
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

                $scope.addAlert('cd', 'error', false);
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
                $scope.isPayAllowed = false;
                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;
            })

            xhr.error(function(data, status) {
                $scope.errorSpin = false;
                idfcError.checkTimeout(data);
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

                $scope.addAlert('cd', 'error', false);
            });
        };


        $scope.initiateTransaction = function(isFormValid, action, selectedBillFromPage) {

            if (!isFormValid) {
                return false;
            }


            $scope.paySuccess = true;
            // CBS Fund Transfer Service Call
            $scope.fundsTransfer(selectedBillFromPage, action);
            $scope.successData = $scope.selectedBill;


        }

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
        //isEmptyVal - Ended
        /**
         * Transaction Receipt
         * FormatDate and transReceipt method
         * @desc Method to format Date and to carry out Download, Print and Email the Advice to user.
         */
        $scope.formatDate = function(dt) {
            return dt.toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });
        }
        $scope.transReceiptModule = new transReceiptModule();

        $scope.transReceipt = function(receiptType, transType) {
            $scope.errorSpin = true;
            $scope.showMailSuccess = false;
            $scope.transReceiptModule.transReceipt(receiptType, transType, $scope.customFields); //commented to pass blank data to generate the receipt on back-end
            //$scope.transReceiptModule.transReceipt(receiptType, transType, {});
        };

        /**
         * Transaction Receipt
         * successAction method
         * @desc Method to conditionally route the user to Account Summary page or to Recharge Again widget
         **/
        $scope.successAction = function(actionType) {
            if (actionType == "payAgain") {
                initialize();
            } else {
                gadgets.pubsub.publish("launchpad-retail.backToDashboard");
            }
        }
        //Transaction Receipt -Ends here

        /**
         * generateOTP to generate OTP on click of submit button
         * @param value
         */
        $scope.generateOTP = function(value) {
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
                $scope.success = {
                    happened: true,
                    msg: OTP_SUCCESS_MESSAGE
                };
                $scope.error = {
                    happened: false,
                    msg: ''
                };
                $scope.errorOtpMsg = {
                    happened: false,
                    msg: ''
                };
                $scope.customerMob = data.mobileNumber;
                if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob !== null)) {
                    $scope.customerMobMasked = '******' + $scope.customerMob.substr($scope.customerMob.length - 4);
                    //$scope.OTPFlag = false;
                    $scope.lockFields = true;
                }
            }).error(function(data, status, headers, config) {
                if (data.cd === '02' || data.cd === '04' || data.cd === '06' || data.cd === '08' || data.cd === '701') {
                    $scope.errorOtpMsg = {
                        happened: true,
                        msg: data.rsn
                    };
                }
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
        // Back from Confirmation Button Event Captured
        $scope.clickbackOnConfirm = function() {

            console.log("Back on click confirm fn");
            $scope.viewBillForm = false;
            $scope.paySuccess = false;
            if ($scope.origin == 'Dashboard') {
                $scope.backtoDashboard = true;
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });

            } else {
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });

            }
            $scope.errorDisplay = false;
            $scope.$apply();
        };
        // Pay Another Button from Success Page
        $scope.payAnotherBill = function() {
            initialize();
        };
        // Call TO 7001 View Bills Service
        $scope.getBillList = function() {
            var self = this;
            self.getServiceLists = httpService.getInstance({
                endpoint: lpWidget.getPreference('viewBillsListURL')
            });
            var xhr = self.getServiceLists.read();
            xhr
                .success(function(data) {
                    $scope.errorSpin = false;
                    lpCoreUtils.forEach(data.bllrDtls, function(detail) {
                        //code to split the date string and convert it into Date
                        if (detail.billDueDt != null) {
                            var arrStartDate = detail.billDueDt
                                .split("-");
                            detail.billDueDt = new Date(
                                arrStartDate[0],
                                arrStartDate[1] - 1,
                                arrStartDate[2]);


                        }
                        if (detail.billDueDt == null || detail.billDueDt == '') {
                            detail.billDueDt = 'NA';
                        }
                        if (detail.bllDt == null || detail.bllDt == '') {
                            detail.bllDt = 'NA';
                        }
                        $scope.details.push(detail);
                    });


                    if (data === null || data === '') {
                        $scope.globalerror = idfcError
                            .checkGlobalError(data);
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.addAlert('cd', 'error', false);
                    } else {
                        $scope.billsFound = true;
                        $scope.billdetailsList = $scope.details;
                        for (var billListCount = 0; billListCount < $scope.billdetailsList.length; billListCount++) {
                            if ($scope.billdetailsList[billListCount].bllrId == null) {
                                $scope.billdetailsList[billListCount].bllrId = 'NA';
                                $scope.selectedBill.bllrId = 'NA';
                            }
                            if ($scope.billdetailsList[billListCount].bllrNckNm == null) {
                                $scope.billdetailsList[billListCount].bllrNckNm = 'NA';
                                $scope.selectedBill.bllrNckNm = 'NA';
                            }
                        }
                    }

                    $scope.errorSpin = false;
                });
            xhr.error(function(data) {
                if (data.cd === 'INV_MSG_076') {
                    $scope.billsFound = false;
                    $scope.errorSpin = false;
                    $scope.noBillsMsg = data.rsn;
                } else {
                    $scope.errorSpin = false;
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(data);
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.addAlert('cd', 'error', false);
                }
            });
            return xhr;
        };
        // Call TO DB to pull Biller Master Data based on BillerID
        $scope.getBillerDetailsFromDB = function(bllrId) {

            var self = this;
            self.getBillersfromDBService = httpService.getInstance({
                endpoint: lpWidget.getPreference('getBillerFromDbURL') +
                    '?billerId=' + bllrId
            });
            var xhr = self.getBillersfromDBService.read();
            xhr
                .success(function(data) {
                    if (data === null || data === '') {
                        $scope.globalerror = idfcError
                            .checkGlobalError(data);
                        $scope.error = {
                            happened: true,
                            msg: 'No Data Found For This Bill'
                        };
                        $scope.addAlert('cd', 'error', false);

                    } else {
                        $scope.selectedBill.billerType = data.billerType;
                        $scope.selectedBill.billerNamefromDB = data.billerName;
                        $scope.selectedBill.billerCategoryfromDB = data.billerCategory;
                        $scope.selectedBill.billerLocationfromDB = data.billerLocation;
                        $scope.selectedBill.billerPartialPay = data.partialPay;
                        var authCnt = 0;
                        if (data.authenticatorCount >= 3) {
                            authCnt = 3;
                        } else {
                            authCnt = data.authenticatorCount;
                        }
                        for (var authCount = 0; authCount < authCnt; authCount++) {
                            $scope.selectedAuthList[authCount] = {};
                            if (authCount === 0) {
                                $scope.selectedAuthList[authCount].authLable = data.authenticatorLable1;
                                $scope.selectedAuthList[authCount].authVal = $scope.selectedBill.athntctr[authCount];
                            }
                            if (authCount === 1) {
                                $scope.selectedAuthList[authCount].authLable = data.authenticatorLable2;
                                $scope.selectedAuthList[authCount].authVal = $scope.selectedBill.athntctr[authCount];
                            }
                            if (authCount === 2) {
                                $scope.selectedAuthList[authCount].authLable = data.authenticatorLable3;
                                $scope.selectedAuthList[authCount].authVal = $scope.selectedBill.athntctr[authCount];
                            }
                            if (authCount === 3) {
                                $scope.selectedAuthList[authCount].authLable = data.authenticatorLable4;
                                $scope.selectedAuthList[authCount].authVal = $scope.selectedBill.athntctr[authCount];
                            }
                            if (authCount === 4) {
                                $scope.selectedAuthList[authCount].authLable = data.authenticatorLable5;
                                $scope.selectedAuthList[authCount].authVal = $scope.selectedBill.athntctr[authCount];
                            }
                        }
                        $scope.getDebitAccountsForBillPay();
                    }
                });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                idfcError.checkTimeout(data);
                $scope.globalerror = idfcError.checkGlobalError(data);
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.addAlert('cd', 'error', false);
            });
            return xhr;
        };
        // Call TO 7003 View Scheduled Bills Service
        $scope.getScheduledBillDetails = function(bllrAcctId) {
            var self = this;
            self.getScheduledBills = httpService.getInstance({
                endpoint: lpWidget.getPreference('viewScheduledBillsListURL')
            });
            var serviceData = {};
            serviceData.bllrAcctId = bllrAcctId;
            var xhr = self.getScheduledBills.create({
                data: serviceData
            });
            xhr
                .success(function(data) {
                    if (data === null || data === '') {
                        $scope.globalerror = idfcError
                            .checkGlobalError(data);
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.addAlert('cd', 'error', false);
                    } else {
                        $scope.scheduledBilldetailsData = data.bllrDtls;
                        for (var schdBillCount = 0; schdBillCount < $scope.scheduledBilldetailsData.length; schdBillCount++) {
                            if ($scope.scheduledBilldetailsData === null ||
                                $scope.scheduledBilldetailsData[schdBillCount].bllrAcctId === null ||
                                $scope.scheduledBilldetailsData[schdBillCount].bllrAcctId === '') {
                                $scope.isPayAllowed = true;
                            } else {
                                if ((data.bllrDtls[schdBillCount].atPyAcctNbr == null) ||
                                    (data.bllrDtls[schdBillCount].atPyAcctNbr === 'NA')) {
                                    $scope.isPayAllowed = true;
                                } else {
                                    $scope.isPayAllowed = false;
                                }
                            }
                        }
                    }
                    $scope.errorSpin = false;
                });
            xhr.error(function(data) {
                $scope.isPayAllowed = true;
                $scope.errorSpin = false;
                idfcError.checkTimeout(data);
                $scope.globalerror = idfcError.checkGlobalError(data);
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.isPayAllowed = true;
                //$scope.addAlert('cd', 'error', false);
            });
            return xhr;
        };
        // Call To Account Summary for Debit Accounts for Bill Pay
        $scope.getDebitAccountsForBillPay = function() {
            var self = this;
            self.getDebitAccontsLists = httpService.getInstance({
                endpoint: lpWidget.getPreference('getDebitAccountsURL')
            });
            var xhr = self.getDebitAccontsLists.read();
            xhr
                .success(function(data) {
                    $scope.errorSpin = false;
                    if (data === null || data === '') {
                        $scope.globalerror = idfcError
                            .checkGlobalError(data);
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.addAlert('cd', 'error', false);
                    } else {
                        $scope.debitAccountsListforBill = data;
                        if ($scope.debitAccountsListforBill.length > 0) {
                            $scope.selectedBill.debitAccount = $scope.debitAccountsListforBill[0].id;
                        }
                        // In case of UNPAID status, call scheduled Bills service
                        if ($scope.selectedBill.bllSts === 'UNPAID') {
                            $scope.errorSpin = true;
                            $scope.getScheduledBillDetails($scope.selectedBill.bllrAcctId);
                        } else {
                            $scope.errorSpin = false;
                        }
                    }
                });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                idfcError.checkTimeout(data);
                $scope.globalerror = idfcError.checkGlobalError(data);
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.addAlert('cd', 'error', false);
            });
            return xhr;
        };



        /*function format1()*/
        // CBS Funds Transfer Service Call
        $scope.fundsTransfer = function(selectedBillFromPage, action) {
            $scope.errorSpin = true;
            $scope.successPage = true;
            var self = this;
            self.fundsTransferService = httpService.getInstance({
                endpoint: lpWidget.getPreference('billPayFundTransferURL') + '?cnvId=paybills'
            });
            var serviceData = {};
            $scope.selectedBill = selectedBillFromPage;
            serviceData.accountId = $scope.selectedBill.debitAccount;
            serviceData.counterpartyAccount = $scope.billDeskAcNumber;
            serviceData.counterpartyName = 'Bill Desk';
            serviceData.accountName = '';
            serviceData.instructedAmount = $scope.selectedBill.editedBillAmt;
            serviceData.instructedCurrency = 'INR';
            serviceData.txnMode = 'IFT';
            serviceData.paymentMode = 'NON_RECURRING';
            serviceData.paymentDescription = $scope.selectedBill.billPayDescription;
            serviceData.type = 'Bank';
            serviceData.cstId = '';
            var now = new Date();
            serviceData.onDate = now.getTime();
            serviceData.adBnfcry = 'N';
            serviceData.bllrAcctId = $scope.selectedBill.bllrAcctId;
            serviceData.bllrId = $scope.selectedBill.bllrId;
            serviceData.bllId = $scope.selectedBill.bllId;
            serviceData.bllNbr = $scope.selectedBill.bllNbr;
            if (($scope.selectedBill.billerType === 'PAYEE') || ($scope.selectedBill.billerType === 'Payee')) {
                $scope.selectedBill.paymentType = 'PNY';
            } else {
                $scope.selectedBill.paymentType = 'RNP';
            }
            serviceData.paymentType = $scope.selectedBill.paymentType;
            serviceData.bllrNckNm = $scope.selectedBill.bllrNckNm;
            serviceData.bllDt = $scope.selectedBill.bllDt;
            if ($scope.selectedBill.billDueDt != 'NA') {

                //added by Dixita//
                serviceData.billDueDt = $scope.selectedBill.bllDt;

            } else {

                serviceData.billDueDt = 'NA';
            }

            serviceData.bllNbr = $scope.selectedBill.bllNbr;
            serviceData.bllrShrtNm = $scope.selectedBill.bllrShrtNm;
            serviceData.noOfAuthenticator = $scope.selectedAuthList.length;
            serviceData.pmtAmt = $scope.selectedBill.editedBillAmt;
            if ($scope.selectedAuthList.length > 0) {
                serviceData.Authenticator1 = $scope.selectedAuthList[0].authVal;
            }
            if ($scope.selectedAuthList.length > 1) {
                serviceData.Authenticator2 = $scope.selectedAuthList[1].authVal;
            }
            if ($scope.selectedAuthList.length > 2) {
                serviceData.Authenticator3 = $scope.selectedAuthList[2].authVal;
            }
            if ($scope.selectedAuthList.length > 3) {
                serviceData.Authenticator4 = $scope.selectedAuthList[3].authVal;
            }
            if ($scope.selectedAuthList.length > 4) {
                serviceData.Authenticator5 = $scope.selectedAuthList[4].authVal;
            }

            serviceData.credentialType = action;
            var xhr = self.fundsTransferService.create({
                data: serviceData
            });
            xhr.success(function(data) {
                //$scope.payBillSuccessData = data.initiateRIBOrderRequest.msgBdy.initiateOrderReq.txnId;
                $scope.payBillSuccessData = data;
                $scope.paySuccess = true;
                $scope.successPage = false;
                $scope.errorSpin = false;
                lpCoreBus.publish('launchpad-retail.refreshAccountSummary');
            });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                $scope.successPage = true;
                idfcError.checkTimeout(data);
                $scope.globalerror = idfcError.checkGlobalError(data);
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                if (data.cd === 'ONREV999') {
                    $scope.error = {
                        happened: true,
                        msg: 'Something went wrong during this bill payment / recharge. Please try in some time'
                    };
                }
                $scope.addAlert('cd', 'error', false);
            });
            return xhr;
        };
        // Watch to capture change in Account Number selection for Bill Payment
        $scope
            .$watch(
                'selectedBill.debitAccount',
                function(value) {
                    for (var accountCount = 0; accountCount < $scope.debitAccountsListforBill.length; accountCount++) {
                        if ($scope.debitAccountsListforBill[accountCount].id === value) {
                            $scope.selectedBill.availableBalance = $scope.debitAccountsListforBill[accountCount].availableBalance;
                        }
                    }
                });
        // Partial HTMLs
        $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) +
            '/templates/partial';
        $scope.template = {
            billDetails: $scope.partialsDir + '/Billdetails.html',
            confirm: $scope.partialsDir + '/Confirm.html',
            success: $scope.partialsDir + '/Success.html'
        };
        /**
         * Alerts to push Alerts on screen
         */
        $scope.alerts = [];
        $scope.addAlert = function(code, type, timeout) {
            $scope.errorDisplay = true;
            var customAlert = {
                type: type || 'error',
                msg: $scope.error.msg[code]
            };
            $scope.alerts.push(customAlert);
            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(customAlert));
                }, '');
            }
        };
        var deckPanelOpenHandler;
        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView) {
                    lpWidget.parentNode = bresView.parentNode;
                });
                // $scope.resetForm();
            }
        };
        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
        initialize();
        if (localStorage.getItem("navigationFlag")) {
            if (localStorage.getItem("origin") == "dashboard") {
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
                $scope.backtoDashboard = true;
                $scope.origin = "Dashboard";
            }
        }
        /* } */
        // $timeout(function(){
        //               gadgets.pubsub.publish('cxp.item.loaded', {
        //                   id: widget.id
        //               });
        //           }, 10);
    }
    /**
     * Export Controllers
     */
    exports.PaybillCtrl = PaybillCtrl;
});