/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : network.js
 *  Description: Network global subscription events
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {

    'use strict';

    var $ = require('jquery');
    var NS = require('../../config').NS;
    var bus = require('../bus/main');
    var utils = require('../utils/main');
    var events = {
        offline: NS + '.network.offline',
        online: NS + '.network.online'
    };


    function handleOffline(data) {
        bus.publish('launchpad.add-notification', utils.merge({
            notification: {
                container: {
                    template: 'templates/offline.html'
                },
                id: 'offline-notification',
                level: 'info',
                message: 'Network connection has been lost.',
                closable: true
            }
        }, data));
    }

    function handleOnline() {
        bus.publish('launchpad.remove-notification', {
            notification: {
                id: 'offline-notification'
            }
        });
    }

    /**
     * Initialization
     * @return {*}
     */
    module.exports = function() {
        /**
        * Online & offline
        * https://developer.mozilla.org/en/docs/Online_and_offline_events
        */
        $(window)
            .on('offline', handleOffline)
            .on('online', handleOnline);

        /**
         * In case of mobile platform offline event will be handed by SDK.
         */
        bus.subscribe(events.offline, handleOffline);
        bus.subscribe(events.online, handleOnline);
    };
});
