define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHandler = require('idfcerror');
    var backtoDashboard = false;
    var origin = '';
    var target = '';

    function OpenDepositsWidgetController($scope, $rootScope, $http,
        lpCoreUtils, lpWidget, $timeout, i18nUtils, lpCoreBus,
        lpPortal) {

        this.utils = lpCoreUtils;
        this.widget = lpWidget;
        $scope.errorSpin = true;

        $scope.backFromPdf = function() {
            $(".pdf").hide();
            $("#start").show();
            $(".start").show();
            if (origin == 'Dashboard') {
                backtoDashboard = true;
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
            }
        };

        var initialize = function() {

            //Session Management Call
            idfcHandler.validateSession($http);

            $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(
                lpWidget) + '/templates/partials';
            $scope.templates = {
                deposit: $scope.partialsDir +
                    '/DepositDetails.html',
                nominee: $scope.partialsDir +
                    '/NomineeDetails.html',
                congrats: $scope.partialsDir +
                    '/Congrats.html',
                tandC: $scope.partialsDir + '/TandC.html',
                pdf: $scope.partialsDir + '/openPdf.html'
            };
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
        };
        gadgets.pubsub.subscribe("native.back", function(evt) {
            angular.forEach(document.getElementsByClassName(
                "tooltip"), function(e) {
                e.style.display = 'none';
            })
            if (backtoDashboard && origin == 'Dashboard') {
                backtoDashboard = false;
                gadgets.pubsub.publish(
                    "launchpad-retail.backToDashboard");
            } else {
                $scope.backFromPdf();
            }
            localStorage.clear();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if (localStorage.getItem("navigationFlag")) {
                angular.forEach(document.getElementsByClassName(
                    "tooltip"), function(e) {
                    e.style.display = 'none';
                })
                if (backtoDashboard && origin == 'Dashboard') {
                    backtoDashboard = false;
                    gadgets.pubsub.publish(
                        "launchpad-retail.backToDashboard");
                } else {
                    $scope.backFromPdf();
                }
                localStorage.clear();
            } else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });
        $scope.restartWizard = function() {
            $rootScope.$emit('CallInitializeMethod', {});
            $rootScope.$emit('CallInitializeMethodNominee', {});
            $scope.goToWizardStep(1);
        };
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
//        $scope.errorSpin = false;
    }

    function DepositDetailsController($scope, $rootScope, $http,
        lpWidget, lpCoreUtils, lpCoreError, lpCoreBus, lpPortal,
        $filter, $timeout, sharedProperties, i18nUtils, httpService
    ) {
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;

        $scope.pdfOpen = function() {
            backtoDashboard = false;
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });
            $("#start").hide();
            $(".start").hide();
            $(".pdf").show();
            var interestRateURL;
            if (interestRateURL === undefined ||
                interestRateURL === null) {
                interestRateURL =
                    "http://www.idfcbank.com/content/dam/idfc/pdf/Interest%20Rate.pdf";

            }
            $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(
                    lpWidget) +
                '/templates/partials/IDFCInterestRates.pdf';
            var url = $scope.partialsDir;
            console.log("URL is: " + interestRateURL);
            PDFJS.disableWorker = true;

            console.log(PDFJS.getDocument(interestRateURL));

            PDFJS.getDocument(interestRateURL).then(function getPdfHelloWorld(pdf) {
                pdf.getPage(1).then(function getPageHelloWorld(page) {
                    var scale = 0.7;
                    var viewport = page.getViewport(scale);
                    var canvas = document.getElementById('canvas');
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    page.render({
                        canvasContext: context,
                        viewport: viewport
                    });
                });
            });
        };

        var initialize = function() {

        $scope.taxSaverOption=false;
        			$scope.showTaxSaver=true;

        			var taxSaverFlagParam = 'N';
        			var taxSaver = 'false';
        			var TD_TAXSAVER_MONTHLY_1A = 'TD_TAXSAVER_MONTHLY_1A';
        			var TD_TAXSAVER_CUMULATIVE_M = 'TD_TAXSAVER_CUMULATIVE_M';
        			var TD_TAXSAVER_QUARTERLY_3A = 'TD_TAXSAVER_QUARTERLY_3A';
        			var TD_TAXSAVER_HALFYEARLY_6A = 'TD_TAXSAVER_HALFYEARLY_6A';
        			var TD_TAXSAVER_ANNUAL_YA = 'TD_TAXSAVER_ANNUAL_YA';

        			var TD_TAXSAV_SENCITI_MONTHLY_1A='TD_TAXSAV_SENCITI_MONTHLY_1A';
        			var TD_TAXSAV_SENCITI_CUMULATIVE_M='TD_TAXSAV_SENCITI_CUMULATIVE_M';
        			var TD_TAXSAV_SENCITI_QUARTERLY_3A='TD_TAXSAV_SENCITI_QUARTERLY_3A';
        			var TD_TAXSAV_STFF_CUMULATIVE_M='TD_TAXSAV_STFF_CUMULATIVE_M';
        			var TD_TAXSAV_STFF_MONTHLY_1A='TD_TAXSAV_STFF_MONTHLY_1A';
        			var TD_TAXSAV_STFF_QUARTERLY_3A ='TD_TAXSAV_STFF_QUARTERLY_3A';

        			var TD_TAXSAV_SENCITI_STFF_QUARTERLY_3A ='TD_TAX_SAV_SENIOR_STF_QUARTERLY_3A';
        			var TD_TAXSAV_SENCITI_STFF_CUMULATIVE_M='TD_TAX_SAV_SENIOR_STF_CUMULATIVE_M';
        			var TD_TAXSAV_SENCITI_STFF_MONTHLY_1A='TD_TAX_SAV_SENIOR_STF_MONTHLY_1A';


        			//TD_TaxSav_Senciti_Stff_Monthly_1A
        			$scope.bookAsPerMOP = false;
        			$scope.maxAmountTaxSaver = idfcConstants.TAXSAVER_MAXDEPAMT;
        			$scope.notValidAccount = false;
        			$scope.flagamount = false;
        			$scope.flagpanshow = false;
        			$scope.maturityAmt= '';
        			$scope.maturityDate = '';
        			$scope.deposit = {
        				subProductType: 'StandardTermDeposit',
        				autoRenewal: 'Yes',
        				rateOfInterest: '',
        				sweepInFlag: 'Yes',
        				modifyHoldingPattern: 'No',
        				amount: ''
        			};
        			$scope.errorSpin = true;
        			$scope.alerts = [];
        			$scope.deposit.taxSaverFlag = taxSaver;
        			$scope.taxSaverOption=false;
        			i18nUtils.loadMessages(lpWidget, 'en').success(function (bundle) {
        				$scope.messages = bundle.messages;
        			});
        			$scope.getAcccountDetails();
        			$scope.getPanDetails();
        			$scope.getDepositTypeDetailsOnLoad(taxSaverFlagParam);
        };
        $scope.pollCount = 0;
        $('#tenureDays').removeAttr('disabled');
        $('#tenureYears').removeAttr('disabled');
        $('.autorenewal').removeAttr('disabled');
        $scope.openTermDeposit = function(type, $event) {
            $('#recurringDepositDiv').hide();
            $('#termsDepositDiv').show();
        };
        $scope.openRecurringDeposit = function(type, $event) {
            $('#termsDepositDiv').hide();
            $('#recurringDepositDiv').show();
        };
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
                }, 'Time Out');
            }
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
        $scope.$watch('deposit.accountNumber', function(value) {
            if (value) {
                if ($scope.acccountNumbers) {
                    var i = 0,
                        len = $scope.acccountNumbers.length;
                    for (; i < len; i++) {
                        if ($scope.acccountNumbers[i].id ===
                            value) {
                            $scope.availableBalance =
                                $scope.acccountNumbers[i].availableBalance;
                            return;
                        }
                    }
                }
            }
        });
        $scope.$watch('deposit.amount', function(value) {
            $scope.flagMinDepositAmt = false;
            $scope.flagdepositamount = false;
            $scope.flagMaxDepositAmt = false;
            $scope.flagamount = false;
            $scope.flagTaxSaverMaxAmt = false;
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
            $http({
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
                    $scope.serviceError = idfcHandler.checkGlobalError(
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
                urlpan, {
                    servicesPath: lpPortal.root
                });
            $http({
                method: 'GET',
                url: urlpan,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(response) {
            $scope.isNRICustomer = response.isNRICustomer;
               /* $scope.pan = response.pan;
                if ($scope.pan === '') {
                    $scope.flagpanshow = true;
                    document.getElementById(
                            'taxsaverRadio').disabled =
                        true;
                    $scope.errors = {};

                }
                if ($scope.pan == null) {
                    $scope.flagpanshow = true;
                    document.getElementById(
                            'taxsaverRadio').disabled =
                        true;
                    $scope.errors = {};

                }*/
            }).error(function(response) {
                $scope.alerts = [];
                if (response.cd) {
                    $scope.serviceError = idfcHandler.checkGlobalError(
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
            $scope.pdfOpen();
        };
        $scope.getDepositTypeDetailsOnLoad = function(
            taxSaverFlagParam) {
            $scope.depositTypeList=[];
            $scope.alerts = [];
            var urlDepositType = lpWidget.getPreference(
                'preferenceDepositType');
            urlDepositType = lpCoreUtils.resolvePortalPlaceholders(
                urlDepositType, {
                    servicesPath: lpPortal.root
                });
            $http({
                method: 'GET',
                url: urlDepositType +
                    '?onLoad=Y&taxSaverFlag=' +
                    taxSaverFlagParam +'&isBib=false' + '&custAccountType=' + $scope.custAccountType,
                // data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(response) {
                $scope.depositTypeList = response.depositTypeList;
                // 3.1 tax saver fd
                if(taxSaverFlagParam!="N"){
                   if ($scope.taxSaverOption === true && response.depositTypeList.indexOf("Fixed Deposit - Short Term") != (-1)) {
                                    response.depositTypeList.splice(response.depositTypeList.indexOf("Fixed Deposit - Short Term"), 1);
                                } //3.1 end
                }

                $scope.depositTypeList = response.depositTypeList;
                $scope.depositCodeList = response.depositCodeList;
                $scope.productCodeList = response.productCodeList;
                $scope.productVariantsList = response.productVariantsList;
                $scope.prodVariantLabelList = response.prodVariantLabelList;
            }).error(function(response) {
                $scope.alerts = [];
                if (response.cd) {
                    $scope.serviceError = idfcHandler.checkGlobalError(
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
            $http({
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
                $scope.parameterNameList = response.parameterNameList;
                $scope.fetchRateOfInterest();
            }).error(function(response) {
                $scope.alerts = [];
                if (response.cd) {
                    $scope.serviceError = idfcHandler.checkGlobalError(
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
        $scope.$watch('deposit.interestPayout', function(value) {
            if (value) {
                var index = $scope.depositTypeList.indexOf(
                    value);
                var itemCode = $scope.depositCodeList[index];
                var productCode = $scope.productCodeList[
                    index];
                var productVariant = $scope.productVariantsList[
                    index];
                $scope.deposit.itemCode = itemCode;
                var tmpProdVariantLabel = $scope.prodVariantLabelList[
                    index];
                $scope.deposit.productType = productCode;
                $scope.deposit.interestPayoutTmp =
                    productVariant;
                $scope.deposit.prodVariantLabel =
                    tmpProdVariantLabel;
                $scope.getDepositParameterDetail(
                    productCode, itemCode);
            }
        });
        //3.1 change tax saver
        $scope.$watch('deposit.subProductType', function(value) {
                    if (value) {
                       if(value == 'StandardTermDeposit' || value == 'TaxSaverTermDeposit')
                       {
                         $scope.maturityAmt ='';
                         $scope.maturityDate ='';
                          $scope.error = {
                                         happened: false,
                                         msg: ''
                          };
                       }
                    }
         });

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
            //3.1 chnages added below
            $scope.flagDepositType = false;
            $scope.flagDepositYear = false;
            $scope.flagInvldYear = false;
            $scope.FlagtenureDaysNgtv = false;
            $scope.FlagtenureDaysMndry = false;
            $scope.FlagtenureDaysinvld = false; //end 3.1
            var totalNoOfDays = 0;
            var yearsInDays = 0;
            var parameterName = $scope.parameterNameList[0];
            var minDuration = 0;
            var maxDuration = 0;
            if (parameterName === 'MIN_DURATION') {
                minDuration = $scope.parameterValueList[0];
                maxDuration = $scope.parameterValueList[1];
            } else {
                minDuration = $scope.parameterValueList[1];
                maxDuration = $scope.parameterValueList[0];
            }
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
            if ($scope.deposit.subProductType === 'TaxSaverTermDeposit') { //3.1 change tax saver
                totalNoOfDays = parseInt('1826');
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
                    'interestPayoutTmp': $scope.deposit.interestPayoutTmp,
                    'taxSaverFlag': $scope.deposit.taxSaverFlag // 3.1 change tax saver
                };
                var urlInterestRate = lpWidget.getPreference(
                    'preferenceROI');
                urlInterestRate = lpCoreUtils.resolvePortalPlaceholders(
                    urlInterestRate, {
                        servicesPath: lpPortal.root
                    });
                $scope.errorSpin1 = true;
                var data1 = $.param(postData || {});
                $http({
                    method: 'POST',
                    url: urlInterestRate,
                    data: data1,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                }).success(function(data, status, headers,
                    config) {
                    $scope.errorSpin1 = false;
                    if (data.length === 0) {
                        $scope.errorSpin1 = true;
                    }
                    console.log(data);
                    $scope.maturityAmt = $filter("currency")(data.maturityAmount, '', 2);
                    $scope.maturityDate = data.maturityDate;
                    $scope.interestPayable = data.interestValue;
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
                    $scope.errorSpin1 = false;
                    if (data.cd) {
                        $scope.serviceError =
                            idfcHandler.checkGlobalError(
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
            } // if End
            else {
                $scope.deposit.rateOfInterest = null;
                $scope.maturityAmt = null;
                $scope.maturityDate = null;
            }
        };


        $scope.clearError = function () {
            $scope.error = {
                happened: false,
                msg: ''
            };
            $scope.success = {
                happened: false,
                msg: ''
            };
        };

        $scope.removePreviousData = function () {
            $('#amount').val('');
            /*$scope.depositDetailsForm.$setPristine();*/
            if ($scope.deposit.subProductType === 'StandardTermDeposit') {
                $('#tenureYears').val('');
                $('#tenureDays').val('');
            }
            $('#tenureRDYears').val('');
            $('#tenureRDMonths').val('');
            $('#debitDate').val('');
            $('#instllnAmount').val('');
            $scope.maturityAmt = '';
            $scope.maturityDate = '';
            $scope.interestPayable = '';
            $scope.bookAsPerMOP = false;
            $scope.deposit.sweepInFlag = 'Yes';
            $scope.deposit.autoRenewal = 'Yes';
            /*$scope.deposit.subProductType = 'StandardTermDeposit';*/
            // ddc.enableTenureMaturity();
            $scope.deposit.rateOfInterest = '';         
            $scope.deposit.amount = '';
            delete $scope.deposit.interestPayout;
            $scope.pan = '';
            $scope.flagdepositamount = false;
            $scope.flagpanrequired = false;
            $scope.flagamount = false;
            $scope.flagMinDuration = false;
            $scope.flagMaxDuration = false;
            $scope.flagMaxDurationTmp = false;
            $scope.flagMaxDepositAmt = false;
            $scope.flagMinDepositAmt = false;
            $scope.rateOfInterestRequired = false;
            $scope.flagTaxSaverMaxAmt = false;
            $scope.flagDepositMaxLnth = false;
            $scope.flagAccntMndtry = false;
            //ddc.flagAmntMndtry = false;
            //ddc.flagAmntInvld = false;
            //ddc.flagDepositAmt = false;
            $scope.flagDepositType = false;
            $scope.flagDepositYear = false;
            $scope.flagInvldYear = false;
            $scope.FlagtenureDaysNgtv = false;
            $scope.FlagtenureDaysMndry = false;
            $scope.FlagtenureDaysinvld = false;
            $scope.submitted = false;
        }


        $scope.fetchHomeBranchDetails = function() {
            $scope.flagdepositamount = false;
            $scope.clearError();
            var mopData;
            var accNumber = $scope.deposit.accountNumber;
            $scope.removePreviousData();
            $scope.notValidAccount = false;

            if(accNumber == undefined || accNumber == null){
                $scope.bookAsPerMOP = false;
                return;
            }

            if(accNumber != null && accNumber != undefined){
                var accNumberData = $scope.acccountNumbers;
                angular.forEach(accNumberData, function (value, key) {                      
                    if(value.id == accNumber){                      
                        mopData = value.modeOfOperation;                        
                    }                       
                });
                $scope.errorSpin = true;
                var getHoldingPatternEndPoint = '$(servicesPath)/rs/v1/getHoldingPattern';
                var getHoldingPatternUrl = lpCoreUtils.resolvePortalPlaceholders(getHoldingPatternEndPoint, {
                    servicesPath: lpPortal.root
                });
                         console.log("getHoldingPatternUrl",getHoldingPatternUrl);
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
                console.log("headers",headers);
                console.log("data",data);
                     $scope.deposit.accountNumber =  accNumber;
                     if(headers.mop){
                        $scope.bookAsPerMOP = ((headers.mop).toLowerCase() =="singly" )? false: true;
                    }
                    var regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
                    if(regpan.test(headers.panNumber) == false){
                        $scope.pan = undefined;
                    }
                    else{
                        $scope.pan = headers.panNumber;
                    }
                    
                    if($scope.deposit.taxSaverFlag == "true"){
                        $scope.getDepositTypeDetailsOnLoad("Y");
                    }else{
                        $scope.getDepositTypeDetailsOnLoad("N");
                    }
                    $scope.errorSpin = false;
                });
                xhr.error(function(headers, data) {
                    $scope.errorSpin = false;
                    $scope.notValidAccount = true;
                    $scope.error = {
                    happened: true,
                        msg: 'Sorry, Our machines are not talking to each other! Please try in a while.'
                    };
                    $scope.success = {
                        happened: false,
                        msg: ''
                    };
                    return;
                });
            }
            var i = 0;
            for (i; i <= $scope.acccountNumbers.length; i++) {
                if ($scope.deposit.accountNumber === $scope.acccountNumbers[i].id) {
                    $scope.homeBranchCode = $scope.acccountNumbers[i].hmBrnchCd;
                    $scope.modeOfOperation = $scope.acccountNumbers[i].modeOfOperation;
console.log("$scope.homeBranchCode", $scope.homeBranchCode);
console.log("$scope.modeOfOperation", $scope.modeOfOperation);
                    sharedProperties.setHomeBrnchCode($scope.homeBranchCode);
                    sharedProperties.setModeOfOperation($scope.modeOfOperation);
                }
            }
        };
        $scope.getAcccountDetails = function() {
            $scope.alerts = [];
            var urlacccount = lpWidget.getPreference(
                'preferenceService');
            urlacccount = lpCoreUtils.resolvePortalPlaceholders(
                urlacccount, {
                    servicesPath: lpPortal.root
                });
            $http({
                method: 'GET',
                url: urlacccount,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers,
                config) {
                $rootScope.$broadcast('eventSpin', false);
                $scope.errorSpin = false;

                $scope.acccountNumbers = data; //done by asmita
                /*if ($scope.acccountNumbers.length === 1) {
                    $scope.deposit.accountNumber = $scope.acccountNumbers[0].id;
                    //call these functions only when single account is present. Otherwise, they are called at ng-change for multiple account numbers
                    $scope.fetchHomeBranchDetails();
                }*/
               /* console.log(data);
                //$scope.acccountNumbers = data;
                console.log($scope.acccountNumbers);*/
            }).error(function(data, status, headers, config) {
                $scope.alerts = [];
                $scope.errorSpin = false;
                $rootScope.$broadcast('eventSpin', false);
                if (data.cd) {
                    $scope.serviceError = idfcHandler.checkGlobalError(
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
            console.log("Inside changeDaysYears");
            if ($scope.deposit.tenureDays) {
                console.log("Inside first if");
                var days = $scope.deposit.tenureDays;
                if (days > idfcConstants.TD_NOOFDAYSINYEAR) {
                    console.log("Inside second if");
                    var remainder = parseInt(days /
                        idfcConstants.TD_NOOFDAYSINYEAR);
                    var casio = days - (remainder *
                        idfcConstants.TD_NOOFDAYSINYEAR);
                    if ($scope.deposit.tenureYears == null) {
                        $scope.deposit.tenureYears = parseInt(
                            remainder);
                        $scope.deposit.tenureDays = casio;
                        console.log("IF tenure " + $scope.deposit
                            .tenureYears + " " + $scope.deposit
                            .tenureDays);
                    } else {
                        $scope.deposit.tenureYears = parseInt(
                                $scope.deposit.tenureYears) +
                            parseInt(remainder);
                        $scope.deposit.tenureDays = casio;
                        console.log("ELSE tenure " + $scope.deposit
                            .tenureYears + " " + $scope.deposit
                            .tenureDays);
                    }
                }
            }
            $scope.fetchRateOfInterest();
        };
        //3.1 change added tax saver
        //Method to  validate multiple pattern
        $scope.vaildatePattern = function() {
            if ($scope.depositDetailsForm.tenureYears.$error.pattern) {
                $scope.flagDepositMaxLnth = true;
            }
        };
        $scope.vaildateDaysPattern = function() {
            if ($scope.depositDetailsForm.tenureDays.$error.pattern) {
                $scope.FlagtenureDaysNgtv = true;
            }
        }; //end
        $scope.tenureValidation = function() {
            $scope.flagMinDuration = false;
            $scope.flagMaxDuration = false;
            $scope.flagMaxDurationTmp = false;
            //3.1 change start
            $scope.flagDepositMaxLnth = false;
            $scope.flagDepositYear = false;
            $scope.flagInvldYear = false;
            $scope.FlagtenureDaysNgtv = false;
            $scope.FlagtenureDaysMndry = false;
            $scope.FlagtenureDaysinvld = false; //3.1 change end
            var parameterName = $scope.parameterNameList[0];
            var minDuration = 0;
            var maxDuration = 0;
            if (parameterName === 'MIN_DURATION') {
                minDuration = $scope.parameterValueList[0];
                maxDuration = $scope.parameterValueList[1];
            } else {
                minDuration = $scope.parameterValueList[1];
                maxDuration = $scope.parameterValueList[0];
            }
            var years = $scope.deposit.tenureYears;
            if (!$scope.deposit.tenureDays === '') {
                var days = $scope.deposit.tenureDays;
                if (!$scope.deposit.tenureYears === '') {
                    var totalNoOfDays = (years * idfcConstants.TD_NOOFDAYSINYEAR) +
                        parseInt(days);
                } else {
                    totalNoOfDays = parseInt(days);
                }
            } else if (!$scope.deposit.tenureYears === '') {
                totalNoOfDays = (years * idfcConstants.TD_NOOFDAYSINYEAR);
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
            //            if (!$scope.deposit.rateOfInterest) {
            //                $scope.rateOfInterestRequired = true;
            //            } else {
            //                $scope.rateOfInterestRequired = false;
            //            }
            if ($scope.deposit.subProductType ===
                'TaxSaverTermDeposit') {
                $scope.deposit.taxSaverFlag = 'true';
            }
            var totAmount = parseInt($scope.deposit.amount);
            var parameterName = $scope.parameterNameList[0];
            var minDuration = 0;
            var maxDuration = 0;
            //3.1 below if case added
            if (!$scope.deposit.rateOfInterest)
             {
            				$scope.rateOfInterestRequired = true;
             }
             else
             {
            				$scope.rateOfInterestRequired = false;
             }
            if (parameterName === 'MIN_DURATION') {
                minDuration = $scope.parameterValueList[0];
                maxDuration = $scope.parameterValueList[1];
            } else {
                minDuration = $scope.parameterValueList[1];
                maxDuration = $scope.parameterValueList[0];
            }
            var years = $scope.deposit.tenureYears;
            var days = $scope.deposit.tenureDays;
            /*3.1 change*/
            if ($scope.depositDetailsForm.tenureYears.$error.required) {
                $scope.flagDepositYear = true;
            }
            if ($scope.depositDetailsForm.tenureDays.$error.required) {
                $scope.FlagtenureDaysMndry = true;
            }
            //end
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
            $scope.flagDepositMaxLnth = false; //3.1 change
            $scope.FlagtenureDaysNgtv = false; //3.1 change
            $scope.FlagtenureDaysMndry = false; //3.1 change
            $scope.FlagtenureDaysinvld = false; //3.1 change
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
            if (!$scope.pan) {
                if (totAmount > idfcConstants.TD_DEP_AMOUNT_LIMIT &&
                    $scope.deposit.amount <= $scope.availableBalance
                ) {
                    $scope.flagpanrequired = true;
                    $scope.flagamount = true;
                }
            }
            if ($scope.deposit.amount > $scope.availableBalance) {
                $scope.flagdepositamount = true;
            }
            if ($scope.deposit.amount > idfcConstants.TD_MAXDEPOSITAMT) {
                $scope.flagMaxDepositAmt = true;
                $scope.flagdepositamount = false;
            }
            if ($scope.deposit.amount < idfcConstants.TD_MINDEPOSITAMT) {
                $scope.flagMinDepositAmt = true;
                $scope.flagamount = false;
            }
            //3.1 change added below
            if ($scope.depositDetailsForm.tenureYears.$error.pattern) {
                $scope.flagDepositMaxLnth = true;
            }

            if ($scope.depositDetailsForm.tenureYears.$error.required) {
                $scope.flagDepositYear = true;
            }
            if ($scope.depositDetailsForm.tenureYears.$error.number) {
                $scope.flagInvldYear = true;
            }
            if ($scope.depositDetailsForm.tenureDays.$error.pattern) {
                $scope.FlagtenureDaysNgtv = true;
            }
            if ($scope.depositDetailsForm.tenureDays.$error.required) {
                $scope.FlagtenureDaysMndry = true;
            }
            if ($scope.depositDetailsForm.tenureDays.$error.number) {
                $scope.FlagtenureDaysinvld = true;
            }
            //3.1 change end
            if (!$scope.pan) {
                if (totAmount > idfcConstants.TD_DEP_AMOUNT_LIMIT &&
                    $scope.deposit.amount <= $scope.availableBalance
                ) {
                    $scope.flagpanrequired = true;
                    $scope.flagamount = true;
                }
                if (totAmount > idfcConstants.TD_DEP_AMOUNT_LIMIT &&
                    $scope.deposit.amount > $scope.availableBalance
                ) {
                    $scope.flagdepositamount = true;
                }
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
            if ($scope.flagMaxDurationTmp || $scope.flagdepositamount || $scope.flagMaxDepositAmt || $scope.flagMinDepositAmt || $scope.flagTaxSaverMaxAmt) {
                $('html, body').animate({

                    scrollTop: $(".div-tr-dep-opendeposit").offset().top

                }, 1500);


            }
            if ($scope.flagdepositamount === false && $scope.flagpanrequired ===
                false && $scope.flagMaxDuration === false &&
                $scope.flagMinDuration === false && $scope.flagMaxDepositAmt ===
                false && $scope.rateOfInterestRequired ===
                false && $scope.flagMinDepositAmt === false &&
                $scope.flagTaxSaverMaxAmt === false) {
                sharedProperties.setProperty($scope.deposit);
                $scope.wizardNextStep();
                window.scrollTo(0, 0);
            }
        };
        $scope.enableTenureMaturity = function() {
            $scope.deposit = {
                subProductType: 'StandardTermDeposit',
                autoRenewal: 'Yes',
                sweepInFlag: 'Yes'
            };
            $('#tenureDays').removeAttr('disabled');
            $('#tenureYears').removeAttr('disabled');
            $('.autorenewal').removeAttr('disabled');
            var taxSaverFlagParam = 'N';
            $scope.taxSaver = 'false';
            $scope.bookAsPerMOP = false
            $scope.pan = '';
            $scope.deposit.taxSaverFlag = $scope.taxSaver;
            $scope.getDepositTypeDetailsOnLoad(
                taxSaverFlagParam);
        };
        $scope.disableTenureMaturity = function() {
            $scope.flagMinDuration = false;
            $scope.taxSaverOption=true; //3.1 change
            $scope.deposit = {
                subProductType: 'TaxSaverTermDeposit',
                tenureDays: 0,
                tenureYears: 5,
                autoRenewal: 'No',
                sweepInFlag: 'No'
            };
            $('#tenureDays').attr('disabled', true);
            $('#tenureYears').attr('disabled', true);
            $('.autorenewal').attr('disabled', true);
            var taxSaverFlagParam = 'Y';
            $scope.taxSaver = 'true';
            $scope.bookAsPerMOP = false;
            $scope.pan = '';
            $scope.deposit.taxSaverFlag = $scope.taxSaver;
            $scope.getDepositTypeDetailsOnLoad(
                taxSaverFlagParam);
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
            $scope.depositDetailsForm.$setPristine();
            if ($scope.deposit.subProductType ===
                'StandardTermDeposit') {
                $('#tenureYears').val('');
                $('#tenureDays').val('');
            }
            $('#tenureRDYears').val('');
            $('#tenureRDMonths').val('');
            $('#debitDate').val('');
            $('#instllnAmount').val('');
            $scope.maturityAmt = '';
            $scope.maturityDate = '';
            $scope.interestPayable = '';
            $scope.bookAsPerMOP = false;
            $scope.deposit.sweepInFlag = 'Yes';
            $scope.deposit.autoRenewal = 'Yes';
            $scope.deposit.subProductType =
                'StandardTermDeposit';
            $scope.enableTenureMaturity();
            /*---Clear rate of interest:Nov 7---*/
            $scope.deposit.rateOfInterest = '';
            delete $scope.deposit.accountNumber;
            delete $scope.deposit.interestPayout;
            $scope.pan = '';
            $scope.flagdepositamount = false;
            $scope.flagpanrequired = false;
            $scope.flagamount = false;
            $scope.flagMinDuration = false;
            $scope.flagMaxDuration = false;
            $scope.flagMaxDurationTmp = false;
            $scope.flagMaxDepositAmt = false;
            $scope.flagMinDepositAmt = false;
            $scope.flagMinDepositAmt = false;
            $scope.rateOfInterestRequired = false;
            $scope.flagTaxSaverMaxAmt = false;
            //3.1 change start
            $scope.flagDepositMaxLnth = false;
            $scope.FlagtenureDaysNgtv = false;
            $scope.FlagtenureDaysMndry = false;
            $scope.FlagtenureDaysinvld = false; //3.1 change end
            $scope.submitted = false;
        };
        $scope.cancelForm = function() {
            lpCoreBus.publish(
                'launchpad-retail.closeActivePanel');
        };
        initialize();
        if (localStorage.getItem("navigationFlag")) {
        console.log("Inside");

            var data = JSON.parse(localStorage.getItem("navigationData"));
            //        var data = localStorage.getItem("navigationData");
             $scope.taxSaverOption = false;
            if (undefined === data || data == null) {

                if (localStorage.getItem("origin") == "dashboard") {
                    backtoDashboard = true;
                    origin = 'Dashboard';
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_BACK"
                    });
                }

                $scope.deposit = {
                    subProductType: 'StandardTermDeposit',
                    autoRenewal: 'Yes',
                    rateOfInterest: '',
                    sweepInFlag: 'Yes'
                    // rateOfInterest : '10.00%'
                };
                $('#tenureDays').removeAttr(
                    'disabled');
                $('#tenureYears').removeAttr(
                    'disabled');
                $('.autorenewal').removeAttr(
                    'disabled');
            } else {
                console.log('data.depositList1' +
                    data.depositList1);
                console.log('data.depositList2' +
                    data.depositList2);
                if (data.depositList1.productVariant === 'TD_TAXSAVER_MONTHLY_1A' ||
                    data.depositList1.productVariant === 'TD_TAXSAVER_CUMULATIVE_M' ||
                    data.depositList1.productVariant === 'TD_TAXSAVER_QUARTERLY_3A' ||
                    data.depositList1.productVariant === 'TD_TAXSAVER_HALFYEARLY_6A' ||
                    data.depositList1.productVariant === 'TD_TAXSAVER_ANNUAL_YA' ||
                    data.depositList1.productVariant === 'TD_TAXSAV_SENCITI_MONTHLY_1A ' || //3.1 tax fd change start
                    data.depositList1.productVariant === 'TD_TAXSAV_SENCITI_CUMULATIVE_M' ||
                    data.depositList1.productVariant === 'TD_TAXSAV_SENCITI_QUARTERLY_3A' ||
                    data.depositList1.productVariant === 'TD_TAXSAV_STFF_CUMULATIVE_M' ||
                    data.depositList1.productVariant === 'TD_TAXSAV_STFF_MONTHLY_1A' ||
                    data.depositList1.productVariant === 'TD_TAXSAV_STFF_QUARTERLY_3A' ||
                    data.depositList1.productVariant === 'TD_TAX_SAV_SENIOR_STF_QUARTERLY_3A' ||
                    data.depositList1.productVariant === 'TD_TAX_SAV_SENIOR_STF_CUMULATIVE_M' ||
                    data.depositList1.productVariant === 'TD_TAX_SAV_SENIOR_STF_MONTHLY_1A') { // in
                    $scope.taxSaverOption = true; //3.1 tax fd change end
                   // console.log("After Success@" + $scope.taxSaverOption);
                    $scope.disableTenureMaturity();
                    $scope.deposit = {
                        amount: parseInt(data.depositList2
                            .depositAmount),
                        subProductType: 'TaxSaverTermDeposit',
                        tenureDays: 0,
                        tenureYears: 5,
                        autoRenewal: 'No',
                        accountNumber: data.depositList1.srcAcctNum,
                        sweepInFlag: 'No'
                    };
                    $('#tenureDays').attr(
                        'disabled', true);
                    $('#tenureYears').attr(
                        'disabled', true);
                } else {
                    $scope.deposit = {
                        amount: parseInt(data.depositList2
                            .depositAmount),
                        tenureDays: parseInt(
                            data.depositList2
                            .depositPeriodDy
                        ),
                        tenureYears: parseInt(
                            data.depositList2
                            .depositPeriodYr
                        ),
                        autoRenewal: 'Yes',
                        subProductType: 'StandardTermDeposit',
                        accountNumber: data.depositList1.srcAcctNum,
                        sweepInFlag: 'Yes'
                    };
                }
                $scope.nomineeDetails = {
                    nomineeName: data.depositList2
                        .nomineeNm,
                    nomineeRelationship: data.depositList2
                        .nomineeRelationship
                };
                console.info($scope.nomineeDetails);
                sharedProperties.setNominee($scope.nomineeDetails);
            }
            localStorage.clear();
        }
        $rootScope.$on('CallInitializeMethod', function() {
            $scope.submitted = false;
            $scope.resetForm();
//            initialize();
        });
        $scope.validateValue = function(varValue) {
            if (lpCoreUtils.isUndefined(varValue) || varValue ===
                null) {
                return false;
            }
            return true;
        };
        $scope.defaultValues = function(isValid) {
            if (!isValid) {
                return false;
            }
            if (!($scope.validateValue($scope.deposit.tenureYears))) {
                $scope.deposit.tenureYears = 0;
            }
            if (!($scope.validateValue($scope.deposit.tenureDays))) {
                $scope.deposit.tenureDays = 0;
            }
        };
        $scope.calculate = function() {
            $('#tenureDays').val('00');
            $('#tenureYears').val('05');
            $('#tenureDays').attr('disabled', true);
            $('#tenureYears').attr('disabled', true);
            $('.autorenewal').attr('disabled', true);
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
    }

    function TermsController($scope, $rootScope, $filter, lpWidget,
        lpCoreUtils, lpPortal, $timeout, $http, sharedProperties,
        i18nUtils, lpCoreBus, httpService) {
        this.utils = lpCoreUtils;
        this.widget = lpWidget;
        $scope.alerts = [];
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
                }, '');
            }
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };

        function accountRefresh() {
            lpCoreBus.publish(
                'launchpad-retail.refreshAccountSummary');
        }
        $scope.acceptTermDetails = function() {
            $scope.alerts = [];
            $scope.errorSpin = true;
            $rootScope.$broadcast('eventSpin', $scope.errorSpin);
            var depositDetails = sharedProperties.getDepositNomination();
            console.log("Deposit Details" + depositDetails);
            /*var urltermdeposit = lpWidget.getPreference(
                'preferenceServiceDeposit');
            urltermdeposit = lpCoreUtils.resolvePortalPlaceholders(
                urltermdeposit, {
                    servicesPath: lpPortal.root
                });*/
            var urltermdeposit = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('preferenceServiceDeposit'),{
            servicesPath: lpPortal.root
            });
            console.log(urltermdeposit);
            $scope.data = {
                depositList1: null,
                depositList2: depositDetails.prodVariantLabel
            };
            var data1 = $.param(depositDetails || {});
            console.log("Deposit Details data1" , data1);
            $http({
                method: 'POST',
                url: urltermdeposit + '?cnvId=OTD',
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers,
                config) {
                $scope.errorSpin = false;
                var tdAcctNo = data.tdAccountNumber;
                if (tdAcctNo !== null && tdAcctNo !==
                    '') {
                    tdAcctNo = tdAcctNo.replace(/-/g,
                        '');
                }
                sharedProperties.setResponse(tdAcctNo);
                $scope.tdAcccountNumber = tdAcctNo;
                $scope.data = {
                    depositList1: tdAcctNo,
                    depositList2: depositDetails.prodVariantLabel
                };
                $rootScope.$broadcast('eventName',
                    tdAcctNo);
                $rootScope.$broadcast('eventName',
                    $scope.data);
                $scope.errorSpin = false;
                $rootScope.$broadcast('eventSpin',
                    $scope.errorSpin);
                $scope.success = {
                    happened: true,
                    msg: 'TD a/c no is ...!' + data
                        .tdAcctNo
                };
                console.log($scope.success.msg);
                $scope.temp = $scope.success.msg;
                $scope.sweepInService();
                accountRefresh();
            }).error(function(data, status, headers, config) {
                $scope.errorSpin = false;
                if (data.cd) {
                    $rootScope.$broadcast('eventName2',
                        $scope.alerts);
                    $scope.serviceError = idfcHandler.checkGlobalError(
                        data);
                    $scope.serviceError = true;
                    $rootScope.$broadcast('eventName1',
                        $scope.serviceError);
                    $scope.errorSpin = false;
                    $rootScope.$broadcast('eventSpin',
                        $scope.errorSpin);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
            });
            $scope.wizardNextStep();
            window.scrollTo(0, 0);
        };
        $scope.sweepInService = function() {
            var deposit = sharedProperties.getProperty();
            $scope.toAcctNum = deposit.accountNumber;
            var sweepInFlag = deposit.sweepInFlag;
            $scope.formData = {
                'frmAcct': $scope.tdAcccountNumber,
                'toAcct': $scope.toAcctNum
            };
            if (sweepInFlag === 'Yes') {
                //$scope.createSweepIn();
            }
        };
        $scope.createSweepIn = function() {
            var self = this;
            self.createSweepIn = httpService.getInstance({
                endpoint: lpWidget.getPreference(
                    'sweepInDetails')
            });
            var xhr = self.createSweepIn.create({
                data: $scope.formData
            });
            xhr.success(function(data) {
                $scope.sweepInStatus = data.Sts;
            });
            xhr.error(function(data) {
                if (data.cd) {
                    idfcHandler.checkTimeout(data);
                    $scope.serviceError = idfcHandler.checkGlobalError(
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
    }

    function CongratsController($scope, $filter, lpWidget, lpCoreUtils,
        lpPortal, $timeout, $http, sharedProperties, i18nUtils) {
        this.utils = lpCoreUtils;
        this.widget = lpWidget;
        $scope.$on('eventName', function(event, data) {
            console.log('data.depositList1' + data.depositList1);
            console.log('data.depositList2' + data.depositList2);
            $scope.tdAcccountNumber = data.depositList1;
            if ($scope.tdAcccountNumber) {
                // $scope.sendEmailadvice(data.depositList2);
            }
        });
        $scope.sendEmailadvice = function(prodVariantLabel) {
            console.log('sendemailAdvice prodVariantLabel is ' +
                prodVariantLabel);
            var urlPdfAdvice = lpWidget.getPreference(
                'PdfAdviceSrc');
            urlPdfAdvice = lpCoreUtils.resolvePortalPlaceholders(
                urlPdfAdvice, {
                    servicesPath: lpPortal.root
                });
            urlPdfAdvice = urlPdfAdvice + '?accountNumber=' +
                $scope.tdAcccountNumber;
            $http({
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
                    'mpDesc': response.mpDesc,
                    'productVariantLabel': prodVariantLabel
                };
                console.log('postData' + postData);
                $scope.FetchTdDetailsPdfEndPoint =
                    lpWidget.getPreference(
                        'FetchTdDPdfSrc');
                var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(
                    $scope.FetchTdDetailsPdfEndPoint, {
                        servicesPath: lpPortal.root
                    });
                pdfUrl = pdfUrl + '?accountNumber=' +
                    response.dpstAcct + '&email=' +
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
        $scope.$on('eventName1', function(event, data) {
            $scope.serviceError = data;
        });
        $scope.$on('eventName2', function(event, data) {
            $scope.alerts = data;
        });
        $scope.$on('eventSpin', function(event, data) {
            $scope.errorSpin = data;
        });
    }

    function NomineeDetailsController($scope, $rootScope, $filter,
        lpWidget, lpCoreUtils, lpPortal, $timeout, $http,
        sharedProperties, i18nUtils, httpService) {
        this.utils = lpCoreUtils;
        this.widget = lpWidget;
        $scope.validnom = '';
        $scope.noAcc = false;
        $scope.today = function() {
            $scope.futureDateMax = new Date();
        };
        $scope.today();
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
                }, '');
            }
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
        var initialize = function() {
            $('#nomineeGuardianDetails').hide();
            $('#copyNominee').hide();
            $scope.debitNomineeDob = true;
            $scope.depositDetails = sharedProperties.getResponse();
            var nomineeDetails = sharedProperties.getNominee();
            $scope.nominee = {
                nomineeName: nomineeDetails.nomineeName,
                relationship: nomineeDetails.nomineeRelationship
            };
            var urlrelationshipstate = lpWidget.getPreference(
                'preferenceRelationshipState');
            urlrelationshipstate = lpCoreUtils.resolvePortalPlaceholders(
                urlrelationshipstate, {
                    servicesPath: lpPortal.root
                });
            $http({
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
                $scope.relationshipListNew = data.relationnameList;
                $scope.relationList = data.relationnameList;
                $scope.relationcodeList = data.relationcodeList;
                console.log($scope.acccountNumbers);
            }).error(function(data, status, headers, config) {
                $scope.alerts = [];
                if (data.cd) {
                    $scope.serviceError = idfcHandler.checkGlobalError(
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
            $http({
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
                $scope.statesNew = data.statenameList;
                $scope.statesGuardian = data.statenameList;
            }).error(function(data, status, headers, config) {
                $scope.alerts = [];
                if (data.cd) {
                    $scope.serviceError = idfcHandler.checkGlobalError(
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
            // 7 july commented
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
            nomineeDetails = sharedProperties.getNominee();
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
        }
        $scope.fetchDebitAccountNomineeDetails = function() {
            //Mobile adding this as per RIB widget update
            console.log("fetchDebitAccountNomineeDetails");
            $('#nomineeDetails').hide();
            var depositDetails = sharedProperties.getProperty();
            $scope.debitNomineeDob = false;
            $scope.formData = {
                'nomineeType': 'E',
                'acctId': depositDetails.accountNumber
            };
            var self = this;
            self.getDebitAccountNomineeDetails = httpService.getInstance({
                endpoint: lpWidget.getPreference(
                    'nomineeDetails')
            });
            var xhr = self.getDebitAccountNomineeDetails.create({
                data: $scope.formData
            });
            xhr.success(function(data) {
                console.log("fetchDebitAccountNomineeDetails success");
                $scope.debitNomineeFlag = true;
                if (data.accountList[0].nomineeDetails[
                        0].nmnNm === null || data.accountList[
                        0].nomineeDetails[0].nmnNm ===
                    '') {
                    $scope.noAcc = true;

                    $scope.validnom =
                        'Oops! There is no nominee registered for the selected account. Please enter nominee details.';
                    $scope.debitNomineeDob = true;
                    $scope.debitNomineeFlag = false;
                } else {
                $('#nomineeDetails').show();
                    console.log("fetchDebitAccountNomineeDetails failure");
                    $scope.nominee.nomineeName = data.accountList[
                        0].nomineeDetails[0].nmnNm;
                    $scope.nomDob = data.accountList[0]
                        .nomineeDetails[0].DtOfBrth;
                    /*$scope.nominee.nomineeDOB = new Date(
                        $scope.nomDob).format(
                        'dd-mmm-yyyy');*/
                    $scope.nominee.nomineeDOB = $scope.getformattedDate($scope.nomDob);
                    var age = $scope.getAge($scope.nominee
                        .nomineeDOB);
                    if (age < idfcConstants.TD_MINOR_AGE) {
                        $('#nomineeGuardianDetails').show();
                    } else {
                        $('#nomineeGuardianDetails').hide();
                    }
                    $scope.nominee.relationship = data.accountList[
                        0].nomineeDetails[0].nmnRltnshp;
                    $scope.nominee.nomineeAddressLine1 =
                        data.accountList[0].nomineeDetails[
                            0].nmnAddr[0];
                    $scope.nominee.nomineeAddressLine2 =
                        data.accountList[0].nomineeDetails[
                            0].nmnAddr[1];
                    $scope.nominee.nomineeState = data.accountList[
                        0].nomineeDetails[0].nmnAddr[
                        3];
                    $scope.nominee.nomineeCity = data.accountList[
                        0].nomineeDetails[0].nmnAddr[
                        2];
                    $scope.nominee.guardianName = data.accountList[
                        0].nomineeDetails[0].grdnNm;
                    $scope.nominee.guardianAddress1 =
                        data.accountList[0].nomineeDetails[
                            0].grdnAddr[0];
                    $scope.nominee.guardianAddress2 =
                        data.accountList[0].nomineeDetails[
                            0].grdnAddr[1];
                    $scope.nominee.guardianState = data
                        .accountList[0].nomineeDetails[
                            0].grdnAddr[3];
                    $scope.nominee.guardianCity = data.accountList[
                        0].nomineeDetails[0].grdnAddr[
                        2];
                    $scope.minorDetail = data.accountList[
                        0].nomineeDetails[0].mnr;
                    if ($scope.minorDetail === true) {
                        $scope.openDepositDetails.isMinor =
                            'Y';
                    } else {
                        $scope.openDepositDetails.isMinor =
                            'N';
                    }
                    $scope.relationnameList = [data.accountList[
                        0].nomineeDetails[0].nmnRltnshp];
                    $scope.states = [data.accountList[0]
                        .nomineeDetails[0].nmnAddr[
                            3]
                    ];
                    $scope.statesGuardian = [data.accountList[
                        0].nomineeDetails[0].grdnAddr[
                        3]];
                }
            });
            xhr.error(function(data) {
                console.log("fetchDebitAccountNomineeDetails error");
                if (data.cd) {
                    idfcHandler.checkTimeout(data);
                    $scope.serviceError = idfcHandler.checkGlobalError(
                        data);
                    if (data.rsn == null) {
                        data.rsn = 'Oops! There is no nominee registered for the selected account. Please enter nominee details.';
                    }
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };

                    console.log("fetchDebitAccountNomineeDetails error" + data.rsn);
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
        $scope.disableDebitAccountNominee = function() {
            $('#nomineeDetails').show();
            $scope.debitNomineeFlag = false;
            $scope.debitNomineeDob = true;
            $scope.nominee.nomineeName = '';
            $scope.nominee.nomineeDOB = '';
            $scope.nominee.relationship = '';
            $scope.nominee.nomineeAddressLine1 = '';
            $scope.nominee.nomineeAddressLine2 = '';
            $scope.nominee.nomineeState = '';
            $scope.nominee.nomineeCity = '';
            $scope.nominee.guardianName = '';
            $scope.nominee.guardianAddress1 = '';
            $scope.nominee.guardianAddress2 = '';
            $scope.nominee.guardianState = '';
            $scope.nominee.guardianCity = '';
            $scope.states = $scope.statesNew;
            $scope.statesGuardian = $scope.statesNew;
            $scope.relationnameList = $scope.relationshipListNew;
            $('#nomineeGuardianDetails').hide();
            $scope.error = {
                happened: false,
                msg: ''
            };
        };
        initialize();
        $rootScope.$on('CallInitializeMethodNominee', function() {
            $scope.resetFormNominee();
        });
        $scope.resetFormNominee = function() {
            $scope.submitted = false;
            $scope.nominee.nomineeId = 'False';
            $scope.hideNomineeDetails();
            $scope.nominee.debitnomineeId = 'False';
            $scope.debitNomineeFlag = false;
            $scope.nominee.nomineeName = '';
            $scope.nominee.nomineeDOB = '';
            $scope.nominee.relationship = '';
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
        $scope.pollCount = 0;
        $scope.openDepositDetails = {
            subProductType: '',
            accountNumber: '',
            amount: '',
            interestPayout: '',
            interestPayoutTmp: '',
            prodVariantLabel: '',
            tenureYears: '',
            tenureDays: '',
            autoRenewal: '',
            rateOfInterest: '',
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
            sweepInFlag: ''
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
        $('#nomineeGuardianDetails').hide();
        // Todo 20 Sep
        $('#nomineeDetails').hide();
        $scope.getAge = function(dob) {
            var dateString = dob;
            var today = new Date();
            dateString = dateString.replace(/-/g, " ");
            var birthDate = new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() <
                    birthDate.getDate())) {
                age--;
            }
            return age;
        };
        $scope.submitNomineeDetails = function(isFormValid) {
            if (!$scope.nominee.nomineeName) {
                $scope.nomineeNameRequired = true;
            } else {
                $scope.nomineeNameRequired = false;
            }
            if (!isFormValid) {
                return false;
            } else {
                var nomineeDOB = $('#nomineeDOB').val();
                var age = $scope.getAge(nomineeDOB);
                nomineeDOB = new Date().getTime();
                var tenureYearsInDays = 0;
                if (age < idfcConstants.TD_MINOR_AGE) {
                    $scope.showNominee = true;
                    $scope.showGuardianAdd1 = true;
                    $('#nomineeGuardianDetails').show();
                    $('#guardianName').attr('required', true);
                    $('#guardianRelationId').attr('required',
                        true);
                    if ($scope.nominee.guardianName) {
                        var depositDetails = sharedProperties.getProperty();
                        $scope.openDepositDetails.subProductType =
                            depositDetails.itemCode;
                        $scope.openDepositDetails.productType =
                            depositDetails.productType;
                        $scope.openDepositDetails.accountNumber =
                            depositDetails.accountNumber;
                        $scope.openDepositDetails.amount =
                            depositDetails.amount;
                        $scope.openDepositDetails.interestPayout =
                            depositDetails.interestPayout;
                        $scope.openDepositDetails.interestPayoutTmp =
                            depositDetails.interestPayoutTmp;
                        $scope.openDepositDetails.prodVariantLabel =
                            depositDetails.prodVariantLabel;
                        $scope.openDepositDetails.tenureYears =
                            depositDetails.tenureYears;
                        $scope.openDepositDetails.tenureYears =
                            0;
                        $scope.openDepositDetails.tenureDays =
                            depositDetails.tenureDays;
                        tenureYearsInDays = depositDetails.tenureYears *
                            idfcConstants.TD_NOOFDAYSINYEAR;
                        $scope.openDepositDetails.tenureDays =
                            tenureYearsInDays + parseInt(
                                depositDetails.tenureDays);
                        $scope.openDepositDetails.autoRenewal =
                            depositDetails.autoRenewal;
                        $scope.openDepositDetails.rateOfInterest =
                            depositDetails.rateOfInterest;
                        $scope.openDepositDetails.sweepInFlag =
                            depositDetails.sweepInFlag;
                        $scope.openDepositDetails.nomineeName =
                            $scope.nominee.nomineeName;
                        var nomineeDOB1 = new Date($scope.nominee
                            .nomineeDOB).getTime();
                        $scope.openDepositDetails.nomineeDOB =
                            nomineeDOB1;
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
                        $scope.openDepositDetails.taxSaverFlag =
                            depositDetails.taxSaverFlag;
                        console.log($scope.openDepositDetails);
                        $scope.openDepositDetails.homeBranchCode =
                            sharedProperties.getHomeBrnchCode();
                        sharedProperties.setDepositNomination(
                            $scope.openDepositDetails);
                        $scope.openDepositDetails.modeOfOperation =
                            sharedProperties.getModeOfOperation();
                        sharedProperties.setDepositNomination(
                            $scope.openDepositDetails);
                        $scope.wizardNextStep();
                    }
                } else {
                    $('#guardianName').removeAttr('required');
                    $('#guardianDOB').removeAttr('required');
                    $('#guardianRelationId').removeAttr(
                        'required');
                    $scope.showGuardianAdd1 = false;
                    depositDetails = sharedProperties.getProperty();
                    $scope.openDepositDetails.subProductType =
                        depositDetails.itemCode;
                    $scope.openDepositDetails.productType =
                        depositDetails.productType;
                    $scope.openDepositDetails.accountNumber =
                        depositDetails.accountNumber;
                    $scope.openDepositDetails.amount =
                        depositDetails.amount;
                    $scope.openDepositDetails.interestPayout =
                        depositDetails.interestPayout;
                    $scope.openDepositDetails.interestPayoutTmp =
                        depositDetails.interestPayoutTmp;
                    $scope.openDepositDetails.prodVariantLabel =
                        depositDetails.prodVariantLabel;
                    $scope.openDepositDetails.tenureYears = 0;
                    tenureYearsInDays = depositDetails.tenureYears *
                        idfcConstants.TD_NOOFDAYSINYEAR;
                    $scope.openDepositDetails.tenureDays =
                        tenureYearsInDays + parseInt(
                            depositDetails.tenureDays);
                    $scope.openDepositDetails.autoRenewal =
                        depositDetails.autoRenewal;
                    $scope.openDepositDetails.rateOfInterest =
                        depositDetails.rateOfInterest;
                    $scope.openDepositDetails.sweepInFlag =
                        depositDetails.sweepInFlag;
                    $scope.openDepositDetails.nomineeName =
                        $scope.nominee.nomineeName;
                    var nomineeDOB2 = new Date($scope.nominee.nomineeDOB)
                        .getTime();
                    $scope.openDepositDetails.nomineeDOB =
                        nomineeDOB2;
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
                    $scope.openDepositDetails.taxSaverFlag =
                        depositDetails.taxSaverFlag;
                    $scope.openDepositDetails.homeBranchCode =
                        sharedProperties.getHomeBrnchCode();
                    sharedProperties.setDepositNomination(
                        $scope.openDepositDetails);
                    $scope.openDepositDetails.modeOfOperation =
                        sharedProperties.getModeOfOperation();
                    sharedProperties.setDepositNomination(
                        $scope.openDepositDetails);
                    $scope.wizardNextStep();
                }
            }
        };
        $scope.hideGuardianDetail = function() {
            $scope.nomineeNameRequired = false;
            $scope.guardianNameRequired = false;
            $scope.$watch('openDepositDetails.nomineeDOB',
                function() {
                    var nomineeDOB = $('#nomineeDOB').val();
                    var age1 = $scope.getAge(nomineeDOB);
                    $scope.showNominee = true;
                    $scope.showGuardianAdd1 = true;
                    if (age1 >= idfcConstants.TD_MINOR_AGE) {
                        $('#nomineeGuardianDetails').hide();
                        $scope.showNominee = false;
                        $scope.showGuardianAdd1 = false;
                        $('#guardianName').val('');
                        $('#guardianAddress1').val('');
                        $('#guardianAddress2').val('');
                        $('#guardianCity').val('');
                        $('#guardianStateId').val('');
                    } else {
                        $('#nomineeGuardianDetails').show();
                    }
                });
        };
        $scope.skipNomineeDetails = function() {
            var depositDetails1 = sharedProperties.getProperty();
            var tenureYearsInDays1 = 0;
            $scope.openDepositDetails.subProductType =
                depositDetails1.itemCode;
            $scope.openDepositDetails.productType =
                depositDetails1.productType;
            $scope.openDepositDetails.accountNumber =
                depositDetails1.accountNumber;
            $scope.openDepositDetails.amount = depositDetails1.amount;
            $scope.openDepositDetails.interestPayout =
                depositDetails1.interestPayout;
            $scope.openDepositDetails.interestPayoutTmp =
                depositDetails1.interestPayoutTmp;
            $scope.openDepositDetails.prodVariantLabel =
                depositDetails1.prodVariantLabel;
            $scope.openDepositDetails.tenureYears = 0;
            tenureYearsInDays1 = depositDetails1.tenureYears *
                idfcConstants.TD_NOOFDAYSINYEAR;
            $scope.openDepositDetails.tenureDays =
                tenureYearsInDays1 + parseInt(depositDetails1.tenureDays);
            $scope.openDepositDetails.autoRenewal =
                depositDetails1.autoRenewal;
            $scope.openDepositDetails.rateOfInterest =
                depositDetails1.rateOfInterest;
            $scope.openDepositDetails.nomineeId = 'False';
            $scope.openDepositDetails.nomineeName = '';
            $scope.openDepositDetails.nomineeDOB = '';
            $scope.openDepositDetails.relationship = '';
            $scope.openDepositDetails.nomineeAddressLine1 = '';
            $scope.openDepositDetails.nomineeAddressLine2 = '';
            $scope.openDepositDetails.nomineeState = '';
            $scope.openDepositDetails.nomineeCity = '';
            $scope.openDepositDetails.guardianName = '';
            $scope.openDepositDetails.isMinor = '';
            $scope.openDepositDetails.guardianRelationship = '';
            $scope.openDepositDetails.guardianAddress2 = '';
            $scope.openDepositDetails.guardianState = '';
            $scope.openDepositDetails.guardianCity = '';
            $scope.openDepositDetails.sweepInFlag =
                depositDetails1.sweepInFlag;
            $scope.openDepositDetails.taxSaverFlag =
                depositDetails1.taxSaverFlag;
            //3.1 change tax saver
            if ($scope.openDepositDetails.taxSaverFlag == 'true') {
                $scope.openDepositDetails.tenureDays = '1826';
            }
            $scope.openDepositDetails.homeBranchCode =
                sharedProperties.getHomeBrnchCode();
            $scope.openDepositDetails.modeOfOperation =
                sharedProperties.getModeOfOperation();
            sharedProperties.setDepositNomination($scope.openDepositDetails);
            console.log('skip nom',$scope.openDepositDetails);
            console.log("skip nominee home code and mop is " + $scope.openDepositDetails.homeBranchCode + " " + $scope.openDepositDetails.modeOfOperation);
            $scope.wizardNextStep();
        };
        $scope.showSubmit = true;
        //$scope.showSkipBtn = true;
        $scope.showSkipBtn1 = true;
        $scope.showNoNomMessage = true;
        $scope.showNomineeDetails = function() {
            console.log("showNomineeDetails nominee in deposite fd");
            $('#nomineeDetails').show();
            $('#copyNominee').show();
            $scope.showSubmit = false;
            $('#nomineeGuardianDetails').hide();
            $scope.showSkipBtn1 = false;
            $scope.showSkipBtn = true;
            $scope.showNoNomMessage = false;
        };
        $scope.hideNomineeDetails = function() {
            $('#nomineeDetails').hide();
            $('#nomineeGuardianDetails').hide();
            $('#copyNominee').hide();
            $('#debitNomineeDob').hide();
            $scope.error = {
                happened: false,
                msg: ''
            };
            $scope.showSubmit = true;
            $scope.showSkipBtn = false;
            $scope.showSkipBtn1 = true;
            $scope.showNoNomMessage = true;
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
        initialize();
//          $timeout(function(){
//                gadgets.pubsub.publish('cxp.item.loaded', {
//                    id: widget.id
//                });
//            }, 10);
    }
    exports.OpenDepositsWidgetController = OpenDepositsWidgetController;
    exports.DepositDetailsController = DepositDetailsController;
    exports.TermsController = TermsController;
    exports.CongratsController = CongratsController;
    exports.NomineeDetailsController = NomineeDetailsController;
});