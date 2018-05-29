//
//  NativeRenderer.h
//  Backbase
//
//  Created by Ignacio Calderon on 22/08/16.
//  Copyright © 2016 Backbase R&D B.V. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "NativeContract.h"
#import "NativeView.h"

/**
 * Native renderers base class.
 * This class provides with some boilerplate methods and smart defaults to ease the implementation of new native
 * renderers.
 * All methods from the Renderer protocol can be overriden if required to modify the behavior of the rendering process.
 * As convention, the NativeRenderer must implement the NativeContract that is rendering.
 */
@interface NativeRenderer : NSObject <Renderer, NativeContract>

/// Gets the reference to the view used by this Renderer implementation
@property (strong, nonatomic, readonly) UIView<NativeView> *view;

/**
 * Creates a NativeView object based on the renderable preference called <i>native.view</i>.
 * If the native.view preference is not present or is empty, a default view called Default&lt;ContractClass&gt;View will
 * be used instead.
 * After the view class is created the NativeView method initWithContract will be called to initialize the view with the
 * given contract and container.
 * @discussion At least the implementation of the new class is overriding the start method, this method should not be
 * called alone.
 * @param container     UIView that will contain this NativeRenderer view.
 * @param contractImpl  NativeContract implementation that will use the view to fulfill its calls
 *
 * @return A UIView conforming the NativeView protocol.
 */
- (UIView<NativeView> *)initializeViewAt:(UIView *)container nativeContract:(NSObject<NativeContract> *)contractImpl;

/**
 * Inherit from Renderer.
 * This implementation does nothing. Override when needed to execute other actions.
 */
- (void)reload;

/**
 * Inherit from Renderer.
 * This implementation does nothing. Override when needed to execute other actions.
 *
 * @param enable YES to enable scrolling, NO to disable it.
 */
- (void)enableScrolling:(BOOL)enable;

/**
 * Inherit from Renderer.
 * This implementation always returns NO. Override when needed to execute other actions.
 *
 * @return YES if scrolling is enabled, NO otherwise.
 */
- (BOOL)isScrollingEnabled;

/**
 * Inherit from Renderer.
 * This implementation does nothing. Override when needed to execute other actions.
 *
 * @param enable YES to enable bouncing, NO to disable it.
 */
- (void)enableBouncing:(BOOL)enable;

/**
 * Inherit from Renderer.
 * This implementation always returns NO. Override when needed to execute other actions.
 *
 * @return YES if bouncing is enabled, NO otherwise.
 */
- (BOOL)isBouncingEnabled;
@end
