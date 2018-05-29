/**
 * Controllers
 *
 * @module controllers
 */
define(function(require, exports, $filter, $timeout) {

  'use strict';

  var $ = require('jquery');
  var angular = require('angular');
  var idfcConstants = require('idfccommon').idfcConstants;
  var idfcHanlder = require('idfcerror');
  var constIDFC = require('idfccommon').idfcConstants;
  /**
   * Main controller
   * @ngInject
   * @constructor
   */

  function LAPSummaryController(lpWidget, lpCoreUtils, lpCoreError, $scope, $http, lpCoreI18n, lpCoreBus, lpPortal, $filter, $timeout) {
    this.utils = lpCoreUtils;
    this.error = lpCoreError;
    this.widget = lpWidget;


    $scope.loanDetails;
    var initialize = function() {
      //starting the spinner
      $scope.errorSpin = true;
      $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/details';
      $scope.template = {
        pldetail: $scope.partialsDir + '/pldetails.html',
      };
      var loanSummarypub = function() {};
      $scope.showPLDetails = false;
      //changing to show section once data is obtained
      $scope.showPLSummary = false;
      $scope.noOpenAccounts = false;
      $scope.openAccounts = true;
      /* added for hiding topbar for one or less active accounts */
      $scope.hideTopBar = false;
      lpCoreBus.subscribe('launchpad-retail.openLAPSummary', loanSummarypub);
      getLoanAccList();
      //added for mobile for preventing dual login
      idfcHanlder.validateSession($http);
    };

    var extractPersonalLoanData = function() {
      var personalLoanList = [];
      var personalLoanClosedList = [];
      for (var countNo in $scope.loanAccountList) {
        if (($scope.loanAccountList[countNo].prdCd == "LAPSAVER" || $scope.loanAccountList[countNo].prdCd == "LAPTERM" || $scope.loanAccountList[countNo].prdCd == "LAPTL" || $scope.loanAccountList[countNo].prdCd == "LAPDROP" || $scope.loanAccountList[countNo].prdCd == "LTL") && $scope.loanAccountList[countNo].acctSts != "C") {
          personalLoanList.push($scope.loanAccountList[countNo]);
        } else if (($scope.loanAccountList[countNo].prdCd == "LAPSAVER" || $scope.loanAccountList[countNo].prdCd == "LAPTERM" || $scope.loanAccountList[countNo].prdCd == "LAPTL" || $scope.loanAccountList[countNo].prdCd == "LAPDROP" || $scope.loanAccountList[countNo].prdCd == "LTL") && $scope.loanAccountList[countNo].acctSts == "C") {
          personalLoanClosedList.push($scope.loanAccountList[countNo]);
        }
      }

      var mergedArray = personalLoanList.concat(personalLoanClosedList);
      $scope.loanAccountList = mergedArray;
      /*if (personalLoanList.length == 0) {
        $scope.noOpenAccounts = true;
        $scope.openAccounts = false;
      }*/
	  /* added for hiding topbar for one or less active accounts */
	  console.log('live loan account : '+personalLoanList.length); 	  
      if (personalLoanList.length == 1) {
		$scope.hideTopBar = true;
      }	else if (personalLoanList.length > 1) {
        $scope.noOpenAccounts = false;
        $scope.openAccounts = true;
      }	else {
        $scope.noOpenAccounts = true;
        $scope.openAccounts = false;		    
      }
    }

    var initializeTotalLoanData = function() {

      $scope.totalAmountPaidPercentage = Math.round(parseFloat(($scope.totalAmountPaid * 100) / ($scope.totalAmountPaid + $scope.totalAmountPayable)));
      $scope.totalOutstandingPercentage = parseInt(100 - $scope.totalAmountPaidPercentage);

      $scope.totalAmountPaid = changeNumberFormat($scope.totalAmountPaid);
      $scope.totalAmountPayable = changeNumberFormat($scope.totalAmountPayable);
      if($scope.openAccounts && document.getElementById('progressBar') != null){
      	  document.getElementById('progressBar').style.width = $scope.totalAmountPaidPercentage + "%";
      }	
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
      //  var lstPayDt = new Date($scope.loanAccountList[countNo].lstPayDt);
      //  var nxtDueDt = new Date($scope.loanAccountList[countNo].nxtDueDt);

        if ($scope.loanAccountList[countNo].acctSts != "C") {
          totalAmountPaid = parseFloat(totalAmountPaid + amountPaid);
          totalAmountPayable = parseFloat(totalAmountPayable + totalOutBal);
        }

        $scope.loanAccountList[countNo].percentage = Math.round(parseFloat((amountPaid * 100) / (totalOutBal + amountPaid)));
        $scope.loanAccountList[countNo].amtPdFormatted = changeNumberFormat(amountPaid);
        $scope.loanAccountList[countNo].ttlOutBalFormatted = changeNumberFormat(totalOutBal);
        $scope.loanAccountList[countNo].EMIFormatted = changeNumberFormat(EMIValue);



        if ($scope.loanAccountList[countNo].lstPayDt != undefined && $scope.loanAccountList[countNo].lstPayDt != null && $scope.loanAccountList[countNo].lstPayDt.trim() != '') {
          var date = $scope.loanAccountList[countNo].lstPayDt.split("/");
          $scope.loanAccountList[countNo].lstPayDt = new Date(date[2], date[1] - 1, date[0]);
          $scope.loanAccountList[countNo].lstPayDt = $filter('date')($scope.loanAccountList[countNo].lstPayDt, "dd MMM yyyy");
          $scope.loanAccountList[countNo].displayLstPayDt = true;
        } else {
          $scope.loanAccountList[countNo].displayLstPayDt = false;
        }

        if ($scope.loanAccountList[countNo].nxtDueDt != undefined && $scope.loanAccountList[countNo].nxtDueDt != null && $scope.loanAccountList[countNo].nxtDueDt.trim() != '') {
          var date = $scope.loanAccountList[countNo].nxtDueDt.split("/");
          $scope.loanAccountList[countNo].nxtDueDt = new Date(date[2], date[1] - 1, date[0]);
          $scope.loanAccountList[countNo].nxtDueDt = $filter('date')($scope.loanAccountList[countNo].nxtDueDt, "dd MMM yyyy");
	   $scope.loanAccountList[countNo].filterDate = new Date($scope.loanAccountList[countNo].nxtDueDt);
          $scope.loanAccountList[countNo].displayNxtDueDt = true;
        } else {
          $scope.loanAccountList[countNo].displayNxtDueDt = false;
        }
      }
      sortByDate($scope.loanAccountList, {
        prop: "filterDate"
      });
      $scope.totalAmountPaid = totalAmountPaid;
      $scope.totalAmountPayable = totalAmountPayable;
    };

    var setIndividualLoanGraphs = function() {
      var gauge = [];
      for (var countNo in $scope.loanAccountList) {
        if ($scope.loanAccountList[countNo].acctSts != "C") {
          var id = "gauge-" + countNo;
          gauge[countNo] = document.getElementById(id);
          var gaugeValue = parseFloat($scope.loanAccountList[countNo].percentage / 200);
          var gaugeString = "rotate(" + gaugeValue + "turn)";
          //debugger;
          //alert(document.getElementById(id));
          document.getElementById(id).style.transform = gaugeString;

        }
      }
    }

    var checkAccountForValue = function() {
      if ($scope.loanDetailData.rmngTnure == "" || $scope.loanDetailData.rmngTnure == null || $scope.loanDetailData.rmngTnure == " " || $scope.loanDetailData.rmngTnure == "NA") {
        $scope.loanDetailData.rmngTnure = 0;
      }

      if ($scope.loanDetailData.amtPd == "" || $scope.loanDetailData.amtPd == null || $scope.loanDetailData.amtPd == " ") {
        $scope.loanDetailData.amtPd = 0;
      }

      if ($scope.loanDetailData.emi == "" || $scope.loanDetailData.emi == null || $scope.loanDetailData.emi == " ") {
        $scope.loanDetailData.emi = 0;
      }

      if ($scope.loanDetailData.snctndAmt == "" || $scope.loanDetailData.snctndAmt == null || $scope.loanDetailData.snctndAmt == " ") {
        $scope.loanDetailData.snctndAmt = 0;
      }

      if ($scope.loanDetailData.prncplPd == "" || $scope.loanDetailData.prncplPd == null || $scope.loanDetailData.prncplPd == " ") {
        $scope.loanDetailData.prncplPd = 0;
      }

      if ($scope.loanDetailData.intrstPd == "" || $scope.loanDetailData.intrstPd == null || $scope.loanDetailData.intrstPd == " ") {
        $scope.loanDetailData.intrstPd = 0;
      }

      if ($scope.loanDetailData.availBal == "" || $scope.loanDetailData.availBal == null || $scope.loanDetailData.availBal == " ") {
        $scope.loanDetailData.availBal = 0;
      }

      if ($scope.loanDetailData.prncplOtstnd == "" || $scope.loanDetailData.prncplOtstnd == null || $scope.loanDetailData.prncplOtstnd == " ") {
        $scope.loanDetailData.prncplOtstnd = 0;
      }

      if ($scope.loanDetailData.intrstOtstnd == "" || $scope.loanDetailData.intrstOtstnd == null || $scope.loanDetailData.intrstOtstnd == " ") {
        $scope.loanDetailData.intrstOtstnd = 0;
      }

      if ($scope.loanDetailData.amtOvrDue == "" || $scope.loanDetailData.amtOvrDue == null || $scope.loanDetailData.amtOvrDue == " " || $scope.loanDetailData.amtOvrDue == "NA") {
        $scope.loanDetailData.amtOvrDue = 0;
      }

      if ($scope.loanDetailData.prncplDue == "" || $scope.loanDetailData.prncplDue == null || $scope.loanDetailData.prncplDue == " ") {
        $scope.loanDetailData.prncplDue = 0;
      }

      if ($scope.loanDetailData.intrstDue == "" || $scope.loanDetailData.intrstDue == null || $scope.loanDetailData.intrstDue == " ") {
        $scope.loanDetailData.intrstDue = 0;
      }

      if ($scope.loanDetailData.dueChrg == "" || $scope.loanDetailData.dueChrg == null || $scope.loanDetailData.dueChrg == " ") {
        $scope.loanDetailData.dueChrg = 0;
      }

      if ($scope.loanDetailData.dsbrsdAmt == "" || $scope.loanDetailData.dsbrsdAmt == null || $scope.loanDetailData.dsbrsdAmt == " ") {
        $scope.loanDetailData.dsbrsdAmt = 0;
      }

    }


      $scope.closedLoanApplyNow = function(){		    
        localStorage.setItem("srRequestData", "loanAgainstProperty");  
	      gadgets.pubsub.publish('launchpad-retail.openLoanApplyNow');
	    }	

    var getLoanDetail = function() {
      checkAccountForValue();
      var percentLoan1;
      var percentLoan2;

      //Calculate Percentage and display graph
      var percentLoanPaid = parseInt(parseInt($scope.loanDetailData.amtPd) / (parseInt($scope.loanDetailData.amtPd) + parseInt($scope.loanDetailData.availBal)) * 360);

      if (percentLoanPaid > 180) {
        percentLoan1 = 180;
        percentLoan2 = parseInt(percentLoanPaid - 180);
      } else {
        percentLoan1 = percentLoanPaid;
        percentLoan2 = 0;
      }
      
      var percentString = "rotate(" + percentLoan1 + "deg)";
      document.getElementById("loanGraphLap").style.transform = percentString;
                
      percentString = "rotate(" + percentLoan2 + "deg)";                
      document.getElementById("loanGraphLap2").style.transform = percentString;

      //Format data
      $scope.loanDetailData.emi = changeNumberFormat($scope.loanDetailData.emi);
      $scope.loanDetailData.snctndAmt = changeNumberFormat($scope.loanDetailData.snctndAmt);
      //Total Loan Paid
      $scope.loanDetailData.amtPd = changeNumberFormat($scope.loanDetailData.amtPd);
      $scope.loanDetailData.prncplPd = changeNumberFormat($scope.loanDetailData.prncplPd);
      $scope.loanDetailData.intrstPd = changeNumberFormat($scope.loanDetailData.intrstPd);
      // Loan Payable
      $scope.loanDetailData.availBal = changeNumberFormat($scope.loanDetailData.availBal);
      $scope.loanDetailData.prncplOtstnd = changeNumberFormat($scope.loanDetailData.prncplOtstnd);
      $scope.loanDetailData.intrstOtstnd = changeNumberFormat($scope.loanDetailData.intrstOtstnd);
      //OVERDUE PAYABLE
      $scope.loanDetailData.amtOvrDue = changeNumberFormat($scope.loanDetailData.amtOvrDue);
      $scope.loanDetailData.prncplDue = changeNumberFormat($scope.loanDetailData.prncplDue);
      $scope.loanDetailData.intrstDue = changeNumberFormat($scope.loanDetailData.intrstDue);
      $scope.loanDetailData.dueChrg = changeNumberFormat($scope.loanDetailData.dueChrg);

      $scope.loanDetailData.dsbrsdAmt = changeNumberFormat($scope.loanDetailData.dsbrsdAmt);
    };

    //List of Loan Account Numbers
    var getLoanAccList = function() {

      //For local Host
      //            $http.get('styles/placcounts.json').success(function(data) {
      //                if(data!=undefined && data!=null && $.trim(data)!='') {
      //					$scope.loanAccountList = data.data;
      //                    $scope.extractPersonalLoanData();
      //                    $scope.createLocaleAccountNo($scope.loanAccountList);
      //                    $scope.initializeTotalLoanData();
      //                    
      //                    $timeout(function () {
      //                       $scope.setIndividualLoanGraphs();
      //                    }, 2000);
      //                    
      //                   
      //				} else {
      //					$scope.noLoanAccount = {
      //				        happened: true,
      //				        msg: constIDFC.ERROR_NO_LOANS
      //					};
      //				}
      //				$scope.errorSpin = false;
      //            }).error(function(data) {
      //				$scope.errorSpin = false;
      //				$scope.error = {
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
          $scope.loanAccountList = data;
          extractPersonalLoanData();
          createLocaleAccountNo($scope.loanAccountList);
          initializeTotalLoanData();
          $timeout(function() {
            setIndividualLoanGraphs();
          }, 1000);
          $scope.showPLSummary = true;
        } else {
          $scope.noLoanAccount = {
            happened: true,
            msg: constIDFC.ERROR_NO_LOANS
          };
        }
        $scope.errorSpin = false;
      }).error(function(data) {
      console.log("data:"+data);
        $scope.errorSpin = false;
        // If session timed out, redirect to login page
         idfcHanlder.checkTimeout(error.data);

        $scope.error = {
          happened: true,
          msg: constIDFC.TECHNICAL_ERROR
        };
      });
    };


    $scope.openLoanDetails = function(loanAccount) {
      $("h3 span[data-lp-i18n='Loan Against Property Summary']").html();
      $("h3 span[data-lp-i18n='Loan Against Property Summary']").text('Loan Against Property Details');

      $scope.showPLDetails = true;
      $scope.showPLSummary = false;
      getLoanDetailsByAccNo(loanAccount);
      $(window).scrollTop(0);
    };

    $scope.backToSummary = function() {
      $("h3 span[data-lp-i18n='Loan Against Property Summary']").html();
      $("h3 span[data-lp-i18n='Loan Against Property Summary']").text('Loan Against Property Summary');
      $scope.showPLDetails = false;
      $scope.showPLSummary = true;
      $(window).scrollTop(0);
    }

    //Loan Account Details
    var getLoanDetailsByAccNo = function(loanAccNo) {
      $scope.errorSpin = true;
      var loanSummaryUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanSummaryDetails'), {
        servicesPath: lpPortal.root
      });

      var postData = {
        'lnAcctNb': loanAccNo
      };

      postData = $.param(postData || {});

      //          Please comment for live  

      //            $http.get('styles/pldetails.json').success(function(data) {
      //                $scope.errorSpin = false;
      //                if(data!=undefined && data!=null && $.trim(data)!='') {
      //					$scope.loanDetailData = data;
      //                    $scope.getLoanDetail();
      //				} else {
      //					$scope.noLoanAccount = {
      //				        happened: true,
      //				        msg: constIDFC.ERROR_NO_LOANS
      //					};
      //				}
      //				
      //            }).error(function(data) {
      //				$scope.errorSpin = false;
      //				$scope.error = {
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
        $scope.loanDetailData = data;
        getLoanDetail();
        changeDateFormat($scope.loanDetailData);
        $scope.errorSpin = false;
      }).error(function(data) {
      console.log("data:"+data);
        $scope.errorSpin = false;
        $scope.error = {
          happened: true,
          msg: constIDFC.TECHNICAL_ERROR_LOAN_DETAILS
        };
      });
    };

    var changeDateFormat = function(loanDetails) {
      if (loanDetails.dsbrsmtDt != undefined && loanDetails.dsbrsmtDt != null && loanDetails.dsbrsmtDt.trim() != '') {
        var date = loanDetails.dsbrsmtDt.split("/");
        $scope.loanDetailData.dsbrsmtDt = new Date(date[2], date[1] - 1, date[0]);
        $scope.loanDetailData.dsbrsmtDt = $filter('date')($scope.loanDetailData.dsbrsmtDt, "dd MMM yyyy");
      }
      if (loanDetails.intrstEndDt != undefined && loanDetails.intrstEndDt != null && loanDetails.intrstEndDt.trim() != '') {
        var date = loanDetails.intrstEndDt.split("/");
        $scope.loanDetailData.intrstEndDt = new Date(date[2], date[1] - 1, date[0]);
        $scope.loanDetailData.intrstEndDt = $filter('date')($scope.loanDetailData.intrstEndDt, "dd MMM yyyy");
        //$scope.loanDetails.intrstEndDt = new Date(loanDetails.intrstEndDt);
      }
      else{
	$scope.loanDetailData.intrstEndDt = "NA";
      }	
      if (loanDetails.nxtDueDt != undefined && loanDetails.nxtDueDt != null && loanDetails.nxtDueDt.trim() != '') {
        if (loanDetails.nxtDueDt !== 'NA') {
          var date = loanDetails.nxtDueDt.split("/");
          $scope.loanDetailData.nxtDueDt = new Date(date[2], date[1] - 1, date[0]);
          $scope.loanDetailData.nxtDueDt = $filter('date')($scope.loanDetailData.nxtDueDt, "dd MMM yyyy");
          //$scope.loanDetails.nxtDueDt = new Date(loanDetails.nxtDueDt);
        }
      }
    };


    $scope.openPersonalLoanStmt = function() {
      lpCoreBus.publish('changeMenuColour', 'lapLoanStatement');
      //lpCoreBus.publish('launchpad-retail.openLAPSOA', $scope.loanDetailData.lnAcctNb);
      localStorage.setItem('lnAccountNo',  $scope.loanDetailData.lnAcctNb);
      localStorage.setItem("origin","lap-summary");
	  localStorage.setItem("navigationFlag",true);
      gadgets.pubsub.publish('launchpad-retail.openLAPSOA');
    };
    $scope.openPersonalRepaymentSchd = function() {
      lpCoreBus.publish('changeMenuColour', 'lapRepaymentSchedule');
      //lpCoreBus.publish('launchpad-retail.openLAPRepaymentSchedule', $scope.loanDetailData.lnAcctNb);
      localStorage.setItem('lnAccountNo',  $scope.loanDetailData.lnAcctNb);
      localStorage.setItem("origin","lap-summary");
       localStorage.setItem("navigationFlag",true);
       gadgets.pubsub.publish('launchpad-retail.openLAPRepaymentSchedule');
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

    //added for mobile
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });

    initialize();
  }


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

  //   $timeout(function(){
  //     gadgets.pubsub.publish('cxp.item.loaded', {
  //         id: widget.id
  //     });
  // }, 10);
  }());


  /**ok
   * Export Controllers
   */
  exports.LAPSummaryController = LAPSummaryController;
});