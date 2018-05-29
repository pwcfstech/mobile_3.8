	//
//  GlobalVariables.m
//  IDFC UAT
//
//  Created by Taral Soni on 21/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import "GlobalVariables.h"
#import "constant.h"
#import "GetDeviceFootprint.h"

@implementation GlobalVariables

@synthesize globalCallBackId;

-(void)initializeGlobalVariable{
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:MARKETING_FLAG];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:SETUP_MPIN_FLAG];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:LOGIN_TYPE];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:APP_VERSION_VIEW_FLAG];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:FP_KEY_FOR_TOKEN];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:FP_TOKEN];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:FP_SETUP_FLAG];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:APP_VERSION_STATUS];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:NEW_VERSION_DESCRIPTION];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:ACTIVE_VERSION_NO];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:GRACE_PERIOD];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:VERSION_UPGRADE_MESSAGE];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:APP_DOWNLOAD_LINK];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:IS_BLACK_LISTED];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:BLACKLIST_MESSAGE];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:DEVICE_ID];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:FIRST_PAGE];
    
    /*Mobile 2.5*/
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:ASSET_FLAG];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:HS_FLAG];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:ASSET_LANDING_PAGE];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:ASSET_TYPE];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:APPLY_NOW_TYPE];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:TOUCH3D_VALUE];
    /*Mobile 2.5 end*/
}

/*Mobile 2.5, setting asset or liability flag*/
-(void)setAssetFlag: (NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:ASSET_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}

-(void)setLoanTypeFlag:(NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:ASSET_LANDING_PAGE];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
    
}
-(void)setLoanAvailFlag:(NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:ASSET_TYPE];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}
    
-(void)setHSFlag:(NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:HS_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}

-(void)getSRrequest:(NSString*) callbackId{
    self.globalCallBackId = callbackId;
    NSString *userPrefValue = [[NSUserDefaults standardUserDefaults] valueForKey:APPLY_NOW_TYPE];
    NSDictionary *result = @{ @"sidebarClickFlag":userPrefValue};
    [self success:result callbackId:globalCallBackId];
}

-(void)getAssetFlag:(NSString*) callbackId{
    self.globalCallBackId = callbackId;
    NSString *assetFlag = [[NSUserDefaults standardUserDefaults] valueForKey:ASSET_FLAG];
    NSDictionary *result = @{ @"assetFlag":assetFlag};
    [self success:result callbackId:globalCallBackId];
}

-(void)getLoanTypeFlag:(NSString*) callbackId{
    self.globalCallBackId = callbackId;
    NSString *loanTypeFlag = [[NSUserDefaults standardUserDefaults] valueForKey:ASSET_LANDING_PAGE];
    NSDictionary *result = @{ @"loanTypeFlag":loanTypeFlag};
    [self success:result callbackId:globalCallBackId];
}

/*Mobile 2.5 end*/


-(NSString*)getAssetFlagLocally{
    return [[NSUserDefaults standardUserDefaults] valueForKey:ASSET_FLAG];
}


-(void)setMarketingFlag: (NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:MARKETING_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}

-(void)setMpinFlag:(NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:SETUP_MPIN_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}

//ADded to invoke on later
-(void)setFingerPrintSetupJS:(NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:FP_SETUP_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}

-(void)setLoginType:(NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:LOGIN_TYPE];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}

-(void)setNavigateToProfile:(NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:@"navigateToProfile"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}

-(void)getNavigateToProfile:(NSString*) callbackId{
    self.globalCallBackId = callbackId;
    NSString *navigateToProfileFlag = [[NSUserDefaults standardUserDefaults] valueForKey:@"navigateToProfile"];
    NSDictionary *result = @{ @"navigateToProfile":navigateToProfileFlag};
    [self success:result callbackId:globalCallBackId];
}

-(void)setAppVersionViewed:(NSString*) callbackId :(NSString*)flagValue{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flagValue forKey:APP_VERSION_VIEW_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@true};
    [self success:result callbackId:globalCallBackId];
}

-(void)getMarketingFlag:(NSString*) callbackId{
    self.globalCallBackId = callbackId;
    NSString *userPrefValue = [[NSUserDefaults standardUserDefaults] valueForKey:MARKETING_FLAG];
    NSDictionary *result = @{ @"marketingFlag":userPrefValue};
    [self success:result callbackId:globalCallBackId];
}

-(void)getFingerPrintSetup:(NSString*) callbackId{
    self.globalCallBackId = callbackId;
    NSString *userPrefValue = [[NSUserDefaults standardUserDefaults] valueForKey:FP_SETUP_FLAG];
    NSDictionary *result = @{ @"fingerPrintSetup":userPrefValue};
    [self success:result callbackId:globalCallBackId];
}

-(void)getMarketingDecider:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
    NSString *marketingFlag = [[NSUserDefaults standardUserDefaults] valueForKey:MARKETING_FLAG];
    if (marketingFlag==nil || marketingFlag==NULL || [marketingFlag isKindOfClass:[NSNull class]]){
            marketingFlag=@"false";
    
        }
    NSString *appVersionStatus = [[NSUserDefaults standardUserDefaults] valueForKey:APP_VERSION_STATUS];
    NSString *isBlackListed = [[NSUserDefaults standardUserDefaults] valueForKey:IS_BLACK_LISTED];
    NSString *mpinFlag = [[NSUserDefaults standardUserDefaults] valueForKey:SETUP_MPIN_FLAG];
    if (mpinFlag==nil || mpinFlag==NULL || [mpinFlag isKindOfClass:[NSNull class]]){
        mpinFlag=@"false";
        
    }
    NSString *blacklistMessage = [[NSUserDefaults standardUserDefaults] valueForKey:BLACKLIST_MESSAGE];
    
    NSDictionary *result = @{
        @"marketingFlag":marketingFlag,
        @"appVersionStatus" : appVersionStatus,
        @"isBlackListed" :isBlackListed,
        @"mpinFlag" : mpinFlag,
        @"blacklistMessage": blacklistMessage
    };
    [self success:result callbackId:globalCallBackId];
}

-(void)getDeviceFootPrintHeader:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
   
    //NSString *deviceId = [[NSUserDefaults standardUserDefaults] valueForKey:DEVICE_ID];
    //NSString *deviceId = [GetDeviceFootprint getDeviceId];
    NSString *deviceId = [[NSUserDefaults standardUserDefaults] valueForKey:DEVICE_ID];//Change for De-Linking of DeviceId
    NSString *channel = @"M";
    NSString *ipAddress = @"122.122.12.122";
    NSString *timeZone = @"Mumbai/India";
    NSString *nwProvider = @"Vodafone";
    NSString *connectionMode = @"Wifi";
    NSString *geoLatitude = @"43.773663";
    NSString *geoLongitude = @"34.28873";
    
    NSDictionary *result = @{
        @"deviceId":deviceId,
        @"channel" : channel,
        @"ipAddress" :ipAddress,
        @"timeZone" : timeZone,
        @"nwProvider": nwProvider,
        @"connectionMode" : connectionMode,
        @"geoLatitude" : geoLatitude,
        @"geoLongitude" : geoLongitude
    };
    [self success:result callbackId:globalCallBackId];
}

-(void)getAppVersionData:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
    NSString *appVersionId = @"2.0";
    NSString *versionDescription = [[NSUserDefaults standardUserDefaults] valueForKey:NEW_VERSION_DESCRIPTION];
    NSString *activeVersionNo = [[NSUserDefaults standardUserDefaults] valueForKey:ACTIVE_VERSION_NO];
    NSString *gracePeriod = [[NSUserDefaults standardUserDefaults] valueForKey:GRACE_PERIOD];
    NSString *appUpgradeMessage = [[NSUserDefaults standardUserDefaults] valueForKey:VERSION_UPGRADE_MESSAGE];
    NSString *appVersionStatus = [[NSUserDefaults standardUserDefaults] valueForKey:APP_VERSION_STATUS];
    NSString *appDownloadLink = [[NSUserDefaults standardUserDefaults] valueForKey:APP_DOWNLOAD_LINK];
    
    NSDictionary *result = @{
        @"appVersionId":appVersionId,
        @"versionDescription" : versionDescription,
        @"activeVersionNo" :activeVersionNo,
        @"gracePeriod" : gracePeriod,
        @"appUpgradeMessage": appUpgradeMessage,
        @"appVersionStatus" : appVersionStatus,
        @"appDownloadLink" : appDownloadLink
    };
    [self success:result callbackId:globalCallBackId];
}

-(void)getMpinFlag:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
    NSString *mpinFlag = [[NSUserDefaults standardUserDefaults] valueForKey:SETUP_MPIN_FLAG];
    if (mpinFlag==nil || mpinFlag==NULL || [mpinFlag isKindOfClass:[NSNull class]]){
        mpinFlag=@"false";
        
    }
    NSDictionary *result = @{ @"mpinFlag":mpinFlag};
    [self success:result callbackId:globalCallBackId];
}


-(void)getLoginType:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
    NSString *mpinFlag = [[NSUserDefaults standardUserDefaults] valueForKey:LOGIN_TYPE];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"mpinFlag":mpinFlag};
    [self success:result callbackId:globalCallBackId];
}

-(void)resetDevice:(NSString*)callbackId{
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:SETUP_MPIN_FLAG];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:MARKETING_FLAG];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:FP_KEY_FOR_TOKEN];
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:FP_TOKEN];
}


-(void)setFpKeyForToken:(NSString*)tokenValue{
    [[NSUserDefaults standardUserDefaults] setValue:tokenValue forKey:FP_KEY_FOR_TOKEN];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setFpToken:(NSString*)tokenValue{
    [[NSUserDefaults standardUserDefaults] setValue:tokenValue forKey:FP_TOKEN];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setFingerPrintSetup :(NSString*)fingerPrintSetup{
    [[NSUserDefaults standardUserDefaults] setValue:fingerPrintSetup forKey:FP_SETUP_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setAppVersionStatus :(NSString*)appVersionStatus{
    [[NSUserDefaults standardUserDefaults] setValue:appVersionStatus forKey:APP_VERSION_STATUS];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setNewVersionDescription :(NSString*)newVersionDescription{
    [[NSUserDefaults standardUserDefaults] setValue:newVersionDescription forKey:NEW_VERSION_DESCRIPTION];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setActiveVersionNo :(NSString*)setActiveVersionNo{
    [[NSUserDefaults standardUserDefaults] setValue:setActiveVersionNo forKey:ACTIVE_VERSION_NO];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setGracePeriod:(NSString*)gracePeriod{
    [[NSUserDefaults standardUserDefaults] setValue:gracePeriod forKey:GRACE_PERIOD];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setAppUpgradeMessage :(NSString*)upgradeMessage{
    [[NSUserDefaults standardUserDefaults] setValue:upgradeMessage forKey:VERSION_UPGRADE_MESSAGE];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setAppDownloadLink :(NSString*)appDownloadLink{
    [[NSUserDefaults standardUserDefaults] setValue:appDownloadLink forKey:APP_DOWNLOAD_LINK];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setDeviceBlacklistFlag:(NSString*)deviceBlacklistFlag{
    [[NSUserDefaults standardUserDefaults] setValue:deviceBlacklistFlag forKey:IS_BLACK_LISTED];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setBlacklistMessage:(NSString*)blacklistMessage{
    [[NSUserDefaults standardUserDefaults] setValue:blacklistMessage forKey:BLACKLIST_MESSAGE];
    [[NSUserDefaults standardUserDefaults] synchronize];
}
-(void)setDeviceId:(NSString*)deviceId{
    [[NSUserDefaults standardUserDefaults] setValue:deviceId forKey:DEVICE_ID];
    [[NSUserDefaults standardUserDefaults] synchronize];
}


-(NSString*)getFpKeyForToken{
    return [[NSUserDefaults standardUserDefaults] valueForKey:FP_KEY_FOR_TOKEN];
}
-(NSString*)getFpToken{
    return [[NSUserDefaults standardUserDefaults] valueForKey:FP_TOKEN];
}
-(NSString*)getLoginType{
    return [[NSUserDefaults standardUserDefaults] valueForKey:LOGIN_TYPE];
}
-(NSString*)getMpinSetup{
    return [[NSUserDefaults standardUserDefaults] valueForKey:SETUP_MPIN_FLAG];
}
-(NSString*)getMarketingFlag{
    return [[NSUserDefaults standardUserDefaults] valueForKey:MARKETING_FLAG];
}
-(NSString*)getFingerPrintSetup{
    return [[NSUserDefaults standardUserDefaults] valueForKey:FP_SETUP_FLAG];
}
-(NSString*)getAppVersionStatus{
    return [[NSUserDefaults standardUserDefaults] valueForKey:APP_VERSION_STATUS];
}
-(NSString*)getNewVersionDescription{
    return [[NSUserDefaults standardUserDefaults] valueForKey:NEW_VERSION_DESCRIPTION];
}
-(NSString*)getActiveVersionNo{
    return [[NSUserDefaults standardUserDefaults] valueForKey:ACTIVE_VERSION_NO];
}
-(NSString*)getGracePeriod{
    return [[NSUserDefaults standardUserDefaults] valueForKey:GRACE_PERIOD];
}
-(NSString*)getAppUpgradeMessage{
    return [[NSUserDefaults standardUserDefaults] valueForKey:VERSION_UPGRADE_MESSAGE];
}
-(NSString*)getAppDownloadLink{
    return [[NSUserDefaults standardUserDefaults] valueForKey:APP_DOWNLOAD_LINK];
}
-(NSString*)getDeviceBlacklistFlag{
    return [[NSUserDefaults standardUserDefaults] valueForKey:IS_BLACK_LISTED];
}
-(NSString*)getBlacklistMessage{
    return [[NSUserDefaults standardUserDefaults] valueForKey:BLACKLIST_MESSAGE];
}
-(NSString*)getDeviceId{
    return [[NSUserDefaults standardUserDefaults] valueForKey:DEVICE_ID];
}

-(void)getFCMNotificationToken:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
    NSString *notificationToken = [[NSUserDefaults standardUserDefaults] valueForKey:PUSH_NOTIFICATION_TOKEN];
    if (notificationToken==nil || notificationToken==NULL || [notificationToken isKindOfClass:[NSNull class]]){
        notificationToken=@"";
    }
    NSDictionary *result = @{ @"notificationToken":notificationToken};
    [self success:result callbackId:globalCallBackId];
}

#pragma mark - mVisa
-(void)setMVisaJsonInternal:(NSString*)parsedJson{
    [[NSUserDefaults standardUserDefaults] setValue:parsedJson forKey:MVISA_QR_JSON];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

-(void)setMVisaJson:(NSString*) callbackId :(NSString*)parsedJson{
    [[NSUserDefaults standardUserDefaults] setValue:parsedJson forKey:MVISA_QR_JSON];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

-(void)getMVisaJson:(NSString*) callbackId{
    self.globalCallBackId = callbackId;
    NSString *qrJson = [[NSUserDefaults standardUserDefaults] valueForKey:MVISA_QR_JSON];
    NSDictionary *result = @{ @"mVisaJsonString":qrJson};
    [self success:result callbackId:globalCallBackId];
}

-(void)clearMVisaJson:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:MVISA_QR_JSON];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@"true"};
    [self success:result callbackId:globalCallBackId];
}

-(void)setMVisaLoginFlag :(NSString*) callbackId :(NSString*)flag{
    NSLog(@"Set MVisa login flag: %@",flag);
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flag forKey:MVISA_LOGIN_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@"true"};
    [self success:result callbackId:globalCallBackId];
}

-(void)getMVisaLoginFlag:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
    NSString *mVisaFlag = [[NSUserDefaults standardUserDefaults] valueForKey:MVISA_LOGIN_FLAG];
    NSLog(@"MVISA login flag from preference: %@",mVisaFlag);
    NSDictionary *result = @{ @"mVisaFlag":mVisaFlag};
    [self success:result callbackId:globalCallBackId];
}

-(void)clearMVisaLoginFlag :(NSString*)callbackId :(NSString*)flag{
    NSLog(@"clearMVisaLoginFlag called: %@", flag);
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:MVISA_LOGIN_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@"true"};
    [self success:result callbackId:globalCallBackId];
}

-(void)setScanAndPayFlag:(NSString*)callbackId :(NSString*)flag{
    NSLog(@"setScanAndPayFlag called: %@", flag);
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:flag forKey:MVISA_SCAN_N_PAY_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@"true"};
    [self success:result callbackId:globalCallBackId];
}

-(void)getScanAndPayFlag:(NSString*)callbackId{
    self.globalCallBackId = callbackId;
    NSString *flag =[[NSUserDefaults standardUserDefaults] valueForKey:MVISA_SCAN_N_PAY_FLAG];
    NSLog(@"Scan and Pay Flag: %@", flag);
    NSDictionary *result = @{@"scanAndPay":flag};
    [self success:result callbackId:globalCallBackId];
}

-(void)clearScanAndPayFlag :(NSString*)callbackId :(NSString*)flag{
    NSLog(@"clearScanAndPayFlag called: %@", flag);
    self.globalCallBackId = callbackId;
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:MVISA_SCAN_N_PAY_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
    NSDictionary *result = @{ @"successFlag":@"true"};
    [self success:result callbackId:globalCallBackId];
}

-(void)clearScanAndPayFlagLocally{
    NSLog(@"clearScanAndPayFlagLocally called");
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:MVISA_SCAN_N_PAY_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

-(void)clearMVisaLoginFlagLocally{
    NSLog(@"clearMVisaLoginFlagLocally called");
    [[NSUserDefaults standardUserDefaults] setValue:@"" forKey:MVISA_LOGIN_FLAG];
    [[NSUserDefaults standardUserDefaults] synchronize];
}





@end
