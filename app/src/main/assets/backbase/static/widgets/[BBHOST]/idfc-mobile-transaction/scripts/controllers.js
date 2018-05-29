define(function(require, exports) {
    'use strict';
    var $ = require('jquery');
    var angular = require('angular');
    var idfcConstants = require('idfccommon').idfcConstants;
    var idfcHanlder = require('idfcerror');
    var _ = require('lodash').noConflict();
    require('fileSaver');
    var txnTemp = [];
    var data = [];
    var pagesShown = 1;
    var pageSize = 10;
    var counter = 1;

    function isES3Browser() {
        var es3Browser = false;
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            es3Browser = true;
        }
        return es3Browser;
    }

    function transactionsController($scope, $window, $element, $timeout,
        i18nUtils, AccountsModel, ContactsModel, PreferenceService,
        lpWidget, lpCoreBus, lpCoreUtils, lpPortal, lpUIResponsive,
        $http) {

        function applyScope() {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
        var initialize = function() {

            //Session Management Call
	        idfcHanlder.validateSession($http);

            $scope.openingDate = '';
            $scope.fromDashboard = false;
            $scope.fromAccounts = false;
            $scope.target = '';
            $scope.errorSpin = false;
            $('.panel-message').hide();
            $scope.accountsModel = AccountsModel;
            $scope.accountsModel.setConfig({
                accountsEndpoint: lpWidget.getPreference(
                    'accountsDataSrc')
            });
            $scope.locale = lpWidget.getPreference('locale');
            $scope.title = lpWidget.getPreference('title');
            $scope.showCharts = lpCoreUtils.parseBoolean(
                lpWidget.getPreference('showCharts'));
            $scope.showAccountSelect = lpCoreUtils.parseBoolean(
                lpWidget.getPreference('showAccountSelect')
            );
            $scope.accountsTopBalance = lpWidget.getPreferenceFromParents(
                'preferredBalanceView') || 'current';
            $scope.partialsDir = lpCoreUtils.getWidgetBaseUrl(
                lpWidget) + '/templates/partials';
            $scope.templates = {
                list: $scope.partialsDir + '/list.html',
                charts: $scope.partialsDir + '/charts.html',
                chartsHorizontal: $scope.partialsDir +
                    '/charts-horizontal.html',
                details: $scope.partialsDir +
                    '/details.html',
                donut: $scope.partialsDir + '/donut.html'
            };
            $scope.tabs = {
                'list': true,
                'chart': false,
                'combined': false
            };
            $scope.showCategories = false;
            $scope.previewAll = false;
            $scope.offsetTopCorrection = 0;
            lpCoreBus.subscribe(
                'launchpad-retail.offsetTopCorrection',
                function(data) {
                    $scope.offsetTopCorrection = data.offsetTopCorrection;
                });
            var promise = $scope.accountsModel.load();
            $('.panel-message').hide();
            promise.then(function() {
                if (!$scope.accountsModel.selected &&
                    $scope.accountsModel.accounts &&
                    $scope.accountsModel.accounts.length >
                    0) {
                    var account = $scope.accountsModel.findByAccountNumber(
                        lpWidget.getPreferenceFromParents(
                            'defaultAccount'));
                    $scope.accountsModel.selected =
                        account || $scope.accountsModel
                        .accounts[0];

                    if (localStorage.getItem("navigationFlag")) {
                    var params = JSON.parse(localStorage.getItem("navigationData"));
                    if(localStorage.getItem("origin")=="dashboard" || localStorage.getItem("origin")=="accounts"){

                        gadgets.pubsub.publish("js.back", {
                            data: "ENABLE_BACK"
                        });
                    }

                    if(localStorage.getItem("origin")=="accounts"){
                        $scope.fromAccounts = true;
                    }

                    if (!params.originType ||
                        (params.originType &&
                         params.originType !==
                         'transactions')
                        ) {
                    console.log(
                                "Param Account ID --" +
                                params.accountId
                                );
                    var account = $scope.accountsModel.findByAccountNumber(params.accountId);
                    
                    if (localStorage.getItem("origin") === 'dashboard') {
                    $scope.fromDashboard = true;
                    }
                    
                    angular.forEach(
                                    $scope.accountsModel
                                    .accounts,
                                    function(
                                             account
                                             ) {
                                    console
                                    .log(
                                         "Account ID : " +
                                         account
                                         .id
                                         );
                                    if (
                                        params
                                        .accountId ===
                                        account
                                        .id
                                        ) {
                                    console
                                    .log(
                                         "Received account ID" +
                                         params
                                         .accountId
                                         );
                                    $scope
                                    .accountsModel
                                    .selected =
                                    account;
                                    }
                                    });
                    applyScope($scope);
                   
                    }
                    }
                }
            });
            PreferenceService.read().success(function(response) {
                $scope.errorSpin = false;
                $('.panel-message').show();
                $scope.showCategories = lpCoreUtils.parseBoolean(
                    response.pfmEnabled);
            }).error(function(response) {
                $scope.errorSpin = false;
                if (response.cd) {
                    checkTimeout(response);
                    $scope.serviceError =
                        checkGlobalError(response);
                    $scope.alert = {
                        messages: {
                            cd: response.rsn
                        }
                    };
                    $scope.addAlert('cd', 'error',
                        false);
                }
            });
       
        };
        gadgets.pubsub.subscribe("native.back", function(evt) {
            console.log(evt.text);
            if ($scope.fromDashboard) {
                $scope.backToDashboardScreen();
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
            }else if($scope.fromAccounts){
                gadgets.pubsub.publish("launchpad-retail.goToMyAccounts");
                gadgets.pubsub.publish("js.back", {
                    data: "ENABLE_HOME"
                });
            }
            localStorage.clear();
        });

        gadgets.pubsub.subscribe("GoBackInitiate", function(evt) {
            if(localStorage.getItem("navigationFlag")) {
                console.log(evt.text);
                if ($scope.fromDashboard) {
                    $scope.backToDashboardScreen();
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                    });
                }else if($scope.fromAccounts){
                    gadgets.pubsub.publish("launchpad-retail.goToMyAccounts");
                    gadgets.pubsub.publish("js.back", {
                        data: "ENABLE_HOME"
                    });
                }
                localStorage.clear();
            }else {
                gadgets.pubsub.publish("device.GoBack");
            }
        });

        $scope.backToDashboardScreen = function() {
            gadgets.pubsub.publish(
                "launchpad-retail.backToDashboard");
        };
        $scope.selectCurrency = function(curr) {
            return lpCoreI18n.formatCurrency(curr);
        };
        $scope.accountChanged = function() {
            lpCoreBus.publish(
                'launchpad-retail.accountSelected', {
                    accountId: $scope.accountsModel.selected
                        .id,
                    originType: 'transactions',
                    _noBehavior: true
                }, true);
        };
        $scope.accountSelectSize = 'large';
        $scope.selectTab = function(tab) {
            $scope.$broadcast('tabSelected', tab);
        };
        $scope.transferMoney = function() {
            lpCoreBus.publish(
                'launchpad-retail.requestMoneyTransfer');
        };
        lpWidget.addEventListener('preferencesSaved', function() {
            lpWidget.refreshHTML();
            initialize();
        });
        lpUIResponsive.enable($element).rule({
            'max-width': 200,
            then: function() {
                $scope.categorySmallLayout = false;
                $scope.responsiveClass = 'lp-tile-size';
                applyScope($scope);
            }
        }).rule({
            'min-width': 201,
            'max-width': 359,
            then: function() {
                $scope.accountSelectSize = 'small';
                $scope.categorySmallLayout = true;
                $scope.responsiveClass =
                    'lp-small-size';
                applyScope($scope);
            }
        }).rule({
            'min-width': 351,
            'max-width': 600,
            then: function() {
                $scope.accountSelectSize = 'large';
                $scope.categorySmallLayout = false;
                $scope.responsiveClass =
                    'lp-medium-size';
                applyScope($scope);
            }
        }).rule({
            'min-width': 601,
            then: function() {
                $scope.categorySmallLayout = false;
                $scope.responsiveClass =
                    'lp-large-size';
                applyScope($scope);
            }
        });
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
        initialize();

    }

    function transactionsListController($scope, $element, $filter,
        $timeout, i18nUtils, AccountsModel, lpTransactions,
        ContactsModel, lpWidget, $http, httpService, lpCoreBus,
        lpCoreUtils, lpPortal) {
        var CATEGORY_EVENT = 'launchpad-retail.categorySelected';
        var isOldBrowser = isES3Browser();;
        var ie8CategoryFull = 160;
        var ie8CategoryCollapsed = 9;
        var date = new Date();
        var FromDate = '';
        var ToDate = '';
        $scope.todaysDate = new Date();
        $scope.minDate = date.setDate((new Date()).getDate() - 365);
        var tempFrom;
        var tempTo;
        var errMessage = '';
        var errMessagePFDEXCEL = '';
         var successMessagePFDEXCEL = '';
        $scope.noTransactionsFound = false;
        $scope.hidePdfExcelEmailButton = true;
        $('.panel-message').hide();
        $scope.selectedCrDr = [];
        $scope.CrDrList = [{
            id: 1,
            creditDebitIndicator: 'CRDT'
        }, {
            id: 2,
            creditDebitIndicator: 'DBIT'
        }];
       $scope.nowReady = false;
        var initialize = function() {
            $scope.errorSpin = true;
            $('.panel-message').hide();
            $('.panel-message').hide();
            $scope.showTransactionIcons = lpCoreUtils.parseBoolean(
                lpWidget.getPreference(
                    'showTransactionIcons'));
            $scope.accountsModel = AccountsModel;
            $scope.transactionsModel = lpTransactions.api();
            $scope.transactionsModel.isOpenDate1 = false;
            $scope.transactionsModel.isOpenDate2 = false;
            $scope.emailGeneration = false;
            $scope.transactionsModel.fromDate = '';
            $scope.transactionsModel.toDate = '';
       };
       $timeout(function(){
                $scope.nowReady = true;
                $('html, body').animate({
                scrollTop: $("#above-transactions-list").offset().top}, 3500);
                },500)
        $scope.setSelectedClient = function() {
            var creditDebitIndicator = this.company.creditDebitIndicator;
            $scope.txn = $scope.transactionsModel.transactions;
            console.log($scope.transactionsModel.transactions);
            console.log($scope.txn);
            if (_.contains($scope.selectedCrDr,
                creditDebitIndicator)) {
                $scope.selectedCrDr = _.without($scope.selectedCrDr,
                    creditDebitIndicator);
            } else {
                if (!(_.contains($scope.selectedCrDr, 'CRDT')) &&
                    !(_.contains($scope.selectedCrDr, 'DBIT'))) {
                    $scope.selectedCrDr.push(
                        creditDebitIndicator);
                } else if ((_.contains($scope.selectedCrDr,
                    'CRDT')) && !(_.contains($scope.selectedCrDr,
                    'DBIT'))) {
                    $scope.selectedCrDr = _.without($scope.selectedCrDr,
                        'CRDT');
                    $scope.selectedCrDr.push('DBIT');
                } else if (!(_.contains($scope.selectedCrDr,
                    'CRDT')) && (_.contains($scope.selectedCrDr,
                    'DBIT'))) {
                    $scope.selectedCrDr = _.without($scope.selectedCrDr,
                        'DBIT');
                    $scope.selectedCrDr.push('CRDT');
                }
            }
            return false;
        };






        //
        //

        //

        //


        $scope.isChecked = function(creditDebitIndicator) {
            if (_.contains($scope.selectedCrDr,
                creditDebitIndicator)) {
                return 'glyphicon glyphicon-ok pull-right';
            }
            return false;
        };
        $scope.checkAll = function() {
            $scope.selectedCrDr = _.pluck($scope.CrDrList,
                'creditDebitIndicator');
        };
        angular.module('ui.bootstrap.demo', ['ui.bootstrap']);
        angular.module('ui.bootstrap.demo').controller(
            'transactionsListController', function($scope, $log) {
                $scope.toggleDropdown = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.status.isopen = !$scope.status.isopen;
                };
            });
        $scope.openFromCalendar = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.transactionsModel.isOpenDate1 = true;
        };
        $scope.openToCalendar = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.transactionsModel.isOpenDate2 = true;
        };
        $scope.dateOptionsFrom = {
            'show-button-bar': false,
            'show-weeks': false
        };
        $scope.dateOptionsTo = {
            'show-button-bar': false,
            'show-weeks': false
        };
        var currentSuggestion = null;
        $scope.query = '';
        $scope.updateSuggestion = function(suggestion) {
            currentSuggestion = suggestion;
            $scope.doSearch();
        };
        $scope.doSearchForDate = function() {
            var oneDay = 24 * 60 * 60 * 1000;
            $scope.hidePdfExcelEmailButton = false;
            $scope.errMessagePFDEXCEL = '';
              $scope.successMessagePFDEXCEL = '';
            $scope.errMessage = '';
            var wrongSearch = null;
            if ($scope.transactionsModel.fromDate === '' ||
                $scope.transactionsModel.toDate === '') {
                $scope.errMessage =
                    'Please select From And To date ';
                $scope.hidePdfExcelEmailButton = true;
            } else {
                if ($scope.transactionsModel.toDate.getTime() ===
                    $scope.transactionsModel.fromDate.getTime()
                ) {
                    $scope.errMessage = '';
                    $scope.errMessagePFDEXCEL = '';
                     $scope.successMessagePFDEXCEL = '';
                    var filters = {};
                    filters.fromDate = $scope.transactionsModel
                        .fromDate.getTime();
                    filters.toDate = $scope.transactionsModel.toDate
                        .getTime();
                    console.log('filters.fromDate' + filters.fromDate);
                    console.log('filters.toDate' + filters.toDate);
                    lpCoreBus.publish(
                        'launchpad-retail.transactionsDateSearch', {
                            fromDate: filters.fromDate,
                            toDate: filters.toDate
                        });
                    setFilters(filters);
                    lpCoreBus.publish(CATEGORY_EVENT, filters.category);
                } else {
                    if ($scope.transactionsModel.toDate >
                        $scope.todaysDate) {
                        $scope.errMessage =
                            'To date is greater than today\'s date';
                        $scope.hidePdfExcelEmailButton = true;
                        return false;
                    }
                    var diff = $scope.transactionsModel.toDate.getTime() -
                        $scope.transactionsModel.fromDate.getTime();
                    var diffDays = diff / oneDay;
                    var diffMonths = diffDays / idfcConstants.DAYS_IN_MONTH;
                    //if (diffMonths > idfcConstants.MINIMUM_MONTH_TRANSACTION) {
                    if (diffMonths > 12.2) {
                        $scope.errMessage =
                            'Please restrict the statement period to a maximum of 12 months.';
                        return false;
                    }
                    if ($scope.transactionsModel.toDate >
                        $scope.transactionsModel.fromDate) {
                        $scope.errMessagePFDEXCEL = '';
                         $scope.successMessagePFDEXCEL = '';
                        if ($scope.transactionsModel.toDate >
                            $scope.todaysDate) {
                            $scope.errMessagePFDEXCEL = '';
                             $scope.successMessagePFDEXCEL = '';
                            $scope.errMessage =
                                'To date is greater than today\'s date';
                            $scope.hidePdfExcelEmailButton =
                                true;
                            return false;
                            // <todo We have to comment in prduction>
                        }
                        $scope.errMessage = '';
                        $scope.errMessagePFDEXCEL = '';
                         $scope.successMessagePFDEXCEL = '';
                        var filters = {};
                        filters.fromDate = $scope.transactionsModel
                            .fromDate.getTime();
                        filters.toDate = $scope.transactionsModel
                            .toDate.getTime();
                        console.log('filters.fromDate' +
                            filters.fromDate);
                        console.log('filters.toDate' + filters.toDate);
                        lpCoreBus.publish(
                            'launchpad-retail.transactionsDateSearch', {
                                fromDate: filters.fromDate,
                                toDate: filters.toDate
                            });
                        setFilters(filters);
                        lpCoreBus.publish(CATEGORY_EVENT,
                            filters.category);
                        // }
                    } else {
                        $scope.errMessagePFDEXCEL = '';
                         $scope.successMessagePFDEXCEL = '';
                        $scope.wrongSearch =
                            'Wrong date search criteria please check';
                        $scope.errMessage =
                            'To date should be greater than from date';
                        $scope.hidePdfExcelEmailButton = true;
                        return false;
                    }
                }
            }
        }
        $scope.doSearch = function() {
            var filters = {};
            if (currentSuggestion) {
                if (currentSuggestion.search.query) {
                    filters.query = currentSuggestion.search.query;
                } else if (currentSuggestion.type === 'date') {
                    filters.fromDate = $scope.transactionsModel
                        .fromDate.getTime();
                    filters.toDate = $scope.transactionsModel.toDate
                        .getTime();
                    alert('filters.fromDate' + filters.fromDate);
                    console.log('filters.fromDate' + filters.fromDate);
                    alert('filters.toDate' + filters.toDate);
                    console.log('filters.toDate' + filters.toDate);
                    lpCoreBus.publish(
                        'launchpad-retail.transactionsDateSearch', {
                            fromDate: filters.fromDate,
                            toDate: filters.toDate
                        });
                } else if (currentSuggestion.type === 'amount') {
                    filters.fromAmount = currentSuggestion.search
                        .from;
                    filters.toAmount = currentSuggestion.search
                        .to;
                } else if (currentSuggestion.type === 'contact') {
                    filters.contact = currentSuggestion.search.contact;
                } else if (currentSuggestion.type ===
                    'category') {
                    lpCoreBus.publish(
                        'launchpad-retail.transactionsCategorySearch',
                        currentSuggestion.category);
                    filters.category = currentSuggestion.search
                        .category;
                }
            }
            setFilters(filters);
            lpCoreBus.publish(CATEGORY_EVENT, filters.category);
        };
        var setFilters = function(filters) {
            $scope.transactionsModel.setFilters(filters);
            var xhr;
            xhr = $scope.transactionsModel.loadTransactions(
                $scope.accountsModel.selected);
//            $timeout(function(){
//                $('html, body').animate({
//                    scrollTop: $("#above-transactions-list").offset().top
//                    }, 1000);
//            }, 1500)
        };
        $scope.resetSearch = function() {
            lpCoreBus.publish(CATEGORY_EVENT, undefined);
            $scope.transactionsModel.clearFilters();
            $('#fromDate').val('');
            $('#toDate').val('');
            $scope.transactionsModel.fromDate = '';
            $scope.transactionsModel.toDate = '';
            $scope.errMessage = '';
            $scope.errMessagePFDEXCEL = '';
             $scope.successMessagePFDEXCEL = '';
            $scope.hidePdfExcelEmailButton = true;
            $('.success-emailPdfExcel').hide();
            var xhr;
            xhr = $scope.transactionsModel.loadTransactions(
                $scope.accountsModel.selected);
        };

        $scope.$watch('accountsModel.selected', function(value) {
                    if (value) {
                        var xhr;
                        xhr = $scope.transactionsModel.loadTransactions($scope.accountsModel.selected);
                    }
        });

        $scope.$watch('transactionsModel', function() {
            $scope.minumDate = 1443637800000;
            /*$scope.todaysDate = new Date();*/
            $scope.minDateForto = $scope.transactionsModel.fromDate;
            $scope.mind = new Date($scope.transactionsModel
                .fromDate);
            $scope.mind.setDate($scope.mind.getDate() + 365);
            $scope.txn = $scope.transactionsModel.transactions;
            data = $scope.txn;
            if (data) {
                var length = data.length;
                if (length === 0) {
                    $scope.noTransactionsFound = true;
                    $scope.errorSpin = false;
                } else {
                    $scope.noTransactionsFound = false;
                }
                if ($scope.transactionsModel.loading ||
                    $scope.transactionsModel.noTransactionsFound()
                ) {
                    $scope.errorSpin = true;
                } else {
                    $scope.errorSpin = false;
                }
            }
            var takeStartingAt = function(data) {
                var result = [],
                    skip = true;
                for (var i = 0; i < data.length; i++) {
                    if (data[0]) {
                        skip = false;
                    }
                    if (skip) {
                        continue;
                    }
                    result.push(data[i]);
                }
                return result;
            };
            var filteredData = takeStartingAt(data);
            $scope.paginationLimit = function(txn) {
                return pageSize * pagesShown;
            };
            $scope.hasMoreItemsToShow = function() {
                if($scope.txn.length % pageSize == 0)
                    return pagesShown < ($scope.txn.length / pageSize);
                else
                    return pagesShown <= ($scope.txn.length / pageSize);
            };
            $scope.showMoreItems = function() {
                pagesShown = pagesShown + 1;
            };
        }, true);
        $scope.CRDR = {
            options: [{
                label: 'CRDR',
                CRDR: '0',
                aria: 'Increasing'
            }, {
                label: 'DR',
                CRDR: '1',
                aria: 'Decreasing'
            }, {
                label: 'CR',
                CRDR: '2',
                aria: 'Increasing'
            }]
        };
        $scope.CRDR.selected = $scope.CRDR.options[0];
        $scope.changeCRDR = function(input) {
            var value = $scope.CRDR.selected;
            $scope.transactionsModel.CRDR = value.CRDR;
            if ($scope.transactionsModel && $scope.transactionsModel
                .transactions.length) {
                $scope.transactionsModel.CRDR($scope.accountsModel
                    .selected);
                if (value.CRDR === '2') {
                    for (var i = 0; i <= $scope.transactionsModel
                        .transactions.length; i++) {
                        if ($scope.transactionsModel.transactions[
                                i].creditDebitIndicator ===
                            'CRDT') {
                            input.$scope.transactionsModel.transactions(
                                i);
                        }
                    }
                }
                if (value.CRDR === '1') {
                    for (var i = 0; i <= $scope.transactionsModel
                        .transactions.length; i++) {
                        if ($scope.transactionsModel.transactions[
                                i].creditDebitIndicator ===
                            'DBIT') {
                            input.$scope.transactionsModel.transactions(
                                i);
                        }
                    }
                }
            }
        };
        $scope.changeFromDate = function() {
            var FromDate = $scope.transactionsModel.fromDate;
        };
        var openDateUrl = lpCoreUtils.resolvePortalPlaceholders(
            lpWidget.getPreference('openDateSrc'), {
                servicesPath: lpPortal.root
            });

        $scope.EmailGeneration = function() {
            $scope.errMessage = '';
            if ($scope.transactionsModel.fromDate === '' ||
                $scope.transactionsModel.toDate === '') {
                $scope.errMessagePFDEXCEL =
                    'Please select From And To date to generate Email ';
            } else {
                if ($scope.transactionsModel.toDate > $scope.transactionsModel
                    .fromDate) {
                    $scope.errorSpin = true;
                    $scope.emailGeneration = true;
                    $scope.errMessage = '';
                    $scope.errMessagePFDEXCEL = '';
                     $scope.successMessagePFDEXCEL = '';
                    var request = $http({
                        method: 'GET',
                        url: openDateUrl,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded;',
                        }
                    }).success(function(data) {
                        $scope.loadAccountNumbers =
                            data;
                        angular.forEach($scope.loadAccountNumbers,
                            function(account) {
                                if ($scope.accountsModel
                                    .selected.id ===
                                    account.accountNo
                                ) {
                                    if (account.accountCreatedDate ===
                                        null) {
                                        $scope.openingDate =
                                            0;
                                    } else {

                                    var dateData = account.accountCreatedDate.split('T');
                                        $scope.openDate = new Date(dateData[0]);
                                        $scope.openingDate =
                                            $scope.openDate
                                            .getTime();
                                    }
                                }
                            });
                        var pdfUrl = lpCoreUtils.resolvePortalPlaceholders(
                            lpWidget.getPreference(
                                'pdfDataSrc'), {
                                servicesPath: lpPortal
                                    .root
                            });
                        pdfUrl = pdfUrl + '?accountId=' +
                            $scope.accountsModel.selected
                            .id + '&df=' + $scope.transactionsModel
                            .fromDate.getTime() +
                            '&dt=' + $scope.transactionsModel
                            .toDate.getTime() +
                            '&emailFlag=' + true +
                            '&accTyp=' + $scope.accountsModel
                            .selected.alias +
                            '&openingDate=' + $scope.openingDate +
                            '&mop='	+ $scope.accountsModel.selected.modeOfOperation +
                            '&status=' + $scope.accountsModel.selected.status;
                        $scope.successMessagePFDEXCEL =
                            '';
//                        $('.panel-message').hide();
                        var xhr = $http({
                            method: 'GET',
                            url: pdfUrl,
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded;'
                            }
                        });
                        xhr.success(function(data) {
                            $scope.errorSpin =
                                false;
                                $scope.emailGeneration = false;
                            $('.success-emailPdfExcel').show();
                            $scope.successMessagePFDEXCEL = 'Done! We have sent your statement to your inbox!';
                        }).error(function(response) {
                            $scope.errorSpin =
                                false;
                                $scope.emailGeneration = false;
                            if (response = '') {
                                gadgets.pubsub.publish(
                                    "no.internet"
                                );
                            } else {
                                $(
                                    '.panel-message'
                                ).show();
                                $scope.errMessagePFDEXCEL =
                                    'Kindly register your Email ID to receive the account statement in email.';
                                $scope.error = {
                                    happened: true,
                                    msg: data
                                        .rsn
                                };
                            }
                        });
                    }).error(function(data, status) {
                        $scope.emailGeneration = false;
                        if (status == 0) {
                            gadgets.pubsub.publish(
                                "no.internet");
                        }
                    });
                } else {
                    $scope.errMessagePFDEXCEL =
                        'To date should be greater than from date to Generate Email';
                }
            }
        };
        $scope.changeFromTo = function() {
            tempFrom = new Date($scope.transactionsModel.fromDate);
            tempFrom.setDate(tempFrom.getDate() - 1);
            tempTo = new Date($scope.transactionsModel.toDate);
            tempTo.setDate(tempTo.getDate() + 1);
        };
        $scope.reset = function() {
            $scope.transactionsModel.fromDate = $scope.minDate;
            $scope.transactionsModel.toDate = $scope.todaysDate;
            tempFrom = $scope.minDate;
            tempTo = $scope.todaysDate;
        };
        $('.panel-message').hide();
        $scope.SearchFromTo = function() {
            $scope.transactionsModel.clearFilters();
            $scope.transactionsModel.loadTransactions($scope.accountsModel
                .selected);
        };
        var ascIconClass = 'lp-icon lp-icon-caret-up',
            descIconClass = 'lp-icon lp-icon-caret-down';
        $scope.sort = {
            options: [{
                label: 'Date',
                icon: descIconClass,
                sort: '-bookingDateTime',
                aria: 'Decreasing'
            }, {
                label: 'Date',
                icon: ascIconClass,
                sort: 'bookingDateTime',
                aria: 'Increasing'
            }, {
                label: 'Amount',
                icon: descIconClass,
                sort: '-transactionAmount',
                aria: 'Decreasing'
            }, {
                label: 'Amount',
                icon: ascIconClass,
                sort: 'transactionAmount',
                aria: 'Increasing'
            }]
        };
        $scope.sort.selected = $scope.sort.options[0];
        $scope.changeSort = function() {
            var value = $scope.sort.selected;
            $scope.transactionsModel.sort = value.sort;
            if ($scope.transactionsModel && $scope.transactionsModel
                .transactions.length) {
                $scope.transactionsModel.loadTransactions(
                    $scope.accountsModel.selected);
            }
        };
        $scope.transactionKeydown = function(evt, transaction) {
            if (evt.which === 13 || evt.which === 32) {
                evt.preventDefault();
                evt.stopPropagation();
                $scope.openDetails(transaction);
            }
        };
        $scope.loadTransactionDetails = function(transaction) {
            $scope.transactionsModel.loadTransactionDetails(
                transaction);
        };
        $scope.xyz = function() {
            $('.panel-message').hide();
            var length = $scope.transactionsModel.transactions.length;
            console.log($scope.transactionsModel.transactions);
            (function() {
                $('.panel-message').show();
                setTimeout(function() {
                    var selector = $scope.tabs.combined ===
                        true ?
                        '.lp-transactions-combined .transactions-list-row' :
                        '.transactions-list-row';
                    var row = $(lpWidget.body).find(
                        selector).eq(length);
                    row.focus();
                }, 100);
            });
        };
        $scope.loadMoreTransactions = function() {
            $('.panel-message').hide();
            var length = $scope.transactionsModel.transactions.length;
            $scope.transactionsModel.loadMoreTransactions().then(
                function() {
                    $('.panel-message').show();
                    setTimeout(function() {
                        var selector = $scope.tabs.combined ===
                            true ?
                            '.lp-transactions-combined .transactions-list-row' :
                            '.transactions-list-row';
                        var row = $(lpWidget.body).find(
                            selector).eq(length);
                        row.focus();
                    }, 100);
                });
        };
        $scope.updateTransactionCategory = function(transaction,
            categoryId, similar) {
            var promise;
            $scope.errorSpin = true;
            $('.panel-message').hide();
            if (!similar) {
                promise = $scope.transactionsModel.updateTransactionCategory(
                    transaction, categoryId);
            } else {
                promise = $scope.transactionsModel.updateSimilarTransactionCategory(
                    transaction, categoryId);
            }
            promise.success(function() {
                $scope.errorSpin = false;
                $('.panel-message').show();
            });
        };
        $scope.updateItemSize = function(transaction, data) {
            if (transaction.viewWidth === null || transaction.viewWidth ===
                undefined) {
                transaction.viewWidth = data.width;
            }
            var resizeBreakpoint = 500;
            var hiddenXsElements = angular.element(
                '#transaction-' + transaction.id +
                ' .info .hidden-xs');
            if (transaction.viewWidth > resizeBreakpoint &&
                data.width <= resizeBreakpoint) {
                hiddenXsElements.addClass('hidden');
            }
            if (transaction.viewWidth < resizeBreakpoint &&
                data.width >= resizeBreakpoint) {
                hiddenXsElements.removeClass('hidden');
            }
            transaction.viewWidth = data.width;
        };
        // ------------------
        $scope.openDetails = function(transaction, selectedTab) {
            var setDetailTabValues = function(tabs, selectedTab) {
                for (var tab in tabs) {
                    if (tabs.hasOwnProperty(selectedTab)) {
                        tabs[tab] = false;
                        if (tab === selectedTab) {
                            tabs[tab] = true;
                        }
                    }
                }
            };
            if (selectedTab === null || selectedTab ===
                undefined) {
                selectedTab = 'details';
            }
            transaction.showDetails = !transaction.showDetails;
            if (transaction.showDetails) {
                $timeout(function() {
                    setDetailTabValues(transaction.detailTabs,
                        selectedTab);
                }, 0);
            }
            if (selectedTab === 'details') {
                $scope.loadTransactionDetails(transaction);
            }
            $scope.closePreview(transaction);
            if ($scope.categorySmallLayout && transaction.showDetails) {
                $('body').animate({
                    scrollTop: $('#transaction-' +
                            transaction.id).offset().top -
                        5 - $scope.offsetTopCorrection
                }, 500);
            }
            if (!transaction.showDetails) {
                var tabset = document.getElementById(
                    'transactions-tabs');
                tabset.style.display = 'none';
                tabset.style.display = 'block';
            }
        };
        $scope.selectDetailsTab = function(transaction) {
            $scope.loadTransactionDetails(transaction);
        };
        $scope.openPreview = function(transaction) {
            transaction.preview = true;
            if (!transaction.showDetails) {
                if (isOldBrowser) {
                    $('#transaction-' + transaction.id +
                        ' .categories').width(
                        ie8CategoryFull);
                } else {
                    $('#transaction-' + transaction.id).addClass(
                        'preview');
                }
            }
        };
        $scope.closePreview = function(transaction) {
            transaction.preview = false;
            if (isOldBrowser) {
                $('#transaction-' + transaction.id +
                    ' .categories').width(
                    ie8CategoryCollapsed);
            } else {
                $('#transaction-' + transaction.id).removeClass(
                    'preview');
            }
        };
        $scope.categoryClick = function(event, transaction) {
            if (event !== null && event !== undefined) {
                event.preventDefault();
                event.stopPropagation();
            }
            $scope.openDetails(transaction, 'categories');
        };
        // Events
        lpCoreBus.subscribe(
            'launchpad-retail.transactions.applyFilter',
            function(data) {
                $scope.tabs.list = true;
                $scope.searchTerm = data.contactName;
                $scope.transactionsModel.setFilters(data.filters);
                $scope.transactionsModel.loadTransactions(
                    $scope.accountsModel.selected);
            });
        lpCoreBus.subscribe(
            'launchpad-retail.transactions.newTransferSubmitted',
            function() {
                $timeout(function() {
                    $scope.transactionsModel.clearTransactionsList();
                    $scope.transactionsModel.loadMoreTransactions();
                }, 3000);
            });
        lpCoreBus.subscribe(
            'launchpad-retail.donutCategoryChartSelection',
            function(data) {
                $scope.lpTransactions.setFilters({
                    category: data.categoryId
                });
                $scope.lpTransactions.loadTransactions($scope.accountsModel
                    .selected);
            });
        initialize();
    }

    exports.transactionsController = transactionsController;
    exports.transactionsListController = transactionsListController;
});