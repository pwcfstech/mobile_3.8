//
//  BBConstants.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 20/05/15.
//

#ifndef PUBLIC_CONSTANTS
#define PUBLIC_CONSTANTS

#define BACKBASE_VERSION @"3.3.0"

#pragma mark - Logging

/// Defines logLevels for logging the SDK activity.
typedef NS_ENUM(NSUInteger, BBLogLevel) {
    /// Suppress all internal logs
    BBLogLevelNone = 0,
    /// Only display internal error messages
    BBLogLevelError,
    /// Only display internal error and warnings messages
    BBLogLevelWarn,
    /// Only display internal information, warning and errors messages
    BBLogLevelInfo,
    /// Only display internal debug, information, warning and errors messages
    BBLogLevelDebug,
    /// Logs everything, this is the default value.
    BBLogLevelEverything
};

#pragma mark - Renderable

/// Possible types of item that can be rendered.
typedef NS_ENUM(NSUInteger, BBItemType) {
    /// Renderable item is link reference
    BBItemTypeLink,
    /// Renderable item is Page
    BBItemTypePage,
    /// Renderable item is a Widget
    BBItemTypeWidget,
    /// Renderable item is a Container / Laout
    BBItemTypeLayout,
    /// Renderable item is an App
    BBItemTypeApp,
    /// Renderable item is a divider
    BBItemTypeDivider
};

#pragma mark - Model

/// Preload preference key
extern NSString* const kModelPreferencePreload;

/// Retain preference key
extern NSString* const kModelPreferenceRetain;

#pragma mark - Model Sources

/// Use to load a model from a cached file
extern NSString* const kModelSourceCache;

/// Use to load the model from a server especified in the configurations
extern NSString* const kModelSourceServer;

/// Use to load the model form a local file especified in the configurations
extern NSString* const kModelSourceFile;

#pragma mark - BBNavigationFlowInformer

/// Navigation flow informer self relationship
extern NSString* const kBBNavigationFlowRelationshipSelf;

/// Navigation flow informer child relationship
extern NSString* const kBBNavigationFlowRelationshipChild;

/// Navigation flow informer parent relationship
extern NSString* const kBBNavigationFlowRelationshipParent;

/// Navigation flow informer root ancestor relationship
extern NSString* const kBBNavigationFlowRelationshipRootAncestor;

/// Navigation flow informer root relationship
extern NSString* const kBBNavigationFlowRelationshipRoot;

/// Navigation flow informer sibling relationship
extern NSString* const kBBNavigationFlowRelationshipSibling;

/// Navigation flow informer other relationship
extern NSString* const kBBNavigationFlowRelationshipOther;

/// Navigation flow informer external relationship
extern NSString* const kBBNavigationFlowRelationshipExternal;

/// Navigation flow informer none relationship
extern NSString* const kBBNavigationFlowRelationshipNone;

#pragma mark - Site map section names

/// Convenient constant name for the Main Navigation site map section
extern NSString* const kSiteMapSectionMainNavigation;

/// Convenient constant name for the Not in Main Navigation site map section
extern NSString* const kSiteMapSectionNotInMainNavigation;
#endif
