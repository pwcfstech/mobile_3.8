/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

    'use strict';
    var constIDFC = require('idfccommon').idfcConstants;
    var piechart = require('n3-pie-chart');
    var angularSlider = require('rzModule');
    var idfcHanlder = require('idfcerror');

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function LoanSummaryController($http,lpWidget, lpCoreUtils, lpCoreError, $scope, loanSummaryService, lpCoreI18n, lpCoreBus, lpPortal, $filter, $timeout) {
        var loanSummaryCtrl = this;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        var homeLoanSummaryData = [];
        var homeSaverSummaryData = [];
        var hsOutstanding;
        var hlOutstanding;


        //Change this JSON if Loan Account Status is changed or if databaase call is required.
        var lnAccStatus = [{
            'acctSts': 'L',
            'name': 'Active'
        }, {
            'acctSts': 'C',
            'name': 'Closed'
        }, {
            'acctSts': 'INOP',
            'name': 'Inactive'
        }, {
            'acctSts': 'OPEN',
            'name': 'Active'
        }, {
            'acctSts': 'STOP',
            'name': 'Stop Dr and Cr Freeze'
        }, {
            'acctSts': 'CLOS',
            'name': 'Closed'
        }, {
            'acctSts': 'DORM',
            'name': 'Dormant'
        }, {
            'acctSts': 'UNCL',
            'name': 'Inactive'
        }, {
            'acctSts': 'PRE CREATED',
            'name': 'Active'
        }, {
            'acctSts': 'ACCEPTED',
            'name': 'Active'
        }, {
            'acctSts': 'ADVANCED',
            'name': 'Active'
        }, {
            'acctSts': 'APPLICATION',
            'name': 'Active'
        }, {
            'acctSts': 'APPROVED',
            'name': 'Active'
        }, {
            'acctSts': 'CLOSED',
            'name': 'Closed'
        }, {
            'acctSts': 'LIMT EXPIRED',
            'name': 'Limit Expired'
        }, {
            'acctSts': 'NEW ACCOUNT',
            'name': 'Active'
        }, {
            'acctSts': 'PENDING APPRVL',
            'name': 'Active'
        }, {
            'acctSts': 'WRITTEN OFF',
            'name': 'Closed'
        }];

        loanSummaryCtrl.loanDetails;
        loanSummaryCtrl.overDueDetails = false;
        loanSummaryCtrl.showLoanDtlsSection = false;

        loanSummaryCtrl.toggleLoanDtl = function() {
            loanSummaryCtrl.showLoanDtlsSection = !loanSummaryCtrl.showLoanDtlsSection;
            loanSummaryCtrl.displayLoanDetailsBorder = loanSummaryCtrl.showLoanDtlsSection;
        };

        loanSummaryCtrl.toggleOverDueDtl = function() {
            loanSummaryCtrl.overDueDetails = !loanSummaryCtrl.overDueDetails;
        };

        //START OF Code added by Arnab

        loanSummaryCtrl.data = [{
            label: "13%",
            value: 12.5,
            color: "#cc90de"
        }, {
            label: "",
            value: 34.5,
            color: "#fb637e"
        }];
        loanSummaryCtrl.options = {
            thickness: 7
        };

        /* data element for pie chart start*/
        loanSummaryCtrl.loanSlider = {
            value: new Date().getTime(),
            options: {
                floor: new Date('01/01/2000').getTime(),
                ceil: new Date('01/01/2100').getTime(),
                id: 0,
                onStart: function(id) {
                    console.log('on start '); // logs 'on start slider-id'
                },
                onChange: function(id) {
                    console.log('on change '); // logs 'on change slider-id'
                },
                onEnd: function(id) {
                    console.log('on end '); // logs 'on end slider-id'

                },
                translate: function(value, sliderId, label) {
                    switch (label) {
                        case 'model':
                            return $filter('date')(value, 'MMM, yyyy');
                        case 'high':
                            return +$filter('date')(value, 'MMM, yyyy');
                        default:
                            return $filter('date')(value, 'MMM, yyyy');
                    }
                },
                readOnly: true
            }
        }

        /* data element for pie chart end */

        loanSummaryCtrl.getPaidPercentData = function(accountObj) {
            console.log('Outstanding Balance :: ' + accountObj.ttlOutBal);
            console.log('Disbursement Amount :: ' + accountObj.disbAmt);
            var paidPercent = ((accountObj.disbAmt - Math.abs(accountObj.ttlOutBal)) / accountObj.disbAmt) * 100;
            //rounding to one decimal place
            paidPercent = Math.round(paidPercent);
            var data = [

                {
                    value: paidPercent,
                    label: paidPercent + '%',
                    color: '#54db7b'

                }, {
                    value: 100 - Math.abs(paidPercent),
                    label: 'PAID',
                    color: '#dde3e9'
                }
            ];
            return data;
        }


        loanSummaryCtrl.getLoanProgressData = function(accountObj) {
            console.log('getLoanProgressData----- ' + accountObj);
            var interestPaid = 0;
            var principalPaid = 0;
            var totalAmtPaid = loanSummaryCtrl.totalDisbursedAmtLakh - loanSummaryCtrl.totalOutstandingAmtLakh;

            //var paidPercent = ((accountObj.disbAmt-accountObj.ttlOutBal)/accountObj.disbAmt)*100;
            //rounding to one decimal place

            var intrstPaidPrcnt = 0;
            var prncplPaidPrcnt = 0;
            var totalPaidPrcnt = 0;

            intrstPaidPrcnt = intrstPaidPrcnt.toFixed(1);
            prncplPaidPrcnt = prncplPaidPrcnt.toFixed(1);
            totalPaidPrcnt = totalPaidPrcnt.toFixed(1);


            var data = [{
                    value: intrstPaidPrcnt,
                    label: intrstPaidPrcnt + '%',
                    color: '#cc90de'

                }, {
                    value: prncplPaidPrcnt,
                    label: prncplPaidPrcnt + '%',
                    color: '#fb637e'

                }, {
                    value: totalPaidPrcnt,
                    label: totalPaidPrcnt + '%',
                    color: '#bbbaba'

                }

            ];


            console.log(' data calll data *************** ' + JSON.stringify(data));

            return data;
        }

        //End of Code added by Arnab


        var initialize = function() {
            //Session Management
            idfcHanlder.validateSession($http);
            loanSummaryCtrl.noLoanAccount = {
                happened: false,
                msg:""
            };

            loanSummaryCtrl.noHsLoanAccount = {
                happened: false,
                msg:""
            };
            loanSummaryCtrl.errorSpin = true;
            loanSummaryCtrl.interestPercent = true;
            var loanSummarypub = function() {};
            lpCoreBus.subscribe('launchpad-retail.openLoanSummary', loanSummarypub);
            //added for mobile
            gadgets.pubsub.subscribe('launchpad-retail.openLoanSummary', loanSummarypub);
            loanSummaryCtrl.getLoanAccList();

            //lpCoreBus.subscribe('launchpad-retail.openLoanSummary',function(params) {});

        };

        //List of Loan Account Numbers
        loanSummaryCtrl.getLoanAccList = function() {


            var loanAcctsUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                .getPreference('loanAccountListAggregated'), {
                    servicesPath: lpPortal.root
                });

            loanSummaryService.setup({
                loanAcctListURL: loanAcctsUrl + '?cnvId=OTD',
                data: null
                }).loanAcctListService().success(function(data) {
                    console.log("GetLoanAccList :: " + JSON.stringify(data));
                    if (data != undefined && data != null && $.trim(data) != '') {
                        var loanAccountListAggregated = data;
                        orchestrateLoanDetails(loanAccountListAggregated);
//                        loanSummaryCtrl.loanAccountList = data; loanAccountList

                    } else if (data.rsn.indexOf('You have no loans') != -1) {
                        loanSummaryCtrl.noLoanAccount = {
                            happened: true,
                            msg: constIDFC.ERROR_NO_LOANS
                        };
                    } else {

                        loanSummaryCtrl.noLoanAccount = {
                            happened: true,
                            msg: constIDFC.ERROR_NO_LOANS
                        };
                    }
                loanSummaryCtrl.errorSpin = false;
            }).error(function(data) {
                console.log('Error :: ' + JSON.stringify(data));
                loanSummaryCtrl.errorSpin = false;
                console.log(data.rsn);
                if (data && data.rsn && data.rsn.indexOf('You have no loans') != -1) {
                    loanSummaryCtrl.noLoanAccount = {
                        happened: true,
                        msg: constIDFC.ERROR_NO_LOANS
                    };
                } else {


                    loanSummaryCtrl.error = {
                        happened: true,
                        msg: constIDFC.TECHNICAL_ERROR
                    };
                }
            });
        };

        function orchestrateLoanDetails(loanAggregatedData){

            hlOutstanding =0;
            hsOutstanding = 0;
            homeLoanSummaryData = [];
            homeSaverSummaryData = [];
            loanSummaryCtrl.allHlInactive = true;
            loanSummaryCtrl.allHsInactive = true;
            loanSummaryCtrl.hasHlOutStanding = false;
            loanSummaryCtrl.noHlOutStanding = false;
            loanSummaryCtrl.showHsApplyNow = false;
            loanSummaryCtrl.showHlApplyNow = false;
            loanSummaryCtrl.hlOutstandingDisplay = 0;
            loanSummaryCtrl.hsOutstandingDisplay = 0;

             loanSummaryCtrl.maskAccountNo(loanAggregatedData);


           //Segregating home loan and home saver data as well as identifying whether there is any active account or not
            for (var loanAccountCount in loanAggregatedData) {
                if (loanAggregatedData[loanAccountCount].prdCd == "HOME_TOP" || loanAggregatedData[loanAccountCount].prdCd == "BASIC_H" || loanAggregatedData[loanAccountCount].prdCd == "YOUTH_HOME" || loanAggregatedData[loanAccountCount].prdCd == "YOUTH_TOP") {

                    homeLoanSummaryData.push(loanAggregatedData[loanAccountCount]);

                    hlOutstanding = parseFloat(hlOutstanding)+ parseFloat(loanAggregatedData[loanAccountCount].ttlOutBal);

                    if(loanAggregatedData[loanAccountCount].acctSts == "L" && loanSummaryCtrl.allHlInactive){
                        loanSummaryCtrl.allHlInactive = false;
                    }


                    if(loanAggregatedData[loanAccountCount].acctSts === "L"){
                        loanAggregatedData[loanAccountCount].acctSts = "Active";
                    }else if(loanAggregatedData[loanAccountCount].acctSts === "C"){
                        loanAggregatedData[loanAccountCount].acctSts = "Inactive";
                    }




                }else if (loanAggregatedData[loanAccountCount].prdCd == "MON_SAVER" || loanAggregatedData[loanAccountCount].prdCd == "MONEY_TOP" || loanAggregatedData[loanAccountCount].prdCd == "4000") {

                    //Check for negative / positive putstanding and covert it accordingly
                    var tempNegCheck = 0;
                    tempNegCheck = parseFloat(loanAggregatedData[loanAccountCount].ttlOutBal).toFixed(2);
                    if(tempNegCheck > 0 || tempNegCheck <0){
                        tempNegCheck = tempNegCheck *-1.0;
                        loanAggregatedData[loanAccountCount].ttlOutBal = tempNegCheck.toFixed(2);
                    }

                    var tempPrincNegCheck = 0;
                    tempPrincNegCheck = parseFloat(loanAggregatedData[loanAccountCount].PrncplOvrDup).toFixed(2);
                    if(tempPrincNegCheck > 0 || tempPrincNegCheck <0){
                        tempPrincNegCheck = tempPrincNegCheck *-1;
                        loanAggregatedData[loanAccountCount].PrncplOvrDup = tempPrincNegCheck.toFixed(2);
                    }

                    var tempOverDueNegCheck = 0;
                    tempOverDueNegCheck = parseFloat(loanAggregatedData[loanAccountCount].TtlDup ).toFixed(2);
                    if(tempOverDueNegCheck >0 || tempOverDueNegCheck <0){
                        tempOverDueNegCheck = tempOverDueNegCheck *-1;
                        loanAggregatedData[loanAccountCount].TtlDup = tempOverDueNegCheck.toFixed(2);
                    }


                    hsOutstanding = parseFloat(hsOutstanding)+ parseFloat(loanAggregatedData[loanAccountCount].ttlOutBal);


                        console.log("loanAggregatedData[loanAccountCount].ttlOutBal:",loanAggregatedData[loanAccountCount].ttlOutBal);
                        console.log("hsOutstanding:",hsOutstanding);
                        console.log('loanAggregatedData[loanAccountCount].acctSts:', loanAggregatedData[loanAccountCount].acctSts);
                  /*  if( loanAggregatedData[loanAccountCount].acctSts !== "CLOS"
                        && loanAggregatedData[loanAccountCount].acctSts !== "CLOSED"
                        && loanAggregatedData[loanAccountCount].acctSts !== "INOP"
                        && loanAggregatedData[loanAccountCount].acctSts !== "STOP"
                        && loanAggregatedData[loanAccountCount].acctSts !== "DORM"
                        && loanAggregatedData[loanAccountCount].acctSts !== "UNCL"
                        && loanAggregatedData[loanAccountCount].acctSts !== "PENDING APPRVL"
                        && loanAggregatedData[loanAccountCount].acctSts !== "WRITTEN OFF"
                        && loanAggregatedData[loanAccountCount].acctSts !== "LIMT EXPIRED"
                        //&& loanAggregatedData[loanAccountCount].acctSts !== "APPLICATION"
                        && loanSummaryCtrl.allHsInactive)*/ //3.5 change commented above part and below if condition added
                        if( loanAggregatedData[loanAccountCount].acctSts != "CLOS"
                                             && loanAggregatedData[loanAccountCount].acctSts != "CLOSED"
                                             && loanSummaryCtrl.allHsInactive)
                      {

                        loanSummaryCtrl.allHsInactive = false;
                     }

                    //Changing account status description basis the status code
                    for (var lnAcSts in lnAccStatus) {
                        if (lnAccStatus[lnAcSts].acctSts == loanAggregatedData[loanAccountCount].acctSts) {
                            loanAggregatedData[loanAccountCount].acctSts = lnAccStatus[lnAcSts].name;
                        }
                    }
                     homeSaverSummaryData.push(loanAggregatedData[loanAccountCount]);
                }
            }

            //Display Inactive account text to user for Home loan
            if (homeLoanSummaryData.length>0){
                loanSummaryCtrl.loanAccountList = homeLoanSummaryData;
            }else{
                loanSummaryCtrl.noLoanAccount = {
                    happened: true,
                    msg: constIDFC.ERROR_NO_LOANS
                };
            }

            //Display Inactive account text to user for Home Saver
            if(homeSaverSummaryData.length >0){
                loanSummaryCtrl.hsLoanAccountList = homeSaverSummaryData;
                //formatHomesaverAccountsData();
            }else{
                loanSummaryCtrl.noHsLoanAccount = {
                    happened: true,
                    msg: constIDFC.ERROR_NO_LOANS
                };
            }

            //Display Total Outstanding for Home Loan
            if(loanSummaryCtrl.allHlInactive == false){
                if(hlOutstanding >0){
                    console.log('inside hloutstanding>0');
                    loanSummaryCtrl.hasHlOutStanding = true;
                    loanSummaryCtrl.noHlOutStanding = false;
                    var tempHlOutstanding = hlOutstanding.toFixed(2);
                    loanSummaryCtrl.hlOutstandingDisplay = loanSummaryCtrl.formatAmount(tempHlOutstanding);
                }else{
                    loanSummaryCtrl.hasHlOutStanding = false;
                    loanSummaryCtrl.noHlOutStanding = true;
                    console.log('inside else of hloutstanding>0');
                }
            }else{
                loanSummaryCtrl.hasHlOutStanding = false;
                loanSummaryCtrl.noHlOutStanding = true;
            }

            //Display Total Outstanding for Home Loan
            if(loanSummaryCtrl.allHsInactive == false){
                if(hsOutstanding > 0){
                    console.log('inside hsoutstanding>0');
                    loanSummaryCtrl.hasHsOutStanding = true;
                    loanSummaryCtrl.noHsOutStanding = false;
                    var tempHsOutstanding = hsOutstanding.toFixed(2);
                    loanSummaryCtrl.hsOutstandingDisplay = loanSummaryCtrl.formatAmount(tempHsOutstanding);
                }else{
                    loanSummaryCtrl.hasHsOutStanding = false;
                    loanSummaryCtrl.noHsOutStanding = true;
                    loanSummaryCtrl.hsOutstandingDisplay = "No outstanding";
                }
            }else{
                loanSummaryCtrl.hasHsOutStanding = false;
                loanSummaryCtrl.noHsOutStanding = true;;
            }



            //Cross sell identification metrics
            if(homeLoanSummaryData.length > 0 && homeSaverSummaryData.length >0)
            {
                if(loanSummaryCtrl.allHsInactive == true && loanSummaryCtrl.allHlInactive == true){
                    loanSummaryCtrl.showHlApplyNow = true;
                    loanSummaryCtrl.showHsApplyNow = true;
                }
                else{
                    loanSummaryCtrl.showHlApplyNow = false;
                    loanSummaryCtrl.showHsApplyNow = false;
                }
            }else if (homeLoanSummaryData.length > 0 && homeSaverSummaryData.length <=0){
                if(loanSummaryCtrl.allHlInactive === true){
                    loanSummaryCtrl.showHlApplyNow = true;
                    loanSummaryCtrl.showHsApplyNow = false;
                }
                else{
                    loanSummaryCtrl.showHlApplyNow = false;
                    loanSummaryCtrl.showHsApplyNow = false;
                }
            }else if (homeLoanSummaryData.length <=0 && homeSaverSummaryData.length >0){
                if(loanSummaryCtrl.allHsInactive ==true ){
                    loanSummaryCtrl.showHlApplyNow = false;
                    loanSummaryCtrl.showHsApplyNow = true;
                }else{
                    loanSummaryCtrl.showHlApplyNow = false;
                    loanSummaryCtrl.showHsApplyNow = false;
                }
            }

            loanSummaryCtrl.errorSpin = false;

        }

        loanSummaryCtrl.maskAccountNo = function(listOfAccNo) {
            loanSummaryCtrl.totalDisbursedAmt = 0;
            loanSummaryCtrl.totalOutstandingAmt = 0;
            loanSummaryCtrl.totalAmtPaid = 0;
            for (var countNo in listOfAccNo) {
                var accountNumber = listOfAccNo[countNo].acctNb;

                //get percentage data
                listOfAccNo[countNo].data = loanSummaryCtrl.getPaidPercentData(listOfAccNo[countNo]);
                loanSummaryCtrl.totalDisbursedAmt += JSON.parse(listOfAccNo[countNo].disbAmt);
                loanSummaryCtrl.totalOutstandingAmt += JSON.parse(listOfAccNo[countNo].ttlOutBal);
            }

            loanSummaryCtrl.totalAmtPaid = (loanSummaryCtrl.totalDisbursedAmt - loanSummaryCtrl.totalOutstandingAmt);

            console.log('Total Disbursement Amount ::' + loanSummaryCtrl.totalDisbursedAmt);
            console.log('Total Outstanding Amount ::' + loanSummaryCtrl.totalOutstandingAmt);
            console.log('Total Amount Paid::' + loanSummaryCtrl.totalAmtPaid);


            if (loanSummaryCtrl.totalDisbursedAmt >= 100000) {
                loanSummaryCtrl.totalDisbursedAmtLakh = (loanSummaryCtrl.totalDisbursedAmt / 100000);
            } else {
                loanSummaryCtrl.totalDisbursedAmtLakh = loanSummaryCtrl.totalDisbursedAmt;
                //handle the word 'L' for lakhs later when required later
            }

            if (loanSummaryCtrl.totalOutstandingAmt >= 100000) {
                loanSummaryCtrl.totalOutstandingAmtLakh = (loanSummaryCtrl.totalOutstandingAmt / 100000);
            } else {
                loanSummaryCtrl.totalOutstandingAmtLakh = loanSummaryCtrl.totalOutstandingAmt;
                //handle the word 'L' for lakhs later when required later
            }

            if (loanSummaryCtrl.totalAmtPaid >= 100000) {
                loanSummaryCtrl.totalAmtPaidLakh = (loanSummaryCtrl.totalAmtPaid / 100000);
            } else {
                loanSummaryCtrl.totalAmtPaidLakh = loanSummaryCtrl.totalAmtPaid;
                //handle the word 'L' for lakhs later when required later
            }
            console.log('Total Disbursement Amount Str ::' + loanSummaryCtrl.totalDisbursedAmtLakh);
            console.log('Total Outstanding Amount Str::' + loanSummaryCtrl.totalOutstandingAmtLakh);
        };

        var repeat = function(String, count) {
            return count > 0 ? String + repeat(String, count - 1) : String;
        };



        /**
        	Open Home Saver Account Details
        **/
        loanSummaryCtrl.openHSDetails = function(loanAccount,index) {
            //loanSummaryCtrl.errorSpinDetails = true;
            loanSummaryCtrl.loanSlider.options.floor = undefined;
            loanSummaryCtrl.loanSlider.options.ceil = undefined;
            loanSummaryCtrl.startNum = undefined;
            loanSummaryCtrl.endNum = undefined;

            for (var loanAccountCount in loanSummaryCtrl.hsLoanAccountList) {
                if (loanAccount.acctNb != loanSummaryCtrl.hsLoanAccountList[loanAccountCount].acctNb) {
                    loanSummaryCtrl.hsLoanAccountList[loanAccountCount].showfull = false;
                }
            }

            loanAccount.showfull = !loanAccount.showfull;

            var serverDate = loanAccount.serverDt.split("/");

            if(loanAccount.hasOwnProperty("balTnr") && loanAccount.balTnr>0){

                loanAccount.balanceTenure = Math.floor(loanAccount.balTnr/30.4);

            }else if(loanAccount.hasOwnProperty("balTnr") && loanAccount.balTnr === 0){

                loanAccount.balanceTenure = 0;

            }else{
                    loanAccount.balanceTenure = 'NA';
            }

            if (angular.isDefined(serverDate) && serverDate.length == 3) {
                loanSummaryCtrl.serverDtYY = serverDate[2];
                loanSummaryCtrl.serverDtMM = serverDate[1];
                loanSummaryCtrl.serverDtDD = serverDate[0];
                loanSummaryCtrl.loanSlider.value = new Date(loanSummaryCtrl.serverDtYY, loanSummaryCtrl.serverDtMM - 1, loanSummaryCtrl.serverDtDD).getTime();

            }

            /*TESTING*/
            //loanSummaryCtrl.loanSlider.value = new Date('02/03/2020').getTime();


            var start_date = loanAccount.dsbrsmntDt.split("/");

            loanSummaryCtrl.startDtYY = start_date[2];
            loanSummaryCtrl.startDtMM = start_date[1];
            loanSummaryCtrl.startDtDD = start_date[0];

            loanSummaryCtrl.startNum = new Date(loanSummaryCtrl.startDtYY, loanSummaryCtrl.startDtMM - 1, loanSummaryCtrl.startDtDD).getTime();

            var end_date = loanAccount.emiEndDate.split("/");

            loanSummaryCtrl.endDtYY = end_date[2];
            loanSummaryCtrl.endDtMM = end_date[1];
            loanSummaryCtrl.endDtDD = end_date[0];

            loanSummaryCtrl.endNum = new Date(loanSummaryCtrl.endDtYY, loanSummaryCtrl.endDtMM - 1, loanSummaryCtrl.endDtDD).getTime();

            var percentage = 0;
            var barId = 'progressBarHS-' + index;
            var dateId = 'currentDate-hs-' + index;

                if (document.getElementById(barId) != null) {

                    if( loanAccount.acctSts === "CLOS"
                        || loanAccount.acctSts === "CLOSED"
                        || loanAccount.acctSts === "INOP"
                        || loanAccount.acctSts === "STOP"
                        || loanAccount.acctSts === "DORM"
                        || loanAccount.acctSts === "UNCL"
                        || loanAccount.acctSts === "PENDING APPRVL"
                        || loanAccount.acctSts === "WRITTEN OFF"
                        || loanAccount.acctSts === "LIMT EXPIRED"
                        || loanAccount.acctSts === "Closed"
                        || loanAccount.acctSts === "closed") {

                            percentage = 100;
                            document.getElementById(barId).style.width = percentage + "%";

                        if (loanAccount.emiEndDate != undefined || loanAccount.emiEndDate != null || loanAccount.emiEndDate.trim() != '') {
                            loanSummaryCtrl.endNum = "Last EMI date";
                            loanSummaryCtrl.hideCurrentDate = true;
                        }
                    } else {

                        percentage = (((loanSummaryCtrl.loanSlider.value - loanSummaryCtrl.startNum) * 100) / (loanSummaryCtrl.endNum - loanSummaryCtrl.startNum) | 0);

                        document.getElementById(barId).style.width = percentage + "%";
                        loanSummaryCtrl.hideCurrentDate = false;
                        if (percentage < 7) {
                            percentage = 7;
                        } else if (percentage > 75) {
                            percentage = 75;
                        }
                        document.getElementById(dateId).style.marginLeft = percentage + "%";
                    }
                }

                /*Issue fix for 5426*/

                loanSummaryCtrl.loanSlider.options.floor = loanSummaryCtrl.startNum;
                loanSummaryCtrl.loanSlider.options.ceil = loanSummaryCtrl.endNum;

                $timeout(function() {
                    $scope.$broadcast('rzSliderForceRender');
                });

        };


        loanSummaryCtrl.openLoanDetails = function(loanAccount, index) {

            loanSummaryCtrl.errorSpinDetails = true;
            loanSummaryCtrl.getLoanDetailsByAccNo(loanAccount.acctNb, index);
            for (var loanAccountCount in loanSummaryCtrl.loanAccountList) {
                if (loanAccount.acctNb != loanSummaryCtrl.loanAccountList[loanAccountCount].acctNb) {
                    loanSummaryCtrl.loanAccountList[loanAccountCount].showfull = false;
                }
                loanSummaryCtrl.loanSlider.options.id = loanAccount.acctNb;
            }
            loanAccount.showfull = !loanAccount.showfull;
            $timeout(function() {
                $scope.$broadcast('rzSliderForceRender');
            });

        };

        //Loan Account Details
        var loanAccNumber = {};
        loanSummaryCtrl.getLoanDetailsByAccNo = function(loanAccNo, index) {

            var loanSummaryUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                .getPreference('loanSummaryDetails'), {
                    servicesPath: lpPortal.root
                });
            loanSummaryUrl = loanSummaryUrl + '?cnvId=OTD';
            var postData = {
                'lnAcctNb': loanAccNo
            };
            postData = $.param(postData || {});

                loanSummaryService.setup({
                    loanAccDetailRequestURL: loanSummaryUrl,
                    data: postData
                }).loanAcctDetailsService().success(function(data) {
                console.log("Acc Detail : " + JSON.stringify(data));
                loanSummaryCtrl.showMonth = false;
                loanSummaryCtrl.showMonths = false;
                loanSummaryCtrl.loanDetails = data;
                for (var lnAcSts in lnAccStatus) {
                        console.log('lnAccStatus[lnAcSts].acctSts',lnAccStatus[lnAcSts].acctSts);
                        console.log('loanSummaryCtrl.loanDetails.acctSts',loanSummaryCtrl.loanDetails.acctSts);
                    if (lnAccStatus[lnAcSts].acctSts == loanSummaryCtrl.loanDetails.acctSts) {
                         loanSummaryCtrl.loanDetails.acctSts = lnAccStatus[lnAcSts].name;
                    }

                }
                if (loanSummaryCtrl.loanDetails.rmngTnure !== 'NA') {
                    if (loanSummaryCtrl.loanDetails.rmngTnure < 10) {
                        loanSummaryCtrl.showMonth = true;
                    } else if (loanSummaryCtrl.loanDetails.rmngTnure >= 10) {
                        loanSummaryCtrl.showMonths = true;
                    }

                }

                if (loanSummaryCtrl.loanDetails.intrstRt === 'NA') {
                    console.log('>>>>>>>>>' + loanSummaryCtrl.loanDetails.intrstRt);
                    loanSummaryCtrl.loanDetails.intrstRt = 'NA';
                    loanSummaryCtrl.interestPercent = false;
                }

                //date format for slider

                //handle blank date
                /*loanSummaryCtrl.loanSlider = true;
                if(loanSummaryCtrl.loanDetails.dsbrsmtDt==='' || loanSummaryCtrl.loanDetails.intrstEndDt===''){
                    loanSummaryCtrl.loanSlider = false;
                }*/

                console.log('dsbrsmntDt' + loanSummaryCtrl.loanDetails.dsbrsmtDt);
                console.log('intrstEndDt' + loanSummaryCtrl.loanDetails.intrstEndDt);


                var start_date = loanSummaryCtrl.loanDetails.dsbrsmtDt.split("/");

                loanSummaryCtrl.startDtYY = start_date[2];
                loanSummaryCtrl.startDtMM = start_date[1];
                loanSummaryCtrl.startDtDD = start_date[0];

                loanSummaryCtrl.startNum = new Date(loanSummaryCtrl.startDtYY, loanSummaryCtrl.startDtMM - 1, loanSummaryCtrl.startDtDD).getTime();

                var end_date = loanSummaryCtrl.loanDetails.intrstEndDt.split("/");

                loanSummaryCtrl.endDtYY = end_date[2];
                loanSummaryCtrl.endDtMM = end_date[1];
                loanSummaryCtrl.endDtDD = end_date[0];

                loanSummaryCtrl.endNum = new Date(loanSummaryCtrl.endDtYY, loanSummaryCtrl.endDtMM - 1, loanSummaryCtrl.endDtDD).getTime();


                changeDateFormat(loanSummaryCtrl.loanDetails);

                loanSummaryCtrl.hideCurrentDate = true;


                //$scope.loanSlider.value = new Date().getTime();
                /*Issue fix for 5426*/
                var serverDate = loanSummaryCtrl.loanDetails.serverDt.split("/");
                if (angular.isDefined(serverDate) && serverDate.length == 3) {
                    loanSummaryCtrl.serverDtYY = serverDate[2];
                    loanSummaryCtrl.serverDtMM = serverDate[1];
                    loanSummaryCtrl.serverDtDD = serverDate[0];

                    loanSummaryCtrl.loanSlider.value = new Date(loanSummaryCtrl.serverDtYY, loanSummaryCtrl.serverDtMM - 1, loanSummaryCtrl.serverDtDD).getTime();

                    //IDFC 2.5- put slider simplar to PL

                    /* $scope.startNum=new Date('01/01/2019').getTime();
                     $scope.endNum=new Date('01/01/2044').getTime();*/

                    /*TESTING*/
                    //loanSummaryCtrl.loanSlider.value = new Date('02/03/2020').getTime();

                    var percentage;


                    console.log("value: " + loanSummaryCtrl.loanSlider.value);
                    console.log("startNum: " + loanSummaryCtrl.startNum);
                    console.log("endNum: " + loanSummaryCtrl.endNum);


                    var progressBarLabel;
                    if (percentage < 10) {
                        progressBarLabel = 10;
                    } else if (percentage > 76) {
                        progressBarLabel = 76;
                    } else {
                        progressBarLabel = percentage;
                    }
                    var barId = 'progressBarHL' + "-" + index;
                    var dateId = 'currentDate' + "-" + index;

                    if (document.getElementById(barId) != null) {

                        //IDFC 2.5-if closed loan,show full progress bar and hide current date
                        if (loanSummaryCtrl.loanDetails.acctSts === 'C' || loanSummaryCtrl.loanDetails.acctSts === 'Closed') {
                            percentage = 100;

                            document.getElementById(barId).style.width = percentage + "%";
                            if (loanSummaryCtrl.loanDetails.intrstEndDt != undefined || loanSummaryCtrl.loanDetails.intrstEndDt != null || loanSummaryCtrl.loanDetails.intrstEndDt.trim() != '') {
                                loanSummaryCtrl.endNum = "Last EMI date";
                                loanSummaryCtrl.hideCurrentDate = true;
                            }
                        } else {
                            percentage = (((loanSummaryCtrl.loanSlider.value - loanSummaryCtrl.startNum) * 100) / (loanSummaryCtrl.endNum - loanSummaryCtrl.startNum) | 0);

                            // console.log("Progress bar" + document.getElementById('progressBarPL') + " " + document.getElementById('currentDate'));
                            document.getElementById(barId).style.width = percentage + "%";
                            loanSummaryCtrl.hideCurrentDate = false;
                            if (percentage < 7) {
                                percentage = 7;
                            } else if (percentage > 75) {
                                percentage = 75;
                            }
                            document.getElementById(dateId).style.marginLeft = percentage + "%";
                        }

                        console.log("percentage: " + percentage);

                    }
                }

                /*Issue fix for 5426*/


                loanSummaryCtrl.loanSlider.options.floor = loanSummaryCtrl.startNum;
                loanSummaryCtrl.loanSlider.options.ceil = loanSummaryCtrl.endNum;



                $timeout(function() {
                    $scope.$broadcast('rzSliderForceRender');
                });



                loanSummaryCtrl.errorSpinDetails = false;
            }).error(function(data) {
                alert("FAIL.")
                loanSummaryCtrl.errorSpinDetails = false;
                loanSummaryCtrl.error = {
                    happened: true,
                    msg: constIDFC.TECHNICAL_ERROR_LOAN_DETAILS
                };
            });
        };



             /*Currency format function*/
            loanSummaryCtrl.formatAmount = function(num) {
                if(!isNaN(parseFloat(num))){
                  num = parseFloat(num).toFixed(2);
                }
                if(typeof num != 'string' && typeof num != 'undefined'){
                  num = num.toString();
                }
                    var afterPoint = '';
                    var beforePoint = '';
                    var lastThree = '';
                    var otherNumbers = '';
                    if (num.indexOf('.') > 0) {
                        afterPoint = num.substring(num.indexOf('.'), num.length);
                        beforePoint = num.substring(0, num.indexOf('.'));
                        lastThree = beforePoint.substring(beforePoint.length - 3);
                        otherNumbers = beforePoint.substring(0, beforePoint.length - 3);
                    } else {
                        lastThree = num.substring(num.length - 3);
                        otherNumbers = num.substring(0, num.length - 3);

                    }
                    num = num.toString();
                    if (otherNumbers != '') {
                        lastThree = ',' + lastThree;
                    }
                    var res = '';
                    if (num.indexOf('.') > 0) {
                        res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + afterPoint;
                    } else {
                        res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + '.00';
                    }
                    return res;
                }

        var changeDateFormat = function(loanDetails) {
            if (loanDetails.dsbrsmtDt != undefined && loanDetails.dsbrsmtDt != null && loanDetails.dsbrsmtDt.trim() != '') {
                var date = loanDetails.dsbrsmtDt.split("/");
                loanSummaryCtrl.loanDetails.dsbrsmtDt = new Date(date[2], date[1] - 1, date[0]);
                //$scope.loanDetails.dsbrsmtDt = new Date(loanDetails.dsbrsmtDt);


            }
            if (loanDetails.intrstEndDt != undefined && loanDetails.intrstEndDt != null && loanDetails.intrstEndDt.trim() != '') {
                var date = loanDetails.intrstEndDt.split("/");
                loanSummaryCtrl.loanDetails.intrstEndDt = new Date(date[2], date[1] - 1, date[0]);
                //$scope.loanDetails.intrstEndDt = new Date(loanDetails.intrstEndDt);

            }
            if (loanDetails.nxtDueDt != undefined && loanDetails.nxtDueDt != null && loanDetails.nxtDueDt.trim() != '') {
                if (loanDetails.nxtDueDt !== 'NA') {
                    var date = loanDetails.nxtDueDt.split("/");
                    loanSummaryCtrl.loanDetails.nxtDueDt = new Date(date[2], date[1] - 1, date[0]);
                    //$scope.loanDetails.nxtDueDt = new Date(loanDetails.nxtDueDt);
                }
            }
        };

        /*
            Function for calling apply now widget
        */
        loanSummaryCtrl.openApplyNow = function(){

            localStorage.setItem("srRequestData", "homeLoan");
            gadgets.pubsub.publish('launchpad-retail.openLoanApplyNow');
        }

        loanSummaryCtrl.openLoanIntWidget = function(lnAccount) {
            console.log("Publishing launchpad-retail.loanCertificate");
            //lpCoreBus.publish('launchpad-retail.loanCertificate', lnAccountNo);
            localStorage.setItem('lnAccount',JSON.stringify(lnAccount));
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "home-summary");
            console.log('Setting localstorage Summary' + lnAccount);
            gadgets.pubsub.publish('loanCertificate');
        };
        loanSummaryCtrl.openLoanStatementWidget = function(lnAccount) {
            console.log("Publishing launchpad-retail.openLoanStmtAcc");
            //lpCoreBus.publish('launchpad-retail.openLoanStmtAcc', lnAccountNo);
            localStorage.setItem('lnAccount', JSON.stringify(lnAccount));
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "home-summary");
            console.log('Setting localstorage Stateent' + lnAccount);
            gadgets.pubsub.publish('openLoanStmtAcc');
        };
        loanSummaryCtrl.openLoanRepayemtWidget = function(lnAccount) {
            console.log("Publishing launchpad-retail.openRepaymentSchd");
            //lpCoreBus.publish('launchpad-retail.openRepaymentSchd', lnAccountNo);
            console.log('Setting Repayment Statement',lnAccount);
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "home-summary");
            localStorage.setItem('lnAccount', JSON.stringify(lnAccount));
            gadgets.pubsub.publish('openRepaymentSchd');
        };

        //Widget Refresh
        var deckPanelOpenHandler;
        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName == lpWidget.parentNode.model.name) {
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView) {
                    lpWidget.parentNode = bresView.parentNode;
                });
            }
        };
        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);

        initialize();

        //added for mobile
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });
    }

    /**
     * Export Controllers
     */
    exports.LoanSummaryController = LoanSummaryController;
});
