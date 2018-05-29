/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    /*(change is switch)Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it*/
    var uiSwitch = require('uiSwitch');
    var angularTouch = require('angular-touch');
    // password encrypt changes
    var enciphering = require('./support/production/angular-rsa-encrypt');
    var readKey = require('./support/rsaKeySetup/rsaKeySetup');

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function loginController($scope, $http, $anchorScroll, LoginService, lpCoreUtils, lpWidget, lpPortal, lpCoreBus, $timeout, $document, CQService) {
        $scope.errorSpin = false;
        localStorage.clear();
        var userData;
        var globalVariablePlugin
        /*production issue i.e. When user is on login screen and clicks on MPIN setup toggle
          (user has already done MPIN setup), for a fraction of second, NEW button is visible */
        $scope.mpinFlag = true;
        $scope.notificationToken = '';
        $scope.showCaptcha = false; //captcha 3.5
        $scope.lastCaptchaLogin = false; //captcha 3.5
        var rsaLoginFailNotifyEndpoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('rsaLoginFailNotify'));
        var profileChkEndpoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('profileChkEndpointUrl'));
        var lockSMSEndpoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('lockSMSurl'));
        // RSA changes by Xebia start
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getCQUrl'));
        var verifyRsaLoginURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('verifyRSALoginService'));
        var sessValidateServiceEndpoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('sessionValidateService'));
        $scope.challengeQuestion = {};
        $scope.challengeQuestionCounter = 0;
        $scope.showUserNamePassword = true;
        $scope.showWrongAnswerMessage = false;
        setXsrfTokenWithResponse(LoginService
        		   .setup({
        			   sessValidateServiceEndpoint: sessValidateServiceEndpoint
        		   }).getSessionValidateService());


        // to fetch mobile specific data
        /* gadgets.pubsub.publish("getMobileSdkData");
         gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
           $scope.mobileSdkData = response.data;
         });*/

        var globalPreferences = cxp.mobile.plugins['GlobalVariables'];
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
        var loginEndpoint = lpPortal.root + '/j_spring_security_check';
        //Yushae PwC added for redirect
        gadgets.pubsub.subscribe('getBackToLoginScreen');
        //Yushae PwC
        $scope.goToForgotPassword = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('launchpad-retail.goToForgotPassword');
            }, 500);

        };

        $scope.goToForgotUsername = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('launchpad-retail.goToForgotUsername');
            }, 500);
        };

        $scope.goToCreateDebitCard = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('launchpad-retail.goToCreateDebitCard');
            }, 500);

        };

        $scope.goToCreateUsername = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('launchpad-retail.goToCreateUsername');
            }, 500);

        };
        $scope.goToApplyNow = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                // gadgets.pubsub.publish('launchpad.applynow');
                gadgets.pubsub.publish('launchpad-retail.goToApplyNow');
            }, 500);
        };

        $scope.notificationSend = function() {
            // var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];

            if (globalVariablePlugin) {
                var getFCMNotificationTokenSuccessCallback = function(data) {
                    if (data) {
                        $scope.notificationToken = data['notificationToken'];
                        if (globalVariablePlugin && $scope.notificationToken != null && $scope.notificationToken != '') {
                            var getDeviceFootPrintHeaderSuccessCallback = function(data) {
                                if (data) {
                                    var jsonObj = {
                                        'deviceId': data['deviceId'],
                                        'channel': data['channel'],
                                        'ipAddress': data['ipAddress'],
                                        'timeZone': data['timeZone'],
                                        'nwProvider': data['nwProviderLine1'],
                                        'connectionMode': data['connectionMode'],
                                        'geoLatitude': data['geoLatitude'],
                                        'geoLongitude': data['geoLongitude']
                                    };
                                    $scope.msgHeader = JSON.stringify(jsonObj);
                                    var postData = {
                                        'msgHeader': $scope.msgHeader,
                                        'notificationFlag': 'true', //$scope.notificationPermissionFlag,
                                        'notificationToken': $scope.notificationToken, //$scope.notificationTokenId,
                                        'smsReadingFlag': 'false', //$scope.smsReadFlag,
                                        'bioAuthFlag': 'false'
                                    };
                                    postData = $.param(postData || {});
                                    var updateUserPreferenceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateUserPreference'));

                                    //var updateUserPreferenceURL = 'https://my.idfcbank.com/rs/updateUserPreference';
                                    var serviceCall = $http({
                                        method: 'POST',
                                        url: updateUserPreferenceURL,
                                        data: postData,
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/x-www-form-urlencoded;'
                                        }
                                    });
                                    serviceCall.success(function(headers, data) {});
                                    serviceCall.error(function(headers, data) {});

                                } else {}
                            };
                            var getDeviceFootPrintHeaderErrorCallback = function(data) {
                                console.log('Something really bad happened');
                            };

                            globalVariablePlugin.getDeviceFootPrintHeader(
                                getDeviceFootPrintHeaderSuccessCallback,
                                getDeviceFootPrintHeaderErrorCallback
                            );
                        } else {
                            console.log('globalVariablePlugin is ' + globalVariablePlugin);
                        }


                    } else {
                        console.log('Failure: ' + JSON.stringify(data));
                    }
                };
                var getFCMNotificationTokenErrorCallback = function(data) {
                    console.log('Something really bad happened');
                };

                globalVariablePlugin.getFCMNotificationToken(
                    getFCMNotificationTokenSuccessCallback,
                    getFCMNotificationTokenErrorCallback
                );
            } else {
                console.log('globalVariablePlugin is ' + globalVariablePlugin);
            }


        };

        $scope.loginWithMpin = function() {
            //alert('click on mpin');
            //$scope.checkMpin();
            /* commented below line for production issue i.e. When user is on login screen and clicks on MPIN setup toggle
            (user has already done MPIN setup), for a fraction of second, NEW button is visible */
            //$scope.mpinFlag = false;
            /*******************************************************/
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin) {
                var isMpinSuccessCallback = function(data) {
                    if (data['mpinFlag'] == 'true') {
                        $scope.mpinFlag = true;
                    } else {
                        $scope.mpinFlag = false;
                    }
                    localStorage.setItem("mpinRegDevice", $scope.mpinFlag);
                    $timeout(function() {
                        var item = $document[0].activeElement;
                        if (!angular.isUndefined(item)) item.blur();
                        gadgets.pubsub.publish('launchpad-mpinlogin');
                    }, 500);

                };
                var isMpinErrorCallback = function(data) {
                    console.log('Something really bad happened');
                };
                globalVariablePlugin.getMpinFlag(
                    isMpinSuccessCallback,
                    isMpinErrorCallback
                );
            } else {
                console.log('Cant find Plugin');
            }
        };


        $scope.goToSetupMpin = function() {
            gadgets.pubsub.publish('launchpad-setupmpin');

        };

        /*Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it*/
        $scope.triggerClickEvent = function() {
            var toggleSwitch = angular.element('#toggleSwitch');
            if (angular.isDefined(toggleSwitch)) {
                $timeout(function() {
                    angular.element('#toggleSwitch').triggerHandler('click');
                }, 5);

            }
        }
        /*Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it*/


        //This is how Plugin to be used to get values from Global parameters
        $scope.checkGlobalVariable = function() {
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin) {
                var isMarketingSeenSuccessCallback = function(data) {
                    if (data) {
                        alert('Success: ' + data['marketingFlag']);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "MPINVALTHREE"
                        });
                    } else {
                        alert('Failure: ' + JSON.stringify(data));
                    }
                };
                var isMarketingSeenErrorCallback = function(data) {
                    alert('Something really bad happened');
                };

                globalVariablePlugin.getMarketingFlag(
                    isMarketingSeenSuccessCallback,
                    isMarketingSeenErrorCallback
                );

            } else {
                //alert('Fucked up');
            }

        }

        //This is how Plugin to be used to set values in Global parameters
        $scope.setGlobalVariable = function() {
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin) {
                //Setting Marketing Pages visit global variable
                //True = user has already gone through marketing pages
                //false = user has not gone through marketing pages
                globalVariablePlugin.setMarketingFlag(null, null, 'true');

                var isMarketingSeenSuccessCallback = function(data) {
                    if (data) {
                        alert('Success: ' + data['marketingFlag']);
                    } else {
                        alert('Failure: ' + JSON.stringify(data));
                    }
                };
                var isMarketingSeenErrorCallback = function(data) {
                    alert('Something really bad happened');
                };
                globalVariablePlugin.getMarketingFlag(
                    isMarketingSeenSuccessCallback,
                    isMarketingSeenErrorCallback
                );
            } else {
                alert('Plugin is not registered');
            }

        }

        //after scan and pay on login page..if mvisaFlag true-hide scan and pay btn and 4 links and show back btn
        $scope.checkMVisaLoginFlag = function() {
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin) {
                var isMVisaLoginSuccessCallback = function(data) {
                    if (data['mVisaFlag'] == 'true') {
                        $scope.mVisaFlag = true;
                        gadgets.pubsub.publish("js.back", {
                            data: "ENABLE_BACK"
                        });
                    } else {
                        $scope.mVisaFlag = false;
                    }
                };
                var isMVisaLoginErrorCallback = function(data) {
                    console.log('failure: ' + JSON.stringify(data));
                };

                globalVariablePlugin.getMVisaLoginFlag(
                    isMVisaLoginSuccessCallback,
                    isMVisaLoginErrorCallback
                );

            } else {
                //alert('Fucked up');
            }

        }

        //Reset application when device is blacklisted
        //True : App is reset and user needs to go through Setup MPIN
        //False: Could not reset app. Some Fatal error
        $scope.restDevice = function() {
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin) {
                var isResetSuccessCallback = function(data) {
                    if (data) {
                        if (data['successFlag'] == true) {
                            alert('Device reset: Click on Check Marketing Flag to test');
                        } else if (data['successFlag'] == false) {
                            alert('Could not reset device.');
                        }
                    } else {
                        alert('Failure: ' + JSON.stringify(data));
                    }
                };
                var isResetErrorCallback = function(data) {
                    alert('Something really bad happened');
                };
                globalVariablePlugin.resetDevice(
                    isResetSuccessCallback,
                    isResetErrorCallback
                );
            } else {
                alert('Cant find Plugin');
            }
        }


        //Check whether device has fingerprint scanner or not
        //true = Fingeprint scanner is there and user has scanned atleast one finger
        //false = Device doesnt have fingerprint scanner
        //none = User hasn't enrolled any fingerprint for authentication
        $scope.checkFingerprintCapability = function() {
            var fingerPrintPlugin = cxp.mobile.plugins['fingerPrintPlugin'];
            if (fingerPrintPlugin) {
                var isFPAvailableSuccessCallback = function(data) {
                    if (data) {
                        if (data['scannerFlag'] == true) {
                            alert('Device has fingerprint Capability');
                        } else if (data['scannerFlag'] == false) {
                            alert('Device doesnt have fingerprint Capability');
                        } else if (data['scannerFlag'] == 'none') {
                            alert('Device has fingerprint scanner but user has not scanned any fingerprint for authentication purpose');
                        } else {
                            alert('Something went wrong. We didnt look at this scenario')
                        }
                    } else {
                        alert('Failure: ' + JSON.stringify(data));
                    }
                };
                var isFPAvailableErrorCallback = function(data) {
                    alert('Something really bad happened');
                };
                fingerPrintPlugin.checkFingerprintCapability(
                    isFPAvailableSuccessCallback,
                    isFPAvailableErrorCallback
                );
            } else {
                alert('***** something went wrong *****');
            }
        }

        //sETUP FINGERPRINT and take user's permission for the same
        //successFlag = True: Fingerprint permission and key generation is successuful
        //successFlag = False: Fingerprint permision or key generation failed
        //fpToken: gives 256 characteter long key that should be stored on the server
        $scope.setupFingerprint = function() {
            var fingerPrintPlugin = cxp.mobile.plugins['fingerPrintPlugin'];
            if (fingerPrintPlugin) {
                var isFPSetupSuccessCallback = function(data) {
                    if (data) {
                        if (data['successFlag'] == true) {
                            alert('Token ID: ' + data['fpToken']);
                        } else if (data['successFlag'] == false) {
                            alert('Registration Error: ' + data['errorDesc']);
                        } else {
                            alert('Registration Error: ' + data['errorDesc']);
                        }
                    } else {
                        alert('Failure: ' + JSON.stringify(data));
                    }
                };
                var isFPSetupErrorCallback = function(data) {
                    alert('Something really bad happened');
                };
                fingerPrintPlugin.setupFonrgerPrint(
                    isFPSetupSuccessCallback,
                    isFPSetupErrorCallback
                );
            } else {
                alert('Fatal error. Please try after sometime');
            }
        }

        //Check whether user has provided permission to read SMS or not
        //successFlag = True: Permission is provided
        //successFlag = False: Permission is not provided
        $scope.checkSMSReadPermission = function() {
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if (smsPlugin) {
                var isSMSReadSuccessCallback = function(data) {
                    if (data) {
                        if (data['successFlag'] == true) {
                            alert('SMS Reading permission is provided');
                        } else if (data['successFlag'] == false) {
                            alert('SMS Reading permission is not provided');
                        } else {
                            alert('Error: Scenario is not coded');
                        }
                    } else {
                        alert('Failure: ' + JSON.stringify(data));
                    }
                };
                var isSMSReadErrorCallback = function(data) {
                    alert('Something really bad happened');
                };
                smsPlugin.checkSMSReadPermission(
                    isSMSReadSuccessCallback,
                    isSMSReadErrorCallback
                );

            } else {
                alert('Cant find Plugin. This is Fatal error where App upgrade is needed');
            }
        }



        //SMS Reading -- Start
        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.generateOTP('resend');
        });


        $scope.readSMS = function() {
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if (smsPlugin) {
                var isCheckSuccessCallback = function(data) {
                    if (data) {
                        var smsPermissionFlag = data['successFlag'];

                        if (smsPermissionFlag) {
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            alert('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS", {
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "LoginRSA"
                            });

                            //Step 2. Send request to "sendOTP service"
                            //This step has already taken place


                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("LoginRSA", function(evt) {
                                alert(evt.otp);
                                var receivedOtp = evt.data;
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver", {
                                    data: "Stop Reading OTP"
                                });

                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                $scope.otpValue = receivedOtp;
                                $scope.$apply();
                                angular.element('#verifyOTP-btn-login').triggerHandler('click');
                            });
                        } else {
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            //This step has already taken place
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


        /** Added by Kriti PwC- for mVisa */

        $scope.scanAndPay = function() {
            resetScanAndPayFlag();
            gadgets.pubsub.publish("launchpad-retail.mvisaQrcodeScan");
        }

        /** Added by Kriti PwC- for mVisa */


        $('.login-widget').click(function() {
            lpCoreBus.publish('launchpad-retail.closeActivePanel');
        });
        $scope.res = '';
        $scope.hideOTPFlag = true;
        $scope.hideQuesFlag = true;
        $scope.challengeQuesAnswers = [{
            'answer': '',
            'question': ''
        }];
        $scope.otpDetails = {};
        $scope.showQuestionDiv = false;
        $scope.lockFields = false;
        $scope.btnFlag = true;
        $scope.hideCombineFlag = true;
        $scope.emudraConfigProperty = 'false';
        $scope.loginerror = null;
        $scope.expire = false;
        $scope.customerId = '';
        $scope.credentialType = '';
        $scope.userStatus = '';
        $scope.control = {
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
            }
        };
        $scope.errorSpin = false;
        /**
         * Login
         */
        var promise = null;
        var setdeviceprint = function() {
            return encode_deviceprint();
        };

        $scope.setUPiFlag = function() {
            var globalVariablePluginSetAsset = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePluginSetAsset) {
                globalVariablePluginSetAsset.setUPIFlag(null, null, "true");
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var setAssetFlag = function(assetFlagValue) {
            var globalVariablePluginSetAsset = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePluginSetAsset) {
                globalVariablePluginSetAsset.setAssetFlag(null, null, assetFlagValue);
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var setLoanTypeFlag = function(loanTypeValue) {
            var globalVariablePluginSetLoanType = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePluginSetLoanType) {
                globalVariablePluginSetLoanType.setLoanTypeFlag(null, null, loanTypeValue);
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var setLoanAvailFlag = function(loanAvailFlag) {
            var globalVariablePluginSetLoanAvail = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePluginSetLoanAvail) {
                globalVariablePluginSetLoanAvail.setLoanAvailFlag(null, null, loanAvailFlag);
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var setHSData = function(hsFlag) {
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1) {
                globalVariablePlugin1.setHSFlag(null, null, hsFlag);
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        //mvisa-clear flag after one cycle-show 4 links and scanand pay btn after one complete mvisa flow
        var resetMVisaLoginFlag = function() {
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1) {
                globalVariablePlugin1.clearMVisaLoginFlag(null, null, '');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        //mvisa-clear flag to clear earlier scanned qr or key entry data if app killed or repopend
        var resetScanAndPayFlag = function() {
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1) {
                globalVariablePlugin1.clearScanAndPayFlag(null, null, '');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var initialize = function() {
            $scope.user = {};
            $scope.user.mobileN = '';
            $scope.user.captcha = '';
            $scope.errorSpin = false;
            //3.5 captcha
            var captchaServiceEndPoint = lpWidget.getPreference('captchaService');
            $scope.captchaService = lpCoreUtils.resolvePortalPlaceholders(captchaServiceEndPoint, {
                servicesPath: lpPortal.root
            });

            $scope.captchaSrc = $scope.captchaService + "?ts=" + new Date().getTime();
            console.log('captchaSrc' + $scope.captchaSrc);
            //$scope.user = {};

            //3.5 captcha closed
            globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            globalVariablePlugin.setNavigateToProfile(null, null, ''); //3.5 change

            //check is mVisaLogin Flag is true dont show 4links and scan and pay button
            $scope.checkMVisaLoginFlag();

            /*(change is switch)Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it*/
            $scope.IntOnOff = false;
            localStorage.setItem('isMpinLogin', 'false');
            var checkCustomerExistUrlDummy = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('checkCustomerExistUrl'));
            var postDataDummy = {
                'loginId': "Dummy"
            };

            // var checkCustomerExistDummy = $http.post(checkCustomerExistUrlDummy, lpCoreUtils.buildQueryString(postDataDummy), {
            //   headers: {
            //     'Accept': 'application/json',
            //     'Content-Type': 'application/x-www-form-urlencoded;',
            //     'Cache-Control': 'no-cache, no-store, must-revalidate',
            //     'Pragma': 'no-cache',
            //     'Expires': '0'
            //   }
            // });
            // checkCustomerExistDummy.success(function() {}).error(function(data) {});
            /*New development change request Developed by PwC*/
            if (globalVariablePlugin) {
                var isMpinSuccessCallback = function(data) {
                    if (data['mpinFlag'] == 'true') {
                        $scope.mpinFlag = true;
                    } else {
                        $scope.mpinFlag = false;
                    }
                };
                var isMpinErrorCallback = function(data) {
                    console.log('Something really bad happened');
                };
                globalVariablePlugin.getMpinFlag(
                    isMpinSuccessCallback,
                    isMpinErrorCallback
                );
            } else {
                console.log('Cant find Plugin');
            }
            /*New development change request Developed by PwC*/
            $scope.notificationSend();
        }
        initialize();

        $scope.resetPassword = function() {
            var navData = {
                "uname": $scope.user.id
            };
            localStorage.setItem("origin", "login");
            localStorage.setItem("navigationData", JSON.stringify(navData));
            gadgets.pubsub.publish('launchpad-retail.account-unlock');
        }
        /* $scope.docustomLogin = function(userId, password) {
             $scope.errorSpin = true;
             // // Calling customLogin before CheckCustomerExists service to fix the one time fail of checkCustomerExists service
             var pubKey, exp, mod;
             pubKey = readKey.getValues("publicKeyValue");
             exp = readKey.getValues("exp");
             mod = readKey.getValues("mod");
             enciphering.setEncodeKey(pubKey, mod, exp);
             password = enciphering.setEncrpt(password);
             // Ends here
             promise = self.getLoginPromise(userId, password).success(function(response) {
                 $scope.res = response;
                 $scope.doLogin(response);
                 return promise;
             }).error(function(response) {
                 var rsaLoginFailNotify = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('rsaLoginFailNotify'));
                 var postData = {
                     'loginId': $scope.user.id
                 };
                 var res = $http.post(rsaLoginFailNotify, lpCoreUtils.buildQueryString(postData), {
                     headers: {
                         'Accept': 'application/json',
                         'Content-Type': 'application/x-www-form-urlencoded;',
                         'Cache-Control': 'no-cache, no-store, must-revalidate',
                         'Pragma': 'no-cache',
                         'Expires': '0'
                     }
                 });
                 res.success(function(data) {});
                 res.error(function(data) {});
                 $scope.user.password = '';
                 $scope.errorSpin = false;
                 if (response.code === '101') {
                     $scope.expire = true;
                 }
                 if (response.code === '102') {
                     //////////////////////////////////////////////////
                     //             SMS LOCk -Infosys -Alert         //
                     //////////////////////////////////////////////////
                     var lockSMSurl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('lockSMSurl'));
                     lockSMSurl = lockSMSurl + '?userName=' + $scope.user.id;
                     $http({
                         method: 'GET',
                         url: lockSMSurl,
                         headers: {
                             'Accept': 'application/json',
                             'Content-Type': 'application/x-www-form-urlencoded;'
                         }
                     });
                 }
                 $scope.loginerror = response.message;
                 $anchorScroll();
                 if (response.message === 'Your password has been expired.') {
                     $scope.resetPassword();
                 }
                 return response;
             });
         }; */
        /*self.getLoginPromise = function(userId, password) {

            var data = {
                j_username: userId,
                j_password: password,
                portal_name: "idfc_mobile", //lpPortal.name
                page_name: lpPortal.page.name,
                auth_token: 'required', // password change
                requiredECheck: 'required' // password change
            };


            var loginUrl = lpPortal.root + '/j_spring_security_check' + '?rd=' + new Date().getTime();


            return $http.post(loginUrl, lpCoreUtils.buildQueryString(data), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
        };*/

        /**
         * Handle successful authentication attempt
         */


        self.handleSuccessfulLogin = function(response) {
            //alert('handle success');

            if ($scope.emudraConfigProperty === 'true') {
                var emudraUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('emudraUrl'));
                var emudraRequest = $http({
                    method: 'GET',
                    url: emudraUrl,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
                emudraRequest.success(function(data) {
                    //SBO2 Yushae PwC setting mode of login
                    var globalVariablePluginSetLogin = cxp.mobile.plugins['GlobalVariables'];
                    if (globalVariablePluginSetLogin) {
                        globalVariablePluginSetLogin.setLoginType(null, null, 'IBCRED');
                    } else {
                        console.log('Fatal Error: Global Variable plugin not registered');
                    }
                    //SBO2 Yushae PwC setting mode of login
                    //self.getSuccessView(response);
                    //SBO2 PwC added pub sub
                    gadgets.pubsub.publish('cxp.load.model');

                }).error(function(data1) {
                    $scope.user.password = '';
                    if (data1.cd === '501') {
                        $scope.loginerror = data1.rsn;
                        $scope.errorSpin = false;
                    }
                });
            } else {


                //lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('sessionUrl'))
                var sessionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('handleLogin')) + '?rd=' + new Date().getTime();

                var customerRequest = $http({
                    method: 'GET',
                    url: sessionUrl,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
                customerRequest.success(function(response) {
                        //                  if(response.bibuser){
                        //                    var getBIBCustomerProfile = $http({
                        //              method: 'GET',
                        //              url: "http://10.5.4.12:7003/rs/v1/getBusinessProfile?cnvId=TOA",
                        //              data:null,
                        //              headers: {
                        //              'Accept': 'application/json',
                        //              'Content-Type': 'application/x-www-form-urlencoded;'
                        //            }});
                        //            getBIBCustomerProfile.success(function(data){
                        //              if(data.profCntr == '053' || data.profCntr == '056')
                        //              {
                        //                gadgets.pubsub.publish ('cxp.load.model',response);
                        //              }else {
                        //                gadgets.pubsub.publish ('restrictBBUser');
                        //                var logoutUrl = 'http://10.5.4.12:7003/rs/v1/logoutUser';
                        //                                                                    var logoutRequest = $http({
                        //                                                                        method: 'GET',
                        //                                                                        url: logoutUrl,
                        //                                                                        headers: {
                        //                                                                            'Accept': 'application/json',
                        //                                                                            'Content-Type': 'application/x-www-form-urlencoded;'
                        //                                                                        }
                        //                                                                    });
                        //                                                                    logoutRequest.success(function(data) {
                        //                                                                        var replaceUrl = $http({
                        //                                                                            method: 'GET',
                        //                                                                            url: (lpPortal.root +
                        //                                                                                '/j_spring_security_logout?portalName=' +
                        //                                                                                lpPortal.name),
                        //                                                                            headers: {
                        //                                                                                'Accept': 'application/json',
                        //                                                                                'Content-Type': 'application/x-www-form-urlencoded'
                        //                                                                            }
                        //                                                                        }).success(function() {
                        //                                //                                            gadgets.pubsub.publish(
                        //                                //                                                'cxplogout');
                        //
                        //                                                                        }).error(function(data, status) {
                        //                                //                                            gadgets.pubsub.publish(
                        //                                //                                                'cxplogout');
                        //                                                                        });
                        //                                                                    }).error(function() {
                        //                                                                        var replaceUrl = $http({
                        //                                                      method: 'GET',
                        //                                                      url: (lpPortal.root +
                        //                                                        '/j_spring_security_logout?portalName=' +
                        //                                                        lpPortal.name),
                        //                                                      headers: {
                        //                                                        'Accept': 'application/json',
                        //                                                        'Content-Type': 'application/x-www-form-urlencoded'
                        //                                                      }
                        //                                                    }).success(function(){
                        //                                //                       gadgets.pubsub.publish(
                        //                                //                      'cxplogout');
                        //                                                    })
                        //                                                                    });
                        //                                                    $scope.errorSpin = false;
                        //                                                    $scope.user.id = "";
                        //                                                    $scope.user.password = "";
                        //              }
                        //            })
                        //            }
                        //                  else {
                        //SBO2 Yushae PwC setting mode of login
                        var globalVariablePluginSetLogin = cxp.mobile.plugins['GlobalVariables'];
                        if (globalVariablePluginSetLogin) {
                            globalVariablePluginSetLogin.setLoginType(null, null, 'IBCRED');
                        } else {
                            console.log('Fatal Error: Global Variable plugin not registered');
                        }
                        //SBO2 Yushae PwC setting mode of login
                        gadgets.pubsub.publish('cxp.load.model', response);
                        //                  }
                    })
                    .error(function(response) {
                        gadgets.pubsub.publish("session.not.created");
                        gadgets.pubsub.publish('cxp.load.model', response);
                    });
            }
        };

        $scope.verifyRsaLogin = function(isFormValid, action) {
            $scope.errorSpin = true;
            if (!isFormValid) {
                $scope.errorSpin = false;
                return false;
            }
            $scope.postDataVerify = {
                'credentialType': action,
                'transaction': 'login',
                'otpValue': $scope.otpDetails.otpValue,
                'customerId': $scope.customerId,
                'userStatus': $scope.userStatus,
                'questionID': $scope.challengeQuestionsId,
                'question': $scope.challengeQuestions,
                'answer': $scope.challengeQuestion.answer
            };
            $scope.postDataVerify.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            var request = $http.post(verifyRsaLoginURL, lpCoreUtils.buildQueryString($scope.postDataVerify), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            request.success(function(response) {
                if (response.correctlyAnswered) {
                    $scope.hideQuesFlag = true;
                    $scope.hideCombineFlag = true;
                    $scope.hideOTPFlag = true;
                    self.handleSuccessfulLogin($scope.loginRes);
                } else {
                    if ($scope.challengeQuestionCounter <= 2) {
                        $scope.loginerror = CQService.WRONG_CQ_ANSWER;
                        $scope.errorSpin = false;
                        $scope.showWrongAnswerMessage = true;
                        $scope.showQuestionDiv = false;
                    } else {
                        $scope.errorSpin = false;
                        $scope.loginerror = CQService.CQ_ANSWER_ATTEMPT_EXCEED;
                        $scope.showQuestionDiv = false;
                    }
                }

            }).error(function(data) {
                $scope.hideQuesFlag = true;
                $scope.hideCombineFlag = true;
                $scope.hideOTPFlag = true;
                $scope.loginerror = data.rsn;
                $scope.user.password = '';
                $scope.errorSpin = false;
            });
        };

        // fetch challenge question function by Xebia
        $scope.fetchCQ = function() {
            $scope.errorSpin = true;
            $scope.loginerror = false;
            $scope.challengeQuestion.answer = "";
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
                $scope.showUserNamePassword = false;
            })
            xhr.error(function(error) {
                $scope.loginerror = error.rsn;
                $scope.errorSpin = false;
            })
        }


        $scope.clearOTP = function() {
            $scope.otpDetails.otpValue = '';
        };

        //SMS Reading -- Start
        $scope.readSMS = function(resendFlag) {
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if (smsPlugin) {
                var isCheckSuccessCallback = function(data) {
                    if (data) {
                        var smsPermissionFlag = data['successFlag'];

                        if (smsPermissionFlag) {
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            gadgets.pubsub.publish("readSMS", {
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "CardBlock"
                            });

                            //Step 2. Send request to "sendOTP service
                            //no call required

                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("CardBlock", function(evt) {
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver", {
                                    data: "Stop Reading OTP"
                                });

                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                $scope.controlPass.otpValue = receivedOtp;
                                $scope.$apply();
                                angular.element('#verifyOTP-btn-block-card-temp').triggerHandler('click');



                            });
                        } else {
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            //no call required
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

        $scope.generateOTP = function(value) {
            var resendOTP = null;
            //var self = this;
            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generateOTPService'));
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
            xhr.success(function(data) {
                $scope.success = {
                    happened: true,
                    msg: 'OTP has been successfully sent to your registered mobile number'
                };
                //Automate OTP read
                $scope.readSMS();

                $scope.error = {
                    happened: false,
                    msg: ''
                };
                $scope.customerMob = data.mobileNumber;
                if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob !== null)) {
                    $scope.customerMobMasked = '******' + $scope.customerMob.substr($scope.customerMob.length - 4);
                }
                //$scope.hideOTPFlag = false;
            }).error(function(data, status, headers, config) {
                if (data.cd) {
                    // If session timed out, redirect to login page
                    // uncomment when global js added
                    // If service not available, set error flag
                    if (data.cd === '501') {
                        $scope.loginerror = data.rsn;
                        $scope.errorSpin = false;
                    }
                    if (!(data.cd === '701')) {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error');
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
            });
        };
        $scope.user = {};
        $scope.allowSubmit = function() {

            //3.5 captcha
            if (!$scope.showCaptcha) {

                return ($scope.user.id);
            }
            if (!$scope.showmobinput) {

                return ($scope.user.id && $scope.user.captcha && $scope.user.password);
            }

            return ($scope.user.id && $scope.user.mobileN && $scope.user.captcha && $scope.user.password); //3.5 captcha closed
        };
        $scope.closeAlert = function() {
            $scope.bibAlertRestrict = false;
            gadgets.pubsub.publish("closeAppForAus"); //3.5 change

        };
        $scope.setMobileNum = function(mobileNumber) {
            $scope.user.mobileN = mobileNumber;

        };
        $scope.setCaptcha = function(capchaVal) {
            $scope.user.captcha = capchaVal;

        };
        //3.5 captcha function added
        function attemptCheckLogin(userId) {
            console.log("attemptCheckLogin@@");
            $scope.errorSpin = true;
            return verifyBeforeLogin(userId).success(function(response) {
                    //doCustomLogin($scope.user.id, $scope.user.password);
                    doCustomLogin($scope.user.id, $scope.user.password);
                })
                .error(function(error) {
                    $scope.errorSpin = false;
                });
        }
        //3.5 captcha function added
        function verifyBeforeLogin(userId) {
            console.log("verifyBeforeLogin@@");
            return LoginService // add login service for captcha
                .setup({
                    profileChkEndpoint: profileChkEndpoint
                })
                .preLoginChk({
                    logName: userId
                });
        };

        function setXsrfTokenWithResponse(response){
        		response.success(function(data, status, headers, config){
        				var xsrfToken = headers('XSRF-TOKEN');
        				console.log("setXsrfTokenWithResponse success xsrfToken : "+xsrfToken);
        				if(typeof xsrfToken != 'undefined')
        				{
        					window.sessionStorage.setItem('xsrfToken', xsrfToken);
        				}
        			}).error(function(error, status, headers, config){
        				var xsrfToken = headers('XSRF-TOKEN');
        				console.log("setXsrfTokenWithResponse error xsrfToken : "+xsrfToken);
        				if(typeof xsrfToken != 'undefined')
        				{
        					window.sessionStorage.setItem('xsrfToken', xsrfToken);
        				}
        		});
       }

        $scope.doLogin = function(userId, password) //3.5 change
        {
            //password change 3.5 change
            var pubKey, exp, mod;
            pubKey = readKey.getValues("publicKeyValue");
            exp = readKey.getValues("exp");
            mod = readKey.getValues("mod");
            enciphering.setEncodeKey(pubKey, mod, exp);
            //console.log(enciphering.setEncrpt(password));
            /* xsrf token change*/
            var tocanqey = sessionStorage.getItem("xsrfToken");
            var result = "";
            tocanqey = tocanqey || "";
            for (var i=0; i<tocanqey.length; i++) {
            		  result = tocanqey.charAt(i) + result;
            }
            $scope.user.password = $scope.user.password + result;
            /*change end*/
            $scope.user.password = enciphering.setEncrpt($scope.user.password);
            // close password change

            //3.5 Change
            if ($scope.lastCaptchaLogin && $scope.user.mobileN.trim().length == 10 && $scope.user.captcha.trim().length != 0 && $scope.user.captcha != "") {
                console.log("attemptCheckLogin Call@@");
                attemptCheckLogin($scope.user.id);
            } else if ($scope.user.password) {
                $scope.errorSpin = true;
                doCustomLogin($scope.user.id, $scope.user.password);
            } else {
                $scope.user.password = '';
            }

        };

        function login(userId, password) {
            userId = userId;
            password = password;
            return LoginService
                .setup({
                    loginEndpoint: loginEndpoint
                })
                .login({
                    j_username: userId,
                    j_password: password,
                    portal_name: "idfc_mobile", //lpPortal.name
                    page_name: lpPortal.page.name,
                    auth_token: 'required', // password change
                    requiredECheck: 'required', // password change
                    captchacode: $scope.user.captcha,
                    userMobNum: $scope.user.mobileN

                });
        };

        function doCustomLogin(userId, password) {
            return login(userId, password)
                .success(function(response) {
                    $scope.lastCaptchaLogin = false;
                    $scope.showCaptcha = false;
                    $scope.showmobinput = false;
                    otherCallsAfterPasswordValid(response);
                    //handleSuccessfulLogin(response);
                })
                .error(function(error) {
                    console.log("j_spring_security_check");
                    console.log(error);
                    $scope.user.password = '';
                    $scope.user.mobileN = ''; //3.5 change
                    $scope.user.captcha = ''; //3.5 change
                    $scope.errorSpin = false;

                    /*LoginService
                        .setup({
                            rsaLoginFailNotifyEndpoint: rsaLoginFailNotifyEndpoint
                        })
                        .notifyLoginFailRSA({
                            'loginId': userId
                        });*/
                        /*xsrf change*/
                    setXsrfTokenWithResponse(LoginService
                                            .setup({
                                                rsaLoginFailNotifyEndpoint: rsaLoginFailNotifyEndpoint
                                            })
                                            .notifyLoginFailRSA({
                                                'loginId': userId
                    }));
                    if (error.code === '102') {
                        $scope.showmobinput = false;
                        $scope.showCaptcha = false;

                        //////////////////////////////////////////////////
                        //             SMS LOCk -Infosys -Alert         //
                        //////////////////////////////////////////////////
                      /*  LoginService
                            .setup({
                                lockSMSEndpoint: lockSMSEndpoint + userId
                            })
                            .lockSMS();*/
                       /*xsrf change*/
                       setXsrfTokenWithResponse(LoginService
                                                   .setup({
                                                       lockSMSEndpoint: lockSMSEndpoint + userId
                                                   })
                        .lockSMS());
                       $scope.loginerror = error.message;
                       console.log("$scope.loginerror@" + $scope.loginerror);
                    } else if (error.code === '113' || error.code === '114') {
                        $scope.regenerateCaptcha();
                        $scope.showCaptcha = true;
                        if (error.code === '114') {
                            $scope.lastCaptchaLogin = true;
                            $scope.showmobinput = true;
                        } else {
                            $scope.showmobinput = false;
                        }
                        $scope.loginerror = error.message;
                        $scope.user.captcha = "";
                    } else if (error.code === '100') {
                        $scope.loginerror = error.message;
                        $scope.regenerateCaptcha();
                        $scope.user.captcha = "";
                    } else if (error.code === '121') {
                        $scope.user.captcha = "";
                        $scope.lastCaptchaLogin = true;
                        $scope.showCaptcha = true;
                        $scope.showmobinput = true;
                        $scope.regenerateCaptcha();

                    } else if (error.code === '177') {
                        $scope.user.captcha = "";
                        $scope.lastCaptchaLogin = false;
                        $scope.showCaptcha = true;
                        $scope.showmobinput = true;
                        $scope.loginerror = error.message;
                        $scope.regenerateCaptcha();

                    } else if (error.code === '120') {
                        $scope.regenerateCaptcha();
                        $scope.showCaptcha = true;
                        $scope.showmobinput = false;
                        $scope.user.captcha = "";
                    } else if (error.code === '103') {
                        $scope.regenerateCaptcha();
                        $scope.user.captcha = "";
                        $scope.loginerror = error.message;
                    } else if (error.cd === 'BLACKOUT_404') {


                        $scope.loginerror = error.rsn;

                    }
                    $scope.loginerror = error.message;
                    $anchorScroll();

                    if (error.message === 'Your password has been expired.') {
                        //lpCoreBus.publish('launchpad-retail.account-unlock');
                        $scope.resetPassword();
                    }



                });
        };
        //3.5 captcha
        $scope.regenerateCaptcha = function() {
            $scope.user.captcha = "";
            $timeout(function() {
                $scope.user.captcha = "";
            }, 200);
            console.log('succces captcha regenerate@' + $scope.user.captcha);
            $scope.captchaSrc = $scope.captchaService + "?ts=" + new Date().getTime();
            console.log('vc.captchaSrc' + $scope.captchaSrc);

        };

        // comment for 3.5
        function otherCallsAfterPasswordValid(loginRes) {
            // // password change
            // var pubKey, exp, mod;
            // pubKey = readKey.getValues("publicKeyValue");
            // exp = readKey.getValues("exp");
            // mod = readKey.getValues("mod");
            // enciphering.setEncodeKey(pubKey, mod, exp);
            // //  console.log(enciphering.setEncrpt(vc.user.password));
            // $scope.user.password = enciphering.setEncrpt($scope.user.password);
            // close password change
            if (!$scope.user.password) {
                //alert('Please enter password.');
            } else {
                $scope.errorSpin = true;
                var checkCustomerExistUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('checkCustomerExistUrl'));
                var postData = {
                    'loginId': $scope.user.id
                };

                var checkCustomerExist = $http.post(checkCustomerExistUrl, lpCoreUtils.buildQueryString(postData), {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                checkCustomerExist.success(function(data) {
                    /***********Sourav PwC****************/
                    var item = $document[0].activeElement;
                    if (!angular.isUndefined(item)) item.blur();
                    /***********Sourav PwC****************/
                    /****************Pratik***************/
                    userData = data;
                    /************************************/
                    //alert('check success');
                    if (data.isGroupChanged) //3.5 change
                    {
                        console.log("In if group change");

                        doCustomLogin(userId, vc.user.password);
                        console.log("After dologin");
                        return false;
                    }
                    var isIndividual = userData.isIndividual;
                    if ((typeof isIndividual !== 'undefined') && (isIndividual !== null) && (isIndividual == 'N')) {
                        $scope.errorSpin = false;
                        $scope.bibAlertRestrict = true;
                        //gadgets.pubsub.publish("restrictBibAusUser");
                        return;
                    } else {
                        if (parseInt(userData.profitCntrCode) == 53 || parseInt(userData.profitCntrCode) == 54 || parseInt(userData.profitCntrCode) == 56 || parseInt(userData.profitCntrCode) == 57) {
                            gadgets.pubsub.publish("restrictBBUser");
                        } else if (data.type1 == "" || data.type1 == null || data.type1 == undefined) {
                            $scope.errorSpin = false;
                            gadgets.pubsub.publish("BlankUserType");
                        } else {

                            $scope.emudraConfigProperty = data.emudraConfigProperty;
                            /*$scope.userTye = data.type;
                            console.log('data.type' + data.type);*/
                            var userType = data.type1.split("|");
                            if (userType[0] == "A") {
                                setAssetFlag(true);
                            }

                            if (userType[0] == "L") {
                                setAssetFlag(false);
                            }

                            if (data.type1.indexOf("B") >= 0) {
                                setAssetFlag(false);
                            }

                            if (data.type1.indexOf("HSC") >= 0) {
                                setHSData(false);
                            } else if (data.type1.indexOf("HS") >= 0) {
                                setHSData(true);
                                setAssetFlag(false);

                            } else {
                                setHSData(false);
                            }


                            var loanAvailData;
                            var hl = 0;
                            var lap = 0;
                            var pl = 0;
                            if (data.type1.indexOf("PL") >= 0) {
                                pl = 1;
                                if (loanAvailData != undefined && loanAvailData != null && $.trim(loanAvailData) != '') {
                                    loanAvailData = loanAvailData + ',' + 'pl';
                                } else {
                                    loanAvailData = 'pl';
                                }
                                //loanAvailData='pl';
                            }
                            if (data.type1.indexOf("LAP") >= 0) {
                                lap = 1;
                                //loanAvailData=loanAvailData + ','+'lap';
                                if (loanAvailData != undefined && loanAvailData != null && $.trim(loanAvailData) != '') {
                                    loanAvailData = loanAvailData + ',' + 'lap';
                                } else {
                                    loanAvailData = 'lap';
                                }
                            }
                            if (data.type1.indexOf("HL") >= 0 || data.type1.indexOf("HS") >= 0 || data.type1.indexOf("HSC") >= 0) {
                                hl = 1;
                                //loanAvailData=loanAvailData + ','+'hl';
                                if (loanAvailData != undefined && loanAvailData != null && $.trim(loanAvailData) != '') {
                                    loanAvailData = loanAvailData + ',' + 'hl';
                                } else {
                                    loanAvailData = 'hl';
                                }
                            }

                            if (loanAvailData != undefined && loanAvailData != null && $.trim(loanAvailData) != '') {
                                setLoanAvailFlag(loanAvailData);
                            } else {
                                setLoanAvailFlag("You have no loans from us");
                            }



                            //decides landing page
                            //if(data.type1.indexOf("A")>=0){
                            if (userType[0] == "A") {
                                if (hl > 0 && lap > 0 && pl > 0) {
                                    // hl
                                    setLoanTypeFlag('hl');
                                } else if (hl == 0 && pl > 0 && lap == 0) {
                                    // pl
                                    setLoanTypeFlag('pl');
                                } else if (hl == 0 && lap > 0 && pl == 0) {
                                    // lap
                                    setLoanTypeFlag('lap');
                                } else if (hl > 0 && pl > 0 && lap == 0) {
                                    //hl
                                    setLoanTypeFlag('hl');
                                } else if (hl == 0 && pl > 0 && lap > 0) {
                                    //lap
                                    setLoanTypeFlag('lap');
                                } else if (hl > 0 && pl == 0 && lap > 0) {
                                    // hl
                                    setLoanTypeFlag('hl');
                                } else if (hl > 0 && pl == 0 && lap == 0) {
                                    //hl
                                    setLoanTypeFlag('hl');
                                } else if (hl == 0 && pl == 0 && lap == 0) {
                                    //hl
                                    setLoanTypeFlag('You have no loans from us');
                                }
                            } else {
                                //if B or L go to dashboard
                                setLoanTypeFlag('You have no loans from us');
                            }



                            if (data.rsaConfigProperty === 'false') {
                                // $scope.docustomLogin($scope.user.id, $scope.user.password);
                                self.handleSuccessfulLogin(loginRes);
                            } else {
                                $scope.loginRes = loginRes;
                                $scope.customerId = data.customerId;
                                $scope.customerMob = data.mblNm;
                                var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('rsaAnalyzeService'));
                                $scope.rsaData = {
                                    'transaction': 'login',
                                    'resendOTP': false,
                                    'loginId': $scope.user.id,
                                    'customerId': $scope.customerId,
                                    'mobileNumber': $scope.customerMob
                                };
                                $scope.rsaData.devicePrint = setdeviceprint();
                                // to fetch mobile specific data
                                /*  gadgets.pubsub.publish("getMobileSdkData");
                                  gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
                                    $scope.mobileSdkData = response.data;
                                  });*/
                                console.log("Sending Data");
                                console.log($scope.mobileSdkData);
                                $scope.rsaData.mobileSdkData = JSON.stringify($scope.mobileSdkData);
                                var res = $http.post(rsaAnalyzeService, lpCoreUtils.buildQueryString($scope.rsaData), {
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/x-www-form-urlencoded;',
                                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                                        'Pragma': 'no-cache',
                                        'Expires': '0'
                                    }
                                });
                                res.success(function(resData) {

                                    $scope.credentialType = resData.credentialType;
                                    $scope.errorSpin = false;
                                    $scope.userStatus = resData.userStatus;
                                    //resData ={"userStatus":"VERIFIED","mandatoryOTP":"false","credentialType":null,"actionStatus":"ALLOW","deviceTokenFSO":"PMV626LIuh3ZqTD0VURMjsiozdcysOY9Xhbb%2Boh4umWuerwBaUUswkNZ4eJu4mSo093rW9uqAtufJqVEO6TcN%2FN8ik8w%3D%3D","deviceTokenCookie":"PMV626LIuh3ZqTD0VURMjsiozdcysOY9Xhbb%2Boh4umWuerwBaUUswkNZ4eJu4mSo093rW9uqAtufJqVEO6TcN%2FN8ik8w%3D%3D","ausUser":false,"ribuser":true};


                                    // RSA changes by Xebia starting
                                    if (resData.actionStatus === 'DENY' || resData.userStatus === 'DELETE' || resData.userStatus === 'LOCKOUT') {
                                        $scope.loginerror = "Login failed! Kindly call on 1800 410 4332 for assistance.";
                                        $scope.user.password = '';
                                        $scope.errorSpin = false;
                                    } else if (resData.actionStatus === 'ALLOW' && resData.userStatus !== 'DELETE') {
                                        $scope.errorSpin = true;
                                        $scope.hideOTPFlag = true;
                                        self.handleSuccessfulLogin(loginRes);
                                    } else if (resData.actionStatus === 'CHALLENGE' && (resData.userStatus === 'VERIFIED' || resData.userStatus === 'UNLOCKED')) {
                                        var postdata = {};
                                        $scope.loginerror = CQService.CHALLENGE_MESSAGE;
                                        $scope.challengeQuestionCounter++;
                                        $scope.challengeQuestions = resData.challengeQuestionList[0].questionText;
                                        $scope.challengeQuestionsId = resData.challengeQuestionList[0].questionId;
                                        $scope.showUserNamePassword = false;
                                        $scope.hideQuesFlag = false;
                                        $scope.showQuestionDiv = true;
                                    } else if (resData.actionStatus === 'CHALLENGE' && (resData.userStatus === 'UNVERIFIED' || resData.userStatus === 'NOTENROLLED')) {
                                        $scope.user.id = '';
                                        $scope.user.password = '';
                                        $scope.errorSpin = false;
                                        gadgets.pubsub.publish('openCQ');
                                    }
                                    // RSA changes by Xebia ends

                                });
                                res.error(function(resdata) {
                                    $scope.user.password = '';
                                    $scope.loginerror = resdata.rsn;
                                    $scope.errorSpin = false;
                                    $anchorScroll();
                                });
                            }
                        }
                    }
                }).error(function(response) {
                    $scope.errorSpin = false;
                    if (response == "") {
                        gadgets.pubsub.publish("no.internet");
                    } else
                        $scope.user.password = '';
                    $scope.loginerror = response.rsn;
                    $anchorScroll();
                    if (response.message === 'Your password has been expired.') {
                        $scope.resetPassword();
                    }
                });
            }
        };



        /*var loanTypeDefine = function(){
                        var loanAvailData;
                        var hlAvail;
                        var plAvail;
                        var lapAvail;

                         var loanAcctsUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                                         .getPreference('loanAccountList'), {
                                         servicesPath: lpPortal.root
                                     });
                         console.log('loanAcctsUrl', loanAcctsUrl);
                         var xhr =  $http({
                            method: 'GET',
                            url: loanAcctsUrl,
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded;'
                                }
                            }).success(function(data) {
                                console.log('loan data', data);
                                if (data != undefined && data != null && $.trim(data) != '')
                              {
                                  var hl = 0;
                                  var lap = 0;
                                  var pl = 0;
                                  var hs = 0;
                                  var homeSaverData = [];
                                    var homeLoanData = [];
                                    var personalLoanData = [];
                                    var loanAgainstPropertyData = [];
                                    angular.forEach(data, function(value, key) {
                                        if( value.prdCd == "HOME_TOP" || value.prdCd == "BASIC_H" ||  value.prdCd == "YOUTHHOME" || value.prdCd == "MON_SAVER" || value.prdCd == "MONEY_TOP" || value.prdCd == "YOUTH_TOP" || value.prdCd == "4000" ){
                                        // || value.prdCd == "4000"   for homesaver
                                            homeLoanData.push(value);
                                        }
                                        else if(value.prdCd == "VANILLA_NP"  || value.prdCd == "VANILLA_PP" || value.prdCd == "VANILLA_PL_NPP"  || value.prdCd == "VANILLA_PL_PP" ){
                                            personalLoanData.push(value);
                                        }
                                        else if(value.prdCd == "LAP" || value.prdCd == "LAPTERM" || value.prdCd == "LAPTL" || value.prdCd == "LAPDROP" || value.prdCd == "LTL" || value.prdCd == "LAPSAVER"){
                                            loanAgainstPropertyData.push(value);
                                        }
                                        if(value.prdCd == "MON_SAVER" || value.prdCd == "MONEY_TOP" ||  value.prdCd == "4000"){
                                            homeSaverData.push(value);
                                        }
                                    })
                                    if(homeSaverData.length > 0){
                                      setHSData(true);
                                    }
                                    if (homeLoanData.length > 0) {
                                        var hlFlag = homeLoanData[0].hlflag ;
                                        var hsFlag = homeLoanData[0].hsflag ;
                                        if(hlFlag != undefined){
                                            hl = 1;
                                            hlAvail = true;
                                        }
                                    }
                                    if (personalLoanData.length > 0) {
                                        pl = 1;
                                        plAvail = true;
                                    }
                                    if (loanAgainstPropertyData.length > 0) {
                                        lap = 1;
                                        lapAvail = true
                                    }
                                    if(hlAvail == true){
                                        loanAvailData = 'hl';
                                    }
                                    if(plAvail == true){
                                        if(loanAvailData != undefined && loanAvailData != null && $.trim(loanAvailData) != ''){
                                          loanAvailData= loanAvailData + ','+'pl';
                                        }
                                        else{
                                            loanAvailData = 'pl';
                                        }
                                    }
                                    if(lapAvail == true){
                                        if(loanAvailData != undefined && loanAvailData != null && $.trim(loanAvailData) != ''){
                                            loanAvailData=loanAvailData + ','+'lap';
                                        }
                                        else{
                                            loanAvailData = 'lap';
                                        }
                                    }
                                    if(loanAvailData != undefined && loanAvailData != null && $.trim(loanAvailData) != ''){
                                        setLoanAvailFlag(loanAvailData);
                                    }
                                    else{
                                        setLoanAvailFlag("You have no loans from us");
                                    }
                                    if(hl > 0  && lap > 0 && pl > 0){
                                        // hl
                                        setLoanTypeFlag('hl');
                                    }
                                    else if (hl == 0 && pl > 0 && lap == 0){
                                    // pl
                                    setLoanTypeFlag('pl');
                                    }
                                    else if (hl == 0 && lap > 0 && pl == 0){
                                        // lap
                                        setLoanTypeFlag('lap');
                                    }
                                    else if (hl > 0  && pl > 0 && lap == 0){
                                        //hl
                                        setLoanTypeFlag('hl');
                                    }
                                    else if (hl == 0 && pl > 0 && lap > 0 ){
                                        //lap
                                        setLoanTypeFlag('lap');
                                    }
                                    else if (hl > 0 && pl == 0 && lap > 0){
                                        // hl
                                        setLoanTypeFlag('hl');
                                    }
                                    else if (hl > 0 && pl == 0 && lap == 0){
                                        //hl
                                        setLoanTypeFlag('hl');
                                    }
                                    else if (hl = 0 && pl == 0 && lap == 0){
                                        //hl
                                        setLoanTypeFlag('You have no loans from us');
                                    }
                              }
                          }).error(function(data) {
                                if(data.cd == '511'){
                                    setLoanTypeFlag("You have no loans from us");
                                    setLoanAvailFlag("You have no loans from us");
                            } else {
                                    setLoanTypeFlag("Sorry, Our machines are not talking to each other! Please try in a while");
                                    setLoanAvailFlag("Sorry, Our machines are not talking to each other! Please try in a while");
                            }
                          });
        }*/


        //to handle mobile back events
        gadgets.pubsub.subscribe("native.back", function() {
            if ($scope.mVisaFlag == true) {
                gadgets.pubsub.publish("launchpad-retail.mvisaQrcodeScan");
                resetMVisaLoginFlag();
            }
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if ($scope.mVisaFlag == true) {
                gadgets.pubsub.publish("launchpad-retail.mvisaQrcodeScan");
                resetMVisaLoginFlag();
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        /*New development change request Developed by PwC*/



        /*New development change request Developed by PwC*/
    }
    /**
     * Export Controllers
     */
    exports.loginController = loginController;
});