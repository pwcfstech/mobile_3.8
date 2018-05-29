/**
 * Controllers
 *
 * @module controllers
 */
define(function(require, exports) {
	'use strict';
	var $ = require('jquery');


// password encrypt changes
      var enciphering = require('./support/production/angular-rsa-encrypt');
   	  var readKey = require('./support/rsaKeySetup/rsaKeySetup');
   	   var pubKey, exp, mod;

	/**
	 * Main controller
	 *
	 * @ngInject
	 * @constructor
	 */
    var popupMenu=false;
	function MpinController($scope, $http, i18nUtils, lpCoreUtils, lpWidget,
			$window, lpPortal, lpCoreBus,  $location , $timeout , $document) {

             $scope.control={};
             $scope.dummy = {'control':{'otpValue':''}};//To access OTP
			 $scope.control.loginId = '';
             $scope.control.loginPassword = '';
             $scope.errorSpin = true;
             $scope.resendDisableOTP=false;
             $scope.hideLoginBtn=true;
			 $scope.showLink = true;

            //native pop up handle
            gadgets.pubsub.subscribe("ALREADYHAVEMPIN", function(){
               //Logout user
              var postData = {
                   'msgHeader' : $scope.msgHeader,
                  'customerId' : $scope.customerId,
                  'mpin' : "",//Already MPIN not required
                  'smsReadFlag' : true,
                  'notificationFlag' : false,
                  'txnType' : 'ALREADYMPIN'
                };
                postData = $.param(postData || {});
                //For Post Login Change URL
                  if($scope.postLogin=='true'){
                  //Remove Hard Coded URL
                      $scope.registerMPINUser = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('registerMPINUserPostLogin'));
                  }
                var regMpin = $http({
                    method : 'POST',
                    url : $scope.registerMPINUser,
                    data : postData
                });
                regMpin.success(function(headers, data) {
                 var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
                   if(globalVariablePlugin1)
                  {
                     globalVariablePlugin1.setMpinFlag(null,null,'true');
                  }
                   else{
                      console.log('Fatal Error: Global Variable plugin not registered');
                 }
                 //SOB3 PwC Sourav .
                 //Check whether device has fingerPrint Capability or not
                 console.log('$scope.fingerScanEnabledDevice :: '+$scope.fingerScanEnabledDevice);
                 if ($scope.fingerScanEnabledDevice) {
                    $scope.mpinFingerRegis = true;
                    $scope.mpinRegistration = false;
                    $scope.showOTPLoginScreen = false;
                 } else {
                    resetMVisaLoginFlag();
                    resetScanAndPayFlag();
                    gadgets.pubsub.publish('launchpad-mpinlogin');
		    //$scope.redirectToMPINLoginIfAlreadySetup();
                 }

                });
                regMpin.error(function(data) {
                  console.log('server error');
                  //5088
                  if(data==""){
                     gadgets.pubsub.publish("no.internet");
                  }else{
                  $scope.otpErrorFlag = true;
                  $scope.otpErrorMsg=$scope.errorResponse;
                  }
                });
            });

            gadgets.pubsub.subscribe('CHNGMPINRESETFIELDS',function(){
                popupMenu=false;
               $scope.reset();
            });
            /* ***************START SOB2 PwC Sourav UAT Issue - 5157****************/
            gadgets.pubsub.subscribe("CHNGMPINSUC", function(){
               $scope.resetForRegMpin();
            });
            gadgets.pubsub.subscribe("MPINREGDONE", function(data){
                console.log("asset flag",$scope.isAsset);
                console.log("loantype flag",$scope.loanType);
               if(data['data'] == false){
                    if($scope.isAsset===true){
                        if($scope.loanType==='hl'){
                            gadgets.pubsub.publish("launchpad-retail.openLoanSummary");
                        }else if($scope.loanType==='pl'){
                            gadgets.pubsub.publish("launchpad-retail.openPersonalLoanSummary");
                        }else  if($scope.loanType==='lap'){
                            gadgets.pubsub.publish("launchpad-retail.openLAPSummary");
                        }
                    }
                    else{
                        gadgets.pubsub.publish("launchpad-retail.backToDashboard");
                    }
               }else{
                var item = angular.element(document.querySelector('#ex_1'));
                //alert(item.html);
                $timeout(item.focus() , 500);
               }
            });





            $scope.verifyMpinRegisterExit = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('verifyMpinRegisterExit'));
            console.log('$scope.verifyMpinRegisterExit :: '+$scope.verifyMpinRegisterExit);

            $scope.checkMpinRegUcic = function(mpinValue){
            console.log('existing mpin ::' +mpinValue);
                        if(mpinValue!=null && mpinValue!=''){
                         pubKey = readKey.getValues("publicKeyValue");
                         exp = readKey.getValues("exp");
                         mod = readKey.getValues("mod");
                         enciphering.setEncodeKey(pubKey, mod, exp);
                       //  console.log(enciphering.setEncrpt(vc.user.password));
                          mpinValue = enciphering.setEncrpt(mpinValue);
                          }
             var postData =
               {
                'msgHeader' : $scope.msgHeader,
                'customerId' : '',
                'txnType' : 'VALIDATEMPIN',
                'mpin' : mpinValue
                };
            $scope.errorSpin = true;
               postData = $.param(postData || {});
               var restCall = $http({
                    method : 'POST',
                    url : $scope.verifyMpinRegisterExit,
                    data : postData
               });
              restCall.success(function(headers, data) {
              $scope.errorSpin = false;
              console.log('Response :' +JSON.stringify(headers));
              $scope.hostStatus = headers.msgHeader.hostStatus;
              $scope.deviceBlockFlag = headers.msgHeader.deviceBlockFlag;
              $scope.deviceBLockErrMsg = headers.msgHeader.deviceBLockErrMsg;
              if($scope.hostStatus == 'E'){
                $scope.validationMsg = headers.msgHeader.error.errorMessage;
              }else if($scope.hostStatus == 'S' && $scope.deviceBlockFlag){
                  $scope.validationMsg =  $scope.deviceBLockErrMsg;  //device block
                  gadgets.pubsub.publish("display.1btn.popup",{
                      data:"DVCEBLCKLIST",
                      message: $scope.validationMsg
                  });
              }
              else if ($scope.hostStatus == 'S' && !$scope.deviceBlockFlag) {
                  if(headers.data.successFlag){
                      //THis block will execute
                      if(headers.data.mpinRegistered && (!headers.data.mpinValid && mpinValue == '')){
                         $scope.isMpinsRegistered = true;
                         $scope.showUserLoginScreen=false;
                         $scope.mpinRegistration=false;
                         $scope.validationMsg = 'Looks like you already have an MPIN setup on another device.Do you want map this device with your existing mpin?'

                         //IDFC 2.5-check if asset or liability user
                         var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
                         if (globalVariablePlugin) {
                              var assetSuccessCallback = function(data) {
                                  console.log('success: ' + JSON.stringify(data));
                                  if (data['assetFlag'] == 'true') {
                                    console.log('inside if success: ' + JSON.stringify(data));
                                    $scope.isAsset = true;
                                  } else {
                                    console.log('inside else success: ' + data['assetFlag']);
                                    $scope.isAsset = false;
                                    console.log('Failure: ' + JSON.stringify(data));
                                  }
                              };
                              var assetErrorCallback = function(data) {
                                  console.log('Something really bad happened');
                              };
                              globalVariablePlugin.getAssetFlag(
                                  assetSuccessCallback,
                                  assetErrorCallback
                              );
                          } else {
                              console.log('Cant find Plugin');
                          }

                             //decide landing page when more loans are there
                           if (globalVariablePlugin) {
                            var loanTypeSuccessCallback = function(data) {
                                console.log('success: ' + JSON.stringify(data));
                                if (data['loanTypeFlag'] == 'pl') {
                                  console.log('inside if success: ' + JSON.stringify(data));
                                  $scope.loanType = 'pl';
                                } else if (data['loanTypeFlag'] == 'lap') {
                                    console.log('inside if success: ' + JSON.stringify(data));
                                    $scope.loanType = 'lap';
                                }
                                else if (data['loanTypeFlag'] == 'hl') {
                                     console.log('inside if success: ' + JSON.stringify(data));
                                     $scope.loanType = 'hl';
                                }else{
                                      console.log('inside else success: ' + data['loanTypeFlag']);
                                    $scope.loanType = "";
                                    console.log('Failure: ' + JSON.stringify(data));
                               }
                            };
                            var loanTypeErrorCallback = function(data) {
                                console.log('Something really bad happened');
                            };
                            globalVariablePlugin.getLoanTypeFlag(
                                loanTypeSuccessCallback,
                                loanTypeErrorCallback
                            );
                            } else {
                                console.log('Cant find Plugin');
                            }


                        gadgets.pubsub.publish("display.1btn.popup",{
                            data:"MPINREGDONE",
                            message: $scope.validationMsg
                        });
                      }else if((headers.data.mpinRegistered && !headers.data.mpinValid) && (!angular.isUndefined(mpinValue)
                                                                               && mpinValue != '')){
                        console.log('first headers.data.mpinVaild :: '+headers.data.mpinVaild);
                        $scope.validationMsg = 'That is not your MPIN. Please try again';
                        gadgets.pubsub.publish("display.1btn.popup",{
                            data:"CHNGMPINSUC",
                            message: $scope.validationMsg
                        });
                      }else if(headers.data.mpinRegistered && (headers.data.mpinValid && !angular.isUndefined(mpinValue)
                                              && mpinValue != '')){
                            //call reset device
                            console.log('second headers.data.mpinVaild :: '+headers.data.mpinValid);
                             var postData = {
                               'msgHeader' : $scope.msgHeader,
                               'customerId' :'',
                               'mpin' : "",//Already MPIN not required
                               'smsReadFlag' : true,
                               'notificationFlag' : false,
                               'txnType' : 'ALREADYMPIN'
                            };
                            $scope.errorSpin = true;
                             postData = $.param(postData || {});
                            //For Post Login Change URL
                              if($scope.postLogin=='true'){
                              //Remove Hard Coded URL
                                $scope.registerMPINUser = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('registerMPINUserPostLogin'));
                              }
                            var regMpin = $http({
                                method : 'POST',
                                url : $scope.registerMPINUser,
                                data : postData
                            });
                            regMpin.success(function(headers, data) {
                            $scope.errorSpin = false;
                            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
                               if(globalVariablePlugin1)
                              {
                                 globalVariablePlugin1.setMpinFlag(null,null,'true');
                                 globalVariablePlugin1.setFingerPrintSetupJS(null,null,'false');
                              }
                               else{
                                  console.log('Fatal Error: Global Variable plugin not registered');
                             }
                             console.log('$scope.fingerScanEnabledDevice :: '+$scope.fingerScanEnabledDevice);
                             if ($scope.fingerScanEnabledDevice) {
                                $scope.mpinFingerRegis = true;
                                $scope.mpinRegistration = false;
                                $scope.showOTPLoginScreen = false;
                                $scope.isMpinsRegistered = false;
                                $scope.hideLoginBtn=false;
                             } else {
                               $scope.mpinRegisSuccess = true;
                               $scope.hideLoginBtn=false;
                               $scope.isMpinsRegistered = false;
                             }

                            });
                            regMpin.error(function(data) {
                              console.log('server error');
                            $scope.errorSpin = false;
                              //5088
                              if(data==""){
                                 gadgets.pubsub.publish("no.internet");
                              }else{
                              $scope.otpErrorFlag = true;
                              $scope.otpErrorMsg=$scope.errorResponse;
                              }
                            });
                      }
                      else{
                        $scope.isMpinsRegistered = false;
                        //Existing code
                        $scope.showUserLoginScreen=false;
                        $scope.mpinRegistration=true;
                         //For defect 5129
                      }
                  }
                  else {
                      $scope.validationMsg = headers.data.errMsg;
                      gadgets.pubsub.publish("display.1btn.popup",{
                          data:"CHNGMPINFAIL",
                          message: $scope.validationMsg
                      });
                  }
              }
          });
          restCall.error(function(headers, data) {
            $scope.errorSpin = false;
           $scope.errorMsg = headers.msgHeader.errMsg;
           $scope.otpErrorFlag=true;
          });

         }

         /* ***************END START SOB2 PwC Sourav UAT Issue - 5157****************/


            $scope.validateUserSession = function(){
            //Repalce Hard Coded URL
			var sessionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('sessionValidator'));
			//var sessionUrl = 'http://172.19.36.33:7003/rs/v1/RegisterSessionUserServiceHttp';
			$scope.forgotMpin = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('forgotMpin'));
            console.log('Forgot Mpin'+$scope.forgotMpin);
            console.log("Session Validator"+sessionUrl);
             //SOB2 UAT 5140
            if(!angular.isUndefined($scope.forgotMpin) && $scope.forgotMpin) {
                $scope.showLink = false;
            }else{
                $scope.showLink = true;
            }
            localStorage.setItem('showLink' , '');
            //SOB2 UAT 5140


               var sessionRequest = $http({
                        method: 'GET',
                        url: sessionUrl,

                        headers: {
                                   'Accept': 'application/json',
                                   'Content-Type': 'application/x-www-form-urlencoded;'
                        }
               });
               sessionRequest.success(function(response) {
               $scope.errorSpin=false;
               console.log("Response"+response);
               console.log("session Success");
               $scope.postLogin = "true";
                //*************START SOB2 PwC Sourav UAT Issue - 5157 *********************
                $scope.checkMpinRegUcic('');
               //*************END SOB2 PwC Sourav UAT Issue - 5157 *********************
         })
         .error(function(response, status) {
            $scope.errorSpin=false;
            console.log("Response"+status);
                console.log("session Error");
                $scope.postLogin = "false";
           });
       };




        gadgets.pubsub.subscribe('launchpad-mpinsetup');
		$scope.mobileNo = '';
		$scope.errorSpin = true;
		$scope.otpErrorFlag=false;
		$scope.otpErrorMsg='';
		$scope.displaySplash = false;
		$scope.OTPModalShown = false;
		$scope.showManuaOTPPage = false;
		$scope.showInitalPage = true;
		$scope.showTimerPage = false;
		$scope.existingMpinFlag = false;
		var authenticationFlag = false;
		$scope.smsReadFlag = false;
		//Made false in order to handle condition If redirect via Create User Yushae
		$scope.showUserLoginScreen = false;
		$scope.showOTPLoginScreen = false;
		$scope.showResendOTP = false;
		$scope.mpinRegisSuccess = false;
		$scope.restartTransactionDialog = false;
		$scope.NewPinNumbers = [ 1, 2, 3, 4 ];
		$scope.reEnterPinNumbers = [ 5, 6, 7, 8 ];
		$scope.oldPinNumbers = [ 1, 2, 3, 4 ];
		$scope.pinNumber = {};
		$scope.filled = 0;
		$scope.vals = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
		$scope.count = 0;

		$scope.showAppUpgradeMsg = false;
		$scope.showValidationMsg = false;
		$scope.resendOTBBtn = true;
		$scope.resendCount = 0;
		$scope.mpinRegistration = false;
		$scope.mpinFingerRegis = false;
		$scope.resendDisableOTP = false;
		$scope.existingMPINSetup = false;
		$scope.loginBtnDisabled = true;
		$scope.otpRetryCount = 0;
		$scope.authFlag = false;
		$scope.partialDir = lpCoreUtils.getWidgetBaseUrl(lpWidget);
		$scope.templates = {
				appUpgradeMsg : 'templates/partial/appUpgradeMsg.html',
				existingMPINSetup : 'templates/partial/mpinAlreadySetup.html',
				restartTransaction : 'templates/partial/restartTransaction.html',
				OTPVerify :  'templates/partial/otppopup.html',
				resendOtp :  'templates/partial/resetOTP.html',
				TimerPage :'templates/partial/timershow.html'
		};
         //Response messages
        $scope.errorResponse = 'Sorry our machines are not talking to each other. Humans are trying to fix the problem. Please come back in a few moments.';
        $scope.ftpErrorResponse = 'Something is going wrong while set up your finger print. Please come back in a few moments.';

		// Read local storage


		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
		$http.defaults.headers.post['Accept'] = 'application/json';
		$http.defaults.headers.post['Cache-Control'] = 'no-cache, no-store, must-revalidate';
		$http.defaults.headers.post['Pragma'] = 'no-cache';
		$http.defaults.headers.post['Expires'] = '0';


        /*This function is for set up FP if fp is supported by the device*/
        $scope.updateUserPreferenceUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateUserPreferenceUrl'));

        $scope.setupFingerPrintForThisDevice = function(){
               var fingerPrintPlugin = cxp.mobile.plugins['fingerPrintPlugin'];
                       if(fingerPrintPlugin){
                          var isFPSetupSuccessCallback = function(data) {
                             console.log('setup fP :: ' +JSON.stringify(data));
                             if(data) {
                                if (data['successFlag']==true || data['successFlag']=="true")
                                   {
                                       $scope.bioAuthToken = data['fpToken'];
                                       $scope.fingerprintSetupSuccessful = true;
                                        console.log('Token ID: '+data['fpToken']);
                                        $scope.notificationPermissionFlag = true;
                                        $scope.bioMetricAuthFlag = data['scannerFlag'];
                                        $scope.notificationTokenId = '';
                                         	pubKey = readKey.getValues("publicKeyValue");
                                            exp = readKey.getValues("exp");
                                            mod = readKey.getValues("mod");
                                            enciphering.setEncodeKey(pubKey, mod, exp);
                                                                                                           //  console.log(enciphering.setEncrpt(vc.user.password));
                                           $scope.bioAuthToken = enciphering.setEncrpt($scope.bioAuthToken);
                                    var postData = {
                                            'msgHeader':$scope.msgHeader,
                                            'notificationFlag':false,//$scope.notificationPermissionFlag,
                                            'notificationToken':'',//$scope.notificationTokenId,
                                            'smsReadingFlag':false,//$scope.smsReadFlag,
                                            'bioAuthFlag':$scope.bioMetricAuthFlag,
                                            'bioAuthToken':$scope.bioAuthToken
                                    };
                                  //  alert('data'+JSON.stringify(postData));

                                    postData = $.param(postData || {});
                                 //   $http.defaults.headers.post['userid'] = $scope.userid;
                                    console.log('$scope.bioAuthToken :: ' +$scope.bioAuthToken);
                //alert($scope.bioAuthToken);
       //Fix to change URL for Post Login
       if($scope.postLogin =='true'){
       $scope.updateUserPreferenceUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateUserPreferenceUrlPostLogin'));
       
       }
                                    if(!angular.isUndefined($scope.bioAuthToken) && $scope.bioAuthToken != ''){
                                        $scope.errorSpin = true;
                                        var serviceCall = $http({
                                        method: 'POST',
                                        url:$scope.updateUserPreferenceUrl,
                                        data: postData
                                    });
                                        serviceCall.success(function(headers, data) {
                                            $scope.errorSpin = false;
                                            console.log('Service call has become successful');
                                            console.log(JSON.stringify(headers));
                                           // alert ('After request success: '+JSON.stringify(headers));
                                            if(headers.msgHeader.hostStatus =='S'){
                                                console.log('Host Status of Message header is S');
                                                //pluginObj.updateLocalStorage('bioMetricAuthFlag',$scope.bioMetricAuthFlag);
                                                //pluginObj.updateLocalStorage('bioAuthToken',$scope.bioAuthToken);
                                                if(headers.msgHeader.deviceBlockFlag){
                                                    //pluginObj.updateLocalStorage('fingerScanEnabledDevice',false);
                                                    $scope.blacklist=true;
                                                    $scope.authMesssage=headers.msgHeader.deviceBLockErrMsg;
                                                     var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
                                                     if(globalVariablePlugin1){
                                                          globalVariablePlugin1.resetDevice();
                                                     }
                                                    //native pop up
                                                    gadgets.pubsub.publish("display.1btn.popup",{
                                                         data:"DVCEBLCKLIST",
                                                         message:$scope.authMesssage
                                                     });

                                                }else{
                                                    if(headers.data.successFlag){
                                                        $scope.showFingerPrintSuccess = true;
                                                        $scope.mpinFingerRegis = false;
                                                    }
                                                    else{
                                                        console.log('error image:: '+$scope.errorImagePath);
                                                        $scope.successForm = true;
                                                        $scope.errorCode=headers.data.errCode;
                                                        $scope.authMesssage=headers.data.errMsg;
                                                        $scope.mpinFingerRegis = true;
                                                    }
                                                }
                                            }else{
                                                $scope.showErrorFlag=true;
                                                $scope.errorCode=headers.msgHeader.error.errorCode;
                                                $scope.authMesssage=headers.msgHeader.error.errorMessage;
                                                $scope.mpinFingerRegis = true;
                                            }
                                        });
                                        serviceCall.error(function(headers, data) {
                                            $scope.errorSpin = false;
                                            // //5229
                                            if(headers==""){
                                                 gadgets.pubsub.publish("no.internet");
                                            }else{
                                                console.log('Service call has failed' +JSON.stringify(headers));
                                                $scope.showErrorFlag=true;
                                          //  $scope.authMesssage='Call Failed';
                                                $scope.showSuccessPage = false;
                                          //  $scope.authFlag=true;
                                            //native pop up
                                            gadgets.pubsub.publish("display.1btn.popup",{
                                                data:"FPSETUPERROR",
                                                message: $scope.errorResponse
                                            });
                                            }
                                        });

                                    }


                                }
                                else if (data['successFlag']==false || data['successFlag']=="false"){
                                   //alert('Registration Error: '+data['errorDesc']);
                                   $scope.errorSpin = false;
                                   $scope.fingerprintSetupSuccessful = false;
                                   console.log('Registration Error: '+data['errorDesc']);
                                }
                                else{

                                   //alert('Registration Error: '+data['errorDesc']);
                                   $scope.fingerprintSetupSuccessful = false;
                                   console.log('Registration Error: '+data['errorDesc']);
                                }
                             } else {

                                $scope.fingerprintSetupSuccessful = false;
                                console.log('Failure: '+ JSON.stringify(data));

                             }
                          };
                          var isFPSetupErrorCallback = function(data) {
                             //alert('Something really bad happened');
                             $scope.fingerprintSetupSuccessful = false;
                             console.log('Something really bad happened');

                          };
                          fingerPrintPlugin.setupFingerPrint(
                             isFPSetupSuccessCallback,
                             isFPSetupErrorCallback
                          );
                       }
                       else{

                          //alert('Fatal error. Please try after sometime');
                          $scope.fingerprintSetupSuccessful = false;
                          console.log('Fatal error. Please try after sometime');
                       }
        }


		$scope.initialize = function(){
            //Redirection from Create User Name
            //Fetching Device Details Initally
            //Check whether device has fingerPrint Capability or not

             /**Mobile 3.0- set the flag to N to show that user exist.
             by default keep it N to handle case where user comes to this page from user regiostration*/
               $scope.withNoUserName='Y';

           var fingerPrintPlugin = cxp.mobile.plugins['fingerPrintPlugin'];
           if(fingerPrintPlugin){
              var isFPAvailableSuccessCallback = function(data) {

                 console.log('finger print capability data :: '+data);
                 if(data) {
                    if (data['scannerFlag']==true)
                    {
                       $scope.fingerScanEnabledDevice = true;
                    }
                    else if (data['scannerFlag']==false){
                       $scope.fingerScanEnabledDevice = false;
                    }
                    else  if (data['scannerFlag']=='none'){
                       $scope.fingerScanEnabledDevice = true;
                       console.log('Device has fingerprint scanner but user has not scanned any fingerprint for authentication purpose');
                    }
                    else{
                        $scope.fingerScanEnabledDevice = null;
                       console.log('Something went wrong. We didnt look at this scenario')
                    }
                 } else {
                    $scope.fingerScanEnabledDevice = null;
                    console.log('Failure: '+ JSON.stringify(data));
                 }
              };
              var isFPAvailableErrorCallback = function(data) {
                 $scope.fingerScanEnabledDevice = null;
                 console.log('Something really bad happened');
              };
              fingerPrintPlugin.checkFingerprintCapability(
                 isFPAvailableSuccessCallback,
                 isFPAvailableErrorCallback
              );
           }
           else{
                $scope.fingerScanEnabledDevice = null;
               console.log('Cant find Plugin. This is Fatal error where App upgrade is needed');
           }

            //SOB2 UAT 5140
            if(!angular.isUndefined(localStorage.getItem('showLink')) && localStorage.getItem('showLink') == 'false') {
                $scope.showLink = false;
            }else{
                $scope.showLink = true;
            }
            localStorage.setItem('showLink' , '');
            //SOB2 UAT 5140

            $scope.validateUserSession();

                        $scope.isMpinSetupVisitedBefore = localStorage.getItem('isMpinSetupVisitedBefore');
            		    if(!angular.isUndefined($scope.isMpinSetupVisitedBefore) &&  $scope.isMpinSetupVisitedBefore=='true'){
            		         $scope.mpinsetupvia =  localStorage.getItem('isMpinSetupVisited');
            		         //when redirect from mpin to user and back here
            		        if(!angular.isUndefined($scope.mpinsetupvia) &&  $scope.mpinsetupvia=='true'){
                                $scope.congratulationMsg=true;
            		        }
                             $scope.showUserLoginScreen=false;
                              $scope.mpinRegistration=true;
                              $scope.customerId =  localStorage.getItem('customerId');
                              console.log($scope.customerId);
                              localStorage.setItem('isMpinSetupVisitedBefore','');
                              localStorage.setItem('customerId','');
                              localStorage.setItem('isMpinSetupVisited','');

            }else{
            	 $scope.showUserLoginScreen=true;
            	 //Clearing user and Password
            	 $scope.control.loginId='';
            	 $scope.control.loginPassword='';
                  $scope.mpinRegistration=false;
             }
            var globalVariablePlugin =cxp.mobile.plugins['GlobalVariables'];
            	if(globalVariablePlugin){
            		var getDeviceFootPrintHeaderSuccessCallback = function(data) {
            			if(data) {
                            $scope.deviceId = data['deviceId'];
                            $scope.channel = data['channel'];
                            $scope.ipAddress = data['ipAddress'];
                            $scope.timeZone = data['timeZone'];
                            $scope.nwProvider = data['nwProviderLine1'];
                            $scope.connectionMode = data['connectionMode'];
                            $scope.geoLatitude = data['geoLatitude'];
                            $scope.geoLongitude = data['geoLongitude'];


                            var jsonObj = {
                                'deviceId' : $scope.deviceId,
                                'channel' : $scope.channel,
                                'ipAddress' : $scope.ipAddress,
                                'timeZone' : $scope.timeZone,
                                'nwProvider' : $scope.nwProvider,
                                'connectionMode' : $scope.connectionMode,
                                'geoLatitude' : $scope.geoLatitude,
                                'geoLongitude' : $scope.geoLongitude
                            };
                            $scope.msgHeader = JSON.stringify(jsonObj);
                            //For Forgot MPIN It would be existing Flag but make it null
                                        	$scope.trxType = 'MPINREG';
                                        	if($scope.forgotMpin!=null && $scope.forgotMpin=='true'){
                                        	 $scope.existingMpinFlag = false;
                                        	$scope.trxType = 'FORGOTMPIN';
                                        	}
                            var postData = {
                                    'msgHeader' : $scope.msgHeader,
                                    'userid' : $scope.control.loginId,
                                    'password' : $scope.control.loginPassword,
                                    'portalName':'portalname',
                                    'page_name':'samplepagename',
                                    'txnType' : $scope.trxType
                             };
                        }else {
                                console.log('Failure: '+ JSON.stringify(data));
                        }
                    };
                     var getDeviceFootPrintHeaderErrorCallback = function(data) {
                            console.log('Something really bad happened');
                     };

                     globalVariablePlugin.getDeviceFootPrintHeader(
                          getDeviceFootPrintHeaderSuccessCallback,
                          getDeviceFootPrintHeaderErrorCallback
                       );
                }
                else{
                        console.log('globalVariablePlugin is '+globalVariablePlugin);
                    }


		    //Redirection from Create User Name


			var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
			$scope.imagePath = path;
			$scope.lockImg = $scope.imagePath + '/media/lock.png';
			$scope.touchImg = $scope.imagePath + '/media/touchid.png';
			$scope.idfcLogo = $scope.imagePath + '/media/IDFC-logo.gif';
            $scope.congratsImagePath = $scope.imagePath + '/media/congts.png';
			$scope.updateUserPreferenceUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateUserPreferenceUrl'));
			$scope.verifyOTP = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('verifyOTP'));
			$scope.registerMPINUser = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('registerMPINUser'));
			$scope.sendOTP = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('sendOTP'));
			$scope.checkIBCredentials = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('checkIBCredentials'));


		}

        //Call redirect pubsub
        $scope.goToDontUserName=function(){
            localStorage.setItem('isMpinSetupVisited','true');
            gadgets.pubsub.publish('launchpad-retail.goToCreateUsername');
        }

		$scope.openMPINRegistration = function(isValidate) {
		  // console.log('auto OTP openMPINRegistration'+$scope.dummy.control.otpValue);
			if (isValidate) {
			console.log('auto OTP openMPINRegistration'+$scope.dummy.control.otpValue);
                     	$scope.trxType = 'MPINREG';
                           if($scope.forgotMpin!=null && $scope.forgotMpin=='true'){
                                  $scope.existingMpinFlag = false;
                                  $scope.trxType = 'FORGOTMPIN';
                            }
				var postData = {
					'msgHeader' : $scope.msgHeader,
					'customerId' : $scope.customerId,
					'otpValue' : $scope.dummy.control.otpValue,
					'txnType' : $scope.trxType
				};
		        $scope.errorSpin = true;
				$scope.dummy.control.otpValue='';
				postData = $.param(postData || {});
                console.log("Verify OTP"+postData);
				var restCall = $http({

					method : 'POST',
					url : $scope.verifyOTP,
					data : postData
				});
                /*$scope.mpinRegistration = true;
                $scope.showUserLoginScreen = false;
                $scope.showOTPLoginScreen = false;
                $scope.showResendOTP = false;
                 $timeout(function() {
                  var item = angular.element(document.querySelector('#old_1'));
                  //alert(item.html);
                  item.focus();
                 } , 1500);*/
				restCall
						.success(function(headers, data) {
						    $scope.errorSpin = false;
						    console.log('Response for verifyOTP ' + JSON.stringify(headers));
							if (headers.data.successFlag) {


							    //For Forgot MPIN It would be existing Flag but make it null
							    $scope.trxType = 'ALREADYMPIN';
							    if($scope.forgotMpin!=null && $scope.forgotMpin=='true'){
							      $scope.existingMpinFlag = false;
							      $scope.trxType = 'FORGOTMPIN';
							    }
								if($scope.existingMpinFlag){

									$scope.validationMsg = 'Looks like you already have an MPIN setup on another device. No need to create a new one.Use the same MPIN to login to all your devices.';
									gadgets.pubsub.publish("display.1btn.popup",{data:"ALREADYHAVEMPIN",message:$scope.validationMsg
									});
									//Calling MPIN Register if already exist and mapping

								}else{
								//SBO3 Sourav PwC
								//$scope.unregisterReceiver();
								$scope.mpinRegistration = true;
								$scope.showUserLoginScreen = false;
								$scope.showOTPLoginScreen = false;
								$scope.showResendOTP = false;
								$timeout(function() {
                                  var item = angular.element(document.querySelector('#old_1'));
                                  //alert(item.html);
                                  item.focus();
                                 } , 1500);
								}
							} else {

							    //Max 3 retries handling in if
							    $scope.authMesssage = headers.data.errMsg;
							    if('VOTPERR002' == headers.data.errCode){
							        $scope.dummy.OTPform.$setPristine();
                                    $scope.dummy.OTPform.submitted=false;
							         $scope.showUserLoginScreen = true;
                                     $scope.control.loginId='';
                                     $scope.control.loginPassword='';
                                     //Reset OTP previous message
                                     $scope.otpErrorFlag=false;
                                     $scope.otpErrorMsg = '';

                                	$scope.showOTPLoginScreen = false;
                                	$scope.authFlag=true;

							    }
								else{
								    console.log('headers.data.errMsg :: '+headers.data.errMsg);
								    //Change Message to TOP
								   // $scope.authMesssage = headers.data.errMsg;
								    $scope.otpErrorFlag=true;
									$scope.otpErrorMsg = headers.data.errMsg;

								}
							}

						});
				restCall.error(function(headers1, data) {

				$scope.errorSpin = false;
					// alert('Send opt Call Failed');
					// //5229
                    if(headers1==""){
                        gadgets.pubsub.publish("no.internet");
                    }else{
					$scope.otpErrorMsg = $scope.errorResponse;
					$scope.otpErrorFlag=true;
					}


				});
			}
			// End OTP Verify Call
		}

		$scope.callOnchange = function(){

			if($scope.control.loginPassword != '' && $scope.control.loginId != ''){
				$scope.loginBtnDisabled = false;
			}else{
				$scope.loginBtnDisabled = true;
			}
		}

		$scope.redirectToMPINLogin = function(){
		    //Need to update shared preference ,
		    //alert('redirectToMPINLogin');
		     //Need to update shared preference ,
           var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
           if(globalVariablePlugin1)
           {
            globalVariablePlugin1.setFingerPrintSetupJS(null,null,'false');
           }
           else{

           }
           //Defetct

           console.log('postLogin:'+$scope.postLogin);
           if($scope.postLogin=='true'){
                //IDFC 2.5-redirect asset user to loans page after mpin setup
               console.log("asset flag",$scope.isAsset);
               console.log("loantype flag",$scope.loanType);
               if($scope.isAsset===true){
                   if($scope.loanType==='hl'){
                       gadgets.pubsub.publish("launchpad-retail.openLoanSummary");
                   }else if($scope.loanType==='pl'){
                       gadgets.pubsub.publish("launchpad-retail.openPersonalLoanSummary");
                   }else  if($scope.loanType==='lap'){
                       gadgets.pubsub.publish("launchpad-retail.openLAPSummary");
                   }
               }
               else{
                   gadgets.pubsub.publish("launchpad-retail.backToDashboard");
               }
           }else{
            resetMVisaLoginFlag();
            resetScanAndPayFlag();
            gadgets.pubsub.publish('launchpad-mpinlogin');
           }
        }

        $scope.closeAlert = function() {
                      $scope.isAusUser = false;
                       gadgets.pubsub.publish("closeAppForAus"); //3.5 change
        };
       $scope.checkAvailability = function() {

            /**Mobile 3.0- set the flag to N to show that user exist*/
            $scope.withNoUserName='N';
		    console.log($scope.control.loginId);
            $scope.isAusUser = false; //3.3 migration

			if ($scope.control.loginPassword != '' && $scope.control.loginId != '') {
				$scope.showSuccessPage = false;
				$scope.authFlag = false;
				$scope.isMsgAccessAllowed = false;

                        $scope.trxType = 'MPINREG';
                                                   if($scope.forgotMpin!=null && $scope.forgotMpin=='true'){
                                                          $scope.existingMpinFlag = false;
                                                          $scope.trxType = 'FORGOTMPIN';
                                                    }

                                     pubKey = readKey.getValues("publicKeyValue");
                                     exp = readKey.getValues("exp");
                                     mod = readKey.getValues("mod");
                                     enciphering.setEncodeKey(pubKey, mod, exp);
                                   //  console.log(enciphering.setEncrpt(vc.user.password));
                                      $scope.control.loginPassword = enciphering.setEncrpt($scope.control.loginPassword);
						var postData = {
								'msgHeader' : $scope.msgHeader,
								'userid' : $scope.control.loginId,
								'password' : $scope.control.loginPassword,
								'portalName':'portalname',
								'page_name':'samplepagename',
								'txnType' : $scope.trxType
							};
                            $scope.errorSpin = true;
							postData = $.param(postData || {});
                            console.log("WHile Login"+postData);
							var restCall = $http({
								method : 'POST',
								url : $scope.checkIBCredentials,
								data : postData
							});
                // $scope.control.loginId = '';  //3.5 migration
                // $scope.control.loginPassword = ''; //3.5 migration

                restCall.success(function(headers, data) {
                    // alert('Response checkIB crede + '+ JSON.stringify(headers));
                    //$scope.errorSpin = false;
                    var checkCustomerExistUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('checkCustomerExistRetail'));
                    var postData = {
                        'loginId': $scope.control.loginId
                    };
                    $scope.errorSpin = true;
                    var checkCustomerExist = $http.post(checkCustomerExistUrl, lpCoreUtils.buildQueryString(postData), {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;',
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    });
                            $scope.control.loginId='';
                            $scope.control.loginPassword='';
                    checkCustomerExist.success(function(res) {
                                        $scope.errorSpin = false;
                        console.log("CheckCustomer Exist Response@" +JSON.stringify(res));
                        if ((typeof res.isIndividual !== 'undefined') && (res.isIndividual !== null) && (res.isIndividual == 'N')) {
                            $scope.isAusUser = true;
                            return;
                        } else {
                            $scope.isAusUser = false;
										$scope.authMesssage = headers.data.authFailErrMessage;
										$scope.loginBtnDisabled = true;
										$scope.authFlag = true;

										$scope.mobileNo = headers.data.mobileNo;
                                        //Change code to handle more than 10 digit ofcode
                            $scope.mobileNoModded = 'xxxxxx' +
                                $scope.mobileNo.slice($scope.mobileNo.length - 4, $scope.mobileNo.length);

										$scope.existingMpinFlag = headers.data.existingMpinFlag;
										console.log('Existing Mpin'+$scope.existingMpinFlag);
										authenticationFlag = headers.data.authenticationFlag;
                                        console.log('authenticationFlag :: '+authenticationFlag);
										if (authenticationFlag) {
											$scope.showUserLoginScreen = false;
											$scope.showOTPLoginScreen = true;
											$scope.authMesssage = headers.data.authFailErrMessage;
											$scope.showSuccessPage = false;
											$scope.authFlag = false;
											$scope.customerId = headers.data.customerId;
                                               $scope.trxType = 'MPINREG';
                                              if($scope.forgotMpin!=null && $scope.forgotMpin=='true'){
                                                     $scope.existingMpinFlag = false;
                                                     $scope.trxType = 'FORGOTMPIN';
                                               }

												var postData = {
													'msgHeader' : $scope.msgHeader,
													'customerId' : $scope.customerId,
													'mobileNo' : $scope.mobileNo,
													'resendOTP' : false,
													'txnType' :  $scope.trxType
												};
                                                $scope.errorSpin=true;
												postData = $.param(postData || {});
                                                console.log('postData :: '+postData);
												var restCall2 = $http({

													method : 'POST',
													url: $scope.sendOTP,
													data : postData
												});

												restCall2.success(function(headers1, data1) {
												          $scope.errorSpin=false;
												            console.log('headers1.data.successFlag ' + JSON.stringify(headers1));
															if(headers1.data.successFlag){
															//SOB3 OTP integration
															$scope.readSMS('');

															}else{

																if(headers1.data.errMsg != null && headers1.data.errMsg != 'undefined'){
																	msg = headers1.data.errMsg
																}
																    $scope.otpErrorMsg = $scope.errorResponse;
																	$scope.otpErrorFlag=true;
															}
														});
												restCall2.error(function(headers1, data) {
                                                             $scope.errorSpin=false;
															// alert('Send opt Call Failed');
															//5229
                                                            if(headers1==""){
                                                                               gadgets.pubsub.publish("no.internet");

                                                            }else{															//$scope.validationMsg = msg;
                                                        //Changing message to TOP
                                                               $scope.otpErrorMsg = $scope.errorResponse;;
                                                              $scope.otpErrorFlag=true;
                                                            }

															//$scope.restartTransactionDialog = true;

														});

										}


										if (headers.msgHeader.hostStatus == 'E') {
											if (!angular.isUndefined(headers.msgHeader.error.errorMessage)) {
												$scope.authMesssage = headers.msgHeader.error.errorMessage;
												$scope.authMesssage=msg;
                                                $scope.authFlag=true;
                                                $scope.loginBtnDisabled = true;
											}

										}

                        }

                    });
                    checkCustomerExist.error(function(data) {
                        $scope.errorSpin = false;
                        if (data == "") {
                            gadgets.pubsub.publish("no.internet");
                        } else {
                            $scope.authMesssage = data.rsn;
                            $scope.showSuccessPage = false;
                            $scope.authFlag = true;
                        }

                    });



									});
							restCall.error(function(data) {
							    $scope.errorSpin = false;
								//alert('Login failure');
								//5229
								if(data==""){
                                     gadgets.pubsub.publish("no.internet");
                                }else{
								$scope.authMesssage = $scope.errorResponse;
								$scope.showSuccessPage = false;
								$scope.authFlag = true;
								}

							});

			} else {
				$scope.authFlag = true;
				$scope.authMesssage = 'Please check your Username and Password';
			}
		};

		$scope.openOtpDialog = function() {

			$scope.showSuccessPage = false;

			$scope.OTPModalShown = true;

		};

		$scope.openMsgDialog = function() {

			$scope.showResendOTP = true;
			$scope.showTimerPage = false;



		};

		$scope.resendOTP = function() {
			/*$scope.stopTimer();
			$scope.showTimerPage = true;
			$scope.startTimer();*/
			//$('#resendOtpBtn').prop('disabled', true);
		    console.log('Resend OTP');
			//Dont need
			$scope.resendCount = $scope.resendCount + 1;
			$scope.trxType = 'MPINREG';
			if($scope.forgotMpin!=null && $scope.forgotMpin=='true'){
                $scope.existingMpinFlag = false;
                $scope.trxType = 'FORGOTMPIN';
            }
			var postData = {
				'msgHeader' : $scope.msgHeader,
				'customerId' : $scope.customerId,
				'mobileNo' : $scope.mobileNo,
				'resendOTP' : true,
				'txnType' : $scope.trxType
			};
			$scope.errorSpin = true;
			postData = $.param(postData || {});

			var sendOTPServiceCall = $http({
				method : 'POST',
				url : $scope.sendOTP,
				data : postData
			});

            console.log('Test'+postData);
			sendOTPServiceCall.success(function(headers1, data1) {
                console.log('Reset OTP'+JSON.stringify(headers1));
			    $scope.errorSpin = false;
			    if(headers1.data.successFlag){
			        console.log('OTP resent successfully');
			    }else{
			       if(headers1.data.errCode=='OTPERR002'){
                      // $scope.showUserLoginScreen = true;
                       $scope.control.loginId='';
                       $scope.control.loginPassword='';
                       $scope.resendDisableOTP=true;
                    // $scope.showOTPLoginScreen = false;
                       $scope.otpErrorFlag=true;
                       $scope.otpErrorMsg=headers1.data.errMsg;
                   } else{
                        $scope.otpErrorFlag = true;
                        $scope.otpErrorMsg = headers1.data.errMsg;
                   }
                   console.log('IN error block'+data1);
			    }
			});
			sendOTPServiceCall.error(function(headers1, data1) {
			    $scope.errorSpin = false;
				$scope.showSuccessPage = false;
				//5229
				if(headers1==""){
                                       gadgets.pubsub.publish("no.internet");

				}else{
				var msg = "Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while."
				  if(headers1.msgHeader.error.errorMessage != null && headers1.msgHeader.error.errorMessage != 'undefined'){
                        msg = headers1.msgHeader.error.errorMessage;
                   }
                   $scope.otpErrorFlag=true;
                   $scope.otpErrorMsg = msg;
                }
			});
		}

		$scope.closeResendOTP = function() {
			$scope.showResendOTP = false;
			$('#delayOTPMsg').hide();
			$('#timerOTPMsg').show();

		}

		$scope.openOTPSendManuallyDialog = function() {
			//pluginObj.updateLocalStorage('smsReadFlag', false);
			/*var smsPlugin = cxp.mobile.plugins && cxp.mobile.plugins['SMSPlugin'];
			if(smsPlugin && smsPlugin.updateLocalStorage){
				smsPlugin.updateLocalStorage('smsReadFlag', false);
			}*/
			$scope.smsReadFlag = false;
			$scope.OTPModalShown = false;
			$scope.showTimerPage = false;
			$scope.stopTimer();
			$scope.updatePreferences();
		};

		$scope.openOTPSendDialog = function() {
			$scope.OTPModalShown = false;
			$scope.startTimer();
			$scope.smsReadFlag = true;
			//pluginObj.updateLocalStorage('smsReadFlag', true);
			/*var smsPlugin = cxp.mobile.plugins && cxp.mobile.plugins['SMSPlugin'];
			if(smsPlugin && smsPlugin.updateLocalStorage){
				smsPlugin.updateLocalStorage('smsReadFlag', true);
			}*/
			$scope.updatePreferences();
			$scope.OTPModalShown = true;
			$scope.showTimerPage = true;



		};

		$scope.updatePreferences = function(){

		        pubKey = readKey.getValues("publicKeyValue");
                                                     exp = readKey.getValues("exp");
                                                     mod = readKey.getValues("mod");
                                                     enciphering.setEncodeKey(pubKey, mod, exp);
                                                   //  console.log(enciphering.setEncrpt(vc.user.password));
                                                      $scope.bioAuthToken = enciphering.setEncrpt($scope.bioAuthToken);
				var postData = {
					'msgHeader' : $scope.msgHeader,
					'userid' : $scope.control.loginId,
					'notificationFlag' : $scope.notificationPermissionFlag,
					'notificationToken' : $scope.notificationTokenId,
					'smsReadingFlag' : $scope.smsReadFlag,
					'bioAuthFlag' : $scope.bioMetricAuthFlag,
					'bioAuthToken' : $scope.bioAuthToken
				};

				postData = $.param(postData || {});
                $scope.errorSpin = true;
				var xhr = $http({

					method : 'POST',
					url : updateUserPreferenceUrl,
					data : postData
				});
				xhr.success(function(data) {
				             $scope.errorSpin = false;
									$scope.success = {
										happened : true,
										msg : 'OTP has been successfully sent to your registered mobile number'
									};

									$scope.error = {
										happened : false,
										msg : ''
									};

								}
							);
				xhr.error(
								function(data, status, headers, config) {
								    $scope.errorSpin = false;
									$scope.success = {
										happened : false,
										msg : ''
									};
								}
						);



		}

		$scope.timer = null;

		$scope.stopTimer = function() {
			clearInterval($scope.timer);
		}
		$scope.startTimer = function() {
			var i = 30;

			$scope.timer = window.setInterval(function() {
				$('#timerLabel').html(i);
				if (i == 0) {
					// alert(1);
					$scope.stopTimer();
					$('#resendOtpBtn').prop('disabled', false);
					$('#delayOTPMsg').show();
					$('#timerOTPMsg').hide();

					$scope.OTPModalShown = false;
					if ($scope.resendCount == 5) {
						$('#delayOTPMsg').hide();
						$('#timerOTPMsg').hide();
						$('#maxResendMPINMsg').show();
						$scope.resendDisableOTP = true;
					}
					i = 30;
					$('#timerLabel').html(i);
				}
				if (i > 0) {
					i--;
				} else {
				}
			}, 1000);
			// alert($scope.timer);
		}

		$scope.maxResendMPINMsg = function() {
			$scope.showTimerPage = false;
			$scope.restartTransaction();
		}

		$scope.restartTransaction = function() {
		  //  alert("restrat transaction");
			$scope.restartTransactionDialog = false;
			$scope.showUserLoginScreen = true;
			$scope.control.loginId='';
			$scope.control.loginPassword='';
			$scope.showOTPLoginScreen = false;
			$scope.mpinRegistration = false;
			$scope.mpinRegisSuccess = false;
			$scope.mpinFingerRegis = false;
		}


		$scope.encrypt = function() {
			console.log(JSON.stringify('idfcerror::' + idfcHanlder));
			console.log(JSON.stringify('fileSaver::' + fileSaver));
			console.log(JSON.stringify(idfcBase64));
			console.log(idfcBase64.encode('password12345657'));
			// console.log(encyptPassNew);
		};
		$scope.nextPin = function(val) {
			// console.log('val:::'+val);
			//$scope.encrypt();
			if ($scope.count < 8)
				$scope.count++;

			var mpinValue = $scope.vals[val - 1];
			if (val == '0') {
				mpinValue = val;
			}
			var newlistItem = document.getElementsByName('newmpinslot');
			$scope.filled = $scope.populatePin(newlistItem, $scope.filled,
					mpinValue);

			if ($scope.count == 8) {
				$scope.showErrorMsg();
			}
		};

		$scope.setValue = function(mpinValue) {

		};

		$scope.reset = function() {
		    //alert('reset');
		    for (var i = 1; i < 9; i++){
                var item = angular.element(document.querySelector('#old_'+i));
                if(i == 1)item.focus();
                item.val('');
            }
		};

		$scope.removeLatest = function() {
			console.log('ss');
			$scope.count--;
			if ($scope.count < 0) {
				$scope.count = 0;
			}
			// alert($scope.count);
			var listItem = document.getElementsByName('newmpinslot');
			listItem[$scope.count].value = '';
			listItem[$scope.count].style.backgroundColor = '#ffffff';
			listItem[$scope.count].style.color = '#c8cccf';
		};

		$scope.populatePin = function(listItem, filled, mpinValue) {
			var newNums = '';
			filled = 0;
			for (var i = 0; i < listItem.length; i++) {
				newNums = listItem[i * 1].value;
				// alert('val :: '+mpinValue);
				if (newNums == '') {
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
			// alert('filled :: '+filled);
			return filled;
		};

		$scope.closeAppMsg = function() {
		   // alert('close dialog');
			$scope.showAppUpgradeMsg = false;
		}

		$scope.validate = function(listItem) {
			console.log('listItem :: ' +listItem);
			var errorMessage = '';
			var newMpin1 = listItem.slice(0, 4);
			var newMpin2 = listItem.slice(4, 8);

			var is_same = (newMpin1.length == newMpin2.length)
					&& newMpin1.every(function(element, index) {
						return element === newMpin2[index];
					});

			if (is_same == false) {
				return errorMessage = '1';
			}
			if ((listItem[3] - listItem[2] == 0)
					&& (listItem[2] - listItem[1] == 0)
					&& (listItem[1] - listItem[0] == 0)) {
				//alert('same value');
				return errorMessage = '2';
			}
			return errorMessage;
		}

		$scope.registerOTP = function(listItem) {
            var mpin = '';
            		    for(var i=0;i<4;i++){
            		        mpin = mpin + listItem[i];
            		    }

			$scope.trxType = 'MPINREG';
            	if($scope.forgotMpin!=null && $scope.forgotMpin=='true'){
            	 $scope.existingMpinFlag = false;
            	$scope.trxType = 'FORGOTMPIN'
            	}
            	pubKey = readKey.getValues("publicKeyValue");
                                                                     exp = readKey.getValues("exp");
                                                                     mod = readKey.getValues("mod");
                                                                     enciphering.setEncodeKey(pubKey, mod, exp);
                                                                   //  console.log(enciphering.setEncrpt(vc.user.password));
                                                                      mpin = enciphering.setEncrpt(mpin);

			var postData = {
				'msgHeader' : $scope.msgHeader,
				'customerId' : $scope.customerId,
				'mpin' : mpin,
				'smsReadFlag' : true,
				'notificationFlag' : false,
				'txnType' : $scope.trxType,
				'withNoUserName' : $scope.withNoUserName
			};
			postData = $.param(postData || {});
                //For Post Login Change URL
              if($scope.postLogin=='true'){
                  $scope.registerMPINUser = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('registerMPINUserPostLogin'));

              }
			var restCall = $http({

				method : 'POST',
				url : $scope.registerMPINUser,
				data : postData
			});
            $scope.errorSpin = true;
			restCall
					.success(function(headers, data) {
					    console.log(JSON.stringify(headers));
                        $scope.errorSpin = false;
						if(headers.msgHeader.hostStatus == 'E'){
							$scope.validationMsg = headers.msgHeader.error.errorMessage;
							    gadgets.pubsub.publish("display.1btn.popup",{
                                data:"MPINVALMSG",
                                message: $scope.validationMsg
                            });
						}else if(headers.msgHeader.hostStatus == 'S'){
							if(headers.data.errCode != null && headers.data.errCode.length > 0){
								if('REGMPINERR001' == headers.data.errCode){
									$scope.validationMsg = headers.data.errMsg;
									//$scope.existingMPINSetup = true;
									$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
									 var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
                                      if(globalVariablePlugin1)
                                       {
                                                         globalVariablePlugin1.setMpinFlag(null,null,'true');
                                       }
                                       else{
                                                          console.log('Fatal Error: Global Variable plugin not registered');
                                      }
								}else{
								   $scope.validationMsg = headers.data.errMsg;
								   gadgets.pubsub.publish("display.1btn.popup",{
                                    data:"MPINVALMSG",
                                    message: $scope.validationMsg
                                });
								//$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
								}
							}else{
							   //SOB3 Sourav PwC Finger print dev
                                //5258
							    var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
                                     if(globalVariablePlugin1)
                                         {
                                              globalVariablePlugin1.setMpinFlag(null,null,'true');
                                              globalVariablePlugin1.setFingerPrintSetupJS(null,null,'false');
                                          }
                                          else{
                                              console.log('Fatal Error: Global Variable plugin not registered');
                                          }

							    console.log('$scope.fingerScanEnabledDevice :: '+$scope.fingerScanEnabledDevice);
								var item = $document[0].activeElement;
                                if(!angular.isUndefined(item))item.blur();
								/*$timeout(function() {
                                  var item = $document[0].activeElement;
                                  if(!angular.isUndefined(item))item.blur();
                                } , 500);*/
								if ($scope.fingerScanEnabledDevice) {
									$scope.mpinFingerRegis = true;

                                    //Post Login Finger Print
                                    if($scope.postLogin=='true'){
                                    $scope.hideLoginBtn=false;
                                    console.log("Login"+$scope.hideLoginBtn);
                                    }
                                } else {
								      if($scope.postLogin=='true'){
								      $scope.hideLoginBtn=false;
								      console.log("Login"+$scope.hideLoginBtn);
								      }
								    console.log("Login"+$scope.hideLoginBtn);
									$scope.mpinRegisSuccess = true;
								}
								$scope.mpinRegistration = false;
							}
						}


						$scope.reset();

					});
			restCall.error(function(headers, data) {
			    $scope.errorSpin = false;
			           //5229
			           if(headers==""){
			                                   gadgets.pubsub.publish("no.internet");
			           }
					    else if(headers.msgHeader.hostStatus == 'E'){
							$scope.validationMsg = headers.msgHeader.error.errorMessage;
							$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
						}else if(headers.msgHeader.hostStatus == 'S'){
							if(headers.data.errCode != null && headers.data.errCode.length > 0){
								$scope.validationMsg = headers.data.errMsg;
								$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
							}
						}else{
						$scope.validationMsg = 'OTP Registration fails.';
						$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
						}
						$scope.reset();
			});
		}

		 /** This is the function while navigation comes from set up MPIN **/
         $scope.loadLoginPage=function(){
            resetMVisaLoginFlag();
            resetScanAndPayFlag();
            gadgets.pubsub.publish('launchpad-mpinlogin');//Redirecting to MPIN LOGIN widget
         };

		$scope.continueToLogin = function() {
			gadgets.pubsub.publish('launchpad-mpinlogin');
			//$window.location.replace($scope.mpinLoginURL );

		}

		$scope.showErrorMsg = function(listItem) {
			var errorMsg = $scope.validate(listItem);
			if (errorMsg == '') {
				$scope.registerOTP(listItem);
				$scope.reset();
			} else if (errorMsg == 1 && !popupMenu) {
			    popupMenu=true;
				$scope.validationMsg = 'The MPINs do not match.Please enter the same MPIN in both fields.';
				gadgets.pubsub.publish("display.1btn.popup",{
                    data:"MPINVALMSG",
                    message: $scope.validationMsg
                });
			} else if (errorMsg == 2 && !popupMenu) {
			    popupMenu=true;
				$scope.validationMsg = 'That\'s a weak MPIN! please choose a more complex MPIN for your security.';
				gadgets.pubsub.publish("display.1btn.popup",{
                    			data:"MPINVALMSG",
                    			message: $scope.validationMsg
                		});

			}
			//$scope.reset();
		};


        //SMS Reading -- Start
                        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt){
            console.log(evt.resendOtpFlag);
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.readSMS('resend');
        });


        //SBO3 Sourav PwC
       // //SMS Reading -- Start
       $scope.readSMS = function(resendFlag){
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if(smsPlugin){
                var isCheckSuccessCallback = function(data) {
                    if(data) {
                        var smsPermissionFlag = data['successFlag'];
                        if(smsPermissionFlag){
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            //alert('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS",{
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "MPINSetup"
                            });

                             console.log('Resend flag->'+resendFlag);
                                if('resend'===resendFlag){
                                    $scope.resendOTP();
                                }

                            //Step 2. Send request to "sendOTP service
                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("MPINSetup", function(evt){
                                //alert(evt.otp);
                                var receivedOtp = evt.otp;
                                console.log('OTP: '+receivedOtp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver",{
                                    data:"Stop Reading OTP"
                                });
                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                //$scope.myEl = angular.element( document.querySelector( '#autoReadOTPVal' ) );
                                //$scope.myEl.val(receivedOtp);
                                console.log('Form:'+$scope.dummy);

                                //$scope.dummy.OTPform.$valid = true;
                                //$scope.dummy.OTPform.submitted =true;
                                $scope.dummy.control.otpValue = receivedOtp;
                                $scope.$apply();
                                angular.element('#login_pop').triggerHandler('click');
                            });
                        }
                        else{
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
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
       }

       /**************SOB2 PwC Sourav UAT Issue - 5157 *********************/
       $scope.nextPinForRegMpin = function(){
        var mpinValue = '';
           //if(event.keyCode == 9){
               for (var i = 1; i < 5; i++){
                    //var item = angular.element(document.querySelector('#old_'+i)).val();
                    var item = angular.element(document.querySelector('#ex_'+i)).val();
                    //alert(item);
                    console.log('item::: ' +item);
                    if(!angular.isUndefined(item) && item != ''){
                        mpinValue = mpinValue+item;
                    }else{
                        return false;
                    }
                }
                //alert('mpinValues :: ' +mpinValue);
                $scope.checkMpinRegUcic(mpinValue);
           //}
       }

       $scope.resetForRegMpin = function() {
        //alert('reset..');
        for (var i = 1; i < 5; i++){
            var item = angular.element(document.querySelector('#ex_'+i));
            if(i == 1)item.focus();
            item.val('');
        }
       };

       $scope.removeLatestForRegMpin = function() {

       };
       /**************END SOB2 PwC Sourav UAT Issue - 5157 *********************/


        /*New development change request Developed by PwC*/
         $scope.keydownevt = function () {
                   //alert('keydownevt :: '+event.keyCode);
                   var listItem = [];
                   //if(event.keyCode == 9){
                       for (var i = 1; i < 9; i++){
                       	    var item = angular.element(document.querySelector('#old_'+i)).val();
                       	    if(!angular.isUndefined(item) && item != ''){
                       	        listItem[i-1] = item;
                       	    }else{
                                return false;
                       	    }
                        }
                        $scope.showErrorMsg(listItem);
                   //}
         };


        //mvisa-clear flag to clear earlier scanned qr or key entry data if app killed or repopend
        var resetScanAndPayFlag = function(){
            console.log("called clearScanAndPayFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin1){
                globalVariablePlugin1.clearScanAndPayFlag(null,null,'');
            }
            else{
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }

         var resetMVisaLoginFlag = function(){
            console.log("called resetMVisaLoginFlag:");
            var globalVariablePlugin1 = cxp.mobile.plugins['GlobalVariables'];
            if(globalVariablePlugin1){
                globalVariablePlugin1.clearMVisaLoginFlag(null,null,'');
            }
            else{
                console.log('Fatal Error: Global Variable plugin not registered');
            }
        }




          /*New development change request Developed by PwC*/

		$scope.initialize();
		//Fixed Defect 5238
		gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });
    $timeout(function(){
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
