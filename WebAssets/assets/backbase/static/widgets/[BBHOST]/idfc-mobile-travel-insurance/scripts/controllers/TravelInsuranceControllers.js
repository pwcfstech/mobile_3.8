/**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {

    'use strict';
	
    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function MainCtrl( lpWidget, lpCoreUtils, lpCoreBus, TravelInsuranceService, IdfcConstants, lpCoreError, lpPortal, $modal, $scope, $rootScope, $timeout) {
     var travelInsuranceCtrl = this;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
		
		var getTravelInsuranceBenefitsEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getTravelInsuranceBenefitsUrl'), {
            servicesPath: lpPortal.root
        });
		
		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
		
		travelInsuranceCtrl.faqPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/fAQ.png';
		travelInsuranceCtrl.policyPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/policy.png';
		travelInsuranceCtrl.claimPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/claim.png';
		travelInsuranceCtrl.connectPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/connect.png';
		travelInsuranceCtrl.singlePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/single.png';
		travelInsuranceCtrl.multiplePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/multiple.png';
		travelInsuranceCtrl.seniorPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/senior.png';
		travelInsuranceCtrl.lossPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/baggage.png';
		travelInsuranceCtrl.medicalPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/medical.png';
		travelInsuranceCtrl.delayPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/delay.png';
		travelInsuranceCtrl.handPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/instant.png';
		
		$scope.alerts = [];

        function addAlert(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };
            $scope.alerts.push(customAlert);
        }
		
		
		travelInsuranceCtrl.travelSwitchFuction = function (caseStr) {
			switch (caseStr) {
				case 'travelSingleTripKnowMore':
					window.open(IdfcConstants.TRAVEL_INS_SINGLETRIP_KNOWMORE);
					break;
				case 'travelRoundTripKnowMore':
					window.open(IdfcConstants.TRAVEL_INS_MULTIROUNDTRIP_KNOWMORE);					
					break;
				case 'travelSeniorTripKnowMore':
					window.open(IdfcConstants.TRAVEL_INS_SENIORCITIZENTRAVELINSURANCE_KNOWMORE);
					break;
				case 'travelFaq':
					window.open(IdfcConstants.TRAVEL_INS_FAQ);					
					break;
				case 'travelPolicyWording':
					window.open(IdfcConstants.TRAVEL_INS_POLICYWORDING);					
					break;
				case 'travelClaim':
					window.open(IdfcConstants.TRAVEL_INS_CLAIMPROCESS);					
					break;
				case 'travelDisclaimer':
					window.open(IdfcConstants.TRAVEL_INS_DISCLAIMER);						
					break;
				
			}
		};
		
				
		travelInsuranceCtrl.iLTravelInsurance =  function(){
		travelInsuranceCtrl.errorSpin = true;
		//travelInsuranceCtrl.errorSpinShow = true; //apptech
		
			var urlParams = {
				'PRODCODE':$rootScope.productNumberVariable
            };
            var postData = $.param(urlParams || {});
			
			TravelInsuranceService
			.setup({
				getTravelInsuranceBenefitsEndPoint: getTravelInsuranceBenefitsEndPoint
			})
			.travelInsuranceBenefitsService(postData)
			.success(function (data) {
			travelInsuranceCtrl.errorSpin = false;
			//travelInsuranceCtrl.errorSpinShow = false; //apptech
				var iLUrl=data.desc;
				// apptech mithun
				/*if(travelInsuranceCtrl.actionName === 'TRAVEL_SINGLE_PRODUCT_CODE')
				   travelInsuranceCtrl.opUrl = iLUrl;
			    if(travelInsuranceCtrl.actionName === 'TRAVEL_MULTIPLE_PRODUCT_CODE') 
				   travelInsuranceCtrl.opUrl = iLUrl;
			    if(travelInsuranceCtrl.actionName === 'TRAVEL_SENIOR_PRODUCT_CODE') 
				   travelInsuranceCtrl.opUrl = iLUrl;*/
			   
				//window.open(iLUrl);
				window.location.href = iLUrl;
				//$("#travelModal").css("display", "none");
			    //$("body").css("overflow-y", "scroll");
			
			}).error(function (error) {
			travelInsuranceCtrl.errorSpin = false;
			//travelInsuranceCtrl.errorSpinShow = false; //apptech
				if (error.cd) {
				$('#travId').hide();
				$("#btn_travel").attr("disabled", true);				
                    if ((error.cd === '501')) {
                        $scope.alert = {
                            messages: {
                                cd: error.rsn
                            }
                        };
                        addAlert('cd', 'error', false);
                    } else {
                        $scope.alert = {
                            messages: {
                                cd: IdfcConstants.ICICI_ERROR
                            }
                        };
                        addAlert('cd', 'error', false);
                    }
                }
			});
		}	
		
		
		travelInsuranceCtrl.getConfirmation    =   function(productNumber){
		console.log(productNumber);
		if(productNumber === 'TRAVEL_SINGLE_PRODUCT_CODE'){
			$rootScope.productNumberVariable = IdfcConstants.TRAVEL_SINGLE_PRODUCT_CODE;
			//travelInsuranceCtrl.actionName = productNumber; // apptech 
			//travelInsuranceCtrl.iLTravelInsurance(); //apptech 
		}

		else if(productNumber === 'TRAVEL_MULTIPLE_PRODUCT_CODE'){
			$rootScope.productNumberVariable = IdfcConstants.TRAVEL_MULTIPLE_PRODUCT_CODE;
			//travelInsuranceCtrl.actionName = productNumber; // apptech 
			//travelInsuranceCtrl.iLTravelInsurance(); //apptech
		}
		else if(productNumber === 'TRAVEL_SENIOR_PRODUCT_CODE'){
			$rootScope.productNumberVariable = IdfcConstants.TRAVEL_SENIOR_PRODUCT_CODE;
			//travelInsuranceCtrl.actionName = productNumber; // apptech 
			//travelInsuranceCtrl.iLTravelInsurance(); //apptech
		}

			$scope.alerts = [];
			$("#travelModal").css("display", "block"); 
			$("body").css("overflow", "hidden"); 
			
			
			$('#travId').show();
			$("#btn_travel").removeAttr("disabled");
			
			//apptech mithun
			travelInsuranceCtrl.popup = true;
			//end
		}
		
		travelInsuranceCtrl.closetravelPopup = function(){
		    $("#travelModal").css("display", "none");
			$("body").css("overflow-y", "scroll");
			//apptech mithun
			travelInsuranceCtrl.popup = false;
			//end			
		}

		
		var deckPanelOpenHandler;
        deckPanelOpenHandler = function (activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                //initialize();
            }
        };

        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);

		
		/** App Tech mithun **/
			/** 
			* back to home button function
			*/			
			travelInsuranceCtrl.gotoDashboard = function(){ 
			   gadgets.pubsub.publish("launchpad-retail.backToDashboard");
			   gadgets.pubsub.publish("js.back", {
					   data: "ENABLE_HOME"
			   });			
			};			
		
		
		  // For back buttton pub-sub // Satrajit code on old widget // Jay
		   gadgets.pubsub.subscribe("native.back", function() {
			   console.log("native.back handled");
					 // gadgets.pubsub.publish(formdata.callingWidget);
					 /* gadgets.pubsub.publish("js.back", {
							  data: "ENABLE_HOME"
					  });*/
					  travelInsuranceCtrl.gotoDashboard();
		   });

		   gadgets.pubsub.subscribe("wms.changeTitle", function() {
			   console.log("wms.changeTitle called");
			   gadgets.pubsub.publish("wms.travelins.header.title", {
					   data: "Travel Insurance"
			   });			   

		   });		   
		   
		   
		   gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
			   console.log("device back GoBackInitiate handled");
			   if(localStorage.getItem("navigationFlag")) {
			   console.log("back if handled ");
				   if(travelInsuranceCtrl.popup){
				   travelInsuranceCtrl.closetravelPopup();
				   } else {			   
				   gadgets.pubsub.publish("js.back", {
						   data: "ENABLE_HOME"
				   });
				   travelInsuranceCtrl.gotoDashboard();
				   }
			   }else {
				   console.log("back else handled ");
				   //gadgets.pubsub.publish("device.GoBack");
				   if(travelInsuranceCtrl.popup){
				   travelInsuranceCtrl.closetravelPopup();
				   } else {
					 travelInsuranceCtrl.gotoDashboard();  
				   }
			   }
			  
		   });		
		
		travelInsuranceCtrl.showBackButton = function() { 
			console.log('Back button called');
			gadgets.pubsub.publish("js.back", {
			data: "ENABLE_BACK"
			});
		};
        
        travelInsuranceCtrl.gotoTab = function(){
			
				if(travelInsuranceCtrl.actionName === 'TRAVEL_SINGLE_PRODUCT_CODE')
				   window.open(travelInsuranceCtrl.opUrl);
			    if(travelInsuranceCtrl.actionName === 'TRAVEL_MULTIPLE_PRODUCT_CODE') 
				   window.open(travelInsuranceCtrl.opUrl);
			    if(travelInsuranceCtrl.actionName === 'TRAVEL_SENIOR_PRODUCT_CODE') 
				   window.open(travelInsuranceCtrl.opUrl);
			   				
				//$("#travelModal").css("display", "none");
			    //$("body").css("overflow-y", "scroll");			
			
		};
		
        travelInsuranceCtrl.call = function(tel){
                   console.log(tel);
                   var callPlugin = cxp.mobile.plugins['ContactFeature'];
                   if(callPlugin){
                    callPlugin.callPhoneNumber(null,null,tel);
                       }else{
                    console.log('Plugin not accessible');
                   }
		};		
		
        var initialize = function(){
		   travelInsuranceCtrl.errorSpinShow = true;	
		   //travelInsuranceCtrl.showBackButton();
		   gadgets.pubsub.publish("wms.travelins.header.title", {
				   data: "Travel Insurance"
		   });				   
           $timeout(function(){
			 travelInsuranceCtrl.errorSpinShow = false;  
		   }, 2000);		   
		}; 
        initialize();		
		/** end **/		
		
		
		
    }

    /**
     * Export Controllers
     */
    exports.MainCtrl = MainCtrl;
});
