/**
 * Controllers
 *
 * @module controllers
 */
define(function(require, exports, $filter) {

  'use strict';

  var $ = require('jquery');
  var angular = require('angular');
  //var idfcConstants = require('idfccommon').idfcConstants;
  var idfcHanlder = require('idfcerror');
  var constIDFC = require('idfccommon').idfcConstants;
  /**
   * Main controller
   * @ngInject
   * @constructor
   */

  function PLSummaryController(lpWidget, lpCoreUtils, lpCoreError, $http, lpCoreI18n, lpCoreBus, lpPortal, $filter, $timeout) {
    this.utils = lpCoreUtils;
    this.error = lpCoreError;
    this.widget = lpWidget;
      
    var plLoanSummaryCtrl = this;


    plLoanSummaryCtrl.loanDetails;
    var initialize = function() {
      //added for mobile for preventing dual login
          idfcHanlder.validateSession($http);
      plLoanSummaryCtrl.errorSpin = true;
      plLoanSummaryCtrl.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/details';
      plLoanSummaryCtrl.template = {
        pldetail: plLoanSummaryCtrl.partialsDir + '/pldetails.html',
      };
      var loanSummarypub = function() {};
      plLoanSummaryCtrl.showPLDetails = false;
      //making it false for showing when data received
      plLoanSummaryCtrl.showPLSummary = false;
      plLoanSummaryCtrl.noOpenAccounts = false;
      plLoanSummaryCtrl.openAccounts = true;
       /* added for hiding topbar for one or less active accounts */
	  plLoanSummaryCtrl.hideTopBar = false;
      lpCoreBus.subscribe('launchpad-retail.openPersonalLoanSummary', loanSummarypub);
      getLoanAccList();
    };

    var extractPersonalLoanData = function() {
      var personalLoanList = [];
      var personalLoanClosedList = [];
      for (var countNo in plLoanSummaryCtrl.loanAccountList) {
        if ((plLoanSummaryCtrl.loanAccountList[countNo].prdCd == "VANILLA_NP" || plLoanSummaryCtrl.loanAccountList[countNo].prdCd == "VANILLA_PP") && plLoanSummaryCtrl.loanAccountList[countNo].acctSts != "C") {
          personalLoanList.push(plLoanSummaryCtrl.loanAccountList[countNo]);
        } else if ((plLoanSummaryCtrl.loanAccountList[countNo].prdCd == "VANILLA_NP" || plLoanSummaryCtrl.loanAccountList[countNo].prdCd == "VANILLA_PP") && plLoanSummaryCtrl.loanAccountList[countNo].acctSts == "C") {
          personalLoanClosedList.push(plLoanSummaryCtrl.loanAccountList[countNo]);
        }
      }

      var mergedArray = personalLoanList.concat(personalLoanClosedList);
      plLoanSummaryCtrl.loanAccountList = mergedArray;
      /*if (personalLoanList.length == 0) {
        plLoanSummaryCtrl.noOpenAccounts = true;
        plLoanSummaryCtrl.openAccounts = false;
      }*/
	  /* added for hiding topbar for one or less active accounts */
	  console.log('live loan account : '+personalLoanList.length); 
      if (personalLoanList.length == 1) {
		plLoanSummaryCtrl.hideTopBar = true;
      }	else if (personalLoanList.length > 1) {
        plLoanSummaryCtrl.noOpenAccounts = false;
        plLoanSummaryCtrl.openAccounts = true;
      }	else {
        plLoanSummaryCtrl.noOpenAccounts = true;
        plLoanSummaryCtrl.openAccounts = false;		    
	  }
    }

    var initializeTotalLoanData = function() {

      plLoanSummaryCtrl.totalAmountPaidPercentage = Math.round(parseFloat((plLoanSummaryCtrl.totalAmountPaid * 100) / (plLoanSummaryCtrl.totalAmountPaid + plLoanSummaryCtrl.totalAmountPayable)));
      plLoanSummaryCtrl.totalOutstandingPercentage = parseInt(100 - plLoanSummaryCtrl.totalAmountPaidPercentage);

      plLoanSummaryCtrl.totalAmountPaid = changeNumberFormat(plLoanSummaryCtrl.totalAmountPaid);
      plLoanSummaryCtrl.totalAmountPayable = changeNumberFormat(plLoanSummaryCtrl.totalAmountPayable);

      if(plLoanSummaryCtrl.openAccounts && document.getElementById('progressBarPL')!= null)   {
         document.getElementById('progressBarPL').style.width = plLoanSummaryCtrl.totalAmountPaidPercentage + "%";
      }

    }

	plLoanSummaryCtrl.closedLoanApplyNow = function(){
	   localStorage.setItem("srRequestData", "personalLoan");
       gadgets.pubsub.publish('launchpad-retail.openLoanApplyNow');
	}

    var createLocaleAccountNo = function(listOfAccNo) {
      var totalAmountPaid = 0;
      var totalAmountPayable = 0;

      for (var countNo in listOfAccNo) {
        if (listOfAccNo[countNo].amtPd == " " || listOfAccNo[countNo].amtPd == null || listOfAccNo[countNo].amtPd == "") {
          listOfAccNo[countNo].amtPd = 0;
        }

        var amountPaid = parseFloat(listOfAccNo[countNo].amtPd);
        var totalOutBal = parseFloat(listOfAccNo[countNo].ttlOutBal);
        var EMIValue = parseFloat(listOfAccNo[countNo].EMI);
       // var lstPayDt = new Date(plLoanSummaryCtrl.loanAccountList[countNo].lstPayDt);
       // var nxtDueDt = new Date(plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt);

        if (plLoanSummaryCtrl.loanAccountList[countNo].acctSts != "C") {
          totalAmountPaid = parseFloat(totalAmountPaid + amountPaid);
          totalAmountPayable = parseFloat(totalAmountPayable + totalOutBal);
        }

        plLoanSummaryCtrl.loanAccountList[countNo].percentage = Math.round(parseFloat((amountPaid * 100) / (totalOutBal + amountPaid)));
        plLoanSummaryCtrl.loanAccountList[countNo].amtPdFormatted = changeNumberFormat(amountPaid);
        plLoanSummaryCtrl.loanAccountList[countNo].ttlOutBalFormatted = changeNumberFormat(totalOutBal);
        plLoanSummaryCtrl.loanAccountList[countNo].EMIFormatted = changeNumberFormat(EMIValue);



        if (plLoanSummaryCtrl.loanAccountList[countNo].lstPayDt != undefined && plLoanSummaryCtrl.loanAccountList[countNo].lstPayDt != null && plLoanSummaryCtrl.loanAccountList[countNo].lstPayDt.trim() != '') {
          var date = plLoanSummaryCtrl.loanAccountList[countNo].lstPayDt.split("/");
          plLoanSummaryCtrl.loanAccountList[countNo].lstPayDt = new Date(date[2], date[1] - 1, date[0]);
          plLoanSummaryCtrl.loanAccountList[countNo].lstPayDt = $filter('date')(plLoanSummaryCtrl.loanAccountList[countNo].lstPayDt, "dd MMM yyyy");
          plLoanSummaryCtrl.loanAccountList[countNo].displayLstPayDt = true;
        } else {
          plLoanSummaryCtrl.loanAccountList[countNo].displayLstPayDt = false;
        }

        if (plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt != undefined && plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt != null && plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt.trim() != '') {
          var date = plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt.split("/");
          plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt = new Date(date[2], date[1] - 1, date[0]);
          plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt = $filter('date')(plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt, "dd MMM yyyy");
	   plLoanSummaryCtrl.loanAccountList[countNo].filterDate = new Date(plLoanSummaryCtrl.loanAccountList[countNo].nxtDueDt);
          plLoanSummaryCtrl.loanAccountList[countNo].displayNxtDueDt = true;
        } else {
          plLoanSummaryCtrl.loanAccountList[countNo].displayNxtDueDt = false;
        }
      }
      sortByDate(plLoanSummaryCtrl.loanAccountList, {
        prop: "filterDate"
      });
      plLoanSummaryCtrl.totalAmountPaid = totalAmountPaid;
      plLoanSummaryCtrl.totalAmountPayable = totalAmountPayable;
    };

    var setIndividualLoanGraphs = function() {
      var gauge = [];
      for (var countNo in plLoanSummaryCtrl.loanAccountList) {
        if (plLoanSummaryCtrl.loanAccountList[countNo].acctSts != "C") {
          var id = "gaugepl-" + countNo;
          gauge[countNo] = document.getElementById(id);
          var gaugeValue = parseFloat(plLoanSummaryCtrl.loanAccountList[countNo].percentage / 200);
          var gaugeString = "rotate(" + gaugeValue + "turn)";
          //debugger;
          //alert(document.getElementById(id));
          document.getElementById(id).style.transform = gaugeString;

        }
      }
    }

    var checkAccountForValue = function() {
      if (plLoanSummaryCtrl.loanDetailData.amtPd == "" || plLoanSummaryCtrl.loanDetailData.amtPd == null || plLoanSummaryCtrl.loanDetailData.amtPd == " ") {
        plLoanSummaryCtrl.loanDetailData.amtPd = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.rmngTnure == "" || plLoanSummaryCtrl.loanDetailData.rmngTnure == null || plLoanSummaryCtrl.loanDetailData.rmngTnure == " " || plLoanSummaryCtrl.loanDetailData.rmngTnure == "NA") {
        plLoanSummaryCtrl.loanDetailData.rmngTnure = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.emi == "" || plLoanSummaryCtrl.loanDetailData.emi == null || plLoanSummaryCtrl.loanDetailData.emi == " ") {
        plLoanSummaryCtrl.loanDetailData.emi = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.snctndAmt == "" || plLoanSummaryCtrl.loanDetailData.snctndAmt == null || plLoanSummaryCtrl.loanDetailData.snctndAmt == " ") {
        plLoanSummaryCtrl.loanDetailData.snctndAmt = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.prncplPd == "" || plLoanSummaryCtrl.loanDetailData.prncplPd == null || plLoanSummaryCtrl.loanDetailData.prncplPd == " ") {
        plLoanSummaryCtrl.loanDetailData.prncplPd = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.intrstPd == "" || plLoanSummaryCtrl.loanDetailData.intrstPd == null || plLoanSummaryCtrl.loanDetailData.intrstPd == " ") {
        plLoanSummaryCtrl.loanDetailData.intrstPd = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.availBal == "" || plLoanSummaryCtrl.loanDetailData.availBal == null || plLoanSummaryCtrl.loanDetailData.availBal == " ") {
        plLoanSummaryCtrl.loanDetailData.availBal = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.prncplOtstnd == "" || plLoanSummaryCtrl.loanDetailData.prncplOtstnd == null || plLoanSummaryCtrl.loanDetailData.prncplOtstnd == " ") {
        plLoanSummaryCtrl.loanDetailData.prncplOtstnd = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.intrstOtstnd == "" || plLoanSummaryCtrl.loanDetailData.intrstOtstnd == null || plLoanSummaryCtrl.loanDetailData.intrstOtstnd == " ") {
        plLoanSummaryCtrl.loanDetailData.intrstOtstnd = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.amtOvrDue == "" || plLoanSummaryCtrl.loanDetailData.amtOvrDue == null || plLoanSummaryCtrl.loanDetailData.amtOvrDue == " " || plLoanSummaryCtrl.loanDetailData.amtOvrDue == "NA") {
        plLoanSummaryCtrl.loanDetailData.amtOvrDue = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.prncplDue == "" || plLoanSummaryCtrl.loanDetailData.prncplDue == null || plLoanSummaryCtrl.loanDetailData.prncplDue == " ") {
        plLoanSummaryCtrl.loanDetailData.prncplDue = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.intrstDue == "" || plLoanSummaryCtrl.loanDetailData.intrstDue == null || plLoanSummaryCtrl.loanDetailData.intrstDue == " ") {
        plLoanSummaryCtrl.loanDetailData.intrstDue = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.dueChrg == "" || plLoanSummaryCtrl.loanDetailData.dueChrg == null || plLoanSummaryCtrl.loanDetailData.dueChrg == " ") {
        plLoanSummaryCtrl.loanDetailData.dueChrg = 0;
      }

      if (plLoanSummaryCtrl.loanDetailData.dsbrsdAmt == "" || plLoanSummaryCtrl.loanDetailData.dsbrsdAmt == null || plLoanSummaryCtrl.loanDetailData.dsbrsdAmt == " ") {
        plLoanSummaryCtrl.loanDetailData.dsbrsdAmt = 0;
      }
    }

    var getLoanDetail = function() {
      checkAccountForValue();
      var percentLoan1;
      var percentLoan2;

      //Calculate Percentage and display graph
      var percentLoanPaid = parseInt(parseInt(plLoanSummaryCtrl.loanDetailData.amtPd) / (parseInt(plLoanSummaryCtrl.loanDetailData.amtPd) + parseInt(plLoanSummaryCtrl.loanDetailData.availBal)) * 360);

      if (percentLoanPaid > 180) {
        percentLoan1 = 180;
        percentLoan2 = parseInt(percentLoanPaid - 180);
      } else {
        percentLoan1 = percentLoanPaid;
        percentLoan2 = 0;
      }
      var percentString = "rotate(" + percentLoan1 + "deg)";
      document.getElementById("loanGraph").style.transform = percentString;

      percentString = "rotate(" + percentLoan2 + "deg)";
      document.getElementById("loanGraph2").style.transform = percentString;

      //Format data
      plLoanSummaryCtrl.loanDetailData.emi = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.emi);
      plLoanSummaryCtrl.loanDetailData.snctndAmt = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.snctndAmt);
      //Total Loan Paid
      plLoanSummaryCtrl.loanDetailData.amtPd = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.amtPd);
      plLoanSummaryCtrl.loanDetailData.prncplPd = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.prncplPd);
      plLoanSummaryCtrl.loanDetailData.intrstPd = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.intrstPd);
      // Loan Payable
      plLoanSummaryCtrl.loanDetailData.availBal = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.availBal);
      plLoanSummaryCtrl.loanDetailData.prncplOtstnd = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.prncplOtstnd);
      plLoanSummaryCtrl.loanDetailData.intrstOtstnd = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.intrstOtstnd);
      //OVERDUE PAYABLE
      plLoanSummaryCtrl.loanDetailData.amtOvrDue = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.amtOvrDue);
      plLoanSummaryCtrl.loanDetailData.prncplDue = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.prncplDue);
      plLoanSummaryCtrl.loanDetailData.intrstDue = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.intrstDue);
      plLoanSummaryCtrl.loanDetailData.dueChrg = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.dueChrg);

      plLoanSummaryCtrl.loanDetailData.dsbrsdAmt = changeNumberFormat(plLoanSummaryCtrl.loanDetailData.dsbrsdAmt);
    };

    //List of Loan Account Numbers
    var getLoanAccList = function() {

      //For local Host
      //            $http.get('styles/placcounts.json').success(function(data) {
      //                if(data!=undefined && data!=null && $.trim(data)!='') {
      //					plLoanSummaryCtrl.loanAccountList = data.data;
      //                    plLoanSummaryCtrl.extractPersonalLoanData();
      //                    plLoanSummaryCtrl.createLocaleAccountNo(plLoanSummaryCtrl.loanAccountList);
      //                    plLoanSummaryCtrl.initializeTotalLoanData();
      //                    
      //                    $timeout(function () {
      //                       plLoanSummaryCtrl.setIndividualLoanGraphs();
      //                    }, 2000);
      //                    
      //                   
      //				} else {
      //					plLoanSummaryCtrl.noLoanAccount = {
      //				        happened: true,
      //				        msg: constIDFC.ERROR_NO_LOANS
      //					};
      //				}
      //				plLoanSummaryCtrl.errorSpin = false;
      //            }).error(function(data) {
      //				plLoanSummaryCtrl.errorSpin = false;
      //				plLoanSummaryCtrl.error = {
      //						happened: true,
      //						msg: constIDFC.TECHNICAL_ERROR
      //				};
      //			});


      //Accounts URL when added in universal.xml

      var loanAccountsUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanAccountList'), {
        servicesPath: lpPortal.root
      });

      var loanAcctsUrl = loanAccountsUrl + '?typeOfLoan=PlLap';

      $http({
        method: 'GET',
        url: loanAcctsUrl,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;'
        }
      }).success(function(data) {
        if (data != undefined && data != null && $.trim(data) != '') {
          plLoanSummaryCtrl.loanAccountList = data;
          extractPersonalLoanData();
          createLocaleAccountNo(plLoanSummaryCtrl.loanAccountList);
          initializeTotalLoanData();
          $timeout(function() {
            setIndividualLoanGraphs();
          }, 1000);
          plLoanSummaryCtrl.showPLSummary = true;
        } else {
          plLoanSummaryCtrl.noLoanAccount = {
            happened: true,
            msg: constIDFC.ERROR_NO_LOANS
          };
        }
        plLoanSummaryCtrl.errorSpin = false;
      }).error(function(data) {
        plLoanSummaryCtrl.errorSpin = false;
        plLoanSummaryCtrl.error = {
          happened: true,
          msg: constIDFC.TECHNICAL_ERROR
        };
      });
    };

    plLoanSummaryCtrl.openLoanDetails = function(loanAccount) {
      $("h3 span[data-lp-i18n='Personal Loan Summary']").html();
      $("h3 span[data-lp-i18n='Personal Loan Summary']").text('Personal Loan Detail');
      plLoanSummaryCtrl.showPLDetails = true;
      plLoanSummaryCtrl.showPLSummary = false;
      getLoanDetailsByAccNo(loanAccount);
      $(window).scrollTop(0);
    };

    plLoanSummaryCtrl.backToSummary = function() {
      $("h3 span[data-lp-i18n='Personal Loan Summary']").html();
      $("h3 span[data-lp-i18n='Personal Loan Summary']").text('Personal Loan Summary');
      plLoanSummaryCtrl.showPLDetails = false;
      plLoanSummaryCtrl.showPLSummary = true;
      $(window).scrollTop(0);
    }

    //Loan Account Details
    var getLoanDetailsByAccNo = function(loanAccNo) {
      plLoanSummaryCtrl.errorSpin = true;
      var loanSummaryUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanSummaryDetails'), {
        servicesPath: lpPortal.root
      });

      var postData = {
        'lnAcctNb': loanAccNo
      };

      postData = $.param(postData || {});

      //          Please comment for live  

      //            $http.get('styles/pldetails.json').success(function(data) {
      //                plLoanSummaryCtrl.errorSpin = false;
      //                if(data!=undefined && data!=null && $.trim(data)!='') {
      //					plLoanSummaryCtrl.loanDetailData = data;
      //                    plLoanSummaryCtrl.getLoanDetail();
      //				} else {
      //					plLoanSummaryCtrl.noLoanAccount = {
      //				        happened: true,
      //				        msg: constIDFC.ERROR_NO_LOANS
      //					};
      //				}
      //				
      //            }).error(function(data) {
      //				plLoanSummaryCtrl.errorSpin = false;
      //				plLoanSummaryCtrl.error = {
      //						happened: true,
      //						msg: constIDFC.TECHNICAL_ERROR
      //				};
      //			});


      //Please comment for local host
      $http({
        method: 'POST',
        url: loanSummaryUrl,
        data: postData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;'
        }
      }).success(function(data) {
        plLoanSummaryCtrl.loanDetailData = data;
        getLoanDetail();
        changeDateFormat(plLoanSummaryCtrl.loanDetailData);
        plLoanSummaryCtrl.errorSpin = false;
      }).error(function(data) {
        plLoanSummaryCtrl.errorSpin = false;
        plLoanSummaryCtrl.error = {
          happened: true,
          msg: constIDFC.TECHNICAL_ERROR_LOAN_DETAILS
        };
      });
    };

    var changeDateFormat = function(loanDetails) {
      if (loanDetails.dsbrsmtDt != undefined && loanDetails.dsbrsmtDt != null && loanDetails.dsbrsmtDt.trim() != '') {
        var date = loanDetails.dsbrsmtDt.split("/");
        plLoanSummaryCtrl.loanDetailData.dsbrsmtDt = new Date(date[2], date[1] - 1, date[0]);
        plLoanSummaryCtrl.loanDetailData.dsbrsmtDt = $filter('date')(plLoanSummaryCtrl.loanDetailData.dsbrsmtDt, "dd MMM yyyy");
      }
      if (loanDetails.intrstEndDt != undefined && loanDetails.intrstEndDt != null && loanDetails.intrstEndDt.trim() != '') {
        var date = loanDetails.intrstEndDt.split("/");
        plLoanSummaryCtrl.loanDetailData.intrstEndDt = new Date(date[2], date[1] - 1, date[0]);
        plLoanSummaryCtrl.loanDetailData.intrstEndDt = $filter('date')(plLoanSummaryCtrl.loanDetailData.intrstEndDt, "dd MMM yyyy");
        //plLoanSummaryCtrl.loanDetails.intrstEndDt = new Date(loanDetails.intrstEndDt);
      }
      else{
      	plLoanSummaryCtrl.loanDetailData.intrstEndDt = "NA";
      }	
      if (loanDetails.nxtDueDt != undefined && loanDetails.nxtDueDt != null && loanDetails.nxtDueDt.trim() != '') {
        if (loanDetails.nxtDueDt !== 'NA') {
          var date = loanDetails.nxtDueDt.split("/");
          plLoanSummaryCtrl.loanDetailData.nxtDueDt = new Date(date[2], date[1] - 1, date[0]);
          plLoanSummaryCtrl.loanDetailData.nxtDueDt = $filter('date')(plLoanSummaryCtrl.loanDetailData.nxtDueDt, "dd MMM yyyy");
          //plLoanSummaryCtrl.loanDetails.nxtDueDt = new Date(loanDetails.nxtDueDt);
        }
      }
    };


    plLoanSummaryCtrl.openPersonalLoanStmt = function() {
      lpCoreBus.publish('changeMenuColour', 'plLoanStatement');
      //lpCoreBus.publish('launchpad-retail.openPersonalLoanSOA', plLoanSummaryCtrl.loanDetailData.lnAcctNb);
	  localStorage.setItem("navigationFlag",true);
	  localStorage.setItem("origin","pl-summary");
      localStorage.setItem('lnAccountNo', plLoanSummaryCtrl.loanDetailData.lnAcctNb);
      gadgets.pubsub.publish('launchpad-retail.openPersonalLoanSOA');

    };
    plLoanSummaryCtrl.openPersonalRepaymentSchd = function() {
      lpCoreBus.publish('changeMenuColour', 'plRepaymentSchedule');
     // lpCoreBus.publish('launchpad-retail.openPersonalLoanRepaymentSchedule', plLoanSummaryCtrl.loanDetailData.lnAcctNb);localStorage.setItem('lnAccountNo', plLoanSummaryCtrl.loanDetailData.lnAcctNb);
      localStorage.setItem("navigationFlag",true);
      localStorage.setItem("origin","pl-summary");
      localStorage.setItem('lnAccountNo', plLoanSummaryCtrl.loanDetailData.lnAcctNb);
      gadgets.pubsub.publish('launchpad-retail.openPersonalLoanRepaymentSchedule');

    };

    var changeNumberFormat = function(number) {
      var x = number;
      x = x.toString();
      var afterPoint = '';
      if (x.indexOf('.') > 0) {
        afterPoint = x.substring(x.indexOf('.'), x.indexOf('.') + 3);
      } else {
        afterPoint = ".00";
      }
      x = Math.floor(x);
      x = x.toString();
      var lastThree = x.substring(x.length - 3);
      var otherNumbers = x.substring(0, x.length - 3);
      if (otherNumbers != '') lastThree = ',' + lastThree;
      var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
      return res;
    }

    var sortByDate = (function() {
      //cached privated objects
      var _toString = Object.prototype.toString,
        //the default parser function
        _parser = function(x) {
          return x;
        },
        //gets the item to be sorted
        _getItem = function(x) {
          return this.parser((x !== null && typeof x === "object" && x[this.prop]) || x);
        };

      // Creates a method for sorting the Array
      // @array: the Array of elements
      // @o.prop: property name (if it is an Array of objects)
      // @o.desc: determines whether the sort is descending
      // @o.parser: function to parse the items to expected type
      return function(array, o) {
        if (!(array instanceof Array) || !array.length) return [];
        if (_toString.call(o) !== "[object Object]") o = {};
        if (typeof o.parser !== "function") o.parser = _parser;
        o.desc = !! o.desc ? -1 : 1;
        return array.sort(function(a, b) {
          a = _getItem.call(o, a);
          b = _getItem.call(o, b);
          return o.desc * (a < b ? -1 : +(a > b));
        });
      };
    }());



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

   //added for mobile
   gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
       gadgets.pubsub.publish("device.GoBack");
   });

    initialize();


  }




  /**ok
   * Export Controllers
   */
  exports.PLSummaryController = PLSummaryController;
});