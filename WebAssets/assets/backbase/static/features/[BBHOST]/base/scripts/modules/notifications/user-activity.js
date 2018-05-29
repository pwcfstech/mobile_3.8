/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : user-activity.js
 *  Description: User actions global subscription events
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {

    'use strict';

    var $ = require('jquery');
    var NS = require('../../config').NS;
    var bus = require('../bus/main');
    var events = {
        userActivity: NS + '.user.activity'
    };

    function notifyOnActivity() {
        bus.publish(events.userActivity);
    }

    /**
     * Initialization
     * @return {*}
     */
    module.exports = function() {
        $(document).on('click keypress', notifyOnActivity);
    };
});
