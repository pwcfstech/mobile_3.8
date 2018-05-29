/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : main.js
 *  Description:
 *   Notifications to low-level events like errors, offline notifications, etc.
 *  ----------------------------------------------------------------
 */

define(function(require, exports, module) {
    'use strict';

    // network notifications handlers
    exports.network = require('./network');
    // user actions notifications
    exports.userActivity = require('./user-activity');

});
