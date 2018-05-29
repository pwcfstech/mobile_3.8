define(function(require, exports) {
	'use strict';
	
	var fileSaver = require('fileSaver');	
	var idfccommon = require('idfccommon').idfcConstants;
	var idfcHanlder = require('idfcerror');

	function PLRepaymentScheduleCtrl($scope, $http, i18nUtils, lpCoreUtils, lpWidget,
			$window, lpPortal, lpCoreBus, $q, $anchorScroll, $filter, $sce, deviceDetector , $document) {
			
		var plRsCtrl = this;
		plRsCtrl.isMobileDevice = false;


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

		plRsCtrl.errorSpin = true;
        	plRsCtrl.isEmailRegistered = false;
				
		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
		
		plRsCtrl.templates = {
            		header: partialsDir + '/pl-repayment-schedule-header.html',
			details: partialsDir + '/pl-repayment-schedule-dtls.html',
			footer: partialsDir + '/pl-repayment-schedule-footer.html'
        };
		
		plRsCtrl.error = {
							msg : ''
						};
				
		
		plRsCtrl.today = '';
		plRsCtrl.currentDt = '';
        
        plRsCtrl.redirectFrmLoanDtl = {
            isDirectedFrom : false,
            acctNb : ''
        };
		
		var formatAmount = function(num){
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
				res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree  + afterPoint;
			}else{
				res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + '.00';
			}
			return res;

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
		
		plRsCtrl.limit = 10;
		
		plRsCtrl.showMore = function() {
		      var increamented = plRsCtrl.limit + 10;
		      plRsCtrl.limit = (increamented > plRsCtrl.detail.length) ? plRsCtrl.detail.length : increamented;
		      
		};
		
		plRsCtrl.getLoanDetailsByAccNo = function(val) {
			plRsCtrl.emailSuccess = false;
			plRsCtrl.emailFail = false;
			plRsCtrl.noEmailRegistered = false;
			plRsCtrl.noTransactionError = false;
			plRsCtrl.noLoanAccounts = false;
			plRsCtrl.noPendingLoans=false;
			plRsCtrl.serviceError = false;			
			plRsCtrl.error.msg = '';

			plRsCtrl.limit = 10;
			plRsCtrl.selectedAccountNumber = val;
			plRsCtrl.error = {
                    happened: false,
                    msg: ''
                };
			
			plRsCtrl.detail = [];
			
			if(null===plRsCtrl.selectedAccountNumber || plRsCtrl.selectedAccountNumber === ''
				|| angular.isUndefined(plRsCtrl.selectedAccountNumber)){
			    plRsCtrl.showLoanPaymentSchedules=false;
				plRsCtrl.selectAccErr = false;
				
			}else{
				plRsCtrl.showLoanPaymentSchedules=true;

				var getloanRepaymentSchedule = lpCoreUtils
						.resolvePortalPlaceholders(lpWidget
								.getPreference('loanRepaymentDetails'), {
                                    servicesPath: lpPortal.root
                                });
				

				var postData = {
					'loanAccountNumber' : plRsCtrl.selectedAccountNumber,
				};
				
				plRsCtrl.errorSpin = true;
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
							
							plRsCtrl.serviceError = false;							
							plRsCtrl.noTransactionError=false;
							plRsCtrl.repaymentDtl = data;
							
							if(!checkTransactionsEmpty(plRsCtrl.repaymentDtl)){
								lpCoreUtils.forEach(plRsCtrl.repaymentDtl, function(list) {
									//code to split the date string and convert it into Date format
									var arrStartDate = list.instDueDate.split('/');
									plRsCtrl.today = list.serverDt;
                                    				plRsCtrl.currentDt = new Date(
											plRsCtrl.today.split('/')[2], plRsCtrl.today.split('/')[1]-1, plRsCtrl.today.split('/')[0]);

									list.instDueDate = new Date(
											arrStartDate[2],
											arrStartDate[1] - 1,
											arrStartDate[0]);

									list.openBal = formatAmount(list.openBal);
									list.totAmt = formatAmount(list.totAmt);
									list.prinAmt = formatAmount(list.prinAmt);
									list.intAmt = formatAmount(list.intAmt);
									list.closeBal = formatAmount(list.closeBal);
									
									//select dates whicha are greater than or
									//equal to today, today will come from 
									//service layer as serverDt 									
									if((list.instDueDate.getTime()) >= (plRsCtrl.currentDt.getTime())){
										plRsCtrl.detail.push(list);//list with installment due date in date format
									}
									
									
								});
								
								//No more loans left to be repayed by customer
								if(0===plRsCtrl.detail.length){
									plRsCtrl.noPendingLoans=true;
								}
								
								
							}else{								
								plRsCtrl.noTransactionError=true;
							}
							plRsCtrl.errorSpin = false;
							
						})
				.error(
						function(data) {
							plRsCtrl.errorSpin = false;
							plRsCtrl.error.msg = data.rsn;
							plRsCtrl.serviceError = true;
						});
				
				
				localStorage.setItem('lnAccountNo' , '');//Clearing LocalStorage
			}
		
		};
		
		var getLoanAccList = function() {		
			plRsCtrl.loanAccountNumbers = [];

			plRsCtrl.emailSuccess = false;
			plRsCtrl.emailFail = false;
			plRsCtrl.noEmailRegistered = false;
			plRsCtrl.noTransactionError = false;
			plRsCtrl.noLoanAccounts = false;
			plRsCtrl.noPendingLoans=false;
			plRsCtrl.serviceError = false;			
			plRsCtrl.error.msg = '';
			
			var loanAccountsUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
				.getPreference('getLoanAccountList'), {
				servicesPath: lpPortal.root
			});
			
			plRsCtrl.errorSpin = true;
			
			loanAccountsUrl = loanAccountsUrl + '?typeOfLoan=PlLap';
			$http({
				method: 'GET',
				url: loanAccountsUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			}).success(function(response){
			    plRsCtrl.errorSpin = false;
			    //response.push();
			    
				if(response.length>0){
					plRsCtrl.loanAccExist = true;
					
					lpCoreUtils.forEach(response, function(list) {
						//commenting Live for dummy test
						//if(('L'===list.acctSts) && ('VANILLA_NP'===list.prdCd || 'VANILLA_PP'===list.prdCd)){ /*old 3.7 codes below 3.8 added*/
						if(('L'===list.acctSts) && ('VANILLA_NP'===list.prdCd || 'VANILLA_PP'===list.prdCd
                        							|| 'DIGITAL_PL'===list.prdCd
                        							|| 'IDFCNXT_NP'===list.prdCd
                        							|| 'IDFCNXT_PP'===list.prdCd
                        							|| 'VANILLA_PL_NPP'===list.prdCd
                        							|| 'VANILLA_PL_PP'===list.prdCd
                        						)){
							plRsCtrl.loanAccountNumbers.push(list.acctNb) ;				 
						}
						
					});
					//to display the first value as default selected value (ng-selected =$first as an alternative)
                   if(!angular.isUndefined(plRsCtrl.selectedAccountNumber) && plRsCtrl.selectedAccountNumber!='' && plRsCtrl.selectedAccountNumber!=null){
                        // plRsCtrl.selectedAccountNumber = plRsCtrl.redirectFrmLoanDtl.acctNb;
                        console.log('>>>>'+plRsCtrl.selectedAccountNumber);
                        plRsCtrl.getLoanDetailsByAccNo(plRsCtrl.selectedAccountNumber);
                        localStorage.setItem('lnAccountNo' , '');
                    }
					else if (plRsCtrl.loanAccountNumbers.length === 1) {
						plRsCtrl.selectedAccountNumber = plRsCtrl.loanAccountNumbers[0];
						plRsCtrl.getLoanDetailsByAccNo(plRsCtrl.selectedAccountNumber);
					} else if(plRsCtrl.loanAccountNumbers.length === 0){
						plRsCtrl.loanAccExist = false;					
						plRsCtrl.noLoanAccounts = true;
						
					}
					
					
				}else{
					plRsCtrl.loanAccExist = false;					
					plRsCtrl.noLoanAccounts = true;
				}
			})
			.error(function(data){
				plRsCtrl.errorSpin = false;
				plRsCtrl.error.msg = data.rsn;
				plRsCtrl.serviceError = true;
				
			});
		
		};
		
		var initialize = function(){
			if('android'===deviceDetector.device || 'iphone'===deviceDetector.device
                         || 'windows-phone'===deviceDetector.device){
				plRsCtrl.isMobileDevice = true;
			}

			if(localStorage.getItem("origin")=="pl-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
            }

			
			plRsCtrl.errorSpin = true;
			plRsCtrl.limit = 10;
			
			//to be set from loan account summary
			var loanAccount = localStorage.getItem('lnAccountNo');
			console.log('Local storage '+loanAccount);
            if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
                /* added for mobile 2.5 enhancement to open from lap summary */
                plRsCtrl.selectedAccountNumber = loanAccount;
                getLoanAccList();

            }else{
            	
            	getLoanAccList();
            }
				

		
		};
		
		plRsCtrl.emailAdvice = function(){
			
			plRsCtrl.emailSuccess = false;
			plRsCtrl.emailFail = false;
			plRsCtrl.noEmailRegistered = false;
			plRsCtrl.noTransactionError = false;
			plRsCtrl.noLoanAccounts = false;
			plRsCtrl.noPendingLoans=false;
			plRsCtrl.serviceError = false;			
			plRsCtrl.error.msg = '';
			
			plRsCtrl.errorSpin = true;
            
            
		
                var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });

                

                var postData = {
                    'lnAcctNb' : plRsCtrl.selectedAccountNumber,
                    'frmDT' : plRsCtrl.currentDt.getTime(),
                    'toDt' : plRsCtrl.currentDt.getTime()
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

                    plRsCtrl.loanDetails = response;
                    plRsCtrl.pdfdatafromSOA = plRsCtrl.loanDetails.getsoaMains;

                    
                    var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentSchPdfSrc'), {
                                    servicesPath: lpPortal.root
                                });
                    
			pdfUrl = pdfUrl + '?&emailFlag=' + true;

			
				
								var toDate = [];
				toDate = plRsCtrl.repaymentDtl[1].instlmntEndDt.split('/');
				var endDate = new Date(toDate[2], toDate[1]-1, toDate[0]);
				var lnAcctOpnDt = '';
                		if(plRsCtrl.detail[1].dsbrsmntDt!=' ' && plRsCtrl.detail[1].dsbrsmntDt!=''){
                   		   var year = plRsCtrl.detail[1].dsbrsmntDt.split('/')[2];
                               var month = plRsCtrl.detail[1].dsbrsmntDt.split('/')[1]-1;
                               var day = plRsCtrl.detail[1].dsbrsmntDt.split('/')[0];
                    
                    		    lnAcctOpnDt = new Date(year, month, day);
				    lnAcctOpnDt = $filter('date')(lnAcctOpnDt, 'dd-MMM-yyyy');

                             }
                   

				var postDataForPdf = {
								'custName': plRsCtrl.repaymentDtl[1].custNm,
                                        			'disbursementAmt' : plRsCtrl.detail[1].dsbrsmntAmt,
                                        			'loanType' :  plRsCtrl.repaymentDtl[1].prdct,
								'rateOfInterest':  plRsCtrl.repaymentDtl[1].crntIntstRt,                                   
								'tenure' : plRsCtrl.detail[1].tnr,
								'frequency' : 'Monthly',
								'LoanNo' : plRsCtrl.selectedAccountNumber,
								'coApplcntNm' : plRsCtrl.repaymentDtl[1].coApplcntNm,
								'interestType' : plRsCtrl.pdfdatafromSOA.intrstTyp,										
							       'frmDT' : plRsCtrl.currentDt.getTime(),
								'toDt' : endDate.getTime(),
								'custNo' : plRsCtrl.pdfdatafromSOA.custNb,
								'lnAcctOpnDt': lnAcctOpnDt,
								'acctSts':plRsCtrl.detail[1].acctSts,
								'crncy': plRsCtrl.repaymentDtl[1].crncy,
								'loanCategory':'PERSONAL LOAN',
								'adr':plRsCtrl.repaymentDtl[1].adrs			
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

                        plRsCtrl.emailSuccess = true;
                        plRsCtrl.errorSpin = false;
                         $location.hash("emailSuccessMsg");
                         //$anchorScroll();

                    }).error(function(response) {
                                    if(response.cd == 'email01'){
                                        plRsCtrl.noEmailRegistered = true;

                                    }
                                    else{
                                        
                                        plRsCtrl.emailFail = true;
                                    }
                                    plRsCtrl.errorSpin = false;
					  /*$location.hash("emailSuccessMsg");
                      $anchorScroll();*/
                    });
                })
                .error(function(data) {

                    plRsCtrl.errorSpin = false;
		      //$anchorScroll();
                    plRsCtrl.serviceError = true;
                    plRsCtrl.error.msg = idfccommon.ERROR_SORRY_MSG;


                });
			
		};
		
		
		plRsCtrl.pdfGeneration = function(){	
			plRsCtrl.emailSuccess = false;
			plRsCtrl.emailFail = false;
			plRsCtrl.noEmailRegistered = false;
			plRsCtrl.noTransactionError = false;
			plRsCtrl.noLoanAccounts = false;
			plRsCtrl.noPendingLoans=false;
			plRsCtrl.serviceError = false;			
			plRsCtrl.error.msg = '';
            
           		 plRsCtrl.errorSpin = true;
			$anchorScroll();
			var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });
			var postData = {
				'lnAcctNb' : plRsCtrl.selectedAccountNumber,
				'frmDT' : plRsCtrl.currentDt.getTime(),
				'toDt' : plRsCtrl.currentDt.getTime()
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
				
								
				plRsCtrl.loanDetails = response;
				plRsCtrl.pdfdatafromSOA = plRsCtrl.loanDetails.getsoaMains;
				
								
				var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentSchPdfSrc'), {
                                    servicesPath: lpPortal.root
                                });
				pdfUrl = pdfUrl + '?&emailFlag=' + false;
				
				
				
				
				var toDate = [];
				toDate = plRsCtrl.repaymentDtl[1].instlmntEndDt.split('/');
				var endDate = new Date(toDate[2], toDate[1]-1, toDate[0]);
				
				var lnAcctOpnDt = '';
                		if(plRsCtrl.detail[1].dsbrsmntDt!=' ' && plRsCtrl.detail[1].dsbrsmntDt!=''){
                   		   var year = plRsCtrl.detail[1].dsbrsmntDt.split('/')[2];
                               var month = plRsCtrl.detail[1].dsbrsmntDt.split('/')[1]-1;
                               var day = plRsCtrl.detail[1].dsbrsmntDt.split('/')[0];
                    
                    		    lnAcctOpnDt = new Date(year, month, day);
				    lnAcctOpnDt = $filter('date')(lnAcctOpnDt, 'dd-MMM-yyyy');

                             }		
								
				var postDataForPdf = {
								'custName': plRsCtrl.repaymentDtl[1].custNm,
                                        			'disbursementAmt' : plRsCtrl.detail[1].dsbrsmntAmt,
                                        			'loanType' :  plRsCtrl.repaymentDtl[1].prdct,
								'rateOfInterest':  plRsCtrl.repaymentDtl[1].crntIntstRt,                                   
								'tenure' : plRsCtrl.detail[1].tnr,
								'frequency' : 'Monthly',
								'LoanNo' : plRsCtrl.selectedAccountNumber,
								'coApplcntNm' : plRsCtrl.repaymentDtl[1].coApplcntNm,
								'interestType' : plRsCtrl.pdfdatafromSOA.intrstTyp,										
							       'frmDT' : plRsCtrl.currentDt.getTime(),
								'toDt' : endDate.getTime(),
								'custNo' : plRsCtrl.pdfdatafromSOA.custNb,
								'lnAcctOpnDt': lnAcctOpnDt,
								'acctSts':plRsCtrl.detail[1].acctSts,
								'crncy': plRsCtrl.repaymentDtl[1].crncy,
								'loanCategory':'PERSONAL LOAN',
								'adr':plRsCtrl.repaymentDtl[1].adrs				
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
							
					
					plRsCtrl.errorSpin = false;
					try {
						var file = new Blob(
								[ response ],
								{
									type : 'application/pdf'
								});
						var filename = 'Personal Loan Repayment Schedule for ' + plRsCtrl.selectedAccountNumber + '.pdf';
						fileSaver.saveAs(file, filename);
					} catch (e) {
						
					}

				}).error(function(response) {
						if(response.cd == 'email01'){
							plRsCtrl.noEmailRegistered = true;
						
						}
						else{
							plRsCtrl.error.msg = idfccommon.ERROR_SEND_RS;
							plRsCtrl.serviceError = true;
			                
						}
						plRsCtrl.errorSpin = false;
					});	
			})			
			.error(function(data) {				
				plRsCtrl.error.msg = idfccommon.ERROR_SORRY_MSG;
				plRsCtrl.serviceError = true;
				plRsCtrl.errorSpin = false;

			});
		
		};	
		
		plRsCtrl.printPdf = function(){
			plRsCtrl.emailSuccess = false;
			plRsCtrl.emailFail = false;
			plRsCtrl.noEmailRegistered = false;
			plRsCtrl.noTransactionError = false;
			plRsCtrl.noLoanAccounts = false;
			plRsCtrl.noPendingLoans=false;
			plRsCtrl.serviceError = false;			
			plRsCtrl.error.msg = '';
			plRsCtrl.errorSpin = true;
			$anchorScroll();

			var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });
			
			
			var postData = {
				'lnAcctNb' : plRsCtrl.selectedAccountNumber,
				'frmDT' : plRsCtrl.currentDt.getTime(),
				'toDt' : plRsCtrl.currentDt.getTime()
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
				
				plRsCtrl.loanDetails = response;
				plRsCtrl.pdfdatafromSOA = plRsCtrl.loanDetails.getsoaMains;
								
				var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentSchPdfSrc'), {
                                    servicesPath: lpPortal.root
                                });
				
				pdfUrl = pdfUrl + '?&emailFlag=' + false;

				
				
				var toDate = [];
				toDate = plRsCtrl.repaymentDtl[1].instlmntEndDt.split('/');
				var endDate = new Date(toDate[2], toDate[1]-1, toDate[0]);
				var lnAcctOpnDt = '';
                		if(plRsCtrl.detail[1].dsbrsmntDt!=' ' && plRsCtrl.detail[1].dsbrsmntDt!=''){
                   		   var year = plRsCtrl.detail[1].dsbrsmntDt.split('/')[2];
                               var month = plRsCtrl.detail[1].dsbrsmntDt.split('/')[1]-1;
                               var day = plRsCtrl.detail[1].dsbrsmntDt.split('/')[0];
                    
                    		    lnAcctOpnDt = new Date(year, month, day);
				    lnAcctOpnDt = $filter('date')(lnAcctOpnDt, 'dd-MMM-yyyy');
                             }	
				
				var postDataForPdf = {
								'custName': plRsCtrl.repaymentDtl[1].custNm,
                                        			'disbursementAmt' : plRsCtrl.detail[1].dsbrsmntAmt,
                                        			'loanType' :  plRsCtrl.repaymentDtl[1].prdct,
								'rateOfInterest':  plRsCtrl.repaymentDtl[1].crntIntstRt,                                   
								'tenure' : plRsCtrl.detail[1].tnr,
								'frequency' : 'Monthly',
								'LoanNo' : plRsCtrl.selectedAccountNumber,
								'coApplcntNm' : plRsCtrl.repaymentDtl[1].coApplcntNm,
								'interestType' : plRsCtrl.pdfdatafromSOA.intrstTyp,										
							       'frmDT' : plRsCtrl.currentDt.getTime(),
								'toDt' : endDate.getTime(),
								'custNo' : plRsCtrl.pdfdatafromSOA.custNb,
								'lnAcctOpnDt': lnAcctOpnDt,
								'acctSts':plRsCtrl.detail[1].acctSts,
								'crncy': plRsCtrl.repaymentDtl[1].crncy,
								'loanCategory':'PERSONAL LOAN',
								'adr':plRsCtrl.repaymentDtl[1].adrs				
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
				    plRsCtrl.errorSpin = false;
										
					try {

						if('ie'===deviceDetector.browser){
							var byteArray = new Uint8Array(response);
                					var blob = new Blob([byteArray], { type: 'application/octet-stream' });
							window.navigator.msSaveOrOpenBlob(blob, 'Personal Loan Repayment Schedule for ' + plRsCtrl.selectedAccountNumber + '.pdf');
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
				    plRsCtrl.errorSpin = false;
										if(response.cd == 'email01'){
						plRsCtrl.noEmailRegistered = true;
					}
					else{
						
		                plRsCtrl.error.msg = idfccommon.ERROR_GEN_RS;		                
		                plRsCtrl.serviceError = true;
					}
				});
			
			}).error(function(data) {

				plRsCtrl.errorSpin = false;
				plRsCtrl.serviceError = true;
				plRsCtrl.error.msg = idfccommon.ERROR_SORRY_MSG;
				

			});
		
		};
		
		
		//lpCoreBus.subscribe('launchpad-retail.openPersonalLoanRepaymentSchedule', function(data){
        gadgets.pubsub.subscribe('launchpad-retail.openPersonalLoanRepaymentSchedule', function(data){
			if(!angular.isUndefined(data) && null!=data && ''!=data){
				plRsCtrl.loanAccExist = true;
                plRsCtrl.redirectFrmLoanDtl.isDirectedFrom = true;                   
                plRsCtrl.redirectFrmLoanDtl.acctNb = data,
                initialize(); 
				
			}else{
				initialize();
			}
		});

		//commenting below call as it is now called from summary
		initialize();

        gadgets.pubsub.subscribe("native.back", function() {
            console.log("native.back handled in pl repayment schedule");
                   gadgets.pubsub.publish("launchpad-retail.openPersonalLoanSummary");
                   gadgets.pubsub.publish("js.back", {
                           data: "ENABLE_HOME"
                   });
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            console.log("device back GoBackInitiate handled in pl repayment schedule");
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

	}

	exports.PLRepaymentScheduleCtrl = PLRepaymentScheduleCtrl;
});
