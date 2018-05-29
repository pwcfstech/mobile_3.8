define(function(require, exports, module) {
    'use strict';
    var $ = require('jquery');
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');
    $('#termsDepositDiv').show();
    var ALERT_TIMEOUT = 4000;

    function CreateRecurringDepositWidgetController($scope, $rootScope,
        lpWidget, $timeout, FinancialInstituteModel, i18nUtils,
        sharedProperties, lpCoreUtils, lpCoreBus, lpPortal, $http) {

        var initialize = function() {
        $scope.errorSpin = true;

            //Session Management Call
            idfcHanlder.validateSession($http);

            $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(
                lpWidget) + '/templates/partials/';
            $scope.increment = parseInt(lpWidget.getPreference(
                'amountToLoad'), 10) || 5;
            $scope.searchIndex = 1;
            $scope.typeFilters = {
                'term': {
                    label: 'term',
                    code: 'term',
                    selected: true
                },
                'recurring': {
                    label: 'recurring',
                    code: 'loan',
                    selected: false
                }
            };
            $scope.search = {
                name: '',
                typeFilter: ''
            };
            $scope.contextLabel = 'All';
            $scope.bookAsPerMOP = false;
            //preload View RD widget
            //gadgets.pubsub.publish('load-viewRD');
        };

        $scope.restartWizard = function() {
            $rootScope.$emit('CallInitializeMethod', {});
            $rootScope.$emit('CallInitializeMethodNominee', {});
            $scope.goToWizardStep(1);
        };
        $scope.reset = function() {};
        $scope.loadAccounts = function() {
            $scope.reset();
            $timeout(function() {}, 2000);
        };
        $scope.close = function() {
            lpCoreBus.publish(
                'launchpad-retail.closeActivePanel');
        };
        initialize();
        $scope.$on('eventSpin', function(event, data) {
            $scope.errorSpin = data;
         });
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
        			gadgets.pubsub.publish("device.GoBack");
        		});
    }

    function RecurringDetailsController($scope, $rootScope, $http,
        lpWidget, $filter, $timeout, sharedProperties, i18nUtils,
        lpCoreUtils, lpCoreBus, lpPortal) {
        $scope.today = function() {
            $scope.futureDateMax = new Date();
        };
        $scope.today();
        $('#panDetailsDiv').hide();
        $('#maturityDetailsDiv').hide();
        $scope.enableNext = false;
        $scope.enableProceed = false;
        $scope.accountSelected = false;
        $scope.AmountEntered = false;
        $scope.tenureYearsSelected = false;
        $scope.tenureMonthsSelected = false;
        $scope.showRDMonths = false;
        $scope.showTenureYears = ['0', '1', '2', '3', '4', '5', '6',
            '7', '8', '9', '10'
        ];
        //$scope.showTenureMonths = ['0', '3', '6', '9'];
        $scope.showTenureMonths = ['6', '9'];
        $scope.showTenureMonthsforNonzero=['0', '3', '6', '9'];
        $scope.selectCurrency = function(curr) {
            return i18nUtils.formatCurrency(curr);
        };
        $scope.changeRadio = function() {
            console.log('chnage radio');
        };
        $('#instllnAmount').keypress(function(e) {
            var regex = new RegExp('^[0-9-]+$');
            var str = String.fromCharCode(!e.charCode ? e.which :
                e.charCode);
            if (regex.test(str)) {
                return true;
            }
            if (e.keyCode === 8) {
                return true;
            }
            e.preventDefault();
            return false;
        });

        var initialize = function() {
            $scope.maxAmountTaxSaver = idfcConstants.TAXSAVER_MAXDEPAMT;
            $scope.deposit = {
                subProductType: 'StandardTermDeposit',
                autoRenewal: 'Yes',
                rateOfInterest: '',
                isModifyHolding: false
            };
            $scope.bookAsPerMOP = false;
            $scope.errorSpin = true;
            $scope.alerts = [];
            $scope.getAcccountDetails();
            $scope.accNuFromSummary = false;
            $scope.flagpanshow = false;
            $scope.addnominee = false;
            $scope.copyNominee = false;
            $scope.getPanDetails();
            var taxSaverFlagParam = 'N';
            $scope.taxSaver = 'false';
            $scope.deposit.taxSaverFlag = $scope.taxSaver;

            //            gadgets.pubsub.subscribe('launchpad-retail.openRecurringDeposits', function(data) {
            if (localStorage.getItem("navigationFlag") && localStorage.getItem("origin") == "From_RD_Details") {
                var data = JSON.parse(localStorage.getItem("navigationData"))
                $scope.accNuFromSummary = true;

                if (undefined == data) {
                    console.log("In FD Deposit IF");
                    $scope.accNuFromSummary = false;
                    $scope.deposit = {
                        accountNumber: ''
                    };

                } else {
                    var balance = '0';
                    if ($scope.acccountNumbers) {
                        var i = 0,
                            len = $scope.acccountNumbers.length;
                        for (; i < len; i++) {
                            if ($scope.acccountNumbers[i].id == data.repaymentAccountNumber) {
                                balance = $scope.acccountNumbers[i].availableBalance;
                                $scope.availableBalance = $scope.acccountNumbers[i].availableBalance;
                                break;
                            }
                        }
                    }
                    $scope.deposit = {
                        accountNumber: data.repaymentAccountNumber,
                        amount: parseInt(data.instlAmt),
                        tenureYears: data.depositPeriodYr,
                        tenureMonths: data.depositPeriodMnths,
                        availableBalance: balance
                    };
//                    $scope.validateInstllnAmount();
                    sharedProperties.setProperty($scope.deposit);
                    localStorage.clear();
                }
            }

            var deckPanelOpenHandler;
            deckPanelOpenHandler = function(activePanelName) {
                if (activePanelName === lpWidget.parentNode
                    .model.name) {
                    lpCoreBus.flush('DeckPanelOpen');
                    lpCoreBus.unsubscribe('DeckPanelOpen',
                        deckPanelOpenHandler);
                    lpWidget.refreshHTML(function(bresView) {
                        lpWidget.parentNode =
                            bresView.parentNode;
                    });
                }
            };
            lpCoreBus.subscribe('DeckPanelOpen',
                deckPanelOpenHandler);


        };

        $scope.$on('$destroy', function() {
            crrdSub.unsubscribe();
        });

        $scope.pollCount = 0;
        $('#tenureDays').removeAttr('disabled');
        $('#tenureYears').removeAttr('disabled');
        $('.autorenewal').removeAttr('disabled');
        $scope.alerts = [];
        $scope.addAlert = function(code, type, timeout) {
            var alert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
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

        $scope.enableProceedButton = function(accSelected, amtEntered, tenureYSelected, tenureMSelected) {
            $scope.enableProceed = false;
            if (accSelected && amtEntered && tenureYSelected &&
                tenureMSelected) {
                $scope.enableProceed = true;
            }
        }

        $scope.$watch('deposit.accountNumber', function(value) {
            $scope.error = {
                happened: false,
                msg: ''
            };
            console.log($scope.deposit);
            if ($scope.accNuFromSummary) {
                console.log($scope.deposit);
                $scope.accountSelected = true;
                $scope.availableBalance = $scope.deposit.availableBalance;
                $scope.deposit.accountNumber = $scope.deposit
                    .accountNumber;
                $scope.AmountEntered = $scope.deposit.amount;
                $scope.tenureYearsSelected = $scope.deposit
                    .tenureYears;
                $scope.tenureMonthsSelected = $scope.deposit
                    .tenureMonths;
                $scope.enableProceedButton($scope.accountSelected,
                    $scope.AmountEntered, $scope.tenureYearsSelected,
                    $scope.tenureMonthsSelected);
            }
            if ($scope.accNuFromSummary == false) {
                $scope.deposit.amount = '';
                $scope.deposit.tenureYears = '';
                $scope.deposit.tenureMonths = '';
                if (value) {
                    $scope.showAccountNumber(value);
                } else {
                    $scope.accountSelected = false;
                }
            }
            $scope.enableProceedButton($scope.accountSelected,
                $scope.AmountEntered, $scope.tenureYearsSelected,
                $scope.tenureMonthsSelected);
        });


        $scope.clearError = function() {
            $scope.error = {
                happened: false,
                msg: ''
            };
        };

        $scope.fetchHomeBranchDetails = function(accNum, mopData) {
            $scope.clearError();
            $scope.enableProceed = false;
            var accNumber;
                                    if(accNum == undefined || accNum == null){
                                        $scope.bookAsPerMOP = false;
                                        $scope.showBal = false;
                                        return;
                                    }else{
                                        accNumber = accNum;
                                        $scope.deposit.accountNumber = accNum;
                                    }
            var modeOfOperationData = mopData;
            if (accNumber != null && accNumber != undefined) {
                $scope.errorSpin = true;
                var getHoldingPattern = lpWidget.getPreference(
                    'getHoldingPattern');
                var getHoldingPatternUrl = lpCoreUtils.resolvePortalPlaceholders(
                    getHoldingPattern, {
                        servicesPath: lpPortal.root
                    });
                var postData = {
                    'baseAccountNumber': accNumber,
                    'mop': modeOfOperationData
                };
                postData = $.param(postData || {});

                var xhr = $http({
                    method: 'POST',
                    url: getHoldingPatternUrl,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });
                xhr.success(function(headers, data) {
                $scope.deposit.accountNumber =  accNumber;
                    $scope.errorSpin = false;
                    $scope.deposit.isModifyHolding = data.isModifyHolding;
                    if (data.isModifyHolding == undefined) { $scope.deposit.isModifyHolding = headers.isModifyHolding; }
                    $scope.modifyHolding = ($scope.deposit.isModifyHolding) ? true : false;
                    $scope.isPANAvail = data.panNumber;
                    if (data.panNumber== undefined) {

                    $scope.isPANAvail = headers.panNumber;
                    if($scope.isPANAvail === "NOT AVAILABLE"){
                    $scope.flagpanshowAvailable = true;
                    $scope.flagpanshow = true;
                    }
                    else{
                    $scope.flagpanshowAvailable = false;
                    $scope.flagpanshow = false;
                    }
                    }
                    else{
                    $scope.flagpanshow = true;
                    }
                    $scope.loggedInUserType = data.loggedInUserType;
                    if (data.loggedInUserType == undefined) { $scope.loggedInUserType = headers.loggedInUserType; }
                    if(headers.mop){
                                                    $scope.bookAsPerMOP = ((headers.mop).toLowerCase() =="singly" )? false: true;
                                                }
                    // $scope.$apply();
                });
                xhr.error(function(headers, data) {
                    $scope.errorSpin = false;
                    $scope.enableProceed = false;
                    $scope.error = {
                        happened: true,
                        msg: 'Sorry, Our machines are not talking to each other! Please try in a while.'
                    };
                    /*$scope.success = {
                        happened: false,
                        msg: ''
                    };*/
                    console.log('error fetch', data);
                });

            }

        }

        $scope.showAccountNumber = function(accNum) {
            $scope.errorSpin = true;
            $scope.showMaturityDetailsDiv = false;
            $scope.resetForm();
            /*function showAccountNumber(value) {*/
            var mopData;
            var accoData = $scope.acccountNumbers;
            if (accNum) {
                $scope.displayRepaymentAccount = true;
                angular.forEach(accoData, function(value, key) {
                    if (value.id == accNum) {
                        $scope.deposit.repayAccNumber = value.accWithType;
                        $scope.deposit.accountNumber = value.id;
                        mopData = value.modeOfOperation;
                        $scope.MOP = value.modeOfOperation;
                        $scope.fetchHomeBranchDetails(accNum, mopData);
                    }
                });
            } else {
                $scope.displayRepaymentAccount = false;
                $scope.deposit.repayAccNumber = "";
                $scope.modifyHolding = false;
            }
            $scope.accountSelected = true;
            if ($scope.accNuFromSummary == false) {
                if (accNum) {
                    var i = 0,
                        len = $scope.acccountNumbers.length;
                    for (; i < len; i++) {
                        if ($scope.acccountNumbers[i].id == accNum) {
                            $scope.showBal = true;
                            $scope.availableBalance = $scope.acccountNumbers[i].availableBalance;
                            $scope.deposit.availableBalance = $scope.acccountNumbers[i].availableBalance;
                            $scope.deposit.accountNumber = $scope.acccountNumbers[i].id;
                        }
                    }
                    sharedProperties.setProperty($scope.deposit);
                    $scope.errorSpin = false;
                    return;
                } else {
                    delete $scope.deposit.accountNumber;
                    delete $scope.deposit.availableBalance;
                    $scope.showBal = false;
                    $scope.errorSpin = false;
                    return;
                }
            } else {
                if (accNum) {
                    $scope.availableBalance = accNum.availableBalance;
                    $scope.deposit.availableBalance = accNum.availableBalance;
                    $scope.deposit.accountNumber = accNum.id;

                    sharedProperties.setProperty($scope.deposit);
                    $scope.accNuFromSummary = false;
                    $scope.accountSelected = true;
                    $scope.errorSpin = false;
                    return;
                }
            }
            $scope.errorSpin = false;
            $scope.accNuFromSummary = false;

        }


        $scope.validateInstllnAmount = function() {
            $scope.AmountEntered = false;
            $scope.error = {
                happened: false,
                msg: ''
            };
            $("#panDetailsDiv").hide();
            $("#maturityDetailsDiv").hide();
            $scope.enableNext = false;
            $scope.flagMinDepositAmt = false;
            $scope.flagdepositamount = false;
            $scope.flagMaxDepositAmt = false;
            $scope.flagamount = false;
            $scope.flagTaxSaverMaxAmt = false;
            console.log($scope.accNuFromSummary);
            var availBal = sharedProperties.getProperty();

            console.log("Inside validate instll amount function" + $scope.deposit.amount);

            if ($scope.deposit.amount) {
                $scope.AmountEntered = true;
            } else {
                $scope.AmountEntered = false;
            }

            if ($scope.deposit.amount < '2000' && $scope.deposit.amount !== '') {
                $scope.AmountEntered = false;
                $scope.error = {
                    happened: true,
                    msg: 'Sorry. That\'s smaller than our smallest allowed Recurring Deposit.'
                };
            } else if ($scope.deposit.amount > '75000') {
                $scope.AmountEntered = false;
                $scope.error = {
                    happened: true,
                    msg: 'Sorry. That\'s larger than our biggest allowed Recurring Deposit'
                };
            } else if ($scope.deposit.amount > availBal.availableBalance) {
                $scope.AmountEntered = false;
                $scope.error = {
                    happened: true,
                    msg: 'Sorry. Looks like that\'s more than you currently have in this account! Reduce the amount to proceed further.'
                };
            }
            if ($scope.AmountEntered) {
                $scope.error.msg = '';
            }
            $scope.enableProceedButton($scope.accountSelected,
                $scope.AmountEntered, $scope.tenureYearsSelected,
                $scope.tenureMonthsSelected);
        }
        $scope.$watch('deposit.tenureYears', function(value) {
            $('#panDetailsDiv').hide();
            $('#maturityDetailsDiv').hide();
            $scope.enableNext = false;
            if (value) {
                $scope.tenureYearsSelected = true;
                $scope.showRDMonths = true;
            } else {
                $scope.tenureYearsSelected = false;
            }
            if (value === '0') {
                //delete $scope.showTenureMonths;
                //$scope.showTenureMonths = ['6', '9'];
                $scope.tenureMths=true;

            } else {
              // delete $scope.showTenureMonthsforNonzero;
               //$scope.showTenureMonthsforNonzero = ['0', '3','6','9'];
               $scope.tenureMths=false;


            }
            if (value === '10') {
            if($scope.tenureMths)
                $("#tenureRDMonths").attr('disabled', true);
            else
                $("#tenureRDMonthsfornonzero").attr('disabled', true);

                $scope.deposit.tenureMonths = '0';
                $scope.tenureMonthsSelected = true;
                $scope.showRDMonths = false;
            } else {
                $('#tenureRDMonths').attr('disabled', false);
                 $("#tenureRDMonthsfornonzero").attr('disabled', false);
            }
            $scope.enableProceedButton($scope.accountSelected,
                $scope.AmountEntered, $scope.tenureYearsSelected,
                $scope.tenureMonthsSelected);
        });
        $scope.$watch('deposit.tenureMonths', function(value) {
            $('#panDetailsDiv').hide();
            $('#maturityDetailsDiv').hide();
            $scope.enableNext = false;
            if (value) {
                $scope.tenureMonthsSelected = true;
            } else {
                $scope.tenureMonthsSelected = false;
            }
            $scope.enableProceedButton($scope.accountSelected,
                $scope.AmountEntered, $scope.tenureYearsSelected,
                $scope.tenureMonthsSelected);
        });
        $scope.updatedPAN = function() {
            lpCoreBus.publish(
                'launchpad-retail.profileContactWidgetOpen'
            );
        };
        $scope.getTDDetails = function() {
            $scope.alerts = [];
            var url = lpWidget.getPreference(
                'preferenceTermValue');
            url = lpCoreUtils.resolvePortalPlaceholders(url, {
                servicesPath: lpPortal.root
            });
            var request = $http({
                method: 'GET',
                url: url + '?cnvId=OTD',
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(response) {
                $scope.existingDeposits = response;
                console.log(
                    ' check $scope.existingDeposits' +
                    $scope.existingDeposits);
                var totalValue = 0;
                for (var i = 0; i < $scope.existingDeposits
                    .length; i++) {
                    var termValue = $scope.existingDeposits[
                        i].trmVl;
                    totalValue = totalValue + termValue;
                }
                $scope.totalTermValue = totalValue;
            }).error(function(response) {
                $scope.alerts = [];
                if (response.cd) {
                    idfcHanlder.checkTimeout(response);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        response);
                    $scope.alert = {
                        messages: {
                            cd: response.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: response.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        };
        $scope.getPanDetails = function() {
            $scope.alerts = [];
            var urlpan = lpWidget.getPreference('preferencePAN');
            urlpan = lpCoreUtils.resolvePortalPlaceholders(
                urlpan + "?dummy=" + new Date().getTime(), {
                    servicesPath: lpPortal.root
                });
            var request = $http({
                method: 'GET',
                url: urlpan,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(response) {
                $scope.pan = response.pan;
                if ($scope.pan === null) {
                    $scope.flagpanshow = true;
                }
            }).error(function(response) {
                $scope.alerts = [];
                if (response.cd) {
                    idfcHanlder.checkTimeout(response);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        response);
                    $scope.alert = {
                        messages: {
                            cd: response.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: response.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        };
        $scope.showTdInterestRate = function() {
            var interestRateURL = lpWidget.getPreference(
                'preferenceIntrestRate');
            interestRateURL = lpCoreUtils.resolvePortalPlaceholders(
                interestRateURL, {
                    servicesPath: lpPortal.root
                });
            window.open(interestRateURL, '_blank');
        };
        $scope.getDepositTypeDetailsOnLoad = function() {
            $scope.alerts = [];
            var urlDepositType = lpWidget.getPreference(
                'preferenceDepositType');
            urlDepositType = lpCoreUtils.resolvePortalPlaceholders(
                urlDepositType, {
                    servicesPath: lpPortal.root
                });
            var request = $http({
                method: 'GET',
                url: urlDepositType +
                    '?onLoad=Y&taxSaverFlag=' +
                    taxSaverFlagParam,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(response) {
                $scope.depositTypeList = response.depositTypeList;
                $scope.depositCodeList = response.depositCodeList;
                $scope.productCodeList = response.productCodeList;
                $scope.productVariantsList = response.productVariantsList;
            }).error(function(response) {
                $scope.alerts = [];
                if (response.cd) {
                    idfcHanlder.checkTimeout(response);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        response);
                    $scope.alert = {
                        messages: {
                            cd: response.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                }
            });
        };
        $scope.getDepositParameterDetail = function(productCode,
            itemCode) {
            $scope.alerts = [];
            var urlDepositType = lpWidget.getPreference(
                'preferenceDepositType');
            urlDepositType = lpCoreUtils.resolvePortalPlaceholders(
                urlDepositType, {
                    servicesPath: lpPortal.root
                });
            var request = $http({
                method: 'GET',
                url: urlDepositType +
                    '?onLoad=N&productCode=' +
                    productCode + '&itemCode=' +
                    itemCode,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(response) {
                $scope.parameterValueList = response.parameterValueList;
                $scope.fetchRateOfInterest();
            }).error(function(response) {
                $scope.alerts = [];
                if (response.cd) {
                    idfcHanlder.checkTimeout(response);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        response);
                    $scope.alert = {
                        messages: {
                            cd: response.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: response.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        };
        $scope.validateAmount = function() {
            if ($scope.deposit.amount < idfcConstants.TD_MINDEPOSITAMT) {
                $scope.flagMinDepositAmt = true;
            }
            if ($scope.deposit.amount > idfcConstants.TD_MAXDEPOSITAMT) {
                $scope.flagMaxDepositAmt = true;
                $scope.flagdepositamount = false;
            }
        };
        $scope.fetchRateOfInterest = function() {
            $scope.alerts = [];
            $scope.flagMinDuration = false;
            $scope.flagMaxDuration = false;
            $scope.flagMaxDurationTmp = false;
            var totalNoOfDays = 0;
            var yearsInDays = 0;
            var minDuration = 0;
            var maxDuration = 0;
            if ($scope.deposit.tenureYears) {
                yearsInDays = $scope.deposit.tenureYears *
                    idfcConstants.TD_NOOFDAYSINYEAR;
            }
            if ($scope.deposit.tenureDays) {
                totalNoOfDays = yearsInDays + parseInt($scope.deposit
                    .tenureDays);
            } else {
                totalNoOfDays = yearsInDays;
            }
            if (((totalNoOfDays >= minDuration && totalNoOfDays <=
                        maxDuration) || $scope.deposit.subProductType ===
                    'TaxSaverTermDeposit') && $scope.deposit.itemCode &&
                $scope.deposit.productType && $scope.deposit.interestPayoutTmp &&
                $scope.deposit.amount >= idfcConstants.TD_MINDEPOSITAMT
            ) {
                var postData = {
                    'tenureYears': 0,
                    'tenureDays': totalNoOfDays,
                    'subProductType': $scope.deposit.itemCode,
                    'productType': $scope.deposit.productType,
                    'amount': $scope.deposit.amount,
                    //                    'interestPayoutTmp': $scope.deposit.interestPayoutTmp,
                    'taxSaverFlag': $scope.taxSaver
                };
                var urlInterestRate = lpWidget.getPreference(
                    'preferenceROI');
                urlInterestRate = lpCoreUtils.resolvePortalPlaceholders(
                    urlInterestRate, {
                        servicesPath: lpPortal.root
                    });
                var data1 = $.param(postData || {});
                var request = $http({
                    method: 'POST',
                    url: urlInterestRate,
                    data: data1,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                }).success(function(data, status, headers,
                    config) {
                    console.log(data);
                    var len = data.interestRate.length;
                    if (($scope.validateValue(data.interestRate))) {
                        var interestRate = data.interestRate
                            .substring(0, len - 2);
                        $scope.rateOfInterestRequired =
                            false;
                        $scope.deposit.rateOfInterest =
                            interestRate;
                    } else {
                        $scope.deposit.rateOfInterest =
                            data.interestRate;
                    }
                    console.log($scope.deposit.rateOfInterest);
                }).error(function(data, status, headers,
                    config) {
                    $scope.alerts = [];
                    $scope.deposit.rateOfInterest =
                        null;
                    if (data.cd) {
                        idfcHanlder.checkTimeout(data);
                        $scope.serviceError =
                            idfcHanlder.checkGlobalError(
                                data);
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error');
                        $scope.error = {
                            happened: true,
                            msg: data.rsn
                        };
                        $scope.success = {
                            happened: false,
                            msg: ''
                        };
                    }
                });
            } else {
                $scope.deposit.rateOfInterest = null;
            }
        };
        /*$scope.showAccountNumber = function(value) {
            $scope.showBal = true;
            $scope.accountSelected = true;
            if ($scope.accNuFromSummary == false) {
                if ($scope.acccountNumbers) {
                    var i = 0,
                        len = $scope.acccountNumbers.length;
                    for (; i < len; i++) {
                        if ($scope.acccountNumbers[i].id ==
                            value) {
                            $scope.availableBalance = $scope.acccountNumbers[
                                i].availableBalance;
                            $scope.deposit.availableBalance =
                                $scope.acccountNumbers[i].availableBalance;
                            $scope.deposit.accountNumber =
                                $scope.acccountNumbers[i].id;
                            console.log($scope.acccountNumbers[
                                i]);
                            sharedProperties.setProperty($scope
                                .acccountNumbers[i]);
                            return;
                        }
                    }
                }
            } else {
                if ($scope.acccountNumbers) {
                    //alert('$scope.deposit.accountNumber'+$scope.deposit.accountNumber);
                    var i = 0,
                        len = $scope.acccountNumbers.length;
                    for (; i < len; i++) {
                        if ($scope.acccountNumbers[i].id ==
                            $scope.deposit.accountNumber) {
                            $scope.availableBalance = $scope.acccountNumbers[
                                i].availableBalance;
                            $scope.deposit.availableBalance =
                                $scope.acccountNumbers[i].availableBalance;
                            $scope.deposit.accountNumber =
                                $scope.acccountNumbers[i].id;
                            console.log($scope.acccountNumbers[
                                i]);
                            sharedProperties.setProperty($scope
                                .acccountNumbers[i]);
                            $scope.accNuFromSummary = false;
                            $scope.accountSelected = true;
                            return;
                        }
                    }
                }
            }
            $scope.accNuFromSummary = false;
        };*/

        $scope.getAcccountDetails = function() {
            $scope.alerts = [];
            var urlacccount = lpWidget.getPreference(
                'getAccountDetails');
            urlacccount = lpCoreUtils.resolvePortalPlaceholders(
                urlacccount + "?dummy=" + new Date().getTime(), {
                    servicesPath: lpPortal.root
                });
            var request = $http({
                method: 'GET',
                url: urlacccount,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers,
                config) {
                $scope.errorSpin = false;
                $rootScope.$broadcast('eventSpin', false);
                console.log(data);
                $scope.acccountNumbers = data;
//                $scope.showAccountNumber(data[0].id);
                console.log($scope.acccountNumbers);
            }).error(function(data, status, headers, config) {
                $scope.alerts = [];
                $scope.errorSpin = false;
                $rootScope.$broadcast('eventSpin', false);
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        };
        $scope.changeDaysYears = function() {
            $scope.flagMinDuration = false;
            $scope.flagMaxDuration = false;
            $scope.flagMaxDurationTmp = false;
            if ($scope.deposit.tenureDays) {
                var years = $scope.deposit.tenureYears;
                var days = $scope.deposit.tenureDays;
                if (days > idfcConstants.TD_NOOFDAYSINYEAR) {
                    var remainder = parseInt(days /
                        idfcConstants.TD_NOOFDAYSINYEAR);
                    var casio = days - (remainder *
                        idfcConstants.TD_NOOFDAYSINYEAR);
                    if ($scope.deposit.tenureYears === null) {
                        $scope.deposit.tenureYears = parseInt(
                            remainder);
                    } else {
                        $scope.deposit.tenureYears = parseInt(
                                $scope.deposit.tenureYears) +
                            parseInt(remainder);
                    }
                    $scope.deposit.tenureDays = casio;
                }
            }
            $scope.fetchRateOfInterest();
        };
        $scope.tenureValidation = function() {
            $scope.flagMinDuration = false;
            $scope.flagMaxDuration = false;
            $scope.flagMaxDurationTmp = false;
            var minDuration = 0;
            var maxDuration = 0;
            var years = $scope.deposit.tenureYears;
            if (!$scope.deposit.tenureDays === '') {
                var days = $scope.deposit.tenureDays;
                if (!$scope.deposit.tenureYears === '') {
                    var totalNoOfDays = (years * idfcConstants.TD_NOOFDAYSINYEAR) +
                        parseInt(days);
                } else {
                    var totalNoOfDays = parseInt(days);
                }
            } else if (!$scope.deposit.tenureYears === '') {
                var totalNoOfDays = (years * idfcConstants.TD_NOOFDAYSINYEAR);
            }
            if ($scope.deposit.subProductType ===
                'StandardTermDeposit') {
                if (totalNoOfDays > maxDuration) {
                    $scope.flagMaxDuration = true;
                }
                if (totalNoOfDays < minDuration) {
                    $scope.flagMinDuration = true;
                }
            }
            $scope.maxDuration1 = parseInt(maxDuration /
                idfcConstants.TD_NOOFDAYSINYEAR);
            var daysRemainder = maxDuration - ($scope.maxDuration1 *
                idfcConstants.TD_NOOFDAYSINYEAR);
            if (totalNoOfDays > maxDuration && daysRemainder >
                0) {
                $scope.flagMaxDurationTmp = true;
                $scope.flagMaxDuration = false;
                $scope.dayRemainder = daysRemainder;
            }
            $scope.minDuration1 = minDuration;
        };
        $scope.submitDetails = function(isFormValid) {
            if (!$scope.deposit.rateOfInterest) {
                $scope.rateOfInterestRequired = true;
            } else {
                $scope.rateOfInterestRequired = false;
            }
            if ($scope.deposit.subProductType ===
                'TaxSaverTermDeposit') {
                $scope.deposit.taxSaverFlag = 'true';
            }
            var minDuration = 0;
            var maxDuration = 0;
            var years = $scope.deposit.tenureYears;
            var days = $scope.deposit.tenureDays;
            var totalNoOfDays = (years * idfcConstants.TD_NOOFDAYSINYEAR) +
                parseInt(days);
            $scope.flagdepositamount = false;
            $scope.flagpanrequired = false;
            $scope.flagamount = false;
            $scope.flagMinDuration = false;
            $scope.flagMaxDuration = false;
            $scope.flagMaxDurationTmp = false;
            $scope.flagMaxDepositAmt = false;
            $scope.flagMinDepositAmt = false;
            $scope.flagTaxSaverMaxAmt = false;
            if ($scope.deposit.subProductType ===
                'StandardTermDeposit') {
                if (totalNoOfDays > maxDuration) {
                    $scope.flagMaxDuration = true;
                }
                if (totalNoOfDays < minDuration) {
                    $scope.flagMinDuration = true;
                }
            }
            $scope.maxDuration1 = parseInt(maxDuration /
                idfcConstants.TD_NOOFDAYSINYEAR);
            var daysRemainder = maxDuration - ($scope.maxDuration1 *
                idfcConstants.TD_NOOFDAYSINYEAR);
            if (totalNoOfDays > maxDuration && daysRemainder >
                0) {
                $scope.flagMaxDurationTmp = true;
                $scope.flagMaxDuration = false;
                $scope.dayRemainder = daysRemainder;
            }
            $scope.minDuration1 = minDuration;
            if ($scope.deposit.amount > idfcConstants.TD_MAXDEPOSITAMT) {
                $scope.flagMaxDepositAmt = true;
                $scope.flagdepositamount = false;
            }
            if ($scope.deposit.amount < idfcConstants.TD_MINDEPOSITAMT) {
                $scope.flagMinDepositAmt = true;
                $scope.flagamount = false;
            }
            if ($scope.deposit.subProductType ===
                'TaxSaverTermDeposit') {
                $scope.deposit.taxSaverFlag = 'true';
                if ($scope.deposit.amount > idfcConstants.TAXSAVER_MAXDEPAMT) {
                    $scope.flagTaxSaverMaxAmt = true;
                    $scope.flagdepositamount = false;
                    $scope.flagMaxDepositAmt = false;
                    $scope.flagamount = false;
                }
            }
            if (!isFormValid) {
                return false;
            }
            if ($scope.flagdepositamount === false) {
                var i = 0,
                    len = $scope.acccountNumbers.length;
                var setDetails = sharedProperties.getProperty();
                for (; i < len; i++) {
                    if ($scope.acccountNumbers[i].id === $scope
                        .deposit.accountNumber) {
                        setDetails.accountNumber = $scope.deposit
                            .accountNumber;
                        setDetails.availableBalance = $scope.deposit
                            .availableBalance;
                        setDetails.amount = $scope.deposit.amount;
                        setDetails.tenureYears = $scope.deposit
                            .tenureYears;
                        setDetails.tenureMonths = $scope.deposit
                            .tenureMonths;
                        setDetails.hmBrnchCd = $scope.acccountNumbers[
                            i].hmBrnchCd;
                        setDetails.modeOfOperation = $scope.acccountNumbers[
                            i].modeOfOperation;
                        break;
                    }
                }
                sharedProperties.setProperty(setDetails);
                $scope.wizardNextStep();
                window.scrollTo(0, 0);
            }
        };
        $scope.submitRDDetails = function(isFormValid) {
            if (!isValid) {
                return false;
            }
            window.scrollTo(0, 0);
        };
        $scope.enableTenureMaturity = function() {
            $scope.deposit = {
                subProductType: 'StandardTermDeposit',
                autoRenewal: 'Yes'
            };
            $('#tenureDays').removeAttr('disabled');
            $('#tenureYears').removeAttr('disabled');
            $('.autorenewal').removeAttr('disabled');
            var taxSaverFlagParam = 'N';
            $scope.taxSaver = 'false';
            $scope.deposit.taxSaverFlag = $scope.taxSaver;
        };
        $scope.disableTenureMaturity = function() {
            $scope.flagMinDuration = false;
            $scope.deposit = {
                subProductType: 'TaxSaverTermDeposit',
                tenureDays: 0,
                tenureYears: 5,
                autoRenewal: 'No'
            };
            $('#tenureDays').attr('disabled', true);
            $('#tenureYears').attr('disabled', true);
            $('.autorenewal').attr('disabled', true);
            var taxSaverFlagParam = 'Y';
            $scope.taxSaver = 'true';
            $scope.deposit.taxSaverFlag = $scope.taxSaver;
        };
        $scope.depositTypes = [{
            depTypeID: 'Cummulative',
            depType: 'Cumulative Term deposit'
        }, {
            depTypeID: 'Monthly',
            depType: 'Traditional Monthly Interest Payout'
        }, {
            depTypeID: 'Quarterly',
            depType: 'Traditional Quarterly Interest Payout'
        }, {
            depTypeID: 'Half-Yearly',
            depType: 'Traditional Half yearly Interest Payout'
        }, {
            depTypeID: 'Yearly',
            depType: 'Traditional Annual Interest Payout'
        }];
        $scope.resetForm = function() {
            $('#amount').val('');
//            $scope.depositDetailsForm.$setPristine();
            $('#instllnAmount').val('');
            delete $scope.deposit.accountNumber;
            delete $scope.deposit.availableBalance;
            delete $scope.deposit.tenureYears;
            delete $scope.deposit.tenureMonths;
            $('#panDetailsDiv').hide();
            $('#maturityDetailsDiv').hide();
            $scope.error = {
                happened: false,
                msg: ''
            };
            $scope.alerts = [];
            $scope.flagdepositamount = false;
            $scope.flagpanrequired = false;
            $scope.submitted = false;
            $scope.deposit.availableBalance = $scope.acccountNumbers[
                0].availableBalance;
            $scope.deposit.accountNumber = $scope.acccountNumbers[
                0].id;
            $rootScope.$emit('CallInitializeMethodNominee', {});
        };
        $scope.cancelForm = function() {
            lpCoreBus.publish(
                'launchpad-retail.closeActivePanel');
        };
        initialize();
        $rootScope.$on('CallInitializeMethod', function() {
            $scope.submitted = false;
            $scope.showBal = false;
            $scope.enableNext = false;
            $('#panDetailsDiv').hide();
            $('#maturityDetailsDiv').hide();
            initialize();
        });
        $scope.validateValue = function(varValue) {
            if (angular.isUndefined(varValue) || varValue ===
                null) {
                return false;
            }
            return true;
        };
        $scope.getformattedDate = function(data) {
            if (data !== null && data !== "") {
                var date = data.split("-");
                var months = ["Jan", "Feb", "Mar", "Apr", "May",
                    "Jun", "Jul", "Aug", "Sep", "Oct",
                    "Nov", "Dec"
                ];
                date[1] = months[(date[1] - 1)];
                var formattedDate = date[2] + "-" + date[1] +
                    "-" + date[0];
                return formattedDate;
            } else {
                return "";
            }
        }
        $scope.checkValues = function() {
            $scope.enableNext = false;
            $scope.errorSpin1 = true;
            $('#panDetailsDiv').hide();
            $('#maturityDetailsDiv').show();
            $scope.enableNext = true;
            var postData = {
                'tenureYears': $scope.deposit.tenureYears,
                'tenureMonths': $scope.deposit.tenureMonths,
                'amount': $scope.deposit.amount,
            };
            var urlmaturityDetails = lpWidget.getPreference(
                'fetchMaturityDetails');
            urlmaturityDetails = lpCoreUtils.resolvePortalPlaceholders(
                urlmaturityDetails + "?dummy=" + new Date()
                .getTime(), {
                    servicesPath: lpPortal.root
                });
            var data1 = $.param(postData || {});
            $http({
                method: 'POST',
                url: urlmaturityDetails,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data) {
                $scope.errorSpin1 = false;
                if (data.length == 0) {
                    $scope.errorSpin1 = true;
                }
                console.log(data);
                $scope.deposit.rateOfInterest = data.interestRate;
                $scope.deposit.maturityAmount = data.maturityAmount;
                $scope.deposit.maturityDate = $scope.getformattedDate(
                    data.maturityDate);
                $scope.maturityDetails = data;
                console.log("data.maturityDate", data.maturityDate);
                console.log(
                    "$scope.deposit.maturityDat0",
                    $scope.deposit.maturityDate);
                sharedProperties.setMaturityDetails(
                    data);
            }).error(function(data) {
                $scope.errorSpin1 = false;
                $scope.enableNext = false;
                $scope.alerts = [];
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
            if (!$scope.isPANAvail) {
                $scope.flagpanshow = true;
                var totAmount = parseInt($scope.totalTermValue) +
                    parseInt($scope.deposit.amount);
                if ($scope.deposit.amount > idfcConstants.TD_DEP_AMOUNT_LIMIT) {
                    $('#panDetailsDiv').show();
                    $scope.enableNext = false;
                    $scope.flagpanrequired = true;
                    $scope.flagamount = true;
                    $scope.error = {
                        happened: true,
                        msg: 'Ouch! That is more than is allowed without your PAN No. Please enter your PAN or call IDFC Bank'
                    };
                } else if (totAmount > idfcConstants.TD_DEP_AMOUNT_LIMIT &&
                    ($scope.deposit.amount <= parseInt(($scope.availableBalance)
                        .split('-')[0]))) {
                    $('#panDetailsDiv').show();
                    $scope.enableNext = false;
                    $scope.flagpanrequired = true;
                    $scope.flagamount = true;
                    $scope.error = {
                        happened: true,
                        msg: 'Sorry. You can\'t have total investment greater than 50,000 without your PAN. Please update your PAN or reduce the installment amount to proceed further.'
                    };
                } else {
                    $('#panDetailsDiv').show();
                    $scope.enableNext = true;
                }
            } else {
                if ($scope.deposit.amount > idfcConstants.TD_DEP_AMOUNT_LIMIT) {
                    $('#panDetailsDiv').show();
                }
                $scope.enableNext = true;
            }
            $scope.reqNomineeDeatils();
        };
        /*Mobile adding this function for date formatting*/
    $scope.getformattedDate = function(data) {
        if (data !== null && data !== "") {
            var date = data.split("-");
            var months = ["Jan", "Feb", "Mar", "Apr", "May",
            "Jun", "Jul", "Aug", "Sep", "Oct",
            "Nov", "Dec"
            ];
            date[1] = months[(date[1] - 1)];
            var formattedDate = date[2] + "-" + date[1] +
            "-" + date[0];
            return formattedDate;
        } else {
            return "";
        }
    };
        $scope.reqNomineeDeatils = function() {
            var nomineeDetailsSrcTemp = sharedProperties.getRecurringDepositNomination();
            var postData = {
                'acctId': $scope.deposit.accountNumber,
                'nomineeType': 'E'
            };
            var urlNomineeDetails = lpWidget.getPreference(
                'fetchNomineeDetails');
            urlNomineeDetails = lpCoreUtils.resolvePortalPlaceholders(
                urlNomineeDetails + "?dummy=" + new Date().getTime(), {
                    servicesPath: lpPortal.root
                });
            var data1 = $.param(postData || {});
            var request = $http({
                method: 'POST',
                url: urlNomineeDetails,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data) {
                nomineeDetailsSrcTemp.nomineeRequired =
                    'true';
                nomineeDetailsSrcTemp.nomineeName =
                    data.accountList[0].nomineeDetails[
                        0].nmnNm;
                nomineeDetailsSrcTemp.relationship =
                    data.accountList[0].nomineeDetails[
                        0].nmnRltnshp;
                // nomineeDetailsSrcTemp.nomineeDOB =
                // data.accountList[0].nomineeDetails[0].DtOfBrth;
                console.log("data" + data.accountList[0]
                    .nomineeDetails[0].DtOfBrth);
                /*nomineeDetailsSrcTemp.nomineeDOB = new Date(
                    data.accountList[0].nomineeDetails[
                        0].DtOfBrth).format(
                    'dd-mmm-yyyy');*/
                nomineeDetailsSrcTemp.nomineeDOB = $scope.getformattedDate(data.accountList[0].nomineeDetails[0].DtOfBrth);
                nomineeDetailsSrcTemp.nomineeAddressLine1 =
                    data.accountList[0].nomineeDetails[
                        0].nmnAddr[0];
                nomineeDetailsSrcTemp.nomineeAddressLine2 =
                    data.accountList[0].nomineeDetails[
                        0].nmnAddr[1];
                nomineeDetailsSrcTemp.nomineeCity =
                    data.accountList[0].nomineeDetails[
                        0].nmnAddr[2];
                nomineeDetailsSrcTemp.nomineeState =
                    data.accountList[0].nomineeDetails[
                        0].nmnAddr[3];
                nomineeDetailsSrcTemp.isMinor = data.accountList[
                    0].nomineeDetails[0].mnr;
                nomineeDetailsSrcTemp.guardianName =
                    data.accountList[0].nomineeDetails[
                        0].grdnNm;
                nomineeDetailsSrcTemp.guardianAddress1 =
                    data.accountList[0].nomineeDetails[
                        0].grdnAddr[0];
                nomineeDetailsSrcTemp.guardianAddress2 =
                    data.accountList[0].nomineeDetails[
                        0].grdnAddr[1];
                nomineeDetailsSrcTemp.guardianCity =
                    data.accountList[0].nomineeDetails[
                        0].grdnAddr[2];
                nomineeDetailsSrcTemp.guardianState =
                    data.accountList[0].nomineeDetails[
                        0].grdnAddr[3];
                sharedProperties.setDepositNomination(
                    nomineeDetailsSrcTemp);
                sharedProperties.setCopyDepositNomination(
                    nomineeDetailsSrcTemp);
                sharedProperties.setRecurringDepositNomination(
                    nomineeDetailsSrcTemp);
            }).error(function(data) {
                $scope.alerts = [];
                if (data.cd && data.rsn !=null) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
        };
        $scope.defaultValues = function(isValid) {
            if (!isValid) {
                return false;
            }
        };
        $scope.authenticateWithSelectedFI = function() {
            $scope.fiModel.clearErrors();
            $scope.fiModel.isConnecting = true;
            var promise;
            if ($scope.fiModel.selectedMembership.id) {
                promise = $scope.fiModel.updateMembershipRequest(
                    $scope.fiModel.selectedMembership);
            } else {
                promise = $scope.fiModel.createMembershipRequest(
                    $scope.fiModel.selected);
            }
            promise.then(function(response) {
                $scope.handleAuthenticationResponse(
                    response);
            }, function() {
                $scope.fiModel.isConnecting = false;
            });
        };
        $scope.updateRequiredCredentials = function(membership) {
            $scope.fiModel.addWarning({
                captionCode: 'extraAuth'
            });
            $scope.fiModel.selected.requiredUserCredentials =
                membership.credentials;
            $scope.fiModel.isConnecting = false;
        };
        $scope.pollForAuth = function(membershipId) {
            $timeout(function() {
                if ($scope.pollCount < 10) {
                    var promise = $scope.fiModel.loadMembershipRequestByID(
                        membershipId);
                    promise.then(function(membership) {
                        $scope.handleAuthenticationResponse(
                            membership);
                        $scope.pollCount++;
                    }, function() {
                        $scope.fiModel.isConnecting =
                            false;
                        $scope.pollCount = 0;
                    });
                } else {
                    $scope.fiModel.addError({
                        captionCode: 'badConnection'
                    });
                    $scope.pollCount = 0;
                }
            }, 2000);
        };
        $scope.handleAuthenticationResponse = function(data) {
            switch (data.status) {
                case 'CREATED':
                    $scope.wizardNextStep();
                    $scope.loadAccounts();
                    break;
                case 'CHALLENGE':
                    $scope.fiModel.selected.extraAuthRequired =
                        true;
                    $scope.updateRequiredCredentials(data);
                    break;
                case 'PENDING':
                    $scope.pollForAuth(data.id);
                    break;
            }
        };
        gadgets.pubsub.subscribe("backButtonActionReceiver", function(evt) {
        			gadgets.pubsub.publish("device.GoBack");
        		});
    }

    function RDTermsController($scope, $rootScope, $filter, lpWidget,
        $timeout, $http, sharedProperties, i18nUtils, lpCoreUtils,
        lpCoreBus, lpPortal) {
        $scope.alerts = [];
        $scope.nomineedisp = sharedProperties.getDepositNomination();
        console.log($scope.nomineedisp);
        $scope.details = sharedProperties.getProperty();
        $scope.maturityDetails = sharedProperties.getMaturityDetails();
        console.log($scope.maturityDetails);
        $scope.addAlert = function(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };
            $scope.alerts.push(customAlert);
            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(
                        customAlert));
                }, ALERT_TIMEOUT);
            }
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
        $scope.processStartDateRDSI = function(startDate) {
            var effectiveStartDate = startDate;
            if (startDate.getDate() > 28 && startDate.getDate() <
                31) {
                if (startDate.getMonth() == 0) {
                    effectiveStartDate.setDate(28);
                }
            }
            return effectiveStartDate;
        };
        $scope.processEndDateRDSI = function(endDate) {
            var effectiveEndDate = endDate;
            return effectiveEndDate;
        };
        $scope.acceptTermDetails = function() {
            $scope.errorSpinTC = true;
            $scope.diableAccept = true;
            $scope.alerts = [];
            var paymentOrder = {};
            var depositDetails = sharedProperties.getDepositNomination();
            paymentOrder.accountId = depositDetails.accountNumber;
            paymentOrder.accountName =
                'Savings Account - Regular';
            paymentOrder.instructedAmount = depositDetails.amount;
            paymentOrder.counterpartyName = 'own Account RD';
            paymentOrder.instructedCurrency = 'INR';
            paymentOrder.flag = false;
            paymentOrder.counterpartyAccount = '';
            paymentOrder.type = 'BANK';
            paymentOrder.txnMode = 'STO';
            paymentOrder.paymentDescription = 'RD';
            paymentOrder.newBeneficiary = null;
            paymentOrder.scheduledTransfer = {};
            paymentOrder.scheduledTransfer.frequency =
                'MONTHLY';
            paymentOrder.scheduledTransfer.startDate = (new Date()
                .getTime()) / 1000; //need to set
            paymentOrder.scheduledTransfer.endDate = (new Date()
                .getTime()) / 1000; //need to set
            paymentOrder.paymentMode = 'RECURRING';
            var noOfMonths = parseInt(depositDetails.tenureMonths);
            var noOfYears = parseInt(depositDetails.tenureYears);
            noOfMonths = noOfMonths + (noOfYears * 12);
            var siNoOfMonths = noOfMonths - 2;
            var siStartDate = new Date(); //currentDate;
            var effectiveStartDateRDSI = $scope.processStartDateRDSI(
                siStartDate);
            if (effectiveStartDateRDSI.getDate() == 31) {
                paymentOrder.scheduledTransfer.frequency =
                    'EOM';
            }
            effectiveStartDateRDSI.setMonth(
                effectiveStartDateRDSI.getMonth() + 1);
            var stDate = effectiveStartDateRDSI.getTime();
            paymentOrder.scheduledTransfer.startDate = stDate;
            var effectiveEndDateRDSI = $scope.processStartDateRDSI(
                siStartDate);
            effectiveEndDateRDSI.setMonth(effectiveEndDateRDSI.getMonth() +
                siNoOfMonths);
            var endDate = effectiveEndDateRDSI.getTime();
            var viewSIStartDate = new Date(stDate);
            paymentOrder.scheduledTransfer.endDate = endDate;
            console.log(depositDetails);
            var urltermdeposit = lpWidget.getPreference(
                'CreateRecurringDeposit');
            urltermdeposit = lpCoreUtils.resolvePortalPlaceholders(
                urltermdeposit + "?dummy=" + new Date().getTime(), {
                    servicesPath: lpPortal.root
                });
            $rootScope.$broadcast('eventName', null);
            var data1 = $.param(depositDetails || {});
            var request = $http({
                method: 'POST',
                url: urltermdeposit,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers,
                config) {
                $scope.diableAccept = false;
                $scope.errorSpinTC = false;
                var rdAcctNo = data.rdAccountNumber;
                if (rdAcctNo != null && rdAcctNo != '') {
                    rdAcctNo = rdAcctNo.replace(/-/g,
                        '');
                }
                paymentOrder.counterpartyAccount =
                    rdAcctNo;
               /* var urlSiRd = lpWidget.getPreference(
                    'serviceURLSiRd');
                urlSiRd = lpCoreUtils.resolvePortalPlaceholders(
                    urlSiRd, {
                        servicesPath: lpPortal.root
                    });
                var data2 = $.param(paymentOrder || {});
                var request = $http({
                    method: "POST",
                    url: urlSiRd,
                    data: data2,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                }).success(function(data11, status,
                    headers, config) {
                    $scope.success.tranx = {
                        happened: true,
                        msg: "Transaction successful ! Please note  your transaction ID is : " +
                            data11.txnId
                    };
                });*/
                sharedProperties.setResponse(rdAcctNo);
                $scope.rdAccountNumber = rdAcctNo;
                var dd = viewSIStartDate.getDate();
                var mm = viewSIStartDate.getMonth() + 1; //January is 0!
                var yyyy = viewSIStartDate.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                var fromdate1 = dd + '/' + mm + '/' +
                    yyyy;
                $scope.successMessagedata = {
                    rdAccountNumber: rdAcctNo,
                    rdDate: viewSIStartDate.getDate(),
                    rdMonth: viewSIStartDate.getMonth(),
                    formattedDate: fromdate1
                };
                $rootScope.$broadcast('eventName',
                    $scope.successMessagedata);
                $scope.success = {
                    happened: true,
                    msg: "RD a/c no is ...!" +
                        rdAcctNo
                };
                accountRefresh();
                $scope.goToWizardStep(4);
            }).error(function(data, status, headers, config) {
                $scope.errorSpinTC = false;
                $scope.diableAccept = false;
                if (data.cd) {
                    $rootScope.$broadcast('eventName2',
                        $scope.alerts);
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = true;
                    $rootScope.$broadcast('eventName1',
                        $scope.serviceError);
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                }
            });
            window.scrollTo(0, 0);
        };

        function accountRefresh() {
            gadgets.pubsub.publish(
                "launchpad-retail.refreshAccountSummary");
        }

        gadgets.pubsub.subscribe("backButtonActionReceiver", function(evt) {
        			gadgets.pubsub.publish("device.GoBack");
        		});
    }

    function RDCongratsController($scope, $rootScope, $filter, lpWidget,
        $timeout, $http, sharedProperties, i18nUtils, lpCoreUtils,
        lpCoreBus, lpPortal) {
        $scope.openView = function() {
            localStorage.clear();
            localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","createRD");
            localStorage.setItem("navigationData",$scope.rdAccountNumber);
            gadgets.pubsub.publish('launchpad-retail.recurringDepositDetails');
        };
        $scope.$on('eventName', function(event, data) {
            if (null != data) {
                $scope.rdAccountNumber = data.rdAccountNumber;
                $scope.rdDate = data.rdDate;
                $scope.rdMonth = data.rdMonth;
                $scope.formattedDate = data.formattedDate;
                if ($scope.rdAccountNumber) {
                    $scope.sendEmailadvice();
                }
            }
            gadgets.pubsub.flush(
                "launchpad-retail.openRecurringDeposits"
            );
            gadgets.pubsub.unsubscribe(
                "launchpad-retail.openRecurringDeposits"
            );
        });
        $scope.$on('eventName1', function(event, data) {
            $scope.serviceError = data;
        });
        $scope.$on('eventName2', function(event, data) {
            $scope.alerts = data;
        });
        $scope.sendEmailadvice = function() {
            var urlPdfAdvice = lpWidget.getPreference(
                'PdfAdviceSrc');
            urlPdfAdvice = lpCoreUtils.resolvePortalPlaceholders(
                urlPdfAdvice + "?dummy=" + new Date().getTime(), {
                    servicesPath: lpPortal.root
                });
            urlPdfAdvice = urlPdfAdvice + '&accountNumber=' +
                $scope.rdAccountNumber;
            var request = $http({
                method: 'GET',
                url: urlPdfAdvice,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(response) {
                var postData = {
                    'pan': response.pan,
                    'amt': response.amt,
                    'acctHldr': response.acctHldr,
                    'brnchNm': response.brnchNm,
                    'dpstAcct': response.dpstAcct,
                    'mtrtyAmt': response.mtrtyAmt,
                    'strtDy': response.strtDy,
                    'strtMnth': response.strtMnth,
                    'strtYr': response.strtYr,
                    'intRt': response.intRt,
                    'tnr': response.tnr,
                    'mtrtyDy': response.mtrtyDy,
                    'mtrtyMnth': response.mtrtyMnth,
                    'mtrtyYr': response.mtrtyYr,
                    'intrstFrq': response.intrstFrq,
                    'mtInstrctns': response.mtInstrctns,
                    'nmntn': response.nmntn,
                    'mpDesc': response.mpDesc
                };
                console.log('postData' + postData);
                $scope.FetchRdDetailsPdfEndPoint =
                    lpWidget.getPreference(
                        'FetchRdDPdfSrc');
                var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(
                    $scope.FetchRdDetailsPdfEndPoint, {
                        servicesPath: lpPortal.root
                    });
                pdfUrl = pdfUrl + "?accountNumber=" +
                    response.dpstAcct + "&email=" +
                    true;
                var data1 = $.param(postData || {});
                var xhr = $http({
                    method: 'POST',
                    url: pdfUrl,
                    data: data1,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    },
                    responseType: 'arraybuffer'
                });
                xhr.success(function(data) {}).error(
                    function(data) {
                        $scope.successMessagePDFEmail =
                            'No Records found';
                        $scope.errorEmail = {
                            happened: true,
                            msg: data.rsn
                        };
                    });
            }).error(function(response) {});
        };
        gadgets.pubsub.subscribe("backButtonActionReceiver", function(evt) {
        			gadgets.pubsub.publish("device.GoBack");
        		});
    }

    function RDNomineeDetailsController($scope, $rootScope, $filter,
        lpWidget, $timeout, $http, sharedProperties, i18nUtils,
        lpCoreUtils, lpCoreBus, lpPortal) {
        $scope.today = function() {
            $scope.futureDateMax = new Date();
        };
        $scope.today();
        $('#copyNomineeDetailsDiv').hide();
        var relationList = [];
        $scope.alerts = [];
        $scope.addAlert = function(code, type, timeout) {
            var alert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
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

        $scope.clearError = function() {
            $scope.error = {
                happened: false,
                msg: ''
            };
        };

        /*$scope.fetchHomeBranchDetails = function (accNum,mopDetail) {
            var mopData;
            var accNumber;
            if(accNum == undefined || accNum == null){
                $scope.bookAsPerMOP = false;
                $scope.showBal = false;
                return;
            }else{
                accNumber = accNum;
            }

            if(mopDetail){
                mopData = mopDetail;
            }
            else{
            var accoData = $scope.acccountNumbers;
                if(accNum){

                        angular.forEach(accoData, function (value, key) {
                            if(value.id == accNum){
                                $scope.repayAccNumber = value.accWithType;
                                mopData = value.modeOfOperation;
                                showAccountNumber(accNum);
                                */
        /*$scope.bookAsPerMOP = ((value.modeOfOperation).toLowerCase()=="singly")? false: true;*/
        /*
                                    }
                                });
                        }
                    }
                    $scope.clearError();
                    $scope.enableProceed = false;


                    if(accNumber != null && accNumber != undefined){
                        $scope.errorSpin = true;
                        var getHoldingPatternEndPoint = '$(servicesPath)/rs/v1/getHoldingPattern';
                        var getHoldingPatternUrl = lpCoreUtils
                        .resolvePortalPlaceholders(getHoldingPatternEndPoint, {
                            servicesPath: lpPortal.root
                        });
                        var postData = {
                            'baseAccountNumber':accNumber,
                            'mop':mopData
                        };
                        postData = $.param(postData || {});

                        var xhr = $http({
                            method : 'POST',
                            url : getHoldingPatternUrl,
                            data : postData,
                             headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded;'
                             }
                           });
                        xhr.success(function(headers, data) {
                            $scope.errorSpin = false;
                            if(headers.mop){
                                $scope.bookAsPerMOP = ((headers.mop).toLowerCase() =="singly" )? false: true;
                            }

                            console.log('sucess fetch',headers);
                            var regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
                            if(regpan.test(headers.panNumber) == false){
                                $scope.pan = undefined;
                            }else{
                                $scope.pan = headers.panNumber;
                            }

                        } );
                        xhr.error(function(headers, data) {
                            $scope.errorSpin = false;
                            $scope.enableProceed = false;
                            $scope.error = {
                                    happened: true,
                                    msg: 'Sorry, Our machines are not talking to each other! Please try in a while.'
                                };
                                */
        /*$scope.success = {
                                    happened: false,
                                    msg: ''
                                };*/
        /*
                            console.log('error fetch',data);
                        });

                    }
                }*/


        var initialize = function() {
            var nomineeDetails = sharedProperties.getNominee();
            $scope.nominee = {
                nomineeName: nomineeDetails.nomineeName,
                relationship: nomineeDetails.relationship
            };
            var urlrelationshipstate = lpWidget.getPreference(
                'preferenceRelationshipState');
            urlrelationshipstate = lpCoreUtils.resolvePortalPlaceholders(
                urlrelationshipstate, {
                    servicesPath: lpPortal.root
                });
            var request = $http({
                method: 'GET',
                url: urlrelationshipstate +
                    '?requestId=relationList',
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers,
                config) {
                $scope.alerts = [];
                console.log(data);
                $scope.relationnameList = data.relationnameList;
                relationList = data.relationnameList;
                $scope.relationcodeList = data.relationcodeList;
                console.log($scope.acccountNumbers);
            }).error(function(data, status, headers, config) {
                $scope.alerts = [];
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
            urlrelationshipstate = lpWidget.getPreference(
                'preferenceRelationshipState');
            urlrelationshipstate = lpCoreUtils.resolvePortalPlaceholders(
                urlrelationshipstate, {
                    servicesPath: lpPortal.root
                });
            var request = $http({
                method: 'GET',
                url: urlrelationshipstate +
                    '?requestId=stateList',
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers,
                config) {
                $scope.alerts = [];
                console.log(data);
                $scope.states = data.statenameList;
            }).error(function(data, status, headers, config) {
                $scope.alerts = [];
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error');
                    $scope.error = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                }
            });
            $scope.nominees = [{
                nomineeId: '1',
                nomineeName: 'Alex Smith'
            }, {
                nomineeId: '2',
                nomineeName: 'Margaret Tiffany'
            }, {
                nomineeId: '3',
                nomineeName: 'George Will'
            }];
            $scope.relationTypes = [{
                relID: 'Father',
                relType: 'Father'
            }, {
                relID: 'Mother',
                relType: 'Mother'
            }, {
                relID: 'Child',
                relType: 'Child'
            }, {
                relID: 'Sibling',
                relType: 'Sibling'
            }, {
                relID: 'Guardian',
                relType: 'Guardian'
            }];
            $scope.countries = [{
                cntryID: '1',
                cntryName: 'India'
            }, {
                cntryID: '2',
                cntryName: 'Nepal'
            }, {
                cntryID: '3',
                cntryName: 'Sri Lanka'
            }, {
                cntryID: '4',
                cntryName: 'Bhutan'
            }, {
                cntryID: '5',
                cntryName: 'Bangladesh'
            }];
            var nomineeDetails = sharedProperties.getNominee();
            if (nomineeDetails.nomineeRelationship === $scope.relationTypes[
                0].relID) {
                $scope.nominee = {
                    nomineeName: nomineeDetails.nomineeName,
                    relationship: $scope.relationTypes[0].relID
                };
            } else if (nomineeDetails.nomineeRelationship ===
                $scope.relationTypes[1].relID) {
                $scope.nominee = {
                    nomineeName: nomineeDetails.nomineeName,
                    relationship: $scope.relationTypes[1].relID
                };
            } else if (nomineeDetails.nomineeRelationship ===
                $scope.relationTypes[2].relID) {
                $scope.nominee = {
                    nomineeName: nomineeDetails.nomineeName,
                    relationship: $scope.relationTypes[2].relID
                };
            } else if (nomineeDetails.nomineeRelationship ===
                $scope.relationTypes[3].relID) {
                $scope.nominee = {
                    nomineeName: nomineeDetails.nomineeName,
                    relationship: $scope.relationTypes[3].relID
                };
            } else if (nomineeDetails.nomineeRelationship ===
                $scope.relationTypes[4].relID) {
                $scope.nominee = {
                    nomineeName: nomineeDetails.nomineeName,
                    relationship: $scope.relationTypes[4].relID
                };
            }
             localStorage.clear(); // duplicate data issue

        };
        initialize();
        $rootScope.$on('CallInitializeMethodNominee', function() {
            $scope.resetFormNominee();
        });
        $scope.resetFormNominee = function() {
            $scope.nomineeDetailsForm.$setPristine();
            $('#copyNomineeDetailsDiv').hide();
            $('#nomineeDetailsDiv').hide();
            $('#nomineeGuardianDetailsDiv').hide();
            $('#copyNomineeValuesDiv').hide();
            $('#copyNomineeGuardianDetails').hide();
            var radio_addNomineeNo = document.getElementById(
                'addnomineeNo');
            var radio_addNomineeYes = document.getElementById(
                'addnomineeYes');
            radio_addNomineeNo.checked = true;
            radio_addNomineeYes.checked = false;
            $scope.copynomineegrp = false;
            $scope.submitted = false;
            $scope.nomineeNotRequired = true;
        };
        $scope.pollCount = 0;
        $scope.openDepositDetails = {
            accountNumber: '',
            amount: '',
            tenureYears: '',
            tenureDays: '',
            rateOfInterest: '',
            nomineeRequired: '',
            nomineeName: '',
            nomineeDOB: '',
            isMinor: '',
            relationship: '',
            nomineeAddressLine1: '',
            nomineeAddressLine2: '',
            nomineeState: '',
            nomineeCity: '',
            nomineeId: '',
            guardianName: '',
            guardianRelationship: '',
            guardianAddress1: '',
            guardianAddress2: '',
            guardianState: '',
            guardianCity: '',
            hmBrnchCd: '',
            modeOfOperation: ''
        };
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();
        $scope.clear = function() {
            $scope.dt = null;
        };
        $scope.disabled = function(date, mode) {
            return (mode === 'day' && (date.getDay() === 0 ||
                date.getDay() === 6));
        };
        $scope.toggleMin = function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();
        $scope.open = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[opened] = true;
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd',
            'dd.MM.yyyy', 'shortDate'
        ];
        $scope.format = $scope.formats[0];
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var afterTomorrow = new Date();
        afterTomorrow.setDate(tomorrow.getDate() + 2);
        $scope.events = [{
            date: tomorrow,
            status: 'full'
        }, {
            date: afterTomorrow,
            status: 'partially'
        }];
        $scope.getDayClass = function(date, mode) {
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0,
                    0, 0);
                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date)
                        .setHours(0, 0, 0, 0);
                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }
            return '';
        };
        $('#nomineeGuardianDetailsDiv').hide();
        //Todo 20 Sep
        $('#nomineeDetailsDiv').hide();
        $('#copyNomineeValuesDiv').hide();
        $('#copyNomineeGuardianDetails').hide();
        $scope.submitNomineeDetails = function(isFormValid) {
            if ($scope.nomineeNotRequired) {
                $scope.wizardNextStep();
                $scope.skipNomineeDetails(true);
                return;
            }
            if (!$scope.nominee.nomineeName) {
                $scope.nomineeNameRequired = true;
            } else {
                $scope.nomineeNameRequired = false;
            }
            if ($scope.nomineeCopied) {
                isFormValid = true;
                $scope.setNomineeDetails();
                $scope.wizardNextStep();
                return;
            }
            if (!isFormValid) {
                return false;
            } else {
                var oneDay = 24 * 60 * 60 * 1000;
                var currTime = new Date().getTime();
                var nomineeDOB = $('#nomineeDOB').val();
                nomineeDOB = $scope.nominee.nomineeDOB.getTime();
                var nomineeTime = $scope.nominee.nomineeDOB.getTime();
                var diff = currTime - nomineeTime;
                var diffDays = diff / oneDay;
                var diffYears = diffDays / idfcConstants.TD_NOOFDAYSINYEAR;
                var tenureYearsInDays = 0;
                if (diffYears <= idfcConstants.TD_MINOR_AGE) {
                    $scope.showNominee = true;
                    $scope.showGuardianAdd1 = true;
                    $('#nomineeGuardianDetailsDiv').show();
                    $('#guardianName').attr('required', true);
                    $('#guardianRelationId').attr('required',
                        true);
                    if ($scope.nominee.guardianName) {
                        var depositDetails = sharedProperties.getProperty();
                        $scope.openDepositDetails.accountNumber =
                            depositDetails.accountNumber;
                        $scope.openDepositDetails.amount =
                            depositDetails.amount;
                        $scope.openDepositDetails.tenureYears =
                            depositDetails.tenureYears;
                        $scope.openDepositDetails.tenureMonths =
                            depositDetails.tenureMonths;
                        $scope.openDepositDetails.hmBrnchCd =
                            depositDetails.hmBrnchCd;
                        $scope.openDepositDetails.modeOfOperation =
                            depositDetails.modeOfOperation;
                        var maturityDetail = sharedProperties.getMaturityDetails();
                        $scope.openDepositDetails.rateOfInterest =
                            maturityDetail.rateOfInterest;
                        $scope.openDepositDetails.nomineeName =
                            $scope.nominee.nomineeName;
                        var nomineeDOB = $scope.nominee.nomineeDOB
                            .getTime();
                        $scope.openDepositDetails.nomineeDOB =
                            nomineeDOB;
                        $scope.openDepositDetails.relationship =
                            $scope.nominee.relationship;
                        $scope.openDepositDetails.nomineeAddressLine1 =
                            $scope.nominee.nomineeAddressLine1;
                        $scope.openDepositDetails.nomineeAddressLine2 =
                            $scope.nominee.nomineeAddressLine2;
                        $scope.openDepositDetails.nomineeState =
                            $scope.nominee.nomineeState;
                        $scope.openDepositDetails.nomineeCity =
                            $scope.nominee.nomineeCity;
                        $scope.openDepositDetails.nomineeId =
                            $scope.nominee.nomineeId;
                        $scope.openDepositDetails.guardianName =
                            $scope.nominee.guardianName;
                        $scope.openDepositDetails.guardianDOB =
                            $scope.nominee.guardianDOB;
                        $scope.openDepositDetails.guardianRelationship =
                            $scope.nominee.guardianRelationship;
                        $scope.openDepositDetails.guardianAddress1 =
                            $scope.nominee.guardianAddress1;
                        $scope.openDepositDetails.guardianAddress2 =
                            $scope.nominee.guardianAddress2;
                        $scope.openDepositDetails.guardianState =
                            $scope.nominee.guardianState;
                        $scope.openDepositDetails.guardianCity =
                            $scope.nominee.guardianCity;
                        $scope.openDepositDetails.isMinor = 'Y';
                        $scope.openDepositDetails.nomineeRequired =
                            'true';
                        $scope.openDepositDetails.taxSaverFlag =
                            depositDetails.taxSaverFlag;
                        console.log($scope.openDepositDetails);
                        sharedProperties.setDepositNomination(
                            $scope.openDepositDetails);
                        $scope.wizardNextStep();
                    }
                } else {
                    $('#guardianName').removeAttr('required');
                    $('#guardianDOB').removeAttr('required');
                    $('#guardianRelationId').removeAttr(
                        'required');
                    var depositDetails = sharedProperties.getProperty();
                    $scope.openDepositDetails.accountNumber =
                        depositDetails.accountNumber;
                    $scope.openDepositDetails.amount =
                        depositDetails.amount;
                    $scope.openDepositDetails.tenureYears =
                        depositDetails.tenureYears;
                    $scope.openDepositDetails.tenureMonths =
                        depositDetails.tenureMonths;
                    $scope.openDepositDetails.hmBrnchCd =
                        depositDetails.hmBrnchCd;
                    $scope.openDepositDetails.modeOfOperation =
                        depositDetails.modeOfOperation;
                    tenureYearsInDays = depositDetails.tenureYears *
                        idfcConstants.TD_NOOFDAYSINYEAR;
                    $scope.openDepositDetails.tenureDays =
                        tenureYearsInDays + parseInt(
                            depositDetails.tenureDays);
                    $scope.openDepositDetails.autoRenewal =
                        depositDetails.autoRenewal;
                    $scope.openDepositDetails.rateOfInterest =
                        depositDetails.rateOfInterest;
                    $scope.openDepositDetails.nomineeName =
                        $scope.nominee.nomineeName;
                    var nomineeDOB = $scope.nominee.nomineeDOB.getTime();
                    $scope.openDepositDetails.nomineeDOB =
                        nomineeDOB;
                    $scope.openDepositDetails.relationship =
                        $scope.nominee.relationship;
                    $scope.openDepositDetails.nomineeAddressLine1 =
                        $scope.nominee.nomineeAddressLine1;
                    $scope.openDepositDetails.nomineeAddressLine2 =
                        $scope.nominee.nomineeAddressLine2;
                    $scope.openDepositDetails.nomineeState =
                        $scope.nominee.nomineeState;
                    $scope.openDepositDetails.nomineeCity =
                        $scope.nominee.nomineeCity;
                    $scope.openDepositDetails.nomineeId =
                        $scope.nominee.nomineeId;
                    $scope.openDepositDetails.guardianName =
                        $scope.nominee.guardianName;
                    $scope.openDepositDetails.guardianRelationship =
                        $scope.nominee.guardianRelationship;
                    $scope.openDepositDetails.guardianAddress1 =
                        $scope.nominee.guardianAddress1;
                    $scope.openDepositDetails.guardianAddress2 =
                        $scope.nominee.guardianAddress2;
                    $scope.openDepositDetails.guardianState =
                        $scope.nominee.guardianState;
                    $scope.openDepositDetails.guardianCity =
                        $scope.nominee.guardianCity;
                    $scope.openDepositDetails.isMinor = 'N';
                    $scope.openDepositDetails.nomineeRequired =
                        'true';
                    $scope.openDepositDetails.taxSaverFlag =
                        depositDetails.taxSaverFlag;
                    sharedProperties.setDepositNomination(
                        $scope.openDepositDetails);
                    $scope.wizardNextStep();
                }
            }
        };
        $scope.setNomineeDetails = function() {
            var depositDetails = sharedProperties.getProperty();
            var nomineeDetailsCopied = sharedProperties.getDepositNomination();
            $scope.openDepositDetails.accountNumber =
                depositDetails.accountNumber;
            $scope.openDepositDetails.amount = depositDetails.amount;
            $scope.openDepositDetails.tenureYears =
                depositDetails.tenureYears;
            $scope.openDepositDetails.tenureMonths =
                depositDetails.tenureMonths;
            $scope.openDepositDetails.hmBrnchCd =
                depositDetails.hmBrnchCd;
            $scope.openDepositDetails.modeOfOperation =
                depositDetails.modeOfOperation;
            var maturityDetail = sharedProperties.getMaturityDetails();
            $scope.openDepositDetails.rateOfInterest =
                maturityDetail.rateOfInterest;
            $scope.openDepositDetails.nomineeName =
                nomineeDetailsCopied.nomineeName;
            var nomineeDOB = nomineeDetailsCopied.nomineeDOB;
            $scope.openDepositDetails.relationship =
                nomineeDetailsCopied.relationship;
            $scope.openDepositDetails.nomineeAddressLine1 =
                nomineeDetailsCopied.nomineeAddressLine1;
            $scope.openDepositDetails.nomineeAddressLine2 =
                nomineeDetailsCopied.nomineeAddressLine2;
            $scope.openDepositDetails.nomineeState =
                nomineeDetailsCopied.nomineeState;
            $scope.openDepositDetails.nomineeCity =
                nomineeDetailsCopied.nomineeCity;
            $scope.openDepositDetails.guardianName =
                nomineeDetailsCopied.guardianName;
            $scope.openDepositDetails.guardianAddress1 =
                nomineeDetailsCopied.guardianAddress1;
            $scope.openDepositDetails.guardianAddress2 =
                nomineeDetailsCopied.guardianAddress2;
            $scope.openDepositDetails.guardianState =
                nomineeDetailsCopied.guardianState;
            $scope.openDepositDetails.guardianCity =
                nomineeDetailsCopied.guardianCity;
            $scope.openDepositDetails.nomineeRequired = 'true';
            console.log($scope.openDepositDetails);
            sharedProperties.setDepositNomination($scope.openDepositDetails);
            $scope.wizardNextStep();
        };
        $scope.hideGuardianDetail = function() {
            $scope.nomineeNameRequired = false;
            $scope.guardianNameRequired = false;
            var oneDay = 24 * 60 * 60 * 1000;
            var currTime = new Date().getTime();
            $scope.$watch('openDepositDetails.nomineeDOB',
                function() {
                    var nomineeDOB = $('#nomineeDOB').val();
                    nomineeDOB = $scope.nominee.nomineeDOB.getTime();
                    var nomineeTime = $scope.nominee.nomineeDOB
                        .getTime();
                    var diff = currTime - nomineeTime;
                    var diffDays = diff / oneDay;
                    var diffYears = diffDays /
                        idfcConstants.TD_NOOFDAYSINYEAR;
                    var tenureYearsInDays = 0;
                    $('#nomineeGuardianDetailsDiv').show();
                    $scope.showNominee = true;
                    $scope.showGuardianAdd1 = true;
                    if (diffYears > idfcConstants.TD_MINOR_AGE) {
                        $('#nomineeGuardianDetailsDiv').hide();
                        $scope.showNominee = false;
                        $scope.showGuardianAdd1 = false;
                        $('#guardianName').val('');
                        $('#guardianAddress1').val('');
                        $('#guardianAddress2').val('');
                        $('#guardianCity').val('');
                        $('#guardianStateId').val('');
                    }
                });
        };
        $scope.skipNomineeDetails = function(skipNomineeFlag) {
            var depositDetails = sharedProperties.getProperty();
            var tenureYearsInDays = 0;
            var recurringDepositDetails = sharedProperties.getDepositNomination();
            var maturityDetail = sharedProperties.getMaturityDetails();
            recurringDepositDetails.rateOfInterest =
                maturityDetail.rateOfInterest;
            recurringDepositDetails.accountNumber =
                depositDetails.accountNumber;
            recurringDepositDetails.amount = depositDetails.amount;
            //            recurringDepositDetails.interestPayout =
            //                depositDetails.interestPayout;
            //            recurringDepositDetails.interestPayoutTmp =
            //                depositDetails.interestPayoutTmp;
            recurringDepositDetails.tenureYears =
                depositDetails.tenureYears;
            recurringDepositDetails.tenureMonths =
                depositDetails.tenureMonths;
            recurringDepositDetails.hmBrnchCd = depositDetails.hmBrnchCd;
            recurringDepositDetails.modeOfOperation =
                depositDetails.modeOfOperation;
            if (skipNomineeFlag) {
                recurringDepositDetails.nomineeName = 'NA';
                recurringDepositDetails.nomineeDOB = '';
                recurringDepositDetails.relationship = 'NA';
                recurringDepositDetails.nomineeAddressLine1 =
                    '';
                recurringDepositDetails.nomineeAddressLine2 =
                    '';
                recurringDepositDetails.nomineeState = '';
                recurringDepositDetails.nomineeCity = '';
                recurringDepositDetails.guardianName = '';
                recurringDepositDetails.isMinor = '';
                recurringDepositDetails.guardianRelationship =
                    '';
                recurringDepositDetails.guardianAddress2 = '';
                recurringDepositDetails.guardianState = '';
                recurringDepositDetails.guardianCity = '';
                recurringDepositDetails.nomineeRequired =
                    'false';
            } else {
                var nomineeDetails = sharedProperties.getRecurringDepositNomination();
                recurringDepositDetails.nomineeName =
                    nomineeDetails.nomineeName;
                recurringDepositDetails.nomineeDOB =
                    nomineeDetails.nomineeDOB;
                recurringDepositDetails.relationship =
                    nomineeDetails.relationship;
                recurringDepositDetails.nomineeAddressLine1 =
                    nomineeDetails.nomineeAddressLine1;
                recurringDepositDetails.nomineeAddressLine2 =
                    nomineeDetails.nomineeAddressLine2;
                recurringDepositDetails.nomineeState =
                    nomineeDetails.nomineeState;
                recurringDepositDetails.nomineeCity =
                    nomineeDetails.nomineeCity;
                recurringDepositDetails.guardianName =
                    nomineeDetails.guardianName;
                recurringDepositDetails.isMinor =
                    nomineeDetails.isMinor;
                recurringDepositDetails.guardianRelationship =
                    nomineeDetails.guardianRelationship;
                recurringDepositDetails.guardianAddress2 =
                    nomineeDetails.guardianAddress2;
                recurringDepositDetails.guardianState =
                    nomineeDetails.guardianState;
                recurringDepositDetails.guardianCity =
                    nomineeDetails.guardianCity;
                recurringDepositDetails.nomineeRequired =
                    'true';
            }
            sharedProperties.setDepositNomination(
                recurringDepositDetails);
            console.log('skip nom' + recurringDepositDetails);
        };
        $scope.showSubmit = true;
        $scope.nomineeCopied = false;
        $scope.nomineeNotRequired = true;
        $scope.nomineeRequired = false;
         $scope.showNoNomMessage = true;
        $scope.showNomineeDetails = function() {
            $scope.error = {
                happened: false,
                msg: ''
            };
            $('#copyNomineeDetailsDiv').show();
            $('#nomineeDetailsDiv').hide();
            $scope.copynomineegrp = false;
            $scope.showSubmit = false;
            $scope.nomineeNotRequired = false;
            $scope.nomineeRequired = true;
             $scope.showNoNomMessage = false;
        };
        $scope.hideNomineeDetails = function() {
            $scope.error = {
                happened: false,
                msg: ''
            };
            $('#copyNomineeDetailsDiv').hide();
            $('#nomineeDetailsDiv').hide();
            $('#nomineeGuardianDetailsDiv').hide();
            $('#copyNomineeValuesDiv').hide();
            $('#copyNomineeGuardianDetails').hide();
            $scope.skipNomineeDetails(true);
            $scope.nomineeNotRequired = true;
            $scope.showSubmit = false;
            $scope.showNoNomMessage = true;
        };
        $scope.showCopyNomineeDetails = function() {
            $scope.error = {
                happened: false,
                msg: ''
            };
            $('#nomineeDetailsDiv').hide();
            /*$('#copyNomineeValuesDiv').show();*/
            $('#nomineeGuardianDetailsDiv').hide();
            $scope.showDetails(sharedProperties.getCopyDepositNomination());
            sharedProperties.setRecurringDepositNomination(
                sharedProperties.getCopyDepositNomination()
            );
        };
        $scope.showDetails = function(nomineeDetailsSrc) {
            if (nomineeDetailsSrc.nomineeName === '' ||
                nomineeDetailsSrc.nomineeName === null) {
                console.log("showDetails nominee in recurring");
                $('#nomineeDetailsDiv').hide();
                $('#copyNomineeValuesDiv').hide();
                $('#copyNomineeGuardianDetails').hide();
                $scope.nomineeRequired = true;
                $scope.nomineeCopied = false;
                $scope.error = {
                    happened: true,
                    msg: 'Oops! There is no nominee registered for the selected account. Please enter nominee details.'
                };
            } else {
                $('#copyNomineeValuesDiv').show();
                $scope.nominee.nomineeName = nomineeDetailsSrc.nomineeName;
                $scope.nominee.relationship = nomineeDetailsSrc
                    .relationship;
                $scope.nominee.nomineeDOB = nomineeDetailsSrc.nomineeDOB;
                $scope.nominee.nomineeAddressLine1 =
                    nomineeDetailsSrc.nomineeAddressLine1;
                $scope.nominee.nomineeAddressLine2 =
                    nomineeDetailsSrc.nomineeAddressLine2;
                $scope.nominee.nomineeState = nomineeDetailsSrc
                    .nomineeState;
                $scope.nominee.nomineeCity = nomineeDetailsSrc.nomineeCity;
                if (nomineeDetailsSrc.isMinor === 'true') {
                    $('#copyNomineeGuardianDetails').show();
                    $scope.nominee.guardianName =
                        nomineeDetailsSrc.guardianName;
                    $scope.nominee.guardianAddress1 =
                        nomineeDetailsSrc.guardianAddress1;
                    $scope.nominee.guardianAddress2 =
                        nomineeDetailsSrc.guardianAddress2;
                    $scope.nominee.guardianState =
                        nomineeDetailsSrc.guardianState;
                    $scope.nominee.guardianCity =
                        nomineeDetailsSrc.guardianCity;
                } else {
                    $('#copyNomineeGuardianDetails').hide();
                }
                $scope.nomineeCopied = true;
                $scope.showSubmit = false;
            }
            $scope.nomineeNotRequired = false;
        };
        $scope.hideCopyNomineeDetails = function() {
            $scope.error = {
                happened: false,
                msg: ''
            };
            //copiedNomineeDetails = true;
            $scope.nomineeCopied = false;
            $('#nomineeDetailsDiv').show();
            $('#copyNomineeValuesDiv').hide();
            $('#copyNomineeGuardianDetails').hide();
            $scope.showSubmit = false;
            $scope.nomineeNotRequired = false;
            $scope.nominee.nomineeName = '';
            $scope.nominee.relationship = '';
            $scope.nominee.nomineeDOB = '';
            $scope.nominee.nomineeAddressLine1 = '';
            $scope.nominee.nomineeAddressLine2 = '';
            $scope.nominee.nomineeState = '';
            $scope.nominee.nomineeCity = '';
            $scope.nominee.guardianName = '';
            $scope.nominee.guardianAddress1 = '';
            $scope.nominee.guardianAddress2 = '';
            $scope.nominee.guardianState = '';
            $scope.nominee.guardianCity = '';
        };
        $scope.handleAuthenticationResponse = function(data) {
            switch (data.status) {
                case 'CREATED':
                    $scope.wizardNextStep();
                    $scope.loadAccounts();
                    break;
                case 'CHALLENGE':
                    $scope.fiModel.selected.extraAuthRequired =
                        true;
                    $scope.updateRequiredCredentials(data);
                    break;
                case 'PENDING':
                    $scope.pollForAuth(data.id);
                    break;
            }
        };
        gadgets.pubsub.subscribe("backButtonActionReceiver", function(evt) {
        			gadgets.pubsub.publish("device.GoBack");
        		});
         $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }



    exports.CreateRecurringDepositWidgetController =
        CreateRecurringDepositWidgetController;
    exports.RecurringDetailsController = RecurringDetailsController;
    exports.RDTermsController = RDTermsController;
    exports.RDCongratsController = RDCongratsController;
    exports.RDNomineeDetailsController = RDNomineeDetailsController;
});