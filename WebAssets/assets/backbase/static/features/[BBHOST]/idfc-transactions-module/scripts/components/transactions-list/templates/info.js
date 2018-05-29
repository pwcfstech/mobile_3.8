define(function () {
    'use strict';

    var template = '' +
        '<div class="col-xs-12 col-sm-12">' +
          '<div alert="alert" class="alert alert-info" ng-show="transaction.errorCode">' +
            '<span lp-i18n="{{transaction.errorCode}}"></span>' +
          '</div>' +
          '<ul tabset="tabset" class="transaction-details-navbar" ng-if="showCategories && transaction.showDetails && !hideDetailsPreference">' +
            '<li tab="tab" select="selectDetailsTab(transaction)" active="transaction.detailTabs.details">' +
              '<span tab-heading="tab-heading" lp-i18n="Details"></span>' +
              '<div lp-transactions-list-details="lp-transactions-list-details" transaction="transaction" categories="transactionsCategories" is-loading="transaction.isLoading"></div>' +
            '</li>' +
            '<li tab="tab" active="transaction.detailTabs.categories">' +
            '  <span tab-heading="tab-heading" lp-i18n="Categories"></span>' +
            '  <div lp-category-select="lp-category-select" ng-model="transactionsCategories" transaction="transaction" update="updateTransactionCategory" small-layout="categoryLayout === \'small\'" offset-top-correction="offsetTopCorrection" class="panel-body no-padding"></div>' +
            '</li>' +
          '</ul>' +
          '<div class="panel-body no-padding" ng-if="showCategories && transaction.showDetails && hideDetailsPreference">' +
            '<div lp-category-select="lp-category-select" ng-model="transactionsCategories" transaction="transaction" update="updateTransactionCategory" small-layout="categoryLayout === \'small\'" offset-top-correction="offsetTopCorrection" class="panel-body no-padding"></div>' +
          '</div>' +
          '<div lp-transactions-list-details="lp-transactions-list-details" transaction="transaction" categories="transactionsCategories" is-loading="transaction.isLoading" ng-if="!showCategories && transaction.showDetails && !hideDetailsPreference"></div>' +
        '</div>';

    return template;
});
