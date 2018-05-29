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
    function MainCtrl(lpWidget, lpCoreUtils, lpCoreBus,
    HealthInsuranceService, IdfcConstants, lpPortal, lpCoreError, $modal,$window,$timeout,$scope, $rootScope) {
     var healthInsuranceCtrl = this;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
		
		var getHealthInsuranceBenefitsEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getHealthInsuranceBenefitsUrl'), {
            servicesPath: lpPortal.root
        });
		
		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
		
		//healthInsuranceCtrl.productNumberVariable;

		healthInsuranceCtrl.calculate = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/calculate.png';
		healthInsuranceCtrl.hospital = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/hospital.png';
		healthInsuranceCtrl.taxBenefits = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/taxBenefits.png';
		healthInsuranceCtrl.list = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/list.png';
		healthInsuranceCtrl.maternityCover = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/maternityCover.png';
		healthInsuranceCtrl.healthInsurance = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/healthInsurance.png';
		healthInsuranceCtrl.topUpHealthInsurance = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/topUpHealthInsurance.png';
		healthInsuranceCtrl.claim = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/claim.png';
		healthInsuranceCtrl.connect = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/connect.png';
		healthInsuranceCtrl.fAQ = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/fAQ.png';
		healthInsuranceCtrl.policy = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/policy.png';
		
		
		$scope.alerts = [];

        function addAlert(code, type, timeout) {
            var customAlert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };
            $scope.alerts.push(customAlert);
        }
		
		healthInsuranceCtrl.iLHealthInsurance =  function(){
		healthInsuranceCtrl.errorSpin = true;
			var urlParams = {
				'PRODCODE':$rootScope.productNumberVariable
            };
            var postData = $.param(urlParams || {});
			
			HealthInsuranceService
			.setup({
				getHealthInsuranceBenefitsEndPoint: getHealthInsuranceBenefitsEndPoint
			})
			.healthInsuranceBenefitsService(postData)
			.success(function (data) {
			healthInsuranceCtrl.errorSpin = false;
				var iLUrl=data.desc;

				console.log(window);
				openLink(iLUrl);

			}).error(function (error) {
				//alert('error');
				healthInsuranceCtrl.errorSpin = false;
				if (error.cd) {
				$('#helthId').hide();
				$("#btn_health").attr("disabled", true);
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
		};

		function openLink(link) {
		            window.location.href=link;
        		    //$window.open(link,'_blank');
        		    $("#helthModal").css("display", "none");
                    $("body").css("overflow-y", "scroll");
        }

		healthInsuranceCtrl.healthSwitchFuction = function (caseStr) {
			switch (caseStr) {
				case 'healthCalculate':
					window.open(IdfcConstants.HEALTH_INS_CALCULATE);
					break;
				case 'healthBuyKnowmore':
					window.open(IdfcConstants.HEALTH_INS_KNOWMOREFORBUYHEALTHINSURANCE);
					break;
				case 'healthIncreaseKnowmore':
					window.open(IdfcConstants.HEALTH_INS_KNOWMOREFORHEALTHBOOSTER);
					break;
				case 'healthFaq':
					window.open(IdfcConstants.HEALTH_INS_FAQ);
					//window.open(IdfcConstants.HEALTH_INS_FAQ_BOSTER);
					break;
				case 'healthPolicyWording':
					window.open(IdfcConstants.HEALTH_INS_POLICYWORDING);
					//window.open(IdfcConstants.HEALTH_INS_POLICYWORDING_BOSTER);
					break;
				case 'healthClaim':
					window.open(IdfcConstants.HEALTH_INS_CLAIMPROCESS_CARE);
					//window.open(IdfcConstants.HEALTH_INS_CLAIMPROCESS_FORM);
					break;
				case 'healthHospitalList':
					window.open(IdfcConstants.HEALTH_INS_LISTOFNETWORK_HOSPITALS);
					break;
				case 'helthDisclaimer':
					window.open(IdfcConstants.WMS_HEALTH_Disclaimer_Buy);
					//window.open(IdfcConstants.WMS_HEALTH_Disclaimer_Booster);
					break;
				
			}
		};
		
		
		healthInsuranceCtrl.getConfirmation    =   function(productNumber){
		console.log('Hi');
		console.log(productNumber);
		if(productNumber === 'HEALTH_BUY_PRODUCT_CODE'){
			$rootScope.productNumberVariable = IdfcConstants.HEALTH_BUY_PRODUCT_CODE;
		}

		else if(productNumber === 'HEALTH_BOOSTER_PRODUCT_CODE'){
			$rootScope.productNumberVariable = IdfcConstants.HEALTH_BOOSTER_PRODUCT_CODE;
		}
		    $scope.alerts = [];
		    $("#helthModal").css("display", "block"); 
			$("body").css("overflow", "hidden"); 	
		
			
			$('#helthId').show();
			$("#btn_health").removeAttr("disabled");
		}
		healthInsuranceCtrl.closehelthPopup = function(){
		    $("#helthModal").css("display", "none");
			$("body").css("overflow-y", "scroll");
		
		}


		healthInsuranceCtrl.call = function (tel){
           var callPlugin = cxp.mobile.plugins['ContactFeature'];
           if(callPlugin){
            callPlugin.callPhoneNumber(null,null,tel);
               }else{
            console.log('Plugin not accessible');
           }
        };
		
	var deckPanelOpenHandler;
        deckPanelOpenHandler = function (activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                //initialize();
            }
        };

        gadgets.pubsub.subscribe("wms.changeTitle", function() {
		   console.log("wms.changeTitle called");
		   gadgets.pubsub.publish("wms.healthins.header.title", {
				   data: "Health Insurance"
		   });
	   });
		var initialize = function(){
		   healthInsuranceCtrl.errorSpin = true;	
		   //lifeInsuranceCtrl.showBackButton();
		   
			   gadgets.pubsub.publish("wms.healthins.header.title", {
					   data: "Health Insurance"
			   });			   
           $timeout(function(){
			 healthInsuranceCtrl.errorSpin = false;  
		   }, 2000);		   
		}; 

        initialize();


        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
	
    }

    /**
     * Export Controllers
     */
    exports.MainCtrl = MainCtrl;
	
});
