/**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {

    'use strict';
    var $ = require('jquery');
    var constIDFC = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');

    function noLoanApplyNowCtrl($scope, lpCoreBus, lpCoreUtils, lpWidget, httpService, $http,lpPortal,lpCoreError,$anchorScroll) {
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        
	var noLoanApplyNowCtrl =  this;
    var transId = "";
    var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
    noLoanApplyNowCtrl.financial_Product = path + '/media/Financial Product.png';
    noLoanApplyNowCtrl.wip = path + '/media/wip.png';
    noLoanApplyNowCtrl.completed = path + '/media/completed.png';

	noLoanApplyNowCtrl.defaultApplyNow = false;
    noLoanApplyNowCtrl.srAvailable = false;        
    noLoanApplyNowCtrl.newSrNumber = false;
	noLoanApplyNowCtrl.srCreateSucess = false;
	noLoanApplyNowCtrl.defaultLandingPage = true;
        
	var loanAccountPrdCtgryKey = "72";
    var homeLoanPrdCdKey = "32";
    var homeLoanPrdCdKeyValue = "Home Loan";
    var personalLoanPrdCdKey = "33" ;
    var personalLoanPrdCdKeyValue = "Personal Loan";
    var lapPrdCdKey = "107";
    var lapPrdCdKeyValue = "Loan Against Property";        
    var resultSrExist;
    var srReqFromModule;
    var srReqFromModuleId;
    var prdCtgryKey;
    var prdCdKey;
    var prdCtgryData;
    var prdCtgryIdData;
    var mobNumberUpdate;
       

 
    var initialize = function() {
    //added for mobile for preventing dual login
          idfcHanlder.validateSession($http);
        noLoanApplyNowCtrl.applyLoansArray = [{
        	    prdCtgryId: homeLoanPrdCdKey,
            	prdCd: homeLoanPrdCdKeyValue
   		    }, {                
            	prdCtgryId: personalLoanPrdCdKey,
                prdCd: personalLoanPrdCdKeyValue
            }, {
                prdCtgryId: lapPrdCdKey,
                prdCd: lapPrdCdKeyValue
            }];          
        }
        noLoanApplyNowCtrl.selectLoanType = function(selectLoanType){            
            if(selectLoanType == "32"){
            	srReqFromModule = homeLoanPrdCdKeyValue;
                srReqFromModuleId = homeLoanPrdCdKey;
            }
            else if(selectLoanType == "33"){
            	srReqFromModule = personalLoanPrdCdKeyValue;
                srReqFromModuleId = personalLoanPrdCdKey;
            }
            else if (selectLoanType == "107"){
            	srReqFromModule = lapPrdCdKeyValue;
                srReqFromModuleId = lapPrdCdKey;
            }
            noLoanApplyNowCtrl.defaultApplyNow = false;
            noLoanApplyNowCtrl.srAvailable = false;        
            noLoanApplyNowCtrl.newSrNumber = false;
	    noLoanApplyNowCtrl.srCreateSucess = false;
            if(selectLoanType != null){
                validateSR(selectLoanType);
            }
        }
        
        function validateSR(loanTypeCode){           
           
        	var validateSRUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('checkLead'), {servicesPath: lpPortal.root});
        	var checkLeadIdSet = $.param({
            	'prdCtgryId': loanAccountPrdCtgryKey,
            	'prdCdId': loanTypeCode
        	});




           noLoanApplyNowCtrl.errorSpin = true;
        	var checkLeadApiCall;
        	checkLeadApiCall = $http({
            method: 'POST',
            url: validateSRUrl,
            data: checkLeadIdSet,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;'
            }
        	});
        	checkLeadApiCall.success(function(data) {
            	if (data != undefined && data != null && $.trim(data) != '') {
		        transId = data.transId;
		        noLoanApplyNowCtrl.cityArray= [{
                  id: 380001,
                  cityName: 'Ahmedabad'
                }, {
                id: 560078,
                  cityName: 'Bangalore'
              }, {
                  id: 600001,
                  cityName: 'Chennai'
              }, {
                  id: 110005,
                  cityName: 'Delhi'
              }, {
                  id: 400051,
                  cityName: 'Mumbai'
              }];


		
	noLoanApplyNowCtrl.salutationArray= [{
                  id: 1,
                  salutationName: 'Mr.'
              }, {
                id: 2,
                  salutationName: 'Mrs.'
              }, {
                  id: 4,
                  salutationName: 'Miss'
              }];             

		


            	    if(data.leadDetails != undefined && data.leadDetails != null && $.trim(data.leadDetails) != ''){
			noLoanApplyNowCtrl.error = {
                                happened: false
                        };
                	    angular.forEach(data.leadDetails, function(value, key) {
                    	    if(value.leadExists == "1"){                                
                        	    resultSrExist = "true";                            	
                            	noLoanApplyNowCtrl.srID = value.leadId;
                            	noLoanApplyNowCtrl.srStatus = value.leadStatus;
                            	noLoanApplyNowCtrl.appliedModuleValue = srReqFromModule;
                        	}
                        	else if(value.leadExists == "0"){
                            	resultSrExist = "false";
                        	}
                    	});
                        
                    }
            		else{
                	noLoanApplyNowCtrl.errorSpin = false;
                        noLoanApplyNowCtrl.error = {
                                happened: true,
                                msg: constIDFC.TECHNICAL_ERROR
                        };
            		}
			
		if(resultSrExist == "true"){
		noLoanApplyNowCtrl.srAvailable = true;
		}
		else if(resultSrExist == "false")
                    {
                        noLoanApplyNowCtrl.defaultApplyNow = true;
                        noLoanApplyNowCtrl.applyNow = data.userDetails;
			noLoanApplyNowCtrl.applyNow.salutation = "";

			noLoanApplyNowCtrl.applyNow.mobNbPrefix = "+91";
                        if(data.userDetails.mobNb != undefined && data.userDetails.mobNb != null){
                        if(data.userDetails.mobNb.length >= 10){
                            var TempMobNumber = data.userDetails.mobNb;
                            var mobNumberSlice = TempMobNumber.slice(-10);
//                            mobNumberUpdate = '+91'+mobNumberSlice; 

			
			var mobileStartNumber = mobNumberSlice.slice(0,1);
			if(mobileStartNumber == "7" || mobileStartNumber == "8" || mobileStartNumber == "9")
			{
                            noLoanApplyNowCtrl.applyNow.mobNb = mobNumberSlice;			}
			else
			{
				noLoanApplyNowCtrl.applyNow.mobNb = "";				
			}
                         					    
				                
                          }
                        }
                        noLoanApplyNowCtrl.applyNow.prdCd = srReqFromModule;    
                        noLoanApplyNowCtrl.applyNow.prdCdId = srReqFromModuleId;         
                    }
 
                noLoanApplyNowCtrl.errorSpin = false;
                }
            });
            checkLeadApiCall.error(function(data) {
                noLoanApplyNowCtrl.errorSpin = false;
                noLoanApplyNowCtrl.error = {
                    happened: true,
                    msg: constIDFC.TECHNICAL_ERROR
                };
            });
        }

        noLoanApplyNowCtrl.applyNowClick = function(){
            noLoanApplyNowCtrl.defaultApplyNow = false;
	    noLoanApplyNowCtrl.defaultLandingPage = false;
            noLoanApplyNowCtrl.newSrNumber = true;
        }

	noLoanApplyNowCtrl.backToLoans =function(){
	    noLoanApplyNowCtrl.defaultLandingPage = true;
	    noLoanApplyNowCtrl.newSrNumber = false;
		$scope.$apply();
		
	}


        noLoanApplyNowCtrl.newSRApplyNow = function(applyNowData){
	    $anchorScroll();
            var prdCtgryData = "Assets"; 
            var prdCtgryIdData = loanAccountPrdCtgryKey;
            noLoanApplyNowCtrl.errorSpin = true;
            var newSRApplyNowUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('createSR'), {servicesPath: lpPortal.root});
		
		if(newSRApplyNowUrl == undefined)
		{
			newSRApplyNowUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('createSr'), {servicesPath: lpPortal.root});

		}



		var mobNumber = '91'+applyNowData.mobNb;

            var data1 = $.param({
                city: applyNowData.city,
                mobNb: mobNumber,
                emlAddr: applyNowData.emlAddr,
                prdCtgry: prdCtgryData,
                prdCd: applyNowData.prdCd,
                prdCtgryId: prdCtgryIdData,
                prdCdId: applyNowData.prdCdId,
		'slttnNm':applyNowData.salutation
                });
		var sRReq;
          	sRReq = $http({
                	method: 'POST',
                	url: newSRApplyNowUrl,
	                data: data1,
        	        headers: {
                		'Accept': 'application/json',
				        'Content-Type': 'application/x-www-form-urlencoded;',
				        'transId': transId
                	}
                });
           	sRReq.success(function (data) {
                	noLoanApplyNowCtrl.errorSpin = false;
			noLoanApplyNowCtrl.srCreateSucess = true;
			noLoanApplyNowCtrl.srAvailable = false;
                	noLoanApplyNowCtrl.srID = data.ldId;
                	noLoanApplyNowCtrl.defaultApplyNow = false;
                	noLoanApplyNowCtrl.newSrNumber = false;
            	});
            	sRReq.error(function (data) {
    			noLoanApplyNowCtrl.srCreateSucess = false;
    			noLoanApplyNowCtrl.srAvailable = false;
    			noLoanApplyNowCtrl.defaultApplyNow = false;
                	noLoanApplyNowCtrl.newSrNumber = false;
                	noLoanApplyNowCtrl.errorSpin = false;
                	noLoanApplyNowCtrl.error = {
                    		happened: true,
                    		msg: constIDFC.TECHNICAL_ERROR
                	}; 
            	});
       }       
    
      // Widget Refresh code
    // cross sell start
          var deckPanelOpenHandler;
          deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
              lpCoreBus.flush('DeckPanelOpen');
              lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
              lpWidget.refreshHTML(function(bresView){
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
    exports.noLoanApplyNowCtrl = noLoanApplyNowCtrl;
});
