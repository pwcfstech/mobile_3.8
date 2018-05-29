/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase Launchpad B.V.
 *  ----------------------------------------------------------------
 *  Filename : main.js
 *  Description: Main entry point for Bar Chart component
 *  ----------------------------------------------------------------
 */
define( function (require, exports, module) {
    'use strict';

    module.name = 'bar-chart';

    var base = require('base');

    var deps = [];

    return base.createModule(module.name, deps)
        .directive(require('./bar-chart'));
});
