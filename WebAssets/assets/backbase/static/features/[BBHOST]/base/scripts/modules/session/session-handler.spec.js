/*global beforeEach, describe, expect, it, spyOn, require */

/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : session-handler.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */
'use strict';

var mockStorage = (function () {
    var store = {};
    return {
        setItem: function (key, value) {
            store[key] = value;
        },
        clear: function (key) {
            store = {};
        }
    };
}());

var Session = require('./session-handler');
var sessionHandler = Session.getInstance({ store: mockStorage });

var bus = require('../bus/main');
var notifications = require('./session-notifications');
var log = require('../log/main');

describe('Session handler', function() {
    it('should export an object', function() {
        expect(Session).toBeObject();
    });
    it('should export a function', function() {
        expect(Session.getInstance).toBeFunction();
    });
    describe('Session handler instance', function() {
        it('should export an object', function() {
            expect(sessionHandler).toBeObject();
        });
        it('should be a function', function() {
            expect(sessionHandler.init).toBeFunction();
            expect(sessionHandler.logout).toBeFunction();
            expect(sessionHandler.startPolling).toBeFunction();
            expect(sessionHandler.ping).toBeFunction();
            expect(sessionHandler.makeSessionRequest).toBeFunction();
            expect(sessionHandler.handleStateResponse).toBeFunction();
            expect(sessionHandler.logError).toBeFunction();
            expect(sessionHandler.handleNetworkError).toBeFunction();
            expect(sessionHandler.startSessionWarning).toBeFunction();
            expect(sessionHandler.clearSessionWarning).toBeFunction();
        });
        it('should be false', function() {
            expect(sessionHandler.hasSession).toBeFalse();
            expect(sessionHandler.isPollingStarted).toBeFalse();
        });
    });

    describe('Session handler init', function() {
        beforeEach(function() {
            spyOn(bus, 'subscribe');
            spyOn(notifications, 'afterTimeout');
            spyOn(window, 'setTimeout');
        });

        beforeEach(function () {
            sessionHandler.init();
        });

        it('should subscribe to user activity', function() {
            expect(bus.subscribe).toHaveBeenCalledWith('launchpad.user.activity', jasmine.any(Function));
        });

        it('should configure that notifications to handle timeout', function() {
            expect(notifications.afterTimeout).toHaveBeenCalled();
        });

        it('should start the ping timer', function() {
            expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 30000);
        });
    });

    describe('handleStateResponse', function() {
        beforeEach(function() {
            spyOn(notifications, 'dataFreshness');
            spyOn(notifications, 'checkBages');
            spyOn(notifications, 'clearOfflineWarning');
            spyOn(notifications, 'sessionWarning');
        });
        beforeEach(function() {
            this.response = {
                data: {
                    remainingTime: 1234
                }
            };
        });

        it('should notify of data freshness', function() {
            sessionHandler.handleStateResponse(this.response);
            expect(notifications.dataFreshness).toHaveBeenCalled();
        });

        it('should check notification badges', function() {
            sessionHandler.handleStateResponse(this.response);
            expect(notifications.checkBages).toHaveBeenCalled();
        });

        describe("with high consecutive fail count", function() {
            beforeEach(function () {
                sessionHandler.consecutiveFailCount = 3;
                sessionHandler.handleStateResponse(this.response);
            });
            it('should clear offline warning', function() {
                expect(notifications.clearOfflineWarning).toHaveBeenCalled();
            });
            it('should reset consecutive fail count', function() {
                expect(sessionHandler.consecutiveFailCount).toBe(0);
            });
        });

        describe('with high consecutive fail count', function() {
            beforeEach(function () {
                sessionHandler.consecutiveFailCount = 3;
            });
            it('should clear offline warning', function() {
                sessionHandler.handleStateResponse(this.response);
                expect(notifications.clearOfflineWarning).toHaveBeenCalled();
            });
        });

    });

    describe('handleNetworkError', function() {
        describe('with a valid session', function() {
            beforeEach(function() {
                spyOn(sessionHandler.sessionStorage, 'clear');
                spyOn(sessionHandler.sessionStorage, 'setItem');
            });
            beforeEach(function() {
                sessionHandler.validSessionExisted = true;
                this.error = {
                    status: 401
                };
            });

            it('should clear mark session expired in storage', function() {
                sessionHandler.handleNetworkError(this.error);
                expect(sessionHandler.sessionStorage.clear).toHaveBeenCalled();
                expect(sessionHandler.sessionStorage.setItem).toHaveBeenCalledWith('launchpad.sessionExpired', 'true');
            });

        });

        describe('when request times out', function() {
            beforeEach(function() {
                spyOn(notifications, 'offlineWarning');
                this.error = {
                    status: 0,
                    statusText: 'timeout'
                };
            });

            describe('with a high consecutiveFailCount', function() {
                beforeEach(function() {
                    sessionHandler.consecutiveFailCount = 3;
                    sessionHandler.handleNetworkError(this.error);
                });
                it('should trigger an offline warning', function() {
                    expect(notifications.offlineWarning).toHaveBeenCalled();
                });
            });

        });

        describe('when an unexpected error occurs', function() {
            beforeEach(function() {
                spyOn(log, 'error');
                this.error = {
                    status: 400
                };
            });

            it('should log the error', function() {
                sessionHandler.handleNetworkError(this.error);
                expect(log.error).toHaveBeenCalled();
            });

        });

    });

});
