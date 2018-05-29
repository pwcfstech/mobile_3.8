define(function (require, exports, module) {
    'use strict';

    exports.IdfcOTP = {
        // This function assumes that data is a JSON object.
        otpGenerate: function (postData, lpCoreUtils, lpWidget, lpPortal, ctrobj, otpGenerateService) {
			var retVar;
			console.log('Object - ' +postData);
            if(!postData.mobileNumber || postData.mobileNumber === '') {
               // ctrobj.addAlert('SAVED_SUCCESSFULLY', 'error', false);
                retVar = false;
            }
            else
			{
				var resendOTP = null;
				var generateOTPEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generateOTPService'),{	
					servicesPath: lpPortal.root
				});
				
				
				otpGenerateService
				.setup({
					generateOTPEndPoint:generateOTPEndPoint
				})
				.getOtpValue({
                        'postData': postData
                }).success(function (data) {
					ctrobj.errorSpin = false;
					ctrobj.success = {
						happened: true,
						msg: 'OTP has been successfully sent to your registered mobile number'
					};
					ctrobj.error = {
						happened: false,
						msg: ''
					};

					ctrobj.OTPFlag = false;
					ctrobj.lockFields = true;

				}).error(function(error, status, headers, config) {
					ctrobj.errorSpin = false;
					
					if(error.cd && error.cd === '501') {
							alert = {
								messages: {
									cd: error.rsn
								}
							};
							
							//ctrobj.addAlert('cd', 'error', false);
					}
					ctrobj.error = {
						happened: true,
						msg: error.rsn
					};
					ctrobj.success = {
						happened: false,
						msg: ''
					};
				});
			}
			return retVar;
        }

       
    };
});