//
//  BBSecurityConfiguration.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 08/02/16.
//  Copyright © 2016 Backbase R&D B.V. All rights reserved.
//

#import <Backbase/Backbase.h>

/// Security related configurations
@interface BBSecurityConfiguration : NSObject

/// List of patterns for allowed domains (RWARP)
@property (strong, nonatomic) NSArray* allowedDomains;

/// SSL pinning related configurations
@property (strong, nonatomic) BBSSLPinningConfiguration* sslPinning;

/// Block web view originated request.
@property (assign, nonatomic) BOOL blockWebViewRequests;
@end
