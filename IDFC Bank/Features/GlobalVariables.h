//
//  GlobalVariables.h
//  IDFC UAT
//
//  Created by Taral Soni on 21/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import <Backbase/Backbase.h>

@protocol GlobalVariableProtocol <Plugin>

-(void)setMarketingFlag: (NSString*) callbackId :(NSString*)flagValue;
-(void)setMpinFlag:(NSString*) callbackId :(NSString*)flagValue;
//Added for later
-(void)setLoginType:(NSString*) callbackId :(NSString*)flagValue;
-(void)setNavigateToProfile:(NSString*) callbackId :(NSString*)flagValue;
-(void)getNavigateToProfile:(NSString*) callbackId;
-(void)setFingerPrintSetupJS:(NSString*) callbackId :(NSString*)flagValue;
-(void)setAppVersionViewed:(NSString*) callbackId :(NSString*)flagValue;
-(void)getMarketingFlag:(NSString*) callbackId;
-(void)getMarketingDecider:(NSString*)callbackId;
-(void)getDeviceFootPrintHeader:(NSString*)callbackId;
-(void)getAppVersionData:(NSString*)callbackId;
-(void)getFingerPrintSetup:(NSString*)callbackId;
-(void)getMpinFlag:(NSString*)callbackId;
-(void)resetDevice:(NSString*)callbackId;
-(void)getFCMNotificationToken:(NSString*)callbackId;
-(void)setAssetFlag:(NSString*) callbackId :(NSString*)flagValue;
-(void)setLoanTypeFlag:(NSString*) callbackId :(NSString*)flagValue;
-(void)setLoanAvailFlag:(NSString*) callbackId :(NSString*)flagValue;
-(void)getSRrequest:(NSString*) callbackId;
-(void)getLoginType:(NSString*) callbackId;
-(void)getAssetFlag:(NSString*) callbackId;
-(void)getLoanTypeFlag:(NSString*) callbackId;
-(void)setHSFlag:(NSString*) callbackId :(NSString*)flagValue;

#pragma mark - mVisa
-(void)setMVisaJson:(NSString*)callbackId :(NSString*)parsedJson;
-(void)setMVisaJsonInternal:(NSString*)parsedJson;
-(void)getMVisaJson:(NSString*) callbackId;
-(void)clearMVisaJson:(NSString*)callbackId;
-(void)setMVisaLoginFlag :(NSString*) callbackId :(NSString*)flag;
-(void)getMVisaLoginFlag:(NSString*)callbackId;
-(void)clearMVisaLoginFlag :(NSString*)callbackId :(NSString*)flag;
-(void)setScanAndPayFlag:(NSString*)callbackId :(NSString*)flag;
-(void)getScanAndPayFlag:(NSString*)callbackId;
-(void)clearScanAndPayFlag :(NSString*)callbackId :(NSString*)flag;
-(void)clearScanAndPayFlagLocally;
-(void)clearMVisaLoginFlagLocally;

@end

@interface GlobalVariables : Plugin <GlobalVariableProtocol>

@property (strong, nonatomic) NSString *globalCallBackId;

-(void)setFpKeyForToken:(NSString*)tokenValue;
-(void)setFpToken:(NSString*)tokenValue;
-(void)setFingerPrintSetup :(NSString*)fingerPrintSetup;
-(void)setAppVersionStatus :(NSString*)appVersionStatus;
-(void)setNewVersionDescription :(NSString*)newVersionDescription;
-(void)setActiveVersionNo :(NSString*)setActiveVersionNo;
-(void)setGracePeriod:(NSString*)gracePeriod;
-(void)setAppUpgradeMessage :(NSString*)upgradeMessage;
-(void)setAppDownloadLink :(NSString*)appDownloadLink;
-(void)setDeviceBlacklistFlag:(NSString*)deviceBlacklistFlag;
-(void)setBlacklistMessage:(NSString*)BlacklistMessage;
-(void)setDeviceId:(NSString*)deviceId;


-(NSString*)getFpKeyForToken;
-(NSString*)getFpToken;
-(NSString*)getLoginType;
-(NSString*)getMpinSetup;
-(NSString*)getMarketingFlag;
-(NSString*)getFingerPrintSetup;
-(NSString*)getAppVersionStatus;
-(NSString*)getNewVersionDescription;
-(NSString*)getActiveVersionNo;
-(NSString*)getGracePeriod;
-(NSString*)getAppUpgradeMessage;
-(NSString*)getAppDownloadLink;
-(NSString*)getDeviceBlacklistFlag;
-(NSString*)getBlacklistMessage;
-(NSString*)getDeviceId;






@end
