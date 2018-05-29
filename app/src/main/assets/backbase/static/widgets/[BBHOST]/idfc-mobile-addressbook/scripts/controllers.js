define(function(require, exports, module) {
    'use strict';
    function applyScope($scope) {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }	
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');

    exports.ContactsController = function($scope, $http, $timeout,
        lpWidget, ContactsModel, $filter, i18nUtils, lpCoreBus,
        lpCoreUtils, lpPortal, ifscCodeSearchService, CQService) {
       var contactsCtrl = this; 
	   
			  /** ifsc code search  **/
			  contactsCtrl.callDefaultPageLoad = function(){
				if(localStorage.getItem('addressbookModelData')){	
				   $scope.contactsModel.errorSpin = true; 
                   //$scope.contactChangeView('contactsAdd');				   
                   if(contactsCtrl.isCountryListLoad && contactsCtrl.isBankLoad){	
                    $scope.contactsModel.errorSpin = true; 				   
				    console.log('start timeout :::::::::');
					var modelData = angular.fromJson(localStorage.getItem('addressbookModelData'));
					$timeout(function(){
							$scope.checkDailyAddLimit();
							$scope.contactsModel.currentContact = modelData;	
							
							if($scope.contactsModel.currentContact.ifscSearch.ifscCodeError){
								contactsCtrl.savedIfscValidateErrors = true;
							}
							if($scope.contactsModel.currentContact.ifscSearch.ifscFormErrors){
								 //$scope.confirmAddContact(false);
							}
					}, 1000).then(function(){ console.log('start timeout ::::::::: after 3 sec :::::::::::::::::::::');
						return $timeout(function(){
							  if(localStorage.getItem('addressbook_landing_data')){
								   var ifscData = angular.fromJson(localStorage.getItem('addressbook_landing_data'));
								   console.log('ifsc data :::::::::::::::: '); console.log(ifscData);								  
								   console.log('bank details :::::::::::::::::');
								   console.log(ifscData);
								   contactsCtrl.dataSelected = true;
                                   console.log('model data :::::::::::::::: '); console.log(JSON.stringify(modelData)); console.log(modelData);								   
								   $scope.contactsModel.currentContact.ifscCode = ifscData.ifscCode;
								   contactsCtrl.bankDetails = ifscData;
								   contactsCtrl.bankDetails.count = 1;
								   contactsCtrl.savedIfscValidateErrors = false;
								   //localStorage.setItem('addressbook_landing_data', '');
								   $scope.contactsModel.errorSpin = false;
							   } else {
								   			localStorage.setItem('addressbookModelData', '');	
			                                localStorage.setItem('addressbook_landing_data', '');
							   }							
						}, 1000);
						
					});	
					
					
				}
				} else {
					if(localStorage.getItem('addressbookModelData')){	
								   
					   if(contactsCtrl.isCountryListLoad && contactsCtrl.isBankLoad){	
						 $scope.contactsModel.errorSpin = false; 	
					   }				   
					}				
				}  
			  };
			  		
              /** ifsc code search ***/		   
	   
	   
	   
       $scope.contactDataPhone = '';
        var ALERT_TIMEOUT = 5000;
        var bus = lpCoreBus;
        var widget = lpWidget;
        $scope.credentialType = '';
        $scope.templatesDir = lpCoreUtils.getWidgetBaseUrl(widget) +
            '/templates';
        $scope.imagePath = lpCoreUtils.getWidgetBaseUrl(widget) +
            '/images/icon.png';
        $scope.deleteConfirmTemplate = $scope.templatesDir +
            '/contactsDeleteConfirm.html';
        var loadBanksList = function() {
            $scope.contactsModel.errorSpin = true; //true
            $scope.addButton = true;
            $scope.alerts = [];
            $scope.contactsModel.loadBanksList().success(
                function(data) {
                    $scope.ribOrBibUser=data.ribOrBibUserList; //added by lalita limit changes
                    $scope.payeeLimit=data.ribOrSolePropLimList; //added by lalita limit changes
                    $scope.payeeLimitErrorDisplayMessage="Payee Limit should not be more than "+$scope.payeeLimit +" ." //added by lalita limit changes
                    //$scope.contactsModel.errorSpin = false;
					/** ifsc code search **/
					contactsCtrl.isBankLoad = true;
					contactsCtrl.callDefaultPageLoad();						
					
                }).error(function(data) {
                $scope.contactsModel.errorSpin = false;
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
            });
        };

         $scope.testANDTwo = function (field1, field2) {
        			return field1 && field2;
        };
        var loadCountryCodesList = function() {
            $scope.contactsModel.errorSpin = true;
            $scope.addButton = true;
            $scope.alerts = [];
            $scope.contactsModel.loadCountryCodesList().success(
                function(data) {
                    //$scope.contactsModel.errorSpin = false;
					/** ifsc code search **/
					contactsCtrl.isCountryListLoad = true;
					contactsCtrl.callDefaultPageLoad();
                }).error(function(data) {
                $scope.contactsModel.errorSpin = false;
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
            });
        };
        var loadContacts = function() {
            $scope.contactsModel.errorSpin = true;
            $scope.addButton = true;
            $scope.alerts = [];
            $scope.contactsModel.loadContacts().success(
                function(data) {
                    $scope.contactsModel.errorSpin = false;
                    $scope.addButton = false;
                }).error(function(data) {
                $scope.contactsModel.errorSpin = false;
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    if (data.cd !== '188') {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error',
                            false);
                    }
                    if (data.cd === '188') {
                        $scope.addButton = false;
                        $scope.contactsModel.contacts = [];
                    }
                }
            });
        };

        // RSA changes by Xebia start
        $scope.cqObject = CQService;
        var getChallengeQuestionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getCQUrl'));
        var verifyCQAnswerUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('verifyCQAnswerUrl'));
        // to fetch mobile specific data
           /* gadgets.pubsub.publish("getMobileSdkData");  //3.6 change
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
              $scope.mobileSdkData = response.data;
            });*/
              var globalPreferences   = cxp.mobile.plugins['GlobalVariables']; //3.6 change
                                if (globalPreferences) {
                                               var rsaSuccessCallback = function(data) {
                                                   var rsaObj = data['rsaData'];
                                                    var rsaJson = JSON.parse(rsaObj);
                                                    $scope.mobileSdkData = rsaJson.data;
                                               };
                                               var rsaErrorCallback = function(data) {
                                                   console.log('Something really bad happened');
                                               };
                                               globalPreferences.getRSAObject(
                                                   rsaSuccessCallback,
                                                   rsaErrorCallback
                                               );
                                           } else {
                                               console.log('Cant find Plugin');
                                           }
        // RSA changes by Xebia ends

        var initialize = function() {

            //Session Management Call
        	idfcHanlder.validateSession($http);

            var pref = {
                contacts: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference(
                        'contactListDataSrc')),
                contactDataCreate: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference(
                        'contactCreate')),
                contactDataModify: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference(
                        'contactModify')),
                contactDetails: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference(
                        'contactDetailsDataSrc')),
                bankServiceDetails: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference(
                        'bankServicesDataSrc')),
                bankServiceDetails01: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference('countrycode')
                ),
                databaseServiceDetails: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference(
                        'databaseServicesDataSrc')),
                generateOTPDetails: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference(
                        'generateOTPService')),
                rsaAnalyzeService: lpCoreUtils.resolvePortalPlaceholders(
                    widget.getPreference(
                        'rsaAnalyzeService')),
                locale: widget.getPreference('locale'),
                lazyload: true
            };
			
			/** ifsc code search **/
		    contactsCtrl.ifscValidateErrors = {};
		    contactsCtrl.ifscValidateErrors['invalidIFSC'] = false;			
			contactsCtrl.bankDetails = {};
			contactsCtrl.disableBank = false;
			contactsCtrl.searchKeys = {};
			contactsCtrl.queryStr = '';	
			contactsCtrl.qData = {'startIndex':'','limit':'','bankName':'','branchName':'','ifscCode':'','isFirstAttempt':true};				
			console.log('addressbook_landing_data :::::::::::::::::::::::::::::::::');
			console.log(localStorage.getItem('addressbook_landing_data'));
			contactsCtrl.isBankLoad = false;
			contactsCtrl.isCountryListLoad = false;
			
            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion={};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            // RSA changes by Xebia ends
			
           // if(!localStorage.getItem('addressbook_landing_data')){
				
            $scope.contactsModel = new ContactsModel(pref);
			

		   /** ifsc code search **/
		   if(localStorage.getItem('addressbookModelData')){
			   contactsCtrl.showAddViewBen = false;
			   $scope.contactsModel.errorSpin = true;
		   } else {
			   contactsCtrl.showAddViewBen = true;
		   }
		   
            $scope.OTPFlag = true;
            $scope.otpValue = '';
            $scope.errors = {};
            $scope.idfcAccountValid = true;
            $scope.idfcAccountMaxLength = true;
            $scope.otherAccountValid = true;
            $scope.contactsModel.disableSelection = false;
            $scope.contactsModel.modalShown = false;
            $scope.contactsModel.modalError = false;
            $scope.paymentLimitErrorMessage = false;
            $scope.contactsModel.modalShownDelete = false;
            $scope.title = widget.getPreference('title');
            $scope.todaysDate = new Date();
            $scope.customerMob = '';
            $scope.customerMobMasked = '';
            $scope.serviceError = false;
            $scope.currency = 'INR';
            $scope.hideOTPFlag = true;
            $scope.hideQuesFlag = true;
            $scope.challengeQuesAnswers = [{
                'answer': '',
                'question': ''
            }];
            $scope.showQuestionDiv = false;
            $scope.lockFields = false;
            $scope.addButton = false;
            $scope.btnFlag = true;
            $scope.hideCombineFlag = true;
            $scope.beneficiaryOperation = '';
            $scope.contactsModel.errorSpin = false;
            $scope.cancelTransaction = false;
            $scope.contactReadOnly = false;
            $scope.ContDetails = false;
            $scope.toggleDelete = true;
            $scope.backtoDashboard = false;
            $scope.internalBackEnable = false;
            $scope.origin = '';
            $scope.target = '';
            $scope.contactsModel.accountTypeOptions = [{
                'value': 'Select',
                'text': 'Select'
            }, {
                'value': 'SB',
                'text': 'Savings Account'
            }, {
                'value': 'CA',
                'text': 'Current Account'
            }];
            $scope.alert = {
                messages: {
                    ADDED_SUCCESSFULLY: 'You can now transfer money to this person or entity.',
                    MODIFIED_SUCCESSFULLY: 'The beneficiary details have been successfully changed.',
                    DELETED_SUCCESSFULLY: 'The beneficiary has been deleted from your list. ',
                    SAVED_SUCCESSFULLY: 'Contact was saved successfully.',
                    SAVED_ERROR: 'There was an error while saving contact.',
                    SERVICE_UNAVAILABLE: 'Unfortunately, this service is unavailable.'
                }
            };
            $scope.alerts = [];
            $scope.contactFields = [];
            $scope.responsiveRules = [{
                max: 200,
                size: 'tile'
            }, {
                min: 201,
                max: 400,
                size: 'small'
            }, {
                min: 401,
                size: 'large'
            }];
            $scope.contactsModel.disableSelection = false;
            $scope.title = widget.getPreference('title');
            loadBanksList();
            loadCountryCodesList();
            loadContacts();
            bus.subscribe(
                'launchpad-retail.beneficiaryWidgetOpen',
                function() {
                    $timeout(function() {
                        loadContacts();
                    });
                });
            bus.subscribe('launchpad.contacts.load', function() {
                $timeout(function() {
                    loadContacts();
                });
            });
        };
        $scope.confirmDelete = function() {
            $scope.deleteSIAware = {isChecked:false};
            $scope.contactsModel.modalShownDelete = true;
            $scope.btnFlag = true;
            $scope.hideOTPFlag=true;//Fix for CPU-4875 by PwC
        };
        var resetAvailableFormFields = function() {
            $scope.contactFields = [];
            var model = $scope.contactsModel.currentDetails;
            lpCoreUtils.forEach($scope.allContactFields,
                function(field) {
                    var key = field.key;
                    if (!model.hasOwnProperty(key) || model[
                        key] === null) {
                        $scope.contactFields.push(field);
                    }
                });
        };
        $scope.contactChangeView = function(view) {
            if ($scope.contactsModel.moduleState !== view) {
                $scope.contactsModel.moduleState = view;
                if (view === 'contactsEdit' || view ===
                    'contactsAdd') {
                    $scope.btnFlag = true;
                    resetAvailableFormFields();
                }
            }
            $scope.contactsModel.disableSelection = view !==
                'contactsView' ? true : false;
        };
        gadgets.pubsub.subscribe("native.back", function(evt) {
			/** ifsc code search **/
			contactsCtrl.showAddViewBen = true;
            angular.forEach(document.getElementsByClassName(
                "tooltip"), function(e) {
                e.style.display = 'none';
            })
            $scope.cancelFormBack();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if(localStorage.getItem("navigationFlag") || $scope.internalBackEnable) {
                angular.forEach(document.getElementsByClassName(
                "tooltip"), function(e) {
                e.style.display = 'none';
            })
            $scope.cancelFormBack();
            }else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        $scope.checkDailyAddLimit = function() {
            console.log("Add a contact");
            $scope.contactsModel.errorSpin = false; //true
            $scope.ContDetails = true; //true
            $scope.widgetSize = "small";
            $scope.alerts = [];
            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion={};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            $scope.hideQuesFlag = true;
            // RSA changes by Xebia ends
            $scope.addContact();
        };
        $scope.addContact = function() {
            $scope.showBackButton();
            if (!$scope.contactsModel.disableSelection) {
                var self = $scope.contactsModel;
                self.selected = null;
                $scope.copyCurrentContact();
                self.currentContact = {
                    'photoUrl': null,
                    'partyId': '',
                    'id': '',
                    'name': '',
                    'nickName': '',
                    'account': '',
                    'confirmAccount': '',
                    'ifscCode': '',
                    'bankName': self.banksList[0],
                    'branchName': '',
                    'branchAdd': '',
                    'status': '',
                    'accountType': self.accountTypeOptions[
                        0].value,
                    'transferLimit': '',
                    'beneficiaryType': '',
                    'otpValue': '',
                    'countryCode': self.countryCodesList[
                        self.countryCodesList.indexOf(
                            '+91')],
                    'phone': '',
                    'email': '',
                    'creationDate': '',
                    'coolingPeriod': false,
                    isNew: true,
					/** ifsc code search start **/
				    'ifscSearch': {}
					/** ifsc code search end **/						
                };
                self.currentDetails = {
                    'id': ''
                };
                $scope.contactChangeView('contactsAdd');
            }
        };
        var validateDetails = function(model) {
            var valid = true;
            var error;
            $scope.errors = {};
            $scope.paymentLimitErrorMessage = false;
            //commented by lalita 2.5 changes
           /* lpCoreUtils.forEach($scope.allContactFields,
                function(field) {
                    var key = field.key,
                        value = model[key];
                    if (field.validate && value) {
                        error = field.validate(value);
                        if (error) {
                            $scope.errors[key] = error;
                            valid = false;
                        }
                    }
                });*/
            if ($scope.contactsModel.currentContact.account &&
                $scope.contactsModel.currentContact.confirmAccount
            ) {
                error = $scope.validateAccountNumbers($scope.contactsModel
                    .currentContact.account, $scope.contactsModel
                    .currentContact.confirmAccount);
                if (error) {
                    $scope.errors['acntNumber'] = error;
                    valid = false;
                }
            }
            if ($scope.contactsModel.currentContact.ifscCode) {
                error = $scope.validateIFSCCode($scope.contactsModel
                    .currentContact.ifscCode);
                if (error) {
					/** ifsc code search **/
					if(contactsCtrl.ifscValidateErrors['invalidIFSC']){	
					 $scope.errors['ifscError'] = false;	
					 valid = false;
					} else {					
                    $scope.errors['ifscError'] = error;
                    valid = false;
					/** ifsc code search **/
					contactsCtrl.ifscValidateErrors['invalidIFSC'] = false;
					contactsCtrl.savedIfscValidateErrors = false;
					}
                } else {
					if(contactsCtrl.savedIfscValidateErrors || contactsCtrl.ifscValidateErrors['invalidIFSC']){
					 $scope.errors['ifscError'] = false;	
					 valid = false;						
					}
				}
            }
            if ($scope.contactsModel.currentContact.accountType ===
                'Select') {
                error = $scope.validateAccountType();
                if (error) {
                    $scope.errors['accountTypeReq'] = error;
                    valid = false;
                }
            }
               // added by lalita for limit changes
            // validate PayeeLimit
            if ($scope.contactsModel.currentContact.transferLimit) {
            	error = validateLimit($scope.contactsModel.currentContact.transferLimit);
            		if (error) {
            					$scope.errors['transferLimit'] = error;
            					valid = false;
            		}
            }
              // added by lalita for limit changes
            			// validate for 200000 limit
            if ($scope.contactsModel.currentContact.transferLimit) {
            	var error1 = validatePaymentLimit($scope.contactsModel.currentContact.transferLimit);
            	if (error1) {
            					$scope.paymentLimitErrorMessage = true;
            					valid = false;
            				}
            }
            if ($scope.contactsModel.currentContact.bankName ===
                'Select' && $scope.contactsModel.currentContact
                .beneficiaryType === 'OTH') {
                error = $scope.validateBankName();
                if (error) {
                    $scope.errors['bankNameReq'] = error;
                    valid = false;
                }
            }
            if ($scope.contactsModel.currentContact.countryCode ===
                'Select' && $scope.contactsModel.currentDetails
                .phone) {
                if (!($scope.allContactFields[0].validate(model[
                    'phone']))) {
                    error = $scope.validateCountryCode();
                    if (error) {
                        $scope.errors['countryCodeReq'] = error;
                        valid = false;
                    }
                }
            }
			
			/*** ifsc code search start ***/
			if(contactsCtrl.ifscValidateErrors['invalidIFSC']){
				        error = true;
						valid = false;				
			}
			/*** ifsc code search end ***/				
            error = $scope.validateAccountNumberLength($scope.contactsModel
                .currentContact.account);
            if (error) {
                valid = false;
            }
            return valid;
        };
        $scope.validateAccountNumberLength = function(value) {
            $scope.idfcAccountValid = true;
            $scope.idfcAccountMaxLength = true;
            $scope.otherAccountValid = true;
            var error = false;
            if (value) {
                if ($scope.contactsModel.currentContact.beneficiaryType === 'OWN') {
                    if (value.length > idfcConstants.BENEFICIARY_IDFC_ACCOUNT_LENGTH) {
                        $scope.idfcAccountMaxLength = false;
                        error = true;
                    }
                    else {
                        $scope.idfcAccountMaxLength = true;
                    }
                    // if(value.length !== 11) {
                    if (value.length > idfcConstants.BENEFICIARY_IDFC_ACCOUNT_LENGTH) {
                        $scope.idfcAccountValid = false;
                        error = true;
                    }
                    else {
                        $scope.idfcAccountValid = true;
                    }
                } else {
                    if (value.length > idfcConstants.BENEFICIARY_NONIDFC_ACCOUNT_LENGTH) {
                        $scope.otherAccountValid = false;
                        error = true;
                    } else {
                        $scope.otherAccountValid = true;
                    }
                }
            }
            return error;
        };
        $scope.validateAccountNumbers = function(accountNumber1,
            accountNumber2) {
            if (accountNumber1 !== accountNumber2) {
                return true;
            }
            return false;
        };
        $scope.validateIFSCCode = function(ifscCode) {
            var ifscRegex = /[A-Z|a-z]{4}[0][A-Z|a-z|0-9]{6}$/;
            return ifscCode.match(ifscRegex) ? false : true;
        };
        $scope.validateAccountType = function() {
            if ($scope.contactsModel.currentContact.accountType ===
                'Select') {
                return true;
            }
            return false;
        };
        $scope.validateBankName = function() {
            if ($scope.contactsModel.currentContact.bankName ===
                'Select') {
                return true;
            }
            return false;
        };
        $scope.validateCountryCode = function() {
            if ($scope.contactsModel.currentContact.countryCode ===
                'Select' && $scope.contactsModel.currentDetails
                .phone !== '') {
                return true;
            }
            return false;
        };
        $scope.confirmAddContact = function(isFormValid) {
            if (!validateDetails($scope.contactsModel.currentDetails) ||
                !isFormValid) { 
				/** ifsc code search **/
				$scope.formErrors = true;					
                return false;
            } else {
				/** ifsc code search **/
				$scope.formErrors = false;				
                $scope.contactChangeView('contactsAddConfirm');
            }
        };
          // added by lalita for limit changes
           // validate PayeeLimit
         var validateLimit = function(transferLimit)
        	 {
        			if ($scope.contactsModel.currentContact.transferLimit === '0')
        			{
        				return true;
        			}
        			return false;
        	 };
        	   // added by lalita for limit changes
        		// validate limit 200000

        var validatePaymentLimit = function (transferLimit) {
        		console.log("$scope.payeeLimit in validatePaymentLimit ---> "+$scope.payeeLimit);
        		if ($scope.contactsModel.currentContact.transferLimit > parseInt($scope.payeeLimit)) {
        		console.log("In  if ");
        			return true;
        	}else
        		{
        			console.log("In  else ");
        			return false;
        			}
        };
        $scope.confirmEditContact = function(isFormValid) {
            if (!validateDetails($scope.contactsModel.currentDetails) ||
                !isFormValid) {
                return false;
            } else {
                $scope.contactChangeView('contactsEditConfirm');

                //Auto Read OTP SMS start

                //Auto Read OTP SMS end
            }
        };
        $scope.authenticate = function(isFormValid,
            trannsactionName) {
            $scope.toggleDelete = false;
            if (trannsactionName === 'EditBeneficiary' ||
                trannsactionName === 'AddBeneficiary') {
                $scope.submitContact(isFormValid, 'rsa');
            } else if (trannsactionName === 'DeleteBeneficiary') {
                $scope.deleteContact(isFormValid, 'rsa');
            }
        };

        //SMS Reading -- Start

        //To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt){
            console.log (evt.resendOtpFlag);
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.readSMS('resend');

         });

        $scope.readSMS = function(transactionFlag){
            console.log('Read SMS called');
            console.log('Transaction flag->'+transactionFlag);
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if(smsPlugin){
                var isCheckSuccessCallback = function(data) {
                    if(data) {
                        var smsPermissionFlag = data['successFlag'];

                        if(smsPermissionFlag){
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS",{
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "AddressBook"
                            });

                            //Step 2. Send request to "sendOTP service
                            if('resend'===transactionFlag){
                                $scope.generateOTP(transactionFlag);
                            }

                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("AddressBook", function(evt){
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: '+evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver",{
                                    data:"Stop Reading OTP"
                            });

                            //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp'+receivedOtp);
                                $scope.contactsModel.currentContact.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :'+$scope.contactsModel.currentContact.otpValue);
                                if('Add'===transactionFlag){
                                    angular.element('#verifyOTP-btn-add-beneficiary').triggerHandler('click');
                                }else if('Modify'===transactionFlag){
                                    angular.element('#verifyOTP-btn-edit-beneficiary').triggerHandler('click');
                                } else if('Delete'===transactionFlag){
                                    angular.element('#verifyOTP-btn-delete-beneficiary').triggerHandler('click');
                                }



                            });
                        }
                        else{
                            // logic changed after RSA implementation
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            /*if('resend'===transactionFlag){
                                $scope.generateOTP(transactionFlag);
                            }*/
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
            var xhr;
            $scope.alerts = [];
            $scope.contactsModel.errorSpin = true;
            xhr = $scope.contactsModel.generateOTP(value);
            xhr.success(function(data) {
                $scope.contactsModel.errorSpin = false;
                $scope.hideOTPFlag = false;
                $scope.btnFlag = false;
                $scope.success = {
                    happened: true,
                    msg: idfcConstants.OTP_SUCCESS_MESSAGE
                };
                $scope.error = {
                    happened: false,
                    msg: ''
                };
                $scope.customerMob = data.mobileNumber;
                if ((typeof $scope.customerMob !==
                    'undefined') && ($scope.customerMob !==
                    null)) {
                    $scope.customerMobMasked = 'XXXXXX' +
                        $scope.customerMob.substr(
                            $scope.customerMob.length -
                            4);
                }
            }).error(function(data, status, headers, config) {
                $scope.contactsModel.errorSpin = false;
                //added for 5 times otp close popup
                gadgets.pubsub.publish("stopReceiver",{
                    data:"Stop Reading OTP"
                });
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    if (!(data.cd === '701')) {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error');
                    }
                }
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
                $scope.success = {
                    happened: false,
                    msg: ''
                };
            });
        };
        $scope.clearOTP = function() {
            $scope.contactsModel.currentContact.otpValue = '';
        };
        $scope.clearOTPQUES = function() {
            $scope.contactsModel.currentContact.otpValue = '';
            for (var i = 0; i < $scope.challengeQuesAnswers.length; i++) {
                $scope.challengeQuesAnswers[i].answer = '';
            }
        };
        $scope.backtoAdd = function() {
            $scope.contactChangeView('contactsAdd');
        };
        $scope.backtoEdit = function() {
            $scope.contactChangeView('contactsEdit');
        };
        $scope.showBackButton = function() {
            $scope.internalBackEnable = true;
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });
        };
        $scope.selectContact = function(contact) {
            $scope.backtoDashboard = false;
            $scope.showBackButton();
            $scope.ContDetails = true; //true
            $scope.widgetSize = "small";
            $scope.contactsModel.transactionName = 'selectContact';
            $scope.contactsModel.selectContact(contact);
            $scope.contactReadOnly = false;
            $scope.checkCoolingPeriod();
        };

        $scope.checkCoolingPeriod = function() {
            if ($scope.contactsModel.currentContact.coolingPeriod) {
                $scope.contactReadOnly = true;
            } else {
                $scope.contactReadOnly = false;
            }
        };

        $scope.addAlert = function(code, type, timeout) {

            var alert = {
                type: type || 'error',
                msg: $scope.alert.messages[code],
                hideCrossIcon : (code == 'MODIFIED_SUCCESSFULLY')? true: false
            };
            $scope.alerts.push(alert);
            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(
                        alert));
                }, ALERT_TIMEOUT);
            }
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
        var setdeviceprint = function() {
            return encode_deviceprint();
        };
        $scope.submitContact = function(isFormValid, isRSA,
            challengeValue) {
            $scope.alerts = [];
            if (!isFormValid) {
                return false;
            }
            $scope.postDataforVerify = {};
            $scope.postDataforVerify.devicePrint = setdeviceprint();
            // to fetch mobile specific data
           /* gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
                $scope.mobileSdkData = response.data;
            });*/
            $scope.postDataforVerify.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            $scope.postDataforVerify.otpValue = $scope.contactsModel.currentContact.otpValue;

            if ($scope.contactsModel.currentContact.countryCode &&
                ($scope.contactsModel.currentDetails.phone ===
                    '' || !$scope.contactsModel.currentDetails.phone
                )) {
                $scope.contactsModel.currentContact.countryCode =
                    '';
            }
            if (typeof $scope.contactsModel.currentDetails.email !==
                'undefined') {
                $scope.contactsModel.currentContact.email =
                    $scope.contactsModel.currentDetails.email;
            }
            if (typeof $scope.contactsModel.currentDetails.phone !==
                'undefined') {
                $scope.contactsModel.currentContact.phone =
                    $scope.contactsModel.currentDetails.phone;
            }
            var xhr;
            if ($scope.contactsModel.currentContact.isNew) {
                $scope.contactsModel.currentContact.status =
                    'ACTIVE';
                if ($scope.contactsModel.currentContact.beneficiaryType ===
                    'OWN') {
                    $scope.contactsModel.currentContact.bankName =
                        idfcConstants.BENEFICIARY_OWN_BANK_NAME;
                }
                $scope.beneficiaryOperation = 'Add';
                $scope.contactsModel.errorSpin = true;
                xhr = $scope.contactsModel.createContact(
                    isFormValid, isRSA, challengeValue,
                    $scope.postDataforVerify);
            } else {
                $scope.beneficiaryOperation = 'Modify';
                $scope.contactsModel.errorSpin = true;
                xhr = $scope.contactsModel.updateContact(
                    isFormValid, isRSA, challengeValue,
                    $scope.postDataforVerify);
            }
            xhr.success(function(data) {
//                $scope.checkCoolingPeriod();
                if($scope.beneficiaryOperation=='Add')
                    $scope.contactReadOnly = true;
	            gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
                $scope.contactsModel.errorSpin = false;
                $scope.credentialType = data.credentialType;
                console.log('Inside succes >>>>>>>>>>', isRSA);
                if (isRSA === 'rsa') {

                // RSA changes by Xebia starting
                    if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT' ) 
                    {
                            $scope.contactsModel.errorSpin = false;
                            $scope.showDenyMessage = true;
                            $scope.btnFlag = false;
                    }
                    else if(data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED')
                        {
                            $scope.showSetupCQMessage = true;
                            $scope.contactsModel.errorSpin = false;
                            $scope.btnFlag = false;
                        }  
                    else if ( data.actionStatus === 'ALLOW' &&  ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) ) 
                        {
                            $scope.contactsModel.errorSpin = true;
                            $scope.generateOTP("generate");
                            //Automate OTP read
                            $scope.readSMS($scope.beneficiaryOperation);
                        } 
                    else if (data.actionStatus === 'CHALLENGE' && ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) )
                        {
                            var postdata = {};
                            $scope.showCQError=CQService.CHALLENGE_MESSAGE;
                            $scope.challengeQuestionCounter++;
                            $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                            $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                            $scope.hideQuesFlag = false;
                            $scope.btnFlag = false;
                            $scope.showQuestionDiv = true;
                            $scope.hideOTPFlag = true;
                            $scope.hideCombineFlag = true;
                        }
                // RSA changes by Xebia ends
                }
                else {
                    console.log('$scope.beneficiaryOperation modify', $scope.beneficiaryOperation);
                    $scope.contactsModel.currentContact
                        .otpValue = '';

                    $scope.hideQuesFlag = true;
                    $scope.hideCombineFlag = true;
                    $scope.hideOTPFlag = true;
                    $scope.btnFlag = true;
                    $scope.lockfields = false;
                    if ($scope.beneficiaryOperation ===
                        'Modify') {
                        $scope.addAlert(
                            'MODIFIED_SUCCESSFULLY',
                            'success');
                    }
                    $scope.contactsModel.currentContact
                        .isNew = false;
                }

            });
            xhr.error(function(data) {
                $scope.contactsModel.errorSpin = false;
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.cancelTransaction =
                        idfcHanlder.checkOTPError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    if (data.cd !== '02' && data.cd !==
                        '04' && data.cd !== '08' &&
                        data.cd !== '01' && data.cd !==
                        '03' && data.cd !== '05' &&
                        data.cd !== '09' && data.cd !==
                        '99') {
                        $scope.addAlert('cd', 'error',
                            false);
                        $scope.error = {
                            happened: false,
                            msg: ''
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    } else {
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    }
                }
            });
            $scope.OTPFlag = true;
        };

        // showSetupCQ function by Xebia
        $scope.showSetupCQ = function()
        {
            gadgets.pubsub.publish('openCQ');
        }

        // cancel Transaction function by Xebia
        $scope.cancelRSATransaction = function()
        {
            gadgets.pubsub.publish("launchpad-retail.backToDashboard")  
        }

        // verify challenge question answer function by Xebia
        $scope.verifyCQAnswer = function()
        {
            $scope.contactsModel.errorSpin = true;
            var postdata = {
                questionID : $scope.challengeQuestionsId,
                question : $scope.challengeQuestions,
                answer : $scope.challengeQuestion.answer,
                credentialType : 'QUESTION'
            }
            postdata.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            postdata= $.param(postdata);

            var xhr = CQService.verifyRSA(verifyCQAnswerUrl, postdata);
            xhr.success(function(response){
                    if(response.correctlyAnswered)
                    {
                        $scope.contactsModel.errorSpin = true;
                        $scope.hideQuesFlag = true;
                        $scope.showQuestionDiv = false;
                        $scope.showWrongAnswerMessage = false;
                        $scope.generateOTP("generate"); 
                        // Autoread OTP
                        $scope.readSMS($scope.beneficiaryOperation);  
                    }
                    else
                    {
                        if($scope.challengeQuestionCounter <= 2)
                        {
                            $scope.contactsModel.errorSpin = false;
                            $scope.showCQError = CQService.WRONG_CQ_ANSWER;
                            $scope.showWrongAnswerMessage = true;
                            $scope.showQuestionDiv = false;   
                        }
                        else
                        {
                            $scope.contactsModel.errorSpin = false;
                            $scope.showQuestionDiv = false;  
                            $scope.showCQError = CQService.CQ_ANSWER_ATTEMPT_EXCEED;
                        }
                    }
                    
                    
                })
            xhr.error(function (data, status) {
                        $scope.contactsModel.errorSpin = false;
                        if (status == 0) {
                            gadgets.pubsub.publish("no.internet");
                        } else {
                                if (data.cd) {
                                    idfcHanlder.checkTimeout(data);
                                    $scope.serviceError = idfcHanlder.checkGlobalError(
                                        data);
                                    $scope.alert = {
                                        messages: {
                                            cd: data.rsn
                                        }
                                    };
                                            $scope.error = {
                                                happened: true,
                                                msg: data.rsn
                                                };
                                            $scope.success = {
                                                happened: false,
                                                msg: ''
                                                };
                                    }
                            }
                    });

        };

        // fetch challenge question function by Xebia
        $scope.fetchCQ = function()
        {
            $scope.contactsModel.errorSpin = true;
            $scope.challengeQuestion.answer="";
            $scope.showCQError="";
            var postdata = {};
            
            var xhr = CQService.challengeRSA(getChallengeQuestionUrl, postdata);

            xhr.success(function(response){
                $scope.showWrongAnswerMessage = false;
                $scope.challengeQuestionCounter++;
                $scope.challengeQuestionsId = response.challengeQuestionList[0].questionId;
                $scope.challengeQuestions = response.challengeQuestionList[0].questionText;
                $scope.contactsModel.errorSpin = false;
                $scope.hideQuesFlag = false;
                $scope.showQuestionDiv = true;
                $scope.btnFlag = false;
                $scope.hideOTPFlag = true;
                $scope.hideCombineFlag = true;
            })

            xhr.error(function (data, status) {
                $scope.contactsModel.errorSpin = false;
                        if (status == 0) {
                            gadgets.pubsub.publish("no.internet");
                        } else {
                                if (data.cd) {
                                    idfcHanlder.checkTimeout(data);
                                    $scope.serviceError = idfcHanlder.checkGlobalError(
                                        data);
                                    $scope.alert = {
                                        messages: {
                                            cd: data.rsn
                                        }
                                    };
                                            $scope.error = {
                                                happened: true,
                                                msg: data.rsn
                                                };
                                            $scope.success = {
                                                happened: false,
                                                msg: ''
                                                };
                                    }
                            }
                });
        };


        $scope.deleteSIAware = {isChecked:false};
        $scope.reviewtransfer = function(){
            localStorage.clear();
            localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","addressBook");
            gadgets.pubsub.publish("SILoaded");
        }
        $scope.deleteContact = function(isFormValid, isRSA,
            challengeValue) {
            $scope.alerts = [];
            $scope.errorSpin = true;
            if (!isFormValid) {
                $scope.errorSpin = false;
                return false;
            }
            $scope.postDataforVerify = {};
            $scope.postDataforVerify.devicePrint = setdeviceprint();
            // to fetch mobile specific data
           /* gadgets.pubsub.publish("getMobileSdkData");
            gadgets.pubsub.subscribe("putMobileSdkData", function(response) {
                $scope.mobileSdkData = response.data;
            });*/
            $scope.postDataforVerify.mobileSdkData = JSON.stringify($scope.mobileSdkData);
            $scope.postDataforVerify.otpValue = $scope.contactsModel.currentContact.otpValue;
            
            if ($scope.contactsModel.currentContact.countryCode &&
                ($scope.contactsModel.currentDetails.phone ===
                    '' || !$scope.contactsModel.currentDetails.phone
                )) {
                $scope.contactsModel.currentContact.countryCode =
                    '';
            }
            $scope.contactsModel.currentContact.email = $scope.contactsModel
                .currentDetails.email;
            $scope.contactsModel.currentContact.phone = $scope.contactsModel
                .currentDetails.phone;
            var xhr;
            $scope.beneficiaryOperation = 'Delete';
            $scope.contactsModel.errorSpin = true;
            xhr = $scope.contactsModel.deleteContact(isRSA,
                challengeValue, $scope.postDataforVerify);
            xhr.success(function(data) {
	            gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
                $scope.errorSpin = false;
                $scope.contactsModel.errorSpin = false;
                $scope.credentialType = data.credentialType;
                if (isRSA === 'rsa') {

                    // RSA changes by Xebia starts
                        if (data.actionStatus === 'DENY' || data.userStatus === 'DELETE' || data.userStatus === 'LOCKOUT' ) 
                        {
                                $scope.contactsModel.errorSpin = false;
                                $scope.showDenyMessage = true;
                                $scope.btnFlag = false;
                        }
                        else if(data.userStatus === 'UNVERIFIED' || data.userStatus === 'NOTENROLLED')
                            {
                                $scope.showSetupCQMessage = true;
                                $scope.contactsModel.errorSpin = false;
                                $scope.btnFlag = false;
                            }  
                        else if ( data.actionStatus === 'ALLOW' &&  ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) ) 
                            {
                                $scope.contactsModel.errorSpin = true;
                                $scope.generateOTP("generate");
                                //Automate OTP read
                                $scope.readSMS($scope.beneficiaryOperation);
                            } 
                        else if (data.actionStatus === 'CHALLENGE' && ( data.userStatus === 'VERIFIED' || data.userStatus === 'UNLOCKED' ) )
                            {
                                var postdata = {};
                                $scope.showCQError=CQService.CHALLENGE_MESSAGE;
                                $scope.challengeQuestionCounter++;
                                $scope.challengeQuestions = data.challengeQuestionList[0].questionText;
                                $scope.challengeQuestionsId = data.challengeQuestionList[0].questionId;
                                $scope.hideQuesFlag = false;
                                $scope.btnFlag = false;
                                $scope.showQuestionDiv = true;
                                $scope.hideOTPFlag = true;
                                $scope.hideCombineFlag = true;
                            }
                    // RSA changes by Xebia ends

                } else {
                    $scope.hideQuesFlag = true;
                    $scope.hideCombineFlag = true;
                    $scope.hideOTPFlag = true;
                    $scope.btnFlag = true;
                    $scope.lockfields = false;
                    $scope.contactsModel.currentContact
                        .otpValue = '';
                    $scope.contactsModel.modalShownDelete =
                        false;
                    $scope.contactsModel.currentContact
                        .isNew = false;
                    $scope.addAlert(
                        'DELETED_SUCCESSFULLY',
                        'success');
                }
            }).error(function(data) {
                $scope.errorSpin = false;
                $scope.contactsModel.errorSpin = false;
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.cancelTransaction =
                        idfcHanlder.checkOTPError(data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    if (data.cd !== '02' && data.cd !==
                        '04' && data.cd !== '08' &&
                        data.cd !== '01' && data.cd !==
                        '03' && data.cd !== '05' &&
                        data.cd !== '09' && data.cd !==
                        '99') {
                        $scope.addAlert('cd', 'error',
                            false);
                        $scope.error = {
                            happened: false,
                            msg: ''
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    } else {
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    }
                }
            });
            $scope.OTPFlag = true;
        };
        $scope.cancelForm = function() {
            console.log("Module -- ", $scope.contactsModel.moduleState);
            if ($scope.backtoDashboard && $scope.target ===
                'Addressbook' && $scope.contactsModel.moduleState ===
                'contactsView') {
                localStorage.clear();
                gadgets.pubsub.publish(
                    "launchpad-retail.backToDashboard");
            } else if ($scope.contactsModel.moduleState ===
                'contactsAdd') {
                {
                    $scope.contactsModel.currentContact = null;
                    $scope.backToFirstScreen();
	                if ($scope.backtoDashboard) {
                        $scope.showBackButton();
                    } else {
                        gadgets.pubsub.publish("js.back", {
                            data: "ENABLE_HOME"
                        });
                    }
                }
                $scope.contactChangeView('contactsView');
            } else if ($scope.contactsModel.moduleState ===
                'contactsEdit') {
       // to retain split phone number string
       $scope.contactsModel.currentDetails.phone = $scope.contactDataPhone;
                $scope.contactChangeView('contactsView');
                $scope.showBackButton();
                $scope.$apply();
            } else if ($scope.contactsModel.moduleState ===
                'contactsEditConfirm') {
                $scope.contactChangeView('contactsEdit');
                $scope.showBackButton();
                $scope.$apply();
            } else if ($scope.contactsModel.moduleState ===
                'contactsView') {
                $scope.backToFirstScreen();
                if ($scope.origin == 'Dashboard') {
                    $scope.showBackButton();
                    $scope.backtoDashboard = !$scope.backtoDashboard;
                }
            } else if (contactsCtrl.contactsModel.moduleState === 'ifscSearch') {
				/** IFSC code search **/
				contactsCtrl.resetAllIFSCData();
				contactsCtrl.resetAllifscSearchKeys();
		        contactsCtrl.widgetSize = 'large';
				contactChangeView('contactsAdd');
				$scope.contactsModel.disableSelection = false;
				/** IFSC code search **/
			} else {
                $scope.contactChangeView('contactsNone');
            }
            $scope.contactsModel.refreshModel();
        };

        $scope.cancelFormBack = function() {
                    $scope.hideOTPFlag = true;
                    // RSA changes by Xebia start
                    $scope.showSetupCQMessage = false;
                    $scope.showCancelTransactionMessage = false;
                    $scope.challengeQuestion={};
                    $scope.showCQError = "";
                    $scope.challengeQuestionCounter = 0;
                    $scope.showDenyMessage = false;
                    $scope.showWrongAnswerMessage = false;
                    $scope.hideQuesFlag = true;
                    // RSA changes by Xebia ends
                    console.log("Module -- ", $scope.contactsModel.moduleState);
                    if ($scope.backtoDashboard  && ($scope.contactsModel.moduleState ===
                        'contactsView' || $scope.contactsModel.moduleState === 'contactsNone')) {
                        localStorage.clear();
                        gadgets.pubsub.publish(
                            "launchpad-retail.backToDashboard");
                    } else if ($scope.contactsModel.moduleState === 'contactsAddConfirm') {
                        $scope.contactChangeView('contactsAdd');
                        $scope.hideOTPFlag = true;
                        $scope.$apply();
                        gadgets.pubsub.publish("js.back", {
                            data: "ENABLE_BACK",
                        });
                    } else if ($scope.contactsModel.moduleState ===
                        'contactsAdd') {
                        {
                            $scope.contactsModel.currentContact = null;
                            $scope.backToFirstScreen();
                            $scope.contactChangeView('contactsView');
                            if ($scope.backtoDashboard) {
                                $scope.showBackButton();
                            }
                        }
                    } else if ($scope.contactsModel.moduleState ===
                        'contactsEdit') {
                        if ($scope.contactsModel.modalShownDelete) {
                            $scope.contactChangeView('contactsEdit');
                            $scope.showBackButton();
                            $scope.contactsModel.modalShownDelete = false;
                            $scope.$apply();
                        }
       // to retain split phone number string
       $scope.contactsModel.currentDetails.phone = $scope.contactDataPhone;
                        $scope.contactChangeView('contactsView');
                        $scope.showBackButton();
                        $scope.$apply();
                    } else if ($scope.contactsModel.moduleState ===
                        'contactsEditConfirm') {
                        $scope.contactChangeView('contactsEdit');
                        $scope.showBackButton();
                        $scope.$apply();
                    } else if ($scope.contactsModel.moduleState ===
                        'contactsView') {
                        $scope.backToFirstScreen();
                        if ($scope.origin == 'Dashboard') {
                            $scope.showBackButton();
                            $scope.backtoDashboard = !$scope.backtoDashboard;
                        }
                    } else {
                        $scope.contactChangeView('contactsNone');
                    }
                    //$scope.contactsModel.refreshModel();
        };

        $scope.backToFirstScreen = function() {
            $scope.contactsModel.currentContact = null;
            $scope.contactsModel.moduleState = 'contactsView';
            gadgets.pubsub.publish("js.back", {
                                        data: "ENABLE_HOME",
                                    });
            $scope.internalBackEnable = false;
            $scope.widgetSize = "small";
            $scope.$apply();
        };
        $scope.editContact = function() {
            $scope.showBackButton();
            $scope.copyCurrentContact();
            // RSA changes by Xebia start
            $scope.showSetupCQMessage = false;
            $scope.showCancelTransactionMessage = false;
            $scope.challengeQuestion={};
            $scope.showCQError = "";
            $scope.challengeQuestionCounter = 0;
            $scope.showDenyMessage = false;
            $scope.showWrongAnswerMessage = false;
            $scope.hideQuesFlag = true;
            // RSA changes by Xebia ends
            if ($scope.contactsModel.currentDetails.phone) {
       $scope.contactDataPhone = $scope.contactsModel.currentDetails.phone;
                var res = $scope.contactsModel.currentContact.phone
                    .split('-');
                $scope.contactsModel.currentContact.countryCode =
                    res[0];
                $scope.contactsModel.currentDetails.phone = res[
                    1];
      
            } else {
                $scope.contactsModel.currentContact.countryCode =
                    $scope.contactsModel.countryCodesList[0];
            }
            if ($scope.contactsModel.currentContact.ifscCode) {
                $scope.contactsModel.currentContact.beneficiaryType =
                    'OTH';
            } else {
                $scope.contactsModel.currentContact.beneficiaryType =
                    'OWN';
            }
            $scope.contactChangeView('contactsEdit');
        };
        $scope.copyCurrentContact = function() {
            $scope.contactsModel.originalContact = lpCoreUtils.clone(
                $scope.contactsModel.currentContact);
            $scope.contactsModel.originalDetails = lpCoreUtils.clone(
                $scope.contactsModel.currentDetails);
            $scope.contactsModel.originalList = lpCoreUtils.clone(
                $scope.contactsModel.contacts);
        };
        $scope.allContactFields = [{
            'text': 'Phone',
            'key': 'phone',
            validate: function(value) {
                var phoneno = /[0-9]{10}/;
                return value.match(phoneno) ? false :
                    'Mobile Number must have 10 digits';
            }
        }, {
            'text': 'E-mail',
            'key': 'email',
            validate: function(value) {
                var emailRegex =
                    /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                return value.match(emailRegex) ? false :
                    'Enter a valid Beneficiary Email Id';
            }
        }];
        $scope.$watch('contactsModel.moduleState', function(value) {
            if (value) {
                $scope.contactsModel.template =
                    'templates/' + value + '.html';
            }
        });
        $scope.$watch('contactsModel.currentContact.account',
            function(value) {
                $scope.validateAccountNumberLength(value);
            });
        $scope.$watch(
            'contactsModel.currentContact.beneficiaryType',
            function(value) {
                if ($scope.contactsModel.currentContact &&
                    value) {
                    $scope.validateAccountNumberLength($scope.contactsModel
                        .currentContact.account);
                }
            });
        $scope.$watch('contactsModel.currentContact.bankName',
            function(value) {
				/** ifsc code search **/
				if(!localStorage.getItem('addressbookModelData')){ 
					if (value && $scope.contactsModel.currentContact
						.beneficiaryType !== 'OWN') { 
						if ($scope.contactsModel.moduleState !==
							'contactsView') {
							var index = $scope.contactsModel.banksList
								.indexOf(value);
							$scope.contactsModel.currentContact.ifscCode =
								$scope.contactsModel.ifscList[index];
								
								/*** IFSC code search start ***/
									contactsCtrl.storeIFSCcode = $scope.contactsModel.ifscList[index];
									localStorage.setItem('firstFourChars', $scope.contactsModel.ifscList[index]);
								/*** IFSC code search end ***/								
								
						}
						var error = $scope.validateBankName();
						$scope.errors['bankNameReq'] = error;
					}
				}
            });
        $scope.$watch('contactsModel.currentContact.accountType',
            function(value) {
                if (value) {
                    var error = $scope.validateAccountType();
                    $scope.errors['accountTypeReq'] = error;
                }
            });
        $scope.$watch('contactsModel.contacts', function(value) {
            if (value) {
                if (value.length > 0) {
                    $scope.contactsModel.moduleState =
                        'contactsView';
                    if ($scope.waitToLoadContactPromise) {
                        $timeout.cancel($scope.waitToLoadContactPromise);
                    }
                    if ($scope.widgetSize === 'large' &&
                        $scope.contactsModel.transactionName !==
                        'DeleteBeneficiary' && $scope.contactsModel
                        .transactionName !==
                        'EditBeneficiary') {
                        $scope.waitToLoadContactPromise =
                            $timeout(function() {
                                if ($scope.contactsModel
                                    .currentContact &&
                                    $scope.contactsModel
                                    .currentContact.id !==
                                    '') {
                                    $scope.contactsModel
                                        .selectContact(
                                            $scope.contactsModel
                                            .currentContact
                                        );
                                    $scope.checkCoolingPeriod();
                                } else {
                                    $scope.contactsModel
                                        .selectContact(
                                            $scope.contactsModel
                                            .contacts[0]
                                        );
                                    $scope.checkCoolingPeriod();
                                }
                            }, 300);
                    }
                } else {
                    $scope.contactsModel.moduleState =
                        'contactsNone';
                }
            }
        });
        $scope.$watch('search', function(value) {
            $scope.filteredContacts = [];
            if (value) {
                $scope.filter = true;
                var searchString = value.toLowerCase();
                lpCoreUtils.forEach($scope.contactsModel.contacts,
                    function(contact) {
                        var contactName = contact.name.toLowerCase();
                        var accountNumber = contact.account ?
                            contact.account.toLowerCase() :
                            '';
                        if (contactName.indexOf(
                                searchString) !== -1 ||
                            accountNumber.indexOf(
                                searchString) !== -1) {
                            $scope.filteredContacts.push(
                                contact);
                        }
                    });
                if ($scope.widgetSize === 'large') {
                    if ($scope.waitToLoadContactPromise) {
                        $timeout.cancel($scope.waitToLoadContactPromise);
                    }
                    $scope.waitToLoadContactPromise =
                        $timeout(function() {
                            if ($scope.filteredContacts
                                .length) {
                                $scope.selectContact(
                                    $scope.filteredContacts[
                                        0]);
                            }
                        }, 300);
                }
            } else {
                $scope.filter = false;
                if ($scope.contactsModel.contacts && $scope
                    .contactsModel.contacts.length &&
                    $scope.widgetSize === 'large') {
                    $scope.selectContact($scope.contactsModel
                        .contacts[0]);
                }
            }
        }, true);
        widget.addEventListener('preferencesSaved', function() {
            widget.refreshHTML();
            initialize();
        });
        initialize();
        if(localStorage.getItem("navigationFlag")){
            if(localStorage.getItem("origin")=="dashboard"){
                gadgets.pubsub.publish("js.back", {
                                              data: "ENABLE_BACK"
                                              });
                $scope.backtoDashboard =true;
                $scope.origin = "Dashboard";
            }
        }
		
		
		
		/*
		* IFSC code search start
		*/

		var getIFSCBValidUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
		.getPreference('searchIFSC'), {
			servicesPath: lpPortal.root
		});		
		/*contactsCtrl.errors = $scope.errors || {};
		contactsCtrl.errors['invalidIFSC'] = false;*/
		
		
		$scope.$on('resetDataForIfsc', function(eventObj, data){
			contactsCtrl.ifscValidateErrors['invalidIFSC'] = false;
			//$scope.errors['invalidIFSC'] = false;
			//contactsCtrl.bankDetails = {};
			contactsCtrl.disableBank = false;	
			localStorage.setItem('addressbookModelData', '');	
			localStorage.setItem('addressbook_landing_data', '');
		});
		$scope.$on('IFSCdetailsEvent', function(eventObj, data){  console.log(data);
		        /*if(typeof contactsCtrl.dataSelected == 'undefined'){
					contactsCtrl.dataSelected = true;
				}*/
				if(!contactsCtrl.dataSelected){
					console.log("checking service call"+contactsCtrl.dataSelected);
                    contactsCtrl.disableBank = true;
					$scope.contactsModel.errorSpin = true;	
					
					contactsCtrl.qData.startIndex = 0;
					contactsCtrl.qData.limit = 1;
					contactsCtrl.qData.bankName = $scope.contactsModel.currentContact.bankName;
					contactsCtrl.qData.ifscCode = data;
					//contactsCtrl.qData = $.param(contactsCtrl.qData || {});
					console.log('service url ::::::::::::: ', getIFSCBValidUrl);
					$scope.contactsModel.errorSpin = true;
					ifscCodeSearchService
						.setup({
							
							getIFSCBValidUrl: getIFSCBValidUrl,
							data : contactsCtrl.qData
						})
						.getIFSCData()
						.success(function (data) {
		                    console.log(data);
							contactsCtrl.ifscValidateErrors['invalidIFSC'] = false;

							if(data.error){
								contactsCtrl.ifscValidateErrors['invalidIFSC'] = true;
								$scope.errors['ifscError'] = false;
								contactsCtrl.savedIfscValidateErrors = false;
								console.log($scope.contactsModel);
							}else{
							   contactsCtrl.bankDetails = data.data.searchResult[0];
							   contactsCtrl.bankDetails.count = data.data.count;
							   console.log(contactsCtrl.bankDetails);								
							}						   
						}).error(function (data) {
			
							if (data.cd) {
								// If session timed out, redirect to login page
								idfcHanlder.checkTimeout(data);
								// If service not available, set error flag
								contactsCtrl.serviceError = idfcHanlder.checkGlobalError(data);

								contactsCtrl.alert = {
									messages: {
										cd: data.rsn
									}
								};
								$scope.addAlert('cd', 'error', false);
							} else {
								contactsCtrl.alert = {
									messages: {
										//cd: 'Sorry! Our server are not talking to each other'
										 cd: 'Sorry our machines are not talking to each other.Humnas are trying to fix it. Please try after sometime!'
									}
								};
							  $scope.addAlert('cd', 'error', false);								
							}	
							
						}).finally(function(){
							contactsCtrl.disableBank = false;
							$scope.contactsModel.errorSpin = false;
						});					
				}	
		});
		/** not sure link function  **/
		contactsCtrl.goToSearchIFSCpage = function(){	
		  // contactsCtrl.widgetSize = 'small';	  
           $scope.contactsModel.currentContact.ifscSearch.bankName = $scope.contactsModel.currentContact.bankName;  
		   $scope.contactsModel.currentContact.ifscSearch.ifscCode = contactsCtrl.storeIFSCcode;   
		   $scope.contactsModel.currentContact.ifscSearch.ifscCodeError = contactsCtrl.ifscValidateErrors['invalidIFSC'];
		   
		   if(contactsCtrl.ifscValidateErrors['invalidIFSC'])
		   $scope.contactsModel.currentContact.ifscSearch.ifscCodeError = contactsCtrl.ifscValidateErrors['invalidIFSC'];
	       if(contactsCtrl.savedIfscValidateErrors)
		   $scope.contactsModel.currentContact.ifscSearch.ifscCodeError = contactsCtrl.savedIfscValidateErrors;		   
		   
		   
		   $scope.contactsModel.currentContact.ifscSearch.ifscFormErrors = $scope.formErrors;

		   contactsCtrl.searchKeys.bankName = $scope.contactsModel.currentContact.ifscSearch.bankName;
		   contactsCtrl.searchKeys.ifscCode = $scope.contactsModel.currentContact.ifscSearch.ifscCode;
           contactsCtrl.searchKeys.callingWidget = 'launchpad-retail.goToAddPayee';
		   contactsCtrl.searchKeys.pubsubEvent = 'back-to-addressbook';		   
          	 /*contactsCtrl.findBranch(true);
          	 contactsCtrl.initialHit = true;		   
		   contactChangeView('ifscSearch');	*/
		   console.log('called>>>>>>>>>>>>>>>>>>>>>>>>');
                 console.log(contactsCtrl.searchKeys);
		   //var dateset = {'searchKeys':contactsCtrl.searchKeys, 'modelData':contactsCtrl.contactsModel.currentContact};
		   var data=angular.toJson($scope.contactsModel.currentContact);
                 localStorage.setItem('addressbookModelData', data);
				 console.log('set addr model data ::::::::::::::::::::::::::::: ', JSON.stringify(data));
				 var data_for_ifsc_widget=angular.toJson(contactsCtrl.searchKeys);
           localStorage.setItem('ifscformdata', data_for_ifsc_widget);				 
		   gadgets.pubsub.publish('launchpad.ifscSearch', contactsCtrl.searchKeys);
                
		   
		};
		contactsCtrl.setBankDetails = function(){ 
			//var data = ifscCodeSearchService.getBankData($scope.contactsModel.currentContact.ifscSearch.bankData);
			var data = ifscCodeSearchService.getBankData(contactsCtrl.contactsModel.currentContact.ifscSearch.itemIndex);
			contactsCtrl.bankDetails = data;
			contactsCtrl.bankDetails.count = 1;
			contactsCtrl.dataSelected = true;
			$scope.contactsModel.currentContact.ifscCode = data.ifscCode;
			contactsCtrl.cancelForm();
		};
         $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
		
				
    };
});