//
//  mVisaQrReader.h
//  IDFC UAT
//
//  Created by Taral Soni on 28/02/17.
//  Copyright © 2017 IDFC Bank. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "GlobalVariables.h"
#import <AVFoundation/AVFoundation.h>
#import <QuartzCore/QuartzCore.h>

@interface mVisaQrReader : UIViewController

- (void)showInView:(UIView *)aView animated:(BOOL)animated;
-(void)showError:(NSString*)errorMessage;
- (void)hideQrScanner;
@property (strong, nonatomic) IBOutlet UILabel *lblErrorMsg;
@property (strong, nonatomic) IBOutlet UIView *errorContainer;
@property (strong, nonatomic) IBOutlet UIView *payWithEntryContainer;
@property (strong, nonatomic) IBOutlet UIButton *btnPayeeKey;
@property (strong, nonatomic) IBOutlet UIButton *btnTryAgain;
@property (strong, nonatomic) GlobalVariables *globalVariableObject;
@property (nonatomic) AVAuthorizationStatus authStatus;
- (IBAction)goToPayeeKeyEntry:(id)sender;
- (IBAction)tryAgain:(id)sender;

@property (strong, nonatomic) IBOutlet UIView *cameraPermissionView;
@property (strong, nonatomic) IBOutlet UILabel *camErrMsg;
@property (strong, nonatomic) IBOutlet UIButton *btnCamGrantAccess;
@property (strong, nonatomic) IBOutlet UIButton *btnCamPayeeKey;
- (IBAction)btnCamGrantAccessAction:(id)sender;

@end
