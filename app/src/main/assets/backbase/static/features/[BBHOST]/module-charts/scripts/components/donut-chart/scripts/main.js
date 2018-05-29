/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase Launchpad B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: Main entry point for Donut Chart component
 *  ----------------------------------------------------------------
 */
define( function (require, exports, module) {
    'use strict';

    module.name = 'donut-chart';

    var base = require('base');

    var deps = [];

    return base.createModule(module.name, deps)
        .directive(require('./donut-chart'));
});
