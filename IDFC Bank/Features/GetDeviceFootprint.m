//
//  splash.m
//
//
//  Created by Taral Soni on 09/02/16.
//
//

#import "GetDeviceFootprint.h"
#import "WebService_API.h"
#import "SystemServices.h"
#import "GetDeviceUID.h"
#import "constant.h"
#import "ClusterPrePermissions.h"


#define SystemSharedServices [SystemServices sharedServices]
Boolean *locationPermissionFlag = false;


@implementation GetDeviceFootprint

@synthesize locationManager;


-(NSData *) splashAPI_Body_JSON
{
    /*ClusterPrePermissions *permission = [ClusterPrePermissions sharedPermissions];
    [permission showLocationPermissionsWithTitle:@"Let IDFC Bank access location?"
                                         message:@"This lets us identify location from where we get maximum request and accordingly create our branches there"
                                 denyButtonTitle:@"Not Now"
                                grantButtonTitle:@"Allow"
                               completionHandler:^(BOOL hasPermission,
                                                   ClusterDialogResult userDialogResult,
                                                   ClusterDialogResult systemDialogResult){
                                   if(hasPermission){
                                       //Enable location manager
                                       [self enableLocationManager];
                                       locationPermissionFlag = true;
                                   } else {
                                       locationPermissionFlag = false;
                                   }
                               }];*/
    
    UIDevice *device = [UIDevice currentDevice];
    
    //Checking whether shared preference has device id or not
    NSString *deviceId = [[NSUserDefaults standardUserDefaults] stringForKey:DEVICE_ID];
    NSLog(@"Device ID from preference: %@",deviceId);
    if((deviceId == NULL) || [deviceId isEqualToString:@""]){
        deviceId = [self getDeviceIdInternal];
        NSLog(@"Device ID from new: %@",deviceId);
        [[NSUserDefaults standardUserDefaults] setValue:deviceId forKey:DEVICE_ID];
    }
    NSString *DeviceName = [NSString stringWithFormat:@"%@", [SystemSharedServices deviceName]];
    BOOL dualSim = NO;
    NSString *activeSIM =@"Not allowed";
    
    NSString *nwProviderLine1 = [NSString stringWithFormat:@"%@",[SystemSharedServices carrierName]];
    if([nwProviderLine1 isEqualToString:@"(null)"])
    nwProviderLine1 = @"Not available";
    NSString *nwProviderLine2 = @"N/A";
    NSString *networkTypeLine1 = [self getNetworkType];
    NSString *networkTypeLine2 = @"N/A";
    
    NSString *phoneNoLine1 =@"Not allowed";
    NSString *phoneNoLine2 = @"N/A";
    NSString *osName = @"iOS";
    NSString *osVersion = [NSString stringWithFormat:@"%@", [SystemSharedServices systemsVersion]];
    
    NSString *touchIdStatus = @"false";
    NSString *deviceModelNo = [NSString stringWithFormat:@"%@", [SystemSharedServices deviceModel]];
    NSString *deviceManufacturer = @"Apple";
    NSString *batteryLevel = [NSString stringWithFormat:@"%f", [SystemSharedServices batteryLevel]];
    
    NSString *language = [NSString stringWithFormat:@"%@", [SystemSharedServices language]];
    NSString *country = [NSString stringWithFormat:@"%@", [SystemSharedServices country]];
    BOOL multitaskingSupport = false;
    if ([device respondsToSelector:@selector(isMultitaskingSupported)])
    multitaskingSupport = device.multitaskingSupported;
    BOOL proximityMonitoringEnabled = [[UIDevice currentDevice] proximityState];
    
    NSString * timeZone= [NSString stringWithFormat:@"%@", [SystemSharedServices timeZoneSS]];
    
    NSString * geoLatitude = [[NSString alloc]init];
    NSString * geoLongitude = [[NSString alloc]init];
    
    if(locationPermissionFlag){
        geoLatitude = [NSString stringWithFormat:@"%f",locationManager.location.coordinate.latitude];
        geoLongitude = [NSString stringWithFormat:@"%f",locationManager.location.coordinate.longitude];
    }else{
        geoLatitude= @"No Permission";
        geoLongitude = @"No Permission";
    }
    
    
    NSString * ipAddress = [NSString stringWithFormat:@"%@",[SystemSharedServices currentIPAddress]];
    if([ipAddress isEqualToString:@"(null)"])
    ipAddress = @"";
    
    NSString * connectionMode = [self getNetworkType];
    BOOL jailBrokenRooted = NO;
    NSString *filePath = @"/Applications/Cydia.app";
    if ([[NSFileManager defaultManager] fileExistsAtPath:filePath])
    jailBrokenRooted = YES;
    NSString * emailId = @"Not allowed";
    
    NSString *wifiStationName = @"Not allowed";
    NSString * wifiBBSID = [self currentWifiSSID];
    NSString *wifiSignalStrength = @"Not allowed";
    NSString *cellTowerID = @"Not allowed";
    
    NSString *locationAreaCode = @"Not allowed";
    NSString *mcc = @"Not allowed";
    NSString *mnc = @"Not allowed";
    NSString *GSMsignalStrength = @"Not allowed";
    
    NSString *appVersionId = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
    BOOL notificationPermissionFlag = NO;
    NSString *notificationTokenId =@"";
    NSString *smsReadFlag = false;
    
    
    NSMutableDictionary *requestBodyDict= [[NSMutableDictionary alloc] init];
    [requestBodyDict setValue:deviceId forKey:@"deviceId"];
    [requestBodyDict setValue:DeviceName forKey:@"deviceName"];
    [requestBodyDict setValue:[NSNumber numberWithBool:dualSim] forKey:@"dualSim"];
    [requestBodyDict setValue:activeSIM forKey:@"activeSIM"];
    
    [requestBodyDict setValue:nwProviderLine1 forKey:@"nwProviderLine1"];
    [requestBodyDict setValue:nwProviderLine2 forKey:@"nwProviderLine2"];
    [requestBodyDict setValue:networkTypeLine1 forKey:@"networkTypeLine1"];
    [requestBodyDict setValue:networkTypeLine2 forKey:@"networkTypeLine2"];
    
    [requestBodyDict setValue:phoneNoLine1 forKey:@"phoneNoLine1"];
    [requestBodyDict setValue:phoneNoLine2 forKey:@"phoneNoLine2"];
    
    [requestBodyDict setValue:osName forKey:@"osName"];
    [requestBodyDict setValue:osVersion forKey:@"osVersion"];
    [requestBodyDict setValue:touchIdStatus  forKey:@"touchIdStatus"];
    [requestBodyDict setValue:deviceModelNo forKey:@"deviceModelNo"];
    
    [requestBodyDict setValue:deviceManufacturer forKey:@"deviceManufacturer"];
    [requestBodyDict setValue:batteryLevel forKey:@"batteryLevel"];
    [requestBodyDict setValue:language forKey:@"language"];
    [requestBodyDict setValue:country forKey:@"country"];
    
    [requestBodyDict setValue:[NSNumber numberWithBool:multitaskingSupport] forKey:@"multitaskingSupport"];
    [requestBodyDict setValue:[NSNumber numberWithBool:proximityMonitoringEnabled] forKey:@"proximityMonitoringEnabled"];
    [requestBodyDict setValue:timeZone forKey:@"timeZone"];//
    [requestBodyDict setValue:geoLatitude forKey:@"geoLatitude"];
    
    [requestBodyDict setValue:geoLongitude forKey:@"geoLongitude"];
    [requestBodyDict setValue:ipAddress forKey:@"ipAddress"];
    [requestBodyDict setValue:connectionMode forKey:@"connectionMode"];
    [requestBodyDict setValue:[NSNumber numberWithBool:jailBrokenRooted] forKey:@"jailBrokenRooted"];
    [requestBodyDict setValue:emailId forKey:@"emailId"];
    
    
    [requestBodyDict setValue:wifiStationName forKey:@"wifiStationName"];
    [requestBodyDict setValue:wifiBBSID forKey:@"wifiBBSID"];
    [requestBodyDict setValue:wifiSignalStrength forKey:@"wifiSignalStrength"];
    [requestBodyDict setValue:cellTowerID forKey:@"cellTowerID"];
    
    [requestBodyDict setValue:locationAreaCode forKey:@"locationAreaCode"];
    [requestBodyDict setValue:mcc forKey:@"mcc"];
    [requestBodyDict setValue:mnc forKey:@"mnc"];
    [requestBodyDict setValue:GSMsignalStrength forKey:@"GSMsignalStrength"];
    
    [requestBodyDict setValue:appVersionId forKey:@"appVersionId"];
    [requestBodyDict setValue:[NSNumber numberWithBool:notificationPermissionFlag] forKey:@"notificationPermissionFlag"];
    [requestBodyDict setValue:notificationTokenId forKey:@"notificationTokenId"];
    [requestBodyDict setValue:smsReadFlag forKey:@"smsReadFlag"];
    
    
    /** Mobile 3.0 **/
    /** Changes made to show marketing screens when user upgrades application **/
    NSString *lastAppVersion = [[NSUserDefaults standardUserDefaults] valueForKey:LAST_APP_VERSION];
    
    if(lastAppVersion == nil){
        [[NSUserDefaults standardUserDefaults] setValue:appVersionId forKey:LAST_APP_VERSION];
        [[NSUserDefaults standardUserDefaults] setValue:@"true" forKey:SHOW_MARKETING_FLAG];
    }
    else if(![lastAppVersion isEqualToString:appVersionId]){
        [[NSUserDefaults standardUserDefaults] setValue:appVersionId forKey:LAST_APP_VERSION];
        [[NSUserDefaults standardUserDefaults] setValue:@"true" forKey:SHOW_MARKETING_FLAG];
    }
    else{
        [[NSUserDefaults standardUserDefaults] setValue:@"false" forKey:SHOW_MARKETING_FLAG];
    }
    
    
    
    /** Mobile 3.0 end **/
    
    NSLog(@"Device Footprint: %@",requestBodyDict);
    
    NSMutableDictionary *dataDict = [[NSMutableDictionary alloc]init];
    [dataDict setObject:requestBodyDict forKey:@"data"];
    
    NSError *bodyErr;
    NSData *requestBodyData = [NSJSONSerialization dataWithJSONObject:dataDict options:NSJSONWritingPrettyPrinted error:&bodyErr];
    NSString *str = [[NSString alloc] initWithData:requestBodyData encoding:NSUTF8StringEncoding];
    NSData *postBodyData = [str dataUsingEncoding:NSUTF8StringEncoding];
    return postBodyData;
}


- (NSString *)currentWifiSSID {
    // Does not work on the simulator.
    NSString *ssid = nil;
    NSArray *ifs = (__bridge_transfer id)CNCopySupportedInterfaces();
    for (NSString *ifnam in ifs) {
        NSDictionary *info = (__bridge_transfer id)CNCopyCurrentNetworkInfo((__bridge CFStringRef)ifnam);
        if (info[@"SSID"]) {
            ssid = info[@"SSID"];
        }
    }
    return ssid;
}

+(NSString*)getDeviceId{
    NSString *uid = [GetDeviceUID uid];
    return uid;
}

-(NSString*)getDeviceIdInternal{
    /*NSString *uid = [GetDeviceUID uid];
    return uid;*/
    
    NSString *uuid = [[NSUUID UUID]UUIDString];
    return uuid;
}



- (NSString *)getNetworkType
{
    Reachability *reachability = [Reachability reachabilityForInternetConnection];
    NSString*  networkTypeStr = [reachability currentReachabilityString];
    
    return networkTypeStr;
}

-(void)enableLocationManager{
    locationManager = [[CLLocationManager alloc] init];
    locationManager.distanceFilter = kCLDistanceFilterNone;
    locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters;
    [locationManager startUpdatingLocation];
    //[self.locationManager requestWhenInUseAuthorization];
}


-(NSString *) userPreference_Body_JSON
{
    NSMutableDictionary *msgHeaderDict= [[NSMutableDictionary alloc] init];
    
    NSString *deviceId = [[NSUserDefaults standardUserDefaults] stringForKey:DEVICE_ID];
    NSLog(@"Device ID from preference: %@",deviceId);
    if((deviceId == NULL) || [deviceId isEqualToString:@""]){
        deviceId = [self getDeviceIdInternal];
        NSLog(@"Device ID from new: %@",deviceId);
        [[NSUserDefaults standardUserDefaults] setValue:deviceId forKey:DEVICE_ID];
    }
    
    NSString *channel = @"Mobile";
    NSString *ipAddress = [NSString stringWithFormat:@"%@",[SystemSharedServices currentIPAddress]];
    NSString *timeZone = [NSString stringWithFormat:@"%@", [SystemSharedServices timeZoneSS]];
    
    NSString *nwProvider = [NSString stringWithFormat:@"%@",[SystemSharedServices carrierName]];
    if([nwProvider isEqualToString:@"null"])
        nwProvider = @"Not available";
    nwProvider = @"Airtel ";
    
    NSString *connectionMode = @"Wifi";
    NSString *geoLatitude = @"23.9938";
    NSString *geoLongitude =@"63.74885";
    
    [msgHeaderDict setValue:deviceId forKey:@"deviceId"];
    [msgHeaderDict setValue:channel forKey:@"channel"];
    [msgHeaderDict setValue:ipAddress forKey:@"ipAddress"];
    [msgHeaderDict setValue:timeZone forKey:@"timeZone"];
    [msgHeaderDict setValue:nwProvider forKey:@"nwProvider"];
    [msgHeaderDict setValue:connectionMode forKey:@"connectionMode"];
    [msgHeaderDict setValue:geoLatitude forKey:@"geoLatitude"];
    [msgHeaderDict setValue:geoLongitude forKey:@"geoLongitude"];
    
    BOOL notificationFlag = [[UIApplication sharedApplication] isRegisteredForRemoteNotifications];
    [[NSUserDefaults standardUserDefaults]setValue:[NSNumber numberWithBool:notificationFlag] forKey:PUSH_NOTIFICATION_FLAG];
    NSString *notificationToken = [[NSUserDefaults standardUserDefaults]valueForKey:PUSH_NOTIFICATION_TOKEN];
    BOOL smsReadingFlag = NO;
    NSString *bioAuthFlag = [[NSUserDefaults standardUserDefaults] valueForKey:FP_SETUP_FLAG];
    if([bioAuthFlag isKindOfClass:[NSNull class]] || bioAuthFlag == nil || bioAuthFlag == NULL){
        bioAuthFlag =@"";
    }
    NSString *bioAuthToken = [[NSUserDefaults standardUserDefaults]valueForKey:FP_TOKEN];
    if([bioAuthToken isKindOfClass:[NSNull class]] || bioAuthToken == nil || bioAuthToken == NULL){
        bioAuthToken =@"";
    }
    
    NSMutableDictionary *dataDict = [[NSMutableDictionary alloc]init];
    [dataDict setObject:msgHeaderDict forKey:@"msgHeader"];
    [dataDict setValue:[NSNumber numberWithBool:notificationFlag] forKey:@"notificationFlag"];
    [dataDict setValue:notificationToken forKey:@"notificationToken"];
    [dataDict setValue:[NSNumber numberWithBool:smsReadingFlag] forKey:@"smsReadingFlag"];
    [dataDict setValue:bioAuthFlag forKey:@"bioAuthFlag"];
    [dataDict setValue:bioAuthToken forKey:@"bioAuthToken"];
    
    
    
    NSError *bodyErr;
    /*NSData *requestBodyData = [NSJSONSerialization dataWithJSONObject:dataDict options:NSJSONWritingPrettyPrinted error:&bodyErr];
    NSString *str = [[NSString alloc] initWithData:requestBodyData encoding:NSUTF8StringEncoding];
    NSData *postBodyData = [str dataUsingEncoding:NSUTF8StringEncoding];
    return postBodyData;*/
    NSLog(@"--------- user preference message header ------- %@",msgHeaderDict);
    NSData *requestBodyData = [NSJSONSerialization dataWithJSONObject:msgHeaderDict options:NSJSONWritingPrettyPrinted error:&bodyErr];
    NSString *str = [[NSString alloc] initWithData:requestBodyData encoding:NSUTF8StringEncoding];
    NSData *postBodyData = [str dataUsingEncoding:NSUTF8StringEncoding];
    return str;
    
}




@end

