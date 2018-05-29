/*global checkTimeout, checkGlobalError, encode_deviceprint */
/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {
	'use strict';
	var idfcerror = require('idfcerror');

	var $ = require('jquery');
	var onWhichScreenForNominee='';
	var fromRDView = false;
    var fromPFView = false;
    var fromDeposit = false;
       var viewFDdetails = {};
	/*
	 * var $ = require('jquery'); function applyScope($scope) { if
	 * (!$scope.$$phase) { $scope.$apply(); } }
	 */
	var ALERT_TIMEOUT = 3000;
 	/**
     * Main controller
     * @ngInject
     * @constructor
     */
	function MyController(WidgetModel, lpWidget, lpCoreUtils, lpCoreError,
			$scope, $rootElement, lpCoreI18n, $http, httpService, shareModels,
        lpCoreBus, lpPortal, sharedProperties, $timeout) {

		this.model = WidgetModel;

		this.utils = lpCoreUtils;

		this.error = lpCoreError;
		this.widget = lpWidget;
       //4 Apr - Pratik
       //To convert string in Sentence case.
       function toSentenceCase(str)
       {
       //return str.replace(/\b\w+/g,function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();});
       return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
       }
       
		var initialize = function() {

			//Session Management Call
			idfcerror.validateSession($http);
			$scope.serviceRequestForm = true;
			$scope.showCategoryForm = false;
			$scope.serviceError = false;
			$scope.errorSpin = true;
			$scope.loadCategories();
			$scope.checkCategory();
			$scope.acountNominee = false;
			// $scope.loadSubcategoriesSearch();
			$scope.subCategoryFlag = false;
			$scope.dontPop = false;
            $scope.target = '';

            //variable to check if user is
            //performing cheque-book request
            //or add nominee request
            $scope.serviceRequestType = '';
            $scope.addNominee = {};
		};

		gadgets.pubsub.subscribe("dontPop",function(){
			$scope.dontPop = true;
		});
       $scope.navigationSubscription = function(params) {
       
       if (undefined === params || params === '') {
       console.log('in if');
       } else {
       
       if (params == 'Create_SR_Nominee') {
       console.log("$scope.formCodeValue", $scope.formCodeValue);
       gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_BACK",
                              trSerID: "Nomination Addition"
                              });
       $scope.target = params;
       fromRDView = true;
       onWhichScreenForNominee = 'First';
       $scope.formCodeValue = 'nominee';
       $scope.contactChangeView('nominee');
       console.log("Target in sub", $scope.target);
       console.log("Target Name:", params);
       console.log("FromRDView--", fromRDView);
       $scope.$apply();
       
       console.log("$scope.formCodeValue", $scope.formCodeValue);
       } else if (params == 'SR_Open') {
       //                                                           		$scope.target=params.target;
       //                                                           		$scope.fromPFView = true;
       gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_BACK"
                              });
       $scope.target = params;
       fromPFView = true;
       $scope.$apply();
       console.log("SR_Open target", params);
       console.log("SR_Open fromRDView", fromRDView);
       } else if (params == 'From_FD_View') {
       //                                                                 $scope.target = params.target;
       //                                                                 $scope.fromDeposit = true;
       gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_BACK",
                              trSerID: "Nomination Addition"
                              });
       $scope.target = params;
       fromDeposit = true;
       onWhichScreenForNominee = 'First';
       $scope.formCodeValue = 'nominee';
       $scope.contactChangeView('nominee');
       $scope.$apply();
       console.log("From_FD_View target", params);
       console.log("From_FD_View ", fromDeposit);
       }
       }
       };
       
       gadgets.pubsub.subscribe("native.back", function(evt) {
                                
                                            angular.forEach(document.getElementsByClassName("tooltip"),function(e){
                                                        	    e.style.display='none';
                                            })
                                              debugger;
                                            if(fromRDView && $scope.target == 'Create_SR_Nominee' && onWhichScreenForNominee == 'First')
                                            {
                                            	$scope.backToRDView();
                                                gadgets.pubsub.publish("js.back", {
                                                					 data: "ENABLE_HOME"
                                                     });

                                            }
                                            else if(fromPFView && $scope.target == 'SR_Open')
                                            {  console.log("Profile",fromPFView);
                                     			$scope.backToProfile();
                                     			gadgets.pubsub.publish("js.back", {
                                     				data: "ENABLE_HOME"
                                     			});

                                            }
                                            else if(fromDeposit && $scope.target == 'From_FD_View' && onWhichScreenForNominee == 'First')
                                            {  console.log("From_FD_View",fromDeposit);
                                                $scope.backToFDView();
                                                gadgets.pubsub.publish("js.back", {data: "ENABLE_HOME"});
                                            }
                                            localStorage.clear();
                });

                gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
                        				 if(localStorage.getItem("navigationFlag")) {
                        					 angular.forEach(document.getElementsByClassName("tooltip"),function(e){
																e.style.display='none';
											 })
											   debugger;
											 if(fromRDView && $scope.target == 'Create_SR_Nominee' && onWhichScreenForNominee == 'First')
											 {
												$scope.backToRDView();
												 gadgets.pubsub.publish("js.back", {
																	 data: "ENABLE_HOME"
													  });

											 }
											 else if(fromPFView && $scope.target == 'SR_Open')
											 {  console.log("Profile",fromPFView);
												$scope.backToProfile();
												gadgets.pubsub.publish("js.back", {
													data: "ENABLE_HOME"
												});

											 }
											 else if(fromDeposit && $scope.target == 'From_FD_View' && onWhichScreenForNominee == 'First')
											 {  console.log("From_FD_View",fromDeposit);
												 $scope.backToFDView();
												 gadgets.pubsub.publish("js.back", {data: "ENABLE_HOME"});
											 }
											 localStorage.clear();
										 } else {
										 	if(!$scope.dontPop)
										 	gadgets.pubsub.publish("device.GoBack");
										 }
                        			 });

                      $scope.backToRDView = function(){
       								localStorage.clear();
                                  gadgets.pubsub.publish("launchpad-retail.recurringDepositDetails");

                                  };
                          $scope.backToProfile = function(){
                               gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
                         };

                          $scope.backToFDView = function(){
                             console.log("in back to FD");
                             gadgets.pubsub.publish('launchpad-retail.ViewDepositWidgetOpen');
                          };

		lpCoreBus.subscribe('launchpad-retail.grouping.serviceRequest',
				function() {
					lpCoreBus.flush('launchpad-retail.serviceRequestOpen');
					lpCoreBus.flush('launchpad-retail.serviceRequestOpenRd');
				});
		$scope.accNuFromRDSum = function(accNumberPassed) {
			sharedProperties.setProperty(accNumberPassed);
		};
		$scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(lpWidget)
				+ '/templates/partials/';
		$scope.alerts = [];
		$scope.showMsg = false;
		$scope.addAlert = function(code, type, timeout) {
			var alert = {
				type: type || 'error',
				msg: $scope.alert.messages[code]
			};

			$scope.alerts.push(alert);

		};

		// Remove specific alert
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};

		// Clear alert messages
		$scope.clearAlerts = function() {
			$scope.alerts = [];
		};
		$scope.subcategoryList = [];
        $scope.subcategoryListPersonal=[];
        $scope.subcategoryListOther=[];
		$scope.formCode = [];
		$scope.categoryList = [];
		$scope.serviceCode = [];
		$scope.subCategorySearchList = [];
		$scope.formCodeSearch = [];
		$scope.serviceError = false;

		var date = new Date();
		// var FromDate = '';
		// var ToDate = '';
		$scope.todaysDate = new Date();
		$scope.minDate = date.setDate((new Date()).getDate() - 180);
		$scope.minimDate=1443637800000;

		$scope.openForm = function(value) {
            console.log(value);
            shareModels.model.subCategoryList = value;

			var index = $scope.subcategoryList.indexOf(value);
			var formCode = $scope.formCode[index];
       		if(!(formCode == 'pan' || formCode == 'aadhaar' || formCode == 'email' ))
            {
				gadgets.pubsub.publish("js.back", {
						  data: "ENABLE_BACK",
						  trSerID:value
				});
            }
            else
            {
            	localStorage.clear();
            	localStorage.setItem("navigationFlag",true);
       			localStorage.setItem("origin","Profile");//23 March
       			localStorage.setItem("navigationData", value);
            }
            gadgets.pubsub.publish("passFormCodeToAccountsController",{"code":formCode});
       		$scope.form(formCode);
		};

		$scope.$watch('model.subCategorySearch', function(value) {
			if (value) {
				var index = $scope.subCategorySearchList.indexOf(value);
				var formCode = $scope.formCodeSearch[index];
				$scope.form(formCode);
				$scope.model.subCategoryList = value;
			}
		});

		$scope.loadCategories = function() {

			var self = this;
			self.categories = httpService.getInstance({
				endpoint: lpWidget.getPreference('categoryUrl')

			});

			var xhr = self.categories.read();

			xhr.success(function(data) {
				$scope.errorSpin = false;
				if (data && data !== 'null') {

					$scope.categoryList = data.categoryList;
					$scope.serviceCode = data.serviceCode;
					$scope.errorSpin = false;
					// $scope.loadSubcategoriesSearch();

				} else {
					$scope.categoryList = [];
				}
			});
			xhr.error(function(data) {
				$scope.errorSpin = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);
					if ((data.cd === '501')) {
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);
					} else {
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);
					}
				}

				self.error = {
					message: data.statusText
				};
			});

			return xhr;
		};
		$scope.loadSubcategoriesSearch = function() {
			var self = this;
			self.subCategoriesSearch = httpService.getInstance({
				endpoint: lpWidget.getPreference('subcategorySearchUrl'),
				urlVars: {
					requestId: 'getSubCategory'
				}

			});

			var xhr = self.subCategoriesSearch.read();

			xhr.success(function(data) {
				$scope.errorSpin = false;
				if (data && data !== 'null') {

					$scope.subCategorySearchList = data.subCategoryList;
					$scope.formCodeSearch = data.formCode;

				}
			});
			xhr.error(function(data) {
				$scope.errorSpin = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);
					if ((data.cd === '501')) {
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);
					} else {
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);
					}
				}
				self.error = {
					message: data.statusText
				};
			});

			return xhr;
		};

		$scope.form = function(value) {
			$scope.formCodeValue = value;
			if (value === 'passbook') {
				$scope.contactChangeView('passbook');
			} else if (value === 'statement') {
				$scope.contactChangeView('email');
			} else if (value === 'chequebook') {
				$scope.contactChangeView('chequebook');
			} else if (value === 'sweepIn') {
				$scope.contactChangeView('sweepIn');
			} else if (value === 'account') {
				$scope.contactChangeView('account');
			} else if (value === 'nominee') {
				onWhichScreenForNominee='First';
				onWhichScreenForNominee = 'First';
				$scope.contactChangeView('nominee');
			} else if (value === 'email') {
				gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
			} else if (value === 'pan') {
				gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
			} else if (value === 'aadhaar') {
				gadgets.pubsub.publish('launchpad-retail.profileContactWidgetOpen');
			}
		};


		$scope.checkCategory = function() {

			var serviceCode = 'DP';
			var self = this;
			$scope.errorSpin = true;
			self.subCategories = httpService.getInstance({
				endpoint: lpWidget.getPreference('subcategoryUrl'),
				urlVars: {
					serviceCode: serviceCode
				}

			});

			var xhr = self.subCategories.read();
			xhr.success(function(data) {
				$scope.errorSpin = false;
				if (data && data !== 'null') {
                    //3.3 change

					$scope.subcategoryList = data.subCategoryList;
						console.log("Sub category list : " + $scope.subcategoryList);
                    // console.log("Sub category list : " + $scope.subcategoryList[0].toLowerCase());
                        var len = $scope.subcategoryList.length;
                        var i;
                        for (i=0; i<len; i++) {
                        //4 Apr - Pratik
                        // $scope.subcategoryList[i]= toSentenceCase($scope.subcategoryList[i]);
                       console.log("New Sub category list : " + $scope.subcategoryList[i]);
                        
                        //12 Sept 2016
                        if ($scope.subcategoryList[i] == 'PAN Update' || $scope.subcategoryList[i] == 'Aadhar Update' ||
                            $scope.subcategoryList[i] == 'Update email id') {
                        $scope.subcategoryListPersonal.push($scope.subcategoryList[i]);
                        console.log("Personal List: " + $scope.subcategoryListPersonal);
                        }
                        else
                        if ($scope.subcategoryList[i] == 'Chequebook Request' || $scope.subcategoryList[i] == 'Nomination Addition') {
                                                $scope.subcategoryListOther.push($scope.subcategoryList[i]);
                                                console.log("Other List : " + $scope.subcategoryListOther);
                                                }
                        }
                        
					$scope.formCode = data.formCode;
					shareModels.model = {};
					shareModels.model.formCode = data.formCode;
					$scope.subCategoryFlag = true;

                } //3.3 change end
                else {
					self.subcategoryList = [];
					self.formCode = [];
				}
			});
			xhr.error(function(data) {
				$scope.errorSpin = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);

					if ((data.cd === '501')) {
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);
					} else {
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);
					}
				}
				self.error = {
					message: data.statusText
				};
			});
			return xhr;
			// };
		};

		$scope.checkRequest = function() {
			$scope.showMsg = false;
			var flag = 0;
			for ( var i = 0; i < $scope.subCategorySearchList.length; i++) {
				if ($scope.model.subCategorySearch === $scope.subCategorySearchList[i]) {
					flag = 1;

				}
			}
			if (flag === 0) {
				$scope.showMsg = true;
			}
		};

		$scope.save = function() {
			var test = $scope.validateEmail();
			if (!test) {
				return false;
			}

		};

		$scope.cancelOTP = function() {
			$scope.showCategoryForm = false;
			$scope.serviceRequestForm = true;
			$scope.template = 'index.html';
			$scope.subcategoryList = [];
            $scope.subcategoryListPersonal=[];
            $scope.subcategoryListOther=[];
			$scope.model.categories = '';
			// $scope.srForm.$setPristine();
			// $scope.loadCategories();
		};

		$scope.cancelForm = function() {
			$scope.showCategoryForm = false;
			$scope.serviceRequestForm = true;
			$scope.template = 'index.html';
		};

       $scope.openNewReq = function() {
       
       $scope.showCategoryForm = false;
       $scope.serviceRequestForm = true;
       $scope.chequebook = false;
       $scope.nominee = false;
       $scope.template = 'index.html';
       gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_HOME",
                              trSerID:"Create Service Request" //Take the name of widget from Model.json(Hard-coded)
                              
                              });
       $scope.$apply();
       };
       
       $scope.openNewReqBack = function() {
       
       $scope.showCategoryForm = false;
       $scope.serviceRequestForm = true;
       $scope.chequebook = false;
       $scope.nominee = false;
       $scope.template = 'index.html';
       $scope.$apply();
       };
       
       
		$scope.contactChangeView = function(view) {
			$scope.template = {
				nominee :$scope.partialsDir + 'nominee.html',
				chequebook : $scope.partialsDir + 'chequebook.html'
			 }
			$scope.showCategoryForm = true;
			$scope.serviceRequestForm = false;
			if(view == "nominee")
				$scope.nominee = true;
			else if(view == "chequebook")
				$scope.chequebook = true;
		};


		//    '/' +

		var deckPanelOpenHandler;
		deckPanelOpenHandler = function(activePanelName) {
			if (activePanelName === lpWidget.parentNode.model.name) {
				lpCoreBus.flush('DeckPanelOpen');
				lpCoreBus.unsubscribe('DeckPanelOpen', deckPanelOpenHandler);
				lpWidget.refreshHTML(function(bresView) {
					lpWidget.parentNode = bresView.parentNode;
				});
			}
		};

		lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);

		initialize();
       
       if (localStorage.getItem("navigationFlag")) {
       var params = localStorage.getItem("origin");
//       viewFDdetails = JSON.parse(localStorage.getItem("navigationData"))
       $scope.navigationSubscription(params);
       }
       
       }
	/**
     * Main controller
     * @ngInject
     * @constructor
     */
	function AccountsController(WidgetModel, lpWidget, lpCoreUtils,
			lpCoreError, $scope, $rootElement, lpCoreI18n, $http, httpService,
        $timeout, shareModels, lpPortal, sharedProperties, creatServiceRequest) {
		this.model = WidgetModel;
		this.utils = lpCoreUtils;
		this.error = lpCoreError;
		this.widget = lpWidget;
		$scope.guardianForm = false;
		$scope.errors = {};
		// $scope.errorSpin= true;
		$scope.showServiceRequestNo = false;
		$scope.guardianDOB = false;
		$scope.globalError = false;

		 gadgets.pubsub.subscribe("native.back", function(evt) {
                     console.log("native.back -->2nd ");
                     //debugger;
                     if (onWhichScreenForNominee == 'Second') {
                         console.log("inside second");
                         $scope.confirmButton = false;
                         $scope.lockFields = false;
                         $scope.nomineeButton = true;
                         onWhichScreenForNominee = 'First';
                         $scope.$apply();
                         gadgets.pubsub.publish("js.back", {
                             data: "ENABLE_BACK",
                             trSerID: "Nomination Addition"
                         });
                     } else if ($scope.chequebookButton == false) {
                         chequebookForm.submitted = false;
                         $scope.confirmButton = false;
                         $scope.chequebookButton = true;
                         $scope.lockFields = false;
                         $scope.$apply();
                         gadgets.pubsub.publish("js.back", {
                             data: "ENABLE_BACK",
                             trSerID: "Chequebook Request"
                         });
                     } else {
                         console.log("Inside SR Else");
                         gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_HOME",
                              trSerID: "Create Service Request"
                         });
                         $scope.openNewReqBack();
                     }
                     localStorage.clear();
         });

		 gadgets.pubsub.publish("dontPop");
         gadgets.pubsub.subscribe("passFormCodeToAccountsController",function(data){
         	$scope.formCodeValue = data.code;
         });

         gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
			 if(localStorage.getItem("navigationFlag") || $scope.formCodeValue == 'chequebook' || $scope.formCodeValue == 'nominee') {
				 console.log("native.back -->2nd ");
                                      //debugger;
                                      if (onWhichScreenForNominee == 'Second') {
                                          console.log("inside second");
                                          $scope.confirmButton = false;
                                          $scope.lockFields = false;
                                          $scope.nomineeButton = true;
                                          onWhichScreenForNominee = 'First';
                                          $scope.$apply();
                                          gadgets.pubsub.publish("js.back", {
                                              data: "ENABLE_BACK",
                                              trSerID: "Nomination Addition"
                                          });
                                      } else if ($scope.chequebookButton == false) {
                                          chequebookForm.submitted = false;
                                          $scope.confirmButton = false;
                                          $scope.chequebookButton = true;
                                          $scope.lockFields = false;
                                          $scope.$apply();
                                          gadgets.pubsub.publish("js.back", {
                                              data: "ENABLE_BACK",
                                              trSerID: "Chequebook Request"
                                          });
                                      } else {
                                          gadgets.pubsub.publish("js.back", {
                                               data: "ENABLE_HOME",
                                               trSerID: "Create Service Request"
                                          });
                                          $scope.openNewReqBack();
                                          $scope.formCodeValue = '';
                                      }
                                      localStorage.clear();
			 }else {
				 gadgets.pubsub.publish("device.GoBack");
			 }
		 });
        //	PINCODE CHANGES 3.5 change

        $scope.validatePin = function(value) {
            $scope.invalidPin = false;
            if (value.length == '6') {

                $scope.addNominee.nomineePin = value;
                $scope.validatePinService(value);
            } else {
                $scope.addNominee.nomineeCity = '';
                $scope.addNominee.nomineeState = '';
            }
        };
        $scope.validatePinGuardian = function(value) {
            $scope.invalidPinG = false;
            $scope.invalidPin = false;
            if (value.length == '6') {
                $scope.addNominee.guardianPin = value;
                $scope.validatePinServiceguardian(value);
            } else {
                $scope.addNominee.guardianCity = '';
                $scope.addNominee.guardianState = '';
            }
        };
        $scope.pinCheck = function() {
            $scope.invalidPin = true;
        };

        $scope.pinCheckG = function() {
            $scope.invalidPinG = true;
        };

        $scope.validatePinServiceguardian = function(value) {
            var getPinMasterListsURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('PinMasterDbDataSrc'))
            creatServiceRequest.setup({
                    getPinMasterListsURL: getPinMasterListsURL
                }).pinNumberService({
                    'PinValue': $scope.addNominee.guardianPin
                })
                .success(function(data) {
                    $scope.errorSpin = false;
                    $scope.PinData = data;
                    $scope.invalidPinG = false;
                    //$scope.invalidPin=false;
                    if ($scope.PinData.length > 0) {


                        $scope.addNominee.guardianCity = data[0].cities;
                        $scope.addNominee.guardianState = data[0].states;
                        $scope.addNominee.guardianCountry = data[0].country;

                    } else {
                        console.log("outttGGG");
                        $scope.addNominee.guardianCity = '';
                        $scope.addNominee.guardianState = '';
                        $scope.pinCheckG();
                    }

                })
                .error(function(data, status, headers, config) {
                    $scope.errorSpin1 = false;

                    if (error.cd) {
                        IdfcError.checkTimeout(error);
                        if ((error.cd === '404')) {
                            $scope.globalError = true;
                            $scope.serviceError = IdfcError.checkGlobalError(error);
                            $scope.alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error', false);
                        } else {
                            $scope.globalError = true;
                            $scope.alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error', false);
                        }
                    }
                    self.error = {
                        message: error.statusText
                    };
                });
        };

        $scope.validatePinService = function(value) {
            var getPinMasterListsURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('PinMasterDbDataSrc'))
            creatServiceRequest.setup({
                    getPinMasterListsURL: getPinMasterListsURL
                }).pinNumberService({
                    'PinValue': $scope.addNominee.nomineePin
                })
                .success(function(data) {
                    $scope.invalidPin = false;
                    $scope.globalError = false;
                    $scope.errorSpin = false;
                    $scope.PinData = data;
                    if ($scope.PinData.length > 0) {
                        console.log($scope.PinData);

                        $scope.addNominee.nomineeCity = data[0].cities;
                        $scope.addNominee.nomineeState = data[0].states;
                        $scope.addNominee.nomineeCountry = data[0].country;


                    } else {
                        console.log("outtt");
                        $scope.addNominee.nomineeCity = '';
                        $scope.addNominee.nomineeState = '';
                        $scope.pinCheck();
                    }

                })
                .error(function(error) {
                    $scope.errorSpin1 = false;

                    if (error.cd) {
                        IdfcError.checkTimeout(error);
                        if ((error.cd === '404')) {
                            $scope.globalError = true;
                            $scope.serviceError = IdfcError.checkGlobalError(error);
                            $scope.alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error', false);
                        } else {
                            $scope.globalError = true;
                            $scope.alert = {
                                messages: {
                                    cd: error.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error', false);
                        }
                    }
                    self.error = {
                        message: error.statusText
                    };
                });
        }; //3.5 end
		var initialize = function() {

			$scope.errorSpin1 = false;
			$scope.emailRegistrationForm = true;
			$scope.globalError = false;

            if ($scope.formCodeValue === 'loansoa' ||
                $scope.formCodeValue === 'repayment') {
				$scope.loadLoanAccounts();
			} else if ($scope.formCodeValue === 'nominee') {
				$scope.loadAllAccounts(sharedProperties);
			} else {
				$scope.loadAccounts();
			}
			$scope.getPayableatList();
			$scope.getStateList();
			$scope.getRelationshipList();
			$scope.control = {
				otpValue : ''
			};
		};
		/**
		 * Alerts
		 */
		$scope.alerts = [];

		$scope.addAlert = function(code, type, timeout) {
			var alert = {
				type: type || 'error',
				msg: $scope.alert.messages[code]
			};

			$scope.alerts.push(alert);

			if (timeout !== false) {
				$timeout(function() {
					$scope.closeAlert($scope.alerts.indexOf(alert));
				}, ALERT_TIMEOUT);
			}
		};

		// Remove specific alert
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};

		// Clear alert messages
		$scope.clearAlerts = function() {
			$scope.alerts = [];
		};
		// var temp = [];
		$scope.allAccountNumbers = '';
		// var accountList = [];
		$scope.relationshipList = [];
		$scope.stateList = [];
		$scope.payableAtList = [];
		$scope.confirmButton = false;
		$scope.nomineeButton = true;
		$scope.chequebookButton = true;
		$scope.ddButton = true;
		$scope.passbookFlag = true;
		$scope.accountDetails = {
			accountNumber: '',
			primaryAccount: '',
			emailId: '',
			beneficaryName: '',
			payableAt: '',
			deliveryCommAddress: {
				addressLine1: '',
				addressLine2: '',
				city: '',
				state: '',
				country: '',
				pincode: ''
			},
			deliveryaddress: {
				value: '',
				options: [ {
					'value': 'CA',
					'text': 'Communication Address'
				}, {
					'value': 'PA',
					'text': 'Permanent Address'
				} ]

			},
			frequency: {
				value: '',
				options: [ {
					'value': 'Daily',
					'text': 'Daily'
				}, {
					'value': 'Weekly',
					'text': 'Weekly'
				}, {
					'value': 'Monthly',
					'text': 'Monthly'
				}, {
					'value': 'OneTime',
					'text': 'One-Time'
				} ]

			},
			secondaryAccount: '',
			amount: '',
			address: ''

		};
		var sessionUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
				.getPreference('sessionUrl'), {
			servicesPath: lpPortal.root
		});

		$http({
			method: 'GET',
			url: sessionUrl,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded;'
			}

		})
				.success(
						function(response) {
							$scope.errorSpin1 = false;
							$scope.accountDetails.emailId = response.email;
							$scope.accountDetails.deliveryCommAddress.addressLine1 = response.address.comAddrLne1;
							$scope.accountDetails.deliveryCommAddress.addressLine2 = response.address.comAddrLne2;
							$scope.accountDetails.deliveryCommAddress.city = response.address.comCty;
							$scope.accountDetails.deliveryCommAddress.state = response.address.comState;
							$scope.accountDetails.deliveryCommAddress.country = response.address.comCntry;
							$scope.accountDetails.deliveryCommAddress.pincode = response.address.comPnCde;
							$scope.accountDetails.address = response.address.comAddrLne1
									+ response.address.comAddrLne2
									+ response.address.comCty
									+ response.address.comState
									+ response.address.comCntry
									+ response.address.comPnCde;

						}).error(
						function(data) {
							$scope.errorSpin1 = false;
							if (data.cd) {
								idfcerror.checkTimeout(data);
								if ((data.cd === '501')) {
									$scope.serviceError = idfcerror
											.checkGlobalError(data);
									// $scope.errorSpin = false;
									$scope.alert = {
										messages: {
											cd: data.rsn
										}
									};
									$scope.addAlert('cd', 'error', false);
									// $scope.globalError = true;
								} else {
									$scope.alert = {
										messages: {
											cd: data.rsn
										}
									};
									$scope.addAlert('cd', 'error', false);
									$scope.globalError = true;
								}
							}

						});
		$scope.editAddress = false;
		$scope.dateDiff = false;
		$scope.showTimeRange = false;

		$scope.loansoa = {
			scheduleFromDate: '',
			scheduleToDate: ''
		};
		$scope.maxFromDate = new Date();
		$scope.minToDate = '';
		$scope.$watch('servicerequest.scheduleFromDate', function(value) {
			if (value) {
				$scope.dateDiff = false;
				$scope.minToDate = value;

			}
		});

		$scope.$watch('servicerequest.scheduleToDate', function(value) {
			if (value) {
				$scope.dateDiff = false;
				$scope.maxFromDate = value;
			}
		});
		$scope.$watch('loansoa.scheduleFromDate', function(value) {
			if (value) {
				$scope.dateDiff = false;
				$scope.minToDate = value;

			}
		});

		$scope.$watch('loansoa.scheduleToDate', function(value) {
			if (value) {
				$scope.dateDiff = false;
				$scope.maxFromDate = value;
			}
		});

		$scope.editingAddress = function() {

			$scope.lockFields = false;
			$scope.editAddress = true;
			var al1 = document.getElementById('addressLine1');
			al1.style.backgroundColor = 'white';
			// al1.classList.remove('greycolor');
			var al2 = document.getElementById('addressLine2');
			al2.style.backgroundColor = 'white';
			var city = document.getElementById('city');
			city.style.backgroundColor = 'white';
			var state = document.getElementById('state');
			state.style.backgroundColor = 'white';
			var country = document.getElementById('country');
			country.style.backgroundColor = 'white';
			var pincode = document.getElementById('pincode');
			pincode.style.backgroundColor = 'white';
		};
		$scope.servicerequest = {
			scheduleFromDate: '',
			scheduleToDate: ''

		};
		$scope.serviceRequestNo = '';
		var date = new Date();
		// var FromDate = '';
		// var ToDate = '';
		$scope.todaysDate = new Date();
		$scope.minDate = date.setDate((new Date()).getDate() - 180);
		$scope.isOpenDate1 = false;
		$scope.isOpenDate2 = false;

		$scope.openFromCalendar = function($event) {

			if(!$scope.errorSpin){
				$scope.isOpenDate1 = true;
                $event.preventDefault();
                $event.stopPropagation();
			}

		};

		$scope.openToCalendar = function($event) {
			$scope.isOpenDate2 = true;
			$event.preventDefault();
			$event.stopPropagation();

		};
		$scope.dateOptionsFrom = {
			'show-button-bar': false,
			'show-weeks': false
		};
		$scope.dateOptionsTo = {
			'show-button-bar': false,
			'show-weeks': false
		};

		$scope.$watch('addNominee.nomineeDOB', function(value) {

			if (value) {
				var age = $scope.getAge(value);
				if (age < 18) {
					$scope.guardianForm = true;
				} else {
					$scope.guardianForm = false;
				}
			}
		});

		$scope.$watch('addNominee.guardianDOB', function(value) {
			if (value) {
				var age = $scope.getAge(value);
				if (age < 18) {
					$scope.guardianDOB = true;
				} else {
					$scope.guardianDOB = false;
				}
			}
		});
		$scope.loadAccounts = function() {
			$scope.errorSpin = true;
			var self = this;
			self.loadAccounts = httpService.getInstance({
				endpoint: lpWidget.getPreference('accountUrl')
			});
			var xhr = self.loadAccounts.read();
			xhr.success(function(data) {
				$scope.errorSpin = false;
				if (data && data !== 'null') {
					$scope.accountNumbers = data;
                    //
                    $scope.getChequeLeaves();
				}

			});
			xhr.error(function(data) {
				$scope.errorSpin = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);
					if ((data.cd === '501')) {
						$scope.globalError = true;
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error',false);

					} else {
						$scope.globalError = true;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error',false);

					}
				}
//				self.error = {
//					message: data.statusText
//				};
			});

			return xhr;
		};
		$scope.loadAllAccounts = function() {

			if (fromRDView || fromDeposit) {
                            console.log("js.back");
                            gadgets.pubsub.publish("js.back", {
                                data: "ENABLE_BACK",
                                trSerID: "Nomination Addition"
                            });
            }
			$scope.errorSpin = true;
			var self = this;

			self.loadAllAccounts = httpService.getInstance({
				endpoint: lpWidget.getPreference('casatdAccountUrl')
			});
			var xhr = self.loadAllAccounts.read();
			xhr
					.success(function(data) {
						$scope.errorSpin = false;
						if (data && data !== 'null') {

							$scope.allAccountNumbers = data;
							sharedProperties.getProperty();
							var accNumberPassed = sharedProperties
									.getProperty();
							$scope.allAccountNumbersPassed = [];
							$scope.accountNumberObj = '';

							for ( var i = 0; i < $scope.allAccountNumbers.length; i++) {
								var currentItem = $scope.allAccountNumbers[i];
								// var abc = currentItem.id;
								if (currentItem.id === accNumberPassed.accountNumber) {
									$scope.accountNumberObj = currentItem;
									$scope.accountDetails.accountNumber = currentItem.id;
									break;
								} else {
									console.log('in else');
								}
							}
							$scope.allAccountNumbersPassed
									.push($scope.accountNumberObj);
						}
					});
			xhr.error(function(data) {
				$scope.errorSpin1 = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);

					if ((data.cd === '501')) {
						$scope.globalError = true;
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					} else {
						$scope.globalError = true;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					}
				}
				self.error = {
					message: data.statusText
				};
			});

			return xhr;
		};

		$scope.loadLoanAccounts = function() {
			$scope.errorSpin1 = true;
			var self = this;

			self.loadLoanAccounts = httpService.getInstance({
				endpoint: lpWidget.getPreference('loanAccountUrl')
			});
			var xhr = self.loadLoanAccounts.read();
			xhr.success(function(data) {
				// $scope.errorSpin1 = false;
				if (data && data !== 'null') {

					$scope.loanAccountNumbers = data.loanAccountList;
				}
			});
			xhr.error(function(data) {
				if (data.cd) {
					$scope.errorSpin1 = false;
					idfcerror.checkTimeout(data);

					if ((data.cd === '501')) {
						$scope.globalError = true;
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					} else {
						$scope.globalError = true;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					}
				}
				self.error = {
					message: data.statusText
				};
			});

			return xhr;
		};
		$scope.submitRepaymentForm = function(isValid) {

			if (!isValid) {
				return true;
			} else {
				$scope.errorSpin1 = true;
				//$scope.generateOTP('send');
				$scope.readSMS('send');
			}
		};

		$scope.submitRepaymentFormOTP = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.formData.category = 'Deposits';
				$scope.formData.subCategory = shareModels.model.subCategoryList;
				$scope.formData.csType = 'SR';
				$scope.formData.acctNo = $scope.accountDetails.accountNumber;
				$scope.formData.srName = 'RepaymentSchedule';
				$scope.formData.loanAccountNumber = $scope.accountDetails.accountNumber;
				$scope.formData.emailId = $scope.accountDetails.emailId;
				$scope.formData.otpValue = $scope.control.otpValue;
				$scope.errorSpin1 = true;
				$scope.submitSR();
			}
		};

		$scope.submitLoanSoa = function(isValid) {
			var diff = (($scope.loansoa.scheduleToDate.getTime() - $scope.loansoa.scheduleFromDate
					.getTime()) / (1000 * 24 * 60 * 60));
			if (!isValid || diff < 30 || diff > 365) {
				if (diff < 30 || diff > 365) {
					$scope.dateDiff = true;
				}
				// $scope.dateDiff=true;
				return true;
			} else {
				$scope.errorSpin1 = true;
				//$scope.generateOTP('send');
				$scope.readSMS('send');
			}
		};

		$scope.submitLoanSoaOTP = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.formData.category = 'Deposits';
				$scope.formData.subCategory = shareModels.model.subCategoryList;
				$scope.formData.fromDate = $scope.loansoa.scheduleFromDate
						.getTime();
				$scope.formData.toDate = $scope.loansoa.scheduleToDate
						.getTime();
				$scope.formData.csType = 'SR';
				$scope.formData.acctNo = $scope.accountDetails.accountNumber;
				$scope.formData.srName = 'loanSOA';
				$scope.formData.loanAccountNumber = $scope.accountDetails.accountNumber;
				$scope.formData.emailId = $scope.accountDetails.emailId;
				$scope.formData.otpValue = $scope.control.otpValue;
				$scope.errorSpin1 = true;
				$scope.submitSR();

			}
		};

		$scope.submitDemandDraft = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.confirmButton = true;
				$scope.lockFields = true;
				$scope.ddButton = false;
			}
		};

		$scope.submitDemandDraftConfirm = function() {
			if ($scope.editAddress === true) {
				$scope.errorSpin1 = true;
				//$scope.generateOTP('send');
				$scope.readSMS('send');
			} else {
				//$scope.generateOTP('send');
				$scope.readSMS('send');
				$scope.formData.category = 'Deposits';
				$scope.formData.subCategory = shareModels.model.subCategoryList;
				$scope.formData.csType = 'SR';
				$scope.formData.acctNo = $scope.accountDetails.accountNumber;
				$scope.formData.srName = 'DemandDraft';
				$scope.formData.loanAccountNumber = $scope.accountDetails.accountNumber;
				$scope.formData.beneficiaryName = $scope.accountDetails.beneficiaryName;
				$scope.formData.payableAt = $scope.accountDetails.payableAt;
				$scope.formData.amount = $scope.accountDetails.amount;
				$scope.address = $scope.accountDetails.deliveryCommAddress.addressLine1
						+ $scope.accountDetails.deliveryCommAddress.addressLine2
						+ $scope.accountDetails.deliveryCommAddress.city
						+ $scope.accountDetails.deliveryCommAddress.state
						+ $scope.accountDetails.deliveryCommAddress.country
						+ $scope.accountDetails.deliveryCommAddress.pincode;
				$scope.formData.deliveryAddress = $scope.address;
				$scope.errorSpin1 = true;
				// $scope.submitSR();
			}
		};
		$scope.DemandDrafFormBack = function() {
			$scope.confirmButton = false;
			$scope.lockFields = false;
			$scope.ddButton = true;

		};

		$scope.submitDemandDraftOTP = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.formData.category = 'Deposits';
				$scope.formData.subCategory = shareModels.model.subCategoryList;
				$scope.formData.csType = 'SR';
				$scope.formData.acctNo = $scope.accountDetails.accountNumber;
				$scope.formData.srName = 'DemandDraft';
				$scope.formData.loanAccountNumber = $scope.accountDetails.accountNumber;
				$scope.formData.beneficiaryName = $scope.accountDetails.beneficiaryName;
				$scope.formData.payableAt = $scope.accountDetails.payableAt;
				$scope.formData.amount = $scope.accountDetails.amount;
				$scope.address = $scope.accountDetails.deliveryCommAddress.addressLine1
						+ $scope.accountDetails.deliveryCommAddress.addressLine2
						+ $scope.accountDetails.deliveryCommAddress.city
						+ $scope.accountDetails.deliveryCommAddress.state
						+ $scope.accountDetails.deliveryCommAddress.country
						+ $scope.accountDetails.deliveryCommAddress.pincode;
				$scope.formData.deliveryAddress = $scope.address;
				$scope.formData.otpValue = $scope.control.otpValue;
				$scope.errorSpin1 = true;
				$scope.submitSR();
			}
		};
		$scope.submitChequeBookForm = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.confirmButton = true;
				$scope.chequebookButton = false;
				$scope.lockFields = true;
			}
		};

		$scope.savingsAccountLeaves = [ 20, 25, 50, 100 ];
		$scope.currentAccountLeaves = [ 20, 25, 50, 100 ];
		$scope.chequeLeaves = [];
		$scope.vpisType = '';

		$scope.getChequeLeaves = function() {
			var acctNo = $scope.accountDetails.accountNumber;
			for ( var i = 0; i < $scope.accountNumbers.length; i++) {
				if (acctNo === $scope.accountNumbers[i].id) {
					var accountType = $scope.accountNumbers[i].alias;
					if (accountType.indexOf('Current Account') !== -1) {
						$scope.chequeLeaves = $scope.currentAccountLeaves;
						$scope.chequebook.chequebookleaves.value = $scope.chequeLeaves[0];
						$scope.vpisType = 11;
						$scope.accType = $scope.accountNumbers[i].acctTyp; //3.1 change
					} else {
						$scope.chequeLeaves = $scope.savingsAccountLeaves;
						$scope.chequebook.chequebookleaves.value = $scope.chequeLeaves[0];
						$scope.vpisType = 10;
						$scope.accType = $scope.accountNumbers[i].acctTyp; //3.1 change
					}

				}

			}

		};

		$scope.ChequebookFormBack = function() {
			$scope.confirmButton = false;
			$scope.lockFields = false;
			$scope.chequebookButton = true;

		};

		$scope.submitChequeBookConfirmForm = function() {
			$scope.errorSpin1 = true;
			$scope.serviceRequestType = 'ChequeBookRequest';
			//$scope.generateOTP('send');
			$scope.readSMS('send');
		};

		$scope.submitChequebookFormOTP = function(isValid) {
			if (!isValid) {
				return true;
			}
			$scope.formData.category = 'Deposits';
			$scope.formData.subCategory = shareModels.model.subCategoryList;
			$scope.formData.csType = 'SR';
			$scope.formData.acctNo = $scope.accountDetails.accountNumber;
			$scope.formData.srName = 'Chequebook';
			$scope.formData.chequeLeaves = $scope.chequebook.chequebookleaves.value;
			$scope.formData.accType = $scope.accType; //3.1 change
			$scope.formData.otpValue = $scope.control.otpValue;
			$scope.formData.vpisType = $scope.vpisType;
			$scope.errorSpin1 = true;
			$scope.submitSR();
		};

		$scope.submitPassbookForm = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.errorSpin1 = true;
				//$scope.generateOTP('send');
				$scope.readSMS('send');
			}
		};

		$scope.submitPassbookFormOTP = function(isValid) {
			if (!isValid) {
				return true;
			}
			$scope.formData.category = 'Deposits';
				//alert("$scope.formData.category"+$scope.formData.category);
			$scope.formData.subCategory = shareModels.model.subCategoryList;
			$scope.formData.csType = 'SR';
			$scope.formData.acctNo = $scope.accountDetails.accountNumber;
			$scope.formData.srName = 'Passbook';
			$scope.formData.flag = 'Yes';
			$scope.formData.otpValue = $scope.control.otpValue;
			$scope.errorSpin1 = true;
			$scope.submitSR();
		};

		$scope.submitSweepInFormOTP = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.formData.category = 'Deposits';
				$scope.formData.subCategory = shareModels.model.subCategoryList;
				$scope.formData.csType = 'SR';
				$scope.formData.acctNo = $scope.accountDetails.primaryAccount;
				$scope.formData.srName = 'SweepIn';
				$scope.formData.secondayAccount = $scope.accountDetails.secondaryAccount;
				$scope.formData.amount = $scope.accountDetails.amount;
				$scope.formData.otpValue = $scope.control.otpValue;
				$scope.errorSpin1 = true;
				$scope.submitSR();
			}
		};

		$scope.checkDate = function(a, b) {
			var check = ((a - b) / (1000 * 24 * 60 * 60));

			if (check > 180) {
				return true;
			}
			return false;
		};
		$scope.errors = {};

		$scope.submitemailForm = function(isValid) {
			if ($scope.showTimeRange === true) {
				var difftime = (($scope.servicerequest.scheduleToDate.getTime() - $scope.servicerequest.scheduleFromDate
						.getTime()) / (1000 * 24 * 60 * 60));
			}
			if (!isValid || difftime > 180) {
				if (difftime > 180) {
					$scope.dateDiff = true;
				}
				return true;
			} else {
                    gadgets.pubsub.publish("js.back", {
                              data: "ENABLE_HOME"
                              });
				$scope.errorSpin1 = true;
				//$scope.generateOTP('send');
				$scope.readSMS('send');
			}
		};

		$scope.openTimeRange = function() {
			if ($scope.accountDetails.frequency.value === 'OneTime') {
				$scope.showTimeRange = true;
			} else {
				$scope.showTimeRange = false;
			}
		};

		$scope.submitemailFormOTP = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.formData.category = 'Deposits';
				$scope.formData.subCategory = shareModels.model.subCategoryList;
				$scope.formData.csType = 'SR';
				$scope.formData.acctNo = $scope.accountDetails.accountNumber;
				$scope.formData.srName = 'emailStatement';
				$scope.formData.frequency = $scope.accountDetails.frequency.value;
				$scope.formData.otpValue = $scope.control.otpValue;
				if($scope.accountDetails.frequency.value === 'OneTime'){
					$scope.formData.fromDate = $scope.servicerequest.scheduleFromDate.getTime();
					$scope.formData.toDate = $scope.servicerequest.scheduleToDate.getTime();
				}
				$scope.errorSpin1 = true;
				$scope.submitSR();
			}
		};
		var validateGuardianDOB = function() {

			var age = $scope.getAge($scope.addNominee.guardianDOB);

			if (age < 18) {
				return true;
			} else {
				return false;
			}
		};
		$scope.submitAddNomineeForm = function(isValid) {
			if (isValid) {

				if ($scope.guardianForm === true && validateGuardianDOB()) {
					return true;
				}
				onWhichScreenForNominee='Second';
				onWhichScreenForNominee = 'Second';
				$scope.confirmButton = true;
				$scope.lockFields = true;
				$scope.nomineeButton = false;
			}
		};

		$scope.submitAddNomineeConfirmForm = function() {
		    $scope.serviceRequestType = 'NominationRequest';
			//$scope.generateOTP('send');
			$scope.readSMS('send');

		};

		$scope.AddNomineeBack = function() {
			$scope.confirmButton = false;
			$scope.lockFields = false;
			$scope.nomineeButton = true;
			$scope.$apply();

			$scope.$apply();
		};

		$scope.submitAddNomineeFormOTP = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.formData.category = 'Deposits';
				if($scope.formData.subCategory ==='undefined' || $scope.formData.subCategory ==='')
                {
                	$scope.formData.subCategory='NOMINATION ADDITION';
                }
                else{
                	$scope.formData.subCategory = shareModels.model.subCategoryList;
                }
				$scope.formData.csType = 'SR';
				$scope.formData.acctNo = $scope.accountDetails.accountNumber;
				$scope.formData.srName = 'addNominee';
				$scope.formData.nomineeName = $scope.addNominee.nomineeName;
				$scope.formData.nomineeDOB = $scope.addNominee.nomineeDOB
						.getTime();
				$scope.formData.relationship = $scope.addNominee.nomineeRelationship;
				$scope.formData.otpValue = $scope.control.otpValue;
				$scope.formData.nomineeAddressLine1 = $scope.addNominee.nomineeAL1;
				$scope.formData.nomineeAddressLine2 = $scope.addNominee.nomineeAL2;
				$scope.formData.nomineeAddressLine3 = $scope.addNominee.nomineeState;
				$scope.formData.nomineeAddressLine4 = $scope.addNominee.nomineeCity;
                $scope.formData.Country = $scope.addNominee.nomineeCountry //3.5 change
                $scope.formData.pin = $scope.addNominee.nomineePin; //3.5 change
				$scope.formData.isMinor = '0';
				if ($scope.guardianForm === true) {
					$scope.formData.guardianName = $scope.addNominee.guardianName;
                    /*$scope.formData.guardianAddress = $scope.addNominee.guardianAL1
							+ $scope.addNominee.guardianAL2
							+ $scope.addNominee.guardianState
                    		+ $scope.addNominee.guardianCity;*/ //3.5 change
                    $scope.formData.pinGuardian = $scope.addNominee.guardianPin;
                    $scope.formData.guardianAddress1 = $scope.addNominee.guardianAL1;
                    $scope.formData.guardianAddress2 = $scope.addNominee.guardianAL2;
                    $scope.formData.guardianAddress3 = $scope.addNominee.guardianState;
                    $scope.formData.guardianAddress4 = $scope.addNominee.guardianCity;
                    $scope.formData.gCountry = $scope.addNominee.guardianCountry;
					$scope.formData.isMinor = '1';
				}
				$scope.errorSpin1 = true;
				$scope.submitSR();
			}
		};

		$scope.formData = {
			category: '',
			subCategory: '',
			csType: '',
			acctNo: '',
			accountHoldings: '',
			mobileNo: '',
			emailId: '',
			cardNo: '',
			customerId: '',
			secondayAccount: '',
			amount: '',
			flag: '',
			chequeLeaves: '',
			permanentAddress: '',
			communicationAddress: '',
			fromDate: '',
			toDate: '',
			srName: '',
			deliveryAddress: '',
			nomineeName: '',
			nomineeDOB: '',
			nomineeAddressLine1: '',
			nomineeAddressLine2: '',
			nomineeAddressLine3: '',
			nomineeAddressLine4: '',
			relationship: '',
			guardianName: '',
			guardianDOB: '',
			guardianAddress: '',
			otpValue: '',
			frequency: '',
			isMinor: '',
			vpisType: ''
		};

		$scope.chequebook = {
			chequebookleaves: {
				value: '',
				options: [ {
					'value': '25',
					'text': '25'
				}, {
					'value': '50',
					'text': '50'
				}, {
					'value': '75',
					'text': '75'
				}, {
					'value': '100',
					'text': '100'
				} ]

			}
		};

		$scope.addNominee = {
			nomineeName: '',
			nomineeDOB: '',
			nomineeRelationship: '',
			nomineeAL1: '',
			nomineeAL2: '',
			nomineeCity: '',
			nomineeState: '',
			guardianName: '',
			guardianDOB: '',
			guardianAL1: '',
			guardianAL2: '',
			guardianCity: '',
            guardianState: '',
            nomineePin: ''

		};

		$scope.submitAccountStatement = function(isValid) {
			var difftime = (($scope.servicerequest.scheduleToDate.getTime() - $scope.servicerequest.scheduleFromDate
					.getTime()) / (1000 * 24 * 60 * 60));
			if (!isValid || difftime > 180) {
				if (difftime > 180) {
					$scope.dateDiff = true;
				}
				return true;
			} else {
				$scope.errorSpin1 = true;
				//$scope.generateOTP('send');
				$scope.readSMS('send');
			}
		};

		$scope.submitAccountStatementOTP = function(isValid) {
			if (!isValid) {
				return true;
			} else {
				$scope.errorSpin1 = true;
				$scope.fetchAddress();
			}
		};

		$scope.permanentAddress = '';
		$scope.communicationAddress = '';

		$scope.fetchAddress = function() {

			var self = this;
			self.address = httpService.getInstance({
				endpoint: lpWidget.getPreference('addressUrl')

			});

			var xhr = self.address.read();

			xhr
					.success(function(data) {
						$scope.errorSpin1 = false;
						if (data && data !== 'null') {
							$scope.permanentAddress = data.pmtAddrLne1
									+ data.pmtAddrLne2 + data.pmtCty
									+ data.pmtState + data.pmtCntry
									+ data.pmtPnCde;
							$scope.communicationAddress = data.comAddrLne1
									+ data.comAddrLne2 + data.comCty
									+ data.comState + data.comCntry
									+ data.comPnCde;
							if ($scope.accountDetails.deliveryaddress.value === 'CA') {
								$scope.formData.deliveryAddress = $scope.communicationAddress;
							} else {
								$scope.formData.deliveryAddress = $scope.permanentAddress;
							}
							$scope.formData.category = 'Deposits';
							$scope.formData.subCategory = shareModels.model.subCategoryList;
							$scope.formData.fromDate = $scope.servicerequest.scheduleFromDate
									.getTime();
							$scope.formData.toDate = $scope.servicerequest.scheduleToDate
									.getTime();
							$scope.formData.csType = 'SR';
							$scope.formData.acctNo = $scope.accountDetails.accountNumber;
							$scope.formData.srName = 'accountStatement';
							$scope.formData.otpValue = $scope.control.otpValue;
							$scope.errorSpin1 = true;
							$scope.submitSR();
						}
					});
			xhr.error(function(data) {
				$scope.errorSpin1 = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);

					if ((data.cd === '501')) {
						$scope.globalError = true;
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					} else {
						$scope.globalError = true;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					}
				}
				self.error = {
					message: data.statusText
				};
			});

			return xhr;

		};
		$scope.getRelationshipList = function() {
			var self = this;

			self.relationshipList = httpService.getInstance({
				endpoint: lpWidget.getPreference('relationshipUrl'),
				urlVars: {
					requestId: 'relationList'
				}
			});
			var xhr = self.relationshipList.read();
			xhr.success(function(data) {
				$scope.errorSpin1 = false;
				if (data && data !== 'null') {

					$scope.relationshipList = data.relationnameList;
				}
			});
			xhr.error(function(data) {
				$scope.errorSpin1 = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);

					if ((data.cd === '501')) {
						$scope.globalError = true;
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					} else {
						$scope.globalError = true;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					}
				}
				self.error = {
					message: data.statusText
				};
			});

			return xhr;

		};

		$scope.getStateList = function() {
			var self = this;

			self.stateList = httpService.getInstance({
				endpoint: lpWidget.getPreference('stateUrl'),
				urlVars: {
					requestId: 'stateList'
				}
			});
			var xhr = self.stateList.read();
			xhr.success(function(data) {
				$scope.errorSpin1 = false;
				if (data && data !== 'null') {

					$scope.stateList = data.statenameList;
				}
			});
			xhr.error(function(data) {
				$scope.errorSpin1 = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);

					if ((data.cd === '501')) {
						$scope.globalError = true;
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					} else {
						$scope.globalError = true;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					}
				}
				self.error = {
					message: data.statusText
				};
			});

			return xhr;

		};
		$scope.getPayableatList = function() {
			var self = this;

			self.payableAtList = httpService.getInstance({
				endpoint: lpWidget.getPreference('subcategorySearchUrl'),
				urlVars: {
					requestId: 'getPayableAt'
				}
			});
			var xhr = self.payableAtList.read();
			xhr.success(function(data) {
				$scope.errorSpin1 = false;
				if (data && data !== 'null') {

					$scope.payableAtList = data;
				}
			});
			xhr.error(function(data) {
				$scope.errorSpin1 = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);

					if ((data.cd === '501')) {
						$scope.globalError = true;
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					} else {
						$scope.globalError = true;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					}
				}
			});

			return xhr;

		};

		$scope.accountList1 = '';
		$scope.primaryAccount = '';

		$scope.validate = function(account1, account2) {
			if (account2) {
				if (account1 === account2) {
					return true;
				}
			}
			return false;
		};

		$scope.getAge = function(dob) {
			var dateString = dob;
			var today = new Date();
			var birthDate = new Date(dateString);
			var age = today.getFullYear() - birthDate.getFullYear();
			var m = today.getMonth() - birthDate.getMonth();
			if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}
			return age;
		};

		$scope.clearEmailForm = function() {
			$scope.accountDetails.accountNumber = '';
			$scope.accountDetails.frequency.value = '';
            $scope.servicerequest.scheduleFromDate='';
            $scope.servicerequest.scheduleToDate='';
       
       
		};

		$scope.clearRepaymentForm = function() {
			$scope.accountDetails.accountNumber = '';
		};
		$scope.clearLoansoaForm = function() {
			$scope.accountDetails.accountNumber = '';
			$scope.loansoa = {
				scheduleFromDate: '',
				scheduleToDate: ''
			};

		};
		$scope.clearDemanddraftForm = function() {
			$scope.accountDetails.accountNumber = '';
			$scope.accountDetails.beneficiaryName = '';
			$scope.accountDetails.payableAt = '';
			$scope.accountDetails.amount = '';
			if ($scope.editAddress === true) {
				$scope.accountDetails = {
					deliveryCommAddress: {
						addressLine1: '',
						addressLine2: '',
						city: '',
						state: '',
						country: '',
						pincode: ''
					}
				};
			}
		};

		$scope.clearPassbookRegistrationForm = function() {
			$scope.accountDetails.accountNumber = '';
		};

		$scope.clearSweepInForm = function() {
			$scope.accountDetails.primaryAccount = '';
			$scope.accountDetails.secondaryAccount = '';
			$scope.accountDetails.amount = '';
		};

		$scope.clearAccountStatementForm = function() {
			$scope.accountDetails.accountNumber = '';
			$scope.accountDetails.deliveryaddress.value = '';
			$scope.servicerequest.scheduleFromDate = '';
			$scope.servicerequest.scheduleToDate = '';
		};

		$scope.clearChequebookForm = function() {
			$scope.accountDetails.accountNumber = '';
			$scope.chequebook.chequebookleaves.value = '';
		};

		$scope.clearAddNomineeForm = function() {
			$scope.accountDetails.accountNumber = '';
			$scope.addNominee.nomineeName = '';
			$scope.addNominee.nomineeRelationship = '';
			$scope.addNominee.nomineeDOB = '';
			$scope.addNominee.nomineeAL1 = '';
			$scope.addNominee.nomineeAL2 = '';
			$scope.addNominee.nomineeCity = '';
			$scope.addNominee.nomineeState = '';
			$scope.addNominee.guardianName = '';
			$scope.addNominee.guardianDOB = '';
			$scope.addNominee.guardianAL1 = '';
			$scope.addNominee.guardianAL2 = '';
			$scope.addNominee.guardianCity = '';
			$scope.addNominee.guardianState = '';
		};

		$scope.submitSR = function() {
			$scope.errorSpin = true;

			var self = this;

			self.submitServiceRequest = httpService.getInstance({
				endpoint: lpWidget.getPreference('saveUrl')
			});
			// xhr = service.del();
			var xhr = self.submitServiceRequest.create({
				data: $scope.formData
			});
			xhr.success(function(data) {
				$scope.errorSpin = false;
				if (data && data !== 'null') {
					gadgets.pubsub.publish("js.back", {
                                            data: "ENABLE_HOME"
                                        });
					$scope.showServiceRequestNo = true;
					$scope.serviceRequestNo = data.csId;
					$scope.OTPFlag = true;
					$scope.passbookFlag = false;

				}
			});
			xhr.error(function(data) {
				$scope.errorSpin = false;
				if (data.cd) {
					idfcerror.checkTimeout(data);
					$scope.OTPError = idfcerror.checkOTPError(data);
					if (data.cd === '02' || data.cd === '04'
							|| data.cd === '01' || data.cd === '03'
							|| data.cd === '05' || data.cd === '09'
							|| data.cd === '99') {
						$scope.success.happened = false;
						$scope.error = {
							happened: true,
							msg: data.rsn
						};
					} else if ($scope.OTPError === true) {
						// $scope.invalidOTPError=true;
						$scope.success.happened = false;
						$scope.lockFieldsOTP = true;
						$scope.error = {
							happened: true,
							msg: data.rsn
						};
					} else if ((data.cd === '501')) {
						$scope.globalError = true;
						$scope.serviceError = idfcerror.checkGlobalError(data);
						// $scope.errorSpin = false;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);
					}
					else {
						$scope.globalError = true;
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);

					}
				}

			});
		};

		$scope.generateOTPServiceEndPoint = lpWidget.getPreference('generateOTPService');
		$scope.OTPFlag = true;
		$scope.customerMob = '';
		$scope.customerMobMasked = '';
		$scope.lockFields = false;

		/**
		 * clearOTP method
		 * @desc clears OTP form
		 */
		$scope.clearOTP = function(){
			$scope.control.otpValue = '';
		};

		//SMS Reading -- Start
		//To receive events if user has cliked on resend OTP
        gadgets.pubsub.subscribe("resend.otp", function(evt){
            console.log(evt.resendOtpFlag)
            //Call function that is called on a click of "Resend OTP" button available on Widget
            $scope.readSMS('resend');
        });

        $scope.readSMS = function(resendFlag){
            console.log('Read SMS called');
            //Step 1: Check whether user has provided SMS reading permission or not through SMS plugin
            var smsPlugin = cxp.mobile.plugins['SMSPlugin'];
            if(smsPlugin){
                var isCheckSuccessCallback = function(data) {
                    if(data) {
                        var smsPermissionFlag = data['successFlag'];

                        if(smsPermissionFlag){
                            //User has already given permission for reading SMS
                            //Step 1. publish SMS reading pubsub
                            console.log('SMS permission flag' + smsPermissionFlag);
                            gadgets.pubsub.publish("readSMS",{
                                //Data contains name of the Widget. This ensures no interception between multiple
                                //widgets, publish the same event
                                data: "ServiceRequest"
                            });

                            //Step 2. Send request to "sendOTP service
                            $scope.generateOTP(resendFlag);

                            //Step 3: Subscribes for the event for receiving OTP
                            //While subscribing, event name has to be same as the DATA sent at the time of sending request for reading OTP
                            gadgets.pubsub.subscribe("ServiceRequest", function(evt){
                                //alert(evt.otp);
                                //var receivedOtp = evt.data;
                                var receivedOtp = evt.otp;
                                console.log('OTP: '+evt.otp);
                                //Sending event for stopping OTP reading
                                gadgets.pubsub.publish("stopReceiver",{
                                    data:"Stop Reading OTP"
                                });



                                //Step 4: Send request to verify OTP service. OTP should be in receiveOtp popup
                                console.log('receivedOtp'+receivedOtp);
                                $scope.control.otpValue = receivedOtp;
                                $scope.$apply();
                                console.log('OTP value :'+$scope.control.otpValue);
                                if('NominationRequest'===$scope.serviceRequestType){
                                    angular.element('#verifyOTP-btn-add-nominee').triggerHandler('click');
                                }else if('ChequeBookRequest'===$scope.serviceRequestType){
                                    angular.element('#verifyOTP-btn-cheque-book').triggerHandler('click');
                                }




                            });
                        }
                        else{
                            //User has not provided permission for SMS reading
                            //1. Send request to "sendOTP" service
                            $scope.generateOTP(resendFlag);

                        }

                    } else {
                        console.log('Some error. Dont initiate SMS reading');
                        //1. Send request to "sendOTP" service
                    }
                };
                var isCheckErrorCallback = function(data) {
                    console.log('Some error: Dont initiate SMS reading');
                };

                smsPlugin.checkSMSReadPermission(
                    isCheckSuccessCallback,
                    isCheckErrorCallback
                );
            }
        };

     //SMS Reading -- End

		$scope.generateOTP = function(value)

		{
			$scope.errorSpin1 = true;
			$scope.errorSpin = true;
			var resendOTP = null;

			var generateOTPServiceURL = lpCoreUtils.resolvePortalPlaceholders(
					$scope.generateOTPServiceEndPoint, {

						servicesPath: lpPortal.root

					});

			if (value === 'resend') {

				resendOTP = true;

			} else {

				resendOTP = false;

			}

			var postData = {

				'resendOTP': resendOTP

			};

			postData = $.param(postData || {});

			var xhr = $http({

				method: 'POST',

				url: generateOTPServiceURL,
				// url:"http://localhost:8080/portalserver/rs/v1/generateOTP",
				data: postData,

				headers: {
					'Accept': 'application/json',

					'Content-Type': 'application/x-www-form-urlencoded;'

				}

			});

			/* Check whether the HTTP Request is successful or not. */

			xhr
					.success(
							function(data) {
								gadgets.pubsub.publish("js.back", {
                                                            data: "ENABLE_HOME"
                                                        });
								$scope.errorSpin1 = false;
								$scope.errorSpin = false;
								$scope.success = {
									happened: true,
									msg: 'OTP has been successfully sent to your registered mobile number'
								};

                                //Automate Read OTP
                                //$scope.readSMS();

								$scope.error = {

									happened: false,

									msg: ''

								};

								$scope.OTPFlag = false;
								$scope.passbookFlag = false;
								$scope.lockFields = true;
								$scope.confirmButton = false;
								$scope.nomineeButton = false;

								$scope.customerMob = data.mobileNumber;
                             console.log($scope.customerMob);
                        $scope.customerMobMasked = 'xxxxxx' +
                            $scope.customerMob
												.substr($scope.customerMob.length - 4);

							}).error(
							function(data, status, headers, config) {
								$scope.OTPFlag = true;
								$scope.errorSpin1 = false;
								$scope.errorSpin = false;
								if (data.cd) {
									idfcerror.checkTimeout(data);
                                     gadgets.pubsub.publish("stopReceiver",{
                                                                        data:"Stop Reading OTP"
                                                                    });
									if ((data.cd === '501')) {
										$scope.serviceError = idfcerror
												.checkGlobalError(data);
										// $scope.errorSpin = false;
										$scope.alert = {
											messages: {
												cd: data.rsn
											}
										};
										$scope.addAlert('cd', 'error', false);
										$scope.globalError = true;
									} else {
										$scope.alert = {
											messages: {
												cd: data.rsn
											}
										};
										$scope.addAlert('cd', 'error', false);
										$scope.globalError = true;
									}
								}
								$scope.error = {

									happened: true,

									msg: data.rsn

								};

								$scope.success = {

									happened: false,

									msg: ''

								};

							});

		};
		initialize();
		  $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
	}
	exports.MyController = MyController;
	exports.AccountsController = AccountsController;
});
