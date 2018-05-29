define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var idfcHanlder = require('idfcerror');
    var ALERT_TIMEOUT = 4000;

    function RDClosureWidgetController($scope, lpWidget, $http,
        $timeout, i18nUtils, lpCoreUtils, lpPortal, lpCoreBus) {

        var initialize = function() {

            //Session Management Call
            idfcHanlder.validateSession($http);

            $(window).scrollTop(0);
            var deckPanelOpenHandler;
            deckPanelOpenHandler = function(activePanelName) {
                if (activePanelName === lpWidget.parentNode
                    .model.name) {
                    lpCoreBus.flush('DeckPanelOpen');
                    lpCoreBus.unsubscribe('DeckPanelOpen',
                        deckPanelOpenHandler);
                    lpWidget.refreshHTML(function(bresView) {
                        lpWidget.parentNode =
                            bresView.parentNode;
                    });
                }
            };
            lpCoreBus.subscribe('DeckPanelOpen',
                deckPanelOpenHandler);
            $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(
                lpWidget) + '/templates/partials/';
            $scope.searchIndex = 1;
            $scope.typeFilters = {
                'term': {
                    label: 'term',
                    code: 'term',
                    selected: true
                },
                'recurring': {
                    label: 'recurring',
                    code: 'loan',
                    selected: false
                }
            };
            $scope.search = {
                name: '',
                typeFilter: ''
            };
            $scope.contextLabel = 'All';
            i18nUtils.loadMessages(lpWidget, $scope.locale).success(
                function(bundle) {
                    $scope.messages = bundle.messages;
                });
        };
        $scope.restartWizard = function() {
            $scope.reset();
            $scope.goToWizardStep(1);
        };
        $scope.reset = function() {};
        $scope.loadAccounts = function() {
            $scope.reset();
            $timeout(function() {}, 2000);
        };
        $scope.close = function() {
            lpCoreBus.publish(
                'launchpad-retail.closeActivePanel');
        };
        var rdClosureSub = lpCoreBus.subscribe(
            'launchpad-retail.recurringDepositsClosure',
            function() {});
        $scope.$on('$destroy', function() {
            rdClosureSub.unsubscribe();
        });
        initialize();
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });
    }

    function RDClosureDetails($scope, $rootScope, $http, lpWidget, $timeout,
        httpService, lpCoreUtils, lpPortal, lpCoreBus) {
//        $scope.selectedRDAccount = '';
            var urlclosedeposit = lpCoreUtils.resolvePortalPlaceholders(lpWidget
			.getPreference('RDClosureUrl') + '?dummy=' + new Date().getTime() + '&cnvId=OTD', {
				servicesPath: lpPortal.root
			});
        $scope.alerts = [];
        $scope.addAlert = function(code, type, timeout) {
            var alert = {
                type: type || 'error',
                msg: $scope.alert.messages[code]
            };
            $scope.alerts.push(alert);
            if (timeout !== false) {
                $timeout(function() {
                    $scope.closeAlert($scope.alerts.indexOf(
                        alert));
                }, ALERT_TIMEOUT);
            }
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
        var closureDetails = {
            rdAccountNumber: '',
            repaymntAcct: ''
        };
        $scope.nickName;
        $scope.errordiv;
        $scope.penalty = 0;
        $scope.msgnodata;
        $scope.bookedBalance;
        $scope.accno = [];
        $scope.summarydiv = false;
        $scope.fetch = function() {
            $scope.RdDepositEndPoint = lpWidget.getPreference(
                'FetchRdDetails');
            $scope.errorSpin = true;
            var RdDepositServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                $scope.RdDepositEndPoint, {
                    servicesPath: lpPortal.root
                });
            RdDepositServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference('FetchRdDetails') +
                '?dummy=' + new Date().getTime(), {
                    servicesPath: lpPortal.root
                });
            var request = $http({
                method: 'GET',
                url: RdDepositServiceURL,
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers,
                config) {
                $scope.clearAlerts();
                var length = data.length;
                $scope.errorSpin = false;
                $scope.accno = data;
                if (length === 0) {
                    $scope.msgnodata =
                        "Looks like you haven't created any recurring deposit with us. Click on Create New to book now.";
                    $scope.noAcc = true;
                }
                if (length === 1) {
                    $scope.tdAcountNumberId = $scope.accno[0].id;
                    $scope.bydefaultOne = 1;
                }
                $scope.errorSpin = false;
            }).error(function(data, status, headers, config) {
                $scope.clearAlerts();
                $scope.tdError = true;
                $scope.errorSpin = false;
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    $scope.serviceError = idfcHanlder.checkGlobalError(
                        data);
                    $scope.alert = {
                        messages: {
                            cd: data.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
            });
        }
        $scope.fetch();
        $scope.openRd = function() {
            gadgets.pubsub.publish(
                'launchpad-retail.openRecurringDeposits');
        };
        $scope.openSummary = function() {
            gadgets.pubsub.publish(
                'launchpad-retail.recurringDepositDetails');
        }
        $scope.closeAccount = function() {
            $scope.successClose = false;
            $scope.summarydiv = false;
            $scope.bydefaultOne = false;
            $scope.bydefaultOne = false;
            $scope.tdAcountNumberId = '';
            $scope.fetch();
        }
        function closeRecurringDeposit(serviceUrl, data1) {

                			var xhr = $http({
                                        				method: 'POST',
                                        				url: serviceUrl,
                                        				data: data1,
                                        				headers: { 'Accept': 'application/json',
                                        					'Content-Type': 'application/x-www-form-urlencoded;'
                                        				}
                                        			}).success(function (data, status, headers, config) {
                				$scope.errorSpin = false;
                				$scope.successClose = 1;
                				$scope.wizardNextStep();
                				lpCoreBus.publish('launchpad-retail.refreshAccountSummary1');
                				$timeout(accountTransRefresh, 6000);
                				/*accountTransRefresh();*/
                			}).error(function (error, status, headers, config) {
                				$scope.errorSpin = false;
                				if (error.cd) {
                					idfcHanlder.checkTimeout(error);
                					if ((error.cd === '501')) {
                						$scope.serviceError = IdfcError
                							.checkGlobalError(error);
                						$scope.alert = {
                							messages: {
                								cd: error.rsn
                							}
                						};
                						$scope.addAlert('cd', 'error', false);
                					} else {
                						$scope.alert = {
                							messages: {
                								cd: error.rsn
                							}
                						};
                						$scope.addAlert('cd', 'error', false);
                					}
                				}
                			});
                		}
        $scope.closingRD = function() {
            $scope.errorSpin = false;
            			$(window).scrollTop(0);

            			closureDetails.rdAccountNumber = $scope.tdAcountNumberId;
            			for (var i = 0; i < $scope.accno.length; i++) {
            				if ($scope.accno[i].id === $scope.tdAcountNumberId) {

            					closureDetails.repaymntAcct = $scope.accno[i].rpymntAcctNmbr;
            					break;
            				}
            			}
                      /*urlclosedeposit = urlclosedeposit + '&cnvId=OTD';*/
                             var data1 = $.param(closureDetails || {});
                             closeRecurringDeposit(urlclosedeposit, data1);

        };
        $scope.fetchDetail = function(tdAcountNumberId) {
            $(window).scrollTop(0);
            $scope.clearAlerts();
            if (tdAcountNumberId === undefined || tdAcountNumberId === "") {
                $scope.summarydiv = false;
                $scope.bydefaultOne = false;
                $scope.tdAcountNumberId = 'Select';
            } else {
                $scope.summarydiv = true;
                //                $scope.selectedRDAccount = tdAcountNumberId;
            }
            for (var i = 0; i < $scope.accno.length; i++) {
                if ($scope.accno[i].id === tdAcountNumberId) {
                    $scope.nickName = $scope.accno[i].nickName;
                    $scope.bookedBalance = $scope.accno[i].bookedBalance;
                }
            }
        };
        var deckPanelOpenHandler;
        deckPanelOpenHandler = function(activePanelName) {
            if (activePanelName === lpWidget.parentNode.model.name) {
                lpCoreBus.flush('DeckPanelOpen');
                lpCoreBus.unsubscribe('DeckPanelOpen',
                    deckPanelOpenHandler);
                lpWidget.refreshHTML(function(bresView) {
                    lpWidget.parentNode = bresView.parentNode;
                });
            }
        };
        lpCoreBus.subscribe('DeckPanelOpen', deckPanelOpenHandler);
        //        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
        //        			gadgets.pubsub.publish("device.GoBack");
        //        		});
        // $timeout(function(){
        //        gadgets.pubsub.publish('cxp.item.loaded', {
        //            id: widget.id
        //        });
        //    }, 10);
    }
    exports.RDClosureWidgetController = RDClosureWidgetController;
    exports.RDClosureDetails = RDClosureDetails;
});