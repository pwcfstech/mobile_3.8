/*global describe, it, expect, require, afterEach, beforeEach, spyOn, jasmine */

/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : session-notifications.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */
'use strict';

var notifications = require('./session-notifications');

var bus = require('../bus/main');

describe('Session notifications', function() {
    beforeEach(function() {
        spyOn(bus, 'publish');
    });

    it('should export an object', function() {
        expect(notifications).toBeObject();
    });

    it('should export functions', function() {
        expect(notifications.checkBages).toBeFunction();
        expect(notifications.offlineWarning).toBeFunction();
        expect(notifications.clearOfflineWarning).toBeFunction();
        expect(notifications.sessionWarning).toBeFunction();
        expect(notifications.removeNotification).toBeFunction();
        expect(notifications.afterTimeout).toBeFunction();
    });

    describe('checkBadges', function() {
        it('should publish an event', function() {
            notifications.checkBages();
            expect(bus.publish).toHaveBeenCalledWith('lpBadgesGetItems');
        });
    });

    describe('dataFreshness', function() {
        it('should publish an event with value 0 if the data is the most recent', function() {
            notifications.dataFreshness({
                TheDataIsMostRecent: true
            });
            expect(bus.publish).toHaveBeenCalledWith('lpDataFreshnessValidate', 0);
        });

        it('should publish an event with value 1 if the data is NOT the most recent', function() {
            notifications.dataFreshness({
                TheDataIsMostRecent: false
            });
            expect(bus.publish).toHaveBeenCalledWith('lpDataFreshnessValidate', 1);
        });
    });

    describe('offlineWarning', function() {
        it('should publish an event', function() {
            notifications.offlineWarning();
            expect(bus.publish).toHaveBeenCalledWith('launchpad.add-notification', jasmine.objectContaining({
                notification: jasmine.objectContaining({
                    id: 'offline-warning',
                    level: 'WARNING',
                    closable: false
                })
            }));
        });
    });

    describe('clearOfflineWarning', function() {
        it('should publish an event', function() {
            notifications.clearOfflineWarning();
            expect(bus.publish).toHaveBeenCalledWith('launchpad.remove-notification', jasmine.objectContaining({
                notification: jasmine.objectContaining({
                    id: 'offline-warning'
                })
            }));
        });
    });

    describe('sessionWarning', function() {
        it('should publish an event', function() {
            notifications.sessionWarning(123);
            expect(bus.publish).toHaveBeenCalledWith('launchpad.add-notification', jasmine.objectContaining({
                notification: jasmine.objectContaining({
                    id: 'session-timeout',
                    level: 'WARNING',
                    timeLeft: 123,
                    closable: false
                })
            }));
        });
    });

    describe('removeNotification', function() {
        it('should publish an event', function() {
            notifications.removeNotification();
            expect(bus.publish).toHaveBeenCalledWith('launchpad.remove-notification', jasmine.objectContaining({
                notification: jasmine.objectContaining({
                    id: 'session-timeout'
                })
            }));
        });
    });

});
