/**
 * Retry queue of actions.
 *
 * @copyright Backbase B.V.
 * @author Backbase R&D - Amsterdam - Launchpad
 *
 * @name retry
 * @memberof base
 */
/* eslint no-underscore-dangle:0 */
define(function(require, exports, module) {

    'use strict';

    var Promise = require('../async/Promise');

    var service = {
        __onPushCallbacks: []
    };
    var queue = [];

    service.queue = queue;

    function filterByContext(contextId) {
        var index = 0,
            keep = [];
        while(index < queue.length) {
            if (queue[index].contextId === contextId) {
                keep.push(queue.splice(index, 1)[0]);
            } else {
                index++;
            }
        }
        return keep;
    }

    /**
     *
     * @param method {String} Name of the task to run, either "retry" or "cancel".
     * @param [contextId] {String} contextId of the task to run.
     * @return {Promise}
     */
    function dequeue(method, contextId) {

        var allTasks = [],
            filteredQueue = contextId ? filterByContext(contextId) : queue;

        // Special "clear" name is used to simply drop queue tasks without either canceling or retrying.
        // It is used in case of retring context when only the first retryObject is actually retried and the
        // rest is cleared in case of success.
        if (method === 'clear') {
            filteredQueue.length = 0;
        } else {
            while (filteredQueue.length) {
                allTasks.push(filteredQueue.shift()[method]());
            }
        }

        return Promise.all(allTasks);
    }

    service.__runPushCallbacks = function(context, retryObject) {
        service.__onPushCallbacks.forEach(function(callback) {
            callback(context, retryObject);
        });
    };

    service.push = function(context, retryFunction) {

        return new Promise(function(resolve, reject) {

            // Push new retry item to the stack
            var retryObject = {
                contextId: context.contextId,
                retry: function() {
                    return Promise.resolve(retryFunction()).then(resolve, reject);
                },
                cancel: reject
            };

            // Push in queue and trigger onPush event
            queue.push(retryObject);
            service.__runPushCallbacks(context, retryObject);
        });
    };

    service.hasMore = function() {
        return queue.length > 0;
    };

    service.onPush = function(callback) {
        service.__onPushCallbacks.push(callback);
    };

    /**
     * Retry all same context queue callbacks one more time.
     * @param retryObject {Object} Task object to retry.
     */
    service.retry = function(retryObject) {
        return retryObject.retry().then(function() {
            return dequeue('clear', retryObject.contextId);
        });
    };

    /**
     * Clear all tasks in queue or same context tasks.
     * @param retryObject {Object} Task object to retry.
     */
    service.cancel = function(retryObject) {
        return dequeue('cancel', retryObject.contextId);
    };

    module.exports = service;

});
