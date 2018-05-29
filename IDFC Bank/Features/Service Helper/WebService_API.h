//
//  commonUtility.h
//
//
//  Created by Taral Soni on 08/02/16.
//
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#include <sys/sysctl.h>
#import <CoreTelephony/CTTelephonyNetworkInfo.h>
#import <CoreTelephony/CTCarrier.h>
#import <CoreLocation/CoreLocation.h>
#import <CoreLocation/CoreLocation.h>
#include <ifaddrs.h>
#include <arpa/inet.h>


@interface WebService_API : NSObject

@property(atomic, strong)NSString *deviceToken;
@property(atomic, strong) CLLocationManager *locationManager;

-(NSDictionary*) getDeviceFootprintAll;

+(void) getResponseFromServerServiceName:(NSString*)ServiceName
                           serviceHeader:(NSMutableDictionary *)requestHeaderDict
                             serviceData:(NSData *)requestData
                       completionHandler:(void(^)(NSError *err, NSData *data))handler;

+(NSDictionary *) getResponseFromServerServiceName:(NSString*)ServiceName
                                       serviceData:(NSData *)requestData;
+(BOOL) checkConnectivity;
+(NSDictionary *) getResponseFromServerServiceNameFormPost:(NSString*)ServiceName
                                           serviceData:(NSString *)msgHeader
                                      notificationFlag:(NSString*)notificationFlag
                                     notificationToken:(NSString*)notificationToken
                                        smsReadingFlag:(NSString*)smsReadingFlag
                                           bioAuthFlag:(NSString*)bioAuthFlag
                                          bioAuthToken:(NSString*)bioAuthToken;


@end

