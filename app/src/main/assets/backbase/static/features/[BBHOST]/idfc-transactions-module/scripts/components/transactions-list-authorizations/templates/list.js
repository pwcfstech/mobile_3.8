define(function (require, exports, module) {
    'use strict';

    var template = '' +
        '<div ng-if="transactions.transactions.length > 0" class="lp-transactions-list-authorizations">' +
        '    <h5 ng-click="(listVisible = !listVisible)" class="lp-auth-header text-muted">{{ "Authorizations and Funds on Hold" | translate}}&nbsp;' +
        '        <i ng-show="listVisible" class="lp-icon lp-icon-caret-up"></i>' +
        '        <i ng-show="!listVisible" class="lp-icon lp-icon-caret-down"></i>' +
        '    </h5>' +
        '    <div ng-show="!listVisible" class="text-warning text-center">{{ "List of on-hold transactions is collapsed. Click the header above to show it..." }}</div><br ng-show="!listVisible" />' +
        '    <ul ng-show="listVisible" id="transactions-list-auth" class="list-group list-view transactions-list">' +
        '        <li class="list-group-item list-view-row clearfix"' +
        '            ng-repeat="transaction in transactions.transactions track by $index">' +
        '            <div id="transaction-{{transaction.id}}" class="list-view-container clearfix">' +
        '               <div class="categories" ng-mouseover="openPreview(transaction)" ng-mouseout="closePreview(transaction)" ng-if="showCategories">' +
        '                   <div lp-category-display="lp-category-display" lp-category-view="previewAll" lp-category-list="transactionsCategories.categories" ng-model="transaction"></div>' +
        '               </div>' +
        '               <div class="info">' +
        '                   <div class="col-md-8 col-sm-8 col-xs-8 column">' +
        '                       <div class="centered">' +
        '                           <div class="h4">{{ transaction.beneficiary }}</div>' +
        '                           <div class="h6 text-muted">{{ transaction.dateTime | date }}</div>' +
        '                       </div>' +
        '                   </div>' +
        '                   <div class="col-md-4 col-sm-4 col-xs-4 column text-center">' +
        '                       <div class="centered">' +
        '                           <span class="sr-only">Amount</span>' +
        '                           <span class="h4" itemProp="transactionAmount"' +
        '                               lp-amount="transaction.amount"' +
        '                               lp-amount-currency="transaction.currencyCode"></span>' +
        '                       </div>' +
        '                   </div>' +
        '               </div>' +
        '            </div>' +
        '        </li>' +
        '    </ul>' +
        '    <h3 class="lp-auth-footer"></h3>' +
        '</div>';

    return template;
});
