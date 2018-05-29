define(function (require, exports, module) {
    'use strict';

    return [
        '<div class="lp-transaction-details container-fluid">',
            '<div progress-indicator="progress-indicator" is-loading="isLoading">',
                '<div ng-if="transaction.details.bookingDateTime && transaction.details.address" class="row">',
                    '<div ng-if="transaction.details.bookingDateTime" class="col-xs-6 col-md-3" lp-transaction-details-datetime="transaction.details.bookingDateTime"></div>',
                    '<div ng-if="transaction.details.address" class="col-xs-6 col-md-3" lp-transaction-details-address="transaction.details.address"></div>',
                    '<div ng-if="transaction.details.location" class="col-xs-6 col-md-3" lp-transaction-details-map="transaction.details.location"></div>',
                    '<div ng-if="transaction.details.merchantType || transaction.details.category" class="col-xs-6 col-md-3">',
                        '<div ng-show="transaction.details.merchantType" lp-transaction-details-vertical detail-label="\'Merchant\'" detail-value="transaction.details.merchantType"></div>',
                        '<div ng-show="!transaction.details.merchantType" lp-transaction-details-vertical detail-label="\'Category\'" detail-value="transaction.details.category.name"></div>',
                    '</div>',
                '</div>',
                '<div ng-if="!(transaction.details.bookingDateTime && transaction.details.address)" class="row">',
                    '<div class="alert alert-warning col-xs-12">',
                        '<p><i class="lp-icon lp-icon-alert-warning"></i> <span lp-i18n="Specific details regarding this transaction are currently unavailable, please contact us for further information."></span></p>',
                    '</div>',
                '</div>',
                '<div ng-if="transaction.details.transactionId" class="row transaction-detail-reference">',
                    '<div class="col-xs-12 col-md-12" lp-transaction-details-horizontal detail-label="\'Transaction Reference\'" detail-value="transaction.details.transactionId"></div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
});
