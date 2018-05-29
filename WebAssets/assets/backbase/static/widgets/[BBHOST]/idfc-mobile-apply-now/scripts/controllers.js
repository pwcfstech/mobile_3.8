define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var angular = require('angular');
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');
    var OTP_SUCCESS_MESSAGE = "OTP has been successfully sent to your mobile number";
    //var sendOtpUrl="";

    function ApplyNowCtrl($scope, $timeout, $rootElement, lpWidget,
        lpCoreUtils, $http, httpService, lpCoreBus, lpPortal,$window) {
        /* gadgets.pubsub.subscribe(
             'launchpadlaunchpad-retail.goToForgotUsername');*/
        $scope.forms = {};
        $scope.selectedProductImage = '';
        $scope.selectedProductName = '';
        $scope.futureReferenceNumber = '';
        $scope.isComplience = true;
        $scope.refNum ='';
        $scope.uniqueId='';
        var initialize = function() {
            console.log("Initialize call");
            //dummy call
            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('otpGenerateService'));
            var data = $.param({
                mobile: '1234567890'/*,
                randomrefNum: '1'*/
            });

            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            }
            $http.post(generateOTPServiceURL, data, config)
                .success(function(data, status, headers, config) {
                    console.log("Dummy first Call.@" + JSON.stringify(data));

                })
                .error(function(data, status, header, config) {

                });
            $scope.userFormData = {};
            $scope.otpDetails = {};
            $scope.resendOtpBtn = true;
            $scope.disableOTP = false;
            $scope.referenceNumber = '';
            //$scope.salutation = 'MR';
            $scope.formSubmitStatus = '';
            $scope.cancelTransaction = false;
            // $scope.ApplyNowForm=false;
            $scope.cityArray = [{
                id: 380001,
                cityName: 'Ahmedabad'
            }, {
                id: 560078,
                cityName: 'Banglore'
            }, {
                id: 600001,
                cityName: 'Chennai'
            }, {
                id: 110005,
                cityName: 'Delhi'
            }, {
                id: 400051,
                cityName: 'Mumbai'
            }];

            $scope.cityPlArray =
            [{
               id: 380001,
                                        cityName: 'Ahmedabad'
                                    }, {
                                        id: 560078,
                                        cityName: 'Banglore'
                                    }, {
                                        id: 600001,
                                        cityName: 'Chennai'
                                    }, {
                                        id: 110005,
                                        cityName: 'Delhi'
                                    }, {
                                        id: 400051,
                                        cityName: 'Mumbai'
                                    }, {
                                        id: 411001,
                                        cityName: 'Pune'
                          }];
        };

        initialize();
        //for opening the selected account form
        $scope.openApplyNowForm = function(accountImage, accountNameText) {
            $scope.forms.ApplyNowForm.submitted = false;
            localStorage.setItem("navigationFlag", true);
            $scope.resetApplyNowForm();
            $scope.selectedProductImage = accountImage;
            $scope.selectedProductName = accountNameText;
            $scope.applyNowHomePageHide = true;
            $scope.applyNowSelectedAccountPageShow = true;
            $scope.sendOtpBtn = true;
            $scope.userFormData.salutation = "MR";
            $scope.userFormData.complience = true;
            $scope.userFormData.jobType = "salaried";
            $scope.forms.OTPform.submitted = false;
            //$scope.ApplyNowForm.submitted=false;
        };

        $scope.navigateToSavingAccount = function ()
        {
        // var savingAccountUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('savingAccountURL'));
         var savingAccountUrl="https://secured.idfcbank.com/lc/locationsSA.html?utm_source=MobileApp&utm_medium=Mobile&utm_campaign=MobApp_Xsell&utm_adgroup=n&utm_content=SA_n_top_5&utm_creative=n&utm_size=SA&utm_cid=12346227&utm_term=n&campaignId=12346227&lds=SA";
         $window.location.href = savingAccountUrl;
        };
        //reset form data
        $scope.resetApplyNowForm = function() {
            $scope.userFormData = {};
            $scope.userFormData.firstname = '';
            $scope.userFormData.lastname = '';
            $scope.userFormData.mobileNum = '';
            $scope.userFormData.email = '';
            $scope.forms.ApplyNowForm.submitted = false;
            $scope.forms.OTPform.submitted = false;

        };

        // handling for  otp changes minor release 2.0
        var count = 0;
        $scope.resendfunction = function() {
            if (count == 3) {

                $scope.stop = true;
                ++count;
            } else {
                ++count;
                return count;
                $scope.stop = false;
            }

        }

        var count1 = 0;
        $scope.submitfunction = function() {

            if (count1 == 3) {
                //alert("count1"+count1);
                $scope.lockFieldsOTP = true;
                $scope.stop = true;

            } else {
                $scope.lockFieldsOTP = false;
            }

        }
        //close handling for  otp changes minor release 2.0

        $scope.generateOTP = function() {
            $scope.errorSpin = true;
           var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('otpGenerateService'));
            //var generateOTPServiceURL = 'http://adobuatweb.idfcbank.com/bin/sendotpservlet.html';

            var data = $.param({
                mobile: $scope.userFormData.mobileNum/*,
                randomrefNum: $scope.referenceNumber*/
            });

            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            }
            $http.post(generateOTPServiceURL, data, config)
                .success(function(data, status, headers, config) {
                    $scope.errorSpin = false;
                    if(data!=null)
                    {
                      $scope.refNum =  data.generatePwdResponse.msgBdy.refNum;
                      $scope.uniqueId = data.uniqueID;
                      console.log("$scope.refNum generateOTP@" +$scope.refNum);
                     console.log("$scope.uniqueId generateOTP@" +$scope.uniqueId);
                    }
                    if (count < 4) {
                        $scope.success = {
                            happened: true,
                            msg: OTP_SUCCESS_MESSAGE
                        };
                        $scope.error = {
                            happened: false,
                            msg: ''
                        };
                    }


                    if (count == 4) {
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };

                        $scope.error = {
                            happened: true,
                            msg: 'We have tried 5 times to send you a code.'
                        };
                    }

                })
                .error(function(data, status, header, config) {
                    $scope.errorSpin = false;
                    console.log("Failure");


                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                });
        }
        //send otp
        $scope.sendOTP = function(isValid, form) {

            var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('otpGenerateService'));
          // var generateOTPServiceURL = 'http://adobuatweb.idfcbank.com/bin/sendotpservlet.html';
            if (!isValid) {

                //  form.submitted=false;
                return false;
            } else if (!$scope.isComplience) {
                return false;
            } else {
                console.log("Value @" + $scope.radioModel);
                $scope.forms.ApplyNowForm.submitted = false;
                // $scope.ApplyNowForm.submitted=true;
                //console.log("Selectected Salutations@"+$scope.btnMR);
                $scope.cancelTransaction = true;
                // $scope.ApplyNowForm.$setSubmitted();
                var randomRefNumber;
                /*var counter = localStorage.getItem("counter");
                if (counter === null) {
                    randomRefNumber = '1';
                } else {
                    randomRefNumber = counter;
                }*/ //commented for 3.1
                randomRefNumber= Math.random(); //3.1 change
                $scope.referenceNumber = randomRefNumber;
                console.log("Random Reference value:" + randomRefNumber);
                console.log("Mobile Number:" + $scope.userFormData.mobileNum);
                $scope.errorSpin = true;
                var data = $.param({
                    mobile: $scope.userFormData.mobileNum/*,
                    randomrefNum: randomRefNumber*/
                });

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                }
                $http.post(generateOTPServiceURL, data, config)
                    .success(function(data, status, headers, config) {
                        $scope.errorSpin = false;


                        var successResponse = data;
                        if (successResponse == "") {
                            console.log("Success Data came empty");
                            $scope.resendOtpBtn = false;
                            $scope.sendOtpBtn = false;
                            $scope.sendOtpError = true;
                        } else if (data.generatePwdResponse.msgHdr.rslt == 'ERROR') {
                            $scope.success = {
                                happened: false,
                                msg: ''
                            };
                            $scope.error = {
                                happened: true,
                                msg: data.generatePwdResponse.msgHdr.error.rsn
                            };
                            /*rslt*/
                        } else {
                            $scope.refNum =  data.generatePwdResponse.msgBdy.refNum;
                            $scope.uniqueId = data.uniqueID;
                            console.log("$scope.refNum sendOTP@" +$scope.refNum);
                            console.log("$scope.uniqueId sendOTP@" +$scope.uniqueId);

                            $scope.sendOtpError = false;
                            //open otp form
                            $scope.resendOtpBtn = true;
                            $scope.sendOtpBtn = false;
                            $scope.showOTPForm = true;
                            console.log("Success" + JSON.stringify(successResponse));
                            //var newCounterValue = ++randomRefNumber;
                            //console.log("New Number" + newCounterValue);
                            //localStorage.setItem("counter", newCounterValue);
                            $scope.success = {
                                happened: true,
                                msg: OTP_SUCCESS_MESSAGE
                            };
                            $scope.error = {
                                happened: false,
                                msg: ''
                            };

                        }



                    })
                    .error(function(data, status, header, config) {
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
            }
        };



        //submit otp to backend
        $scope.submitOTP = function(isValid) {
            var verifyOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('verifyOtpService'));
            //var verifyOTPServiceURL = 'http://adobuatweb.idfcbank.com/bin/verifyotpservlet.html';


            if (!isValid) {
                return false;
            } else {

                $scope.errorSpin = true;
                count1++;
                /*  var data = $.param({
                      otp: $scope.userFormData.OtpValue,
                      randomrefNum: $scope.referenceNumber
                  });*/

                var lobValue;
                var productCategory;
                var productCategoryId;
                var segmentCode;
                var prdCdId;
                var dmn;
                var salKey;
                var custCategory;
                if ($scope.selectedProductName == 'Savings Account' || $scope.selectedProductName == 'Fixed Deposit') {
                    productCategory = "Liability";
                    lobValue = "personal-banking";
                    segmentCode = "3";
                    productCategoryId = "73";
                    dmn = "104400";
                } else if ($scope.selectedProductName == 'Home Loan' || $scope.selectedProductName == 'Personal Loan') {
                    productCategory = "Assets";
                    lobValue = "personal-banking";
                    segmentCode = "3";
                    productCategoryId = "72";
                    dmn = "104411";
                } else if ($scope.selectedProductName == 'Current Account') {
                    productCategory = "Business Banking";
                    lobValue = "business-banking";
                    segmentCode = "2";
                    productCategoryId = "209";
                    dmn = "104408";
                }

                if ($scope.selectedProductName == 'Savings Account') {
                    prdCdId = 29;
                } else if ($scope.selectedProductName == 'Fixed Deposit') {
                    prdCdId = 75;
                } else if ($scope.selectedProductName == 'Home Loan') {
                    prdCdId = 32;
                } else if ($scope.selectedProductName == 'Personal Loan') {
                    prdCdId = 33;
                } else if ($scope.selectedProductName == 'Current Account') {
                    prdCdId = 210;
                }

                if ($scope.userFormData.jobType == 'salaried') {
                    custCategory = 2;
                } else if ($scope.userFormData.jobType == 'self employed') {
                    custCategory = 1;
                }

                if ($scope.userFormData.salutation == 'MR') {
                    salKey = 1;
                } else if ($scope.userFormData.salutation == 'MRS') {
                    salKey = 2;
                } else if ($scope.userFormData.salutation == 'MS') {
                    salKey = 3;
                } else if ($scope.userFormData.salutation == 'DR') {
                    salKey = 5;
                }
                console.log("City Data:" + $scope.userFormData.city);
                var mobileNum = $scope.userFormData.mobileNum;
                var data = $.param({
                    otp: $scope.userFormData.OtpValue,
                   /* randomrefNum: $scope.referenceNumber,*/
                    prdCdId: prdCdId,
                    lob: lobValue,
                    frstNm: $scope.userFormData.firstname,
                    lstNm: $scope.userFormData.lastname,
                    salttnname: $scope.userFormData.salutation,
                    salttnkey: salKey,
                    pincode: $scope.userFormData.city.id,
                    mobile: mobileNum,
                    email: $scope.userFormData.email,
                    dmn: dmn,
                    productCategory: productCategory,
                    productName: $scope.selectedProductName,
                    productCategoryId: productCategoryId,
                    segmentCode: segmentCode,
                    occupation: $scope.userFormData.jobType,
                    csalPrdCode: '',
                    cmpgnNm: "",
                    campaignId: 12346227,
                    appointmentDate: '',
                    toaFlag: '',
                    customerCategory: custCategory,
                    city: $scope.userFormData.city.cityName,
                    randomrefNum:$scope.refNum,
                    uniqueID: $scope.uniqueId,
                    pageFlag: '/bin/applynowservlet'
                });

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                }
                $http.post(verifyOTPServiceURL, data, config)
                    .success(function(data, status, headers, config) {
                        $scope.errorSpin = false;
                        console.log("Success of Verified OTP" + JSON.stringify(data));

                        if ((data != null) && (data !== 'undefined')) {
                            if (data.hasOwnProperty('CreateAEMLeadResponse')) {
                                if (data.CreateAEMLeadResponse.msgHdr.rslt == 'OK') {
                                    $scope.cancelTransaction = false;
                                    console.log("Success of Form Data " + JSON.stringify(data));
                                    $scope.applyNowSelectedAccountPageShow = false;
                                    $scope.showOTPForm = false;
                                    $scope.applyNowSuccessForm = true;
                                    $scope.successFormMessage = true;
                                    $scope.failureFormMessage = false;
                                    $scope.futureReferenceNumber = data.CreateAEMLeadResponse.msgBdy.ldId;
                                } else {
                                    console.log("Failure of lead response" + data.CreateAEMLeadResponse.msgHdr.error.rsn);
                                    var errorRes = data.CreateAEMLeadResponse.msgHdr.error.rsn;
                                    $scope.applyNowSelectedAccountPageShow = false;
                                    $scope.showOTPForm = false;
                                    $scope.applyNowSuccessForm = true;
                                    $scope.successFormMessage = false;
                                    $scope.failureFormMessage = true;
                                    $scope.errorText = errorRes;
                                }
                            } else if (data.hasOwnProperty('verifyPwdResponse')) {
                                if (data.verifyPwdResponse.msgBdy.sts == 'ERROR') {
                                    $scope.success.happened = false;
                                    if (data.verifyPwdResponse.msgHdr.error.rsn == 'Bad password value.') {
                                        $scope.error = {
                                            happened: true,
                                            msg: 'That\'s the wrong code! Please try again.'
                                            // msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                                        };
                                    } else {
                                        var errorMess = data.verifyPwdResponse.msgHdr.error.rsn;
                                        $scope.error = {
                                            happened: true,
                                            msg: errorMess
                                            // msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                                        };
                                    }
                                    /* if (count1 == 3) {
                                         console.log("Count1==3 in failure of submit data");
                                         $scope.error = {
                                             happened: true,
                                               msg: 'That\'s the wrong code! Please try again.'
                                            // msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                                         };
                                     } else {
                                         $scope.error = {
                                             happened: true,
                                             msg: 'That\'s the wrong code! Please try again.'
                                         };
                                     }*/
                                }
                            }


                        }
                        //wrong otp entered handling
                        /* if (data.verifyPwdResponse.msgBdy.sts == 'ERROR') {
                             $scope.success.happened = false
                             if (count1 == 3) {
                                 console.log("Count1==3 in failure of submit data");
                                 $scope.error = {
                                     happened: true,
                                     msg: '3 strikes and you are out! You entered the wrong code thrice. Start the process again please.'
                                 };
                             } else {
                                 $scope.error = {
                                     happened: true,
                                     msg: 'That\'s the wrong code! Please try again.'
                                 };
                             }
                         } else {
                             localStorage.setItem("navigationFlag", true);


                                $scope.errorSpin = false;
                                                 $scope.cancelTransaction = false;
                                                 console.log("Success of Form Data " + JSON.stringify(data));
                                                 $scope.applyNowSelectedAccountPageShow = false;
                                                 $scope.showOTPForm = false;
                                                 $scope.applyNowSuccessForm = true;
                                                 if((data!== null) && (data!== 'undefined'))
                                                 {
                                                 if (data.CreateAEMLeadResponse.msgHdr.rslt == 'OK')
                                                  {
                                                     $scope.successFormMessage = true;
                                                     $scope.failureFormMessage = false;
                                                     $scope.futureReferenceNumber = data.CreateAEMLeadResponse.msgBdy.ldId;
                                                  }
                                                 else
                                                  {
                                                     var errorRes = data.CreateAEMLeadResponse.msgHdr.error.rsn;
                                                     $scope.successFormMessage = false;
                                                     $scope.failureFormMessage = true;
                                                     $scope.errorText = errorRes;
                                                  }
                                                 }
                                                 else
                                                 {
                                                    $scope.successFormMessage = false;
                                                    $scope.failureFormMessage = true;
                                                    $scope.errorText = "We were unable to save your information correctly as the system is currently unavailable. We regret the inconvenience. Request you to please try again later.";
                                                 }
                             //$scope.applyNowSubmitForm();
                             // $scope.applyNowSuccessForm = true;
                         }*/

                    })
                    .error(function(data, status, header, config) {
                        $scope.errorSpin = false;
                        $scope.success.happened = false
                        $scope.error = {
                            happened: true,
                            msg: 'There is an issue with connecting server, please try after some time.'
                        };
                        console.log("Failure of Verified OTP" + JSON.stringify(data))

                    });
            }


        }


        //submitting all the form data to server
        $scope.applyNowSubmitForm = function() {

            //$scope.errorSpin = true;
            //var data = setPostData();
            /* var lobValue;
             var productCategory;
             var productCategoryId;
             var segmentCode;
             var prdCdId;
             var dmn;
             var salKey;
             if ($scope.selectedProductName == 'Savings Account' || $scope.selectedProductName == 'Fixed Deposit') {
                 productCategory = "Liability";
                 lobValue = "personal-banking";
                 segmentCode = "3";
                 productCategoryId = "73";
                 dmn = "104400";
             } else if ($scope.selectedProductName == 'Home Loan' || $scope.selectedProductName == 'Personal Loan') {
                 productCategory = "Assets";
                 lobValue = "personal-banking";
                 segmentCode = "3";
                 productCategoryId = "72";
                 dmn = "104411";
             } else if ($scope.selectedProductName == 'Current Account') {
                 productCategory = "Business Banking";
                 lobValue = "business-banking";
                 segmentCode = "2";
                 productCategoryId = "209";
                 dmn = "104408";
             }

             if ($scope.selectedProductName == 'Savings Account') {
                 prdCdId = 29;
             } else if ($scope.selectedProductName == 'Fixed Deposit') {
                 prdCdId = 75;
             } else if ($scope.selectedProductName == 'Home Loan') {
                 prdCdId = 32;
             } else if ($scope.selectedProductName == 'Personal Loan') {
                 prdCdId = 33;
             } else if ($scope.selectedProductName == 'Current Account') {
                 prdCdId = 210;
             }


             if ($scope.userFormData.salutation == 'MR') {
                 salKey = 1;
             } else if ($scope.userFormData.salutation == 'MRS') {
                 salKey = 2;
             } else if ($scope.userFormData.salutation == 'MS') {
                 salKey = 3;
             } else if ($scope.userFormData.salutation == 'DR') {
                 salKey = 5;
             }
             console.log("City Data:"+$scope.userFormData.city);
             var mobileNum=$scope.userFormData.mobileNum;
             var data = $.param({
                 prdCdId: prdCdId,
                 lob: lobValue,
                 frstNm: $scope.userFormData.firstname,
                 lstNm: $scope.userFormData.lastname,
                 salttnname: $scope.userFormData.salutation,
                 salttnkey: salKey,
                 pincode: $scope.userFormData.city.id,
                 mobile: mobileNum,
                 email: $scope.userFormData.email,
                 dmn: dmn,
                 productCategory: productCategory,
                 productName: $scope.selectedProductName,
                 productCategoryId: productCategoryId,
                 segmentCode: segmentCode,
                 occupation: $scope.userFormData.jobType,
                 csalPrdCode:'',
                 cmpgnNm:"",
                 campaignId: 12346227,
                 appointmentDate:'',
                 toaFlag:'',
                 customerCategory:'',
                 city:$scope.userFormData.city.cityName
             });*/



            /*var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            }*/
            var submitServiceUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('submitService'));
            // var submitServiceUrl = 'http://adobuatweb.idfcbank.com/bin/applynowservlet.html';
            $http.post(submitServiceUrl, data, config)
                .success(function(data, status, headers, config) {
                    $scope.errorSpin = false;
                    $scope.cancelTransaction = false;
                    console.log("Success of Form Data " + JSON.stringify(data));
                    $scope.applyNowSelectedAccountPageShow = false;
                    $scope.showOTPForm = false;
                    $scope.applyNowSuccessForm = true;
                    if ((data !== null) && (data !== 'undefined')) {
                        if (data.CreateAEMLeadResponse.msgHdr.rslt == 'OK') {
                            $scope.successFormMessage = true;
                            $scope.failureFormMessage = false;
                            $scope.futureReferenceNumber = data.CreateAEMLeadResponse.msgBdy.ldId;
                        } else {
                            var errorRes = data.CreateAEMLeadResponse.msgHdr.error.rsn;
                            $scope.successFormMessage = false;
                            $scope.failureFormMessage = true;
                            $scope.errorText = errorRes;
                        }
                    } else {
                        $scope.successFormMessage = false;
                        $scope.failureFormMessage = true;
                        $scope.errorText = "We were unable to save your information correctly as the system is currently unavailable. We regret the inconvenience. Request you to please try again later.";
                    }

                })
                .error(function(data, status, header, config) {
                    $scope.errorSpin = false;
                    console.log("Failure of Form Data" + JSON.stringify(data))
                    $scope.applyNowSelectedAccountPageShow = false;
                    $scope.showOTPForm = false;
                    $scope.applyNowSuccessForm = true;
                    $scope.successFormMessage = false;
                    $scope.errorText = "We were unable to save your information correctly as the system is currently unavailable. We regret the inconvenience. Request you to please try again later.";
                    $scope.failureFormMessage = true;
                    $scope.cancelTransaction = false;
                });
        };

        //succ
        $scope.okSuccess = function() {
            $scope.cancelTransaction = false;
            $scope.applyNowSuccessForm = false;
            $scope.applyNowHomePageHide = false;
        }




        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if (localStorage.getItem("navigationFlag")) {
                $scope.goBackToHomePage();
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
                localStorage.clear();
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }


        });

        $scope.goBackToHomePage = function() {
            $scope.applyNowSelectedAccountPageShow = false;
            $scope.applyNowHomePageHide = false;
            $scope.applyNowSuccessForm = false;
            $scope.resendOtpBtn = true;
            $scope.sendOtpBtn = true;
            $scope.sendOtpError = false;
            $scope.cancelTransaction = false;
            $scope.showOTPForm = false;
            $scope.checkboxUnSelectedError = false;
            $scope.$apply();
        };

        //succ
        $scope.closeOpenForm = function() {
            $scope.resetApplyNowForm();
            $scope.applyNowSelectedAccountPageShow = false;
            $scope.applyNowHomePageHide = false;
            $scope.applyNowSuccessForm = false;
            $scope.showOTPForm = false;
            $scope.cancelTransaction = false;
            $scope.checkboxUnSelectedError = false;

            // $scope.$apply();

        }
        $scope.complienceCheckBoxStateChanged = function(isChecked) {
            console.log("Disable Otp value:" + $scope.disableOTP);

            if (isChecked) {

                $scope.checkboxUnSelectedError = false;
                $scope.disableOTP = true;
                $scope.isComplience = $scope.disableOTP;
            } else {
                $scope.checkboxUnSelectedError = true;
                $scope.disableOTP = false;
                $scope.isComplience = $scope.disableOTP;
            }
        }
           $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }
    exports.ApplyNowCtrl = ApplyNowCtrl;
});
