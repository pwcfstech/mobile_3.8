/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

    'use strict';

    var fileSaver = require('../libs/FileSaver');
    var saveAs = fileSaver.saveAs;
    var idfcHanlder = require('idfcerror');
    var idfcConstants = require('idfccommon').idfcConstants;

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function StatementOfAccountController($http,lpWidget, lpCoreUtils, lpCoreBus, lpPortal, loanSOAService,
        IdfcUtils, IdfcConstants, LauncherDeckRefreshContent, $q,
        $anchorScroll, deviceDetector) {
        var soaCtrl = this,
            dateValid,
            LoanDetails,
            pdfDataURL,
            getLoanSoaURL,
            currentDate,
            threeMonthsEarlierDate,
            loanAccountListUrl,
            homesaverSOAUrl,
            retVar;
        this.utils = lpCoreUtils;
        this.widget = lpWidget;



        //Widget Refresh //code from olde widget // Jay 
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





        pdfDataURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generatePDFForSOA'));
        getLoanSoaURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'));

        var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
        var mediaDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/media';

        if ('android' === deviceDetector.device ||
            'iphone' === deviceDetector.device ||
            'windows-phone' === deviceDetector.device) {
            soaCtrl.isMobileDevice = true;
        } else {
            soaCtrl.isMobileDevice = false;
        }
        var lnAccStatus = {
           'L':'Active',
           'C': 'Closed',
           'INOP':'Inactive',
           'OPEN': 'Active',
           'STOP': 'Stop Dr and Cr Freeze',
           'CLOS': 'Closed',
           'DORM': 'Dormant',
           'UNCL': 'Inactive',
           'PRE CREATED': 'Active',
           'ACCEPTED': 'Active',
           'ADVANCED': 'Active',
           'APPLICATION': 'Active',
           'APPROVED': 'Active',
           'CLOSED': 'Closed',
           'LIMT EXPIRED': 'Limit Expired',
           'NEW ACCOUNT': 'Active',
           'PENDING APPRVL': 'Active',
           'WRITTEN OFF': 'Closed',
           'Active': 'Active',
           'active': 'Active',
           'ACTIVE': 'Active'
        }


        soaCtrl.templates = {
            header: partialsDir + '/soa-header.html',
            error: partialsDir + '/soa-error.html',
            homeloan: partialsDir + '/soa-homeloan.html'
                // details : partialsDir + '/lap-soa-dtls.html',
                // footer : partialsDir + '/lap-soa-footer.html'
        };

        soaCtrl.images = {
            errorImg: mediaDir + '/error.png'
        };

        var initialize = function() {
        //Session Management
         idfcHanlder.validateSession($http);
            dateValid = [];
            LoanDetails = [];
            soaCtrl.fromDate = new Date();
            soaCtrl.toDate = new Date();
            soaCtrl.errorSpin = true;
            soaCtrl.loanAccountNumbers = [];
            soaCtrl.loanAccountNumbersObjectList = {}; //Used to check if the account numnber is already part of loanAccountNumbers
            soaCtrl.showTable = false;
            soaCtrl.dontShowTable = false;
            soaCtrl.button = false;
            soaCtrl.transactionDtls = [];
            soaCtrl.blankBothDateError = false;
            soaCtrl.dateError = false;
            soaCtrl.dateRangeError = false;
            soaCtrl.blankFromDateError = false;
            soaCtrl.blankToDateError = false;
            soaCtrl.disbDateError = false;
            soaCtrl.selectAccErr = false;
            soaCtrl.bizbDateError = false;
            soaCtrl.currentDateError = false;
            soaCtrl.fromDate = '';
            soaCtrl.toDate = '';
            soaCtrl.disbDate = '';
            soaCtrl.todaysDate = '';
            soaCtrl.selectAccountNumber = '';
            soaCtrl.error = {
                happened: false,
                msg: ''
            };

            // For error image display // Jay
            var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
            soaCtrl.errorImage = path + '/media/error.png'

            // For back button Kriti code paste from bkp // Jay
            if(localStorage.getItem("origin")=="home-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
             }


            var loanAccount = localStorage.getItem('lnAccount');

            if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
                 loanAccount = JSON.parse(loanAccount);
                 localStorage.setItem('lnAccount' , '');
                 soaCtrl.selectAccountNumber = "";
                 var loanAccountObj = {
                    acctNb: "",
                    loanType: "",
                    active: "",
                    openingDate: "",
                    serverDate: "",
                }

                if (loanAccount.prdCd == "HOME_TOP" || loanAccount.prdCd == "BASIC_H" || loanAccount.prdCd == "YOUTHHOME" || loanAccount.prdCd == "YOUTH_TOP") {

                    loanAccountObj.acctNb = loanAccount.acctNb;
                    loanAccountObj.loanType = "Home Loans";
                    loanAccountObj.active = loanAccount.acctSts == null ? "" : loanAccount.acctSts;
                    loanAccountObj.openingDate = loanAccount.openingDate;
                    loanAccountObj.dsbrsmntDt = loanAccount.dsbrsmntDt;
                    loanAccountObj.serverDate = loanAccount.serverDt;


                } else if (loanAccount.prdCd == "MON_SAVER" || loanAccount.prdCd == "4000" || loanAccount.prdCd == "MONEY_TOP") {

                    loanAccountObj.acctNb = loanAccount.acctNb;
                    loanAccountObj.loanType = "Short&Sweet";
                    loanAccountObj.active = loanAccount.acctSts == null ? "" : loanAccount.acctSts;
                    loanAccountObj.openingDate = loanAccount.openingDate;
                    loanAccountObj.dsbrsmntDt = loanAccount.dsbrsmntDt;
                    loanAccountObj.serverDate = loanAccount.serverDt;

                }

                if (!soaCtrl.loanAccountNumbersObjectList.hasOwnProperty(loanAccount.acctNb)) {
                    soaCtrl.loanAccountNumbers.push(loanAccountObj);
                    soaCtrl.loanAccountNumbersObjectList[loanAccount.acctNb] = loanAccount;
                    soaCtrl.selectAccountNumber = loanAccountObj;
                    soaCtrl.getSoaByAccNo();
                } else {
                    //Else Dont push
                    soaCtrl.selectAccountNumber = soaCtrl.loanAccountNumbers[0]; //loanAccountObj;
                    soaCtrl.getSoaByAccNo();
                }

            } else {
                soaCtrl.selectAccountNumber = '';

            }

            getLoanAccList();
        };

        /**
        	Get Loan Account List
        **/
        function getLoanAccList() {

            loanAccountListUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                .getPreference('getLoanAccountListAggregated'), {
                    servicesPath: lpPortal.root
                });

            // console.log("loanAccountListUrl", loanAccountListUrl);

            loanSOAService.setup({
                    loanAccountListUrl: loanAccountListUrl + '?cnvId=OTD',
                })
                .getLoanAcctListService()
                .success(function(data) {

                    // After the fist service call we set the today's date based on
                    // the server's date.
                    if (data.length && data[0].hasOwnProperty('serverDt')) {
                        var serverDateString = data[0].serverDt;
                        serverDateString = serverDateString.split("/");

                        soaCtrl.todaysDate = new Date(serverDateString[2], serverDateString[1] - 1, serverDateString[0]);

                        /*Commented for testing. Please  uncomment for golive*/

                        //soaCtrl.todaysDate =new Date('2021','04','3');
                    }

                    getHomeSaverAndHomeLoans(data);
                    soaCtrl.errorSpin = false;
                    //to display the first value as default selected value (ng-selected =$first as an alternative)
                    if (soaCtrl.loanAccountNumbers.length === 1) {

                        soaCtrl.selectAccountNumber = soaCtrl.loanAccountNumbers[0];
                        soaCtrl.getSoaByAccNo();
                    }
                }).error(function(error) {
                    soaCtrl.errorSpin = false;
                    soaCtrl.dontShowTable = true;
                    soaCtrl.error = {
                        happened: true,
                        msg: error.rsn
                    };
                });
        };


        function getHomeSaverAndHomeLoans(data) {
            lpCoreUtils.forEach(data, function(list) {
                var loanAcct = {
                    acctNb: "",
                    loanType: "",
                    active: "",
                    openingDate: "",
                    loanAccountNumbers: "",
                    serverDate: ""
                }

                if (!soaCtrl.loanAccountNumbersObjectList.hasOwnProperty(list.acctNb)) {
                    if (list.prdCd == "HOME_TOP" || list.prdCd == "BASIC_H" || list.prdCd == "YOUTHHOME" || list.prdCd == "YOUTH_TOP") {
                        loanAcct.acctNb = list.acctNb;
                        loanAcct.loanType = "Home Loans";
                        loanAcct.active = list.acctSts == null ? "" : list.acctSts;
                        loanAcct.openingDate = list.openingDate;
                        loanAcct.dsbrsmntDt = list.dsbrsmntDt;
                        loanAcct.serverDate = list.serverDt;
                        soaCtrl.loanAccountNumbers.push(loanAcct);
                        soaCtrl.loanAccountNumbersObjectList[list.acctNb] = list;

                    } else if (list.prdCd == "4000" || list.prdCd == "MON_SAVER" || list.prdCd == "MONEY_TOP") {
                        loanAcct.acctNb = list.acctNb;
                        loanAcct.loanType = "Short&Sweet";
                        loanAcct.active = list.acctSts == null ? "" : list.acctSts;
                        loanAcct.openingDate = list.openingDate;
                        loanAcct.dsbrsmntDt = list.dsbrsmntDt;
                        loanAcct.serverDate = list.serverDt;
                        soaCtrl.loanAccountNumbers.push(loanAcct);
                        soaCtrl.loanAccountNumbersObjectList[list.acctNb] = list;

                    }

                } else {
                    //Else that loanObject is already present in the dropdown, no need to push it again.
                }

            });
        }


        /**
        	Set Pagination
        **/
        function setPagination(onSubmit) {

            soaCtrl.paginationLimit = function() {
                var pageLimit = soaCtrl.pageSize * soaCtrl.pagesShown;
                return pageLimit;
            };

            soaCtrl.showMoreItems = function() {
                soaCtrl.pagesShown = soaCtrl.pagesShown + 1;
            };

            // Show the "Load More" button AND Print/Email/PDF
            // options only if the user selected the date fields

            if (!onSubmit) {
                soaCtrl.hasMoreItemsToShow = false;
                soaCtrl.showPrintEmailPdfOptions = false;
            } else {

                soaCtrl.showPrintEmailPdfOptions = true;
                soaCtrl.hasMoreItemsToShow = function() {
                    return soaCtrl.pagesShown < (soaCtrl.transactionDtls.length / soaCtrl.pageSize);
                };
            }
        };

        /**
        	Check whether any transaction or not
        **/
        function checkTransactionsEmpty(value) {
            if (value.length == 1) {
                if (value[0].txnDt === ' ' || value[0].txnDt === '') {
                    retVar = true;
                }
            } else {
                retVar = false;
            }
            return retVar;
        };


        /**
        	Widget Refresh
        **/
        /* function deckPanelOpenHandler(activePanelName) {
        	if (activePanelName == lpWidget.parentNode.model.name) {
        		lpCoreBus.flush('DeckPanelOpen');
        		initialize();
        	}
        }; */


        /**
        	Open From Calendar
        **/
        soaCtrl.openFromCalendar = function($event) {
            soaCtrl.isOpenDate1 = true;
            soaCtrl.isOpenDate2 = false;
            $event.preventDefault();
            $event.stopPropagation();

        };

        /**
        	Open To Calendar
        **/
        soaCtrl.openToCalendar = function($event) {
            soaCtrl.isOpenDate2 = true;
            soaCtrl.isOpenDate1 = false;
            $event.preventDefault();
            $event.stopPropagation();

        };

        function getHomeLoanDetails() {


            if(soaCtrl.todaysDate == '' || soaCtrl.todaysDate == null){
                var serverDateString = soaCtrl.selectAccountNumber.serverDate;
                serverDateString = serverDateString.split("/");

                /*Commented for testing. Please  uncomment for golive*/
                soaCtrl.todaysDate = new Date(serverDateString[2], serverDateString[1] - 1, serverDateString[0]);

                //Comment for Golive*/
                 // soaCtrl.todaysDate =new Date('2021','04','3');
            }

            var currentDate = soaCtrl.todaysDate;


            //var currentDate = new Date(soaCtrl.todaysDate);
            var threeMonthsEarlierDate = new Date(soaCtrl.todaysDate);
            threeMonthsEarlierDate.setMonth(currentDate.getMonth() - 3);


            var postData = {
                'lnAcctNb': soaCtrl.selectAccountNumber.acctNb,
                'frmDT': threeMonthsEarlierDate.getTime(),
                'toDt': currentDate.getTime()
            };
            postData = $.param(postData || {});

            loanSOAService
                .setup({
                    getLoanSoaURL: getLoanSoaURL + '?cnvId=OTD',
                    data: postData
                })
                .getLoanSOAService()
                .success(function(data, status, headers, config) {
                    soaCtrl.noTransactionError = false;
                    soaCtrl.errorSpin = false;
                    LoanDetails = data;
                    var transactionDtls = LoanDetails.getsoaTransactionDtls;
                    if (IdfcUtils.hasContentData(transactionDtls) && !checkTransactionsEmpty(transactionDtls)) {
                        soaCtrl.transactionDtls = LoanDetails.getsoaTransactionDtls.reverse();
                        soaCtrl.disbDate = LoanDetails.getsoaDisbDtls[0].dsbrsDt1;

                        // if(soaCtrl.disbDate.indexOf("/") > -1){
                        //   soaCtrl.disbDate = formatDate(soaCtrl.disbDate);
                        // }

                        dateValid = soaCtrl.transactionDtls.getsoaMains;
                        soaCtrl.pagesShown = 1;
                        soaCtrl.pageSize = 10;
                        setPagination(false);
                    } else {
                        soaCtrl.showTable = false;
                        soaCtrl.dontShowTable = true;
                        soaCtrl.noTransactionError = true;
                    }

                }).error(function(error, status, headers, config) {

                    soaCtrl.errorSpin = false;
                    soaCtrl.showTable = false;
                    soaCtrl.dontShowTable = true;
                    soaCtrl.error = {
                        happened: true,
                        msg: 'Sorry, Our machines are not talking to each other!' +
                            ' Humans are trying to fix the problem. Please try' +
                            ' again in a while.'
                    };

                });

            soaCtrl.pagesShown = 1;
            soaCtrl.pageSize = 10;
            setPagination(false);
        };

        function getHomeSaverDetails() {
            var newHomesaverSOAUlr = "";
            var homesaverSOAUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                .getPreference('getHomeSaverSOA'), {
                    servicesPath: lpPortal.root
                });


            var postData = {
                'accountId': soaCtrl.selectAccountNumber.acctNb
            }

            postData = $.param(postData || {});

            // homesaverSOAUrl = homesaverSOAUrl + soaCtrl.selectAccountNumber.acctNb;
            // homesaverSOAUrl = "/rs/v1/current-accounts/{accountId}/transactions"

            loanSOAService.setup({
                getHomesaverSOAUrl: homesaverSOAUrl,
                data: postData
            }).getHomesaverSOAService().success(function(data) {

                soaCtrl.noTransactionError = false;
                soaCtrl.errorSpin = false;
                var homeSaverTransactionDtls = data;
                if (IdfcUtils.hasContentData(homeSaverTransactionDtls) && homeSaverTransactionDtls.length) {
                    soaCtrl.transactionDtls = homeSaverTransactionDtls;
                    soaCtrl.pagesShown = 1;
                    soaCtrl.pageSize = 10;
                    setPagination(false);

                } else {
                    soaCtrl.showTable = false;
                    soaCtrl.dontShowTable = true;
                    soaCtrl.noTransactionError = true;
                }

            }).error(function(error) {
                soaCtrl.errorSpin = false;
                soaCtrl.showTable = false;
                soaCtrl.dontShowTable = true;
                soaCtrl.error = {
                    happened: true,
                    msg: 'Sorry, Our machines are not talking to each other!' +
                        ' Humans are trying to fix the problem. Please try' +
                        ' again in a while.'
                };
            });

        };


        /**
        	To display account details on load without submit button
        **/


        soaCtrl.getSoaByAccNo = function() {

            soaCtrl.error = {
                happened: false,
                msg: ''
            };
            soaCtrl.showSuccessMessagePDFEmail = false;
            soaCtrl.showFailMessagePDFEmail = false;
            soaCtrl.noTransactionError = false;
            soaCtrl.button = false;
            soaCtrl.selectAccErr = false;
            soaCtrl.blankBothDateError = false;
            soaCtrl.dateError = false;
            soaCtrl.dateRangeError = false;
            soaCtrl.blankFromDateError = false;
            soaCtrl.blankToDateError = false;
            soaCtrl.disbDateError = false;
            soaCtrl.selectAccErr = false;
            soaCtrl.bizbDateError = false;
            soaCtrl.fromDate = '';
            soaCtrl.toDate = '';
            soaCtrl.messagePDFEmail = '';
            soaCtrl.showSuccessMessagePDFEmail = false;
            soaCtrl.showFailMessagePDFEmail = false;
            soaCtrl.showTable = true;
            soaCtrl.errorSpin = true;


            if (!IdfcUtils.hasContentData(soaCtrl.selectAccountNumber)) {
                soaCtrl.showTable = false;

            } else {
                //Find out what type of account to get the SOA for
                if (soaCtrl.selectAccountNumber.loanType == "Home Loans") {
                    getHomeLoanDetails();
                    soaCtrl.showHomeLoanDetails = true;
                    soaCtrl.showHomeSaverLoanDetails = false;
                } else if (soaCtrl.selectAccountNumber.loanType == "Short&Sweet") {
                    getHomeSaverDetails();
                    soaCtrl.showHomeSaverLoanDetails = true;
                    soaCtrl.showHomeLoanDetails = false;
                }
            }
        };





        /**
			To display account details on submit button
        **/
        soaCtrl.getSoaByAccNoOnSubmit = function() {
            soaCtrl.error = {
                happened: false,
                msg: ''
            };
            soaCtrl.showSuccessMessagePDFEmail = false;
            soaCtrl.showFailMessagePDFEmail = false;
            soaCtrl.noTransactionError = false;
            soaCtrl.messagePDFEmail = '';
            soaCtrl.button = true;
            soaCtrl.blankBothDateError = false;
            soaCtrl.dateError = false;
            soaCtrl.dateRangeError = false;
            soaCtrl.blankFromDateError = false;
            soaCtrl.blankToDateError = false;
            soaCtrl.disbDateError = false;
            soaCtrl.selectAccErr = false;
            soaCtrl.bizbDateError = false;

            //to check account number is not blank
            if (!IdfcUtils.hasContentData(soaCtrl.selectAccountNumber)) {
                soaCtrl.selectAccErr = true;
                soaCtrl.showTable = false;
            } else {

                soaCtrl.selectAccErr = false;
                soaCtrl.showTable = false;
                soaCtrl.blankBothDateError = false;
                soaCtrl.dateError = false;
                soaCtrl.dateRangeError = false;
                soaCtrl.blankFromDateError = false;
                soaCtrl.blankToDateError = false;
                soaCtrl.disbDateError = false;

                // to check from date and to date are not null
                if ((soaCtrl.fromDate == null && soaCtrl.toDate == null) ||
                    (soaCtrl.fromDate == '' && soaCtrl.toDate == '')) {
                    soaCtrl.blankBothDateError = true;

                }

                // to check from date not null
                else if (soaCtrl.fromDate == null || soaCtrl.fromDate == '') {
                    soaCtrl.blankFromDateError = true;

                }
                // to check to date not null
                else if (soaCtrl.toDate == null || soaCtrl.toDate == '') {
                    soaCtrl.blankToDateError = true;

                }
                // to check from date less than to date
                else if (soaCtrl.fromDate > soaCtrl.toDate) {
                    soaCtrl.dateError = true;

                }

                // to check if date range is not greater than a year.
                else if ((soaCtrl.fromDate < soaCtrl.toDate) && ((soaCtrl.toDate.getTime() - soaCtrl.fromDate.getTime()) > 31556952000) && soaCtrl.selectAccountNumber.loanType === "Short&Sweet") {
                    soaCtrl.dateRangeError = true;

                } else {
                    var serverDateString = soaCtrl.selectAccountNumber.serverDate;
                    serverDateString = serverDateString.split("/");
                    var currentDate = new Date(serverDateString[2], serverDateString[1] - 1, serverDateString[0]);


                    /*Please comment for go live*/
                    currentDate = new Date('2021','04','3');

                    soaCtrl.todaysDate = currentDate;


                    soaCtrl.showTable = true;
                    threeMonthsEarlierDate = new Date(soaCtrl.todaysDate);
                    threeMonthsEarlierDate.setMonth(currentDate.getMonth() - 3);

                    //Check if the request is for a Home Load or a Home Saver Loan.
                    if (soaCtrl.selectAccountNumber.loanType === "Short&Sweet") {

                        soaCtrl.errorSpin = true;

                        //get transaction details for a Home Saver Loan
                        var homesaverSOAUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                            .getPreference('getHomeSaverSOA'), {
                                servicesPath: lpPortal.root
                            });

                        // var fromDate = soaCtrl.fromDate.getTime();
                        // var toDate = soaCtrl.toDate.getTime();
                        // homesaverSOAUrl = homesaverSOAUrl + soaCtrl.selectAccountNumber.acctNb
                        // 				+"&df="+fromDate
                        // 				+"&dt="+toDate;

                        var postData = {
                            'accountId': soaCtrl.selectAccountNumber.acctNb,
                            'df': soaCtrl.fromDate.getTime(),
                            'dt': soaCtrl.toDate.getTime()
                        }

                        postData = $.param(postData || {});



                        loanSOAService.setup({
                            getHomesaverSOAUrl: homesaverSOAUrl,
                            data: postData
                        }).getHomesaverSOAService().success(function(data) {
                            soaCtrl.errorSpin = false;
                            soaCtrl.noTransactionError = false;
                            soaCtrl.errorSpin = false;
                            var homeSaverTransactionDtls = data;
                            if (IdfcUtils.hasContentData(homeSaverTransactionDtls) && homeSaverTransactionDtls.length) {
                                soaCtrl.transactionDtls = homeSaverTransactionDtls;

                            } else {
                                soaCtrl.showTable = false;
                                soaCtrl.dontShowTable = true;
                                soaCtrl.noTransactionError = true;
                            }
                        }).error(function(error, status, headers, config) {

                            soaCtrl.errorSpin = false;
                            soaCtrl.showTable = false;
                            if (error.hasOwnProperty('cd') && error.cd === '501') {
                                soaCtrl.showTable = false;
                                soaCtrl.dontShowTable = true;
                                soaCtrl.noTransactionError = true;
                            } else {
                                soaCtrl.dontShowTable = true;
                                soaCtrl.error = {
                                    happened: true,
                                    msg: 'Sorry, Our machines are not talking to each other!' +
                                        ' Humans are trying to fix the problem.' +
                                        ' Please try again in a while.'
                                };
                            }

                        });

                    } else {
                        var postData = {
                            'lnAcctNb': soaCtrl.selectAccountNumber.acctNb,
                            'frmDT': soaCtrl.fromDate.getTime(),
                            'toDt': soaCtrl.toDate.getTime()
                        };
                        postData = $.param(postData || {});
                        soaCtrl.errorSpin = true;


                        if (soaCtrl.fromDate < new Date(LoanDetails.getsoaMains.dsbrsDt)){
                            soaCtrl.disbDateError = true;
                            soaCtrl.errorSpin = false;
                            return;
                        }

                        loanSOAService
                            .setup({
                                getLoanSoaURL: getLoanSoaURL + '?cnvId=OTD',
                                data: postData
                            })
                            .getLoanSOAService()
                            .success(function(data, status, headers, config) {
                                soaCtrl.noTransactionError = false;
                                soaCtrl.errorSpin = false;
                                LoanDetails = data;
                                var transactionDtls = LoanDetails.getsoaTransactionDtls;
                                if (IdfcUtils.hasContentData(transactionDtls) && !checkTransactionsEmpty(transactionDtls)) {
                                    soaCtrl.transactionDtls = LoanDetails.getsoaTransactionDtls.reverse();
                                    dateValid = LoanDetails.getsoaMains;
                                } else {
                                    soaCtrl.showTable = false;
                                    soaCtrl.dontShowTable = true;
                                    soaCtrl.noTransactionError = true;
                                }


//                                if (soaCtrl.toDate > currentDate) {
//                                    soaCtrl.showTable = false;
//                                    //soaCtrl.disbDateError = true;
//                                    soaCtrl.bizbDateError = true;
//                                }

                                // Check from date less than disbursement date && to check from date less than business date
//                                if (soaCtrl.fromDate > new Date(LoanDetails.getsoaMains.dsbrsDt) && soaCtrl.fromDate < currentDate) {
//                                 	soaCtrl.showTable = true;
//                                 	soaCtrl.disbDateError = false;
//                                 }else{
//                                 	soaCtrl.showTable = false;
//                                 	soaCtrl.dontShowTable = true;
//
//
//                                     if(soaCtrl.fromDate < new Date(LoanDetails.getsoaMains.dsbrsDt)){
//                                        soaCtrl.disbDateError = true;
//                                     }
////                                     else if(soaCtrl.fromDate > currentDate){
////                                          soaCtrl.currentDateError = true;
////
////                                     }
//                                 	//soaCtrl.noTransactionError = true;
//                                 }

                            }).error(function(error, status, headers, config) {

                                soaCtrl.errorSpin = false;
                                soaCtrl.showTable = false;
                                if (error.hasOwnProperty('cd') && error.cd === '501') {
                                    soaCtrl.showTable = false;
                                    soaCtrl.dontShowTable = true;
                                    soaCtrl.noTransactionError = true;
                                } else {
                                    soaCtrl.dontShowTable = true;
                                    soaCtrl.error = {
                                        happened: true,
                                        msg: 'Sorry, Our machines are not talking to each other!' +
                                            ' Humans are trying to fix the problem.' +
                                            ' Please try again in a while.'
                                    };
                                }
                            });
                    }

                    // sending "true" to indicate that we are setting pagination
                    // for the results generated by pressing the submit button
                    soaCtrl.pagesShown = 1;
                    soaCtrl.pageSize = 10;
                    setPagination(true);
                }
            }
        };


        //Opening date for the selected account
        function getAccountOpenDateAndStatus() {
            var deferred = $q.defer();
            //getAllCasaAccounts
            var loadAllCasaAccounts = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                .getPreference('getAllCasaAccounts'), {
                    servicesPath: lpPortal.root
                });
            loanSOAService.setup({
                    loadAllAccountsURL: loadAllCasaAccounts
                })
                .loadAllAccounts()
                .success(function(response, status, headers, config) {
                    var loadAccountNumbers = response;
                    angular.forEach(loadAccountNumbers, function(account) {
                        if (soaCtrl.selectAccountNumber.acctNb === account.accountNo) {
                            if (account.accountCreatedDate != null) {
                                var openDate = new Date((account.accountCreatedDate).split('T')[0]);
                                deferred.resolve({
                                    accountOpenDate: openDate.getTime(),
                                    accountStatus: account.accountStatus.trim()
                                });
                            }
                        }
                    });
                });
            return deferred.promise;
        }


        function formatDate(date) {
            if (date && typeof date.indexOf === "function" && date.indexOf("/") > -1) {
                date = date.split("/");
                date = new Date(date[2], date[1] - 1, date[0]);
                return date;
            } else {
                date = new Date(date);
                return date;
            }


        }

        /**
			PDF Generation
        **/
        soaCtrl.PDFGeneration = function() {

            soaCtrl.showSuccessMessagePDFEmail = false;
            soaCtrl.showFailMessagePDFEmail = false;


            // Check what type of account has been selected.
            if (soaCtrl.selectAccountNumber.loanType == "Short&Sweet") {

                //PDF Generation for Home Saver Loan
                var homesaverSOAUrl = lpCoreUtils.resolvePortalPlaceholders(
                    lpWidget.getPreference('getHomesaverPDF'), {
                        servicesPath: lpPortal.root
                    });
                soaCtrl.errorSpin = true;

                var postData = {
                    'accountId': soaCtrl.selectAccountNumber.acctNb,
                    'df': soaCtrl.fromDate.getTime(),
                    'dt': soaCtrl.toDate.getTime(),
                    'accTyp': soaCtrl.transactionDtls[0].accountType, // setting account type from transactionDtls array;
                    'emailFlag': false,
                    'openingDate': formatDate(soaCtrl.selectAccountNumber.dsbrsmntDt).getTime(),//formatDate(soaCtrl.selectAccountNumber.openingDate).getTime(),
                    'mop': 0, // always set to 0;
                    'status': lnAccStatus[soaCtrl.selectAccountNumber.active] ? lnAccStatus[soaCtrl.selectAccountNumber.active] : soaCtrl.selectAccountNumber.active,
                }

                postData = $.param(postData || {});

                //homesaverSOAUrl = homesaverSOAUrl + soaCtrl.selectAccountNumber.acctNb + "&" + params;
                loanSOAService.setup({
                        pdfGenerationEndpoint: homesaverSOAUrl,
                        data: postData
                    }).getSOAHomeSaverPDFService()
                    .success(function(response) {
                        try {
                            var file = new Blob([response], {
                                type: 'application/pdf'
                            });
                            saveAs(file, 'IDFC Bank statement.pdf');

                        } catch (e) {

                        }
                    });;
                //$anchorScroll();
                soaCtrl.errorSpin = false;

            } else {
                var postData = {
                    'lnAcctNb': soaCtrl.selectAccountNumber.acctNb,
                    'frmDT': soaCtrl.fromDate.getTime(),
                    'toDt': soaCtrl.toDate.getTime(),
                    'emailFlag': false

                };
                soaCtrl.errorSpin = true;
                postData = $.param(postData || {});
                loanSOAService
                    .setup({
                        pdfDataURL: pdfDataURL + '?cnvId=OTD',
                        data: postData
                    })
                    .getSOApdfService()
                    .success(function(response, status, headers, config) {
                        soaCtrl.errorSpin = false;
                        try {
                            var file = new Blob([response], {
                                type: 'application/pdf'
                            });
                            var filename = 'Statement of account of ' + soaCtrl.selectAccountNumber;
                            saveAs(file, filename);
                            //$anchorScroll();

                        } catch (e) {
                            console.log(e.stack);
                        }

                    }).error(function(error) {
                        soaCtrl.errorSpin = false;
                        soaCtrl.error = {
                            happened: true,
                            msg: IdfcConstants.ERROR_PDF
                        };
                    });
            }
        };

        /**
			To send Email
        **/
        soaCtrl.Emailadvice = function() {

            soaCtrl.errorSpin = true;
            //$anchorScroll();

            if (soaCtrl.selectAccountNumber.loanType == "Short&Sweet") {

                //PDF Generation for Home Saver Loan
                var homesaverSOAUrl = lpCoreUtils.resolvePortalPlaceholders(
                    lpWidget.getPreference('getHomesaverPDF'), {
                        servicesPath: lpPortal.root
                    });

                var postData = {
                    'accountId': soaCtrl.selectAccountNumber.acctNb,
                    'df': soaCtrl.fromDate.getTime(),
                    'dt': soaCtrl.toDate.getTime(),
                    'accTyp': soaCtrl.transactionDtls[0].accountType, // setting account type from transactionDtls array;
                    'openingDate': formatDate(soaCtrl.selectAccountNumber.dsbrsmntDt).getTime(),
                    'mop': 0, // always set to 0;
                    'status': lnAccStatus[soaCtrl.selectAccountNumber.active] ? lnAccStatus[soaCtrl.selectAccountNumber.active] : soaCtrl.selectAccountNumber.active,
                    'emailFlag': true
                }

                postData = $.param(postData || {});
                //homesaverSOAUrl = homesaverSOAUrl + soaCtrl.selectAccountNumber.acctNb	+ "&" + params;
                loanSOAService.setup({
                        pdfGenerationEndpoint: homesaverSOAUrl,
                        data: postData
                    }).getSOAHomeSaverPDFService()
                    .success(function(response, status, headers, config) {

                        soaCtrl.errorSpin = false;
                        soaCtrl.messagePDFEmail = 'Email has been sent to your registered email id';
                        soaCtrl.showSuccessMessagePDFEmail = true;
                        soaCtrl.showFailMessagePDFEmail = false;
                         /*$location.hash("emailSuccessMsg");
                         $anchorScroll();*/

                    }).error(function(error) {

                        if (!error.hasOwnProperty("cd")) {
                            //Converting the error response from arraybuffer to a JSON object
                            error = JSON.parse(String.fromCharCode.apply(String, new Uint8Array(error)));
                        }

                        soaCtrl.errorSpin = false;
                        soaCtrl.showFailMessagePDFEmail = true;

                        if (error.hasOwnProperty('cd') && error.cd == 'email01') {
                            soaCtrl.messagePDFEmail = 'Oops! Looks like you haven’t registered your email ID with us.';
                        } else {
                            soaCtrl.messagePDFEmail = 'Sorry, we are unable to send your Statement of Account';
                        }
                         /*$location.hash("emailSuccessMsg");
                         $anchorScroll();*/
                    });

            } else {
                soaCtrl.errorSpin = true;
                var postData = {
                    'lnAcctNb': soaCtrl.selectAccountNumber.acctNb,
                    'frmDT': soaCtrl.fromDate.getTime(),
                    'toDt': soaCtrl.toDate.getTime(),
                    'emailFlag': true
                };


                postData = $.param(postData || {});
                loanSOAService
                    .setup({
                        pdfDataURL: pdfDataURL + '?cnvId=OTD', //?&emailFlag=' + true
                        data: postData
                    })
                    .getSOAemailService()
                    .success(function(response, status, headers, config) {
                        soaCtrl.messagePDFEmail = 'Email has been sent to your registered email id';
                        soaCtrl.showSuccessMessagePDFEmail = true;
                        soaCtrl.showFailMessagePDFEmail = false;

                        soaCtrl.errorSpin = false;
                        /* $location.hash("emailSuccessMsg");
                         $anchorScroll();*/
                    }).error(function(error) {

                        if (!error.hasOwnProperty("cd")) {
                            //Converting the error response from arraybuffer to a JSON object
                            error = JSON.parse(String.fromCharCode.apply(String, new Uint8Array(error)));
                        }

                        soaCtrl.errorSpin = false;
                        soaCtrl.showFailMessagePDFEmail = true;

                        if (error.hasOwnProperty('cd') && error.cd == 'email01') {
                            soaCtrl.messagePDFEmail = 'Oops! Looks like you haven’t registered your email ID with us.';
                        } else {
                            soaCtrl.messagePDFEmail = 'Sorry, we are unable to send your Statement of Account';
                        }
                         /*$location.hash("emailSuccessMsg");
                         $anchorScroll();*/
                    });
                // soaCtrl.messagePDFEmail = 'Email has been sent to your registered email id';
                // soaCtrl.showSuccessMessagePDFEmail = true;
                // soaCtrl.showFailMessagePDFEmail = false;

            }
        };

        /**
        	PDF Generation
        		**/
        soaCtrl.printPDF = function() {

            soaCtrl.showSuccessMessagePDFEmail = false;
            soaCtrl.showFailMessagePDFEmail = false;


            // Check what type of account has been selected.
            if (soaCtrl.selectAccountNumber.loanType == "Short&Sweet") {

                //PDF Generation for Home Saver Loan
                var homesaverSOAUrl = lpCoreUtils.resolvePortalPlaceholders(
                    lpWidget.getPreference('getHomesaverPDF'), {
                        servicesPath: lpPortal.root
                    });

                // getAccountOpenDateAndStatus().then(function(accountData){
                var postData = {
                    'accountId': soaCtrl.selectAccountNumber.acctNb,
                    'df': soaCtrl.fromDate.getTime(),
                    'dt': soaCtrl.toDate.getTime(),
                    'accTyp': soaCtrl.transactionDtls[0].accountType, // setting account type from transactionDtls array;
                    'emailFlag': false,
                    'openingDate': formatDate(soaCtrl.selectAccountNumber.dsbrsmntDt).getTime(),
                    'mop': 0, // always set to 0;
                    'status': lnAccStatus[soaCtrl.selectAccountNumber.active] ? lnAccStatus[soaCtrl.selectAccountNumber.active] : soaCtrl.selectAccountNumber.active,
                }

                postData = $.param(postData || {});
                soaCtrl.errorSpin = true;
                loanSOAService.setup({
                        pdfGenerationEndpoint: homesaverSOAUrl,
                        data: postData
                    })
                    .getSOAHomeSaverPrintService()
                    .success(function(response) {
                        soaCtrl.errorSpin = false;
                        try {
                            if ('ie' === deviceDetector.browser) {
                                var byteArray = new Uint8Array(response);
                                var blob = new Blob([byteArray], {
                                    type: 'application/octet-stream'
                                });
                                window.navigator.msSaveOrOpenBlob(blob, 'IDFC Loan Statement' + '.pdf');
                            } else {
                                var file = new Blob([response], {
                                    type: 'application/pdf'
                                });

                                var fileURL = window.URL.createObjectURL(file);
                                var wndw = window.open(fileURL);
                                wndw.print();
                            }
                        } catch (e) {

                        }
                        //$anchorScroll();

                    });

            } else {
                var postData = {
                    'lnAcctNb': soaCtrl.selectAccountNumber.acctNb,
                    'frmDT': soaCtrl.fromDate.getTime(),
                    'toDt': soaCtrl.toDate.getTime(),
                    'emailFlag': false

                };

                postData = $.param(postData || {});
                loanSOAService
                    .setup({
                        pdfDataURL: pdfDataURL + '?cnvId=OTD',
                        data: postData
                    })
                    .getSOApdfService()
                    .success(function(response, status, headers, config) {
                        try {
                            if ('ie' === deviceDetector.browser) {
                                var byteArray = new Uint8Array(response);
                                var blob = new Blob([byteArray], {
                                    type: 'application/octet-stream'
                                });
                                window.navigator.msSaveOrOpenBlob(blob, 'IDFC Loan Statement' + '.pdf');
                            } else {
                                var file = new Blob([response], {
                                    type: 'application/pdf'
                                });

                                var fileURL = window.URL.createObjectURL(file);
                                var wndw = window.open(fileURL);
                                wndw.print();
                            }
                        } catch (e) {
                            console.log(e);
                        }
                        //$anchorScroll();

                    }).error(function(error) {
                        soaCtrl.error = {
                            happened: true,
                            msg: IdfcConstants.ERROR_PDF
                        };
                    });
            }
        };

        soaCtrl.formatNumber = function(numberString) {
            if (numberString.charAt(0) === '-') {
                if (!isNaN(parseInt(numberString))) {
                    numberString = parseFloat(numberString).toFixed(2)
                }
                numberString = '(' + numberString.slice(1, numberString.length) + ')';
                return numberString;
            } else {
                return numberString;
            }

        }

        // For back buttton pub-sub // Kriti code on old widget // Jay
       gadgets.pubsub.subscribe("native.back", function() {
           console.log("native.back handled in pl soa");
                  gadgets.pubsub.publish("launchpad-retail.openLoanSummary");
                  gadgets.pubsub.publish("js.back", {
                          data: "ENABLE_HOME"
                  });
       });

       gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
           console.log("device back GoBackInitiate handled in pl soa");
           if(localStorage.getItem("navigationFlag")) {
               localStorage.clear();
               gadgets.pubsub.publish("launchpad-retail.openLoanSummary");
               gadgets.pubsub.publish("js.back", {
                       data: "ENABLE_HOME"
               });
           }else {
               gadgets.pubsub.publish("device.GoBack");
           }
       });








        initialize();
          /*$timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
          $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
*/
    }
    exports.StatementOfAccountController = StatementOfAccountController;
});
