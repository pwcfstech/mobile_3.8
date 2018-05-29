/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - Launchpad
 *  Filename : performance.js
 *  Description: Performance module
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {
    'use strict';

    var NS = require('../../config').NS;
    var bus = require('../bus/main');
    var utils = require('../utils/main');

    var DEFAULT_EVENTS = {
        start: NS + '.performance.start',
        end: NS + '.performance.end'
    };

    // ========================================
    // Private helpers
    // ========================================
    /**
     * Returns payload data for cxp.performance events
     * according to passed params
     * @param data {Object}
     * @returns {Object}
     * @private
     */
    function getPayload (data) {
        var payload = {
            operation: data.operation
        };

        // Id
        if (data.id) {
            payload.id = data.id;
        }

        // Sender
        if (data.sender) {
            payload.operation = '[' + data.sender + '] ' + payload.operation;
        }

        // Tags
        if (data.tags && data.tags.length) {
            payload.operation = payload.operation + ' | ' + JSON.stringify(data.tags);
        }

        return payload;
    }

    // ========================================
    // Export
    // ========================================
    module.exports = function performanceFactory (params) {
        params = utils.defaults(params || {}, {
            bus: bus,
            events: DEFAULT_EVENTS
        });

        return {
            /**
             * Starts a measurement of operation with given name.
             * @param {String} name - Name of the measurement.
             * @param {Object} data - Additional data.
             * @param {String} data.id - Id of operation.
             * @param {String} data.sender - Name of message sender.
             * @param {Array}  data.tags - List of tags.
             * @public
             */
            start: function (name, data) {
                data = data || {};
                data.operation = name;
                params.bus.publish(params.events.start, getPayload(data));
            },

            /**
             * Stops a measurement of operation with given name.
             * Note, that data passed to `end` method should be equal
             * to data that was passed to `start` method.
             * @param name {String} Name of the measurement
             * @param {String} name - Name of the measurement.
             * @param {Object} data - Additional data.
             * @param {String} data.id - Id of operation.
             * @param {String} data.sender - Name of message sender.
             * @param {Array}  data.tags - List of tags.
             * @public
             */
            end: function (name, data) {
                data = data || {};
                data.operation = name;
                params.bus.publish(params.events.end, getPayload(data));
            }
        };
    };
});
