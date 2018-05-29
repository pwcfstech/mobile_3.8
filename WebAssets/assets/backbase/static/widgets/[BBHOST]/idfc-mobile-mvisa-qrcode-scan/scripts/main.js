/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: Qr code scanning
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-mvisa-qrcode-scan';

    // External Dependencies
    var base = require('base');
    var core = require('core');
    var ui = require('ui');

    // Internal Dependencies
    var Model = require('./model');
    var ScanAndPayController = require('./controllers/ScanAndPayController');

    var deps = [
        core.name,
        ui.name,
        'uiSwitch',
        'ngTouch'
    ];

    /**
     * @ngInject
     */
    function run() {
        // Module is Bootstrapped
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
        .controller('ScanAndPayController', ScanAndPayController )
        .factory( 'model', Model )
        .run( run );
});
