/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: accounts display
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfcaccount';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
	var accounts = require('module-accounts');

    var deps = [
        core.name,
        ui.name,
        accounts.name
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
