//
//  SMSPlugin.m
//  IDFC UAT
//
//  Created by Taral Soni on 24/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import "SMSPlugin.h"

@implementation SMSPlugin
@synthesize globalCallbackId;

-(void)checkSMSReadPermission:(NSString *)callbackId{
    self.globalCallbackId = callbackId;
    NSDictionary *result = @{ @"successFlag":@"false"};
    [self success:result callbackId:globalCallbackId];
}

@end
