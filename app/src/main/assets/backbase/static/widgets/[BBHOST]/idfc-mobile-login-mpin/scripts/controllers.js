/**
 * Controllers
 * 
 * @module controllers
 */
define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    /*(change is switch)Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it*/
    var uiSwitch = require('uiSwitch');
    var angularTouch = require('angular-touch');
    //var focusIf = require('focus-if');
    //var pluginObj = require('plugin');
    //alert('focus '+focusIf);
    /**
     * Main controller
     *
     * @ngInject
     * @constructor
     */
    var fingerPrintLoggin = 'false';

    // password encrypt changes
    var enciphering = require('./support/production/angular-rsa-encrypt');
    var readKey = require('./support/rsaKeySetup/rsaKeySetup');

    function MpinController($scope, $http, i18nUtils, lpCoreUtils, lpWidget,
        $window, lpPortal, lpCoreBus, $location, $timeout, $document, CQService) {
        $scope.errorSpin = true;
        $scope.notificationToken = '';
        //$scope.mpinloginScreen = true;
        $scope.getFilePath = function() {
            var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);

            $scope.lineTopImg = path + '/media/lineTOp.png';
            $scope.idfcLogo = path + '/media/IDFC-logo.gif';
            $scope.validateMpinUser = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('validateMpinUser'));
            // $scope.updateUserPreferenceURL  = 'https://my.idfcbank.com/rs/updateUserPreference';

        }

        // RSA changes by Xebia start
        var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('rsaAnalyzeService'));
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getCQUrl'));
        var verifyRsaLoginURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('verifyRSALoginService'));
        $scope.challengeQuestion = {};
        $scope.challengeQuestionCounter = 0;
        $scope.showUserNamePassword = true;
        $scope.showWrongAnswerMessage = false;
        $scope.hideQuesFlag = true;
        $scope.showMpin = true;

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

        var setdeviceprint = function() {
            return encode_deviceprint();
        };

        $scope.forgotMpin = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('launchpad-forgotmpin');
                localStorage.setItem('showLink', 'false');
            }, 500);
        };


        $scope.setUPiFlag = function() {
            console.log('setUPIFlag');
            var globalVariablePluginSetAsset = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePluginSetAsset) {
                globalVariablePluginSetAsset.setUPIFlag(null, null, "true");
                console.log('test set upi');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        /*Taral Version 4 - start */
        $scope.goToCreateDebitCard = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('launchpad-retail.goToCreateDebitCard');
            }, 500);
        };
        /*Taral Version 4 - End */

        $scope.goToApplyNow = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('launchpad-retail.goToApplyNow');
            }, 500);
        };


        $scope.goToNotification = function() {
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('launchpad-retail.goToNotification');
            }, 500);
        };

        $scope.mobileNo = '';

        $scope.displaySplash = false;
        $scope.OTPModalShown = false;
        $scope.showManuaOTPPage = false;
        $scope.showInitalPage = true;
        $scope.showTimerPage = false;
        $scope.contactCallCenterLink = false;
        $scope.loginLink = false;
        $scope.sentupMPINLink = false;

        $scope.NewPinNumbers = [1, 2, 3, 4];
        $scope.reEnterPinNumbers = [5, 6, 7, 8];
        $scope.pinNumber = {};
        $scope.filled = 0;
        $scope.vals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        $scope.count = 0;

        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        $http.defaults.headers.post['Accept'] = 'application/json';
        $http.defaults.headers.post['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        $http.defaults.headers.post['Pragma'] = 'no-cache';
        $http.defaults.headers.post['Expires'] = '0';


        $scope.showAppUpgradeMsg = false;

        $scope.showValidationMsg = false;
        $scope.showBioMetricAuth = false;
        $scope.OTPModalShown = false;
        $scope.oldPinNumbers = [1, 2, 3, 4];
        $scope.NewPinNumbers = [5, 6, 7, 8];
        $scope.reEnterPinNumbers = [9, 10, 11, 12];
        $scope.pinNumber = {};
        $scope.filled = 0;
        $scope.vals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        $scope.count = 0;
        var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
        $scope.toggleImg = path + '/media/switch.gif';
        $scope.loginFpSrvcFail = 'Sorry our machines are not talking to each other. Humans are trying to fix the problem. Please come back in a few moments';

        $scope.templates = {
            appUpgradeMsg: 'templates/partial/appUpgradeMsg.html',
            OTPVerify: 'templates/partial/otppopup.html',
            showBioMetricAuthMsg: 'templates/partial/bioMetricAuthMsg.html'
        };

        /*gadgets.pubsub.subscribe("APPMPINFOCUS", function(data){
            alert('subscribe');
            if(data['data'] == true){
              $timeout(function() {
                var item = angular.element(document.querySelector('#mpinValu1'));
                alert(item.html);
                item.focus();
               } , 1500);
            }
         });*/

        $scope.init = function() {
            //check is mVisaLogin Flag is true dont show 4links and scan and pay button
            $scope.checkMVisaLoginFlag();

            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            //$scope.mpinFlag = false;
            /*(change is IntOnOff=false)Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it */
            $scope.IntOnOff = true;
            if (globalVariablePlugin) {
                var isMpinSuccessCallback = function(data) {
                    console.log('success: ' + JSON.stringify(data));
                    if (data['mpinFlag'] == 'true') {
                        console.log('inside if success: ' + JSON.stringify(data));
                        $scope.mpinFlag = true;
                    } else {
                        console.log('inside else success: ' + data['mpinFlag']);
                        $scope.mpinFlag = false;
                        console.log('Failure: ' + JSON.stringify(data));
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

            //$scope.errorSpin=true;
            //var checkCustomerExistUrlDummy = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('checkCustomerExistUrl'));
            //This has been added to call a service on start of page as if actual service if called first gives error same also done in Sign-in
            var checkCustomerExistUrlDummy = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('validateMpinUser'));
            var postDataDummy = {
                'mpin': "Dummy"
            };

            var checkCustomerExistDummy = $http.post(checkCustomerExistUrlDummy, lpCoreUtils.buildQueryString(postDataDummy), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            checkCustomerExistDummy.success(function() {}).error(function(data) {
                console.log('Check Customer Exist');
            });
            $timeout(function() {
                $scope.errorSpin = false;
                $scope.initialize();
            }, 1500);

            $scope.notificationSend();

        };

        $scope.initialize = function() {
            $scope.getFilePath();
            localStorage.setItem('isMpinLogin', 'true');
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            globalVariablePlugin.setNavigateToProfile(null, null, ''); //3.5 change
            if (globalVariablePlugin) {
                var getDeviceFootPrintHeaderSuccessCallback = function(data) {
                    if (data) {
                        console.log('Device ' + JSON.stringify(data));
                        var jsonObj = {
                            'deviceId': data['deviceId'],
                            'channel': data['channel'],
                            'ipAddress': data['ipAddress'],
                            'timeZone': data['timeZone'],
                            'nwProvider': data['nwProvider'],
                            'connectionMode': data['connectionMode'],
                            'geoLatitude': data['geoLatitude'],
                            'geoLongitude': data['geoLongitude']
                        };
                        $scope.msgHeader = JSON.stringify(jsonObj);
                        console.log($scope.msgHeader);

                    } else {
                        console.log('Failure: ' + JSON.stringify(data));
                    }
                };
                var getDeviceFootPrintHeaderCallback = function(data) {
                    console.log('Something really bad happened');
                };

                globalVariablePlugin.getDeviceFootPrintHeader(
                    getDeviceFootPrintHeaderSuccessCallback,
                    getDeviceFootPrintHeaderCallback
                );

            } else {
                console.log('globalVariablePlugin is ' + globalVariablePlugin);
            }

            /*Check Finger Print Capability/ Set up is exist or not */

            $scope.authenticate = function() {
                var fingerPrintPlugin = cxp.mobile.plugins['fingerPrintPlugin'];
                if (fingerPrintPlugin) {
                    var isSensorSuccessCallback = function(data) {
                        console.log('authenticate finger print data' + data);
                        if (data) {
                            if (data['startSensor'] == true) {
                                console.log('Sensor Started : ' + data['startSensor'] + '\n Message: ' + data['message']);
                                fingerPrintLoggin = 'true';

                                //Subscribing for the authentication call back method
                                gadgets.pubsub.subscribe("fp.auth.result", function(evt) {
                                    /*alert('Authenticaiton Result \n Success Flag: ' + evt.successFlag + '\n Fp Token: '+ evt.fpToken +
                                     'Should user Try again: '+ evt.tryAgain + '\n Use MPIN: ' +evt.useMPIN+ '\n FP registration Missing? :' +evt.noFP+
                                     '\n Message: '+evt.message);*/
                                    if (evt.successFlag == true) {
                                        $scope.redirectToBioMetricAuth(evt.fpToken);
                                    }


                                });
                            } else {
                                console.log('Error: Scenario is not coded');
                            }
                        } else {
                            console.log('Fatal Error: Cant be recovered');
                        }
                    };
                    var isSensorErrorCallback = function(data) {

                        //Somethign failed
                        //1. No Fingerprint setup
                        //2. No Registered fingerprint
                        //3. Could not start sendor
                        console.log('Error : ' + data['startSensor'] + '\n Message: ' + data['message']);
                    };
                    fingerPrintPlugin.authenticateUser(
                        isSensorSuccessCallback,
                        isSensorErrorCallback
                    );
                }
            }

            $scope.authenticate();
            /*Check Finger Print Capability/ Set up is exist or not */

            /*New development change request Developed by PwC*/
            $scope.loadPage = function() {
                $scope.mpinRegDevice = localStorage.getItem('mpinRegDevice');
                console.log('$scope.mpinRegDevice :: ' + $scope.mpinRegDevice);
                console.log('$scope.mpinFlag :: ' + $scope.mpinFlag);
                if ($scope.mpinRegDevice == 'true' || $scope.mpinFlag) {
                    console.log('if $scope.mpinRegDevice :: ' + $scope.mpinRegDevice);
                    $scope.mpinloginScreen = true;
                } else {
                    $scope.mpinSetupScreen = true;
                    console.log('else $scope.mpinRegDevice :: ' + $scope.mpinRegDevice);
                }
                //angular.element(document.querySelector('#mpinValu1')).focus();
            }

            $scope.loadPage();
            /* $scope.setFocus= function(){
                 //alert('Hi focus' +angular.element(document.querySelector('#mpinValue')));
                 var item = angular.element(document.querySelector('#mpinValu1'));
                 alert(item.html);
                 item.focus();
             }*/
            $timeout(function() {
                if (fingerPrintLoggin == 'false') {
                    var item = angular.element(document.querySelector('#mpinValu1'));
                    //alert(item.html);
                    item.focus();
                }
            }, 1500);
            /*New development change request Developed by PwC*/
        }

        $scope.changeMpin = function() {
            gadgets.pubsub.subscribe('launchpad-mpinchange');
        }


        $scope.openValidationDialog = function(msg) {
            var elements = $('[show=\'showAppUpgradeMsg\']');
            if (elements.removeClass) {
                elements.removeClass('ng-hide');

            }


            $scope.showValidationMsg = true;
            $scope.validationMsg = msg;
            //calling native popup
            //$scope.showAppUpgradeMsg = true;
            gadgets.pubsub.publish("display.1btn.popup", {
                data: "LOGINVALDIALG",
                message: msg
            });

        };

        $scope.closeBioMetricMsg = function() {
            $scope.showBioMetricAuth = false;
        }

        /*Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it*/
        $scope.triggerClickEvent = function() {
            console.log('Inside triggerClickEvent function');
            var toggleSwitch = angular.element('#toggleSwitch');
            if (angular.isDefined(toggleSwitch)) {
                console.log('click event is about to be triggered');
                $timeout(function() {
                    angular.element('#toggleSwitch').triggerHandler('click');
                }, 5);
            }
        }
        /*Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it*/
        /*This function will be invoked on successful bio auth authentication*/
        /**********************______TARAL TO BE COPIED START----------********************/

        $scope.redirectToBioMetricAuth = function(fpToken) {
            // password change
            var pubKey, exp, mod;
            pubKey = readKey.getValues("publicKeyValue");
            exp = readKey.getValues("exp");
            mod = readKey.getValues("mod");
            enciphering.setEncodeKey(pubKey, mod, exp);
            //  console.log(enciphering.setEncrpt(vc.user.password));
            fpToken = enciphering.setEncrpt(fpToken);
            var postData = {
                'msgHeader': $scope.msgHeader,
                'mpin': fpToken,
                'txnType': 'BMAUTH'
            };
            postData = $.param(postData || {});

            $scope.errorSpin = true;
            var restCall = $http({
                method: 'POST',
                url: $scope.validateMpinUser,
                data: postData
            });


            restCall.success(function(data, header) {
                console.log('data  :: ' + data);
                //$scope.errorSpin = false;

                /** Mobile 2.5 **/
                //if (data.data.authenticationFlag) {
                //Handle login call

                if (data.type1 != null) {
                    //Adding call fro handle login similar to Sign IN to check session and load username
                    //lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('sessionUrl'))
                    if (data.type1 == "" || data.type1 == null || data.type1 == undefined) {
                        gadgets.pubsub.publish("BlankUserType");
                        $scope.errorSpin = false;
                        return;
                    }
                    $scope.decideUserType(data);
                    $scope.analyzeUser(data);

                } else if (data.msgHeader.deviceBlockFlag == true) {
                    var msg = data.msgHeader.deviceBLockErrMsg;
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "DVCEBLCKLIST",
                        message: msg
                    });
                    $scope.contactCallCenterLink = false;
                    $scope.loginLink = false;
                    $scope.sentupMPINLink = false;
                    $scope.errorSpin = false;
                } else if (data.data.errCode == 'AUTHERR001') {
                    var msg = data.data.errMsg;
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "AUTHERR001",
                        message: msg
                    });
                    $scope.contactCallCenterLink = false;
                    $scope.loginLink = true;
                    $scope.sentupMPINLink = true;
                    $scope.errorSpin = false;
                } else if (data.data.errCode == 'AUTHERR002') {
                    var msg = data.data.errMsg;
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "AUTHERR002",
                        message: msg
                    });
                    $scope.contactCallCenterLink = false;
                    $scope.loginLink = false;
                    $scope.sentupMPINLink = false;
                    $scope.errorSpin = false;
                    //$scope.mpinSetupScreen=false;
                    $scope.resetInError();
                } else if (data.data.errCode == 'AUTHERR003' || data.data.errCode == 'AUTHERR010') {
                    //Change done for defect
                    var msg = data.data.errMsg;
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.3btn.popup", {
                        data: "AUTHERR003",
                        message: msg
                    });
                    $scope.contactCallCenterLink = true;
                    $scope.loginLink = true;
                    $scope.sentupMPINLink = true;
                    $scope.errorSpin = false;
                } else if (data.data.errCode == 'AUTHERR004') {
                    var msg = data.data.errMsg;
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "AUTHERR004",
                        message: msg
                    });
                    $scope.contactCallCenterLink = false;
                    $scope.loginLink = false;
                    $scope.sentupMPINLink = false;
                    $scope.errorSpin = false;
                } else if (data.data.errCode == 'AUTHERR005') {
                    var msg = data.data.errMsg;
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "AUTHERR005",
                        message: msg
                    });
                    $scope.contactCallCenterLink = false;
                    $scope.loginLink = false;
                    $scope.sentupMPINLink = false;
                    $scope.errorSpin = false;
                } else if (data.data.errCode != null) {
                    var msg = data.data.errMsg;
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "AUTHERR00X",
                        message: msg
                    });
                    $scope.contactCallCenterLink = false;
                    $scope.loginLink = false;
                    $scope.sentupMPINLink = false;
                    $scope.errorSpin = false;
                } else {
                    console.log('data in else::' + JSON.stringify(data));
                    if (data.msgHeader.errorCode != null) {
                        var msg = data.msgHeader.errorMessage;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "VALMPINERR1",
                            message: msg
                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                    } else {
                        var msg = 'Sorry our machines are not talking to each other. Humans are trying to fix the problem. Please come back in a few moments';
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "VALMPINTIMEOUT1",
                            message: msg

                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                        $scope.resetInError();
                    }
                }
                $scope.reset();
            });
            restCall.error(function(headers1, data) {
                $scope.errorSpin = false;
                //5088Defect
                if (data == "") {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    $scope.validationMsg = $scope.idfcConstants.CHANGE_MPIN_SVC_FAIL;
                    //Calling native popup
                    //$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "CHNGMPINERR",
                        message: $scope.loginFpSrvcFail
                    });
                }

            });
        }

        /**********************______TARAL TO BE COPIED END----------********************/

        $scope.openOtpDialog = function(msg) {
            $scope.alertMsg = msg;
            //calling native popup
            //$scope.OTPModalShown = true;
            /*gadgets.pubsub.publish("display.1btn.popup",{
                data:"OPENOTPDIALOG",
                message: 'Do you want to allow IDFC bank to read the message and automatically fill in the OTP?'
            });*/
        };

        $scope.notificationSend = function() {
            console.log('Inside notificationSend');
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];

            if (globalVariablePlugin) {
                var getFCMNotificationTokenSuccessCallback = function(data) {
                    if (data) {
                        $scope.notificationToken = data['notificationToken'];
                        console.log('Inside notificationSend' + $scope.notificationToken);

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
                                    var updateUserPreferenceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateUserPreference'));

                                    //  var updateUserPreferenceURL = 'https://my.idfcbank.com/rs/updateUserPreference';

                                    postData = $.param(postData || {});
                                    console.log('Post Data', postData);
                                    var serviceCall = $http({
                                        method: 'POST',
                                        url: updateUserPreferenceURL,
                                        data: postData
                                    });
                                    serviceCall.success(function(headers, data) {
                                        console.log('Success', JSON.stringify(headers));

                                    });
                                    serviceCall.error(function(headers, data) {
                                        console.log('Error', JSON.stringify(headers));

                                    });

                                } else {
                                    console.log('Failure: ' + JSON.stringify(data));
                                }
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

        $scope.navigateToMpinSetUp = function() {
            gadgets.pubsub.publish('launchpad-setupmpin');
        }

        $scope.navigateToLogin = function() {
            console.log('in navigate Username' + $document[0].activeElement.id);
            $timeout(function() {
                var item = $document[0].activeElement;
                if (!angular.isUndefined(item)) item.blur();
                gadgets.pubsub.publish('getBackToLoginScreen');
            }, 500);
            // $timeout($document[0].activeElement.blur() , 500);

        }

        //mvisa-clear flag to clear earlier scanned qr or key entry data if app killed or repopend
        var resetScanAndPayFlag = function() {
            console.log("called clearScanAndPayFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1) {
                globalVariablePlugin1.clearScanAndPayFlag(null, null, '');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var resetMVisaLoginFlag = function() {
            console.log("called resetMVisaLoginFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1) {
                globalVariablePlugin1.clearMVisaLoginFlag(null, null, '');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        $scope.keydownevt = function() {
            //alert('keydownevt :: '+event.keyCode);
            var mpinValue = '';
            var item = '';
            //if(event.keyCode == 9){
            for (var i = 1; i < 5; i++) {
                item = angular.element(document.querySelector('#mpinValu' + i)).val();
                console.log('item::' + item);
                if (!angular.isUndefined(item) && item != '') {
                    mpinValue = mpinValue + item;
                } else {
                    console.log('else item::' + item);
                    return false;
                }
            }
            //alert('mpinValues :: ' +mpinValue);
            $scope.nextPin(mpinValue);
            //}
        };
        //migration 3.5
        $scope.closeAlert = function() {
            $scope.bibAusAlertRestrict = false;
            gadgets.pubsub.publish("closeAppForAus"); //3.5 change
        };


        $scope.nextPin = function(val) {
            //alert('$scope.nextPin ' +val);
            // password change
            var pubKey, exp, mod;
            pubKey = readKey.getValues("publicKeyValue");
            exp = readKey.getValues("exp");
            mod = readKey.getValues("mod");
            enciphering.setEncodeKey(pubKey, mod, exp);
            //  console.log(enciphering.setEncrpt(vc.user.password));
            val = enciphering.setEncrpt(val);
            var postData = {
                'msgHeader': $scope.msgHeader,
                'mpin': val,
                'txnType': 'MAUTH'
            };
            postData = $.param(postData || {});

            $scope.errorSpin = true;
            var restCall = $http({
                method: 'POST',
                url: $scope.validateMpinUser,
                data: postData
            });

            restCall.success(function(data, header) {
                console.log('data in success::' + JSON.stringify(data));
                //$scope.errorSpin = false;
                if (null != data) {

                    //if (data.data.authenticationFlag == true) {
                    // New code given by Neha// for Mobile 2.5
                    if (data.type1 != null) {
                        //adding lalita migration 3.5
                        var isIndividual = data.isIndividual;
                        if ((typeof isIndividual !== 'undefined') && (isIndividual !== null) && (isIndividual == 'N')) {
                            $scope.errorSpin = false;
                            $scope.bibAusAlertRestrict = true;
                            return;
                        }
                        //end migration
                        //Adding call fro handle login similar to Sign IN to check session and load username
                        //lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('sessionUrl'))

                        if (data.type1 == "" || data.type1 == null || data.type1 == undefined) {
                            gadgets.pubsub.publish("BlankUserType");
                            $scope.errorSpin = false;
                            return;
                        }
                        $scope.decideUserType(data);
                        $scope.analyzeUser(data);

                    } else if (data.msgHeader.deviceBlockFlag == true) {
                        var msg = data.msgHeader.deviceBLockErrMsg;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "DVCEBLCKLIST",
                            message: msg
                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                    } else if (data.data.errCode == 'AUTHERR001') {
                        var msg = data.data.errMsg;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "AUTHERR001",
                            message: msg
                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = true;
                        $scope.sentupMPINLink = true;
                        $scope.errorSpin = false;
                    } else if (data.data.errCode == 'AUTHERR002') {
                        var msg = data.data.errMsg;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "AUTHERR002",
                            message: msg
                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                        //$scope.mpinSetupScreen=false;
                        $scope.resetInError();
                    } else if (data.data.errCode == 'AUTHERR003' || data.data.errCode == 'AUTHERR010') {
                        //Change done for defect
                        var msg = data.data.errMsg;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.3btn.popup", {
                            data: "AUTHERR003",
                            message: msg
                        });
                        $scope.contactCallCenterLink = true;
                        $scope.loginLink = true;
                        $scope.sentupMPINLink = true;
                        $scope.errorSpin = false;
                    } else if (data.data.errCode == 'AUTHERR004') {
                        var msg = data.data.errMsg;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "AUTHERR004",
                            message: msg
                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                    } else if (data.data.errCode == 'AUTHERR005') {
                        var msg = data.data.errMsg;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "AUTHERR005",
                            message: msg
                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                    } else if (data.data.errCode != null) {
                        var msg = data.data.errMsg;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "AUTHERR00X",
                            message: msg
                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                    }

                } else {
                    console.log('data in else::' + JSON.stringify(data));
                    if (data.msgHeader.errorCode != null) {
                        var msg = data.msgHeader.errorMessage;
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "VALMPINERR1",
                            message: msg
                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                    } else {
                        var msg = 'Sorry our machines are not talking to each other. Humans are trying to fix the problem. Please come back in a few moments';
                        //$scope.openOtpDialog(msg);
                        gadgets.pubsub.publish("display.1btn.popup", {
                            data: "VALMPINTIMEOUT1",
                            message: msg

                        });
                        $scope.contactCallCenterLink = false;
                        $scope.loginLink = false;
                        $scope.sentupMPINLink = false;
                        $scope.errorSpin = false;
                        $scope.resetInError();
                    }
                }
                $scope.reset();
            });
            restCall.error(function(data) {
                console.log('data in error::' + JSON.stringify(data));
                $scope.errorSpin = false;
                //5088Defect
                if (data == "") {
                    gadgets.pubsub.publish("no.internet");
                } else if (data.msgHeader != null && data.msgHeader.error != null && data.msgHeader.error.errorCode != null) {
                    var msg = data.msgHeader.error.errorMessage;
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "VALMPINSVCERR",
                        message: msg
                    });
                    $scope.contactCallCenterLink = false;
                    $scope.loginLink = false;
                    $scope.sentupMPINLink = false;
                } else {
                    var msg = 'Sorry our machines are not talking to each other. Humans are trying to fix the problem. Please come back in a few moments';
                    //$scope.openOtpDialog(msg);
                    gadgets.pubsub.publish("display.1btn.popup", {
                        data: "VALMPINTIMEOUT2",
                        message: msg
                    });
                    $scope.contactCallCenterLink = false;
                    $scope.loginLink = false;
                    $scope.sentupMPINLink = false;
                }

                $scope.reset();
            });

            //redirection for blocked mpin to Login with username and password
            gadgets.pubsub.subscribe("LOGINUSRPWD", function() {
                gadgets.pubsub.publish('getBackToLoginScreen');
            });

            //redirection for blocked mpin to Forgot mpin
            gadgets.pubsub.subscribe("FORGOTMPIN", function() {
                gadgets.pubsub.publish('launchpad-forgotmpin');
            });
        };
        // For Login type decide as per code given by Neha // For Mobile 2.5
        $scope.decideUserType = function(data) {

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


        }

        // analyze method by Xebia
        $scope.analyzeUser = function(data) {
            $scope.rsaData = {
                'transaction': 'login',
                'resendOTP': false
            };
            $scope.rsaData.devicePrint = setdeviceprint();
            // to fetch mobile specific data
            /* gadgets.pubsub.publish("getMobileSdkData");
             gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
               $scope.mobileSdkData = response.data;
             });*/
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

                // RSA changes by Xebia starting
                if (resData.actionStatus === 'DENY' || resData.userStatus === 'LOCKOUT' || resData.userStatus === 'DELETE') {
                    $scope.loginerror = "Login failed! Kindly call on 1800 410 4332 for assistance.";
                    $scope.errorSpin = false;
                } else if (resData.actionStatus === 'ALLOW' && (resData.userStatus !== 'DELETE')) {
                    $scope.errorSpin = true;
                    $scope.successfulLogin();
                } else if (resData.actionStatus === 'CHALLENGE' && (resData.userStatus === 'VERIFIED' || resData.userStatus === 'UNLOCKED')) {
                    var postdata = {};
                    $scope.loginerror = CQService.CHALLENGE_MESSAGE;;
                    $scope.challengeQuestionCounter++;
                    $scope.challengeQuestions = resData.challengeQuestionList[0].questionText;
                    $scope.challengeQuestionsId = resData.challengeQuestionList[0].questionId;
                    $scope.showMpin = false;
                    $scope.hideQuesFlag = false;
                    $scope.showQuestionDiv = true;
                } else if (resData.actionStatus === 'CHALLENGE' && (resData.userStatus === 'UNVERIFIED' || resData.userStatus === 'NOTENROLLED')) {
                    $scope.errorSpin = false;
                    gadgets.pubsub.publish('openCQ');

                }
                // RSA changes by Xebia ends

            });
            res.error(function(resdata) {
                $scope.loginerror = resdata.rsn;
                $scope.errorSpin = false;
            });

        };

        $scope.successfulLogin = function() {
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

                    //SBO2 Yushae PwC setting mode of login
                    var globalVariablePluginSetLogin = lpWidget.features['GlobalVariables'];
                    if (globalVariablePluginSetLogin) {
                        globalVariablePluginSetLogin.setLoginType(null, null, 'MPINLOGIN');
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
        };

        // verify challenge question answer function by Xebia
        $scope.verifyRsaLogin = function() {
            $scope.errorSpin = true;
            $scope.postDataVerify = {
                'credentialType': 'QUESTION',
                'transaction': 'login',
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
                    $scope.successfulLogin();
                } else {
                    if ($scope.challengeQuestionCounter <= 2) {
                        $scope.loginerror = CQService.WRONG_CQ_ANSWER;;
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
                $scope.loginerror = data.rsn;
                $scope.errorSpin = false;
                $scope.hideQuesFlag = true;
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
                $scope.showMpin = false;
            })
            xhr.error(function(error) {
                $scope.loginerror = error.rsn;
                $scope.errorSpin = false;
            })
        };


        var setAssetFlag = function(assetFlagValue) {
            console.log("called setAssetFlag:", assetFlagValue);
            var globalVariablePluginSetAsset = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePluginSetAsset) {
                globalVariablePluginSetAsset.setAssetFlag(null, null, assetFlagValue);
                console.log('test set assets');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var setLoanTypeFlag = function(loanTypeValue) {
            console.log("called setLoanTypeFlag:", loanTypeValue);
            var globalVariablePluginSetLoanType = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePluginSetLoanType) {
                globalVariablePluginSetLoanType.setLoanTypeFlag(null, null, loanTypeValue);
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var setLoanAvailFlag = function(loanAvailFlag) {
            console.log("called setLoanAvailFlag:", loanAvailFlag);
            var globalVariablePluginSetLoanAvail = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePluginSetLoanAvail) {
                globalVariablePluginSetLoanAvail.setLoanAvailFlag(null, null, loanAvailFlag);
                console.log('Loan avail flag true:', loanAvailFlag);
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        var setHSData = function(hsFlag) {
            console.log("called setHSData:", hsFlag);
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1) {
                globalVariablePlugin1.setHSFlag(null, null, hsFlag);
                //console.log('Loan avail flag true:',loanAvailFlag);
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }


        /** end **/




        $scope.setValue = function(mpinValue) {

        };

        $scope.reset = function() {
            for (var i = 1; i < 5; i++) {
                var item = angular.element(document.querySelector('#mpinValu' + i));
                item.val('');
            }
        };

        $scope.resetInError = function() {
            for (var i = 1; i < 5; i++) {
                var item = angular.element(document.querySelector('#mpinValu' + i));
                if (i == 1) item.focus();
                item.val('');
            }
        };


        $scope.openExistingCreateUser = function() {
            gadgets.pubsub.publish('launchpad-user-registration');
            //$window.location.replace($scope.createUsername );
        }

        $scope.setupMpin = function() {
            //Here it actually calls forgot MPIN Fall
            gadgets.pubsub.publish('launchpad-forgotmpin');
        }

        $scope.openExistingLogin = function() {
            //alert('fdfslkjd');
            //console.log('label click');
            gadgets.pubsub.publish('getBackToLoginScreen');
            //$window.location.replace($scope.existingLogin );
        };

        $scope.hideVersionDescSection = function() {
            $scope.showVersionDescription = false;
        };


        $scope.closeApp = function() {
            var globalVariablePlugin1Reset = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1Reset) {
                globalVariablePlugin1Reset.resetDevice(null, null, 'true');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        };

        $scope.removeLatest = function() {
            console.log('ss');
            $scope.count--;
            if ($scope.count < 0) {
                $scope.count = 0;
            }
            // alert($scope.count);
            var listItem = document.getElementsByName('oldmpinslot');
            listItem[$scope.count].value = '';
            listItem[$scope.count].style.backgroundColor = 'white';
            listItem[$scope.count].style.color = '#c8cccf';
        };

        $scope.populatePin = function(listItem, filled, mpinValue) {
            var newNums = '';
            filled = 0;
            for (var i = 0; i < listItem.length; i++) {
                newNums = listItem[i * 1].value;
                if (newNums == '') {
                    // alert(mpinValue);
                    listItem[i].value = mpinValue;
                    listItem[i].style.backgroundColor = 'black';
                    listItem[i].style.color = 'black';
                    // alert();
                    break;
                }
            }
            for (var i = 0; i < listItem.length; i++) {
                newNums = listItem[i * 1].value;
                if (newNums != '') {
                    filled = filled + 1;
                }
            }
            /**
             * Populate color
             */

            return filled;
        };


        //after scan and pay on login page..if mvisaFlag true-hide scan and pay btn and 4 links and show back btn
        $scope.checkMVisaLoginFlag = function() {
            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin) {
                var isMVisaLoginSuccessCallback = function(data) {
                    console.log('success: ' + JSON.stringify(data));
                    if (data['mVisaFlag'] == 'true') {
                        console.log('inside if success: ' + JSON.stringify(data));
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

        /** Added by Kriti PwC- for mVisa */
        $scope.scanAndPay = function() {
            console.log("scanAndPay called");
            //localStorage.setItem("navigationFlag", true);
            //localStorage.setItem("origin", "login-page");
            resetScanAndPayFlag();
            gadgets.pubsub.publish("launchpad-retail.mvisaQrcodeScan");
        }
        /** Added by Kriti PwC- for mVisa */

        //mvisa-clear flag to break mvisa flow-show four limks and menu icon
        var resetMVisaLoginFlag = function() {
            console.log("called clearMVisaLoginFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1) {
                globalVariablePlugin1.clearMVisaLoginFlag(null, null, '');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

        //mvisa-clear flag to clear earlier scanned qr or key entry data if app killed or repopend
        var resetScanAndPayFlag = function() {
            console.log("called clearScanAndPayFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin1) {
                globalVariablePlugin1.clearScanAndPayFlag(null, null, '');
            } else {
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }


        $scope.init();
        //$scope.autoFocus();
        //Fixed Defect 5238

        //to handle mobile back events
        gadgets.pubsub.subscribe("native.back", function() {
            console.log("native.back handled in mpinlogin");
            if ($scope.mVisaFlag == true) {
                gadgets.pubsub.publish("launchpad-retail.mvisaQrcodeScan");
                resetMVisaLoginFlag();
            }
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            console.log("device back GoBackInitiate handled in mpinloginCtrl");
            if ($scope.mVisaFlag == true) {
                gadgets.pubsub.publish("launchpad-retail.mvisaQrcodeScan");
                resetMVisaLoginFlag();
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        $timeout(function() {
            gadgets.pubsub.publish('cxp.item.loaded', {
                id: widget.id
            });
        }, 10);
    }

    /**
     * Export Controllers
     */
    exports.MpinController = MpinController;

});