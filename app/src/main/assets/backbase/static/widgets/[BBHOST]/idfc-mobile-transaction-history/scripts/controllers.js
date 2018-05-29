/**
 * Controllers
 * @module controllers
 */
define(function(require, exports) {
       
       'use strict';
       var idfcerror = require('idfcerror');
       //var $ = require('jquery');
       var idfcConstants = require('idfccommon').idfcConstants;
       /**
        * Main controller
        * @ngInject
        * @constructor
        */
       exports.billPayTransactionController = function(WidgetModel, lpWidget, lpCoreUtils,
                                             lpCoreError, httpService, $scope, i18nUtils, $rootElement,
                                             lpCoreBus, $timeout,$http) {

       this.model = WidgetModel;
       this.utils = lpCoreUtils;
       this.error = lpCoreError;
       this.widget = lpWidget;
       var initialize = function() {

       //Session Validation Call
       idfcerror.validateSession($http);

       $scope.noTransactionDetails = false;
       $scope.billerList = [];
       $scope.loadBillers();
       $scope.fetchTransactionList();
       $scope.noTransactions = false;
       $scope.serviceError1=true;
       };
       var pagesShown = 1;
       var pageSize = 5;
       $scope.loadBillers = function() {
       var self = this;
       self.loadBillers = httpService.getInstance({
                                                  endpoint: lpWidget.getPreference('loadBillerUrl')
                                                  });
       
       var xhr = self.loadBillers.read();
       
       console.log("xhr value is: " + xhr);

       xhr.success(function(data) {
                   console.log("Inside xhr success");
                   if (data && data !== 'null') {
                   
                   $scope.billerList = data;
                   console.log("data",data);
                   console.log($scope.billerList.bllrDtls);
                     console.log($scope.billerList.bllrDtls.bllrId);
                   
                   $scope.errorSpin = false;
                   
                   }
                   });
       xhr.error(function(data) {
                 console.log("Inside xhr error");
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
						/* $scope.alert = {
						messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false); */
                 }
                 }
                 
                 self.error = {
                 message: data.statusText
                 };
                 });
       
       return xhr;
       };
       
       $scope.transactionHistory = {
       billerName: '',
       fromDate: '',
       toDate: ''
       
       };
       var date = new Date();
       // var FromDate = '';
       // var ToDate = '';
       $scope.todaysDate = new Date();
       $scope.minDate = date.setDate((new Date()).getDate() - 180);
       $scope.isOpenDate1 = false;
       $scope.isOpenDate2 = false;
//       $scope.serviceError1=false;
       
       $scope.openFromCalendar = function($event) {
       $scope.isOpenDate1 = true;
       $event.preventDefault();
       $event.stopPropagation();
       
       };
       $scope.fromDate = '';
       $scope.toDate = '';
       $scope.search = function() {
       $scope.serviceError1=false;
       console.log("$scope.transactionHistory.toDate",$scope.transactionHistory.toDate);
       console.log("$scope.todaysDate",$scope.todaysDate);
       console.log("$scope.transactionHistory.fromDate",$scope.transactionHistory.fromDate);
       console.log("$scope.transactionHistory.toDate",$scope.transactionHistory.toDate);

       $scope.errMessage = '';
       if ($scope.transactionHistory.fromDate === ''
           || $scope.transactionHistory.toDate === '') {
       
       $scope.errMessage = 'Please select From And To date ';
       return false;
       }
			if ($scope.transactionDet !== ''&& ($scope.transactionHistory.fromDate === '' || $scope.transactionHistory.toDate === '')) {
				$scope.fetchTransactionList();
			}
			else {
       if ($scope.transactionHistory.toDate < $scope.todaysDate
           && $scope.transactionHistory.fromDate > $scope.transactionHistory.toDate) {
       $scope.errMessage = 'To Date should be greater than From Date';
       return false;
       }
       var oneDay = 24 * 60 * 60 * 1000;
       
       if ($scope.transactionHistory.toDate > $scope.todaysDate) {
       $scope.errMessage = 'To date is greater than today\'s date';
       return false;
       }
       var diff = $scope.transactionHistory.toDate.getTime()
       - $scope.transactionHistory.fromDate.getTime();
       var diffDays = diff / oneDay;
       var diffMonths = diffDays / idfcConstants.DAYS_IN_MONTH;
       if (diffMonths > idfcConstants.MINIMUM_MONTH_TRANSACTION) {
       $scope.errMessage = 'Please restrict the statement period to a maximum of 6 months.';
       return false;
       } else {
       $scope.fetchTransactionList();
       }
       }
       };
       $scope.fetchTransactionList = function() {
       $scope.errorSpin = true;
			$scope.noTransactions = false;
       //$scope.fromDate=new Date('$scope.transactionHistory.fromDate').format('yyyy-MM-dd');
       if ($scope.transactionHistory.fromDate !== '') {
       $scope.fromDate = new Date($scope.transactionHistory.fromDate)
       .getTime();
       }
       if ($scope.transactionHistory.toDate !== '') {
       $scope.toDate = new Date($scope.transactionHistory.toDate)
       .getTime();
       }
       $scope.formData = {
				'bllrNm': $scope.transactionDet,
       'frmDt': $scope.fromDate,
       'toDt': $scope.toDate
       };
       var self = this;
       self.getTransactionList = httpService.getInstance({
                                                         endpoint: lpWidget.getPreference('getTransactionListUrl')
                                                         
                                                         });
       
       var xhr = self.getTransactionList.create({
                                                data: $scope.formData
                                                });
       
       xhr.success(function(data) {
                   $scope.errorSpin = false;
                   if (data && data !== 'null') {
                   if (data.blldDtls === []
                       || data.blldDtls[0].bllrId === null
                       || data.blldDtls[0].bllrId === '') {
                   $scope.noTransactionDetails = true;
                   } else {
                   $scope.noTransactionDetails = false;
                  // $scope.serviceError1=true;
						$scope.errMessage = 'The last 5 payments you have made are below. To view more bill payments please select show more.';
						$scope.transactionDetails = data.blldDtls;
                   
							$scope.showMore($scope.transactionDetails);						
					}					
                   
                   }
                   });
       xhr.error(function(data) {
				$scope.errorSpin = false;
				$scope.noTransactions = false;
				$scope.noTransactionDetails = true;
				if (data.cd) {
					idfcerror.checkTimeout(data);
//					if(data.cd === 'BPAY:INV_MSG_097'){
					$scope.noTransactions = true;
                     $scope.errorMessage = data.rsn;
	//				}
					if ((data.cd === '501')) {
                 $scope.serviceError = idfcerror.checkGlobalError(data);
                 
                 $scope.alert = {
                 messages: {
                 cd: data.rsn
                 }
                 };
						$scope.addAlert('cd', 'error', false);
					} 
					/*else {
						$scope.alert = {
							messages: {
								cd: data.rsn
							}
						};
						$scope.addAlert('cd', 'error', false);
					}*/
				}
                 
                 self.error = {
                 message: data.statusText
                 };
                 });
       
       return xhr;
       };
       /**
        * Alerts to push Alerts on screen
        */
       $scope.alerts = [];
       
       $scope.addAlert = function(code, type, timeout) {
       var customAlert = {
       type: type || 'error',
       msg: $scope.alert.messages[code]
       };
            $scope.clearAlerts();
       $scope.alerts.push(customAlert);
       
       if (timeout !== false) {
       $timeout(function() {
                $scope.closeAlert($scope.alerts.indexOf(customAlert));
                }, ALERT_TIMEOUT);
			}

		};
		// Remove specific alert
	    $scope.closeAlert = function (index) {
	    $scope.alerts.splice(index, 1);
    	};

	    // Clear arr alert messages
	    $scope.clearAlerts = function () {
	    $scope.alerts = [];
	    };

       $scope.showMore = function(value) {
       $scope.allowMoreResults = true;
       $scope.paginationLimit = function(value) {
       return pageSize * pagesShown;
       };
       $scope.hasMoreItemsToShow = function() {
       return pagesShown < (value.length / pageSize);
       };
       $scope.showMoreItems = function() {
       pagesShown = pagesShown + 1;
       };
       
       $scope.clear = function() {
       
       $scope.errMessage = '';
       };
       
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
       
       // Widget Refresh code
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
       // Widget Refresh code
       initialize();
       gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
       });
       // $timeout(function(){
       //          gadgets.pubsub.publish('cxp.item.loaded', {
       //              id: widget.id
       //          });
       //      }, 10);
       // }
       
       /**
        * Export Controllers
        */
       }});

