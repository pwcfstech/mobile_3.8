/**
 * Controllers
 * 
 * @module controllers
 */

define(function (require, exports) {

'use strict';

var $ = require('jquery');
var idfcConstants = require('idfccommon').idfcConstants;
var idfcHanlder = require('idfcerror');
/**
 * Main controller
 * 
 * @ngInject
 * @constructor
 */
function challengeQuestionController(lpCoreBus, $timeout, lpWidget, lpCoreUtils, lpCoreError, $scope, $http, httpService, lpPortal) {

	$scope.errorSpin = false;
	$scope.isChallengeDisabled = false;
	$scope.showSuccessPage = false;
	$scope.showQuestions = true;
	//$scope.showErrorPage = false;
	$scope.lockFields = false;
	$scope.btnFlag = true;
	$scope.panelTitle = true;
	var ALERT_TIMEOUT = 9000;
	$scope.challengeQuestions = [];
	$scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
	$scope.templates = {
	successful: $scope.partialsDir + '/Success.html',
	};
	$scope.showGoBackButton = true;
	$scope.showCQ = false;
	$scope.reSetCQ = false;
	$scope.userWantsToEnrollAgain = true;
	$scope.alertCQ = '';
	$scope.rsaQuery = {};
	$scope.showAnsPaternErr0 = false;
	$scope.showAnsPaternErr1 = false;
	$scope.showAnsPaternErr2 = false;
	$scope.showAnsPaternErr3 = false;
	$scope.showAnsPaternErr4 = false;
	$scope.showAnsReqErr = false;
	/* 	$scope.showAnsReqErr0 = false;
	$scope.showAnsReqErr1 = false;
	$scope.showAnsReqErr2 = false;
	$scope.showAnsReqErr3 = false;
	$scope.showAnsReqErr4 = false; */

	function callAtTimeout() {
	console.log('Timeout occurred');
	//alert('Timeout occurred');
	lpWidget.refreshHTML();
	};

	var showCQAlert = function(){


	$scope.cQAlertServiceEndPoint = lpWidget
	.getPreference('CQAlert');
	var cQAlertServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.cQAlertServiceEndPoint, {
	servicesPath: lpPortal.root
	});

	$scope.postData.transaction = 'CQAlert';
	var data1 = $.param($scope.postData || {});
	var res = $http({
	method: 'POST',
	url: cQAlertServiceURL,
	data: data1,
	headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/x-www-form-urlencoded;'
	}});
	res.success(function (data, status, headers, config) {

	if(data.cqFlag === 'LOCKOUT' || data.cqFlag === 'UNVERIFIED'){
	$scope.message = data.messageAlertCQ;
	$scope.showCQ = true;
	}

	if(data.cqFlag === 'VERIFIED'){
	$scope.messageResetCQ = data.messageResetCQ;
	$scope.reSetCQ = true;
	$scope.customerName = data.customerName;
	$scope.userWantsToEnrollAgain = false;
	}

	});
	res.error(function (data, status, headers, config) {
	$scope.globalerror = idfcHanlder.checkGlobalError(data);
	}
	);
	};


	$scope.closeWidget = function(){
	lpCoreBus.publish('launchpad-retail.closeActivePanel');
	};
	$scope.showWidget = function(){
	$scope.userWantsToEnrollAgain = true;
	$scope.reSetCQ = false;
	};

	$scope.clear = function(){
	for(var i = 0; i < $scope.challengeQuesAns.length; i++) {
	$scope.challengeQuesAns[i].answer = '';
	$scope.challengeQuesAns[i].question="";
	}
	$scope.clearAlerts();
	};

	var initialize = function() {

	showCQAlert();
	$scope.errorSpin = true;

	$scope.cQuestionsQueryServiceEndPoint = lpWidget
	.getPreference('challengeQuestionsQuery');
	var cQuestionsQueryServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.cQuestionsQueryServiceEndPoint, {
	servicesPath: lpPortal.root
	});


	var bankService = httpService.getInstance({
	endpoint: cQuestionsQueryServiceURL + '?' + $.param($scope.rsaQuery || {})
	});

	var xhr = bankService.read();

	xhr.success(function(data) {
	$scope.errorSpin = false;
	if (data && data !== 'null') {

	$scope.data = data;

	for(var i = 0; i < data.length; i++) {
	$scope.challengeAll.question.push(data[i]['challengeQuestion']);
	}
	} else {
	//$scope.errorMessage = 'Couldn't load the list of customers, error # ' + status;
	$scope.alert = {
	messages: {
	cd: idfcConstants.OTP_SUCCESS_MESSAGE
	}
	};
	$scope.addAlert('cd', 'error', true);
	$scope.btnFlag = false;
	$scope.panelTitle = false;
	}
	});
	xhr.error(function(data) {
	$scope.errorSpin = false;
	$scope.globalerror = idfcHanlder.checkGlobalError(data);
	$scope.alert = {
	messages: {
	cd: data.rsn
	}
	};
	if($scope.globalerror === true)
	{
	$scope.addAlert('cd', 'error', true);
	}
	else{
	$scope.addAlert('cd', 'error', false);
	}
	$scope.btnFlag = false;
	$scope.panelTitle = false;

	});
	};
	lpCoreBus.subscribe('launchpad.challenge.questions', function(params) {
	$scope.rsaQuery.customerId = params.customerId;
	$scope.rsaQuery.loginName = params.loginName;
	$scope.customerMob = params.mobileNo;
	$scope.emailId = params.emailId;
	$scope.showGoBackButton = false;
	});
	lpCoreBus.subscribe('launchpad.challenge.questions.postLogin', function(params) {
	$scope.rsaQuery.customerId = params.customerId;
	$scope.rsaQuery.loginName = params.loginName;
	$scope.customerMob = params.mobileNo;
	$scope.alertCQ = params.alertCQ;
	$scope.showGoBackButton = true;
	if(params.showCQ === 'true') {
	$scope.showCQ = true;
	}
	});

	$scope.challengeAll = {
	question: [],
	answer: []
	};
	var setdeviceprint = function(){
	return encode_deviceprint();
	};
	$scope.challengeQuesAns = [
	{
	'answer': '',
	'question': ''
	}
	];
	$scope.postData = {};
	$scope.QuesAns = function (isFormValid) {
	for(var i = 0; i < $scope.challengeQuesAns.length; i++) {
	if(!$scope.challengeQuesAns[i].question || !$scope.challengeQuesAns[i].answer)
	{
	$scope.showAnsReqErr = true;
	return false;
	}
	}
	if(!isFormValid) {
	return false;
	}
	$scope.rsaAnalyze('send'); 
	};
	
			// Code to refresh widget on reload
	var deckPanelOpenHandler;
		deckPanelOpenHandler = function(activePanelName) {
			if (activePanelName == lpWidget.parentNode.model.name) {
				lpCoreBus.flush("DeckPanelOpen");
				lpCoreBus.unsubscribe("DeckPanelOpen", deckPanelOpenHandler);
				lpWidget.refreshHTML(function(bresView){
					lpWidget.parentNode = bresView.parentNode;
				});
			}
		};
		
	lpCoreBus.subscribe("DeckPanelOpen", deckPanelOpenHandler);
	
	initialize();

	$scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
	$scope.verifyOTPServiceEndPoint = lpWidget.getPreference('verifyOTPService');
	$scope.OTPFlag = true;
	$scope.otpValue = '';
	//$scope.customerMob = '';
	$scope.customerMobMasked = '';
	/**
	* clearOTP method
	* @desc clears OTP form
	*/
	$scope.clearOTP = function (){
	$scope.otpValue = '';
	};
	$scope.rsaAnalyze = function(value)
	{
	//$scope.errorSpin = true;
	var resendOTP = null;
	var rsaAnalyzeService = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('rsaAnalyzeService'), {
	servicesPath: lpPortal.root
	});
	if (value === 'resend'){
	resendOTP = true;
	}else{
	resendOTP = false;
	}
	$scope.postData.customerId = $scope.rsaQuery.customerId;
	$scope.postData.loginName = $scope.rsaQuery.loginName;
	$scope.postData.mobileNumber = $scope.customerMob;
	$scope.postData.resendOTP = 'resendOTP';
	$scope.postData.transaction = 'updateUser';
	for(var i = 0; i < $scope.challengeQuesAns.length; i++) {
	eval('$scope.postData.question' + i + ' = $scope.challengeQuesAns[i].question;');
	eval('$scope.postData.answer' + i + ' = $scope.challengeQuesAns[i].answer;');
	}
	$scope.postData.length = $scope.challengeQuesAns.length;
	$scope.postData.devicePrint = setdeviceprint();
	var data1 = $.param($scope.postData || {});
	var xhr = $http({
	method: 'POST',
	url: rsaAnalyzeService,
	data: data1,
	headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/x-www-form-urlencoded;'
	}
	});
	/* Check whether the HTTP Request is successful or not. */
	xhr.success(function (data, status, headers, config) {
	$scope.errorSpin = false;
	if(data.mandatoryOTP === 'false' && (data.actionStatus === 'ALLOW' || data.actionStatus === 'REVIEW')) {
	$scope.showCQ = false;
	$scope.OTPFlag = true;
	$scope.isChallengeDisabled = true;
	$scope.showSuccessPage = (!$scope.showSuccessPage);
	$scope.globalerror = true;
	$timeout(callAtTimeout, 6000);
	}else {
	$scope.showCQ = false;
	$scope.customerMob = data.mobileNumber;
	if ((typeof $scope.customerMob !== 'undefined') && ($scope.customerMob != null)){
	$scope.customerMobMasked = '******' + $scope.customerMob.substr($scope.customerMob.length - 4);
	$scope.isChallengeDisabled = true;
	$scope.alert = {
	messages: {
	cd: idfcConstants.OTP_SUCCESS_MESSAGE
	}
	};
	$scope.addAlert('cd', 'successResponse', false);
	$scope.OTPFlag = false;
	$scope.lockFields = true;
	$scope.btnFlag = false;
	}
	}
	});
	xhr.error(function(data, status, headers, config) {
	$scope.errorSpin = false;
	$scope.globalerror = idfcHanlder.checkGlobalError(data);
	$scope.panelTitle = false;
	$scope.alert = {
	messages: {
	cd: data.rsn
	}
	};
	if($scope.globalerror === true)
	{
	$scope.addAlert('cd', 'error', true);
	}
	else{
	$scope.addAlert('cd', 'error', false);
	}
	});
	};

	$scope.generateOTP = function (value) {
	var resendOTP = null;
	$scope.errorSpin = true;

	var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.generateOTPServiceEndPoint, {
	servicesPath: lpPortal.root
	});
	if (value === 'resend') {
	resendOTP = true;
	} else {
	resendOTP = false;
	}
	console.log($scope.rsaQuery.customerId);
	console.log($scope.customerMob);
	var postData = {

	'customerId': $scope.rsaQuery.customerId,
	'mobileNumber': $scope.customerMob,
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
	xhr.success(function (data) {
	$scope.errorSpin = false;
	$scope.success = {
	happened: true,
	msg: 'OTP has been successfully sent to your registered mobile number'
	};
	$scope.error = {
	happened: false,
	msg: ''
	};
	$scope.lockFields = true;
	});
	xhr.error(function (data, status, headers, config) {
	$scope.errorSpin = false;
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
	$scope.errorSpin = true;
	var updateChallengeQuestionsURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateChallengeQuestions'), {
	servicesPath: lpPortal.root
	});
	for(var i = 0; i < $scope.challengeQuesAns.length; i++) {
	eval('$scope.postData.question' + i + ' = $scope.challengeQuesAns[i].question;');
	eval('$scope.postData.answer' + i + ' = $scope.challengeQuesAns[i].answer;');
	}
	$scope.postData.length = $scope.challengeQuesAns.length;
	$scope.postData.otpValue = $scope.otpValue;
	$scope.postData.requestType = 'verifyOTP';
	$scope.postData.customerId = $scope.rsaQuery.customerId;
	$scope.postData.mobileNumber = $scope.customerMob;
	$scope.postData.emailId = $scope.emailId;
	$scope.postData.loginName = $scope.rsaQuery.loginName;
	var data1 = $.param($scope.postData || {});

	var xhr = $http({
	method: 'POST',
	url: updateChallengeQuestionsURL,
	data: data1,
	headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/x-www-form-urlencoded;'
	}
	});

	/* Check whether the HTTP Request is successful or not. */
	xhr.success(function (data) {
	$scope.errorSpin = false;
	$scope.OTPFlag = true;
	$scope.isChallengeDisabled = true;
	$scope.panelTitle = false;
	$scope.showSuccessPage = !$scope.showSuccessPage;
	$scope.globalerror = true;
	//$timeout(callAtTimeout, 6000);
	//Your success scenario code
	});
	xhr.error(function(data, status, headers, config) {
	$scope.errorSpin = false;
	$scope.globalerror = idfcHanlder.checkGlobalError(data);
	$scope.alert = {
	messages: {
	cd: data.rsn
	}
	};
	if($scope.globalerror === true)
	{
	$scope.addAlert('cd', 'error', true);
	}
	else{
	$scope.addAlert('cd', 'error', false);
	}
	});
	};
	$scope.quesAnswer = function()
	{
	var xhr = $http({
	method: 'POST',
	url: 'http://localhost:8080/portalserver/static/launchpad/challengeQuestion.json',
	headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/x-www-form-urlencoded;'
	}
	});
	/* Check whether the HTTP Request is successful or not. */
	xhr.success(function (data) {
	$scope.challengeQuestions = data.challengeQuestions;
	$scope.quesFlag = false;
	$scope.btnFlag = false;
	$scope.lockFields = true;
	});
	xhr.error(function(data, status, headers, config) {
	});
	};
	$scope.verifyQuestion = function(isFormValid)
	{
	if(!isFormValid) {
	return false;
	}
	for(var i = 0; i < $scope.challengeQuesAnswers.length; i++){
	eval('$scope.postData.question' + i + ' = $scope.challengeQuesAnswers[i].question;');
	eval('$scope.postData.answer' + i + ' = $scope.challengeQuesAnswers[i].answer;');
	}

	$scope.postData.length = $scope.challengeQuesAnswers.length;
	var data1 = $.param($scope.postData || {});
	var request = $http({
	method: 'POST',
	url: '',
	data: data1,
	headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/x-www-form-urlencoded;'
	}
	});
	request.success(function (){});
	request.error(function (){});
	};
	/**
	* Alerts
	*/
	$scope.alerts = [];

	$scope.addAlert = function (code, type, timeout) {
	var customAlert = {
	type: type || 'error',
	msg: $scope.alert.messages[code]
	};
	$scope.clearAlerts();
	$scope.alerts.push(customAlert);

	if (timeout === false) {
	$timeout(function () {
	$scope.closeAlert($scope.alerts.indexOf(customAlert));
	}, ALERT_TIMEOUT);
	}

	};
	// Remove specific alert
	$scope.closeAlert = function (index) {
	$scope.alerts.splice(index, 1);
	};

	// Clear arr alert messages
	$scope.clearAlerts = function () {
	$scope.alerts = [];
	};
	$scope.alert = {
	messages: {
	SAVED_SUCCESSFULLY: 'Contact was saved successfully.',
	SAVED_ERROR: 'There was an error while saving contact.',
	SERVICE_UNAVAILABLE: 'Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while.'
	}
	};

}

/**
* Export Controllers
*/
exports.challengeQuestionController = challengeQuestionController;
});
