//
//  Backbase+Model.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 17/06/15.
//

#import <Backbase/Backbase.h>

@interface Backbase (Model) <ModelDelegate>

/**
 * Loads the model using the configuration given. After the operation is successful or failed, the delegate must be
 * notified accordingly. It will try to load the model from the given sources in order, stopping with the first one
 * successful.
 * @param delegate Model delegate to be notified if the operation is successful or not.
 * @param order Array of strings of types { kModelSourceFile, kModelSourceCache, kModelSourceServer }
 */
+ (void)model:(NSObject<ModelDelegate>*)delegate order:(NSArray*)order;

/**
 * Returns the already loaded model. It will return nil if there is no model loaded.
 * @return The currently loaded model.
 */
+ (NSObject<Model>*)currentModel;

/**
 * Invalidates the current in-memory model. After this operation, all calls to model:forceDownload will retrieve a new
 * model
 * @return YES if the model was successfully invalidated. NO if there is nothing to invalidate.
 */
+ (BOOL)invalidateModel;

/**
 * Checks the model status. It will notify on the StatusCheckerDelegate when the new status is retrieved.
 * If this method is called before the initialize method, an exception will be raised.
 * @param delegate The delegate to be notified about the retrieval process.
 */
+ (void)checkStatus:(NSObject<StatusCheckerDelegate>*)delegate;

@end
