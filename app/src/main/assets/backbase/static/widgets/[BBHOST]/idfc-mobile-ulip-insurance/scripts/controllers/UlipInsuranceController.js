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
    function MainCtrl(lpWidget, lpCoreUtils, lpCoreError, lpCoreBus, UlipInsuranceService, IdfcConstants, lpPortal, $http, $modal, $scope) {
		var ulipInsuranceCtrl = this;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
		
		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
		
		var getUlipInsuranceQuoteEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getQuoteUlipInsuranceUrl'), {
            servicesPath: lpPortal.root
        });

		ulipInsuranceCtrl.eightPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/iF.png';
		ulipInsuranceCtrl.zeroPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/aC.png';
		ulipInsuranceCtrl.zeropurplePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/nPAC.png';
		ulipInsuranceCtrl.taxPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/tC.png';
		ulipInsuranceCtrl.thirteenPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/fMC.png';
		ulipInsuranceCtrl.tenPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/lC.png';
		ulipInsuranceCtrl.fourPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/ffs.png';
		ulipInsuranceCtrl.fourpurplePath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/fPR.png';
		ulipInsuranceCtrl.faqPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/fAQ.png';
		ulipInsuranceCtrl.policyPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/policy.png';
		ulipInsuranceCtrl.claimPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/claim.png';
		ulipInsuranceCtrl.connectPath = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/connect.png';
		
		
		ulipInsuranceCtrl.getLifeInsuranceQuote = function() {
		ulipInsuranceCtrl.errorSpin = true;
		var productCode = IdfcConstants.ULIP_PRODUCT_CODE;
		console.log(productCode);
			var urlParams = {
				'PLANCATEGORY':productCode 
            };
            var postData = $.param(urlParams || {});
		    UlipInsuranceService
			.setup({
				getUlipInsuranceQuoteEndPoint: getUlipInsuranceQuoteEndPoint
			})
			.ulipInsuranceGetQuoteService(postData)
			.success(function (data) {
			ulipInsuranceCtrl.errorSpin = false;
				//console.log('old123'+JSON.stringify(data));
				var responseArray = data.split('~');
				var responseXml = responseArray[0];
				var responseURL = responseArray[1];
				responseXml = responseXml.replace(/"/g, "'");
				responseXml = responseXml.replace(/\\n/g, "");
				responseXml = responseXml.replace(/\\/g, "");
				responseURL = responseURL.slice(0,-1);
				//console.log('old123'+responseURL);
				console.log('responseXml'+responseXml);
				sendDataUsingQueryString(responseXml,responseURL);
//				document.getElementById('ulipInsurance').action=responseURL;
//				document.getElementById("txtRequestData").value=responseXml;

//				$("#ulipModal").css("display", "none");
//			    $("body").css("overflow-y", "scroll");
				
//				document.getElementById('ulipInsurance').submit();
//				var formEle = document.getElementById('ulipInsurance');
//				console.log(formEle);
//				console.log(responseXml +" , "+responseURL);
				
			}).error(function (data) {
				//alert('error');
//				ulipInsuranceCtrl.errorSpin = false;
//                				if (error.cd) {
//                				$('#helthId').hide();
//                				$("#btn_health").attr("disabled", true);
//                                    if ((error.cd === '501')) {
//                                        $scope.alert = {
//                                            messages: {
//                                                cd: error.rsn
//                                            }
//                                        };
//                                        addAlert('cd', 'error', false);
//                                    } else {
//                                        $scope.alert = {
//                                            messages: {
//                                              cd: IdfcConstants.ICICI_ERROR
//                                            }
//                                        };
//                                        addAlert('cd', 'error', false);
//                                    }
//                                }
			});
		};

		function sendDataUsingQueryString(data, url) {
        		   window.location.href=url+"?txtRequestData="+data;
        		   console.log(url+"?txtRequestData="+data);
        		    $("#ulipModal").css("display", "none");
                    $("body").css("overflow-y", "scroll");
        		}
		
		
		
		ulipInsuranceCtrl.ulipSwitchFuction = function (caseStr) {
			switch (caseStr) {
				case 'ulipFundOptions':
					window.open(IdfcConstants.ULIP_INS_FUNDOPTIONS);
					break;
				case 'ulipKnowMore':
					window.open(IdfcConstants.ULIP_INS_KNOWMORE);
					break;
				case 'ulipFaq':
					window.open(IdfcConstants.ULIP_INS_FAQ);
					break;
				case 'ulipPolicyWording':
					window.open(IdfcConstants.ULIP_INS_POLICYWORDING);
					break;
				case 'ulipClaim':
					window.open(IdfcConstants.ULIP_INS_CLAIMPROCESS_CARE);
					//window.open(IdfcConstants.ULIP_INS_CLAIMPROCESS_FORM);
					break;
				case 'ulipDiscalimer':
					window.open(IdfcConstants.ULIP_INS_DISCALIMER);
					break;
				
			}
		};
		
		
		ulipInsuranceCtrl.getConfirmation = function(){
		$("#ulipModal").css("display", "block"); 
			$("body").css("overflow", "hidden"); 
			
		}
		ulipInsuranceCtrl.closeulipPopup = function(){
		$("#ulipModal").css("display", "none");
			$("body").css("overflow-y", "scroll");
			
		}
		ulipInsuranceCtrl.call = function (tel){
                   debugger;
                   console.log(tel)
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

        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);

    }

    /**
     * Export Controllers
     */
    exports.MainCtrl = MainCtrl;
});
