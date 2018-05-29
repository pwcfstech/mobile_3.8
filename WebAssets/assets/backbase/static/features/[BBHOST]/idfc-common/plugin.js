define(function(require, exports, module) {
	'use strict';

	exports.isPlugin = true;
	exports.isJsonRead = false;
	//This is to check whether plugin is there or not 
	if (exports.isPlugin){
		exports.globalVariablePlugin = lpWidget.feature && lpWidget.feature['GlobalVariables'];
		exports.fingerPrintPlugin = lpWidget.feature && lpWidget.feature['fingerPrintPlugin'];
		exports.smsPlugin = lpWidget.feature && lpWidget.feature['SMSPlugin'];
		
	}
	
	/**
	 *  Common method to populate localStorage
	 *  with device data
	 */
	module.exports.loadLocalStorage = function($ , $http){
		//console.log('inside load local storage' + $http);
		if(exports.isJsonRead){
		var urllink = //'https://172./static/mock-data/deviceinfo/localStorage.json';
		$http.get(urllink).success(function(data) {			
			var footprintresponse = data;
			if(!angular.isUndefined(footprintresponse)){
				var obj=footprintresponse.data;
				localStorage.clear();
				console.log('obj' +obj);
				$.each(obj, function(i, val) {
					if(val || !angular.isUndefined(val)){
						localStorage.setItem(i,JSON.stringify(val));
					}
				});
			}
		}).error(function(error){
				console.log('error ' + error);
		});
		}
	}
	
	/**
	 *  Common method to update localStorage
	 *  as well as device data
	 */
	module.exports.updateLocalStorage = function(key, val){
		console.log('inside update local storage');
		//if(exports.isJsonRead)
		if(val || !angular.isUndefined(val)){
			localStorage.setItem(key, JSON.stringify(val));
			//Below method needs further custom implementation
			//Uncomment below line to update data in the device as well
			exports.setGlobalVariable(key, JSON.stringify(val));
		}	 
		 

	}
	
	/**
	 *  Common method to parse values
	 */
	module.exports.tytPreGetBool = function (key){
		var flagName = '';
		var modifiedVal = '';
		console.log('key::: '+key);
		if(exports.isJsonRead){
			flagName = localStorage.getItem(key);
		}else{
		    console.log('flagName in else block::: '+flagName);
			modifiedVal =  exports.checkGlobalVariable(key);
    	}
		return modifiedVal;
	 }

	/*module.exports.parseValue = function(data){
	    console.log('parseValue data::' +data);
	    var modifiedVal = '';
	    if(data || !angular.isUndefined(data)){
           console.log('before parse::: '+modifiedVal);
           modifiedVal = data;
           console.log('modifiedVal::: '+modifiedVal);
        }
        return modifiedVal;
	}*/


	/**
	 * This is how Plugin to be used to set values in Global parameters 
	 * This can set {isSmsReadFlag} , {isFirstTimeLaunch} , {isMpinSetForDevice} , {bioMetricAuthFlag}
	 */
	module.exports.setGlobalVariable = function(flagName, flagValue) {

		if (exports.isPlugin && exports.globalVariablePlugin) {
			//Setting Marketing Pages visit global variable
			//True = user has already gone through marketing pages
			//false = user has not gone through marketing pages
			/*exports.globalVariablePlugin.setMarketingFlag(
					isMarketingSeenSuccessCallback,
					isMarketingSeenErrorCallback, true);*/
			exports.globalVariablePlugin.setGlobalFlags(
            					isMarketingSeenSuccessCallback,
            					isMarketingSeenErrorCallback, flagName,flagValue);
			var isMarketingSeenSuccessCallback = function(data) {
				if (data) {
					console.log('Success: ' + data[flagName]);
				} else {
					console.log('Failure: ' + JSON.stringify(data));
				}
			};
			var isMarketingSeenErrorCallback = function(data) {
				console.log('Something really bad happened');
			};
		} else {
			/**
			 * Here you need to set flagValue w.r.t flagName in Global Parameters
			 */
		}

	}

	/**
	 * This is how Plugin to be used to get values from Global parameters
	 * This can get {isSmsReadFlag} , {isFirstTimeLaunch} , {isMpinSetForDevice} , {bioMetricAuthFlag} 
	 */
        module.exports.checkGlobalVariable = function(flagName) {
	    console.log('in check Global variable function ' +flagName);
	    var response = '';
		if (exports.isPlugin && exports.globalVariablePlugin) {
			/*var isMarketingSeenSuccessCallback = function(data) {
				console.log('isMarketingSeenSuccessCallback ' + JSON.stringify(data));
				if (data) {
				    //console.log('Failure: ' + JSON.stringify(data));
					console.log('Success: ' + data[flagName]);
					response = data[flagName];
					//response = data[flagName];
				} else {
					//response = data[flagName];
					console.log('Failure: ' + JSON.stringify(data));
				}

			};
			var isMarketingSeenErrorCallback = function(data) {
				console.log('Something really bad happened');
			};
			exports.globalVariablePlugin.getGlobalFlags(isMarketingSeenSuccessCallback,
            					isMarketingSeenErrorCallback,flagName);*/
            exports.globalVariablePlugin.getGlobalFlags(function(data){
              console.log('Success: ' + data[flagName]);

                response=data[flagName];
            },function(error){
            console.log('Failure: ' + JSON.stringify(data));
            },flagName);
		} else {
		    console.log('not for mobile');
			//return true;
		}
        return response;
	}

	/**
	 * Reset application when device is blacklisted.
	 * True : App is reset and user needs to go through Setup MPIN
	 * False: Could not reset app. Some Fatal error
	 */
	module.exports.resetDevice = function() {
		if (exports.isPlugin && exports.globalVariablePlugin) {
			exports.globalVariablePlugin.resetDevice(isResetSuccessCallback,
					isResetErrorCallback);
			var isResetSuccessCallback = function(data) {
				if (data) {
					if (data['successFlag'] == true) {
						console.log('Device reset: Click on Check Marketing Flag to test');
					} else if (data['successFlag'] == false) {
						console.log('Could not reset device.');
					}
				} else {
					console.log('Failure: ' + JSON.stringify(data));
				}
			};
			var isResetErrorCallback = function(data) {
				console.log('Something really bad happened');
			};

		} else {
			//need to reset all the flags.
			console.log('Cant find Plugin');
			return true;
		}
	}
	
	/**
	 * Check whether device has fingerprint scanner or not.
	 * true = Fingeprint scanner is there and user has scanned atleast one finger
	 * false = Device doesnt have fingerprint scanner
	 * none = User hasn't enrolled any fingerprint for authentication
	 */
	module.exports.checkFingerprintCapability = function(){
		if(exports.isPlugin && exports.fingerPrintPlugin){
			exports.fingerPrintPlugin.checkFingerprintCapability(
					isFPAvailableSuccessCallback,
					isFPAvailableErrorCallback);
			var checkFingerprintCapability = false;
			var isFPAvailableSuccessCallback = function(data) {
				if(data) {
					if (data['scannerFlag']==true)
					{
						checkFingerprintCapability=  true; 
					}
					else if (data['scannerFlag']==false){
						checkFingerprintCapability= false;
						console.log('Device doesnt have fingerprint Capability');
					}
					else  if (data['scannerFlag']=='none'){
						checkFingerprintCapability= false;
						console.log('Device has fingerprint scanner but user has not scanned any fingerprint for authentication purpose');
					}
					else{
						checkFingerprintCapability= false;
						console.log('Something went wrong. We didnt look at this scenario')
					}
				} else {
					checkFingerprintCapability= false;
					console.log('Failure: '+ JSON.stringify(data));
				}
			};
			var isFPAvailableErrorCallback = function(data) {
				console.log('Something really bad happened');
			};
		}
		else{
			checkFingerprintCapability= false;
			console.log('Set to FALSE');
		}
		return checkFingerprintCapability;
	}
	
	/**
	 * SETUP FINGERPRINT and take user's permission for the same.
	 * successFlag = True: Fingerprint permission and key generation is successuful.
	 * successFlag = False: Fingerprint permision or key generation failed
	 * fpToken: gives 256 characteter long key that should be stored on the server
	 */
	module.exports.setupFingerprint = function(){
		if(exports.isPlugin && exports.fingerPrintPlugin){
			exports.fingerPrintPlugin.setupFingerPrint(
					isFPSetupSuccessCallback,
					isFPSetupErrorCallback
				);
			var jsonResponse = {};
			var fpToken = '';
			var isFPSetupSuccessCallback = function(data) {
				if(data) {
					if (data['successFlag']==true)
					{
						console.log('FP Token ID: '+data['fpToken']);
						fpToken = data['fpToken'];
						jsonResponse = {'SUCCESSFLAG' :true , 'FPTOKENID' : fpToken , 'ERRORMSG' : ''};
					}
					else if (data['successFlag']==false){
						jsonResponse = {'SUCCESSFLAG' :false , 'FPTOKENID' : '' , 'ERRORMSG' : 'Registration Error: '+data+'[errorDesc]'};
						console.log('Registration Error: '+data['errorDesc']);
					}
					else{
						jsonResponse = {'SUCCESSFLAG' :false , 'FPTOKENID' : '' , 'ERRORMSG' : 'Registration Error: '+data+'[errorDesc]'};
						console.log('Registration Error: '+data['errorDesc']);
					}
				} else {
					jsonResponse = {'SUCCESSFLAG' :false , 'FPTOKENID' : '' , 'ERRORMSG' : 'Registration Error: '+data+'[errorDesc]'};
					console.log('Failure: '+ JSON.stringify(data));
				}
			};
			var isFPSetupErrorCallback = function(data) {
				jsonResponse = {'SUCCESSFLAG' :false , 'FPTOKENID' : '' , 'ERRORMSG' : 'Something really bad happened'};
				console.log('Something really bad happened');
			};
			
		}
		else{
			jsonResponse = {'SUCCESSFLAG' :false , 'FPTOKENID' : '' , 'ERRORMSG' : 'Fatal error. Please try after sometime'};
			console.log('Fatal error. Please try after sometime');
		}
		return jsonResponse;
	}
	
	/**
	 * Check whether user has provided permission to read SMS or not
	 * successFlag = True: Permission is provided
	 * successFlag = False: Permission is not provided
	 */
	module.exports.checkSMSReadPermission = function(){
		if(exports.isPlugin && exports.smsPlugin){
			exports.smsPlugin.checkSMSReadPermission(
					isSMSReadSuccessCallback,
					isSMSReadErrorCallback
				);
			var checkSMSReadPermission = false;
			var isSMSReadSuccessCallback = function(data) {
				if(data) {
					if (data['successFlag']==true)
					{
						console.log('SMS Reading permission is provided');
						checkSMSReadPermission = true;
					}
					else if (data['successFlag']==false){
						console.log('SMS Reading permission is not provided');
						checkSMSReadPermission =  false;
					}
					else{
						console.log('Error: Scenario is not coded');
						checkSMSReadPermission = false;
					}
				} else {
					checkSMSReadPermission = false;
					console.log('Failure: '+ JSON.stringify(data));
				}
			};
			var isSMSReadErrorCallback = function(data) {
				console.log('Something really bad happened');
			};

		}
		else{
			checkSMSReadPermission =false;
			console.log('Cant find Plugin. This is Fatal error where App upgrade is needed');
		}
		return checkSMSReadPermission;
	}

});