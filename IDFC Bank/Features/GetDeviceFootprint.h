//
//  splash.h
//
//
//  Created by Taral Soni on 09/02/16.
//
//



#import <Foundation/Foundation.h>
#import "WebService_API.h"
#import "constant.h"
#import "SystemServices.h"
#import "Reachability.h"

#import <UIKit/UIKit.h>
#include <sys/sysctl.h>
#import <CoreTelephony/CTTelephonyNetworkInfo.h>
#import <CoreTelephony/CTCarrier.h>
#import <CoreLocation/CoreLocation.h>
#import <CoreLocation/CoreLocation.h>
#include <ifaddrs.h>
#include <arpa/inet.h>
#import <SystemConfiguration/CaptiveNetwork.h>


@interface GetDeviceFootprint : NSObject

@property(atomic, strong) CLLocationManager *locationManager;

-(NSData*)splashAPI_Body_JSON;
+(NSString*)getDeviceId;
-(NSString *) userPreference_Body_JSON;

@end

