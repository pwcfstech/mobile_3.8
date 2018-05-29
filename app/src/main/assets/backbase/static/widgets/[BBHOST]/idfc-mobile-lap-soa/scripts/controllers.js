define(function(require, exports, module) {
	'use strict';

	var $ = require('jquery');
	var idfccommon = require('idfccommon').idfcConstants;
	var fileSaver = require('fileSaver');
	var idfcHanlder = require('idfcerror');
		
	function LAPAccountStmt($scope, $http, lpCoreUtils, lpWidget, lpPortal,
			lpCoreBus, $window, $timeout, $q, $anchorScroll, deviceDetector, $sce) {

		var lapSoaCtrl = this;
		lapSoaCtrl.isMobileDevice = false;

		lapSoaCtrl.detail = {};
		lapSoaCtrl.limit = 10;
		lapSoaCtrl.limit_Count = 0;
		lapSoaCtrl.filteredList = [];
		lapSoaCtrl.flag = false;
		lapSoaCtrl.flagCount = 0;
		lapSoaCtrl.date = new Date();
		lapSoaCtrl.minDisbursementDate = new Date();
		lapSoaCtrl.errorSpin = false;
		lapSoaCtrl.pdfError = false;
		lapSoaCtrl.showMore = false;
		lapSoaCtrl.showBtnGroup = false;
		lapSoaCtrl.showMoreCount = 0;
		lapSoaCtrl.itemflag = null;
		var filteredListCount = 0;
		
		lapSoaCtrl.redirectFrmLoanDtl = {
            isDirectedFrom : false,
            acctNb : ''
        };



		lapSoaCtrl.persistFromDate = {};
		lapSoaCtrl.persistToDate = {};
		//lapSoaCtrl.dates ={'fromDate':'','toDate':'', 'todaysDate':new Date('2020','02','01')};
		lapSoaCtrl.dates ={'fromDate':'','toDate':'', 'todaysDate':new Date()};
		
		
		lapSoaCtrl.transactionEmpty = true;
        	lapSoaCtrl.acctStsDtls = {};
        lapSoaCtrl.tempAcctStmt = [];
        
        var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';

		lapSoaCtrl.templates = {
			header : partialsDir + '/lap-soa-header.html',
			details : partialsDir + '/lap-soa-dtls.html',
			footer : partialsDir + '/lap-soa-footer.html'
		};
		
		lapSoaCtrl.error = {
			happened : false,
			msg : ''
		};
        
        lapSoaCtrl.success = {
                            happened : false,
                            msg : ''

                        };

		//Widget Refresh
		/*var deckPanelOpenHandler;
		deckPanelOpenHandler = function(activePanelName) {
			if (activePanelName == lpWidget.parentNode.model.name) {
				lpCoreBus.flush('DeckPanelOpen');
				lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
				lpWidget.refreshHTML(function(bresView) {
					lpWidget.parentNode = bresView.parentNode;
				});
			}
		};
		lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);*/

		

		var count = '';
	
		lapSoaCtrl.monthArr  = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
		                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		lapSoaCtrl.getMonth = function(month){
            switch(month){
                case 'Jan' :  return 0; break;
                case 'Feb' :  return 1; break;
                case 'Mar' :  return 2; break;
                case 'Apr' :  return 3; break;
                case 'May' :  return 4; break;
                case 'Jun' :  return 5; break;
                case 'Jul' :  return 6; break;
                case 'Aug' :  return 7; break;
                case 'Sep' :  return 8; break;
                case 'Oct' :  return 9; break;
                case 'Nov' :  return 10; break;
                case 'Dec' :  return 11; break;
            }
            
        };

		
		lapSoaCtrl.formatAmount = function(num){
			num=num.toString();
			var afterPoint = '';
			var beforePoint = '';
			var lastThree = '';
			var otherNumbers = '';
			if(num.indexOf('.') > 0){
				afterPoint = num.substring(num.indexOf('.'),num.length);  
		  	       beforePoint = num.substring(0,num.indexOf('.'));
			       lastThree = beforePoint.substring(beforePoint.length-3);
    				otherNumbers = beforePoint.substring(0,beforePoint.length-3);   
			}else{
				lastThree = num.substring(num.length-3);
    				otherNumbers = num.substring(0,num.length-3);
    
			}
			num=num.toString();
			if(otherNumbers != ''){
    				lastThree = ',' + lastThree;
			}
			var res = '';
			if(num.indexOf('.') > 0){
				res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree  + afterPoint;
			}else{
				res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + '.00';
			}
			return res;

		};

		lapSoaCtrl.formatDate = function(date) {
			var month = '';
			if(date.trim()!=''){
				if(date.indexOf('/')>-1){
					date = date.split('/');
					month = date[1]-1;
					return date[0]+'-'+lapSoaCtrl.monthArr[month]+'-'+date[2];
				}else if(date.indexOf('-')>-1){
					date = date.split('-');
					month = lapSoaCtrl.getMonth(date[1]);
				}
				
				return (new Date(date[2],month,date[0]));
			}
		};

		lapSoaCtrl.initialization = function() {
            console.log('pubsub');
            //added for mobile for preventing dual login
                  idfcHanlder.validateSession($http);
			if('android'===deviceDetector.device || 'iphone'===deviceDetector.device
                         || 'windows-phone'===deviceDetector.device){
				lapSoaCtrl.isMobileDevice = true;
			}

            if(localStorage.getItem("origin")=="lap-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
            }

			lapSoaCtrl.showBtnGroup = false;
			lapSoaCtrl.pdfError = false;
			

			lapSoaCtrl.errorSpin = true;
            lapSoaCtrl.error = {
                                happened : false,
                                msg : ''

                            };
            
            lapSoaCtrl.dates.fromDate = '';
			lapSoaCtrl.dates.toDate = '';
            
            ////to be set from loan account summary
            var loanAccount = localStorage.getItem('lnAccountNo');
            console.log('>>>>>>>>>>>>>>>>'+loanAccount);
            if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
                localStorage.setItem('lnAccountNo' , '');
                console.log('loanAccount '+loanAccount);
                //lapSoaCtrl.getLoanStmtByAccNo(loanAccount, true, 0);

           // }else{
            	var loanAccountsUrl = lpCoreUtils
                        .resolvePortalPlaceholders(lpWidget
                                .getPreference('getLoanAccountList'), {
                                        servicesPath: lpPortal.root
                                    });
              
		 loanAccountsUrl = loanAccountsUrl +'?typeOfLoan=PlLap';
               $http({
                    method : 'GET',
                    url : loanAccountsUrl,
                    headers : {
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/x-www-form-urlencoded;'
                    }

                })
                  .success(
                                function(response) {
								   
								   lapSoaCtrl.errorSpin = false;
                                    lapSoaCtrl.names = [];
                                    if (response.length > 0) {

					     //Uncomment below before moving to prod env
					     var date = response[0].serverDt;
					     var dateArray = date.split('/');
					     lapSoaCtrl.dates.todaysDate = new Date(dateArray[2],dateArray[1]-1, dateArray[0]);

                                        for (var i = 0; i < response.length; i++) {
                                              if (response[i].prdCd.indexOf('LAP')>=0 || 'LTL'===response[i].prdCd) { 
                                                lapSoaCtrl.names.push(response[i].acctNb);
												var actNb = response[i].acctNb;
											//To be used for PDF generation
											var nxtDueDt = response[i].nxtDueDt;
											nxtDueDt = lapSoaCtrl.formatDate(nxtDueDt);
											
											lapSoaCtrl.acctStsDtls['\"' + actNb + '\"'] = nxtDueDt;


                                            }

                                        }
                                    }

                                    console.log('called form pubsub 1 '+loanAccount);
					if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
					                    console.log('called form pubsub 2 '+loanAccount);
										lapSoaCtrl.getLoanStmtByAccNo(loanAccount, true, 0);
										//lapSoaCtrl.getLoanStmtByAccNo( lapSoaCtrl.selectedName, true, 0);
									}
                                   else if(lapSoaCtrl.names.length === 0){
                                        lapSoaCtrl.error = {
                                            happened : true,
                                            msg : idfccommon.ERROR_NO_LAP
                                        };
                                    }else if (lapSoaCtrl.names.length == 1) {
                                        lapSoaCtrl.getLoanStmtByAccNo(lapSoaCtrl.names[0], true,
                                                0);
                                    }
                    })
                    .error(
                                function(data) {

                                    lapSoaCtrl.errorSpin = false;

                                    lapSoaCtrl.error = {
                                        happened : true,
                                        msg : data.rsn
                                    };

                        });
            }

		};

		lapSoaCtrl.checkTransactionsEmpty = function(value){
			if(value.length == 1){
				if(value[0].txnDt === ' ' || value[0].txnDt === ''){
					lapSoaCtrl.transactionEmpty = true;
					return true;
				}
			}else{
				lapSoaCtrl.transactionEmpty = false;
				return false;
			}
		};

		var getLastTenTransaction = function(transactionList){
		  var lastTenTransaction = [];
                var beginIndex = 0;
                if(transactionList.length>10){
	         	beginIndex = transactionList.length-10;
		  }else{
			return transactionList;
		  }
		  for(var i = beginIndex; i < transactionList.length; i++){
			lastTenTransaction.push(transactionList[i]);
                }
	         return lastTenTransaction;
            };

		lapSoaCtrl.getLoanStmtByAccNo = function(item, soaFlag, count) {
		  console.log('getLoanStmtByAccNo>>>>>>'+item);
            lapSoaCtrl.showBtnGroup = false;
            lapSoaCtrl.pdfError = false;
            lapSoaCtrl.namesGrid = [];
            lapSoaCtrl.transactionEmpty = true;
            lapSoaCtrl.limit = 10;
            lapSoaCtrl.selectedName = item;

			 lapSoaCtrl.dates.fromDate = '';
            lapSoaCtrl.dates.toDate = '';
			lapSoaCtrl.itemflag = item;
			if (count == 0)
				lapSoaCtrl.showMore = true;
			else
				lapSoaCtrl.showMore = false;
			lapSoaCtrl.errorSpin = true;
            lapSoaCtrl.error = {
                                happened : false,
                                msg : ''
                            };
			//===================================

			if (soaFlag) {

				var loanAccountsUrl = lpCoreUtils
						.resolvePortalPlaceholders(lpWidget
								.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });
                
			
			var currentDate = lapSoaCtrl.dates.todaysDate;
			                var threeMonthsEarlierDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-6, currentDate.getDate());;
                
				var postData = {
					'lnAcctNb' : lapSoaCtrl.selectedName,
				    'frmDT' : threeMonthsEarlierDate.getTime(),
				    'toDt' :  currentDate.getTime()
				};
				postData = $.param(postData || {});

				$http({
					method : 'POST',
					url : loanAccountsUrl,
					data : postData,
					headers : {
						'Accept' : 'application/json',
						'Content-Type' : 'application/x-www-form-urlencoded;'
					}

				})
				.success(
								function(response) {
									lapSoaCtrl.errorSpin = false;

									lapSoaCtrl.namesGrid = response.getsoaTransactionDtls;
									
                                    lapSoaCtrl.disbrsDt = response.getsoaDisbDtls[0].dsbrsDt1.trim();
                                    if(null!=lapSoaCtrl.disbrsDt && ''!=lapSoaCtrl.disbrsDt){
                                    lapSoaCtrl.disbrsDt = lapSoaCtrl.formatDate(lapSoaCtrl.disbrsDt);
                                    }
                                    
                                    
									if (!lapSoaCtrl.checkTransactionsEmpty(lapSoaCtrl.namesGrid)) {
										lapSoaCtrl.namesGrid = getLastTenTransaction(lapSoaCtrl.namesGrid);
										for (var i = 0; i < lapSoaCtrl.namesGrid.length; i++) {
                                            					lapSoaCtrl.namesGrid[i].txnDt = lapSoaCtrl.formatDate(lapSoaCtrl.namesGrid[i].txnDt);
											lapSoaCtrl.namesGrid[i].dbt = lapSoaCtrl.formatAmount(lapSoaCtrl.namesGrid[i].dbt);
											lapSoaCtrl.namesGrid[i].crdt = lapSoaCtrl.formatAmount(lapSoaCtrl.namesGrid[i].crdt);
											lapSoaCtrl.namesGrid[i].bal = lapSoaCtrl.formatAmount(lapSoaCtrl.namesGrid[i].bal);
										}

									}else {
										lapSoaCtrl.error = {
                                            happened : true,
                                            //msg : idfccommon.ERROR_ACC_NULL_DATA_SIXMONTHS_MSG
                                            msg : 'There is no statement in last six months'
                                        }
									}
									
									
									

                        })
						.error(
								function(data) {
									
									lapSoaCtrl.errorSpin = false;
									lapSoaCtrl.error = {
										happened : true,
										msg : data.rsn
									};

								});

			}

			//====================================

		};
        
        lapSoaCtrl.filterAccounts = function() {
           
	     lapSoaCtrl.namesGrid=[];
	     lapSoaCtrl.transactionEmpty = true;			
            lapSoaCtrl.errorSpin = true;
			lapSoaCtrl.error = {
				happened : false,
				msg : ''
			};
			lapSoaCtrl.success = {
				happened : false,
				msg : ''
			};

		    lapSoaCtrl.pdfError = false;
            lapSoaCtrl.limit=10; 
		         
			
			if(( lapSoaCtrl.selectedName ==null) || ( lapSoaCtrl.selectedName==''))
			{
				
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ACC_MSG
				};
				lapSoaCtrl.errorSpin = false;
				

			} else if((null==lapSoaCtrl.dates.fromDate || lapSoaCtrl.dates.fromDate == '') && (null==lapSoaCtrl.dates.toDate || lapSoaCtrl.dates.toDate == '')){
                lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_BOTH_DATES_MSG
				};
				lapSoaCtrl.errorSpin = false;
            } else if (null==lapSoaCtrl.dates.fromDate || lapSoaCtrl.dates.fromDate == '') {
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ST_DATE_MSG
				};
				lapSoaCtrl.errorSpin = false;		
                
            }else if (null==lapSoaCtrl.dates.toDate || lapSoaCtrl.dates.toDate == '') {
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_TO_DATE_MSG
				};
				lapSoaCtrl.errorSpin = false;
				
			}else if(lapSoaCtrl.dates.fromDate >  lapSoaCtrl.dates.toDate){
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_DATE_COMPARE_TO_AND_FROM_MSG
				};
				lapSoaCtrl.errorSpin = false;
		}
		else{
                
                lapSoaCtrl.tempAcctStmt = lapSoaCtrl.namesGrid;
                
                
                var frmDt = lapSoaCtrl.dates.fromDate.getTime();
                var toDt = lapSoaCtrl.dates.toDate.getTime();
                
                
                
                var loanAccountsUrl = lpCoreUtils
						.resolvePortalPlaceholders(lpWidget
								.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });
                
		

								               
				var postData = {
					'lnAcctNb' : lapSoaCtrl.selectedName,
				    'frmDT' : frmDt,
				    'toDt' :  toDt
				};
				postData = $.param(postData || {});

				$http({
					method : 'POST',
					url : loanAccountsUrl,
					data : postData,
					headers : {
						'Accept' : 'application/json',
						'Content-Type' : 'application/x-www-form-urlencoded;'
					}

				})
				.success(
								function(response) {

																		
									lapSoaCtrl.errorSpin = false;
									lapSoaCtrl.namesGrid = [];
									lapSoaCtrl.namesGrid = response.getsoaTransactionDtls;
                                                    		lapSoaCtrl.showBtnGroup = true;
                                    
                                   				if (!lapSoaCtrl.checkTransactionsEmpty(lapSoaCtrl.namesGrid)) {
										lapSoaCtrl.showBtnGroup = true;
										lapSoaCtrl.showMore = false;
										for (var i = 0; i < lapSoaCtrl.namesGrid.length; i++) {
                                            					lapSoaCtrl.namesGrid[i].txnDt = lapSoaCtrl.formatDate(lapSoaCtrl.namesGrid[i].txnDt);
											lapSoaCtrl.namesGrid[i].dbt = lapSoaCtrl.formatAmount(lapSoaCtrl.namesGrid[i].dbt);
											lapSoaCtrl.namesGrid[i].crdt = lapSoaCtrl.formatAmount(lapSoaCtrl.namesGrid[i].crdt);
											lapSoaCtrl.namesGrid[i].bal = lapSoaCtrl.formatAmount(lapSoaCtrl.namesGrid[i].bal);

										}

									}else {
										lapSoaCtrl.error = {
                                            happened : true,
                                            //msg : idfccommon.ERROR_ACC_NULL_DATA_SEL_PERIOD_MSG
                                            msg : 'There is no statement in the given date range'
                                        }
									}

									
									
									

                        })
						.error(
								function(data) {
									
									lapSoaCtrl.errorSpin = false;
									lapSoaCtrl.error = {
										happened : true,
										msg: data.rsn
									};

                        });              
            }

		};

		
		lapSoaCtrl.openFromDateCalendar = function($event) {
			
			$event.preventDefault();
			$event.stopPropagation();
			lapSoaCtrl.persistFromDate.opened = true;
			lapSoaCtrl.persistToDate.opened = false;

		};

		lapSoaCtrl.fnBlur = function() {
			lapSoaCtrl.isOpenDate1 = false;

		};

		lapSoaCtrl.openToDateCalendar = function($event) {
			
			$event.preventDefault();
			$event.stopPropagation();
			lapSoaCtrl.persistFromDate.opened = false;
			lapSoaCtrl.persistToDate.opened = true;

		};

		

		lapSoaCtrl.showMoreItems = function() {
			
			var increamented = lapSoaCtrl.limit + 10;
			lapSoaCtrl.limit = increamented > lapSoaCtrl.namesGrid.length ? lapSoaCtrl.namesGrid.length : increamented;

		};

		lapSoaCtrl.pdfGeneration = function() {
			lapSoaCtrl.pdfError = false;	
			lapSoaCtrl.success = {
				happened : false,
				msg : ''
			};
			/*Start of code added for validating to and from dates*/
			if((null==lapSoaCtrl.dates.fromDate || lapSoaCtrl.dates.fromDate == '') && (null==lapSoaCtrl.dates.toDate || lapSoaCtrl.dates.toDate == '')){
                lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_BOTH_DATES_MSG
				};
            } else if (null==lapSoaCtrl.dates.fromDate || lapSoaCtrl.dates.fromDate == '') {
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ST_DATE_MSG
				};
				
                
            }else if (null==lapSoaCtrl.dates.toDate || lapSoaCtrl.dates.toDate == '') {
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_TO_DATE_MSG
				};
				
				
			}else if(lapSoaCtrl.dates.fromDate >  lapSoaCtrl.dates.toDate){
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_DATE_COMPARE_TO_AND_FROM_MSG
				};

			}/*End of code added for validating to and from dates*/
			else{
	            lapSoaCtrl.errorSpin = true;
			$anchorScroll();
				lapSoaCtrl.error = {
					happened : false,
					msg : ''
				};

				var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget
						.getPreference('getSOA'), {
	                                    servicesPath: lpPortal.root
	                                });
	            
				var currentDate = new Date();
				var postData = {
					'lnAcctNb' : lapSoaCtrl.selectedName,
					'frmDT' : lapSoaCtrl.dates.fromDate.getTime(),
					'toDt' : lapSoaCtrl.dates.toDate.getTime(),
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
								function(response) {

									lapSoaCtrl.loanDetails = response;
									lapSoaCtrl.pdfdatafromSOA = lapSoaCtrl.loanDetails.getsoaMains;
									lapSoaCtrl.actOpenDate=lapSoaCtrl.pdfdatafromSOA.dsbrsDt;
;

									var pdfUrl = lpCoreUtils
											.resolvePortalPlaceholders(lpWidget
													.getPreference('generatePDFForSOA'), {
	                                                                    servicesPath: lpPortal.root
	                                                                });
									
                                    pdfUrl = pdfUrl+'?&emailFlag=' + false;

									var postDataForPdf = {
											'lnAcctNb' : lapSoaCtrl.selectedName,
											'frmDT' : lapSoaCtrl.dates.fromDate.getTime(),
											'toDt' : lapSoaCtrl.dates.toDate.getTime(),
											'custNo' : lapSoaCtrl.pdfdatafromSOA.custNb,
											'loanType' : lapSoaCtrl.pdfdatafromSOA.prd,
											'frequency' : 'Monthly',
											'acctSts': lapSoaCtrl.pdfdatafromSOA.acctSts ,
											'crncy': lapSoaCtrl.pdfdatafromSOA.crncy ,
											'lnAcctOpnDt': lapSoaCtrl.actOpenDate,
											'nextInstlmntDate': lapSoaCtrl.acctStsDtls['\"'+ lapSoaCtrl.selectedName+'\"'],
											'LoanNo' : lapSoaCtrl.selectedName,
											'loanCategory':'LOAN AGAINST PROPERTY'
									};
									postDataForPdf = $.param(postDataForPdf || {});

									$http(
											{
												method : 'POST',
												url : pdfUrl,
												data : postDataForPdf,
												headers : {

													'Accept' : 'application/json',
													'Content-Type' : 'application/x-www-form-urlencoded;'
												},
												responseType : 'arraybuffer'
											})
											.success(
													function(response, status,
															headers, config) {
	                                                    				lapSoaCtrl.errorSpin = false;
														try {
							var file = new Blob(
									[ response ],
									{
										type : 'application/pdf'
									});
							var filename = 'Loan Against Property Statement for ' + lapSoaCtrl.selectedName + '.pdf';
							fileSaver.saveAs(file, filename);
						} catch (e) {
						}

														

													})
											.error(
													function(response) {
	                                                    lapSoaCtrl.errorSpin = false;
														if (response.cd == 'email01') {
															lapSoaCtrl.noEmailRegistered = true;
															
														} else {
															lapSoaCtrl.pdfError = true;
															lapSoaCtrl.error = {
																happened : true,
																msg : idfccommon.ERROR_GEN_SOA
															};
														}
													});
					     })
						.error(
								function(data) {

									lapSoaCtrl.errorSpin = false;
									lapSoaCtrl.error = {
										happened : true,
										msg : idfccommon.ERROR_SORRY_MSG
									};

					    });
			}
		};

		
		lapSoaCtrl.printPdf = function() {
			lapSoaCtrl.pdfError = false;
			lapSoaCtrl.success = {
				happened : false,
				msg : ''
			};
			/*Start of code added for validating to and from dates*/
			if((null==lapSoaCtrl.dates.fromDate || lapSoaCtrl.dates.fromDate == '') && (null==lapSoaCtrl.dates.toDate || lapSoaCtrl.dates.toDate == '')){
                lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_BOTH_DATES_MSG
				};
            } else if (null==lapSoaCtrl.dates.fromDate || lapSoaCtrl.dates.fromDate == '') {
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ST_DATE_MSG
				};
				
                
            }else if (null==lapSoaCtrl.dates.toDate || lapSoaCtrl.dates.toDate == '') {
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_TO_DATE_MSG
				};
				
				
			}else if(lapSoaCtrl.dates.fromDate >  lapSoaCtrl.dates.toDate){
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_DATE_COMPARE_TO_AND_FROM_MSG
				};

			}/*End of code added for validating to and from dates*/
			else{
				lapSoaCtrl.error = {
						happened : false,
						msg : ''
					};
		            
		            lapSoaCtrl.errorSpin = true;
					$anchorScroll();
					var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
		                                    servicesPath: lpPortal.root
		                                });
					var currentDate = new Date();
					var postData = {
						'lnAcctNb' : lapSoaCtrl.selectedName,
						'frmDT' : lapSoaCtrl.dates.fromDate.getTime(),
					    'toDt' : lapSoaCtrl.dates.toDate.getTime(),
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

					}).success(function(response){
						
						lapSoaCtrl.loanDetails = response;
						lapSoaCtrl.pdfdatafromSOA = lapSoaCtrl.loanDetails.getsoaMains;
						lapSoaCtrl.actOpenDate=lapSoaCtrl.pdfdatafromSOA.dsbrsDt;
;
						
						var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generatePDFForSOA'), {
		                                    servicesPath: lpPortal.root
		                                });

						pdfUrl = pdfUrl + '?&emailFlag=' + false;

						var postDataForPdf = {
								'lnAcctNb' : lapSoaCtrl.selectedName,
								'frmDT' : lapSoaCtrl.dates.fromDate.getTime(),
								'toDt' : lapSoaCtrl.dates.toDate.getTime(),
								'custNo' : lapSoaCtrl.pdfdatafromSOA.custNb,
								'loanType' : lapSoaCtrl.pdfdatafromSOA.prd,
								'frequency' : 'Monthly',
								'acctSts': lapSoaCtrl.pdfdatafromSOA.acctSts ,
								'crncy': lapSoaCtrl.pdfdatafromSOA.crncy ,
								'lnAcctOpnDt': lapSoaCtrl.actOpenDate,
								'nextInstlmntDate': lapSoaCtrl.acctStsDtls['\"'+ lapSoaCtrl.selectedName+'\"'],
								'LoanNo' : lapSoaCtrl.selectedName,
								'loanCategory':'LOAN AGAINST PROPERTY'
						};
											 
						
						
						postDataForPdf = $.param(postDataForPdf || {});
						
						$http({
									method : 'POST',
									url : pdfUrl,	
									data : postDataForPdf,
									headers : {

										'Accept' : 'application/json',
										'Content-Type' : 'application/x-www-form-urlencoded;'
									},
									responseType : 'arraybuffer'
						}).success(function(response, status,
												headers, config) {
									
							lapSoaCtrl.errorSpin = false;
							try {

						if('ie'===deviceDetector.browser){
							var byteArray = new Uint8Array(response);
                					var blob = new Blob([byteArray], { type: 'application/octet-stream' });
							window.navigator.msSaveOrOpenBlob(blob, 'Loan Against Property Statement for ' + lapSoaCtrl.selectedName + '.pdf');
						}else{


						var file = new Blob(
								[ response ],
								{
									type : 'application/pdf'
								});
						
						var fileURL = window.URL.createObjectURL(file);
						var wndw = window.open(fileURL);
						wndw.print();
						}
						
						
					} catch (e) {
					}


						}).error(function(response) {
							lapSoaCtrl.errorSpin = false;
							lapSoaCtrl.pdfError = true;

		                    lapSoaCtrl.error = {
		                                happened : true,
		                                msg :  idfccommon.ERROR_GEN_SOA

		                            };
		                    
						});
						
					})
					.error(function(data) {

		                    lapSoaCtrl.errorSpin = false;
		                    lapSoaCtrl.error = {
		                                happened : true,
		                                msg :  idfccommon.ERROR_SORRY_MSG

		                            };			

					});
				
			}	 
		};

		lapSoaCtrl.emailAdvice = function() {
			lapSoaCtrl.pdfError = false;
			lapSoaCtrl.success = {
				happened : false,
				msg : ''
			};
			/*Start of code added for validating to and from dates*/
			if((null==lapSoaCtrl.dates.fromDate || lapSoaCtrl.dates.fromDate == '') && (null==lapSoaCtrl.dates.toDate || lapSoaCtrl.dates.toDate == '')){
                lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_BOTH_DATES_MSG
				};
            } else if (null==lapSoaCtrl.dates.fromDate || lapSoaCtrl.dates.fromDate == '') {
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ST_DATE_MSG
				};
				
                
            }else if (null==lapSoaCtrl.dates.toDate || lapSoaCtrl.dates.toDate == '') {
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_TO_DATE_MSG
				};
				
				
			}else if(lapSoaCtrl.dates.fromDate >  lapSoaCtrl.dates.toDate){
				lapSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_DATE_COMPARE_TO_AND_FROM_MSG
				};

			}/*End of code added for validating to and from dates*/
			else{
				lapSoaCtrl.error = {
						happened : false,
						msg : ''
					};
		            
		            lapSoaCtrl.errorSpin = true;
		            
		            
                    var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
                                        servicesPath: lpPortal.root
                                    });
                    var currentDate = new Date();
                    var postData = {
                        'lnAcctNb' : lapSoaCtrl.selectedName,
                        'frmDT' : lapSoaCtrl.dates.fromDate.getTime(),
					    'toDt' : lapSoaCtrl.dates.toDate.getTime(),
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

                    }).success(function(response){

		                    lapSoaCtrl.loanDetails = response;
		                    lapSoaCtrl.pdfdatafromSOA = lapSoaCtrl.loanDetails.getsoaMains;
				      lapSoaCtrl.actOpenDate=lapSoaCtrl.pdfdatafromSOA.dsbrsDt;
;	

		                    var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generatePDFForSOA'), {
		                                    servicesPath: lpPortal.root
		                                });
		                   	pdfUrl = pdfUrl+'?&emailFlag=' + true;

							var postDataForPdf = {
									'lnAcctNb' : lapSoaCtrl.selectedName,
                                    'frmDT' : lapSoaCtrl.dates.fromDate.getTime(),
                                    'toDt' : lapSoaCtrl.dates.toDate.getTime(),
                                    'custNo' : lapSoaCtrl.pdfdatafromSOA.custNb,
                                    'loanType' : lapSoaCtrl.pdfdatafromSOA.prd,
                                    'frequency' : 'Monthly',
                                    'acctSts': lapSoaCtrl.pdfdatafromSOA.acctSts ,
                                    'crncy': lapSoaCtrl.pdfdatafromSOA.crncy ,
                                    'lnAcctOpnDt': lapSoaCtrl.actOpenDate,
                                    'nextInstlmntDate': lapSoaCtrl.acctStsDtls['\"'+ lapSoaCtrl.selectedName+'\"'],
                                    'LoanNo' : lapSoaCtrl.selectedName,
				    'loanCategory':'LOAN AGAINST PROPERTY'
							};


		                    postDataForPdf = $.param(postDataForPdf || {});

		                    $http({
		                                method : 'POST',
		                                url : pdfUrl,	
		                                data : postDataForPdf,
		                                headers : {

		                                    'Accept' : 'application/json',
		                                    'Content-Type' : 'application/x-www-form-urlencoded;'
		                                }

		                    }).success(function(response, status,
		                                            headers, config) {
		                        lapSoaCtrl.errorSpin = false;
		                        lapSoaCtrl.emailSuccess = true;
		                        lapSoaCtrl.success = {
		                                happened : true,
		                                msg : idfccommon.SUCCESS_EMAIL_MSG

		                            };
		                       /* $location.hash("emailSuccessMsg");
                                $anchorScroll();*/
                               /* var emailMsgId=document.getElementById('emailSuccessMsg');
                                emailMsgId.scrollTop = emailMsgId.scrollHeight;
                                //$(element).scrollTop($(element)[0].scrollHeight);*/

		                    }).error(function(response) {
		                        if(response.cd == 'email01'){
						        lapSoaCtrl.pdfError = true;

		                            lapSoaCtrl.error = {
		                                happened : true,
		                                msg : idfccommon.ERROR_EMAIL_NOT_REGISTERED_MSG

		                            };
		                            
		                        }
		                        else {
						lapSoaCtrl.pdfError = true;

		                            lapSoaCtrl.error = {
		                                happened : true,
		                                msg : idfccommon.ERROR_SEND_SOA

		                            };

		                        } 
		                        lapSoaCtrl.errorSpin = false;
		                        /* $location.hash("emailSuccessMsg");
                                 $anchorScroll();*/

		                    });
		                  }).error(function(response) {
		                            lapSoaCtrl.error = {
		                                    happened : true,
		                                    msg : idfccommon.ERROR_SORRY_MSG

		                                };
		                            lapSoaCtrl.errorSpin = false;
						           // $anchorScroll();

		                  });
		               
			}

		};

		//lpCoreBus.subscribe('launchpad-retail.openLAPSOA', function(data){
          gadgets.pubsub.subscribe('launchpad-retail.openLAPSOA', function(data){
           console.log('Inside subscribe launchpad-retail.openLAPSOA');
			if(!angular.isUndefined(data) &&  null!=data && ''!=data){
				lapSoaCtrl.selectedName = data;
				lapSoaCtrl.redirectFrmLoanDtl.isDirectedFrom = true;
				lapSoaCtrl.redirectFrmLoanDtl.acctNb = data;
				lapSoaCtrl.initialization();
			}else{
				lapSoaCtrl.initialization();

			}

		});
		
		//commenting as it will be called from summary
		lapSoaCtrl.initialization();
		
		gadgets.pubsub.subscribe("native.back", function() {
            console.log("native.back handled in lap soa");
                   gadgets.pubsub.publish("launchpad-retail.openLAPSummary");
                   gadgets.pubsub.publish("js.back", {
                           data: "ENABLE_HOME"
                   });
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            console.log("device back GoBackInitiate handled in lap soa");
            if(localStorage.getItem("navigationFlag")) {
                localStorage.clear();
                gadgets.pubsub.publish("launchpad-retail.openLAPSummary");
                gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                });
            }else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

	}

	exports.LAPAccountStmt = LAPAccountStmt;

});
