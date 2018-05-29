/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {

    'use strict';

    var fileSaver = require('fileSaver');
    var loanAccount = '';
    var idfcHanlder = require('idfcerror');
    var idfcConstants = require('idfccommon').idfcConstants;

    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function StatementOfAccountController($scope, $rootElement, lpWidget, lpCoreUtils, lpCoreError, $http,
        lpUIResponsive, lpCoreI18n, lpCoreBus, lpPortal) {
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;

        //$scope.showSubmitBtn = true;

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

        $scope.initialize = function() {
            //Session Management
            idfcHanlder.validateSession($http);
            $scope.errorSpin = true;
            $scope.getLoanAccList();
            $scope.statementData = [];
            $scope.dateValid=[];
            $scope.showTable = false;
            $scope.button = false;
            $scope.LoanDetails=[];
            $scope.loanDetailsUpdate = [];
            $scope.transactionDtls =[];
            $scope.blankBothDateError=false;
            $scope.dateError = false;
            $scope.blankFromDateError = false;
			$scope.blankToDateError = false;
			$scope.disbDateError = false;
			$scope.selectAccErr = false;
			$scope.bizbDateError=false;

			 if(localStorage.getItem("origin")=="home-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
             }
          //Widget Pub Sub
			/*lpCoreBus.subscribe('launchpad-retail.openLoanStmtAcc', function(data) {
				if (undefined === data || data === null ) {
					$scope.selectAccountNumber = '';

				} else {
					$scope.selectAccountNumber = data;
					$scope.getSoaByAccNo();
				}
			});*/
			//added for mobile
		/*	gadgets.pubsub.subscribe('launchpad-retail.openLoanStmtAcc', function(evt) {
                if (undefined === evt.data || evt.data === null ) {
                    $scope.selectAccountNumber = '';

                } else {
                    $scope.selectAccountNumber = evt.data;
                    $scope.getSoaByAccNo();
                }
            });*/
             loanAccount = localStorage.getItem('lnAccountNo');
                        console.log('Local Storage SOA'+loanAccount);
                        if(!angular.isUndefined(loanAccount) && loanAccount!='' && loanAccount!=null){
                            console.log('Inside if'+loanAccount);
                            localStorage.setItem('lnAccountNo' , '');
                            $scope.selectAccountNumber = loanAccount;
                            $scope.getSoaByAccNo();

                            // $timeout(function(){ $scope.$apply(); }, 150);

                        }else{
                        $scope.selectAccountNumber = '';
                        }

        };

        $scope.getLoanAccList = function() {
            $scope.loanAccountNumbers = [];
			
			var loanAccountListUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
				.getPreference('getLoanAccountList'), {
				servicesPath: lpPortal.root
			});
			
			$http({
			method: 'GET',
			url: loanAccountListUrl,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded;'
			}
			}).success(function(data) {
				  /* $scope.errorSpin = false;
                $scope.loanAccountNumbers = data;
               // $scope.selectedAccountNumber = $scope.loanAccountNumbers[0].acctNb;
                $scope.getSoaByAccNo();*/
            	
            	lpCoreUtils.forEach(data, function(list) {
					 
					 $scope.loanAccountNumbers.push(list.acctNb) ;
					 
					});
					$scope.errorSpin = false;
					//to display the first value as default selected value (ng-selected =$first as an alternative)
					if ($scope.loanAccountNumbers.length === 1) {
						$scope.selectAccountNumber = $scope.loanAccountNumbers[0];
						$scope.getSoaByAccNo();
					}
			}).error(function(data){
				 $scope.errorSpin = false;
                $scope.error = {
                    happened: true,
                    msg: data.rsn
                };
			});
        };

     



        $scope.openFromCalendar = function($event) {
            //$scope.showSubmitBtn = true;
            $scope.isOpenDate1 = true;
			$scope.isOpenDate2 = false;
            $event.preventDefault();
            $event.stopPropagation();

        };

        $scope.openToCalendar = function($event) {
            //$scope.showSubmitBtn = true;
            $scope.isOpenDate2 = true;
			$scope.isOpenDate1 = false;
            $event.preventDefault();
            $event.stopPropagation();

        };

        var date = new Date();
        $scope.minDate = date.setDate((new Date()).getDate() - 90);
        $scope.todaysDate = new Date();

        $scope.getMonthKey = function(day,month){
            if(month == "Jan"){
                return day + " January";
            }else if(month == "Feb"){
                return day + " February";
            }else if(month == "Mar"){
                return day + " March";
            }else if(month == "Apr"){
                return day + " April";
            }else if(month == "May"){
                return day + " May";
            }else if(month == "Jun"){
                return day + " June";
            }else if(month == "Jul"){
                return day + " July";
            }else if(month == "Aug"){
                return day + " August";
            }else if(month == "Sep"){
                return day + " September";
            }else if(month == "Oct"){
                return day + " October";
            }else if(month == "Nov"){
                return day + " November";
            }else if(month == "Dec"){
                return day + " December";
            }

        }

        $scope.getObjFromJson = function(jsonObj, key){
            for (name in jsonObj) {
                   if(jsonObj[name].year == key){
                    return jsonObj[name];
                }
               }
        }

        $scope.getObjFromJsonMonth = function(jsonObj, key){
            for (name in jsonObj) {
                //alert(jsonObj[name].name +" == "+key);
                   if(jsonObj[name].name == key){
                    return jsonObj[name];
                }
               }
        }

        $scope.pushIntoLoanDetailsUpdate = function(record){
            console.log(record.txnDt);
            var arrStartDate = record.txnDt.split("-");
            var year = arrStartDate[2];
            var month = arrStartDate[1];
            var day = arrStartDate[0];
            var monthKey = $scope.getMonthKey(day,month);

               var yearObj = $scope.getObjFromJson($scope.loanDetailsUpdate,year);
               console.log('yearObj'+yearObj);
            if(yearObj != null){
                var monthObj = $scope.getObjFromJsonMonth(yearObj.monthKey, monthKey);
                if(monthObj != null){
                    monthObj.records.push(record);
                    console.log('monthObj.records'+monthObj.records);
                }else{
                    var jsonMonth = { 'name' : monthKey ,'records' : [record]};
                    yearObj.monthKey.push(jsonMonth);
                }
            }else{
                var jsonMonth = [{ 'name' : monthKey ,'records' : [record]}];
                console.log('jsonMonth'+jsonMonth);
                $scope.loanDetailsUpdate.push({'year' : year, 'monthKey' : jsonMonth});
            }
               console.log(JSON.stringify($scope.loanDetailsUpdate));
        }

       //To display account details on load without submit button  
        $scope.getSoaByAccNo = function() {

            $scope.noTransactionError=false;
            $scope.noTransactions=false;
            $scope.showTable = true;
            $scope.button = false;
            $scope.selectAccErr = false;
			$scope.blankBothDateError=false;
            $scope.dateError = false;
            $scope.blankFromDateError = false;
			$scope.blankToDateError = false;
			$scope.disbDateError = false;
			$scope.selectAccErr = false;
			$scope.bizbDateError=false;
            $scope.errMessage = '';
            $scope.error = {
                    happened: false,
                    msg: ''
                };
			$scope.fromDate = '';
			$scope.toDate = '';
            $scope.successMessagePDFEmail = '';

            if($scope.selectAccountNumber === undefined || $scope.selectAccountNumber === null ){
				
				 $scope.showTable = false;
				
			} else {
            
            var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'));
            var currentDate = new Date();
            var threeMonthsEarlierDate = new Date();
            threeMonthsEarlierDate.setMonth(currentDate.getMonth() - 3);
            var postData = {
                'lnAcctNb': $scope.selectAccountNumber,
                'frmDT': threeMonthsEarlierDate.getTime(),
                'toDt': currentDate.getTime()
            };
            postData = $.param(postData || {});
            $scope.errorSpin = true;//Added error spin
            $http({
                method: 'POST',
                url: getLoanSoa,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }

            }).success(function(data, status, headers, config) {
                $scope.noTransactionError=false;
                $scope.errorSpin = false;
                $scope.LoanDetails = data;
                var transactionDtls = $scope.LoanDetails.getsoaTransactionDtls;
                 $scope.loanDetailsUpdate.splice(0, $scope.loanDetailsUpdate.length);
                if(transactionDtls!==null && transactionDtls!==undefined && $.trim(transactionDtls)!=='' && !checkTransactionsEmpty(transactionDtls)) {
                    $scope.transactionDtls = $scope.LoanDetails.getsoaTransactionDtls;
                    $scope.disbDate = $scope.LoanDetails.getsoaDisbDtls[0].dsbrsDt1;
                    lpCoreUtils.forEach(transactionDtls, function(detail) {
                        //code to split the date string and convert it into Date format
                        $scope.pushIntoLoanDetailsUpdate(detail);

                    });
                    /* for(var i=0;i<=$scope.transactionDtls.length;i++){
                        var splitDate = $scope.transactionDtls[i].txnDt.split('/');
                        $scope.transactionDtls[i].txnDt = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);

                     }
                    var splitDate = $scope.transactionDtls.txnDt.split('/');
                    $scope.splitDate.txnDt = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]); */
                    $scope.dateValid=$scope.transactionDtls.getsoaMains;
                    $scope.pagesShown = 1;
                    $scope.pageSize = 5;
                    $scope.setPagination();


                } else {
                    console.log('No transactions');
                	$scope.showTable = false;
					$scope.dontShowTable = true;
               	    //$scope.noTransactionError=true;
               	    $scope.noTransactions=true;

            }
            //$scope.showSubmitBtn = false;
                
            }).error(function(data, status, headers, config) {
           
                $scope.errorSpin = false;
                $scope.showTable = false;
                $scope.error = {
                    happened: true,
                    msg: 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.'
                };

            });

            //$scope.pagesShown = 1;
            //$scope.pageSize = 5;
            //$scope.setPagination();
			}
            // localStorage.setItem('lnAccountNo' , '');//Clearing LocalStorage

        };



        var pagesShown = 1;
        var pageSize = 5;
        $scope.paginationLimit = function() {
            var pageLimit = pageSize * pagesShown;
            return pageLimit;
        };


        $scope.setPagination = function() {
          
            $scope.paginationLimit = function() {
                 var pageLimit = $scope.pageSize * $scope.pagesShown;

                 return pageLimit;
             };
            $scope.showMoreItems = function(firstTime) {
                if(!firstTime){
                    $scope.pagesShown = $scope.pagesShown + 1;
                }
                $scope.loanDetailsUpdate.splice(0, $scope.loanDetailsUpdate.length);
                console.log("$scope.paginationLimit() :: " + $scope.paginationLimit());
                console.log("$scope.transactionDtls :: "+$scope.transactionDtls.length);
                var i = 0;
                lpCoreUtils.forEach($scope.transactionDtls, function(loanDetail) {
                    if (i < $scope.paginationLimit()) {
                        //console.log("$scope.loanDetails[i] ::" + JSON.stringify(loanDetail));
                        $scope.pushIntoLoanDetailsUpdate(loanDetail);

                    }
                    i++;
                });
                var showMoreLink = $('#showMoreLink');
                if(angular.isDefined(showMoreLink)){
                  $('#showMoreLink').blur();
                  $('#showMoreLink').css("color", "#f1666a");
                }
            };
            $scope.hasMoreItemsToShow = function() {
                console.log('values::::::' + $scope.pagesShown + ' ' + $scope.transactionDtls.length + ' ' + $scope.pageSize);
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' + ($scope.pagesShown < ($scope.transactionDtls.length / $scope.pageSize)));
                return $scope.pagesShown < ($scope.transactionDtls.length / $scope.pageSize);
                
            };
            $scope.showMoreItems(true);
        };

      //To display account details on submit button
        $scope.getSoaByAccNoOnSubmit = function() {

            $scope.noTransactionError=false;
            $scope.noTransactions=false;


            $scope.showTable = false;

        	$scope.error = {
                    happened: false,
                    msg: ''
                };
            $scope.successMessagePDFEmail = '';

            $scope.button = true;
            $scope.blankBothDateError=false;
            $scope.dateError = false;
            $scope.blankFromDateError = false;
			$scope.blankToDateError = false;
			$scope.disbDateError = false;
			$scope.selectAccErr = false;
			$scope.bizbDateError=false;
			
			//to check account number is not blank
            $scope.errMessage = '';
            if ($scope.selectAccountNumber === undefined || $scope.selectAccountNumber === null || $scope.selectAccountNumber === "") {
                $scope.selectAccErr = true;
                $scope.showTable = false;
            } else {

                $scope.selectAccErr = false;


                // to check from date and to date are not null
                if (($scope.fromDate == null && $scope.toDate == null) ||
                    ($scope.fromDate == '' && $scope.toDate == '')) {

                $scope.showTable = false;
                $scope.blankBothDateError=true;
                $scope.dateError = false;
                $scope.blankFromDateError = false;
				$scope.blankToDateError = false;
				$scope.disbDateError = false;
				$scope.selectAccErr = false;
            }
            
            // to check from date not null	
            else if ($scope.fromDate == null || $scope.fromDate=='') {

                $scope.showTable = false;
                $scope.blankBothDateError=false;
                $scope.dateError = false;
                $scope.blankFromDateError = true;
				$scope.blankToDateError = false;
				$scope.disbDateError = false;
				$scope.selectAccErr = false;

		 
				
            } 
            // to check to date not null	
            else if ($scope.toDate == null || $scope.toDate == '') {
                $scope.showTable = false;
                $scope.blankBothDateError=false;
                $scope.dateError = false;
                $scope.blankFromDateError = false;
				$scope.blankToDateError = true;
				$scope.disbDateError = false;
				$scope.selectAccErr = false;


            } 
         // to check from date less than to date 	
            
            else if ($scope.fromDate > $scope.toDate) {
                $scope.showTable = false;
                $scope.blankBothDateError=false;
                $scope.dateError = true;
                $scope.blankFromDateError = false;
				$scope.blankToDateError = false;
				$scope.disbDateError = false;
				$scope.selectAccErr = false;

            }  else {
                $scope.showTable = true;
                var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'));
                var currentDate = new Date();
                var threeMonthsEarlierDate = new Date();
                threeMonthsEarlierDate.setMonth(currentDate.getMonth() - 3);
                var postData = {
                    'lnAcctNb': $scope.selectAccountNumber,
                    'frmDT': $scope.fromDate.getTime(),
                    'toDt': $scope.toDate.getTime()
                };
                postData = $.param(postData || {});
                $scope.errorSpin = true;
                 $scope.loanDetailsUpdate.splice(0, $scope.loanDetailsUpdate.length);
                $http({
                    method: 'POST',
                    url: getLoanSoa,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }

                }).success(function(data, status, headers, config) {
                    $scope.noTransactionError=false;
                    $scope.noTransactions=false;

                    $scope.errorSpin = false;
                    $scope.LoanDetails = data;
                    var transactionDtls = $scope.LoanDetails.getsoaTransactionDtls; 
                    if(transactionDtls!==null && transactionDtls!==undefined && $.trim(transactionDtls)!==' ' && !checkTransactionsEmpty(transactionDtls)) {
                    $scope.transactionDtls = $scope.LoanDetails.getsoaTransactionDtls;
                    $scope.dateValid = $scope.LoanDetails.getsoaMains;
                    lpCoreUtils.forEach(transactionDtls, function(detail) {
                                        //code to split the date string and convert it into Date format
                                        $scope.pushIntoLoanDetailsUpdate(detail);

                                    });
                    
	                  /*  var splitDate = $scope.dateValid.bizDt.split('/');
	                    $scope.dateValid.bizDt = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);*/
                   /*  var splitFromDate = $scope.dateValid.dsbrsDt.split('/');
                    $scope.dateValid.dsbrsDt = new Date(splitFromDate[2], splitFromDate[1] - 1, splitFromDate[0]); */
	                 // to check to date less than business date 
                   if ($scope.toDate > $scope.currentDate) {
                        $scope.showTable = false;
                        $scope.showTable = false;
                        $scope.blankBothDateError=false;
                        $scope.dateError = false;
                        $scope.blankFromDateError = false;
        				$scope.blankToDateError = false;
        				$scope.disbDateError = true;
        				$scope.selectAccErr = false;
        				$scope.bizbDateError=true;
                        
                    }
                    
	                // to check from date less than disbursement date 
                    
                    if ($scope.fromDate < $scope.dateValid.dsbrsDt) {

                        $scope.showTable = false;
                        $scope.blankBothDateError=false;
                        $scope.dateError = false;
                        $scope.blankFromDateError = false;
        				$scope.blankToDateError = false;
        				$scope.disbDateError = true;
        				$scope.selectAccErr = false;
                        
                    }

                            // to check from date less than business date
                            if ($scope.fromDate > $scope.currentDate) {

                                $scope.showTable = false;
                                $scope.blankBothDateError = false;
                                $scope.dateError = false;
                                $scope.blankFromDateError = false;
                                $scope.blankToDateError = false;
                                $scope.disbDateError = true;
                                $scope.selectAccErr = false;

                            }

                            /* for(var i=0;i<=$scope.transactionDtls.length;i++){
                            	var splitDate = $scope.transactionDtls[i].txnDt.split('/');
                            	$scope.transactionDtls[i].txnDt = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);

                             } */
                             $scope.pagesShown = 1;
                             $scope.pageSize = 5;
                             $scope.setPagination();
                        } else {
                            $scope.showTable = false;
                            $scope.dontShowTable = true;
                            $scope.noTransactionError = true;

                        }
                    }).error(function(data, status, headers, config) {

                        $scope.errorSpin = false;
                        $scope.showTable = false;
                        $scope.error = {
                            happened: true,
                            msg: 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.'
                        };

                });
                $scope.pagesShown = 1;
                $scope.pageSize = 5;
                $scope.setPagination();

            }

            }
        };
		
		var checkTransactionsEmpty = function(value){
			if(value.length == 1){
				if(value[0].txnDt === ' ' || value[0].txnDt === ''){
					return true;
				}
			}else{
				return false;
			}
		};



        $scope.PDFGeneration = function() {
           
        	var postData = {
        			/* 'orgId': $scope.dateValid.orgId,
					'orgCd': $scope.dateValid.orgCd, */
					'lnAcctNb': $scope.selectAccountNumber,
					/* 'dsbrsHdng':$scope.dateValid.dsbrsHdng ,
					'prpyHdng': " ",
					'szPgHdr': " ",
					'lnAcctHdr': $scope.dateValid.lnAcctHdr,
					'bizDt': $scope.dateValid.bizDt,
					'astAdr': $scope.dateValid.astAdr,
					'lnTxnHdr': $scope.dateValid.lnTxnHdr,
					'custNb': $scope.dateValid.custNb,
					'adr': $scope.dateValid.adr,
					'clsrRsn': $scope.dateValid.clsrRsn,
					'szCustNm': $scope.dateValid.szCustNm,
					'dsbrsDt': $scope.dateValid.dsbrsDt,
					'snctnAmt': $scope.dateValid.snctnAmt,
					'dsbrsAmt': $scope.dateValid.dsbrsAmt,
					'crntInstlmnnt': $scope.dateValid.crntInstlmnnt,
					'crntIntrstRt':$scope.dateValid.crntIntrstRt,
					'instlmntPd':  $scope.dateValid.instlmntPd,
					'prnplOtstng': $scope.dateValid.prnplOtstng,
					'ftrInstlmnt': $scope.dateValid.ftrInstlmnt,
					'brnch': $scope.dateValid.brnch,
					'prd': $scope.dateValid.prd,
					//'LAN':$scope.dateValid.LAN,
					'idxRt': $scope.dateValid.idxRt,
					'offst': $scope.dateValid.offst,
					'sprd': $scope.dateValid.sprd,
					'intrstTyp': $scope.dateValid.intrstTyp,
					'tnr':$scope.dateValid.tnr,
					'frqncy': $scope.dateValid.frqncy,
					'instlmntPln': $scope.dateValid.instlmntPln,
					'instlmntStrtDt': $scope.dateValid.instlmntStrtDt,
					'instlmntEndDt': $scope.dateValid.instlmntEndDt,
					'crncy': $scope.dateValid.crncy,
					'rpyMd': $scope.dateValid.rpyMd,
					'coAplntNm': $scope.dateValid.coAplntNm,
					'acctSts': $scope.dateValid.acctSts, */
					'frmDT' : $scope.fromDate.getTime(),
					'toDt' : $scope.toDate.getTime(),
					'emailFlag':false
        			
        	};
        	
        	var pdfData = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generatePDFForSOA'));
            
        	//pdfData = pdfData + '&email=' + false;
        	
            postData = $.param(postData || {});
            $http({
                method: "POST",
                url: pdfData,
                data: postData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                },
                responseType: 'arraybuffer'

            }).success(function(response, status, headers, config) {
            	try {
                    var file = new Blob([response], {
                        type: 'application/pdf'
                    });
					var filename = 'Statement of account of ' + $scope.selectAccountNumber;
                    fileSaver.saveAs(file, filename);
                   
                } catch (e) {
                    alert(e.stack);
                }

                

            }).error(function(response) {

                $scope.error = {
                    happened: true,
                    msg: idfcConstants.ERROR_PDF
                };
            });
        	
        };

        $scope.Emailadvice = function() {
            $scope.errorSpin = true;
            //var postData = $scope.dateValid;

            //UAT issue CPU - 5475
                if(undefined === $scope.selectAccountNumber || null===$scope.selectAccountNumber || ''===$scope.selectAccountNumber){
                    /*$scope.error = {
                    						happened: true,
                    						msg: 'Please select the Loan Account Number to view the statement'
                    				};*/
                    $scope.selectAccErr = true;
                    $scope.showTable = false;
                    $scope.errorSpin = false;

                }
                 else if (($scope.fromDate == null && $scope.toDate == null) ||
                        ($scope.fromDate == '' && $scope.toDate == '')) {
                    $scope.errorSpin = false;
                    $scope.showTable = false;
                    $scope.blankBothDateError=true;
                    $scope.dateError = false;
                    $scope.blankFromDateError = false;
                    $scope.blankToDateError = false;
                    $scope.disbDateError = false;
                    $scope.selectAccErr = false;
                }

                // to check from date not null
                else if ($scope.fromDate == null || $scope.fromDate=='') {
                    $scope.errorSpin = false;
                    $scope.showTable = false;
                    $scope.blankBothDateError=false;
                    $scope.dateError = false;
                    $scope.blankFromDateError = true;
                    $scope.blankToDateError = false;
                    $scope.disbDateError = false;
                    $scope.selectAccErr = false;



                }
                // to check to date not null
                else if ($scope.toDate == null || $scope.toDate == '') {
                    $scope.errorSpin = false;
                    $scope.showTable = false;
                    $scope.blankBothDateError=false;
                    $scope.dateError = false;
                    $scope.blankFromDateError = false;
                    $scope.blankToDateError = true;
                    $scope.disbDateError = false;
                    $scope.selectAccErr = false;


                }
                else {
                     var postData = {
                            /* 'orgId': $scope.dateValid.orgId,
                            'orgCd': $scope.dateValid.orgCd, */
                            'lnAcctNb': $scope.selectAccountNumber,
                            /* 'dsbrsHdng':$scope.dateValid.dsbrsHdng ,
                            'prpyHdng': " ",
                            'szPgHdr': " ",
                            'lnAcctHdr': $scope.dateValid.lnAcctHdr,
                            'bizDt': $scope.dateValid.bizDt,
                            'astAdr': $scope.dateValid.astAdr,
                            'lnTxnHdr': $scope.dateValid.lnTxnHdr,
                            'custNb': $scope.dateValid.custNb,
                            'adr': $scope.dateValid.adr,
                            'clsrRsn': $scope.dateValid.clsrRsn,
                            'szCustNm': $scope.dateValid.szCustNm,
                            'dsbrsDt': $scope.dateValid.dsbrsDt,
                            'snctnAmt': $scope.dateValid.snctnAmt,
                            'dsbrsAmt': $scope.dateValid.dsbrsAmt,
                            'crntInstlmnnt': $scope.dateValid.crntInstlmnnt,
                            'crntIntrstRt':$scope.dateValid.crntIntrstRt,
                            'instlmntPd':  $scope.dateValid.instlmntPd,
                            'prnplOtstng': $scope.dateValid.prnplOtstng,
                            'ftrInstlmnt': $scope.dateValid.ftrInstlmnt,
                            'brnch': $scope.dateValid.brnch,
                            'prd': $scope.dateValid.prd,
                            //'LAN':$scope.selectAccountNumber,
                            'idxRt': $scope.dateValid.idxRt,
                            'offst': $scope.dateValid.offst,
                            'sprd': $scope.dateValid.sprd,
                            'intrstTyp': $scope.dateValid.intrstTyp,
                            'tnr':$scope.dateValid.tnr,
                            'frqncy': $scope.dateValid.frqncy,
                            'instlmntPln': $scope.dateValid.instlmntPln,
                            'instlmntStrtDt': $scope.dateValid.instlmntStrtDt,
                            'instlmntEndDt': $scope.dateValid.instlmntEndDt,
                            'crncy': $scope.dateValid.crncy,
                            'rpyMd': $scope.dateValid.rpyMd,
                            'coAplntNm': $scope.dateValid.coAplntNm,
                            'acctSts': $scope.dateValid.acctSts, */
                            'frmDT' : $scope.fromDate.getTime(),
                            'toDt' : $scope.toDate.getTime(),
                            'emailFlag':true

                    };

                    var padfData = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generatePDFForSOA'));
                   // padfData = padfData + '&email=' + true;

                    postData = $.param(postData || {});
                    $http({
                        method: "POST",
                        url: padfData,
                        data: postData,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;'
                        },
                        //responseType: 'arraybuffer'

                    }).success(function(response, status, headers, config) {
                        $scope.errorSpin = false;
                        $scope.emailSuccess=true;
                        $scope.successMessagePDFEmail = 'Email has been sent successfully';
                        //alert($scope.successMessagePDFEmail);

                    }).error(function(response) {
                        $scope.errorSpin = false;
                        $scope.emailSuccess=false;
                        if (response.cd == 'email01') {
                            $scope.error = {
                                happened: true,
                                msg: 'Oops! Looks like you haven’t registered your email ID with us, please add your email ID in the My Profile section or call us on 1800-419-4332 so we can update it for you. We can only send the Statement to your registered ‎email ID.'
                            };
                        } else {
                            //$scope.successMessagePDFEmail = 'No Records found';
                            $scope.error = {
                                happened: true,
                                msg: 'Sorry, we are unable to send your Statement of Account'
                            };
                        }
                        //alert($scope.error.msg);
                    });
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


        $scope.initialize();
    }



    /**
     * Export Controllers
     */
    exports.StatementOfAccountController = StatementOfAccountController;
});