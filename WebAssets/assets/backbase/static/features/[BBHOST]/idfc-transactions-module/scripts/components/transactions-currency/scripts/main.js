/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : main.js
 *  Description:
 *  Transactions Currency Component main file
 *  ----------------------------------------------------------------
 */

define(function (require, exports, module) {

    'use strict';

    module.name = 'component.transactions-currency';

    var base = require('base');
    var core = require('core');

    var deps = [
        core.name
    ];

    module.exports = base.createModule(module.name, deps)
        .provider( require('./providers') );
});
