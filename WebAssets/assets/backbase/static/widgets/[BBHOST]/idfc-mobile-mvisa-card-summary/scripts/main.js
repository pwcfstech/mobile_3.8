/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: Debit card details for msvisa payment
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-mvisa-card-summary';

    // External Dependencies
    var base = require('base');
    var core = require('core');
    var ui = require('ui');

    // Internal Dependencies
    var Model = require('./model');
    var MainCtrl = require('./controllers/MvisaPaymentController');

    var deps = [
        core.name,
        ui.name
    ];

    /**
     * @ngInject
     */
    function run() {
        // Module is Bootstrapped
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
        .controller('MvisaPaymentController', MainCtrl )
        .factory( 'model', Model )
        .run( run );
});
