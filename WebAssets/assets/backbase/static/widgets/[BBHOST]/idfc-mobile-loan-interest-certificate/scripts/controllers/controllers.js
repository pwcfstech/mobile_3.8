/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {
    'use strict';

    var constIDFC = require('idfccommon').idfcConstants;
    var FileSaver = require('../libs/FileSaver');
    var saveAs = FileSaver.saveAs;
    //Constant Declaration 
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');
    var loanAccount = '';



    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function LoanCertificateController($http,lpWidget, lpCoreUtils, lpCoreBus, lpPortal, Services, IdfcUtils, IdfcConstants, LauncherDeckRefreshContent, deviceDetector) {
        var loanCertCtrl = this;
        var currentYear = '';
        var previousYear = '';
        var loanAccountNumbers = [];
        var prdCd = '';

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




        if ('android' === deviceDetector.device || 'iphone' === deviceDetector.device || 'windows-phone' === deviceDetector.device) {
            loanCertCtrl.isMobileDevice = true;
        } else {
            loanCertCtrl.isMobileDevice = false;
        }

        var loanAccountListUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('getLoanAccountListAggregated'), {
                servicesPath: lpPortal.root
            });

        console.log("loanAccountListUrl", loanAccountListUrl);
        var getloanInterestCertificate = lpCoreUtils
            .resolvePortalPlaceholders(lpWidget
                .getPreference('getloanInterestCert'));
        var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
            .getPreference('LoanInterestpdfSrc'));
        // Loan Account List
        function getLoanAccList() {
            var xhr;
            xhr = Services.setup({
                loanAccountListUrl: loanAccountListUrl
            }).loadLoanAcctList();
            xhr
                .success(
                    function(data) {
                        loanAccountNumbers = data;
                        lpCoreUtils.forEach(data, function(list) {

                            var loanAccountObj = {
                                acctNb: "",
                                loanType: "",
                                loanObj: {}
                            };
                            if (list.prdCd == "HOME_TOP" || list.prdCd == "BASIC_H" || list.prdCd == "YOUTHHOME" || list.prdCd == "YOUTH_TOP") {

                                loanAccountObj.acctNb = list.acctNb;
                                loanAccountObj.loanType = "Home Loan";
                                loanAccountObj.loanObj = list;

                            }
                            // Home Saver product codes
                            else if (list.prdCd == "MON_SAVER" || list.prdCd == "4000" || list.prdCd == "MONEY_TOP") {

                                loanAccountObj.acctNb = list.acctNb;
                                loanAccountObj.loanType = "Short&Sweet";
                                loanAccountObj.loanObj = list;

                            }

                            if (!loanCertCtrl.loanAccountNumbersDropdwnObjectList.hasOwnProperty(list.acctNb) && loanAccountObj.acctNb !== "") {
                                loanCertCtrl.loanAccountNumbersDropdwn.push(loanAccountObj);
                                loanCertCtrl.loanAccountNumbersDropdwnObjectList[list.acctNb] = list;
                            }

                        });
                        if (loanCertCtrl.loanAccountNumbersDropdwn.length === 1 && loanCertCtrl.loanAccountNumbersDropdwn[0].loanType === "Short&Sweet") {
                            loanCertCtrl.NewloanDeatil = loanCertCtrl.loanAccountNumbersDropdwn[0];
                            loanCertCtrl.submitDiv();
                        }
                        loanCertCtrl.errorSpin = false;
                    }).error(function(error) {
                    loanCertCtrl.currentFinYearDiv = false;
                    loanCertCtrl.previousFinYearDiv = false;
                    loanCertCtrl.errorSpin = false;
                    if (error.cd === '511') {
                        loanCertCtrl.error = {
                            happened: true,
                            msg: constIDFC.ERROR_NO_LOANS
                        };
                    } else {
                        loanCertCtrl.error = {
                            happened: true,
                            msg: error.rsn
                        };
                    }
                });
        }

        var initialize = function() {
            //Session Management
            idfcHanlder.validateSession($http);
            console.log("Interest certificate initialize called");
            loanCertCtrl.loanAccountNumbersDropdwn = [];
            loanCertCtrl.loanAccountNumbersDropdwnObjectList = {};
            loanCertCtrl.LoanDetails = [];
            loanCertCtrl.errorSpin = true;
            loanCertCtrl.NewloanDeatil = {
                acctNb: ''
            };
            loanCertCtrl.currentFinYearDiv = false;
            loanCertCtrl.previousFinYearDiv = false;
            loanCertCtrl.loanAcctError = false;
            loanCertCtrl.financialYearError = false;
            loanCertCtrl.button = false;
            loanCertCtrl.loanYear = '';
            loanCertCtrl.error = {
                happened: false,
                msg: ''
            };
            loanCertCtrl.note = false;
            loanCertCtrl.successMessagePDFEmail = '';
            // Calculating current/previous financial year
            var currentDate = new Date();
            if (currentDate.getMonth() > 2) {
                currentYear = (currentDate.getFullYear()) + '-' + (currentDate.getFullYear() + 1);
                previousYear = (currentDate.getFullYear() - 1) + '-' + (currentDate.getFullYear());
            } else {
                currentYear = (currentDate.getFullYear() - 1) + '-' + (currentDate.getFullYear());
                previousYear = (currentDate.getFullYear() - 2) + '-' + (currentDate.getFullYear() - 1);
            }


            var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
            loanCertCtrl.errorImage = path + '/media/error.png'


            // For testing purpose we are modifying the financial year
             /* previousYear = "2021-2022";
              currentYear = "2022-2023";*/


            loanCertCtrl.year = [currentYear, previousYear];
            getLoanAccList();
            loanCertCtrl.NewloanDeatil = {
                acctNb: ''
            };

            if(localStorage.getItem("origin")=="home-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
             }


            // Widget Pub Sub
            var loanAccount = localStorage.getItem('lnAccount');

            if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){

              loanAccount = JSON.parse(loanAccount);
              localStorage.setItem('lnAccount' , '');
              var loanAccountObj = {
                  acctNb: "",
                  loanType: "",
                  loanObj: {}
              };
              if (loanAccount.prdCd == "HOME_TOP" || loanAccount.prdCd == "BASIC_H" || loanAccount.prdCd == "YOUTHHOME" || loanAccount.prdCd == "YOUTH_TOP") {

                  loanAccountObj.acctNb = loanAccount.acctNb;
                  loanAccountObj.loanType = "Home Loan";
                  loanAccountObj.loanObj = loanAccount;

              }
              // Home Saver product codes
              else if (loanAccount.prdCd == "MON_SAVER" || loanAccount.prdCd == "4000" || loanAccount.prdCd == "MONEY_TOP") {

                  loanAccountObj.acctNb = loanAccount.acctNb;
                  loanAccountObj.loanType = "Short&Sweet";
                  loanAccountObj.loanObj = loanAccount;

              }

              if (!loanCertCtrl.loanAccountNumbersDropdwnObjectList.hasOwnProperty(loanAccount.acctNb)) {
                  console.log("loanCertCtrl.loanAccountNumbersDropdwnObjectList: ", loanCertCtrl.loanAccountNumbersDropdwnObjectList);
                  loanCertCtrl.NewloanDeatil = loanAccountObj;
                  console.log('loanCertCtrl.NewloanDeatil: ',loanAccountObj);
                  loanCertCtrl.loanAccountNumbersDropdwnObjectList[loanAccount.acctNb] = loanAccount;
                  loanCertCtrl.loanAccountNumbersDropdwn.push(loanCertCtrl.NewloanDeatil);
              }

            }
        }

        // Drop down Change Event
        loanCertCtrl.accountNumberChange = function() {

            if (loanCertCtrl.NewloanDeatil.loanObj.prdCd === 'MON_SAVER' || loanCertCtrl.NewloanDeatil.loanObj.prdCd === 'MONEY_TOP' || loanCertCtrl.NewloanDeatil.loanObj.prdCd === '4000') {
                loanCertCtrl.error = {
                    happened: true,
                    msg: 'Interest Certificate for Short&Sweet Accounts is currently not available. Please contact 1800 419 4332'
                };
            } else {
                loanCertCtrl.error = {
                    happened: false,
                    msg: ''
                };
            }
            loanCertCtrl.successMessagePDFEmail = '';
            loanCertCtrl.currentFinYearDiv = false;
            loanCertCtrl.previousFinYearDiv = false;
            loanCertCtrl.loanAcctError = false;
            loanCertCtrl.financialYearError = false;
            loanCertCtrl.button = false;
            loanCertCtrl.note = false;
            loanCertCtrl.loanYear = '';

        };


        loanCertCtrl.yearChange = function() {
            loanCertCtrl.currentFinYearDiv = false;
            loanCertCtrl.previousFinYearDiv = false;
            loanCertCtrl.loanAcctError = false;
            loanCertCtrl.financialYearError = false;
            loanCertCtrl.button = false;
            loanCertCtrl.note = false;
            loanCertCtrl.error = {
                happened: false,
                msg: ''
            };
            loanCertCtrl.successMessagePDFEmail = '';
        };

        // Submit Button Validation
        loanCertCtrl.submitDiv = function() {
            loanCertCtrl.successMessagePDFEmail = '';
            loanCertCtrl.loanAcctError = false;
            loanCertCtrl.financialYearError = false;
            loanCertCtrl.note = false;
            loanCertCtrl.previousFinYearDiv = false;
            loanCertCtrl.button = false;
            loanCertCtrl.currentFinYearDiv = false;
            loanCertCtrl.error = {
                happened: false,
                msg: ''
            };
            for (var count = 0; count < loanAccountNumbers.length; count++) {
                if (loanAccountNumbers[count].acctNb === loanCertCtrl.NewloanDeatil.acctNb) {
                    prdCd = loanAccountNumbers[count].prdCd;
                }
            }
            // Checking loan account number if null
            if (prdCd === 'MON_SAVER' || prdCd === 'MONEY_TOP' || prdCd === '4000') {
                loanCertCtrl.currentFinYearDiv = false;
                loanCertCtrl.previousFinYearDiv = false;
                loanCertCtrl.button = false;
                loanCertCtrl.error = {
                    happened: true,
                    msg: 'Interest Certificate for Short&Sweet Accounts is currently not available. Please contact 1800 419 4332'
                };

            } else if (!IdfcUtils.hasContentData(loanCertCtrl.loanYear)) {

                loanCertCtrl.financialYearError = true;

            } else if (!IdfcUtils.hasContentData(loanCertCtrl.NewloanDeatil.acctNb)) {

                loanCertCtrl.loanAcctError = true;
            } else if ((prdCd === 'HOME_TOP' || prdCd === 'MONEY_TOP') && loanCertCtrl.loanYear.trim() === currentYear) {
                loanCertCtrl.currentFinYearDiv = false;
                loanCertCtrl.previousFinYearDiv = false;
                loanCertCtrl.button = false;
                loanCertCtrl.error = {
                    happened: true,
                    msg: 'Sorry, you have no interest certificate for the year selected. Please select a different year'
                };
            } else {
                // Details on the basis of account no and financial year
                var newloanYear = loanCertCtrl.loanYear.trim().substring(0, 4);
                var postData = {
                    'acctNb': loanCertCtrl.NewloanDeatil.acctNb,
                    'year': newloanYear
                };
                postData = lpCoreUtils.buildQueryString(postData);
                loanCertCtrl.errorSpin = true;
                var xhr;
                xhr = Services.setup({
                    getloanInterestCertificate: getloanInterestCertificate,
                    postData: postData
                }).loadLoanIntCert();
                xhr
                    .success(
                        function(data, status, headers, config) {
                            loanCertCtrl.note = true;
                            loanCertCtrl.errorSpin = false;
                            loanCertCtrl.LoanDetails = data;
                            if (IdfcUtils.hasContentData(loanCertCtrl.LoanDetails)) {
                                if (loanCertCtrl.LoanDetails.prncplAmt === null || loanCertCtrl.LoanDetails.prncplAmt
                                    .trim() === '') {
                                    loanCertCtrl.LoanDetails.prncplAmt = 0;
                                }
                                if (loanCertCtrl.LoanDetails.intrstAmt === null || (loanCertCtrl.LoanDetails.intrstAmt
                                        .trim()) === '') {
                                    loanCertCtrl.LoanDetails.intrstAmt = 0;
                                }
                                if (loanCertCtrl.LoanDetails.provIntrstAmt === null || (loanCertCtrl.LoanDetails.provIntrstAmt
                                        .trim()) === '') {
                                    loanCertCtrl.LoanDetails.provIntrstAmt = 0;
                                }
                                if (loanCertCtrl.LoanDetails.provPrncplAmt === null || (loanCertCtrl.LoanDetails.provPrncplAmt
                                        .trim()) === '') {
                                    loanCertCtrl.LoanDetails.provPrncplAmt = 0;
                                }
                            }
                            if (currentYear === loanCertCtrl.loanYear
                                .trim()) {
                                loanCertCtrl.startDate = IdfcConstants.START_DATE + loanCertCtrl.loanYear.trim()
                                    .substring(0, 4);
                                loanCertCtrl.endDate = IdfcConstants.END_DATE + loanCertCtrl.loanYear.trim()
                                    .substring(5, 9);
                                loanCertCtrl.previousFinYearDiv = false;
                                loanCertCtrl.currentFinYearDiv = true;
                                loanCertCtrl.button = true;
                            }
                            if (previousYear === loanCertCtrl.loanYear
                                .trim()) {
                                loanCertCtrl.startDate = IdfcConstants.START_DATE + loanCertCtrl.loanYear.trim()
                                    .substring(0, 4);
                                loanCertCtrl.endDate = IdfcConstants.END_DATE + loanCertCtrl.loanYear.trim()
                                    .substring(5, 9);
                                loanCertCtrl.currentFinYearDiv = false;
                                loanCertCtrl.previousFinYearDiv = true;
                                loanCertCtrl.button = true;
                            }
                            if (loanCertCtrl.loanYear.trim() !== previousYear && loanCertCtrl.loanYear.trim() !== currentYear || loanCertCtrl.NewloanDeatil.acctNb === '' || undefined === loanCertCtrl.NewloanDeatil.acctNb) {
                                loanCertCtrl.currentFinYearDiv = false;
                                loanCertCtrl.previousFinYearDiv = false;
                                loanCertCtrl.button = false;
                            }
                        }).error(
                        function(error, status, headers, config) {
                            loanCertCtrl.note = false;
                            loanCertCtrl.errorSpin = false;
                            loanCertCtrl.error = {
                                happened: true,
                                msg: error.rsn
                            };
                        });
            }
        };
        // PDF Generation
        loanCertCtrl.PDFGeneration = function(print) {
            loanCertCtrl.successMessagePDFEmail = '';
            loanCertCtrl.errorSpin = true;
            for (var count = 0; count < loanAccountNumbers.length; count++) {
                if (loanAccountNumbers[count].acctNb === loanCertCtrl.NewloanDeatil.acctNb) {
                    prdCd = loanAccountNumbers[count].prdCd;
                }
            }
            if ((prdCd === 'BASIC_H' || prdCd === 'YOUTHHOME' || prdCd === 'MON_SAVER') && loanCertCtrl.loanYear.trim() === currentYear) {
                loanCertCtrl.LoanDetails.table = 'Prov_Stmt';
            } else if ((prdCd === 'BASIC_H' || prdCd === 'YOUTHHOME' || prdCd === 'MON_SAVER') && loanCertCtrl.loanYear.trim() === previousYear) {
                loanCertCtrl.LoanDetails.table = 'Actual_Stmt';
            } else if ((prdCd === 'HOME_TOP' || prdCd === 'MONEY_TOP') && loanCertCtrl.loanYear.trim() === previousYear) {
                loanCertCtrl.LoanDetails.table = 'Topup_Stmt';
            } else {
                loanCertCtrl.LoanDetails.table = '';
            }
            var postData = {
                'brwrNm': loanCertCtrl.LoanDetails.brwrNm,
                'date': loanCertCtrl.LoanDetails.date,
                'refNb': loanCertCtrl.LoanDetails.refNb,
                'disbAmt': loanCertCtrl.LoanDetails.disbAmt,
                'roi': loanCertCtrl.LoanDetails.roi,
                'prd': loanCertCtrl.LoanDetails.prd,
                'cusNm': loanCertCtrl.LoanDetails.cusNm,
                'finStYr': loanCertCtrl.LoanDetails.finStYr,
                'finEndYr': loanCertCtrl.LoanDetails.finEndYr,
                'lnAcctNb': loanCertCtrl.LoanDetails.lnAcctNb,
                'ttlPdAmt': loanCertCtrl.LoanDetails.ttlPdAmt,
                'provIntrstAmt': loanCertCtrl.LoanDetails.provIntrstAmt,
                'provPrncplAmt': loanCertCtrl.LoanDetails.provPrncplAmt,
                'usrId': loanCertCtrl.LoanDetails.usrId,
                'orgCode': loanCertCtrl.LoanDetails.orgCode,
                'adr1': loanCertCtrl.LoanDetails.adr1,
                'adr2': loanCertCtrl.LoanDetails.adr2,
                'city': loanCertCtrl.LoanDetails.city,
                'state': loanCertCtrl.LoanDetails.state,
                'pncd': loanCertCtrl.LoanDetails.pncd,
                'phn': loanCertCtrl.LoanDetails.phn,
                'strtYr': loanCertCtrl.LoanDetails.strtYr,
                'endYr': loanCertCtrl.LoanDetails.endYr,
                'futrPrncpl': loanCertCtrl.LoanDetails.futrPrncpl,
                'nxtInstlmt': loanCertCtrl.LoanDetails.nxtInstlmt,
                'nxtInstlmtDt': loanCertCtrl.LoanDetails.nxtInstlmtDt,
                'outstgPrncpl': loanCertCtrl.LoanDetails.outstgPrncpl,
                'lstEmiIntrstDt': loanCertCtrl.LoanDetails.lstEmiIntrstDt,
                'lstEmiPrncplDt': loanCertCtrl.LoanDetails.lstEmiPrncplDt,
                'fstEmiPrncplDt': loanCertCtrl.LoanDetails.fstEmiPrncplDt,
                'fstEmiIntrstDt': loanCertCtrl.LoanDetails.fstEmiIntrstDt,
                'prncplAmt': loanCertCtrl.LoanDetails.prncplAmt,
                'intrstAmt': loanCertCtrl.LoanDetails.intrstAmt,
                'astAdd': loanCertCtrl.LoanDetails.astAdd,
                'coAplntNm': (loanCertCtrl.LoanDetails.coAplntNm.trim() === '-' || loanCertCtrl.LoanDetails.coAplntNm.trim().length == 0) ? "NA" : loanCertCtrl.LoanDetails.coAplntNm,
                'currentYearSelected': loanCertCtrl.loanYear.trim(),
                'table': loanCertCtrl.LoanDetails.table,
                'emailType': 'false' // TODO: give varible name
            };

            if (loanCertCtrl.LoanDetails.table !== '') {
                postData = lpCoreUtils.buildQueryString(postData);
                var xhr;
                xhr = Services.setup({
                    pdfUrl: pdfUrl,
                    postData: postData
                }).loadPDF();
                xhr.success(
                    function(response, status, headers, config) {
                        loanCertCtrl.errorSpin = false;
                        try {
                            if (print) {

                                if ('ie' === deviceDetector.browser) {
                                    var byteArray = new Uint8Array(response);
                                    var blob = new Blob([byteArray], {
                                        type: 'application/octet-stream'
                                    });
                                    window.navigator.msSaveOrOpenBlob(blob, 'Interest Certificate for ' + loanCertCtrl.NewloanDeatil.acctNb + '.pdf');
                                } else {
                                    var file = new Blob([response], {
                                        type: 'application/pdf'
                                    });

                                    var fileURL = window.URL.createObjectURL(file);
                                    var wndw = window.open(fileURL);
                                    wndw.print();
                                }
                            } else {
                                var file = new Blob([response], {
                                    type: 'application/pdf'
                                });
                                var filename = 'Interest Certificate for ' + loanCertCtrl.NewloanDeatil.acctNb;
                                saveAs(file, filename);
                            }

                        } catch (e) {
                            loanCertCtrl.errorSpin = false;
                            loanCertCtrl.currentFinYearDiv = false;
                            loanCertCtrl.previousFinYearDiv = false;
                            loanCertCtrl.note = false;
                            loanCertCtrl.button = false;
                            loanCertCtrl.error = {
                                happened: true,
                                msg: IdfcConstants.ERROR_PDF
                            };
                        }
                    }).error(function(error) {
                    loanCertCtrl.errorSpin = false;
                    loanCertCtrl.currentFinYearDiv = false;
                    loanCertCtrl.previousFinYearDiv = false;
                    loanCertCtrl.note = false;
                    loanCertCtrl.button = false;
                    loanCertCtrl.error = {
                        happened: true,
                        msg: IdfcConstants.ERROR_PDF
                    };
                });
            } else {
                loanCertCtrl.errorSpin = false;
                loanCertCtrl.currentFinYearDiv = false;
                loanCertCtrl.previousFinYearDiv = false;
                loanCertCtrl.note = false;
                loanCertCtrl.button = false;
                loanCertCtrl.error = {
                    happened: true,
                    msg: 'Sorry, you have no interest certificate for the year selected. Please select a different year.'
                };
            }
        };
        // Email Advice
        loanCertCtrl.Emailadvice = function() {
            loanCertCtrl.successMessagePDFEmail = '';
            loanCertCtrl.errorSpin = true;
            loanCertCtrl.emailError = false;

            for (var count = 0; count < loanAccountNumbers.length; count++) {
                if (loanAccountNumbers[count].acctNb === loanCertCtrl.NewloanDeatil.acctNb) {
                    prdCd = loanAccountNumbers[count].prdCd;
                }
            }
            if ((prdCd === 'BASIC_H' || prdCd === 'YOUTHHOME' || prdCd === 'MON_SAVER') && loanCertCtrl.loanYear.trim() === currentYear) {
                loanCertCtrl.LoanDetails.table = 'Prov_Stmt';
            } else if ((prdCd === 'BASIC_H' || prdCd === 'YOUTHHOME' || prdCd === 'MON_SAVER') && loanCertCtrl.loanYear.trim() === previousYear) {
                loanCertCtrl.LoanDetails.table = 'Actual_Stmt';
            } else if ((prdCd === 'HOME_TOP' || prdCd === 'MONEY_TOP') && loanCertCtrl.loanYear.trim() === previousYear) {
                loanCertCtrl.LoanDetails.table = 'Topup_Stmt';
            } else {
                loanCertCtrl.LoanDetails.table = '';
            }
            var postData = {
                'brwrNm': loanCertCtrl.LoanDetails.brwrNm,
                'date': loanCertCtrl.LoanDetails.date,
                'refNb': loanCertCtrl.LoanDetails.refNb,
                'disbAmt': loanCertCtrl.LoanDetails.disbAmt,
                'roi': loanCertCtrl.LoanDetails.roi,
                'prd': loanCertCtrl.LoanDetails.prd,
                'cusNm': loanCertCtrl.LoanDetails.cusNm,
                'finStYr': loanCertCtrl.LoanDetails.finStYr,
                'finEndYr': loanCertCtrl.LoanDetails.finEndYr,
                'lnAcctNb': loanCertCtrl.LoanDetails.lnAcctNb,
                'ttlPdAmt': loanCertCtrl.LoanDetails.ttlPdAmt,
                'provIntrstAmt': loanCertCtrl.LoanDetails.provIntrstAmt,
                'provPrncplAmt': loanCertCtrl.LoanDetails.provPrncplAmt,
                'usrId': loanCertCtrl.LoanDetails.usrId,
                'orgCode': loanCertCtrl.LoanDetails.orgCode,
                'adr1': loanCertCtrl.LoanDetails.adr1,
                'adr2': loanCertCtrl.LoanDetails.adr2,
                'city': loanCertCtrl.LoanDetails.city,
                'state': loanCertCtrl.LoanDetails.state,
                'pncd': loanCertCtrl.LoanDetails.pncd,
                'phn': loanCertCtrl.LoanDetails.phn,
                'strtYr': loanCertCtrl.LoanDetails.strtYr,
                'endYr': loanCertCtrl.LoanDetails.endYr,
                'futrPrncpl': loanCertCtrl.LoanDetails.futrPrncpl,
                'nxtInstlmt': loanCertCtrl.LoanDetails.nxtInstlmt,
                'nxtInstlmtDt': loanCertCtrl.LoanDetails.nxtInstlmtDt,
                'outstgPrncpl': loanCertCtrl.LoanDetails.outstgPrncpl,
                'lstEmiIntrstDt': loanCertCtrl.LoanDetails.lstEmiIntrstDt,
                'lstEmiPrncplDt': loanCertCtrl.LoanDetails.lstEmiPrncplDt,
                'fstEmiPrncplDt': loanCertCtrl.LoanDetails.fstEmiPrncplDt,
                'fstEmiIntrstDt': loanCertCtrl.LoanDetails.fstEmiIntrstDt,
                'prncplAmt': loanCertCtrl.LoanDetails.prncplAmt,
                'intrstAmt': loanCertCtrl.LoanDetails.intrstAmt,
                'astAdd': loanCertCtrl.LoanDetails.astAdd,
                'coAplntNm': (loanCertCtrl.LoanDetails.coAplntNm.trim() === '-' || loanCertCtrl.LoanDetails.coAplntNm.trim().length == 0) ? "NA" : loanCertCtrl.LoanDetails.coAplntNm,
                'currentYearSelected': loanCertCtrl.loanYear.trim(),
                'table': loanCertCtrl.LoanDetails.table,
                'emailType': 'true'
            };
            if (loanCertCtrl.LoanDetails.table !== '') {
                postData = lpCoreUtils.buildQueryString(postData);
                var xhr;
                xhr = Services.setup({
                    pdfUrl: pdfUrl,
                    postData: postData
                }).loadPDF();
                xhr
                    .success(
                        function(response, status, headers, config) {
                            loanCertCtrl.errorSpin = false;
                            loanCertCtrl.successMessagePDFEmail = 'Email is sent to your registered email id';
                            loanCertCtrl.emailError = true;
                        })
                    .error(
                        function(error) {

                            if (!error.hasOwnProperty("cd")) {
                                //Converting the error response from arraybuffer to a JSON object
                                error = JSON.parse(String.fromCharCode.apply(String, new Uint8Array(error)));
                            }
                            loanCertCtrl.errorSpin = false;
                            loanCertCtrl.emailError = true;


                            if (error.cd === 'email01') {
                                loanCertCtrl.successMessagePDFEmail = 'Oops! Looks like you haven’t registered your email ID with us.';
                            } else {
                                loanCertCtrl.successMessagePDFEmail = 'Sorry, we are unable to send your interest certificate for the year ' + loanCertCtrl.loanYear + '. Please try again in some time';
                            }
                        });
            } else {
                loanCertCtrl.errorSpin = false;
                loanCertCtrl.currentFinYearDiv = false;
                loanCertCtrl.previousFinYearDiv = false;
                loanCertCtrl.note = false;
                loanCertCtrl.button = false;
                loanCertCtrl.error = {
                    happened: true,
                    msg: 'Sorry, you have no interest certificate for the year selected. Please select a different year.'
                };
            }
        };




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


        // Widget Refresh Commented from ref back up widget // Jay // Home saver mobile banking

        //LauncherDeckRefreshContent.setup(lpCoreBus, initialize).listen(lpWidget);
/*        var deckPanelOpenHandler;
        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                initialize();
            }
        };
        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
*/


        initialize();

    }

    /**
     * Export Controllers
     */
    exports.LoanCertificateController = LoanCertificateController;
});
