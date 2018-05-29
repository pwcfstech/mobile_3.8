define(function(require, exports, module) {
    'use strict';
    var $ = require('jquery');
    var ALERT_TIMEOUT = 3000;
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');

    function ListOfDepositDetailsController(WidgetModel, lpCoreUtils,
        $scope, lpWidget, lpCoreBus, IdfcUtils, lpCoreError, $timeout, $http,
        lpUIResponsive, lpCoreI18n, sharedProperties, httpService,
        lpPortal) {
        /*var depositClosureService = DepositClosureService;*/
        /*$scope.msgs4partial = false;*/
        var deckPanelOpenHandler;
        var repaymentAccountNumber = '';
        this.model = WidgetModel;
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        this.widget = lpWidget;
        var closureDetails = sharedProperties.getProperty();

        function accountTransRefresh() {
            lpCoreBus.publish('launchpad-business.refreshAccountSummary');
            lpCoreBus.publish('launchpad-retail.refreshAccountSummary1');
        }
        $scope.restartWizard = function() {
           gadgets.pubsub.publish('closeFixedDeposit');
        };
        /*$scope.reset = function() {};
        $scope.loadAccounts = function() {
            $scope.reset();
            $timeout(function() {}, 2000);
        };*/
        /*$scope.close = function() {
            lpCoreBus.publish(
                'launchpad-retail.closeActivePanel');
        };*/

        $scope.openDepositWidget = function() {
            lpCoreBus.publish('launchpad-retail.openDeposits');
        };
        var initialize = function() {
            //Session Management Call
            /*idfcHanlder.validateSession($http);*/

            $scope.errorSpin = true;
            /*$scope.msgs4partial = false;*/
            $scope.accountIDCheck = false;
            $scope.showAmount = false;
            $scope.amountCheck = false;
            /* $scope.abc = 'avccc';*/
            $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(
                lpWidget) + '/templates/partials/';
            /*$scope.increment = parseInt(lpWidget.getPreference(
                'amountToLoad'), 10) || 5;
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
            $scope.contextLabel = 'All';*/
            $scope.form = {
                submitted: false
            }
            $scope.serviceError = false;
            $scope.getTdAccountNumbers();
        };
        /*$scope.alerts = [];
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
        $scope.pollCount = 0;
        $('#rdWithdrawalAmtDiv').hide();
        $('#withdrawalAmtDiv').hide();
        $('#rdForm').hide();
        $('#tdForm').show();
        $scope.openTermDeposit = function(type, $event) {
            $('#rdForm').hide();
            $('#tdForm').show();
        };
        $scope.tdAmount = '';
        $scope.openRecurringDeposit = function(type, $event) {
            $('#tdForm').hide();
            $('#rdForm').show();
        };
        $scope.tdAccountNumbers = [];
        $scope.amount = '';
        $scope.tdAcountNumberId = '';
        $scope.repaymentAccountNumber = '';
        $scope.depositAmount = '';
        $scope.totalAmount = '';
        $scope.msgnodata = '';
        $scope.chkdata = false;*/
        /*$scope.fetchAccountDetails = function(acNum) {
                $scope.tdAcountNumberId = acNum;
        if(typeof($scope.tdAcountNumberId) != "boolean" && !isNaN($scope.tdAcountNumberId)){
                $scope.tdClosureType = "ForeClosure";
                $scope.hideTDAmount();
                $scope.errorSpin = true;
                $scope.tdAmount = "";
                $scope.msg4accno = false;
                $scope.msgs4partial = false;
                $scope.fetchTDDetails();
        }
        };*/
        $scope.getTdAccountNumbers = function() {
            $scope.errorSpin = true;
            var self = this;
            $scope.TermDepositEndPoint = lpWidget.getPreference(
                        'getTdAccount');
                    if ($scope.tdAccountNumbers === undefined) {
                        var TermDepositServiceURL = lpCoreUtils.resolvePortalPlaceholders(
                            $scope.TermDepositEndPoint, {
                                servicesPath: lpPortal.root
                            });
                            var postData = {
                                        'type': 'FD'
                                    };
                                    postData = $.param(postData || {});
                        $http({
                            method: 'POST',
                            url: TermDepositServiceURL,
                            data: postData,
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded;'
                            }
                        }).success(function(data, status, headers, config) {
                        /*$scope.tdAccountNumbers = [];
                            var length = data.length;*/
                            $scope.errorSpin = false;
                          /*  $scope.tdAccountNumbers = data;*/
                            /*if (length === 0) {
                                $scope.msgnodata =
                                    'Looks like you havent created any fixed deposit with us.Click on Create New to book now.';
                                $scope.errornoData = true;
                            }
                            else {

                             for(var i=0;i<data.length;i++){
                             var vDepAlias = (data[i].alias).toUpperCase();
                              if(!(vDepAlias.indexOf("TAX")) > -1){
                               $scope.tdAccountNumbers.push(data[i]);
                                console.log($scope.tdAccountNumbers.length);
                                                        }
                                 vDepAlias = "";
                                                        }
                                                        }
                            $scope.errorSpin = false;*/
                            $scope.tdAccountNumbers =[];


                                                                    if (data && data !== 'null' && data.length !==
                                                                            0)
                                                                         {
                                                                            for(var i=0; i<data.length; i++)
                                                                           {
                                                                               var vDepAlias = (data[i].alias).toUpperCase();

                                                                               /*if(!(vDepAlias.includes('TAX') || vDepAlias.includes('TAXSAVER') || vDepAlias.includes('TAXSAV') || vDepAlias.includes('TAX_SAV'))  )
                                                                               {
                                                                                        $scope.tdAccountNumbers = data;
                                                                               }*/
                                                        		               if (!(vDepAlias.indexOf("TAX") > -1))
                                                                                {
                                                                                      //$scope.tdAccountNumbers = data;
                                                                                    $scope.tdAccountNumbers.push(data[i]); /*3.8  change*/
                                                                                }
                                                                               vDepAlias ='';
                                                                           }
                                                                            //$scope.tdAccountNumbers = data;
                                                                            if($scope.tdAccountNumbers.length===1){
                                                                                 $scope.tdAcountNumberId = $scope.tdAccountNumbers[0].id;
                                                                                 $scope.fetchTDDetails($scope.tdAcountNumberId);
                                                               				}

                                                               				else if($scope.tdAccountNumbers.length===0){
                                                               				$scope.chkdata = true;
                                                                             $scope.msgnodata ='Looks like you havent created any fixed deposit with us.Click on Create New to book now.';

                                                               				}
                                                                        } else {
                                                                            $scope.chkdata = true;
                                                                            $scope.msgnodata =
                                                                                'Looks like you havent created any fixed deposit with us.Click on Create New to book now.';
                                                                        }

                        }).error(function(data, status, headers, config) {
                            $scope.tdError = true;
                            if (data.cd) {
                                errorIDFC.checkTimeout(data);
                                $scope.serviceError = errorIDFC.checkGlobalError(
                                    data);
                                $scope.alert = {
                                    messages: {
                                        cd: data.rsn
                                    }
                                };
                                $scope.addAlert('cd', 'error', false);
                            }
                        });
                    }
                    }
            /*$scope.TermDepositEndPoint = widget.getPreference(
                        'TermDepositSrc');
             var tdAccountNumbers = httpService.getInstance({
                endpoint: lpWidget.getPreference(
                    'getTdAccount')
            });
            var postData = {
                                'type': 'FD'
                            };
            postData = $.param(postData || {});
            var xhr = $http({
                                method: 'POST',
                                url: tdAccountNumbers,
                                data: postData,
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/x-www-form-urlencoded;'
                                }
                            });
   *//*         var xhr = self.tdAccountNumbers.read();*//*
            xhr.success(function(data) {
                $scope.errorSpin = false;
                if (IdfcUtils.hasContentData(data)) {
                    if (data.getRIBAccountSummaryResponse != undefined) {
                         $scope.chkdata = true;
                                                 $scope.msgnodata = 'Looks like you havent created any fixed deposit with us.Click on Create New to book now.';
                    } else {
                        $scope.tdAccountNumbers = data;
                    }
                } else {
                    $scope.chkdata = true;
                    $scope.msgnodata = 'Looks like you havent created any fixed deposit with us.Click on Create New to book now.';
                }

                //                if ((data.id) || data.id==null) {
                //                    console.log("data success", data);
                //                    console.log("data success", data.length);
                //                    $scope.tdAccountNumbers = data;
                //                    *//*$scope.showAccountList = true;
                //                    if($scope.tdAccountNumbers.length===1){
                //                         $scope.tdAcountNumberId = $scope.tdAccountNumbers[0].id;
                //                         $scope.fetchAccountDetails($scope.tdAcountNumberId);
                //                      }*//*
                //                      }
                //                 else {
                //                console.log("data fail", data);
                //                console.log("data fail", data.length);
                //                    $scope.chkdata = true;
                //                    *//*$scope.showAccountList = false;*//*
                //                    $scope.msgnodata =
                //                        'Looks like you havent created any fixed deposit with us.Click on Create New to book now.';
                //
                //                }
                $scope.goToWizardStep(1);
            });
            xhr.error(function(data) {
                $scope.errorSpin = false;
                $scope.chkdata = false;
                $scope.msgnodata =
                    'Looks like you havent created any fixed deposit with us.Click on Create New to book now.';
                if (data.cd) {
                    idfcHanlder.checkTimeout(data);
                    if ((data.cd === '501')) {
                        $scope.serviceError =
                            idfcHanlder.checkGlobalError(
                                data);
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error',
                            false);
                    } else {
                        $scope.alert = {
                            messages: {
                                cd: data.rsn
                            }
                        };
                        $scope.addAlert('cd', 'error',
                            false);
                    }
                    self.hideWizard = true;
                    self.errorCustomMsg = data.rsn;
                }
                *//*self.error = {
                    message: data.statusText
                };*//*
            });
            return xhr;
        };*/
        /*$scope.$watch('tdAmount', function(value) {
            if (value > $scope.totalAmount) {
                $scope.maxLimit = true;
            } else {
                $scope.maxLimit = false;
            }
        });*/
        $scope.fetchAccountDetails = function() {
            $scope.errorSpin = true;
            $scope.fetchTDDetails();
        };

        function closeFixedDeposit(serviceUrl, data1) {

            var xhr = $http({
                method: 'POST',
                url: serviceUrl,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            }).success(function(data, status, headers, config) {
                $scope.errorSpin = false;
                $scope.wizardNextStep();
                lpCoreBus.publish('launchpad-retail.refreshAccountSummary1');
                $timeout(accountTransRefresh, 6000);
                /*accountTransRefresh();*/
            }).error(function(error, status, headers, config) {
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
        $scope.fetchTDDetails = function(accountNumber) {
            $scope.errorSpin = true;
            var fetchTDUrl = lpCoreUtils.resolvePortalPlaceholders(
                lpWidget.getPreference('fetchTDURL'), {
                    servicesPath: lpPortal.root
                });
            var postData = {
                'accountNumber': accountNumber
            };
            $scope.tdAcountNumberId = accountNumber;
            postData = $.param(postData || {});
            var xhr = $http({
                    method: 'POST',
                    url: fetchTDUrl,
                    data: postData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded;'
                    }
                })
                .success(function(data, status, headers,
                    config) {
                    $scope.errorSpin = false;
                    $scope.repaymentAccountNumber = data.repaymentAccountNumber;
                    /*$scope.depositAmount = data.depositAmount;
                    $scope.interestAvailable = data.intAvailable;
                    var firstNum = parseInt($scope.depositAmount);
                    var secondNum = parseInt($scope.interestAvailable);
                    $scope.totalAmount = ((firstNum +
                        secondNum) - 10000);*/
                }).error(function(data, status, headers, config) {
                    $scope.errorSpin = false;
                    if (data.cd) {
                        idfcHanlder.checkTimeout(data);
                        if ((data.cd === '501')) {
                            $scope.serviceError =
                                idfcHanlder.checkGlobalError(
                                    data);
                            $scope.alert = {
                                messages: {
                                    cd: data.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error',
                                false);
                            $scope.hideWizard = true;
                            $scope.errorCustomMsg = data.rsn;
                        } else {
                            $scope.alert = {
                                messages: {
                                    cd: data.rsn
                                }
                            };
                            $scope.addAlert('cd', 'error',
                                false);
                        }
                    }
                });
            /* $scope.rdAccountNumbers = [{
                 rdAcctID: '1',
                 rdAccountNumber: 'NL56ABNA098765'
             }, {
                 rdAcctID: '2',
                 rdAccountNumber: 'NL55ASDNA098765'
             }, {
                 rdAcctID: '3',
                 rdAccountNumber: 'NL54ABNA098765'
             }];
             $scope.closureTypes = [{
                 closrID: '1',
                 closureType: 'Fore-Closure'
             }, {
                 closrID: '2',
                 closureType: 'Partial Closure'
             }];
            */
        };
        $scope.resetForm = function() {
       if($scope.tdAccountNumbers.length===1){
       $scope.tdAcountNumberId = $scope.tdAccountNumbers[1].id;
       
       }
       else{
       $scope.tdAccountNumbers = "";
       $scope.form = {
       submitted: false
       }
       }
        };
        $scope.submitDetails = function(isValid) {
            $scope.showFDConfirmationAlert = false;
            $scope.errorSpin = true;
            closureDetails.tdAccountNumberId = $scope.tdAcountNumberId;
            closureDetails.repaymentAccountNumberId = $scope.repaymentAccountNumber;
            if ($scope.tdClosureType === undefined) {
                closureDetails.tdClosureType = 'ForeClosure';
            } else {
                closureDetails.tdClosureType = $scope.tdClosureType;
            }
            if ($scope.tdAmount === undefined || $scope.tdAmount === '') {
                closureDetails.amount = '0';
            } else {
                closureDetails.amount = $scope.tdAmount;
            }
            sharedProperties.setProperty(closureDetails);
            var tdClosureType = closureDetails.tdClosureType;
            var urlclosedeposit;
            if (tdClosureType === 'ForeClosure') {
                urlclosedeposit = lpCoreUtils.resolvePortalPlaceholders(
                    lpWidget.getPreference('foreClosureUrl'), {
                        servicesPath: lpPortal.root
                    });
                urlclosedeposit = urlclosedeposit + "?cnvId=OTD";
            }
            var data1 = $.param(closureDetails || {});
            closeFixedDeposit(urlclosedeposit, data1);


        }
        //        $scope.showAmount = false;
        //        $scope.showTDAmount = function() {
        //            $scope.msg4accno = false;
        //            $scope.msgs4partial = false;
        //            $scope.showAmount = true;
        //            $('#withdrawalAmtDiv').show();
        //        };
        //        $scope.hideTDAmount = function() {
        //            $scope.msg4accno = false;
        //            $scope.msgs4partial = false;
        //            $scope.showAmount = false;
        //            $scope.tdAmount = "";
        //            $('#withdrawalAmtDiv').hide();
        //        };
        //        $scope.hideRDAmount = function() {
        //            $('#rdWithdrawalAmtDiv').hide();
        //        };
        //        $scope.showRDAmount = function() {
        //            $('#rdWithdrawalAmtDiv').show();
        //        };
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

        $scope.evalORexp = function(varA, varB) {
            var hideFlag = false;
            if (varA || varB) {
                hideFlag = true;
            }
            return hideFlag;
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearAlerts = function() {
            $scope.alerts = [];
        };
        $scope.fdClosuerRefresh = function() {
            $scope.goToWizardStep(1);
        };
        initialize();
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
        			gadgets.pubsub.publish("device.GoBack");
        		});
          $timeout(function(){
                gadgets.pubsub.publish('cxp.item.loaded', {
                    id: widget.id
                });
            }, 10);
    }
    exports.ListOfDepositDetailsController = ListOfDepositDetailsController;
});