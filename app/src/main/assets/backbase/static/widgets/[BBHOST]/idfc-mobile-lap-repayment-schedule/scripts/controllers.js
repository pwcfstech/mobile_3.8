define(function(require, exports) {
	'use strict';
	
	var fileSaver = require('fileSaver');
	var idfccommon = require('idfccommon').idfcConstants;
	var idfcHanlder = require('idfcerror');

	function LAPRepaymentScheduleCtrl($scope, $http, i18nUtils, lpCoreUtils, lpWidget,
			$window, lpPortal, lpCoreBus, $q, $anchorScroll, $filter, deviceDetector) {

		var lapRsCtrl = this;
		lapRsCtrl.isMobileDevice = false;
			
		lapRsCtrl.errorSpin = true;
        lapRsCtrl.isEmailRegistered = false;
				
		lapRsCtrl.redirectFrmLoanDtl = {
            		isDirectedFrom : false,
            		acctNb : ''
        	};

		

		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
		
		lapRsCtrl.templates = {
            header: partialsDir + '/lap-repayment-schedule-header.html',
			details: partialsDir + '/lap-repayment-schedule-dtls.html',
			footer: partialsDir + '/lap-repayment-schedule-footer.html'
        };
		
		lapRsCtrl.error = {
							msg : ''
						};
				
		
		lapRsCtrl.today = '';
		lapRsCtrl.currentDt = '';
		
		lapRsCtrl.formatAmount = function(num){
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

		lapRsCtrl.checkTransactionsEmpty = function(value){
			if(value.length == 1){
				if(value[0].instDueDate == ' '){
					return true;
				}
			}else{
				return false;
			}
		};
		
		lapRsCtrl.limit = 10;
		
		lapRsCtrl.showMore = function() {
		      var increamented = lapRsCtrl.limit + 10;
		      lapRsCtrl.limit = (increamented > lapRsCtrl.detail.length) ? lapRsCtrl.detail.length : increamented;
		      
		};
		
		lapRsCtrl.getLoanDetailsByAccNo = function(val) {
			lapRsCtrl.emailSuccess = false;
			lapRsCtrl.emailFail = false;
			lapRsCtrl.noEmailRegistered = false;
			lapRsCtrl.noTransactionError = false;
			lapRsCtrl.noLoanAccounts = false;
			lapRsCtrl.noPendingLoans=false;
			lapRsCtrl.serviceError = false;			
			lapRsCtrl.error.msg = '';

			lapRsCtrl.limit = 10;
			lapRsCtrl.selectedAccountNumber = val;
			console.log('Changed::'+lapRsCtrl.selectedAccountNumber);
			lapRsCtrl.error = {
                    happened: false,
                    msg: ''
                };
			
			lapRsCtrl.detail = [];
			
			if(null===lapRsCtrl.selectedAccountNumber || lapRsCtrl.selectedAccountNumber === ''
				|| angular.isUndefined(lapRsCtrl.selectedAccountNumber)){
			    lapRsCtrl.showLoanPaymentSchedules=false;
				lapRsCtrl.selectAccErr = false;
				
			}else{
				lapRsCtrl.showLoanPaymentSchedules=true;

				var getloanRepaymentSchedule = lpCoreUtils
						.resolvePortalPlaceholders(lpWidget
								.getPreference('loanRepaymentDetails'), {
                                    servicesPath: lpPortal.root
                                });
				
				


				var postData = {
					'loanAccountNumber' : lapRsCtrl.selectedAccountNumber,
				};
				
				lapRsCtrl.errorSpin = true;
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
							
							lapRsCtrl.serviceError = false;							
							lapRsCtrl.noTransactionError=false;
							lapRsCtrl.repaymentDtl = data;
							
							//lapRsCtrl.repaymentDtl = [];
							console.log('Repayment Schedule response :'+lapRsCtrl.repaymentDtl);
							console.log('isEmpty :: '+lapRsCtrl.checkTransactionsEmpty(lapRsCtrl.repaymentDtl));
							if(!(lapRsCtrl.checkTransactionsEmpty(lapRsCtrl.repaymentDtl))){
								lpCoreUtils.forEach(lapRsCtrl.repaymentDtl, function(list) {
									//code to split the date string and convert it into Date format
									console.log('List:::'+JSON.stringify(list));
									var arrStartDate = list.instDueDate.split('/');
									//lapRsCtrl.currentDt = list.serverDt.split('/');
									
									/*lapRsCtrl.today = new Date(
											lapRsCtrl.currentDt[2],
											lapRsCtrl.currentDt[1] - 1,
											lapRsCtrl.currentDt[0]);*/

									lapRsCtrl.today = list.serverDt;
                                    				lapRsCtrl.currentDt = new Date(
											lapRsCtrl.today.split('/')[2], lapRsCtrl.today.split('/')[1]-1, lapRsCtrl.today.split('/')[0]);
									list.instDueDate = new Date(
											arrStartDate[2],
											arrStartDate[1] - 1,
											arrStartDate[0]);

									list.openBal = lapRsCtrl.formatAmount(list.openBal);
									list.totAmt = lapRsCtrl.formatAmount(list.totAmt);
									list.prinAmt = lapRsCtrl.formatAmount(list.prinAmt);
									list.intAmt = lapRsCtrl.formatAmount(list.intAmt);
									list.closeBal = lapRsCtrl.formatAmount(list.closeBal);
									
									//select dates whicha are greater than or
									//equal to today, today will come from 
									//service layer as serverDt 									
									if((list.instDueDate.getTime()) >= (lapRsCtrl.currentDt.getTime())){
										lapRsCtrl.detail.push(list);//list with installment due date in date format
									}
									
									
								});
								
								//No more loans left to be repayed by customer
								if(0===lapRsCtrl.detail.length){
									lapRsCtrl.noPendingLoans=true;
								}
								
								
							}else{								
								lapRsCtrl.noTransactionError=true;
							}
							lapRsCtrl.errorSpin = false;
							
						})
				.error(
						function(data) {
							lapRsCtrl.errorSpin = false;
							lapRsCtrl.error.msg = data.rsn;
							lapRsCtrl.serviceError = true;
						});
				
				
				localStorage.setItem('lnAccountNo' , '');//Clearing LocalStorage
			}
		
		};
		
		lapRsCtrl.getLoanAccList = function() {		
			lapRsCtrl.loanAccountNumbers = [];

			lapRsCtrl.emailSuccess = false;
			lapRsCtrl.emailFail = false;
			lapRsCtrl.noEmailRegistered = false;
			lapRsCtrl.noTransactionError = false;
			lapRsCtrl.noLoanAccounts = false;
			lapRsCtrl.noPendingLoans=false;
			lapRsCtrl.serviceError = false;			
			lapRsCtrl.error.msg = '';
			
			var loanAccountsUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
				.getPreference('getLoanAccountList'), {
				servicesPath: lpPortal.root
			});
			
			lapRsCtrl.errorSpin = true;
			
			
			loanAccountsUrl = loanAccountsUrl + '?typeOfLoan=PlLap';
			$http({
				method: 'GET',
				url: loanAccountsUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded;'
				}
			}).success(function(response){
			    lapRsCtrl.errorSpin = false;
			   // console.log('From server >>>'+JSON.stringify(response));
			   // response.push();
			    
				if(response.length>0){
					lapRsCtrl.loanAccExist = true;
					
					lpCoreUtils.forEach(response, function(list) {
						//list.prdCd = 'VANILLA_NP';
						//commenting Live condition for dummy test
						if(('L'===list.acctSts) && (list.prdCd.indexOf('LAP')>=0 || 'LTL'===list.prdCd)){
							//var acctList = {'prdCd':'','acctNb':''};
							//acctList.prdCd = list.prdCd;
							//acctList.acctNb = list.acctNb;
							
							lapRsCtrl.loanAccountNumbers.push(list.acctNb) ;				 
						}
						
					});
					
					//to display the first value as default selected value (ng-selected =$first as an alternative)
					if(!angular.isUndefined(lapRsCtrl.selectedAccountNumber) && lapRsCtrl.selectedAccountNumber!=''  && lapRsCtrl.selectedAccountNumber!=null){
                            //lapRsCtrl.selectedAccountNumber = lapRsCtrl.redirectFrmLoanDtl.acctNb;
                        	console.log('>>>>>>>>>.'+lapRsCtrl.selectedAccountNumber);
                        	lapRsCtrl.getLoanDetailsByAccNo(lapRsCtrl.selectedAccountNumber);
                        	localStorage.setItem('lnAccountNo' , '');
                   	}
					else if (lapRsCtrl.loanAccountNumbers.length === 1) {
					    console.log('inside else if');
						lapRsCtrl.selectedAccountNumber = lapRsCtrl.loanAccountNumbers[0];
						lapRsCtrl.getLoanDetailsByAccNo(lapRsCtrl.selectedAccountNumber);
					} else if(lapRsCtrl.loanAccountNumbers.length === 0){
						lapRsCtrl.loanAccExist = false;					
						lapRsCtrl.noLoanAccounts = true;
						
					}
					
					
				}else{
					lapRsCtrl.loanAccExist = false;					
					lapRsCtrl.noLoanAccounts = true;
				}
			})
			.error(function(data){
				lapRsCtrl.errorSpin = false;
				lapRsCtrl.error.msg = data.rsn;
				lapRsCtrl.serviceError = true;
				
			});
		
		};
		
		lapRsCtrl.initialize = function(){
			idfcHanlder.validateSession($http);

			if('android'===deviceDetector.device || 'iphone'===deviceDetector.device
                         || 'windows-phone'===deviceDetector.device){
				lapRsCtrl.isMobileDevice = true;
			}

			 if(localStorage.getItem("origin")=="lap-summary"){
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_BACK"
                });
             }

			
			lapRsCtrl.errorSpin = true;
			lapRsCtrl.limit = 10;
			
			
			
			//to be set from loan account summary
			var loanAccount = localStorage.getItem('lnAccountNo');
            console.log('Local Storage '+loanAccount);
            if(!angular.isUndefined(loanAccount) && loanAccount!=''  && loanAccount!=null){
                console.log('Inside if :'+loanAccount);
                lapRsCtrl.selectedAccountNumber = loanAccount;
                //lapRsCtrl.selectedAccountNumber = loanAccount;
                /* added for mobile 2.5 enhancement to open from lap summary */
                lapRsCtrl.getLoanAccList();
                //lapRsCtrl.getLoanDetailsByAccNo(loanAccount);

            }else{
            	//lapRsCtrl.selectedAccountNumber = null;
            	console.log('Inside else :'+loanAccount);
            	lapRsCtrl.getLoanAccList();
            }
				
			
		
		};
		
		lapRsCtrl.emailAdvice = function(){
			
			lapRsCtrl.emailSuccess = false;
			lapRsCtrl.emailFail = false;
			lapRsCtrl.noEmailRegistered = false;
			lapRsCtrl.noTransactionError = false;
			lapRsCtrl.noLoanAccounts = false;
			lapRsCtrl.noPendingLoans=false;
			lapRsCtrl.serviceError = false;			
			lapRsCtrl.error.msg = '';
			
			lapRsCtrl.errorSpin = true;
            
            //if(lapRsCtrl.isEmailRegistered){
		
                var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });

                var postData = {
                    'lnAcctNb' : lapRsCtrl.selectedAccountNumber,
                    'frmDT' : lapRsCtrl.currentDt.getTime(),
                    'toDt' : lapRsCtrl.currentDt.getTime()
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

                    lapRsCtrl.loanDetails = response;
                    lapRsCtrl.pdfdatafromSOA = lapRsCtrl.loanDetails.getsoaMains;

                    console.log(lapRsCtrl.pdfdatafromSOA);

                    var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentSchPdfSrc'), {
                                    servicesPath: lpPortal.root
                                });
                    
			pdfUrl = pdfUrl + '?&emailFlag=' + true;

			//pdfUrl = pdfUrl.substr(0, pdfUrl.lastIndexOf('/')) + '/plLapRepaymentSchedulePdfSrc?&emailFlag=' + true;
				
				console.log('PDF Url :'+pdfUrl);
				var toDate = [];
				toDate = lapRsCtrl.repaymentDtl[1].instlmntEndDt.split('/');
				var endDate = new Date(toDate[2], toDate[1]-1, toDate[0]);
				console.log(endDate);

				var lnAcctOpnDt = '';
                		if(lapRsCtrl.detail[1].dsbrsmntDt!=' ' && lapRsCtrl.detail[1].dsbrsmntDt!=''){
                   		   var year = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[2];
                               var month = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[1]-1;
                               var day = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[0];
                    
                    		    lnAcctOpnDt = new Date(year, month, day);
				    lnAcctOpnDt = $filter('date')(lnAcctOpnDt, 'dd-MMM-yyyy');

                             }
                   

				var postDataForPdf = {
								'custName': lapRsCtrl.repaymentDtl[1].custNm,
                                'disbursementAmt' : lapRsCtrl.detail[1].dsbrsmntAmt,
                                'loanType' :  lapRsCtrl.repaymentDtl[1].prdct,
								'rateOfInterest':  lapRsCtrl.repaymentDtl[1].crntIntstRt,                                   
								'tenure' : lapRsCtrl.detail[1].tnr,
								'frequency' : 'Monthly',
								'LoanNo' : lapRsCtrl.selectedAccountNumber,
								'coApplcntNm' : lapRsCtrl.repaymentDtl[1].coApplcntNm,
								'interestType' : lapRsCtrl.pdfdatafromSOA.intrstTyp,										
							       'frmDT' : lapRsCtrl.currentDt.getTime(),
								'toDt' : endDate.getTime(),
								'custNo' : lapRsCtrl.pdfdatafromSOA.custNb,
								'lnAcctOpnDt': lapRsCtrl.detail[1].dsbrsmntDt,
								'acctSts':lapRsCtrl.detail[1].acctSts,
								'crncy': lapRsCtrl.repaymentDtl[1].crncy,
								'loanCategory':'LOAN AGAINST PROPERTY',
								'adr':lapRsCtrl.repaymentDtl[1].adrs				
							};


                    console.log('Email data:'+JSON.stringify(postDataForPdf));
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
                        $window.scrollTo(0, document.body.scrollHeight);
                        lapRsCtrl.emailSuccess = true;
                        lapRsCtrl.errorSpin = false;
                        //$location.hash("emailSuccessMsg");
                        //$anchorScroll();
                        /* var emailMsgId=document.getElementById('emailSuccessMsg');
                         emailMsgId.scrollTop = emailMsgId.scrollHeight;
                         window.scrollTo(0, emailMsgId.scrollHeight);*/
                    }).error(function(response) {
                                    if(response.cd == 'email01'){
                                        lapRsCtrl.noEmailRegistered = true;

                                    }
                                    else{
                                        //lapRsCtrl.successMessagePDFEmail = 'No Records found';
                                        lapRsCtrl.emailFail = true;
                                    }
                                    lapRsCtrl.errorSpin = false;
                                    $window.scrollTo(0, document.body.scrollHeight);
                                   /* $location.hash("emailSuccessMsg");
					                $anchorScroll();
					                 var emailMsgId=document.getElementById('emailSuccessMsg');
                                     emailMsgId.scrollTop = emailMsgId.scrollHeight;*/
                    });
                })
                .error(function(data) {

                    lapRsCtrl.errorSpin = false;
		      //$anchorScroll();

                    lapRsCtrl.serviceError = true;
                    lapRsCtrl.error.msg = idfccommon.ERROR_SORRY_MSG;


                });
           // }else{
           //     lapRsCtrl.noEmailRegistered = true;
           //     lapRsCtrl.errorSpin = false;
           // }
			
		};
		
		
		lapRsCtrl.pdfGeneration = function(){	
			lapRsCtrl.emailSuccess = false;
			lapRsCtrl.emailFail = false;
			lapRsCtrl.noEmailRegistered = false;
			lapRsCtrl.noTransactionError = false;
			lapRsCtrl.noLoanAccounts = false;
			lapRsCtrl.noPendingLoans=false;
			lapRsCtrl.serviceError = false;			
			lapRsCtrl.error.msg = '';
            
           		 lapRsCtrl.errorSpin = true;
			$anchorScroll();
			var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });
			
			console.log('SOA :'+getLoanSoa);
			//var threeMonthsEarlierDate = new Date();
                	//threeMonthsEarlierDate.setMonth(lapRsCtrl.currentDt.getMonth() - 3);

			//var toDate = [];
			//toDate = lapRsCtrl.repaymentDtl[1].instlmntEndDt.split('/');
			//var endDate = new Date(toDate[2], toDate[1]-1, toDate[0]);
			//console.log(endDate);		
				

			var postData = {
				'lnAcctNb' : lapRsCtrl.selectedAccountNumber,
				'frmDT' : lapRsCtrl.currentDt.getTime(),
				'toDt' : lapRsCtrl.currentDt.getTime()
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
				
				console.log('SOA response for pdf : '+response);
				
				lapRsCtrl.loanDetails = response;
				lapRsCtrl.pdfdatafromSOA = lapRsCtrl.loanDetails.getsoaMains;
				
				console.log(lapRsCtrl.pdfdatafromSOA);
				
				var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentSchPdfSrc'), {
                                    servicesPath: lpPortal.root
                                });
				pdfUrl = pdfUrl + '?&emailFlag=' + false;
				
				//pdfUrl = pdfUrl.substr(0, pdfUrl.lastIndexOf('/')) + '/plLapRepaymentSchedulePdfSrc?&emailFlag=' + false;
				
				console.log('PDF Url :'+pdfUrl);

				var toDate = [];
				toDate = lapRsCtrl.repaymentDtl[1].instlmntEndDt.split('/');
				var endDate = new Date(toDate[2], toDate[1]-1, toDate[0]);
				console.log(endDate);

				var lnAcctOpnDt = '';
                		if(lapRsCtrl.detail[1].dsbrsmntDt!=' ' && lapRsCtrl.detail[1].dsbrsmntDt!=''){
                   		   var year = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[2];
                               var month = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[1]-1;
                               var day = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[0];
                    
                    		    lnAcctOpnDt = new Date(year, month, day);
				    lnAcctOpnDt = $filter('date')(lnAcctOpnDt, 'dd-MMM-yyyy');

                             }		
								
				var postDataForPdf = {
								'custName': lapRsCtrl.repaymentDtl[1].custNm,
                                        			'disbursementAmt' : lapRsCtrl.detail[1].dsbrsmntAmt,
                                        			'loanType' :  lapRsCtrl.repaymentDtl[1].prdct,
								'rateOfInterest':  lapRsCtrl.repaymentDtl[1].crntIntstRt,                                   
								'tenure' : lapRsCtrl.detail[1].tnr,
								'frequency' : 'Monthly',
								'LoanNo' : lapRsCtrl.selectedAccountNumber,
								'coApplcntNm' : lapRsCtrl.repaymentDtl[1].coApplcntNm,
								'interestType' : lapRsCtrl.pdfdatafromSOA.intrstTyp,										
							       'frmDT' : lapRsCtrl.currentDt.getTime(),
								'toDt' : endDate.getTime(),
								'custNo' : lapRsCtrl.pdfdatafromSOA.custNb,
								'lnAcctOpnDt': lapRsCtrl.detail[1].dsbrsmntDt,
								'acctSts':lapRsCtrl.detail[1].acctSts,
								'crncy': lapRsCtrl.repaymentDtl[1].crncy,
								'loanCategory':'LOAN AGAINST PROPERTY',
								'adr':lapRsCtrl.repaymentDtl[1].adrs				
							};
				
				
				//console.log('PDF download data:'+JSON.stringify(postDataForPdf));
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
							
					
					lapRsCtrl.errorSpin = false;
					try {
						var file = new Blob(
								[ response ],
								{
									type : 'application/pdf'
								});
						var filename = 'Loan Against Property Repayment Schedule for ' + lapRsCtrl.selectedAccountNumber + '.pdf';
						fileSaver.saveAs(file, filename);
					} catch (e) {
						console.log(e.stack);
					}

				}).error(function(response) {
						if(response.cd == 'email01'){
							lapRsCtrl.noEmailRegistered = true;
						
						}
						else{
							//lapRsCtrl.successMessagePDFEmail = 'No Records found';
			                lapRsCtrl.error.msg = idfccommon.ERROR_SEND_RS;
							lapRsCtrl.serviceError = true;
			                
						}
						lapRsCtrl.errorSpin = false;
					});	
			})			
			.error(function(data) {				
				lapRsCtrl.error.msg = idfccommon.ERROR_SORRY_MSG;
				lapRsCtrl.serviceError = true;
				lapRsCtrl.errorSpin = false;

			});
		
		};	
		
		lapRsCtrl.printPdf = function(){
			lapRsCtrl.emailSuccess = false;
			lapRsCtrl.emailFail = false;
			lapRsCtrl.noEmailRegistered = false;
			lapRsCtrl.noTransactionError = false;
			lapRsCtrl.noLoanAccounts = false;
			lapRsCtrl.noPendingLoans=false;
			lapRsCtrl.serviceError = false;			
			lapRsCtrl.error.msg = '';
			console.log('printPdfDev');
			lapRsCtrl.errorSpin = true;
			$anchorScroll();

			var getLoanSoa = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getSOA'), {
                                    servicesPath: lpPortal.root
                                });
			
			
			var postData = {
				'lnAcctNb' : lapRsCtrl.selectedAccountNumber,
				'frmDT' : lapRsCtrl.currentDt.getTime(),
				'toDt' : lapRsCtrl.currentDt.getTime()
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
				
				lapRsCtrl.loanDetails = response;
				lapRsCtrl.pdfdatafromSOA = lapRsCtrl.loanDetails.getsoaMains;
				
				console.log(lapRsCtrl.pdfdatafromSOA);
				
				var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('loanRepaymentSchPdfSrc'), {
                                    servicesPath: lpPortal.root
                                });
				
				pdfUrl = pdfUrl + '?&emailFlag=' + false;

				//pdfUrl = pdfUrl.substr(0, pdfUrl.lastIndexOf('/')) + '/plLapRepaymentSchedulePdfSrc?&emailFlag=' + false;
				
				console.log('PDF Url :'+pdfUrl);
				var toDate = [];
				toDate = lapRsCtrl.repaymentDtl[1].instlmntEndDt.split('/');
				var endDate = new Date(toDate[2], toDate[1]-1, toDate[0]);
				console.log(endDate);

				var lnAcctOpnDt = '';
                		if(lapRsCtrl.detail[1].dsbrsmntDt!=' ' && lapRsCtrl.detail[1].dsbrsmntDt!=''){
                   		   var year = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[2];
                               var month = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[1]-1;
                               var day = lapRsCtrl.detail[1].dsbrsmntDt.split('/')[0];
                    
                    		    lnAcctOpnDt = new Date(year, month, day);
				    lnAcctOpnDt = $filter('date')(lnAcctOpnDt, 'dd-MMM-yyyy');

                             }	
				
				var postDataForPdf = {
								'custName': lapRsCtrl.repaymentDtl[1].custNm,
                                        			'disbursementAmt' : lapRsCtrl.detail[1].dsbrsmntAmt,
                                        			'loanType' :  lapRsCtrl.repaymentDtl[1].prdct,
								'rateOfInterest':  lapRsCtrl.repaymentDtl[1].crntIntstRt,                                   
								'tenure' : lapRsCtrl.detail[1].tnr,
								'frequency' : 'Monthly',
								'LoanNo' : lapRsCtrl.selectedAccountNumber,
								'coApplcntNm' : lapRsCtrl.repaymentDtl[1].coApplcntNm,
								'interestType' : lapRsCtrl.pdfdatafromSOA.intrstTyp,										
							       'frmDT' : lapRsCtrl.currentDt.getTime(),
								'toDt' : endDate.getTime(),
								'custNo' : lapRsCtrl.pdfdatafromSOA.custNb,
								'lnAcctOpnDt': lapRsCtrl.detail[1].dsbrsmntDt,
								'acctSts':lapRsCtrl.detail[1].acctSts,
								'crncy': lapRsCtrl.repaymentDtl[1].crncy,
								'loanCategory':'LOAN AGAINST PROPERTY',
								'adr':lapRsCtrl.repaymentDtl[1].adrs				
							};				
				
				console.log('Print PDF:'+JSON.stringify(postDataForPdf));
			
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
				    lapRsCtrl.errorSpin = false;
					console.log('Response : '+response);
					
					try {
						if('ie'===deviceDetector.browser){
							var byteArray = new Uint8Array(response);
                					var blob = new Blob([byteArray], { type: 'application/octet-stream' });
							window.navigator.msSaveOrOpenBlob(blob, 'Loan Against Property Repayment Schedule for ' + lapRsCtrl.selectedAccountNumber + '.pdf');
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
						console.log(e.stack);
					}
					
				}).error(function(response) {
				    lapRsCtrl.errorSpin = false;
					console.log('Error');
					if(response.cd == 'email01'){
						lapRsCtrl.noEmailRegistered = true;
					}
					else{
						//lapRsCtrl.successMessagePDFEmail = 'No Records found';
		                lapRsCtrl.error.msg = idfccommon.ERROR_GEN_RS;		                
		                lapRsCtrl.serviceError = true;
					}
				});
			
			}).error(function(data) {

				lapRsCtrl.errorSpin = false;
				lapRsCtrl.serviceError = true;
				lapRsCtrl.error.msg = idfccommon.ERROR_SORRY_MSG;
				

			});
		
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
		
		//commenting as it will be called from summary
		lapRsCtrl.initialize();

		//lpCoreBus.subscribe('launchpad-retail.openLAPRepaymentSchedule', function(data){
         gadgets.pubsub.subscribe('launchpad-retail.openLAPRepaymentSchedule', function(data){
			console.log('Loan account number : '+data);
			if(!angular.isUndefined(data) && null!=data && ''!=data){
				lapRsCtrl.loanAccExist = true;
				lapRsCtrl.redirectFrmLoanDtl.isDirectedFrom = true;                   
                		lapRsCtrl.redirectFrmLoanDtl.acctNb = data,
                		lapRsCtrl.initialize(); 

			}else{
				lapRsCtrl.initialize();
			}
		});

       gadgets.pubsub.subscribe("native.back", function() {
           console.log("native.back handled in lap repayment schedule");
                  gadgets.pubsub.publish("launchpad-retail.openLAPSummary");
                  gadgets.pubsub.publish("js.back", {
                          data: "ENABLE_HOME"
                  });
       });

       gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
           console.log("device back GoBackInitiate handled in lap repayment schedule");
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
	/**
	 * Export Controllers
	 */
	exports.LAPRepaymentScheduleCtrl = LAPRepaymentScheduleCtrl;
});
