/**
 * Controllers
 *
 * @module controllers
 */

define(function (require, exports) {

	'use strict';
	var $ = require('jquery');
	//var rsaUtils = require('../main');

	/**
	 * Main controller
	 *
	 * @ngInject
	 * @constructor
	 */
	function challengeQuestionController(lpCoreBus, $timeout, lpWidget, lpCoreUtils, httpService, lpPortal, ChallengeQuestionService
		, IdfcUtils, IdfcError, IdfcConstants, LauncherDeckRefreshContent) {

		var ALERT_TIMEOUT = 9000;
		var challengeCtrl = this;
		var ChallengeQuesService = ChallengeQuestionService;
		var emailId = '';
		var customerMob = '';
		var postData = {};
		var alert = {
			messages: {
				cd: ''
			}
		};
		var error = {
			happened: false
			, msg: ''
		};
		var success = {
			happened: false
			, msg: ''
		};
		var showQuestions = true;
		var lockFields = false;
		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
		var showGoBackButton = true;
		var alertCQ = '';
		var rsaQuery = {};
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
		/* local methods */
		function callAtTimeout() {
			lpWidget.refreshHTML();
		}

		var setdeviceprint = function() {
            return encode_deviceprint();
        };

		function showCQAlert() {
			var cQAlertServiceEndPoint = lpWidget.getPreference('CQAlert');
			var cQAlertServiceURL = lpCoreUtils.resolvePortalPlaceholders(cQAlertServiceEndPoint, {
				servicesPath: lpPortal.root
			});

			postData.transaction = 'CQAlert';
			var data1 = $.param(postData || {});
			var res = ChallengeQuesService.showCQAlertService(cQAlertServiceURL, data1);
			res.success(function (data) {

				if (data.cqFlag === 'UNVERIFIED' || data.cqFlag === 'UNLOCKED') {
					//challengeCtrl.message = data.messageAlertCQ;
					challengeCtrl.message = "Important: Please setup/update your Challenge Questions today for enhanced online security."
					challengeCtrl.showCQ = true;
				}
				else if(data.cqFlag === 'LOCKOUT')
				{
					challengeCtrl.message = "Sorry! You cannot update your Challenge Questions. Kindly call on 1800 419 4332";
					challengeCtrl.showCQ = true;
					challengeCtrl.userWantsToEnrollAgain = false;
				}

				else if (data.cqFlag === 'VERIFIED') {
					//challengeCtrl.messageResetCQ = data.messageResetCQ;
					challengeCtrl.messageResetCQ = 'You have already set up your challenge questions as well as answers for them. If you don’t remember the answers, please reset them now.';
					challengeCtrl.reSetCQ = true;
					challengeCtrl.customerName = data.customerName;
					challengeCtrl.userWantsToEnrollAgain = false;
				}

			});
			res.error(function (data) {
				challengeCtrl.globalerror = IdfcError.checkGlobalError(data);
				alert = {
					messages: {
						cd: data.rsn
					}
				};
				if (challengeCtrl.globalerror === true) {
					addAlert('cd', 'error', true);
				} else {
					addAlert('cd', 'error', false);
				}
				
			});
		}

		// Clear arr alert messages
		function clearAlerts() {
			challengeCtrl.alerts = [];
		}

		/**
		 * Alerts
		 */
		challengeCtrl.alerts = [];

		function addAlert(code, type, timeout) {
			var customAlert = {
				type: type || 'error'
				, msg: alert.messages[code]
			};
			clearAlerts();
			challengeCtrl.alerts.push(customAlert);
			if (timeout === false) {
				$timeout(function () {
					challengeCtrl.closeAlert(challengeCtrl.alerts.indexOf(customAlert));
				}, ALERT_TIMEOUT);
			}
		}

		function initialize() {
			challengeCtrl.OTPFlag = true;
			challengeCtrl.globalerror = false;
			challengeCtrl.btnFlag = true;
			challengeCtrl.clear();
			challengeCtrl.isChallengeDisabled = false;
			challengeCtrl.panelTitle = true;
			challengeCtrl.user_name = localStorage.getItem("login_name");
			localStorage.removeItem("login_name");
			showCQAlert();
			challengeCtrl.errorSpin = true;
			challengeCtrl.showSuccessPage = false;

			var cQuestionsQueryServiceEndPoint = lpWidget
				.getPreference('challengeQuestionsQuery');
			var cQuestionsQueryServiceURL = lpCoreUtils.resolvePortalPlaceholders(cQuestionsQueryServiceEndPoint, {
				servicesPath: lpPortal.root
			});

		    //rsaQuery.deviceTokenCookie=localStorage.getItem("deviceTokenCookie");
			var bankService = httpService.getInstance({
				endpoint: cQuestionsQueryServiceURL + '?' + $.param(rsaQuery || {})
			});

			var xhr = bankService.read();

			xhr.success(function (data) {
				challengeCtrl.errorSpin = false;
				
				//localStorage.setItem("deviceTokenCookie", data[0]['deviceTokenCookie']);
				if ((IdfcUtils.hasContentData(data))) {
					challengeCtrl.data = data;
					for (var i = 0; i < data.length; i++) {
						challengeCtrl.challengeAll.question.push(data[i]['challengeQuestion']);
					}
				} else {
					alert = {
						messages: {
							cd: IdfcConstants.OTP_SUCCESS_MESSAGE
						}
					};
					addAlert('cd', 'error', true);
					challengeCtrl.btnFlag = false;
					challengeCtrl.panelTitle = false;
				}
			});
			xhr.error(function (error) {
				challengeCtrl.errorSpin = false;
				challengeCtrl.globalerror = IdfcError.checkGlobalError(error);
				alert = {
					messages: {
						cd: error.rsn
					}
				};
				if (challengeCtrl.globalerror === true) {
					addAlert('cd', 'error', true);
				} else {
					addAlert('cd', 'error', false);
				}
				challengeCtrl.btnFlag = false;
				challengeCtrl.panelTitle = false;
			});
		}

		function rsaAnalyze(value) {
			challengeCtrl.errorSpin = true;
			challengeCtrl.showAnsReqErr = false;
			var resendOTP = null;
			var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('rsaAnalyzeService'), {
				servicesPath: lpPortal.root
			});
			if (value === 'resend') {
				resendOTP = true;
			} else {
				resendOTP = false;
			}
			postData.customerId = rsaQuery.customerId;
			postData.loginName = rsaQuery.loginName;
			customerMob = localStorage.getItem("mobNo");
			localStorage.removeItem("mobNo");
			postData.mobileNumber = customerMob;
			postData.resendOTP = 'resendOTP';
			postData.transaction = 'updateUser';
			//postData.deviceTokenCookie=localStorage.getItem("deviceTokenCookie");
			for (var i = 0; i < challengeCtrl.challengeQuesAns.length; i++) {
				eval('postData.question' + i + ' = challengeCtrl.challengeQuesAns[i].question;');
				eval('postData.answer' + i + ' = challengeCtrl.challengeQuesAns[i].answer;');
			}
			postData.length = challengeCtrl.challengeQuesAns.length;
			postData.devicePrint = setdeviceprint();
			postdata.mobileSdkData = JSON.stringify($scope.mobileSdkData);
			var data1 = $.param(postData || {});
			var xhr = ChallengeQuesService.rsaAnalyzeService(rsaAnalyzeService, data1);

			/* Check whether the HTTP Request is successful or not. */
			xhr.success(function (data) {
				challengeCtrl.errorSpin = false;
				//localStorage.setItem("deviceTokenCookie", data.deviceTokenCookie);
			
				if (data.mandatoryOTP === 'false' && (data.actionStatus === 'ALLOW' || data.actionStatus === 'REVIEW')) {
					challengeCtrl.showCQ = false;
					challengeCtrl.OTPFlag = true;
					challengeCtrl.isChallengeDisabled = true;
					challengeCtrl.showSuccessPage = (!challengeCtrl.showSuccessPage);
					challengeCtrl.globalerror = true;
					$timeout(callAtTimeout, 6000);
				} else {
					challengeCtrl.showCQ = false;
					customerMob = data.mobileNumber;
					if ((typeof customerMob !== 'undefined') && (customerMob != null)) {
						challengeCtrl.customerMobMasked = '******' + customerMob.substr(customerMob.length - 4);
						challengeCtrl.isChallengeDisabled = true;
						/* alert = {
							messages: {
								cd: IdfcConstants.OTP_SUCCESS_MESSAGE
							}
						}; */
						
						challengeCtrl.success = {
								happened: true,
								msg: IdfcConstants.OTP_SUCCESS_MESSAGE
							};
						addAlert('cd', 'successResponse', false);
						challengeCtrl.OTPFlag = false;
						lockFields = true;
						challengeCtrl.btnFlag = false;
					}
				}
			});
			xhr.error(function (error) {
				challengeCtrl.errorSpin = false;
				challengeCtrl.globalerror = IdfcError.checkGlobalError(error);
				challengeCtrl.panelTitle = false;
				alert = {
					messages: {
						cd: error.rsn
					}
				};
				if (challengeCtrl.globalerror === true) {
					addAlert('cd', 'error', true);
				} else {
					addAlert('cd', 'error', false);
				}
			});
		}

		/* local methods  ends here*/

		/* controller or scope methods  starts here*/
		challengeCtrl.closeWidget = function () {
			gadgets.pubsub.publish('launchpad-retail.backToDashboard');
		};

		challengeCtrl.showWidget = function () {
			challengeCtrl.userWantsToEnrollAgain = true;
			challengeCtrl.reSetCQ = false;
			challengeCtrl.showSuccessPage = false;
			challengeCtrl.globalerror = false;
		};

		challengeCtrl.clear = function () {
			for (var i = 0; i < challengeCtrl.challengeQuesAns.length; i++) {
				challengeCtrl.challengeQuesAns[i].answer = '';
				challengeCtrl.challengeQuesAns[i].question = '';
			}
			clearAlerts();
		};

		/*lpCoreBus.subscribe('launchpad.challenge.questions', function (params) {
			rsaQuery.customerId = params.customerId;
			rsaQuery.loginName = params.loginName;
			customerMob = params.mobileNo;
			emailId = params.emailId;
			showGoBackButton = false;
		});

		lpCoreBus.subscribe('launchpad.challenge.questions.postLogin', function (params) {
			rsaQuery.customerId = params.customerId;
			rsaQuery.loginName = params.loginName;
			customerMob = params.mobileNo;
			alertCQ = params.alertCQ;
			showGoBackButton = true;
			if (params.showCQ === 'true') {
				challengeCtrl.showCQ = true;
			}
		});*/


		postData = {};

		challengeCtrl.QuesAns = function (isFormValid) {
			for (var i = 0; i < challengeCtrl.challengeQuesAns.length; i++) {
				if (!challengeCtrl.challengeQuesAns[i].question || !challengeCtrl.challengeQuesAns[i].answer) {
					challengeCtrl.showAnsReqErr = true;
					return false;
				}
			}
			if (!isFormValid) {
				return false;
			}
			rsaAnalyze('send');
		};


		challengeCtrl.generateOTP = function (value) {
			var resendOTP = null;
			challengeCtrl.errorSpin = true;
			var generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
			var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(generateOTPServiceEndPoint, {
				servicesPath: lpPortal.root
			});
			if (value === 'resend') {
				resendOTP = true;
				challengeCtrl.otpValue = '';
			} else {
				resendOTP = false;
			}
			var data = {
				'customerId': rsaQuery.customerId
				,'username' : challengeCtrl.user_name
				, 'mobileNumber': customerMob
				, 'resendOTP': resendOTP
				, 'transaction' : 'updateUser'
			};

			var dataPost = $.param(data || {});
			var xhr = ChallengeQuesService.generateOTPService(generateOTPServiceURL, dataPost);
			/* Check whether the HTTP Request is successful or not. */
			xhr.success(function (data) {
				challengeCtrl.errorSpin = false;
				challengeCtrl.success = {
					happened: true
					, msg: IdfcConstants.OTP_SUCCESS_MESSAGE
				}; 
				challengeCtrl.error = {
					happened: false
					, msg: ''
				};
				lockFields = true;
			});
			xhr.error(function (error) {
				challengeCtrl.errorSpin = false;
				
				
				challengeCtrl.error = {
						happened: true,
						msg: error.rsn
					};
				
				
				 
				challengeCtrl.success = {
					happened: false
					, msg: ''
				};
			});
		};

		challengeCtrl.verifyOTP = function (isFormValid) {
			if (!isFormValid) {
				return false;
			}
			challengeCtrl.errorSpin = true;
			var updateChallengeQuestionsURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateChallengeQuestions'), {
				servicesPath: lpPortal.root
			});
			for (var i = 0; i < challengeCtrl.challengeQuesAns.length; i++) {
				eval('postData.question' + i + ' = challengeCtrl.challengeQuesAns[i].question;');
				eval('postData.answer' + i + ' = challengeCtrl.challengeQuesAns[i].answer;');
			}
			postData.length = challengeCtrl.challengeQuesAns.length;
			postData.otpValue = challengeCtrl.otpValue;
			postData.requestType = 'verifyOTP';
			postData.customerId = rsaQuery.customerId;
			postData.mobileNumber = customerMob;
			postData.emailId = emailId;
			postData.loginName = challengeCtrl.user_name;
			//localStorage.removeItem("login_name");
		
			//postData.deviceTokenCookie=localStorage.getItem("deviceTokenCookie");
			var data1 = $.param(postData || {});
			var xhr = ChallengeQuesService.updateChallengeQuestion(updateChallengeQuestionsURL, data1);

			/* Check whether the HTTP Request is successful or not. */
			xhr.success(function (data) {
			//localStorage.setItem("deviceTokenCookie",  data.deviceTokenCookie);
				challengeCtrl.errorSpin = false;
				challengeCtrl.OTPFlag = true;
				challengeCtrl.isChallengeDisabled = true;
				challengeCtrl.panelTitle = false;
				challengeCtrl.showSuccessPage = !challengeCtrl.showSuccessPage;
				challengeCtrl.globalerror = true;
			});
			xhr.error(function (error) {
				challengeCtrl.errorSpin = false;
				challengeCtrl.globalerror = IdfcError.checkGlobalError(error);
				
				challengeCtrl.success.msg = '';
				challengeCtrl.error = {
						happened: true,
						msg: error.rsn
					};
				/* alert = {
					messages: {
						cd: error.rsn
					}
				};
				if (challengeCtrl.globalerror === true) {
					addAlert('cd', 'error', true);
				} else {
					addAlert('cd', 'error', false);
				} */
			});
		};

		// Remove specific alert
		challengeCtrl.closeAlert = function (index) {
			challengeCtrl.alerts.splice(index, 1);
		};

		challengeCtrl.evalExp = function (formSubmitted, showAnsReqErr) {
			var flag = false;
			if (formSubmitted && showAnsReqErr) {
				flag = true;
			}
			return flag;
		};

		challengeCtrl.evalOrExp = function (showAnsPaternErr0, showAnsPaternErr1, showAnsPaternErr2, showAnsPaternErr3) {
			var flagEx = false;
			if (showAnsPaternErr0 || showAnsPaternErr1 || showAnsPaternErr2 || showAnsPaternErr3 || showAnsPaternErr3) {
				flagEx = true;
			}
			return flagEx;
		};
		/* controller or scope methods  ends here*/
		/*controllers variables start */
		challengeCtrl.challengeAll = {
			question: []
			, answer: []
		};
		challengeCtrl.challengeQuesAns = [
			{
				'answer': ''
				, 'question': ''
            }
        ];
		challengeCtrl.errorSpin = false;
		challengeCtrl.isChallengeDisabled = false;
		challengeCtrl.showSuccessPage = false;
		challengeCtrl.btnFlag = true;
		challengeCtrl.panelTitle = true;
		challengeCtrl.templates = {
			successful: partialsDir + '/Success.html'
		};
		challengeCtrl.showCQ = false;
		challengeCtrl.reSetCQ = false;
		challengeCtrl.userWantsToEnrollAgain = true;
		challengeCtrl.showAnsPaternErr0 = false;
		challengeCtrl.showAnsPaternErr1 = false;
		challengeCtrl.showAnsPaternErr2 = false;
		challengeCtrl.showAnsPaternErr3 = false;
		challengeCtrl.showAnsPaternErr4 = false;
		challengeCtrl.showAnsReqErr = false;
		challengeCtrl.OTPFlag = true;
		challengeCtrl.otpValue = '';
		challengeCtrl.customerMobMasked = '';
		/*controllers variables end */

		//Code to refresh widget on reload
		//LauncherDeckRefreshContent.setup(lpCoreBus, initialize).listen(lpWidget);
		initialize();
		/*var deckPanelOpenHandler;
         deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                initialize();
            }
        };
        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);*/
	}

	/**
	 * Export Controllers
	 */
	exports.challengeQuestionController = challengeQuestionController;
});