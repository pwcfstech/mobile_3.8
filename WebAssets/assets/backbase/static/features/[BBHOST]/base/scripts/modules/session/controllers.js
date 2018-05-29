define(function (require, exports, module) {
	'use strict';

	
	var $ = require('jquery');

	function applyScope($scope) {
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	}

	// @ngInject
	exports.NewTransferController = function ($scope, $timeout, lpCoreUtils, lpCoreBus, AccountsModel, ContactsModel, lpWidget, 
											   sharedProperties, transferTypes, httpService, IdfcUtils, IdfcConstants, IdfcError,
											   LauncherDeckRefreshContent) {
		var ctrl = this;
		var widget = lpWidget;
		var partialsDir = lpCoreUtils.getWidgetBaseUrl(widget) + '/templates';
		// Whether to auto save new contacts
		var autoSave = widget.getPreference('autosaveContactsPreference');
		var paymentIntervals = {
			RECURRING: 'RECURRING',
			NON_RECURRING: 'NON_RECURRING'
		};
		ctrl.showError = false;
		ctrl.todaysDate = new Date();
		ctrl.addbenurl = partialsDir + '/' + 'addben.html';
		ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;

		ctrl.poTypeEnum = transferTypes;
		ctrl.radioModel = 'IMPS';

		ctrl.change_Tooltip = function (active_btn) {
			if (active_btn == 'IMPS') {
				ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
			} else if (active_btn == 'NEFT') {
				ctrl.tooltip_msg = IdfcConstants.NEFT_MSG;
			} else if (active_btn == 'RTGS') {
				ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
			}
		};

		ctrl.beneficiaryAccountTypes = [{
			"id": "1",
			"name": "Saving Account"
		}, {
			"id": "2",
			"name": "Current Account"
		}];

		ctrl.changeBeneficiaryBank = function (bank) {
			$scope.paymentOrder.newBeneficiary.bankName = bank;
			if (bank.name === IdfcConstants.IDFC_LTD) {
				$scope.paymentOrder.newBeneficiary.beneficiaryType = 'OWN';
			} else {
				$scope.paymentOrder.newBeneficiary.beneficiaryType = 'OTH';
			}
		};

		ctrl.changeBeneficiaryActype = function (acc) {
			$scope.paymentOrder.newBeneficiary.accType = acc;
		};

		$scope.errors = {};

		$scope.accountsModel = AccountsModel;
		$scope.accountsModelBeneDD=[];
		$scope.accountsModel.setConfig({
			accountsEndpoint: widget.getPreference('accountsDataSrc')
		});
		$scope.contactsModel = new ContactsModel({
			contacts: lpCoreUtils.resolvePortalPlaceholders(widget
				.getPreference('contactListDataSrc')),
			contactData: lpCoreUtils.resolvePortalPlaceholders(widget
				.getPreference('contactDataSrc')),
			contactDetails: lpCoreUtils.resolvePortalPlaceholders(widget
				.getPreference('contactDetailsDataSrc'))

		});

		function showJquery() {
			$("#transferMode").show();
			$("#benBankLabel").show();
			$("#benBank").show();
			$("#benBankError").show();
		}

		function hideJquery() {
			hideTransferMode();
			$("#benBank").hide();
			$("#benBankLabel").hide();
			$("#benBankError").hide();
		}

		function hideTransferMode() {
			$("#transferMode").hide();
		}

		function hiddenTransferMode() {
			return !($('#transferMode').is(':hidden'));;
		}

		$scope
			.$watch(
				'paymentOrder.newBeneficiary.bankName',
				function (value) {
					if (value) {
						if ($scope.contactsModel.moduleState !== 'contactsView') {
							var index = $scope.bankNames.indexOf(value);
							$scope.paymentOrder.newBeneficiary.ifsc = $scope.ifscCodeList[index];
						}

					}
				});

		//added this watch for one time benefeciary Outside IDFC bank
		$scope
			.$watch(
				"paymentOrder.newBeneficiary.beneficiaryType",
				function (newValue, oldValue) {
					if (newValue !== null && newValue.toUpperCase() === "OTH") {
						if ($scope.paymentOrder.instructedAmount < IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
							$scope.impsAmtValidationflag = false;
							ctrl.radioModel = 'IMPS';
							ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
							$scope.rtgsAmtValidationflag = true;
						} else if ($scope.paymentOrder.instructedAmount > IdfcConstants.FT_RTGS_AMOUNT_LIMIT) {
							$scope.impsAmtValidationflag = true;
							ctrl.radioModel = 'RTGS';
							ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
						} else if ($scope.paymentOrder.instructedAmount == IdfcConstants.FT_RTGS_AMOUNT_LIMIT) {
							$scope.impsAmtValidationflag = false;
							ctrl.radioModel = 'IMPS';	
							ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
						}
						showJquery();
						$scope.paymentOrder.counterpartyName = "";
						$scope.paymentOrder.counterpartyIban = "";
					} else {
						hideJquery();
						$scope.paymentOrder.counterpartyName = "";
						$scope.paymentOrder.counterpartyIban = "";
						$scope.paymentOrder.newBeneficiary.ifsc = "";
					}
				}, true);

		//added this watch for date if selected than current then disable IMPS
		$scope
			.$watch(
				"paymentOrder.scheduleDate",
				function (newValue, oldValue) {
					var today = new Date();
					var isTranferMode = hiddenTransferMode();
					$scope.errorsBenCreationFutureTrans["benCreationFutureTransError"] = false;
					if ($scope.paymentOrder.scheduleDate > today && $scope.paymentOrder.instructedAmount < IdfcConstants.FT_IMPS_AMOUNT_LIMIT &&
						isTranferMode) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'NEFT';
						ctrl.tooltip_msg = IdfcConstants.NEFT_MSG;
					} else if ($scope.paymentOrder.scheduleDate > today && 
							   $scope.paymentOrder.instructedAmount > IdfcConstants.FT_RTGS_AMOUNT_LIMIT && isTranferMode) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'RTGS';
						ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
					} else if ($scope.paymentOrder.scheduleDate <= today &&
							   $scope.paymentOrder.instructedAmount < IdfcConstants.FT_IMPS_AMOUNT_LIMIT && isTranferMode) {
						$scope.impsAmtValidationflag = false;
						$scope.rtgsAmtValidationflag = true;
						ctrl.radioModel = 'IMPS';
						ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
					} else if ($scope.paymentOrder.scheduleDate > today &&
							   $scope.paymentOrder.instructedAmount == IdfcConstants.FT_IMPS_AMOUNT_LIMIT && isTranferMode) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'RTGS';
						ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
					} else if ($scope.paymentOrder.scheduleDate <= today &&
							   $scope.paymentOrder.instructedAmount == IdfcConstants.FT_IMPS_AMOUNT_LIMIT && isTranferMode) {
						$scope.impsAmtValidationflag = false;
						ctrl.radioModel = 'IMPS';
						ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
					}
					if ($scope.paymentOrder.scheduleDate > today) {
						$scope.hideBeneTabOneTime = true;
						$scope.activeTransferTab.newBeneficiary = false;
					} else {

						$scope.hideBeneTabOneTime = false;
					}

				}, true);

		//added watch on Payee Name
		$scope
			.$watch(
				"paymentOrder.counterpartyName",
				function (newValue, oldValue) {
					var today = new Date();
					var isTranferMode = hiddenTransferMode();
					if (isTranferMode) {
						hideTransferMode();
					}
					$scope.errorsBenCreationFutureTrans["benCreationFutureTransError"] = false;
					if ($scope.paymentOrder.scheduleDate > today &&
						$scope.paymentOrder.instructedAmount <= IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'NEFT';
					} else if ($scope.paymentOrder.scheduleDate > today &&
							   $scope.paymentOrder.instructedAmount > IdfcConstants.FT_RTGS_AMOUNT_LIMIT) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'RTGS';
					} else if ($scope.paymentOrder.scheduleDate <= today &&
							   $scope.paymentOrder.instructedAmount < IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
						$scope.impsAmtValidationflag = false;
						$scope.rtgsAmtValidationflag = true;
						ctrl.radioModel = 'IMPS';
					} else if ($scope.paymentOrder.scheduleDate <= today &&
							   $scope.paymentOrder.instructedAmount == IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
						$scope.impsAmtValidationflag = false;
						$scope.rtgsAmtValidationflag = false;
						ctrl.radioModel = 'IMPS';
					} else if ($scope.paymentOrder.scheduleDate > today) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'NEFT';
					}
					if ($scope.paymentOrder.isScheduledTransfer && 
						$scope.paymentOrder.instructedAmount < IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
						$scope.impsAmtValidationflag = true;
						$scope.rtgsAmtValidationflag = true;
						ctrl.radioModel = 'NEFT';
					} else if ($scope.paymentOrder.isScheduledTransfer &&
							   $scope.paymentOrder.instructedAmount > IdfcConstants.FT_RTGS_AMOUNT_LIMIT) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'RTGS';
					} else if ($scope.paymentOrder.isScheduledTransfer &&
							   $scope.paymentOrder.instructedAmount == IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'RTGS';
					} else if ($scope.paymentOrder.isScheduledTransfer) {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'NEFT';
					}
				}, true);

		//added this watch for enabling/disabling transfer mode
		$scope.$watch("activeTransferTab.newBeneficiary", function (newValue,
			oldValue) {
			if (newValue) {
				var isTranferMode = hiddenTransferMode();
				$scope.paymentOrder.newBeneficiary.beneficiaryType = null;
				if (isTranferMode) {
					hideTransferMode();
				}
			}
			$scope.submitFlag = false;

		}, true);

		//added this watch to check the daily added benefeciary Nos
		$scope.$watch("paymentOrder.saveContact", function (newValue, oldValue) {
			if (newValue) {
				getDailyAddedBeneFiciaryCount();
			} else {
				$scope.BeneAdderror = {
					happened: false
				}
			}

		}, true);

		//---------------------------Validating Amount-------------------------------------//
		$scope.$watch("paymentOrder.instructedAmount", function (newValue,
			oldValue) {
			var today = new Date();
			var isTranferMode = hiddenTransferMode();
			if (!$scope.paymentOrder.update) {
				$scope.amountLimitFlag = false;
				$scope.amountIntLimitFlag = false;
				$scope.errorsAmt["amountLessThanOne"] = false;
				validateAmount();
				if (newValue > IdfcConstants.FT_RTGS_AMOUNT_LIMIT) {
					ctrl.radioModel = 'RTGS';
					$scope.impsAmtValidationflag = true;
					$scope.rtgsAmtValidationflag = false;
					ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
				}
				if (newValue < IdfcConstants.FT_IMPS_AMOUNT_LIMIT && $scope.paymentOrder.scheduleDate <= today && isTranferMode &&
					!$scope.toggleTabs.scheduled) {
					ctrl.radioModel = 'IMPS';
					$scope.impsAmtValidationflag = false;
					$scope.rtgsAmtValidationflag = true;
					ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
				} else if (newValue < IdfcConstants.FT_IMPS_AMOUNT_LIMIT && $scope.paymentOrder.scheduleDate > today && isTranferMode) {
					ctrl.radioModel = 'NEFT';
					$scope.impsAmtValidationflag = true;
					$scope.rtgsAmtValidationflag = true;
					ctrl.tooltip_msg = NEFT_MSG;
				} else if (newValue < IdfcConstants.FT_IMPS_AMOUNT_LIMIT && isTranferMode && $scope.toggleTabs.scheduled) {
					ctrl.radioModel = 'NEFT';
					$scope.impsAmtValidationflag = true;
					$scope.rtgsAmtValidationflag = true;
					ctrl.tooltip_msg = IdfcConstants.NEFT_MSG;
				} else if (newValue > IdfcConstants.FT_RTGS_AMOUNT_LIMIT && isTranferMode && $scope.toggleTabs.scheduled) {
					ctrl.radioModel = 'RTGS';
					$scope.impsAmtValidationflag = true;
					$scope.rtgsAmtValidationflag = false;
					ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
				} else if (newValue == IdfcConstants.FT_IMPS_AMOUNT_LIMIT && $scope.paymentOrder.scheduleDate <= today && isTranferMode &&
						   !$scope.toggleTabs.scheduled) {
					ctrl.radioModel = 'IMPS';
					$scope.impsAmtValidationflag = false;
					$scope.rtgsAmtValidationflag = false;
					ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
				} else if (newValue == IdfcConstants.FT_IMPS_AMOUNT_LIMIT && $scope.paymentOrder.scheduleDate > today && isTranferMode) {
					ctrl.radioModel = 'IMPS';
					$scope.impsAmtValidationflag = false;
					$scope.rtgsAmtValidationflag = false;
					ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
				} else if (newValue == IdfcConstants.FT_IMPS_AMOUNT_LIMIT && isTranferMode && $scope.toggleTabs.scheduled) {
					ctrl.radioModel = 'RTGS';
					$scope.impsAmtValidationflag = true;
					$scope.rtgsAmtValidationflag = false;
					ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
				}
			}
		}, true);

		$scope.selectAccount = function (params) {
			if (!$scope.accountsModel.accounts) {
				return;
			}
			if ($scope.accountsModel.accounts.length == 0) {
				ctrl.loading = true;
				var promise = $scope.accountsModel.load();
				promise.then(function () {
					ctrl.loading = false;
					$.each($scope.accountsModel.accounts, function (index,
						account) {
						if (params.accountId === account.id) {
							$scope.accountsModel.selected = account;
						}
					});
				});
				
			} else { //added code lp13 migration
				$.each($scope.accountsModel.accounts, function (index, account) {
					if (!(angular.isUndefined(params)) && params.accountId === account.id) {
						$scope.accountsModel.selected = account;
					}
				});
			}

			applyScope($scope);
			sharedProperties.setProperty($scope.accountsModel.selected.id);
		};

		//Load accounts and select first account as default account
		function loadAccounts() {

			var promise = $scope.accountsModel.load();
			promise
				.then(function () {
					
					$scope.accountsModelBeneDD = $scope.accountsModel;		
			 		
				   var accountsList=$scope.accountsModel.accounts;		
				   var accountsListNew =Array();		
				   var j=0;		
				   for(var i=0; i<accountsList.length; i++)		
				   {		
					  if ( !(null!= accountsList[i].modeOfOperation && (accountsList[i].modeOfOperation === "JOINTLY BY ALL" || accountsList[i].modeOfOperation === "ANY TWO" || accountsList[i].modeOfOperation === "BOTH OR SURVIVOR" || accountsList[i].modeOfOperation === "FORMER OR SURVIVOR" )))				
							{		
							accountsListNew[j++] = accountsList[i];		
							}		
				   }		
			       		
                		
				if(0==accountsListNew.length)		
				{		
					$scope.tranferAllowed=false;		
					ctrl.loading = false;		
				}else{		
					$scope.accountsModelBeneDD.accounts =accountsListNew;		
				
					
				/*added by Megha - producion patch 22.06.2016 - end*/
					
					
					if (!$scope.accountsModel.selected && $scope.accountsModel.accounts && $scope.accountsModel.accounts.length > 0) {
						$scope.accountsModel.selected = $scope.accountsModel
							.findByAccountNumber(widget
								.getPreferenceFromParents('defaultAccount')) || $scope.accountsModel.accounts[0];
					}

					//now safe to listen for account Select message
					lpCoreBus.subscribe('launchpad-retail.accountSelected',
						$scope.selectAccount);
					//calling to load limit of user
					sharedProperties
						.setProperty($scope.accountsModel.selected.id);

					ctrl.loading = false;
				}
				})['catch']
				(function (error) {
					ctrl.loading = false;
					if (!angular.isUndefined(error.data) && error.data.cd) {
						// If session timed out, redirect to login page
						IdfcError.checkTimeout(error.data);
						// If service not available, set error flag
						$scope.globalerror = IdfcError
							.checkGlobalError(error.data);

						$scope.error = {
							happened: true,
							msg: error.data.rsn
						};

					}
				});

		}

		var showBlackout = function () {

            var blackout = lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('blackout'));

            var res;
			var postData = {
				'transaction': 'FundTransfer',
			};
            var data1 = $.param(postData || {});
            res = $http({
                method: 'POST',
                url: blackout,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            res.success(function (data1, status, headers, config) {

            });
            res.error(function (error, status, headers, config) {
                    if(error.cd==="BLACKOUT_404"){
						lpCoreBus.publish('blackoutServiceRequest', {
						errorMsg: error.rsn
						});
					}
					
                }
            );
        };
		var initialize = function () {
		showBlackout();
			ctrl.loading = true;
			$scope.globalerror = false;
			$scope.initCalled = true;
			//added for errorsBenCreationFutureTrans t+t2 validation
			$scope.errorsBenCreationFutureTrans = {};
			//added for beneficiary limit validation
			$scope.errorsBenAmountLimit = {};
			$scope.errorsAmt = {};
			$scope.errors = {};
			$scope.error = {};
			//added for same From - To Account validation
			$scope.errorsSameFromToAccount = {};
			$scope.errorsAmt["amountLessThanOne"] = false;
			$(".whole-amount-input").val('');
            $(".decimal-amount-input").val('');
            $('.description-newtransfer').val('');
			$scope.tranferAllowed=true;
			$scope.dateOptions = {
				'show-button-bar': false,
				'show-weeks': false
			};
			limitManage();
			getBankList();
			$scope.formsubmitted =  false;

			$scope.contactsModel.loadContacts().success(function () {
				loadAccounts();
			}).error(
				function (data) {
					loadAccounts();
					/*
					 * in case of beneficiary error only handling cbs down
					 * and service error because in case of error use can go
					 * for one time beneficiary
					 */
					if (data.cd == "999" || data.cd == "99" || data.cd == "545" || data.cd == "501") {
						// If session timed out, redirect to login page
						IdfcError.checkTimeout(data);
						// If service not available, set error flag
						$scope.globalerror = IdfcError
							.checkGlobalError(data);

						$scope.error = {
							happened: true,
							msg: data.rsn
						};

					}
				});

			resetModel();

			$scope.toggleTabs = {
				oneTime: $scope.paymentOrder.isScheduledTransfer ? false : true,
				scheduled: $scope.paymentOrder.isScheduledTransfer ? true : false
			};

			$scope.paymentOrder.updateOneTime = true;
			$scope.paymentOrder.updateScheduled = true;

			$scope.activeTransferTab = {
				bank: true,
				newBeneficiary: false
			};
			$scope.paymentOrderForm= {
				submitted: false
			}
									
			// UPDATE: if we want to update a transfer order
			lpCoreBus
				.subscribe(
					'lpMoneyTransfer.update',
					function (form) {
						ctrl.loading = true;
						$scope.errors["benLimit"] = false;
						$scope.limitFlag = false;
						$scope.amountLimitFlag = false;
						$scope.amountIntLimitFlag = false;
						$scope.errorsNewBen = {};
						$scope.errorsSameFromToAccount['sameFromToAccountError'] = false;
						$scope.errors = {};
						$scope.errorsBenCreationFutureTrans["benCreationFutureTransError"] = false;
						$scope.errorsAmt["amountLessThanOne"] = false;

						setActiveTransferTabs();
						$scope.errorsBenAmountLimit["amountGreaterThanBenLimit"] = false;
						//console.log("form.."+form);
						if(angular.isUndefined(form)){
							$scope.resetForm();
						}else{
							$scope.paymentOrder = form;
						$scope.paymentOrder.type = ctrl.poTypeEnum.bank;
						if ($scope.paymentOrder.update && ($scope.paymentOrder.counterpartyName.indexOf("Own Accounts") === -1)) {
							$scope
								.getBeneficiaryDetailsById($scope.paymentOrder.details.beneId);
						}
						$scope.paymentOrder.updateOneTime = true;
						$scope.paymentOrder.updateScheduled = true;
						if ($scope.paymentOrder.isScheduledTransfer) {
							$scope.toggleTabs.scheduled = true;
							$scope.paymentOrder.updateOneTime = false;
							$scope.paymentOrder.updateScheduled = true;
						} else {
							$scope.toggleTabs.oneTime = true;
							$scope.paymentOrder.updateOneTime = true;
							$scope.paymentOrder.updateScheduled = false;
						}
						}
						
						
						$timeout(function () {
							ctrl.loading = false;
						}, 1000);
						$timeout(function () {
							$scope.selectAccount(form);
						});
					});

			applyScope($scope);
		};

		//is the recipient a new contact?
		var isNewContact = function () {
			if ($scope.contactsModel
				.findByName($scope.paymentOrder.counterpartyName)) {
				return false;
			}
			return (!$scope.paymentOrder.selectedCounter || $scope.paymentOrder.selectedCounter.name !== $scope.paymentOrder.counterpartyName ||
					$scope.paymentOrder.selectedCounter.account !== $scope.paymentOrder.counterpartyIban);
		};

		// Create a contact if this user's preference
		function createContact() {
			var contact = {
				name: $scope.paymentOrder.counterpartyName
			};

			if ($scope.paymentOrder.type === ctrl.poTypeEnum.bank) {
				contact.account = $scope.usTransfer ? $scope.paymentOrder.counterpartyAccount : $scope.paymentOrder.counterpartyIban;
			}

			$scope.contactsModel.currentContact = contact;

			$scope.contactsModel.createCounterParty(true);
			lpCoreBus.publish('launchpad.contacts.load');
		};

		//reset the payment order model
		var resetModel = function () {
			//fix to reset isScheduledTransfer to correct value
			var scheduledTransfer = $scope.paymentOrder ? $scope.paymentOrder.isScheduledTransfer : false;

			$scope.paymentOrder = {
				update: false,
				dateAllOptions: [{
					id: 'today',
					label: 'Transfer today'
				}, {
					id: 'date',
					label: 'Scheduled transfer'
				}],
				dateOptions: 'today',
				isScheduledTransfer: scheduledTransfer,
				scheduledTransfer: {
					frequency: '',
					every: 1,
					intervals: [],
					startDate: new Date(),
					endDate: new Date(),
					timesToRepeat: 1
				},
				oneTimeSchd: false,
				scheduleDate: new Date(),
				isOpenDate: false,
				instructedCurrency: '',
				counterpartyIban: '',
				counterpartyAccount: '',
				counterpartyEmail: '',
				counterpartyAddress: '',
				//----------------------Amt datatype changed from String to Int---------------//
				instructedAmount: 0,
				paymentReference: '',
				paymentDescription: '',
				counterpartyName: '',
				date: '',
				saveContact: autoSave === '' ? false : lpCoreUtils
					.parseBoolean(autoSave),
				type: ctrl.poTypeEnum.bank,
				dirty: false,
				// Added new fields in paymentorder model - ifscCode, txnMode
				ifscCode: '',
				txnMode: 'IFT',
				newBeneficiary: {
					bankName: "",
					ifsc: "",
					address: "",
					mobile: "",
					name: '',
					nickname: '',
					account: '',
					confirmAccount: '',
					accType: "",
					limit: '',
					validity: '',
					email: '',
					'otp': '',
					isNew: false,
					beneficiaryType: ''

				},
				// Added new fields in paymentorder model for edit service 
				desc: '',
				startDate: '',
				endDate: '',
				beneName: '',
				beneId: '',
				accountId: '',
				intervals: '',
				frequency: '',
				creationDate: '',
				toAcctComnt: '',
				instructedCurrency2: '',
				sys1: '',
				id: '',
				chaseDay: '',
				action: '',
				priority: '',
				purpose: '',
				hldReqdYN: '',
				paymntTyp: '',
				fnlPmt: '',
				intrnRefNum: '',
				usrId: '',
				cal: '',
				uniqRefNum: '',
				counterpartySirName: '',
				andOrInstBsbNo: '',
				pmtNum: '',
				msgTyp: '',
				opertnMode: '',
				rmtTyp: '',
				benLimit: '',
				transferMode: '',
				updateScheduled: true,
				updateOneTime: true

			};
		};

		//set which transfer tab is currently active
		var setActiveTransferTabs = function () {
			//set all tabs active to false
			for (var tab in $scope.activeTransferTab) {
				if ($scope.activeTransferTab.hasOwnProperty(tab)) {
					$scope.activeTransferTab[tab] = false;
				}
			}

			var found = false;

			for (var item in ctrl.poTypeEnum) {
				if (ctrl.poTypeEnum.hasOwnProperty(item)) {
					if (ctrl.poTypeEnum[item] === $scope.paymentOrder.type) {
						$scope.activeTransferTab[item] = true;
						found = true;
					}
				}
			}

			if (!found) {
				$scope.activeTransferTab.bank = true;
			}
		};

		//broadcaste a message for child scopes to reset their properties
		var resetChildScopes = function () {
			$scope.paymentOrder.isScheduledTransfer = false;
			$scope.toggleTabs.oneTime = true;
			$scope.toggleTabs.scheduled = false;
			$scope.paymentOrder.updateScheduled = true;
			$scope.paymentOrder.updateOneTime = true;
		};

		//build the payment order with details needed for a bank transaction
		var buildBankPaymentOrder = function (paymentOrder) {
			var isTranferMode = !(hiddenTransferMode());
			// ------------------------Removing IBAN condition ----------------------//
			paymentOrder.type = ctrl.poTypeEnum.bank;
			// ----------------------Setting CounterPartyAccountId--------------------//

			paymentOrder.counterpartyAccount = $scope.paymentOrder.counterpartyIban;

			// ----------------------Setting CounterPartyAccountId--------------------//
			paymentOrder.ifscCode = $scope.paymentOrder.ifscCode;

			// ----------------------Setting transferType--------------------//
			if (isTranferMode) {
				paymentOrder.txnMode = "IFT";
			} else {
				paymentOrder.txnMode = ctrl.radioModel;
			}

			if ($scope.paymentOrder.paymentDescription !== '') {
				paymentOrder.paymentDescription = $scope.paymentOrder.paymentDescription;
			}

			paymentOrder.newBeneficiary = $scope.paymentOrder.newBeneficiary;

			if (paymentOrder.counterpartyAccount == '') {

				paymentOrder.counterpartyAccount = paymentOrder.newBeneficiary.account;
			}

			//handle scheduled transfer
			if ($scope.paymentOrder.isScheduledTransfer) {
				paymentOrder.scheduledTransfer = {};

				//add relevent scheduledTransfer fields
				paymentOrder.scheduledTransfer.frequency = $scope.paymentOrder.scheduledTransfer.frequency;
				paymentOrder.scheduledTransfer.every = $scope.paymentOrder.scheduledTransfer.every;

				//send array as comma-delimited string to the backend service (due to issue with camel mashup)
				paymentOrder.scheduledTransfer.intervals = $scope.paymentOrder.scheduledTransfer.intervals
					.join(',');
				paymentOrder.scheduledTransfer.startDate = +(new Date(
					$scope.paymentOrder.scheduledTransfer.startDate));
				paymentOrder.scheduledTransfer.endDate = +(new Date(
					$scope.paymentOrder.scheduledTransfer.endDate));
				paymentOrder.paymentMode = paymentIntervals.RECURRING;
				if (isTranferMode) {
					paymentOrder.txnMode = "STO";
				} else {
					paymentOrder.txnMode = ctrl.radioModel;
				}
				paymentOrder.oneTimeSchd = false;
			} else {
				paymentOrder.onDate = +(new Date(
					$scope.paymentOrder.scheduleDate));
				if ($scope.paymentOrder.scheduleDate > new Date() && !isTranferMode) {
					paymentOrder.scheduledTransfer = {};
					paymentOrder.paymentMode = paymentIntervals.RECURRING;
					paymentOrder.scheduledTransfer.startDate = +(new Date(
						$scope.paymentOrder.scheduleDate));
					paymentOrder.scheduledTransfer.endDate = +(new Date(
						$scope.paymentOrder.scheduleDate));
					paymentOrder.oneTimeSchd = true;
				} else {
					paymentOrder.scheduledTransfer = {};
					paymentOrder.paymentMode = paymentIntervals.NON_RECURRING;
					paymentOrder.scheduledTransfer.startDate = null;
					paymentOrder.scheduledTransfer.endDate = null;
					paymentOrder.oneTimeSchd = false;
				}
			}

			return paymentOrder;
		};

		/**
		 * Scope functions
		 */

		$scope.openCalendar = function ($event) {
			//open calendar on click event or "enter" and "space" key press events
			if ($event.type === 'click' || $event.which === 32 || $event.which === 13) {
				$event.preventDefault();
				$event.stopPropagation();

				$scope.paymentOrder.isOpenDate = true;
			}
		};

		//sets the payment orders transfer type
		$scope.setPaymentOrderType = function (paymentOrderType) {
			$scope.paymentOrder.type = paymentOrderType;
		};

		$scope.submitForm = function (event, update) {
			if (update) {
				submitUpdate(event);
			} else {
				var xhr;
				var isTranferMode = hiddenTransferMode();
				$scope.submitFlag = true;
				var id = $('#benId').html();
				var counterpartyIFSCCode = $('#counterpartyIFSCCode').html();
				var counterpartyLimit = $('#counterpartyLimit').html();
				$scope.counterpartyLimitSet = counterpartyLimit;

				var counterpartycreationDate = $('#counterpartycreationDate')
					.html();
				if (counterpartyIFSCCode) {
					$scope.paymentOrder.ifscCode = counterpartyIFSCCode;
				}

				event.preventDefault();
				var processPaymentOrder = true;
				$scope.paymentOrderForm.submitted = true;

				//Beneficiary limit validation start here
				$scope.fromAccountLienFlag = false;
				$scope.errors["benLimit"] = false;
				$scope.limitFlag = false;
				$scope.amountLimitFlag = false;
				$scope.amountIntLimitFlag = false;
				$scope.errorsNewBen = {};
				$scope.errorsSameFromToAccount['sameFromToAccountError'] = false;
				$scope.errors = {};
				$scope.errorsBenCreationFutureTrans["benCreationFutureTransError"] = false;
				$scope.errorsAmt["amountLessThanOne"] = false;
				var fromAccountValid = true;
				var eightDigitCheck = true;
				var eightDigitInternalCheck = true;
				fromAccountValid = validateAccountLienAndDormant(
					$scope.accountsModel.selected.holdBalance,
					$scope.accountsModel.selected.status);
				if (!fromAccountValid) {
					return false;
				}
				if (isTranferMode) {
					eightDigitCheck = validateEightDigitLimit();

					if (!eightDigitCheck) {
						return false;
					}
				} else {
					eightDigitInternalCheck = validateEightDigitInternalLimit();

					if (!eightDigitInternalCheck) {
						return false;
					}
				}
				var isValid = true;
				var fromToAccountValid = true;
				var dailyLimitCheck = true;

				dailyLimitCheck = validateDailyLimit();
				if (!dailyLimitCheck) {
					return false;
				}
				if ($scope.activeTransferTab.newBeneficiary) {
					$scope.errorsNewBen = null;
					isValid = checkNewBenValidation();
					fromToAccountValid = validateFromToAccountNo($scope.paymentOrder.newBeneficiary.account);

					if (!isValid || !fromToAccountValid || !dailyLimitCheck) {
						return false;
					}
					var validamount1 = validateAmount();
					if (!validamount1) {
						return false;
					}

				} else {
					var valid = true;
					var valid_futureTrans = true;
					if ($scope.paymentOrder.counterpartyName != "Own Accounts") {
						valid = validateCounterPartyLimit(counterpartyLimit,
							counterpartycreationDate,
							$scope.paymentOrder.instructedAmount);
						valid_futureTrans = validateCounterPartyForFutureTransaction(
							counterpartyLimit, counterpartycreationDate,
							$scope.paymentOrder.instructedAmount);
					}
					var validamount = validateAmount();
					fromToAccountValid = validateFromToAccountNo($scope.paymentOrder.counterpartyIban);
					if (!valid || !valid_futureTrans || !validamount || !fromToAccountValid) {
						return false;
					}
				}

				// commenting Form Validations - Required to be uncommented  soon//
				if ($scope.paymentOrderForm.$invalid) {
					$scope.$broadcast('lp.retail.new-transfer.errors');
					return false;
				}

				var paymentOrder = {},
					selectedAccount = $scope.accountsModel.selected;

				//add relevent fields to payment order object
				if ($scope.paymentOrder.counterpartyName && $scope.paymentOrder.counterpartyName != "") {
					paymentOrder.counterpartyName = $scope.paymentOrder.counterpartyName;
				} else if ($scope.paymentOrder.newBeneficiary.accName && $scope.paymentOrder.newBeneficiary.accName != "") {
					paymentOrder.counterpartyName = $scope.paymentOrder.newBeneficiary.accName;
				} else {
					paymentOrder.counterpartyName = "";
				}
				paymentOrder.instructedAmount = $scope.paymentOrder.instructedAmount;
				paymentOrder.instructedCurrency = $scope.paymentOrder.instructedCurrency;
				// emudra code
				paymentOrder.flag = false;
				if ($scope.paymentOrder.saveContact && $scope.activeTransferTab.newBeneficiary) {
					$scope.paymentOrder.newBeneficiary.isNew = true;
					paymentOrder.isNew = $scope.paymentOrder.newBeneficiary.isNew;
				}
				//setting one time limit for one time transaction
				if ($scope.toggleTabs.oneTime) {
					paymentOrder.limit = $scope.limit.amount;
				}
				// Adding CounterpartyAcct details
				if ($scope.activeTransferTab.newBeneficiary) {
					paymentOrder.counterpartyAccount = $scope.paymentOrder.newBeneficiary.account;
				} else {

					paymentOrder.counterpartyAccount = $scope.paymentOrder.counterpartyAccount;
					$scope.paymentOrder.newBeneficiary = null;
				}
				//if for some reason the instructed currency has been set blank it defaults to account default
				if (paymentOrder.instructedCurrency === "") {
					paymentOrder.instructedCurrency = selectedAccount.currency;
				}
				paymentOrder.accountId = selectedAccount.id;
				paymentOrder.accountName = selectedAccount.alias;
				paymentOrder = buildBankPaymentOrder(paymentOrder);
				// Autosave contact if not an existing one
				if ($scope.paymentOrder.saveContact && isNewContact()) {
					createContact();
				}
				if (processPaymentOrder) {
					lpCoreBus.publish("launchpad-retail.paymentOrderInitiated", {
						ftData: paymentOrder
					});

				}
			}

		};

		var validateFromToAccountNo = function (toAccountNo) {
			var valid = true;
			if ($scope.accountsModel.selected.id == toAccountNo) {
				$scope.errorsSameFromToAccount['sameFromToAccountError'] = true;
				valid = false;
			} else {
				$scope.errorsSameFromToAccount['sameFromToAccountError'] = false;

			}
			return valid;
		};

		var validateDailyLimit = function () {
			var valid = true;
			$scope.limitFlag = false;
			if ($scope.toggleTabs.oneTime && $scope.limit.amount > 0 && $scope.paymentOrder.instructedAmount > $scope.limit.amount) {

				if ($scope.paymentOrder.scheduleDate <= new Date()) {

					$scope.limitFlag = true;
					$scope.limitError = IdfcConstants.DAILYONETIMELIMITERROR;
					valid = false;
				}
			}
			return valid;
		};

		var validateEightDigitLimit = function () {
			var valid = true;
			$scope.amountLimitFlag = false;
			if ($scope.paymentOrder.instructedAmount > IdfcConstants.FT_AMOUNT_LIMIT) {
				$scope.amountLimitFlag = true;
				$scope.amountLimitError = IdfcConstants.AMTMAXERROR;
				valid = false;
			}
			return valid;
		};

		var validateEightDigitInternalLimit = function () {
			var valid = true;
			$scope.amountIntLimitFlag = false;
			if ($scope.paymentOrder.instructedAmount > IdfcConstants.FT_INTERNAL_AMOUNT_LIMIT) {
				$scope.amountIntLimitFlag = true;
				$scope.amountIntLimitError = IdfcConstants.AMTINTMAXERROR;
				valid = false;
			}
			return valid;
		};

		var validateAccountLienAndDormant = function (holdBalance, Status) {
			var valid = true;
			$scope.fromAccountLienFlag = false;
			$scope.fromAccountDormantFlag = false;
			if (holdBalance != null && holdBalance > 0) {
				valid = false;
				$scope.fromAccountLienFlag = true;
			} else if (Status != null && Status == IdfcConstants.ACCTDORMANT) {
				valid = false;
				$scope.fromAccountDormantFlag = true;
			}
			return valid;
		};

		$scope.getBeneficiaryDetailsById = function (id) {
			var xhr = httpService.getInstance({
				endpoint: widget.getPreference('contactDetailsDataSrc'),
				urlVars: {
					contactId: id,
					bizObjId: id
				}
			}).read();
			xhr.success(function (data) {
				if (IdfcUtils.hasContentData(data)) {
					$scope.counterpartyIFSCCode = data.ifscCode;
					$scope.paymentOrder.benLimit = data.transferLimit;
				}
			});
			xhr.error(function (data) {
				IdfcError.checkTimeout(data);
				$scope.globalerror = IdfcError.checkGlobalError(data);
				$scope.error = {
					happened: true,
					msg: data.rsn
				};
			});

		};

		function submitUpdate(event) {
			var isTranferMode = hiddenTransferMode();
			$scope.paymentOrderForm.submitted = true;
			event.preventDefault();
			$scope.errorsBenAmountLimit["amountGreaterThanBenLimit"] = false;
			$scope.errorsAmt["amountLessThanOne"] = false;
			$scope.amountLimitFlag = false;
			$scope.amountIntLimitFlag = false;
			if (isTranferMode) {
				if ($scope.paymentOrder.instructedAmount > IdfcConstants.FT_AMOUNT_LIMIT) {
					$scope.amountLimitFlag = true;
					$scope.amountLimitError = IdfcConstants.FFT_AMT_VALID_MSG;
					return false;
				}
			} else {
				if (!validateEightDigitInternalLimit()) {
					return false;
				}
			}
			var validAmount = true;
			var validAmountOne = true;
			if ($scope.paymentOrder.counterpartyName != "Own Accounts") {
				validAmount = $scope.validateAmountBeneficiaryLimit();
			}
			validAmountOne = validateAmount();
			if (!validAmount || !validAmountOne) {
				return false;

			}

			if ($scope.paymentOrderForm.$invalid) {
				$scope.$broadcast('lp.retail.new-transfer.errors');
				return false;
			}
			var paymentOrder = {},
				selectedAccount = $scope.accountsModel.selected;
			var finalEndDate = "",
				finalStartDate = "",
				finalCreationDate = "";
			if ($scope.paymentOrder.scheduledTransfer.endDate != null) {
				var dateEnd = new Date(
					$scope.paymentOrder.scheduledTransfer.endDate);
				var endDateMonth = dateEnd.getMonth() < 9 ? IdfcConstants.FFT_ZERO + (dateEnd.getMonth() + 1) : (dateEnd.getMonth() + 1);
				var endDateDay = dateEnd.getDate() < 9 ? IdfcConstants.FFT_ZERO + (dateEnd.getDate()) : (dateEnd.getDate());
				finalEndDate = dateEnd.getFullYear() + '-' + endDateMonth + '-' + endDateDay;
			}
			if ($scope.paymentOrder.scheduledTransfer.startDate != null) {
				var dateStart = new Date(
					$scope.paymentOrder.scheduledTransfer.startDate);
				var startDateMonth = dateStart.getMonth() < 9 ? IdfcConstants.FFT_ZERO + (dateStart.getMonth() + 1) : (dateStart.getMonth() + 1);
				var startDateDay = dateStart.getDate() < 9 ? IdfcConstants.FFT_ZERO + (dateStart.getDate()) : (dateStart.getDate());
				finalStartDate = dateStart.getFullYear() + '-' + startDateMonth + '-' + startDateDay;
			}
			if ($scope.paymentOrder.scheduleDate != null) {
				var dateCreation = new Date($scope.paymentOrder.scheduleDate);
				var creationDateMonth = dateCreation.getMonth() < 9 ? IdfcConstants.FFT_ZERO + (dateCreation.getMonth() + 1) :
				(dateCreation.getMonth() + 1);
				var creationDateDay = dateCreation.getDate() < 9 ? IdfcConstants.FFT_ZERO + (dateCreation.getDate()) : (dateCreation.getDate());
				finalCreationDate = dateCreation.getFullYear() + '-' + creationDateMonth + '-' + creationDateDay;
			}

			//add relevent fields to payment order object
			paymentOrder.counterpartyName = $scope.paymentOrder.counterpartyName;
			paymentOrder.instructedAmount = $scope.paymentOrder.instructedAmount;
			paymentOrder.instructedCurrency = $scope.paymentOrder.instructedCurrency;
			paymentOrder.creationDate = finalCreationDate;
			paymentOrder.counterpartySirName = $scope.paymentOrder.details.counterpartySirName;
			paymentOrder.instructedCurrency2 = $scope.paymentOrder.details.instructedCurrency2;
			paymentOrder.paymntTyp = $scope.paymentOrder.details.paymntTyp;
			paymentOrder.ifscCode = $scope.paymentOrder.ifscCode;
			paymentOrder.priority = $scope.paymentOrder.details.priority;
			paymentOrder.sys1 = $scope.paymentOrder.details.sys1;
			paymentOrder.andOrInstBsbNo = $scope.paymentOrder.details.andOrInstBsbNo;
			paymentOrder.chaseDay = $scope.paymentOrder.details.chaseDay;
			paymentOrder.purpose = '';
			paymentOrder.hldReqdYN = $scope.paymentOrder.details.hldReqdYN;
			paymentOrder.pmtNum = $scope.paymentOrder.details.pmtNum;
			paymentOrder.msgTyp = $scope.paymentOrder.details.msgTyp;
			paymentOrder.opertnMode = $scope.paymentOrder.details.opertnMode;
			paymentOrder.paymentDescription = $scope.paymentOrder.paymentDescription;
			paymentOrder.rmtTyp = $scope.paymentOrder.details.rmtTyp;
			paymentOrder.relatedRefNum = $scope.paymentOrder.details.relatedRefNum;
			paymentOrder.update = $scope.paymentOrder.update;
			paymentOrder.id = $scope.paymentOrder.details.id;
			paymentOrder.transferMode = $scope.paymentOrder.details.transferMode;
			paymentOrder.frequency = $scope.paymentOrder.details.frequency;
			paymentOrder.startDate = finalStartDate;
			paymentOrder.endDate = finalEndDate;
			paymentOrder.intervals = $scope.paymentOrder.details.intervals;
			paymentOrder.accountId = $scope.paymentOrder.accountId;
			paymentOrder.counterpartyIban = $scope.paymentOrder.counterpartyIban;
			paymentOrder.counterpartyName = $scope.paymentOrder.counterpartyName;
			paymentOrder.action = $scope.paymentOrder.details.action;
			paymentOrder.fnlPmt = $scope.paymentOrder.details.fnlPmt;
			paymentOrder.usrId = $scope.paymentOrder.details.usrId;
			paymentOrder.cal = $scope.paymentOrder.details.cal;
			paymentOrder.toAcctComnt = $scope.paymentOrder.details.toAcctComnt;
			paymentOrder.intrnRefNum = $scope.paymentOrder.details.intrnRefNum;
			paymentOrder.uniqRefNum = $scope.paymentOrder.details.uniqRefNum;
			paymentOrder.flag = false;

			//setting one time limit for one time transaction
			if ($scope.toggleTabs.oneTime) {
				paymentOrder.limit = $scope.limit.amount;
			}
			paymentOrder.counterpartyAccount = $scope.paymentOrder.counterpartyAccount;
			//if for some reason the instructed currency has been set blank it defaults to account default
			if (paymentOrder.instructedCurrency === "") {
				paymentOrder.instructedCurrency = selectedAccount.currency;
			}
			paymentOrder.accountId = selectedAccount.id;
			paymentOrder.accountName = selectedAccount.alias;
			paymentOrder = buildBankPaymentOrder(paymentOrder);

			lpCoreBus.publish("launchpad-retail.paymentOrderInitiated", {
				ftData: paymentOrder
			});

		};

		var checkNewBenValidation = function () {
			var valid = true;
			$scope.errorsNewBen = {};

			var NewBeneficiaryLimit = IdfcConstants.FT_NEWBENEFICIARY_LIMIT;
			if (parseFloat($scope.paymentOrder.instructedAmount) > parseFloat($scope.paymentOrder.newBeneficiary.limit)) {
				$scope.errorsNewBen["benlimitError"] = true;
				valid = false;
				return valid;
			} else if ($scope.paymentOrder.instructedAmount > NewBeneficiaryLimit) {
				$scope.errorsNewBen["NewBeneficiaryLimit"] = true;
				valid = false;
				return valid;
			}

			//validate beneficiary type required check
			if ($scope.paymentOrder.newBeneficiary.beneficiaryType) {
				valid = true;
			} else {
				$scope.errorsNewBen["BeneficiaryType"] = true;
				valid = false;
				return valid;
			}
			// Validate Bank Name
			if ($scope.paymentOrder.newBeneficiary.beneficiaryType
				.toUpperCase() === "OTH") {
				if ($scope.paymentOrder.newBeneficiary.bank === "Select" || $scope.paymentOrder.newBeneficiary.bank === undefined) {

					$scope.errorsNewBen["BankName"] = true;
					valid = false;
					return valid;
				} else {
					valid = true;
				}

				// Validate IFSC code
				if ($scope.paymentOrder.newBeneficiary.ifsc) {
					var error = validateIFSCCode($scope.paymentOrder.newBeneficiary.ifsc);
					if (error) {
						$scope.errorsNewBen["ifscError"] = error;
						valid = false;
						return valid;
					}
				}

			}

			// Validate Account Number & Confirm Account Number matches
			if ($scope.paymentOrder.newBeneficiary.account && $scope.paymentOrder.newBeneficiary.confirmAccount) {
				var error = $scope.validateAccountNumbers(
					$scope.paymentOrder.newBeneficiary.account,
					$scope.paymentOrder.newBeneficiary.confirmAccount);
				if (error) {
					$scope.errorsNewBen["acntNumber"] = error;
					valid = false;
					return valid;
				}
			}

			if ($scope.paymentOrder.newBeneficiary.nickname) {
				var error = $scope
					.validateNickName($scope.paymentOrder.newBeneficiary.nickname);
				if (error) {
					$scope.errorsNewBen["nickName"] = error;
					valid = false;
					return valid;
				}

			}
			// Validate Account Type
			if ($scope.paymentOrder.newBeneficiary.accType) {
				valid = true;
				return valid;
			} else {
				$scope.errorsNewBen["AcctTypeError"] = true;
				valid = false;
				return valid;
			}

			return valid;
		};

		// validate already added beneficiary limit validation
		var validateCounterPartyLimit = function (limit, benCreationDate, amount) {
			var valid = true;
			$scope.errors = {};
			var converMinutes = 1000 * 60 * 60;
			var d1 = benCreationDate;
			var d2 = new Date(d1);
			var ben_ms = d2.getTime();
			var SystemDate = $scope.limit.dateServer;
			var today = new Date(SystemDate);
			var today_ms = today.getTime();

			var difference_ms = today_ms - ben_ms;
			if (difference_ms / converMinutes < IdfcConstants.FT_ONEDAY_HRS) {
				var allowedLimit = IdfcConstants.FT_ADDED_BENEFICIARY_WITHIN24_LIMIT;
				if (amount > allowedLimit) {
					$scope.errors["benWithIn24Limit"] = true;
					valid = false;
					return valid;
				} else if (parseFloat(amount) > parseFloat(limit)) {
					$scope.errors["benLimit"] = true;
					valid = false;
					return valid;
				}
			} else if (parseFloat(amount) > parseFloat(limit)) {
				$scope.errors["benLimit"] = true;
				valid = false;
				return valid;
			}
			return valid;
		};

		var validateAmount = function () {
			var valid = true;

			if ($scope.paymentOrder.instructedAmount < IdfcConstants.MIN_TRANSFER_AMT) {
				$scope.errorsAmt["amountLessThanOne"] = true;
				valid = false;

			}
			return valid;
		}

		var validateMode = function () {
			$scope.errorsInvalidMode = false;
			var valid = true;
			if ($scope.toggleTabs.scheduled) {
				if (ctrl.radioModel === "IMPS") {
					$scope.errorsInvalidMode = true;
					valid = false;
				}
			} else if ($scope.toggleTabs.oneTime) {
				var today = new Date();
				if ($scope.paymentOrder.scheduleDate > today) {
					$scope.errorsInvalidMode = true;
					valid = false;
				}
			}
			return valid;
		}

		//Validation for Beneficiary Amount Limit
		$scope.validateAmountBeneficiaryLimit = function () {
			var valid = true;
			if ($scope.paymentOrder.benLimit != null && parseFloat($scope.paymentOrder.instructedAmount) > $scope.paymentOrder.benLimit) {
				$scope.errorsBenAmountLimit["amountGreaterThanBenLimit"] = true;
				valid = false;
			}
			return valid;
		}

		// validate already added beneficiary  for FFT :Shreya
		var validateCounterPartyForFutureTransaction = function (limit,
			benCreationDate, amount) {
			var valid = true;

			var benfyCreationDate = new Date(benCreationDate);

			var benCreationDateMidnight = benfyCreationDate;
			benCreationDateMidnight.setHours(23, 59, 59);

			benCreationDateMidnight
				.setHours(benCreationDateMidnight.getHours() + 24);

			var SystemDate = $scope.limit.dateServer;

			var today = new Date(SystemDate);
			var scheduleDate = new Date($scope.paymentOrder.scheduleDate
				.getTime());
			var scheduledTransferDate = new Date(
				$scope.paymentOrder.scheduledTransfer.startDate.getTime());
			scheduleDate.setHours(0, 0, 0, 0);
			scheduledTransferDate.setHours(0, 0, 0, 0);
			today.setHours(0, 0, 0, 0);
			if ($scope.toggleTabs.oneTime) {
				if (scheduleDate > today) {
					if ($scope.paymentOrder.scheduleDate <= benCreationDateMidnight) {
						$scope.errorsBenCreationFutureTrans["benCreationFutureTransError"] = true;
						valid = false;
						return valid;

					}
				}
			} else if ($scope.toggleTabs.scheduled) {
				if (scheduledTransferDate > today) {
					if ($scope.paymentOrder.scheduledTransfer.startDate <= benCreationDateMidnight) {
						$scope.errorsBenCreationFutureTrans["benCreationFutureTransError"] = true;
						valid = false;
						return valid;
					}
				}
			}
			return valid;
		};

		// Validate Account Number & Confirm Account Number
		$scope.validateAccountNumbers = function (accountNumber1, accountNumber2) {
			if (accountNumber1 !== accountNumber2) {
				return true;
			}
			return false;
		};

		// Validate Beneficiary nick name
		$scope.validateNickName = function (nickName) {
			var match = false;
			var contactsList = $scope.contactsModel.contacts;
			angular.forEach(contactsList, function (contact) {
				if (!match) {
					if (contact.nickName.toLowerCase() == nickName
						.toLowerCase()) {
						match = true;
						return match;
					}
				}
			});

			return match;
		};

		// Validate IFSC codee Number
		function validateIFSCCode(ifscCode) {
			var ifscRegex = /[A-Z|a-z]{4}[0][A-Z|a-z|0-9]{6}$/;
			return ifscCode.match(ifscRegex) ? false : true;
		};

		// added to load amount limit
		var limitManage = function () {
			var xhr = httpService.getInstance({
				endpoint: widget.getPreference('defaultLimitEndpoint')
			}).read();

			xhr.success(function (data) {
				$scope.limit = {
					amount: data.limit,
					dateServer: data.date
				}
			});
			xhr.error(function (data) {
				IdfcError.checkTimeout(data);
				$scope.globalerror = IdfcError.checkGlobalError(data);
				$scope.error = {
					happened: true,
					msg: IdfcConstants.SERVICE_ERROR
				}

			});
		};

		// added to load amount limit
		var getBankList = function () {
			var xhr = httpService.getInstance({
				endpoint: widget.getPreference('bankServicesDataSrc'),
				urlVars: {
					requestId: 'banksList',
					bizObjId: ''
				}
			}).read();

			xhr.success(function (data) {
				if (IdfcUtils.hasContentData(data)) {
					$scope.bankNames = data.banksList;
					$scope.ifscCodeList = data.ifscList;
				}
			});
			xhr.error(function (data) {
				IdfcError.checkTimeout(data);
				$scope.globalerror = IdfcError.checkGlobalError(data);
				$scope.error = {
					happened: true,
					msg: IdfcConstants.SERVICE_ERROR
				}

			});

		};

		var getDailyAddedBeneFiciaryCount = function () {
			var xhr = httpService.getInstance({
				endpoint: widget.getPreference('databaseServicesDataSrc'),
				urlVars: {
					requestId: 'dailyCount'
				}
			}).read();

			xhr.success(function (data) {
				if (IdfcUtils.hasContentData(data)) {
					$scope.BeneAdderror = {
						happened: false
					}
				}
			});
			xhr.error(function (data) {
				IdfcError.checkTimeout(data);
				$scope.globalerror = IdfcError.checkGlobalError(data);
				$scope.BeneAdderror = {
					happened: true,
					msg: data.rsn
				}

			});

		};

		$scope.onSaveContactsChange = function () {
			if (autoSave === '' && $scope.paymentOrder.saveContact) {
				$scope.toggleModal(); // Show
			}
		};

		$scope.cancelForm = function () {
			if ($scope.paymentOrder.update) {
				$scope.paymentOrder.update = false;
				$scope.resetForm();
				lpCoreBus.publish('launchpad-retail.reviewTransfersApp');
			} else {
				$scope.resetForm();
				lpCoreBus.publish('launchpad-retail.closeActivePanel');
			}
		};

		$scope.resetForm = function () {
			resetModel();
			resetChildScopes();
			setActiveTransferTabs();
			$scope.paymentOrderForm.submitted = false;
			$scope.errorsAmt["amountLessThanOne"] = false;
            $(".new-transfer-height").val('');
			$(".whole-amount-input").val('');
            $(".decimal-amount-input").val('');
			
			
			$scope.paymentOrder.paymentDescription="";
			paymentOrder.paymentDescription = "";
			
			if(!($scope.paymentOrder.update)){
				//$scope.paymentOrderForm.$setPristine();
			}
		};

		$scope.updateCounterparty = function (accountDetails) {

			// Store the selection as reference, to compare
			// later if the contact is a new one or not.
			if (accountDetails === null || accountDetails === undefined) {
				$scope.paymentOrder.counterpartyIban = '';

				if ($scope.paymentOrder.type === ctrl.poTypeEnum.bank) {
					if ($scope.usTransfer) {
						$scope.paymentOrder.counterpartyAccount = '';
					} else {
						$scope.paymentOrder.counterpartyIban = '';
					}
				}

				$scope.paymentOrderForm.$setDirty();

				return;
			}

			$scope.paymentOrder.selectedCounter = {
				name: $scope.paymentOrder.counterpartyName,
				account: accountDetails.account
			};

			$scope.paymentOrder.type = accountDetails.type;
			setActiveTransferTabs();

			if ($scope.paymentOrder.type === ctrl.poTypeEnum.bank) {
				if ($scope.usTransfer) {
					$scope.paymentOrder.counterpartyAccount = accountDetails.account;
				} else {
					$scope.paymentOrder.counterpartyIban = accountDetails.account;
				}
			}

			$scope.paymentOrderForm.$setDirty();
		};

		$scope.onAccountChange = function () {
			sharedProperties.setProperty($scope.accountsModel.selected.id);
		};

		$scope.toggleModal = function () {
			$scope.showContactsOptions = !$scope.showContactsOptions;
		};

		$scope.setScheduledTransfer = function (value) {
			var isTranferMode = !(hiddenTransferMode());
			$scope.paymentOrder.updateOneTime = true;
			$scope.paymentOrder.updateScheduled = true;
			if (value === 'scheduled') {
				$scope.paymentOrder.isScheduledTransfer = true;
				$scope.toggleTabs.oneTime = false;
				$scope.toggleTabs.scheduled = true;

				if (isTranferMode) {} else {
					if ($scope.paymentOrder.instructedAmount < IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
						$scope.impsAmtValidationflag = true;
						$scope.rtgsAmtValidationflag = true;
						ctrl.radioModel = 'NEFT';
						ctrl.tooltip_msg = IdfcConstants.NEFT_MSG;
					} else {
						$scope.impsAmtValidationflag = true;
						ctrl.radioModel = 'RTGS';
						$scope.rtgsAmtValidationflag = false;
						ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
					}

				}
				$scope.paymentOrder.scheduledTransfer.startDate = new Date();
				$scope.paymentOrder.saveContact = false;
				$scope.activeTransferTab.bank = true;
				$scope.activeTransferTab.newBeneficiary = false;
			} else if (value === 'one-time') {
				$scope.paymentOrder.isScheduledTransfer = false;
				$scope.toggleTabs.oneTime = true;
				$scope.toggleTabs.scheduled = false;

				if ($scope.paymentOrder.instructedAmount < IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
					$scope.impsAmtValidationflag = false;
					$scope.rtgsAmtValidationflag = true;
					ctrl.radioModel = 'IMPS';
					ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
				} else if ($scope.paymentOrder.instructedAmount == IdfcConstants.FT_IMPS_AMOUNT_LIMIT) {
					$scope.impsAmtValidationflag = false;
					$scope.rtgsAmtValidationflag = false;
					ctrl.radioModel = 'IMPS';
					ctrl.tooltip_msg = IdfcConstants.IMPS_MSG;
				} else {
					$scope.impsAmtValidationflag = true;
					$scope.rtgsAmtValidationflag = false;
					ctrl.radioModel = 'RTGS';
					ctrl.tooltip_msg = IdfcConstants.RTGS_MSG;
				}
				$scope.paymentOrder.scheduleDate = new Date();
			}
		};

		//LauncherDeckRefreshContent.setup(lpCoreBus, initialize).listen(lpWidget);
		var deckPanelOpenHandler;
                deckPanelOpenHandler = function(activePanelName) {
                    if (activePanelName == widget.parentNode.model.name) {                                                                                          
                        lpCoreBus.flush("DeckPanelOpen");
                        lpCoreBus.unsubscribe("DeckPanelOpen", deckPanelOpenHandler);
                        widget.refreshHTML(function(bresView){
                            widget.parentNode = bresView.parentNode;
                        });
                               //$scope.resetForm();
					}                                                                      
                };

                lpCoreBus.subscribe("DeckPanelOpen", deckPanelOpenHandler);
			if(!$scope.initCalled){
				initialize();
			}
		
	}
});