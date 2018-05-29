//
//  ContactFeature.h
//  IDFC Retail Banking
//
//  Created by Backbase R&D B.V.
//

#import <Backbase/Backbase.h>
#import <MessageUI/MessageUI.h>

@protocol ContactFeatureSpec <Plugin>

- (void)isEmailAvailable:(NSString*)callbackId;
//- (void)sendEmail:(NSString*)recipient /*subject*/:(NSString*)subject /*body*/:(NSString*)body;

- (void)sendEmail:(NSString*)callbackId :(NSString*)recipient;

-(void)callPhoneNumber:(NSString *)callbackId :(NSString *)phoneNumber;

@end

@interface ContactFeature : Plugin <ContactFeatureSpec, MFMailComposeViewControllerDelegate>

@property (nonatomic,strong)NSString * callBackIdGlobal;
@end
