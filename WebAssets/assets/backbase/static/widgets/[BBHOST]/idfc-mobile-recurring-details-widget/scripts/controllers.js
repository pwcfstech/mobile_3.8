/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

    'use strict';
    var $ = require('jquery');
    var fileSaver = require('fileSaver');
    var errorIDFC = require('idfcerror');
    var backToCreateRD = false;
    /**
     * RDSummaryWidgetController controller
     * @ngInject
     * @constructor
     */

    function RDSummaryWidgetController(lpPortal, $http, $scope, WidgetModel, lpWidget, lpCoreUtils, lpCoreError, $timeout, lpCoreBus, i18nUtils) {
        this.model = WidgetModel;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;

        var initialize = function() {
            //NB!!! fi = financial institute

            //Session Management Call
	        errorIDFC.validateSession($http);

            $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials/';
            $scope.increment = parseInt(lpWidget.getPreference('amountToLoad'), 10) || 5;
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

            i18nUtils.loadMessages(lpWidget, $scope.locale).success(function(bundle) {
                $scope.messages = bundle.messages;
            });

        };


        $scope.restartWizard = function() {

            $scope.reset();
            $scope.goToWizardStep(1);
        };

        $scope.reset = function() {

            lpWidget.refreshHTML();

        };

        $scope.loadAccounts = function() {
            $scope.reset();
            $timeout(function() {

            }, 2000);

        };

        $scope.close = function() {

            lpCoreBus.publish('launchpad-retail.closeActivePanel');
        };

        initialize();

    }


    /**
     * RDSummaryController controller
     * @ngInject
     * @constructor
     */

    function RDSummaryController(lpPortal, $scope, WidgetModel, lpWidget, lpCoreUtils, lpCoreError, lpCoreBus, $http, widget, $timeout, $filter) {

        this.model = WidgetModel;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        var ALERT_TIMEOUT = 9000;
        var deckPanelOpenHandler;
        var createAccountNoSelected = '';
        $scope.successMessagePDFEmail= '';


        $scope.pollCount = 0;
        //var MasterData = {};
        $scope.Renewal = {};
        $scope.tmpexistingDeposits = [];
        $scope.RenewForm = true;
        $scope.Principal = 'Principal';
        $scope.MaturityAmount = 'MaturityAmount';
        $scope.isDisabledRenewButton = false;
        $scope.hidebutton = false;
        $scope.alerts = [];
        $scope.msg1 = '';
        $scope.noMail = false;
        $scope.msgnodata = '';
        $scope.msgerrfetchDetail = '';
        $scope.errornoData = false;
        $scope.rdError = false;
        $scope.selectedRow = '';

        $scope.errorSpin = true;
        $scope.serviceError = false;

        $scope.showCategoryForm = false;
        $scope.show = 'false';


        //RD_view Page
        $scope.rdView = false;
        $scope.showWidget = true;
        $scope.errorMsg = false;
        //End
        gadgets.pubsub.subscribe("openRDView");

        $scope.viewSummary = function(value) {

            $scope.RecurringDepositEndPoint = lpWidget.getPreference('fetchRDSummary');
            if ($scope.existingDeposits === undefined) {

            var RecurringDepositServiceURL = lpCoreUtils.resolvePortalPlaceholders(($scope.RecurringDepositEndPoint) , {
                                                                              servicesPath: lpPortal.root
                                                                              });
                var request = $http({
                    method: 'GET',
                    url: RecurringDepositServiceURL,
                    data: null,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }

                });
                request.success(function(data, status, headers, config) {
                //alert("in success"+data);
                    //alert(" updated again check data is "+data.deposit_RD[1].currency);

                    var length = data.length;
                    $scope.errorSpin = false;
                  
                    $scope.existingDeposits = data;
                     console.log("value:"+value);
                    for (var i = 0; i < $scope.existingDeposits.length; i++) {

                        var currentItem = $scope.existingDeposits[i];
                        if (currentItem.id === value) {

                            console.log("in if"+currentItem.id);
                            console.log("currentitemid:"+currentItem.id);
                            console.log("value:"+value);
                            $scope.openDepositDetails(currentItem);

                        }
                    }

                    if (length === 0) {

					    console.log("in if length = 0");

                        $scope.errorSpin = true;
                        $('#parentDiv').hide();
                        $scope.errornoData = true;
                        $scope.msgnodata = 'Looks like you have not created any recurring deposits with us.Click on "Create New" to Book Now.';
                    }

                    $scope.errorSpin = false;

                }).error(function(data, status, headers, config) {
                    $scope.rdError = true;
                    $scope.errorSpin = false;

                    if (data.cd) {

                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error', false);
                    }
                });
            }
        };
       
       /**CPU-3243*/
       gadgets.pubsub.subscribe("native.back", function(evt) {

                                if(localStorage.getItem("origin")=="createRD")
                                {
                                    localStorage.clear();
                                    gadgets.pubsub.publish("launchpad-retail.openRecurringDeposits");
                                }else{
                                    $scope.rdView = false;

                                    }

                                    $scope.$apply();


       });

       gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if(localStorage.getItem("navigationFlag") || $scope.rdView) {
               if(localStorage.getItem("origin")=="createRD"){
                   localStorage.clear();
                   gadgets.pubsub.publish("launchpad-retail.openRecurringDeposits");
               }else{
                   $scope.rdView = false;
               }
               $scope.$apply();
            }else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        var initialize = function() {
            console.log("in initialize");
            var value = '';
            $scope.viewSummary(value);
            $scope.rdView=false;
        };

        /*end from create page to view summary*/

        $scope.PDFGeneration = function(existingDeposit) {


            var urlPdfAdvice = lpWidget.getPreference('PdfAdviceSrc');

            urlPdfAdvice = lpCoreUtils.resolvePortalPlaceholders(urlPdfAdvice, {
                servicesPath: lpPortal.root
            });

            urlPdfAdvice = urlPdfAdvice + '?accountNumber=' + existingDeposit;

            var request = $http({
                method: 'GET',
                url: urlPdfAdvice,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }

            });
            request.success(function(response) {

              console.log("in success fn of pdf generation");
               

                //				this is called from the success of the first service

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

                $scope.FetchRdDetailsPdfEndPoint = lpWidget.getPreference('FetchRdDPdfSrc');

                var pdfUrl = lpCoreUtils.resolvePortalPlaceholders($scope.FetchRdDetailsPdfEndPoint, {
                    servicesPath: lpPortal.root
                });

                pdfUrl = pdfUrl + '?accountNumber=' + existingDeposit + '&email=' + false;

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

                }).success(function(response, status, headers, config) {

                 console.log("in success of FetchRdDPdfSrc");
                    
                    try {
                        var file = new Blob([response], {
                            type: 'application/pdf'
                        });
                        fileSaver.saveAs(file, 'RD_Advice');
                    } catch (e) {
                        alert(e.stack);
                    }




                }).error(function(response) {
                    //					alert('error in download advice');
                });



            }).error(function(response) {

            });
        };

        $scope.Emailadvice = function(existingDeposit) {
            var urlPdfAdvice = lpWidget.getPreference('getRibAdviceForFDRDV2');

            urlPdfAdvice = lpCoreUtils.resolvePortalPlaceholders(urlPdfAdvice, {
                servicesPath: lpPortal.root
            });
           $scope.Emailadvice.accountNumber = existingDeposit;
            $scope.noMail = false;
            $scope.errorSpin = true;
             var data1 = $.param($scope.Emailadvice || {});
            var request = $http({
                method: 'POST',
                url: urlPdfAdvice,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }

            });
            request.success(function(response) {



                //				this is called from the success of the first service

                console.log("success1");
                $scope.Emailadvice.accountNumber = existingDeposit;

                $scope.FetchRdDetailsPdfEndPoint = lpWidget.getPreference('FetchRdDPdfSrc');

                var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(($scope.FetchRdDetailsPdfEndPoint), {
                    servicesPath: lpPortal.root
                });


                var data1 = $.param($scope.Emailadvice || {});

                pdfUrl = pdfUrl + '?email=true';
                //				window.open(pdfUrl, "_blank");
                var xhr = $http({
                    method: 'POST',
                    url: pdfUrl,
                    data: data1,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                });

                xhr.success(function(data) {
                    $scope.errorSpin = false;
                    //					alert("Email has been sent successfully");

                   $scope.successMessagePDFEmail = 'Email has been sent successfully';
                });
                xhr.error(function(data) {
                    //					alert('Email not sent');
                    $scope.errorSpin = false;
                    $scope.noMail = true;
                    $scope.successMessagePDFEmail = 'Your Email ID is not registered with us. To register,';
                    $scope.errorEmail = {

                        happened: true,
                        msg: data.rsn
                    };
                });


            }).error(function(response) {
                $scope.errorSpin = false;
            });
        };

        $scope.goToEmailMod = function() {
            localStorage.clear();
            localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","Profile");
            localStorage.setItem("target","RDView");
            localStorage.setItem("navigationData","Email Modification");
            gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
        }


        $scope.DuplicateRd = function() {

            console.log("in dup rd");
            $scope.sendData = {};
            $scope.sendData.repaymentAccountNumber = $scope.tmpexistingDeposits.xferAcctNum;
            $scope.sendData.instlAmt = $scope.tmpexistingDeposits.instAmt;
            $scope.sendData.depositPeriodYr = $scope.tenureYear;
            $scope.sendData.depositPeriodMnths = $scope.tenureMonths;

            localStorage.clear();
            localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","From_RD_Details");
            localStorage.setItem("navigationData",JSON.stringify($scope.sendData));
            gadgets.pubsub.publish('launchpad-retail.openRecurringDeposits');
        };


        $scope.navigateToCreate = function() {
            console.log("in navigate to create");
            gadgets.pubsub.publish('launchpad-retail.openRecurringDeposits');
        };


        $scope.submitDetails = function() {
            $scope.wizardNextStep();
        };


        /**
         * Alerts
         */
        $scope.alerts = [];

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

        // Clear arr alert messages
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };

        $scope.addNominee = function() {

            $scope.data = $scope.existingDepositRowSelected.id;
            var values = $scope.existingDepositRowSelected.id;
            //Anand
            console.log("before "+ values );
            localStorage.setItem("navigationFlag",true);
            localStorage.setItem("origin","Create_SR_Nominee");
            gadgets.pubsub.publish('launchpad-retail.serviceRequestOpen');
       };




        $scope.rdSummary = function() {
            $scope.rdViewBack = true;
            $scope.rdView = false;
            $(window).scrollTop(0);
        };

        $scope.rdView = false;


        $scope.openDepositDetails = function(existingDeposit) {

        console.log(existingDeposit.id);
        	$scope.successMessagePDFEmail='';
        	$scope.noMail = false;
            $scope.errorSpin = true;
            $scope.rdView = true;
            $scope.disableDuplicateRDButton=existingDeposit.disableDuplicateRD;
            $scope.$watch('rdView', function(rdView) {

                $scope.existingDepositRowSelected = existingDeposit;
            });

            $scope.AccID = existingDeposit;
            $scope.selectedRow = existingDeposit;


            $scope.FetchTdDetailsEndPoint = lpWidget.getPreference('PrefetchAccountTdDetails');

            // debugger;
            $scope.openDepositDetails.accNum = existingDeposit.id;

             var FetchTdDetailsServiceURL = lpCoreUtils.resolvePortalPlaceholders(($scope.FetchTdDetailsEndPoint) , {
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

            });
            request.success(function(data, status, headers, config) {

            	   gadgets.pubsub.publish("js.back", {
                                               data: "ENABLE_BACK",
                                             trSerID:existingDeposit.id
                                               });
                console.log("in success fn of open deposit detail");
                existingDeposit.showfull = !existingDeposit.showfull;
                $scope.tmpexistingDeposits = data.prefetchAccountAndTDDetailsReply[0];
                //console.log("***values****"+$scope.tmpexistingDeposits);

                //calculating tenure
                if ($scope.tmpexistingDeposits.termBasis == "D") {
                                       var totalDaysOfYear = 365;
                                       var totalDaysOfMonth = 30;
                                       var newTenureDays = $scope.tmpexistingDeposits.termLgth;
                                       var newYear = parseInt(newTenureDays / totalDaysOfYear);
                                       newTenureDays = newTenureDays % totalDaysOfYear;
                                       var newMonth = parseInt(newTenureDays / totalDaysOfMonth);
                                       var newDay = newTenureDays % totalDaysOfMonth;
                                       $scope.tenureMonths = newMonth + "";
                                       $scope.tenureYear = newYear + "";
                                       $scope.tenureDays = newDay + "";

                                   } else if ($scope.tmpexistingDeposits.termBasis == "M") {
                                       var totalMonths = 12;
                                       var newTenureMonths = $scope.tmpexistingDeposits.termLgth;
                                       var newMonth = newTenureMonths % totalMonths;
                                       var newYear = (newTenureMonths - newMonth) / totalMonths;
               						$scope.tenureMonths = newMonth + "";
                                       $scope.tenureYear = newYear + "";
               						$scope.tenureDays = "0";

                                   } else {
                                       $scope.tenureYear = $scope.tmpexistingDeposits.termLgth;
               						$scope.tenureMonths = "0";
                                       $scope.tenureDays = "0";

                                   }

                                  /* var newMaturityDate1 = $scope.tmpexistingDeposits.matDt.split('-');
                                   var newMaturityDate = new Date(newMaturityDate1[0], newMaturityDate1[1] - 1, newMaturityDate1[2]);*/

                                   var newMaturityDate = new Date($scope.tmpexistingDeposits.matDt);
                                   $scope.lastInstlDate = newMaturityDate.setMonth(newMaturityDate.getMonth() - 1);


                                   var paidInstl = $scope.tmpexistingDeposits.ttlInstPd;
                                   var pendingInstl = $scope.tmpexistingDeposits.numOfPendInstlmntFrRD;
                                   var pendInstlRemoveMaturity = pendingInstl - 1;
                                   /* var paidInstl = 10;
                                   var pendingInstl = 2;
                                   var pendInstlRemoveMaturity = pendingInstl - 1;  */
                                   var totalInsatlmentTemp = Number(paidInstl) + Number(pendingInstl);
                                   var hundred = 100;
                                   var perInsatlment = ((hundred) / totalInsatlmentTemp);
                                   $scope.widthPaid = (perInsatlment * paidInstl);
                                   $scope.widthPending = (perInsatlment * pendInstlRemoveMaturity);
                                   $scope.widthMaturityPeriod = (perInsatlment);
                                   $scope.widthPaidNPending = $scope.widthPaid + $scope.widthPending;
                                   $scope.widthtotal = $scope.widthPaid + $scope.widthPending + $scope.widthMaturityPeriod;


                                   if ($scope.tmpexistingDeposits.nomName && $scope.tmpexistingDeposits.nomName !== '') {
                                       $scope.nomineeExists = true;
                                       $scope.nomineeReg = 'Yes';

               					} else {
               						$scope.nomineeExists = false;
               						$scope.nomineeReg = 'No';
               					}

               					for (var i = 0; i < $scope.existingDeposits.length; i++) {
               						var currentItem = $scope.existingDeposits[i];

               						if (existingDeposit.id !== currentItem.id) {
               							currentItem.showfull = false;
               						}
               					}

                $scope.error = {
                    happened: true,
                    msg: 'fetch successfully!'
                };
                
                $scope.errorSpin = false;

            }).error(function(data, status, headers, config) {
            	 $scope.errorSpin = false;

                existingDeposit.showfullerror = !existingDeposit.showfullerror;

                //added for Show hide the div
                for (var i = 0; i < $scope.existingDeposits.length; i++) {
                    var currentItem = $scope.existingDeposits[i];


                    if (existingDeposit.id !== currentItem.id) {

                        currentItem.showfullerror = false;

                    } else {

                        //break;
                    }
                }

                $scope.msgerrfetchDetail = data.rsn;




            });
            //end Service



            $(this).addClass('bgcolor');

        };

        initialize();

        if(localStorage.getItem("navigationFlag")){
            if(localStorage.getItem("origin") == "createRD"){
                gadgets.pubsub.publish("js.back", {
                                              data: "ENABLE_BACK"
                                              });
                $scope.rdView = true;
                createAccountNoSelected = localStorage.getItem("navigationData");
                $scope.viewSummary(createAccountNoSelected);
            }
        }
        $scope.$on('$destroy', function(){
        	rdDetailsSub.unsubscribe();
		});
         $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }

    /**
     * Export Controllers
     */
    exports.RDSummaryWidgetController = RDSummaryWidgetController;
    exports.RDSummaryController = RDSummaryController;

});