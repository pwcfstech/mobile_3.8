//
//  PersistentStorage.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 18/05/16.
//  Copyright © 2016 Backbase R&D B.V. All rights reserved.
//

#import <Backbase/Backbase.h>

/// Persistent storage plugin specification.
@protocol PersistentStorageSpec <Plugin>
/**
 * Convenience method to retrieve the last known CSRF token.
 * @param callbackId The callbackId that this invocation refers to.
 */
- (void)getCsrfToken:(NSString*)callbackId;
@end

@interface PersistentStorage : BBStorage <PersistentStorageSpec, BBStorageSpec>
@end
