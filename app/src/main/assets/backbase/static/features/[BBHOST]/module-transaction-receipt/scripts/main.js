/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : main.js
 *  Description:
 *  Main File Module Contacts
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {
    'use strict';

    module.name = 'module-transaction-receipt';

    var base = require('base');
    var users = require('module-users');

    var deps = [
        users.name
    ];

    module.exports = base.createModule(module.name, deps)
        .factory(require('./model'));
});
