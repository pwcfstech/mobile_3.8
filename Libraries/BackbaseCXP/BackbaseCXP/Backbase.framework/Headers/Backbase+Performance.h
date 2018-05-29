//
//  Backbase+Performance.h
//  Backbase
//
//  Created by Backbase R&D B.V._ on 17/07/15.
//  Copyright (c) 2015 Backbase R&D B.V. All rights reserved.
//

#import <Backbase/Backbase.h>

@interface Backbase (Performance)

/**
 * Starts a performance event to be queued and wait for the end signal to measure the time spend in this operation.
 * @param operation The name of the operation that is starting. This exact same name has to be send to end this
 * operation.
 * @param objId Optional object that is requesting an action. If no object is associated with this action nil can be
 * sent.
 * @discussion It's possible to start this event performances from javascript widgets. In order to do so, send a pubsub
 * <code>gadgets.pubsub.publish("bb.performance.start", {"operation":"operation", "id": "objId"})</code>
 * As well as in this implementation, operation is mandatory and the id is optional.
 */
+ (void)startPerformanceEvent:(NSString*)operation withObjectId:(NSString*)objId;

/**
 * Ends a performance event that has been queued with a performanceStartEvent call.
 * @param operation The name of the operation that was started.
 * @discussion It's possible to start this event performances from javascript widgets. In order to do so, send a pubsub
 * <code>gadgets.pubsub.publish("bb.performance.end", {"operation":"operation"})</code>
 * As well as in this implementation, operation is mandatory.
 */
+ (void)endPerformanceEvent:(NSString*)operation;
@end
