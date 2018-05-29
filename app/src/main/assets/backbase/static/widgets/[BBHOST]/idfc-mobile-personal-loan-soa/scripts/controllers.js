define(function(require, exports, module) {
	'use strict';

	//var $ = require('jquery');
	var idfccommon = require('idfccommon').idfcConstants;
	var fileSaver = require('fileSaver');
	var idfcHanlder = require('idfcerror');
		
	function PLAccountStmt($scope, $http, lpCoreUtils, lpWidget, lpPortal,
			lpCoreBus, $window, $timeout, $q, $anchorScroll, deviceDetector) {

		
		var plSoaCtrl = this;
		plSoaCtrl.isMobileDevice = false;

		plSoaCtrl.detail = {};
		plSoaCtrl.limit = 10;
		plSoaCtrl.limit_Count = 0;
		plSoaCtrl.filteredList = [];
		plSoaCtrl.flag = false;
		plSoaCtrl.flagCount = 0;
		plSoaCtrl.date = new Date();
		plSoaCtrl.minDisbursementDate = new Date();
		plSoaCtrl.errorSpin = false;
		plSoaCtrl.pdfError = false;
		plSoaCtrl.showMore = false;
		plSoaCtrl.showBtnGroup = false;
		plSoaCtrl.showMoreCount = 0;
		plSoaCtrl.itemflag = null;
		var filteredListCount = 0;
		
		plSoaCtrl.redirectFrmLoanDtl = {
            isDirectedFrom : false,
            acctNb : ''
        };


		plSoaCtrl.persistFromDate = {};
		plSoaCtrl.persistToDate = {};
		/*plSoaCtrl.dates ={'fromDate':'','toDate':'', 'todaysDate':new Date('2020','02','01')};*/
		plSoaCtrl.dates ={'fromDate':'','toDate':'', 'todaysDate':new Date()};
				
		plSoaCtrl.transactionEmpty = true;
        plSoaCtrl.acctStsDtls = {};
        plSoaCtrl.tempAcctStmt = [];
        
        var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';

		plSoaCtrl.templates = {
			header : partialsDir + '/pl-soa-header.html',
			details : partialsDir + '/pl-soa-dtls.html',
			footer : partialsDir + '/pl-soa-footer.html'
		};
		
		plSoaCtrl.error = {
			happened : false,
			msg : ''
		};
        
        plSoaCtrl.success = {
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
	
		plSoaCtrl.monthArr  = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
		                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		plSoaCtrl.getMonth = function(month){
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

		
		plSoaCtrl.formatAmount = function(num){
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

		plSoaCtrl.formatDate = function(date) {
			var month = '';
			if(date.trim()!=''){
				
				if(date.indexOf('/')>-1){
					date = date.split('/');
					month = date[1]-1;
					
					return date[0]+'-'+plSoaCtrl.monthArr[month]+'-'+date[2];
				}else if(date.indexOf('-')>-1){
					date = date.split('-');
					month = plSoaCtrl.getMonth(date[1]);
					
				}
				
				return (new Date(date[2],month,date[0]));
			}
		};

		plSoaCtrl.initialization = function() {

            if(localStorage.getItem("origin")=="pl-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
            }

            //added for mobile for preventing dual login
                  idfcHanlder.validateSession($http);

			if('android'===deviceDetector.device || 'iphone'===deviceDetector.device
                         || 'windows-phone'===deviceDetector.device){
				plSoaCtrl.isMobileDevice = true;
			}

			plSoaCtrl.showBtnGroup = false;
			plSoaCtrl.pdfError = false;
			plSoaCtrl.errorSpin = true;
            plSoaCtrl.error = {
                                happened : false,
                                msg : ''

                            };
            
            plSoaCtrl.dates.fromDate = '';
			plSoaCtrl.dates.toDate = '';
            
            //to be set from loan account summary
            var loanAccount = localStorage.getItem('lnAccountNo');
            
            if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
                console.log('loanAccount:::::::'+loanAccount);
                localStorage.setItem('lnAccountNo' , '');
               // plSoaCtrl.getLoanStmtByAccNo(loanAccount, true, 0);

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
                                    plSoaCtrl.errorSpin = false;
                                        
                                                                        plSoaCtrl.names = [];// response;
					
                                    if (response.length > 0) {

					     //Uncomment below before moving to prod env
					     var date = response[0].serverDt;
					     var dateArray = date.split('/');
					     plSoaCtrl.dates.todaysDate = new Date(dateArray[2],dateArray[1]-1, dateArray[0]);

                                        for (var i = 0; i < response.length; i++) {
                                              if ('VANILLA_PP' === response[i].prdCd || 'VANILLA_NP' === response[i].prdCd) { 
                                                plSoaCtrl.names.push(response[i].acctNb);
											var actNb = response[i].acctNb;
											//To be used for PDF generation
											var nxtDueDt = response[i].nxtDueDt;
											nxtDueDt = plSoaCtrl.formatDate(nxtDueDt);
											
											plSoaCtrl.acctStsDtls['\"' + actNb + '\"'] = nxtDueDt;

											 

                                            }

                                        }
                                    }

                                    
									if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
										console.log('line 232'+loanAccount);
										
										plSoaCtrl.getLoanStmtByAccNo(loanAccount, true, 0);
									}
                                    else if( plSoaCtrl.names.length === 0){
                                        plSoaCtrl.error = {
                                            happened : true,
                                            msg : idfccommon.ERROR_NO_PL
                                        };
                                    }else if ( plSoaCtrl.names.length == 1) {
                                        
                                        plSoaCtrl.getLoanStmtByAccNo( plSoaCtrl.names[0], true,
                                                0);
                                    }
                    })
                    .error(
                                function(data) {

                                    plSoaCtrl.errorSpin = false;

                                    plSoaCtrl.error = {
                                        happened : true,
                                        msg : data.rsn
                                    };

                        });
            }

		};

		plSoaCtrl.checkTransactionsEmpty = function(value){
			if(value.length == 1){
				if(value[0].txnDt === ' ' || value[0].txnDt === ''){
					plSoaCtrl.transactionEmpty = true;
					return true;
				}
			}else{
				plSoaCtrl.transactionEmpty = false;
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

	     plSoaCtrl.getLoanStmtByAccNo = function(item, soaFlag, count) {
	        console.log('inside getLoanStmtByAccNo'+item+' '+soaFlag);
            plSoaCtrl.showBtnGroup = false;
            plSoaCtrl.pdfError = false;
            plSoaCtrl.namesGrid = [];
            plSoaCtrl.transactionEmpty = true;
            plSoaCtrl.limit = 10;
            plSoaCtrl.selectedName = item;

			
			 plSoaCtrl.dates.fromDate = '';
            plSoaCtrl.dates.toDate = '';
			plSoaCtrl.itemflag = item;
			if (count == 0)
				plSoaCtrl.showMore = true;
			else
				plSoaCtrl.showMore = false;

			
			plSoaCtrl.errorSpin = true;
            plSoaCtrl.error = {
                                happened : false,
                                msg : ''
                            };
			//===================================

			if (soaFlag) {
                console.log('calling soaa '+plSoaCtrl.selectedName);
				var loanAccountsUrl = lpCoreUtils
						.resolvePortalPlaceholders(lpWidget
								.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });
                
				var currentDate = plSoaCtrl.dates.todaysDate;
			                var threeMonthsEarlierDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-6, currentDate.getDate());;
			
                
				var postData = {
					'lnAcctNb' : plSoaCtrl.selectedName,
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

									plSoaCtrl.errorSpin = false;

									plSoaCtrl.namesGrid = response.getsoaTransactionDtls;
									plSoaCtrl.disbrsDt = response.getsoaDisbDtls[0].dsbrsDt1.trim();
                                    if(null!=plSoaCtrl.disbrsDt && ''!=plSoaCtrl.disbrsDt){
                                        	plSoaCtrl.disbrsDt = plSoaCtrl.formatDate(plSoaCtrl.disbrsDt);
                                    }
                                    
                                    
									if (!plSoaCtrl.checkTransactionsEmpty(plSoaCtrl.namesGrid)) {
										plSoaCtrl.namesGrid = getLastTenTransaction(plSoaCtrl.namesGrid);
										for (var i = 0; i < plSoaCtrl.namesGrid.length; i++) {
                                            plSoaCtrl.namesGrid[i].txnDt = plSoaCtrl.formatDate(plSoaCtrl.namesGrid[i].txnDt);
											plSoaCtrl.namesGrid[i].dbt = plSoaCtrl.formatAmount(plSoaCtrl.namesGrid[i].dbt);
											plSoaCtrl.namesGrid[i].crdt = plSoaCtrl.formatAmount(plSoaCtrl.namesGrid[i].crdt);
											plSoaCtrl.namesGrid[i].bal = plSoaCtrl.formatAmount(plSoaCtrl.namesGrid[i].bal);
										}

									}else {
										plSoaCtrl.error = {
                                            happened : true,
                                            //msg : idfccommon.ERROR_ACC_NULL_DATA_SIXMONTHS_MSG
                                            msg :'There is no transaction is the last six months'
                                        }
									}
									
									
									

                        })
						.error(
								function(data) {
									
									plSoaCtrl.errorSpin = false;
									plSoaCtrl.error = {
										happened : true,
										msg : data.rsn
									};

								});

			}

			//====================================

		};
        
        plSoaCtrl.filterAccounts = function() {
            
            plSoaCtrl.namesGrid=[];
			plSoaCtrl.transactionEmpty = true;			
            plSoaCtrl.errorSpin = true;
			plSoaCtrl.error = {
				happened : false,
				msg : ''
			};
			plSoaCtrl.success = {
				happened : false,
				msg : ''
			};
		    plSoaCtrl.pdfError = false;
            plSoaCtrl.limit=10; 
		         
			
			if((plSoaCtrl.selectedName ==null) || (plSoaCtrl.selectedName==''))
			{
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ACC_MSG
				};
				plSoaCtrl.errorSpin = false;
				

			} else if((null== plSoaCtrl.dates.fromDate || plSoaCtrl.dates.fromDate == '') && (null==plSoaCtrl.dates.toDate || plSoaCtrl.dates.toDate == '')){
                plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_BOTH_DATES_MSG
				};
				plSoaCtrl.errorSpin = false;
            } else if (null== plSoaCtrl.dates.fromDate || plSoaCtrl.dates.fromDate == '') {
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ST_DATE_MSG
				};
				plSoaCtrl.errorSpin = false;
				
            }else if (null== plSoaCtrl.dates.toDate || plSoaCtrl.dates.toDate == '') {
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_TO_DATE_MSG
				};
				plSoaCtrl.errorSpin = false;
				
			}else if( plSoaCtrl.dates.fromDate >  plSoaCtrl.dates.toDate){
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_DATE_COMPARE_TO_AND_FROM_MSG
				};
			   plSoaCtrl.errorSpin = false;	
		}
		else{
                
                plSoaCtrl.tempAcctStmt = plSoaCtrl.namesGrid;
                var frmDt = plSoaCtrl.dates.fromDate.getTime();
                var toDt = plSoaCtrl.dates.toDate.getTime();
                   
                var loanAccountsUrl = lpCoreUtils
						.resolvePortalPlaceholders(lpWidget
								.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });
                
		

								               
				var postData = {
					'lnAcctNb' : plSoaCtrl.selectedName,
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

																		
									plSoaCtrl.errorSpin = false;
									plSoaCtrl.namesGrid = [];
									plSoaCtrl.namesGrid = response.getsoaTransactionDtls;
                                                    		plSoaCtrl.showBtnGroup=true;
                                    
                                   				if (!plSoaCtrl.checkTransactionsEmpty(plSoaCtrl.namesGrid)) {
										plSoaCtrl.showBtnGroup = true;
										plSoaCtrl.showMore = false;
										for (var i = 0; i < plSoaCtrl.namesGrid.length; i++) {
                                            					plSoaCtrl.namesGrid[i].txnDt = plSoaCtrl.formatDate(plSoaCtrl.namesGrid[i].txnDt);
											plSoaCtrl.namesGrid[i].dbt = plSoaCtrl.formatAmount(plSoaCtrl.namesGrid[i].dbt);
											plSoaCtrl.namesGrid[i].crdt = plSoaCtrl.formatAmount(plSoaCtrl.namesGrid[i].crdt);
											plSoaCtrl.namesGrid[i].bal = plSoaCtrl.formatAmount(plSoaCtrl.namesGrid[i].bal);

										}

									}else {
									    console.log('No data');
										plSoaCtrl.error = {
                                            happened : true,
                                            msg : 'There is no statement in the given date range'
                                            //msg : idfccommon.ERROR_ACC_NULL_DATA_SEL_PERIOD_MSG
                                        }
									}

									
									
									

                        })
						.error(
								function(data) {
									
									plSoaCtrl.errorSpin = false;
									plSoaCtrl.error = {
										happened : true,
										msg: data.rsn
									};

                        });              
            }

		};

		

		plSoaCtrl.openFromDateCalendar = function($event) {
			
			$event.preventDefault();
			$event.stopPropagation();
			plSoaCtrl.persistFromDate.opened = true;
			plSoaCtrl.persistToDate.opened = false;

		};

		plSoaCtrl.fnBlur = function() {
			plSoaCtrl.isOpenDate1 = false;

		};

		plSoaCtrl.openToDateCalendar = function($event) {
			
			$event.preventDefault();
			$event.stopPropagation();
			plSoaCtrl.persistFromDate.opened = false;
			plSoaCtrl.persistToDate.opened = true;

		};

		

		plSoaCtrl.showMoreItems = function() {
			
			var increamented = plSoaCtrl.limit + 10;
			plSoaCtrl.limit = increamented > plSoaCtrl.namesGrid.length ? plSoaCtrl.namesGrid.length : increamented;

		};

		plSoaCtrl.pdfGeneration = function() {
			plSoaCtrl.pdfError = false;
			plSoaCtrl.success = {
				happened : false,
				msg : ''
			};	
			/*Start of code added for validating to and from dates*/
			if((null==plSoaCtrl.dates.fromDate || plSoaCtrl.dates.fromDate == '') && (null==plSoaCtrl.dates.toDate || plSoaCtrl.dates.toDate == '')){
                plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_BOTH_DATES_MSG
				};
            } else if (null==plSoaCtrl.dates.fromDate || plSoaCtrl.dates.fromDate == '') {
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ST_DATE_MSG
				};
				
                
            }else if (null==plSoaCtrl.dates.toDate || plSoaCtrl.dates.toDate == '') {
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_TO_DATE_MSG
				};
				
				
			}else if(plSoaCtrl.dates.fromDate >  plSoaCtrl.dates.toDate){
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_DATE_COMPARE_TO_AND_FROM_MSG
				};

			}/*End of code added for validating to and from dates*/
			else{
	            plSoaCtrl.errorSpin = true;
			$anchorScroll();
				plSoaCtrl.error = {
					happened : false,
					msg : ''
				};

				var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget
						.getPreference('getSOA'), {
	                                    servicesPath: lpPortal.root
	                                });
	            
				var currentDate = new Date();
				var postData = {
					'lnAcctNb' : plSoaCtrl.selectedName,
					'frmDT' : plSoaCtrl.dates.fromDate.getTime(),
					'toDt' : plSoaCtrl.dates.toDate.getTime(),
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

									plSoaCtrl.loanDetails = response;
									plSoaCtrl.pdfdatafromSOA = plSoaCtrl.loanDetails.getsoaMains;
									plSoaCtrl.actOpenDate=plSoaCtrl.pdfdatafromSOA.dsbrsDt;

									var pdfUrl = lpCoreUtils
											.resolvePortalPlaceholders(lpWidget
													.getPreference('generatePDFForSOA'), {
	                                                                    servicesPath: lpPortal.root
	                                                                });
									
                                    pdfUrl = pdfUrl+'?&emailFlag=' + false;



								
									var postDataForPdf = {
											'lnAcctNb' : plSoaCtrl.selectedName,
											'frmDT' : plSoaCtrl.dates.fromDate.getTime(),
											'toDt' : plSoaCtrl.dates.toDate.getTime(),
											'custNo' : plSoaCtrl.pdfdatafromSOA.custNb,
											'loanType' : plSoaCtrl.pdfdatafromSOA.prd,
											'frequency' : 'Monthly',
											'acctSts': plSoaCtrl.pdfdatafromSOA.acctSts ,
											'crncy': plSoaCtrl.pdfdatafromSOA.crncy ,
											'lnAcctOpnDt': plSoaCtrl.actOpenDate,
											'nextInstlmntDate': plSoaCtrl.acctStsDtls['\"'+plSoaCtrl.selectedName+'\"'],
											'LoanNo' : plSoaCtrl.selectedName,
											'loanCategory':'PERSONAL LOAN'
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
	                                                    				plSoaCtrl.errorSpin = false;
														try {
							var file = new Blob(
									[ response ],
									{
										type : 'application/pdf'
									});
							var filename = 'Personal Loan Statement for ' + plSoaCtrl.selectedName + '.pdf';
							fileSaver.saveAs(file, filename);
						} catch (e) {
						}

														

													})
											.error(
													function(response) {
	                                                    plSoaCtrl.errorSpin = false;
														if (response.cd == 'email01') {
															plSoaCtrl.noEmailRegistered = true;
															
														} else {
															plSoaCtrl.pdfError = true;
															plSoaCtrl.error = {
																happened : true,
																msg : idfccommon.ERROR_GEN_SOA
															};
														}
													});
					     })
						.error(
								function(data) {

									plSoaCtrl.errorSpin = false;
									plSoaCtrl.error = {
										happened : true,
										msg : idfccommon.ERROR_SORRY_MSG
									};

					    });
			}
		};

		
		plSoaCtrl.printPdf = function() {
			plSoaCtrl.pdfError = false;
			plSoaCtrl.success = {
				happened : false,
				msg : ''
			};
			/*Start of code added for validating to and from dates*/
			if((null==plSoaCtrl.dates.fromDate || plSoaCtrl.dates.fromDate == '') && (null==plSoaCtrl.dates.toDate || plSoaCtrl.dates.toDate == '')){
                plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_BOTH_DATES_MSG
				};
            } else if (null==plSoaCtrl.dates.fromDate || plSoaCtrl.dates.fromDate == '') {
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ST_DATE_MSG
				};
				
                
            }else if (null==plSoaCtrl.dates.toDate || plSoaCtrl.dates.toDate == '') {
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_TO_DATE_MSG
				};
				
				
			}else if(plSoaCtrl.dates.fromDate >  plSoaCtrl.dates.toDate){
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_DATE_COMPARE_TO_AND_FROM_MSG
				};

			}/*End of code added for validating to and from dates*/
			else{
				plSoaCtrl.error = {
						happened : false,
						msg : ''
					};
		            
		            plSoaCtrl.errorSpin = true;
					$anchorScroll();
					var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
		                                    servicesPath: lpPortal.root
		                                });
					var currentDate = new Date();
					var postData = {
						'lnAcctNb' : plSoaCtrl.selectedName,
						'frmDT' : plSoaCtrl.dates.fromDate.getTime(),
					    'toDt' : plSoaCtrl.dates.toDate.getTime(),
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
						
						plSoaCtrl.loanDetails = response;
						plSoaCtrl.pdfdatafromSOA = plSoaCtrl.loanDetails.getsoaMains;
						plSoaCtrl.actOpenDate=plSoaCtrl.pdfdatafromSOA.dsbrsDt;
						
						var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generatePDFForSOA'), {
		                                    servicesPath: lpPortal.root
		                                });

						pdfUrl = pdfUrl + '?&emailFlag=' + false;

						
						var postDataForPdf = {
								'lnAcctNb' : plSoaCtrl.selectedName,
								'frmDT' : plSoaCtrl.dates.fromDate.getTime(),
								'toDt' : plSoaCtrl.dates.toDate.getTime(),
								'custNo' : plSoaCtrl.pdfdatafromSOA.custNb,
								'loanType' : plSoaCtrl.pdfdatafromSOA.prd,
								'frequency' : 'Monthly',
								'acctSts': plSoaCtrl.pdfdatafromSOA.acctSts ,
								'crncy': plSoaCtrl.pdfdatafromSOA.crncy ,
								'lnAcctOpnDt': plSoaCtrl.actOpenDate,
								'nextInstlmntDate': plSoaCtrl.acctStsDtls['\"'+plSoaCtrl.selectedName+'\"'],
								'LoanNo' : plSoaCtrl.selectedName,
								'loanCategory':'PERSONAL LOAN'
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
									
							plSoaCtrl.errorSpin = false;
							try {

						if('ie'===deviceDetector.browser){
							var byteArray = new Uint8Array(response);
                					var blob = new Blob([byteArray], { type: 'application/octet-stream' });
							window.navigator.msSaveOrOpenBlob(blob, 'Personal Loan Statement for ' + plSoaCtrl.selectedName + '.pdf');
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
							plSoaCtrl.errorSpin = false;
							plSoaCtrl.pdfError = true;

		                    plSoaCtrl.error = {
		                                happened : true,
		                                msg :  idfccommon.ERROR_GEN_SOA

		                            };
		                    
						});
						
					})
					.error(function(data) {

		                    plSoaCtrl.errorSpin = false;
		                    plSoaCtrl.error = {
		                                happened : true,
		                                msg :  idfccommon.ERROR_SORRY_MSG

		                            };			

					});
				
			}	 
		};

		plSoaCtrl.emailAdvice = function() {
			plSoaCtrl.pdfError = false;
			plSoaCtrl.success = {
				happened : false,
				msg : ''
			};
			/*Start of code added for validating to and from dates*/
			if((null==plSoaCtrl.dates.fromDate || plSoaCtrl.dates.fromDate == '') && (null==plSoaCtrl.dates.toDate || plSoaCtrl.dates.toDate == '')){
                plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_BOTH_DATES_MSG
				};
            } else if (null==plSoaCtrl.dates.fromDate || plSoaCtrl.dates.fromDate == '') {
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_ST_DATE_MSG
				};
				
                
            }else if (null==plSoaCtrl.dates.toDate || plSoaCtrl.dates.toDate == '') {
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_MISSING_TO_DATE_MSG
				};
				
				
			}else if(plSoaCtrl.dates.fromDate >  plSoaCtrl.dates.toDate){
				plSoaCtrl.error = {
					happened : true,
					msg : idfccommon.ERROR_DATE_COMPARE_TO_AND_FROM_MSG
				};

			}/*End of code added for validating to and from dates*/
			else{
				plSoaCtrl.error = {
						happened : false,
						msg : ''
					};
		            
		            plSoaCtrl.errorSpin = true;
		            
		            
                    var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
                                        servicesPath: lpPortal.root
                                    });
                    var currentDate = new Date();
                    var postData = {
                        'lnAcctNb' : plSoaCtrl.selectedName,
                        'frmDT' : plSoaCtrl.dates.fromDate.getTime(),
					    'toDt' : plSoaCtrl.dates.toDate.getTime(),
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

		                    plSoaCtrl.loanDetails = response;
		                    plSoaCtrl.pdfdatafromSOA = plSoaCtrl.loanDetails.getsoaMains;
				      plSoaCtrl.actOpenDate=plSoaCtrl.pdfdatafromSOA.dsbrsDt;
;	

		                    var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('generatePDFForSOA'), {
		                                    servicesPath: lpPortal.root
		                                });
		                   	pdfUrl = pdfUrl+'?&emailFlag=' + true;
		                    
							var postDataForPdf = {
									'lnAcctNb' : plSoaCtrl.selectedName,
                                    'frmDT' : plSoaCtrl.dates.fromDate.getTime(),
                                    'toDt' : plSoaCtrl.dates.toDate.getTime(),
                                    'custNo' : plSoaCtrl.pdfdatafromSOA.custNb,
                                    'loanType' : plSoaCtrl.pdfdatafromSOA.prd,
                                    'frequency' : 'Monthly',
                                    'acctSts': plSoaCtrl.pdfdatafromSOA.acctSts ,
                                    'crncy': plSoaCtrl.pdfdatafromSOA.crncy ,
                                    'lnAcctOpnDt': plSoaCtrl.actOpenDate,
                                    'nextInstlmntDate': plSoaCtrl.acctStsDtls['\"'+plSoaCtrl.selectedName+'\"'],
                                    'LoanNo' : plSoaCtrl.selectedName,
					'loanCategory':'PERSONAL LOAN'
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
		                        plSoaCtrl.errorSpin = false;
		                        plSoaCtrl.emailSuccess = true;
		                        plSoaCtrl.success = {
		                                happened : true,
		                                msg : idfccommon.SUCCESS_EMAIL_MSG

		                            };
		                            //windows.scrollTo(0,500);
		                             //$location.hash("emailSuccessMsg");
                                     //$anchorScroll();

		                    }).error(function(response) {
		                        if(response.cd == 'email01'){
						plSoaCtrl.pdfError = true;

		                            plSoaCtrl.error = {
		                                happened : true,
		                                msg : idfccommon.ERROR_EMAIL_NOT_REGISTERED_MSG

		                            };
		                            
		                        }
		                        else {
						plSoaCtrl.pdfError = true;

		                            plSoaCtrl.error = {
		                                happened : true,
		                                msg : idfccommon.ERROR_SEND_SOA

		                            };

		                        } 
		                        plSoaCtrl.errorSpin = false;
					            $location.hash("emailSuccessMsg");
                                //$anchorScroll();
		                    });
		                  }).error(function(response) {
		                            plSoaCtrl.error = {
		                                    happened : true,
		                                    msg : idfccommon.ERROR_SORRY_MSG

		                                };
		                            plSoaCtrl.errorSpin = false;
						//$anchorScroll();
		                  });
		               
			}

		};

		//lpCoreBus.subscribe('launchpad-retail.openPersonalLoanSOA', function(data){
           gadgets.pubsub.subscribe('launchpad-retail.openPersonalLoanSOA', function(data){
			if(!angular.isUndefined(data) &&  null!=data && ''!=data){
				plSoaCtrl.selectedName = data;
				plSoaCtrl.redirectFrmLoanDtl.isDirectedFrom = true;
				plSoaCtrl.redirectFrmLoanDtl.acctNb = data;
				plSoaCtrl.initialization();
			}else{
				plSoaCtrl.initialization();

			}

		});

		gadgets.pubsub.subscribe("native.back", function() {
            console.log("native.back handled in pl soa");
                   gadgets.pubsub.publish("launchpad-retail.openPersonalLoanSummary");
                   gadgets.pubsub.publish("js.back", {
                           data: "ENABLE_HOME"
                   });
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            console.log("device back GoBackInitiate handled in pl soa");
            if(localStorage.getItem("navigationFlag")) {
                localStorage.clear();
                gadgets.pubsub.publish("launchpad-retail.openPersonalLoanSummary");
                gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                });
            }else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

		plSoaCtrl.initialization();
		/*//added for mobile
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if(localStorage.getItem("navigationFlag")) {
                console.log(evt.text);
                console.log("from "+ localStorage.getItem("origin"));
                if (localStorage.getItem("origin")=="pl_summary") {
                    console.log("inside if");
                    backToPLSummary();
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                    });
                }
                localStorage.clear();
            }else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });



        gadgets.pubsub.subscribe("native.back", function(evt) {
        console.log("native back");
            angular.forEach(document.getElementsByClassName("tooltip"), function(e) {
                e.style.display = 'none';
            })
           backToPLSummary();


        });
       var backToPLSummary = function() {
        console.log("backToPLSummary called");
            gadgets.pubsub.publish(
                "launchpad-retail.openPersonalLoanSummary");
        };*/
	}

	exports.PLAccountStmt = PLAccountStmt;

});