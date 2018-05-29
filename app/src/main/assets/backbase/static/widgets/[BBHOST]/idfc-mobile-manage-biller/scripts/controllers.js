define(function (require, exports) {

'use strict';

	var $ = require('jquery');
	var idfcError = require('idfcerror');

    function ManageBillerController( lpWidget, lpCoreUtils, lpCoreError, $scope, $http, httpService, lpCoreI18n, lpCoreBus, $timeout) {



        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
		$scope.errorSpin = false;
            var initialize = function() {

            idfcError.validateSession($http);

			$scope.errorSpin = true;
			$scope.error ={
			msg:false
			};
			$scope.showDeleteDiv = false;
			$scope.internalBackEnable = false;
			$scope.deleteBiller = {
						happened: false
						};
			$scope.sucess = {
                    happened: false
						};
			$scope.billerListDiv = true;
			$scope.billerList = [];
			$scope.lastOpenTaskId = '';
			$scope.getAllBillersList();
            };

       gadgets.pubsub.subscribe("native.back", function(evt) {
                                console.log(evt.text);
                                if($scope.showDeleteDiv){
                                $scope.doTheBack();
                                $scope.$apply();
                                gadgets.pubsub.publish("js.back", {
                                                       data: "ENABLE_BACK",
                                                       });
                                
                                }
                                else
                                {
                                $scope.sucess.happened = false;
                                $scope.hideFlag = false;
                                $scope.lastOpenTaskId = '';
                                $scope.$apply();
                                }
								localStorage.clear();
                                });

			gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
				 if(localStorage.getItem("navigationFlag") || $scope.internalBackEnable) {
					 console.log(evt.text);
					 if($scope.showDeleteDiv){
					 $scope.doTheBack();
					 $scope.$apply();
					 gadgets.pubsub.publish("js.back", {
											data: "ENABLE_BACK",
											});

					 }
					 else
					 {
					 $scope.sucess.happened = false;
					 $scope.hideFlag = false;
					 $scope.lastOpenTaskId = '';
					 $scope.internalBackEnable = false;

					 $scope.$apply();
					 gadgets.pubsub.publish("js.back", {
											data: "ENABLE_HOME",
											});
					 }
					localStorage.clear();
				 }else {
					 gadgets.pubsub.publish("device.GoBack");
				 }
			 });

			$scope.getAllBillersList = function() {
			var self = this;
			self.getServiceLists = httpService.getInstance({
				endpoint: lpWidget.getPreference('fetchBillerList')
			});

            var xhr = self.getServiceLists.read();

			xhr.success(function(data) {
			$scope.billerList = [];
			if (data && data !== 'null') {
			   for(var i = 0; i < data.bllrDtls.length; i++) {
					if(data.bllrDtls[i].blrSts === 'ACTIVE'){
						data.bllrDtls[i].blrSts = 'Success';
					}else if(data.bllrDtls[i].blrSts === 'REJECTED'){
						data.bllrDtls[i].blrSts = 'Failed';
					}else {
					data.bllrDtls[i].blrSts = 'In-Progress';
					}
					}
			
					$scope.billerList = data;
				}
				$scope.errorSpin = false;
            });

			xhr.error(function(data) {
				$scope.errorSpin = false;
				idfcError.checkTimeout(data);
				$scope.globalerror = idfcError.checkGlobalError(data);
				if(data.cd ==='BPAY:INV_MSG_096'){
				}
				$scope.error = {
					happened: true,
					msg: data.rsn
				};
            });

			return xhr;
		};
		$scope.getDetails = function(taskId) {
		$scope.hideFlag = true;
		$('html,body').animate({ scrollTop: 0 }, 'fast');
			if ($scope.lastOpenTaskId === taskId.billrAcctId[0]) {
				$scope.sucess.happened = false;
				$scope.lastOpenTaskId = '';
			}
			else {
            gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_BACK",
                              });
                              $scope.internalBackEnable = true;
				$scope.getServiceRequestDetail(taskId.billrAcctId[0]);
			} 
        };
				$scope.getServiceRequestDetail = function(srNo){
				$scope.lastOpenTaskId = srNo;
				$scope.sucess = {
                    happened: true,
                    id: srNo
						};
                };
				$scope.goToDeleteScreeen = function(dataObj){
                gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_HOME"
                              });
				$scope.billerData = dataObj;
				$scope.billerListDiv = false;
				$scope.showDeleteDiv = true;
				};
				$scope.doTheBack = function(){
                gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_BACK"
                              });

				$scope.billerListDiv = true;
				$scope.showDeleteDiv = false;
				};
				$scope.confirmDeleteBiller = function(billerdetails) {
				$scope.errorSpin = true;
				var deleteBillerURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('deleteBiller')); 
				var service = httpService.getInstance({
                endpoint: deleteBillerURL    
                });
				var serviceData = {};
				serviceData.bllrAcctId = billerdetails.billrAcctId[0];
				var xhr = service.create({
                data: serviceData
            });
				xhr.success(function(data) {
				if (data && data !== 'null') {
				$scope.errorSpin = false;
				$scope.showDeleteDiv = false;
				$scope.billerListDiv = false;
				$scope.deleteBiller = {
						happened: true,
						msg: 'Congratulations. We have vanished this biller for you.'
				};
				}
            }); xhr.error(function(data) {
			$scope.errorSpin = false; idfcError.checkTimeout(data);
			$scope.globalerror = idfcError.checkGlobalError(data);
				 if($scope.globalerror){
						$scope.err = {
						happened: true, 
						msg: data.rsn
						};
						$scope.buttonError = true;
					}
						$scope.error = {
							happened: true,
							msg: data.rsn
						};
						$scope.deleteBiller = {
							happened: false,
							msg: ''
						};
				});	
					};
				
				$scope.refreshBillers = function()
                				{

                				$scope.billerListDiv = true;
                				$scope.deleteBiller = {
                				                		happened: false
                                						};
                                	$scope.deleteBiller.happened = false;
                                		$scope.hideFlag = false;
                                		$scope.sucess.happened = false;
                    $scope.getAllBillersList();
                				};
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
				initialize(); 
				// $timeout(function(){
    //             gadgets.pubsub.publish('cxp.item.loaded', {
    //                 id: widget.id
    //             });
    //         }, 10);
    }

    exports.ManageBillerController = ManageBillerController;
});
