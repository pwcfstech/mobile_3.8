/**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {
    'use strict';
	var $ = require('jquery');
    /**
     * Main controller
     * @ngInject
     * @constructor
     **/
      var enciphering = require('./support/production/angular-rsa-encrypt');
      var readKey = require('./support/rsaKeySetup/rsaKeySetup');
     var idfcHanlder = require('idfcerror');
	function CaptureFingureController($scope, $http, i18nUtils, lpCoreUtils, lpWidget, $window, lpPortal, lpCoreBus,$location, $timeout) {
	    $scope.errorSpin = true;
	    $scope.showSetupFingerPrint=true;
	    //IDFC 2.5 text change
	    /*$scope.fingerPrintMsg = 'Setup fingerprint scanner for quick login';*/
	    $scope.fingerPrintMsg = 'Enable use of fingerprint registered on the device for faster login';

         $scope.initialize = function(){
            //Retrieving the service url from model.xml
                    //Session Management
                    idfcHanlder.validateSession($http);
                    console.log('Executed Session');
            		$scope.serviceUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('updateUserPreferenceUrl'));
            		console.log('$scope.serviceUrl ::: '+$scope.serviceUrl);
            		var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
            		$scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
                    $scope.imagePath = path+ '/media/touchid.png';
                    console.log('$scope.imagePath:::' +$scope.imagePath);
                    $scope.congratsImagePath = path + '/media/congts.png';
                    $scope.errorImagePath = path + '/media/error.png';
                    $scope.errorSpin = true;
                    var navigateFormMPINSetup = localStorage.getItem('navigateFormMPINSetup');
                    if(angular.isUndefined(navigateFormMPINSetup) && navigateFormMPINSetup === 'true')
                    $scope.showButton = true;
                    else
                    $scope.showButton = false;
                    //Enable finger print set up page
                    $scope.setUpfingerPrint = true;
                    $scope.templates = {
                    	setupfingerPrintPage: $scope.partialsDir +'/enableFingerPrint.html',
                    	happened: false
                    };
                    //Disable success page while loading FP
                    $scope.successForm = false;

        //Response messages
        $scope.errorResponse = 'Sorry our machines are not talking to each other. Humans are trying to fix the problem. Please come back in a few moments.';
        $scope.ftpErrorResponse = 'Something is going wrong while set up your finger print. Please come back in a few moments.';


		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
		$http.defaults.headers.post['Accept'] = 'application/json';

	    var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
        if(globalVariablePlugin){
                				var getFingerPrintSetupSuccessCallback = function(data) {
                				    console.log('getFingerPrintSetupErrorCallback header ::' +JSON.stringify(data));
                					if(data) {
                						console.log('Device '+JSON.stringify(data));
                                                if(data['fingerPrintSetup']=='true'){
                                                $scope.showSetupFingerPrint=false;
                                                $scope.fingerPrintMsg='You don\'t need to do this. We already have your fingerprint registered! ';
                            					} else {
                            						console.log('Finger not set: ');
                            					}
                            					 $scope.errorSpin = false;
                            				}
                            		};
                            		var getFingerPrintSetupErrorCallback = function(data) {
                            					console.log('Something really bad happened');
                            					$scope.errorSpin = false;
                            		};

                            		globalVariablePlugin.getFingerPrintSetup(
                            					getFingerPrintSetupSuccessCallback,
                            					getFingerPrintSetupErrorCallback
                            		);
                                        //$scope.errorSpin = false;
                     }else{
                            				console.log('globalVariablePlugin is '+globalVariablePlugin);
                            			}





       // var globalVariablePlugin = cxp.mobile.plugins && cxp.mobile.plugins['GlobalVariables'];
		/*SP2 -PwC */

        			if(globalVariablePlugin){
        				var getDeviceFootPrintHeaderSuccessCallback = function(data) {
        				    console.log('getDeviceFootPrintHeaderSuccessCallback header ::' +JSON.stringify(data));
        					if(data) {
        						console.log('Device '+JSON.stringify(data));
                                var jsonObj = {
                                    'deviceId' :  data['deviceId'],
                                    'channel' : data['channel'],
                                    'ipAddress' : data['ipAddress'],
                                    'timeZone' : data['timeZone'],
                                    'nwProvider' : data['nwProvider'],
                                    'connectionMode' : data['connectionMode'],
                                    'geoLatitude' : data['geoLatitude'],
                                    'geoLongitude' : data['geoLongitude']
                                };

                    						$scope.msgHeader = JSON.stringify(jsonObj);
                    						console.log('Device header >>>> ::' +$scope.msgHeader);
                    					} else {
                    						console.log('Failure: '+ JSON.stringify(data));
                    					}
                    					 $scope.errorSpin = false;
                    				};
                    				var getDeviceFootPrintHeaderErrorCallback = function(data) {
                    					console.log('Something really bad happened');
                    					$scope.errorSpin = false;
                    				};

                    				globalVariablePlugin.getDeviceFootPrintHeader(
                    					getDeviceFootPrintHeaderSuccessCallback,
                    					getDeviceFootPrintHeaderErrorCallback
                    				);
                                //$scope.errorSpin = false;
                    			}else{
                    				console.log('globalVariablePlugin is '+globalVariablePlugin);
                    			}
         }


       /***********--------TARAL COPY START ----------*********/
       
		$scope.setupFingerprint = function(){
       
       
		   console.log('setupFingerprint');
		   var fingerPrintPlugin = cxp.mobile.plugins['fingerPrintPlugin'];
		   if(fingerPrintPlugin){
			  var isFPSetupSuccessCallback = function(data) {
				 if(data) {
       
					if (data['successFlag']== true || data['successFlag']== "true") //CHECK THIS WITHOUT QUOTES ON ANDROID
					{
					   $scope.bioAuthToken = data['fpToken'];
					   $scope.fingerprintSetupSuccessful = true;
					   console.log('Token ID: '+data['fpToken']);
						$scope.notificationPermissionFlag = true;
						$scope.bioMetricAuthFlag = data['successFlag'];
						$scope.notificationTokenId = '';//TODO Notification ID and Notification Token
						var pubKey, exp, mod;
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
						postData = $.param(postData || {});
						$scope.errorSpin = true;
						var serviceCall = $http({
							method: 'POST',
							url:$scope.serviceUrl,
							data: postData
						});
						serviceCall.success(function(headers, data) {
						    $scope.errorSpin = false;
							console.log('Service call has become successful');
							$scope.authFlag=true;
							console.log(headers.msgHeader.hostStatus);
							if(headers.msgHeader.hostStatus =='S'){
                                
                                //To do here: Call Global variable and set following parameters
                                //   a). Param1: fpToken
                                //   b). Param2: fpSetupFlag
                                            
								console.log('Host Status of Message header is S');				
                            
								if(headers.msgHeader.deviceBlockFlag){
									
									$scope.blacklist=true;
									$scope.authMesssage=headers.msgHeader.deviceBLockErrMsg;
                                   // globalVariablePlugin.resetDevice();
									//native pop up
									gadgets.pubsub.publish("display.1btn.popup",{
                                         data:"DVCEBLCKLIST",
										 message:$scope.authMesssage
                                     });

								}else{
									if(headers.data.successFlag){
										//need to update fingerScanEnabledDevice to true -- Start
										//globalVariablePlugin.setfingerScanEnabledDevice();
										//need to update fingerScanEnabledDevice to true -- End
										$scope.successForm = true;
										$scope.templates = {
										    happened : false,
											successful: $scope.partialsDir + '/FingerPrintSuccess.html'
										};
											
									}					
									else{
									    console.log('error image:: '+$scope.errorImagePath);
									    $scope.successForm = true;
										$scope.errorCode=headers.data.errCode;
										$scope.authMesssage=headers.data.errMsg;
										$scope.templates = {
										         happened : true,
												successful: $scope.partialsDir + '/enableFingerPrint.html'
										};
									}
										
								}
							}else{
								$scope.showErrorFlag=true;
                                $scope.errorCode=headers.msgHeader.error.errorCode;
                                $scope.authMesssage=headers.msgHeader.error.errorMessage;
								$scope.templates = {
										successful: $scope.partialsDir + '/enableFingerPrint.html'
								};
							}
						});
						serviceCall.error(function(headers, data) {
						    $scope.errorSpin = false;
							console.log('Service call has failed' +JSON.stringify(headers));
							$scope.showErrorFlag=true;
							$scope.authMesssage='Call Failed';
							$scope.showSuccessPage = false;
							$scope.authFlag=true;
	    					//native pop up
                            gadgets.pubsub.publish("display.1btn.popup",{
                                data:"FPSETUPERROR",
                                message: $scope.errorResponse
                            });
						});

					}
					else if (data['successFlag']== false || data['successFlag']== "false"){
                    /*$scope.fingerprintSetupSuccessful = false;
                    console.log('Registration Error: '+data['errorDesc']);
                    gadgets.pubsub.publish("display.1btn.popup",{
                              data:"FPSETUPERROR",
                              message: $scope.ftpErrorResponse
                              });*/
                        //Dont require popup here Native takes care of
					}
					
				 } else {
					//alert('Failure: '+ JSON.stringify(data));
					$scope.fingerprintSetupSuccessful = false;
					console.log('Failure: '+ JSON.stringify(data));
					gadgets.pubsub.publish("display.1btn.popup",{
                        data:"FPSETUPERROR",
                        message: $scope.ftpErrorResponse
                    });
				 }
			  };
			  var isFPSetupErrorCallback = function(data) {
				 //alert('Something really bad happened');
				 $scope.fingerprintSetupSuccessful = false;
				 console.log('Something really bad happened');
				 gadgets.pubsub.publish("display.1btn.popup",{
                   data:"FPSETUPERROR",
                   message: $scope.ftpErrorResponse
                 });
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
			  gadgets.pubsub.publish("display.1btn.popup",{
                data:"FATALERROR",
                message: $scope.ftpErrorResponse
              });
		   }
		}
       
       /***********--------TARAL COPY END ----------*********/

		  /** This is the function while navigation comes from set up MPIN **/
             $scope.loadLoginPage=function(){
                resetMVisaLoginFlag();
                resetScanAndPayFlag();
             	gadgets.pubsub.publish('launchpad-mpinlogin');//Redirecting to MPIN LOGIN widget
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

        $scope.initialize();

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
    exports.CaptureFingureController = CaptureFingureController;
});
