define(function(require, exports) {

    'use strict';
    var errorIDFC = require('idfcerror');
    var $ = require('jquery');

    function applyScope($scope) {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

    function dashboardController($scope, $rootElement, lpWidget, lpCoreUtils, lpCoreBus, lpCoreError, lpUIResponsive, AssetsModel, lpCoreI18n, $http, i18nUtils, lpPortal, $timeout) {
        this.utils = lpCoreUtils;
        this.error = lpCoreError;
        var widget = this.widget = lpWidget;
        $scope.errorSpin = true;
        var CQAlertURL = lpCoreUtils.resolvePortalPlaceholders(lpWidget.getPreference('CQAlert'));
        $scope.navigateToProfile = false;
        var showCQAlert = function() {

            var CQAlert = lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('CQAlert'));

            var res;
            $scope.postData.transaction = 'CQAlert';
            var data1 = $.param($scope.postData || {});
            res = $http({
                method: 'POST',
                url: CQAlertURL,
                data: data1,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;'
                }
            });
            res.success(function(data) {

                   if (data.cqFlag === 'UNVERIFIED' || data.cqFlag === 'UNLOCKED') {
                       $scope.message = data.message;
                       $scope.setCQ = 'true';
                       gadgets.pubsub.publish('openCQ');
                    }
                });
                res.error(function(_data1, status, headers, config) {
                    if (status == 0) {
                        gadgets.pubsub.publish("no.internet");
                    } else {
                        errorIDFC.checkTimeout(_data1);
                        $scope.globalerror = errorIDFC.checkGlobalError(_data1);
                    }
                });
            };
            $scope.aadharNotUpdated = false;
            //$scope.testing = false;
            var initialize = function() {
                console.log("initialize@"+$scope.aadharNotUpdated);
                console.log("initialize@"+$scope.aadharNotUpdated);
                console.log("initialize22@"+$scope.aadharNotUpdated);
                //Session Management Call
                errorIDFC.validateSession($http);
                $scope.locale = 'en';
                $scope.errorSpin = true;
                $scope.showbracket = false;

            $scope.iconClassList = [
                'text-primary',
                'text-success',
                'text-info',
                'text-warning',
                'text-danger'
            ];
            $scope.setCQ = 'false';
            $scope.message = '';
            $scope.passingAccNo = '';

            $scope.postData = {};
            $scope.showGroups = lpCoreUtils.parseBoolean(widget.getPreference('showGroups'));
            $scope.showTotals = lpCoreUtils.parseBoolean(widget.getPreference('showGroupTotals'));
            $scope.showAccountHolderName = lpCoreUtils.parseBoolean(widget.getPreference('showAccountHolderName'));
            $scope.showAccountType = lpCoreUtils.parseBoolean(widget.getPreference('showAccountType'));
            $scope.showAccountHolderCategory = lpCoreUtils.parseBoolean(widget.getPreference('showAccountHolderCategory'));

            $scope.assets = AssetsModel.getInstance({
                assetsEndpoint: lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('accountsDataSrc')),
                groupsEndpoint: lpCoreUtils.resolvePortalPlaceholders(widget.getPreference('groupsDataSrc'))
            });


       if(localStorage.getItem("cqVisted"))
            {
                // to nothing
            }
        else{
                localStorage.setItem("cqVisted", "true");
                showCQAlert();
            }
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

                    if ($scope.assets.accounts['savingAccount'] == null) {
                        $scope.assets.accounts['savingAccount'] = [];
                    }


                    if (!$scope.assets.accounts || (!$scope.assets.accounts['currentAccount'].length && !$scope.assets.accounts['savingAccount'].length)) {
                        $scope.assets.noAccountsAvailable = true;
                    }
                }, function(error) {
                    $scope.errorSpin = false;
                    $scope.assets.loadingNow = false;
                    if (error.data.cd) {
                        errorIDFC.checkTimeout(error.data);
                        $scope.globalerror = errorIDFC.checkGlobalError(error.data);
                        $scope.data = {
                            happened: true,
                            msg: error.data.rsn
                        };
                    }
                });


            });

            $scope.currentAcc = [];
            $scope.savingAcc = [];
            $scope.currentAccBal = [];
            $scope.savingAccBal = [];
            $scope.totalAcc = [];
            $scope.totalGroup = [];

            $scope.mapping = [{
                    "code": "currentAccount",
                    "defaultTitle": "CURRENT"
                },
                {
                    "code": "card",
                    "defaultTitle": "DEBIT"
                },
                {
                    "code": "investment",
                    "defaultTitle": "INVESTMENT"
                },
                {
                    "code": "mortgage",
                    "defaultTitle": "MORTGAGE"
                },
                {
                    "code": "loan",
                    "defaultTitle": "LOANS"
                },
                {
                    "code": "savingAccount",
                    "defaultTitle": "SAVINGS"
                },
                {
                    "code": "homesaver",
                    "defaultTitle": "SHORT&SWEET"
                }
            ];

            var a = [];
            var element = {};
            $scope.errorSpin = true;
            $scope.assets.loadingNow = true;
            $scope.assets.noAccountsAvailable = false;
            var allowNavigate;
            //$scope.allowNavigate = true; //3.5
            $scope.assets.load().then(function() {
                var globalVariablePluginSetNavigateProfile = cxp.mobile.plugins['GlobalVariables'];
                if (globalVariablePluginSetNavigateProfile) {
                    var isSuccessCallback = function(data) {
                        console.log('success data: ' + JSON.stringify(data['navigateToProfile']));
                        if (data['navigateToProfile'] == 'true') {
                            console.log("$scope.allowNavigate true");
                            allowNavigate = "true";
                        } else {
                            console.log("$scope.allowNavigate false");
                        }

                        console.log("allowNavigate value@" + allowNavigate);
                        if (($scope.assets.accounts.aadharNm == null) && (allowNavigate != "true")) //3.5 change
                        {
                            if (globalVariablePluginSetNavigateProfile) {
                                globalVariablePluginSetNavigateProfile.setNavigateToProfile(null, null, 'true');
                            } else {
                                console.log('Fatal Error: Global Variable plugin not registered');
                            }
                            lpCoreBus.publish('launchpad-retail.profileContactWidgetOpen');

                        } else {
                            var i = 0,
                                groupLen = $scope.assets.groups.length;
                            var code;
                            for (i = 0; i < groupLen; i++) {
                                code = $scope.assets.groups[i].code;
                                console.log(code);
                                element[code] = $scope.assets.accounts[code];
                                console.log(element);
                                a.push(element);

                                if ($scope.assets.accounts[code] == null) {
                                    $scope.assets.accounts[code] = [];
                                }

                                if ($scope.assets.accounts[code].length > 0) {
                                    var len = $scope.assets.accounts[code].length;
                                    for (var j = 0; j < len; j++) {
                                        var temp = $scope.mapping[i].defaultTitle + " " + $scope.assets.accounts[code][j].id;
                                        var bal = $scope.assets.accounts[code][j].availableBalance;
                                        var account_type = $scope.assets.accounts[code][j].alias;
                                        element = {
                                            'id': temp,
                                            'bal': bal,
                                            'alias': account_type
                                        };
                                        $scope.totalGroup.push(element);
                                    }
                                }
                            }
                            if ($scope.totalGroup.length > 0) {
                                console.log("$scope.totalGroup@" + JSON.stringify($scope.totalGroup));
                                console.log($scope.totalGroup);
                                $scope.bal = $scope.totalGroup[0].bal;
                                $scope.account_type = $scope.totalGroup[0].alias;
                                //dashboard spinner paddling
                                if ($scope.account_type.match("Home") || $scope.account_type.match("LAP")) {
                                    angular.element('#accountNumberId').css('padding-left', '3%');
                                } else {
                                    angular.element('#accountNumberId').css('padding-left', '15%');
                                }


                                if ($scope.bal < 0) {
                                    $scope.showbracket = true;
                                    $scope.bal = Math.abs($scope.bal);
                                } else {
                                    $scope.showbracket = false;
                                }
                            }



                            var code = $scope.assets.groups[0].code;
                            console.log($scope.assets.accounts[code]);
                            var i = 0,
                                len1 = $scope.assets.accounts['currentAccount'].length;
                            for (; i < len1; i++) {
                                var temp = $scope.assets.accounts['currentAccount'][i].id;
                                console.log(temp);
                                $scope.currentAcc.push(temp);
                                temp = $scope.assets.accounts['currentAccount'][i].availableBalance;
                                $scope.currentAccBal.push(temp);
                                console.log($scope.currentAcc[i] + " " + $scope.currentAccBal[i]);


                            }
                            var i = 0,
                                len2 = $scope.assets.accounts['savingAccount'].length;
                            for (; i < len2; i++) {
                                var temp = $scope.assets.accounts['savingAccount'][i].id;
                                $scope.savingAcc.push(temp);
                                temp = $scope.assets.accounts['savingAccount'][i].availableBalance;
                                $scope.savingAccBal.push(temp);


                            }
                            console.log($scope.savingAcc + " " + $scope.savingAccBal);


                            //concat
                            var i = 0,
                                len = len1 + len2;
                            for (; i < len1; i++) {
                                temp = 'CURRENT' + $scope.currentAcc[i];
                                $scope.totalAcc.push(temp);
                                console.log($scope.totalAcc[i]);
                            }

                            for (i = len1 - 1; i < len; i++) {
                                temp = 'SAVINGS A/C' + $scope.savingAcc[i];
                                $scope.totalAcc.push(temp);
                                console.log($scope.totalAcc[i]);

                            }

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

                            if (!$scope.assets.accounts ||
                                (!$scope.assets.accounts['currentAccount'].length && !$scope.assets.accounts['savingAccount'].length && !$scope.assets.accounts['homesaver'].length)) {
                                $scope.assets.noAccountsAvailable = true;
                            }

                        }

                    };
                    var isErrorCallback = function(data) {
                        console.log('Something really bad happened');
                    };
                    globalVariablePluginSetNavigateProfile.getNavigateToProfile(
                        isSuccessCallback,
                        isErrorCallback
                    );
                } else {
                    console.log('Cant find Plugin');
                }



            }, function(error) {
                $scope.errorSpin = false;

                $scope.assets.loadingNow = false;
                if (error.data.cd) {
                    errorIDFC.checkTimeout(error.data);
                    $scope.globalerror = errorIDFC.checkGlobalError(error.data);
                    $scope.data = {
                        happened: true,
                        msg: error.data.rsn
                    };
                }
            });


            $scope.defaultBalance = widget.getPreferenceFromParents('preferredBalanceView') || 'current';

            $scope.title = widget.getPreference('title');

            //       gadgets.pubsub.publish('preloadWidgets');

        };

        var accno = $scope.accountNumber;
        $scope.changeInAccNo = function() {
            accno = $scope.accountNumber;
            var i = 0,
                len = $scope.totalGroup.length;
            for (; i < len; i++) {
                if ($scope.totalGroup[i].id == $scope.accountNumber) {
                    $scope.bal = $scope.totalGroup[i].bal;
                    $scope.account_type = $scope.totalGroup[i].alias;
                    if ($scope.account_type.match("Home") || $scope.account_type.match("LAP")) {
                        angular.element('#accountNumberId').css('padding-left', '3%');
                    } else {
                        angular.element('#accountNumberId').css('padding-left', '15%');
                    }

                    if ($scope.bal < 0) {
                        $scope.showbracket = true;
                        $scope.bal = Math.abs($scope.bal);



                    } else
                        $scope.showbracket = false;
                }
            }
            $scope.passingAccNo = get_numbers($scope.accountNumber);
            $scope.passingAccNo = $scope.passingAccNo[0];

        };


        $scope.goToTransaction = function() {
            if (accno == undefined) {
                accno = $scope.totalGroup[0].id;
            }

            $scope.passingAccNo = get_numbers(accno);
            $scope.passingAccNo = $scope.passingAccNo[0];

            localStorage.clear();
            var navData = {
                "accountId": $scope.passingAccNo,
                "originType": 'accounts'
            };
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "dashboard");
            localStorage.setItem("navigationData", JSON.stringify(navData));
            gadgets.pubsub.publish('launchpad-retail.showTransactions');

        };

        var get_numbers = function(input) {
            return input.match(/[0-9]+/g);
        };

        $scope.goToDeposit = function() {
            localStorage.clear();
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "dashboard");
            gadgets.pubsub.publish('launchpad-retail.openDeposits');
        };

        $scope.goToPayBills = function() {
            localStorage.clear();
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "dashboard");
            gadgets.pubsub.publish('launchpad-retail.goToPayBills');
        };

        $scope.goToAddPayee = function() {
            localStorage.clear();
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "dashboard");
            gadgets.pubsub.publish('launchpad-retail.goToAddPayee');
        };


        $scope.goToTransferNow = function() {
            localStorage.clear();
            localStorage.setItem("navigationFlag", true);
            localStorage.setItem("origin", "dashboard");
            gadgets.pubsub.publish('transfer-loaded');
        };

        initialize();
        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            gadgets.pubsub.publish("device.GoBack");
        });
        $timeout(function() {
            gadgets.pubsub.publish('cxp.item.loaded', {
                id: widget.id
            });
        }, 10);
    }

    exports.dashboardController = dashboardController;
});