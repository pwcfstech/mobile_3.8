define(function(require, exports) {
    'use strict';

    function applyScope($scope) {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
    var _ = require('base').utils;
    var profile = require('./profile-image');
    var idfcError = require('idfcerror');
    var idfcConstants = require('idfccommon').idfcConstants;
    exports.MainCtrl = function($scope, $templateCache, lpAlerts,
        $translate, $modal, $log, $timeout, lpPayments, lpAccounts,
        transferTypes, lpCoreBus, lpCoreUpdate, P2PService,
        reviewTransfersConfig, lpCoreUtils, lpWidget, $http, FundTransferServices, CQService, transReceiptModule) { //FundTransferServices 3.1 changes added

        var ctrl = this;
        var p2pTransferMade = false,
            bankTransferMade = false;
        ctrl.review = {};
        lpPayments = lpPayments.api();
        ctrl.decodePhotoUrl = function(photo) {
            return profile.getDefaultProfileImage(photo, 50, 50);
        };
        $scope.credentialType = '';
        $scope.update = false;

        /* CPU-6908 done during IFSC Search implementation phase start */
        $scope.showduplicatebeneerror = false;
        /* CPU-6908 done during IFSC Search implementation phase end */
        //tanking 1
        var checkTransferModeTiming = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('checkTransferModeTimingNew')); //3.1 change
        var fundTransService = FundTransferServices.setup({
            //tanking 2
            tankingEndPoint: checkTransferModeTiming //3.1 change
        });

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
        		    ctrl.loading = false;
                    $scope.showMailSuccess = true;
                    $scope.mailSuccessMsg = args;
                });
                $scope.$on('mailSentError', function(event, args) {
                        		self.errorSpin = false;
                        		ctrl.loading = false;
                        		$scope.showMailError = true;
                        		$scope.mailSuccessMsg = args;
                                });
                $scope.$on('mailSentFinally', function(event, args) {
                                self.errorSpin = false;
                                ctrl.loading = false;
                                $scope.showMailError = true;
                                $scope.mailSuccessMsg = args;
                                });
        		//mailSent - Ends Here

        var initialize = function() {
            //Session Management Call
            idfcError.validateSession($http);

            /* CPU-6908 done during IFSC Search implementation phase start */
            $scope.showduplicatebeneerror = false;
            /* CPU-6908 done during IFSC Search implementation phase end */

            ctrl.hideFooter = lpCoreUtils.parseBoolean(lpWidget
                .getPreference('hideFooter'));
            ctrl.alerts = lpAlerts;
            ctrl.accountsModel = lpAccounts;
            ctrl.ordersModel = lpPayments;
            ctrl.ordersModel.pendingOrdersGroups = [];
            updateModel()['finally'](function() {
                gadgets.pubsub.unsubscribe(
                    'launchpad-retail.paymentOrderInitiated',
                    updateModel);
                gadgets.pubsub.subscribe(
                    'launchpad-retail.paymentOrderInitiated',
                    updateModel);
            });
            $scope.buttonSuccess = false;
            $scope.generateOTPServiceEndPoint = lpWidget.getPreference(
                'generateOTPService');
            $scope.OTPFlag = true;
            ctrl.otpValue = '';
            $scope.customerMob = '';
            $scope.customerMobMasked = '';
            $scope.lockFields = false;
            $scope.showButton = true;
            $scope.hideSubmit = false;
            /*tanking changes*/
            // $scope.NEFTAvailable=true;
            //$scope.isForceIMPS = false;
            /*changes done*/
            /*commented above 2 line for tanking adding new */
            //tanking 3 //3.1 change started
            $scope.isForceImps = false;
            $scope.tankingNeeded = false;
            $scope.tankingValue = "noTanking";
            $scope.limitIMPS = false;
            /*$scope.success.tranx = {
                happened: true,
                msg: ''
            };*/
            /*if ($scope.ftData.instructedAmount >= IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                $scope.limitIMPS = true;
            } */ //3.1 change end tanking

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
            localStorage.clear();
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "reviewTransfer");
            gadgets.pubsub.publish("transfer-loaded");
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });
            localStorage.clear();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if (localStorage.getItem("navigationFlag")) {
                localStorage.clear();
                localStorage.setItem("navigationFlag", true);
                localStorage.setItem("origin", "reviewTransfer");
                gadgets.pubsub.publish("transfer-loaded");
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
                localStorage.clear();
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });


        var updateModel = function() {
            ctrl.loading = true;
            return lpAccounts.load().then(function(accounts) {
                var identifiers = accounts.map(function(
                    account) {
                    return account.id;
                });
                ctrl.loading = false;
                ctrl.p2pPaymentOrders = ctrl.p2pPaymentOrders || [];
            });
        };
        ctrl.pendingOrdersTotals = function() {
            var groups = ctrl.ordersModel.pendingOrdersGroups;
            var amount = 0;
            var count = 0;
            var currency;
            if (!groups || !groups.length) {
                return false;
            }
            currency = groups[0].paymentOrders[0].instructedCurrency;
            for (var i = 0, len = groups.length; i < len; i++) {
                for (var j = 0; j < groups[i].paymentOrders.length; j++) {
                    amount += groups[i].paymentOrders[j].instructedAmount;
                    if (currency && currency !== groups[i].paymentOrders[
                            j].instructedCurrency) {
                        currency = false;
                    }
                    count++;
                }
            }
            return {
                count: count,
                amount: amount,
                currency: currency
            };
        };
        var refreshTransactionWidgets = function() {
            if (bankTransferMade) {
                gadgets.pubsub.publish(
                    'launchpad-retail.transactions.newTransferSubmitted'
                );
            }
            if (p2pTransferMade) {
                gadgets.pubsub.publish(
                    'launchpad-retail.p2pTransactions.newTransferSubmitted'
                );
            }
            bankTransferMade = false;
            p2pTransferMade = false;
        };
        ctrl.changeLanguage = function(key) {
            $translate.use(key);
        };
        $scope.editOrder = function() {
            $scope.err = {
                happened: false,
                msg: ""
            };
            $scope.error = {
                happened: false,
                msg: ""
            };
            $scope.hideSubmit = false;
            ctrl.makePayment();
            gadgets.pubsub.publish("transactions-loaded");
            gadgets.pubsub.publish("lpMoneyTransfer.update");
        };
        ctrl.makePayment = function() {
            ctrl.alerts.close();
            gadgets.pubsub.publish(
                'launchpad-retail.requestMoneyTransfer');
        };
        var setdeviceprint = function() {
            return encode_deviceprint();
        };
        ctrl.verifyP2PDetails = function(order) {
            var modalInstance = $modal.open({
                template: $templateCache.get(
                    'templates/verify-p2p-details.ng.html'
                ),
                controller: 'VerificationCtrl',
                resolve: {
                    currentOrder: function() {
                        return order;
                    },
                    P2PUser: function() {
                        return ctrl.p2pUser;
                    }
                }
            });
            modalInstance.result.then(function(success) {
                ctrl.loading = false;
                order.verificationFailure = !success;
                if (success === true) {
                    ctrl.p2pUser.emailVerified = true;
                    ctrl.submitPayment(order);
                }
            }, function(error) {
                ctrl.loading = false;
            });
        };
        $scope.submitPayments = function(isFormValid, action) {
            if (!isFormValid) {
                return false;
            }
            var pendingOrders = [];
            _.forEach(ctrl.ordersModel.pendingOrdersGroups,
                function(group) {
                    pendingOrders = pendingOrders.concat(
                        group.paymentOrders);
                });
            ctrl.pendingOrders = pendingOrders;
            processOrdersSeq(action);
        };
        var processOrdersSeq = function(action) {
            if (ctrl.pendingOrders.length === 0 && ctrl.p2pPaymentOrders
                .length === 0) {
                ctrl.loading = false;
                refreshTransactionWidgets();
                return;
            }
            var order = ctrl.pendingOrders.pop();
            if (order) {
                order = $scope.ftData;
                ctrl.submitPayment(order, action);
            } else {
                ctrl.p2pPaymentOrders = [];
                ctrl.p2pVerificationFailed = false;
            }
        };
        var openModal = function(order, action) {
            ctrl.review.modalError = false;
            ctrl.review.authorization = '';
            $scope.authorizePayment(action);
            $scope.currentOrder = order;
        };
        $scope.authorizePayment = function(action) {

            $scope.selectedOrder.otpValue = ctrl.otpValue;
            $scope.selectedOrder.credentialType = action;
            var orders = $scope.selectedOrder;
            if (orders) {
                var xhr;
                if (orders.update) {
                    if (orders.transferMode == idfcConstants.FFT_EXT) {
                        xhr = $scope.fundTransferToEsbAmend(
                            orders, orders.id, action);
                    } else if (orders.transferMode ==
                        idfcConstants.FFT_IFT) {
                        xhr = $scope.fundTransferToEsbIFTAmend(
                            orders, orders.id, action);
                    }
                } else {
                    xhr = $scope.fundTransferToEsb(orders,
                        orders.id, action);
                }
            }
        };
        if (ctrl.hideFooter) {
            gadgets.pubsub.subscribe('payments:submit', function() {
                ctrl.submitPayments(ctrl.ordersModel.pendingOrdersGroups);
            });
        }
        $scope.fundTransferToEsbIFTAmend = function(orders, orderId,
            action) {
            ctrl.loading = true;
            $scope.err = {
                happened: false,
                msg: ''
            };
            $scope.error = {
                happened: false,
                msg: ''
            };
            orders.beneId = $scope.beneUniqueId;
            orders.nickName = $scope.nickName;
            var orderForm = $.param(orders);
            var ftSubmitUrl = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference(
                    "updateIFTFutureFundTransferPoint"));
            var request = $http({
                method: "POST",
                url: ftSubmitUrl,
                data: orderForm,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;',
                }
            }).success(function(data1, status, headers,
                config) {
                ctrl.loading = false;
                $scope.hideQuesFlag = true;
                $scope.hideCombineFlag = true;
                $scope.hideOTPFlag = true;
                $scope.buttonSuccess = true;
                $scope.showButton = false;
                if (data1.sts === idfcConstants.FFT_OK) {
                    $scope.success.tranx = {
                        happened: true,
                        msg: idfcConstants.FFT_UPDT_MSG
                    };
                }
                $("#trbd").hide();
                $scope.ordersSubmitted = true;
                ctrl.loading = false;
                refreshTransactionWidgets();
                ordersModel.pendingOrdersGroups = '';
                gadgets.pubsub.publish(
                    "launchpad-retail.refreshAccountSummary"
                );
                return data1;
            }).error(function(data1, status, headers,
                config) {
                ctrl.loading = false;
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    idfcError.checkTimeout(data1);
                    $scope.globalerror = idfcError.checkGlobalError(
                        data1);
                    $scope.err = {
                        happened: true,
                        msg: data1.rsn
                    };
                    $scope.success.tranx = {
                        happened: false,
                        msg: ''
                    };
                    if (data1.cd == "00" || data1.cd ==
                        "01" || data1.cd == "02" ||
                        data1.cd == "03" || data1.cd ==
                        "04" || data1.cd == "05" ||
                        data1.cd == "06" || data1.cd ==
                        "07" || data1.cd == "09" ||
                        data1.cd == "10" || data1.cd ==
                        "99") {
                        $scope.err = {
                            happened: false,
                            msg: ''
                        };
                        $scope.error = {
                            happened: true,
                            msg: data1.rsn
                        };
                        $scope.showButton = false;
                        $scope.hideOTPFlag = false;
                    } else if (data1.cd == "08") {
                        $scope.err = {
                            happened: false,
                            msg: ''
                        };
                        $scope.lockFieldsOTP = true;
                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data1.rsn
                        };
                        $scope.showButton = false;
                        $scope.hideOTPFlag = false;
                    } else {
                        $scope.showButton = false;
                        $scope.buttonError = true;
                        $scope.hideQuesFlag = true;
                        $scope.hideCombineFlag = true;
                        $scope.hideOTPFlag = true;
                    }
                    $scope.ordersSubmitted = true;
                    $log.error("Error: Order " + order.id +
                        " didn't succeed.");
                    ctrl.alerts.push('alerts.FAILURE',
                        'danger');
                    ctrl.loading = false;
                    if (data1.errors) {
                        ctrl.loading = false;
                    }
                    return data1;
                }
            });
        };
        $scope.fundTransferToEsbAmend = function(orders, orderId,
            action) {
            ctrl.loading = true;
            $scope.err = {
                happened: false,
                msg: ''
            };
            $scope.error = {
                happened: false,
                msg: ''
            };
            orders.beneId = $scope.beneUniqueId;
            orders.nickName = $scope.nickName;
            var orderForm = $.param(orders);
            var ftSubmitUrl = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference(
                    "updateFutureFundTransferPoint"));
            var request = $http({
                method: "POST",
                url: ftSubmitUrl,
                data: orderForm,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;',
                }
            }).success(function(data1, status, headers,
                config) {
                ctrl.loading = false;
                $scope.hideQuesFlag = true;
                $scope.hideCombineFlag = true;
                $scope.hideOTPFlag = true;
                $scope.buttonSuccess = true;
                $scope.showButton = false;
                if (data1.sts === idfcConstants.FFT_OK) {
                    $scope.success.tranx = {
                        happened: true,
                        msg: idfcConstants.FFT_UPDT_MSG
                    };
                }
                $("#trbd").hide();
                $scope.ordersSubmitted = true;
                ctrl.loading = false;
                refreshTransactionWidgets();
                ordersModel.pendingOrdersGroups = '';
                gadgets.pubsub.publish(
                    "launchpad-retail.refreshAccountSummary"
                );
                return data1;
            }).error(function(data1, status, headers,
                config) {
                ctrl.loading = false;
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    idfcError.checkTimeout(data1);
                    $scope.globalerror = idfcError.checkGlobalError(
                        data1);
                    $scope.err = {
                        happened: true,
                        msg: data1.rsn
                    };
                    $scope.success.tranx = {
                        happened: false,
                        msg: ''
                    };
                    if (data1.cd == "00" || data1.cd ==
                        "01" || data1.cd == "02" ||
                        data1.cd == "03" || data1.cd ==
                        "04" || data1.cd == "05" ||
                        data1.cd == "06" || data1.cd ==
                        "07" || data1.cd == "09" ||
                        data1.cd == "10" || data1.cd ==
                        "99") {
                        $scope.err = {
                            happened: false,
                            msg: ''
                        };
                        $scope.error = {
                            happened: true,
                            msg: data1.rsn
                        };
                        $scope.showButton = false;
                        $scope.hideOTPFlag = false;
                    } else if (data1.cd == "08") {
                        $scope.err = {
                            happened: false,
                            msg: ''
                        };
                        $scope.lockFieldsOTP = true;
                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data1.rsn
                        };
                        $scope.showButton = false;
                        $scope.hideOTPFlag = false;
                    } else {
                        $scope.showButton = false;
                        $scope.buttonError = true;
                        $scope.hideQuesFlag = true;
                        $scope.hideCombineFlag = true;
                        $scope.hideOTPFlag = true;
                    }
                    $scope.ordersSubmitted = true;
                    $log.error("Error: Order " + order.id +
                        " didn't succeed.");
                    ctrl.alerts.push('alerts.FAILURE',
                        'danger');
                    ctrl.loading = false;
                    if (data1.errors) {
                        ctrl.loading = false;
                    }
                    return data1;
                }
            });
        };
        $scope.goBack = function() {
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
            if ((typeof $scope.challengeQuesAnswers !=
                    'undefined') && ($scope.challengeQuesAnswers !=
                    null)) {
                for (var i = 0; i < $scope.challengeQuesAnswers
                    .length; i++) {
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
            localStorage.clear();
            gadgets.pubsub.publish("transfer-loaded");
        };
        $scope.fundTransferToEsb = function(orders, orderId, action) {
            $scope.errMsg = false;
            console.log("Funds TransferTo ESB call");
            /* tanking changes*/
            /* if($scope.isForceIMPS)
                		{
                		//alert("force IMPS is true so send NEFT request as IMPS");
                		orders.txnMode ="IMPS";

                		}
                		orders.isForceIMPS =$scope.isForceIMPS;

                		if(!$scope.NEFTAvailable &&  !$scope.isForceIMPS)
                		{
                		$scope.implementTanking = true;
                		}
                		//alert("$scope.implementTanking before FT"+$scope.implementTanking);
                		orders.implementTanking=$scope.implementTanking;
                		/*tanking changes done --- */
            //tanking 4 start 3.1 change
            if ($scope.isForceImps) {
                orders.txnMode = "IMPS";
            }
            console.log("ctrl.tankingNeeded ---> " + $scope.tankingNeeded);
            console.log("ctrl.isForceImps here " + $scope.isForceImps);
            if ($scope.tankingNeeded && !$scope.isForceImps) {
                console.log("In if");
                orders.implementTanking = true;
            } else {
                console.log("In else");
                orders.implementTanking = false;
            }
            orders.tankingValue = $scope.tankingValue;
orders.beneId = $scope.beneUniqueId;
orders.nickName = $scope.nickName;
            //tanking 4 end
            ctrl.loading = true;
            $scope.err = {
                happened: false,
                msg: ''
            };
            $scope.error = {
                happened: false,
                msg: ''
            };
            var orderForm = $.param(orders);
            var ftSubmitUrl = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference(
                    "paymentOrdersSubmitPoint"));
            var request = $http({
                method: "POST",
                url: ftSubmitUrl,
                data: orderForm,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;',
                }
            }).success(function(data1, status, headers,
                config) {
                //undefined response handling in success
                if (typeof data1.txnId != 'undefined') {
                    $scope.errMsg = false;
                    ctrl.loading = false;
                    $scope.buttonError = false;
                    $scope.hideQuesFlag = true;
                    $scope.hideCombineFlag = true;
                    $scope.hideOTPFlag = true;
                    $scope.buttonSuccess = true;
                    $scope.showButton = false;

                    /* CPU-6908 done during IFSC Search implementation phase start */
                    var duplicatebeneappendedmsg = '';
                    if (data1.txnId.indexOf(',') > -1) {
                        var txnidappended = [];
                        txnidappended = data1.txnId.split(",");
                        data1.txnId = txnidappended[0];
                        duplicatebeneappendedmsg = txnidappended[1];
                        if ('DuplicateBeneErr' === duplicatebeneappendedmsg) {
                            $scope.showduplicatebeneerror = true;
                        }
                    }
                    /* CPU-6908 done during IFSC Search implementation phase end*/

                    $scope.success.tranx = {
                    							happened: true,
                    							msg: 'Congratulations! Your transaction is successful.'
                    						};
//                    $scope.success.tranx = {
//                        happened: true,
//                        msg1: 'Congratulations! Your transaction is successful.',
//                        msg2: " ",
//                        msg3: " "
//                    };
                    $("#trbd").hide();
                    $scope.ordersSubmitted = true;
                    ctrl.loading = false;
                    refreshTransactionWidgets();
                    gadgets.pubsub.publish(
                        "launchpad-retail.refreshAccountSummary"
                    );
                    self.errorSpin = true;
                    var transactionID = $scope.isEmptyVal(data1.txnId) ? ($scope.isEmptyVal($scope.successItems.transactionId)?"-":$scope.successItems.transactionId) : data1.txnId;

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
                        self.errorSpin = false;
                        console.log(response.content.createdAt);

    // Transaction Receipt start
                        $scope.successItems = {};
                        $scope.successItems = {
                            "successMessage": $scope.success.tranx.msg1,
                            "transactionId": transactionID,
                            "fromAccount": $scope.isEmptyVal(orders.accountId) ? "-" : orders.accountId,
                            "beneficiaryNickName": $scope.isEmptyVal(orders.nickName) ? "NA" : orders.nickName,
                            "toAccountNumber": $scope.isEmptyVal(orders.counterpartyAccount) ? "-" : orders.counterpartyAccount,
                            "amount": $scope.isEmptyVal(orders.instructedAmount) ? "NA" : orders.instructedAmount,
                            "paymentMode": $scope.isEmptyVal(orders.txnMode) ? "NA" : orders.txnMode,
                            "remarks": $scope.isEmptyVal(orders.paymentDescription) ? "-" : orders.paymentDescription,
                            "timeAndDateOfFundTransfer": response.content.createdAt,
                            "startSiDate": $scope.isEmptyVal(orders.scheduledTransfer.frequency) ? "-" : $scope.formatDate(new Date(orders.scheduledTransfer.startDate), false),
                            "frequency": $scope.isEmptyVal(orders.scheduledTransfer.frequency) ? "-" : orders.scheduledTransfer.frequency,
                            "numberOfInstallments": $scope.isEmptyVal(orders.scheduledTransfer.intervals) ? "" : orders.scheduledTransfer.intervals,
                            "endSiDate": $scope.isEmptyVal(orders.scheduledTransfer.frequency) ? "-" : $scope.formatDate(new Date(orders.scheduledTransfer.endDate), false),
                            "timeAndDateOfInitiatingSi": response.content.createdAt
                        };

                        var transactionType = ($scope.successItems.frequency=="-") ? "fundTransfer" : "fundTransferSI";

                        $scope.items = [{ item: 'Transaction ID', value: $scope.successItems.transactionId, display: true }, { item: 'From A/C Number', value: $scope.successItems.fromAccount, display: true }, { item: 'Beneficiary Nick Name', value: $scope.successItems.beneficiaryNickName, display: true }, { item: 'To A/C Number', value: $scope.successItems.toAccountNumber, display: true }, { item: 'Amount', value: $scope.successItems.amount, display: true, currency: true }, { item: 'Payment Mode', value: $scope.successItems.paymentMode, display: true }, { item: 'Start SI Date', value: $scope.successItems.startSiDate, display: ($scope.successItems.frequency=="-") ? false : true }, { item: 'Frequency', value: $scope.successItems.frequency, display: ($scope.successItems.frequency=="-") ? false : true }, { item: 'Number of Instalments', value: $scope.successItems.numberOfInstallments, display: ($scope.successItems.frequency=="-" || $scope.successItems.numberOfInstallments == "") ? false : true }, { item: 'End SI Date', value: $scope.successItems.endSiDate, display: ($scope.successItems.frequency=="-") ? false : true }, { item: 'Remarks', value: $scope.successItems.remarks, display: true }, { item: 'Date and Time', value: $scope.successItems.timeAndDateOfFundTransfer, display: ($scope.successItems.frequency=="-") ? true : false }, { item: 'Date of Initiating SI', value: $scope.successItems.timeAndDateOfInitiatingSi, display: ($scope.successItems.frequency=="-") ? false : true }];
                        $scope.actions = [{ button: "Email", className: "mailButton", transType: transactionType, receiptType: 'email' }];
                        $scope.buttons = [{ name: "Make Another Transfer", className: "btn btn-primary primary-btn-btn ng-binding", param: 'transferAgain', style:"height:35px !important; width:100% !important;" }, { name: "Done", className: "btn secondary-btn-btn secondary-btn-ft btn-align review-button", param: 'accountSummary', style:"height:35px !important; width:100% !important;" }];
                        // Transaction Receipt End
                    return data1;
                    })
                    request.error(function(error) {
                    console.log("Date txn Date & Time:", error);
                        self.errorSpin = false;
                    });

                } else {
                    $scope.success.tranx = {
                        happened: true,
                        msg1: "Transaction fail ! Please try again ",
                        msg2: " ",
                        msg3: " "
                    };
                    //$scope.txnIdNotReceived =true;
                }
            }).error(function(data1, status, headers,
                config) {
                console.log("data1.rsn xdffd  --->" + data1.rsn);
                ctrl.loading = false;
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    idfcError.checkTimeout(data1);
                    //undefined response handling
                    if (data1.cd === undefined || data1.rsn === undefined) {
                        $scope.errMsg = true;
                    }
                    if (data1.cd === null) {
                        data1.cd = "501";
                        data1.rsn = "Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while."
                    }
                    $scope.globalerror = idfcError.checkGlobalError(
                        data1);
                    if ($scope.globalerror) {
                        $scope.buttonError = true;
                    }
                    $scope.err = {
                        happened: true,
                        msg: data1.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                    if (data1.cd == "FT007") {
                        $scope.showButton = true;
                        $scope.hideSubmit = true;
                        $scope.hideOTPFlag = true;
                        $scope.otpValue = "";
                        $scope.hideQuesFlag = true;
                        $scope.hideCombineFlag = true;
                    } else if (data1.cd == "2821") {
                        $scope.showButton = true;
                        $scope.hideSubmit = true;
                        $scope.hideOTPFlag = true;
                        $scope.otpValue = "";
                        $scope.hideQuesFlag = true;
                        $scope.hideCombineFlag = true;
                    } else if (data1.cd == "00" ||
                        data1.cd == "01" || data1.cd ==
                        "02" || data1.cd == "03" ||
                        data1.cd == "04" || data1.cd ==
                        "05" || data1.cd == "06" ||
                        data1.cd == "07" || data1.cd ==
                        "09" || data1.cd == "10" ||
                        data1.cd == "99") {
                        $scope.err = {
                            happened: false,
                            msg: ''
                        };
                        $scope.error = {
                            happened: true,
                            msg: data1.rsn
                        };
                        $scope.showButton = false;
                        $scope.hideOTPFlag = false;
                    } else if (data1.cd == "08") {
                        $scope.err = {
                            happened: false,
                            msg: ''
                        };
                        $scope.lockFieldsOTP = true;
                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data1.rsn
                        };
                        $scope.showButton = false;
                        $scope.hideOTPFlag = false;
                    } else {
                        $scope.showButton = false;
                        $scope.buttonError = true;
                        $scope.hideOTPFlag = true;
                    }
                    $scope.ordersSubmitted = true;
                    ctrl.loading = false;
                    if (data1.errors) {
                        ctrl.loading = false;
                    }
                    return data1;
                }
            });
        };
$scope.goToEmailMod = function() {
            localStorage.clear();
            localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","Profile");
            localStorage.setItem("target","ReviewTransfer");
            localStorage.setItem("navigationData","Email Modification");
            gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
        }
        /**
                 * Transaction Receipt
                 * FormatDate and transReceipt method
                 * @desc Method to format Date and to carry out Download, Print and Email the Advice to user.
                **/
                $scope.formatDate = function(dt, dateTime) {
                    if (dateTime){
                        return dt.toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });
                    } else{
                        return dt.toLocaleString("en-IN", {day: '2-digit', month: 'short', year: 'numeric' });
                    }
                }
                $scope.transReceiptModule = new transReceiptModule();

                $scope.transReceipt = function(receiptType, transType) {
                    ctrl.loading = true;
                    $scope.showMailSuccess = false;
                    // $scope.transReceiptModule.transReceipt(receiptType, transType, $scope.successItems); //commented to pass blank data to generate the receipt on back-end
        			$scope.transReceiptModule.transReceipt(receiptType, transType, {});
                };
                /* Transaction Receipt -Ends here */

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
        		/* Transaction Receipt - isEmptyVal method Ends here */

        		/**
                 * Transaction Receipt
                 * successAction method
                 * @desc Method to conditionally route the user to Account Summary page or do another transaction
                 **/
        		    $scope.successAction = function(actionType) {
                    if (actionType == "transferAgain") {
                        $scope.goBack();
                    } else {
                       gadgets.pubsub.publish("launchpad-retail.backToDashboard");
                    }
                }
        		/* Transaction Receipt - successAction method Ends here */

        ctrl.submitPayment = function(order, action, authorization) {
            if (order.verificationFailure) {
                processOrdersSeq();
                return;
            }
            var groups = ctrl.ordersModel.pendingOrdersGroups,
                group = null;
            for (var i = 0, n = groups.length; i < n; i++) {
                if (groups[i]['@id'] === order.accountId) {
                    group = groups[i];
                    break;
                }
            }
            if (!group) {
                $log.error('Error: Order ' + order.id +
                    ' does not belong to any group.');
                return;
            }
            $scope.selectedOrder = order;
            $scope.selectedOrder.otpValue = $scope.otpValue;
            openModal(order, action);
        };
        $scope.cancelOTP = function() {
            $scope.hideOTPFlag = true;
            $scope.showButton = true;
            $scope.hideSubmit = false;
        };
        $scope.clearOTP = function() {
            $scope.otpValue = "";
        };
        // Handle error scenarios for error-out fund transfer request. //3.1 handle errors functin added
        function handleErrors(errorResp) {
            idfcError.checkTimeout(errorResp);
            $scope.globalerror = idfcError.checkGlobalError(errorResp);
            $scope.err = getMessage(errorResp);
            $scope.success.tranx = transactionError;
            if (errorResp.cd === '00' || errorResp.cd === '01' || errorResp.cd === '02' || errorResp.cd === '03' || errorResp.cd === '04' || errorResp.cd === '05' || errorResp.cd === '06' || errorResp.cd === '07' || errorResp.cd === '09' || errorResp.cd === '10' || errorResp.cd === '99') {
                $scope.err = transactionError;
                $scope.error = getMessage(errorResp);
                $scope.showButton = false;
                $scope.hideOTPFlag = false;
                $scope.lockFieldsOTP = false;
            } else if (errorResp.cd === '08') {
                $scope.err = transactionError;
                $scope.lockFieldsOTP = true;
                $scope.success.happened = false;
                $scope.error = getMessage(errorResp);
                $scope.showButton = false;
                $scope.hideOTPFlag = false;
            } else {
                $scope.lockFieldsOTP = false;
                $scope.showButton = false;
                $scope.buttonError = true;
                $scope.hideQuesFlag = true;
                $scope.hideCombineFlag = true;
                $scope.hideOTPFlag = true;
            }
        }

        //Tanking 5 start 3.1 change
        function checkForTanking(txnMode) {
            console.log("In checkForTanking --> " + txnMode);
            //var txnModeTanking = $.param(txnMode);

            var tankingData = {};
            tankingData.txnMode = txnMode;

            var tankingDataForm = $.param(tankingData);
            fundTransService.checkForTanking(tankingDataForm).success(
                function(data) {
                    console.log("In success of checkForTanking 123" + JSON.stringify(data));
                    console.log("data[0] --->" + data[0]);
                    console.log("data[1] --->" + data[1]);
                    $scope.tankingValue = data[1];
                    if (data[0] == 'true') {
                        console.log("In tankingNeeded true");
                        $scope.tankingNeeded = true;
                        //ctrl.txnMode="NEFT";
                    } else {
                        console.log("In tankingNeeded false");
                        $scope.tankingNeeded = false;
                    }
                    console.log("ctrl.tankingNeeded Final --->" + $scope.tankingNeeded);

                }).error(function(errorResp) {
                console.log("In error of checkForTanking");
                $scope.loading = false;
                handleErrors(errorResp);
                return errorResp;
            });


        }



        //Tanking 5 end

        //SMS Reading -- Start

        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            console.log(evt.resendOtpFlag);
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
                                data: "FundTransfer"
                            });

                            // logic changed after rsa implementation
                            //Step 2. resend otp if resendFlag is set
                            console.log('Resend flag->' + resendFlag);
                            if (resendFlag === 'resend') {
                                $scope.generateOTP(resendFlag);
                            }


                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("FundTransfer", function(evt) {
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
                                ctrl.otpValue = receivedOtp;
                                $scope.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :' + $scope.otpValue);
                                angular.element('#verifyOTP-btn-review-transfer').triggerHandler('click');
                                //angular.element('#myselector').trigger('click');


                            });
                        } else {
                            // logic changed after rsa implementation
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            /*if (resendFlag === 'resend') {
                                $scope.generateOTP(resendFlag);
                            } else {
                                //$scope.enableDisableOTPorQuestion();
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



        <!--- Enable disable OTP or Question-->
        $scope.enableDisableOTPorQuestion = function(forceIMPS) { //forceIMPS param added 3.1 change
            ctrl.loading = true;
            //tanking 6 start 3.1 change
            console.log("forceIMPS ---> " + forceIMPS);

            if (forceIMPS == 'true') {
                console.log("forceIMPS is true");
                $scope.isForceImps = true;
                $scope.ftData.txnMode = "IMPS";
                $scope.txnMode = "IMPS";
                $scope.tankingValue = "";
            } else {
                console.log("forceIMPS is false" + $scope.tankingNeeded);
                if ($scope.tankingNeeded == true) {
                    $scope.ftData.txnMode = "NEFT";
                }
                $scope.isForceImps = false;
            }
            //tanking 6 end
            $scope.lockFieldsOTP = false;
            $scope.err = {
                happened: false,
                msg: ''
            };
            $scope.error = {
                happened: false,
                msg: ''
            };
            $scope.errors = {};
            $scope.alerts = [];
            $scope.buttonError = false;
            var xhr;
            var res;
            var challengeQuestions = [];
            var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference("rsaAnalyzeService")
            );
            $scope.postData = {
                'customerId': $scope.customerId,
                'mobileNumber': $scope.customerMob,
                'resendOTP': false,
                'accountNumber': $scope.ftData.accountDetails,
                'paymentMode': $scope.ftData.paymentMode,
                'instructedAmount': $scope.ftData.instructedAmount,
                'txnMode': $scope.ftData.txnMode,
                'ifscCode': $scope.ftData.ifscCode
            };
            $scope.postData.transaction = 'fundTransfer';
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
                ctrl.loading = false;
                $scope.credentialType = data.credentialType;
                // data.mandatoryOTP=true;

                // RSA changes by Xebia starts
                if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT') {
                    ctrl.loading = false;
                    $scope.showDenyMessage = true;
                    $scope.showButton = false;
                } else if (data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED') {
                    $scope.showSetupCQMessage = true;
                    ctrl.loading = false;
                    $scope.showButton = false;
                } else if (data.actionStatus === 'ALLOW' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                    ctrl.loading = true;
                    $scope.generateOTP("generate");
                    //Auto read SMS
                    $scope.transactionType = 'updateLimitOTP';
                    $scope.readSMS($scope.transactionType);
                } else if (data.actionStatus === 'CHALLENGE' && (data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED')) {
                    var postdata = {};
                    $scope.showCQError = CQService.CHALLENGE_MESSAGE;
                    $scope.challengeQuestionCounter++;
                    $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                    $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                    $scope.hideQuesFlag = false;
                    $scope.showButton = false;
                    $scope.showQuestionDiv = true;
                    $scope.hideOTPFlag = true;
                    $scope.hideCombineFlag = true;
                }
                // RSA changes by Xebia ends

            });
            res.error(function(data, status) {
                ctrl.loading = false;
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(
                        data);
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
                }
            });
        };

        // showSetupCQ function by Xebia
        $scope.showSetupCQ = function() {
            gadgets.pubsub.publish('openCQ');
        }

        // cancel Transfer function by Xebia
        $scope.cancelTransfer = function() {
            gadgets.pubsub.publish("launchpad-retail.backToDashboard")
        }

        // verify challenge question answer function by Xebia
        $scope.verifyCQAnswer = function() {
            ctrl.loading = true;
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
                    ctrl.loading = true;
                    $scope.hideQuesFlag = true;
                    $scope.showQuestionDiv = false;
                    $scope.showWrongAnswerMessage = false;
                    $scope.generateOTP("generate");
                    //Auto read SMS
                    $scope.transactionType = 'updateLimitOTP';
                    $scope.readSMS($scope.transactionType);
                } else {
                    if ($scope.challengeQuestionCounter <= 2) {
                        ctrl.loading = false;
                        $scope.showCQError = CQService.WRONG_CQ_ANSWER;
                        $scope.showWrongAnswerMessage = true;
                        $scope.showQuestionDiv = false;
                    } else {
                        ctrl.loading = false;
                        $scope.showQuestionDiv = false;
                        $scope.showCQError = CQService.CQ_ANSWER_ATTEMPT_EXCEED;
                    }
                }


            })
            xhr.error(function(errorResp, status) {
                ctrl.loading = false;
                if (status == 0) {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    idfcError.checkTimeout(errorResp);
                    $scope.globalerror = idfcError.checkGlobalError(
                        errorResp);
                    if ($scope.globalerror) {
                        $scope.err = {
                            happened: true,
                            msg: errorResp.rsn
                        };
                        $scope.buttonError = true;
                    }
                    $scope.error = {
                        happened: true,
                        msg: errorResp.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });

        }

        // fetch challenge question function by Xebia
        $scope.fetchCQ = function() {
            ctrl.loading = true;
            $scope.challengeQuestion.answer = "";
            $scope.showCQError = "";
            var postdata = {};

            var xhr = CQService.challengeRSA(getChallengeQuestionUrl, postdata);

            xhr.success(function(response) {
                $scope.showWrongAnswerMessage = false;
                $scope.challengeQuestionCounter++;
                $scope.challengeQuestionsId = response.challengeQuestionList[0].questionId;
                $scope.challengeQuestions = response.challengeQuestionList[0].questionText;
                ctrl.loading = false;
                $scope.hideQuesFlag = false;
                $scope.showQuestionDiv = true;
                $scope.showButton = false;
                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;
            })

            xhr.error(function(errorResp, status) {
                ctrl.loading = false;
                if (status == 0) {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    idfcError.checkTimeout(errorResp);
                    $scope.globalerror = idfcError.checkGlobalError(
                        errorResp);
                    if ($scope.globalerror) {
                        $scope.err = {
                            happened: true,
                            msg: errorResp.rsn
                        };
                        $scope.buttonError = true;
                    }
                    $scope.error = {
                        happened: true,
                        msg: errorResp.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        }


        $scope.generateOTP = function(value) {
            if ($scope.ftData.flag == false) {
                var resendOTP = null;
                var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                    lpWidget.getPreference(
                        "generateOTPService"));
                if (value == 'resend') {
                    resendOTP = true;
                } else {
                    resendOTP = false;
                }
                var postData = {
                    'resendOTP': resendOTP
                };
                postData = $.param(postData || {});
                var xhr = $http({
                    method: "POST",
                    url: generateOTPServiceURL,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
                xhr.success(function(data) {
                    ctrl.loading = false;
                    $scope.hideOTPFlag = false;
                    $scope.showButton = false;
                    $scope.success = {
                        happened: true,
                        msg: idfcConstants.OTP_SUCCESS_MESSAGE
                    };
                    $scope.error = {
                        happened: false,
                        msg: ''
                    };
                    $scope.lockFields = true;
                    $scope.customerMob = data.mobileNumber;
                    if ((typeof $scope.customerMob !=
                            'undefined') && ($scope.customerMob !=
                            null)) $scope.customerMobMasked =
                        '******' + $scope.customerMob.substr(
                            $scope.customerMob.length -
                            4);
                }).error(function(data, status, headers,
                    config) {
                    //added for 5 times otp close popup
                    gadgets.pubsub.publish("stopReceiver", {
                        data: "Stop Reading OTP"
                    });
                    if (status == 0) {
                        gadgets.pubsub.publish(
                            "no.internet");
                    } else {
                        idfcError.checkTimeout(data);
                        $scope.globalerror = idfcError.checkGlobalError(
                            data);
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
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    }
                });
            } else {
                $scope.submitPayments();
            }
        }
        ctrl.removeOrder = function(group, order) {
            var modalInstance = $modal.open({
                template: $templateCache.get(
                    'templates/remove-confirmation.ng.html'
                ),
                controller: 'RemoveConfirmationCtrl',
                resolve: {
                    paymentOrder: function() {
                        return order;
                    }
                }
            });
            modalInstance.result.then(function(response) {
                var orderIndex = group.paymentOrders.indexOf(
                    order);
                group.paymentOrders.splice(orderIndex,
                    1);
                if (group.paymentOrders.length === 0) {
                    var groupIndex = ctrl.ordersModel.pendingOrdersGroups
                        .indexOf(group);
                    ctrl.ordersModel.pendingOrdersGroups
                        .splice(groupIndex, 1);
                }
            }, function(err) {
                console.log(err);
            });
        };
        ctrl.authorize = function(order) {
            var modalInstance = $modal.open({
                template: $templateCache.get(
                    'templates/authorize.ng.html'),
                controller: 'AuthenticationCtrl',
                // size: size,
                resolve: {
                    currentOrder: function() {
                        return order;
                    },
                    modalError: function() {
                        return ctrl.review.modalError;
                    }
                }
            });
            modalInstance.result.then(function(authorization) {
                ctrl.loading = false;
                ctrl.authorizePayment(action);
            }, function() {
                ctrl.loading = false;
            });
        };
        ctrl.sameCurrency = function() {
            ctrl.loading = true;
            var modalInstance = $modal.open({
                template: $templateCache.get(
                    'templates/currency.not.same.html'
                ),
                controller: 'SameCurrencyCtrl'
            });
            modalInstance.result.then(function() {
                ctrl.loading = false;
            }, function() {
                ctrl.loading = false;
            });
        };
        initialize();
        // $timeout(function(){
        //         gadgets.pubsub.publish('cxp.item.loaded', {
        //             id: widget.id
        //         });
        //     }, 10);
        /*tanking changes*/
        if (localStorage.getItem("navigationFlag")) {
            console.log("localStorage.getItem navigation flag is true");
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });
            var e = JSON.parse(localStorage.getItem("navigationData"));

            $scope.err = {
                happened: false,
                msg: ''
            };
            $scope.error = {
                happened: false,
                msg: ''
            };
            $scope.success = {
                happened: false,
                msg: ''
            };
            $("#trbd").show();
            $scope.showButton = true;
            $scope.hideSubmit = false;
            $scope.buttonSuccess = false;
            $scope.hideOTPFlag = true;
            //$scope.otpValue = "";
            $scope.hideQuesFlag = true;
            $scope.hideCombineFlag = true;
            $scope.globalerror = false;
            //to do later to uncomment
            $scope.ftData = e.ftData;
            $scope.scopePO = e.scopePO; //3.1 bene Change
            $scope.beneUniqueId = $scope.scopePO.uniqueBenId; //3.1 bene change
            $scope.nickName = $scope.scopePO.nickName;

            $scope.update = $scope.ftData.update;
            $scope.txnMode = $scope.ftData.txnMode;
            $scope.paymentMode = $scope.ftData.paymentMode;
            $scope.tankingDate = $scope.ftData.tankingDate;
            //Tanking 6 start  3.1 change
            if ($scope.ftData.instructedAmount >= idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                $scope.limitIMPS = true;
            } ///3.1 change end tanking
            console.log("tankingDate in ReviewTransferController --> " + $scope.tankingDate);
            console.log("new Date() in ReviewTransferController --> " + new Date());
            $scope.tankingDateVal = new Date($scope.tankingDate); //3.1 change
            // console.log("tankingDate.getTime() --> " + $scope.tankingDate.getTime());
            //console.log("new Date().getTime() --> " + new Date().getTime());
            var txnCheck = false;
            if ($scope.txnMode === "NEFT" || $scope.txnMode === "RTGS") {
                txnCheck = true
            }
            if ((txnCheck && $scope.paymentMode == "NON_RECURRING") ||
                (txnCheck && $scope.paymentMode == "RECURRING" && !(($scope.tankingDateVal).getTime() > new Date().getTime()))) {
                console.log("Transaction mode is NEFT/RTGS for today's date hence make a back end call to check timing");
                checkForTanking($scope.txnMode);
            }
            //Tanking 6 end
            // $scope.implementTanking=false;
            $timeout(function() {
                lpPayments.load(false, $scope.ftData);
                if (!$scope.ftData.paymentDescription == '') {
                    $scope.descShow = true;
                } else {
                    $scope.descShow = false;
                }
                /*tanking old closed*/
                /*  if(($scope.txnMode === "NEFT" && $scope.paymentMode == "NON_RECURRING") ||($scope.txnMode === "NEFT" && $scope.paymentMode == "RECURRING" && !($scope.tankingDate > new Date()) ))
                                                                        {
                                                                          console.log("NEFTAvailable inside if condition :Transaction mode is NEFT for today's date hence make a backend call to check timing");
                                                                          //alert("Transaction mode is NEFT for today's date hence make a backend call to check timing");
                                                                          // var urlTranfer = lpWidget.getPreference('checkTransferModeTiming');
                                                                          var urlTranfer =  lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference("checkTransferModeTiming"));
                                                                           //alert("urlTranfer sdgfds"+urlTranfer);
                                                                            var postData = {
                                                                            'txnMode': $scope.txnMode
                                                                              };
                                                                              postData = $.param(postData);
                                                                               var request = $http({
                                                                                    				method: "POST",
                                                                                    				url: urlTranfer,
                                                                                    				data: postData,
                                                                                    				headers: {
                                                                                    				'Accept': 'application/json',
                                                                                    				'Content-Type': 'application/x-www-form-urlencoded;'
                                                                                 }
                                                                                });


                                                                                request.success(function (data) {
                                                                                console.log("NEFTAvailable is false in success of webservice");
                                                                              	//Megha hardcoded
                                                                                $scope.NEFTAvailable = false;
                                                                           	   }).error(function(data) {
                                                                                  console.log("NEFTAvailable is false in failure of webservice");
                                                                                });
                                                                        } */
                /*else
                                                            {*/
                if ($scope.ftData.paymentMode == 'RECURRING') {
                    $scope.recurShow = true;
                    $scope.nonrecurShow = false;
                } else {
                    $scope.recurShow = false;
                    $scope.nonrecurShow = true;
                }

                /* $scope.txnMode = $scope.ftData
                     .txnMode;
                 $scope.paymentMode = $scope
                     .ftData.paymentMode;*/
                $scope.oneTimeSchd = $scope
                    .ftData.oneTimeSchd;

                if ($scope.ftData.paymentMode == 'RECURRING' && !$scope.oneTimeSchd) {
                    $scope.paymentMode = 'Recurring Transfer';
                } else if ($scope.ftData.paymentMode == 'NON_RECURRING') {
                    $scope.paymentMode = 'One Time Transfer';
                } else if ($scope.ftData.paymentMode == 'RECURRING' && $scope.oneTimeSchd) {
                    $scope.paymentMode = 'One Time Transfer';
                    $scope.recurShow = false;
                }
                /* }*/
            });
        }
    };
    exports.RemoveConfirmationCtrl = function($scope, $timeout,
        $modalInstance, paymentOrder, lpPayments) {
        $scope.error = {
            isError: false,
            message: ''
        };
        $scope.paymentOrder = paymentOrder;
        lpPayments = lpPayments.api();
        $scope.remove = function() {
            var delPromise = lpPayments.remove($scope.paymentOrder
                .id);
            delPromise.then(function(res) {
                $modalInstance.close(res);
            }, function(error) {
                // show error
                $scope.error.isError = true;
                $scope.error.message = error.statusText;
                $timeout(function() {
                    $scope.error.isError =
                        false;
                }, 4000);
            });
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
    exports.AuthenticationCtrl = function($scope, $modalInstance,
        currentOrder, modalError) {
        $scope.err = {
            modalError: modalError
        };
        $scope.review = {
            'auth_password': ''
        };
        $scope.currentOrder = currentOrder;
        $scope.authorize = function() {
            $modalInstance.close($scope.review);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
    exports.VerificationCtrl = function($scope, $modalInstance,
        currentOrder, P2PUser, P2PService) {
        $scope.verify = {};
        $scope.currentOrder = currentOrder;
        $scope.p2pUser = P2PUser;
        $scope.handleP2PVerification = function() {
            P2PService.verifyCode($scope.p2pUser.email, $scope.verify
                .verificationCode).then(function(response) {
                if (response.status === 200) {
                    $modalInstance.close(true);
                }
            }, function(response) {
                if (response.status === 400) {
                    $modalInstance.close(false);
                }
            });
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
    exports.SameCurrencyCtrl = function($scope, $modalInstance) {
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
});