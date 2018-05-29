//
//  ContactFeature.m
//  IDFC Retail Banking
//
//  Created by Backbase R&D B.V.
//

#import "ContactFeature.h"

@implementation ContactFeature
@synthesize callBackIdGlobal;

-(void)isEmailAvailable:(NSString *)callbackId{
    self.callBackIdGlobal = callbackId;
    
    // Check if we are able to send email
    BOOL emailIsAvailable = [MFMailComposeViewController canSendMail];

    // Create a JSON-compatible object that can be send back to the widget
    id result = @{ @"result" : [NSNumber numberWithBool:emailIsAvailable] };

    // Inform the widget about the outcome of the check (_cmd refers to the current selector/method)
    [self success:result callbackId:callBackIdGlobal];
}

-(void)sendEmail:(NSString *)recipient :(NSString *)callbackId
{
    self.callBackIdGlobal = callbackId;
    // Check if we are able to send email
    if (![MFMailComposeViewController canSendMail]) {
        [self error:@{ @"error" : @"Device is not capable of sending an email" } callbackId:callbackId];
        return;
    }

    // Validate if required parameters are available
    if (!recipient || recipient.length == 0) {
        [self error:@{ @"error" : @"No recipient provided" } callbackId:callBackIdGlobal];
        return;
    }
//    if (!subject || subject.length == 0) {
//        [self error:@{ @"error" : @"No subject provided" } from:_cmd];
//        return;
//    }
//    if (!body || body.length == 0) {
//        [self error:@{ @"error" : @"No body provided" } from:_cmd];
//        return;
//    }

    // Create a mail compose view controller that will allow the user to create an email
    MFMailComposeViewController *mailVC = [[MFMailComposeViewController alloc] init];
    mailVC.mailComposeDelegate = self; // This will cause the mailComposeController:didFinishWithResult:error: method to
    // be executed (defined below)
  //  [mailVC setSubject:subject];
    [mailVC setToRecipients:[NSArray arrayWithObject:recipient]];
   // [mailVC setMessageBody:body isHTML:NO];

    // Present the mail controller using the root view controller of the app
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:mailVC
                                                                                 animated:YES
                                                                               completion:nil];
}

-(void)callPhoneNumber:(NSString *)callbackId  :(NSString *)phoneNumber {
    self.callBackIdGlobal = callbackId;
    
    // Validate if required parameters are available
    if (!phoneNumber || phoneNumber.length == 0) {
        [self error:@{ @"error" : @"No phone number provided" } callbackId:callBackIdGlobal];
        return;
    }
    
    NSString *cleanedString = [[phoneNumber componentsSeparatedByCharactersInSet:[[NSCharacterSet characterSetWithCharactersInString:@"0123456789-+()"] invertedSet]] componentsJoinedByString:@""];
  //  NSURL *telURL = [NSURL URLWithString:[NSString stringWithFormat:@"tel:%@", cleanedString]];
    
    // Let the OS handle the dialing
//    BOOL result = [[UIApplication sharedApplication]
//        openURL:[NSURL URLWithString:[NSString stringWithFormat:@"tel:%@", phoneNumber]]];
   
    BOOL result = [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString stringWithFormat:@"tel:%@", cleanedString]]];
    
    if (result) {
        [self success:@{} callbackId:callBackIdGlobal];
    } else {
        [self error:@{ @"error" : @"Could not call the phone number" } callbackId:callBackIdGlobal];
        UIAlertView *alert=[[UIAlertView alloc]initWithTitle:@"ALERT" message:@"This function is only available on the iPhone"  delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [alert show];
        //[alert release];
    
    }
}

#pragma mark - MFMailComposeViewControllerDelegate methods

- (void)mailComposeController:(MFMailComposeViewController *)controller
          didFinishWithResult:(MFMailComposeResult)result
                        error:(NSError *)error {
    
    // Check if the email was not composed successfully
    if (result == MFMailComposeResultFailed) {
        NSString *errorMessage = error.localizedDescription ? error.localizedDescription
                                                            : @"Email failed to sent because of an unknown error";
        [self error:@{ @"error" : errorMessage }callbackId:callBackIdGlobal ];
    } else {
        
        // Nothing went wrong during composing, check what happened with the email
        NSString *resultString;
        switch (result) {
            case MFMailComposeResultCancelled:
                resultString = @"cancelled";
                break;
            case MFMailComposeResultSaved:
                resultString = @"saved";
                break;
            case MFMailComposeResultSent:
                resultString = @"sent";
                break;
            default:
                resultString = @"unknown";
                break;
        }
        
        // Send response back to the widget
        [self success:@{ @"result" : resultString } callbackId:callBackIdGlobal];
    }
    
    // Dismiss the view controller
    [controller dismissViewControllerAnimated:YES completion:nil];
}

@end
