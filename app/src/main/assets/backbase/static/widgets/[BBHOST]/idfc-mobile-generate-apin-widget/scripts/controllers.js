define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');
    var UCIC_LENGTH = idfcConstants.UCIC_LENGTH;
    var ERR_NO_MOBILE_REGISTERED = idfcConstants.ERR_NO_MOBILE_REGISTERED;
    var DEBIT_CARD_CVV_LENGTH = idfcConstants.DEBIT_CARD_CVV_LENGTH;
    var OTP_SUCCESS_MESSAGE = idfcConstants.OTP_SUCCESS_MESSAGE;
    var DEBIT_CARD_LENGTH = idfcConstants.DEBIT_CARD_LENGTH;

    function pinController(WidgetModel, lpWidget, lpCoreUtils,
        lpCoreError, $scope, i18nUtils, widget, $http, httpService,
        lpCoreBus, $timeout, lpPortal) {
        gadgets.pubsub.subscribe(
            'launchpad-retail.goToCreateDebitCard');

        this.model = WidgetModel;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        var ALERT_TIMEOUT = 9000;
        var getExpiryYearList = function() {
            $scope.databaseService = httpService.getInstance({
                endpoint: lpWidget.getPreference(
                    'databaseServicesDataSrc'),
                urlVars: {
                    requestId: 'expiryYear'
                }
            });
            $scope.errorSpin = true;
            var xhr = $scope.databaseService.read();
            xhr.success(function(data) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    $scope.expiryYearList = data.expiryYearList;
                    $scope.expiryYearList.unshift(
                        'Select');
                    $scope.control.expiryYear.value =
                        $scope.expiryYearList[0];
                    $scope.control.expiryMonth.value =
                        $scope.expiryMonthList[0];
                } else {
                    $scope.expiryYearList = [];
                    $scope.expiryMonthList = [];
                    $scope.control.expiryYear.value =
                        $scope.expiryYearList[0];
                    $scope.control.expiryMonth.value =
                        $scope.expiryMonthList[0];
                }
            });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                if (data.cd) {
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
                $scope.expiryYearList = [];
                $scope.expiryMonthList = [];
                $scope.control.expiryYear.value =
                    $scope.expiryYearList[0];
                $scope.control.expiryMonth.value =
                    $scope.expiryMonthList[0];
            });
            return xhr;
        };
        var initialize = function() {

            $('.generateApin-panelwidth').closest(
                '.lp-launcher-area').css('max-width',
                '630px');
            getExpiryYearList();
            $scope.customerIDServiceEndPoint = lpWidget.getPreference(
                'customerIDService');
            $scope.debitCardServiceEndPoint = lpWidget.getPreference(
                'debitCardService');
            $scope.enquireCardNumberServiceEndPoint = lpWidget.getPreference(
                'enquireDebitCardNumberService');
            $scope.encryptAPINServiceEndPoint = lpWidget.getPreference(
                'encryptAPINService');
            $scope.generateAPINServiceEndPoint = lpWidget.getPreference(
                'generateAPINService');
            $scope.generateOTPServiceEndPoint = lpWidget.getPreference(
                'generateOTPService');
            $scope.verifyOTPServiceEndPoint = lpWidget.getPreference(
                'verifyOTPService');
            $scope.databaseServiceEndPoint = lpWidget.getPreference(
                'databaseServicesDataSrc');
            $scope.getCardBinList();
            $scope.OTPFlag = true;
            $scope.errors = {};
            $scope.showDebitForm = false;
            $scope.openConfirmAPIN = false;
            $scope.showSuccessForm = false;
            $scope.customerMob = '';
            $scope.customerMobMasked = '';
            $scope.lockFields = false;
            $scope.expiryYearList = [];
            $scope.expiryMonthList = ['Select', '01', '02',
                '03', '04', '05', '06', '07', '08', '09',
                '10', '11', '12'
            ];
            $scope.serviceError = false;
            $scope.modulus = '';
            $scope.exponent = '';
            $scope.randomNumber = '';
            $scope.encryptedPinBlock = '';
            $scope.encryptedParam = '';
            $scope.encryptedAPIN = '';
            $scope.errorSpin = false;
            $scope.cancelTransaction = false;
			$scope.OTPError = false;
            $scope.control = {
                cardNumber: {
                    value: '',
                    errors: [],
                    loading: false
                },
                expiryMonth: {
                    value: '',
                    errors: [],
                    loading: false
                },
                otpValue : '',
                expiryYear: {
                    value: '',
                    errors: [],
                    loading: false
                },
                cvv: {
                    value: '',
                    errors: [],
                    loading: false
                },
                CardHolderName: {
                    value: '',
                    errors: [],
                    loading: false
                },
                apin: {
                    value: '',
                    errors: [],
                    loading: false
                },
                confirmApin: {
                    value: '',
                    errors: [],
                    loading: false
                },
                ucic: {
                    value: '',
                    errors: [],
                    loading: false
                },
                acceptTnC: false
            };
            $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(
                lpWidget) + '/templates/partials';
            $scope.templates = {
                confirm: $scope.partialsDir +
                    '/ConfirmAPIN.html',
                acceptTandC: $scope.partialsDir +
                    '/index_APIN.html',
                successful: $scope.partialsDir +
                    '/Success.html'
            };
            $scope.alerts = [];
            $scope.alert = {
                messages: {
                    NO_MOBILE_REGISTERED: ERR_NO_MOBILE_REGISTERED
                }
            };
        };
        $scope.resetRegistrationForm = function() {
            $("#pdfClass").hide();
            $("#pdfBtns").hide();
            $scope.openTermsAndConditions = false;
            $scope.openConfirmAPIN = true;
            $scope.showSuccessForm = false;
            $scope.control.apin.value = '';
            $scope.control.confirmApin.value = '';
        };
        var popupWindow = null;
        $scope.openTnC = function(isFormValid) {
            $scope.control.acceptTnC = true;
            $scope.errors = {};
            $scope.alerts = [];
            if (!validateAPINDetails() || !isFormValid) {
                return false;
            }
            $("#pdfClass").show();
            $("#pdfBtns").show();
            $scope.openTermsAndConditions = true;
            $scope.showSuccessForm = true;
        };
        $scope.parentDisable = function() {
            if (popupWindow && !popupWindow.closed) {
                popupWindow.focus();
            }
        };
        $scope.openNewUserRegistration = function() {
            gadgets.pubsub.publish(
                'launchpad-retail.goToCreateUsername');
        };
        $scope.getCardBinList = function() {
            $scope.verifyDebitCardBinServiceEndPoint = lpWidget
                .getPreference('verifyDebitCardBin');
            var verifyCardBinServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.verifyDebitCardBinServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var request = $http({
                method: 'GET',
                url: verifyCardBinServiceURL,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            request.success(function(data, status, headers,
                config) {
                $scope.verifyCardList = data;
            });
            request.error(function(data, status, headers,
                config) {
                $scope.verifyCardList = [];
            });
        };
        $scope.validateCardFirstSixDigits = function(cardNumber) {
            if ($scope.verifyCardList.length > 0) {
                if (cardNumber != null) {
                    $scope.cardNoLength = cardNumber.toString()
                        .length;
                }
                var flag = false;
                if ($scope.cardNoLength > 0 && $scope.cardNoLength <
                    7) {
                    for (var i = 0; i < $scope.verifyCardList.length; i++) {
                        if (cardNumber === $scope.verifyCardList[
                            i].toString().substring(0,
                            $scope.cardNoLength)) {
                            flag = true;
                            break;
                        }
                    }
                    if (flag) {
                        $scope.debitCardForm.cardNo.digits =
                            false;
                    } else {
                        $scope.debitCardForm.cardNo.digits =
                            true;
                    }
                } else {
                    // todo
                }
            }
        };
        $scope.confirmPIN = function(APIN1, APIN2) {
            if (APIN1 !== APIN2) {
                return true;
            }
            return false;
        };
        $scope.validateAPINNumber = function(pin) {
            if (pin.length !== 4) {
                return true;
            }
            return false;
        };
        var validateAPINDetails = function() {
            var apinCheck = $scope.validateAPINNumber($scope.control
                .apin.value);
            var checkAPIN = $scope.confirmPIN($scope.control.apin
                .value, $scope.control.confirmApin.value);
            if (apinCheck) {
                $scope.errors['pinCheck'] = apinCheck;
            } else if (checkAPIN) {
                $scope.errors['confirmAPIN'] = checkAPIN;
            } else {
                return true;
            }
        };
        $scope.validateUCIC = function(uid) {
            if (uid.length > UCIC_LENGTH) {
                return true;
            }
            return false;
        };
        var validUCIC = function() {
            var UCICcheck = $scope.validateUCIC($scope.control.ucic
                .value);
            if (UCICcheck) {
                $scope.errors['ucicCheck'] = UCICcheck;
            } else {
                return true;
            }
        };
        $scope.validateDebit = function(debitCard) {
            if (debitCard.length !== DEBIT_CARD_LENGTH) {
                return true;
            }
            return false;
        };
        $scope.validateCardNumber = function(value) {
            $scope.errors['debitCardNumberCheck'] = false;
            $scope.alerts = [];
            if (value.length === DEBIT_CARD_LENGTH) {
                var xhr;
                $scope.errorSpin = true;
                xhr = $scope.validateDebitCardNumber();
                xhr.success(function(data, status, headers,
                    config) {
                    $scope.errorSpin = false;
                    if (data && data !== 'null') {
                        $scope.errors[
                                'debitCardNumberCheck'] =
                            false;
                    }
                });
                xhr.error(function(data, status, headers,
                    config) {
                    $scope.errorSpin = false;
                    if (data.cd && data.cd !== 'CID05' &&
                        data.cd !== '203') {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error',
                            false);
                    } else {
                        $scope.errors[
                                'debitCardNumberCheck'] =
                            true;
                    }
                });
            }
        };
        $scope.expiryFeildsNotSelected = function(monthValue,
            yearValue) {
            if (monthValue === 'Select' || yearValue ===
                'Select') {
                return true;
            }
            return false;
        };
        $scope.validateCVV = function(CVV) {
            if (CVV.length !== DEBIT_CARD_CVV_LENGTH) {
                return true;
            }
            return false;
        };
        var validDebitCardDetails = function() {
            var debitCardCheck = $scope.validateDebit($scope.control
                .cardNumber.value);
            var CVVcheck = $scope.validateCVV($scope.control.cvv
                .value);
            var expirycheck = $scope.expiryFeildsNotSelected(
                $scope.control.expiryMonth.value, $scope.control
                .expiryYear.value);
            if (debitCardCheck) {
                $scope.errors['debitCheck'] = debitCardCheck;
            }
            if (CVVcheck) {
                $scope.errors['cvvCheck'] = CVVcheck;
            }
            if (expirycheck) {
                $scope.errors['expirycheck'] = expirycheck;
                $scope.checkMonth = false;
            }
            if (!(debitCardCheck || CVVcheck || expirycheck)) {
                return true;
            }
        };
        $scope.EnableSubmit = function(val)
                {
        			/*console.log("in pdf");
                	$scope.submitBtn = true;
                	console.log("submit buttn"+$scope.submitBtn);*/
                	if($('#checkme').is(':checked')){
                    				$scope.submitBtn = true;
                    			}else{
                    				$scope.submitBtn = false;
                    			}
                }
        $scope.$watch('control.cardNumber.value', function(value) {
            if (value) {
                $scope.validateCardNumber(value);
            }
        });
        var getMonth = function(date) {
            var month = date.getMonth() + 1;
            return month < 10 ? '0' + month : '' + month;
        };
        var d = new Date();
        var m = getMonth(d);
        var y = d.getFullYear();
        $scope.$watch('control.expiryMonth.value', function(value) {
            if (value && value !== 'Select') {
                if (value < m && $scope.control.expiryYear.value ===
                    y) {
                    $scope.errors['expirycheck'] = false;
                    $scope.checkMonth = true;
                } else {
                    $scope.checkMonth = false;
                }
            }
        });
        $scope.$watch('control.expiryYear.value', function(value) {
            if (value && value !== 'Select') {
                if (value === y && $scope.control.expiryMonth
                    .value < m) {
                    $scope.errors['expirycheck'] = false;
                    $scope.checkMonth = true;
                } else {
                    $scope.checkMonth = false;
                }
            }
        });
        $scope.confirmAPIN = function() {
            $scope.openConfirmAPIN = !$scope.openConfirmAPIN;
            console.log("value of confirm apin form is" +
                $scope.openConfirmAPIN);
        };
        $scope.openDebitForm = function(isUcicValid) {
            $scope.errors = {};
            $scope.alerts = [];
            if (!validUCIC() || !isUcicValid) {
                return false;
            }
            var xhr;
            $scope.errorSpin = true;
            xhr = $scope.authenticateUCIC();
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    $scope.customerMob = data.mblNm;
                    $scope.customerMobMasked = 'XXXXXX' +
                        $scope.customerMob.substr(
                            $scope.customerMob.length -
                            4);
                    $scope.showDebitForm = !$scope.showDebitForm;
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data.cd) {}
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);
            });
        };
        $scope.resetUCICForm = function() {
            $scope.control.ucic.value = '';
            $scope.control.mobile.value = ''; ////mobile number extra field added
            $scope.alerts = [];
        };
        $scope.authenticateUCIC = function() {
            var customerIDServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.customerIDServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'customerId': $scope.control.ucic.value,
                  'mobilenumber': $scope.control.mobile.value, //mobile number extra field added
				'requestType': 'apin',
				'transaction':'debitCard'
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
        $scope.resetCardForm = function() {
            $scope.control.cardNumber.value = '';
            $scope.control.expiryYear.value = $scope.expiryYearList[
                0];
            $scope.control.expiryMonth.value = $scope.expiryMonthList[
                0];
            $scope.control.cvv.value = '';
            $scope.alerts = [];
        };
        $scope.resetAPINForm = function() {
            $scope.control.apin.value = '';
            $scope.control.confirmApin.value = '';
            $scope.alerts = [];
        };
        $scope.registerUser = function() {
            console.log("in register user");
            $scope.openTermsAndConditions = false;
            $scope.encryptAndSubmitAPIN();
        };
        $scope.confirmForm = function(isFormValid) {
            $scope.errors = {};
            $scope.alerts = [];
            if (!validateAPINDetails() || !isFormValid) {
                return false;
            }
            $scope.openTermsAndConditions = false;
        };
        $scope.encryptAndSubmitAPIN = function() {
            console.log("in encrypt and submit apin");
            var xhr;
            $scope.publicKeyRequest().success(function(data) {
                $scope.randomNumberRequest().success(
                    function(data) {
                        do_encrypt();
                        $scope.generateEncryptedAPIN()
                            .success(function(data) {
                                console.log(
                                    "in inner inner of genencapinsucc"
                                );
                                $scope.errorSpin =
                                    true;
                                xhr = $scope.submitAPIN();
                                xhr.success(
                                    function(
                                        data,
                                        status,
                                        headers,
                                        config
                                    ) {
                                        $scope
                                            .errorSpin =
                                            false;
                                        if (
                                            data &&
                                            data !==
                                            'null'
                                        ) {
                                            $scope
                                                .showSuccessPage =
                                                true;
                                        }
                                    });
                                xhr.error(
                                    function(
                                        data,
                                        status,
                                        headers,
                                        config
                                    ) {
                                        $scope
                                            .errorSpin =
                                            false;
                                        if (
                                            data
                                            .cd
                                        ) {}
                                        $scope
                                            .alert = {
                                                messages: {
                                                    cd: data
                                                        .rsn
                                                }
                                            };
                                        $scope
                                            .addAlert(
                                                'cd',
                                                'error',
                                                false
                                            );
                                    });
                            });
                    });
            });
        };
        $scope.publicKeyRequest = function() {
            var encryptAPINServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.encryptAPINServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'requestType': 'publicKey'
            };
            postData = $.param(postData || {});
            $scope.errorSpin = true;
            var xhr = $http({
                method: 'POST',
                url: encryptAPINServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    $scope.modulus = data.modulus;
                    $scope.exponent = data.exponent;
                }
            });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                if (data.cd) {
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
            });
            return xhr;
        };
        $scope.randomNumberRequest = function() {
            var encryptAPINServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.encryptAPINServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'requestType': 'randomNumber'
            };
            postData = $.param(postData || {});
            $scope.errorSpin = true;
            var xhr = $http({
                method: 'POST',
                url: encryptAPINServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    $scope.randomNumber = data.randomNumber;
                }
            });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                if (data.cd) {
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
            });
            return xhr;
        };
        $scope.generateEncryptedAPIN = function() {
            var encryptAPINServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.encryptAPINServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'requestType': 'atmPin',
                'encryptedPinBlock': $scope.encryptedPinBlock,
                'encryptedParam': $scope.encryptedParam,
                'randomNumber': $scope.randomNumber,
                'cardNumber': $scope.control.cardNumber.value
            };
            postData = $.param(postData || {});
            $scope.errorSpin = true;
            var xhr = $http({
                method: 'POST',
                url: encryptAPINServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    $scope.encryptedAPIN = data.atmPin;
                }
            });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                if (data.cd) {
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
            });
            return xhr;
        };
        $scope.submitAPIN = function() {
            var generateAPINServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.generateAPINServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'customerId': $scope.control.ucic.value,
                'cardNumber': $scope.control.cardNumber.value,
                'cvv': $scope.control.cvv.value,
                'expiryMonth': $scope.control.expiryMonth.value,
                'expiryYear': $scope.control.expiryYear.value,
                'newPin': $scope.encryptedAPIN,
                'mobileNumber': $scope.customerMob
            };
            postData = $.param(postData || {});
            var xhr = $http({
                method: 'POST',
                url: generateAPINServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            return xhr;
        };
        $scope.submitForm = function(isValid,debCardForm) {

            $scope.debitCardForm = debCardForm;
            if ($scope.errors['debitCardNumberCheck']) {
                return false;
            }
            $scope.errors = {};
            $scope.alerts = [];
            if (!validDebitCardDetails() || !isValid) {
                return false;
            }
            if ($scope.debitCardForm.cardNo.digits) {
                return false;
            }
            if ($scope.checkMonth || $scope.checkYear) {
                return false;
            }
            var xhr;
            $scope.errorSpin = true;
            xhr = $scope.validateDebitCard();
            xhr.success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    //Automate OTP reading
                    //$scope.generateOTP('send');
                    $scope.readSMS('send');
                }
            });
            xhr.error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data.cd) {}
                $scope.alert = {
                    messages: {
                        cd: data.rsn
                    }
                };
                $scope.addAlert('cd', 'error', false);
            });
        };
        $scope.validateDebitCard = function() {
            var xhr;
            var debitCardServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.debitCardServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'customerId': $scope.control.ucic.value,
                'cardNumber': $scope.control.cardNumber.value,
                'cvv': $scope.control.cvv.value,
                'expiryMonth': $scope.control.expiryMonth.value,
                'expiryYear': $scope.control.expiryYear.value
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: debitCardServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            return xhr;
        };
        $scope.validateDebitCardNumber = function() {
            var xhr;
            var debitCardNumberServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.enquireCardNumberServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'customerId': $scope.control.ucic.value,
                'debitCardNumber': $scope.control.cardNumber
                    .value
            };
            postData = $.param(postData || {});
            xhr = $http({
                method: 'POST',
                url: debitCardNumberServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            return xhr;
        };

        //SMS Reading -- Start
        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt){
            console.log(evt.resendOtpFlag)
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
                                data: "GenerateDebitCardPin"
                            });

                            //Step 2. Send request to "sendOTP service
                            $scope.generateOTP(resendFlag);

                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("GenerateDebitCardPin", function(evt){
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: '+evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver",{
                                    data:"Stop Reading OTP"
                                });



                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp'+receivedOtp);
                                $scope.control.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :'+$scope.control.otpValue);
                                angular.element('#verifyOTP-btn-generate-apin').triggerHandler('click');



                            });
                        }
                        else{
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            $scope.generateOTP(resendFlag);
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

        $scope.generateOTP = function(value) {
            if (!$scope.customerMob || $scope.customerMob ===
                '') {
                $scope.addAlert('NO_MOBILE_REGISTERED', 'error',
                    false);
                return false;
            }
            var resendOTP = null;
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
                'customerId': $scope.control.ucic.value,
                'mobileNumber': $scope.customerMob,
				'resendOTP': resendOTP
            };
            postData = $.param(postData || {});
            $scope.errorSpin = true;
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
                $scope.success = {
                    happened: true,
                    msg: OTP_SUCCESS_MESSAGE
                };
                $scope.error = {
                    happened: false,
                    msg: ''
                };
                $scope.OTPFlag = false;
                $scope.lockFields = true;
            }).error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                //added for 5 times otp close popup
                gadgets.pubsub.publish("stopReceiver",{
                	data:"Stop Reading OTP"
                });
                if (data.cd && data.cd === '501') {
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
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
        $scope.verifyOTP = function(isFormValid) {
            if (!isFormValid) {
                return false;
            }
            var verifyOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.verifyOTPServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'customerId': $scope.control.ucic.value,
                'otpValue': $scope.control.otpValue,
				'requestType': 'verifyOTP',
				'transaction':'debitCard'
            };
            postData = $.param(postData || {});
            $scope.errorSpin = true;
            var xhr = $http({
                method: 'POST',
                url: verifyOTPServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            xhr.success(function(data) {
                $scope.errorSpin = false;
			   if(data.sts === "00" || data.sts === "ACPT"){
                $scope.OTPFlag = true;
				$scope.OTPError=false;
                $scope.confirmAPIN();
				}
				else{
				//added for showing error in case OTP is manipulated and we come to success block
					$scope.OTPError=true;
				}
            }).error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data.cd && data.cd === '501') {
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
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
        $scope.clearOTP = function() {
            $scope.control.otpValue = '';
        };
        $scope.cancelOTP = function() {
            if ($scope.OTPform) {
                $scope.OTPform.$setPristine();
                $scope.OTPform.submitted = false;
            }
            if ($scope.debitCardForm) {
                $scope.debitCardForm.$setPristine();
                $scope.debitCardForm.submitted = false;
            }
            if ($scope.UcicForm) {
                $scope.UcicForm.$setPristine();
                $scope.UcicForm.submitted = false;
            }
            if ($scope.confirmAPINForm) {
                $scope.confirmAPINForm.$setPristine();
                $scope.confirmAPINForm.submitted = false;
            }
            $scope.cancelTransaction = false;
            initialize();
        };
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

        function do_encrypt() {
            var PIN_String = $scope.control.apin.value;
            var RN_String = $scope.randomNumber;
            var Mod_String = $scope.modulus;
            var Exp_String = $scope.exponent;
            initialisePublicKeyData(Mod_String, Exp_String);
            var res = OBM_EncryptPassword(PIN_String, RN_String);
            var Error_String = "";
            switch (res) {
                case ERR_INVALID_PIN_LENGTH:
                    Error_String = "Error No: " +
                        ERR_INVALID_PIN_LENGTH +
                        " :  Invalid PIN Length";
                    break;
                case ERR_INVALID_PIN:
                    Error_String = "Error No: " +
                        ERR_INVALID_PIN + " :  Invalid PIN";
                    break;
                case ERR_INVALID_PIN_BLOCK:
                    Error_String = "Error No: " +
                        ERR_INVALID_PIN_BLOCK +
                        " :  Invalid PIN Block";
                    break;
                case ERR_INVALID_RANDOM_NUMBER_LENGTH:
                    Error_String = "Error No: " +
                        ERR_INVALID_RANDOM_NUMBER_LENGTH +
                        " :  Invalid Random Number Length";
                    break;
                case ERR_INVALID_RANDOM_NUMBER:
                    Error_String = "Error No: " +
                        ERR_INVALID_RANDOM_NUMBER +
                        " :  Invalid Random Number";
                    break;
                case ERR_INVALID_HASH:
                    Error_String = "Error No: " +
                        ERR_INVALID_HASH +
                        " :  Invalid Hash Algorithm";
                    break;
                case ERR_INVALID_PIN_MESSAGE_LENGTH:
                    Error_String = "Error No: " +
                        ERR_INVALID_PIN_MESSAGE_LENGTH +
                        " :  Invalid PIN Message Length";
                    break;
                case ERR_INVALID_RSA_KEY_LENGTH:
                    Error_String = "Error No: " +
                        ERR_INVALID_RSA_KEY_LENGTH +
                        " :  Invalid RSA Key Length";
                    break;
                case ERR_INVALID_RSA_KEY:
                    Error_String = "Error No: " +
                        ERR_INVALID_RSA_KEY +
                        " :  Invalid RSA Key";
                    break;
                case ERR_RSA_ENCRYPTION:
                    Error_String = "Error No: " +
                        ERR_RSA_ENCRYPTION +
                        " :  RSA Encryption Failed";
                    break;
                case ERR_NO_ERROR:
                    Error_String = "Encryption Successful !!";
                    if (C_String != "") {
                        // display encrypted message
                        $scope.encryptedPinBlock =
                            OBM_GetEncryptedPassword();
                        $scope.encryptedParam =
                            OBM_GetEncodingParameter();
                    } else {
                        Error_String = "Error No: " +
                            ERR_INVALID_OPERATION +
                            " Null Encrypted Message";
                    }
                    break;
                default:
                    Error_String = "Unexpected Response" + res;
            }
        }
        var deckPanelOpenHandler;
        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen',
                    deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView) {
                    lpWidget.parentNode = bresView.parentNode;
                });
            }
        };
        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
        initialize();
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
                 gadgets.pubsub.publish("device.GoBack");
         });
         $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }
    exports.pinController = pinController;
});
