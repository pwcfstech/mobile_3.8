/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {
    'use strict';
	 var idfcHanlder = require('idfcerror');
    /**
     * Main controller
     * @ngInject
     * @constructor
     */
	
    function otpGenerateController($scope, lpCoreUtils, lpWidget, lpPortal, otpGenerateService) {
		
		var otpGenerate = this;
		var customerMob;
		
		var generateOTPEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generateOTPService'),{	
			servicesPath: lpPortal.root
		});
		$scope.$on("update_otp_value", function(event, otpValue) {
			$scope.otpValue = otpValue;
			$scope.otpValue = "";
		});
		 $scope.$on('callGenerateOTP', function(e) {  
			var sendParam = 'send';
			$scope.generateOTP(sendParam);       
		});
		 $scope.$on('error_message', function(e, otpForm) {  
		 
			if (otpForm.submitted && otpForm.otp.$error.required) {
				
				$scope.otpRequiredError = true;
			} else {
				$scope.otpRequiredError = false;
			}

			if (otpForm.submitted && otpForm.otp.$error.minlength) {
				$scope.otpMinLengthError = true;
			} else {
				$scope.otpMinLengthError = false;
			}

			if (otpForm.submitted && otpForm.otp.$error.maxlength) {
				$scope.otpMaxLengthError = true;
			} else {
				$scope.otpMaxLengthError = false;
			}
			
		});
			//Method to generate OTP for the Limit change request
        $scope.generateOTP = function(value)
        {
			
            var resendOTP,postData;
			resendOTP = null;
            if (value === 'resend') {
				resendOTP = true;
            } else {
                resendOTP = false;
            }
            var postData = {
                'resendOTP': resendOTP
            };

            postData = $.param(postData || {});
			
			otpGenerateService
			.setup({
				generateOTPEndPoint:generateOTPEndPoint,
				postData: postData,
			})
			.getOtpValue()
			.success(
                    function(data) {
                       
						
						 customerMob = data.mobileNumber;
						 $scope.customerMobMasked = '******' + customerMob.substr(customerMob.length - 4);
                        $scope.success = {
                            happened: true,
                            msg: 'OTP has been successfully sent to your registered mobile number'

                        };

                        $scope.error = {
                            happened: false,
                            msg: ''
                        };
						$scope.OTPFlag = false;
                        $scope.buttonFlag = false;

                        $scope.lockFields = true;

						$scope.$emit('otpFlags', $scope.OTPFlag, $scope.buttonFlag, $scope.lockFields);
						
                    })
                .error(
                    function(error,
                        status,
                        headers,
                        config) {
						$scope.$emit('otpEvent', { OTPFlag: false});
                        if (error.cd) {
                            idfcHanlder.checkTimeout(error);
                            if ((error.cd === '501')) {
                                $scope.serviceError = idfcHanlder.checkGlobalError(error);
                               
                            } 
							
							
							$scope.$emit('alertMessage', 'cd', 'error', false);
							
                        }
                        $scope.error = {
                            happened: true,
                            msg: error.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    })
        }
			
			$scope.submitOTP = function(OTPform){
				
     			$scope.$emit('otpSubmit', OTPform, $scope.otpValue);
				
			}

	}
	

		

    /**
     * Export Controllers
     */
    exports.otpGenerateController = otpGenerateController;
});