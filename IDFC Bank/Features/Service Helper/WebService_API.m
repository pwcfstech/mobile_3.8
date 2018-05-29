
#import "WebService_API.h"
#import "Reachability.h"
#import "constant.h"
#import <SystemConfiguration/SystemConfiguration.h>

@implementation WebService_API{
    CLLocationManager *locationManager;
    
}


@synthesize deviceToken;
@synthesize  locationManager;

-(NSDictionary*) getDeviceFootprintAll{
    NSDictionary *deviceFootprint = [[NSDictionary alloc]init];
    return deviceFootprint;
}

#pragma mark - API


+(void) getResponseFromServerServiceName:(NSString*)ServiceName
                           serviceHeader:(NSMutableDictionary *)requestHeaderDict
                             serviceData:(NSData *)requestData
                       completionHandler:(void(^)(NSError *err, NSData *data))handler{
    
    NSString *strurl=[NSString stringWithFormat:@"deviceFootPrint"];
    NSLog(@"~~~URL~~~ %@", strurl);
    NSString *strpostlength=[NSString stringWithFormat:@"%ld",(unsigned long)[requestData length]];
    
    NSMutableURLRequest *urlrequest= [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[strurl stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]]
                                                             cachePolicy:NSURLRequestReloadIgnoringLocalCacheData
                                                         timeoutInterval:60.0];
    [urlrequest setHTTPMethod:@"POST"];
    [urlrequest setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [urlrequest setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    [urlrequest setHTTPBody:requestData];
    
    [NSURLConnection sendAsynchronousRequest:urlrequest queue:[NSOperationQueue currentQueue] completionHandler:^(NSURLResponse *respone, NSData *data, NSError *err){
        
        if (err == nil) {
            handler(nil, data);
        }else
        handler(err, data);
        
    }];
}

+(NSDictionary *) getResponseFromServerServiceName:(NSString*)ServiceName
                                       serviceData:(NSData *)requestData{
    
    NSString *strurl = @"";
    if([ServiceName isEqualToString:@"deviceFootPrint"]){
        strurl = [NSString stringWithFormat:DEVICE_FOOTPRINT_URL];
    }else if([ServiceName isEqualToString:@"userPreference"]){
        strurl = [NSString stringWithFormat:UPDATE_USER_PREFERENCE_URL];
    }
    NSLog(@"~~~URL~~~ %@", strurl);
    
    NSString *strpostlength=[NSString stringWithFormat:@"%ld",(unsigned long)[requestData length]];
    
    // NSMutableURLRequest *urlrequest=[[NSMutableURLRequest alloc]init];
    
    NSMutableURLRequest *urlrequest= [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[strurl stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]]
                                                             cachePolicy:NSURLRequestReloadIgnoringLocalCacheData
                                                         timeoutInterval:30.0];
    //   [urlrequest setURL:[NSURL URLWithString:strurl]];
    [urlrequest setHTTPMethod:@"POST"];
    [urlrequest setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [urlrequest setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    //  [urlrequest setValue:[NSString stringWithFormat:@"%@",requestHeaderDict]  forHTTPHeaderField:@"msgHdr"];
    [urlrequest setHTTPBody:requestData];
    //  [urlrequest setHTTPBody:[requestData dataUsingEncoding:NSUTF8StringEncoding]];
    
    
    NSError *error = [[NSError alloc] init];
    NSHTTPURLResponse *response = nil;
    NSOperationQueue *queue = [[NSOperationQueue alloc] init];
    NSHTTPURLResponse *responseGBP = [[NSHTTPURLResponse alloc] init];

    
    NSData *urlData=[NSURLConnection sendSynchronousRequest:urlrequest returningResponse:&response error:&error];
    
  

    
    NSLog(@"Response code %ld",(long)[response statusCode]);
    NSLog(@"URL Data %@",urlData);
    if ([response statusCode] >=200 && [response statusCode] <300)
    {
        NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:urlData options:kNilOptions error:&error];
        NSLog(@"FootPrint / User preference Response = %@", jsonDict);
        return jsonDict;
    }
    else
    {
        NSLog(@"No encontrado");
        return nil;
    }
    
}


+(NSDictionary *) getResponseFromServerServiceNameFormPost:(NSString*)ServiceName
                                       serviceData:(NSString *)msgHeader
                                          notificationFlag:(NSString*)notificationFlag
                                         notificationToken:(NSString*)notificationToken
                                            smsReadingFlag:(NSString*)smsReadingFlag
                                               bioAuthFlag:(NSString*)bioAuthFlag
                                              bioAuthToken:(NSString*)bioAuthToken
{
    NSDictionary *headers = @{ @"cache-control": @"no-cache",
                               @"content-type": @"application/x-www-form-urlencoded" };
    
    NSLog(@"msgHeader = %@",msgHeader);
    NSMutableData *postData = [[NSMutableData alloc]initWithData:[[NSString stringWithFormat:@"msgHeader=%@",msgHeader] dataUsingEncoding:NSUTF8StringEncoding]];
    [postData appendData:[[NSString stringWithFormat:@"&notificationFlag=%@",notificationFlag] dataUsingEncoding:NSUTF8StringEncoding]];
    [postData appendData:[[NSString stringWithFormat:@"&notificationToken=%@",notificationToken] dataUsingEncoding:NSUTF8StringEncoding]];
    [postData appendData:[[NSString stringWithFormat:@"&smsReadingFlag=%@",smsReadingFlag] dataUsingEncoding:NSUTF8StringEncoding]];
    [postData appendData:[[NSString stringWithFormat:@"&bioAuthFlag=%@",bioAuthFlag] dataUsingEncoding:NSUTF8StringEncoding]];
    [postData appendData:[[NSString stringWithFormat:@"&bioAuthToken=%@",bioAuthToken] dataUsingEncoding:NSUTF8StringEncoding]];
    
    //Update-URLs
//    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.37.32:7003/rs/updateUserPreference"]
//                                                           cachePolicy:NSURLRequestReloadIgnoringLocalCacheData
//                                                       timeoutInterval:30.0];
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"https://my.idfcbank.com/rs/updateUserPreference"]
                                                               cachePolicy:NSURLRequestReloadIgnoringLocalCacheData
                                                           timeoutInterval:30.0];
    
    
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    [request setAllHTTPHeaderFields:headers];
    [request setHTTPBody:postData];
    
    NSError *error = nil;
    NSURLResponse *response = nil;
    NSData *urlData=[NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&error];
    if(error == nil){
        NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:urlData options:kNilOptions error:&error];
        NSLog(@"User preference Response = %@", jsonDict);
        return jsonDict;
    }else{
        NSLog(@"No encontrado");
        return nil;
    }
    
    /*NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request
                                                completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                                                    if (error) {
                                                        NSLog(@"%@", error);
                                                    } else {
                                                        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;
                                                        NSLog(@"%@", httpResponse);
                                                                                     }
                                                }];
    [dataTask resume];*/
    return nil;
    postData=NULL;
    
}

+ (BOOL)checkConnectivity
{
    Reachability *reachability = [Reachability reachabilityForInternetConnection];
    NetworkStatus networkStatus = [reachability currentReachabilityStatus];
    
    return networkStatus != NotReachable;
}



@end

