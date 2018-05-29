/*global checkTimeout, checkGlobalError, encode_deviceprint */
/**
 * Controllers existing
 * @module controllers
 */
define(function (require, exports) {

    'use strict';
    var errorIDFC = require('idfcerror');
    var $ = require('jquery');

    function applyScope($scope) {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
    /**
     * Main controller
     * @ngInject
     * @constructor
     */
    function AccountsController($window,$scope, $rootElement, lpWidget, lpCoreUtils, lpCoreBus, lpCoreError, AssetsModel, AccountsModel,$http, lpUIResponsive, lpCoreI18n, $timeout) {
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        var widget = this.widget = lpWidget;
        //Session Validation Call
        errorIDFC.validateSession($http);

        var showCQAlert = function () {

            var CQAlert = lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('CQAlert'));

            var res;
            $scope.postData.transaction = 'CQAlert';
            var data1 = $.param($scope.postData || {});
            res = $http({
                method: 'POST',
                url: CQAlert,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            res.success(function (_data1, status, headers, config) {

                if (_data1.cqFlag === 'LOCKOUT' || _data1.cqFlag === 'UNVERIFIED') {
                    $scope.message = _data1.message;

                    $scope.setCQ = 'true';

                    lpCoreBus.publish('launchpad.challenge.questions.postLogin', {
                        showCQ: 'true',
                        alertCQ: $scope.message
                    });

                }
                else {


                    if ($scope.setCQ === 'false' && $scope.assets.noAccountsAvailable !== 'true') {
//                        lpCoreBus.publish('launchpad-retail.accountSelected');
                        //gadgets.pubsub.publish("launchpad-retail.accountSelected");


                    }
                }
            });
            res.error(function (_data1, status, headers, config) {
            if(status==0){
                gadgets.pubsub.publish("no.internet");
            }
            else{
                errorIDFC.checkTimeout(_data1);
                $scope.globalerror = errorIDFC.checkGlobalError(_data1);
            }
                }
            );
        };

        // Initialize
        var initialize = function () {

            //Session Management Call
	        errorIDFC.validateSession($http);

            // TODO: add locale support
            $scope.locale = 'en';
            $scope.errorSpin = false;
            $scope.iconClassList = [
                'text-primary',
                'text-success',
                'text-info',
                'text-warning',
                'text-danger'
            ];
            $scope.setCQ = 'false';
            $scope.message = '';
            $scope.postData = {};
            $scope.showGroups = lpCoreUtils.parseBoolean(widget.getPreference('showGroups'));
            $scope.showTotals = lpCoreUtils.parseBoolean(widget.getPreference('showGroupTotals'));
            $scope.showAccountHolderName = lpCoreUtils.parseBoolean(widget.getPreference('showAccountHolderName'));
            $scope.showAccountType = lpCoreUtils.parseBoolean(widget.getPreference('showAccountType'));
            $scope.showAccountHolderCategory = lpCoreUtils.parseBoolean(widget.getPreference('showAccountHolderCategory'));

            $scope.assets = AssetsModel.getInstance({
                assetsEndpoint: widget.getPreference('accountsDataSrc'),
                groupsEndpoint: lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('groupsDataSrc'))
            });

            lpCoreBus.subscribe('launchpad-retail.refreshAccountSummary', function () {
                if ($scope.assets.assetCollection) {
                    $scope.assets.assetCollection.length = 0;
                }
                $scope.errorSpin = true;
                $scope.assets.load().then(function () {
                    $scope.errorSpin = false;
                    $scope.assets.loadingNow = false;

                    if ($scope.assets.accounts['currentAccount'] == null) {
                        $scope.assets.accounts['currentAccount'] = [];
                    }

                    if ($scope.assets.accounts['savingAccount'] == null) {
                        $scope.assets.accounts['savingAccount'] = [];
                    }
                    if ($scope.assets.accounts['homesaver'] == null) {
                        $scope.assets.accounts['homesaver'] = [];
                    }

                    if (!$scope.assets.accounts || (!$scope.assets.accounts['currentAccount'].length && !$scope.assets.accounts['savingAccount'].length && !$scope.assets.accounts['homesaver'].length)) {
                        $scope.assets.noAccountsAvailable = true;
                    }


                }, function (error) {
                    $scope.errorSpin = false;
                    $scope.assets.loadingNow = false;
                    if (error.data.cd) {
                        // If session timed out, redirect to login page
                        errorIDFC.checkTimeout(error.data);
                        // If service not available, set error flag
                        $scope.globalerror = errorIDFC.checkGlobalError(error.data);
                        $scope.data = {
                            happened: true,
                            msg: error.data.rsn
                        };
                    }
                });


            });
            $scope.errorSpin = true;
            $scope.assets.loadingNow = true;
            $scope.assets.noAccountsAvailable = false;
            $scope.assets.load().then(function () {

                $scope.assets.loadingNow = false;
                if ($scope.assets.accounts['currentAccount'] == null) {
                    $scope.assets.accounts['currentAccount'] = [];


                }

                if ($scope.assets.accounts['savingAccount'] == null) {
                    $scope.assets.accounts['savingAccount'] = [];


                }
                if ($scope.assets.accounts['homesaver'] == null) {
                    $scope.assets.accounts['homesaver'] = [];
                 }

                if (!$scope.assets.accounts || (!$scope.assets.accounts['currentAccount'].length && !$scope.assets.accounts['savingAccount'].length && !$scope.assets.accounts['homesaver'].length)) {
                    $scope.assets.noAccountsAvailable = true;
                }
                 //create new array with id and balance from old homesaver object
                var currentOutstandingArray = [];
                for(var i = 0; i < $scope.assets.accounts['homesaver'].length; i++) {
                    var jsonObject = {};
                    var id=$scope.assets.accounts['homesaver'][i].id;
                    var balance=$scope.assets.accounts['homesaver'][i].availableBalance;
                     jsonObject["id"] = id;
                     jsonObject["balance"] = balance;
                     currentOutstandingArray.push(jsonObject);
                 }

                if($scope.assets.accounts['homesaver'].length > 0 )
                {
                 $scope.errorSpin = true;
                 console.log("Call debit card webservice");
                 //get data for homesaver account
                 $scope.accountsModel = AccountsModel;
                 $scope.accountsModel.setConfig({
                // accountsEndpoint: lpWidget.getPreference('accountsDataSrcMob')
                 accountsEndpoint: lpWidget.getPreference('mobAccountsDataSrc')
                 });

                 $scope.accountsModel.load().then(function () {
                  $scope.errorSpin = false;
                   delete $scope.assets.accounts['homesaver'];
                   var response=[];
                   response=$scope.accountsModel.accounts;
                   var homesaverArray=[];
                   for (var i = 0; i < response.length; i++)
                   {
                    var isHomesaver=response[i].homeSaver;
                    if(isHomesaver)
                     {
                      homesaverArray.push(response[i]);
                      $scope.assets.accounts['homesaver']=homesaverArray;
                     }
                   }


                 var homesaverObjectArray = [];
                 for(var k=0; k < homesaverArray.length;k++)
                   {
                    var account_num= homesaverArray[k].id;
                    var homesaverJsonObject = {};
                    homesaverJsonObject["id"]=account_num;
                    homesaverJsonObject["drawingPower"]=homesaverArray[k].drawingPower;
                    homesaverJsonObject["amountUnderRealztion"]=homesaverArray[k].amountUnderRealztion;
                    homesaverJsonObject["emiAmount"]=homesaverArray[k].emiAmount;
                    homesaverJsonObject["nextEMIDate"]=homesaverArray[k].nextEMIDate;
                    homesaverJsonObject["bookedBalance"]=homesaverArray[k].bookedBalance;
                    homesaverJsonObject["status"]=homesaverArray[k].status;

                   for(var m=0; m < currentOutstandingArray.length; m++)
                   {

                      var oldId=currentOutstandingArray[m].id;
                      if(oldId===account_num)
                      {
                      var balance=currentOutstandingArray[m].balance;
                      homesaverJsonObject["balance"]=balance;
                      homesaverObjectArray.push(homesaverJsonObject);
                      }
                    }
                  }


                   for(var j=0;j<$scope.assets.assetCollection.length>0;j++)
                   {
                    var code=$scope.assets.assetCollection[j].code;
                    if(code == "homesaver")
                    {
                    delete $scope.assets.assetCollection[j].accounts;
                    $scope.assets.assetCollection[j].accounts=homesaverObjectArray;
                    //$scope.assets.assetCollection[j].accounts=homesaverArray;
                    //var homesaverAccountsArray=assets.assetCollection[j].accounts;
                    }
                   }
                  // console.log("Homesaver Array@@@:"+JSON.stringify(homesaverArray));
                 //  console.log("End Accounts Data@@@:"+JSON.stringify($scope.assets.accounts));
                  console.log("End Accounts collection Data@@@:"+JSON.stringify($scope.assets.assetCollection));
                  },
                 function (error) {
                 $scope.errorSpin = false;
                    if (error.data.cd) {
                                         // If session timed out, redirect to login page
                       errorIDFC.checkTimeout(error.data);
                                         // If service not available, set error flag
                        $scope.globalerror = errorIDFC.checkGlobalError(error.data);
                        $scope.data = {
                            happened: true,
                             msg: error.data.rsn
                       };
                     }
                 });
                }
                else
                {
                 $scope.errorSpin = false;

                }
                showCQAlert();

            }, function (error) {
                $scope.errorSpin = false;
                $scope.assets.loadingNow = false;
                if (error.data.cd) {
                    // If session timed out, redirect to login page
                    errorIDFC.checkTimeout(error.data);
                    // If service not available, set error flag
                    $scope.globalerror = errorIDFC.checkGlobalError(error.data);
                    $scope.data = {
                        happened: true,
                        msg: error.data.rsn
                    };
                }
            });

            $scope.defaultBalance = widget.getPreferenceFromParents('preferredBalanceView') || 'current';

            $scope.title = widget.getPreference('title');

            lpCoreBus.subscribe('launchpad-retail.accountSelected', function (params) {
                $scope.assets.selected = params.accountId;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });

            localStorage.clear();

            /** Mobile 2.5 **/
            /** Getting height of window to add floating text at bottom **/
            $scope.screenHeight = $window.innerHeight;
            $scope.screenHeight = $scope.screenHeight - 40;
            var div = document.getElementById('accntdiv');
            if(div){
                div.style.height=$scope.screenHeight+ "px";
            }
        };

        // Events
        widget.addEventListener('preferencesSaved', function () {
            widget.refreshHTML();
            initialize();
        });

        $scope.selectCurrency = function(curr){
            return lpCoreI18n.formatCurrency(curr);
        };

        $scope.selectAccount = function(account, parentIndex, childIndex){

            $scope.currentParent = parentIndex;
            $scope.currentChild = childIndex;


            if(account.cardNumber) {
                $scope.assets.selected = account.id;
                lpCoreBus.publish('launchpad-retail.openCardManagement');
                lpCoreBus.publish('launchpad-retail.cardSelected', {
                    account: account
                });
            } else {
                $scope.assets.selected = account.id;


                localStorage.clear();
                localStorage.setItem("navigationFlag",true)
                var navData = {"accountId": account.id,"originType": 'accounts'};
                        localStorage.setItem("navigationData", JSON.stringify(navData));
                        localStorage.setItem("origin","accounts");
                gadgets.pubsub.publish('launchpad-retail.showTransactions');
            }
        };

        $scope.accountKeydown = function(evt, accountId) {
            if (evt.which === 13 || evt.which === 32) {
                evt.preventDefault();
                evt.stopPropagation();
                $scope.selectAccount(accountId);
            }
        };

        $scope.payForAccount = function($event, id){

            $event.stopPropagation();
            lpCoreBus.publish('launchpad-retail.requestMoneyTransfer', {
                accountId: id
            });
        };

        $scope.toggleGroup = function(group) {

            group.isCollapsed = !group.isCollapsed;
        };

        // Responsive
        lpUIResponsive.enable($rootElement)
            .rule({
                'max-width': 200,
                then: function() {
                    $scope.responsiveClass = 'lp-tile-size';
                    applyScope($scope);
                }
            })
            .rule({
                'min-width': 201,
                'max-width': 350,
                then: function() {
                    $scope.responsiveClass = 'lp-small-size';
                    applyScope($scope);
                }
            }).rule({
                'min-width': 351,
                'max-width': 600,
                then: function() {
                    $scope.responsiveClass = 'lp-normal-size';
                    applyScope($scope);
                }
            }).rule({
                'min-width': 601,
                then: function() {
                    $scope.responsiveClass = 'lp-large-size';
                    applyScope($scope);
                }
            });

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


    /**
     * Export Controllers
     */
    exports.AccountsController = AccountsController;
});
