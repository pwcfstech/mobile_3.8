//
//  Renderable.h
//  BackbaseCXP
//
//  Created by Backbase R&D B.V. on 26/02/15.
//

//#import <BackbaseCXP/IconPack.h>
#import <Backbase/IconPack.h>
#import <Foundation/Foundation.h>

/**
 * Renderable protocol.
 * Objects retrieved from the model should conform to this protocol.
 * Objects conforming this protocol will be passed to the Renderer component for display.
 */
@protocol Renderable <NSObject>
@required

/**
 * Retrieves the preference value for the given key.
 * @param key The name of the preference to retrieve the value from.
 * @return The string value of the preference. nil if it doesn't exist.
 */
- (NSString*)preferenceForKey:(NSString*)key;

/**
 * Retrieves all preferences as a dictionary.
 * @return A dictionary with all preferences' names and values.
 */
- (NSDictionary*)allPreferences;

/**
 * Sets a preference to an especific value.
 * @param key The name of the preference to modify
 * @param value The value to set in the preference.
 */
- (void)setPreference:(NSString*)key withValue:(NSString*)value;

/**
 * Returns the type of item to be renderer, the renderer will decide, based on this value,
 * the best way to render.
 * @return Possible type of object to render.
 */
- (BBItemType)itemType;

/**
 * Returns the human readable name of the renderable element
 * @return The name of the element
 */
- (NSString*)itemName;

/**
 * Returns the id of the renderable element
 * @return The id of the element
 */
- (NSString*)itemId;

/**
 * Returns an array with renderable items containing the item's immediate children.
 * @return An array of renderable objects. Empty array if item doesn't have children.
 */
- (NSArray*)itemChildren;

/**
 * Returns the renderable item that contains this item.
 * @return The renderable item that contains this item.. nil if there is no parent
 */
- (NSObject<Renderable>*)itemParent;

/**
 * Gets an IconPack instance for the icon under the name.
 * @param name Name of the icon pack to search in the item
 * @return An IconPack for the given name, or nil if the name is not present.
 */
- (NSObject<IconPack>*)itemIconByName:(NSString*)name;

/**
 * Gets an IconPack instance for the icon at the given index.
 * @param index Index of the icon to be search.
 * @return An IconPack for the given index or nil if the index is out of bounds
 */
- (NSObject<IconPack>*)itemIconByIndex:(NSUInteger)index;

/**
 * Gets an array with all IconPack keeping the same order of the model.
 * @return An array of IconPacks
 */
- (NSArray*)itemIcons;
@end
