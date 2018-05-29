/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : directives.js
 *  Description:  On Hold Funds list directive
 *  ----------------------------------------------------------------
 */
define(function(require, exports) {

    'use strict';

    var $ = window.jQuery;

    // @ngInject
    exports.lpTransactionsAuthorizationsList = function($templateCache, lpTransactionsAuth) {

        $templateCache.put('$transactions-auth/list.html', require('../templates/list'));

        /**
         * Main link function
         *
         * @param scope
         * @param elem
         * @param attrs
         */
        function linkFn(scope, elem, attrs) {

            // init model API
            scope.transactions = lpTransactionsAuth.api();

            // hide/show variable
            scope.listVisible = true;

            // show toggler
            scope.showToggle = true;

            // watch selected account change
            scope.$watch('accounts.selected', function(account) {
                if (account) {
                    scope.transactions.loadTransactionsAuth(account);
                }
            });

            scope.openPreview = function(transaction) {
                transaction.preview = true;
                $('#transaction-' + transaction.id).addClass('preview');
            };

            scope.closePreview = function(transaction) {
                transaction.preview = false;
                $('#transaction-' + transaction.id).removeClass('preview');
            };
        }

        /**
         * Compile function
         * @param  {object}   el angular dom el object
         * @param  {object}   attrs el attributes
         * @return {function} link controller function
         */
        function compileFn(elem, attrs) {
            return linkFn;
        }

        // Directive configuration
        return {
            scope: {
                accounts: '=lpAccounts',
                transactionsCategories: '=lpTransactionsCategories',
                categoryLayout: '=',
                showCategories: '='
            },
            restrict: 'AE',
            compile: compileFn,
            template: $templateCache.get('$transactions-auth/list.html')
        };
    };

});
