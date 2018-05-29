/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  Filename : main.js
 *  Description: Provides the ability to login using simple authentication
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'idfc-login';

    var base = require('base');
    var core = require('core');
    var ui = require('ui');
    var cq = require('idfc-cq');

    var deps = [
        core.name,
        ui.name,
        cq.name,
      /*(change is switch)Toggle needs to work as a toggle. Right now it's an image. On click it should change the position as well as user should be able to slide it*/
        'uiSwitch',
        'ngTouch'
    ];

    // @ngInject
    function run() {
        // Module is Bootstrapped
    }

    module.exports = base.createModule(module.name, deps)
        .controller(require('./controllers'))
         .service(require('./services/LoginServices'))
        .run(run);
});



