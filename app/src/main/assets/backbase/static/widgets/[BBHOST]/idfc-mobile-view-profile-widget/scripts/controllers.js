define(function(require, exports) {

    'use strict';
    var $ = require('jquery');
    var angular = require('angular');
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');

    function ProfileContactCtrl(lpPortal, lpWidget, lpCoreUtils, $scope, $http, httpService, lpCoreBus, $timeout, $q, viewProfileDetails) {
        this.utils = lpCoreUtils;
        this.widget = lpWidget;
        $scope.panInfoMsg = false;
        $scope.isPanUpdated = false;

        var deferred = $q.defer();

        $scope.errorMessages = {
            'required_phone': 'Phone is required',
            'invalid_phone': 'This phone is not valid.',
            'invalid_email': 'Are you sure ? That doesnt look like any email ID we have ever seen. Please enter a conventional format.',
            'required_email': 'Email is required',
            'length_email': 'Email length should be greater than 4 and less than 50 characters',
            'invalid_otp': 'OTP should be of 6 digit',
            'required_residentLandlineNumber': 'Resident Line Number is mandatory',
            'required_pan': 'PAN is mandatory',
            'invalid_pan': 'You can try and mess with us. But entering a wrong PAN, you are messing with the Income Tax Department :) Please enter the correct PAN',
            'length_pan': 'PAN should be of length 10 characters',
            'required_aadhar': 'AADHAR is mandatory',
            'invalid_aadhar': 'Are you sure that is a valid Aadhaar number? Please enter correct Aadhar details.',
            'length_alternatepn': 'Length of altenate mobile number',
            'required_addressLine1': 'Address Line1 is mandatory',
            'length_city': 'City length should be greater than 3 and less than 20 characters',
            'length_addressLine1': 'Address Line1 should have minimum 10 and maximum 35 characters',
            'length_addressLine2': 'Address Line2 should have maximum 35 characters',
            'length_pin': 'Length of the pin should be of 6 characters',
            'invalid_landlinenumber': 'Landline Number can only be digit'


        };
        $scope.errorSpin = false;

        //subscribe event to navigate new request
        gadgets.pubsub.subscribe("native.back", function(evt) {
            console.log(evt.text);
            if ($scope.errorSpin != undefined) {
                $scope.openNewReq();
            }

        });
        //Function to move Open SR widgets
        $scope.openNewReq = function() {
            if (localStorage.getItem("navigationData") == 'Email Modification') {
                if (localStorage.getItem("target") == "RDView")
                    gadgets.pubsub.publish("launchpad-retail.recurringDepositDetails");
                else
                    gadgets.pubsub.publish("launchpad-retail.ViewDepositWidgetOpen");
                localStorage.clear();
            } else {
                localStorage.clear();
                gadgets.pubsub.publish("launchpad-retail.serviceRequestOpen");
                $scope.$apply();
            }
        }
        $scope.control = {
            percentComplete: {},
            phoneNumber: {
                otp: '',
                value: '',
                errors: [],
                loading: false,
                validate: function(phone) {
                    if (phone === '' || phone === undefined) {
                        return 'required_phone';
                    }
                    var re = /^[789]\d{9}$/;
                    if (!re.test(phone)) {
                        return 'invalid_phone';
                    }
                    return true;
                }
            },

            emailAddress: {
                otp: '',
                value: '',
                errors: [],
                loading: false,
                validate: function(email) {
                    if (email === '' || email === undefined) {
                        return 'required_email';
                    }
                    if (email.length < 4) {
                        return 'length_email';
                    }
                    if (email.length >= 50) {
                        return 'length_email';
                    }
                    var re = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
                    if (!re.test(email)) {
                        return 'invalid_email';
                    }
                    return true;
                }
            },

            oldEmailAddress: {
                value: ''
            },

            alternatePhoneNumber: {
                value: '',
                errors: [],
                loading: false,
                validate: function(phoneNumber) {
                    if (phoneNumber.length !== 10) {
                        return 'length_alternatepn';
                    }
                    return true;
                }
            },

            alternateEmailAddress: {
                value: '',
                errors: [],
                loading: false,
                validate: function(alemail) {
                    var re = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
                    if (alemail === '' || alemail === undefined) {
                        return 'required_email';
                    }
                    if (alemail.length >= 50) {
                        return 'length_email';
                    }
                    if (!re.test(alemail)) {
                        return 'invalid_email';
                    }
                    return true;
                }
            },

            rlNumber: {
                value: '',
                errors: [],
                loading: false,
                validate: function(rlNumber) {
                    if (rlNumber === '' || rlNumber === undefined) {
                        return 'required_residentlandlinenumber';
                    }
                    var re = /^[0-9]*$/;
                    if (!re.test(rlNumber)) {
                        return 'invalid_landlinenumber';
                    }
                    return true;
                }
            },

            olNumber: {
                value: '',
                errors: [],
                loading: false,
                validate: function(olnumber) {
                    if (olnumber === '' || olnumber === undefined) {
                        return 'required_officeLandlineNumber';
                    }
                    return true;
                }
            },

            pan: {
                value: '',
                errors: [],
                loading: false,
                validate: function(pan) {
                    if (pan === '' || pan === undefined) {
                        return 'required_pan';
                    }
                    var re = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
                    if (!re.test(pan)) {
                        return 'invalid_pan';
                    }
                    if (pan.length !== 10) {
                        return 'length_pan';
                    }
                    return true;
                }
            },

            aadhar: {
                value: '',
                errors: [],
                loading: false,
                validate: function(aadhar) {
                    if (aadhar === '' || aadhar === undefined) {
                        return 'required_aadhar';
                    }
                    if (aadhar.length !== 12) {
                        return 'invalid_aadhar';
                    }
                    return true;
                }
            },

            countrycode: {
                value: '',
                options: [{
                        'value': '+91',
                        'text': '+91'
                    }

                ],
                loading: false
            },

            otpValue: ''


        };

        //Model to bind communication address
        $scope.address = {

            addressLine1: {
                value: '',
                errors: [],
                validate: function(al1) {
                    if (al1 === '' || al1 === undefined) {
                        return 'required_addressLine1';

                    }
                    if (al1.length > 35 || al1.length < 10) {
                        return 'length_addressLine1';

                    }
                    return true;
                }
            },

            addressLine2: {
                value: '',
                errors: [],
                validate: function(al2) {
                    if (al2.length > 35) {
                        return 'length_addressLine2';
                    }
                    return true;
                }
            },

            country: {
                value: '',
                errors: [],
                options: [

                    {
                        'value': 'india',
                        'text': 'India'
                    }
                ],
                loading: false
            },

            state: {
                value: '',
                errors: [],
                options: [

                    {
                        'value': 'mh',
                        'text': 'Maharashtra'
                    }, {
                        'value': 'mp',
                        'text': 'Madhya Pradesh'
                    }
                ],
                loading: false
            },

            city: {
                value: '',
                errors: [],
                validate: function(city) {
                    if (city.length < 3 || city.length > 20) {
                        return 'length_city';
                    }
                    return true;
                }

            },
            pin: {
                value: '',
                errors: [],
                validate: function(pin) {
                    if (pin.length !== 6) {
                        return 'length_pin';

                    }
                    return true;
                }

            }

        };

        var initialize = function() {

            //Session Management Call
            idfcHanlder.validateSession($http);
            $scope.aadharErrorFlag = false; //3.5 change
            $scope.removeCustomerMobile = false; //3.5 change /*aadhar change*/
            $scope.errorSpin = true;
            $scope.showConfirmationForm = false;
            $scope.profileContactForm = true;
            $scope.serviceError = false;
            var profileUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('saveUrl') + '?dummy = ' + new Date().getTime());

            var nAgt = navigator.userAgent;
            var verOffset = nAgt.indexOf('NET');


            if (verOffset !== -1) {

                $('.profileContact-chk-tip-parent').css('margin-top', '-34px');
                $('.profileContact-tip-span i').css('top', '19px');
            }
            var customerRequest = $http({
                method: 'GET',
                url: profileUrl,

                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }

            });
            customerRequest.success(function(response) {

                $scope.errorSpin = false;
                if (response.mblNm != null) {
                    $scope.control.phoneNumber.value = response.mblNm === [] ? '' : response.mblNm;
                    $scope.mob = response.mblNm === [] ? '' : response.mblNm;
                }
                if (response.emailId != null) {
                    $scope.control.emailAddress.value = response.emailId === [] ? '' : response.emailId;
                }
                $scope.control.oldEmailAddress.value = response.emailId === [] ? '' : response.emailId;

                $scope.control.alternatePhoneNumber.value = response.altMblNm === [] ? '' : response.altMblNm;
                $scope.control.alternateEmailAddress.value = response.altEmailId === [] ? '' : response.altEmailId;
                $scope.control.rlNumber.value = response.resLndlne === [] ? '' : response.resLndlne;
                $scope.control.olNumber.value = response.offLndlne === [] ? '' : response.offLndlne;
                if (response.pan != null) {
                    $scope.control.pan.value = response.pan === [] ? '' : response.pan;
                    $scope.isPanUpdated = true;
                }
                if (response.aadharNm != null) {
                    $scope.control.aadhar.value = response.aadharNm === [] ? '' : response.aadharNm;
                }
                if (response.comAddrLne1 != null) {
                    $scope.address.addressLine1.value = response.comAddrLne1 === [] ? '' : response.comAddrLne1;
                }
                if (response.comAddrLne1 != null) {
                    $scope.address.addressLine2.value = response.comAddrLne2 === [] ? '' : response.comAddrLne2;
                }
                if (response.comCntry != null) {
                    $scope.address.country.value = response.comCntry === [] ? '' : response.comCntry;
                }
                if (response.comState != null) {
                    $scope.address.state.value = response.comState === [] ? '' : response.comState;
                }
                if (response.comCty != null) {
                    $scope.address.city.value = response.comCty === [] ? '' : response.comCty;
                }
                if (response.comPnCde != null) {
                    $scope.address.pin.value = response.comPnCde === [] ? '' : response.comPnCde;
                }
                if (response.pmtAddrLne1 != null) {
                    $scope.permanentaddress.addressLine1.value = response.pmtAddrLne1 === [] ? '' : response.pmtAddrLne1;
                }
                if (response.pmtAddrLne2 != null) {
                    $scope.permanentaddress.addressLine2.value = response.pmtAddrLne2 === [] ? '' : response.pmtAddrLne2;
                }
                if (response.pmtCntry != null) {
                    $scope.permanentaddress.country.value = response.pmtAddrLne2 === [] ? '' : response.pmtCntry;
                }
                if (response.pmtState != null) {
                    $scope.permanentaddress.state.value = response.pmtState === [] ? '' : response.pmtState;
                }
                if (response.pmtCty != null) {
                    $scope.permanentaddress.city.value = response.pmtCty === [] ? '' : response.pmtCty;
                }
                if (response.pmtPnCde != null) {
                    $scope.permanentaddress.pin.value = response.pmtPnCde === [] ? '' : response.pmtPnCde;
                }
                $scope.showPan = true;
                $scope.showAadhar = true;
                $scope.checkPanAadharValue();
                $scope.calculateProfilePercent('.selector', '#000000', '200px');
                $scope.maskNumber();

            });
            customerRequest.error(function(data, status) {
                $scope.errorSpin = false;

                if (status == 0) {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    if (data) {
                        idfcHanlder.checkTimeout(data);
                        if ((data.cd === '501')) {
                            $scope.alert = {
                                messages: {
                                    cd: data.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error', false);
                        } else {
                            $scope.serviceError = true;
                            $scope.alert = {
                                messages: {
                                    cd: data.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error', false);
                        }
                    }
                }
            });

        };
        if (localStorage.getItem("navigationFlag") && localStorage.getItem("origin") == "Profile") {
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK",
                trSerID: localStorage.getItem("navigationData")
            });
            // 4 Apr-Pratik
            $timeout(function() {
                //Message to be shown to user when PAN already updated
                if ((localStorage.getItem("navigationData")).toLowerCase() == 'Pan Update'.toLowerCase() && $scope.isPanUpdated) {
                    $scope.panInfoMsg = true;
                }
            }, 2000);
        }
        $scope.alerts = [];
        var ALERT_TIMEOUT = 3000;
        $scope.addAlert = function(code, type, timeout) {
            var alert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };

            $scope.alerts.push(alert);

            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(alert));
                }, ALERT_TIMEOUT);
            }
        };

        // Remove specific alert
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        // Clear  alert messages
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };


        //model to bind permanent address
        $scope.permanentaddress = {
            addressLine1: {
                value: ''

            },
            addressLine2: {
                value: ''

            },
            country: {
                value: ''
            },
            state: {
                value: ''
            },
            city: {
                value: ''
            },
            pin: {
                value: ''
            }

        };


        $scope.control.oldEmailAddress.value = $scope.control.emailAddress.value;

        //Function to calculate profile percent
        $scope.calculateProfilePercent = function(selector, color, size) {
            var fieldCount = 100;
            var completeCount = 0;
            if (!($scope.control.phoneNumber.value === '' || $scope.control.phoneNumber.value === null)) {
                completeCount = completeCount + 10;

            }
            if (!($scope.control.emailAddress.value === '' || $scope.control.emailAddress.value === null)) {

                completeCount = completeCount + 10;

            }
            if (!($scope.control.pan.value === '' || $scope.control.pan.value === null)) {

                completeCount = completeCount + 10;

            }
            if (!($scope.control.aadhar.value === '' || $scope.control.aadhar.value === null)) {


                completeCount = completeCount + 10;

            }
            if (!($scope.address.addressLine1.value === '' || $scope.address.addressLine1.value === null)) {

                completeCount = completeCount + 10;
            }
            if (!($scope.address.country.value === '' || $scope.address.country.value === null)) {
                completeCount = completeCount + 5;
            }
            if (!($scope.address.state.value === '' || $scope.address.state.value === null)) {
                completeCount = completeCount + 5;
            }
            if (!($scope.address.city.value === '' || $scope.address.city.value === null)) {
                completeCount = completeCount + 5;
            }
            if (!($scope.address.pin.value === '' || $scope.address.pin.value === null)) {
                completeCount = completeCount + 5;
            }
            if (!($scope.permanentaddress.addressLine1.value === '' || $scope.permanentaddress.addressLine1.value === null)) {
                completeCount = completeCount + 10;
            }
            if (!($scope.permanentaddress.country.value === '' || $scope.permanentaddress.country.value === null)) {
                completeCount = completeCount + 5;
            }
            if (!($scope.permanentaddress.state.value === '' || $scope.permanentaddress.state.value === null)) {
                completeCount = completeCount + 5;
            }
            if (!($scope.permanentaddress.city.value === '' || $scope.permanentaddress.city.value === null)) {
                completeCount = completeCount + 5;
            }
            if (!($scope.permanentaddress.pin.value === '' || $scope.permanentaddress.pin.value === null)) {
                completeCount = completeCount + 5;
            }


            var percentComplete = Math.round((completeCount / fieldCount) * 100);

            //var percent = percentComplete + '%';
            $('#progress-bar1').css('background-color', 'blue');

            $scope.control.percentComplete = (percentComplete) + '%';

            $('#progress-bar1').css('width', $scope.control.percentComplete);
            $scope.control.percentComplete1 = 'width:' + (percentComplete) + '%';


        };



        $scope.view = function() { //3.5 change
            $scope.profileContactForm = true;
            $scope.showServiceRequestNo = false;
            console.log($scope.profileContactForm);
            //console.log(showServiceRequestNo);

        };
        $scope.maskNumber = function() {
            if (!($scope.control.pan.value === '' || $scope.control.pan.value === null)) {
                var pan = $scope.control.pan.value;
                var nonMaskedPan = pan.substring(pan.length - 4, pan.length);
                pan = new Array(pan.length - 3).join('*');
                $scope.control.pan.value = pan + nonMaskedPan;
            }
            if (!($scope.control.aadhar.value === '' || $scope.control.aadhar.value === null)) {
                var aadhaar = $scope.control.aadhar.value;
                var nonMaskedAadhar = aadhaar.substring(aadhaar.length - 4, aadhaar.length);
                aadhaar = new Array(aadhaar.length - 3).join('*');
                $scope.control.aadhar.value = aadhaar + nonMaskedAadhar;
            }
            if (!($scope.control.phoneNumber.value === '' || $scope.control.phoneNumber.value === null)) {
                var phoneNumber = $scope.control.phoneNumber.value;
                var nonMaskedNumber = phoneNumber.substring(phoneNumber.length - 4, phoneNumber.length);
                phoneNumber = new Array(phoneNumber.length - 3).join('*');
                $scope.control.phoneNumber.value = phoneNumber + nonMaskedNumber;
            }
            if (!($scope.control.alternatePhoneNumber.value === '')) {
                var alternatePhoneNumber = $scope.control.alternatePhoneNumber.value;
                var nonMaskedAltNo = alternatePhoneNumber.substring(alternatePhoneNumber.length - 4, alternatePhoneNumber.length);
                alternatePhoneNumber = new Array(alternatePhoneNumber.length - 3).join('*');
                $scope.control.alternatePhoneNumber.value = alternatePhoneNumber + nonMaskedAltNo;
            }
        };

        $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/partials';
        $scope.serviceRequestNo = '';
        $scope.showServiceRequestNo = false;
        $scope.checkField = '';
        $scope.panflag = false;
        $scope.aadharflag = false;
        $scope.emailFlag = false;
        $scope.savingsAccountList = '';
        $scope.checkPanAadharValue = function() {
            if ($scope.control.pan.value === '' || $scope.control.pan.value === null) {
                $scope.showPan = false;
            }
            if ($scope.control.aadhar.value === '' || $scope.control.aadhar.value === null) {
                $scope.showAadhar = false;
            }
        };



        $scope.formData = {
            formCode: '',
            csType: '',
            savingAcctNo: '',
            emailId: '',
            srName: '',
            pan: '',
            aadhar: '',
            landlineNumber: '',
            otpValue: ''
        };
        $scope.submitSR = function(value) {




            $scope.errorSpin = true;


            console.log("5333issue,submitSR called");
            $scope.alerts = [];
            $scope.formValue = value;
            var self = this;
            self.submitServiceRequest = httpService.getInstance({
                endpoint: lpWidget.getPreference('createSRUrl')
            });
            console.log('SR ' + self.submitServiceRequest);

            // xhr = service.del();
            var xhr = self.submitServiceRequest.create({
                data: $scope.formData
            });
            xhr.success(function(data) {
                console.log("5333issue,success");
                $scope.errorSpin = false;
                /*Mobile adding this to remove the error alerts on success*/
                $scope.clearAlerts();
                if (data && data !== 'null') {

                    $scope.serviceRequestNo = data.csId;
                    $scope.showConfirmationForm = false;
                    $scope.OTPFlag = true;
                    $scope.showServiceRequestNo = true;
                    $scope.panflag = false;
                    $scope.aadharflag = false;
                    $scope.emailFlag = false;
                    $scope.control.otpValue = '';
                    $scope.OTPform = {
                        submitted: false
                    };
                    if ($scope.formValue === 'pan') {
                        $scope.control.pan.value = '';
                        $scope.successMessage = 'Your PAN will be updated shortly. ';
                    }
                    if ($scope.formValue === 'aadhar') {
                        $scope.control.aadhar.value = '';
                        $scope.successMessage = 'Your Aadhar number will be updated shortly. ';
                    }
                    if ($scope.formValue === 'email') {
                        $scope.control.emailAddress.value = $scope.control.oldEmailAddress.value;
                        $scope.successMessage = 'Your Email ID will be updated shortly. ';
                    }
                }
            });
            xhr.error(function(data) {
                console.log("5333issue,error");
                $scope.errorSpin = false;
                if (data.cd) {
                    console.log("5333issue,error msg: " + data.rsn);
                    idfcHanlder.checkTimeout(data);
                    $scope.OTPError = idfcHanlder.checkOTPError(data);
                    if (data.cd === '02' || data.cd === '04' || data.cd === '01' || data.cd === '03' || data.cd === '05' || data.cd === '09' || data.cd === '99') {
                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                    } else if ($scope.OTPError === true) {
                        $scope.lockFieldsOTP = true;
                        $scope.success.happened = false;
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                    } else if ((data.cd === '501')) {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    }
                    if(data.cd === '111') //3.5 change
                    {
                    							$scope.lockFieldsOTP = true;
                    							$scope.success.happened = false;
                    							$scope.error = {
                    								happened: true
                    								, msg: data.rsn
                    							};
                   }
                   else if ((data.cd === 'CRM999') || (data.cd === 'CRM001')) {
                   							$scope.showConfirmationForm = false;
                   							$scope.OTPFlag = true;
                   							$scope.panflag = false;
                   							$scope.aadharflag = false;
                   							$scope.emailFlag = false;
                   							$scope.success.happened = false;
                   							$scope.otpValue = '';
                   							$scope.showError = true;
                   							$scope.errmsg = data.rsn;
                   						}

                    else {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    }
                }

            });
        };

        $scope.getSavingsAccount = function() {

            $scope.errorSpin = true;

            var self = this;
            self.savingsAccount = httpService.getInstance({
                endpoint: lpWidget.getPreference('savingsAccountUrl')
            });

            var xhr = self.savingsAccount.read();
            xhr.success(function(data) {
                $scope.errorSpin = false;
                if (data && data !== 'null') {
                    $scope.accountNumbers = data;
                    if ($scope.accountNumbers.length > 0) {
                        $scope.formData.savingAcctNo = $scope.accountNumbers[0].id;

                    }
                    $scope.submitSR('aadhar');
                }
            });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    if ((data.cd === '501')) {
                        //$scope.serviceError = checkGlobalError(data);
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    } else {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    }
                }
                self.error = {
                    message: data.statusText
                };
            });

            return xhr;
        };

        $scope.submitProfileEmailForm = function() {
            $scope.checkField = 'email';
            $scope.showConfirmationForm = true;
            $scope.profileContactForm = false;
            $scope.emailFlag = true;
            $scope.panflag = false;
            $scope.aadharflag = false;
        };

        $scope.submitProfileEmailConfirmForm = function() {

            $scope.showConfirmationForm = true;
            // $scope.generateOTP('send');
             if ($scope.aadharflag) //3.5change
             {
               $scope.generateOTP('send');
             }
             else
             {
              $scope.readSMS('send');
             }



        };

        $scope.submitProfilePanForm = function() {
            $scope.checkField = 'pan';
            $scope.showConfirmationForm = true;
            $scope.profileContactForm = false;
            $scope.panflag = true;
            $scope.aadharflag = false;
            $scope.emailFlag = false;

        };
        $scope.submitProfileAadhaarForm = function() {

            $scope.checkField = 'aadhar';
            $scope.showConfirmationForm = true;
            $scope.profileContactForm = false;
            $scope.aadharflag = true;
            $scope.panflag = false;
            $scope.emailFlag = false;
        };
        $scope.submitProfileLandlineNumberForm = function() {
            $scope.formData.formCode = 'landline';
            $scope.formData.csType = 'SR';
            $scope.formData.acctNo = '182638';
            $scope.formData.srName = 'Number Updation';
            $scope.formData.landlineNumber = $scope.control.rlNumber.value;
            $scope.submitSR();
        };

        $scope.submitFormOTP = function(isFormValid) {
            console.log("5333issue, submit triggered");
            if (!isFormValid) {
                return false;
            }

            if ($scope.checkField === 'email') {
                $scope.formData.formCode = 'email';
                $scope.formData.csType = 'SR';
                $scope.formData.srName = 'Email modification';
                $scope.formData.emailId = $scope.control.emailAddress.value;
                $scope.formData.oldEmailId = $scope.control.oldEmailAddress.value;
                $scope.formData.otpValue = $scope.control.otpValue;
                $scope.submitSR('email');
            }
            if ($scope.checkField === 'pan') {
                $scope.formData.formCode = 'pan';
                $scope.formData.csType = 'SR';
                $scope.formData.srName = 'Pan Updation';
                $scope.formData.pan = $scope.control.pan.value;
                $scope.formData.otpValue = $scope.control.otpValue;
                $scope.profileContactForm = false;
                $scope.submitSR('pan');
            }

            if ($scope.checkField === 'aadhar') {
                /* $scope.formData.formCode = 'aadhaar';
                 $scope.formData.csType = 'SR';
                 $scope.formData.srName = 'Aadhaar Updation';
                 $scope.formData.aadhar = $scope.control.aadhar.value;
                 $scope.formData.otpValue = $scope.control.otpValue;
                 $scope.profileContactForm = false;
                 $scope.getSavingsAccount();*/ //3.5 change commented
                validateAadharOTP(); //3.5 change /*aadhar change*/
            }
        };

        var validateAadharOTP = function() { //3.5 change
            $scope.errorSpin = true;
           // $scope.error.msg = '';
            $scope.control.otpValue ='';
            var tokenEndPoint = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference('generateReceiptToken'), {
                    servicesPath: lpPortal.root
                });

            viewProfileDetails.setup({
                    tokenEndPoint: tokenEndPoint,
                }).getTokenUrl()
                .success(function(response, status, headers, config) {
                    var urlOtpEndPoint = lpCoreUtils.resolvePortalPlaceholders(
                        lpWidget.getPreference('verifyAadhar'), {
                            servicesPath: lpPortal.root
                        });

                    var postData = {
                        'aadharNumber': $scope.control.aadhar.value,

                        'aadharOtp': $scope.otpValue,
                        'tokenIdentifier': response.tokenId
                    };
                    postData = $.param(postData || {});
                    viewProfileDetails.setup({
                            urlOtpEndPoint: urlOtpEndPoint,
                            data: postData
                        }).validateDetails()
                        .success(function(responseData, status, headers, config) {
                            $scope.errorSpin = false;
                            console.log('Show EKYC Success Screen');
                            $scope.showConfirmationForm = false;
                            $scope.OTPFlag = true;
                            $scope.showServiceRequestNo = true;
                            $scope.serviceRequestNo = responseData.suceessmMsg;
                            $scope.successMessage = 'Your service request has successfully been accepted.';
                            if (responseData.errorMsg) {
                                $scope.showError = true;
                                $scope.errmsg = responseData.errorMsg;
                            }

                        }).error(function(error) {
                            $scope.errorSpin = false;
                            $scope.showConfirmationForm = false;

                            if (error.cd && error.cd === '111') {
                                $scope.isEmailIDRegistered = false;
                                $scope.lockFieldsOTP = true;
                                $scope.success.happened = false;
                                $scope.successMessage = 'Your service request has successfully been accepted.';
                                $scope.error = {
                                    happened: true,
                                    msg: error.rsn,
                                    //otpMsg: "That's the wrong code! Please try again."
                                };
                            } else if ((error.cd === 'NAR999')) {
                                $scope.showConfirmationForm = false;
                                $scope.OTPFlag = true;
                                $scope.panflag = false;
                                $scope.aadharflag = false;
                                $scope.emailFlag = false;
                                $scope.success.happened = false;
                                $scope.otpValue = '';
                                $scope.showError = true;
                                $scope.errmsg = error.rsn;
                            } else if (error.cd) {

                               /// IdfcError.checkTimeout(error);
                               // $scope.OTPError = IdfcError.checkOTPError(error);
                                if (error.cd === '02') {
                                    $scope.showConfirmationForm = true;
                                    $scope.success.happened = false;
                                    $scope.error = {
                                        happened: true,
                                        msg: error.rsn
                                    };
                                } else if ((error.cd === '501')) {
                                    $scope.alert = {
                                        messages: {
                                            cd: error.rsn
                                        }
                                    };
                                    $scope.addAlert('cd', 'error', false);
                                } else {
                                    $scope.success.happened = false;
                                    $scope.error = {
                                         happened: true,
                                        msg: error.rsn
                                    };
                                }
                            } else {
                                $scope.errorSpin = false;
                                console.log('Show EKYC Success Screen');
                                $scope.showConfirmationForm = false;
                                $scope.OTPFlag = true;
                                $scope.showError = true;
                                $scope.showServiceRequestNo = false;
                                $scope.errmsg = error.suceessmMsg;
                                if (error.errorMsg) {
                                    $scope.showError = true;
                                    $scope.aadharError = error.errorMsg;
                                }
                                $scope.aadharErrorFlag = true;
                            }

                        })
                }).error(function(error) {
                    $scope.errorSpin = false;
                    console.log('Error in EKYC generateToken');
                   /* $scope.success.otpHappened = false; // added by pramod
                    $scope.error = {
                        otpHappened: true,
                        otpMsg: error.rsn
                    };*/
                     $scope.success.happened = false;
                                                        $scope.error = {
                                                            happened: true,
                                                            msg: error.rsn
                                                        };
                });

        };
        var generateAadharOTP = function() { //3.5 change function added
            $scope.errorSpin = true;
            var tokenEndPoint = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference('generateReceiptToken'), {
                    servicesPath: lpPortal.root
                });

            viewProfileDetails.setup({
                    tokenEndPoint: tokenEndPoint,
                }).getTokenUrl()
                .success(function(response, status, headers, config) {
                    var urlOtpEndPoint = lpCoreUtils.resolvePortalPlaceholders(
                        lpWidget.getPreference('generateAadharOTP'), {
                            servicesPath: lpPortal.root
                        });

                    var postData = {
                        'aadharNumber': $scope.control.aadhar.value,
                        'tokenIdentifier': response.tokenId
                    };
                    postData = $.param(postData || {});
                    viewProfileDetails.setup({
                            urlOtpEndPoint: urlOtpEndPoint,
                            data: postData
                        }).validateDetails()
                        .success(function(responseData, status, headers, config) {
                             console.log("Success  generateAadharOTP");
                            if (responseData.suceessCode && responseData.status != 'ERROR') {
                                $scope.errorSpin = false;
                                $scope.showConfirmationForm = false;
                                $scope.OTPFlag = true;
                                $scope.showServiceRequestNo = true;
                                $scope.serviceRequestNo = responseData.suceessmMsg;
                                $scope.successMessage = 'Your service request has successfully been accepted.';

                            } else if (responseData.status === 'ERROR') {
                                $scope.errorSpin = false;
                                $scope.showConfirmationForm = false;
                                $scope.OTPFlag = true;
                                $scope.showServiceRequestNo = true;
                                $scope.serviceRequestNo = error.suceessmMsg;

                            } else {
                                $scope.showConfirmationForm = true;
                                $scope.otpValue = '';
                                $scope.errorSpin = false;
                                console.log('Show OTP Screen');
                                $scope.OTPFlag = false;
                                $scope.lockFields = true;
                                $scope.removeCustomerMobile = false;
                                $scope.success = {
                                    happened: true,
                                    msg: 'OTP has been successfully sent to your Aadhar registered mobile number.'
                                };
                            }

                        }).error(function(responseData) {
                             console.log("error  generateAadharOTP");
                            $scope.errorSpin = false;
                            $scope.showConfirmationForm = false;
                            $scope.OTPFlag = true;
                            $scope.showError = true;
                            $scope.errmsg = responseData.suceessmMsg;
                            if (responseData.errorMsg) {
                                $scope.showError = true;

                                $scope.aadharError = responseData.errorMsg;
                            }
                            $scope.aadharErrorFlag = true;
                        })

                }).error(function(response) {
                    $scope.errorSpin = false;
                    console.log('Error in OTP generateToken');
                });

        };
        $scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
        $scope.OTPFlag = true;
        $scope.control.otpValue = '';
        $scope.customerMob = '';
        $scope.customerMobMasked = '';
        $scope.lockFields = false;


        $scope.clearOTP = function() {
            $scope.control.otpValue = '';
        };

        $scope.cancelOTP = function() {
            lpCoreBus.publish('launchpad-retail.serviceRequestOpen');
        };

        //SMS Reading -- Start
        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt) {
            console.log(evt.resendOtpFlag);
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.readSMS('resend');
        });

        $scope.readSMS = function(resendFlag) {
            console.log('Read SMS called');
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if (smsPlugin) {
                var isCheckSuccessCallback = function(data) {
                    if (data) {
                        var smsPermissionFlag = data['successFlag'];
                        if (smsPermissionFlag) {
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS", {
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "ProfileWidget"
                            });

                            //Step 2. Send request to "sendOTP service
                            console.log('Resend flag->' + resendFlag);
                            $scope.generateOTP(resendFlag);



                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("ProfileWidget", function(evt) {
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: ' + evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver", {
                                    data: "Stop Reading OTP"
                                });

                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp' + receivedOtp);
                                $scope.control.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :' + $scope.control.otpValue);
                                //errorSpin is true in generateOTP function
                                //stopping the loader
                                //$scope.errorSpin = false;
                                angular.element('#verifyOTP-btn-profile-widget').triggerHandler('click');

                                //deferred.resolve(data);
                                //return deferred.promise;

                            });


                        } else {
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            console.log('Resend flag->' + resendFlag);
                            $scope.generateOTP(resendFlag);

                            //deferred.resolve();
                            //return deferred.promise;
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
        };
        //SMS Reading -- End

        $scope.generateOTP = function(value) {
            if ($scope.aadharflag) //3.5change
            {
                generateAadharOTP();
            } else {
                $scope.removeCustomerMobile = true; //3.5
                $scope.otpValue = ''; //3.5 end
                $scope.errorSpin = true;

                var resendOTP = null;

                $scope.alerts = [];
                var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders($scope.generateOTPServiceEndPoint, {
                    servicesPath: lpPortal.root
                });
                if (value === 'resend') {
                    resendOTP = true;
                } else {
                    resendOTP = false;
                }

                var postData = {
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

                xhr.success(function(data) {

                    //$scope.errorSpin = false;
                    $scope.success = {

                        happened: true,

                        msg: 'OTP has been successfully sent to your registered mobile number'

                    };

                    //Automate OTP read
                    // $scope.readSMS('');

                    $scope.error = {

                        happened: false,

                        msg: ''

                    };

                    $scope.OTPFlag = false;

                    $scope.lockFields = true;

                    $scope.customerMob = data.mobileNumber;
                    $scope.customerMobMasked = 'XXXXXX' + $scope.customerMob.substr($scope.customerMob.length - 4);
                    $scope.errorSpin = false;

                }).error(function(data, status, headers, config) {
                    $scope.errorSpin = false;
                    gadgets.pubsub.publish("stopReceiver", {
                        data: "Stop Reading OTP"
                    });
                    if (status == 0) {
                        gadgets.pubsub.publish("no.internet");
                    } else {
                        if (data.cd) {
                            idfcHanlder.checkTimeout(data);
                            if ((data.cd === '501')) {
                                $scope.alert = {
                                    messages: {
                                        cd: data.rsn
                                    }
                                };
                                $scope.addAlert('cd', 'error', false);
                            } else {
                                $scope.alert = {
                                    messages: {
                                        cd: data.rsn
                                    }
                                };
                                $scope.addAlert('cd', 'error', false);
                            }
                        }
                    }
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                });
            }
        };

        $scope.GoBack = function() {
            /*mobile added this*/
            if ($scope.checkField === 'pan') {
                $scope.control.pan.value = '';

            } else if ($scope.checkField === 'aadhar') {
                $scope.control.aadhar.value = '';
            }
            $scope.showConfirmationForm = false;
            $scope.profileContactForm = true;
            $scope.control.emailAddress.value = $scope.control.oldEmailAddress.value;

        };

        /*Upated view profile */ //3.5 change need to add in html
        $scope.viewProfile = function() {
            $scope.showServiceRequestNo = false;
            $scope.showError = false;
            $scope.profileContactForm = true;
            $scope.showCommedit = false;
            $scope.showComm = false;
            if ($scope.aadharErrorFlag) {
                $scope.control.aadhar.value = '';
            }
        };
        $scope.save = function(field, value) {
            $scope.data.phoneNumber = $scope.control.countrycode.value + $scope.control.phoneNumber.value;
            $scope.data.emailAddress = $scope.control.emailAddress.value;

            $scope.data.alternatePhoneNumber = $scope.control.countrycode.value + $scope.control.alternatePhoneNumber.value;
            $scope.data.alternateEmailAddress = $scope.control.alternateEmailAddress.value;
            $scope.data.rlNumber = $scope.control.countrycode.value + $scope.control.rlNumber.value;
            $scope.data.olNumber = $scope.control.countrycode.value + $scope.control.olNumber.value;
            $scope.data.pan = $scope.control.pan.value;
            $scope.data.aadhar = $scope.control.aadhar.value;
            $scope.otpFunction();
        };

        initialize();
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if (localStorage.getItem("navigationFlag")) {
                console.log(evt.text);
                if ($scope.errorSpin != undefined) {
                    $scope.openNewReq();
                }

                localStorage.clear();
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

    }
    exports.ProfileContactCtrl = ProfileContactCtrl;
});