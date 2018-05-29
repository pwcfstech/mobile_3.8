//
//  Backbase+Security.h
//  Backbase
//
//  Created by Backbase R&D B.V. on 03/08/15.
//  Copyright (c) 2015 Backbase R&D B.V. All rights reserved.
//

#import <Backbase/Backbase.h>

@interface Backbase (Security)
/**
 * Indicates whether the device is jailbroken or not
 * @return BOOL YES if device is jailbroken. NO otherwise.
 */
+ (BOOL)isDeviceJailbroken;

/**
 * Registers an instance that conforms to the SecurityViolationDelegate protocol.
 * @param delegate An instance conforming the protocol.
 */
+ (void)securityViolationDelegate:(NSObject<SecurityViolationDelegate>*)delegate;

/**
 * Registers an instance that conforms to the SecurityCertificateValidator protocol, to be used during the Certificate
 * pinning process.
 * @discussion If the certificate validator is not provided the SDK will use the default implementation.
 *
 * @param certificateValidator An instance conforming the protocol.
 */
+ (void)securityCertificateValidator:(NSObject<SecurityCertificateValidator>*)certificateValidator;

/**
 * Retrieves a preconfigured NSURLSessionConfiguration that can be used with 3rd party networking libraries to take
 * advantage of the built-in security features:
 * <ul>
 *   <li>Whitelisted domains (RWARP)</li>
 *   <li>SSL pinning</li>
 *   <li>Runtime integrity check for file:// requests</li>
 *   <li>Development features as allowUntrustedCertificates</li>
 * </ul>
 *
 * @return A preconfigured NSURLSessionConfiguration
 */
+ (NSURLSessionConfiguration*)securitySessionConfiguration;

/**
 * Verifies the signatures of a batch of files against an encrypted secured control.
 * @param securedControl Path of the control file relative to the basePath
 * @param paths List of paths to verify the sigantures. Each paths should be relative to the basePath
 * @param basePath Base path used to search and verify files from. The basePath is also relative to the
 * NSLibraryDirectory.
 * @param key Key used to encrypt the file.
 * @param error If an error occurs, upon return contains an NSError object that describes the problem.
 * @return YES if all paths were successfully verified and all of the matched the expected hashes. No if there is any
 * errors.
 */
+ (BOOL)verifySignaturesWith:(NSString*)securedControl
                       paths:(NSArray<NSString*>*)paths
                    basePath:(NSString*)basePath
                         key:(NSString*)key
                       error:(NSError**)error;
@end
