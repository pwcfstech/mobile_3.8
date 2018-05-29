/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : bus.js
 *  Description:
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {

    'use strict';
    /*----------------------------------------------------------------*/
    /* Use b$ window.gadgets.pubsub
    /*----------------------------------------------------------------*/
    module.exports = window.gadgets && window.gadgets.pubsub || {
        publish: function() {},
        subscribe: function() {}
    };
});
