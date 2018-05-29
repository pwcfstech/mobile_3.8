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
    function MainCtrl(lpWidget, lpCoreUtils, lpCoreBus, lpPortal, MotorInsuranceService, IdfcConstants, lpCoreError,  $modal, $scope, $rootScope, $timeout) {
        console.log('IdfcConstants::::::::::::::::', IdfcConstants);
		var motorInsuranceCtrl = this;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
		
		var getMotorInsuranceBenefitsEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getMotorInsuranceBenefitsUrl'), {
            servicesPath: lpPortal.root
        });
		
		
		
		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
		
		motorInsuranceCtrl.imagePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/car.png';
		motorInsuranceCtrl.handPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/instant.png';
		motorInsuranceCtrl.giftPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/bonus.png';
		motorInsuranceCtrl.garagePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/cashless.png';
		motorInsuranceCtrl.assistancePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/roadside.png';
		motorInsuranceCtrl.bikePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/wheeler.png';
		motorInsuranceCtrl.bikeAssistancePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/cover.png';
		motorInsuranceCtrl.faqPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/fAQ.png';
	    motorInsuranceCtrl.policyPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/policy.png';
		motorInsuranceCtrl.claimPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/claim.png';
	    motorInsuranceCtrl.connectPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/connect.png';
		motorInsuranceCtrl.listPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/list.png';				
						
		$scope.alerts = [];

        function addAlert(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };
            $scope.alerts.push(customAlert);
        }


		motorInsuranceCtrl.motorSwitchFuction = function (caseStr) {
			switch (caseStr) {
				case 'carKnowMore':
					window.open(IdfcConstants.MOTOR_INS_CARINSURANCE_KNOWMORE);				
					break;
				case 'bikeKnowMore':
					window.open(IdfcConstants.MOTOR_INS_TWOWHEELER_KNOWMORE);						
					break;
				case 'motorFaq':
					window.open(IdfcConstants.MOTOR_INS_FAQ);					
					break;
				case 'motorPolicyWording':
					window.open(IdfcConstants.MOTOR_INS_POLICYWORDING_CAR);
					window.open(IdfcConstants.MOTOR_INS_POLICYWORDING_BIKE);					   
					break;
				case 'motorClaim':
					window.open(IdfcConstants.MOTOR_INS_CLAIM_PROCESS);						
					break;
				case 'motorList':
					window.open(IdfcConstants.MOTOR_INS_LISTOFGARAGES);				
					break;
				case 'motorDisclaimer':			
					window.open(IdfcConstants.MOTOR_INS_DISCLAIMER_TWO);
					//window.open(IdfcConstants.MOTOR_INS_DISCLAIMER_CAR);
					break;
				
			}
		};	
		
		motorInsuranceCtrl.iLMotorInsurance =  function(){ 		
		motorInsuranceCtrl.errorSpin = true;
		//motorInsuranceCtrl.errorSpinShow = true; //apptech
			var urlParams = {
				'PRODCODE':$rootScope.productNumberVariable
            };
            var postData = $.param(urlParams || {});
			
			MotorInsuranceService
			.setup({
				getMotorInsuranceBenefitsEndPoint: getMotorInsuranceBenefitsEndPoint
			})
			.motorInsuranceBenefitsService(postData)
			.success(function (data) {
			motorInsuranceCtrl.errorSpin = false;
			//motorInsuranceCtrl.errorSpinShow = false; //apptech
				var iLUrl=data.desc;
				// apptech mithun
				/*if(motorInsuranceCtrl.actionName === 'MOTOR_CAR_PRODUCT_CODE')
				   motorInsuranceCtrl.carUrl = iLUrl;
			    if(motorInsuranceCtrl.actionName === 'MOTOR_BIKE_PRODUCT_CODE') 
				   motorInsuranceCtrl.bikeUrl = iLUrl;	*/
				//window.open(iLUrl); // comment open this step apptech		
                 window.location.href = iLUrl;				
				// end
				//$("#motorModal").css("display", "none");
			    //$("body").css("overflow-y", "scroll");
			}).error(function (error) {
				//alert('error');	
                motorInsuranceCtrl.errorSpin = false;	
                //motorInsuranceCtrl.errorSpinShow = false; //apptech				
				if (error.cd) {
				$('#motrId').hide();
				 $("#btn_mot").attr("disabled", true);
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
		
		
		motorInsuranceCtrl.getConfirmation    =   function(productNumber){
		
		console.log(productNumber);
		if(productNumber === 'MOTOR_CAR_PRODUCT_CODE'){
			$rootScope.productNumberVariable = IdfcConstants.MOTOR_CAR_PRODUCT_CODE; // apptech
			//motorInsuranceCtrl.actionName = productNumber;
            //motorInsuranceCtrl.iLMotorInsurance();				
		}

		else if(productNumber === 'MOTOR_BIKE_PRODUCT_CODE'){
			$rootScope.productNumberVariable = IdfcConstants.MOTOR_BIKE_PRODUCT_CODE; //apptech
			//motorInsuranceCtrl.actionName = productNumber;
            //motorInsuranceCtrl.iLMotorInsurance();			
		}
		
		
			$scope.alerts = [];
			 $("#motorModal").css("display", "block"); 
			$("body").css("overflow", "hidden"); 
			
			$('#motrId').show();
			$("#btn_mot").removeAttr("disabled");
			
			// apptech mithun
			motorInsuranceCtrl.popup = true;
			// end
		}
		motorInsuranceCtrl.closemotorPopup = function(){
		    $("#motorModal").css("display", "none");
			$("body").css("overflow-y", "scroll");
			// apptech mithun
			motorInsuranceCtrl.popup = false;
			// end			
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
			motorInsuranceCtrl.gotoDashboard = function(){ 
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
					  motorInsuranceCtrl.gotoDashboard();
		   });

		   gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
			   console.log("device back GoBackInitiate handled");
			   if(localStorage.getItem("navigationFlag")) {
			   console.log("back if handled ");
			   if(motorInsuranceCtrl.popup){
				   motorInsuranceCtrl.closemotorPopup();
			   }
			   else {
				   gadgets.pubsub.publish("js.back", {
						   data: "ENABLE_HOME"
				   });
				   motorInsuranceCtrl.gotoDashboard();
			   }
			   }else {
				   console.log("back else handled ");
				   //gadgets.pubsub.publish("device.GoBack");
			   if(motorInsuranceCtrl.popup){
				   motorInsuranceCtrl.closemotorPopup();
			   }
			   else {				   
				   motorInsuranceCtrl.gotoDashboard();
			   }
			   }
			  
		   });		
		
		motorInsuranceCtrl.showBackButton = function() { 
			console.log('Back button called');
			gadgets.pubsub.publish("js.back", {
			data: "ENABLE_BACK"
			});
		};
        

        motorInsuranceCtrl.gotoNewTab = function(){
			if(motorInsuranceCtrl.actionName === 'MOTOR_CAR_PRODUCT_CODE'){
				window.open(motorInsuranceCtrl.carUrl);				
			}

			else if(motorInsuranceCtrl.actionName === 'MOTOR_BIKE_PRODUCT_CODE'){
				window.open(motorInsuranceCtrl.bikeUrl);			
			}	
			//$("#motorModal").css("display", "none");
			//$("body").css("overflow-y", "scroll");
            //motorInsuranceCtrl.showBackButton();
		   gadgets.pubsub.publish("wms.motorins.header.title", {
				   data: "Motor Insurance"
		   });	 			
		};
		
        motorInsuranceCtrl.call = function(tel){
                   console.log(tel);
                   var callPlugin = cxp.mobile.plugins['ContactFeature'];
                   if(callPlugin){
                    callPlugin.callPhoneNumber(null,null,tel);
                       }else{
                    console.log('Plugin not accessible');
                   }
		};		
		
	   gadgets.pubsub.subscribe("wms.changeTitle", function() {
		   console.log("wms.changeTitle called");
		   gadgets.pubsub.publish("wms.motorins.header.title", {
				   data: "Motor Insurance"
		   });			   

	   });		
		
        var initialize = function(){
		   motorInsuranceCtrl.errorSpinShow = true;	
		   //motorInsuranceCtrl.showBackButton();
		   gadgets.pubsub.publish("wms.motorins.header.title", {
				   data: "Motor Insurance"
		   });			   
           $timeout(function(){
			 motorInsuranceCtrl.errorSpinShow = false;  
		   }, 2000);	
           //motorInsuranceCtrl.iLMotorInsurance('MOTOR_CAR_PRODUCT_CODE');	
           //motorInsuranceCtrl.iLMotorInsurance('MOTOR_BIKE_PRODUCT_CODE');			   
		}; 
        initialize();		
		/** end **/			
    }

    /**
     * Export Controllers
     */
    exports.MainCtrl = MainCtrl;
});
