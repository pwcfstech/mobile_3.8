/*global define */

define(function(require, exports, module) {

    'use strict';

    var bus = require('../bus/main');

    exports.checkBages = function() {
        bus.publish('lpBadgesGetItems');
    };

    exports.dataFreshness = function(data) {
        var flagName = 'TheDataIsMostRecent';
        var status = -1;
        if (data && data.hasOwnProperty(flagName)) {
            status = (data[flagName] === 'false' || data[flagName] === false) ? 1 : 0;
        }
        // check data freshness status and notify the system
        bus.publish('lpDataFreshnessValidate', status);
    };

    //send pubsub message when we might be offline
    exports.offlineWarning = function() {
        bus.publish('launchpad.add-notification', {
            notification: {
                id: 'offline-warning',
                level: 'WARNING',
                message: 'Experiencing connectivity problems. Please check your internet connection',
                closable: false
            }
        });
    };

    //pubsub message to clear notifications of offline problems
    exports.clearOfflineWarning = function() {
        bus.publish('launchpad.remove-notification', {
            notification: {
                id: 'offline-warning'
            }
        });
    };

    //pubsub message when session time is running out. most likely the notifications widget will subscribe to this
    exports.sessionWarning = function(estimatedTime) {
        bus.publish('launchpad.add-notification', {
            notification: {
                id: 'session-timeout',
                level: 'WARNING',
                timeLeft: estimatedTime,
                message: 'Session is about to expire',
                values: {
                    secondsLeft: estimatedTime
                },
                closable: false,
                links: [{
                    rel: '/timeout/continue',
                    uri: window.location.hash || '#'
                }]
            }
        });
    };

    exports.removeNotification = function() {
        bus.publish('launchpad.remove-notification', {
            notification: {
                id: 'session-timeout'
            }
        });
    };

    exports.afterTimeout = function(config) {
        if (window.sessionStorage.getItem(config.sessionExpiredKey)) {
            //wait til notifications are likely to have initialized. need a message queue here!
            window.setTimeout(function() {
                bus.publish('launchpad.add-notification', {
                    notification: {
                        id: 'session-expired',
                        level: 'INFO',
                        message: 'Your session has expired. Please login again.',
                        closable: true
                    }
                });
            }, config.notifyAfterTimeoutDuration || 5000);
            window.sessionStorage.removeItem(config.sessionExpiredKey);
        }
    };

});
