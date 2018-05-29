define(function (require, exports) {

    'use strict';
    var idfcConstants = require('idfccommon').idfcConstants;
	var idfcHanlder = require('idfcerror');
    var enciphering = require('./support/production/angular-rsa-encrypt'); //3.1 change
    var readKey = require('./support/rsaKeySetup/rsaKeySetup'); //3.1 change
	var OTP_SUCCESS_MESSAGE = idfcConstants.OTP_SUCCESS_MESSAGE;
	var ERR_INVALID_OPERATION = idfcConstants.ERR_INVALID_OPERATION;
	var DEBIT_CARD_CVV_LENGTH = idfcConstants.DEBIT_CARD_CVV_LENGTH;
	var $ = require('jquery');
    function settingController(lpPortal, $scope, lpWidget, lpCoreUtils, lpCoreError, lpCoreBus, $timeout, $http, httpService, CQService) {
		var tbs;
		var signData;
		var commonName;
		var websignerapplet;
        $scope.isMpinLoginFlag;
		var ALERT_TIMEOUT = 9000;
        $(".borderLast2").show();

        // RSA changes by Xebia start

        $scope.cqObject = CQService;
        gadgets.pubsub.publish("getMobileSdkData");
	    gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
	      $scope.mobileSdkData = response.data;
	    });
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getCQUrl'));
    	var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('verifyCQAnswerUrl'));
    	
    	// RSA changes by Xebia ends

        //gadgets.pubsub.subscribe('launchpad-retail.viewSettings');

		function doEncrypt(apin, type) {
        			var PIN_String = apin;
        			var RN_String = $scope.randomNumber;
        			var Mod_String = $scope.modulus;
        			var Exp_String = $scope.exponent;

        			initialisePublicKeyData(Mod_String, Exp_String);

        			var res = OBM_EncryptPassword(PIN_String, RN_String);

        			var Error_String = "";

        			switch (res) {
        			case ERR_INVALID_PIN_LENGTH:
        				Error_String = "Error No: " + ERR_INVALID_PIN_LENGTH + " :  Invalid PIN Length";
        				break;
        			case ERR_INVALID_PIN:
        				Error_String = "Error No: " + ERR_INVALID_PIN + " :  Invalid PIN";
        				break;
        			case ERR_INVALID_PIN_BLOCK:
        				Error_String = "Error No: " + ERR_INVALID_PIN_BLOCK + " :  Invalid PIN Block";
        				break;
        			case ERR_INVALID_RANDOM_NUMBER_LENGTH:
        				Error_String = "Error No: " + ERR_INVALID_RANDOM_NUMBER_LENGTH + " :  Invalid Random Number Length";
        				break;
        			case ERR_INVALID_RANDOM_NUMBER:
        				Error_String = "Error No: " + ERR_INVALID_RANDOM_NUMBER + " :  Invalid Random Number";
        				break;
        			case ERR_INVALID_HASH:
        				Error_String = "Error No: " + ERR_INVALID_HASH + " :  Invalid Hash Algorithm";
        				break;
        			case ERR_INVALID_PIN_MESSAGE_LENGTH:
        				Error_String = "Error No: " + ERR_INVALID_PIN_MESSAGE_LENGTH + " :  Invalid PIN Message Length";
        				break;
        			case ERR_INVALID_RSA_KEY_LENGTH:
        				Error_String = "Error No: " + ERR_INVALID_RSA_KEY_LENGTH + " :  Invalid RSA Key Length";
        				break;
        			case ERR_INVALID_RSA_KEY:
        				Error_String = "Error No: " + ERR_INVALID_RSA_KEY + " :  Invalid RSA Key";
        				break;
        			case ERR_RSA_ENCRYPTION:
        				Error_String = "Error No: " + ERR_RSA_ENCRYPTION + " :  RSA Encryption Failed";
        				break;
        			case ERR_NO_ERROR:
        				Error_String = "Encryption Successful !!";
        				if (C_String != "") {
        					// set encrypted pinBlock and param
        					if (type === 'old') {
        						$scope.oldEncryptedPinBlock = OBM_GetEncryptedPassword();
        						$scope.oldEncryptedParam = OBM_GetEncodingParameter();
        					}
        					else if (type === 'new'){
        						$scope.NewEncryptedPinBlock = OBM_GetEncryptedPassword();
        						$scope.NewEncryptedParam = OBM_GetEncodingParameter();
        					}

        				} else {
        					Error_String = "Error No: " + ERR_INVALID_OPERATION + " Null Encrypted Message";
        				}
        				break;

        			default:
        				Error_String = "Unexpected Response" + res;
        			}
        			//document.test_sample.result.value = Error_String;
        			//clearData();
        }

		var reRegister = function(){
			var reRegisterUserURL = lpCoreUtils.resolvePortalPlaceholders($scope.reRegisterUserEndPoint, {
				servicesPath: lpPortal.root
			});
			var request = $http({
				method: 'put',
				url: reRegisterUserURL,
				data: {
					'token': signData,
					'orgnCnt': tbs,
					'authTp': commonName
				},
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
			request.success(function (data) {
				$scope.myyyy = true;
			});
		};
		$scope.credentialType = '';
		$scope.databaseServiceEndPoint = lpWidget.getPreference('databaseServicesDataSrc');
		$scope.registerSessionEndPoint = lpWidget.getPreference('registerSessionDataSrc');
		$scope.registerUserEndPoint = lpWidget.getPreference('registerUserDataSrc');
		$scope.reRegisterUserEndPoint = lpWidget.getPreference('ReRegisterUserDataSrc');
		$scope.deRegisterUserEndPoint = lpWidget.getPreference('deRegisterUserDataSrc');
		$scope.expiryYearList = [];
		$scope.debitCardList = [];
		$scope.expiryMonthList = ['Month', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
		$scope.challengeQuestions = [
										{
										'questionId': '',
										'questionText': ''
										}
									];
		$scope.hideOTPFlag = true;
		$scope.hideQuesFlag = true;
		$scope.showQuestionDiv = false;
		$scope.lockFields = false;
		$scope.btnFlag = true;
		$scope.hideCombineFlag = true;
		$scope.challengeQuesAnswers = [
										{
										'answer': '',
										'question': ''
										}
									];
		$scope.myyyy = true;
        var ctrl = this;
        ctrl.decodePhotoUrl = function(photo) {
            return lpCoreUtils.getDefaultProfileImage(photo, 50, 50);
        };
		$scope.passwordPolicy = '/^(?=.*\\d)(?=.*[a-zA-Z])[^ ]{6,15}$/';
		$scope.forms = {};

		$scope.flag={};

		var initialize = function()
		{

		    $scope.ForgotPasswordForm={};
		    var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
		    $scope.changempinImagePath = path + '/images/change_mpin.png';
		    $scope.mpinImagePath = path + '/images/mpin.png';
		    $scope.nextImagePath = path + '/images/next.png';

            //var isMpinLoginVar = localStorage.getItem('isMpinLogin');
            //console.log("isMpinLogin: "+ isMpinLoginVar);
            //checkMpinSetup();


            var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
            if (globalVariablePlugin) {
                 var isMpinSuccessCallback = function(data) {
                     console.log('success: ' + JSON.stringify(data));
                     if (data['loginType'] == 'MPINLOGIN' || data['mpinFlag'] == 'MPINLOGIN') {
                       console.log('inside if success: ' + JSON.stringify(data));
                       $scope.isMpinLoginFlag = true;
                     } else {
                       console.log('inside else success: ' + data['loginType']);
                       $scope.isMpinLoginFlag = false;
                       console.log('Failure: ' + JSON.stringify(data));
                     }
                 };
                 var isMpinErrorCallback = function(data) {
                     console.log('Something really bad happened');
                 };
                 globalVariablePlugin.getLoginType(
                     isMpinSuccessCallback,
                     isMpinErrorCallback
                 );
             } else {
                 console.log('Cant find Plugin');
             }


            /*if($scope.mpinFlag ==true){
            //if(isMpinLoginVar =='true'){
                //$scope.isNormalLoginFlag = false;
                $scope.isMpinLoginFlag = true;
                console.log("if isNormalLoginFlag: "+$scope.isNormalLoginFlag);
                console.log("if isMpinLogin: "+$scope.isMpinLoginFlag);
            }else{
                //$scope.isNormalLoginFlag = true;
                $scope.isMpinLoginFlag = false;
                console.log("else isNormalLoginFlag: "+$scope.isNormalLoginFlag);
                console.log("else isMpinLogin: "+$scope.isMpinLoginFlag);
            }*/




			//Session Management Call
			idfcHanlder.validateSession($http);

			$scope.debitCardServiceEndPoint = lpWidget.getPreference('debitCardService');
			$scope.oldPasswordServiceEndPoint = lpWidget.getPreference('oldPasswordService');
			$scope.enquireCardNumberServiceEndPoint = lpWidget.getPreference('enquireDebitCardNumberService');
			$scope.ChangePasswordEndPoint = lpWidget.getPreference('changePasswordService');
			$scope.encryptAPINServiceEndPoint = lpWidget.getPreference('encryptAPINService');
			$scope.changeAPINServiceEndPoint = lpWidget.getPreference('changeAPINService');
			$scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
			$scope.verifyOTPServiceEndPoint = lpWidget.getPreference('verifyOTPService');
			$scope.OTPFlag = true;
			$scope.errors = {};
			$scope.openChangeAPIN = false;
			$scope.ShowForgotPasswordForm = false;
			$scope.showSuccessForm = false;
			$scope.showPassSuccess = false;
			$scope.customerMob = '';
			$scope.customerMobMasked = '';
			$scope.lockFields = false;
			$scope.serviceError = false;
			$scope.serviceErrorAPIN = false;
			$scope.modulus = '';
			$scope.exponent = '';
			$scope.randomNumber = '';
			$scope.oldEncryptedPinBlock = '';
			$scope.oldEncryptedParam = '';
			$scope.NewEncryptedPinBlock = '';
			$scope.NewEncryptedParam = '';
			$scope.oldEncryptedAPIN = '';
			$scope.newEncryptedAPIN = '';
			$scope.errorSpin = false;
			$scope.cancelTransaction = false;
			// RSA changes by Xebia Start
			$scope.showSetupCQMessage = false;
			$scope.showCancelTransactionMessage = false;
			$scope.challengeQuestion={};
			$scope.showCQError = "";
			$scope.challengeQuestionCounter = 0;
			$scope.showDenyMessage = false;
			$scope.showWrongAnswerMessage = false;
			$scope.disabledConfirmPasswordField = false;
			// RSA changes by Xebia ends
			$scope.controlAPIN = {
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
				oldApin: {
					value: '',
					errors: [],
					loading: false
				},
				otpValue: ''
			};
			$scope.controlPass = {
				oldPassword: {
				value: '',
				disable: false,
				errors: [],
				loading: false
				},
				newPassword: {
					value: '',
					errors: [],
					disable: false,
					loading: false
				},
				confirmPassword: {
					value: '',
					errors: [],
					disable: false,
					loading: false
				},
				otpValue: ''
			};
			$scope.date = new Date();
			$scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
			$scope.templates = {
				change: $scope.partialsDir + '/ChangeAPIN.html',
				forgotPassword: $scope.partialsDir + '/ForgotPassword.html',
				successful: $scope.partialsDir + '/Success.html',
				successPass: $scope.partialsDir + '/SuccessPassword.html',
				emudhra: $scope.partialsDir + '/emudhra.html',
				OTPForm: $scope.partialsDir + '/OTPForm.html',
				cardDetails: $scope.partialsDir + '/cardDetails.html',
				changePass: $scope.partialsDir + '/changePass.html'
			};
		var getExpiryYearList = function() {
			var date = new Date();
        	var n = date.getMonth();
			$scope.databaseService = httpService.getInstance({
				endpoint: lpWidget.getPreference('databaseServicesDataSrc'),
				urlVars: {
					requestId: 'expiryYear'
				}
			});
            var xhr = $scope.databaseService.read();
			console.log(xhr);
            xhr.success(function(data) {
				if (data && data !== 'null') {
					console.log("in success");
					$scope.expiryYearList = data.expiryYearList;
					$scope.expiryYearList.unshift('Year');
					$scope.controlAPIN.expiryYear.value = "Year";
					$scope.controlAPIN.expiryMonth.value = "Month";
				} else {
					$scope.expiryYearList = [];
					$scope.expiryMonthList = [];
				}
            });
			xhr.error(function(data) {
				console.log("in err");
				if(data.cd) {
					$scope.alert = {
						messages: {
							cd: data.rsn
						}
					};
					$scope.addAlert('cd', 'error', false);
				}
				$scope.expiryYearList = [];
				$scope.expiryMonthList = [];
				$scope.controlAPIN.expiryYear.value = $scope.expiryYearList[0];
				$scope.controlAPIN.expiryMonth.value = $scope.expiryMonthList[n];
				$scope.controlPass.expiryYear.value = $scope.expiryYearList[0];
				$scope.controlPass.expiryMonth.value = $scope.expiryMonthList[n];
			});

			return xhr;
		};
		var register = function()
		{
			var registerUserURL = lpCoreUtils.resolvePortalPlaceholders($scope.registerUserEndPoint, {
				servicesPath: lpPortal.root
			});
			var postData = {
				'token': signData,
				'orgnCnt': tbs,
				'authTp': commonName
			};
			postData = $.param(postData || {});
			var request = $http({
				method: 'POST',
				url: registerUserURL,
				data: postData,
				headers: { 'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded;' }
			});
			request.success(function (data) {
				$scope.showwebsignerpopup = false;
				$scope.emudhraFlag = 'true';
			});
        };
		window.emasSubmit = function()
		{
			signData = websignerapplet.getGeneratedSignature();
			commonName = websignerapplet.getCommonNameOfSigner();
			if($scope.emudhraFlag === 'true')
			{
				reRegister();
			}
			else
			{
				register();
			}
		};
		$scope.showwebsignerpopup = true;

        $scope.websignerPopUp = function()
		{
			var contextPath = './static/launchpad/lib/common/emudra/docwebsigner4.6.jar';
			var attributes = {
				code: 'emas.WebsignerApplet.class',
				archive: contextPath,
				width: 1,
				height: 1,
				name: 'websignerapplet'
			};
			var parameters = {
				MAYSCRIPT: 'true',
				scriptable: 'true',
				enableExpiryCheck: 'true',
				regexFilterIssuerName: ''
			};
			var version = '1.5';
			var deployJava;
			deployJava.runApplet(attributes, parameters, version);

			var tbs1 = $scope.name;
			var tbs2 = $scope.emailId;
			var tbs3 = $scope.phoneNumber;
			var tbs4 = $scope.pan;
			//applet code
			tbs = ('Name#' + tbs1 + ' ; ' + 'EmailId#' + tbs2 + ' ; ' + 'MobileNumber#' + tbs3 + 'pan' + tbs4 + ';');

			if(tbs !== '')
			{
				websignerapplet = document.websignerapplet;
				websignerapplet = document.websignerapplet;
				websignerapplet.open(tbs, 'sign', '', '', 'emasSubmit()', 'emasCancel()');
			}
			else
			{
				return false;
			}
		};
		var generateDebitCardList = function(value) {
			$scope.errorSpin = true;
			var xhr;
			var debitCardNumberServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.enquireCardNumberServiceEndPoint, {
				servicesPath: lpPortal.root
			});
			var postData = {
				'requestFrom': 'settings'
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
			xhr.success(function(data, status, headers, config) {
                        console.log("in debit success");
				$scope.errorSpin = false;
				if (data && data !== 'null') {
					$scope.debitCardList = data.debitCardList;
					$scope.controlAPIN.cardNumber.value = "Select One";
                        console.log("$scope.debitCardList",$scope.debitCardList);
                        console.log("$scope.controlAPIN.cardNumber.value",$scope.controlAPIN.cardNumber.value);
				}
			});
			xhr.error(function(data, status, headers, config) {
				$scope.errorSpin = false;
				$scope.alert = {
					messages: {
						cd: data.rsn
					}
				};
				$scope.addAlert('cd', 'error', false);
				$scope.expiryYearList = [];
			});


		};

			$scope.alerts = [];
			getExpiryYearList();
			generateDebitCardList();
            //3.1 password encryption
			var pubKey = readKey.getValues("publicKeyValue");
            var exp = readKey.getValues("exp");
            var mod = readKey.getValues("mod");
            enciphering.setEncodeKey(pubKey, mod, exp);
            // 3.1 end
			console.log("Before alerts.pop");
			$scope.alerts.pop();
			console.log("After alerts.pop");
			var registerSessionURL = lpCoreUtils.resolvePortalPlaceholders($scope.registerSessionEndPoint, {
				servicesPath: lpPortal.root
			});
			$http({
				method: 'GET',
				url: registerSessionURL,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			}).success(function(response) {
                       console.log("register in success")
				$scope.flag = response.emudraFlag;
				$scope.name = response.userName;
				$scope.emailId = response.email;
				$scope.phoneNumber = response.mblNm;
				$scope.pan = response.pan;
				$scope.emudraEnabled = response.emudraConfigProperty;
			}).error(function(response) {
				if(response.cd) {
					$scope.alert = {
						messages: {
						}
					};
					$scope.addAlert('cd', 'error', false);
				}
            });
			$scope.emudhraFlag = 'false';//Todo from session
			$scope.openRegistrationForm = function(isValid)
			{
				if(!isValid)
				{
					return false;
				}
				else
				{
					$scope.emudhraFlag = !$scope.emudhraFlag;
				}
            };

		};
		$scope.deRegister = function()
		{
			var deRegisterUserURL = lpCoreUtils.resolvePortalPlaceholders($scope.deRegisterUserEndPoint, {
				servicesPath: lpPortal.root
			});
			var request = $http({
				method: 'put',
				url: deRegisterUserURL,
				data: {
				'token': signData,
				'orgnCnt': tbs,
				'authTp': commonName
				},
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
			request.success(function (data) {
                            console.log("emudhra success");
				$scope.emudhraFlag = 'false';
			});
		};

		$scope.validateCVV = function(CVV) {
			if(CVV.length !== DEBIT_CARD_CVV_LENGTH){
       console.log("DEBIT_CARD_CVV_LENGTH",DEBIT_CARD_CVV_LENGTH);
			return true;
			}
			return false;
		};

		$scope.expiryFeildsNotSelected = function(monthValue, yearValue) {

			if(monthValue === 'Month' || yearValue === 'Year'){
				return true;
			}
			return false;
		};

		var validDebitCardDetails = function(){
			var debitCardCheck = $scope.validateDebitCardNumber();
			var CVVcheck = $scope.validateCVV($scope.controlAPIN.cvv.value);
			var expirycheck = $scope.expiryFeildsNotSelected($scope.controlAPIN.expiryMonth.value, $scope.controlAPIN.expiryYear.value);

            if(debitCardCheck) {
        console.log("debitCheck");
				$scope.errors['debitCheck'] = debitCardCheck;
            }
            if(CVVcheck) {
        console.log("cvvCheck");
				$scope.errors['cvvCheck'] = CVVcheck;
            }
			if(expirycheck){
            console.log("expirycheck");
			$scope.errors['expirycheck'] = expirycheck;
			$scope.checkMonth = false;
			}
            if(!(debitCardCheck || CVVcheck || expirycheck ) ) {

				return true;
            }
		};
		// finds out current month
		var getMonth = function (date) {
			var month = date.getMonth() + 1;
            return month < 10 ? '0' + month : '' + month;
        };
       $scope.$watch('controlPass.confirmPassword.value', function(value) {
                     var checkPassword = $scope.validatePassword($scope.controlPass.newPassword.value, $scope.controlPass.confirmPassword.value);
                     if($scope.errorsConfirmPass.confirmPass){
					if(value) {
					$scope.errorsConfirmPass.confirmPass = checkPassword;
					}
					else
					{
					$scope.errorsConfirmPass.confirmPass = false;                     }
					}

                     });
       $scope.$watch('controlAPIN.confirmApin.value', function(value) {
                     var checkAPIN = $scope.confirmPIN($scope.controlAPIN.apin.value, $scope.controlAPIN.confirmApin.value);

                     if(value) {
                    $scope.errors['confirmAPIN'] = checkAPIN;
                     }
                     else
                     {
                     $scope.errors['confirmAPIN'] = false;                     }
                     });
       

		$scope.$watch('controlAPIN.cardNumber.value', function(value) {
            if(value) {
				var error = $scope.validateDebitCardNumber();
				$scope.errors['debitCheck'] = error;
            }
        });

        $scope.validateDebitCardNumber = function() {
			if($scope.controlAPIN.cardNumber.value === 'Select One') {
				return true;
			}
			return false;
        };

		var d = new Date();
		var m = getMonth(d);
		var y = d.getFullYear();

		$scope.$watch('controlPass.expiryMonth.value', function(value) {
			if (value !== 'Month')
            {
		if (value < m && $scope.controlPass.expiryYear.value === y){

        $scope.errors['expirycheck'] = false;
		$scope.checkMonth = true;

			}
			else{
			$scope.checkMonth = false;
		}
			}

		});

		$scope.$watch('controlPass.expiryYear.value', function(value) {
		if (value !== 'Year')
            {
			if ( value === y && $scope.controlPass.expiryMonth.value < m ){
				$scope.errors['expirycheck'] = false;
				$scope.checkMonth = true;
			}
			else{
			$scope.checkMonth = false;
		}
			}

		});

		$scope.$watch('controlAPIN.expiryMonth.value', function(value) {

				if (value !== 'Month')
            {

		if (value < m && $scope.controlAPIN.expiryYear.value === y){

        $scope.errors['expirycheck'] = false;
		$scope.checkMonth = true;

			}
			else{
			$scope.checkMonth = false;
		}
			}

		});

		$scope.$watch('controlAPIN.expiryYear.value', function(value) {
			if (value !== 'Year')
            {

			if ( value === y && $scope.controlAPIN.expiryMonth.value < m ){

				$scope.errors['expirycheck'] = false;
		$scope.checkMonth = true;

			}
			else{
			$scope.checkMonth = false;
		}
			}
		});
		$scope.confirmPIN = function(APIN1, APIN2) {
			if(APIN2 !== APIN1) {

				return true;
			}
			return false;
		};
		$scope.validateAPINNumber = function(pin) {
			if(pin.length !== 4){
			return true;
			}
			return false;
		};
		$scope.validateOldAPINNumber = function(oldPin) {
			if(oldPin.length !== 4){
			return true;
			}
			return false;
		};

		var validateAPINDetails = function() {
			var apinCheck = $scope.validateAPINNumber($scope.controlAPIN.apin.value);
			var checkAPIN = $scope.confirmPIN($scope.controlAPIN.apin.value, $scope.controlAPIN.confirmApin.value);
			var checkOldAPIN = $scope.validateOldAPINNumber($scope.controlAPIN.oldApin.value);
			if(checkOldAPIN){
			$scope.errors['oldPinCheck'] = checkOldAPIN;
			}
            else if(apinCheck){
                $scope.errors['pinCheck'] = apinCheck;
            }
			else if(checkAPIN) {
			$scope.errors['confirmAPIN'] = checkAPIN;
			}
			else{
				return true;
			}
		};

		$scope.passwordPolicy = '/^(?=.*\\d)(?=.*[a-zA-Z])[^ ]{6,15}$/';
		$scope.validatePassword = function(password1, password2) {
			if(password1 !== password2) {
				return true;
			}
			return false;
		};

		$scope.errorsConfirmPass = {};
		var validateConfirmPass = function() {

			var checkPassword = $scope.validatePassword($scope.controlPass.newPassword.value, $scope.controlPass.confirmPassword.value);
			if (checkPassword) {
				$scope.errorsConfirmPass.confirmPass = checkPassword;
			}
			else {
				return true;
			}
		};

		$scope.changeMpin = function(){
		    console.log("changeMpin publish called ");
		    localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","settings-widget");
            gadgets.pubsub.publish('launchpad-mpinchange');
		}

       /* var checkMpinSetup=function(){
             var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
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
        }*/

		$scope.changeTab = function(isValid){

            $scope.lockFields = false;
			if(!$scope.cancelTransaction){
				$scope.errors = {};
				$scope.alerts = [];
				$scope.serviceError = false;
				$scope.serviceErrorAPIN = false;
			}
		};
		$scope.openChangeAPINForm = function(isValid) {
			$scope.errors = {};
			$scope.alerts = [];
			if(!validDebitCardDetails() || !isValid){
				return false;
			}

			if($scope.checkMonth || $scope.checkYear) {
				return false;
			}

			$scope.errorSpin = true;
			var xhr;

			xhr = $scope.validateDebitCard();

			xhr.success(function(data, status, headers, config) {
				$scope.errorSpin = false;
				if (data && data !== 'null') {

                        $scope.OTPFlag = false;
					$scope.generateOTP('send');
				}
			});
			xhr.error(function(data, status, headers, config) {
				$scope.errorSpin = false;
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
			var debitCardServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.debitCardServiceEndPoint, {
				servicesPath: lpPortal.root
			});

			var postData = {
				'cardNumber': $scope.controlAPIN.cardNumber.value,
				'cvv': $scope.controlAPIN.cvv.value,
				'expiryMonth': $scope.controlAPIN.expiryMonth.value,
				'expiryYear': $scope.controlAPIN.expiryYear.value
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
         $scope.resetDebitForm = function(){
            $scope.controlAPIN.cardNumber.value = "Select One";
            $scope.controlAPIN.expiryYear.value = "Year";
            $scope.controlAPIN.expiryMonth.value = "Month";
			$scope.controlAPIN.cvv.value = '';
			$scope.alerts = [];
			$scope.forms.changeAPINForm.submitted = false;
         };
			$scope.resetOldPasswordForm = function(){
			$scope.controlPass.oldPassword.value = '';
            $scope.controlPass.newPassword.value = '';
             $scope.controlPass.confirmPassword.value = '';
			};
         $scope.resetChangeApinForm = function(){
            $scope.controlAPIN.apin.value = '';
            $scope.controlAPIN.confirmApin.value = '';
            $scope.controlAPIN.oldApin.value = '';
         };
         $scope.resetChangePassForm = function(){
            $scope.controlPass.confirmPassword.value = '';
            $scope.controlPass.newPassword.value = '';

         };
        $scope.resetShowForgotPasswordForm = function() {
        $scope.controlPass.password = null;
        $scope.controlPass.confirmPassword = null;
        };
		$scope.confirmChangeAPINForm = function(isFormValid){

			$scope.errors = {};
			$scope.alerts = [];

			if(!validateAPINDetails() || !isFormValid){
				return false;
			}

			$scope.encryptAndSubmitAPIN();
		};
        $scope.encryptAndSubmitAPIN = function(){
			var xhr;
			$scope.publicKeyRequest().success(function(data) {
				$scope.randomNumberRequest().success(function(data1) {
					doEncrypt($scope.controlAPIN.oldApin.value, 'old');
					$scope.generateEncryptedAPIN($scope.oldEncryptedPinBlock, $scope.oldEncryptedParam, 'old').success(function(data2) {
						doEncrypt($scope.controlAPIN.apin.value, 'new');
						$scope.generateEncryptedAPIN($scope.NewEncryptedPinBlock, $scope.NewEncryptedParam, 'new').success(function(data3) {
							xhr = $scope.submitChangeAPIN();
							xhr.success(function(data4, status, headers, config) {
								$scope.errorSpin = false;
								if (data3 && data4 !== 'null') {
									$scope.showSuccessForm = true;
								}
							});
							xhr.error(function(data5, status, headers, config) {
								$scope.errorSpin = false;
								if(data5.cd) {
									$scope.alert = {
										messages: {
											cd: data5.rsn
										}
									};
									$scope.addAlert('cd', 'error', false);
								}
							});
						});
					});
				});
			});
		};

        $scope.publicKeyRequest = function(){
			var encryptAPINServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.encryptAPINServiceEndPoint, {
				servicesPath: lpPortal.root
			});

			var postData = {
				'requestType': 'publicKey'
			};

			postData = $.param(postData || {});

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
				if (data && data !== 'null') {
					$scope.modulus = data.modulus;
					$scope.exponent = data.exponent;
				}
			});
			xhr.error(function(data) {
				if(data.cd) {
					$scope.alert = {
						messages: {
							cd: data.rsn
						}
					};
					$scope.addAlert('cd', 'error', false);
				}
			});

			return xhr;
		};
        $scope.randomNumberRequest = function(){
			var encryptAPINServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.encryptAPINServiceEndPoint, {
				servicesPath: lpPortal.root
			});

			var postData = {
				'requestType': 'randomNumber'
			};

			postData = $.param(postData || {});

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
				if (data && data !== 'null') {
					$scope.randomNumber = data.randomNumber;
				}
			});
			xhr.error(function(data) {
				if(data.cd) {
					$scope.alert = {
						messages: {
							cd: data.rsn
						}
					};
					$scope.addAlert('cd', 'error', false);
				}
			});

			return xhr;
		};
        $scope.generateEncryptedAPIN = function(encryptedPinBlock, encryptedParam, type){
			var encryptAPINServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.encryptAPINServiceEndPoint, {
				servicesPath: lpPortal.root
			});

			var postData = {
				'requestType': 'atmPin',
				'encryptedPinBlock': encryptedPinBlock,
				'encryptedParam': encryptedParam,
				'randomNumber': $scope.randomNumber,
				'cardNumber': $scope.controlAPIN.cardNumber.value
			};

			postData = $.param(postData || {});

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
				if (data && data !== 'null') {
					if(type === 'old') {
						$scope.oldEncryptedAPIN = data.atmPin;
					}
					else if(type === 'new') {
						$scope.newEncryptedAPIN = data.atmPin;
					}
				}
			});
			xhr.error(function(data) {
				if(data.cd) {
					$scope.alert = {
						messages: {
							cd: data.rsn
						}
					};
					$scope.addAlert('cd', 'error', false);
				}
			});

			return xhr;
		};
		$scope.submitChangeAPIN = function () {

			var changeAPINServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.changeAPINServiceEndPoint, {
				servicesPath: lpPortal.root
			});

			$scope.errorSpin = true;

			var postData = {
				'cardNumber': $scope.controlAPIN.cardNumber.value,
				'cvv': $scope.controlAPIN.cvv.value,
				'expiryMonth': $scope.controlAPIN.expiryMonth.value,
				'expiryYear': $scope.controlAPIN.expiryYear.value,
				'oldPin': $scope.oldEncryptedAPIN,
				'newPin': $scope.newEncryptedAPIN
			};

			postData = $.param(postData || {});

			var xhr = $http({
				method: 'POST',
				url: changeAPINServiceURL,
				data: postData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});

			return xhr;
		};
		$scope.openChangePasswordForm = function(isValid) {
       
		$scope.errors = {};
			$scope.alerts = [];
			if(!isValid)
			{
			return false;
			}
            $scope.btnFlag=true;
			var xhr;
			$scope.errorSpin = true;
			xhr = $scope.validateOldPassword(isValid);

			xhr.success(function(data, status, headers, config) {
                        
			$scope.errorSpin = false;

				if (data && data !== 'null') {
					$scope.ShowForgotPasswordForm = !$scope.ShowForgotPasswordForm;
				}
			});
			xhr.error(function(data, status, headers, config) {
			$scope.errorSpin = false;
				$scope.errors['invalidPassword'] = 'Invalid Password, please try again later';

			});
		};
		$scope.validateOldPassword = function(isValid) {

			if(!isValid){
				return false;
			}
			var xhr;

			var oldPasswordServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.oldPasswordServiceEndPoint, {
				servicesPath: lpPortal.root
			});
				var postData = {
					'oldPassword': enciphering.setEncrpt($scope.controlPass.oldPassword.value), //3.1 change setEncrypt
					'requiredECheck': 'required' //3.1 change
					};
				postData = $.param(postData || {});
				xhr = $http({
					method: 'POST',
					url: oldPasswordServiceURL,
					data: postData,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded;'
					}
				});
			return xhr;
		};
				function callAtTimeout() {
				console.log('Timeout occurred');
					lpWidget.refreshHTML();
											}
       
       
       
       $scope.goBack = function(){
           $scope.ForgotPasswordForm.submitted=false;
           $scope.ShowForgotPasswordForm=!$scope.ShowForgotPasswordForm;
           $scope.showSuccessForm = false;
           $scope.showPassSuccess = false;
           $scope.resetDebitForm();
           $scope.resetOldPasswordForm();
           $scope.lockFields = false;
       };
		$scope.changePassword = function(isFormValid) {

        $scope.ForgotPasswordForm.submitted=true;
		$scope.errorSpin = true;
      
      

			$scope.errors = {};
			$scope.alerts = [];
		if ( !validateConfirmPass() || !isFormValid) {
		$scope.errorSpin = false;
				return false;
			}


			else{
			var xhr;
			var submitType = 'analyze';
			xhr = $scope.submitPasswordForm(submitType);

			xhr.success(function(data, status, headers, config) {
				$scope.errorSpin = false;
				$scope.credentialType = data.credentialType;
				$scope.isRibUser = data.ribuser;
				//data.actionStatus = 'DENY';
				//data.userStatus = 'DELETE';
				// RSA changes by Xebia starts
		            if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT' ) 
		            	{
		                    $scope.errorSpin = false;
		                    $scope.showDenyMessage = true;
		                    $scope.btnFlag = false;
		            	}

		            else if(data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED')
		                {
		                    $scope.showSetupCQMessage = true;
		                    $scope.errorSpin = false;
		                    $scope.btnFlag = false;
		                }	

		            else if ( data.actionStatus === 'ALLOW' &&  ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) ) 
			            {
			                $scope.hideOTPFlag = true;
							$scope.showPassSuccess = true;
							$timeout(callAtTimeout, 9000);
			            } 
		            else if (data.actionStatus === 'CHALLENGE' && ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) )
		                {
			                $scope.showCQError=CQService.CHALLENGE_MESSAGE;
		                    //$scope.challengeQuestions = "Which domain did you have your first email ID? (Hotmail, Yahoo, Gmail)";
		                    $scope.challengeQuestionCounter++;
		                    $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                    		$scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                    		$scope.disabledConfirmPasswordField = true;
		                    $scope.hideQuesFlag = false;
							$scope.showQuestionDiv = true;
							$scope.lockFields = true;
							$scope.btnFlag = false;
							$scope.hideCombineFlag = true;
		                }
		           // RSA changes by Xebia ends

			});
			xhr.error(function(data, status, headers, config) {
			$scope.errorSpin = false;
				$scope.alert = {
					messages: {
						cd: data.rsn
					}
				};
				$scope.addAlert('cd', 'error', false);

			});
			}
		};

		var setdeviceprint = function(){
       console.log("setdeviceprint");
         return encode_deviceprint();
        };


        // showSetupCQ function by Xebia
		$scope.showSetupCQ = function()
		{
			gadgets.pubsub.publish('openCQ');
		}

		// cancel Transfer function by Xebia
		$scope.cancelRSATransaction = function()
		{
			gadgets.pubsub.publish("launchpad-retail.backToDashboard"); 
		}

		// RSA changes by Xebia
		$scope.verifyCQAnswer = function (isFormValid, challengeTypes) {
			$scope.errorSpin = true;
			$scope.errors = {};
			$scope.alerts = [];
			/*if (!validateConfirmPass() || !isFormValid) {
				return false;
			} else {*/
				//var xhr;
				//var submitType = 'changePassword';
				//challengeType = challengeTypes;
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
				//xhr = submitPasswordForm(submitType);

				xhr.success(function (response) {

					if(response.correctlyAnswered)
					{
						$scope.showQuestionDiv = false;
						$scope.btnFlag = false;
						$scope.hideQuesFlag = true;
						$scope.hideOTPFlag = true;
						$scope.hideCombineFlag = true;
						$scope.showWrongAnswerMessage = false;
						$scope.changePasswordCall();					
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
				});

				xhr.error(function (data, status, headers, config) {
					$scope.errorSpin = false;
					if (data.cd) {
						// If session timed out, redirect to login page
						IdfcError.checkTimeout(data);
						// If service not available, set error flag
						$scope.serviceErrorAPIN = IdfcError.checkGlobalError(data);
					}
					$scope.alert = {
						messages: {
							cd: data.rsn
						}
					};
					$scope.addAlert('cd', 'error', false);
				});
			//}
		};

		// changepassword function by Xebia
		$scope.changePasswordCall = function(){
			var xhr1 = $http({
							method: 'POST',
							url: ChangePasswordEndPoint,
							data: $scope.submitPasswordData,
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/x-www-form-urlencoded;'
							}
						});
						xhr1.success(function (data) {
							$scope.error = {
								happened: false
								, msg: ''
							};
							$scope.errorSpin = false;
							$scope.showPassSuccess = true;
						});	
						xhr1.error(function(data){
							$scope.errorSpin = false;
							if (data.cd) {
								// If session timed out, redirect to login page
								IdfcError.checkTimeout(data);
								// If service not available, set error flag
								$scope.serviceErrorAPIN = IdfcError.checkGlobalError(data);
							}
							$scope.showQuestionDiv = false;
							$scope.btnFlag = false;
							$scope.hideQuesFlag = true;
							$scope.hideOTPFlag = true;
							$scope.hideCombineFlag = true;
							$scope.alert = {
								messages: {
									cd: data.rsn
								}
							};
							$scope.addAlert('cd', 'error', false);
						})
		}

		// changes in fetch CQ function by Xebia
		$scope.fetchCQ = function()
		{
			$scope.errorSpin = true;
			$scope.showCQError="";
			$scope.challengeQuestion.answer="";
			var postData = {};
			var xhr = CQService.challengeRSA(getChallengeQuestionUrl, postData);
            xhr.success(function(response){
            	$scope.showWrongAnswerMessage = false;
                $scope.challengeQuestionCounter++;
                $scope.challengeQuestions = response.challengeQuestionList[0].questionText;
                $scope.challengeQuestionsId = response.challengeQuestionList[0].questionId;
                $scope.errorSpin = false;
                $scope.hideQuesFlag = false;
                $scope.showQuestionDiv = true;
            })
            xhr.error(function (data, status, headers, config) {
				$scope.errorSpin = false;
				if (data.cd) {
					// If session timed out, redirect to login page
					IdfcError.checkTimeout(data);
					// If service not available, set error flag
					$scope.serviceErrorAPIN = IdfcError.checkGlobalError(data);
				}
				$scope.alert = {
					messages: {
								cd: data.rsn
							}
				};
				$scope.addAlert('cd', 'error', false);

			});
		}


		/*$scope.verifyChallenge = function(isFormValid, challengeType)
		{


			$scope.errors = {};
			$scope.alerts = [];
			if ( !validateConfirmPass() || !isFormValid) {
				return false;
			}

			else{
			var xhr;
			var submitType = 'changePassword';
			$scope.challengeType = challengeType;
			xhr = $scope.submitPasswordForm(submitType);

			xhr.success(function(data, status, headers, config) {
                    $(".borderLast2").hide();
					$scope.showQuestionDiv = false;
					$scope.btnFlag = false;
					$scope.hideQuesFlag = true;
					$scope.hideOTPFlag = true;
					$scope.hideCombineFlag = true;
				$scope.showPassSuccess = true;
				$timeout(callAtTimeout, 9000);
			});
			xhr.error(function(data, status, headers, config) {
					$scope.showQuestionDiv = false;
					$scope.btnFlag = false;
					$scope.hideQuesFlag = true;
					$scope.hideOTPFlag = true;
					$scope.hideCombineFlag = true;
				$scope.alert = {
					messages: {
						cd: data.rsn
					}
				};
				$scope.addAlert('cd', 'error', false);
			});
			}
		};*/



		$scope.submitPasswordForm = function(submitType)
		{
			$scope.errors = {};
			$scope.alerts = [];
			$scope.postData = {};
			var registerUserServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.ChangePasswordEndPoint, {
				servicesPath: lpPortal.root
			});
			var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('rsaAnalyzeService'), {
				servicesPath: lpPortal.root
			});
			if(submitType === 'analyze') {
       
				registerUserServiceURL = rsaAnalyzeService;
				// to fetch mobile specific data
	            gadgets.pubsub.publish("getMobileSdkData");
	            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
	              $scope.mobileSdkData = response.data;
	            });
				$scope.postData.mobileSdkData = JSON.stringify($scope.mobileSdkData);
			}
		
		$scope.postData.devicePrint = setdeviceprint();
		$scope.postData.confirmNewPassword = enciphering.setEncrpt($scope.controlPass.confirmPassword.value); //3.1 paswsord encrypt
		$scope.postData.newPassword = enciphering.setEncrpt($scope.controlPass.newPassword.value); //3.1 paswsord encrypt
		$scope.postData.transaction = 'changeUserPassword';
		$scope.postData.credentialType = 'QUESTION';
		$scope.postData.oldPassword = enciphering.setEncrpt($scope.controlPass.oldPassword.value); //3.1 paswsord encrypt
		$scope.postData.requiredECheck = 'required'; //3.1

		/*var action = $scope.postData.credentialType;
       console.log("action",action);
       console.log("$scope.postData.credentialType",$scope.postData.credentialType)
	  if(action === 'QUESTION' || action === 'OTPANDQUESTION' || action === 'RSAOTPANDQUESTION')
	        {
				$scope.postData.length = $scope.challengeQuesAnswers.length;
			}

	  if(action === 'OTP' || action === 'OTPANDQUESTION' || action === 'RSAOTPANDQUESTION')
	                {
	                    $scope.postData.otpValue = $scope.controlPass.otpValue;
	                }*/

		var data1 = $.param($scope.postData || {});
			var xhr = $http({
				method: 'POST',
				url: registerUserServiceURL,
				data: data1,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});
xhr.success(function (data){
            console.log("in success");
$scope.error = {
        happened: false,
         msg: ''
        };
});
xhr.error(function (data) {
    $scope.error = {
            happened: true,
            msg: data.rsn
          };
      $scope.success = {
        happened: false,
         msg: ''
        };
});

			return xhr;
		};

		$scope.alert = {
            messages: {
            }
        };

		$scope.generateOTP = function(value)
		{
			var resendOTP = null;

			var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.generateOTPServiceEndPoint, {
				servicesPath: lpPortal.root
			});
			if (value === 'resend') {
				resendOTP = true;
			}else{
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
				headers: { 'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});

			xhr.success(function (data) {
				$scope.success = {
					happened: true,
					msg: OTP_SUCCESS_MESSAGE
				};
				$scope.error = {
					happened: false,
					msg: ''
				};
				$scope.customerMob = data.mobileNumber;
				if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob !== null)){
				$scope.customerMobMasked = 'XXXXXX' + $scope.customerMob.substr($scope.customerMob.length - 4);
				$scope.lockFields = true;
				}
			}).error(function(data, status, headers, config) {
				if(data.cd && data.cd === '501') {
					$scope.alert = {
						messages: {
							cd: data.rsn
						}
					};
					$scope.addAlert('cd', 'error', false);
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

		$scope.verifyOTP = function(isFormValid)
		{
       
			if(!isFormValid) {
				return false;
			}

			var verifyOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.verifyOTPServiceEndPoint, {
				servicesPath: lpPortal.root
			});

			var postData = {
				'otpValue': $scope.controlAPIN.otpValue,
				'requestType': 'verifyOTP'
			};

			postData = $.param(postData || {});

			var xhr = $http({
				method: 'POST',
				url: verifyOTPServiceURL,
				data: postData,
				headers: { 'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded;'
				}
			});

			xhr.success(function (data) {
				$scope.controlAPIN.otpValue = '';
				$scope.OTPFlag = true;
				$scope.lockFields = false;
				$scope.openChangeAPIN = !$scope.openChangeAPIN;
			}).error(function(data, status, headers, config) {
				if(data.cd && data.cd === '501') {
					$scope.alert = {
						messages: {
							cd: data.rsn
						}
					};
					$scope.addAlert('cd', 'error', false);
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
		$scope.clearOTP = function (){
			$scope.controlAPIN.otpValue = '';
			$scope.controlPass.otpValue = '';
		};
		$scope.cancelOTP = function () {
			if($scope.forms.OTPform) {
				$scope.forms.OTPform.$setPristine();
				$scope.forms.OTPform.submitted = false;
			}
			if($scope.forms.changeAPINForm) {
				$scope.forms.changeAPINForm.$setPristine();
				$scope.forms.changeAPINForm.submitted = false;
			}
			$scope.cancelTransaction = false;
			initialize();
		};

		$scope.clearOTPQUES = function () {
            $scope.controlPass.otpValue = '';
			for (var i = 0; i < $scope.challengeQuesAnswers.length; i++) {

				$scope.challengeQuesAnswers[i].answer = '';
            }

         };
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

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
                         var deckPanelOpenHandler;

                        deckPanelOpenHandler = function(activePanelName) {
                            if (activePanelName === lpWidget.parentNode.model.name) {
                                lpCoreBus.flush('DeckPanelOpen');
                                lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
                                lpWidget.refreshHTML(function(bresView){
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



    exports.settingController = settingController;
});
