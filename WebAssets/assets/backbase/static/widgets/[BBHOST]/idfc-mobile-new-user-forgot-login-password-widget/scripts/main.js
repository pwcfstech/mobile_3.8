/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: New User - Forgot Login Password
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-new-user-forgot-login-password-widget';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
    var cq = require('idfc-cq');
	
    var deps = [
        core.name,
        ui.name,
        cq.name
    ];

    /**
     * @ngInject
     */
    function run() {
        // Module is Bootstrapped
    }

    module.exports = base.createModule(module.name, deps)
        .constant('WIDGET_NAME', module.name )
        .controller( require('./controllers') )
        .run( run );
});
