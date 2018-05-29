//
//  SMSPlugin.h
//  IDFC UAT
//
//  Created by Taral Soni on 24/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol SMSPluginProtocol <Plugin>

-(void)checkSMSReadPermission:(NSString *)callbackId;

@end

@interface SMSPlugin : Plugin <SMSPluginProtocol>

@property (strong,nonatomic) NSString *globalCallbackId;

@end
