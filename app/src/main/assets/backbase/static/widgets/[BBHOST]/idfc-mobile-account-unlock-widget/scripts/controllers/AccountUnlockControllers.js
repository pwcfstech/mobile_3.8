define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var enciphering = require('./../support/production/angular-rsa-encrypt'); // 3.1 change
    var readKey = require('./../support/rsaKeySetup/rsaKeySetup'); // 3.1 change
    var idfcConstants = require('idfccommon').idfcConstants;

    function NewUserCtrl(lpCoreUtils, $scope, lpWidget, lpCoreBus, $timeout, lpPortal, AccountUnlockService, $http) {

        $scope.user = JSON.parse(localStorage.getItem("navigationData"));
        $scope.username = $scope.user.uname;
        var newUsrCtrl = this;
        $scope.loginerror = true;
        var forgotPwdService = AccountUnlockService;
        var ALERT_TIMEOUT = 9000;
        var invalidUsernameCount = 0;
        var disableSubmit = false;

        var customerFirstName = '';
        var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partial';

        function addAlert(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: newUsrCtrl.alert.messages[code]
            };
            newUsrCtrl.alerts.push(customAlert);
            if (timeout !== false) {
                $timeout(function() {
                    newUsrCtrl.closeAlert(newUsrCtrl.alerts.indexOf(customAlert));
                }, ALERT_TIMEOUT);
            }
        }

        function applyScope() {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

        function validatePassword(username, password1, password2) {
            var pwdError = false;
            if (password1 !== password2) {
                pwdError = 'unmatch';
            }
            if (password1.toLowerCase() === username.toLowerCase()) {
                pwdError = 'containsLoginId';
            } else {
                newUsrCtrl.errors['containsLoginId'] = false;
            }
            return pwdError;
        }


        function validateOldPassword(username, oldPassword) {
            var pwdOldError = false;
            if (oldPassword.toLowerCase() === username.toLowerCase()) {
                pwdOldError = 'containsLoginId1';
            } else {
                newUsrCtrl.errors['containsLoginId1'] = false;
            }
            return pwdOldError;
        }

        function validateConfirmPass() {
            newUsrCtrl.errorsConfirmPass = {};

            var checkPassword = validatePassword($scope.username, newUsrCtrl.control.password.value, newUsrCtrl.control.confirmPassword.value);


            if (checkPassword === 'unmatch') {
                newUsrCtrl.errorsConfirmPass['confirmPass'] = true;
            } else if (checkPassword === 'containsLoginId') {
                newUsrCtrl.errors['containsLoginId'] = true;
            } else {
                newUsrCtrl.errorsConfirmPass['confirmPass'] = false;
                newUsrCtrl.errors['containsLoginId'] = false;

                return true;
            }
        }

        function submitForm() {
            //3.1 change password encryption
            var pubKey, exp, mod;
            pubKey = readKey.getValues("publicKeyValue");
            exp = readKey.getValues("exp");
            mod = readKey.getValues("mod");
            enciphering.setEncodeKey(pubKey, mod, exp);
            var forgotPasswordEndPoint = lpWidget.getPreference('ForgetPassword');
            var registerUserServiceURL = lpCoreUtils.resolvePortalPlaceholders(forgotPasswordEndPoint, {
                servicesPath: lpPortal.root
            });
            var postData = {
                'username': $scope.username,
                'confirmNewPassword': enciphering.setEncrpt(newUsrCtrl.control.confirmPassword.value), //3.1 change
                'newPassword': enciphering.setEncrpt(newUsrCtrl.control.password.value), //3.1 change
                'oldPassword': enciphering.setEncrpt(newUsrCtrl.control.passwordOld.value), //3.1 change
                'transaction': 'accountUnlock',
                'firstName': customerFirstName,
                'requiredECheck': 'required' //3.1 change
            };

            postData = $.param(postData || {});
            var xhr = forgotPwdService.registerUserService(registerUserServiceURL, postData);
            return xhr;
        }
        newUsrCtrl.reset = function() {
            newUsrCtrl.hideOTPFlag = true;
            newUsrCtrl.success = {};
            newUsrCtrl.error = {};
            newUsrCtrl.btnFlag = true;
            newUsrCtrl.ShowAccountUnlockForm = false;
            newUsrCtrl.showDebitForm = false;
            newUsrCtrl.forms.AccountUnlockForm.submitted = false;
            newUsrCtrl.UsenameForm.submitted = false;
            newUsrCtrl.otpValue = '';
            newUsrCtrl.OTPform.submitted = false;

            if (newUsrCtrl.showQuestionDiv) {
                newUsrCtrl.Questionform.submitted = false;
            }
            newUsrCtrl.resetShowAccountUnlockForm();
            applyScope();
        };
        newUsrCtrl.evalExpTwo = function(varX, varY) {
            var flag = false;
            if (varX && varY) {
                flag = true;
            }
            return flag;
        };
        newUsrCtrl.evalExpThree = function(varA, varB, varC) {
            var flagShow = false;
            if ((varA && varB) && varC) {
                flagShow = true;
            }
            return flagShow;
        };
        /**
         *  resetShowAccountUnlockForm method
         * @desc clears Password form fields
         */
        newUsrCtrl.resetShowAccountUnlockForm = function() {
            newUsrCtrl.control.confirmPassword.value = '';
            newUsrCtrl.control.password.value = '';
            newUsrCtrl.control.passwordOld.value = '';
            newUsrCtrl.showAlerts = false;
        };
        /**
         * changePassword method
         * @desc confirms if form is valid and change the Password
         */
        newUsrCtrl.changePassword = function(isFormValid) {

            newUsrCtrl.alerts = [];
            if (!validateConfirmPass() || !isFormValid) {
                return false;
            } else {

                newUsrCtrl.control.password.value = newUsrCtrl.control.password.value;
                newUsrCtrl.control.confirmPassword.value = newUsrCtrl.control.confirmPassword.value;
                newUsrCtrl.control.passwordOld.value = newUsrCtrl.control.passwordOld.value;
                $scope.loginerror = false;
                newUsrCtrl.errorSpin = true;
                var xhr;
                xhr = submitForm();

                xhr.success(function(data, status5, headers5, config5) {

                    newUsrCtrl.success = {
                        happened: true,
                        msg: data.successMsg
                    };
                    newUsrCtrl.errorSpin = false;
                    gadgets.pubsub.publish("passwordResetSuccess");
                    localStorage.clear();
                    // newUsrCtrl.resetShowAccountUnlockForm(); //3.1 change
                    var xsrfToken = headers5('XSRF-TOKEN');
                    console.log("setXsrfTokenWithResponse error xsrfToken : "+xsrfToken);
                    if(typeof xsrfToken != 'undefined')
                    {
                        window.sessionStorage.setItem('xsrfToken', xsrfToken);
                    }

                });
                xhr.error(function(error, response) {
                    if (response == "") {
                        gadgets.pubsub.publish("no.internet");
                    } else {
                        newUsrCtrl.errorSpin = false;
                        newUsrCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                        newUsrCtrl.control.confirmPassword.value = '';
                        newUsrCtrl.control.password.value = '';
                        newUsrCtrl.control.passwordOld.value = '';
                        newUsrCtrl.showAlerts = true;
                        newUsrCtrl.forms.AccountUnlockForm.submitted = false;
                    }

                });
            }
        };
        newUsrCtrl.closeAlert = function(index) {
            newUsrCtrl.alerts.splice(index, 1);
        };
        newUsrCtrl.templates = {
            accountUnlock: partialsDir + '/AccountUnlock.html',
        };

        newUsrCtrl.lockFields = false;
        newUsrCtrl.btnFlag = true;

        newUsrCtrl.errors = {};
        newUsrCtrl.errorSpin = false;
        newUsrCtrl.passwordPolicy = '/^(?=.*\\d)(?=.*[a-zA-Z])[^ ]{6,15}$/';
        newUsrCtrl.ShowAccountUnlockForm = false;
        newUsrCtrl.UsenameForm = {};
        newUsrCtrl.forms = {};
        newUsrCtrl.forms.AccountUnlockForm = {};
        newUsrCtrl.OTPform = {};
        newUsrCtrl.alerts = [];
        newUsrCtrl.OTPError = false;
        newUsrCtrl.alert = {
            messages: {
                SAVED_SUCCESSFULLY: 'Contact was saved successfully.',
                SAVED_ERROR: 'There was an error while saving contact.',
                SERVICE_UNAVAILABLE: 'Unfortunately, this service is unavailable.'
            }
        };
        newUsrCtrl.control = {
            loginId: {
                value: '',
                disable: false,
                errors: [],
                loading: false
            },
            cnfrmloginId: {
                value: '',
                disable: false,
                errors: [],
                loading: false
            },
            password: {
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
            passwordOld: {
                value: '',
                errors: [],
                disable: false,
                loading: false
            },
            securityQuestion: {
                value: '',
                options: [{
                        'value': 'value1',
                        'text': 'What is your nickname?'
                    },
                    {
                        'value': 'value2',
                        'text': 'What is your hometown?'
                    }
                ],
                loading: false
            },
            securityAnswer: {
                value: '',
                errors: [],
                loading: false
            },
            locale: {
                value: '',
                options: [{
                        'value': 'en',
                        'text': 'English'
                    },
                    {
                        'value': 'fr',
                        'text': 'French'
                    },
                    {
                        'value': 'nl',
                        'text': 'Dutch'
                    },
                    {
                        'value': 'it',
                        'text': 'Italian'
                    }
                ],
                loading: false
            },
            otp: {
                value: '',
                errors: [],
                loading: false
            },
            marketingContent: {
                value: ''
            },
            customerType: {
                value: ''
            },
            username: {
                value: '',
                errors: [],
                loading: false
            }
        };

        $scope.getLoginPromise = function(userId, password) { //password encryption added for jspring after password expiry

            var data = {
                j_username: userId,
                j_password: password,
                portal_name: "idfc_mobile", //lpPortal.name
                page_name: lpPortal.page.name,
                auth_token: 'required', // password change
                requiredECheck: 'required', // password change
            };
            var loginUrl = lpPortal.root + '/j_spring_security_check' + '?rd=' + new Date().getTime();
            return $http.post(loginUrl, lpCoreUtils.buildQueryString(data), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
        };

        $scope.handleSuccessfulLogin = function(response) {
            $scope.errorSpin = true;
            var sessionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('handleLogin')) + '?rd=' + new Date().getTime();
            var customerRequest = $http({
                method: 'GET',
                url: sessionUrl,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            customerRequest.success(function(response) {
                    $scope.errorSpin = false;
                    gadgets.pubsub.publish('cxp.load.model', response);
                })
                .error(function(response) {
                    $scope.errorSpin = false;
                    if (response == "") {
                        gadgets.pubsub.publish("no.internet");
                    } else {
                        gadgets.pubsub.publish("session.not.created");
                        gadgets.pubsub.publish('cxp.load.model', response);
                    }
                });
        };

        gadgets.pubsub.subscribe('loginPostPasswordReset', function() {
             var pubKey, exp, mod;
             pubKey = readKey.getValues("publicKeyValue");
             exp = readKey.getValues("exp");
             mod = readKey.getValues("mod");
             enciphering.setEncodeKey(pubKey, mod, exp);
              /* xsrf token change*/
                         var tocanqey = sessionStorage.getItem("xsrfToken");
                         var result = "";
                         tocanqey = tocanqey || "";
                         for (var i=0; i<tocanqey.length; i++) {
                         		  result = tocanqey.charAt(i) + result;
                         }
                         newUsrCtrl.control.password.value = newUsrCtrl.control.password.value + result;
              /*change end*/
            var promise = $scope.getLoginPromise($scope.username, enciphering.setEncrpt(newUsrCtrl.control.password.value)).success(function(response) { //encrypted password
                $scope.res = response;
                console.log("RESPONSE IS : " + response);
                $scope.handleSuccessfulLogin(response);
                return promise;
            })
            //            .error(function (response){});
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });
          $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }
    exports.NewUserCtrl = NewUserCtrl;
});