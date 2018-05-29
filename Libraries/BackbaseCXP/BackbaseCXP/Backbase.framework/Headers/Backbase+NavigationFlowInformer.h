//
//  Backbase+NavigationFlowInformer.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 17/06/15.
//

#import <Backbase/Backbase.h>

@interface Backbase (NavigationFlowInformer)

/**
 * Registers an object's selector to respond to the navigation flow events.
 * @param obj The object owner of the selector to be called when an event occurs.
 * @param selector Selector to be executed. It must receive only one parameter NSNotification.
 */
+ (void)registerNavigationEventListener:(id)obj selector:(SEL)selector;

/**
 * Unregisters an object's as respondant to the navigation flow events.
 * @param obj The object that is responding to the navigation events.
 */
+ (void)unregisterNavigationEventListener:(id)obj;
@end
