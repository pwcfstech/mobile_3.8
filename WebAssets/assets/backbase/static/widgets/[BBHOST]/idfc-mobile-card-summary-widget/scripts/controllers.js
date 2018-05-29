    /**
 * Controllers
 * @module controllers
 */
define(function (require, exports) {


    'use strict';
var $ = require('jquery');
    /**
     * Main controller
     * @ngInject
     * @constructor
     */
var idfcHanlder = require('idfcerror');

function CardDetailsWidgetController(WidgetModel, lpWidget, lpCoreUtils, lpCoreError, $scope, $http, $timeout, i18nUtils, lpCoreBus, lpPortal) {


	var initialize = function() {

    			//Session Management Call
    			idfcHanlder.validateSession($http);
    			};
    $scope.isInternatinalFlagOn=false;
	$scope.errorMessage = null;
	$scope.crdDetails = null;

        this.model = WidgetModel;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
		var deckPanelOpenHandler;

			deckPanelOpenHandler = function(activePanelName) {

            if (activePanelName === lpWidget.parentNode.model.name) {
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
                //added for mobile by commenting above code
                gadgets.pubsub.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView) {
                    lpWidget.parentNode = bresView.parentNode;
                });
            }
        };

        //added for mobile
		//gadgets.pubsub.subscribe('launchpad-retail.cardSummary');

         /* Commenting and replacing by below code
         		for mobile
		  var crdSummSub =lpCoreBus.subscribe('launchpad-retail.cardSummary', function(data) {
            if (undefined !== data){
				
				$scope.fromCardWidgets = true;
				$scope.crdDetails = data; 
            }else{
            	$scope.fromCardWidgets = false;
				
            }
        });*/

            var crdSummSub =gadgets.pubsub.subscribe('launchpad-retail.cardSummary', function(data) {
                if (undefined !== data){

                    $scope.fromCardWidgets = true;
                    $scope.crdDetails = data;
                }else{
                    $scope.fromCardWidgets = false;

                }
            });
        
	lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
	//added for mobile
	gadgets.pubsub.subscribe('DeckPanelOpen', deckPanelOpenHandler);
        /* 	$scope.detail=[{"crdno":"1111-xxxx-xxxx-1111" , "acc" : "00001132424234234" , "status" : "open",
         "expiry" : "12-01-2012"},{"crdno":"1111-xxxx-xxxx-1111" , "acc" : "00001132424234234" , "status" : "Temporary Blocked",
         "expiry" : "11-01-2012"},{"crdno":"1111-xxxx-xxxx-1111" , "acc" : "00001132424234234" , "status" : "open",
         "expiry" : "12-01-2012"},{"crdno":"1111-xxxx-xxxx-1111" , "acc" : "00001132424234234" , "status" : "Active",
         "expiry" : "01-01-2012"},{"crdno":"1111-xxxx-xxxx-1111" , "acc" : "00001132424234234" , "status" : "open",
         "expiry" : "11-01-2012"},{"crdno":"1111-xxxx-xxxx-1111" , "acc" : "00001132424234234" , "status" : "Temporary Blocked",
         "expiry" : "13-01-2012"}]; */
    $scope.detail = {};
    $scope.issue = '';
    $scope.issue = '';
		$scope.cardDetailsEndPoint = lpWidget.getPreference('cardDetailsSrc');

        var cardDetailsURL = lpCoreUtils.resolvePortalPlaceholders($scope.cardDetailsEndPoint, {
            servicesPath: lpPortal.root
        });
        var request = $http({
            method: 'GET',
            url: cardDetailsURL,
            data: null,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;'
            }

        });
		request.success(function (data, status, headers, config) {
			//$scope.issue = dateFormat(data.crdDtls[0].actvtnDt, 'dd-mmm-yyyy');
            $scope.detail = data.crdDtls;
			 $scope.detail.sort(sortByName);
            $scope.maskAccountNo($scope.detail);
            $scope.changeStatusFormat($scope.detail);   //method call for change status format
			for(var i = 0; i < $scope.detail.length; i++)
			{
				for(var innerCount = 0; innerCount < $scope.detail[i].acctDtls.length; innerCount++){
					$scope.detail[i].acctDtls[innerCount].acctNb = $scope.detail[i].acctDtls[innerCount].acctNb.replace(/^0+/, '');
				}
				//$scope.detail[i].expryDt = dateFormat($scope.detail[i].expryDt, 'dd-mmm-yyyy');
			}
			
			
			if($scope.fromCardWidgets){
					
 				 for(var cardSummaryObjCount in $scope.detail) {
					if($scope.crdDetails.maskCrdNb == $scope.detail[cardSummaryObjCount].crdNb) {
						$scope.detail1 = $scope.detail[cardSummaryObjCount];
					}
				}
		   
          		$scope.detail1.showfull = true;
			
			}else{
				$scope.openFirstCardsDetails();
			}
			
			console.log(data.crdDtls[0].acctDtls[0].acctNb);
			console.log(data);
            $scope.errorSpin = false;

        })['catch'](function (error) {
			//ctrl.loading = false;
            if (error.data.cd) {
			//alert("data.cd.ordersModel.."+data.cd);
                // If session timed out, redirect to login page
            	idfcHanlder.checkTimeout(error.data);
                // If service not available, set error flag
               //$scope.globalerror = idfcError.checkGlobalError(error.data);



                if ((error.data.cd === '302')) {

                        $scope.error = {
                        				happened: true,
                                        msg: "Oops, none of your cards are active right now."//error.data.rsn
                        };
				}
				//added else if block to solve issue 5620
				else if ((error.data.cd === '799')) {

                         $scope.error = {
                                        happened: true,
                                         msg: "Oops, none of your cards are active right now."//error.data.rsn
                         };
                }
				else{
				        $scope.error = {
                				happened: true,
                					msg: error.data.rsn //"Oops, none of your cards are active right now."//error.data.rsn
                					};
				}
                /*$scope.error = {
				happened: true,
					msg: error.data.rsn //"Oops, none of your cards are active right now."//error.data.rsn
					};*/
                $scope.errorMessage = error.msg; //"Oops, none of your cards are active right now.";//error.msg;
                console.log("errmsg:"+$scope.errorMessage);
            }
    });
	
	 function sortByName(x,y) {
             return ((x.crdSts == y.crdSts) ? 0 : ((x.crdSts > y.crdSts) ? 1 : -1 ));
             }

		
		$scope.changeStatusFormat=function(detail){                                 //method definition for changing status format
			for(var i = 0; i < $scope.detail.length; i++)
			{
				if($scope.detail[i].crdSts == 'ACTIVE')
					{
					
					$scope.detail[i].crdSts = 'Active';
						
					}else if($scope.detail[i].crdSts == 'BLOCKED')
					{
						
						$scope.detail[i].crdSts = 'Temporarily Blocked';
							
					}else if($scope.detail[i].crdSts == 'INACTIVE')
					{
						
						$scope.detail[i].crdSts = 'Inactive';
						$scope.detail[i].actvtnDt = 'Not Activated';
					}else
						{
						
						$scope.detail[i].crdSts = 'Permanently Blocked';
						}
				
			}	
			
		};
		$scope.maskAccountNo = function(listOfAccNo) {

			for (var countNo in listOfAccNo){
				var accountNumber = listOfAccNo[countNo].crdNb;
				var nonMaskedAccStart = accountNumber.substring(0,4);
				var nonMaskedAccEnd = accountNumber.substring(accountNumber.length-4,accountNumber.length);
				var maskPart = repeat('X', accountNumber.length-9);
				// $scope.detail[countNo].crdNb = nonMaskedAccStart+'-'+maskPart.substring(0,4)+'-'+maskPart.substring(4,8)+'-'+nonMaskedAccEnd;
				$scope.detail[countNo].crdNb = nonMaskedAccStart+' '+maskPart.substring(0,4)+' '+maskPart.substring(4,8)+' '+nonMaskedAccEnd;

			}

		};
		
		var repeat = function(String, count) {
			return count > 0 ? String + repeat(String, count - 1) : String;
		};
   
		$scope.detail1 = [];
		$scope.junk = function(x)
		{
			$scope.rdView = true;
			$scope.detail1 = x;
			console.log(x);
		};
		$scope.rdSummary = function() {
			$(window).scrollTop(0);
            $scope.rdView = false;
            lpWidget.refreshHTML();
        };
        $scope.openCardSummary = function (cardSummaryObj) {

            $scope.detail1 = cardSummaryObj;

			 for(var cardSummaryObjCount in $scope.detail) {
				if(cardSummaryObj.crdNb != $scope.detail[cardSummaryObjCount].crdNb) {
					$scope.detail[cardSummaryObjCount].showfull = false;
				}
			}
            cardSummaryObj.showfull = !cardSummaryObj.showfull;
 			var cardSummaryNo = cardSummaryObj.crdNb;
 			console.log('cardSummaryNo>>>>>>>>>>>'+cardSummaryNo);
            if(cardSummaryNo.indexOf('-')!=-1){
                cardSummaryNo = cardSummaryNo.replace(/\-/g,' ');
                console.log('cardSummaryNo>>>>>>>>>>>'+cardSummaryNo);
            }
            cardSummaryObj.crdNb = cardSummaryNo;
 		};

		$scope.openFirstCardsDetails = function () {

         $scope.detail1 = $scope.detail[0];
           console.log("aoiLmt:",$scope.detail1.aoiLmt);
           if(($scope.detail1.aoiLmt!=null || $scope.detail1.aoiLmt!=undefined) && ($scope.detail1.poiLmt!=null || $scope.detail1.poiLmt!=undefined)){
               $scope.isInternatinalFlagOn=true;
           }
           else{
               $scope.isInternatinalFlagOn=false;
           }
          $scope.detail1.showfull = true;
			$(this).addClass('bgcolor');

			};

        $scope.close = function() {

            //lpCoreBus.publish('launchpad-retail.closeActivePanel');

            //added for mobile
            gadgets.pubsub.publish('launchpad-retail.closeActivePanel');
        };

        //added for mobile
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });

        initialize();
         // $timeout(function(){
         //        gadgets.pubsub.publish('cxp.item.loaded', {
         //            id: widget.id
         //        });
         //    }, 10);
    }
    /**
     * Export Controllers
     */

    exports.CardDetailsWidgetController = CardDetailsWidgetController;
});
