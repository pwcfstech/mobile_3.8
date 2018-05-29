describe('Performance', function () {
    'use strict';

    var createPerformance = require('./performance');
    var EVENTS = {
        start: 'performance.start',
        end: 'performance.end'
    };

    function mockBus (onPublish) {
        return {
            publish: onPublish
        };
    }
    function testMethod (method) {
        describe(EVENTS[method], function () {
            it('should be published with given operation', function () {
                var onPublish = jasmine.createSpy('onPublish');
                var bus = mockBus(onPublish);
                var performance = createPerformance({
                    bus: bus,
                    events: EVENTS
                });

                performance[method]('render');

                expect(onPublish.calls.count()).toBe(1);
                expect(onPublish.calls.argsFor(0)).toEqual([
                    EVENTS[method],
                    { operation: 'render' }
                ]);
            });

            it('should be published with given operation and id', function () {
                var onPublish = jasmine.createSpy('onPublish');
                var bus = mockBus(onPublish);
                var performance = createPerformance({
                    bus: bus,
                    events: EVENTS
                });

                performance[method]('render', {
                    id: 'widget_42'
                });

                expect(onPublish.calls.count()).toBe(1);
                expect(onPublish.calls.argsFor(0)).toEqual([
                    EVENTS[method],
                    {
                        operation: 'render',
                        id: 'widget_42'
                    }
                ]);
            });

            it('should be published with given operation and id', function () {
                var onPublish = jasmine.createSpy('onPublish');
                var bus = mockBus(onPublish);
                var performance = createPerformance({
                    bus: bus,
                    events: EVENTS
                });

                performance[method]('render', {
                    sender: 'widget-transactions'
                });

                expect(onPublish.calls.count()).toBe(1);
                expect(onPublish.calls.argsFor(0)).toEqual([
                    EVENTS[method],
                    {
                        operation: '[widget-transactions] render'
                    }
                ]);
            });

            it('should be published with given operation, sender, and tags', function () {
                var onPublish = jasmine.createSpy('onPublish');
                var bus = mockBus(onPublish);
                var performance = createPerformance({
                    bus: bus,
                    events: EVENTS
                });

                performance[method]('render', {
                    sender: 'widget-transactions',
                    tags: ['js', 'render']
                });

                expect(onPublish.calls.count()).toBe(1);
                expect(onPublish.calls.argsFor(0)).toEqual([
                    EVENTS[method],
                    {
                        operation: '[widget-transactions] render | ["js","render"]'
                    }
                ]);
            });

            it('should be published without params if given params are empty object', function () {
                var onPublish = jasmine.createSpy('onPublish');
                var bus = mockBus(onPublish);
                var performance = createPerformance({
                    bus: bus,
                    events: EVENTS
                });

                performance[method]('render', {});

                expect(onPublish.calls.count()).toBe(1);
                expect(onPublish.calls.argsFor(0)).toEqual([
                    EVENTS[method],
                    { operation: 'render' }
                ]);
            });

            it('should be published without tags if given tags are empry array', function () {
                var onPublish = jasmine.createSpy('onPublish');
                var bus = mockBus(onPublish);
                var performance = createPerformance({
                    bus: bus,
                    events: EVENTS
                });

                performance[method]('render', {
                    tags: []
                });

                expect(onPublish.calls.count()).toBe(1);
                expect(onPublish.calls.argsFor(0)).toEqual([
                    EVENTS[method],
                    {
                        operation: 'render'
                    }
                ]);
            });
        });
    }
    testMethod('start');
    testMethod('end');
});
