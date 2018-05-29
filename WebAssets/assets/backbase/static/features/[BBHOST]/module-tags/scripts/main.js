/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : main.js
 *  Description:
 *  Main File Module Sample
 *  ----------------------------------------------------------------
 */

define( function (require, exports, module) {

    'use strict';

    module.name = 'module-tags';

    var base = require('base');

    var deps = [];

    module.exports = base.createModule(module.name, deps)
        .factory(require('./factories'))
        .directive(require('./directives'));
});
