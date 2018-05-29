/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase Launchpad B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: Main entry point for Stacked Area Chart component
 *  ----------------------------------------------------------------
 */
define( function (require, exports, module) {
    'use strict';

    module.name = 'stacked-area-chart';

    var base = require('base');

    var deps = [];

    return base.createModule(module.name, deps)
        .directive(require('./stacked-area-chart'));
});
