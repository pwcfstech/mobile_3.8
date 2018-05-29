/*global expect, it, beforeEach, describe, spyOn, jasmine, require */

/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : network.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */
'use strict';

var network = require('./network');

var bus = require('../bus/main');

describe('Network monitor', function() {
    beforeEach(function() {
        spyOn(bus, 'subscribe');
        network();

        this.handleOffline = bus.subscribe.calls.argsFor(0)[1];
        this.handleOnline = bus.subscribe.calls.argsFor(1)[1];
    });

    describe('offline notification', function() {
        beforeEach(function() {
            spyOn(bus, 'publish');
        });
        it('should ', function() {
            var data = {};

            this.handleOffline(data);

            expect(bus.publish).toHaveBeenCalledWith('launchpad.add-notification', jasmine.objectContaining({
                notification: jasmine.objectContaining({
                    id: 'offline-notification',
                    level: 'info',
                    closable: true
                })
            }));
        });

    });

    describe('online notification', function() {
        beforeEach(function() {
            spyOn(bus, 'publish');
        });
        it('should ', function() {
            this.handleOnline();

            expect(bus.publish).toHaveBeenCalledWith('launchpad.remove-notification', jasmine.objectContaining({
                notification: jasmine.objectContaining({
                    id: 'offline-notification'
                })
            }));
        });

    });
});
