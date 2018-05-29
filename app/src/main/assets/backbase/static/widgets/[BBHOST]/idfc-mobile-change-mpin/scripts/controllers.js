/**
 * Controllers
 * 
 * @module controllers
 */
 // password encrypt changes


define(function(require, exports , module) {
	'use strict';
	var $ = require('jquery');
	//var idfcConstants = exports.idfcConstants;//require('idfccommon').idfcConstants;
	//var idfcHanlder = require('idfcerror');
	//var idfcBase64 = require('idfcbase64').Base64;
	//var fileSaver = require('fileSaver');
	//var pluginObj = require('plugin');

	 var idfcHanlder = require('idfcerror');
	/**
	 * Main controller
	 * 
	 * @ngInject
	 * @constructor
	 */
	  var enciphering = require('./support/production/angular-rsa-encrypt');
                	  var readKey = require('./support/rsaKeySetup/rsaKeySetup');
	     var popupMenu=false;

	function MpinController($scope, $http, i18nUtils, lpCoreUtils, lpWidget,lpPortal,
	                lpCoreBus , $location , $element ,$q, $timeout) {
			$scope.errorSpin = true;
			this.utils = lpCoreUtils;
			this.widget = lpWidget;
			//Session Management
            idfcHanlder.validateSession($http);
            console.log('Executed Session');
             if(localStorage.getItem("origin")=="settings-widget"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
             }
			$timeout(function(){
				mpinCtrl($scope, $http, i18nUtils, lpCoreUtils, lpWidget,lpPortal, lpCoreBus, $location , $element , $q);
			}, 1500);

	};
	
	function mpinCtrl($scope, $http, i18nUtils, lpCoreUtils, lpWidget,lpPortal, lpCoreBus , $location , $element , $q) {


       $scope.errorSpin = false;
       console.log("changeMpin subscribe called ");
       gadgets.pubsub.subscribe('launchpad-mpinchange');

		//$scope.init= function(){
		var globalVariablePlugin =  cxp.mobile.plugins['GlobalVariables'];
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
				};
				var getDeviceFootPrintHeaderErrorCallback = function(data) {
					console.log('Something really bad happened');
				};

				globalVariablePlugin.getDeviceFootPrintHeader(
					getDeviceFootPrintHeaderSuccessCallback,
					getDeviceFootPrintHeaderErrorCallback
				);

			}else{
				console.log('globalVariablePlugin is '+globalVariablePlugin);
			}
		
		//$scope.redirectToSignIn = lpPortal.root + '/' + lpPortal.name;
		$scope.idfcConstants = {
		/*MPIN CHANGE VALIDATION CONSTANTS*/
		CHANGE_MPIN_VALIDATION_ONE : 'The MPINs do not match. Please enter the same MPIN in both fields.',
		CHANGE_MPIN_VALIDATION_TWO : 'That is a weak MPIN! Please choose a more complex MPIN for your security.',
		CHANGE_MPIN_VALIDATION_THREE : 'Aww... not that one again! Your old and new MPIN are same! Please choose an MPIN that you have not used before.',
		CHANGE_MPIN_RESPONSE_ERROR : 'Error occured while processing your request',
		CHANGE_MPIN_RESPONSE_SUCCESS : 'Your MPIN has been changed. Please login again using this new MPIN.',
		CHANGE_MPIN_SVC_FAIL : 'Sorry our machines are not talking to each other. Humans are trying to fix the problem. Please come back in a few moments'
		//CHANGE_MPIN_BLACKLIST_RESPONSE : 'This device has been blacklisted. Please call 1800 419 4332 for help.'
		};	
		$http.defaults.headers.post['_ui_d_'] = 'QkBua1VzMm8xNg==';
		$http.defaults.headers.post['_c_Rd_'] = 'MXEydyFRQFc=';//
		$scope.showAppUpgradeMsg = false;
		$scope.oldPinNumbers = [ 1, 2, 3, 4 ];
		$scope.NewPinNumbers = [ 5, 6, 7, 8 ];
		$scope.reEnterPinNumbers = [ 9, 10, 11, 12 ];
		$scope.pinNumber = {};
		$scope.filled = 0;
		$scope.vals = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
		$scope.count = 0;

		//native pop up handle
		gadgets.pubsub.subscribe("CHNGMPINSUC", function(){
        	//Logout user
           	gadgets.pubsub.publish("LoadLogOut");
            //for UATand preprod
            //gadgets.pubsub.publish("launchpad-logout");

        });
        gadgets.pubsub.subscribe('CHNGMPINRESETFIELDS',function(){
                                popupMenu=false;

                   $scope.reset();
       });
		//$scope.msgHeader = $scope.jsonObj;
		console.log('after device header called setting header:: '+ $scope.msgHeader);
		$scope.userChangeMPINServiceUrl= lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('userChangeMPINServiceUrl'));
		console.log('userChangeMPINServiceUrl ' +$scope.userChangeMPINServiceUrl);
		$scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';
		$scope.templates = 
		{
		    //Remove inital /
			appUpgradeMsg: 'templates/partial' + '/appUpgradeMsg.html'
		};
		console.log('appUpgradeMsg path '+$scope.templates.appUpgradeMsg);
		$scope.oldMPINVal = '';
		$scope.newMPINVal = '';
		$scope.resetCount = 0;
		$scope.encrypt = function(val) {
			return val;
		};

		 $scope.keydownevt = function () {
                //alert('keydownevt :: '+event.keyCode);
                //if(event.keyCode == 9 || event.keyCode == 13){
                     for (var i = 1; i < 13; i++){
                        var item = angular.element(document.querySelector('#old_'+i)).val();
                        if(angular.isUndefined(item) || item == ''){
                            return false;
                        }
                   }
                   $scope.showErrorMsg();
               //}
         };

         gadgets.pubsub.subscribe("native.back", function() {
            console.log("native.back handled in change mpin");
                        //localStorage.clear();
                        //localStorage.setItem("navigationFlag",true);
                        //localStorage.setItem("origin","reviewTransfer");
                        gadgets.pubsub.publish("launchpad-retail.viewSettings");
                        gadgets.pubsub.publish("js.back", {
                                data: "ENABLE_HOME"
                        });
                        //localStorage.clear();
             });

             gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
             console.log("device back GoBackInitiate handled in change mpin");
                 if(localStorage.getItem("navigationFlag")) {
                     localStorage.clear();
                     //localStorage.setItem("navigationFlag",true);
                     //localStorage.setItem("origin","reviewTransfer");
                     gadgets.pubsub.publish("launchpad-retail.viewSettings");
                     gadgets.pubsub.publish("js.back", {
                             data: "ENABLE_HOME"
                     });
                     //localStorage.clear();
                 }else {
                     gadgets.pubsub.publish("device.GoBack");
                 }
             });


		$scope.nextPin = function(val) {
			$scope.mpinValue = 0;
			$scope.resetCount++;
			if($scope.count == -1)$scope.count = 0;
			if ($scope.count < 5)
				$scope.count++;
			
			if(val != 0){
				$scope.mpinValue = $scope.vals[val - 1];
			}
			var oldlistItem = angular.element($element[0].getElementsByClassName('oldmpinslot'));
			$scope.filled = $scope.populatePin(oldlistItem, $scope.filled,
					$scope.mpinValue);
			var newlistItem = angular.element($element[0].getElementsByClassName('mpinslot'));
			if ($scope.count == 5 || $scope.resetCount > 4) {
				$scope.filled = $scope.populatePin(newlistItem, $scope.filled,
						$scope.mpinValue);
			}
			if ($scope.filled == 8) {
				$scope.showErrorMsg();
			}
		};

		$scope.reset = function() {
            for (var i = 1; i < 13; i++){
                var item = angular.element(document.querySelector('#old_'+i));
                if(i == 1)item.focus();
                item.val('');
            }
		};

		$scope.removeLatest = function() {
			if($scope.resetCount < 0){
				$scope.resetCount = 0;
			}
			if($scope.count < 0){
				$scope.count = 0;
			}
			var item = angular.element(document.querySelector('#old_' + ($scope.resetCount)));
			item.css('backgroundColor' , '#ffffff');
			item.css('color' , '#c8cccf');
			item.val('');
			$scope.resetCount--;
			$scope.count--;
		};

		$scope.changeMPIN = function(oldMPIN, newMPIN) {
			console.log('$scope.msgHeader input::::' +JSON.stringify($scope.msgHeader));
			/*gadgets.pubsub.publish('changempin.header',{
            				        data:$scope.msgHeader});*/

            var pubKey, exp, mod;
            pubKey = readKey.getValues("publicKeyValue");
            exp = readKey.getValues("exp");
            mod = readKey.getValues("mod");
             enciphering.setEncodeKey(pubKey, mod, exp);
             //  console.log(enciphering.setEncrpt(vc.user.password));
            oldMPIN = enciphering.setEncrpt(oldMPIN);

            enciphering.setEncodeKey(pubKey, mod, exp);
                         //  console.log(enciphering.setEncrpt(vc.user.password));
            newMPIN = enciphering.setEncrpt(newMPIN);
			$scope.postData = {
				'msgHeader' : $scope.msgHeader,
				'oldMPIN' : oldMPIN,
				'newMPIN' : newMPIN,
				'txnType' : 'CHGMPIN'
			};
			$scope.oldMPINVal = '';
            $scope.newMPINVal = '';
			$scope.postData = $.param($scope.postData || {});
			$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
			$http.defaults.headers.post['Accept'] = 'application/json';

			$scope.errorSpin = true;
			var restCall = $http({
				method : 'POST',
				url : $scope.userChangeMPINServiceUrl,
				data : $scope.postData
			});
			restCall.success(function(headers, data) {
			    $scope.errorSpin = false;


				console.log('headers.msgHeader::'+headers.msgHeader);
				$scope.hostStatus = headers.msgHeader.hostStatus;
				$scope.deviceBlockFlag = headers.msgHeader.deviceBlockFlag;
				$scope.deviceBLockErrMsg = headers.msgHeader.deviceBLockErrMsg;
				if($scope.hostStatus == 'E'){
					$scope.validationMsg = headers.msgHeader.error.errorMessage;
				}else if ($scope.hostStatus == 'S' && $scope.deviceBlockFlag) {
					//TO DO : Need to do Plugin integration , invoke reset device
					$scope.validationMsg =  $scope.deviceBLockErrMsg;  //device block
					
				}else if ($scope.hostStatus == 'S' && !$scope.deviceBlockFlag) {
					if(headers.data.successFlag){
					    $scope.validationMsg = $scope.idfcConstants.CHANGE_MPIN_RESPONSE_SUCCESS;
					    gadgets.pubsub.publish("display.1btn.popup",{
                            data:"CHNGMPINSUC",
                            message: $scope.validationMsg
                        });
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

			restCall.error(function(data) {
			    $scope.errorSpin = false;
			    //5229
			    if(data==""){
			                             gadgets.pubsub.publish("no.internet");

			    }else{
			        $scope.validationMsg = $scope.idfcConstants.CHANGE_MPIN_SVC_FAIL;
                    				//Calling native popup
                                    //$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
                                    gadgets.pubsub.publish("display.1btn.popup",{
                                        data:"CHNGMPINERR",
                                        message: $scope.validationMsg
                                    });

                    				$scope.showSuccessPage = false;
                    				$scope.authFlag = false;
			    }

			});
		};

		$scope.populatePin = function(listItem, filled, mpinValue) {
			var newNums = '';
			filled = 0;
			for (var i = 0; i < listItem.length; i++) {
				newNums = listItem[i * 1].value;
				if (newNums == '') {
					listItem[i].value = mpinValue;
					listItem[i].style.backgroundColor = '#000000';
					listItem[i].style.color = '#000000';
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

		$scope.validate = function() {
			var oldListItem = [];
			var listItem = []; 
			var oldMPinVal = {};
			for (var i = 5, j = 0; i < 13; i++, j++) {
				var mPinVal = angular.element(
						document.querySelector('#old_' + i)).val();
				listItem[j] = mPinVal;
				if(j < 4){
					oldMPinVal = angular.element(document.querySelector('#old_' +(j+1))).val();
					oldListItem[j] = oldMPinVal;
				}
			}
			var errorMessage = '';
			var oldMpin = oldListItem.slice(0,4);
			var newMpin1 = listItem.slice(0, 4);
			var newMpin2 = listItem.slice(4, 8);
			var isSameAsOldPin = (oldMpin.length == newMpin1.length)
			&& oldMpin.every(function(element, index) {
				return element === newMpin1[index];
			});
			
			var is_same = (newMpin1.length == newMpin2.length)
					&& newMpin1.every(function(element, index) {
						return element === newMpin2[index];
					});
			
			if(isSameAsOldPin){
				return errorMessage = '0';
			}
			if (is_same == false) {
				return errorMessage = '1';
			}
			if ((listItem[3] - listItem[2] == 0) && (listItem[2] - listItem[1] == 0) && 
					(listItem[1] - listItem[0] == 0)) {
				//console.log('Change MPIN checking if all digits are same:::');
				return errorMessage = '2';
			}
			return errorMessage;
		}

		$scope.showErrorMsg = function() {
			var errorMsg = $scope.validate();
			if (errorMsg == '') {
				for (var i = 1; i < 9; i++) {
					var mPinVal = angular.element(
							document.querySelector('#old_' + i)).val();
					if (i <= 4)
						$scope.oldMPINVal += mPinVal;
					else
						$scope.newMPINVal += mPinVal;
				}
				$scope.changeMPIN($scope.encrypt($scope.oldMPINVal), $scope.encrypt($scope.newMPINVal));
			} else if (errorMsg == 1 && !popupMenu) {
						    popupMenu=true;

				$scope.validationMsg = $scope.idfcConstants.CHANGE_MPIN_VALIDATION_ONE;
                //callingnative popup
				//$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
				gadgets.pubsub.publish("display.1btn.popup",{
                    data:"MPINVALMSG",
                    message: $scope.validationMsg
                });
			} else if (errorMsg == 2 && !popupMenu) {
						    popupMenu=true;

				$scope.validationMsg = $scope.idfcConstants.CHANGE_MPIN_VALIDATION_TWO;
				//$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
				gadgets.pubsub.publish("display.1btn.popup",{
                    data:"MPINVALMSG",
                    message: $scope.validationMsg
                });
			} else if (errorMsg == 0 && !popupMenu) {
						    popupMenu=true;

				$scope.validationMsg = $scope.idfcConstants.CHANGE_MPIN_VALIDATION_THREE;
				//$scope.showAppUpgradeMsg = !$scope.showAppUpgradeMsg;
				gadgets.pubsub.publish("display.1btn.popup",{
                    data:"MPINVALMSG",
                    message: $scope.validationMsg
                });
			}
		};

		$scope.closeModal = function() {
			$scope.showAppUpgradeMsg = false; // !$scope.showAppUpgradeMsg;
			$scope.reset();
			if($scope.validationMsg === $scope.idfcConstants.CHANGE_MPIN_RESPONSE_SUCCESS){
			    resetMVisaLoginFlag();
			    resetScanAndPayFlag();
				gadgets.pubsub.publish('launchpad-mpinlogin');
			}
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
