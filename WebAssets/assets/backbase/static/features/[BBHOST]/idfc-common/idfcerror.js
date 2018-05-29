define(function(require, exports, module) {
	'use strict';

	module.exports.checkTimeout = function(response) {
		if (response.cd === '901') {
			window.location.replace(window.location);
		}
	};
	module.exports.checkGlobalError = function(response) {
		if (response.cd === '501') {
			return true;
		} else {
			return false;
		}
	};
	module.exports.checkOTPError = function(response) {
		if (response.cd === '08') {
			return true;
		} else {
			return false;
		}
	};

			//=========================Session Management Block=====================================
			module.exports.validateSession = function(val) {
                               		gadgets.pubsub.subscribe("session.call.native", function(evt) {
									//2.0 Migration - PwCokay
                                   var sessionUrl = "https://my.idfcbank.com/rs/SessionValidateService";
                                  // var sessionUrl = "http://10.5.4.13:7003/rs/SessionValidateService";
                                  //  var sessionUrl = "http://10.5.8.135:7113/rs/SessionValidateService";
                                  //  var sessionUrl = "http://192.168.37.32:7003/rs/SessionValidateService";

                                                       var sessionRequest = val({
                                                                method: 'GET',
                                                                url: sessionUrl,

                                                                headers: {
                                                                           'Accept': 'application/json',
                                                                           'Content-Type': 'application/x-www-form-urlencoded;'
                                                                }
                                                       });
                                                       sessionRequest.success(function(response) {
                                                       console.log("session Success");
                                                       })
                                                       .error(function(response, status) {
                                                        	console.log("session Error");
                                                  			if(status == 401 || status == 901){
																gadgets.pubsub.publish ('session.call.invalid',response);
                                                  			}
                                                       });

                               		});
			//======================================================================================
			};
});
