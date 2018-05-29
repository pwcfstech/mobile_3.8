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
    exports.MainCtrl = function($scope, $templateCache, lpAlerts, $http,
        $translate, $modal, $log, $timeout, lpPayments, lpAccounts,
        transferTypes, lpCoreBus, lpCoreUpdate, P2PService,
        reviewTransfersConfig, lpCoreUtils, lpWidget, httpService,
        sharedProperties) {

        var ctrl = this;
        var p2pTransferMade = false,
            bankTransferMade = false;
        //ifsc cpu-7076
        $scope.otp = {'removeorder_otp':''};

        ctrl.review = {};
        lpPayments = lpPayments.api();
        $templateCache.put('templates/verify-p2p-details.ng.html',
            '<div class="modal-header">' +
            '    <h2><i class="lp-icon lp-icon-xxl lp-icon-info-sign"></i> <span lp-i18n="Verify your contact details"></span></h2>' +
            '</div>' +
            '<form role="form" ng-submit="handleP2PVerification()">' +
            '    <div class="modal-body">' + '       <p>' +
            '           <span lp-i18n="We have sent a message containing a verification code to {{p2pUser.email}}."></span>' +
            '           <br />' +
            '           <span lp-i18n="Please check your email and enter the code"></span>' +
            '       </p>' +
            '       <p lp-i18n="The code will expire in 20 minutes"></p>' +
            '       <div ng-class="{\'has-error\': verify.validationError && verify.verificationCode.length > 0, \'has-feedback\': true, \'form-group\': true}">' +
            '           <label class="control-label"><strong lp-i18n="Verification Code:"></strong></label>' +
            '           <input type="input" ng-model="verify.verificationCode" class="form-control" tabindex="0" aria-label="Verification code" maxlength="4" placeholder="enter the 4 digits" />' +
            '       </div>' + '    </div>' +
            '    <div class="modal-footer text-right">' +
            '       <button name="closeModal" class="btn btn-link" ng-click="cancel()" type="button" lp-i18n="Cancel"></button>' +
            '       <button name="resendCode" class="btn btn-link" type="button" lp-i18n="Resend Code"></button>' +
            '       <button type="submit" class="btn btn-primary" ng-disabled="!verify.verificationCode" lp-i18n="Submit"></button>' +
            '    </div>' + '</form>');
        $templateCache.put('templates/authorize.ng.html',
            '<div class="modal-header">' + '    <h2>' +
            '        <i class="lp-icon lp-icon-xxl lp-icon-info-sign"></i>' +
            '        <span lp-i18n="Verify your payment(s)"></span>' +
            '    </h2>' + '</div>' +
            '<form role="form" ng-submit="authorize()">' +
            '    <div class="modal-body">' +
            '        <div ng-show="err.modalError">' +
            '            <div alert="alert" type="danger">{{ err.modalError | translate }}</div>' +
            '        </div>' +
            '        <p>Because your transaction to <b>{{currentOrder.counterpartyName}}</b> is over <span lp-amount="1000" lp-amount-currency="currentOrder.instructedCurrency" locale="locale"></span>(<i><span lp-amount="currentOrder.instructedAmount" lp-amount-currency="currentOrder.instructedCurrency" locale="locale"></span></i>), you need to verify it.</p>' +
            '        <div class="form-group has-feedback">' +
            '            <label class="control-label"><strong lp-i18n="Please enter authentication code:"></strong></label>' +
            '            <input type="password" ng-model="review.auth_password" class="form-control " placeholder="Password" />' +
            '        </div>' + '    </div>' +
            '    <div class="modal-footer text-right" >' +
            '        <button name="closeModal" class="btn btn-link" ng-click="cancel()" type="button" lp-i18n="Cancel"></button>' +
            '        <button type="submit" class="btn btn-primary" ng-disabled="!review.auth_password" lp-i18n="Verify"></button>' +
            '    </div>' + '</form>');
        $templateCache.put('templates/currency.not.same.html',
            '<div class="modal-header">' +
            '   <h2><i class="lp-icon lp-icon-xxl lp-icon-info-sign"></i> <span lp-i18n="Total amount"></span></h2>' +
            '</div>' + '<form role="form">' +
            '    <div class="modal-body">' +
            '       <p lp-i18n="Please note that in case of multi-currency usage the transfers cannot be calculated.' +
            '       Total amount is shown only for the same currency."></p>' +
            '   </div>' +
            '   <div class="modal-footer text-right" >' +
            '       <button class="btn btn-primary" ng-click="cancel()" type="button" lp-i18n="Ok"></button>' +
            '   </div>' + '</form>');
        ctrl.decodePhotoUrl = function(photo) {
            return profile.getDefaultProfileImage(photo, 70, 70);
        };
        $scope.credentialType = '';
        $scope.update = false;
        var initialize = function() {
            //Session Management Call
            idfcError.validateSession($http);



            // test();
            ctrl.hideFooter = lpCoreUtils.parseBoolean(lpWidget
                .getPreference('hideFooter'));
            ctrl.alerts = lpAlerts;
            ctrl.accountsModel = lpAccounts;
            ctrl.ordersModel = lpPayments;
            ctrl.ordersModel.pendingOrdersGroups = [];
            $scope.loadedSI = false;
            updateModel()['finally'](function() {
                gadgets.pubsub.unsubscribe(
                    'launchpad-retail.paymentOrderInitiated',
                    updateModel);
            });
            $scope.details = {
                desc: '',
                startDate: '',
                endDate: '',
                beneName: '',
                beneId: '',
                accountId: '',
                instructedAmount: '',
                intervals: '',
                frequency: '',
                creationDate: '',
                counterpartyIban: '',
                toAcctComnt: '',
                instructedCurrency: '',
                instructedCurrency2: '',
                sys1: '',
                id: '',
                chaseDay: '',
                action: '',
                priority: '',
                purpose: '',
                hldReqdYN: '',
                paymntTyp: '',
                fnlPmt: '',
                intrnRefNum: '',
                usrId: '',
                cal: '',
                uniqRefNum: '',
                counterpartySirName: '',
                counterpartyName: '',
                andOrInstBsbNo: '',
                pmtNum: '',
                msgTyp: '',
                opertnMode: '',
                ifscCode: '',
                rmtTyp: ''
            };
            $scope.buttonSuccess = false;
            $scope.generateOTPServiceEndPoint = lpWidget.getPreference(
                'generateOTPService');
            $scope.OTPFlag = true;
            $scope.showOtp = false;
            $scope.errorOTP = '';
            $scope.payOrderGrp = '';
            $scope.payOrd = '';
            $scope.otpValue;
            $scope.customerMob = '';
            $scope.customerMobMasked = '';
            $scope.lockFields = false;
            $scope.showButton = true;
            $scope.hideSubmit = false;
            gadgets.pubsub.publish("transferNow-loaded");
        };
        gadgets.pubsub.subscribe("native.back", function(evt) {
            if (localStorage.getItem("origin") == "addressBook") {
                gadgets.pubsub.publish("launchpad-retail.goToAddPayee");
            }
            $scope.cancelOTPForm();
            localStorage.clear();
            $scope.$apply();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if (localStorage.getItem("navigationFlag")) {
                if (localStorage.getItem("origin") == "addressBook") {
                    gadgets.pubsub.publish("launchpad-retail.goToAddPayee");
                }
                $scope.cancelOTPForm();
                localStorage.clear();
                $scope.$apply();
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });
        $scope.cancelOTPForm = function() {
            $scope.showOtp = false;
            //$scope.remove.order.otp = '';
            $('#otp_number').val("");
            $('#errorotpdiv').empty();
        }

        $scope.emiAccountChk = [];

        var updateModel = function() {
            ctrl.loading = true;
            return lpAccounts.load().then(function(accounts) {
                $scope.emiAccountChk = accounts;
                var identifiers = accounts.map(function(
                    account) {
                    return account.id;
                });
                getBeneList();
                $scope.xyz = lpPayments.load1().then(
                    function(response) {
                        $scope.loadedSI = true;
                        console.log(JSON.stringify(
                            response));
                        ctrl.loading = false;
                    })['catch'](function(error) {
                    console.log(error);
                    ctrl.loading = false;
                    $scope.loadedSI = true;
                    if (error.data.cd) {
                        idfcError.checkTimeout(
                            error.data);
                        $scope.serviceError =
                            idfcError.checkGlobalError(
                                error.data);
                        $scope.error = {
                            happened: true,
                            msg: error.data
                                .rsn
                        };
                    }
                });
            });
        };
        var getBeneList = function() {
            ctrl.loading = true;
            var self = this;
            var xhr = httpService.getInstance({
                endpoint: lpWidget.getPreference(
                    'beneFiciaryList'),
                urlVars: {
                    cnvId: 'FT'
                }
            }).read();
            xhr.success(function(data) {
                //                ctrl.loading = false;
                if (data && data !== 'null') {
                    $scope.beneList = data;
                }
            });
            xhr.error(function(data) {
                //                ctrl.loading = false;
                idfcError.checkTimeout(data);
                $scope.serviceError = idfcError.checkGlobalError(
                    data);
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
        $scope.editOrder = function(order) {
            //          $scope.makePayment();
            $scope.removeTransaction = {
                happened: false,
                msg: ""
            };
            $scope.error = {
                happened: false,
                msg: ""
            };

            ctrl.alerts.close();
            ctrl.loading = true;
            getReviewFundTransferDetails(order);
        };
        var getBeneName = function(order) {
            for (var i = 0, len = $scope.beneList.length; i <
                len; i++) {
                if ($scope.beneList[i].account === order.accountDetails) {
                    $scope.details.beneName = $scope.beneList[i]
                        .name;
                    $scope.details.beneId = $scope.beneList[i].id;
                    break;
                }
            }
        };
        var getReviewFundTransferDetails = function(order) {

            var self = this;
            var xhrservice = httpService.getInstance({
                    endpoint: lpWidget.getPreference('promptDetailsDataSourcePoint'),

                    urlVars: {
                        accountId: order.accountId,
                        id: order.id
                    }
                }),
                data = {};

            var xhr = xhrservice.create({
                data: order
            });
            xhr.success(function(data) {
                ctrl.loading = false;
                $scope.makePayment();
                $scope.error = {
                    happened: false,
                    msg: ''
                };
                if (data && data !== 'null') {

                    $scope.details.desc = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.paymentDescription;
                    $scope.details.startDate = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.startDate;
                    $scope.details.endDate = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.endDate;
                    $scope.details.accountId = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.accountId;
                    $scope.details.instructedAmount = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.instructedAmount;
                    $scope.details.intervals = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.intervals;
                    $scope.details.frequency = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.frequency;
                    $scope.details.creationDate = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.creationDate;
                    $scope.details.counterpartyIban = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.counterpartyIban;
                    $scope.details.toAcctComnt = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.toAcctComnt;
                    $scope.details.instructedCurrency = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.instructedCurrency;
                    $scope.details.instructedCurrency2 = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.instructedCurrency2;
                    $scope.details.sys1 = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.sys1;
                    $scope.details.id = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.id;
                    $scope.details.chaseDay = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.chaseDay;
                    $scope.details.action = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.action;
                    $scope.details.priority = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.priority;
                    $scope.details.purpose = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.purpose;
                    $scope.details.hldReqdYN = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.hldReqdYN;
                    $scope.details.paymntTyp = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.paymntTyp;
                    $scope.details.fnlPmt = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.fnlPmt;
                    $scope.details.intrnRefNum = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.intrnRefNum;
                    $scope.details.usrId = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.usrId;
                    $scope.details.cal = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.cal;
                    $scope.details.uniqRefNum = data.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.uniqRefNum;
                    $scope.details.counterpartySirName = data.promptAmendStandingInstructionRes.msgBdy.counterpartySirName;
                    $scope.details.counterpartyName = data.promptAmendStandingInstructionRes.msgBdy.counterpartyName;
                    $scope.details.andOrInstBsbNo = data.promptAmendStandingInstructionRes.msgBdy.andOrInstBsbNo;
                    $scope.details.pmtNum = data.promptAmendStandingInstructionRes.msgBdy.pmtNum;
                    $scope.details.msgTyp = data.promptAmendStandingInstructionRes.msgBdy.msgTyp;
                    $scope.details.opertnMode = data.promptAmendStandingInstructionRes.msgBdy.opertnMode;
                    $scope.details.ifscCode = data.promptAmendStandingInstructionRes.msgBdy.ifscCode;
                    $scope.details.rmtTyp = data.promptAmendStandingInstructionRes.msgBdy.rmtTyp;

                    var transferForm = ctrl.ordersModel.makeFormObject(order, $scope.details);
                    localStorage.clear();
                    localStorage.setItem("navigationFlag", true);
                    localStorage.setItem("navigationData", JSON.stringify(transferForm));
                    localStorage.setItem("origin", "addViewBeneficiary");
                    gadgets.pubsub.publish("transfer-loaded");

                }
            });
            xhr.error(function(data) {
                ctrl.loading = false;
                idfcError.checkTimeout(data);
                $scope.serviceError = idfcError.checkGlobalError(data);
                //self.createError = data.errors[0].code;
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };


            });
            //console.log("xhr : "+xhr.promptAmendStandingInstructionRes.msgBdy.promptStdInstrRes.creationDate);


        };
        $scope.makePayment = function() {
            ctrl.alerts.close();
            gadgets.pubsub.publish("transfer-loaded");
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
                //TODO: Add error handler
            });
        };
        // Submit all pending payments
        $scope.submitPayments = function(isFormValid, action) {
            //alert("1111222");
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
        if (ctrl.hideFooter) {
            lpCoreBus.subscribe('payments:submit', function() {
                ctrl.submitPayments(ctrl.ordersModel.pendingOrdersGroups);
            });
        }
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
            $scope.otpValue = "";
            $scope.hideQuesFlag = true;
            $scope.hideCombineFlag = true;
            $scope.globalerror = false;
            if ($scope.update) {
                lpCoreBus.publish(
                    "launchpad-retail.closeActivePanel");
            } else {
                lpCoreBus.publish(
                    "launchpad-retail.closeActivePanel");
            }
        };
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
            //alert("call openModal..");
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
                                data: "ReviewFutureTransfers"
                            });

                            //Step 2. Send request to "sendOTP service
                            console.log('Resend flag->' + resendFlag);
                            //$scope.generateOTP(resendFlag);
                            if ('resend' === resendFlag) {
                                $scope.generateOTP(resendFlag);
                            }


                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("ReviewFutureTransfers", function(evt) {
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
                                //ifsc cpu-7076
                                $scope.otp.removeorder_otp = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :' + $scope.otp.removeorder_otp);
                                angular.element('#verifyOTP-btn-review-future-transfers').triggerHandler('click');



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


        $scope.generateOTP = function(resend) {
            var resendOTP = resend;
            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference("generateOTPService")
            );
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
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
                //alert("in otp success..");
                $scope.showOtp = true;
                $scope.customerMob = data.mobileNumber;
                console.log("got mobile number from generateotp:",$scope.customerMob);
                $scope.customerMobMasked = '******' +
                    $scope.customerMob.substr($scope.customerMob
                        .length - 4);
                $scope.success = {
                    happened: true,
                    msg: 'OTP has been successfully sent to your registered mobile number',
                    customerMobMasked: $scope.customerMobMasked
                };
                $scope.error = {
                    happened: false,
                    msg: ''
                };
                $scope.OTPFlag = false;
                $scope.lockFields = true;
            }).error(function(data, status, headers, config) {
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    idfcError.checkTimeout(data);
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                     if (data.cd == "701") {
                            console.log("Inside 701");
                            $scope.resendDisabled = true;
                            $scope.lockFieldsOTP = false;
                              $scope.error =
                              {
                               happened: true,
                               msg: 'We have tried 5 times to send you a code.'
                              };

                        }
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        }
        $scope.removeOrder = function(group, order) {
           if(order.siInd!='N') return;
            $scope.removeTransaction = {
                happened: false,
                msg: ""
            };
            $('#otp_number').val('');

            $scope.payOrderGrp = group;
            $scope.payOrd = order;
            //3.5 change
            /*var fromAccount = order.accountId;
            console.log("fromAccount in removeOrder -->" + fromAccount);

            var toAccount = order.counterpartyIban;
            toAccount = parseInt(toAccount, 10);
            console.log("toAccount in removeOrder-->" + toAccount);

            var instructedAmount = order.instructedAmount
            console.log("instructedAmount in removeOrder-->" + instructedAmount);

            var toAccountFlag = false;
            var accountPosition;

            for (var i = 0; i < $scope.emiAccountChk.length; i++) {
                if (toAccount == $scope.emiAccountChk[i].id) {
                    toAccountFlag = true;
                    accountPosition = i;
                    break;
                }
            }

            console.log("toAccountFlag in removeOrder ---> " + toAccountFlag);

            console.log("$scope.emiAccountChk in removeOrder ---> " + $scope.emiAccountChk);

            if (toAccountFlag && $scope.emiAccountChk[accountPosition].emiAmount != null && $scope.emiAccountChk[accountPosition].emiAmount != '' &&
                $scope.emiAccountChk[accountPosition].emiAmount != '0' && $scope.emiAccountChk[accountPosition].emiAmount == instructedAmount) {

                console.log("inside if check in removeOrder");
                $scope.showErr = "don'tEdit";
            } else {
                $scope.showErr = "";
                console.log("Edit allowed in removeOrder");
            }

            if ($scope.showErr != '') {
                console.log(" emi Amout error in removeOrder");
                $scope.error = {
                    happened: true,
                    msg: 'Sorry. You can not modify or delete this standing instruction since it is linked to your OD deposit.'
                };
                $scope.remove.success = {
                    happened: false,
                    msg: " "
                };
            } else if ((order.counterpartyName == null || order.counterpartyName == '') && $scope.emiAccountChk[accountPosition] === undefined) {
                console.log("bene name null..");
                $scope.error = {
                    happened: true,
                    msg: 'Sorry. You can not modify or delete this standing instruction since it is linked to your recurring deposit.'
                };
                $scope.remove.success = {
                    happened: false,
                    msg: " "
                };
            } else {*/ // 3.5 end
                $scope.generateOTP();//called first to get customer's mobile number
                $scope.showOtp = true;
                console.log("mob num after generateotp before readsms :", $scope.customerMob);
                /*$scope.customerMobMasked = '******' +
                    $scope.customerMob.substr($scope.customerMob
                        .length - 4);
                $scope.success = {
                    happened: true,
                    msg: 'OTP has been successfully sent to your registered mobile number',
                    customerMobMasked: $scope.customerMobMasked
                };
                $scope.error = {
                    happened: false,
                    msg: ''
                };*/
                $scope.OTPFlag = false;
                $scope.lockFields = true;
                $scope.readSMS('');
            //}

        };
        $scope.remove = function(isFormValid) {
            $scope.submitFlag = true;
            if (!isFormValid) {
                return false;
            }
           // $('#otp_number').val("");
            $('#errorotpdiv').empty();
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_HOME"
            });

            var deleteService = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference(
                    "paymentOrdersSubmitPoint"));
            var service = httpService.getInstance({
                    endpoint: deleteService
                }),
                data = {};
            data.orderId = $scope.payOrd.id;
           //ifsc cpu-7076
           // data.otp = $scope.removeorder_otp;
            data.otp = $scope.otp.removeorder_otp;
            data.counterpartyIban = $scope.payOrd.counterpartyIban;
            data.accountId = $scope.payOrd.accountId;
            data.transferMode = $scope.payOrd.transferMode;
            var xhr = service.create({
                data: data
            });
            xhr.success(function(data) {
                if (data && data !== 'null') {
                    var orderIndex = $scope.payOrderGrp
                        .paymentOrders.indexOf($scope.payOrd);
                    $scope.payOrderGrp.paymentOrders.splice(
                        orderIndex, 1);
                    if ($scope.payOrderGrp.paymentOrders
                        .length === 0) {
                        var groupIndex = ctrl.ordersModel
                            .pendingOrdersGroups.indexOf(
                                $scope.payOrderGrp);
                        ctrl.ordersModel.pendingOrdersGroups
                            .splice(groupIndex, 1);
                    }
                    $scope.showOtp = false;
                    $('#otp_number').val("");
                    $scope.removeTransaction = {
                        happened: true,
                        msg: "Successfully deleted your future transaction.!"
                    };
                }
            });
            xhr.error(function(data, status) {
                if (status == 0) {
                    gadgets.pubsub.publish(
                        "no.internet");
                } else {
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(
                        data);
                    $scope.success.happened = false;
                    $scope.errorOTP = {
                        happened: true,
                        msg: data.rsn
                    };
                }
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
        if (localStorage.getItem("navigationFlag")) {
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });
        }
        // $timeout(function(){
        //     gadgets.pubsub.publish('cxp.item.loaded', {
        //         id: widget.id
        //     });
        // }, 10);
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