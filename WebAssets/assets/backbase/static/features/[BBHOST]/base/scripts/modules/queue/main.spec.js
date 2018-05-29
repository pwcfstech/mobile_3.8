/**
 *  ----------------------------------------------------------------
 *  Copyright © Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : main.spec.js
 *  Description:
 *  ----------------------------------------------------------------
 */
'use strict';

var queue = require('./main');
var Promise = require('../async/Promise');

var noop = function() {};

describe('Queue utility', function() {
    beforeEach(function() {
        // This is to reset queue because it is a singleton :(
        queue.__onPushCallbacks.length = 0;
        queue.queue.length = 0;
    });

    it('should export an object', function() {
        expect(queue).toBeObject();
    });

    it('should contain methods', function() {
        expect(queue.push).toBeFunction();
        expect(queue.hasMore).toBeFunction();
        expect(queue.onPush).toBeFunction();
        expect(queue.retry).toBeFunction();
        expect(queue.cancel).toBeFunction();
    });

    describe('pushing an item to the queue', function() {
        it('should increase the queue size', function() {
            var beforeSize = queue.queue.length;

            queue.push({contextId: 1}, noop);
            expect(queue.queue.length).toBeGreaterThan(beforeSize);
        });

        it('should run the onPush callbacks', function(done) {
            queue.onPush(done);
            queue.push({}, noop);
        });
    });

    describe('canceling tasks', function() {
        beforeEach(function() {
            queue.push({ contextId: 1 }, noop);
            queue.push({ contextId: 2 }, noop);
            queue.push({ contextId: 2 }, noop);
            queue.push({ contextId: 3 }, noop);
        });

        it('should remove all tasks when no context is provided', function() {
            queue.cancel({});
            expect(queue.hasMore()).toBe(false);
        });

        it('should not remove any tasks if the context does not match', function() {
            queue.cancel({ contextId: 999 });
            expect(queue.queue.length).toBe(4);
        });

        it('should remove all tasks from the given context', function() {
            queue.cancel({ contextId: 2 });
            expect(queue.queue.length).toBe(2);
        });

        it('should reject the cancelled task', function(done) {
            queue.push({ contextId: 999 }, noop).catch(done);
            queue.cancel({ contextId: 999 });
        });

    });

    describe('retrying tasks', function () {

        it('should call the retry method in the given retryObject', function(done) {
            queue.retry({ contextId: 4, retry: function () {
                done();
                return Promise.resolve();
            }});
        });

        it('should clear the queue when a task succeeds', function() {
            queue.retry({ contextId: 2, retry: function () { return Promise.resolve(); }});
            expect(queue.hasMore()).toBe(false, 'Queue should be empty');
        });

    });

});
