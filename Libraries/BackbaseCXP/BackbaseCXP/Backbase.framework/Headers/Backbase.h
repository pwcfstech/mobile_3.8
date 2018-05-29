//
//  Backbase.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 19/02/15.
//

#import <UIKit/UIKit.h>

//! Project version number for Backbase.
FOUNDATION_EXPORT double BackbaseVersionNumber;

//! Project version string for Backbase.
FOUNDATION_EXPORT const unsigned char BackbaseVersionString[];

// exposed interfaces.

// global public constants
#import <Backbase/BBConstants.h>

// configuration package
#import <Backbase/BBDevelopmentConfiguration.h>
#import <Backbase/BBBackbaseConfiguration.h>
#import <Backbase/BBSSLPinningConfiguration.h>
#import <Backbase/BBSecurityConfiguration.h>
#import <Backbase/BBTemplateConfiguration.h>
#import <Backbase/BBConfiguration.h>

// rendering package
#import <Backbase/Renderable.h>
#import <Backbase/Renderer.h>
#import <Backbase/WebRenderer.h>
#import <Backbase/RendererDelegate.h>
#import <Backbase/BBRendererFactory.h>
#import <Backbase/NativeView.h>
#import <Backbase/NativeContract.h>
#import <Backbase/NativeRenderer.h>
#import <Backbase/PageRenderer.h>

// model package
#import <Backbase/SiteMapItemChild.h>
#import <Backbase/Model.h>
#import <Backbase/ModelDelegate.h>
#import <Backbase/StatusCheckerDelegate.h>

// plugins package
#import <Backbase/Plugin.h>
#import <Backbase/BBStorage.h>
#import <Backbase/StorageComponent.h>
#import <Backbase/AbstractStorageComponent.h>
#import <Backbase/PersistentStorage.h>
#import <Backbase/PersistentStorageComponent.h>
#import <Backbase/InMemoryStorage.h>
#import <Backbase/InMemoryStorageComponent.h>

// security package
#import <Backbase/SecurityViolationDelegate.h>
#import <Backbase/LoginDelegate.h>
#import <Backbase/SessionDelegate.h>
#import <Backbase/SecurityCertificateValidator.h>

// content package
#import <Backbase/BBContentItem.h>

// targeting package
#import <Backbase/BBTargetingCallback.h>

// main module
#import <Backbase/Facade.h>
