define(function (require, exports, module) {
    'use strict';

    function applyScope($scope) {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }

    var $ = window.jQuery;
    var idfcError = require('idfcerror');
    var idfcConstants = require('idfccommon').idfcConstants;

    exports.NewTransferController = function ($scope, $http, $rootScope, $rootElement, $timeout, lpCoreUtils, lpCoreBus, AccountsModel, ContactsModel, lpTransactionsCurrency, IbanModel, lpWidget, customerId, sharedProperties, formDataPersistence, P2PService, transferTypes, lpPayments, lpUIResponsive, lpCoreUpdate, httpService, $q, lpPortal, ifscCodeSearchService) {

        $scope.errors = {};

        var widget = lpWidget;
        var PaymentOrderModel = lpPayments.api();
        $scope.tooltip_msg = idfcConstants.IMPS_MSG;

        $scope.change_Tooltip = function (active_btn) {
            if (active_btn == 'IMPS') {
                $scope.tooltip_msg = idfcConstants.IMPS_MSG;
            } else if (active_btn == 'NEFT') {
                $scope.tooltip_msg = idfcConstants.NEFT_MSG;
            } else if (active_btn == 'RTGS') {
                $scope.tooltip_msg = idfcConstants.RTGS_MSG;
            }
        };
        var ctrl = this;
        // widget.setPreference(''); Xebia refactoring
        $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(widget) + '/templates/partials';

        var autoSave = widget.getPreference('autosaveContactsPreference');

        var formName = 'new-transfer-form';

        $scope.readonly = true;

        $scope.allowLoading = false;

        $scope.changeBeneficiaryBank = function (bank) {
            $scope.paymentOrder.newBeneficiary.bankName = bank;
            if (bank.name === idfcConstants.IDFC_LTD) {

                $scope.paymentOrder.newBeneficiary.beneficiaryType = 'OWN';

            } else {

                $scope.paymentOrder.newBeneficiary.beneficiaryType = 'OTH';

                /*** IFSC code search start ***/
                /*if(bank)
				 $scope.paymentOrder.newBeneficiary.ifsc = 'AMCB'; 
			    else 
					$scope.paymentOrder.newBeneficiary.ifsc = ''; */

                ctrl.storeIFSCcode = $scope.paymentOrder.newBeneficiary.ifsc;
                /*** IFSC code search end ***/

            }

        };

        $scope.$watch('paymentOrder.newBeneficiary.bankName', function (value) {
            /** ifsc code search **/
            if (!localStorage.getItem('newTransferModelData')) {
                console.log('from watchers :::::::::::::::::::::::::::::::::::');
                console.log(localStorage.getItem('newTransferModelData'));
                if (value) {
                    if ($scope.contactsModel.moduleState !== 'contactsView') {
                        var index = $scope.bankNames.indexOf(value);
                        $scope.paymentOrder.newBeneficiary.ifsc = $scope.ifscCodeList[index];
                        localStorage.setItem('firstFourChars', $scope.ifscCodeList[index]);
                    }

                }
            }
        });

        $scope.changeBeneficiaryActype = function (acc) {
            $rootScope.openOptions = false;
            $scope.paymentOrder.newBeneficiary.accType = acc;
        };

        $scope.benefeciaryTabFlag = $("#hiddenftflagdiv").html();

        $scope.$watch('benefeciaryTabFlag', function (newValue, oldValue) {

        });

        var paymentIntervals = {
            RECURRING: 'RECURRING',
            NON_RECURRING: 'NON_RECURRING'
        };


        /** ifsc code search  **/
        var callDefaultPageLoad = function () {
            if (localStorage.getItem('newTransferModelData')) {
                ctrl.loading = true;
                var modelData = angular.fromJson(localStorage.getItem('newTransferModelData'));
                console.log('all scope data ::::::::::::::::::::::');
                console.log($scope);
                console.log('landing data :::::::::::::::: ');
                console.log(JSON.stringify(modelData));
                $timeout(function () {
                    $scope.activeTransferTab.newBeneficiary = true;
                    $scope.changeBeneficiaryType("OTH");

                    $scope.paymentOrder.newBeneficiary = modelData;
                    $scope.radioModel = modelData.defaultModelData.radioModel;
                    document.querySelector('[aria-label="decimal amount"]').value = modelData.defaultModelData.decimalAmount;
                    document.querySelector('[name="wholeAmountInput"]').value = modelData.defaultModelData.wholeAmount;
                    document.querySelector('[aria-label="payment description"]').value = modelData.defaultModelData.paymentDescription;
                    /* CPU-7383 fix for transfer amount*/
                    $scope.paymentOrder.instructedAmount = modelData.defaultModelData.wholeAmount + '.' + modelData.defaultModelData.decimalAmount;
                    $scope.paymentOrder.paymentDescription = modelData.defaultModelData.paymentDescription;

                    $scope.change_Tooltip($scope.radioModel);

                    if (modelData.defaultModelData.ifscCodeError) {
                        ctrl.savedIfscValidateErrors = true;
                    }

                    if (localStorage.getItem('transfer_landing_data')) {
                        var ifscData = angular.fromJson(localStorage.getItem('transfer_landing_data'));
                        console.log('ifsc data :::::::::::::::: ');
                        console.log(ifscData);
                        $scope.paymentOrder.newBeneficiary.ifsc = ifscData.ifscCode;
                        ctrl.dataSelected = true;
                        ctrl.bankDetails = ifscData;
                        ctrl.bankDetails.count = 1;
                        console.log('bank details ::::::::::::::::::::::::::::::::');
                        console.log(ctrl.bankDetails);
                        ctrl.loading = false;
                        ctrl.savedIfscValidateErrors = false;
                    }
                }, 1000).then(function () {
                    return $timeout(function () {

                        if (!$scope.accountsModel.accounts) {
                            return;
                        }
                        console.log("$scope.accountsModel.accounts..." + $scope.accountsModel.accounts.length);
                        if ($scope.accountsModel.accounts.length == 0) {

                            var promise = $scope.accountsModel.load();
                            promise.then(function () {
                                $.each($scope.accountsModel.accounts, function (index, account) {
                                    if (modelData.defaultModelData.accountsModelSelectedId === account.id) {
                                        $scope.accountsModel.selected = account;
                                    }
                                });
                            });
                        } else {
                            $.each($scope.accountsModel.accounts, function (index, account) {
                                if (modelData.defaultModelData.accountsModelSelectedId === account.id) {
                                    $scope.accountsModel.selected = account;
                                }
                            });
                        }
                        sharedProperties.setProperty($scope.accountsModel.selected.id);

                    }, 1000);

                });
            }

        };

        /** ifsc code search ***/


        var initialize = function () {

            /** ifsc code search **/

            //Session Management Call
            idfcError.validateSession($http);
            $scope.global = $rootScope;
            $rootScope.openOptions = false;
            $scope.origin = '';
            $scope.target = '';
            $scope.radioModel = 'IMPS';
            $scope.lowbal = false;
            $scope.isRTGSEnabled = true;
            $scope.formsubmitted = false;
            $scope.tranferAllowed = true;
            $scope.transferLater = false;
            $scope.paymentDescription = "";
            //new added
            $scope.accountsModelBeneDD = [];
            $scope.beneficiaryAccountTypes = [{
                "id": "1",
                "name": "Saving Account"
            }, {
                "id": "2",
                "name": "Current Account"
            }];

            $scope.mediaDir = lpCoreUtils.getWidgetBaseUrl(widget) + '/media';

            $scope.addbenurl = $scope.partialsDir + '/' + 'addben.html';


            $scope.control = {
                transferType: {
                    value: "",
                    options: [{
                        "value": "2",
                        "text": "Transfer To Own Accounts"
                    }, {
                        "value": "3",
                        "text": "Transfer To Other IDFC Accounts"
                    }, {
                        "value": "4",
                        "text": "Transfer To Other Bank Accounts"
                    }],
                }
            };

            $scope.todaysDate = new Date();

            $scope.maxallowedDate = null;

            $scope.poTypeEnum = transferTypes;
            $scope.p2pService = P2PService;
            $scope.urgentTranfer = false;

            $scope.locale = widget.getPreference('locale');

            $scope.usTransfer = $scope.locale === 'en-US';

            $scope.title = widget.getPreference('title');

            $scope.accountsTopBalance = widget.getPreferenceFromParents('defaultBalanceView') || 'current';
            $scope.disableCurrencySelection = widget.getPreference('disableCurrencySelection');


            /** ifsc code search **/

            /*if(localStorage.getItem('newTransferModelData')){
			   ctrl.showHaveBen = '';
			   ctrl.showDontHaveBen = 'active';
		   } else {
			   ctrl.showDontHaveBen = '';
			   ctrl.showHaveBen = 'active';
		   }	*/

            $scope.idfcNewTrans = {
                ifscSearch: {}
            };
            ctrl.ifscValidateErrors = {};
            ctrl.ifscValidateErrors['invalidIFSC'] = false;

            //$scope.errors = $scope.errors || {};
            //var valid = true;
            //$scope.errors['invalidIFSC'] = false;		

            ctrl.bankDetails = {};
            ctrl.disableBank = false;
            ctrl.searchKeys = {};
            ctrl.queryStr = '';
            ctrl.qData = {
                'offset': '',
                'limit': '',
                'bankName': '',
                'branchName': '',
                'ifscCode': '',
                'isFirstAttempt': true
            };


            //if(!localStorage.getItem('transfer_landing_data')){
            $scope.globalerror = false;
            $scope.modalShown = false;
            $scope.exchangeRateModalShown = false;
            $scope.ibanModalShown = false;
            $scope.routingModalShown = false;
            $scope.errorsBenCreationFutureTrans = {};
            $scope.errorsBenAmountLimit = {};
            $scope.errorsAmt = {};
            $scope.errors = {};
            $scope.error = {};
            $scope.errorsSameFromToAccount = {};

            $scope.templates = {
                saveContacts: 'templates/save-contacts.html',
                urgentTransfer: 'templates/urgent-transfer.html',
                exchangeRate: 'templates/exchange-rate.html',
                iban: 'templates/iban.html',
                routingAndAccount: 'templates/routing-and-account-number.html'
            };

            $scope.accountsModel = AccountsModel;
            $scope.accountsModel.setConfig({
                accountsEndpoint: widget.getPreference('accountsDataSrc')
            });

            $scope.paymentOrderModel = PaymentOrderModel.createModel();

            $scope.dateOptions = {
                'show-button-bar': false,
                'show-weeks': false
            };

            $scope.selectAccount = function (params) {
                if (!$scope.accountsModel.accounts) {
                    return;
                }
                console.log("$scope.accountsModel.accounts..." + $scope.accountsModel.accounts.length);
                if ($scope.accountsModel.accounts.length == 0) {

                    var promise = $scope.accountsModel.load();
                    promise.then(function () {
                        $.each($scope.accountsModel.accounts, function (index, account) {
                            if (params.accountId === account.id) {
                                $scope.accountsModel.selected = account;
                            }
                        });
                    });
                } else {
                    $.each($scope.accountsModel.accounts, function (index, account) {
                        if (params.accountId === account.id) {
                            $scope.accountsModel.selected = account;
                        }
                    });
                }

                applyScope($scope);
                sharedProperties.setProperty($scope.accountsModel.selected.id);
            };

            $scope.contactsModel = new ContactsModel({
                contacts: lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('contactListDataSrc')),
                contactData: lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('contactDataSrc')),
                contactDetails: lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('contactDetailsDataSrc'))

            });

            var isValidAccountMOP = function (mop, lnk) {
                var result = true;
                if (mop === "FORMER OR SURVIVOR") {
                    if ((lnk === "JOIN")) {
                        result = false;
                    }
                }
                return result;
            };

            $scope.contactsModel.loadContacts().success(function () {
                var promise = $scope.accountsModel.load();

                promise.then(function () {
                    $scope.accountsModelBeneDD = $scope.accountsModel;

                    var accountsList = $scope.accountsModel.accounts;
                    var accountsListNew = Array();
                    var j = 0;
                    for (var i = 0; i < accountsList.length; i++) {
                        if (!(null != accountsList[i].modeOfOperation && (accountsList[i].modeOfOperation === "JOINTLY BY ALL" || accountsList[i].modeOfOperation === "ANY TWO" || accountsList[i].modeOfOperation === "BOTH OR SURVIVOR"))) {

                            if (isValidAccountMOP(accountsList[i].modeOfOperation, accountsList[i].lnk)) {
                                accountsListNew[j++] = accountsList[i];
                            }
                        }
                    }
                    console.log("accountsListNew.length  final--> " + accountsListNew.length);
                    if (0 == accountsListNew.length) {
                        $scope.tranferAllowed = false;
                        ctrl.loading = false;
                    } else {
                        $scope.accountsModelBeneDD.accounts = accountsListNew;

                        if (lpCoreUtils.parseBoolean(widget.getPreference('forceAccountSelection'))) {
                            return;
                        }

                        if (!$scope.accountsModel.selected && $scope.accountsModel.accounts && $scope.accountsModel.accounts.length > 0) {
                            $scope.accountsModel.selected = $scope.accountsModel.findByAccountNumber(widget.getPreferenceFromParents('defaultAccount')) || $scope.accountsModel.accounts[0];
                        }

                        gadgets.pubsub.subscribe('launchpad-retail.accountSelected', $scope.selectAccount);
                        sharedProperties.setProperty($scope.accountsModel.selected.id);
                        limitManage();
                        getBankList();
                        ctrl.loading = false;
                        $scope.allowLoading = true;
                    }
                })['catch'](function (error) {
                    ctrl.loading = false;
                    $scope.allowLoading = false;
                    if (error.data.cd) {
                        idfcError.checkTimeout(error.data);
                        $scope.globalerror = idfcError.checkGlobalError(error.data);

                        $scope.error = {
                            happened: true,
                            msg: error.data.rsn
                        };

                    }
                });
            }).error(function (data, status) {
                if (status == 0) {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    limitManage();
                    getBankList();
                    var prom = $scope.accountsModel.load();
                    prom.then(function () {
                        ctrl.loading = false;
                        /*Changes made for accounts not loading when no Bene present 2.0*/
                        $scope.accountsModelBeneDD = $scope.accountsModel;
                        var accountsList = $scope.accountsModel.accounts;
                        var accountsListNew = Array();
                        var j = 0;
                        for (var i = 0; i < accountsList.length; i++) {
                            if (!(null != accountsList[i].modeOfOperation && (accountsList[i].modeOfOperation === "JOINTLY BY ALL" || accountsList[i].modeOfOperation === "ANY TWO" || accountsList[i].modeOfOperation === "BOTH OR SURVIVOR" || accountsList[i].modeOfOperation === "FORMER OR SURVIVOR"))) {
                                accountsListNew[j++] = accountsList[i];
                            }
                        }
                        console.log("accountsListNew.length  in error--> " + accountsListNew.length);
                        if (0 == accountsListNew.length) {
                            $scope.tranferAllowed = false;
                            ctrl.loading = false;
                        } else {
                            $scope.accountsModelBeneDD.accounts = accountsListNew;
                            if (lpCoreUtils.parseBoolean(widget.getPreference("forceAccountSelection"))) {
                                return;
                            }

                            if (!$scope.accountsModel.selected && $scope.accountsModel.accounts && $scope.accountsModel.accounts.length > 0) {
                                $scope.accountsModel.selected = $scope.accountsModel.findByAccountNumber(widget.getPreferenceFromParents("defaultAccount")) || $scope.accountsModel.accounts[0];
                            }

                            gadgets.pubsub.subscribe("launchpad-retail.accountSelected", $scope.selectAccount);
                            sharedProperties.setProperty($scope.accountsModel.selected.id);
                        }

                    })['catch'](function (error) {
                        ctrl.loading = false;
                        if (error.data.cd) {
                            idfcError.checkTimeout(error.data);
                            $scope.globalerror = idfcError.checkGlobalError(error.data);

                            $scope.error = {
                                happened: true,
                                msg: error.data.rsn
                            };

                        }
                    });

                    ctrl.loading = false;
                    if (data.cd == "999" || data.cd == "99" || data.cd == "545" || data.cd == "501") {
                        idfcError.checkTimeout(data);
                        $scope.globalerror = idfcError.checkGlobalError(data);

                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };

                    }
                }
            });

            $scope.currencyModel = lpTransactionsCurrency.api();

            lpTransactionsCurrency.setConfig({
                defaultCurrencyEndpoint: lpWidget.getPreference('defaultCurrencyEndpoint'),
                currencyListEndpoint: lpWidget.getPreference('currencyListEndpoint')
            });

            $scope.ibanModel = IbanModel.getInstance({
                countryListEndpoint: widget.getPreference('ibanDataSrc'),
                enableCountrySearch: lpCoreUtils.parseBoolean(widget.getPreference('enableIbanCountrySearch'))
            });
            $scope.ibanModel.loadCountryList().then(function (response) {
                $scope.ibanModel.validate();
            });

            resetModel();

            $scope.toggleTabs = {
                oneTime: $scope.paymentOrder.isScheduledTransfer ? false : true,
                scheduled: $scope.paymentOrder.isScheduledTransfer ? true : false
            };

            $scope.paymentOrder.updateOneTime = true;
            $scope.paymentOrder.updateScheduled = true;
            /** ifsc code search **/
            if (localStorage.getItem('newTransferModelData')) {
                $scope.paymentOrder.newBeneficiary.beneficiaryType = "OTH";
                $scope.activeTransferTab = {
                    bank: false,
                    p2pEmail: false,
                    p2pAddress: false,
                    newBeneficiary: true
                };
            } else {
                $scope.paymentOrder.newBeneficiary.beneficiaryType = "OWN";
                $scope.activeTransferTab = {
                    bank: true,
                    p2pEmail: false,
                    p2pAddress: false,
                    newBeneficiary: false
                };
            }

            $scope.persistenceManager = formDataPersistence.getInstance();

            if ($scope.persistenceManager.isFormSaved(formName)) {

                var newPaymentOrder = $scope.persistenceManager.getFormData(formName);

                var excludedProperties = [
                    'uuid',
                    'scheduleDate',
                    'update'
                ];

                for (var key in newPaymentOrder) {
                    if (newPaymentOrder.hasOwnProperty(key) && excludedProperties.indexOf(key) === -1) {
                        $scope.paymentOrder[key] = newPaymentOrder[key];
                    }
                }

                setActiveTransferTabs();
            }

            widget.addEventListener('PerspectiveModified', function (event) {
                if (event.newValue === 'Minimized' || event.newValue === 'Widget') {
                    $scope.hideAllModals();
                }
            });

            $scope.changeBeneficiaryType = function (newValue) {
                if (newValue.toUpperCase() === "OTH") {
                    $scope.paymentOrder.newBeneficiary.beneficiaryType = "OTH";
                    $('#transferMode').show();
                    $("#benBankLabel").show();
                    $("#benBank").show();
                    $("#benBankError").show();
                    if ($scope.paymentOrder.instructedAmount < idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                        $scope.impsAmtValidationflag = false;
                        $scope.radioModel = 'IMPS';
                        $scope.tooltip_msg = idfcConstants.IMPS_MSG;
                        $scope.rtgsAmtValidationflag = true;
                    } else if ($scope.paymentOrder.instructedAmount > idfcConstants.FT_RTGS_AMOUNT_LIMIT) {
                        $scope.impsAmtValidationflag = true;
                        $scope.radioModel = 'RTGS';
                        $scope.tooltip_msg = idfcConstants.RTGS_MSG;
                    } else if ($scope.paymentOrder.instructedAmount == idfcConstants.FT_RTGS_AMOUNT_LIMIT) {
                        $scope.impsAmtValidationflag = false;
                        $scope.radioModel = 'IMPS';
                        $scope.tooltip_msg = idfcConstants.IMPS_MSG;
                    }
                    $('#transferMode').show();
                    $("#benBankLabel").show();
                    $("#benBank").show();
                    $("#benBankError").show();
                    $scope.paymentOrder.counterpartyName = "";
                    $scope.paymentOrder.counterpartyIban = "";
                } else {
                    $scope.paymentOrder.newBeneficiary.beneficiaryType = "OWN";
                    $('#transferMode').hide();
                    $("#benBank").hide();
                    $("#benBankLabel").hide();
                    $("#benBankError").hide();

                    $scope.paymentOrder.counterpartyName = "";
                    $scope.paymentOrder.counterpartyIban = "";
                    /** ifsc code search **/
                    //$scope.paymentOrder.newBeneficiary.ifsc = "";
                }
            }

            $scope.$watch("paymentOrder.scheduleDate", function (newValue, oldValue) {
                var today = new Date();
                $scope.errorsBenCreationFutureTrans["benCreationFutureTransError"] = false;
                if ($scope.paymentOrder.scheduleDate > today && $scope.paymentOrder.instructedAmount < idfcConstants.FT_IMPS_AMOUNT_LIMIT && !($('#transferMode').is(':hidden'))) {
                    $scope.impsAmtValidationflag = true;
                    $scope.radioModel = 'NEFT';
                    $scope.tooltip_msg = idfcConstants.NEFT_MSG;
                } else if ($scope.paymentOrder.scheduleDate > today && $scope.paymentOrder.instructedAmount > idfcConstants.FT_RTGS_AMOUNT_LIMIT && !($('#transferMode').is(':hidden'))) {
                    $scope.impsAmtValidationflag = true;
                    $scope.radioModel = 'RTGS';
                    $scope.tooltip_msg = idfcConstants.RTGS_MSG;
                } else if ($scope.paymentOrder.scheduleDate <= today && $scope.paymentOrder.instructedAmount < idfcConstants.FT_IMPS_AMOUNT_LIMIT && !($('#transferMode').is(':hidden'))) {
                    $scope.impsAmtValidationflag = false;
                    $scope.rtgsAmtValidationflag = true;
                    $scope.radioModel = 'IMPS';
                    $scope.tooltip_msg = idfcConstants.IMPS_MSG;
                } else if ($scope.paymentOrder.scheduleDate > today && $scope.paymentOrder.instructedAmount == idfcConstants.FT_IMPS_AMOUNT_LIMIT && !($('#transferMode').is(':hidden'))) {
                    $scope.impsAmtValidationflag = true;
                    $scope.radioModel = 'RTGS';
                    $scope.tooltip_msg = idfcConstants.RTGS_MSG;
                } else if ($scope.paymentOrder.scheduleDate <= today && $scope.paymentOrder.instructedAmount == idfcConstants.FT_IMPS_AMOUNT_LIMIT && !($('#transferMode').is(':hidden'))) {
                    $scope.impsAmtValidationflag = false;
                    $scope.radioModel = 'IMPS';
                    $scope.tooltip_msg = idfcConstants.IMPS_MSG;
                }
                if ($scope.paymentOrder.scheduleDate > today) {

                    $scope.hideBeneTabOneTime = true;
                    $scope.activeTransferTab.newBeneficiary = false;
                } else {

                    $scope.hideBeneTabOneTime = false;
                }

            }, true);

            $scope.$watch("paymentOrder.counterpartyName", function (newValue, oldValue) {
                var today = new Date();
                $scope.errorsBenCreationFutureTrans["benCreationFutureTransError"] = false;
                if ($scope.paymentOrder.scheduleDate > today && $scope.paymentOrder.instructedAmount <= idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = true;
                    $scope.radioModel = 'NEFT';
                } else if ($scope.paymentOrder.scheduleDate > today && $scope.paymentOrder.instructedAmount > idfcConstants.FT_RTGS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = true;
                    $scope.radioModel = 'RTGS';
                } else if ($scope.paymentOrder.scheduleDate <= today && $scope.paymentOrder.instructedAmount < idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = false;
                    $scope.rtgsAmtValidationflag = true;
                    $scope.radioModel = 'IMPS';
                } else if ($scope.paymentOrder.scheduleDate <= today && $scope.paymentOrder.instructedAmount == idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = false;
                    $scope.rtgsAmtValidationflag = false;
                    $scope.radioModel = 'IMPS';
                } else if ($scope.paymentOrder.scheduleDate > today) {
                    $scope.impsAmtValidationflag = true;
                    $scope.radioModel = 'NEFT';
                }
                if ($scope.paymentOrder.isScheduledTransfer && $scope.paymentOrder.instructedAmount < idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = true;
                    $scope.rtgsAmtValidationflag = true;
                    $scope.radioModel = 'NEFT';
                } else if ($scope.paymentOrder.isScheduledTransfer && $scope.paymentOrder.instructedAmount > idfcConstants.FT_RTGS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = true;
                    //preprod issue fixed by Jay
                    $scope.rtgsAmtValidationflag = true;
                    $scope.radioModel = 'NEFT'; // 'RTGS';
                    //preprod issue fixed by Jay
                } else if ($scope.paymentOrder.isScheduledTransfer && $scope.paymentOrder.instructedAmount == idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = true;
                    //preprod issue fixed by Jay
                    $scope.rtgsAmtValidationflag = true;
                    $scope.radioModel = 'NEFT'; //= 'RTGS';
                    //preprod issue fixed by Jay
                } else if ($scope.paymentOrder.isScheduledTransfer) {
                    $scope.impsAmtValidationflag = true;
                    $scope.radioModel = 'NEFT';
                }
                var today = new Date();
                if (!$('#transferMode').is(':hidden')) {
                    $('#transferMode').hide();
                }
            }, true);

            $scope.$watch("activeTransferTab.newBeneficiary", function (newValue, oldValue) {
                //$("#benBank").hide();
                $scope.isRTGSEnabled = false;
                /** ifsc code search **/
                if (!localStorage.getItem('newTransferModelData')) {
                    $("#benBank").hide();
                    if (newValue) {
                        $scope.paymentOrder.counterpartyIban = '';
                        $scope.paymentOrder.newBeneficiary.beneficiaryType = "OWN";
                        $scope.changeBeneficiaryType("OWN");
                        $('#transferMode').hide();
                        if (!$('#transferMode').is(':hidden')) {
                            $scope.transferLater = true;
                        } else {
                            $scope.transferLater = false;
                            $scope.setScheduledTransfer('one-time');
                        }
                    }

                    $scope.submitFlag = false;
                }

            }, true);

            $scope.$watch("activeTransferTab.bank", function (newValue, oldValue) {
                /** ifsc code search **/
                if (!localStorage.getItem('newTransferModelData')) {
                    if (newValue) { //alert('here');
                        $scope.isRTGSEnabled = true;
                        $scope.paymentOrder.newBeneficiary.beneficiaryType === 'OWN'
                        $('#transferMode').hide();
                        document.querySelector('[lp-number-input="lp-number-input"]').value = "";
                        document.querySelector('[name="wholeAmountInput"]').value = "";
                        document.querySelector('[aria-label="payment description"]').value = "";
                        $scope.paymentOrder.instructedAmount = "";
                        $scope.paymentOrder.paymentDescription = "";
                        $scope.paymentOrder.scheduledTransfer.frequency = "ONETIME";
                        $scope.paymentOrder.counterpartyName = "";
                        $scope.paymentOrder.counterpartyIban = "";
                        /** ifsc code search **/
                        //$scope.paymentOrder.newBeneficiary.ifsc = "";
                    }
                }
            }, true);

            $scope.$watch("paymentOrder.saveContact", function (newValue, oldValue) {
                if (newValue) {
                    getDailyAddedBeneFiciaryCount();
                } else {
                    $scope.BeneAdderror = {
                        happened: false
                    }
                }

            }, true);
            $scope.$watch("paymentOrder.instructedAmount", function (newValue, oldValue) {
                var today = new Date();
                if (!$scope.paymentOrder.update) {

                    $scope.amountLimitFlag = false;
                    $scope.amountIntLimitFlag = false;
                    $scope.errorsAmt["amountLessThanOne"] = false;
                    validateAmount();

                    if (newValue > idfcConstants.FT_RTGS_AMOUNT_LIMIT) {
                        $scope.radioModel = 'RTGS';
                        $scope.impsAmtValidationflag = true;
                        $scope.rtgsAmtValidationflag = false;
                        $scope.tooltip_msg = idfcConstants.RTGS_MSG;
                    }
                    if (newValue < idfcConstants.FT_IMPS_AMOUNT_LIMIT && $scope.paymentOrder.scheduleDate <= today && !($('#transferMode').is(':hidden')) && !$scope.toggleTabs.scheduled) {
                        $scope.radioModel = 'IMPS';
                        $scope.impsAmtValidationflag = false;
                        $scope.rtgsAmtValidationflag = true;
                        $scope.tooltip_msg = idfcConstants.IMPS_MSG;

                    } else if (newValue < idfcConstants.FT_IMPS_AMOUNT_LIMIT && $scope.paymentOrder.scheduleDate > today && !($('#transferMode').is(':hidden'))) {
                        $scope.radioModel = 'NEFT';
                        $scope.impsAmtValidationflag = true;
                        $scope.rtgsAmtValidationflag = true;
                        $scope.tooltip_msg = NEFT_MSG;
                    } else if (newValue < idfcConstants.FT_IMPS_AMOUNT_LIMIT && !($('#transferMode').is(':hidden')) && $scope.toggleTabs.scheduled) {
                        $scope.radioModel = 'NEFT';
                        $scope.impsAmtValidationflag = true;
                        $scope.rtgsAmtValidationflag = true;
                        $scope.tooltip_msg = idfcConstants.NEFT_MSG;
                    } else if (newValue > idfcConstants.FT_RTGS_AMOUNT_LIMIT && !($('#transferMode').is(':hidden')) && $scope.toggleTabs.scheduled) {
                        // For new requirement if user select for transfer later user can select only NEFT
                        //$scope.radioModel = 'RTGS';
                        //$scope.rtgsAmtValidationflag = false;
                        $scope.radioModel = 'NEFT';
                        $scope.rtgsAmtValidationflag = true;
                        $scope.impsAmtValidationflag = true;
                        $scope.tooltip_msg = idfcConstants.RTGS_MSG;
                    } else if (newValue == idfcConstants.FT_IMPS_AMOUNT_LIMIT && $scope.paymentOrder.scheduleDate <= today && !($('#transferMode').is(':hidden')) && !$scope.toggleTabs.scheduled) {
                        $scope.radioModel = 'IMPS';
                        $scope.impsAmtValidationflag = false;
                        $scope.rtgsAmtValidationflag = false;
                        $scope.tooltip_msg = idfcConstants.IMPS_MSG;
                    } else if (newValue == idfcConstants.FT_IMPS_AMOUNT_LIMIT && $scope.paymentOrder.scheduleDate > today && !($('#transferMode').is(':hidden'))) {
                        $scope.radioModel = 'IMPS';
                        $scope.impsAmtValidationflag = false;
                        $scope.rtgsAmtValidationflag = false;
                        $scope.tooltip_msg = idfcConstants.IMPS_MSG;
                    } else if (newValue == idfcConstants.FT_IMPS_AMOUNT_LIMIT && !($('#transferMode').is(':hidden')) && $scope.toggleTabs.scheduled) {
                        // For new requirement if user select for transfer later user can select only NEFT
                        //$scope.radioModel = 'RTGS';
                        //$scope.rtgsAmtValidationflag = false;
                        $scope.radioModel = 'NEFT';
                        $scope.rtgsAmtValidationflag = true;
                        $scope.impsAmtValidationflag = true;
                        $scope.tooltip_msg = idfcConstants.NEFT_MSG;
                    }
                }
            }, true);
            $scope.$watch('paymentOrder', function (newValue, oldValue) {

                if (newValue !== oldValue) {
                    $scope.persistenceManager.saveFormData(formName, $scope.paymentOrder);


                }
            }, true);
            $scope.$watch("paymentOrder.scheduledTransfer.frequency",
                function enabledisabledates(newValue, oldValue) {
                    var scheduleStartDate = new Date($scope.paymentOrder.scheduledTransfer.startDate);
                    if (newValue === oldValue) {
                        return;
                    } else if (newValue == 'WEEKLY') {
                        var d = new Date(scheduleStartDate);
                        d.setDate(d.getDate() + 8);
                        $scope.maxallowedDate = new Date(d);
                    } else if (newValue == 'MONTHLY') {
                        $scope.maxallowedDate = new Date(scheduleStartDate.setMonth(scheduleStartDate.getMonth() + 1));
                    } else if (newValue == 'YEARLY') {
                        $scope.maxallowedDate = new Date(scheduleStartDate.setYear(scheduleStartDate.getFullYear() + 1));
                    } else if (newValue == 'QUARTERLY') {
                        $scope.maxallowedDate = new Date(scheduleStartDate.setMonth(scheduleStartDate.getMonth() + 3));
                    } else if (newValue == 'HALF YEARLY') {

                        $scope.maxallowedDate = new Date(scheduleStartDate.setMonth(scheduleStartDate.getMonth() + 6));
                    }
                }
            );

            $scope.$watch("paymentOrder.scheduledTransfer.startDate",
                function dateset(newValue, oldValue) {
                    var scheduleStartDate = new Date(newValue);
                    if (newValue === oldValue) {
                        return;
                    } else if ($scope.paymentOrder.scheduledTransfer.frequency == 'WEEKLY') {
                        var d = new Date(scheduleStartDate);
                        d.setDate(d.getDate() + 8);
                        $scope.maxallowedDate = new Date(d);
                    } else if ($scope.paymentOrder.scheduledTransfer.frequency == 'MONTHLY') {
                        $scope.maxallowedDate = new Date(scheduleStartDate.setMonth(scheduleStartDate.getMonth() + 1));
                    } else if ($scope.paymentOrder.scheduledTransfer.frequency == 'YEARLY') {
                        $scope.maxallowedDate = new Date(scheduleStartDate.setYear(scheduleStartDate.getFullYear() + 1));
                    } else if (newValue == 'QUARTERLY') {
                        $scope.maxallowedDate = new Date(scheduleStartDate.setMonth(scheduleStartDate.getMonth() + 3));
                    } else if ($scope.paymentOrder.scheduledTransfer.frequency == 'HALF YEARLY') {

                        $scope.maxallowedDate = new Date(scheduleStartDate.setMonth(scheduleStartDate.getMonth() + 6));
                    }
                }
            );


            gadgets.pubsub.subscribe('transfer-loaded', function (data) {
                if (data.tab) {
                    $scope.paymentOrder.type = data.tab;
                    setActiveTransferTabs();
                }
                $scope.target = data.target;
                if (data.origin == 'Dashboard') {
                    $scope.origin = data.origin;
                }
            });

            applyScope($scope);
            callDefaultPageLoad();
        };

        gadgets.pubsub.subscribe("native.back", function (evt) {
            angular.forEach(document.getElementsByClassName("tooltip"), function (e) {
                e.style.display = 'none';
            })

            if ($scope.origin == 'Dashboard') {
                gadgets.pubsub.publish("launchpad-retail.backToDashboard");

            }
            localStorage.clear();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function (evt) {
            if (localStorage.getItem("navigationFlag")) {
                angular.forEach(document.getElementsByClassName("tooltip"), function (e) {
                    e.style.display = 'none';
                })

                if ($scope.origin == 'Dashboard') {
                    gadgets.pubsub.publish("launchpad-retail.backToDashboard");

                }
                localStorage.clear();
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }

        });


        var isNewContact = function () {
            if ($scope.contactsModel.findByName($scope.paymentOrder.counterpartyName)) {
                return false;
            }
            return (!$scope.paymentOrder.selectedCounter ||
                $scope.paymentOrder.selectedCounter.name !== $scope.paymentOrder.counterpartyName ||
                $scope.paymentOrder.selectedCounter.account !== $scope.paymentOrder.counterpartyIban);
        };

        var createContact = function () {

            var contact = {
                name: $scope.paymentOrder.counterpartyName
            };

            if ($scope.paymentOrder.type === $scope.poTypeEnum.bank) {
                contact.account = $scope.usTransfer ? $scope.paymentOrder.counterpartyAccount : $scope.paymentOrder.counterpartyIban;
            } else if ($scope.paymentOrder.type === $scope.poTypeEnum.p2pEmail) {
                contact.email = $scope.paymentOrder.counterpartyEmail;
            }

            $scope.contactsModel.currentContact = contact;

            $scope.contactsModel.createCounterParty(true);
            gadgets.pubsub.publish('launchpad.contacts.load');
        };

        $scope.performToScheduledTransfer = function () {
            $scope.transferLater = true;
            $scope.setScheduledTransfer('scheduled');
        }

        var resetModel = function () {

            var scheduledTransfer = $scope.paymentOrder ? $scope.paymentOrder.isScheduledTransfer : false;

            $scope.paymentOrder = {
                update: false,
                uuid: generateUUID(),
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
                urgentTransfer: false,
                oneTimeSchd: false,
                scheduleDate: new Date(),
                isOpenDate: false,
                instructedCurrency: '',
                counterpartyIban: '',
                counterpartyAccount: '',
                counterpartyEmail: '',
                counterpartyAddress: '',
                instructedAmount: 0,
                paymentReference: '',
                paymentDescription: '',
                counterpartyName: '',
                date: '',
                saveContact: autoSave === '' ? false : lpCoreUtils.parseBoolean(autoSave),
                type: $scope.poTypeEnum.bank,
                dirty: false,
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
                    beneficiaryType: '',
                    /*** IFSC code search start ***/
                    ifscSearch: {
                        bankName: '',
                        branchName: '',
                        ifscCode: ''
                    }
                    /*** IFSC code search end ***/

                },
                desc: '',
                startDate: '',
                endDate: '',
                beneName: '',
                uniqueBenId: '',
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

        var setActiveTransferTabs = function () {

            for (var tab in $scope.activeTransferTab) {
                if ($scope.activeTransferTab.hasOwnProperty(tab)) {
                    $scope.activeTransferTab[tab] = false;
                }
            }

            var found = false;

            for (var item in $scope.poTypeEnum) {
                if ($scope.poTypeEnum.hasOwnProperty(item)) {
                    if ($scope.poTypeEnum[item] === $scope.paymentOrder.type) {
                        $scope.activeTransferTab[item] = true;
                        found = true;
                    }
                }
            }

            if (!found) {
                $scope.activeTransferTab.bank = true;
            }
        };

        var resetChildScopes = function () {
            $scope.$broadcast('reset', {});
        };

        var checkValidAccounts = function () {

            if ($scope.paymentOrderForm.counterpartyIban && $scope.paymentOrder.type === $scope.poTypeEnum.bank) {
                $scope.paymentOrderForm.counterpartyIban.$setValidity('notEqual', $scope.notEqualAccounts());
            }
        };


        var buildBankPaymentOrder = function (paymentOrder) {
            paymentOrder.type = $scope.poTypeEnum.bank;



            paymentOrder.counterpartyAccount = $scope.paymentOrder.counterpartyIban;

            paymentOrder.ifscCode = $scope.paymentOrder.ifscCode;

            if ($('#transferMode').is(':hidden')) {
                paymentOrder.txnMode = "IFT";
            } else {
                paymentOrder.txnMode = $scope.radioModel;
            }



            if ($scope.paymentOrder.paymentDescription !== '') {
                paymentOrder.paymentDescription = $scope.paymentOrder.paymentDescription;
            }


            paymentOrder.newBeneficiary = $scope.paymentOrder.newBeneficiary;

            if (paymentOrder.counterpartyAccount == '') {

                paymentOrder.counterpartyAccount = paymentOrder.newBeneficiary.account;
                paymentOrder.nickName = paymentOrder.newBeneficiary.nickname;
            }
            if (paymentOrder.ifscCode == '') {

            }
            if ($scope.paymentOrder.isScheduledTransfer) {
                paymentOrder.scheduledTransfer = {};
                //Added to check for tanking 3.1 change
                console.log("paymentOrder.scheduledTransfer.startDate true" + $scope.paymentOrder.scheduledTransfer.startDate);
                paymentOrder.tankingDate = $scope.paymentOrder.scheduledTransfer.startDate; // 3.1 close
                paymentOrder.scheduledTransfer.frequency = $scope.paymentOrder.scheduledTransfer.frequency;
                paymentOrder.scheduledTransfer.every = $scope.paymentOrder.scheduledTransfer.every;

                paymentOrder.scheduledTransfer.intervals = $scope.paymentOrder.scheduledTransfer.intervals.join(',');
                paymentOrder.scheduledTransfer.startDate = +(new Date($scope.paymentOrder.scheduledTransfer.startDate));
                paymentOrder.scheduledTransfer.endDate = +(new Date($scope.paymentOrder.scheduledTransfer.endDate));
                paymentOrder.paymentMode = paymentIntervals.RECURRING;
                if ($('#transferMode').is(':hidden')) {
                    paymentOrder.txnMode = "IFT";
                } else {
                    paymentOrder.txnMode = $scope.radioModel;
                }
                if ($scope.paymentOrder.scheduledTransfer.frequency == "ONETIME") {
                    paymentOrder.oneTimeSchd = true;
                    paymentOrder.onDate = $scope.paymentOrder.scheduledTransfer.startDate.getTime();
                    //                    paymentOrder.paymentMode = paymentIntervals.NON_RECURRING;
                    delete paymentOrder.scheduledTransfer.every;
                    delete paymentOrder.scheduledTransfer.frequency;
                    delete paymentOrder.scheduledTransfer.intervals;
                    //                    paymentOrder.scheduledTransfer.startDate = null;
                    //                    paymentOrder.scheduledTransfer.endDate = null;
                } else {
                    paymentOrder.oneTimeSchd = false;
                    paymentOrder.paymentMode = paymentIntervals.RECURRING;
                    //paymentOrder.txnMode = "STO";
                }

            } else {
                paymentOrder.onDate = +(new Date($scope.paymentOrder.scheduleDate));

                paymentOrder.urgentTransfer = $scope.paymentOrder.urgentTransfer;

                // prod change start 3.1
                paymentOrder.tankingDate = $scope.paymentOrder.scheduleDate;
                //if ($scope.paymentOrder.scheduleDate > new Date() && !isTranferMode) {
                if ($scope.paymentOrder.scheduleDate > new Date()) { //prod change end 3.1
                    paymentOrder.scheduledTransfer = {};
                    paymentOrder.paymentMode = paymentIntervals.RECURRING;
                    paymentOrder.scheduledTransfer.startDate = +(new Date($scope.paymentOrder.scheduleDate));
                    paymentOrder.scheduledTransfer.endDate = +(new Date($scope.paymentOrder.scheduleDate));
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

        var buildP2PEmailPaymentOrder = function (paymentOrder) {
            paymentOrder.type = $scope.poTypeEnum.p2pEmail;
            paymentOrder.onDate = +(new Date($scope.paymentOrder.scheduleDate));
            paymentOrder.paymentMode = paymentIntervals.NON_RECURRING;
            paymentOrder.counterpartyEmail = $scope.paymentOrder.counterpartyEmail;

            return paymentOrder;
        };

        var buildP2PAddressPaymentOrder = function (paymentOrder) {
            paymentOrder.type = $scope.poTypeEnum.p2pAddress;
            paymentOrder.onDate = +(new Date($scope.paymentOrder.scheduleDate));
            paymentOrder.paymentMode = paymentIntervals.NON_RECURRING;
            paymentOrder.counterpartyAddress = $scope.paymentOrder.counterpartyAddress;

            return paymentOrder;
        };


        $scope.openCalendar = function ($event) {
            if ($event.type === 'click' || $event.which === 32 || $event.which === 13) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.paymentOrder.isOpenDate = true;
            }
        };

        $scope.setPaymentOrderType = function (paymentOrderType) {
            $scope.paymentOrder.type = paymentOrderType;
        };



        $scope.submitForm = function (event, update) {

            console.log("Inside submit form");

            gadgets.pubsub.publish("hideKeyboard");
            if (update) {
                submitUpdate(event);
            } else {
                console.log("Inside else");

                var xhr;
                $scope.submitFlag = true;
                var id = $('#benId').html();
                var uniqueBeneId = $('#benId').html();
                if (uniqueBeneId) {
                    $scope.paymentOrder.uniqueBenId = uniqueBeneId;
                } else {
                    $scope.paymentOrder.uniqueBenId = '';
                }
                $scope.paymentOrder.nickName = ($scope.paymentOrder.selectedCounter==undefined)? "": $scope.paymentOrder.selectedCounter.nickName;
                var counterpartyIFSCCode = $('#counterpartyIFSCCode').html();
                var counterpartyLimit = $('#counterpartyLimit').html();
                $scope.counterpartyLimitSet = counterpartyLimit;

                var counterpartycreationDate = $('#counterpartycreationDate').html();

                if (counterpartyIFSCCode) {
                    $scope.paymentOrder.ifscCode = counterpartyIFSCCode;
                }

                var counterpartyNickName = $('#counterpartyNickName').html();

                if (counterpartyNickName) {
                    $scope.paymentOrder.nickName = counterpartyNickName;
                }

                event.preventDefault();

                $scope.persistenceManager.removeFormData(formName);

                var processPaymentOrder = true;

                $scope.paymentOrderForm.submitted = true;

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

                fromAccountValid = validateAccountLienAndDormant($scope.accountsModel.selected.holdBalance, $scope.accountsModel.selected.status);
                if (!fromAccountValid) {
                    console.log("Inside this if");
                    return false;
                }
                if (!$('#transferMode').is(':hidden')) {
                    console.log("Inside that if");
                    eightDigitCheck = validateEightDigitLimit();

                    if (!eightDigitCheck) {
                        return false;
                    }
                } else {
                    eightDigitInternalCheck = validateEightDigitInternalLimit();
                    console.log("Inside that else");
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
                        valid = validateCounterPartyLimit(counterpartyLimit, counterpartycreationDate, $scope.paymentOrder.instructedAmount);
                        if ($scope.paymentOrder.isScheduledTransfer)
                            valid_futureTrans = validateCounterPartyForFutureTransaction(counterpartyLimit, counterpartycreationDate, $scope.paymentOrder.instructedAmount);
                    }
                    var validamount = validateAmount();

                    fromToAccountValid = validateFromToAccountNo($scope.paymentOrder.counterpartyIban);
                    if (!valid || !valid_futureTrans || !validamount || !fromToAccountValid) {
                        return false;
                    }
                }

                if ($scope.paymentOrderForm.$invalid) {
                    console.log($scope.paymentOrderForm);
                    console.log("Inside invalid form if");
                    $scope.$broadcast('lp.retail.new-transfer.errors');
                    return false;
                }

                var paymentOrder = {},
                    selectedAccount = $scope.accountsModel.selected;

                paymentOrder.uuid = $scope.paymentOrder.uuid;
                if ($scope.paymentOrder.counterpartyName && $scope.paymentOrder.counterpartyName != "") {
                    paymentOrder.counterpartyName = $scope.paymentOrder.counterpartyName;
                } else if ($scope.paymentOrder.newBeneficiary.accName && $scope.paymentOrder.newBeneficiary.accName != "") {
                    paymentOrder.counterpartyName = $scope.paymentOrder.newBeneficiary.accName;
                    paymentOrder.nickName= $scope.paymentOrder.newBeneficiary.nickname;
                    $scope.paymentOrder.nickName= $scope.paymentOrder.newBeneficiary.nickname;
                } else {
                    paymentOrder.counterpartyName = "";
                }
                paymentOrder.instructedAmount = $scope.paymentOrder.instructedAmount;
                paymentOrder.instructedCurrency = $scope.paymentOrder.instructedCurrency;
                paymentOrder.flag = false;
                if ($scope.paymentOrder.saveContact && $scope.activeTransferTab.newBeneficiary) {
                    $scope.paymentOrder.newBeneficiary.isNew = true;
                    paymentOrder.isNew = $scope.paymentOrder.newBeneficiary.isNew;
                }
                if ($scope.toggleTabs.oneTime) {
                    paymentOrder.limit = $scope.limit.amount;
                }

                if ($scope.activeTransferTab.newBeneficiary) {
                    paymentOrder.counterpartyAccount = $scope.paymentOrder.newBeneficiary.account;
                } else {

                    paymentOrder.counterpartyAccount = $scope.paymentOrder.counterpartyAccount;
                    $scope.paymentOrder.newBeneficiary = null;
                }
                if (paymentOrder.instructedCurrency === "") {
                    paymentOrder.instructedCurrency = selectedAccount.currency;
                }
                paymentOrder.accountId = selectedAccount.id;
                paymentOrder.accountName = selectedAccount.alias;
                switch ($scope.paymentOrder.type) {
                    case $scope.poTypeEnum.bank:
                        paymentOrder = buildBankPaymentOrder(paymentOrder);
                        break;
                    case $scope.poTypeEnum.p2pEmail:
                        paymentOrder = buildP2PEmailPaymentOrder(paymentOrder);
                        break;
                    case $scope.poTypeEnum.p2pAddress:
                        paymentOrder = buildP2PAddressPaymentOrder(paymentOrder);
                        break;
                    default:
                        paymentOrder = buildBankPaymentOrder(paymentOrder);
                        break;
                }

                if ($scope.paymentOrder.saveContact && isNewContact()) {
                    createContact();
                }

                if (!$scope.paymentOrder.isScheduledTransfer) {
                    $scope.paymentOrder.scheduleDate = new Date();
                    $scope.paymentOrderForm.endDate.$modelValue = "";
                    $scope.paymentOrderForm.endDate.$invalid = false;
                    $scope.paymentOrderForm.startDate.$modelValue = "";
                    $scope.paymentOrderForm.startDate.$invalid = false;
                }

                console.log("payment order: " + paymentOrder.paymentDescription);

                if (processPaymentOrder) {

                    localStorage.clear();
                    $scope.paymentOrder.scheduleDate = $scope.paymentOrder.scheduleDate.toString();
                    var navData = {
                        "ftData": paymentOrder,
                        "scopePO": $scope.paymentOrder
                    };
                    console.log("ghgfh" + $scope.paymentOrder.scheduleDate);
                    localStorage.setItem("navigationFlag", true);
                    localStorage.setItem("navigationData", JSON.stringify(navData));
                    console.log("ghgfh" + $scope.paymentOrder.scheduleDate);
                    gadgets.pubsub.publish("launchpad-retail.paymentOrderInitiated");
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_BACK"
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
            if ($scope.paymentOrder.counterpartyName != 'Own Accounts' && $scope.toggleTabs.oneTime && $scope.limit.amount > 0 && $scope.paymentOrder.instructedAmount > $scope.limit.amount) {

                if ($scope.paymentOrder.scheduleDate <= new Date()) {

                    $scope.limitFlag = true;
                    $scope.limitError = idfcConstants.DAILYONETIMELIMITERROR;
                    valid = false;
                }
            }
            return valid;
        };

        var validateEightDigitLimit = function () {
            var valid = true;
            $scope.amountLimitFlag = false;
            /*  if ($scope.paymentOrder.instructedAmount > idfcConstants.FT_AMOUNT_LIMIT) {*/
            if ($scope.paymentOrder.instructedAmount > parseInt($scope.totalLimit)) {
                $scope.amountLimitFlag = true;
                $scope.amountLimitError = idfcConstants.AMTMAXERROR;
                valid = false;
            }
            return valid;
        };

        var validateEightDigitInternalLimit = function () {
            var valid = true;
            $scope.amountIntLimitFlag = false;

            if ($scope.paymentOrder.counterpartyName != 'Own Accounts' && $scope.paymentOrder.instructedAmount > idfcConstants.FT_INTERNAL_AMOUNT_LIMIT) {
                $scope.amountIntLimitFlag = true;
                $scope.amountIntLimitError = idfcConstants.AMTINTMAXERROR;
                valid = false;
            }
            return valid;
        };

        var validateAccountLienAndDormant = function (holdBalance, Status) {
            var valid = true;
            $scope.fromAccountLienFlag = false;
            $scope.fromAccountDormantFlag = false;
            /* if (holdBalance != null && holdBalance > 0) {
                 valid = false;
                 $scope.fromAccountLienFlag = true;
             } else*/
            if (Status != null && Status == idfcConstants.ACCTDORMANT) {
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
                if (data && data !== 'null') {
                    $scope.counterpartyIFSCCode = data.ifscCode;
                    $scope.paymentOrder.benLimit = data.transferLimit;
                }
            });
            xhr.error(function (data, status) {
                if (status == 0) {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(data);
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                }
            });

        };

        function submitUpdate(event) {
            $scope.paymentOrderForm.submitted = true;
            event.preventDefault();
            $scope.errorsBenAmountLimit["amountGreaterThanBenLimit"] = false;
            $scope.errorsAmt["amountLessThanOne"] = false;


            $scope.amountLimitFlag = false;
            $scope.amountIntLimitFlag = false;
            if (!$('#transferMode').is(':hidden')) {
                if ($scope.paymentOrder.instructedAmount > idfcConstants.FT_AMOUNT_LIMIT) {
                    $scope.amountLimitFlag = true;
                    $scope.amountLimitError = idfcConstants.FFT_AMT_VALID_MSG;
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
                var dateEnd = new Date($scope.paymentOrder.scheduledTransfer.endDate);
                var endDateMonth = dateEnd.getMonth() < 9 ? idfcConstants.FFT_ZERO + (dateEnd.getMonth() + 1) : (dateEnd.getMonth() + 1);
                var endDateDay = dateEnd.getDate() < 9 ? idfcConstants.FFT_ZERO + (dateEnd.getDate()) : (dateEnd.getDate());
                finalEndDate = dateEnd.getFullYear() + '-' + endDateMonth + '-' + endDateDay;
            }
            if ($scope.paymentOrder.scheduledTransfer.startDate != null) {
                var dateStart = new Date($scope.paymentOrder.scheduledTransfer.startDate);
                var startDateMonth = dateStart.getMonth() < 9 ? idfcConstants.FFT_ZERO + (dateStart.getMonth() + 1) : (dateStart.getMonth() + 1);
                var startDateDay = dateStart.getDate() < 9 ? idfcConstants.FFT_ZERO + (dateStart.getDate()) : (dateStart.getDate());
                finalStartDate = dateStart.getFullYear() + '-' + startDateMonth + '-' + startDateDay;
            }
            if ($scope.paymentOrder.scheduleDate != null) {
                var dateCreation = new Date($scope.paymentOrder.scheduleDate);
                var creationDateMonth = dateCreation.getMonth() < 9 ? idfcConstants.FFT_ZERO + (dateCreation.getMonth() + 1) : (dateCreation.getMonth() + 1);
                var creationDateDay = dateCreation.getDate() < 9 ? idfcConstants.FFT_ZERO + (dateCreation.getDate()) : (dateCreation.getDate());
                finalCreationDate = dateCreation.getFullYear() + '-' + creationDateMonth + '-' + creationDateDay;
            }

            paymentOrder.uuid = $scope.paymentOrder.uuid;
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


            if ($scope.toggleTabs.oneTime) {
                paymentOrder.limit = $scope.limit.amount;
            }
            paymentOrder.counterpartyAccount = $scope.paymentOrder.counterpartyAccount;
            if (paymentOrder.instructedCurrency === "") {
                paymentOrder.instructedCurrency = selectedAccount.currency;
            }
            paymentOrder.accountId = selectedAccount.id;
            paymentOrder.accountName = selectedAccount.alias;

            paymentOrder = buildBankPaymentOrder(paymentOrder);



            gadgets.pubsub.publish("launchpad-retail.paymentOrderInitiated", {
                ftData: paymentOrder
            });

        };

        var checkNewBenValidation = function () {

            var valid = true;
            $scope.errorsNewBen = {};

            var NewBeneficiaryLimit = idfcConstants.FT_NEWBENEFICIARY_LIMIT;
            if (parseFloat($scope.paymentOrder.instructedAmount) > parseFloat($scope.paymentOrder.newBeneficiary.limit)) {
                $scope.errorsNewBen["benlimitError"] = true;
                valid = false;
                return valid;
            } else if ($scope.paymentOrder.instructedAmount > NewBeneficiaryLimit) {
                $scope.errorsNewBen["NewBeneficiaryLimit"] = true;
                valid = false;
                return valid;
            }

            if ($scope.paymentOrder.newBeneficiary.beneficiaryType) {
                valid = true;
            } else {
                $scope.errorsNewBen["BeneficiaryType"] = true;
                valid = false;
                return valid;
            }
            if ($scope.paymentOrder.newBeneficiary.beneficiaryType.toUpperCase() === "OTH") {
                if ($scope.paymentOrder.newBeneficiary.bank === "Select" || $scope.paymentOrder.newBeneficiary.bank === undefined) {

                    $scope.errorsNewBen["BankName"] = true;
                    valid = false;
                    return valid;
                } else {
                    valid = true;
                }

                if ($scope.paymentOrder.newBeneficiary.ifsc) {
                    var error = $scope.validateIFSCCode($scope.paymentOrder.newBeneficiary.ifsc);
                    if (error) {
                        if (ctrl.ifscValidateErrors['invalidIFSC']) {
                            $scope.errorsNewBen['ifscError'] = false;
                            valid = false;
                        } else {
                            $scope.errorsNewBen["ifscError"] = error;
                            valid = false;
                            /** ifsc code search **/
                            ctrl.ifscValidateErrors['invalidIFSC'] = false;
                            ctrl.savedIfscValidateErrors = false;
                            return valid;
                        }
                    } else {
                        if (ctrl.savedIfscValidateErrors || ctrl.ifscValidateErrors['invalidIFSC']) {
                            $scope.errorsNewBen['ifscError'] = false;
                            valid = false;
                            return valid;
                        }
                    }
                }

            }

            if ($scope.paymentOrder.newBeneficiary.account && $scope.paymentOrder.newBeneficiary.confirmAccount) {
                var error = $scope.validateAccountNumbers($scope.paymentOrder.newBeneficiary.account, $scope.paymentOrder.newBeneficiary.confirmAccount);
                if (error) {
                    $scope.errorsNewBen["acntNumber"] = error;
                    valid = false;
                    return valid;
                }
            }

            if ($scope.paymentOrder.newBeneficiary.nickname) {
                var error = $scope.validateNickName($scope.paymentOrder.newBeneficiary.nickname);
                if (error) {
                    $scope.errorsNewBen["nickName"] = error;
                    valid = false;
                    return valid;
                }

            }
            if ($scope.paymentOrder.newBeneficiary.accType) {
                valid = true;
                return valid;
            } else {
                $scope.errorsNewBen["AcctTypeError"] = true;
                valid = false;
                return valid;
            }
            /*** ifsc code search start ***/
            if (ctrl.ifscValidateErrors['invalidIFSC']) {
                valid = false;
                return valid;
            }
            /*** ifsc code search end ***/
            return valid;
        };




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
            if (difference_ms / converMinutes < idfcConstants.FT_ONEDAY_HRS) {
                var allowedLimit = idfcConstants.FT_ADDED_BENEFICIARY_WITHIN24_LIMIT;
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

            if ($scope.paymentOrder.instructedAmount < idfcConstants.MIN_TRANSFER_AMT) {
                $scope.errorsAmt["amountLessThanOne"] = true;
                valid = false;

            }
            return valid;
        }

        var validateMode = function () {
            $scope.errorsInvalidMode = false;
            var valid = true;
            if ($scope.toggleTabs.scheduled) {
                if ($scope.radioModel === "IMPS") {
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

        $scope.validateAmountBeneficiaryLimit = function () {
            var valid = true;

            if ($scope.paymentOrder.benLimit != null && parseFloat($scope.paymentOrder.instructedAmount) > $scope.paymentOrder.benLimit) {
                $scope.errorsBenAmountLimit["amountGreaterThanBenLimit"] = true;
                valid = false;
            }
            return valid;
        }

        var validateCounterPartyForFutureTransaction = function (limit, benCreationDate, amount) {
            var valid = true;

            var benfyCreationDate = new Date(benCreationDate);

            var benCreationDateMidnight = benfyCreationDate;
            benCreationDateMidnight.setHours(23, 59, 59);

            benCreationDateMidnight.setHours(benCreationDateMidnight.getHours() + 24);

            var SystemDate = $scope.limit.dateServer;

            var today = new Date(SystemDate);
            var scheduleDate = $scope.paymentOrder.scheduleDate ? new Date($scope.paymentOrder.scheduleDate.getTime()) : new Date;
            var scheduledTransferDate = $scope.paymentOrder.scheduledTransfer.startDate ? new Date($scope.paymentOrder.scheduledTransfer.startDate.getTime()) : new Date;
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


        $scope.validateAccountNumbers = function (accountNumber1, accountNumber2) {
            if (accountNumber1 !== accountNumber2) {
                return true;
            }
            return false;
        };

        $scope.validateNickName = function (nickName) {
            var match = false;
            var contactsList;
            contactsList = $scope.contactsModel.contacts;
            angular.forEach(contactsList, function (contact) {
                if (!match && contact.nickName != null) {
                    if (contact.nickName.toLowerCase() == nickName.toLowerCase()) {
                        match = true;
                        return match;
                    }
                }
            });

            return match;
        };

        $scope.validateIFSCCode = function (ifscCode) {
            var ifscRegex = /[A-Z|a-z]{4}[0][A-Z|a-z|0-9]{6}$/;
            return ifscCode.match(ifscRegex) ? false : true;
        };


        var limitManage = function () {
            var self = this;
            var xhr = httpService.getInstance({
                endpoint: widget.getPreference('defaultLimitEndpoint')
            }).read();

            xhr.success(function (data) {
                $scope.limit = {
                    amount: data.limit,
                    dateServer: data.date
                }
            });
            xhr.error(function (data, status) {
                if (status == 0) {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(data);
                    $scope.error = {
                        happened: true,
                        msg: idfcConstants.SERVICE_ERROR
                    }

                }
            });
        };

        var getBankList = function () {
            var self = this;
            var xhr = httpService.getInstance({
                endpoint: widget.getPreference('bankServicesDataSrc'),
                urlVars: {
                    requestId: 'banksList',
                    bizObjId: ''
                }
            }).read();

            xhr.success(function (data) {
                if (data && data !== 'null') {
                    $scope.bankNames = data.banksList;
                    $scope.ifscCodeList = data.ifscList;
                    //added by lalita of limit
                    $scope.totalLimit = data.ribOrSolePropLimList;
                    // $scope.paymentOrder.newBeneficiary.bank =  $scope.bankNames[0];
                    var formattedLimit = numberWithCommas(data.ribOrSolePropLimList);
                    $scope.LimitDivMessage = "Maximum amount –  Rs " + formattedLimit + " ."
                }
            });
            xhr.error(function (data, status) {
                if (status == 0) {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(data);
                    $scope.error = {
                        happened: true,
                        msg: idfcConstants.SERVICE_ERROR
                    }
                }


            });

        };

        //added by lalita of limit
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };


        var getDailyAddedBeneFiciaryCount = function () {
            var self = this;
            var xhr = httpService.getInstance({
                endpoint: widget.getPreference('databaseServicesDataSrc'),
                urlVars: {
                    requestId: 'dailyCount'
                }
            }).read();

            xhr.success(function (data) {
                if (data && data !== 'null') {
                    $scope.BeneAdderror = {
                        happened: false
                    }
                }
            });
            xhr.error(function (data, status) {
                if (status == 0) {
                    gadgets.pubsub.publish("no.internet");
                } else {
                    idfcError.checkTimeout(data);
                    $scope.globalerror = idfcError.checkGlobalError(data);
                    $scope.BeneAdderror = {
                        happened: true,
                        msg: data.rsn
                    }
                }


            });

        };


        $scope.onSaveContactsChange = function () {
            if (autoSave === '' && $scope.paymentOrder.saveContact) {
                $scope.toggleModal();
            }
        };

        $scope.setContactPreference = function (response) {
            autoSave = !!response;
            widget.model.setPreference('autosaveContactsPreference', '' + autoSave);
            widget.model.save();

            $scope.toggleModal();
        };

        $scope.showContactsInfo = function () {
            $scope.showContactsOptions = false;
            $scope.toggleModal();
        };

        $scope.toggleSaveToContactsModal = function () {
            $scope.showContactsOptions = !$scope.showContactsOptions;
        };

        $scope.toggleAutosuggest = function () {
            $(widget.body).find('[name=counterpartyName]').trigger('toggle.autosuggest');
        };

        $scope.cancelForm = function () {
            if ($scope.paymentOrder.update) {
                $scope.resetForm();
                gadgets.pubsub.publish("launchpad-retail.goBackReviewTransfer");
            } else {
                gadgets.pubsub.publish('launchpad-retail.closeActivePanel');
            }
        };

        $scope.resetForm = function () {
            // For new requirement if user select for transfer later user can select only NEFT
            $scope.transferLater = false;
            resetModel();
            resetChildScopes();
            setActiveTransferTabs();
            $scope.errors["benLimit"] = false;

            $scope.paymentOrderForm.submitted = false;
            $scope.paymentOrderForm.$setPristine();

            $scope.persistenceManager.removeFormData(formName);
        };

        $scope.resetCounterparty = function () {
            $scope.$apply(function () {
                $scope.paymentOrder.counterpartyIban = '';
            });
        };

        $scope.updateCounterparty = function (accountDetails) {
            if (accountDetails === null || accountDetails === undefined) {
                $scope.paymentOrder.counterpartyIban = '';

                if ($scope.paymentOrder.type === $scope.poTypeEnum.bank) {
                    if ($scope.usTransfer) {
                        $scope.paymentOrder.counterpartyAccount = '';
                    } else {
                        $scope.paymentOrder.counterpartyIban = '';
                    }
                } else if ($scope.paymentOrder.type === $scope.poTypeEnum.p2pEmail) {
                    $scope.paymentOrder.counterpartyEmail = '';
                }

                $scope.paymentOrderForm.$setDirty();

                return;
            }

            $scope.paymentOrder.selectedCounter = {
                name: $scope.paymentOrder.counterpartyName,
                account: accountDetails.account,
                nickName: $scope.paymentOrder.newBeneficiary.nickname
            };

            $scope.paymentOrder.type = accountDetails.type;
            setActiveTransferTabs();


            if ($scope.paymentOrder.type === $scope.poTypeEnum.bank) {
                if ($scope.usTransfer) {
                    $scope.paymentOrder.counterpartyAccount = accountDetails.account;
                } else {
                    $scope.paymentOrder.counterpartyIban = accountDetails.account;
                }
            } else if ($scope.paymentOrder.type === $scope.poTypeEnum.p2pEmail) {
                $scope.paymentOrder.counterpartyEmail = accountDetails.account;
            }

            $scope.paymentOrderForm.$setDirty();
        };

        $scope.notEqualAccounts = function () {
            if (!$scope.accountsModel.selected) {
                return false;
            }

            return $scope.accountsModel.selected.iban !== $scope.paymentOrder.counterpartyIban;
        };

        $scope.onAccountChange = function () {

            sharedProperties.setProperty($scope.accountsModel.selected.id);
            checkValidAccounts();
        };

        $scope.toggleModal = function () {
            $scope.showContactsOptions = !$scope.showContactsOptions;
        };

        $scope.toggleExchangeRateModal = function () {
            $scope.exchangeRateModalShown = !$scope.exchangeRateModalShown;
        };

        $scope.toggleSaveContactDetailsModal = function () {
            $scope.modalShown = !$scope.modalShown;
        };

        $scope.toggleIbanModal = function () {
            $scope.ibanModalShown = !$scope.ibanModalShown;
        };

        $scope.toggleRoutingNumberModal = function () {
            $scope.routingModalShown = !$scope.routingModalShown;
        };

        $scope.hideAllModals = function () {
            $scope.urgentTransferModalShown = false;
            $scope.exchangeRateModalShown = false;
            $scope.ibanModalShown = false;
            $scope.modalShown = false;
        };

        $scope.toggleUrgentTransferModal = function () {
            $scope.urgentTransferModalShown = !$scope.urgentTransferModalShown;
        };

        $scope.setScheduledTransfer = function (value) {
            $scope.paymentOrder.updateOneTime = true;
            $scope.paymentOrder.updateScheduled = true;
            if (value === 'scheduled') {
                $scope.paymentOrder.isScheduledTransfer = true;
                $scope.toggleTabs.oneTime = false;
                $scope.toggleTabs.scheduled = true;

                if ($('#transferMode').is(':hidden')) {} else {
                    // For new requirement if user select for transfer later user can select only NEFT
                    $scope.impsAmtValidationflag = true;
                    $scope.rtgsAmtValidationflag = true;
                    $scope.radioModel = 'NEFT';
                    $scope.tooltip_msg = idfcConstants.NEFT_MSG;

                    /*if ($scope.paymentOrder.instructedAmount < idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                        $scope.impsAmtValidationflag = true;
                        $scope.rtgsAmtValidationflag = true;
                        $scope.radioModel = 'NEFT';
                        $scope.tooltip_msg = idfcConstants.NEFT_MSG;
                    } else {
                        $scope.impsAmtValidationflag = true;
                        $scope.radioModel = 'RTGS';
                        $scope.rtgsAmtValidationflag = true;
                        $scope.tooltip_msg = idfcConstants.RTGS_MSG;
                    }*/
                }

                $scope.paymentOrder.scheduledTransfer.startDate = new Date((new Date).getTime() + 60 * 60 * 24 * 1000);
                $scope.paymentOrder.scheduledTransfer.endDate = new Date((new Date).getTime() + 60 * 60 * 24 * 1000);
                $scope.paymentOrder.saveContact = false;
                $scope.activeTransferTab.bank = true;
                $scope.activeTransferTab.newBeneficiary = false;
            } else if (value === 'one-time') {
                $scope.paymentOrder.isScheduledTransfer = false;
                $scope.toggleTabs.oneTime = true;
                $scope.toggleTabs.scheduled = false;
                if ($scope.paymentOrder.instructedAmount < idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = false;
                    $scope.rtgsAmtValidationflag = true;
                    $scope.radioModel = 'IMPS';
                    $scope.tooltip_msg = idfcConstants.IMPS_MSG;
                } else if ($scope.paymentOrder.instructedAmount == idfcConstants.FT_IMPS_AMOUNT_LIMIT) {
                    $scope.impsAmtValidationflag = false;
                    $scope.rtgsAmtValidationflag = false;
                    $scope.radioModel = 'IMPS';
                    $scope.tooltip_msg = idfcConstants.IMPS_MSG;
                } else {
                    $scope.impsAmtValidationflag = true;
                    $scope.rtgsAmtValidationflag = false;
                    $scope.radioModel = 'RTGS';
                    $scope.tooltip_msg = idfcConstants.RTGS_MSG;
                }
                $scope.paymentOrder.scheduleDate = new Date();
            }
        };

        $scope.$on('reset', function () {
            $scope.paymentOrder.isScheduledTransfer = false;
            $scope.toggleTabs.oneTime = true;
            $scope.toggleTabs.scheduled = false;
            $scope.paymentOrder.updateScheduled = true;
            $scope.paymentOrder.updateOneTime = true;

        });

        widget.addEventListener('preferencesSaved', function () {
            widget.refreshHTML();
            initialize();
        });

        initialize();

        if (localStorage.getItem("navigationFlag")) {
            if (localStorage.getItem("origin") == "dashboard") {
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
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


        /*lpCoreBus.subscribe('back-to-newtransfer', function(data){  
			  $timeout(function(){
  				//ctrl.checkDailyAddLimit();
				$scope.activeTransferTab.newBeneficiary = true;
			  },1500).then(function(res){
			  		console.log('data from ifsc widget >>>>>>>>>>>>>>>>>>>>>>'+data);
				  
					$timeout(function(){
					    console.log(localStorage.getItem('newTransferModelData'));  
					    $scope.paymentOrder.newBeneficiary = angular.fromJson(localStorage.getItem('newTransferModelData')); 					  
					  
 					}, 500).then(function(){
						if(data){
						$timeout(function(){
							ctrl.dataSelected = true;
							$scope.paymentOrder.newBeneficiary.ifsc = data.ifscCode;
							ctrl.bankDetails = data;
							ctrl.bankDetails.count = 1;
							
							console.log('bank details ::::::::::::::::::::::::::::::::');
							console.log(ctrl.bankDetails);
						},100);
						}
					});
				  
			  });
			

		 });	*/



        $scope.$on('resetDataForIfsc', function (eventObj, data) {
            console.log(':::::::::::::::::::::::::::::::::here :::::::::::::::::::::::::');
            console.log(ctrl.bankDetails);
            ctrl.ifscValidateErrors['invalidIFSC'] = false;
            ctrl.disableBank = false;
            /** ifsc code search **/
            localStorage.setItem('transfer_landing_data', '');
            localStorage.setItem('newTransferModelData', '');
        });
        $scope.$on('IFSCdetailsEvent', function (eventObj, data) {
            console.log('service call happen here ::::::::::::::::::::::::');
            console.log(ctrl.bankDetails);
            if (!ctrl.dataSelected) {
                ctrl.disableBank = true;
                ctrl.loading_spiner = true;
                //adding for spinner
                ctrl.loading = true;

                ctrl.qData.startIndex = 0;
                ctrl.qData.limit = 1;
                ctrl.qData.bankName = $scope.paymentOrder.newBeneficiary.bankName;
                ctrl.qData.ifscCode = data;

                var getIFSCBValidUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                    .getPreference('searchIFSC'), {
                        servicesPath: lpPortal.root
                    });
                //var getIFSCBValidUrl = 'http://10.31.101.113:1120/rs/v1/searchIFSC';
                ifscCodeSearchService
                    .setup({
                        //getIFSCBValidUrl: getIFSCBValidUrl + '?ifscCode='+data+'&bankName='+$scope.paymentOrder.newBeneficiary.bankName,
                        getIFSCBValidUrl: getIFSCBValidUrl,
                        data: ctrl.qData
                    })
                    .getIFSCData()
                    .success(function (data) {
                        console.log(data);
                        ctrl.ifscValidateErrors['invalidIFSC'] = false;

                        if (data.error) {
                            ctrl.ifscValidateErrors['invalidIFSC'] = true;
                            $scope.errorsNewBen['ifscError'] = false;
                            ctrl.savedIfscValidateErrors = false;
                            console.log($scope.contactsModel);
                        } else {
                            ctrl.bankDetails = data.data.searchResult[0];
                            ctrl.bankDetails.count = data.data.count;
                            console.log(ctrl.bankDetails);
                        }
                    }).error(function (data) {

                        /*if (data.cd) {
                        	// If session timed out, redirect to login page
                        	idfcHanlder.checkTimeout(data);
                        	// If service not available, set error flag
                        	$scope.serviceError = idfcHanlder.checkGlobalError(data);

                        	$scope.alert = {
                        		messages: {
                        			cd: data.rsn
                        		}
                        	};
                        	$scope.addAlert('cd', 'error', false);
                        } else {
                        	$scope.alert = {
                        		messages: {
                        			cd: 'Sorry! Our server are not talking to each other'
                        		}
                        	};
                        	$scope.addAlert('cd', 'error', false);								
                        }	*/
                        if (data) {
                            idfcError.checkTimeout(data);
                            $scope.globalerror = idfcError.checkGlobalError(data);
                            $scope.error = {
                                happened: true,
                                msg: idfcConstants.SERVICE_ERROR
                            }
                        } else {
                            $scope.error = {
                                happened: true,
                                msg: 'Sorry! Our machines are not talking to each other. Humans are trying to fix it. Please try after sometime.'
                            }
                        }

                    }).finally(function () {
                        ctrl.disableBank = false;
                        ctrl.loading_spiner = false;
                        //adding to disable spinner
                        ctrl.loading = false;
                    });
            }
        });
        /** not sure link function  **/
        ctrl.goToSearchIFSCpage = function () {
            //$scope.tranferAllowed = false;	
            //$scope.widgetSize = 'small';	  
            //$scope.idfcNewTrans.ifscSearch.bankName = $scope.paymentOrder.newBeneficiary.bank; 
            //$scope.idfcNewTrans.ifscSearch.bankName = 'AHMEDABAD MERCANTILE COOPERATIVE BANK'; 

            $scope.idfcNewTrans.ifscSearch.bankName = $scope.paymentOrder.newBeneficiary.bankName;
            $scope.idfcNewTrans.ifscSearch.ifscCode = ctrl.storeIFSCcode;

            //$scope.paymentOrder.newBeneficiary.ifsc = ctrl.storeIFSCcode;	

            ctrl.searchKeys.bankName = $scope.idfcNewTrans.ifscSearch.bankName;
            ctrl.searchKeys.ifscCode = $scope.idfcNewTrans.ifscSearch.ifscCode;
            ctrl.searchKeys.callingWidget = 'transfer-loaded';
            ctrl.searchKeys.pubsubEvent = 'back-to-newtransfer';


            //ctrl.findBranch(true);
            //ctrl.initialHit = true;	

            //$scope.contactChangeView('ifscSearch');

            var data_for_ifsc_widget = angular.toJson(ctrl.searchKeys);
            localStorage.setItem('ifscformdata', data_for_ifsc_widget);

            console.log(':::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::');
            console.log(ctrl.searchKeys);
            $scope.paymentOrder.newBeneficiary.defaultModelData = {};
            $scope.paymentOrder.newBeneficiary.defaultModelData.decimalAmount = document.querySelector('[aria-label="decimal amount"]').value;
            $scope.paymentOrder.newBeneficiary.defaultModelData.wholeAmount = document.querySelector('[name="wholeAmountInput"]').value;
            $scope.paymentOrder.newBeneficiary.defaultModelData.paymentDescription = document.querySelector('[aria-label="payment description"]').value;
            $scope.paymentOrder.newBeneficiary.defaultModelData.radioModel = $scope.radioModel;
            $scope.paymentOrder.newBeneficiary.defaultModelData.ifscCodeError = ctrl.ifscValidateErrors['invalidIFSC'];

            if (ctrl.ifscValidateErrors['invalidIFSC'])
                $scope.paymentOrder.newBeneficiary.ifscCodeError = ctrl.ifscValidateErrors['invalidIFSC'];
            if (ctrl.savedIfscValidateErrors)
                $scope.paymentOrder.newBeneficiary.ifscCodeError = ctrl.savedIfscValidateErrors;


            $scope.paymentOrder.newBeneficiary.defaultModelData.accountsModelSelectedId = $scope.accountsModel.selected.id;

            //alert(document.querySelector('[aria-label="decimal amount"]').value);
            localStorage.setItem('newTransferModelData', angular.toJson($scope.paymentOrder.newBeneficiary));
            lpCoreBus.publish('launchpad.ifscSearch', ctrl.searchKeys);

        };
        ctrl.setBankDetails = function () {
            //var data = ifscCodeSearchService.getBankData($scope.idfcNewTrans.ifscSearch.bankData); 
            var data = ifscCodeSearchService.getBankData($scope.idfcNewTrans.ifscSearch.itemIndex);
            ctrl.bankDetails = data;
            ctrl.bankDetails.count = 1;
            $scope.paymentOrder.newBeneficiary.ifsc = data.ifscCode;
            $scope.cancelForm();
            $scope.tranferAllowed = true;
            ctrl.dataSelected = true;
        };
        $timeout(function () {
            gadgets.pubsub.publish('cxp.item.loaded', {
                id: widget.id
            });
        }, 10);
    };
});