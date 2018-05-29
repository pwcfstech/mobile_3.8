define(function () {
    'use strict';
    //!!! showTransactionIcons

    var template = '' +
    '<div class="lp-transactions-list lp-transactions-list-{{categoryLayout}} lp-widget-body" ng-class="{logohidden: hideLogo, \'preview-all\': previewAll, \'lp-transactions-list-no-icons\': !showTransactionIcons }">' +
      '<div class="category-toggle" ng-if="showCategories && showCategoriesToggle">' +
        '<button class="btn btn-default" tabindex="0" aria-pressed="{{ previewAll }}" ng-click="toggleCategoryView()" ng-class="{ \'active\': previewAll }">' +
          '<i title="Category view" class="lp-icon lp-icon-tag"></i>' +
          '<span class="sr-only">Show Categories</span>' +
        '</button>' +
      '</div>' +

      '<div class="panel-message" ng-if="transactions.noTransactionsFound()" role="alert">' +
        '<p>' +
          'There are no transactions to display' +
          '<span ng-show="!transactions.isSearching()">for this account</span>' +
          '<span ng-show="transactions.isSearching()">for this search</span>.' +
        '</p>' +
      '</div>' +

      '<div lp-freshness-message="lp-freshness-message"></div>' +

      '<div class="transactions-list-wrapper" lp-infinite-scroll="loadMoreTransactions()" lp-infinite-scroll-disabled="!showScrollbar || transactions.loading || !accounts.selected" lp-infinite-scroll-end="!transactions.moreAvailable">' +
        '<div id="transactions-list" role="presentation" class="list-group list-view transactions-list lp-transactions-list-items">' +
          '<div class="lp-transactions-list-item list-group-item list-view-row expandable clearfix" ng-class="{ open: transaction.showDetails }" ng-repeat="transaction in transactions.transactions track by $index">' +
            '<div class="lp-transactions-list-item-head list-view-container cursor-pointer clearfix" ng-click="openDetails(transaction)" tabindex="0" ng-keydown="transactionKeydown($event, transaction)" ng-mouseleave="closePreview(transaction)" role="button" id="transaction-{{transaction.id}}" aria-expanded="{{ !!transaction.showDetails }}" aria-controls="transaction-details-{{transaction.id}}">' +
              // Transaction category
              '<div class="lp-transactions-list-item-category categories" ng-mouseover="categoryLayout == \'small\' || openPreview(transaction)" ng-if="showCategories">' +
                '<div class="lp-transactions-list-category" data-role="transactions-list-item-category" lp-category-display="lp-category-display" lp-category-view="previewAll" lp-category-list="transactionsCategories.categories" ng-model="transaction" category-click="categoryClick($event, transaction)" category-start-swipe="categorySwipeStart($event, transaction)" category-swipe="categorySwipe($event, transaction)" category-end-swipe="categorySwipeEnd($event, transaction)"></div>' +
              '</div>' +

              // Content
              '<div class="lp-transactions-list-item-content" data-role="transactions-item-info">' +
                // Transaction date
                '<div class="lp-transactions-list-item-date column" ng-mouseover="categoryLayout == \'small\' || openPreview(transaction)">' +
                  '<div class="centered">' +
                    '<div class="lp-transactions-list-item-date-value" aria-hidden="true" ng-if="transaction.newDate || showDatesAllTransactions">' +
                      '<span itemprop="dateTimeMonth">{{transaction.bookingDateTime | date:\'MMM\'}}</span>' +
                      '<br />' +
                      '<span itemprop="dateTimeDate">{{transaction.bookingDateTime | date:\'dd\'}}</span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +

                // Transaction icon
                '<div class="lp-transactions-list-item-icon column" ng-if="showTransactionIcons">' +
                  '<div class="centered">' +
                    '<div class="lp-transaction-icon gray-image-hover">' +
                      '<img ng-if="transaction.counterPartyLogoPath" ng-src="{{transaction.counterPartyLogoPath}}" width="35" height="35" alt=""/>' +
                    '</div>' +
                  '</div>' +
                '</div>' +

                // Transaction summary
                '<div class="lp-transactions-list-item-summary column">' +
                  '<div class="centered">' +
                    '<div class="lp-transactions-list-item-name counterparty-name" itemProp="counterpartyName">' +
                      '<span class="sr-only">Name</span>{{getTransactionDescription(transaction)}}' +
                    '</div>' +
                    '<div class="lp-transactions-list-item-type text-muted" itemProp="transactionType">' +
                      '<span class="sr-only">Transaction type</span>' +
                      '{{getTransactionSubDescription(transaction)}}' +
                    '</div>' +
                    '<div class="lp-transactions-list-item-info text-muted">' +
                      '<span class="sr-only" lp-i18n="Date"></span>' +
                      '{{transaction.bookingDateTime | date:\'MMM\'}} {{transaction.bookingDateTime | date:\'dd\'}} ' +
                      '<span class="h6 text-muted transactions-list-item-amount" itemProp="transactionAmount" lp-amount="transaction.transactionAmount" lp-amount-currency="transaction.transactionCurrency"></span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +

                // Transaction amount
                '<div class="lp-transactions-list-item-amount column">' +
                  '<div class="centered">' +
                    '<span class="sr-only">Amount</span>' +
                    '<span class="lp-transactions-list-item-amount-value" itemProp="transactionAmount" lp-amount="transaction.transactionAmount" lp-amount-currency="transaction.transactionCurrency"></span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="lp-transactions-list-item-toggle"></div>' +
            '</div>' +
            '<div class="clearfix details lp-transactions-list-item-details transaction-details" id="transaction-details-{{transaction.id}}" aria-labelledby="transaction-details-data-{{transaction.id}}"></div>' +
          '</div>' +
        '</div>' +
        '<div ng-if="showScrollbar && transactions.loading" role="alert">' +
          '<div class="text-center" lp-i18n="Loading transactions..."></div>' +
        '</div>' +
        '<div ng-if="!showScrollbar">' +
          '<div ng-show="transactions.allowMoreResults()">' +
            '<p class="lp-transactions-list-more text-center">' +
              '<a href="" class="lp-transactions-list-more-button cursor-pointer" tabindex="0" ng-click="loadMoreTransactions()" lp-i18n="Show more"></a>' +
            '</p>' +
          '</div>' +
          '<div ng-if="transactions.loading" role="alert">' +
            '<p class="panel-message text-center" lp-i18n="Loading transactions..."></p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    return template;
});
