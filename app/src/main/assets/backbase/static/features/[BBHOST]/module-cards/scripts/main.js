/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: Provides service API for credit cards
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'module-cards';

    var base = require('base');
    var core = require('core');

    var deps = [
        core.name
    ];

    module.exports = base.createModule(module.name, deps)
        .factory(require('./models'));
});
