//
//  BBRendererFactory.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 18/03/15.
//

#import <Backbase/Backbase.h>
#import <Foundation/Foundation.h>

/**
 * Renderer factory.
 * This factory will retrieve or create an appropiated Renderer object based on the Renderable item information.
 * Furthermore, if preload or retaining are specified this factory will take care of caching the instance or retrieving
 * it from the cache on subsequent calls.
 */
@interface BBRendererFactory : NSObject

/**
 * Retrieves an appropriated renderer for the give item.
 * @param item The renderable item that will determine what renderer will be created
 * @param error If an error occurs, upon return contains an NSError object that describes the problem.
 * @return A BBRenderer especialized instance depending on the given item.
 */
+ (NSObject<Renderer>*)rendererForItem:(NSObject<Renderable>*)item error:(NSError**)error;

/**
 * Checks if there is a renderer for the given item is ready for use.
 * @param item The renderable item that will determine what renderer will be created
 * @return YES if there is a renderer ready for use, NO if the renderer has to be created.
 */
+ (BOOL)isRendererReadyForItem:(NSObject<Renderable>*)item;

/**
 * Preloads an appropriated renderer for the given item.
 * Since the preload is an asynchronous event, this method will send a notification when the renderer is ready for use.
 * To register for such notification use [Backbase registerRendererLoadedObserver:selector:]
 * @param item Renderable to use to preload the Renderer
 * @param error If an error occurs, upon return contains an NSError object that describes the problem.
 */
+ (void)preload:(NSObject<Renderable>*)item error:(NSError**)error;

/**
 * Preloads an appropriated renderers for the given items.
 * Since the preload is an asynchronous event, this method will send a notification when each renderer is ready for use.
 * To register for such notification use [Backbase registerRendererLoadedObserver:selector:] and filter the
 * userInfo[@"id"]
 * to know what renderer was ready.
 * @param items Renderables to use to preload the Renderers
 * @param error If an error occurs, upon return contains an NSError object that describes the problem.
 */
+ (void)preloadItems:(NSArray*)items error:(NSError**)error;

/**
 * Purges the associated Renderer for the renderable if it's retained.
 * @discussion If the Renderer associated with the item doesn't exists or it's not retained this method has no
 * effect.
 * @param item The renderable item to use for the search.
 */
+ (void)purge:(NSObject<Renderable>*)item;

/**
 * Purges all Renderers that are retained.
 */
+ (void)purgeAll;

/**
 * Registers a class to be used as renderer when the item specifies on their properties.
 * @param renderer The Class object to be instantiated if there is a matching native property on the requested element.
 * @param error If an error occurs, upon return contains an NSError object that describes the problem.
 * @return YES if the renderer was successfully registered, NO if there is any error.
 */
+ (BOOL)registerRenderer:(Class)renderer error:(NSError**)error;
@end
