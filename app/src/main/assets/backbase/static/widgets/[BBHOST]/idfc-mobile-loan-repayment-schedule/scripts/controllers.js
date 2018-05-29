/**
 * Controllers
 * 
 * @module controllers
 */
define(function(require, exports) {

	'use strict';
	var $ = require('jquery');
	var fileSaver = require('fileSaver');
	var idfcHanlder = require('idfcerror');
	var loanAccount = '';



	/**
	 * RepaymentController
	 * 
	 * @ngInject
	 * @constructor
	 */
	function RepaymentController($scope, $rootElement, lpWidget, lpCoreUtils,
			lpCoreError, $http, lpUIResponsive, lpCoreI18n , lpCoreBus, lpPortal,$timeout ) {
		this.utils = lpCoreUtils;
		this.error = lpCoreError;
		this.widget = lpWidget;
		
		// $scope.showSubmitBtn = true;

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

		
		//opens the calender of from date
		$scope.openFromDateCalendar = function($event) {
		    //$scope.showSubmitBtn = true;
			$scope.isOpenDate1 = true;
			$scope.isOpenDate2 = false;
			$event.preventDefault();
			$event.stopPropagation();

		};

		
		//opens the calender of To date
		$scope.openToDateCalendar = function($event) {
		    //$scope.showSubmitBtn = true;
			$scope.isOpenDate2 = true;
			$scope.isOpenDate1 = false;
			$event.preventDefault();
			$event.stopPropagation();

		};

		$scope.todaysDate = new Date();
		$scope.maxDisbursementDate = new Date();
		$scope.loanDetails = [];
		$scope.loanDetailsUpdate = [];
		$scope.details = [];
		$scope.dateError = false;
		$scope.blankToDateError = false;
		$scope.blankFromDateError = false;
		$scope.blankBothDateError = false;
		$scope.showtable = false;
		$scope.noPendingLoansMsg = false;
	    $scope.noLoansSearchMsg = false;
	    $scope.initialize = function() {

	        if(localStorage.getItem("origin")=="home-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
             }

	        //Session Management
            idfcHanlder.validateSession($http);
			$scope.isOpenDate2 = false;
			$scope.isOpenDate1 = false;

			// function call to load accounts into the account dropdown
			$scope.errorSpin = true;
			$scope.getLoanAccList();
			
			//Widget Pub Sub
			/*lpCoreBus.subscribe('launchpad-retail.openRepaymentSchd', function(data) {
				if (undefined === data || data === null ) {
					$scope.selectedAccountNumber = '';

				} else {
					$scope.selectedAccountNumber = data;
					$scope.getLoanDetailsByAccNo();
				}
			});*/
			//added for mobile
			/*gadgets.pubsub.subscribe('openRepaymentSchd', function(evt) {
                if (undefined === evt.data || evt.data === null ) {
                    $scope.selectedAccountNumber = '';

                } else {
                    $scope.selectedAccountNumber = evt.data;
                    $scope.getLoanDetailsByAccNo();
                }
            });*/
               loanAccount = localStorage.getItem('lnAccountNo');
                                    console.log('Local Storage SOA'+loanAccount);
                                    if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
                                        console.log('Inside if'+loanAccount);
                                        localStorage.setItem('lnAccountNo' , '');
                                        $scope.selectedAccountNumber = loanAccount;
                                         $scope.getLoanDetailsByAccNo();

                                    }else{
                                    $scope.selectedAccountNumber = null;
                                    }
			
			

		};

		
		//call to fetch loan accounts number
		$scope.getLoanAccList = function() {
			$scope.loanAccountNumbers = [];
			var loanAccountsUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
				.getPreference('getLoanAccountList'), {
				servicesPath: lpPortal.root
			});
			
			$http({
			method: 'GET',
			url: loanAccountsUrl,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded;'
			}
			}).success(function(data) {
						
					 lpCoreUtils.forEach(data, function(list) {
						 
						 $scope.loanAccountNumbers.push(list.acctNb) ;
						 
						});
						$scope.errorSpin = false;
						//to display the first value as default selected value (ng-selected =$first as an alternative)
						if ($scope.loanAccountNumbers.length === 1) {
							$scope.selectedAccountNumber = $scope.loanAccountNumbers[0];
							$scope.getLoanDetailsByAccNo();
						}
						
					
				

					}).error(function(data) {
				$scope.errorSpin = false;
				$scope.error = {
					happened : true,
					msg : data.rsn
				};
			});

			
		};

		$scope.getMonthKey = function(day,month){
		    if(month == "01"){
		        return day + " January";
		    }else if(month == "02"){
                return day + " February";
            }else if(month == "03"){
                return day + " March";
            }else if(month == "04"){
                return day + " April";
            }else if(month == "05"){
                return day + " May";
            }else if(month == "06"){
                return day + " June";
            }else if(month == "07"){
                return day + " July";
            }else if(month == "08"){
                return day + " August";
            }else if(month == "09"){
                return day + " September";
            }else if(month == "10"){
                return day + " October";
            }else if(month == "11"){
                return day + " November";
            }else if(month == "12"){
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
		    console.log(record.instDueDateStr);
            var arrStartDate = record.instDueDateStr.split("/");
            var year = arrStartDate[2];
            var month = arrStartDate[1];
            var day = arrStartDate[0];
            var monthKey = $scope.getMonthKey(day,month);

               var yearObj = $scope.getObjFromJson($scope.loanDetailsUpdate,year);
               //console.log('yearObj'+yearObj);
            if(yearObj != null){
                var monthObj = $scope.getObjFromJsonMonth(yearObj.monthKey, monthKey);
                if(monthObj != null){
                    monthObj.records.push(record);
                 //   console.log('monthObj.records'+monthObj.records);
                }else{
                    var jsonMonth = { 'name' : monthKey ,'records' : [record]};
                    yearObj.monthKey.push(jsonMonth);
                }
            }else{
                var jsonMonth = [{ 'name' : monthKey ,'records' : [record]}];
                //console.log('jsonMonth'+jsonMonth);
                $scope.loanDetailsUpdate.push({'year' : year, 'monthKey' : jsonMonth});
            }
               //console.log(JSON.stringify($scope.loanDetailsUpdate));
        }

		$scope.getLoanDetailsByAccNo = function() {
			$scope.error = {
                    happened: false,
                    msg: ''
                };
			$scope.successMessagePDFEmail = '';
			$scope.fromDate = '';
			$scope.toDate = '';
			
			if(null===$scope.selectedAccountNumber || $scope.selectedAccountNumber == ""){
			    $scope.showLoanPaymentSchedules=false;
				$scope.showtable = false;
				$scope.dateError = false;
				$scope.blankToDateError = false;
				$scope.blankFromDateError = false;
				$scope.blankBothDateError = false;
				$scope.noPendingLoansMsg = false;
				$scope.noLoansSearchMsg = false;
			    $scope.selectAccErr = false;
				$scope.hasMoreItemsToShow = function() {
					return false;
				};
			}else{
			$scope.showLoanPaymentSchedules=true;

			$scope.dateError = false;
			$scope.blankToDateError = false;
			$scope.blankFromDateError = false;
			$scope.blankBothDateError = false;
			$scope.noPendingLoansMsg = false;
			$scope.noLoansSearchMsg = false;			
			$scope.selectAccErr = false;
			$scope.loanDetails.splice(0, $scope.loanDetails.length);
			$scope.details.splice(0, $scope.details.length);
			$scope.loanDetailsUpdate.splice(0, $scope.loanDetailsUpdate.length);

			var getloanRepaymentSchedule = lpCoreUtils
					.resolvePortalPlaceholders(lpWidget
							.getPreference('loanRepaymentDetails'));

			var postData = {
				'loanAccountNumber' : $scope.selectedAccountNumber,
			};
			$scope.errorSpin = true;
			postData = $.param(postData || {});
            $http({
				method : 'POST',
				url : getloanRepaymentSchedule,
				data : postData,
				headers : {
					'Accept' : 'application/json',
					'Content-Type' : 'application/x-www-form-urlencoded;'
				}

			})
					.success(
							function(data) {
								//$scope.errorSpin = false;
								$scope.dontShowTable = false;
								$scope.noTransactionError=false;
								console.log("data :: "+JSON.stringify(data));
								//alert("data :: "+JSON.stringify(data));
								if(!checkTransactionsEmpty(data)){
								lpCoreUtils.forEach(data, function(detail) {
									//code to split the date string and convert it into Date format
									var arrStartDate = detail.instDueDate.split("/");
									detail.instDueDateStr = detail.instDueDate;
									//$scope.pushIntoLoanDetailsUpdate(detail);

									detail.instDueDate = new Date(
											arrStartDate[2],
											arrStartDate[1] - 1,
											arrStartDate[0]);

									$scope.details.push(detail);//list with installment due date in date format
								});
                                console.log(JSON.stringify($scope.loanDetailsUpdate));
								$scope.maxDisbursementDate = $scope.details[$scope.details.length - 1].instDueDate;//calculated the last installment date
								var count = 0;
								var date = new Date();
								lpCoreUtils.forEach($scope.details, function(
										loanDetail) {
									if (loanDetail.instDueDate >= date
											) {
												$scope.loanDetails.push(loanDetail);
												$scope.pushIntoLoanDetailsUpdate(loanDetail);
										/* if(count < 5){
											//filter the data with todays date and add only future five records to the list
											count = count + 1;
										} */
										$scope.noPendingLoansMsg = false;
										$scope.noLoansSearchMsg = false;										
										$scope.showtable = true;
																		}else{
																			
																			$scope.noPendingLoansMsg = true;
																			$scope.showtable = false;
																		}
										
									
									$scope.pagesShown = 0;
									$scope.pageSize = 5;
									$scope.setPagination();
								});
								console.log(JSON.stringify($scope.loanDetailsUpdate));
								}else{
									$scope.dontShowTable = true;
									$scope.noTransactionError=true;
								}
                                //$scope.showSubmitBtn = false;
								$scope.errorSpin = false;
							})
					.error(
							function(data) {
								$scope.errorSpin = false;
								$scope.error = {
									happened : true,
									msg : data.rsn
								};
							});
			//localStorage.setItem('lnAccountNo' , '');//Clearing LocalStorage


	}
		};
		
		var checkTransactionsEmpty = function(value){
			if(value.length == 1){
				if(value[0].instDueDate == ' '){
					return true;
				}
			}else{
				return false;
			}
		};

		var pagesShown = 1;
		var pageSize = 5;
		$scope.paginationLimit = function() {
			var returnVar = pageSize * pagesShown;
			return returnVar;
		};

		
		//code for Pagination
		$scope.setPagination = function() {
			$scope.paginationLimit = function() {
				var returnVar = $scope.pageSize * $scope.pagesShown;
				return returnVar;
			};
			$scope.showMoreItems = function() {
				$scope.loanDetailsUpdate.splice(0, $scope.loanDetailsUpdate.length);
				$scope.pagesShown = $scope.pagesShown + 1;
                console.log("$scope.paginationLimit() :: "+$scope.paginationLimit());
                var i=0;

                 //lpCoreUtils.forEach($scope.details, function(loanDetail) {
                lpCoreUtils.forEach($scope.loanDetails,function(loanDetail) {
                    if(i< $scope.paginationLimit()){
                       console.log("$scope.loanDetails[i] ::"+JSON.stringify(loanDetail));
                       $scope.pushIntoLoanDetailsUpdate(loanDetail);

                    }
                    i++;
                });

                //$scope.pagesShown = $scope.pagesShown + 1;

               $('#div_Show').blur();
               $('#div_Show').mouseleave();
               $('#div_Show').css("color", "#f1666a");
			};
			$scope.hasMoreItemsToShow = function() {
				return $scope.pagesShown < ($scope.loanDetails.length / $scope.pageSize);
			};
            $scope.showMoreItems();
		};

		//call on date filter
		$scope.loanFiler = function() {
		    //$scope.showSubmitBtn = false;
			$scope.error = {
                    happened: false,
                    msg: ''
                };
			$scope.showtable = false;
			$scope.noPendingLoansMsg = false;
			$scope.successMessagePDFEmail = '';
			$scope.loanDetails.splice(0, $scope.loanDetails.length);
			$scope.loanDetailsUpdate.splice(0, $scope.loanDetailsUpdate.length);
			console.log('From Date :: '+$scope.fromDate);
			console.log('To Date :: '+$scope.toDate);
			if($scope.selectedAccountNumber === undefined || $scope.selectedAccountNumber === null ){
				$scope.selectAccErr = true;
			}else{
				$scope.selectAccErr = false;
				if (($scope.fromDate == null && $scope.toDate == null) || ($scope.fromDate == "" && $scope.toDate == "") ) {
					$scope.blankBothDateError = true;
					$scope.blankFromDateError = false;
					$scope.dateError = false;
					$scope.blankToDateError = false;

				} else if ($scope.fromDate == null || $scope.fromDate == "") {
					$scope.blankFromDateError = true;
					$scope.dateError = false;
					$scope.blankToDateError = false;
					$scope.blankBothDateError = false;

				} else if ($scope.toDate == null || $scope.toDate == "") {
					$scope.blankToDateError = true;
					$scope.dateError = false;
					$scope.blankFromDateError = false;
					$scope.blankBothDateError = false;

				} else if ($scope.fromDate > $scope.toDate ) {
					$scope.blankBothDateError = false;
					$scope.dateError = true;
					$scope.blankFromDateError = false;
					$scope.blankToDateError = false;

				} else {
				    $timeout(function(){
                        $scope.dateError = false;
                        $scope.blankToDateError = false;
                        $scope.blankFromDateError = false;
                        $scope.blankBothDateError = false;
                        $scope.noLoansSearchMsg = true;
                        lpCoreUtils.forEach($scope.details, function(loanDetail) {
                            //check on from date and to date
                            console.log('Loan Detail Due Date :: '+loanDetail.instDueDate);
                            if (loanDetail.instDueDate >= $scope.fromDate
                                    && loanDetail.instDueDate <= $scope.toDate) {
                                $scope.loanDetails.push(loanDetail);
                                $scope.pushIntoLoanDetailsUpdate(loanDetail);
                                $scope.showtable = true;
                                $scope.noPendingLoansMsg = false;
                                $scope.noLoansSearchMsg=false;
                            }
                            /*$scope.pagesShown = 1;
                            $scope.pageSize = 5;
                            $scope.setPagination();*/

                        });
                        $scope.pagesShown = 0;
                        $scope.pageSize = 5;
                        $scope.setPagination();
                        console.log(JSON.stringify($scope.loanDetailsUpdate));
				    },5);

					
				}
			}
			
			if($scope.noLoansSearchMsg){
				$scope.noTransactionError = false;
			}
			

		};

				// PDF Generation
		$scope.PDFGeneration = function() {
		
			

			var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'));
			var currentDate = new Date();
			var postData = {
				'lnAcctNb' : $scope.selectedAccountNumber,
				'frmDT' : currentDate.getTime(),
				'toDt' : currentDate.getTime(),
			};
			postData = $.param(postData || {});
            console.log('>>>>>>>>>>>>>>>loansoa url>>>>>>>>>'+getLoanSoa);
			$http({
				method : 'POST',
				url : getLoanSoa,
				data : postData,
				headers : {
					'Accept' : 'application/json',
					'Content-Type' : 'application/x-www-form-urlencoded;'
				}

			})
					.success(
							function(data) {
                                 console.log('::::::::::::getLoanSoa:::::::::::::::::'+data);
								$scope.errorSpin = false;
								$scope.LoanDetails = data;
								// $scope.transactionDtls =
								// $scope.LoanDetails.getsoaTransactionDtls;
								$scope.pdfdatafromSOA = $scope.LoanDetails.getsoaMains;
								console.log($scope.pdfdatafromSOA);
								var postData = '';
								if($scope.fromDate != '' && $scope.toDate != ''){
									postData = {

									'LoanNo' : $scope.selectedAccountNumber,
									'installmentNo' : $scope.loanDetails.instNo,
									'installmentAmount' : $scope.loanDetails.totAmt,
									'interest' : $scope.loanDetails.intAmt,
									'principal' : $scope.loanDetails.prinAmt,
									'openingPrincipal' : $scope.loanDetails.openBal,
									'closingPrincipal' : $scope.loanDetails.closeBal,
									'dueDate' : $scope.loanDetails.instDueDate,
									'tenure' : $scope.pdfdatafromSOA.tnr,
									'frequency' : $scope.pdfdatafromSOA.frqncy,
									'disbursementAmt' : $scope.pdfdatafromSOA.dsbrsAmt,
									//'currentInterestDate' : $scope.pdfdatafromSOA.crntIntrstRt, //Not Required
									'interestType' : $scope.pdfdatafromSOA.intrstTyp,
									'loanType' :  'Home Loan',
									//'loanType' :  $scope.loanAccountNumbers.prdCd,
									'rateOfInterest':  $scope.pdfdatafromSOA.crntIntrstRt,
									'custName': $scope.pdfdatafromSOA.szCustNm,
									'frmDT' : $scope.fromDate.getTime(),
									'toDt' : $scope.toDate.getTime()

									};
								}else{
									postData = {

									'LoanNo' : $scope.selectedAccountNumber,
									'installmentNo' : $scope.loanDetails.instNo,
									'installmentAmount' : $scope.loanDetails.totAmt,
									'interest' : $scope.loanDetails.intAmt,
									'principal' : $scope.loanDetails.prinAmt,
									'openingPrincipal' : $scope.loanDetails.openBal,
									'closingPrincipal' : $scope.loanDetails.closeBal,
									'dueDate' : $scope.loanDetails.instDueDate,
									'tenure' : $scope.pdfdatafromSOA.tnr,
									'frequency' : $scope.pdfdatafromSOA.frqncy,
									'disbursementAmt' : $scope.pdfdatafromSOA.dsbrsAmt,
									//'currentInterestDate' : $scope.pdfdatafromSOA.crntIntrstRt, //Not Required
									'interestType' : $scope.pdfdatafromSOA.intrstTyp,
									'loanType' :  'Home Loan',
									//'loanType' :  $scope.loanAccountNumbers.prdCd,
									'rateOfInterest':  $scope.pdfdatafromSOA.crntIntrstRt,
									'custName': $scope.pdfdatafromSOA.szCustNm,
									'frmDT' : '',
									'toDt' : ''

									};
								}
								
								var pdfUrl = lpCoreUtils
										.resolvePortalPlaceholders(lpWidget
												.getPreference('loanRepaymentSchPdfSrc'));
								pdfUrl = pdfUrl + '?&emailFlag=' + false;
								console.log('::::::::::::pdfUrl:::::::::::::::::'+pdfUrl);
								postData = $.param(postData || {});
								$http(
										{
											method : "POST",
											url : pdfUrl,	
											data : postData,
											headers : {

												'Accept' : 'application/json',
												'Content-Type' : 'application/x-www-form-urlencoded;'
											},
											responseType : 'arraybuffer'
										})
										.success(
												function(response, status,
														headers, config) {
													console.log('::::::::::::success:::::::::::::::::'+resposne);
													
													try {
														var file = new Blob(
																[ response ],
																{
																	type : 'application/pdf'
																});
														var filename = 'Repayment Schedule for ' + $scope.selectedAccountNumber;
														fileSaver
																.saveAs(file, filename);
													} catch (e) {
														alert(e.stack);
													}

												}).error(function(response) {
											$scope.error = {
												happened : true,
												msg :  data.rsn
											};
										});

							})
					.error(
							function(data) {

								$scope.errorSpin = false;
								$scope.error = {
									happened : true,
									msg : 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.'
								};

							});

		};
		
		//Email 
		$scope.Emailadvice = function() {
		
			
            $scope.errorSpin=true;
			var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'));
			var currentDate = new Date();
			//alert("issue 5440:"+$scope.selectedAccountNumber);
			if($scope.selectedAccountNumber===null){
			    //$scope.showLoanPaymentSchedules=false;
			    $scope.errorSpin=false;
			    $scope.error = {
                                    happened : true,
                                    msg : 'Please select the Loan Account Number to view the Repayment Schedule'
                                };

			   // $scope.error.msg="Please select a Loan account number";
			}
			//check if dates have been selected UAT - 5472
			else if (($scope.fromDate == null && $scope.toDate == null) || ($scope.fromDate == "" && $scope.toDate == "") ) {
            					$scope.blankBothDateError = true;
            					$scope.blankFromDateError = false;
            					$scope.dateError = false;
            					$scope.blankToDateError = false;
                                $scope.errorSpin=false;
            } else if ($scope.fromDate == null || $scope.fromDate == "") {
                $scope.blankFromDateError = true;
                $scope.dateError = false;
                $scope.blankToDateError = false;
                $scope.blankBothDateError = false;
                $scope.errorSpin=false;
            } else if ($scope.toDate == null || $scope.toDate == "") {
                $scope.blankToDateError = true;
                $scope.dateError = false;
                $scope.blankFromDateError = false;
                $scope.blankBothDateError = false;
                $scope.errorSpin=false;
            } else if ($scope.fromDate > $scope.toDate ) {
                $scope.blankBothDateError = false;
                $scope.dateError = true;
                $scope.blankFromDateError = false;
                $scope.blankToDateError = false;
                $scope.errorSpin=false;
            }
			else{
			//$scope.showLoanPaymentSchedules=true;
			var postData = {
				'lnAcctNb' : $scope.selectedAccountNumber,
				'frmDT' : currentDate.getTime(),
				'toDt' : currentDate.getTime(),
			};
			postData = $.param(postData || {});

			$http({
				method : 'POST',
				url : getLoanSoa,
				data : postData,
				headers : {
					'Accept' : 'application/json',
					'Content-Type' : 'application/x-www-form-urlencoded;'
				}

			})
					.success(
							function(data) {

								//$scope.errorSpin = false;
								$scope.LoanDetails = data;
								// $scope.transactionDtls =
								// $scope.LoanDetails.getsoaTransactionDtls;
								$scope.pdfdatafromSOA = $scope.LoanDetails.getsoaMains;
								console.log($scope.pdfdatafromSOA);
								var postData = '';
								if($scope.fromDate != '' && $scope.toDate != ''){
									postData = {

									'LoanNo' : $scope.selectedAccountNumber,
									'installmentNo' : $scope.loanDetails.instNo,
									'installmentAmount' : $scope.loanDetails.totAmt,
									'interest' : $scope.loanDetails.intAmt,
									'principal' : $scope.loanDetails.prinAmt,
									'openingPrincipal' : $scope.loanDetails.openBal,
									'closingPrincipal' : $scope.loanDetails.closeBal,
									'dueDate' : $scope.loanDetails.instDueDate,
									'tenure' : $scope.pdfdatafromSOA.tnr,
									'frequency' : $scope.pdfdatafromSOA.frqncy,
									'disbursementAmt' : $scope.pdfdatafromSOA.dsbrsAmt,
									//'currentInterestDate' : $scope.pdfdatafromSOA.crntIntrstRt, //Not Required
									'interestType' : $scope.pdfdatafromSOA.intrstTyp,
									'loanType' :  'Home Loan',
									//'loanType' :  $scope.loanAccountNumbers.prdCd,
									'rateOfInterest':  $scope.pdfdatafromSOA.crntIntrstRt,
									'custName': $scope.pdfdatafromSOA.szCustNm,
									'frmDT' : $scope.fromDate.getTime(),
									'toDt' : $scope.toDate.getTime()

									};
								}else{
									postData = {

									'LoanNo' : $scope.selectedAccountNumber,
									'installmentNo' : $scope.loanDetails.instNo,
									'installmentAmount' : $scope.loanDetails.totAmt,
									'interest' : $scope.loanDetails.intAmt,
									'principal' : $scope.loanDetails.prinAmt,
									'openingPrincipal' : $scope.loanDetails.openBal,
									'closingPrincipal' : $scope.loanDetails.closeBal,
									'dueDate' : $scope.loanDetails.instDueDate,
									'tenure' : $scope.pdfdatafromSOA.tnr,
									'frequency' : $scope.pdfdatafromSOA.frqncy,
									'disbursementAmt' : $scope.pdfdatafromSOA.dsbrsAmt,
									//'currentInterestDate' : $scope.pdfdatafromSOA.crntIntrstRt, //Not Required
									'interestType' : $scope.pdfdatafromSOA.intrstTyp,
									'loanType' :  'Home Loan',
									//'loanType' :  $scope.loanAccountNumbers.prdCd,
									'rateOfInterest':  $scope.pdfdatafromSOA.crntIntrstRt,
									'custName': $scope.pdfdatafromSOA.szCustNm,
									'frmDT' : '',
									'toDt' : ''

									};
								}
								var pdfUrl = lpCoreUtils
										.resolvePortalPlaceholders(lpWidget
												.getPreference('loanRepaymentSchPdfSrc'));
								pdfUrl = pdfUrl + '?&emailFlag=' + true;
								postData = $.param(postData || {});
								$http(
										{
											method : "POST",
											url : pdfUrl,	
											data : postData,
											headers : {

												'Accept' : 'application/json',
												'Content-Type' : 'application/x-www-form-urlencoded;'
											},
											//responseType : 'arraybuffer'
										})
										.success(
												function(response, status,
														headers, config) {
														$scope.errorSpin = false;
														$scope.emailSuccess=true;
											
													$scope.successMessagePDFEmail = 'Email has been sent successfully';

												}).error(function(response) {
												$scope.errorSpin = false;
												$scope.emailSuccess=false;
												if(response.cd == 'email01'){
													$scope.error = {
															happened: true,
															msg: 'Oops! Looks like you haven’t registered your email ID with us, please add your email ID in the My Profile section or call us on 1800-419-4332 so we can update it for you. We can only send the Advice to your registered ‎email ID.'
																				
														};
												}
												else{
													//$scope.successMessagePDFEmail = 'No Records found';
									                $scope.error = {
									                    happened: true,
									                    msg: 'Sorry, we are unable to send your Repayment Schedule'
									                };
												}
										});

							})
					.error(
							function(data) {

								$scope.errorSpin = false;
								$scope.error = {
									happened : true,
									msg : 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.'
								};

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
	exports.RepaymentController = RepaymentController;
});
