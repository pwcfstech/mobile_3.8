//
//  Backbase+Plugin.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 17/06/15.
//

#import <Backbase/Backbase.h>

@interface Backbase (Plugin)

/**
 * Registers a class to respond as a plugin. This method returns if the feauture was successfully registered or not.
 * @param plugin The class defining the plugin to register. It has to extend from Plugin class.
 * @param error If an error occurs, upon return contains an NSError object that describes the problem.
 * @return YES if the class was registered successfully.
 */
+ (BOOL)registerPlugin:(Plugin*)plugin error:(NSError**)error;

/**
 * Unregisters a plugin class.
 * @param plugin The class defining the plugin to unregister
 */
+ (void)unregisterPlugin:(Plugin*)plugin;

/**
 * Returns the instance of the registered plugin of the given type.
 * @discussion This method is useful to retrieve instances of plugins that can be useful in native code as well, for
 * instance: InMemoryStorage or PersistentStorage.
 * @param pluginType The class of the plugin type to look up
 * @return The registered plugin instance if any. nil otherwise.
 */
+ (Plugin*)registeredPlugin:(Class)pluginType;
@end
