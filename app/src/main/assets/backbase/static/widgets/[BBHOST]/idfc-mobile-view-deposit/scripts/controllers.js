define(function(require, exports) {
    'use strict';
    var fileSaver = require('fileSaver');
    var constIDFC = require('idfccommon').idfcConstants;
    var errorIDFC = require('idfcerror');
    var $ = require('jquery');
    var tempExistingDepositObj = {};

    function DepositDetailsWidgetController($scope, $http, WidgetModel,
        lpWidget, lpCoreUtils, lpCoreError, lpCoreI18n, $timeout,
        lpCoreBus) {

        this.model = WidgetModel;
        var utils = this.utils = lpCoreUtils;
        this.error = lpCoreError;
        var widget = this.widget = lpWidget;
        var initialize = function() {

            //Session Management Call
        	errorIDFC.validateSession($http);

            $scope.widgetDir = utils.getWidgetBaseUrl(widget);
            $scope.partialsDir = utils.getWidgetBaseUrl(widget) +
                '/templates/partials/' +
                'ExistingDeposits.html';
            $scope.increment = parseInt(widget.getPreference(
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

            //preloading Create SR
           // gadgets.pubsub.publish('loadCreateSR');
        };
        $scope.restartWizard = function() {
            $scope.reset();
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

        var rdDetailsSub = gadgets.pubsub.subscribe('launchpad-retail.ViewDepositWidgetOpen');

        $scope.$on('$destroy', function(){
            rdDetailsSub.unsubscribe();
        });

        initialize();
    }

    function ExistingDepositsController($scope, WidgetModel, lpWidget,
        lpCoreUtils, lpCoreError, lpCoreI18n, $timeout, lpCoreBus,
        lpPortal, $http) {
        this.model = WidgetModel;
        var utils = this.utils = lpCoreUtils;
        this.error = lpCoreError;
        var widget = this.widget = lpWidget;
        var deckPanelOpenHandler;
        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === widget.parentNode.model.name) {
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen',
                    deckPanelOpenHandler);
                widget.refreshHTML(function(bresView) {
                    widget.parentNode = bresView.parentNode;
                });
            }
        };
        $scope.noMail = false;
        gadgets.pubsub.subscribe(
            'launchpad-retail.ViewDepositWidgetOpen', function(
                params) {
                if (undefined === params || params === '') {
                    console.log('params in undefined in FD');
                } else {
                    console.log('params in defined in FD', JSON
                        .stringify(params));
                }
        });

        $scope.addNominee = function() {
                    localStorage.clear();
                    localStorage.setItem("navigationFlag",true);
                    localStorage.setItem("origin","From_FD_View");
       
//                    localStorage.setItem("navigationData",JSON.stringify(navData));
                    gadgets.pubsub.publish('launchpad-retail.serviceRequestOpen');

        };

        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
        $scope.pollCount = 0;
        $scope.Renewal = {};
        $scope.tmpexistingDeposits = [];
        $scope.RenewTd = false;
        $scope.RenewTdAmount = '';
        $scope.RenewForm = true;
        $scope.Principal = 'Principal';
        $scope.MaturityAmount = 'MaturityAmount';
        $scope.isDisabledRenewButton = false;
        $scope.hidebutton = false;
        $scope.backbutton = true;
        $scope.nextpage = false;
        $scope.alerts = [];
        $scope.msg1 = '';
        $scope.msgnodata = '';
        $scope.msgerrfetchDetail = '';
        $scope.errornoData = false;
        $scope.tdError = false;
        $scope.selectedRow = '';
        $scope.errorSpin = true;
        $scope.serviceError = false;
        $scope.TermDepositEndPoint = widget.getPreference(
            'TermDepositSrc');
        if ($scope.existingDeposits === undefined) {
            var TermDepositServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.TermDepositEndPoint, {
                    servicesPath: lpPortal.root
                });
                var postData = {
                            'type': 'FD'
                        };
                        postData = $.param(postData || {});
            $http({
                method: 'POST',
                url: TermDepositServiceURL,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers, config) {
                var length = data.length;
                $scope.errorSpin = false;
                $scope.existingDeposits = data;
                if (length === 0) {
                    $scope.msgnodata =
                        'Looks like you havent created any fixed deposit with us.Click on Create New to book now.';
                    $scope.errornoData = true;
                }
                console.log('$scope.existingDeposits' +
                    $scope.existingDeposits);
                $scope.errorSpin = false;
            }).error(function(data, status, headers, config) {
                $scope.tdError = true;
                if (data.cd) {
                    errorIDFC.checkTimeout(data);
                    $scope.serviceError = errorIDFC.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error', false);
                }
            });
        } // END IF
        $scope.partialsDir = utils.getWidgetBaseUrl(widget) +
            '/templates/partials/';
        $scope.todaysDate = new Date();
        $scope.toDate = '31-12-2199';
        $scope.sweepInForm = function() {
            console.log('todaysDate' + $scope.todaysDate);
            $scope.template = $scope.partialsDir + '/' +
                'sweepIn.html';
            $('#ExistingDepositForm').hide();
            $('#sweepInForm').show();
        };
        $scope.GoBackExistingDeposist = function() {
            $('#ExistingDepositForm').show();
            $('#sweepInForm').hide();
        };
        $scope.clearSweepInForm = function() {
            $scope.toDate = '';
            $scope.accountNumber = '';
        };
        $scope.openToCalendar = function($event) {
            $scope.isOpenDate2 = true;
            $event.preventDefault();
            $event.stopPropagation();
        };
        $scope.openFromCalendar = function($event) {
            $scope.isOpenDate1 = true;
            $event.preventDefault();
            $event.stopPropagation();
        };
        $scope.dateOptionsFrom = {
            'show-button-bar': false,
            'show-weeks': false
        };
        $scope.dateOptionsTo = {
            'show-button-bar': false,
            'show-weeks': false
        };
        $scope.openTermDeposit = function(type, $event) {
            $('#recurringDepositDiv').hide();
            $('#termsDepositDiv').show();
        };
        $scope.openRecurringDeposit = function(type, $event) {
            $('#termsDepositDiv').hide();
            $('#recurringDepositDiv').show();
        };
        $scope.PDFGeneration = function(existingDeposit) {
            $scope.FetchPdfGenerationEndPoint = widget.getPreference(
                'PdfAdviceSrc');
            var urlPdfAdvice = lpCoreUtils.resolvePortalPlaceholders(
                $scope.FetchPdfGenerationEndPoint, {
                    servicesPath: lpPortal.root
                });
            urlPdfAdvice = urlPdfAdvice + '?accountNumber=' +
                existingDeposit.id;
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
                    'mpDesc': response.mpDesc,
                    'productVariantLabel': existingDeposit.productVariantLabel
                };
                console.log('postData' + postData);
                $scope.FetchTdDetailsPdfEndPoint =
                    widget.getPreference(
                        'FetchTdDPdfSrc');
                var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(
                    $scope.FetchTdDetailsPdfEndPoint, {
                        servicesPath: lpPortal.root
                    });
                pdfUrl = pdfUrl + '?accountNumber=' +
                    existingDeposit.id + '&email=' +
                    false;
                var data1 = $.param(postData || {});
                var request = $http({
                    method: 'POST',
                    url: pdfUrl,
                    data: data1,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    },
                    responseType: 'arraybuffer'
                }).success(function(response,
                    status, headers, config) {
                    //$scope.showNotification = true;
                    $scope.successMessagePDFEmail =
                        'PDF has been sent successfully';
                    try {
                        var file = new Blob(
                            [response], {
                                type: 'application/pdf'
                            });
                    } catch (e) {
                        alert(e.stack);
                    }
                    fileSaver.saveAs(file,
                        'FD_Advice');
                }).error(function(response) {});
            }).error(function(response) {});
        };
        $scope.Emailadvice = function(existingDeposit) {
            $scope.errorSpin = true;
      console.log("$scope.tmpexistingDeposits data:", $scope.tmpexistingDeposits);
			var maturityInstData = $scope.tmpexistingDeposits;
            $scope.noMail = false;
            $scope.emailPdfSpin = true;
			      $scope.Email=false;
            $scope.emailErrorMsg = "";
            $scope.successMessagePDFEmail = "";
            $scope.FetchPdfGenerationEndPoint = widget.getPreference(
                'getRibAdviceForFDRDV2');
            var urlPdfAdvice = lpCoreUtils.resolvePortalPlaceholders(
                $scope.FetchPdfGenerationEndPoint, {
                    servicesPath: lpPortal.root
                });
            //urlPdfAdvice = urlPdfAdvice + '?accountNumber=' + existingDeposit.id;
                var postData1 = {
                'accountNumber' : existingDeposit.id,
                'maturityInst'	: maturityInstData.maturityInst,
            	'srcAcctNum'	: maturityInstData.srcAcctNum
            }
            var data = $.param(postData1 || {});
            var request = $http({
                method: 'POST',
                url: urlPdfAdvice,
                data: data,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(response) {
                var postData = {
                    'accountNumber' : existingDeposit.id,
                            'maturityInst'	: maturityInstData.maturityInst,
                			'srcAcctNum'	: maturityInstData.srcAcctNum
                    //'pan': response.pan,
                    //'amt': response.amt,
                    //'acctHldr': response.acctHldr,
                    //'brnchNm': response.brnchNm,
                    //'dpstAcct': response.dpstAcct,
                   // 'mtrtyAmt': response.mtrtyAmt,
                    //'strtDy': response.strtDy,
                    //'strtMnth': response.strtMnth,
                    //'strtYr': response.strtYr,
                    //'intRt': response.intRt,
                    //'tnr': response.tnr,
                    //'mtrtyDy': response.mtrtyDy,
                    //'mtrtyMnth': response.mtrtyMnth,
                    //'mtrtyYr': response.mtrtyYr,
                    //'intrstFrq': response.intrstFrq,
                    //'mtInstrctns': response.mtInstrctns,
                    //'nmntn': response.nmntn,
                    //'mpDesc': response.mpDesc,
                    //'productVariantLabel': existingDeposit.productVariantLabel
                };
						$scope.FetchTdDetailsPdfEndPoint = '$(servicesPath)/rs/v1/pdfgen/tDCertificateV2';
                console.log('response.pan' + response.pan);
                console.log('response.acctHldr' +
                    response.acctHldr);
                console.log('response.intRt' + response
                    .intRt);
                console.log('response.tnr' + response.tnr);
                console.log('response.intrstFrq' +
                    response.intrstFrq);
                console.log('response.mtInstrctns' +
                    response.mtInstrctns);
                /*$scope.FetchTdDetailsPdfEndPoint =
                    widget.getPreference(
                        'FetchTdDPdfSrc');*/
                var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(
                    $scope.FetchTdDetailsPdfEndPoint, {
                        servicesPath: lpPortal.root
                    });
                var data1 = $.param(postData || {});
                pdfUrl = pdfUrl + '?email=' + true;
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
                xhr.success(function(data) {
                    /*Mobile added this*/
                   // $scope.showNotification = true;
                    $scope.successMessagePDFEmail =
                        'Email has been sent successfully';
                    $scope.errorSpin = false;
                    $scope.emailPdfSpin = false;
								$scope.Email=false;
                
                });
                xhr.error(function() {
                $scope.errorSpin = false;
                //$scope.showNotification = true;
                    $scope.noMail = true;
                    $scope.successMessagePDFEmail =
                        'Your Email ID is not registered with us. To register,';
                        $scope.Email=true;
                    $scope.errorEmail = {
                        happened: true,
                        msg: data.rsn
                    };
                    $scope.emailPdfSpin = false;
                });
            }).error(function (response) {
                                       $scope.emailPdfSpin = false;
                                       $scope.emailErrorMsg = response.rsn;

               				});
        };
        $scope.openNewDeposit = function(existingDeposit) {
            $scope.existingDepositsAccount = existingDeposit;
            var depositDetails = {};

            depositDetails.nomineeNm = $scope.tmpexistingDeposits.nomName;
            depositDetails.nomineeRelationship = $scope.tmpexistingDeposits.nomRelatn;
            depositDetails.depositAmount =  parseInt(existingDeposit.bookedBalance);
            depositDetails.repaymentAccountNumber = $scope.tmpexistingDeposits.srcAcctNum;
            depositDetails.depositPeriodDy =  parseInt($scope.tmpexistingDeposits.depositPeriodDy);
            depositDetails.depositPeriodYr =  parseInt($scope.tmpexistingDeposits.depositPeriodYr);
                $scope.data = {
                depositList1: $scope.existingDepositsAccount,
                depositList2: depositDetails
            };
            localStorage.clear();
            localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","From_View_FD");
            localStorage.setItem("navigationData",JSON.stringify($scope.data));
            gadgets.pubsub.publish('launchpad-retail.openDeposits');
//           		gadgets.pubsub.publish('launchpad-retail.openDeposits', $scope.data);
        };
        $scope.RenewTdService = function(existingDeposit) {
            if (existingDeposit.productVariant.indexOf(
                'TAXSAVE') > 0) {
                $scope.RenewForm = false;
                $scope.isDisabledRenewButton = true;
                $scope.hidebutton = true;
                console.log('TAX error');
                console.log(existingDeposit.productVariant.indexOf(
                    'TAXSAVE'));
            } // Check for Product Type
            else {
                if ($scope.RenewTdAmount === 'Principal') {
                    $scope.RenewForm = true;
                    console.log(1); // check1
                    console.log($scope.RenewTdAmount); // check1
                    console.log($scope.MasterData);
                    console.log($scope.existingDeposit);
                    console.log($scope.existingDeposit.id); // 1
                    console.log($scope.MasterData.depositAmount); // 2
                    console.log('T'); // 3
                    console.log($scope.MasterData.repaymentAccountNumber); // 4
                    console.log($scope.MasterData.depositPeriodYr);
                    console.log($scope.MasterData.depositPeriodDy);
                    var years = $scope.MasterData.depositPeriodYr;
                    var days = $scope.MasterData.depositPeriodDy;
                    var noOfDaysInYear = 365;
                    var totalNoOfDays = years * noOfDaysInYear +
                        days;
                    console.log('Term Length:' + totalNoOfDays); // 5
                    $scope.RenewTdServiceEndPoint = widget.getPreference(
                        'RenewTdSrc');
                    var RenewTdServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                        $scope.RenewTdServiceEndPoint, {
                            servicesPath: lpPortal.root
                        });
                    var postData = {
                        'fdAccountNumber': $scope.existingDeposit
                            .id,
                        'principalAmount': $scope.MasterData
                            .depositAmount,
                        'principalCode': 'T',
                        'debitAccountNumber': $scope.MasterData
                            .repaymentAccountNumber,
                        'TermLgth': totalNoOfDays
                    };
                    postData = $.param(postData || {});
                    $http({
                        method: 'POST',
                        url: RenewTdServiceURL,
                        data: postData,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                        }
                    }).success(function(data, status,
                        headers, config) {
                        console.log('Success:' + data.sts);
                        //$scope.msg1 = TD_RENEW_MSG;
                        $scope.msg1 = constIDFC.TD_RENEW_MSG;
                        $scope.isDisabledRenewButton =
                            true;
                        $scope.hidebutton = true;
                        $scope.error = {
                            happened: true,
                            msg: 'fetch successfully!'
                        };
                    }).error(function(data, status, headers,
                        config) {
                        $scope.msg1 = data.rsn;
                        console.log('Error:' + data);
                        $scope.isDisabledRenewButton =
                            false;
                        $scope.hidebutton = false;
                        $scope.error = {
                            happened: true,
                            msg: 'Server error happened while updating field!'
                        };
                    });
                } else if ($scope.RenewTdAmount ===
                    'MaturityAmount') {
                    console.log(2); // check2
                    console.log($scope.RenewTdAmount); // check2
                    console.log($scope.existingDeposit.id); // 1
                    console.log($scope.MasterData.maturityAmount); // 2
                    console.log('T'); // 3
                    console.log($scope.MasterData.repaymentAccountNumber); // 4
                    console.log($scope.MasterData.depositPeriodYr);
                    console.log($scope.MasterData.depositPeriodDy);
                    var years1 = $scope.MasterData.depositPeriodYr;
                    var days1 = $scope.MasterData.depositPeriodDy;
                    var noOfDaysInYear1 = constIDFC.TD_NOOFDAYSINYEAR;
                    var totalNoOfDays1 = years1 *
                        noOfDaysInYear1 + days1;
                    console.log('Term Length:' + totalNoOfDays1); // 5
                    $scope.RenewTdServiceEndPoint = widget.getPreference(
                        'RenewTdSrc');
                    var RenewTdServiceURL1 = lpCoreUtils.resolvePortalPlaceholders(
                        $scope.RenewTdServiceEndPoint, {
                            servicesPath: lpPortal.root
                        });
                    var postData1 = {
                        'fdAccountNumber': $scope.existingDeposit
                            .id,
                        'principalAmount': $scope.MasterData
                            .maturityAmount,
                        'principalCode': 'T',
                        'debitAccountNumber': $scope.MasterData
                            .repaymentAccountNumber,
                        'TermLgth': totalNoOfDays
                    };
                    postData1 = $.param(postData1 || {});
                    $http({
                        method: 'POST',
                        url: RenewTdServiceURL1,
                        data: postData1,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                        }
                    }).success(function(data, status,
                        headers, config) {
                        console.log('Success:' + data);
                        $scope.msg1 =
                            'Your Fixed Deposit has been renewed.';
                        $scope.isDisabledRenewButton =
                            true;
                        $scope.hidebutton = true;
                        $scope.error = {
                            happened: true,
                            msg: 'fetch successfully!'
                        };
                    }).error(function(data, status, headers,
                        config) {
                        console.log('Error:' + data);
                        $scope.msg1 = data.rsn;
                        $scope.isDisabledRenewButton =
                            false;
                        $scope.hidebutton = false;
                        $scope.error = {
                            happened: true,
                            msg: 'Server error happened while updating field!'
                        };
                    });
                }
            }
        };
        $scope.enableRenewalAmt = function() {
            $('.renewalamount').removeAttr('disabled');
            if ($scope.autoRenewal.value === 'No') {
                $scope.autoRenewal = {
                    value: 'Yes'
                };
            }
        };
        gadgets.pubsub.subscribe("native.back", function(evt) {
            angular.forEach(document.getElementsByClassName(
                "tooltip"), function(e) {
                e.style.display = 'none';
            })
            $scope.back();
            localStorage.clear();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if(localStorage.getItem("navigationFlag") || $scope.nextpage) {
                angular.forEach(document.getElementsByClassName(
                    "tooltip"), function(e) {
                    e.style.display = 'none';
                })
                $scope.back();
                localStorage.clear();
            }else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        $scope.back = function() {
            $scope.backbutton = true;
            $scope.nextpage = false;
            console.log("backbutton" + $scope.backbutton);
            console.log("nextpage" + $scope.nextpage);
       tempExistingDepositObj.showfull = !
       tempExistingDepositObj.showfull;
            $scope.$apply();
        };
        $scope.openDepositDetails = function (existingDeposit) {
        $scope.nextpage = true;
                    /* FDRD - Phase 1 */
                    if (existingDeposit.showfull){
                        existingDeposit.showfull = !existingDeposit.showfull;
                        for (var i = 0; i < $scope.existingDeposits.length; i++) {
        					var currentItem = $scope.existingDeposits[i];
        					if (existingDeposit.id !== currentItem.id) {
        						currentItem.showfull = false;
                                currentItem.showfullerror = false;
        					}
        				}
                        return;
                    }

                    if (existingDeposit.showfullerror){
                        existingDeposit.showfullerror = !existingDeposit.showfullerror;
                        for (var i = 0; i < $scope.existingDeposits.length; i++) {
        					var currentItem = $scope.existingDeposits[i];
        					if (existingDeposit.id !== currentItem.id) {
        						currentItem.showfullerror = false;
                                currentItem.showfull = false;
        					}
        				}
                        return;
                    }

                    /* end */


                    /* FDRD - Phase 1 */
                    existingDeposit.errorSpinDetail = true;
                    /* end */


        			$scope.sweepInMessage = '';
        			$scope.selectedRow = existingDeposit.id;
        			$scope.successMessagePDFEmail = '';
        			$scope.disableDuplicateButton = existingDeposit.disableDuplicate;
        			/*var FetchTdDetailsEndPoint = widget.getPreference('PrefetchAccountTdDetails');*/
        			var FetchTdDetailsEndPoint = '$(servicesPath)/rs/v1/prefetchAccountTdDetails?cnvId=TDRDVIEW';
        			$scope.openDepositDetails.accNum = existingDeposit.id;
        			var FetchTdDetailsServiceURL = lpCoreUtils
        				.resolvePortalPlaceholders(FetchTdDetailsEndPoint, {
        					servicesPath: lpPortal.root
        				});
        			var data1 = $.param($scope.openDepositDetails || {});
        			var request = $http({
                                        method: 'POST',
                                        url: FetchTdDetailsServiceURL,
                                        data: data1,
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/x-www-form-urlencoded;'
                                        }
                                    }).success(function (dataRec, status, headers, config) {

                        existingDeposit.errorSpinDetail = false;
                        gadgets.pubsub.publish("js.back", {
                                                                       data: "ENABLE_BACK",
                                                                     trSerID:existingDeposit.id
                                                                       });
        				var now = new Date();
        				now.setDate(now.getDate() + 1);
        				existingDeposit.showfull = !existingDeposit.showfull;
        				for (var i = 0; i < $scope.existingDeposits.length; i++) {
        					var currentItem = $scope.existingDeposits[i];
        					if (existingDeposit.id !== currentItem.id) {
        						currentItem.showfull = false;
        						/*existingDeposit.showfull = false;*/
                                currentItem.showfullerror = false;
        					}
        				}
        				console.log("dataRec.prefetchAccountAndTDDetailsReply" +  dataRec.prefetchAccountAndTDDetailsReply);
                        var data = dataRec.prefetchAccountAndTDDetailsReply[0];
        				$scope.tmpexistingDeposits = data;
        				$scope.tmpexistingDeposits.product = existingDeposit.productVariantLabel;

                        /*FDRD Phase 1*/
        				if (data.SrcAcctNum === '0' || data.SrcAcctNum === null) {
        					myAutoRenewTd = 'Yes';
        					$scope.tmpexistingDeposits.srcAcctNum = 'Auto Renewal';
        				}

        				if(data.hldVal != undefined && data.hldVal != null && $.trim(data.hldVal) != ''){
        					if(data.hldVal > 0 )
        					{
        						$scope.lienApplied = "Yes";
        						$scope.displayLienAmmount = true;
        						$scope.lienAmmount = data.hldVal;
        					}
        					else
        					{
        						$scope.lienApplied = "No";
        						$scope.displayLienAmmount = false;
        					}
        				}

                        /*end*/
        				// Check if no nominee present
        				if ($scope.tmpexistingDeposits.nomName && $scope.tmpexistingDeposits.nomName !== '') {
        					$scope.nomineeExists = true;
        				} else {
        					$scope.nomineeExists = false;
        				}

        				// Check if guardian present
                        if ($scope.tmpexistingDeposits.guardName && $scope.tmpexistingDeposits.guardName !== '') {
                            $scope.guardExists = true;
                        } else {
                            $scope.guardExists = false;
                        }

                        /** FD RD Phase 1 **/
                        if($scope.tmpexistingDeposits.maturityInst == 1){
                            $scope.tmpexistingDeposits.maturityInst = "Auto closure";
                        }
                        else if($scope.tmpexistingDeposits.maturityInst == 3){
                            $scope.tmpexistingDeposits.maturityInst = "Renewal";
                        }
                        else {
                            $scope.tmpexistingDeposits.maturityInst = "-";
                        }

                        /** end **/


        				$scope.MasterData = $scope.tmpexistingDeposits;
        				$scope.changeDaysYears();
        				var ftSevenDays = 7;
        				var converMinutes = 3600000;
        				var d1 = $scope.tmpexistingDeposits.maturityDate;
        				$scope.todaysDate = new Date();
        				var todaysDateMS = $scope.todaysDate.getTime();
        				var differenceMS = todaysDateMS - d1;
        				if (existingDeposit.productVariant === 'TD_TAXSAVER_MONTHLY_1A' ||
        				    existingDeposit.productVariant === 'TD_TAXSAVER_CUMULATIVE_M' ||
        					existingDeposit.productVariant === 'TD_TAXSAVER_QUARTERLY_3A' ||
        					existingDeposit.productVariant === 'TD_TAXSAVER_HALFYEARLY_6A'||
        					existingDeposit.productVariant === 'TD_TAXSAV_SENCITI_MONTHLY_1A' ||
        					existingDeposit.productVariant === 'TD_TAXSAV_SENCITI_CUMULATIVE_M' ||
        					existingDeposit.productVariant === 'TD_TAXSAV_SENCITI_QUARTERLY_3A'||
        					existingDeposit.productVariant === 'TD_TAXSAV_STFF_CUMULATIVE_M' ||
        					existingDeposit.productVariant === 'TD_TAXSAV_STFF_MONTHLY_1A' ||
        					existingDeposit.productVariant === 'TD_TAXSAV_STFF_QUARTERLY_3A' ||
        					existingDeposit.productVariant === 'TD_TAX_SAV_SENIOR_STF_QUARTERLY_3A' ||
        					existingDeposit.productVariant ==='TD_TAX_SAV_SENIOR_STF_CUMULATIVE_M' ||
        					existingDeposit.productVariant ==='TD_TAX_SAV_SENIOR_STF_MONTHLY_1A') {



        					$scope.tmpexistingDeposits.depositPeriodYr = IdfcConstants.TAXSAVER_YEARS;
        					$scope.tmpexistingDeposits.depositPeriodDy = IdfcConstants.TAXSAVER_DAYS;
        				} else {
        					var Leftdays = (differenceMS / converMinutes) / 24;

        					if (Leftdays < 0 || Leftdays === 0) {
        						var absLeftdays = Math.abs(Leftdays);
        						absLeftdays = parseInt(absLeftdays + 1);
        						if (absLeftdays <= ftSevenDays) {
        							RenewForm = true;
        							isDisabledRenewButton = false;
        							hidebutton = false;
        						} else {
        							RenewForm = false;
        							isDisabledRenewButton = true;
        							hidebutton = true;
        						}
        					}
        				}
        			});
        			request.error(function (data, status, headers, config) {
                        /* FDRD - Phase 1 */
        //                $scope.errorSpinDetails = false;
                        /* end */

                        existingDeposit.showfullerror = !existingDeposit.showfullerror;
        				for (var i = 0; i < $scope.existingDeposits.length; i++) {
        					var currentItem = $scope.existingDeposits[i];
        					if (existingDeposit.id !== currentItem.id) {
        						currentItem.showfullerror = false;
                                currentItem.showfull = false;
        					}
        				}
        				existingDeposit.errorSpinDetail = false;
                        var n = data.rsn.search("NO SUCH ACCOUNT");
                        if(n > 0){
                            $scope.msgerrfetchDetail = "No such account";
                        }
                        else{
                            $scope.msgerrfetchDetail = "Sorry, our machines are not working. Humans are fixing the problem."
                        }

        			});
        		};

        $scope.disableRenewalAmt = function() {
            $('.renewalamount').attr('disabled', true);
            if ($scope.autoRenewal.value === 'Yes') {
                $scope.autoRenewal = {
                    value: 'No'
                };
            }
        };
        $scope.submitDetails = function() {
            $scope.wizardNextStep();
        };
        $scope.enableTenureMaturity = function() {
            $('#tenureDays').removeAttr('disabled');
            $('#tenureYears').removeAttr('disabled');
            $('.autorenewal').removeAttr('disabled');
        };
        $scope.disableTenureMaturity = function() {
            $('#tenureDays').val('00');
            $('#tenureYears').val('05');
            $('#tenureDays').attr('disabled', true);
            $('#tenureYears').attr('disabled', true);
            $('.autorenewal').attr('disabled', true);
        };
        $scope.accountNumbers = [{
            acctID: '1',
            accountNumber: 'NL56ABNA098765'
        }, {
            acctID: '2',
            accountNumber: 'NL55ASDNA098765'
        }, {
            acctID: '3',
            accountNumber: 'NL54ABNA098765'
        }];
        $scope.depositTypes = [{
            depTypeID: '1',
            depType: 'Cumulative Term deposit'
        }, {
            depTypeID: '2',
            depType: 'Traditional Monthly Interest Payout'
        }, {
            depTypeID: '3',
            depType: 'Traditional Quarterly Interest Payout'
        }, {
            depTypeID: '4',
            depType: 'Traditional Half yearly Interest Payout'
        }, {
            depTypeID: '5',
            depType: 'Traditional Annual Interest Payout'
        }];
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
                }, 5000);
            }
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
        $scope.openDepositWidget = function() {
            gadgets.pubsub.publish(
                'launchpad-retail.openDeposits');
        };
        $scope.resetForm = function() {
            $('#amount').val('');
            $('#tenureYears').val('');
            $('#tenureRDYears').val('');
            $('#tenureDays').val('');
            $('#tenureRDMonths').val('');
            $('#debitDate').val('');
            $('#instllnAmount').val('');
            delete $scope.accountNumberId;
            delete $scope.depositTypeId;
        };
        $scope.calculate = function() {
            $('#tenureDays').val('00');
            $('#tenureYears').val('05');
            $('#tenureDays').attr('disabled', true);
            $('#tenureYears').attr('disabled', true);
            $('.autorenewal').attr('disabled', true);
        };
        $scope.evalExp = function (varX, varY, varZ) {
        			var flag = false;
        			if ((varX === varY) && varZ) {
        				flag = true;
        			}
        			return flag;
        		};
        $scope.changeDaysYears = function() {
            //var years = $scope.tmpexistingDeposits.depositPeriodYr;
            var days = $scope.tmpexistingDeposits.termLgth;
            if (days >= constIDFC.TD_NOOFDAYSINYEAR) {
                var remainder = parseInt(days / constIDFC.TD_NOOFDAYSINYEAR);
                var casio = days - (remainder * constIDFC.TD_NOOFDAYSINYEAR);
                if ($scope.tmpexistingDeposits.depositPeriodYr ==
                    null) {
                    $scope.tmpexistingDeposits.depositPeriodYr =
                        parseInt(remainder);
                } else {
                    $scope.tmpexistingDeposits.depositPeriodYr =
                        parseInt($scope.tmpexistingDeposits.depositPeriodYr) +
                        parseInt(remainder);
                }
                $scope.tmpexistingDeposits.depositPeriodDy =
                    casio;
            } else{
            $scope.tmpexistingDeposits.depositPeriodYr = 0;
            $scope.tmpexistingDeposits.depositPeriodDy = days;

            }
        };

        $scope.goToEmailMod = function() {
            localStorage.clear();
            localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","Profile");
            localStorage.setItem("navigationData","Email Modification");
            gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
        }
          $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }
    exports.DepositDetailsWidgetController = DepositDetailsWidgetController;
    exports.ExistingDepositsController = ExistingDepositsController;
});