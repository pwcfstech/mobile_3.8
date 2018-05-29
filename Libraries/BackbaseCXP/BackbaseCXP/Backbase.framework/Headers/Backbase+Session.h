//
//  Backbase+Session.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 29/06/15.
//

#import <Backbase/Backbase.h>

@interface Backbase (Session)
/**
 * Verifies if the current session cookie is still valid.
 * @return YES if the current session is valid. NO otherwise.
 */
+ (BOOL)isSessionValid;

/**
 * Clears the current session cookie.
 */
+ (void)clearSession;

/**
 * Adds a session cookie (JWT) that was received from a native request to an authentication service.
 * This cookie must contain a JWT token that will be used by any other requests after it's set.
 * @param JWTCookie The JWT cookie received after the native authentication request.
 */
+ (void)addSessionCookie:(NSHTTPCookie*)JWTCookie;

/**
 * Executes a login authentication against the default Backbase authentication endpoint, using the given user ID and
 * password.
 * The response of the request will be sent to the given delegate.
 * @param login The user ID / login to be used in the request
 * @param password The password provided by the user.
 * @param delegate The delegate to handle the responses from the authentication server.
 */
+ (void)startSession:(NSString*)login password:(NSString*)password delegate:(NSObject<LoginDelegate>*)delegate;

/**
 * Ends the current session on the server-side and cleans all local cookies.
 */
+ (void)endSession;

/**
 * Ends the current session on the server-side and cleans all local cookies.
 * @param completionHandler Block of code to be executed after the server has replied and the cookies have been deleted.
 */
+ (void)endSessionWithCompletionHandler:(void (^)())completionHandler;

/**
 * Registers a session delegate to receive information about the session state changes (log in, log out)
 * @param sessionDelegate An object conforming the SessionDelegate protocol.
 */
+ (void)registerSessionObserver:(NSObject<SessionDelegate>*)sessionDelegate;

/**
 * Unregisters a session delegate from receiving information about the session state changes (log in, log out)
 */
+ (void)unregisterSessionObserver;
@end
