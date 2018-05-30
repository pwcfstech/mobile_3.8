/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

    'use strict';
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcError = require('idfcerror');
    var OTP_SUCCESS_MESSAGE = idfcConstants.OTP_SUCCESS_MESSAGE;

    var $ = require('jquery');

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function QuickPaybillCtrl($scope, $timeout, $rootElement, lpWidget,
        lpCoreUtils, $http, httpService, lpCoreBus, lpPortal, transReceiptModule, CQService) {

        var tempFrom;
        var tempTo;

        // RSA changes by Xebia start
        $scope.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('verifyCQAnswerUrl'));
        // to fetch mobile specific data
        /* gadgets.pubsub.publish("getMobileSdkData");
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
                            //mailSent - Ends Here

        $scope.goToEmailMod = function() {
                    localStorage.clear();
                    localStorage.setItem("navigationFlag",true);
                    localStorage.setItem("origin","Profile");
                    localStorage.setItem("target","ReviewTransfer");
                    localStorage.setItem("navigationData","Email Modification");
                    gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
                }

        var initialize = function() {

            //Session Management Call
            idfcError.validateSession($http);
            $scope.showMailSuccess = false;
            $scope.resendDisabled = false;
            $scope.accountCheck = false;
            $scope.showPayAnother = false;
            $scope.goNextFlag = false;
            $scope.hideSubmit1 = false;
            $scope.errorMessage = '';
            $scope.failurePage = false;
            $scope.mainPage = false;
            $scope.SuccessPage = false;
            $scope.setAddBillFlag = false;
            $scope.addbillerFlag = false;
            $scope.billerCategory = '';
            $scope.authenticator1 = '';
            $scope.authenticator2 = '';
            $scope.authenticator3 = '';
            $scope.authenticator4 = '';
            $scope.authenticator5 = '';
            $scope.payeeBillType = false;
            $scope.fromDate = '';
            $scope.authFlag1 = false;
            $scope.authFlag2 = false;
            $scope.authFlag3 = false;
            $scope.check1 = false;
            $scope.check2 = false;
            $scope.check3 = false;
            $scope.check4 = false;
            $scope.check5 = false;
            $scope.checkp1 = false;
            $scope.checkp2 = false;
            $scope.checkp3 = false;
            $scope.checkp4 = false;
            $scope.checkp5 = false;
            $scope.fetchFrequency = false;
            $scope.setLimitAmtFlag = true;
            $scope.setAutoPayFlag = false;
            $scope.billerNickName = '';
            $scope.fromDate = '';
            $scope.toDate = '';
            $scope.billerPaymentAccount = '';
            $scope.frequency = '';
            $scope.todaysDate = new Date();
            $scope.billerNameSelected = '';
            $scope.billerSelected = '';
            $scope.authCount = '';
            $scope.disableAmount = false;
            $scope.billerProvider = '';
            $scope.billerProviderListEndPoint = lpWidget.getPreference('BillerMasterDbDataSrc');
            $scope.AddBillerMasterEndPoint = lpWidget.getPreference('AddBillerMasterDbDataSrc'); // Add biller db
            $scope.loadCategory();
            $scope.getAcccountDetails();
            $scope.billerSelectionList = '';
            $scope.termcondition = false;
            $scope.billerProviderMaster = [];
            $scope.datecheck = new Date();
            $scope.limitAmount = '';
            $scope.showFetchButton = false;
            $scope.tncflag = false;
            $scope.buttonSuccess = false;
            $scope.hideOTPFlag = true;
            $scope.hideQuesFlag = true;
            $scope.showQuestionDiv = false;
            $scope.hideCombineFlag = true;
            $scope.challengeQuesAnswers = [{
                'answer': '',
                'question': ''
            }]

            $scope.controlPass = {
                otpValue: ''
            };
            $scope.otpError = {
                happened: false,
                msg: ""
            };

            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion = {};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends
        };
        gadgets.pubsub.subscribe("native.back", function() {
            $scope.tncflag = false;
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        });
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if ($scope.tncflag) {
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
                $scope.tncflag = false;
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        $scope.cancelFormBack = function() {

            $scope.mainPage = false;
            $scope.billDetailPage = false;
            $scope.otpValue = '';
            $scope.hideOTPFlag = true;
            $scope.hideSubmit1 = false;
            $scope.termcondition = false;
            $scope.$apply();

        };


        $scope.checkAlphanumeric = function(rege) {
            if (!rege) {
                return 'text';
            }

            var letters = /[a-zA-Z]/;
            if (rege.match(letters)) {
                return 'text';
            }
            return 'tel';
        }


        /**
         * frequency for making date null
         */
        $scope.$watch('frequency', function() {

            if (!angular.isUndefined($scope.frequency) || $scope.frequency != null || $scope.frequency != '') {
                $scope.fromDate = '';
                $scope.toDate = '';
            }
        }, true);

        /**
         *on the basic of fromDate todate will be selected.
         */
        $scope.$watch('fromDate', function() {

            if (!angular.isUndefined($scope.fromDate)) {

                if ($scope.fromDate != null || $scope.fromDate != '') {
                    $scope.toDate = '';
                    $scope.todateFinal = new Date($scope.toDate);
                    $scope.fromDateFinal = new Date($scope.fromDate);

                    if ($scope.frequency === 'MONTHLY') {
                        $scope.disableDateCheck = false;
                        console.log("MONTHLY");
                        $scope.datecheck = new Date(new Date($scope.fromDateFinal).setMonth($scope.fromDateFinal.getMonth() + 1));
                        console.log("Date check" + $scope.datecheck);

                    } else if ($scope.frequency === 'QUARTERLY') {
                        $scope.disableDateCheck = false;
                        console.log("QUARTERLY");
                        $scope.datecheck = new Date(new Date($scope.fromDateFinal).setMonth($scope.fromDateFinal.getMonth() + 3));
                        console.log("Date check" + $scope.datecheck);

                    }
                    if ($scope.frequency === 'HALFYEARLY') {
                        $scope.disableDateCheck = false;
                        console.log("HALFYEARLY");
                        $scope.datecheck = new Date(new Date($scope.fromDateFinal).setMonth($scope.fromDateFinal.getMonth() + 6));
                        console.log("Date check" + $scope.datecheck);

                    }
                    if ($scope.frequency === 'YEARLY') {
                        $scope.disableDateCheck = false;
                        console.log("YEARLY");
                        $scope.datecheck = new Date(new Date($scope.fromDateFinal).setMonth($scope.fromDateFinal.getMonth() + 12));
                        console.log("Date check" + $scope.datecheck);

                    }

                }

            }

        }, true);

        $scope.loadCategory = function() {
            var self = this;

            self.loadCategories = httpService.getInstance({
                endpoint: lpWidget.getPreference('billerCategoriesMasterDbDataSrc')

            });

            var xhr = self.loadCategories.read();

            xhr.success(function(data) {
                if (data && data !== 'null') {
                    $scope.billerCategoryList = data;
                }
            });

            xhr.error(function(data) {
                if (data.cd) {
                    idfcError.checkTimeout(data);
                    if ((data.cd === '501')) {
                        $scope.globalerror = idfcError.checkGlobalError(data);
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    } else {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    }
                }

                self.error = {
                    message: data.statusText
                };
            });

            return xhr;
        };

        /**
         *  generateAddBillerProvider
         * @desc Method to generate the dropdown list of BillerProvider on the basics of BillerName
         */
        var addBillerSelection = function() {

            $scope.billerNameSelected = $scope.billerProvider.billerName;
            console.log("BillName to be hit In Addbiller BillerMaster::" + $scope.billerNameSelected);
            //$scope.errorSpin = true;
            var xhr;
            var addBillerMasterServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.AddBillerMasterEndPoint, {
                servicesPath: lpPortal.root
            });

            var postData = {
                'billerName': $scope.billerNameSelected,
                'requestId': 'Name'
            };

            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: addBillerMasterServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                //$scope.errorSpin = false;
                if (data && data !== 'null') {
                    console.log(data);
                    $scope.billerSelected = data;
                }
                $scope.billerSelected = data;
                console.log($scope.billerSelected);
                addBillerCheck();
            });
            xhr.error(function(data, status, headers, config) {
                //$scope.errorSpin = false;
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
         *  generateAddBillerProvider List in case of POSt PAID
         * @desc Method to generate the dropdown list of BillerProvider on the basics of BillerName
         */
        var generateAddBillerProviderList = function() {

            $scope.billerNameSelected = $scope.billerProvider.billerName;
            console.log("BillName to be hit In Addbiller BillerMaster::" + $scope.billerNameSelected);
            //$scope.errorSpin = true;
            var xhr;
            var addBillerMasterServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.AddBillerMasterEndPoint, {
                servicesPath: lpPortal.root
            });

            var postData = {
                'billerName': $scope.billerNameSelected,
                'requestId': 'NameWithLike' // If POSTPAID then get the List
            };

            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: addBillerMasterServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                //$scope.errorSpin = false;
                if (data && data !== 'null') {
                    console.log(data);
                    $scope.billerSelectionList = data;
                }
                $scope.billerSelectionList = data;
                console.log($scope.billerSelectionList);
                addBillerCheckPostpaid(); //PostPaid check for addbiller Biller
            });
            xhr.error(function(data, status, headers, config) {
                //$scope.errorSpin = false;
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
                }, '');
            }

        };
        /**
         * to clear the fields on selection on provider and category.
         * @param value
         */
        $scope.clearValues = function(value) {

            $scope.authCount = '';
            $scope.authenticator1 = '';
            $scope.authenticator2 = '';
            $scope.authenticator3 = '';
            $scope.authenticator4 = '';
            $scope.authenticator5 = '';
            $scope.accountCheck = true;
            if ($scope.acccountNumbers != undefined && $scope.acccountNumbers.length > 1) {
                $scope.selectedAccountNumber = '';
                $scope.accountCheck = false;
            }

            $scope.amountEntered = '';
            $scope.errorMessage = '';
            $scope.goNextFlag = false;


        };

        /**
         * $scope.billerSelected is null then doent show add billers option
         */
        var addBillerCheck = function() {
            console.log("billerselected: " + $scope.billerSelected);

            if ($scope.billerSelected === '' || $scope.billerSelected === null || $scope.billerSelected === []) {
                $scope.addbillerFlag = true;
                console.log(" dont Show addbiller");
            } else {
                $scope.addbillerFlag = false;
                console.log("  Show addbiller");

                $scope.diff = $scope.billerSelected.authenticatorCount - $scope.authCount;
                console.log("differnce between count" + $scope.diff);
                if ($scope.billerSelected.authenticatorCount > $scope.authCount) {
                    $scope.diff = $scope.billerSelected.authenticatorCount - $scope.authCount;
                    console.log("differnce between count" + $scope.diff);

                }

            }
        };


        /**
         * $scope.billerSelected is null then dont show add billers option in case of postPAID selection
         */
        var addBillerCheckPostpaid = function() {




            console.log($scope.billerSelectionList);
            if (angular.isUndefined($scope.billerSelectionList[0])) {
                $scope.addbillerFlag = true;
                console.log(" dont Show addbiller");
            } else {
                if ($scope.billerSelectionList != '' || $scope.billerSelectionList != null || $scope.billerSelectionList != []) {
                    $scope.addbillerFlag = false;
                    console.log("  Show addbiller");
                }
            }

        };

        /**
         * Watch Function when  billerCategorySelected hit the service  to fetch the Provide Details
         */
        $scope.$watch('billerCategory', function() {
            $scope.clearValues();

            $scope.showFetchButton = false;
            if (!angular.isUndefined($scope.billerCategory)) {
                $scope.providerFlag = true;
                if ($scope.billerCategory === null ||
                    $scope.billerCategory === '') {
                    $scope.providerFlag = false;
                }

                if ($scope.providerFlag = true) {
                    $scope.loadProviderMasterData();
                }
            }

        });

        $scope.$watch('billerProvider', function() {
            $scope.clearValues();
            if (!angular.isUndefined($scope.billerProvider)) {
                $scope.authCount = $scope.billerProvider.authenticatorCount;
                $scope.billerType = $scope.billerProvider.billerType;

                $scope.disableAmount = true; //3.1 changes l
                document.getElementById("nextButton").disabled = false;
                // $scope.showFetchButton = false; //3.1 changes l
                $scope.payeeBillType = false;
                if (!angular.isUndefined($scope.billerType)) {
                    $scope.showFetchButton = true; //3.1 changes l
                    if (!($scope.billerType === 'PAYEE' || $scope.billerType === 'Payee' || $scope.billerType === 'payee')) {
                        // $scope.showFetchButton = true; //3.1 changes l
                        //document.getElementById("fetchButton").disabled = true; //3.1 changes l
                        document.getElementById("nextButton").disabled = true;
                    }
                    //3.1 changes l
                    /* if ($scope.billerType === 'BILLER' ||
                         $scope.billerType === 'Biller') {
                         $scope.disableAmount = true;
                     }*/
                }
            }

        }, true);


        /**
         * added for clearing error message for Amount input box drop down
         */
        $scope.$watch('amountEntered', function() {
            $scope.errorMessage = '';

        }, true);

        /**
         * authenticator1 if  authenticator2 changes its regex will also changes on runtime.
         */
        $scope.$watch('authenticator1', function() {
            $scope.errorMessage = '';
            if (!angular.isUndefined($scope.authenticator1)) {
                var regex1_0 = new RegExp($scope.billerProvider.authenticatorValidation1);
                if (!$scope.authenticator1.match(regex1_0)) {
                    console.log("checkp1:" + $scope.billerProvider.authenticatorValidation1);
                    if ($scope.authenticator1 === '') {
                        $scope.checkp1 = false;
                    } else {

                        $scope.authFlag1 = false;
                        $scope.checkp1 = true;

                    }
                } else {

                    $scope.checkp1 = false;
                    $scope.authFlag1 = true;
                    $scope.fetchBillerDetails();
                }

                /**
                 * Addbiller Auth Check1
                 */
                if ($scope.billerSelected != '' || $scope.billerSelected != null) {

                    var regex1_1 = new RegExp($scope.billerSelected.authenticatorValidation1);
                    if (!$scope.authenticator1.match(regex1_1)) {
                        if ($scope.authenticator1 === '') {
                            $scope.check1 = false;
                        } else {
                            //$scope.authFlag1 = false;
                            $scope.addBillAuthFlag1 = false;
                            $scope.check1 = true;
                        }
                    } else {

                        $scope.check1 = false;
                        $scope.addBillAuthFlag1 = true;
                        //$scope.authFlag1 = true;
                    }
                }

            } else {
                document.getElementById("fetchButton").disabled = true;
            }

        }, true);

        /**
         * authenticator2 if  authenticator2 changes its regex will also changes on runtime.
         */
        $scope.$watch('authenticator2', function() {
            $scope.errorMessage = '';
            $scope.checkp2 = false;
            $scope.check2 = false;
            if (!angular.isUndefined($scope.authenticator2)) {
                var regex2_0 = new RegExp($scope.billerProvider.authenticatorValidation2);
                if (!$scope.authenticator2.match(regex2_0)) {
                    if ($scope.authenticator2 === '') {
                        $scope.checkp2 = false;
                    } else {
                        $scope.checkp2 = true;
                        $scope.authFlag2 = false;
                    }
                } else {
                    $scope.checkp2 = false;
                    $scope.authFlag2 = true;
                    //$scope.count = 2;
                    $scope.fetchBillerDetails();
                }

                /**
                 * Addbiller Auth Check3
                 */
                if ($scope.billerSelected != '' || $scope.billerSelected != null) {
                    var regex2_1 = new RegExp($scope.billerSelected.authenticatorValidation3);
                    if (!$scope.authenticator2.match(regex2_1)) {
                        if ($scope.authenticator2 === '') {
                            $scope.check2 = false;
                        } else {
                            $scope.check2 = true;
                            $scope.addBillAuthFlag2 = false;
                        }
                    } else {
                        $scope.check2 = false;
                        $scope.addBillAuthFlag2 = true;
                        //$scope.authFlag2 = true;
                    }
                }

            } else {
                document.getElementById("fetchButton").disabled = true;
            }

        }, true);

        /**
         * authenticator3 if  authenticator3 changes its regex will also changes on runtime.
         */
        $scope.$watch('authenticator3', function() {
            $scope.errorMessage = '';
            $scope.checkp3 = false;
            $scope.check3 = false;
            if (!angular.isUndefined($scope.authenticator3)) {
                var regex3_0 = new RegExp($scope.billerProvider.authenticatorValidation3);
                if (!$scope.authenticator3
                    .match(regex3_0)) {
                    if ($scope.authenticator3 === '') {
                        $scope.checkp3 = false;
                    } else {
                        $scope.checkp3 = true;
                        $scope.authFlag3 = false;
                    }
                } else {
                    $scope.checkp3 = false;
                    $scope.authFlag3 = true;
                }

                /**
                 * Addbiller Auth Check3
                 */
                if ($scope.billerSelected != '' || $scope.billerSelected != null) {
                    var regex3_1 = new RegExp($scope.billerSelected.authenticatorValidation3);
                    if (!$scope.authenticator3.match(regex3_1)) {
                        if ($scope.authenticator3 === '') {
                            $scope.check3 = false;
                        } else {
                            $scope.check3 = true;
                            $scope.addBillAuthFlag3 = false;
                        }
                    } else {
                        $scope.check3 = false;
                        $scope.addBillAuthFlag3 = true;
                        //$scope.authFlag3 = true;
                    }
                }

            } else {
                document.getElementById("fetchButton").disabled = true;
            }

        }, true);
        $scope.$watch('authenticator4', function() {
            $scope.errorMessage = '';
            if (!angular.isUndefined($scope.authenticator4)) {
                var regex4_0 = new RegExp($scope.billerProvider.authenticatorValidation4);
                if (!$scope.authenticator4
                    .match(regex4_0)) {
                    if ($scope.authenticator4 === '') {
                        $scope.checkp4 = false;
                    } else {
                        $scope.checkp4 = true;
                        $scope.authFlag4 = false;
                    }
                } else {
                    $scope.checkp4 = false;
                    $scope.authFlag4 = true;
                    //$scope.count = 3;
                    $scope.fetchBillerDetails();
                }

                /**
                 * Addbiller Auth Check4
                 */
                if ($scope.billerSelected != '' || $scope.billerSelected != null) {
                    var regex4_1 = new RegExp($scope.billerSelected.authenticatorValidation4);
                    if (!$scope.authenticator4.match(regex4_1)) {
                        if ($scope.authenticator4 === '') {
                            $scope.check4 = false;
                        } else {
                            $scope.check4 = true;
                            $scope.addBillAuthFlag4 = false;
                        }
                    } else {
                        $scope.check4 = false;
                        $scope.addBillAuthFlag4 = true;
                        //$scope.authFlag4 = true;
                    }
                }

            } else {
                document.getElementById("fetchButton").disabled = true;
            }

        }, true);

        $scope.$watch('authenticator5', function() {
            $scope.errorMessage = '';
            if (!angular.isUndefined($scope.authenticator5)) {


                if ($scope.billerProvider != '' || $scope.billerProvider != null) {
                    var regex5_0 = new RegExp($scope.billerProvider.authenticatorValidation5);
                    if (!$scope.authenticator5.match(regex5_0)) {
                        if ($scope.authenticator5 === '') {
                            $scope.checkp5 = false;
                        } else {
                            $scope.checkp5 = true;
                            $scope.authFlag5 = false;
                        }
                    } else {
                        $scope.checkp5 = false;
                        $scope.authFlag5 = true;
                    }


                }

                /**
                 * Addbiller Auth Check5
                 */
                var regex5_1 = new RegExp($scope.billerSelected.authenticatorValidation5);
                if (!$scope.authenticator5
                    .match(regex5_1)) {
                    if ($scope.authenticator5 === '') {
                        $scope.check5 = false;
                    } else {
                        $scope.check5 = true;
                        $scope.addBillAuthFlag5 = false;
                    }
                } else {
                    $scope.check5 = false;
                    $scope.addBillAuthFlag5 = true;
                    //$scope.authFlag5 = true;


                }

            } else {
                document.getElementById("fetchButton").disabled = true;
            }

        }, true);

        // Remove specific alert
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.fetchBillerDetails = function() {

            //alert("$scope.billerProvider.billerName"+$scope.billerProvider.billerType);
            if ($scope.billerProvider.authenticatorCount === 1 &&
                $scope.authFlag1 === true &&
                !($scope.billerProvider.billerType === 'PAYEE' || $scope.billerProvider.billerType === 'Payee')) {

                document.getElementById("fetchButton").disabled = false;
                //$scope.getBiller();
            } else if ($scope.billerProvider.authenticatorCount === 2 &&
                $scope.authFlag1 === true &&
                $scope.authFlag2 === true &&
                !($scope.billerProvider.billerType === 'PAYEE' || $scope.billerProvider.billerType === 'Payee')) {
                document.getElementById("fetchButton").disabled = false;
                //$scope.getBiller();
            } else if ($scope.billerProvider.authenticatorCount === 3 &&
                $scope.authFlag1 === true &&
                $scope.authFlag2 === true &&
                $scope.authFlag3 === true &&
                !($scope.billerProvider.billerType === 'PAYEE' || $scope.billerProvider.billerType === 'Payee')) {
                document.getElementById("fetchButton").disabled = false;
                //$scope.getBiller();
            } else if ($scope.billerProvider.authenticatorCount === 4 &&
                $scope.authFlag1 === true &&
                $scope.authFlag2 === true &&
                $scope.authFlag3 === true &&
                $scope.authFlag4 === true &&
                !($scope.billerProvider.billerType === 'PAYEE' || $scope.billerProvider.billerType === 'Payee')) {
                document.getElementById("fetchButton").disabled = false;
                //$scope.getBiller();
            } else if ($scope.billerProvider.authenticatorCount === 5 &&
                $scope.authFlag1 === true &&
                $scope.authFlag2 === true &&
                $scope.authFlag3 === true &&
                $scope.authFlag4 === true &&
                $scope.authFlag5 === true &&
                !($scope.billerProvider.billerType === 'PAYEE' || $scope.billerProvider.billerType === 'Payee')) {
                document.getElementById("fetchButton").disabled = false;
                //$scope.getBiller();
            }
        };

        $scope.loadProviderMasterData = function() {

            $scope.flag2 = true;
            $scope.error = {
                happened: false
            };
            $scope.errorSpin = true;
            var xhr;
            var billerProviderServiceURL = lpCoreUtils
                .resolvePortalPlaceholders(
                    $scope.billerProviderListEndPoint, {
                        servicesPath: lpPortal.root
                    });
            var postData = {
                'billerCategory': $scope.billerCategory,
                'requestId': 'Category'
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: billerProviderServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            xhr.success(function(data) {
                $scope.flag2 = false;
                if (($scope.flag1 == false) && ($scope.flag2 == false)) {

                    $scope.errorSpin = false;
                }


                if (data && data !== 'null') {
                    $scope.billerProviderMaster = data;

                }
            });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                $scope.flag2 = false;
                if (($scope.flag1 == false) && ($scope.flag2 == false)) {

                    $scope.errorSpin = false;
                }
                if (data.cd) {
                    idfcError.checkTimeout(data);
                    if ((data.cd === '501')) {
                        $scope.globalerror = idfcError.checkGlobalError(data);
                        // $scope.errorSpin = false;
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    } else if ((data.cd === 'BPAY:INV_MSG_070')) {

                        $scope.alert = {
                            messages: {
                                cd: 'This bill has not yet been generated. Why are you in a hurry to pay ?'
                            }
                        };
                        $scope.addAlert('cd', 'error', false);

                    } else if ((data.cd === 'BPAY:INV_MSG_086')) {

                        $scope.alert = {
                            messages: {
                                cd: 'Something went wrong during this Fetch Bills, please try in sometime'
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    } else {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    }
                }

                self.error = {
                    message: data.statusText
                };
            });

            return xhr;
        };
        $scope.checkFrequencyFromDb = function() {
            //alert("checkFrequencyFromDb"+$scope.fetchFrequency);
            if ($scope.fetchFrequency === false) {
                $scope.getFrequencyList();
            }
        };
        /**
         * get Frequency List
         * @returns {xhr}
         */
        $scope.getFrequencyList = function() {
            $scope.errorSpin = true;
            var self = this;
            self.getFrequencyListDetails = httpService.getInstance({
                endpoint: lpWidget.getPreference('frequencyDataSrc')
                //$scope.errorSpin = false;
            });

            var xhr = self.getFrequencyListDetails.read();

            xhr.success(function(data) {
                //alert(data);
                console.log(data);
                $scope.frequencyMaster = data;
                $scope.fetchFrequency = true;
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
        $scope.$watch('termcondition', function(newValue, oldValue) {

            if (newValue) {
                // $scope.generateOTP('send');
            } else {
                // alert('hide otp');
            }
        }, true);

        $scope.callOtp = function() {
            $scope.hideSubmit1 = true;
            $scope.enableDisableOTPorQuestion();
            //Auto Read OTP
            //$scope.readSMS('');
        };

        var setdeviceprint = function() {
            return encode_deviceprint();
        };

        //SMS Reading -- Start

        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            console.log(evt.resendOtpFlag)
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
                                data: "QuickPay"
                            });

                            //Step 2. Send request to "sendOTP service
                            if ('resend' === resendFlag) {
                                $scope.generateOTP(resendFlag);
                            }
                            /*else {
                                                           $scope.enableDisableOTPorQuestion();
                                                       }*/

                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("QuickPay", function(evt) {
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
                                $scope.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :' + $scope.otpValue);
                                $scope.initiateTransaction(true, $scope.credentialType);

                                //angular.element('#verifyOTP-btn-quick-pay').triggerHandler('click');
                            });
                        } else {
                            // logic changed after RSA implementation
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            /*if ('resend' === resendFlag) {
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
                'customerId': $scope.customerId,
                'mobileNumber': $scope.customerMob,
                'resendOTP': false,
                'accountNumber': $scope.acccountNumbers,
                'paymentMode': 'NON_RECURRING',
                'instructedAmount': $scope.amountEntered,
                'txnMode': 'IFT',
                'ifscCode': 'IDFC00001' // BillPay IFSC Code
            };
            $scope.postData.transaction = 'quickPay';
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
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME",
                });

                $scope.credentialType = data.credentialType;

                // RSA changes by Xebia starts
                if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT') {
                    $scope.errorSpin = false;
                    $scope.showDenyMessage = true;
                    $scope.btnFlag = false;
                } else if (data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED') {
                    $scope.showSetupCQMessage = true;
                    $scope.errorSpin = false;
                    $scope.btnFlag = false;
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
                    $scope.btnFlag = false;
                    $scope.showQuestionDiv = true;
                    $scope.hideOTPFlag = true;
                    $scope.hideCombineFlag = true;
                }
                // RSA changes by Xebia ends
            });
            res.error(function(data) {
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

                if (data.cd && data.cd === '501') {
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    //$scope.addAlert('cd', 'error', false);
                }
                if (data.cd && data.cd === '08') {
                    data.rsn = 'Strike 3 ! Sorry you will need to restart the transaction';
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
                    $scope.generateOTP("generate");
                    $scope.readSMS('');
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
                $scope.btnFlag = false;
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
            });
        };


        /** function to get bill detail */
        $scope.getBiller = function() {

            $scope.errorSpin = true;
            var fetchbillDetailURL = lpCoreUtils
                .resolvePortalPlaceholders(lpWidget
                    .getPreference('fetchBillerList'));
            var postData = {
                'billerId': $scope.billerProvider.billerId,
                'noOfAuthenticator': $scope.billerProvider.authenticatorCount,
                'Authenticator1': $scope.authenticator1,
                'Authenticator2': $scope.authenticator2,
                'Authenticator3': $scope.authenticator3,
                'Authenticator4': $scope.authenticator4,
                'Authenticator5': $scope.authenticator5

            };
            postData = $.param(postData || {});
            var xhr = $http({
                method: 'POST',
                url: fetchbillDetailURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });

            xhr.success(function(data) {
                $scope.errorSpin = false;

                $scope.fetchData = data;
                $scope.amountEntered = data.amt;
                //3.1 changes l below part added
                if ($scope.billerType === 'BILLER' || $scope.billerType === 'Biller') {
                    $scope.disableAmount = true;
                } else {
                    $scope.disableAmount = false;
                }
                $scope.billDetails = data;

                document.getElementById("nextButton").disabled = false;
                $scope.error = {
                    happened: false,
                    msg: ''
                };
            }).error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                //alert('in error..');
                idfcError.checkTimeout(data);
                $scope.globalerror = idfcError.checkGlobalError(data);

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

        // change events for date pickers
        $scope.changeFromDate = function() {
            var FromDate = $scope.fromDate;
        };

        // change events for date pickers
        $scope.changeFromTo = function() {
            tempFrom = new Date($scope.fromDate);
            tempFrom.setDate(tempFrom.getDate() - 1);

            tempTo = new Date($scope.toDate);
            tempTo.setDate(tempTo.getDate() + 1);

        };
        $scope.openFromCalendar = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.isOpenDate1 = true;
        };

        $scope.tnc = function() {
            $scope.tncflag = true;
            // $scope.hideOTPFlag = false;
            // $scope.hideOTPFlag = true;
            //   $scope.hideSubmit1 = false;
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });
        };

        $scope.openToCalendar = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.isOpenDate2 = true;
        };

        //This method is called to verify OTP and do a fund transfer from Quick Pay to Bill Desk
        $scope.initiateTransaction = function(isFormValid, action) {
            debugger;

            //$scope.validateAndQuickPay(isFormValid,action);
            if (!isFormValid) {

                return false;
            }

            $scope.fundsTransferQuickPay(isFormValid, action); // Service call for Transaction and Initiate Payment for BillDesk
            switch ($scope.authCount) {
                case 1:
                    $scope.disableCheck1 = true;
                    break;
                case 2:
                    $scope.disableCheck1 = true;
                    $scope.disableCheck2 = true;
                    break;
                case 2:
                    $scope.disableCheck1 = true;
                    $scope.disableCheck2 = true;
                    $scope.disableCheck3 = true;
                    break;
            }

        }


        //verifyOTp and quick pay method
        $scope.validateAndQuickPay = function(isFormValid, action) {
            $scope.OTPform.submitted = true;
            console.log("action is : " + action);
            if (!isFormValid) {
                return false;
            }

            $scope.error = {
                happened: false,
                msg: ''
            };

            var verifyOTPServiceURL = lpCoreUtils
                .resolvePortalPlaceholders(lpWidget
                    .getPreference('verifyOTPService'));

            var otpData = {
                'otpValue': $scope.otpValue,
                'requestType': 'verifyOTP'
            };
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

            /* Check whether the HTTP Request is successful or not. */
            xhr.success(function(data) {
                console.log("Inside success");

                $scope.otpError = {
                    happened: false,
                    msg: ''
                };
                $scope.fundsTransferQuickPay(isFormValid, action);
            }).error(function(data, status, headers, config) {

                console.log("Inside error" + data.cd + data.rsn);
                $scope.errorSpin = false;
                $scope.OTPform.submitted = false;

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
                    data.rsn = 'Strike 3 ! Sorry you will need to restart the transaction';
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
            });
        };

        // CBS Funds Transfer Service Call
        $scope.fundsTransferQuickPay = function(isFormValid, action) {

            if (!isFormValid) {
                return false;
            }
            $scope.errorSpin = true;
            $scope.error.happened = false;
            $scope.otpError = {
                happened: false,
                msg: ''
            };


            $scope.billDetailPage = false;
            if ($scope.billerCategory === 'Postpaid') { // If POSTPAID then get the List

                generateAddBillerProviderList();

            } else {

                addBillerSelection();
            }

            var self = this;
            self.fundsTransferService = httpService.getInstance({
                endpoint: lpWidget.getPreference('fundTransferBill') + '?cnvId=quickpay'

            });
            var serviceData = {};
            $scope.selectedBill = $scope.billDetails;
            // Fund Transfer service data
            serviceData.accountId = $scope.selectedAccountNumber.id;
            serviceData.counterpartyAccount = ''; //BillPay account Number
            serviceData.counterpartyName = 'Bill Desk';
            serviceData.accountName = '';
            serviceData.instructedAmount = $scope.amountEntered;
            serviceData.instructedCurrency = 'INR';
            serviceData.txnMode = 'IFT';
            serviceData.paymentMode = 'NON_RECURRING';
            serviceData.paymentDescription = 'Bill Pay CBS Transfer';
            serviceData.type = 'Bank';
            serviceData.cstId = '';
            var now = new Date();
            serviceData.onDate = now.getTime();
            serviceData.adBnfcry = 'N';

            if ($scope.billerProvider.billerType === 'PAYEE' || $scope.billerProvider.billerType === 'Payee') {
                serviceData.bllrAcctId = 'NA';
                serviceData.bllrId = $scope.billerProvider.billerId;
                serviceData.bllId = 'NA';
                serviceData.paymentType = 'PNY';
                serviceData.bllrNckNm = 'NA';
                serviceData.bllDt = 'NA';
                serviceData.billDueDt = 'NA';
                serviceData.bllNbr = 'NA';
                serviceData.bllrShrtNm = 'NA';
                // now sending authenticatorCount and authenticators from user input
                serviceData.noOfAuthenticator = $scope.billerProvider.authenticatorCount;
                if ($scope.billerProvider.authenticatorCount > 0) {
                    serviceData.Authenticator1 = $scope.authenticator1;
                }
                if ($scope.billerProvider.authenticatorCount > 1) {
                    serviceData.Authenticator2 = $scope.authenticator2;
                }
                if ($scope.billerProvider.authenticatorCount > 2) {
                    serviceData.Authenticator3 = $scope.authenticator3;
                }
                if ($scope.billerProvider.authenticatorCount > 3) {
                    serviceData.Authenticator4 = $scope.authenticator4;
                }
                if ($scope.billerProvider.authenticatorCount > 4) {
                    serviceData.Authenticator5 = $scope.authenticator5;
                }
            } else {
                serviceData.bllrAcctId = 'NA';
                serviceData.bllrId = $scope.billerProvider.billerId;
                serviceData.bllId = 'NA';
                serviceData.paymentType = 'RNP';
                serviceData.bllrNckNm = 'NA';
                if ($scope.selectedBill.bllDt === '' || $scope.selectedBill.bllDt === null) {
                    serviceData.bllDt = 'NA';
                } else {
                    serviceData.bllDt = $scope.selectedBill.bllDt;
                }
                serviceData.billDueDt = $scope.selectedBill.bllDueDt;
                serviceData.bllNbr = $scope.selectedBill.bllNbr;
                serviceData.bllrShrtNm = 'NA';
                serviceData.noOfAuthenticator = $scope.selectedBill.athntctr.length;
                if ($scope.selectedBill.athntctr.length > 0) {
                    serviceData.Authenticator1 = $scope.selectedBill.athntctr[0];
                }
                if ($scope.selectedBill.athntctr.length > 1) {
                    serviceData.Authenticator2 = $scope.selectedBill.athntctr[1];
                }
                if ($scope.selectedBill.athntctr.length > 2) {
                    serviceData.Authenticator3 = $scope.selectedBill.athntctr[2];
                }
                if ($scope.selectedBill.athntctr.length > 3) {
                    serviceData.Authenticator4 = $scope.selectedBill.athntctr[3];
                }
                if ($scope.selectedBill.athntctr.length > 4) {
                    serviceData.Authenticator5 = $scope.selectedBill.athntctr[4];
                }
            }
            serviceData.otpValue = $scope.otpValue;
            count1++; // otp changes
            serviceData.credentialType = action;

            serviceData.pmtAmt = $scope.amountEntered;
            $scope.authenticatorCopy = serviceData;

            var xhr = self.fundsTransferService.create({
                data: serviceData
            });
            xhr.success(function(data) {
                $scope.errorSpin = false;
                $scope.error = {
                    happened: false,
                    msg: ''
                };
                $scope.payBillError = {
                    happened: false,
                    msg: ''
                };
                if (data != null) {

                    $scope.SuccessPage = true;
                }

                $scope.billDetailPage = false;
                //				$scope.addbillerFlag = false;
                $scope.errorSpin = false;
                 var transactionID = $scope.isEmptyVal(data)? "-":data;

                                                                           var actionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("getTxnDateTime"));
                                                                           console.log("Tets URL:", actionUrl);
                                                                           var request = $http({
                                                                               method: 'POST',
                                                                               url: actionUrl,
                                                                               data: JSON.stringify({txnID: transactionID}),
                                                                               headers: {
                                                                                   'Accept': 'application/json',
                                                                                   'Content-Type': 'application/json;'
                                                                               }
                                                                           });
                                    request.success(function(response, status, headers, config) {
                    					$scope.successItems = {}; //Transaction Receipt
                                        $scope.successItems = {
                                            "successMessage": "Congratulations! Your Payment is successful",
                                            "transactionReferenceNumber": $scope.isEmptyVal(data)? "-":data,
                                            "nameOfTheBiller": $scope.isEmptyVal($scope.billerProvider.billerName)? "NA":$scope.billerProvider.billerName,
                    						"amountPaid": $scope.isEmptyVal($scope.amountEntered)?"":$scope.amountEntered,
                    						"transactionTimeAndDate": response.content.createdAt,
                                        };
                    					$scope.customFields = {}; //Transaction Receipt
                                        $scope.customFields = {
                    						"customField1": $scope.isEmptyVal($scope.billerProvider.authenticatorLable1)?"":$scope.billerProvider.authenticatorLable1,
                    						"customField2": $scope.isEmptyVal($scope.billerProvider.authenticatorLable2)?"":$scope.billerProvider.authenticatorLable2,
                    						"customField3": $scope.isEmptyVal($scope.billerProvider.authenticatorLable3)?"":$scope.billerProvider.authenticatorLable3
                    					}
                    
                                        $scope.items = [{ item: 'Transaction Ref No', value: $scope.successItems.transactionReferenceNumber, display: true }, { item: 'Name of the Biller', value: $scope.successItems.nameOfTheBiller, display: true }, { item: ($scope.isEmptyVal($scope.billerProvider.authenticatorLable1)?"":$scope.billerProvider.authenticatorLable1), value: $scope.isEmptyVal($scope.authenticator1)?"":$scope.authenticator1, display: $scope.isEmptyVal($scope.authenticator1)? false:true }, { item: ($scope.isEmptyVal($scope.billerProvider.authenticatorLable2)?"":$scope.billerProvider.authenticatorLable2), value: $scope.isEmptyVal($scope.authenticator2)?"":$scope.authenticator2, display: $scope.isEmptyVal($scope.authenticator2)? false:true }, { item: ($scope.isEmptyVal($scope.billerProvider.authenticatorLable3)?"":$scope.billerProvider.authenticatorLable3), value: $scope.isEmptyVal($scope.authenticator3)?"":$scope.authenticator3, display: $scope.isEmptyVal($scope.authenticator3)? false:true }, { item: 'Amount Paid', value: $scope.successItems.amountPaid, display: true, currency: true }, { item: 'Date and Time', value: $scope.successItems.transactionTimeAndDate, display: true }];
                                        $scope.actions = [{ name: "Email", className: "mailButton", transType: "quickPay", receiptType: 'email', tooltip: 'Mail this to your registered email ID' }];
                                        /*$scope.actions = [{ name: "Email", className: "btn btn-primary primary-btn-btn primary-btn-ft mailButton", transType: "quickPay", receiptType: 'email', style:"height:35px !important; width:100% !important;" }];*/
                                        $scope.buttons = [{ name: "Make Another Payment", className: "btn btn-primary primary-btn-btn primary-btn-ft", param: 'anotherPayment', style:"height:35px !important; width:100% !important;" }, { name: "Done", className: "btn secondary-btn-btn secondary-btn-ft btn-align review-button", param: 'accountSummary', style:"height:35px !important; width:100% !important;" }];
                                        // Transaction Receipt End
                lpCoreBus.publish('launchpad-retail.refreshAccountSummary');
                })
            request.error(function(error) {
            console.log("Date txn Date & Time:", error);
                self.errorSpin = false;
            });
            });
            xhr.error(function(data) {
                console.log('-- in Error DB ---');
                console.log('-- in Error DB ---' + data.cd);
                $scope.errorSpin = false;
                if (count1 == 3) {
                    $scope.otpError = {
                        happened: true,
                        msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                    };
                    $scope.success.happened = false;
                    $scope.hideOTPFlag = false;
                    $scope.billDetailPage = true;
                    $scope.setAddBillFlag = false;

                } else if (data.cd == 'TRANS_LIMIT_EXCEEDED_01') {
                    console.log("billPayCbsErrorData.rsn test " + data.rsn);
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success.happened = false;

                }

                 else {

                    if (!(data.cd == '02' || data.cd == '04')) {

                        if (data.cd == '08') {
                            $scope.otpError = {
                                happened: true,
                                msg: data.rsn
                            };
                            $scope.success.happened = false;
                            $scope.resendDisabled = true;
                            $scope.hideOTPFlag = false;
                            $scope.billDetailPage = true;
                            $scope.setAddBillFlag = false;
                            $scope.cancelTransaction = true;
                        } else {
                            $scope.SuccessPage = false;
                            $scope.failurePage = true;
                            $scope.billDetailPage = false;
                            //$scope.errorSpin = false;
                            $scope.payBillError = {
                                happened: true,
                                msg: 'The bill of ',
                                msg1: $scope.amountEntered,
                                msg3: ' for ',
                                msg2: $scope.billerProvider.billerName,
                                msg4: ' has been Failed. Please try after sometime.'
                            };
                            idfcError.checkTimeout(data);
                            $scope.globalerror = idfcError.checkGlobalError(data);
                            if (data.cd != 'ONREV999') {
                                $scope.error = {
                                    happened: true,
                                    msg: data.rsn
                                };
                            }
                        }
                    } else {
                        $scope.otpError = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.success.happened = false;
                        $scope.hideOTPFlag = false;
                        $scope.billDetailPage = true;
                        $scope.setAddBillFlag = false;
                        //            					$scope.error = {
                        //                                            						happened: true,
                        //                                            						msg: data.rsn
                        //                                            					};
                    }
                }
            });
            return xhr;
        };
        
        	/**
                 * Comman Util Function
                 * isEmptyVal method
                 * @desc Method to check for empty val in string,object, array etc.
                 */
        		    $scope.isEmptyVal= function(val) {
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
        
        		// Ends here
        
        		/**
                 * Transaction Receipt
                 * FormatDate and transReceipt method
                 * @desc Method to format Date and to carry out Download, Print and Email the Advice to user.
                 */
        
                $scope.formatDate = function (dt) {
                    return dt.toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });
                }
                $scope.transReceiptModule = new transReceiptModule();
        
                $scope.transReceipt = function(receiptType, transType) {
                $scope.errorSpin = true;
        			$scope.showMailSuccess = false;
                    // $scope.transReceiptModule.transReceipt(receiptType, transType, $scope.successItems); //commented to pass blank data to generate the receipt on back-end
        			$scope.transReceiptModule.transReceipt(receiptType, transType, $scope.customFields);
                };
        
        		/**
                 * Transaction Receipt
                 * successAction method
                 * @desc Method to conditionally route the user to Account Summary page or to Recharge Again widget
              	**/
        		$scope.successAction = function(actionType) {
                    if (actionType == "anotherPayment") {
        				$scope.goBack();
                    } else {
        				gadgets.pubsub.publish("launchpad-retail.backToDashboard");
                    }
        
                }
        		//Transaction Receipt -Ends here

        $scope.$watch('selectedAccountNumber', function() {
            if (!angular.isUndefined($scope.selectedAccountNumber)) {
                if ($scope.selectedAccountNumber.availableBalance === [] || $scope.selectedAccountNumber.availableBalance === '' || $scope.selectedAccountNumber.availableBalance === null) {
                    $scope.accountCheck = false;
                } else {
                    $scope.accountCheck = true;
                }

            }

        }, true);
        $scope.cancelForm = function() {
            //alert("in cancel..");
            //$scope.successForm = false;
            $scope.mainPage = false;
            $scope.billDetailPage = false;
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
        };
        $scope.goNext = function(isFormValid, selectedAccountNumber) {
            $scope.goNextFlag = true;
            $scope.errorMessage = '';
            if ($scope.billerCategory == null || $scope.billerCategory == '') {
                $scope.errorMessage = 'Looks like you skipped selecting Category';
                return false;
            } else if ($scope.billerProvider == null || $scope.billerProvider == '') {
                $scope.errorMessage = 'Looks like you skipped selecting Provider';
                return false;
            } else if ($scope.authenticator1 == null || $scope.authenticator1 == '' && $scope.billerProvider.authenticatorCount >= 1) {
                $scope.errorMessage = 'Looks like you skipped entering' + ' ' + $scope.billerProvider.authenticatorLable1;
                return false;
            } else if ($scope.authenticator2 == null || $scope.authenticator2 == '' && $scope.billerProvider.authenticatorCount >= 2) {
                $scope.errorMessage = 'Looks like you skipped entering' + ' ' + $scope.billerProvider.authenticatorLable2;
                return false;
            } else if ($scope.authenticator3 == null || $scope.authenticator3 == '' && $scope.billerProvider.authenticatorCount >= 3) {
                $scope.errorMessage = 'Looks like you skipped entering' + ' ' + $scope.billerProvider.authenticatorLable3;
                return false;
            } else if ($scope.authenticator4 == null || $scope.authenticator4 == '' && $scope.billerProvider.authenticatorCount >= 4) {
                $scope.errorMessage = 'Looks like you skipped entering' + ' ' + $scope.billerProvider.authenticatorLable4;
                return false;
            } else if ($scope.authenticator5 == null || $scope.authenticator5 == '' && $scope.billerProvider.authenticatorCount >= 5) {
                $scope.errorMessage = 'Looks like you skipped entering' + ' ' + $scope.billerProvider.authenticatorLable5;
                return false;
            } else if ($scope.amountEntered == null || $scope.amountEntered == '') {
                $scope.errorMessage = 'Looks like you skipped entering Amount';
                return false;
            } else if ($scope.amountEntered.length > 15) {
                $scope.errorMessage = 'Please enter amount less than 15 characters';
                return false;
            } else if ($scope.selectedAccountNumber == null || $scope.selectedAccountNumber == '') {
                $scope.errorMessage = 'Looks like you skipped selecting Account Number';
                return false;
            } else if (!$scope.amountEntered == '') {

               /* for (var i = 0; i < $scope.acccountNumbers.length; i++) {
                    console.log($scope.acccountNumbers[i].id);
                    if (selectedAccountNumber.id === $scope.acccountNumbers[i].id) {
                        console.log($scope.acccountNumbers[i].id);
                        if ($scope.acccountNumbers[i].availableBalance < $scope.amountEntered) {

                            console.log("as much as");
                            $scope.errorMessage = 'As much as you wish you could,you cant transfer money than you have in your account.Please add money to this account or choose a different account that has enough funds.';
                            return false;
                        }
                    }
                }*/ /*3.8 change for OD account*/
            } else if ($scope.billerProvider.authenticatorCount === 1 &&
                $scope.authFlag1 === false
            ) {
                return false;
            } else if ($scope.billerProvider.authenticatorCount === 2 &&
                ($scope.authFlag1 === false || $scope.authFlag2 === false)) {
                return false;
            } else if ($scope.billerProvider.authenticatorCount === 3 &&
                ($scope.authFlag1 === false || $scope.authFlag2 === false || $scope.authFlag3 === false)) {
                return false;
            } else if ($scope.billerProvider.authenticatorCount === 4 &&
                ($scope.authFlag1 === false || $scope.authFlag2 === false ||
                    $scope.authFlag3 === false || $scope.authFlag4 === false)) {
                return false;
            } else if ($scope.billerProvider.authenticatorCount === 5 &&
                ($scope.authFlag1 === false || $scope.authFlag2 === false ||
                    $scope.authFlag3 === false || $scope.authFlag4 === false || $scope.authFlag5 === false)) {
                return false;
            }

            /**
             * from QuickPay Resctricts the user if invalid authenticators
             */
            if ($scope.billerProvider.authenticatorCount != null) {

                console.log("Count" + $scope.billerProvider.authenticatorCount);

                switch ($scope.billerProvider.authenticatorCount) {

                    case 1:
                        if ($scope.authenticator1 === null || $scope.authenticator1 === '' || $scope.checkp1 === true) {
                            console.log($scope.billerProvider.authenticatorCount);
                            return false;
                        }

                        break;

                    case 2:
                        if ($scope.authenticator2 === null || $scope.authenticator2 === '' || $scope.checkp1 === true) {
                            return false;
                        } else if ($scope.checkp2 === true) {
                            return false;
                        }

                        break;
                    case 3:
                        console.log($scope.billerProvider.authenticatorCount);
                        console.log("checkp1" + $scope.checkp1);
                        if ($scope.authenticator3 === null || $scope.authenticator3 === '' || $scope.checkp1 === true) {
                            return false;
                        } else if ($scope.checkp2 === true) {
                            return false;
                        } else if ($scope.checkp3 === true) {
                            return false;
                        }

                        break;
                    case 4:
                        if ($scope.authenticator4 === null || $scope.authenticator4 === '' || $scope.checkp1 === true) {
                            return false;
                        } else if ($scope.checkp2 === true) {
                            return false;
                        } else if ($scope.checkp3 === true) {
                            return false;
                        }

                        break;
                    case 5:
                        if ($scope.authenticator5 === null || $scope.authenticator5 === '' || $scope.checkp1 === true) {
                            return false;
                        } else if ($scope.checkp2 === true) {
                            return false;
                        } else if ($scope.checkp3 === true) {
                            return false;
                        }

                        break;

                }

            }

            if (!isFormValid) {
                return false;
            }
            if (($scope.billerType === 'PAYEE' || $scope.billerType === 'Payee' || $scope.billerType === 'payee')) {
                //qpCtrl.getBiller(); //3.1 changes l
            }
            //$scope.successForm=true;
            $scope.mainPage = true;
            $scope.billDetailPage = true;
            //			gadgets.pubsub.publish("js.back", {
            //                              data: "ENABLE_BACK"
            //                              });
        };


        // handling for quickpay otp changes minor release 2.0
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

            } else {
                $scope.lockFieldsOTP = false;
            }

        }
        //close handling for quickpay otp changes minor release 2.0
        /**
         * generateOTP to generate OTP on click of submit button
         * @param value
         */
        $scope.generateOTP = function(value) {

            $scope.otpError.happened = false;
            $scope.resendDisabled = false;
            $scope.otpValue = '';
            $scope.errorSpin = true;
            var resendOTP = null;
            var generateOTPServiceURL = lpCoreUtils
                .resolvePortalPlaceholders(lpWidget
                    .getPreference('generateOTPService'));

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

            xhr.success(
                    function(data) {

                        gadgets.pubsub.publish("js.back", {
                            data: "ENABLE_HOME",
                        });

                        $scope.errorSpin = false;
                        $scope.hideOTPFlag = false;
                        $scope.btnFlag = false;

                        /*  $scope.success = {
                              happened: true,
                              msg: idfcConstants.OTP_SUCCESS_MESSAGE
                          };
                          $scope.error = {
                              happened: false,
                              msg: ''
                          };*/

                        // handling for quick pay otp changes minor release 2.0
                        if (count < 4) {
                            $scope.success = {
                                happened: true,
                                msg: idfcConstants.OTP_SUCCESS_MESSAGE
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

                            $scope.otpError = {
                                happened: true,
                                msg: 'We have tried 5 times to send you a code.'
                            };
                        }
                        //close handling for recharge otp changes minor release 2.0

                        $scope.lockFields = true;
                        $scope.hideSubmit1 = true;
                        $scope.customerMob = data.mobileNumber;
                        if ((typeof $scope.customerMob !== 'undefined') &&
                            ($scope.customerMob !== null)) {
                            $scope.customerMobMasked = 'XXXXXX' +
                                $scope.customerMob
                                .substr($scope.customerMob.length - 4);
                        }

                    })
                .error(function(data, status, headers, config) {
                    gadgets.pubsub.publish("stopReceiver", {
                        data: "Stop Reading OTP"
                    });
                    $scope.errorSpin = false;
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(data);
                    if ($scope.globalerror) {
                        $scope.err = {
                            happened: true,
                            msg: data.rsn
                        };
                    }
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    if (data.cd == "701") {
                        console.log("Inside 701");
                        $scope.resendDisabled = true;
                        $scope.lockFieldsOTP = false;
                        $scope.otpError = {
                            happened: true,
                            msg: 'We have tried 5 times to send you a code.'
                        };

                    }
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };

                });

        };


        /**
         *  addBiller Hit
         * @desc Method to hit Addbiller controller
         */
        $scope.addBiller = function(isValid, form) {

            if ($scope.billerProvider.authenticatorCount === 1 &&
                $scope.addBillAuthFlag1 === false
            ) {
                return false;
            } else if ($scope.billerProvider.authenticatorCount === 2 &&
                ($scope.addBillAuthFlag1 === false || $scope.addBillAuthFlag2 === false)) {
                return false;
            } else if ($scope.billerProvider.authenticatorCount === 3 &&
                ($scope.addBillAuthFlag1 === false || $scope.addBillAuthFlag2 === false || $scope.addBillAuthFlag3 === false)) {
                return false;
            } else if ($scope.billerProvider.authenticatorCount === 4 &&
                ($scope.addBillAuthFlag1 === false || $scope.addBillAuthFlag2 === false ||
                    $scope.addBillAuthFlag3 === false || $scope.addBillAuthFlag4 === false)) {
                return false;
            } else if ($scope.billerProvider.authenticatorCount === 5 &&
                ($scope.addBillAuthFlag1 === false || $scope.addBillAuthFlag2 === false ||
                    $scope.addBillAuthFlag3 === false || $scope.addBillAuthFlag4 === false || $scope.addBillAuthFlag5 === false)) {
                return false;
            }

            if ($scope.setAutoPayFlag && ($scope.billerProvider.billerType === 'PAYEE' || $scope.billerProvider.billerType === 'Payee')) {
                if ($scope.limitAmount === '' || $scope.toDate === '' || $scope.frequency === '') {
                    $scope.payeeBillType = true;
                } else {
                    $scope.payeeBillType = false;
                }
            }



            if (!isValid || $scope.payeeBillType) {
                return false;
            }

            $scope.addBillerEndPoint = lpWidget
                .getPreference('AddBillerDataSrc');
            $scope.todateFinaltimestamp = '';

            if ($scope.toDate !== null || $scope.toDate !== '') {

                $scope.todateFinal = new Date($scope.toDate);
                $scope.todateFinaltimestamp = $scope.todateFinal.getTime();

            }

            $scope.alerts = [];
            $scope.errorSpin = true;
            var xhr;
            var addBillerServiceURL = lpCoreUtils
                .resolvePortalPlaceholders($scope.addBillerEndPoint, {
                    servicesPath: lpPortal.root
                });
            //alert("$scope.setAutoPayFlag"+$scope.setAutoPayFlag+"$scope.billerNickName"+$scope.billerNickName);
            if ($scope.setAutoPayFlag === false) {
                var postData = {
                    'billerId': $scope.billerSelected.billerId,
                    'bllrNckNm': $scope.billerNickName,
                    'noOfAuthenticator': $scope.billerSelected.authenticatorCount,
                    'setAutoPay': 'false',
                    'Authenticator1': $scope.authenticator1,
                    'Authenticator2': $scope.authenticator2,
                    'Authenticator3': $scope.authenticator3,
                    'Authenticator4': $scope.authenticator4,
                    'Authenticator5': $scope.authenticator5
                };

            } else if ($scope.setAutoPayFlag === true) {

                if ($scope.setLimitAmtFlag === true) {

                    var postData = {
                        'billerId': $scope.billerSelected.billerId,
                        'bllrTp': $scope.billerProvider.billerType,
                        'bllrNckNm': $scope.billerNickName,
                        'noOfAuthenticator': $scope.billerSelected.authenticatorCount,
                        'setAutoPay': 'true',
                        'Authenticator1': $scope.authenticator1,
                        'Authenticator2': $scope.authenticator2,
                        'Authenticator3': $scope.authenticator3,
                        'Authenticator4': $scope.authenticator4,
                        'Authenticator5': $scope.authenticator5,
                        'atPyLmt': 'Y',
                        'atPyLmtAmt': $scope.limitAmount,
                        'atPyCrdtCrd': 'N',
                        'atPyAcctNbr': $scope.billerpPaymentAccount,
                        'atPyStrtDt': $scope.fromDate.getTime(),
                        'atPyEndDt': $scope.todateFinaltimestamp,
                        'atPyFrq': $scope.frequency
                    };

                } else {

                    var postData = {
                        'billerId': $scope.billerSelected.billerId,
                        'bllrTp': $scope.billerProvider.billerType,
                        'bllrNckNm': $scope.billerNickName,
                        'noOfAuthenticator': $scope.billerSelected.authenticatorCount,
                        'setAutoPay': 'true',
                        'Authenticator1': $scope.authenticator1,
                        'Authenticator2': $scope.authenticator2,
                        'Authenticator3': $scope.authenticator3,
                        'Authenticator4': $scope.authenticator4,
                        'Authenticator5': $scope.authenticator5,
                        'atPyLmt': 'N',
                        'atPyLmtAmt': 'NA',
                        'atPyCrdtCrd': 'N',
                        'atPyAcctNbr': $scope.billerpPaymentAccount,
                        'atPyStrtDt': $scope.fromDate.getTime(),
                        'atPyEndDt': $scope.todateFinaltimestamp,
                        'atPyFrq': $scope.frequency

                    };

                }

            }
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: addBillerServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    console.log(data);

                    $scope.payBill = {
                        happened: true,
                        hideAddBiller: true,
                        msg: ''
                    };
                    if ($scope.setAutoPayFlag) {
                        $scope.payBill.msg = 'Congrats! Your Biller has been added and we will pay your bill automatically every month';
                    } else {
                        $scope.payBill.msg = 'Congrats! Your biller has been added';
                    }

                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data.cd) {
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(data);
                    if ($scope.globalerror) {
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                    } else {
                        $scope.addBillerError = {
                            happened: true,
                            msg: data.rsn
                        };
                    }

                }
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                //$scope.addAlert('cd', 'error', false);

            });
            $scope.showPayAnother = true;
        };

        $scope.goBack = function() {
            $scope.SuccessPage = false;
            // initialize();
            $scope.otpValue = '';
            $scope.controlPass = {
                otpValue: ''
            };
            $scope.OTPform.submitted = false;
            gadgets.pubsub.publish('launchpad.quickPay');

        };

        /* open manage Biller widget*/
        $scope.openManageBiller = function() {
            lpCoreBus.publish('launchpad-billPay.manage-biller');
        };

        /* */
        $scope.openAddBiller = function() {
            lpCoreBus.publish('launchpad-billPay.add-biller');
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

        $scope.getAcccountDetails = function() {
            $scope.flag1 = true;
            $scope.errorSpin = true;
            var urlacccount = lpWidget.getPreference('accountsDataSrc');
            urlacccount = lpCoreUtils.resolvePortalPlaceholders(urlacccount, {
                servicesPath: lpPortal.root
            });
            $http({
                method: 'GET',
                url: urlacccount,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers, config) {
                $scope.flag1 = false;
                $scope.errorSpin = false;

                if (($scope.flag1 == false) && ($scope.flag2 == false)) {
                    $scope.errorSpin = false;
                }

                $scope.acccountNumbers = data;

                if ($scope.acccountNumbers.length === 1) { 
                    $scope.selectedAccountNumber = $scope.acccountNumbers[0];
                }

            }).error(function(data, status, headers, config) {
                $scope.flag1 = false;
                $scope.alerts = [];
                $scope.errorSpin = false;

                if (($scope.flag1 == false) && ($scope.flag2 == false)) {
                    $scope.errorSpin = false;
                }
                if (data.cd) {
                    // If session timed out, redirect to login page
                    // checkTimeout(data);
                    // If service not available, set error flag
                    $scope.globalerror = idfcError.checkGlobalError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        };



        $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) +
            '/templates/partial';
        $scope.template = {
            billDetailPage: $scope.partialsDir + '/Billdetails.html',
            acceptTC: $scope.partialsDir + '/acceptTC.html',
            bill: $scope.partialsDir + '/SuccessAndAddBiller.html',
            tnc: $scope.partialsDir + '/acceptTC.html'
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

        initialize();

    }
    /**
     * Export Controllers
     */
    exports.QuickPaybillCtrl = QuickPaybillCtrl;
});