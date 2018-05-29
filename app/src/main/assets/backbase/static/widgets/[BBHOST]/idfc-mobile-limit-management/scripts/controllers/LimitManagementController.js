/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

    'use strict';
    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function LimitManagementController($scope, lpCoreUtils, lpWidget, $timeout, lpCoreBus, limitManagementService, lpPortal, httpService,
        IdfcUtils, IdfcError, LauncherDeckRefreshContent) {

        //*****************local variables****************//
        var limitMgmtCtrl = this;
        var ALERT_TIMEOUT, limit, limitData, customerMob, deckPanelOpenHandler;
        var getTransferLimitEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('limitDataSrc'), {
            servicesPath: lpPortal.root
        });

        var setTransferLimitEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('limitDataSrc'), {
            servicesPath: lpPortal.root
        });
        var generateOTPEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generateOTPService'), {
            servicesPath: lpPortal.root
        });

        ALERT_TIMEOUT = 3000;
        limit = '';
        limitData = {
            userId: '',
            limit: '',
            otpValue: ''
        };
        customerMob = '';

        //*****************local functions****************//
        var initialize = function() {
            console.log('limit Management initialize called');
            //getLimit();
            checkLoanAccount();
        }

        function checkLoanAccount() {

            var nonCasAccountData = localStorage.getItem('nonCasaAccount');
            console.log('nonCasAccountData: ', nonCasAccountData);
            if (nonCasAccountData != undefined || nonCasAccountData != null) {
                if (nonCasAccountData == 'true') {
                    lpCoreBus.publish('launchpad-retail.openLoanApplyNow');
                } else {
                    limitMgmtCtrl.loanAccount = false
                }
            } else {
                limitMgmtCtrl.loanAccount = false;
                getLimit();
            }
            limitMgmtCtrl.errorSpin = false;
        }

        // Fetch Transfer Limit from DB
        function getLimit() {

            limitMgmtCtrl.errorSpin = true;
            limitMgmtCtrl.limitFormFlag = true;
            limitMgmtCtrl.buttonFlag = true;
            limitMgmtCtrl.serviceError = false;
            limitMgmtCtrl.checkLimit = false;
            limitMgmtCtrl.lockFieldsOTP = false;
            limitMgmtCtrl.lockFields = false;
            limitMgmtCtrl.OTPFlag = true;
            limitMgmtCtrl.viewLimit = false;
            limitMgmtCtrl.otpValue = '';
            limitMgmtCtrl.bibUser = false;
            limitManagementService
                .setup({
                    getTransferLimitEndPoint: getTransferLimitEndPoint
                })
                .getTransferLimit()
                .success(function(data) {
                    console.log("In getTransferLimitEndPoint success");
                    console.log('Data: ', data);
                    limitMgmtCtrl.errorSpin = false;

                    /* if (data && data !== 'null') { */
                    if (IdfcUtils.hasContentData(data)) {
                        console.log("data.bibUser  -->" + data.bibUser);
                        console.log("data.trasferLimt --> " + data.trasferLimt);
                        if ((typeof  data.trasferLimt !== 'undefined') && (data.trasferLimt !== null))
                        {
                        limitMgmtCtrl.trasferLimt = parseInt(data.trasferLimt);
                        var maxLimitValue = numberWithCommas(data.trasferLimt);
                        console.log("maxLimitValue --> " + maxLimitValue);
                        }
                        limitMgmtCtrl.dailyLimitMessage = "The daily limit for Payments and Funds transfer cannot exceed " + maxLimitValue + " .";

                        if (null != data.bibUser && data.bibUser === "true")
                            limitMgmtCtrl.bibUser = true;

                        limit = data.limit;
                        setLimit();
                    }
                }).error(function(error) {
                    console.log('error: ', error);
                    limitMgmtCtrl.errorSpin = false;
                    if (error.cd) {
                        IdfcError.checkTimeout(error);
                        if ((error.cd === '501')) {
                            limitMgmtCtrl.serviceError = IdfcError.checkGlobalError(error);
                            alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                        } else if (error.cd === '701') {
                            alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            limitMgmtCtrl.lockFieldsOTP = true;

                        } else {
                            alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                        }
                    }

                    if (limitMgmtCtrl.serviceError === true) {
                        addAlert('cd', 'error', true);
                    } else {
                        addAlert('cd', 'error', false);
                    }


                });


        };

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };
        // Clear arr alert messages
        function clearAlerts() {
            limitMgmtCtrl.alerts = [];
        }


        limitMgmtCtrl.alerts = [];

        function addAlert(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: alert.messages[code]
            };
            clearAlerts();
            limitMgmtCtrl.alerts.push(customAlert);
            if (timeout === false) {
                $timeout(function() {
                    limitMgmtCtrl.closeAlert(limitMgmtCtrl.alerts.indexOf(customAlert));
                }, ALERT_TIMEOUT);
            }
        }



        // Remove specific alert
        function closeAlert(index) {
            limitMgmtCtrl.alerts.splice(index, 1);
        }

        function setLimit() {
            if (limit === -1) {
                limitMgmtCtrl.limitmanagement.limit = '';
            } else {
                limitMgmtCtrl.limitmanagement.limit = limit;
            }
        }

        // widget Refresh code
        //LauncherDeckRefreshContent.setup(lpCoreBus, initialize).listen(lpWidget);
        var deckPanelOpenHandler;
        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                initialize();
            }
        };
        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);

        //*****************scope variables****************//
        limitMgmtCtrl.alerts = [];
        limitMgmtCtrl.viewLimit = false;
        limitMgmtCtrl.error = {
            happened: false,
            msg: ''
        };
        // Model to bind the data
        limitMgmtCtrl.limitmanagement = {
            limit: ''

        };

        //*****************scope functions****************//


        //validate Limit changed by the user and Set transfer limit in DB
        limitMgmtCtrl.submitForm = function(otpForm) {
            var postData;
            limitMgmtCtrl.errorSpin = true;
            if (otpForm.submitted && otpForm.otp.$error.required) {
                limitMgmtCtrl.otpRequiredError = true;
            } else {
                limitMgmtCtrl.otpRequiredError = false;
            }

            if (otpForm.submitted && otpForm.otp.$error.minlength) {
                limitMgmtCtrl.otpMinLengthError = true;
            } else {
                limitMgmtCtrl.otpMinLengthError = false;
            }

            if (otpForm.submitted && otpForm.otp.$error.maxlength) {
                limitMgmtCtrl.otpMaxLengthError = true;
            } else {
                limitMgmtCtrl.otpMaxLengthError = false;
            }

            if (!otpForm.$valid) {
                limitMgmtCtrl.errorSpin = false;
            } else {

                limitData.limit = limitMgmtCtrl.limitmanagement.limit;
                limitData.otpValue = limitMgmtCtrl.otpValue;

                postData = $.param(limitData || {});

                limitManagementService
                    .setup({
                        setTransferLimitEndPoint: setTransferLimitEndPoint,
                        postData: postData,
                    })
                    .setTransferLimit().success(function(data) {
                        limitMgmtCtrl.errorSpin = false;
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: 'Daily Limit has been updated successfully!'
                        };
                        limitMgmtCtrl.OTPFlag = true;
                        limitMgmtCtrl.limitFormFlag = false;
                        limitMgmtCtrl.viewLimit = true;
                    }).error(function(error) {
                        limitMgmtCtrl.errorSpin = false;
                        if (error.cd) {
                            IdfcError.checkTimeout(error);
                            var OTPError = IdfcError.checkOTPError(error);
                            if (error.cd === '02' ||
                                error.cd === '04' ||
                                error.cd === '01' ||
                                error.cd === '03' ||
                                error.cd === '05' ||
                                error.cd === '09' ||
                                error.cd === '99') {
                                limitMgmtCtrl.success.happened = false;
                                limitMgmtCtrl.error = {
                                    happened: true,
                                    msg: error.rsn
                                };
                            } else if (OTPError === true) {
                                // limitMgmtCtrl.invalidOTPError=true;
                                limitMgmtCtrl.lockFieldsOTP = true;
                                limitMgmtCtrl.success.happened = false;
                                limitMgmtCtrl.error = {
                                    happened: true,
                                    msg: error.rsn
                                };
                            } else if ((error.cd === '501')) {
                                limitMgmtCtrl.serviceError = IdfcError.checkGlobalError(error);
                                // limitMgmtCtrl.success.happened=false;
                                alert = {
                                    messages: {
                                        cd: error.rsn
                                    }
                                };

                            } else if (error.cd === '701') {
                                alert = {
                                    messages: {
                                        cd: error.rsn
                                    }
                                };
                                limitMgmtCtrl.lockFieldsOTP = true;

                            } else {
                                alert = {
                                    messages: {
                                        cd: error.rsn
                                    }
                                };
                            }

                        }

                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: error.rsn
                        };
                    })
            }
        }
        $scope.$watch(
            'limitMgmtCtrl.limitmanagement.limit',
            function(value) {
                if ((limitMgmtCtrl.bibUser && value > limitMgmtCtrl.trasferLimt) || (!limitMgmtCtrl.bibUser && value > limitMgmtCtrl.trasferLimt)) {
                    limitMgmtCtrl.checkLimit = true;
                } else {
                    limitMgmtCtrl.checkLimit = false;
                    limitMgmtCtrl.limitRequiredError = false;
                }
            });

        // Check the limit is not more than maximum limit
        limitMgmtCtrl.check = function(limitForm) {

            var checklimit = false;

            if (limitForm.submitted && limitForm.limit.$error.required) {
                limitMgmtCtrl.limitRequiredError = true;
            } else {
                limitMgmtCtrl.limitRequiredError = false;
            }

            if (!limitForm.$valid) {

                checklimit = true;
            } else if ((limitMgmtCtrl.bibUser && limitMgmtCtrl.limitmanagement.limit > limitMgmtCtrl.trasferLimt) || (!limitMgmtCtrl.bibUser && limitMgmtCtrl.limitmanagement.limit > limitMgmtCtrl.trasferLimt)) {
                checklimit = true;
            } else {
                limitMgmtCtrl.errorSpin = false;
                //limitMgmtCtrl.generateOTP('send');
                limitMgmtCtrl.readSMS('send');

            }

            return checklimit;
        }

        // Clear the model data
        limitMgmtCtrl.clear = function() {

            limitMgmtCtrl.limitmanagement.limit = '';
            limitMgmtCtrl.checkLimit = false;
            limitMgmtCtrl.error.happened = false;
            limitMgmtCtrl.limitRequiredError = false;

        };

        // Method to cancel OTP
        limitMgmtCtrl.cancelOTP = function() {
            limitMgmtCtrl.limitFormFlag = true;
            limitMgmtCtrl.buttonFlag = true;
            limitMgmtCtrl.OTPFlag = true;
            limitMgmtCtrl.getLimit();
            limitMgmtCtrl.lockFields = false;
            limitMgmtCtrl.lockFieldsOTP = false;
            limitMgmtCtrl.otpValue = '';
        };

        // Method to go back to the main page
        limitMgmtCtrl.backToLimitForm = function() {
            limitMgmtCtrl.error.happened = false;
            limitMgmtCtrl.limitFormFlag = true;
            limitMgmtCtrl.lockFields = false;
            limitMgmtCtrl.buttonFlag = true;
            limitMgmtCtrl.viewLimit = false;
            limitMgmtCtrl.clearOTP();
        };

        // Method to clear OTP value entered by user
        limitMgmtCtrl.clearOTP = function() {
            limitMgmtCtrl.otpValue = '';
        };

        //Method to generate OTP for the Limit change request
        limitMgmtCtrl.generateOTP = function(value) {
            console.log('limitMgmtCtrl.generateOTP called:', value);
            var resendOTP, postData;
            limitMgmtCtrl.errorSpin = true;
            resendOTP = null;
            if (value === 'resend') {
                resendOTP = true;
            } else {
                resendOTP = false;
            }

            var postData = {
                'resendOTP': resendOTP
            };

            postData = $.param(postData || {});

            limitManagementService
                .setup({
                    generateOTPEndPoint: generateOTPEndPoint,
                    postData: postData,
                })
                .generateOTP()
                .success(
                    function(data) {
                        limitMgmtCtrl.errorSpin = false;
                        limitMgmtCtrl.success = {
                            happened: true,
                            msg: 'OTP has been successfully sent to your registered mobile number'
                        };
                        limitMgmtCtrl.error = {
                            happened: false,
                            msg: ''

                        };
                        limitMgmtCtrl.OTPFlag = false;
                        limitMgmtCtrl.buttonFlag = false;
                        limitMgmtCtrl.lockFields = true;
                        customerMob = data.mobileNumber;
                        limitMgmtCtrl.customerMobMasked = '******' + customerMob.substr(customerMob.length - 4);
                    })
                .error(
                    function(error,
                        status,
                        headers,
                        config) {
                        limitMgmtCtrl.errorSpin = false;
                        if (error.cd) {
                            IdfcError.checkTimeout(error);
                            if ((error.cd === '501')) {
                                limitMgmtCtrl.serviceError = IdfcError.checkGlobalError(error);
                                alert = {
                                    messages: {
                                        cd: error.rsn
                                    }
                                };
                            } else if (error.cd === '701') {
                                limitMgmtCtrl.success = {
                                    happened: false,
                                    msg: ''
                                };
                                limitMgmtCtrl.error = {
                                    happened: true,
                                    msg: error.rsn
                                };
                                limitMgmtCtrl.lockFieldsOTP = true;
                            } else {
                                alert = {
                                    messages: {
                                        cd: error.rsn
                                    }
                                };
                            }
                        }
                        limitMgmtCtrl.error = {
                            happened: true,
                            msg: error.rsn
                        };
                        limitMgmtCtrl.success = {
                            happened: false,
                            msg: ''
                        };
                    })
        }


        //SMS Reading -- Start
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            //console.log('Resend hit native');
            console.log('evt.resendOtpFlag:' + evt.resendOtpFlag);
            //Call function that is called on a click of "Resend OTP" button available on Widget
            limitMgmtCtrl.readSMS('resend');
        });

        limitMgmtCtrl.readSMS = function(resendFlag) {
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
                                data: "LimitMgmt"
                            });
                            //Step 2. Send request to "sendOTP service
                            console.log('Resend flag->' + resendFlag);
                            if (resendFlag === 'resend') {
                                limitMgmtCtrl.generateOTP(resendFlag);
                            } else {
                                limitMgmtCtrl.generateOTP(resendFlag);
                            }
                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("LimitMgmt", function(evt) {
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: ' + evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver", {
                                    data: "Stop Reading OTP"
                                });
                                //Step 3.1: To receive events if user has cliked on resend OTP
                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp' + receivedOtp);
                                limitMgmtCtrl.otpValue = receivedOtp;
                                $scope.$apply();
                                limitMgmtCtrl.submitAfterOpt();
                                console.log('OTP value :' + limitMgmtCtrl.otpValue);
                                angular.element('#verifyOTP-btn-forgot-password').triggerHandler('click');
                            });
                        } else {
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            console.log('Resend flag->' + resendFlag);
                            if (resendFlag === 'resend') {
                                limitMgmtCtrl.generateOTP(resendFlag);
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

        // After Reading otp go to submit
        limitMgmtCtrl.submitAfterOpt = function() {
            limitData.limit = limitMgmtCtrl.limitmanagement.limit;
            limitData.otpValue = limitMgmtCtrl.otpValue;

            var postData = $.param(limitData || {});

            limitManagementService
                .setup({
                    setTransferLimitEndPoint: setTransferLimitEndPoint,
                    postData: postData,
                })
                .setTransferLimit().success(function(data) {
                    limitMgmtCtrl.errorSpin = false;
                    limitMgmtCtrl.error = {
                        happened: true,
                        msg: 'Daily Limit has been updated successfully!'
                    };
                    limitMgmtCtrl.OTPFlag = true;
                    limitMgmtCtrl.limitFormFlag = false;
                    limitMgmtCtrl.viewLimit = true;
                }).error(function(error) {
                    limitMgmtCtrl.errorSpin = false;
                    if (error.cd) {
                        IdfcError.checkTimeout(error);
                        var OTPError = IdfcError.checkOTPError(error);
                        if (error.cd === '02' ||
                            error.cd === '04' ||
                            error.cd === '01' ||
                            error.cd === '03' ||
                            error.cd === '05' ||
                            error.cd === '09' ||
                            error.cd === '99') {
                            limitMgmtCtrl.success.happened = false;
                            limitMgmtCtrl.error = {
                                happened: true,
                                msg: error.rsn
                            };
                        } else if (OTPError === true) {
                            // limitMgmtCtrl.invalidOTPError=true;
                            limitMgmtCtrl.lockFieldsOTP = true;
                            limitMgmtCtrl.success.happened = false;
                            limitMgmtCtrl.error = {
                                happened: true,
                                msg: error.rsn
                            };
                        } else if ((error.cd === '501')) {
                            limitMgmtCtrl.serviceError = IdfcError.checkGlobalError(error);
                            // limitMgmtCtrl.success.happened=false;
                            alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };

                        } else if (error.cd === '701') {
                            alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            limitMgmtCtrl.lockFieldsOTP = true;

                        } else {
                            alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                        }

                    }

                    limitMgmtCtrl.error = {
                        happened: true,
                        msg: error.rsn
                    };
                })

        }

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });

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
    exports.LimitManagementController = LimitManagementController;
});