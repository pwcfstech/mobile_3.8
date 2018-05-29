//
//  fingerPrintPlugin.m
//  IDFC UAT
//
//  Created by Taral Soni on 24/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import "fingerPrintPlugin.h"
#import <LocalAuthentication/LocalAuthentication.h>
#import "constant.h"
#import "GlobalVariables.h"

@implementation fingerPrintPlugin
@synthesize globalCallbackId;

-(void)checkFingerprintCapability:(NSString *)callbackId{
    self.globalCallbackId = callbackId;
    //Chek whether device has finferprint capability or not
    
    NSString *touchIdStatus = [self checkTouchIdCapability];
    if([touchIdStatus isEqualToString:@"no.touch.capability"]){
        NSDictionary *result = @{ @"scannerFlag":@"false"};
        [self success:result callbackId:globalCallbackId];
    }else if ([touchIdStatus isEqualToString:@"no.touch.id.enrolled"] || [touchIdStatus isEqualToString:@"no.passcode.enrolled"])
    {
        NSDictionary *result = @{ @"scannerFlag":@"none"};
        [self success:result callbackId:globalCallbackId];
    }else if([touchIdStatus isEqualToString:@"true"]){
        NSDictionary *result = @{ @"scannerFlag":@true};
        [self success:result callbackId:globalCallbackId];
    }else{
        NSDictionary *result = @{ @"scannerFlag":@false};
        [self success:result callbackId:globalCallbackId];
    }
}


-(void)setupFingerPrint:(NSString *)callbackId{
    self.globalCallbackId = callbackId;
        NSString *touchIdStatus = [self checkTouchIdCapability];
        if([touchIdStatus isEqualToString:@"no.touch.capability"]){
            //No Touch id capability on hardware
            NSDictionary *result = @{ @"successFlag":@"false",
                                          @"errorDesc":@"Device doesnt have fingerprint scanning capability"};
            [self success:result callbackId:globalCallbackId];
        }else if ([touchIdStatus isEqualToString:@"no.touch.id.enrolled"] || [touchIdStatus isEqualToString:@"no.passcode.enrolled"])
        {
            //Device has touch id but user has either no enrolled fingerprint or not enabled passcode
            NSDictionary *result = @{ @"successFlag":@"false",
                                          @"errorDesc":@"You dont have any fingerprint setup"};
            [self success:result callbackId:globalCallbackId];
            
            //Show popup tp user
            fingerPrintPopup = [[FingerprintPopups alloc]init];
            UIView *view = [[[UIApplication sharedApplication] delegate] window];
            [fingerPrintPopup showInView:view animated:YES];
            
        }else if([touchIdStatus isEqualToString:@"true"]){
            //Everything is fine. Touch ID can be setup
            NSString *fpToken = [self generateRandomKey];
            [[NSUserDefaults standardUserDefaults] setValue:fpToken forKey:FP_TOKEN];
            [[NSUserDefaults standardUserDefaults] setValue:@"true" forKey:FP_SETUP_FLAG];
            NSDictionary *result = @{ @"successFlag":@"true",
                                          @"fpToken":fpToken,
                                      @"scannerFlag":@"true"};
            [self success:result callbackId:globalCallbackId];
        }else{
            NSDictionary *result = @{ @"successFlag":@"false",
                                          @"errorDesc":@"Fingerprint cannot be setup"};
            [self success:result callbackId:globalCallbackId];
        }
    
}


/**
 * Authenticates user using fingerprint
 * This function shall authenticate user against fingerprint if user has setup fingerprint authentication in global varaible
 * and user has atleast one fingerprint registered. Else it shall throw error popup
 *
 * Success: Sensor starts reading fingerprint and it automatically shows small popup to indicate user that he can login using fingerprint
 * Failure: Popup 1: User has done setup but doesnt have fingerprint registered
 *          Popup 2: Authentication fails
 *          Popup 3: Clean sensor error
 * @param callbackId
 */

-(void)authenticateUser:(NSString*)callbackId{
    self.globalCallbackId = callbackId;
    
    NSString *fpSetupFlag =[[NSUserDefaults standardUserDefaults] stringForKey:FP_SETUP_FLAG];
    if([fpSetupFlag isEqualToString:@"false"] || [fpSetupFlag isEqualToString:@""] || fpSetupFlag == NULL){
        NSDictionary *data = @{ @"startSensor":@false,
                                    @"message":@"You have not setup fingerprint authentication. Please eanble fingerprint to authenticate"};
        [self error:data callbackId:globalCallbackId];
        
        //Show popup tp user
        
        
    } else {
        NSString *touchIdStatus = [self checkTouchIdCapability];
        NSString *blacklistFlag = [[NSUserDefaults standardUserDefaults]stringForKey:IS_BLACK_LISTED];
        
       
            if([touchIdStatus isEqualToString:@"no.touch.id.enrolled"] || [touchIdStatus isEqualToString:@"no.passcode.enrolled"]){
                //user hasnt enrolled any fingerprint or has not enabled passcode on the device
                NSDictionary *data = @{ @"startSensor":@false,
                                        @"message":@"You dont have any fingerprint setup or have not enabled passcode protection"};
                
                //To do: Popup for no fingerprint setup with settings option
                fingerPrintPopup = [[FingerprintPopups alloc]init];
                UIView *view = [[[UIApplication sharedApplication] delegate] window];
                [fingerPrintPopup showInView:view animated:YES];
                
                [self error:data callbackId:globalCallbackId];
            }else if ([touchIdStatus isEqualToString:@"no.touch.capability"]){
                NSDictionary *data = @{ @"startSensor":@false,
                                        @"message":@"Device doesnt have Touch Id capability"};
                [self error:data callbackId:globalCallbackId];
            }else{
                //Everything is fine. Allow uer to authenticate
                
                //Sending data to widget
                NSDictionary *data = @{ @"startSensor":@true,
                                        @"message":@"Sensor started"};
                [self success:data callbackId:globalCallbackId];
                
                LAContext *context = [[LAContext alloc]init];
                NSError *error = nil;
                if ([context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]) {
                    
                    // Authenticate User
                    [context evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
                            localizedReason:@"Authenticate using fingerprint to login"
                                      reply:^(BOOL success, NSError *error) {
                                          
                                          if (error) {
                                              
                                              //Authentication failed
                                              
                                              NSDictionary *data = @{ @"successFlag":@false,
                                                                      @"fpToken":@"",
                                                                      @"tryAgain":@true,
                                                                      @"useMPIN":@false,
                                                                      @"noFP":@false,
                                                                      @"message":@"Could not recognize your fingerprint. Try Again!"};
                                              
                                              //Close popup that is open
                                              //Publish event to Widget
                                              [Backbase publishEvent:@"fp.auth.result" payload:data];
                                              
                                              NSLog(@"Finger print auth failed: %@", data);
                                              
                                              
                                              /*UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error"
                                               message:@"There was a problem verifying your identity."
                                               delegate:nil
                                               cancelButtonTitle:@"Ok"
                                               otherButtonTitles:nil];
                                               [alert show];*/
                                              return;
                                          }
                                          
                                          if (success) {
                                              //Authentication successful
                                              NSString *fpToken = [[NSUserDefaults standardUserDefaults] valueForKey:FP_TOKEN];
                                              NSDictionary *data = @{ @"successFlag":@true,
                                                                      @"fpToken":fpToken,
                                                                      @"tryAgain":@false,
                                                                      @"useMPIN":@false,
                                                                      @"noFP":@false,
                                                                      @"message":@"Authentication Successful"};
                                              
                                              //Close popup that is open
                                              //Publish event to Widget
                                              [Backbase publishEvent:@"fp.auth.result" payload:data];
                                              
                                              NSLog(@"Finger print auth success: %@", data);
                                              /*UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Success"
                                               message:@"You are the device owner!"
                                               delegate:nil
                                               cancelButtonTitle:@"Ok"
                                               otherButtonTitles:nil];
                                               [alert show];*/
                                              
                                          } else {
                                              NSDictionary *data = @{ @"successFlag":@false,
                                                                      @"fpToken":@"",
                                                                      @"tryAgain":@true,
                                                                      @"useMPIN":@false,
                                                                      @"noFP":@false,
                                                                      @"message":@"Could not recognize your fingerprint. Try Again!"};
                                              
                                              //Close popup that is open
                                              //Publish event to Widget
                                              [Backbase publishEvent:@"fp.auth.result" payload:data];
                                              NSLog(@"Finger print auth failed: %@", data);
                                              
                                              /*UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error"
                                               message:@"You are not the device owner."
                                               delegate:nil
                                               cancelButtonTitle:@"Ok"
                                               otherButtonTitles:nil];
                                               [alert show];*/
                                          }
                                          
                                      }];
                    
                } else {
                    
                    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error"
                                                                    message:@"Your device cannot authenticate using TouchID."
                                                                   delegate:nil
                                                          cancelButtonTitle:@"Ok"
                                                          otherButtonTitles:nil];
                    [alert show];
                    NSLog(@"Finger print auth failed: %@", data);
                    
                }
            }
        
    }
}


-(NSString*)checkTouchIdCapability{
    LAContext *context = [[LAContext alloc] init];
    NSError *error = nil;
    
    if([context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]){
        return @"true";
    }else{
        if (error.code == kLAErrorTouchIDNotAvailable){
            //Touch id not avaialble on the device
            return @"no.touch.capability";
        } else if (error.code == kLAErrorTouchIDNotEnrolled){
            //Touch id is avaialble for user has not enrolled fingerprint
            return @"no.touch.id.enrolled";
        } else if (error.code == kLAErrorPasscodeNotSet){
            //Passcode is not set on the device
            return @"no.passcode.enrolled";
        }
    }
    return @"false";
}

-(NSString*)generateRandomKey{
    NSString *alphabet  = @"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXZY0123456789";
    NSMutableString *s = [NSMutableString stringWithCapacity:20];
    for (NSUInteger i = 0; i < 70; i++) {
        u_int32_t r = arc4random() % [alphabet length];
        unichar c = [alphabet characterAtIndex:r];
        [s appendFormat:@"%C", c];
    }
    NSLog(@"%@", s);
    NSString *key = s;
    return key;
}
@end

