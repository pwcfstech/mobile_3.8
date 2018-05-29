//
//  fingerPrintPlugin.h
//  IDFC UAT
//
//  Created by Taral Soni on 24/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "FingerprintPopups.h"
#import "GlobalVariables.h"

@protocol fingerPrintPluginProtocol <Plugin>

-(void)checkFingerprintCapability:(NSString *)callbackId;
-(void)setupFingerPrint:(NSString *)callbackId;
-(void)authenticateUser:(NSString*)callbackId;

@end


@interface fingerPrintPlugin : Plugin <fingerPrintPluginProtocol>{
    FingerprintPopups *fingerPrintPopup;
}

@property (strong,nonatomic) NSString *globalCallbackId;

@end

