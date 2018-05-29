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
    function MainCtrl( lpWidget, lpCoreUtils, lpCoreBus, lpCoreError,
		LifeInsuranceService, IdfcConstants, lpPortal, $http, $modal, $scope, $timeout, $q) {
		var lifeInsuranceCtrl = this;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;

		var partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/templates/partials';
		var getLifeInsuranceQuoteEndPoint = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('getQuoteLifeInsuranceUrl'), {
            servicesPath: lpPortal.root
        });
		lifeInsuranceCtrl.accidental = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/accidental.png';
		lifeInsuranceCtrl.benefit = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/benefit.png';
		lifeInsuranceCtrl.calculate = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/calculate.png';
		lifeInsuranceCtrl.umb = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/umb.png';
		lifeInsuranceCtrl.critical = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/critical.png';
		lifeInsuranceCtrl.tax = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/tax.png';
		lifeInsuranceCtrl.cover = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/cover.png';
		lifeInsuranceCtrl.claim = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/claim.png';
		lifeInsuranceCtrl.connect = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/connect.png';
		lifeInsuranceCtrl.fAQ = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/fAQ.png';
		lifeInsuranceCtrl.policy = lpCoreUtils.getWidgetBaseUrl(lpWidget) + '/images/policy.png';	
		
		lifeInsuranceCtrl.getLifeInsuranceQuote = function() {
		 var deferred = $q.defer();	
		
				lifeInsuranceCtrl.errorSpin = true;
				var productCode = IdfcConstants.LIFE_TERM_PRODUCT_CODE;
				var urlParams = {
					'PLANCATEGORY':productCode 
				};
				var postData = $.param(urlParams || {});
					LifeInsuranceService
					.setup({
						getLifeInsuranceQuoteEndPoint: getLifeInsuranceQuoteEndPoint
					})
					.lifeInsuranceGetQuoteService(postData)
					.success(function (data) {
					lifeInsuranceCtrl.errorSpin = false;
						console.log('old123'+JSON.stringify(data));
						var responseArray = data.split('~');
						var responseXml = responseArray[0];
						var responseURL = responseArray[1];
						responseXml = responseXml.replace(/"/g, "'");
						responseXml = responseXml.replace(/\\n/g, "");
						responseXml = responseXml.replace(/\\/g, "");
						responseURL = responseURL.slice(0,-1);
						console.log('old123'+responseURL);
						console.log('responseXml'+responseXml);
						
						document.getElementById('lifeInsurance').action=responseURL;
						document.getElementById("txtRequestData").value=responseXml;
						$("#lifeModal").css("display", "none");
						$("body").css("overflow-y", "scroll");
					
						//document.getElementById('lifeInsurance').submit();
						//alert('1');
						deferred.resolve('Success');
					}).error(function (data) {
						//alert('error');
						deferred.reject('error');
					});
					
					return deferred.promise;
		};

function asyncGreet(name) {
  // perform some asynchronous operation, resolve or reject the promise when appropriate.
  return $q(function(resolve, reject) {
    setTimeout(function() {
      if (okToGreet(name)) {
        resolve('Hello, ' + name + '!');
      } else {
        reject('Greeting ' + name + ' is not allowed.');
      }
    }, 1000);
  });
}		
		
		lifeInsuranceCtrl.submitForm = function(){ 
				var promise = lifeInsuranceCtrl.getLifeInsuranceQuote();
				promise.then(function(greeting) {
				  //alert('Success: ' + greeting);
				  //document.getElementById('lifeInsurance').submit();
				  $('#lifeInsurance').attr('action', 'http://google.com').unbind('submit').submit(); 
				}, function(reason) {
				  alert('Failed: ' + reason);
				}); 		
		  	
		};
		
		lifeInsuranceCtrl.lifeSwitchFuction = function (caseStr) {
			switch (caseStr) {
				case 'lifeFaq':
					window.open(IdfcConstants.life_ins_FAQ);
					break;
				case 'lifePolicyWording':
					window.open(IdfcConstants.life_ins_Policywording);
					break;
				case 'lifeClaim':
					window.open(IdfcConstants.life_ins_Claimprocess);
					break;
				case 'lifeKnowMore':
					window.open(IdfcConstants.life_ins_Knowmore);
					break;
				case 'lifeCalculate':
					window.open(IdfcConstants.life_ins_Calculate);
					break;
				case 'lifeDisclaimer':
					window.open(IdfcConstants.life_ins_Disclaimer);
					break;
				
			}
		};

		lifeInsuranceCtrl.getConfirmation = function(){
		$("#lifeModal").css("display", "block"); 
			$("body").css("overflow", "hidden"); 
			
			//apptech mithun
			lifeInsuranceCtrl.popup = true;
			//end
		
		}
		lifeInsuranceCtrl.closelifePopup = function(){
		$("#lifeModal").css("display", "none");
			$("body").css("overflow-y", "scroll");
			//apptech mithun
			lifeInsuranceCtrl.popup = false;
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
			lifeInsuranceCtrl.gotoDashboard = function(){ 
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
					  lifeInsuranceCtrl.gotoDashboard();
		   });

		   gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
			   console.log("device back GoBackInitiate handled");
			   if(localStorage.getItem("navigationFlag")) {
			   console.log("back if handled ");
				   if(lifeInsuranceCtrl.popup){
					   lifeInsuranceCtrl.closelifePopup();
				   } else {			   
				   gadgets.pubsub.publish("js.back", {
						   data: "ENABLE_HOME"
				   });
				   }
			   }else {
				   console.log("back else handled ");
				   //gadgets.pubsub.publish("device.GoBack");
				   if(lifeInsuranceCtrl.popup){
					   lifeInsuranceCtrl.closelifePopup();
				   } else {
				   lifeInsuranceCtrl.gotoDashboard();
				   }
			   }
			  
		   });		
		
		lifeInsuranceCtrl.showBackButton = function() { 
			console.log('Back button called');
			gadgets.pubsub.publish("js.back", {
			data: "ENABLE_BACK"
			});
		};
        

        var initialize = function(){
		   lifeInsuranceCtrl.errorSpin = true;	
		   lifeInsuranceCtrl.showBackButton();
           $timeout(function(){
			 lifeInsuranceCtrl.errorSpin = false;  
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

