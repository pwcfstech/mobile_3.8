/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : details.js
 *  Description:  Directives for each type of detail
 *  ----------------------------------------------------------------
 */
define(function(require, exports) {

    'use strict';

    exports.lpTransactionDetailsAddress = function() {
        var template = [
            '<div class="transaction-detail-label" lp-i18n="Address:"></div>',
            '<div>',
                '<span ng-show="address.street">{{address.street}}</span><br/>',
                '<span ng-show="address.city">{{address.city}}</span>',
                '<span ng-show="address.state">, {{address.state}}</span><br/>',
                '<span ng-show="address.country">{{address.country}}</span><br/>',
                '<span ng-show="address.zip">{{address.zip}}</span>',
            '</div>'
        ].join('');

        return {
            restrict: 'AE',
            scope: {
                address: '=lpTransactionDetailsAddress'
            },
            template: template,
            link: function(scope, element, attrs) {}
        };
    };

    exports.lpTransactionDetailsDatetime = function() {
        var template = [
            '<div class="transaction-detail-label" lp-i18n="{{detailLabel || \'Time\'}}:"></div>',
            '<div>{{datetime|date:\'shortTime\'}}<br/>{{datetime|date:\'longDate\'}}</div>'
        ].join('');

        return {
            restrict: 'AE',
            scope: {
                detailLabel: '=',
                datetime: '=lpTransactionDetailsDatetime'
            },
            template: template,
            link: function(scope, element, attrs) {}
        };
    };

    exports.lpTransactionDetailsMap = function() {
        var template = [
            '<img ng-src="{{location.mapUrl}}" class="transaction-detail-map" alt="{{\'Location map\' | translate}}" />'
        ].join('');

        return {
            restrict: 'AE',
            scope: {
                location: '=lpTransactionDetailsMap'
            },
            template: template,
            link: function(scope, element, attrs) {}
        };
    };

    exports.lpTransactionDetailsVertical = function() {
        var template = [
            '<div class="transaction-detail-vertical">',
                '<div class="transaction-detail-label" lp-i18n="{{detailLabel}}:"></div>',
                '<span class="transaction-detail-value">{{detailValue}}</span>',
            '</div>'
        ].join('');

        return {
            restrict: 'AE',
            scope: {
                detailLabel: '=',
                detailValue: '='
            },
            template: template,
            link: function(scope, element, attrs) {}
        };
    };

    exports.lpTransactionDetailsHorizontal = function() {
        var template = [
            '<div class="transaction-detail-vertical">',
                '<span class="transaction-detail-label" lp-i18n="{{detailLabel}}:"></span> ',
                '<span class="transaction-detail-value">{{detailValue}}</span>',
            '</div>'
        ].join('');

        return {
            restrict: 'AE',
            scope: {
                detailLabel: '=',
                detailValue: '='
            },
            template: template,
            link: function(scope, element, attrs) {}
        };
    };
});
