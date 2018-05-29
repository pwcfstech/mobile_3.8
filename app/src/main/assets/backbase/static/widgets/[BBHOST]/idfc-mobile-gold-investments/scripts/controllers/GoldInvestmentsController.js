define(function (require, exports) {
	'use strict';
	var angular = require('angular');
	
	/**
	 * GoldInvestmentsController controller
	 *
	 * @ngInject
	 * @constructor
	 */
	function GoldInvestmentsController(lpCoreUtils,
		lpWidget, $timeout, lpCoreBus, lpPortal, IdfcUtils, IdfcConstants, IdfcError, lpCoreI18n) {

		//local variables
		var vc = this;
			vc.errorSpin = true;
		//Local functions
		//Initialization of GoldInnvest parameters
		function initialize() {

			vc.errorSpin = true;
        	gadgets.pubsub.publish("wms.goldbond.header.title", {
					   data: "BUY GOLD BONDS"
		   	});			   

			vc.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
			vc.availableBalance = '';
			vc.templates = {
				home: vc.partialsDir + '/GoldHome.html',
				details: vc.partialsDir + '/GoldInvestDetails.html',
				congrats: vc.partialsDir + '/Congrats.html'
			};
		}
		/*Refresh code*/
		var deckPanelOpenHandler;
		deckPanelOpenHandler = function (activePanelName) {
			if (activePanelName === lpWidget.parentNode.model.name) {
				lpCoreBus.flush('DeckPanelOpen');
				lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
				lpWidget.refreshHTML(function (bresView) {
					lpWidget.parentNode = bresView.parentNode;
				});
			}
		};
		lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
		initialize(); 
	}

	function GoldHomeController(lpCoreUtils,$scope, $rootScope,
		lpWidget, $timeout, lpCoreBus, lpPortal, IdfcUtils, IdfcConstants, IdfcError, lpCoreI18n, goldInvestments) {

         var goldHomeCtrl = this;
         goldHomeCtrl.errorSpin = true;
		 goldHomeCtrl.serviceError = false;
		 goldHomeCtrl.exceedsAmount = false;

		 gadgets.pubsub.subscribe("wms.changeTitle", function() {
		   console.log("wms.changeTitle called");
		   gadgets.pubsub.publish("wms.goldbond.header.title", {
				   data: "BUY GOLD BONDS"
		   });			   
	   	});
	


        function initialize(){

        	goldHomeCtrl.errorSpin = true;
        	gadgets.pubsub.publish("wms.goldbond.header.title", {
					   data: "BUY GOLD BONDS"
		   	});			   
		   	/*$timeout(function(){
			 goldHomeCtrl.errorSpin = false;  
		   }, 2000);*/  
            fetchAccountNumbers();
        }
        gadgets.pubsub.subscribe('refershData', function(data) {
		   	if(data == "true"){
		   		
		   		goldHomeCtrl.quantity = undefined;		   				   		
		   		goldHomeCtrl.totalAmount = undefined;
		   		goldHomeCtrl.accountNumber = undefined;
		   		goldHomeCtrl.avlbal = undefined;
		   		goldHomeCtrl.dematAccount = undefined;
		   		initialize();
		   		/*goldInvestmentsform.submitted = false;*/
		   	}
	   	});
        /**
         * Alerts
         */
        goldHomeCtrl.alerts = [];
		/*Function to add error messages.*/
        function addAlert(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: goldHomeCtrl.alert.messages[code]
            };
            goldHomeCtrl.alerts.push(customAlert);
        }
		
		/* Method to remove Closed accounts and some MOPs from the list.*/
        function filterAccounts(accounts) {
            var filteredAccounts = [];            
				angular.forEach(accounts.savingAccount, function (saccount) {
				if (saccount.status !== IdfcConstants.ACCOUNT_STATUS 
				&& saccount.currency === IdfcConstants.ACCOUNT_CURRENCY
				&& (saccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_AS 
				|| saccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_ES
				|| saccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_LG
				|| saccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_MH
				|| saccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_SI)
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODONE_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODTWO_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODTHREE_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODFOUR_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODFIVE_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODSIX_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODSEVEN_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODTWO_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODEIGHT_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODTWO_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODNINE_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODTWO_SUBTYPE 
				&& saccount.acctTyp !== IdfcConstants.ACCOUNT_ODTEN_TYPE && saccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODTWO_SUBTYPE			
				) {     
					if((saccount.acctSbTyp.toString() !='1002' && saccount.acctSbTyp.toString() !='1003') && ( saccount.acctSbTyp.toString() !='4003') && ( saccount.acctSbTyp.toString() !='4002')){
						filteredAccounts.push(saccount);				  
					}
					/*if((saccount.acctSbTyp.toString() !='1002' && saccount.acctSbTyp.toString() !='1003') && ( saccount.acctSbTyp.toString() !='4003' && saccount.acctTyp.toString() !='2000') && ( saccount.acctSbTyp.toString() !='4002' && saccount.acctTyp.toString() !='2000')){
                    						filteredAccounts.push(saccount);
                    					}*/
					/*if(saccount.modeOfOperation == "FORMER OR SURVIVOR"){1
					filteredAccounts.push(saccount);
					}*/

                }
			});
			angular.forEach(accounts.currentAccount, function (caccount) {
			if (caccount.status !== IdfcConstants.ACCOUNT_STATUS 
				&& caccount.currency === IdfcConstants.ACCOUNT_CURRENCY
				&& (caccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_AS 
				|| caccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_ES
				|| caccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_LG
				|| caccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_MH
				|| caccount.modeOfOperation === IdfcConstants.ACCOUNT_MOO_SI)
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODONE_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODTWO_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODTHREE_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODFOUR_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODFIVE_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODSIX_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODONE_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODSEVEN_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODTWO_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODEIGHT_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODTWO_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODNINE_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODTWO_SUBTYPE 
				&& caccount.acctTyp !== IdfcConstants.ACCOUNT_ODTEN_TYPE && caccount.acctSbTyp !== IdfcConstants.ACCOUNT_ODTWO_SUBTYPE
				) {
				   if(caccount.acctSbTyp.toString() !='4002' && caccount.acctSbTyp.toString() !='4003' && caccount.acctSbTyp.toString() !='3405' && caccount.acctSbTyp.toString() !='3406' && caccount.acctSbTyp.toString() !='5001'){

                   	    filteredAccounts.push(caccount);
                   	}
                }
			});   
			 return filteredAccounts;
        }

        /*Function to fetch the account numbers*/
        var fetchAccountNumbers = function(){
			var urlFetchAccountsEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('fetchAccounts'));
			/*var accntUrl = '$(servicesPath)/rs/v1/chequebook-account-list';*/
			/*var urlFetchAccountsEndPoint = lpCoreUtils.resolvePortalPlaceholders(accntUrl, {
					servicesPath: lpPortal.root
				});*/
			goldInvestments
            .setup({
                urlFetchAccountsEndPoint : urlFetchAccountsEndPoint,
                data: null
            })
            /*lpAccounts.setConfig({
            accountsEndpoint: lpWidget.getPreference('fetchAccounts')
            });*/
            .fetchAccounts()
            .success(function(data){
//            var data;
//            lpCoreBus.subscribe('account-list-as',function(data1){
//            data = data1;
//            })
                if(IdfcUtils.hasContentData(data)){
				     data=filterAccounts(data);
				    if(data.length == 1){
				        goldHomeCtrl.accountNumber = data[0].id;
				         goldHomeCtrl.accountNumbers = data;
//				          goldHomeCtrl.getAvailableBalance();
				    }
				    else
				    {
				        goldHomeCtrl.accountNumbers = data;
				    }

				    /*goldHomeCtrl.accountNumbers = data;*/
				    goldHomeCtrl.getAvailableBalance();
					fetchPerGramRate();
                }
                else{
                goldHomeCtrl.serviceError = true;
               $('.lp-idfc-gold-investments #confirmatinId').hide();
               				$('.lp-idfc-gold-investments .wizard-header').hide();

                goldHomeCtrl.alert = {
                                            messages: {
                                                cd: 'Sorry. Our machines are not talking to each other ! Humans are trying to fix the problem. Please try again in a while.'
                                            }
                                        };
                                        addAlert('cd','error',false);
                     }
            }).error(function(error){
                goldHomeCtrl.errorSpin = false;
                if (error.cd) {
                    IdfcError.checkTimeout(error);
					goldHomeCtrl.serviceError = true;
				$('.lp-idfc-gold-investments #confirmatinId').hide();
				$('.lp-idfc-gold-investments .wizard-header').hide();
                    if ((error.cd === '501')) {
                        goldHomeCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    } else {
                        goldHomeCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    }
                }
            });
        }
      /*Function to fetch the Gram rate*/
        var fetchPerGramRate = function(){
            var urlFetchPerGramRateEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('fetchPerGramRate'))+ '?rs=' + new Date().getTime();
            goldInvestments
            .setup({
                urlFetchPerGramRateEndPoint : urlFetchPerGramRateEndPoint
            })
            .fetchPerGramRate()
            .success(function(data){
                goldHomeCtrl.errorSpin = false;
				console.log(data);
                goldHomeCtrl.perGramRate = data;
            }).error(function(error){
                goldHomeCtrl.errorSpin = false;
                if (error.cd) {
                    IdfcError.checkTimeout(error);
					goldHomeCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
				    $('.lp-idfc-gold-investments .wizard-header').hide();
                    if ((error.cd === '501')) {
                        goldHomeCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    } else {
                        goldHomeCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    }
                }
            });
        }

         /*watching the change in the units of gold to calculate the total amount*/
         $scope.$watch('goldHomeCtrl.quantity',function(newValue, oldValue){
            goldHomeCtrl.allowedQuantity = false;
            goldHomeCtrl.lockFields = false;
            goldHomeCtrl.decimalCheck = false;
            var digits = /^[0-9]+$/;
            if(newValue != 'undefined' && newValue != undefined){
                if(newValue >= 1 && newValue <= 4000 && newValue.indexOf(".") == -1){
                    var amount = goldHomeCtrl.quantity * goldHomeCtrl.perGramRate;
                    goldHomeCtrl.totalAmount = amount.toFixed(2);
                }else if(newValue.indexOf(".") > -1 || !(newValue.match(digits))){
                    goldHomeCtrl.decimalCheck = true;
                    goldHomeCtrl.lockFields = true;
                }else{
                    goldHomeCtrl.allowedQuantity = true;
                    goldHomeCtrl.lockFields = true;
                }
            }else{
                goldHomeCtrl.totalAmount = '';
            }
         },true);

         /* Function to get the available balance of the account selected */
		 goldHomeCtrl.getAvailableBalance = function(){
         goldHomeCtrl.exceedsAmount = false;		 
		   if(goldHomeCtrl.accountNumber===undefined){
			  goldHomeCtrl.avlbal='';
			}else{
				  angular.forEach(goldHomeCtrl.accountNumbers, function (account) {			
					 if(account.id===goldHomeCtrl.accountNumber){ 
					  goldHomeCtrl.avlbal=account.effectiveAvailableBalance;
					}		
				 });			
			} 		
		  
		 }

         //* Function to validate the form and move to next wizard */
		 goldHomeCtrl.proceedToNextWizard = function(isValid){
			goldHomeCtrl.exceedsAmount = false;
            if(!isValid){
                return true;
            }

            goldHomeCtrl.goldInvestmentsform.submitted=false; 
						
			if(Number(goldHomeCtrl.avlbal) < Number(goldHomeCtrl.totalAmount)){
				goldHomeCtrl.exceedsAmount = true;
				return true;
			}

			var postData    =   {"details" : "user"};
                postData = $.param(postData || {}); 
			var urlFetchProfileDetails = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('addressUrl'));
            goldInvestments
            .setup({
                urlFetchProfileDetails : urlFetchProfileDetails,
				data: postData
            })
            .profileDetails()
            .success(function(data){			  
                if(IdfcUtils.hasContentData(data)){

					goldHomeCtrl.name = data.name;
					goldHomeCtrl.email = data.email;
					goldHomeCtrl.mblNo = data.mblNo;				
					goldHomeCtrl.custTitle = data.custTitle;
					goldHomeCtrl.mblNo_UI = data.mblNo;
					if(goldHomeCtrl.mblNo_UI != null){
						if(goldHomeCtrl.mblNo_UI.length>10){
						 goldHomeCtrl.mblNo_UI = '+'+goldHomeCtrl.mblNo_UI.substring(0,goldHomeCtrl.mblNo_UI.length-10)+' '+goldHomeCtrl.mblNo_UI.substring(goldHomeCtrl.mblNo_UI.length-10,goldHomeCtrl.mblNo_UI.length);
						}
					}
					goldHomeCtrl.goldInvestmentDetails = {
						'quantity' : goldHomeCtrl.quantity,
						'totalAmount' : goldHomeCtrl.totalAmount,
						'account' : goldHomeCtrl.accountNumber,
						'dematAccount' : goldHomeCtrl.dematAccount,
						'name' : goldHomeCtrl.name,
						'email' : goldHomeCtrl.email, 
						'mblNo' : goldHomeCtrl.mblNo,
						"perGramRate":goldHomeCtrl.perGramRate,
						"custTitle":goldHomeCtrl.custTitle,
						"mblNo_UI":goldHomeCtrl.mblNo_UI,
						"tnCCheckbox":false,
						"tnCCheckboxError":false
					}
				
					$rootScope.$broadcast('goldInvestmentDetails',goldHomeCtrl.goldInvestmentDetails);
				}
            }).error(function(error){
                goldHomeCtrl.errorSpin = false;
                if (error.cd) {
                    IdfcError.checkTimeout(error);
					goldHomeCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
				    $('.lp-idfc-gold-investments .wizard-header').hide();
                    if ((error.cd === '501')) {
                        goldHomeCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    } else {
                        goldHomeCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    }
                }
            });
            $scope.wizardNextStep();
		}
        initialize();
	}

	function GoldDetailsController(lpCoreUtils, $scope,$templateCache, $modal,
		lpWidget, $timeout, i18nUtils, lpCoreBus, lpPortal, IdfcUtils, IdfcConstants, IdfcError, goldInvestments) {

        var goldDetailsCtrl = this;
		goldDetailsCtrl.emailSent = false;
		goldDetailsCtrl.serviceError = false;
		//goldDetailsCtrl.investmentDetails.tnCCheckbox = false;
		//goldDetailsCtrl.investmentDetails.tnCCheckboxError = false;
        goldDetailsCtrl.widgetDir = lpCoreUtils.getWidgetBaseUrl(lpWidget);

		goldDetailsCtrl.downlloadIcon = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/downlloadIcon.png';
		goldDetailsCtrl.mailIcon = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/mailIcon.png';
		goldDetailsCtrl.printIcon = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/printIcon.png';
		goldDetailsCtrl.tickIcon = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/tick.png';


		goldDetailsCtrl.openGoldPopup = function(){
		$("#goldModal").css("display", "block"); 
			$("body").css("overflow", "hidden"); 
		}
		goldDetailsCtrl.closeGoldPopup = function(){
		$("#goldModal").css("display", "none");
			$("body").css("overflow-y", "scroll");
		}
			

        /**
         * Alerts
         */
        goldDetailsCtrl.alerts = [];
		
		/* Function to add error messages. */
        function addAlert(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: goldDetailsCtrl.alert.messages[code]
            };
            goldDetailsCtrl.alerts.push(customAlert);
        }
        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];

		var date = new Date();
		var purchaseDate = date.getDate()+" "+monthNames[date.getMonth()]+" "+date.getFullYear();

		$scope.$on('goldInvestmentDetails',function(event, data){
		    goldDetailsCtrl.investmentDetails = data;
		    goldDetailsCtrl.purchaseDate = purchaseDate;
		});

        /* Function to go back to the main page */
		goldDetailsCtrl.goBackToMainPage = function(){
			goldDetailsCtrl.investmentDetails.tnCCheckboxError = false;
			goldDetailsCtrl.investmentDetails.tnCCheckbox = false;
			$scope.wizardPreviousStep();
		}

        /* Function to save the Gold Investment Details */
		goldDetailsCtrl.saveGoldInvestmentDetails = function(){
		if(!goldDetailsCtrl.investmentDetails.tnCCheckbox){
            goldDetailsCtrl.investmentDetails.tnCCheckboxError = true;
            return true;
        }
		var urlFetchAccessDatesEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('fetchAccessDates'))+ '?rs=' + new Date().getTime();		
		goldInvestments
            .setup({
                urlFetchAccessDatesEndPoint    :   urlFetchAccessDatesEndPoint
            })
            .fetchAccessDatesForGoldInvestments()
            .success(function(data){ 
			
			   if(data==='true'){
					goldDetailsCtrl.saveGoldInvestmentDetailsProceed();
					}else{
					goldDetailsCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
				    $('.lp-idfc-gold-investments .wizard-header').hide();
					goldDetailsCtrl.alert = {
                            messages: {
                                cd: IdfcConstants.GOLD_TRANS_TIME
                            }
                        };
                        addAlert('cd', 'error', false);
					
					}
            }).error(function(error){

            });
		}
		
		goldDetailsCtrl.saveGoldInvestmentDetailsProceed = function(){
			console.log(goldDetailsCtrl.investmentDetails);
			console.log(goldDetailsCtrl.investmentDetails.tnCCheckbox);
			/*if(!goldDetailsCtrl.investmentDetails.tnCCheckbox){
				goldDetailsCtrl.investmentDetails.tnCCheckboxError = true;
				return true;
			}*/
			goldDetailsCtrl.investmentDetails.tnCCheckboxError = false;
			var date = new Date();
			var purchaseDate = ("0" + date.getDate()).slice(-2)+"/"+("0" + (date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
            goldDetailsCtrl.errorSpin = true;
		    var postData = {
                "gramsOfGold"   :   goldDetailsCtrl.investmentDetails.quantity,
                "valueOfGold"   :   goldDetailsCtrl.investmentDetails.totalAmount,
                "dematId"       :   goldDetailsCtrl.investmentDetails.dematAccount,
                "accountNumber" :   goldDetailsCtrl.investmentDetails.account,                
                "perGramRate"	:   goldDetailsCtrl.investmentDetails.perGramRate,
				"custTitle"		:   goldDetailsCtrl.investmentDetails.custTitle,
				"purchaseDate"  :   purchaseDate
            };
            postData    =   $.param(postData || {});

            var urlSaveGoldInvstEndPoint    =   lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('saveGoldInvestmentDetails'))+ '?rs=' + new Date().getTime();
            goldInvestments
            .setup({
                urlSaveGoldInvstEndPoint    :   urlSaveGoldInvstEndPoint,
                data    :   postData
            })
            .saveGoldInvestmentDetails()
            .success(function(data, status, headers){
				goldDetailsCtrl.errorSpin = false;
				console.log(headers('goldBondFTStatus'));
				console.log(headers('csId'));
				var csId = headers('csId');
				console.log(headers('goldBondFTMsg'));
				if(headers('goldBondFTStatus') === 'OK'){
					lpCoreBus.publish('launchpad-retail.refreshAccountSummary1', {});
					lpCoreBus.publish('launchpad-business.refreshAccountSummary', {});
					goldDetailsCtrl.sendEmail('purchase');
					goldDetailsCtrl.saveSuccess = true;
					goldDetailsCtrl.terms = true;
					goldDetailsCtrl.purchaseDone = true;
					goldDetailsCtrl.done = true;
					goldDetailsCtrl.title = false;
					//$('.panel-heading').hide();
					//$('#confirmatinId').hide();
					//$('.wizard-step-number').hide();
					$('.lp-idfc-gold-investments #confirmatinId').hide();
					console.log('here');
					$('.lp-idfc-gold-investments .wizard-header').hide();
					goldDetailsCtrl.srNumber = csId;					
				}else{
					goldDetailsCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
					$('.lp-idfc-gold-investments .wizard-header').hide();
					goldDetailsCtrl.alert = {
						messages: {
							cd: headers('goldBondFTMsg')
						}
					};
					addAlert('cd', 'error', false);	
				}
				/*if(IdfcUtils.hasContentData(data)){
                    goldDetailsCtrl.responseFromCreateService   =   data;
                    goldDetailsCtrl.create_csid	= data.csId;
                    if(data.csSts   ==  "Success"){
                       // goldDetailsCtrl.fundTransfer();
                    }
                }*/
				
            }).error(function(error){
                goldDetailsCtrl.errorSpin = false;
                if (error.cd) {
                    IdfcError.checkTimeout(error);
					goldDetailsCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
				    $('.lp-idfc-gold-investments .wizard-header').hide();
                    if ((error.cd === '501')) {
                        goldDetailsCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    } else {
                        goldDetailsCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                       addAlert('cd', 'error', false);
                    }
                }
            });
		}

        /* Function to transfer the funds from the account selected to the gold pool account */
		/*goldDetailsCtrl.fundTransfer    =   function(){
			var newdate = new Date();
			var milliseconds  = Date.parse(newdate);
            var postData    =   {
			    'accountId':goldDetailsCtrl.investmentDetails.account,
				//'counterpartyAccount':IdfcConstants.GOLD_POOL_ACCOUNT,
				//'accountName':'',
				//'instructedAmount':goldDetailsCtrl.investmentDetails.totalAmount,
				//'instructedCurrency':'INR',
				//'txnMode':'IFT',
				//'paymentMode':'NON_RECURRING',
				//'paymentDescription':'Online SGB Purchase/CRM-SR '+goldDetailsCtrl.create_csid,
				//'type':'INTERNAL',
				'onDate':milliseconds,
				//'ifscCode':'',
				//'counterpartyName':'Gold Pool Accounts',
				//'flag':'false'
			   
            };
             postData   =   $.param(postData || {});

             var urlFundTransferGoldInvstEndPoint   =   lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('fundTransferForGoldInvestment'))+ '?rs=' + new Date().getTime();

             goldInvestments
             .setup({
                 urlFundTransferGoldInvstEndPoint   :   urlFundTransferGoldInvstEndPoint,
                 data   :   postData
             })
             .goldInvestmentFundTransfer()
             .success(function(data){

                if(IdfcUtils.hasContentData(data)){
                    goldDetailsCtrl.FundTransfer_txnId    =   data.txnId; 
					goldDetailsCtrl.FundTransfer_resComts	= 'Processed by BoC Sent to Operations';	
					goldDetailsCtrl.FundTransfer_stscd = 'Sent to Operation';
					goldDetailsCtrl.FundTransfer_stscdkey =	'100114';	

                lpCoreBus.publish('launchpad-retail.refreshAccountSummary1', {});
				//launchpad-retail.refreshAccountSummary
				lpCoreBus.publish('launchpad-business.refreshAccountSummary', {});	
				
                        goldDetailsCtrl.modifyGoldInvestmentDetails();                   
                }
             }).error(function(error){
                goldDetailsCtrl.errorSpin = false;
                if (error.cd) {
                    IdfcError.checkTimeout(error);
                    if ((error.cd === '501')) {
					goldDetailsCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
				    $('.lp-idfc-gold-investments .wizard-header').hide();
                        goldDetailsCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    } else { 
				goldDetailsCtrl.error_msg = error.rsn;
			    goldDetailsCtrl.FundTransfer_txnId = '';
				goldDetailsCtrl.FundTransfer_resComts	= 'Declined by the System';
				goldDetailsCtrl.FundTransfer_stscd = 'Declined by System';
				goldDetailsCtrl.FundTransfer_stscdkey =	'100046';
				      goldDetailsCtrl.modifyGoldInvestmentDetails();
                    }
                }
             });
		}

        /* Function to modify the status of the Gold Investment Details */
		/* goldDetailsCtrl.modifyGoldInvestmentDetails    =   function(){
		    var postData    =   {
				'csId'     : goldDetailsCtrl.create_csid,
                'txnRefId' : goldDetailsCtrl.FundTransfer_txnId,
				'resComts' : goldDetailsCtrl.FundTransfer_resComts,
				'stscd'	   : goldDetailsCtrl.FundTransfer_stscd,
				'stscdkey' : goldDetailsCtrl.FundTransfer_stscdkey
            };
            postData    =   $.param(postData || {});

            var urlModifyGoldInvstDetailsEndPoint   =   lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('modifyGoldInvestmentDetails'))+ '?rs=' + new Date().getTime();
            goldInvestments
            .setup({
                 urlModifyGoldInvstDetailsEndPoint  :   urlModifyGoldInvstDetailsEndPoint,
                 data   :   postData
            })
            .modifyGoldInvestmentDetails()
            .success(function(data){
                goldDetailsCtrl.errorSpin = false;
				
				if(goldDetailsCtrl.FundTransfer_stscdkey !=	'100114'){
				 goldDetailsCtrl.serviceError = true;
				 $('.lp-idfc-gold-investments #confirmatinId').hide();
				 $('.lp-idfc-gold-investments .wizard-header').hide();
                        goldDetailsCtrl.alert = {
                            messages: {
                                cd: goldDetailsCtrl.error_msg
                            }
                        };
                        addAlert('cd', 'error', false);				
				}else{				
                goldDetailsCtrl.saveSuccess = true;
                goldDetailsCtrl.terms = true;
                goldDetailsCtrl.purchaseDone = true;
                goldDetailsCtrl.done = true;
                goldDetailsCtrl.title = false;
                //$('.panel-heading').hide();
				//$('#confirmatinId').hide();
				//$('.wizard-step-number').hide();
				$('.lp-idfc-gold-investments #confirmatinId').hide();
				console.log('here');
				$('.lp-idfc-gold-investments .wizard-header').hide();

                goldDetailsCtrl.srNumber = goldDetailsCtrl.responseFromCreateService.csId;
				
				
			 }	
            }).error(function(error){
                goldDetailsCtrl.errorSpin = false;
                if (error.cd) {
                    IdfcError.checkTimeout(error);
					goldDetailsCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
				    $('.lp-idfc-gold-investments .wizard-header').hide();
                    if ((error.cd === '501')) {
                        goldDetailsCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    } else {
                        goldDetailsCtrl.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    }
                }
            });
		 }*/

		 /* Function to go back main page */
		 goldDetailsCtrl.goToMainPage = function(){

             goldDetailsCtrl.saveSuccess = false;
             goldDetailsCtrl.terms = false;
             goldDetailsCtrl.purchaseDone = false;
             goldDetailsCtrl.done = false;
             goldDetailsCtrl.emailSent = false;
             //$('.panel-heading').show();
			 //$('#confirmatinId').show();
			 //$('.wizard-step-number').show();
			$('.lp-idfc-gold-investments #confirmatinId').show();
			console.log('here');
			$('.lp-idfc-gold-investments .wizard-header').show();
		     $scope.wizardPreviousStep();
			goldDetailsCtrl.investmentDetails.tnCCheckboxError = false;			 
		     /*lpWidget.refreshHTML();*/
		     gadgets.pubsub.publish('refershData', 'true');
		 }

		   
         
		
		
		/* Function to download PDF */
        goldDetailsCtrl.downloadPDF = function(openType){
		setTimeout(function(){ $('.tooltip').hide(); }, 500);
			goldDetailsCtrl.errorSpin = true;
			var urlPDFEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('fetchPDF'))+ '?rs=' + new Date().getTime();
			//console.log(goldDetailsCtrl.create_csid);
			var postData    =   {
				"emailFlag" : "PDF"
			};
			postData    =   $.param(postData || {});

			goldInvestments
			.setup({
				urlPDFEndPoint  :   urlPDFEndPoint,
				data   :   postData
			})
			.generatePDF().success(function(response){
				goldDetailsCtrl.errorSpin = false;
				try {
					var file = new Blob([response], {
						type: 'application/pdf'
					});
				} catch (e) {
				}
				console.log(openType);
				if(openType === 'download'){
					saveAs(file, 'Sovereign_Gold_Bond_cyber_receipt_'+new Date().format('ddmmyyyyhhMM')+'.pdf');
				} else{
					//var fileURL = URL.createObjectURL(file);
					//window.open(fileURL);
					if (window.navigator && window.navigator.msSaveOrOpenBlob) {
						window.navigator.msSaveOrOpenBlob(file);
					}
					else {
						var fileURL = URL.createObjectURL(file);
						window.open(fileURL);
					}
				}
			}).error(function(error){
				goldDetailsCtrl.errorSpin = false;
				if (error.cd) {
					IdfcError.checkTimeout(error);
					goldDetailsCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
				    $('.lp-idfc-gold-investments .wizard-header').hide();
					if ((error.cd === '501')) {
						goldDetailsCtrl.alert = {
							messages: {
								cd: error.rsn
							}
						};
						addAlert('cd', 'error', false);
					} else {
						goldDetailsCtrl.alert = {
							messages: {
								cd: error.rsn
							}
						};
						addAlert('cd', 'error', false);
					}
				}
			});

    }
	
	/* Function to send Email */
		goldDetailsCtrl.sendEmail = function(parameter){
		setTimeout(function(){ $('.tooltip').hide(); }, 500);
			console.log(goldDetailsCtrl.investmentDetails);
			if(parameter === 'email'){
				goldDetailsCtrl.errorSpin = true;
			}
			var date = new Date();
			var purchaseDate = ("0" + date.getDate()).slice(-2)+"/"+("0" + (date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
			var urlPDFEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('fetchPDF'))+ '?rs=' + new Date().getTime();  
			var postData    =   {
				"emailFlag" : "Email"
			};
			postData = $.param(postData || {});
			goldInvestments
			 .setup({
				  urlPDFEndPoint  :   urlPDFEndPoint,
				  data   :   postData
			 })
			.generatePDF()
			.success(function(response){
				if(parameter === 'email'){
					goldDetailsCtrl.errorSpin = false;
					goldDetailsCtrl.emailSent = true;
				}
				console.log('Mail Sent');
			}).error(function(error){
			console.log('Mail not Sent');
			if(parameter === 'email'){
				goldDetailsCtrl.errorSpin = false;
				goldDetailsCtrl.error = {
					happened: true
				};
				if (error.cd) {
					IdfcError.checkTimeout(error);
					goldDetailsCtrl.serviceError = true;
					$('.lp-idfc-gold-investments #confirmatinId').hide();
				    $('.lp-idfc-gold-investments .wizard-header').hide();
					if ((error.cd === '501')) {
						goldDetailsCtrl.alert = {
							messages: {
								cd: error.rsn
							}
						};
						addAlert('cd', 'error', false);
					} else {
						goldDetailsCtrl.alert = {
							messages: {
								cd: error.rsn
							}
						};
						addAlert('cd', 'error', false);
					}
				}
				}
			});

		}
		goldDetailsCtrl.tnCIsChecked = function(){
			if(goldDetailsCtrl.investmentDetails.tnCCheckbox){
				goldDetailsCtrl.investmentDetails.tnCCheckboxError = false;
			}/*else{
				goldDetailsCtrl.investmentDetails.tnCCheckboxError = true;
			}*/
		}
	
}
		
	exports.GoldInvestmentsController = GoldInvestmentsController;	 
	exports.GoldHomeController = GoldHomeController;
	exports.GoldDetailsController = GoldDetailsController;
	
});