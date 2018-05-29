//
//  BBBackbaseConfiguration.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 08/02/16.
//  Copyright © 2016 Backbase R&D B.V. All rights reserved.
//

#import <Foundation/Foundation.h>

/// Backbase related configurations
@interface BBBackbaseConfiguration : NSObject

/// Experience name to be loaded
@property (strong, nonatomic) NSString* experience;

/// Local model file path.
@property (strong, nonatomic) NSString* localModelPath;

/// Remote context root used for endpoint services
@property (strong, nonatomic) NSString* remoteContextRoot;

/// Model server URL
@property (strong, nonatomic) NSString* serverURL;

/// Preload time out to wait for, expressed in seconds. Default is 10 seconds.
@property (assign, nonatomic) NSTimeInterval preloadTimeout;

/// Mobile services version the SDK is going to talk with. Default is 5.6.
@property (strong, nonatomic) NSString* version;

/// Cookie name used for authorization checks (isSessionValid).
@property (strong, nonatomic) NSString* sessionCookieName;
@end

