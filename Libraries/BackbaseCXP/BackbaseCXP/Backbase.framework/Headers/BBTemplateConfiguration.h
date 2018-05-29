//
//  BBTemplateConfiguration.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 08/02/16.
//  Copyright © 2016 Backbase R&D B.V. All rights reserved.
//

#import <Foundation/Foundation.h>

/// Template geneation related configurations
@interface BBTemplateConfiguration : NSObject

/// Array of style files to be injected into the HTML template
@property (strong, nonatomic) NSArray* styles;

/// Array of javascript snippets to be executed on the HTML when ready
@property (strong, nonatomic) NSArray* scripts;

/// Array of script files to be injected into the HTML template
@property (strong, nonatomic) NSArray* extraLibraries;

/// Classes to be injected into the HTML template body tag
@property (strong, nonatomic) NSString* bodyClasses;

/// Meta tag values to be added to the template
@property (strong, nonatomic) NSDictionary* metas;
@end
