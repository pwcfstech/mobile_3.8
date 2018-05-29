//
//  Backbase+Rendering.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 17/06/15.
//

#import <Backbase/Backbase.h>

@interface Backbase (Rendering)
/**
 * Registers an object's selector to observe when renderers are fully loaded. This event is triggered when a renderer
 * starts or when a renderer is preloaded. It allows the developer the opportunity to show an activity indicator and
 * remove it when it's sure all the content has been rendered to avoid partial renders being displayed.
 * @param obj The object owner of the selector to be called when an event occurs.
 * @param selector Selector to be executed. It must receive only one parameter NSNotification.
 */
+ (void)registerRendererLoadedObserver:(id)obj selector:(SEL)selector;

/**
 * Unegisters an object as respondant to the renderer load event.
 * @param obj The object that is responding to the preload event.
 */
+ (void)unregisterRendererLoadedObserver:(id)obj;
@end
