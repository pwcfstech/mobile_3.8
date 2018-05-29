/**
 * Controllers
 * @module controllers
 */
define(function (require, exports, module) {

    'use strict';
    var idfcHanlder = require('idfcerror');


    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function IfscSearchController($scope, model, lpWidget, lpCoreUtils, ifscCodeSearchService, lpCoreBus, lpPortal, ContactsModel, $timeout, $http) {
		var ifscSearchCtrl = this;
        this.state = model.getState();
        this.utils = lpCoreUtils;
        var widget = lpWidget;
        var formdata;
		
        //Widget Refresh
		var deckPanelOpenHandler;
		deckPanelOpenHandler = function(activePanelName) { 
		  initialize();
		};
		lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);

        /*gadgets.pubsub.subscribe('launchpad.ifscSearch', function(){
            console.log(' gadgets.pubsub.subscribe.launchpad.ifscSearch');
            initialize();
        });*/
		var pref = {
			locale: widget.getPreference('locale'),
			lazyload: true
		};		
		
		function addAlert(code, type, timeout) {
			var alert = {
				type: type || 'error',
				msg: ifscSearchCtrl.alert.messages[code]
			};
			ifscSearchCtrl.alerts.push(alert);
			if (timeout !== false) {
				$timeout(
					function () {
						ifscSearchCtrl.closeAlert(ifscSearchCtrl.alerts
							.indexOf(alert));
					}, ALERT_TIMEOUT);
			}
		}		
		
		// Clear arr alert messages
		function clearAlerts() {
			ifscSearchCtrl.alerts = [];
		}
		
		var initialize = function (data) { 
			//$scope.internalBackEnable = false;
			idfcHanlder.validateSession($http);
            $scope.showBackButton();
            console.log('initialize called >>>>>>>>>');
			ifscSearchCtrl.contactsModel = new ContactsModel(pref);
			ifscSearchCtrl.contactsModel.errorSpin = true;
			ifscSearchCtrl.errors = {};
			ifscSearchCtrl.serviceError = false;
			ifscSearchCtrl.initialHit = true;

			ifscSearchCtrl.alert = {
				messages: {
					ADDED_SUCCESSFULLY: 'You can now transfer money to this person or entity.',
					MODIFIED_SUCCESSFULLY: 'The beneficiary details have been successfully changed.',
					DELETED_SUCCESSFULLY: 'The beneficiary has been deleted from your list. ',
					SAVED_SUCCESSFULLY: 'Contact was saved successfully.',
					SAVED_ERROR: 'There was an error while saving contact.',
					SERVICE_UNAVAILABLE: 'Unfortunately, this service is unavailable.'
				}
			};
			/**
			 * Alerts
			 */
			ifscSearchCtrl.alerts = [];
			clearAlerts();
			var self = ifscSearchCtrl.contactsModel;
			self.currentContact = {
				'ifscSearch': {}				
			};					

			
			$timeout(function(){
            localStorage.getItem('ifscformdata');
            formdata = angular.fromJson(localStorage.getItem('ifscformdata'));

            	ifscSearchCtrl.contactsModel.currentContact.ifscSearch.bankName = formdata.bankName;
	        	ifscSearchCtrl.contactsModel.currentContact.ifscSearch.ifscCode = formdata.ifscCode;
                ifscSearchCtrl.contactsModel.errorSpin = false;				
			}, 1000);

			
		}		
		
		
		/*
		* IFSC code search start
		*/
		var getIFSCBValidUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
		.getPreference('searchIFSC'), {
			servicesPath: lpPortal.root
		});		
		ifscSearchCtrl.errors = ifscSearchCtrl.errors || {};
		ifscSearchCtrl.errors['invalidIFSC'] = false;
		
		//$scope.errors = $scope.errors || {};
		//var valid = true;
		//$scope.errors['invalidIFSC'] = false;		
		
		ifscSearchCtrl.bankDetails = {};
		ifscSearchCtrl.disableBank = false;
        ifscSearchCtrl.searchKeys = {};
		ifscSearchCtrl.queryStr = '';	
        ifscSearchCtrl.qData = {'startIndex':'','limit':'','bankName':'','branchName':'','ifscCode':'','isFirstAttempt':true};		
		
		$scope.$on('resetDataForIfsc', function(eventObj, data){
			ifscSearchCtrl.errors['invalidIFSC'] = false;
			//$scope.errors['invalidIFSC'] = false;
			ifscSearchCtrl.bankDetails = {};
			ifscSearchCtrl.disableBank = false;			
		});
		$scope.$on('IFSCdetailsEvent', function(eventObj, data){  console.log(data);
                    ifscSearchCtrl.disableBank = true;
					ifscSearchCtrl.contactsModel.errorSpin = true;	
					
					ifscSearchCtrl.qData.startIndex = 0;
					ifscSearchCtrl.qData.limit = 1;
					ifscSearchCtrl.qData.bankName = ifscSearchCtrl.contactsModel.currentContact.bankName;
					ifscSearchCtrl.qData.ifscCode = data;
					//ifscSearchCtrl.qData = $.param(ifscSearchCtrl.qData || {});
					ifscCodeSearchService
						.setup({
							// getIFSCBValidUrl: 'http://125.22.109.56:7003/rs/v1/searchIFSC',
							getIFSCBValidUrl: getIFSCBValidUrl,
							data : ifscSearchCtrl.qData
						})
						.getIFSCData()
						.success(function (data) {
		                    console.log(data);
							//data = JSON.parse(data);
							ifscSearchCtrl.errors['invalidIFSC'] = false;

							//$scope.errors['invalidIFSC'] = false;
							if(data.reponseStatus == '1'){ 
							   ifscSearchCtrl.bankDetails = data.list[0];
							   ifscSearchCtrl.bankDetails.count = data.count;
							   console.log(ifscSearchCtrl.bankDetails);
							}
							if(data.reponseStatus == '0'){
								ifscSearchCtrl.errors['invalidIFSC'] = true;
								//$scope.errors['invalidIFSC'] = true;
								console.log($scope.errors);
								console.log($scope.contactsModel);
							}						   
						}).error(function (data) {
			
							if (data.cd) {
								// If session timed out, redirect to login page
								idfcHanlder.checkTimeout(data);
								// If service not available, set error flag
								ifscSearchCtrl.serviceError = idfcHanlder.checkGlobalError(data);

								ifscSearchCtrl.alert = {
									messages: {
										cd: data.rsn
									}
								};
								addAlert('cd', 'error', false);
							} else {
								ifscSearchCtrl.alert = {
									messages: {
										cd: 'Sorry! Our server are not talking to each other'
									}
								};
							  addAlert('cd', 'error', false);								
							}								
						}).finally(function(){
							ifscSearchCtrl.disableBank = false;
							ifscSearchCtrl.contactsModel.errorSpin = false;
						});					
					
		});
		/** not sure link function  
		ifscSearchCtrl.goToSearchIFSCpage = function(){	
		   ifscSearchCtrl.widgetSize = 'small';	  
           ifscSearchCtrl.contactsModel.currentContact.ifscSearch.bankName = ifscSearchCtrl.contactsModel.currentContact.bankName;  
           //$scope.contactsModel.currentContact.ifscSearch.ifscCode = $scope.contactsModel.currentContact.ifscCode.substr(0, 4); 
		   ifscSearchCtrl.contactsModel.currentContact.ifscSearch.ifscCode = ifscSearchCtrl.storeIFSCcode;
           //$scope.contactsModel.currentContact.ifscCode = ifscSearchCtrl.storeIFSCcode;		   

		   ifscSearchCtrl.searchKeys.bankName = ifscSearchCtrl.contactsModel.currentContact.ifscSearch.bankName;
		   ifscSearchCtrl.searchKeys.ifscCode = ifscSearchCtrl.contactsModel.currentContact.ifscSearch.ifscCode;	
           ifscSearchCtrl.findBranch(true);
           ifscSearchCtrl.initialHit = true;		   
		   contactChangeV iew('ifscSearch');	
		};**/
		
		
		
		gadgets.pubsub.subscribe('launchpad.ifscSearch', function(data){

		var data = angular.fromJson(localStorage.getItem('ifscformdata'));
		console.log('subscribe >>>> ', data);
           	//ifscSearchCtrl.searchKeys = data.searchKeys;
			ifscSearchCtrl.landingWidget = data.callingWidget;
			ifscSearchCtrl.pubsubEvent = data.pubsubEvent;
            //initialize(data);

		});
		
		
		  $scope.showBackButton = function() {
			  console.log('Back button called');
            $scope.internalBackEnable = true;
            gadgets.pubsub.publish("js.back", {
                data: "ENABLE_BACK"
            });
			
			
        };
		
		
		
		ifscSearchCtrl.setBankDetails = function(){ 
			//var data = ifscCodeSearchService.getBankData($scope.contactsModel.currentContact.ifscSearch.bankData);
			var data = ifscCodeSearchService.getBankData(ifscSearchCtrl.contactsModel.currentContact.ifscSearch.itemIndex);
			//ifscSearchCtrl.bankDetails = data;
			//ifscSearchCtrl.bankDetails.count = 1;
			ifscSearchCtrl.contactsModel.currentContact.ifscCode = data.ifscCode;
			//ifscSearchCtrl.cancelForm();
			console.log('ifscSearchCtrl.pubsubEvent ::'+formdata.pubsubEvent);

			var data_for_ifsc_widget=angular.toJson(data);
			
			if(formdata.callingWidget == 'launchpad-retail.goToAddPayee')
            localStorage.setItem('addressbook_landing_data', data_for_ifsc_widget);
		    else
				localStorage.setItem('transfer_landing_data', data_for_ifsc_widget);
				
            console.log('ifscSearchCtrl.landingWidget:::'+formdata.callingWidget);
			
			gadgets.pubsub.publish(formdata.pubsubEvent, data);

			gadgets.pubsub.publish(formdata.callingWidget, '');
		};


		
		/*  gadgets.pubsub.subscribe("native.back", function(evt) {
            angular.forEach(document.getElementsByClassName(
                "tooltip"), function(e) {
                e.style.display = 'none';
            })
            $scope.cancelFormBack();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if(localStorage.getItem("navigationFlag") || $scope.internalBackEnable) {
                angular.forEach(document.getElementsByClassName(
                "tooltip"), function(e) {
                e.style.display = 'none';
            })
            $scope.cancelFormBack();
            }else {
                gadgets.pubsub.publish("device.GoBack");
            }
        }); */
		
		
		//Need To Uncoment
		
		/* gadgets.pubsub.subscribe("native.back", function(evt) {
                    //console.log('ifscSearchCtrl.pubsubEvent ::'+ifscSearchCtrl.pubsubEvent);
                    gadgets.pubsub.publish(ifscSearchCtrl.pubsubEvent, '');

                    //var data_for_ifsc_widget=angular.toJson(data);
                    localStorage.setItem('addressbook_landing_data', '');
                    gadgets.pubsub.publish(ifscSearchCtrl.landingWidget, '');
                });


        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
        console.log("GoBackInitiate  called via upBackButton");

                });
				*/
				
				

		/** loadmore paging start ***/ 
		ifscSearchCtrl.showed = 0;		
		ifscSearchCtrl.currentPage = 0;
		ifscSearchCtrl.start_limit = 0;
		ifscSearchCtrl.end_limit = 50;
		ifscSearchCtrl.countOfAllRecord = 0;
		
		ifscSearchCtrl.itemsPerPage = 10;
		ifscSearchCtrl.disableFindBtn = false;
		
		/*var branchListUrl = lpCoreUtils.resolvePortalPlaceholders(lpWidget
		.getPreference('getIFSCBranchList'), {
			//servicesPath: lpPortal.root
		});		*/
		ifscSearchCtrl.resetAllIFSCData = function(){
				ifscCodeSearchService.clrItems();
				ifscSearchCtrl.showed = 0;		
				ifscSearchCtrl.currentPage = 0;
				ifscSearchCtrl.start_limit = 0;
				ifscSearchCtrl.end_limit = 50;	
                ifscSearchCtrl.countOfAllRecord = 0;	
                ifscSearchCtrl.pagedItems = {};
                //ifscSearchCtrl.initialHit = false;
                ifscSearchCtrl.emptyRecord = false;
                clearAlerts();
                ifscSearchCtrl.contactsModel.currentContact.ifscSearch.bankData = '';				
		};
		ifscSearchCtrl.resetAllifscSearchKeys = function(){
			ifscSearchCtrl.contactsModel.currentContact.ifscSearch = {};
		};		
		ifscSearchCtrl.createQueryString = function(){
			/*var queryStr = '';
			if(ifscSearchCtrl.searchKeys.bankName)
				 queryStr += '&bankName='+ifscSearchCtrl.searchKeys.bankName;
			if(ifscSearchCtrl.searchKeys.branchName)
				 queryStr += '&branchName='+ifscSearchCtrl.searchKeys.branchName;
			if(ifscSearchCtrl.searchKeys.ifscCode)
				 queryStr += '&ifscCode='+ifscSearchCtrl.searchKeys.ifscCode;		

		   console.log(queryStr);	 
           return encodeURI(queryStr);	*/	
		    ifscSearchCtrl.qData = {};
			if(ifscSearchCtrl.searchKeys.bankName)
			     ifscSearchCtrl.qData.bankName = ifscSearchCtrl.searchKeys.bankName;
			if(ifscSearchCtrl.searchKeys.branchName)
			     ifscSearchCtrl.qData.branchName = ifscSearchCtrl.searchKeys.branchName;
			//if(ifscSearchCtrl.searchKeys.ifscCode)	
			//     ifscSearchCtrl.qData.ifscCode = ifscSearchCtrl.searchKeys.ifscCode;

            ifscSearchCtrl.qData.sortBy = ''; 			 

		   console.log(ifscSearchCtrl.qData);	 		   
		};
		ifscSearchCtrl.findBranch = function(valid){ console.log(valid);
			if(valid){
				ifscSearchCtrl.emptyRecord = false;
				ifscSearchCtrl.initialHit = false;
				ifscSearchCtrl.disableFindBtn = true;
				ifscSearchCtrl.contactsModel.errorSpin = true;
	
				console.log(ifscSearchCtrl.contactsModel.currentContact.ifscSearch);
				
				ifscSearchCtrl.searchKeys.bankName = ifscSearchCtrl.contactsModel.currentContact.ifscSearch.bankName;
				ifscSearchCtrl.searchKeys.branchName = ifscSearchCtrl.contactsModel.currentContact.ifscSearch.branchName;
				ifscSearchCtrl.searchKeys.ifscCode = ifscSearchCtrl.contactsModel.currentContact.ifscSearch.ifscCode;
				console.log(ifscSearchCtrl.searchKeys);				
				
				ifscSearchCtrl.resetAllIFSCData();
				//var quertStr = ifscSearchCtrl.createQueryString();
				ifscSearchCtrl.createQueryString();
				
			    ifscSearchCtrl.qData.startIndex = ifscSearchCtrl.start_limit;
			    ifscSearchCtrl.qData.limit = ifscSearchCtrl.end_limit;
                ifscSearchCtrl.qData.isFirstAttempt = true;				
                //ifscSearchCtrl.qData = $.param(ifscSearchCtrl.qData || {});  
			console.log('URL ::'+getIFSCBValidUrl);
			   ifscCodeSearchService
				.setup({
					//branchListUrl: branchListUrl + '?offset='+ifscSearchCtrl.start_limit+'&limit='+ifscSearchCtrl.end_limit+quertStr,
					branchListUrl: getIFSCBValidUrl,
					data : ifscSearchCtrl.qData
				})
				.getList()
				.success(function (data) { console.log(':::::::::::::::::::::',data);
				    if(data.error){
					console.log('error >>>>>>>>>>'); 
					console.log(data); 
							if (data.error.cd) {
								// If session timed out, redirect to login page
								//idfcHanlder.checkTimeout(data.error);
								// If service not available, set error flag
								//ifscSearchCtrl.serviceError = idfcHanlder.checkGlobalError(data.error);
								ifscSearchCtrl.emptyRecord = true;	
								ifscSearchCtrl.initialHit = false;
								/*ifscSearchCtrl.alert = {
									messages: {
										cd: data.error.rsn
									}
								};
								addAlert('cd', 'error', false);*/
							} else {
								ifscSearchCtrl.alert = {
									messages: {
										cd: 'Sorry! Our machines are not talking to each other. Humans are trying to fix the problem.'
									}
								};
								addAlert('cd', 'error', false);								
							}
						
					}else{
                    ifscCodeSearchService.loadData(data, function(){ console.log('1111111111>>>>>>>>');
						ifscSearchCtrl.total = ifscCodeSearchService.total();
						ifscSearchCtrl.pagedItems = ifscCodeSearchService.get(ifscSearchCtrl.currentPage*ifscSearchCtrl.itemsPerPage, ifscSearchCtrl.itemsPerPage);	
						ifscSearchCtrl.showed = ifscSearchCtrl.showed + ifscSearchCtrl.pagedItems.length;  
                        ifscSearchCtrl.countOfAllRecord = ifscCodeSearchService.getTotalRecord();	

                        if(!ifscSearchCtrl.pagedItems.length)
							ifscSearchCtrl.emptyRecord = true;
						      //ifscSearchCtrl.initialHit = true;
						if(ifscSearchCtrl.countOfAllRecord == 1){  console.log('get total record length :::::::::::: ', ifscSearchCtrl.countOfAllRecord);
							ifscSearchCtrl.contactsModel.currentContact.ifscSearch.bankData=ifscSearchCtrl.pagedItems[0].ifscCode;
							ifscSearchCtrl.contactsModel.currentContact.ifscSearch.itemIndex = ifscSearchCtrl.pagedItems.indexOf(ifscSearchCtrl.pagedItems[0]);
						}
					});	
					}					
				}).error(function (data) {
					console.log('error >>>>>>>>>>'); 
					console.log(data); 
							if (data.cd) {
								// If session timed out, redirect to login page
								idfcHanlder.checkTimeout(data);
								// If service not available, set error flag
								ifscSearchCtrl.serviceError = idfcHanlder.checkGlobalError(data);
								ifscSearchCtrl.initialHit  = false;
								ifscSearchCtrl.emptyRecord = true;
								/*ifscSearchCtrl.alert = {
									messages: {
										cd: data.rsn
									}
								};*/
								//addAlert('cd', 'error', false);
							} else {
								ifscSearchCtrl.alert = {
									messages: {
										cd: 'Sorry! Our machines are not talking to each other. Humans are trying to fix the problem.'
									}
								};
								addAlert('cd', 'error', false);								
							}
				}).finally(function(){
					ifscSearchCtrl.disableFindBtn = false;
					ifscSearchCtrl.contactsModel.errorSpin = false;
				});
            }			
		};

		ifscSearchCtrl.loadMore = function() {
		ifscSearchCtrl.currentPage++;

		if(ifscCodeSearchService.total() == ifscSearchCtrl.showed){ 
			console.log('Call service .....');
			ifscSearchCtrl.contactsModel.errorSpin = true;
	
			ifscSearchCtrl.start_limit = ifscSearchCtrl.showed;

		    //var quertStr = ifscSearchCtrl.createQueryString();
			ifscSearchCtrl.createQueryString();
			ifscSearchCtrl.qData.startIndex = ifscSearchCtrl.start_limit;
			ifscSearchCtrl.qData.limit = ifscSearchCtrl.end_limit;
			ifscSearchCtrl.qData.isFirstAttempt = false;
			//ifscSearchCtrl.qData = $.param(ifscSearchCtrl.qData || {}); 
			ifscCodeSearchService
				.setup({
					/*branchListUrl: branchListUrl + '?offset='+ifscSearchCtrl.start_limit+'&limit='+ifscSearchCtrl.end_limit+quertStr,*/
					branchListUrl: getIFSCBValidUrl,
					data : ifscSearchCtrl.qData
				})
				.getList()
				.success(function (data) {
					if(data.error){
					console.log('error >>>>>>>>>>'); 
					console.log(data); 
							if (data.error.cd) {
								// If session timed out, redirect to login page
								idfcHanlder.checkTimeout(data.error);
								// If service not available, set error flag
								ifscSearchCtrl.serviceError = idfcHanlder.checkGlobalError(data.error);

								ifscSearchCtrl.alert = {
									messages: {
										cd: data.error.rsn
									}
								};
								addAlert('cd', 'error', false);
							} else {
								ifscSearchCtrl.alert = {
									messages: {
										cd: 'Sorry! Our machines are not talking to each other. Humans are trying to fix the problem.'
									}
								};
								addAlert('cd', 'error', false);								
							}	
						
					}else{
                    ifscCodeSearchService.loadData(data, function(){
						var newItems = ifscCodeSearchService.get(ifscSearchCtrl.showed, ifscSearchCtrl.itemsPerPage);
						ifscSearchCtrl.pagedItems = ifscSearchCtrl.pagedItems.concat(newItems); 
						console.log(newItems);
						ifscSearchCtrl.showed = ifscSearchCtrl.showed + newItems.length;  	
					});	
					}					
				}).error(function (data) {
					console.log(data);
							if (data.cd) {
								// If session timed out, redirect to login page
								idfcHanlder.checkTimeout(data);
								// If service not available, set error flag
								ifscSearchCtrl.serviceError = idfcHanlder.checkGlobalError(data);

								ifscSearchCtrl.alert = {
									messages: {
										cd: data.rsn
									}
								};
								addAlert('cd', 'error', false);
							} else {
								ifscSearchCtrl.alert = {
									messages: {
										cd: 'Sorry! Our machines are not talking to each other. Humans are trying to fix the problem.'
									}
								};
								addAlert('cd', 'error', false);								
							}
				}).finally(function(){
					ifscSearchCtrl.contactsModel.errorSpin = false;
				});		

		} else {
			var newItems = ifscCodeSearchService.get(ifscSearchCtrl.showed, ifscSearchCtrl.itemsPerPage);
			ifscSearchCtrl.pagedItems = ifscSearchCtrl.pagedItems.concat(newItems);
			ifscSearchCtrl.showed = ifscSearchCtrl.showed + newItems.length;  
		}

		};

		ifscSearchCtrl.nextPageDisabledClass = function() { //console.log(ifscSearchCtrl.showed);
		return ifscCodeSearchService.getTotalRecord() == ifscSearchCtrl.showed ? false : true;

		};

		ifscSearchCtrl.pageCount = function() {
		return Math.ceil(ifscSearchCtrl.total/ifscSearchCtrl.itemsPerPage);
		};		
		
		
	    ifscSearchCtrl.backtoWidget = function(){
	      console.log('back button hit >>>>>>>>>>>>>>>>>>>>>>>>>>'+ifscSearchCtrl.pubsubEvent);

	      //lpCoreBus.publish('landingFromIfsc', '');
		 /* gadgets.pubsub.publish(ifscSearchCtrl.pubsubEvent, '');
		  gadgets.pubsub.publish(ifscSearchCtrl.landingWidget, '');*/
		  gadgets.pubsub.publish(formdata.pubsubEvent, '');
	    };

           /*  gadgets.pubsub.subscribe("native.back", function(evt) {
             console.log('back button hit ###############');
                });




				gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {

				gadgets.pubsub.publish("js.back", {
                                                       data: "ENABLE_HOME"
                                     });


                console.log('back button hit ###############1234');

				gadgets.pubsub.publish("device.GoBack");

             });
*/

 // For back buttton pub-sub // Satrajit code on old widget // Jay
       gadgets.pubsub.subscribe("native.back", function() {
           console.log("native.back handled in ifsc");
                  gadgets.pubsub.publish(formdata.callingWidget);
                  gadgets.pubsub.publish("js.back", {
                          data: "ENABLE_HOME"
                  });
       });

       gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
           console.log("device back GoBackInitiate handled in ifsc");
           if(localStorage.getItem("navigationFlag")) {
               //localStorage.clear();
               gadgets.pubsub.publish(formdata.callingWidget);
               gadgets.pubsub.publish("js.back", {
                       data: "ENABLE_HOME"
               });
           }else {
               gadgets.pubsub.publish("device.GoBack");
           }
           ifscSearchCtrl.backtoWidget();
       });


		/*
		* IFSC code search end
		*/	
				
		initialize();
		  $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }

    /*IfscSearchController.prototype.$onInit = function() {
        // Do initialization here
    };*/

    exports.IfscSearchController = IfscSearchController;
});
