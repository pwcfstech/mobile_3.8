/**
 * Controllers
 *
 * @module controllers
 */
define(function(require, exports) {

    'use strict';
    var $ = require('jquery');
    var fileSaver = require('../libs/FileSaver');
    var saveAs = fileSaver.saveAs;
    var idfcHanlder = require('idfcerror');

    /**
     * RepaymentController
     *
     * @ngInject
     * @constructor
     */
    function RepaymentController($http,lpWidget, lpCoreUtils, lpCoreError, lpCoreBus, lpPortal,
        LoanRepayService, IdfcUtils, LauncherDeckRefreshContent,
        $anchorScroll, deviceDetector) {

        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        var loanRepayServices = LoanRepayService;
        var ctrlRepay = this;
        var details = [];
        var pagesShown = 1;
        var pageSize = 5;
        var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
        var mediaDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/media';
        ctrlRepay.serverDate = new Date(); // This is reset to the server date after getting the list of the account numberber

        // Configuration for loading the partial templates
        ctrlRepay.templates = {
            header: partialsDir + '/loan-repay-header.html',
            error: partialsDir + '/loan-repay-error.html',
            body: partialsDir + '/loan-repay-body.html'
        };


        ctrlRepay.images = {
            errorImg: mediaDir + '/error.png'
        };

        if ('android' === deviceDetector.device ||
            'iphone' === deviceDetector.device ||
            'windows-phone' === deviceDetector.device) {
            ctrlRepay.isMobileDevice = true;
        } else {
            ctrlRepay.isMobileDevice = false;
        }

        var initialize = function() {
            //Session Management
            idfcHanlder.validateSession($http);
            details = [];
            ctrlRepay.isOpenDate1 = false;
            ctrlRepay.isOpenDate2 = false;
            ctrlRepay.fromDate = '';
      		ctrlRepay.toDate = '';
            ctrlRepay.maxDisbursementDate = new Date();
            ctrlRepay.loanDetails = [];
            ctrlRepay.dateError = false;
            ctrlRepay.blankToDateError = false;
            ctrlRepay.blankFromDateError = false;
            ctrlRepay.blankBothDateError = false;
            ctrlRepay.showtable = false;
            ctrlRepay.dontShowTable = false;
            ctrlRepay.noPendingLoansMsg = false;
            ctrlRepay.noLoansSearchMsg = false;
            ctrlRepay.showPrintEmailPdfOptions = false;
            ctrlRepay.error = {
                happened: false,
                msg: ''
            };
            ctrlRepay.loanAccountNumbers = [];
            ctrlRepay.loanAccountNumbersObjectList = {}; //Used to check if the account numnber is already part of loanAccountNumbers


             if(localStorage.getItem("origin")=="home-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
             }

            var loanAccount = localStorage.getItem('lnAccount');

            if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
                 loanAccount = JSON.parse(loanAccount);
                 localStorage.setItem('lnAccount' , '');
                 ctrlRepay.selectedAccountNumber = "";
                 ctrlRepay.errorSpin = true;

                 var loanAccountObj = {
                    accountNumber:"",
                    loanType: "",
                    loanObj:{}
                 }

                  if ( loanAccount.prdCd == "HOME_TOP" || loanAccount.prdCd == "BASIC_H" || loanAccount.prdCd == "YOUTHHOME" || loanAccount.prdCd == "YOUTH_TOP") {

                      loanAccountObj.accountNumber = loanAccount.acctNb;
                      loanAccountObj.loanType = "Home Loan";
                      loanAccountObj.loanObj = loanAccount;


                  }
                  // Home Saver product codes
                  else if (loanAccount.prdCd == "MON_SAVER" || loanAccount.prdCd == "4000" || loanAccount.prdCd == "MONEY_TOP") {

                      loanAccountObj.accountNumber = loanAccount.acctNb;
                      loanAccountObj.loanType = "Short&Sweet";
                      loanAccountObj.loanObj = loanAccount;

                  }

                  if(!ctrlRepay.loanAccountNumbersObjectList.hasOwnProperty(loanAccount.acctNb)){
                    ctrlRepay.loanAccountNumbers.push(loanAccountObj);
                    ctrlRepay.loanAccountNumbersObjectList[loanAccount.acctNb] = loanAccount;
                    ctrlRepay.selectedAccountNumber = loanAccountObj;
                    ctrlRepay.getLoanDetailsByAccNo();
                  }else{
                    //Else Dont push
                    ctrlRepay.selectedAccountNumber = ctrlRepay.loanAccountNumbers[0];//loanAccountObj;
                    ctrlRepay.getLoanDetailsByAccNo();
                  }

                } else {
                  ctrlRepay.selectedAccountNumber = '';

                }

            // function call to load accounts into the account dropdown
            getLoanAccList();
        }



        //code for Pagination start
        function setPagination() {
            ctrlRepay.paginationLimit = function() {
                var returnVar = pageSize * pagesShown;
                return returnVar;
            };
            ctrlRepay.showMoreItems = function() {
                pagesShown = pagesShown + 1;
            };
            ctrlRepay.hasMoreItemsToShow = function() {
                return pagesShown < (ctrlRepay.loanDetails.length / pageSize);
            };
        }

        ctrlRepay.setServerDate = function(data){
          if (!checkTransactionsEmpty(data)) {
            var transactionObj = data[0];
            var serverDate = transactionObj.serverDt;

            // Server date is sent in dd/mm/yyyy format ie. 26/12/2016
            // Which needs to be formated.

            if(serverDate.indexOf("/") > -1) {
                 serverDate = serverDate.split("/");
                ctrlRepay.serverDate = new Date(
                    serverDate[2],
                    serverDate[1] - 1,
                    serverDate[0]);
            } else {
                ctrlRepay.serverDate = new Date(serverDate);
            }

          }
        }


        //call to fetch loan accounts number
        function getLoanAccList() {
            ctrlRepay.errorSpin = true;
            ctrlRepay.showPrintEmailPdfOptions = false;

            var loanAccountsUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
                .getPreference('getLoanAccountListAggregated'), {
                    servicesPath: lpPortal.root
                });



            loanRepayServices.getLoanAccountLists(loanAccountsUrl).success(function(data) {

                console.log("getLoanAccList: "+JSON.stringify(data));

                lpCoreUtils.forEach(data, function(list) {

                    var loanAccountObj = {
                        accountNumber: "",
                        loanType: "",
                        loanObj: {}
                    }

                    //Check which type each loan account is.
                    // Home Loan product codes

                    if(!ctrlRepay.loanAccountNumbersObjectList.hasOwnProperty(list.acctNb)){
                      if ( list.prdCd == "HOME_TOP" || list.prdCd == "BASIC_H" || list.prdCd == "YOUTHHOME" || list.prdCd == "YOUTH_TOP") {

                          loanAccountObj.accountNumber = list.acctNb;
                          loanAccountObj.loanType = "Home Loan";
                          loanAccountObj.loanObj = list;

                          ctrlRepay.loanAccountNumbers.push(loanAccountObj);
                          ctrlRepay.loanAccountNumbersObjectList[list.acctNb] = list;

                      }
                      // Home Saver product codes
                      else if (list.prdCd == "MON_SAVER" || list.prdCd == "4000" || list.prdCd == "MONEY_TOP") {

                          loanAccountObj.accountNumber = list.acctNb;
                          loanAccountObj.loanType = "Short&Sweet";
                          loanAccountObj.loanObj = list;

                          ctrlRepay.loanAccountNumbers.push(loanAccountObj);
                          ctrlRepay.loanAccountNumbersObjectList[list.acctNb] = list;

                      }
                    }else{
                        // Else continue as the loanAccountNumbers alraedy has an entry for this acoount.
                    }


                });
                ctrlRepay.errorSpin = false;
                //console.log("ctrlRepay.selectedAccountNumber",ctrlRepay.selectedAccountNumber);

                // to display the first value as default selected
                // value (ng-selected =$first as an alternative)
                if (ctrlRepay.loanAccountNumbers.length === 1) {
                    ctrlRepay.selectedAccountNumber = ctrlRepay.loanAccountNumbers[0];
                    ctrlRepay.getLoanDetailsByAccNo();
                }
            }).error(function(error) {
                ctrlRepay.errorSpin = false;
                ctrlRepay.dontShowTable = true;
                ctrlRepay.showtable = false;
                ctrlRepay.error = {
                    happened: true,
                    msg: error.rsn
                };
            });
        }


        function checkTransactionsEmpty(value) {
            var flag = false;
            if (value.length == 1) {
                if (value[0].instDueDate === '') {
                    flag = true;
                }
            } else {
                flag = false;
            }
            return flag;
        }

        //opens the calender of from date
        ctrlRepay.openFromDateCalendar = function($event) {
            ctrlRepay.isOpenDate1 = true;
            ctrlRepay.isOpenDate2 = false;
            $event.preventDefault();
            $event.stopPropagation();
        };

        //opens the calender of To date
        ctrlRepay.openToDateCalendar = function($event) {
            ctrlRepay.isOpenDate2 = true;
            ctrlRepay.isOpenDate1 = false;
            $event.preventDefault();
            $event.stopPropagation();
        };

        ctrlRepay.getLoanDetailsByAccNo = function() {
            pagesShown = 1;
            pageSize = 5;
            ctrlRepay.error = {
                happened: false,
                msg: ''
            };
            ctrlRepay.successMessagePDFEmail = '';
            ctrlRepay.showPrintEmailPdfOptions = false;
            ctrlRepay.noTransactionError = false;
            ctrlRepay.fromDate = '';
            ctrlRepay.toDate = '';
            if (null == ctrlRepay.selectedAccountNumber || ctrlRepay.selectedAccountNumber === '') {
                ctrlRepay.showtable = false;
                ctrlRepay.dontShowTable = false;
                ctrlRepay.dateError = false;
                ctrlRepay.blankToDateError = false;
                ctrlRepay.blankFromDateError = false;
                ctrlRepay.blankBothDateError = false;
                ctrlRepay.noPendingLoansMsg = false;
                ctrlRepay.noLoansSearchMsg = false;
                ctrlRepay.selectAccErr = false;
                ctrlRepay.hasMoreItemsToShow = false;
            } else {
                ctrlRepay.dateError = false;
                ctrlRepay.blankToDateError = false;
                ctrlRepay.blankFromDateError = false;
                ctrlRepay.blankBothDateError = false;
                ctrlRepay.noPendingLoansMsg = false;
                ctrlRepay.noLoansSearchMsg = false;
                ctrlRepay.selectAccErr = false;

                ctrlRepay.errorSpin = true;

                ctrlRepay.loanDetails.splice(0, ctrlRepay.loanDetails.length);
                details.splice(0, details.length);

                var getloanRepaymentSchedule = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentDetails'));
                var postData = {
                    'loanAccountNumber': ctrlRepay.selectedAccountNumber.accountNumber
                };

                postData = $.param(postData || {});
                loanRepayServices.getLoanDetailsByAcc(getloanRepaymentSchedule, postData).success(function(data) {
                    ctrlRepay.errorSpin = false;
                    ctrlRepay.dontShowTable = false;
                    ctrlRepay.noTransactionError = false;
                    ctrlRepay.setServerDate(data);
                    if (!checkTransactionsEmpty(data)) {
                        lpCoreUtils.forEach(data, function(detail) {
                            //code to split the date string and convert it into Date format
                            // NOTE: Previously the "instDueDate" was a string with "/", thus
                            // the original author used to split the strings based on "/" and
                            // create a new date. Now the backend has changed the string format of
                            // "instDueDate", thus changing this implementation to fit BOTH.

                            if (detail.instDueDate.indexOf("/") > -1) {
                                var arrStartDate = detail.instDueDate.split("/");
                                detail.instDueDate = new Date(
                                    arrStartDate[2],
                                    arrStartDate[1] - 1,
                                    arrStartDate[0]);
                            } else {
                                detail.instDueDate = new Date(detail.instDueDate);
                            }

                            details.push(detail); //list with installment due date in date format
                        });

                        //calculated the last installment date
                        ctrlRepay.maxDisbursementDate = details[details.length - 1].instDueDate;

                        var count = 0;
                        var date = ctrlRepay.serverDate;
                        lpCoreUtils.forEach(details, function(loanDetail) {
                            if (loanDetail.instDueDate >= date) {
                                ctrlRepay.loanDetails.push(loanDetail);
                                ctrlRepay.noPendingLoansMsg = false;
                                ctrlRepay.noLoansSearchMsg = false;
                                ctrlRepay.showtable = true;
                                ctrlRepay.dontShowTable = false;
                            } else {
                                ctrlRepay.showtable = false;
                                ctrlRepay.dontShowTable = true;
                                ctrlRepay.noPendingLoansMsg = true;
                            }
                        });

                        setPagination();

                    } else {
                        ctrlRepay.dontShowTable = true;
                        ctrlRepay.showtable = false;
                        ctrlRepay.noTransactionError = true;
                    }
                    ctrlRepay.errorSpin = false;
                }).error(function(error) {
                    ctrlRepay.errorSpin = false;
                    ctrlRepay.dontShowTable = true;
                    ctrlRepay.showtable = false;

                    if(error.hasOwnProperty("cd") && error.cd === '522'){
                      ctrlRepay.noPendingLoansMsg = true;
                    }else if (error.hasOwnProperty("cd") && error.cd === 'CBS110') {
                      ctrlRepay.noPendingLoansMsg = true;
                    }else{
                      ctrlRepay.error = {
                          happened: true,
                          msg: "Sorry our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while."
                      };
                    }

                });
            }
        };

        //call on date filter
        ctrlRepay.loanFilter = function() {
            ctrlRepay.error = {
                happened: false,
                msg: ''
            };
            ctrlRepay.showtable = false;
            ctrlRepay.dontShowTable = false;
            ctrlRepay.noPendingLoansMsg = false;
            ctrlRepay.successMessagePDFEmail = '';
            ctrlRepay.showPrintEmailPdfOptions = false;
            ctrlRepay.loanDetails.splice(0, ctrlRepay.loanDetails.length);
            ctrlRepay.errorSpin=true;
            var accountNumberCheck = ctrlRepay.selectedAccountNumber;
            if (!(IdfcUtils.hasContentData(accountNumberCheck))) {
                ctrlRepay.selectAccErr = true;
            } else {
                ctrlRepay.selectAccErr = false;
                if ((ctrlRepay.fromDate === null && ctrlRepay.toDate === null) || (ctrlRepay.fromDate === '' && ctrlRepay.toDate === '')) {
                    ctrlRepay.blankBothDateError = true;
                    ctrlRepay.blankFromDateError = false;
                    ctrlRepay.dateError = false;
                    ctrlRepay.blankToDateError = false;
                } else if (ctrlRepay.fromDate === null || ctrlRepay.fromDate === '') {
                    ctrlRepay.blankFromDateError = true;
                    ctrlRepay.dateError = false;
                    ctrlRepay.blankToDateError = false;
                    ctrlRepay.blankBothDateError = false;
                } else if (ctrlRepay.toDate === null || ctrlRepay.toDate === '') {
                    ctrlRepay.blankToDateError = true;
                    ctrlRepay.dateError = false;
                    ctrlRepay.blankFromDateError = false;
                    ctrlRepay.blankBothDateError = false;
                } else if (ctrlRepay.fromDate > ctrlRepay.toDate) {
                    ctrlRepay.blankBothDateError = false;
                      ctrlRepay.dateError = true;
                    ctrlRepay.blankFromDateError = false;
                    ctrlRepay.blankToDateError = false;
                } else {
                    ctrlRepay.dateError = false;
                    ctrlRepay.blankToDateError = false;
                    ctrlRepay.blankFromDateError = false;
                    ctrlRepay.blankBothDateError = false;
                    ctrlRepay.noLoansSearchMsg = true;
                    lpCoreUtils.forEach(details, function(loanDetail) {
                        //check on from date and to date
                        if (loanDetail.instDueDate >= ctrlRepay.fromDate &&
                            loanDetail.instDueDate <= ctrlRepay.toDate &&
                            ctrlRepay.fromDate>=ctrlRepay.serverDate) {
                              ctrlRepay.loanDetails.push(loanDetail);
                              ctrlRepay.showtable = true;
                              ctrlRepay.dontShowTable = false;
                              ctrlRepay.noPendingLoansMsg = false;
                              ctrlRepay.noLoansSearchMsg = false;
                              ctrlRepay.showPrintEmailPdfOptions = true;
                        }
                    });

                    setPagination();
                }
            }
            if (ctrlRepay.noLoansSearchMsg) {
                ctrlRepay.dontShowTable = true;
                ctrlRepay.noTransactionError = true;
            }

            ctrlRepay.errorSpin=false;

        };

        // PDF Generation
        ctrlRepay.PDFGeneration = function(print) {
          ctrlRepay.successMessagePDFEmail = '';
          ctrlRepay.errorSpin = true;
          var postData = {};
              if (ctrlRepay.fromDate !== '' && ctrlRepay.toDate !== '') {
                  postData = {
                      'LoanNo': ctrlRepay.selectedAccountNumber.accountNumber,
                      'installmentNo':ctrlRepay.selectedAccountNumber.loanObj.instNo,
                      'installmentAmount': ctrlRepay.selectedAccountNumber.loanObj.totAmt,
                      'interest': ctrlRepay.selectedAccountNumber.loanObj.intAmt,
                      'principal': ctrlRepay.selectedAccountNumber.loanObj.prinAmt,
                      'openingPrincipal': ctrlRepay.selectedAccountNumber.loanObj.openBal,
                      'closingPrincipal': ctrlRepay.selectedAccountNumber.loanObj.closeBal,
                      'dueDate': ctrlRepay.selectedAccountNumber.loanObj.instDueDate,
                      'loanType': ctrlRepay.selectedAccountNumber.loanType,
                      'frmDT': ctrlRepay.fromDate.getTime(),
                      'toDt': ctrlRepay.toDate.getTime()
                  };
              } else {
                  postData = {
                      'LoanNo': ctrlRepay.selectedAccountNumber,
                      'installmentNo': ctrlRepay.loanDetails.instNo,
                      'installmentAmount': ctrlRepay.loanDetails.totAmt,
                      'interest': ctrlRepay.loanDetails.intAmt,
                      'principal': ctrlRepay.loanDetails.prinAmt,
                      'openingPrincipal': ctrlRepay.loanDetails.openBal,
                      'closingPrincipal': ctrlRepay.loanDetails.closeBal,
                      'dueDate': ctrlRepay.loanDetails.instDueDate,
                      'loanType':  ctrlRepay.selectedAccountNumber.loanType,
                      'frmDT': '',
                      'toDt': ''
                  };
              }

              var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentSchPdfSrc'));
              pdfUrl = pdfUrl + '?&emailFlag=' + false;
              postData = $.param(postData || {});
              loanRepayServices.getPDFGeneration(pdfUrl, postData).success(function(response, status, headers, config) {
                ctrlRepay.errorSpin = false;
                  try {
                      var file = new Blob([response], {
                          type: 'application/pdf'
                      });
                      if (print) {
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
                      } else {
                          var filename = 'Repayment Schedule for ' + ctrlRepay.selectedAccountNumber.accountNumber;
                          saveAs(file, filename);
                      }

                  } catch (e) {
                    ctrlRepay.errorSpin = false;
                  }
              }).error(function(error) {
                  ctrlRepay.errorSpin = false;
                  ctrlRepay.error = {
                      happened: true,
                      msg: error.rsn
                  };
              });

        };

        //Email
        ctrlRepay.Emailadvice = function() {
            var currentDate = ctrlRepay.serverDate;
            var postData = {};
            var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentSchPdfSrc'));
            ctrlRepay.errorSpin = true;
            ctrlRepay.emailError = false;

            if (ctrlRepay.fromDate !== '' && ctrlRepay.toDate !== '') {
                postData = {
                    'LoanNo': ctrlRepay.selectedAccountNumber.accountNumber,
                    'installmentNo': ctrlRepay.loanDetails.instNo,
                    'installmentAmount': ctrlRepay.loanDetails.totAmt,
                    'interest': ctrlRepay.loanDetails.intAmt,
                    'principal': ctrlRepay.loanDetails.prinAmt,
                    'openingPrincipal': ctrlRepay.loanDetails.openBal,
                    'closingPrincipal': ctrlRepay.loanDetails.closeBal,
                    'dueDate': ctrlRepay.loanDetails.instDueDate,
                    'loanType': ctrlRepay.selectedAccountNumber.loanType,
                    'frmDT': ctrlRepay.fromDate.getTime(),
                    'toDt': ctrlRepay.toDate.getTime()
                };
            } else {
                postData = {
                    'LoanNo': ctrlRepay.selectedAccountNumber.accountNumber,
                    'installmentNo': ctrlRepay.loanDetails.instNo,
                    'installmentAmount': ctrlRepay.loanDetails.totAmt,
                    'interest': ctrlRepay.loanDetails.intAmt,
                    'principal': ctrlRepay.loanDetails.prinAmt,
                    'openingPrincipal': ctrlRepay.loanDetails.openBal,
                    'closingPrincipal': ctrlRepay.loanDetails.closeBal,
                    'dueDate': ctrlRepay.loanDetails.instDueDate,
                    'loanType': ctrlRepay.selectedAccountNumber.loanType,
                    'frmDT': '',
                    'toDt': ''
                };
            }
            pdfUrl = pdfUrl + '?&emailFlag=' + true;
            postData = $.param(postData || {});
            ctrlRepay.errorSpin = true;
            loanRepayServices.getPDFGeneration(pdfUrl, postData).success(function(response, status, headers, config) {

                ctrlRepay.successMessagePDFEmail = 'Email has been sent to your registered email id';
                ctrlRepay.errorSpin = false;
                /* $location.hash("emailSuccessMsg");
                 $anchorScroll();*/


            }).error(function(error) {

                ctrlRepay.emailError = true;

                if (!error.hasOwnProperty("cd")) {
                    //Converting the error response from arraybuffer to a JSON object
                    error = JSON.parse(String.fromCharCode.apply(String, new Uint8Array(error)));
                }

                ctrlRepay.errorSpin = false;

                if (error.cd === 'email01') {
                      ctrlRepay.successMessagePDFEmail = 'Oops! Looks like you haven’t registered your email ID with us';
                } else {
                      ctrlRepay.successMessagePDFEmail ='Sorry, we are unable to send your Repayment Schedule';
                }
                 /*$location.hash("emailSuccessMsg");
                  $anchorScroll();*/

            });
        };

       gadgets.pubsub.subscribe("native.back", function() {
           console.log("native.back handled in lap repayment schedule");
                  gadgets.pubsub.publish("launchpad-retail.openLoanSummary");
                  gadgets.pubsub.publish("js.back", {
                          data: "ENABLE_HOME"
                  });
       });

       gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
           console.log("device back GoBackInitiate handled in lap repayment schedule");
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

        //Widget Refresh

       // LauncherDeckRefreshContent.setup(lpCoreBus, initialize).listen(lpWidget);
       initialize();
    }

    /**
     * Export Controllers
     */
    exports.RepaymentController = RepaymentController;
});
