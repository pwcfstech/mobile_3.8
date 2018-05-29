//
//  BBConfiguration.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 08/02/16.
//  Copyright © 2016 Backbase R&D B.V. All rights reserved.
//

#import <Backbase/Backbase.h>

/// Backbase specific configuration
@interface BBConfiguration : NSObject

/// Backend related configurations
@property (strong, nonatomic) BBBackbaseConfiguration* backbase; //

/// Development related configurations
@property (strong, nonatomic) BBDevelopmentConfiguration* development;

/// Template related configurations
#ifdef __cplusplus
@property (strong, nonatomic, getter=getTemplate, setter=setTemplate:) BBTemplateConfiguration* _template;
#else
@property (strong, nonatomic, getter=getTemplate, setter=setTemplate:) BBTemplateConfiguration* template;
#endif

/// Security related configurations
@property (strong, nonatomic) BBSecurityConfiguration* security;
@end
