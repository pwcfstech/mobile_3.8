/**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {
    'use strict';
    var constIDFC = require('idfccommon').idfcConstants;
    var $ = require('jquery');
    var idfcHanlder = require('idfcerror');

    function MainCtrl($scope, lpCoreBus, lpCoreUtils, lpWidget, httpService, $http,lpPortal,lpCoreError,$anchorScroll, $timeout) {
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        
        var applyNowCtrl =  this;
        var transId = "";
        var casaAccountPrdCtgryKey = "73";        
        var loanAccountPrdCtgryKey = "72";
        var casaAccountPrdCdKey = "29";
        var homeLoanPrdCdKey = "32";
        var personalLoanPrdCdKey = "33" ;
        var lapPrdCdKey = "107";
        var fdPrdCdKey = "75";
        var rdPrdCdKey = "142";
        var resultSrExist;
        var srReqFromModule;
        var srReqFromModuleId;
        var prdCtgryKey;
        var prdCdKey;
        var prdCtgryData;
        var prdCtgryIdData;
        var mobNumberUpdate;
        applyNowCtrl.displayAptDate = false;
        var selectedApptdDt;
        var sidebarClickGlobal;
        applyNowCtrl.date = new Date();
      	var currentDate  = new Date();
      	var currentyear = currentDate.getFullYear();
      	var currentMonth = currentDate.getMonth();
      	var currentDateDate = currentDate.getDate();	
      	var curretDay = currentDate.getDay();
      	var noOfDaysToAdd;
	     if(curretDay == 4)
		      noOfDaysToAdd = 4;
	     else
		      noOfDaysToAdd = 3;
	     applyNowCtrl.date = currentDate.setDate(currentDate.getDate() + noOfDaysToAdd);
	     var tempDate = new Date(applyNowCtrl.date);
	     var fromDateyear = tempDate.getFullYear();
    	 var fromDateMonth = tempDate.getMonth();
    	 var fromDateDate = tempDate.getDate();
    	 var currentMonthNow = currentMonth+1;
    	 var addDaysForMonth = daysInMonth(currentMonthNow,currentyear);
            function daysInMonth(currentMonthNow,currentyear) {
        	return new Date(currentyear, currentMonthNow, 0).getDate();
        }
    	 var tempCurrentDate = new Date();
    	 var toDateData = tempCurrentDate.setDate(tempCurrentDate.getDate() + (addDaysForMonth-1));
    	 var toDateTempDate = new Date(toDateData);
    	 var toDateyear = toDateTempDate.getFullYear();
    	 var toDateMonth = toDateTempDate.getMonth();
    	 var toDateDate = toDateTempDate.getDate();
         applyNowCtrl.persistAptDate = {};
    	 applyNowCtrl.dates ={'fromDate':new Date(fromDateyear,fromDateMonth,fromDateDate),'toDate':new Date(toDateyear,toDateMonth,toDateDate)};
  
    	applyNowCtrl.openAptCalendar = function($event) {
    			
    			$event.preventDefault();
    			$event.stopPropagation();
    			applyNowCtrl.persistAptDate.opened = true;
    		};
    	
	
    	applyNowCtrl.fromDate = tempDate;
    	applyNowCtrl.toDate = toDateTempDate;

    	applyNowCtrl.disableDates = function(date,mode){
		    return(mode ==='day' && (date.getDay() === 0));
    	};

    var initialize = function() {

    //added for mobile for preventing dual login
          idfcHanlder.validateSession($http);
            applyNowCtrl.errorSpin = true;
            var path = lpCoreUtils.getWidgetBaseUrl(lpWidget);
           applyNowCtrl.financial_Product = path + '/media/Financial Product.png';
           applyNowCtrl.wip = path + '/media/wip.png';
           applyNowCtrl.completed = path + '/media/completed.png';
            applyNowCtrl.defaultApplyNow = false;
            applyNowCtrl.srAvailable = false;        
            applyNowCtrl.newSrNumber = false;
      	    applyNowCtrl.srCreateSucess = false;
  
   		applyNowCtrl.cityArray= [{
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
        applyNowCtrl.salutationArray= [{
        	id: 1,
        		salutationName: 'Mr.'
      		}, {
        	id: 2,
        		salutationName: 'Mrs.'
      		}, {
          	id: 4,
        		salutationName: 'Miss'
      	}];

        var loanSummaryClickData = localStorage.getItem("srRequestData");
        if(loanSummaryClickData != undefined && loanSummaryClickData != null && $.trim(loanSummaryClickData) != ''){
        	validateSR(loanSummaryClickData);
       	}
	    else{
    	    checkGlobalVariable();
       }
    }
    function validateSR (sidebarClick){
      if(sidebarClick != undefined && sidebarClick != null && $.trim(sidebarClick) != ''){
       if(sidebarClick == "casaAccount"){
              prdCtgryKey = casaAccountPrdCtgryKey;
              prdCdKey = casaAccountPrdCdKey;
              srReqFromModule = "Saving Account";
              srReqFromModuleId = casaAccountPrdCdKey;
              applyNowCtrl.displayAptDate = true;
          }
          else if(sidebarClick == "fdRequest"){
              prdCtgryKey = casaAccountPrdCtgryKey;
              prdCdKey = fdPrdCdKey;
              srReqFromModule = "Fixed Deposit";
              srReqFromModuleId = fdPrdCdKey;
              applyNowCtrl.displayAptDate = true;
          }
          else if(sidebarClick == "rdRequest"){
              prdCtgryKey = casaAccountPrdCtgryKey;
              prdCdKey = rdPrdCdKey;
              srReqFromModule = "Recurring Deposit";
              srReqFromModuleId = rdPrdCdKey;
              applyNowCtrl.displayAptDate = false;
          }
          else if(sidebarClick == "homeLoan"){
              prdCtgryKey = loanAccountPrdCtgryKey;
              prdCdKey = homeLoanPrdCdKey;
              srReqFromModule = "Home Loan";
              srReqFromModuleId = homeLoanPrdCdKey;
              applyNowCtrl.displayAptDate = false;
          }
          else if(sidebarClick == "loanAgainstProperty"){
              prdCtgryKey = loanAccountPrdCtgryKey;
              prdCdKey = lapPrdCdKey;
              srReqFromModule = "Loan Against Property";
              srReqFromModuleId = lapPrdCdKey;
              applyNowCtrl.displayAptDate = false;
          }
          else if(sidebarClick == "personalLoan"){
              prdCtgryKey = loanAccountPrdCtgryKey;
              prdCdKey = personalLoanPrdCdKey;
              srReqFromModule = "Personal Loan";
              srReqFromModuleId = personalLoanPrdCdKey;
              applyNowCtrl.displayAptDate = false;
          }
        }
        var validateSRUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('checkLead'), {servicesPath: lpPortal.root});
            var checkLeadIdSet = $.param({
            'prdCtgryId': prdCtgryKey,
            'prdCdId': prdCdKey
        });            
        
        applyNowCtrl.errorSpin = true;
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
            if(data.leadDetails != undefined && data.leadDetails != null && $.trim(data.leadDetails) != ''){
            	applyNowCtrl.error = {
                	happened: false
              	};
              	angular.forEach(data.leadDetails, function(value, key) {
                if(value.leadExists == "1"){                                
                	resultSrExist = "true";
                  	applyNowCtrl.srAvailable = true;
                  	applyNowCtrl.srID = value.leadId;
                  	applyNowCtrl.srStatus = value.leadStatus;
                  	applyNowCtrl.appliedModuleValue = srReqFromModule;
                }
                else if(value.leadExists == "0"){
                  	resultSrExist = "false";
                }
              });
          	}
          	else{
            	applyNowCtrl.errorSpin = false;
            	applyNowCtrl.error = {
              		happened: true,
              		msg: constIDFC.TECHNICAL_ERROR
                };
            }
            if(resultSrExist == "false")
            {
            	applyNowCtrl.defaultApplyNow = true;
                applyNowCtrl.applyNow = data.userDetails;
	            applyNowCtrl.applyNow.salutation = "";
                applyNowCtrl.applyNow.mobNbPrefix = "+91";
                if(data.userDetails.mobNb != undefined && data.userDetails.mobNb != null){
                    if(data.userDetails.mobNb.length >= 10){                        	    	
						var TempMobNumber = data.userDetails.mobNb;
                    	var mobNumberSlice = TempMobNumber.slice(-10);
						var mobileStartNumber = mobNumberSlice.slice(0,1);
						if(mobileStartNumber == "7" || mobileStartNumber == "8" || mobileStartNumber == "9")
						{
							applyNowCtrl.applyNow.mobNb = mobNumberSlice;
						}
						else
						{
							applyNowCtrl.applyNow.mobNb = "";				
						}
		            }
                }
                applyNowCtrl.applyNow.prdCd = srReqFromModule;    
                applyNowCtrl.applyNow.prdCdId = srReqFromModuleId;         
            	}
            	applyNowCtrl.errorSpin = false;
        	}
    	});
		checkLeadApiCall.error(function(data) {
				applyNowCtrl.errorSpin = false;
                applyNowCtrl.error = {
                	happened: true,
                    msg: constIDFC.TECHNICAL_ERROR
                };
        });
        localStorage.removeItem("srRequestData");
    }

    applyNowCtrl.applyNowClick = function(){
        localStorage.removeItem("srRequestData");
        applyNowCtrl.defaultApplyNow = false;
        applyNowCtrl.newSrNumber = true;
    }

    applyNowCtrl.newSRApplyNow = function(applyNowData){
        localStorage.removeItem("srRequestData");
        $anchorScroll();
        applyNowCtrl.errorSpin = true;
        if(applyNowData.apptDt != undefined){
	        var timeSet = new Date();
	        var h = timeSet.getHours();
	        var m = timeSet.getMinutes();
		    if(m < 10){m = '0'+m;}
	        var s = timeSet.getSeconds();
		    var selectedDate = applyNowData.apptDt;
		    var SelDay =  selectedDate.getDate();
		    if(SelDay < 10){SelDay = '0'+SelDay;}
		    var tmpMonth =  selectedDate.getMonth();
		    var selMonth = tmpMonth+1;
		    if(selMonth < 10){selMonth = '0'+selMonth;}
		    var Selyear =  selectedDate.getFullYear();
	        var modifiedDate =  SelDay+"/"+selMonth+"/"+Selyear; //ex out: "18/01/10"
	        selectedApptdDt =  modifiedDate +' '+h+':'+m+':'+s;
        }
        if(applyNowData.prdCdId == casaAccountPrdCdKey|| applyNowData.prdCdId == fdPrdCdKey|| applyNowData.prdCdId == rdPrdCdKey){
            prdCtgryData = "Liability";
            prdCtgryIdData = casaAccountPrdCtgryKey;
        }
        else if(applyNowData.prdCdId == homeLoanPrdCdKey || applyNowData.prdCdId == personalLoanPrdCdKey || applyNowData.prdCdId == lapPrdCdKey){
            prdCtgryData = "Assets";
            prdCtgryIdData = loanAccountPrdCtgryKey;
        }
	    var mobNumber = '91'+applyNowData.mobNb;
        var newSRApplyNowUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('createSR'), {servicesPath: lpPortal.root});

		if(newSRApplyNowUrl == undefined){
    		newSRApplyNowUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('createSr'), {servicesPath: lpPortal.root});
	    }
        var data1 = $.param({
            'city': applyNowData.city,
            'mobNb': mobNumber,
            'emlAddr': applyNowData.emlAddr,
            'prdCtgry': prdCtgryData,
            'prdCd': applyNowData.prdCd,
            'prdCtgryId': prdCtgryIdData,
            'prdCdId': applyNowData.prdCdId,              
    		'slttnNm':applyNowData.salutation,
	        'apptDt':selectedApptdDt
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
            applyNowCtrl.errorSpin = false;
            applyNowCtrl.srCreateSucess = true;
	        applyNowCtrl.srAvailable = false;
            applyNowCtrl.srID = data.ldId;
            applyNowCtrl.defaultApplyNow = false;
            applyNowCtrl.newSrNumber = false;
        });
        sRReq.error(function (data) {
		        applyNowCtrl.srCreateSucess = false;
		        applyNowCtrl.srAvailable = false;
		        applyNowCtrl.defaultApplyNow = false;
                applyNowCtrl.newSrNumber = false;
                applyNowCtrl.errorSpin = false;
                applyNowCtrl.error = {
                    happened: true,
                    msg: constIDFC.TECHNICAL_ERROR
                };
        });
    }

    //subscribe event to navigate new request
    gadgets.pubsub.subscribe("native.back", function(evt) {
        if ($scope.errorSpin != undefined) {
            $scope.openNewReq();
        }
    });
    var checkGlobalVariable = function(){
        var clickData;
        var globalVariablePlugin = cxp.mobile.plugins['GlobalVariables'];
        if (globalVariablePlugin) {
	        var isSRSuccessCallback = function(data) {
		        var sidebarClickData = data['sidebarClickFlag'];
		        if(sidebarClickData != undefined){
		            if(sidebarClickData == 'casaAccount'){
		                clickData = 'casaAccount';
		            }
		            else if(sidebarClickData == 'fdRequest'){
		                clickData = 'fdRequest';
		            }
		            else if(sidebarClickData == 'rdRequest'){
		                clickData = 'rdRequest';
		            }
		            else if(sidebarClickData == 'homeLoan'){
		                clickData = 'homeLoan';
		            }
		            else if(sidebarClickData == 'loanAgainstProperty'){
		                clickData = 'loanAgainstProperty';
		            }
		            else if(sidebarClickData == 'personalLoan'){
		                clickData = 'personalLoan';
		            }
		            validateSR(clickData);
		        }
		        else {
		            console.log('Failure: ' + JSON.stringify(data));
		        }
		    };
        	var isSRFailureCallback = function(data) {
            	console.log('Something really bad happened while fetching Asset Flag');
        	};
	    	globalVariablePlugin.getSRrequest(
            	isSRSuccessCallback,
            	isSRFailureCallback
        	);
   		} else {
            console.log('Cant find Plugin');
       }
    }

	    applyNowCtrl.cancelClick = function(){
            applyNowCtrl.defaultApplyNow = true;
            applyNowCtrl.srAvailable = false;
            applyNowCtrl.newSrNumber = false;
            applyNowCtrl.srCreateSucess = false;
        }
        //added for mobile
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
	        gadgets.pubsub.publish("device.GoBack");
        });

        initialize();
          /* $timeout(function(){
                 gadgets.pubsub.publish('cxp.item.loaded', {
                     id: widget.id
                 });
             }, 10);
          widget.features.pubsub.publish('bb.item.loaded', {id:widget.id});
*/
    }
    exports.applyNowController = MainCtrl;
});
