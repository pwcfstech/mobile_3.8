//
//  AppDelegate.m
//  IDFC Retail Banking
//
//  Created by Backbase R&D B.V.
//

#import <QuartzCore/QuartzCore.h>
#import "AppDelegate.h"
#import "ContactFeature.h"
#import "Renderable.h"
#import "MMNavigationController.h"
#import "MMDrawerController.h"
#import "MMExampleLeftSideMenuDrawerViewController.h"
#import "MMExampleDrawerVisualStateManager.h"
#import "MMDrawerVisualState.h"
#import "Reachability.h"
#import "GlobalVariables.h"
#import "ViewDialog.h"
#import "fingerPrintPlugin.h"
#import "SMSPlugin.h"
#import "WebService_API.h"
#import "constant.h"
#import "GetDeviceFootprint.h"
#import <AudioToolbox/AudioServices.h>
#import "MobileAPI.h"

@import Firebase;
@import FirebaseMessaging;

NSTimeInterval const SESSION_TIMER = 5; // 1 sec
NSTimeInterval const SESSION_IDEAL_ALERT =  150; // 4 mins (180 -> 150)
NSTimeInterval const SESSION_IDEAL_ALERT_END = 180; //5 mins (240 -> 180)
NSTimeInterval const SESSION_SERVICE_CALL_TIME = 2; // 5 sec
UIImageView *myBanner ;

@interface AppDelegate ()

@property (nonatomic, strong, readwrite) NSObject<Model> *model;
@property (nonatomic,strong) MMDrawerController * drawerController;
@property (nonatomic,strong) NSNotification *handleNotification;

@end

@implementation AppDelegate{
    UIAlertView *alert;
    ViewDialog3 *viewDialog3obj;
}
@synthesize viewDialog;
@synthesize viewDialog3;
@synthesize appversionpopupview;
@synthesize deviceBlacklistPopupView;
@synthesize mVisaQrReaderObject;

/**
 * This method is executed when the application finished launching.
 */
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    
    
    //    // Programmatically create a window and attach it to the entire screen
    //    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    //
    //    // Attach the initial view controller to the window
    //    self.window.rootViewController = [self initialViewController];
    //
    //    // Show the window BEFORE initialize Backbase SDK, this allows faster preload and better performance overall.
    //    [self.window makeKeyAndVisible];z
    appversionpopupview =[[NSString alloc]init];
    deviceBlacklistPopupView = [[NSString alloc]init];
    deviceBlacklistPopupView = @"";
    appversionpopupview =@"";
    gotDeviceFootPrint = false;
    
    //[self setupBackbaseCXP];
    
    //RSA-Mobile -- initilization
    mConfiguration = COLLECT_ALL_DEVICE_DATA_AND_LOCATION;
    [self initMobileSDK];
    
    //Uncoment this for go live
    [self connectToBackend:@"deviceFootPrint"];
    // [self connectToBackend:@"userPreference"];
    
    //Firebase initialization
    [FIRApp configure];
    
    //Add an observer for handling token refresh call back
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(tokenRefreshCallback:) name:kFIRInstanceIDTokenRefreshNotification object:nil];
    
    //Reuest permission for push notification
    UIUserNotificationType allNotificationType = (UIUserNotificationTypeSound | UIUserNotificationTypeBadge);
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:allNotificationType categories:nil];
    [application registerUserNotificationSettings:settings];
    [application registerForRemoteNotifications];
    
    [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
    
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:TOUCH3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:BILLPAY3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:ACCOUNTS3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:FUNDSTRANSFER3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:QUICKPAY3D_VALUE];
    
    /** mVisa - reset all flag value at application launch **/
    /** Author - Neha Chandak **/
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:MVISA_LOGIN_FLAG];
    
    //[self setupBackbaseCXP];
    
    //Setting up mVisa processor
    mVisaQrReaderObject = [[mVisaQrReader alloc]init];
    
    
    return YES;
}


//RSA-Mobile RSA SDK Initilization
-(void)initMobileSDK
{
    mMobileAPI = [[MobileAPI alloc]init];
    NSNumber *configuration = [[NSNumber alloc]initWithInt: mConfiguration];
    NSNumber *timeout = [[NSNumber alloc]initWithInt:TIMEOUT_DEFAULT_VALUE];
    NSNumber *silencePeriod = [[NSNumber alloc]initWithInt:SILENT_PERIOD_DEFAULT_VALUE];
    NSNumber *bestAge = [[NSNumber alloc]initWithInt:BEST_LOCATION_AGE_MINUTES_DEFAULT_VALUE];
    NSNumber *maxAge = [[NSNumber alloc]initWithInt:MAX_LOCATION_AGE_DAYS_DEFAULT_VALUE];
    ///NSNumber *maxAccuracy = [[NSNumber alloc]initWithInt:MAX_ACCURACY_DEFAULT_VALUE];
    // override default accuracy in order to force GPS collection
    NSNumber *maxAccuracy = [[NSNumber alloc]initWithInt: 50];
    
    NSDictionary *properties = [[NSDictionary alloc] initWithObjectsAndKeys:
                                configuration, CONFIGURATION_KEY,
                                timeout, TIMEOUT_MINUTES_KEY,
                                silencePeriod, SILENT_PERIOD_MINUTES_KEY,
                                bestAge, BEST_LOCATION_AGE_MINUTES_KEY,
                                maxAge, MAX_LOCATION_AGE_DAYS_KEY,
                                maxAccuracy, MAX_ACCURACY_KEY,
                                @"1", ADD_TIMESTAMP_KEY,
                                nil];
    
    mMobileAPIInitialized = [mMobileAPI initSDK: properties];
    
    // The following code demonstrates how to add custom elements of each type to the JSON string
    
    [mMobileAPI addCustomElement:CUSTOM_ELEMENT_TYPE_STRING elementName:@"CustomString" elementValue:@"StringValue"];
    
    NSNumber* customBool = [[NSNumber alloc]initWithBool:TRUE];
    [mMobileAPI addCustomElement:CUSTOM_ELEMENT_TYPE_BOOL elementName:@"CustomBool" elementValue:customBool];
    
    NSNumber* customInteger = [[NSNumber alloc]initWithLongLong:123456789];
    [mMobileAPI addCustomElement:CUSTOM_ELEMENT_TYPE_INTEGER elementName:@"CustomInteger" elementValue:customInteger];
    
    NSDecimalNumber* customDecimal = [[NSDecimalNumber alloc]initWithDouble:3.14159];
    [mMobileAPI addCustomElement:CUSTOM_ELEMENT_TYPE_DECIMAL elementName:@"CustomDecimal" elementValue:customDecimal];
    
    // Get the JSON string
    mJSONInfoString = [mMobileAPI collectInfo];
}


#pragma mark - System Methods

-(void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    if([timer isValid]){
        [self stopTimer];
    }
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    myBanner = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"Splash"]];
    //self.backgroundImage = myBanner;
    [self.window addSubview:myBanner];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
    /*Mobile 2.5*/
    if(!gotDeviceFootPrint){
        [self connectToBackend:@"deviceFootPrint"];
    }
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    
    /*** Mobile 2.5, if no network, dont do below functionality ***/
    if (![WebService_API checkConnectivity]) {
        return;
    }
    
    /*** End ***/
    
    if(![timer isValid]){
        if(_lastlogin != nil){
            [self startTimer];
        }
    }
    if(myBanner != nil) {
        [myBanner removeFromSuperview];
        myBanner = nil;
    }
    
    //Connecting to Firebase
    [self connectToFirebase];
    [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    
    exit(0);
}


#pragma mark - Push Notification handler

-(void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo{
    //If you are receiving notification message while your is in the background, this callback will not be
    //fired till the user taps on the notification launching the application
    //Print message id
    NSLog(@"Message ID: %@",userInfo[@"gcm.message_id"]);
    
    //Print full message
    NSLog(@"Full message: %@",userInfo);
    
    NSString *notificationText = userInfo[@"notificationText"];
    
    //Show popup when notification is received when app is in the foreground
    UIAlertView *notificationAlerView = [[UIAlertView alloc]initWithTitle:@"IDFC Bank" message:notificationText delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
    
    [notificationAlerView show];
    AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
    
    //Redirect the user to specific page on receipt of push notification
    //[Backbase postNavigationRequest:@"d76857c3-ad72-43ff-be34-e5786aab69c9" to:@"/idfc_mobile/mpin-setup"];
}

/**
 * This method is creating the initial view controller. Currently it's copying the splash screen to allow windows to
 * preload.
 */
- (UIViewController *)initialViewController {
    // Create temporary splash screen copy to allow widgets to preload, this screen will be removed when preloading is
    // finished
    UIImageView *imageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"Splash"]];
    imageView.contentMode = UIViewContentModeScaleAspectFill;
    imageView.frame = self.window.bounds;
    imageView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    UIViewController *viewController = [[UIViewController alloc] init];
    [viewController.view addSubview:imageView];
    [viewController.view setBackgroundColor:[UIColor whiteColor]];
    
    // add as spinner for better user experience
    //    spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
    //    spinner.color = [UIColor redColor];
    //    [spinner startAnimating];
    //    spinner.center = imageView.center;
    //    [viewController.view addSubview:spinner];
    
    return viewController;
}
- (UIActivityIndicatorView *)loadSpinner {
    // add as spinner for better user experience
    spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
    spinner.color = [UIColor redColor];
    [spinner startAnimating];
    return spinner;
}
- (void) stopSpinner{
    [spinner stopAnimating];
}

/**
 * This method is setting up al the Backbase Backbase Mobile SDK related components.
 */
- (void)setupBackbaseBackbase {
    
    
    // Check if the device is jailbroken, deny app usage if this is the case
    if ([Backbase isDeviceJailbroken]) {
        
        UIAlertView *jailBrokenAlert=[[UIAlertView alloc]initWithTitle:@"Device is Jailbroken" message:@"For your own safety we don't allow users with jailbroken devices to use this application."  delegate:self cancelButtonTitle:@"Get me out" otherButtonTitles:nil];
        jailBrokenAlert.tag = 501;
        [jailBrokenAlert show];
        
    }
    else{//Stop user from accessing the app
        // Initialize and configure library
        @try{
            
            NSError *error = nil;
            //change config file for testing
            [Backbase initialize:@"assets/backbase/static/conf/configs.json" forceDecryption:false error:&error];
            if (error) {
                [Backbase logError:self
                           message:[NSString stringWithFormat:@"Unable to read configuration due error: %@",
                                    error.localizedDescription ?: @"Unknown error"]];
                
                self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
                UIColor * tintColor = [UIColor whiteColor];
                [self.window setTintColor:tintColor];
                [self.window setBackgroundColor:tintColor];
                [self.window setRootViewController:[self initialViewController]];
                [self.window makeKeyAndVisible];
                
                UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Initialization Error"
                                                                message:@"Error while initializing the application. Please restart the application or contact us at 1800 419 4332 if the problem persists."
                                                               delegate:self
                                                      cancelButtonTitle:@"OK"
                                                      otherButtonTitles:nil];
                alert.tag = 901;
                [alert show];

            }
            else{
            
            /**
             * Registering plugin
             */
            
            [Backbase registerPlugin:[ContactFeature new] error:&error];
            //[Backbase registerPlugin:[ContactFeature new] error:&error];
            if (error) {
                [Backbase logError:self
                           message:[NSString stringWithFormat:@"Unable register contact feature due error: %@",
                                    error.localizedDescription ?: @"Unknown error"]];
            }
            
            [Backbase registerPlugin:[GlobalVariables new] error:&error];
            if(error){
                [Backbase logError:self message:[NSString stringWithFormat:@"Unable to register Global Variable plugin die to error %@",error.localizedDescription ?: @"Unknown Error"]];
            }
            
            [Backbase registerPlugin:[fingerPrintPlugin new] error:&error];
            if(error){
                [Backbase logError:self message:[NSString stringWithFormat:@"Unable to register Fingerpring Plugin die to error %@",error.localizedDescription ?: @"Unknown Error"]];
            }
            
            [Backbase registerPlugin:[SMSPlugin new] error:&error];
            if(error){
                [Backbase logError:self message:[NSString stringWithFormat:@"Unable to register SMS  plugin die to error %@",error.localizedDescription ?: @"Unknown Error"]];
            }
            
            // Register observer that observes login sucess & fetches postLogin model.JSON
            [Backbase registerObserver:self
                              selector:@selector(handleLogin:)
                              forEvent:@"cxp.load.model"];
            
            // Register observer that observes logout from user
            [Backbase registerObserver:self
                              selector:@selector(logoutUserAndClearSession:)
                              forEvent:@"cxplogout"];
            
            //Mobile 2.5
            
            
            
            [Backbase registerObserver:self
                              selector:@selector(handleLogOut:)
                              forEvent:@"cxpGoToSignIn"];
            
            
            // Register observer that observes no internet connection
            [Backbase registerObserver:self
                              selector:@selector(noInternet:)
                              forEvent:@"no.internet"];
            
            [Backbase registerObserver:self
                              selector:@selector(restrictBBuser:)
                              forEvent:@"restrictBBUser"];
            [Backbase registerObserver:self
                              selector:@selector(BlankUserType:)
                              forEvent:@"BlankUserType"];
            
            // Register observer that observes no internet connection
            [Backbase registerObserver:self
                              selector:@selector(sessionNotCreated:)
                              forEvent:@"session.not.created"];
            
            [Backbase registerObserver:self
                              selector:@selector(showPasswordResetPopup:)
                              forEvent:@"passwordResetSuccess"];
            
            //Registering popup action
            [Backbase registerObserver: self
                              selector: @selector(showPopup:)
                              forEvent: @"display.1btn.popup"];
            
            //Registering popup action
            [Backbase registerObserver: self
                              selector: @selector(showPopup3:)
                              forEvent: @"display.3btn.popup"];
            
            
            // Register observer that observes security policy violations
            [Backbase securityViolationDelegate:self];
            
            /*---------------------------------------------------------
             Start: mVisa Notification registration
             Author: Taral Soni
             ---------------------------------------------------------*/
#pragma mark - mVisa
            [Backbase registerObserver:self
                              selector:@selector(scanQrCode:)
                              forEvent:@"scan.mvisa.qr"];
            
#pragma mark - mVisa
            [Backbase registerObserver:self
                              selector:@selector(hideQrCode:)
                              forEvent:@"hide.mvisa.qr"];
            
#pragma mark - mVisa
            [Backbase registerObserver:self
                              selector:@selector(changeNavBarTitle:)
                              forEvent:@"mvisa.header.title"];
            
            [Backbase registerObserver:self
                              selector:@selector(showInvalidQRMessage:)
                              forEvent:@"invalid.qr.merchant"];
            
            [Backbase registerObserver:self
                              selector:@selector(logoutUser:)
                              forEvent:@"device.GoBack"];
            [Backbase registerObserver:self
                                  selector:@selector(closeApp:)
                                  forEvent:@"closeAppForAus"];//3.5 change
                
                
#pragma mark - RSA-Mobile
                [Backbase registerObserver:self
                                  selector:@selector(getMobileSdkData:)
                                  forEvent:@"getMobileSdkData"];
            /*---------------------------------------------------------
             Start: mVisa Notification registration
             Author: Taral Soni
             ---------------------------------------------------------*/
            
            
            
            // Register observer that observes navigation flow events
            [Backbase registerNavigationEventListener:self selector:@selector(didReceiveNavigationNotificationPubSub:)];
            
            Reachability *networkReachability = [Reachability reachabilityForInternetConnection];
            NetworkStatus networkStatus = [networkReachability currentReachabilityStatus];
            if (networkStatus == NotReachable)
            {
                
                [spinner stopAnimating];
                UIAlertView *toast = [[UIAlertView alloc] initWithTitle:@"No Internet Connection"
                                                                message:@"Connect to the internet to use this application."
                                                               delegate:nil
                                                      cancelButtonTitle:@"Ok"
                                                      otherButtonTitles:nil, nil];
                [toast show];
            }
            else
            {
                // Register observer that observes preloaded items
                [Backbase registerPreloadObserver:self selector:@selector(setupDrawerMenu:)];
                
                // Get a list of pages from the main navigation
                // Load Model from server
                [Backbase model:self order:@[ kModelSourceServer]];
                [Backbase publishEvent:@"Connection Established" payload:nil];
            }
            }
            //    // Get a list of pages from the main navigation
            //[Backbase model:self order:@[ kModelSourceServer, kModelSourceServer ]]
        }
        @catch (NSException *exception){
            NSLog(@"%@", exception.reason);
            
            self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
            UIColor * tintColor = [UIColor whiteColor];
            [self.window setTintColor:tintColor];
            [self.window setBackgroundColor:tintColor];
            [self.window setRootViewController:[self initialViewController]];
            [self.window makeKeyAndVisible];
            
            UIAlertView *InitialAlert = [[UIAlertView alloc] initWithTitle:@"Initialization Error"
                                                                   message:@"Error while initializing the application. Please restart the application or contact us at 1800 419 4332 if the problem persists."
                                                                  delegate:self
                                                         cancelButtonTitle:@"OK"
                                                         otherButtonTitles:nil];
            InitialAlert.tag = 901;
            [InitialAlert show];

        }
    }
    
}

//RSA-Mobile -- pupsub call
-(void)getMobileSdkData:(NSNotification*)notifcation{
    //RSA get data
    //NSString *data = [mMobileAPI collectInfo];
    //NSLog(@"%s\n", [data UTF8String]);
    
    NSData *data = [[mMobileAPI collectInfo] dataUsingEncoding:NSUTF8StringEncoding];
    id result = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:NULL];
    NSLog(@"result = %@", result);
    
    [Backbase publishEvent:@"putMobileSdkData" payload:@{@"data" : result}];
}

-(void)showPopup:(NSNotification*)notifcation{
    NSString *data = notifcation.userInfo[@"data"];
    NSString *message = notifcation.userInfo[@"message"];
    
    if([data isEqualToString: @"DVCEBLCKLIST"]){
        if([deviceBlacklistPopupView isEqualToString:@"false"] || [deviceBlacklistPopupView isEqualToString:@""]){
            deviceBlacklistPopupView = @"true";
            viewDialog = [[ViewDialog alloc]init];
            UIView *view = [[[UIApplication sharedApplication] delegate] window];
            [viewDialog showInView:view animated:YES txnType:data msg:message];
        }
    }else{
        viewDialog = [[ViewDialog alloc]init];
        UIView *view = [[[UIApplication sharedApplication] delegate] window];
        [viewDialog showInView:view animated:YES txnType:data msg:message];
    }
}

-(void)showPopup3:(NSNotification*)notifcation{
    NSString *data = notifcation.userInfo[@"data"];
    NSString *message = notifcation.userInfo[@"message"];
    if([data isEqualToString:@"APPUPWTHNGP"]){
        
        if([appversionpopupview isEqualToString:@"false"] || [appversionpopupview isEqualToString:@""]){
            appversionpopupview=@"true";
            viewDialog3 = [[ViewDialog3 alloc]init];
            UIView *view = [[[UIApplication sharedApplication] delegate] window];
            [viewDialog3 showInView:view animated:YES txnType:data msg:message];
        }
    }else if([data isEqualToString:@"APPUPBYNDGP"]){
        if([appversionpopupview isEqualToString:@"false"] || [appversionpopupview isEqualToString:@""]){
            appversionpopupview=@"true";
            viewDialog3 = [[ViewDialog3 alloc]init];
            UIView *view = [[[UIApplication sharedApplication] delegate] window];
            [viewDialog3 showInView:view animated:YES txnType:data msg:message];
        }
    }else{
        viewDialog3 = [[ViewDialog3 alloc]init];
        UIView *view = [[[UIApplication sharedApplication] delegate] window];
        [viewDialog3 showInView:view animated:YES txnType:data msg:message];
    }
}

#pragma mark - mVisa
/*----------------------------------------------------------------------
 Start: mVisa Notification Handler
 Author: Taral Soni
 -----------------------------------------------------------------------*/
-(void)scanQrCode:(NSNotification*)notification{
    //NSString *temp = [[notification userInfo] objectForKey:@"data"];
    NSLog(@"I am here");
    UIView *view = [[[UIApplication sharedApplication] delegate] window];
    [mVisaQrReaderObject showInView:view animated:YES];
}

#pragma mark - mVisa
-(void)hideQrCode:(NSNotification*)notification{
    NSLog(@"I am hiding QR code");
    [mVisaQrReaderObject hideQrScanner];
}

#pragma mark - mVisa
-(void)changeNavBarTitle:(NSNotification*)notification{
    NSString *title = [[notification userInfo] objectForKey:@"data"];
    [_cxpViewControllerObject changeNavBarTitle:title];
}

#pragma mark - mVisa
-(void)showInvalidQRMessage:(NSNotification*)notification{
    //NSString *title = [[notification userInfo] objectForKey:@"data"];
    UIView *view = [[[UIApplication sharedApplication] delegate] window];
    [mVisaQrReaderObject showInView:view animated:YES];
    [mVisaQrReaderObject showError:@"We are unable to process the QR Code"];
}

#pragma mark - mVisa
-(void)logoutUser:(NSNotification*)notification{
    [_cxpViewControllerObject showLogoutPopup:nil];
}

/*----------------------------------------------------------------------
 End: mVisa Notification Capture
 -----------------------------------------------------------------------*/



/**
 * This method is setting up all the menus comes under drawer control.
 */

- (void)setupDrawerMenu:(NSNotification *)notification {
    
    // Create and iterate over the sitemap
    NSArray *sitemap = [self.model siteMapItemChildrenFor:@"navroot_mainmenu"];
    //NSArray *sitemap = [self.model siteMapItemChildrenFor:@"Main Navigation"];
    
    //Taking first controller for intial view
    NSObject<SiteMapItemChild> *siteMapObject = [sitemap objectAtIndex:0];
    
    
    // Create renderable item to render the content of the page
    NSObject<Renderable> *renderable = [self.model itemById:siteMapObject.itemRef];
    
    // Create centre view controller
    CXPViewController *centerViewController = [[CXPViewController alloc] initWithRenderable:renderable];
    
    // Create center navigation controller
    UINavigationController * navigationController = [[MMNavigationController alloc] initWithRootViewController:centerViewController];
    [navigationController setRestorationIdentifier:@"MMExampleCenterNavigationControllerRestorationKey"];
    
    
    // Create left view controller
    MMExampleLeftSideMenuDrawerViewController * leftSideDrawerViewController = (MMExampleLeftSideMenuDrawerViewController *) [[MMExampleLeftSideMenuDrawerViewController alloc] init];
    UINavigationController * leftSideNavController = [[MMNavigationController alloc] initWithRootViewController:leftSideDrawerViewController];
    [leftSideNavController setRestorationIdentifier:@"MMExampleLeftNavigationControllerRestorationKey"];
    
    // Create right view controller
    //UIViewController * rightSideDrawerViewController = [[MMExampleRightSideDrawerViewController alloc] init];
    //UINavigationController * rightSideNavController = [[MMNavigationController alloc] initWithRootViewController:rightSideDrawerViewController];
    //[rightSideNavController setRestorationIdentifier:@"MMExampleRightNavigationControllerRestorationKey"];
    
    self.drawerController = [[MMDrawerController alloc]
                             initWithCenterViewController:navigationController
                             leftDrawerViewController:leftSideNavController
                             rightDrawerViewController:nil];
    [self.drawerController setShowsShadow:YES];
    [self.drawerController setRestorationIdentifier:@"MMDrawer"];
    if([UIScreen mainScreen].bounds.size.height > 667){
        
        [self.drawerController setMaximumLeftDrawerWidth:330.0];
        
    }else{
        
        [self.drawerController setMaximumLeftDrawerWidth:320.0];
        
    }
    [self.drawerController setShowsStatusBarBackgroundView:NO];
    [self.drawerController setOpenDrawerGestureModeMask:MMOpenDrawerGestureModeAll];
    [self.drawerController setCloseDrawerGestureModeMask:MMCloseDrawerGestureModeAll];
    
    [self.drawerController
     setDrawerVisualStateBlock:^(MMDrawerController *drawerController, MMDrawerSide drawerSide, CGFloat percentVisible) {
         MMDrawerControllerDrawerVisualStateBlock block;
         block = [[MMExampleDrawerVisualStateManager sharedManager]
                  drawerVisualStateBlockForDrawerSide:drawerSide];
         if(block){
             block(drawerController, drawerSide, percentVisible);
         }
     }];
    
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    UIColor * tintColor = [UIColor whiteColor];
    [self.window setTintColor:tintColor];
    [self.window setBackgroundColor:tintColor];
    [self.window setRootViewController:self.drawerController];
    [self.window makeKeyAndVisible];
}

#pragma mark - Preload Widgets
-(void)loadViewControllerForId:(NSString *)widgetId{
    // Create renderable item to render the content of the page
    NSObject<Renderable> *renderable = [[Backbase currentModel] itemById:widgetId];
    
    /** Mobile 2.5 **/
    /** Click on hamburger menu, to get data**/
    /** Adding link for BharatBill Pay **/
    /** Getting page Preferences  **/
    NSDictionary *preferences = [renderable allPreferences];
    //    if([[preferences valueForKey:@"menuType"] isEqualToString:@"link"] ){
    if([preferences valueForKey:@"linkUrl"] != NULL){
        NSString *url = [preferences valueForKey:@"linkUrl"];
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:url]];
        return;
    }
    /** end **/
    
    // Create view controller
    CXPViewController *viewController = [[CXPViewController alloc] initWithRenderable:renderable];
    
    /** mVisa **/
    /** Neha Chandak **/
    _cxpViewControllerObject = viewController;
    /** end **/
    
    // Create navigation controller
    UINavigationController *navigationController =
    [[MMNavigationController alloc] initWithRootViewController:viewController];
    
    [self.drawerController
     setCenterViewController:navigationController
     withCloseAnimation:YES
     completion:nil];
}


/**
 * This method is executed when the library detects a navigation request from a widget. The notification contains
 * information about the origin, target and relation of the origin and target. This information is used to determine
 * what en how to show a page.
 */
- (void)didReceiveNavigationNotificationPubSub:(NSNotification *)notification {
    // Get information about the navigation flow event
    NSString *origin = notification.userInfo[@"origin"];
    NSString *target = notification.userInfo[@"target"];
    NSString *relationship = notification.userInfo[@"relationship"];
    
    // Check if an external link is requested
    if ([relationship isEqualToString:kBBNavigationFlowRelationshipExternal] ) {
        // Open the external link is the externan web browser
        
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:target]];
        return;
    }
    if ([relationship isEqualToString:kBBNavigationFlowRelationshipNone]){
        [self openUPILink];
        return;
    }
    
    // Check if a root item is selected
    if ([relationship isEqualToString:kBBNavigationFlowRelationshipRoot]) {
        
        // Loop through the tabs of the app to see what item is selected
        [self loadViewControllerForId:target];
    }
    
    // Check if a child item is selected
    //    if ([relationship isEqualToString:kBBNavigationFlowRelationshipRoot]) {
    //
    //        // Create renderable item to render the content of the requested page
    //        NSObject<Renderable> *tarRenderable = [self.model itemById:target];
    //
    //        // Create a new view controller
    //        CXPViewController *tarviewController = [[CXPViewController alloc] initWithRenderable:tarRenderable];
    //
    //        // Create renderable item to render the content of the requested page
    //        NSObject<Renderable> *orgRenderable = [self.model itemById:origin];
    //
    //        // Create a new view controller
    //        CXPViewController *orgviewController = [[CXPViewController alloc] initWithRenderable:orgRenderable];
    //
    //        // Create navigation controller
    //        UINavigationController *navigationController =
    //        [[MMNavigationController alloc] initWithRootViewController:orgviewController];
    //        [navigationController addChildViewController:tarviewController];
    //
    //        //if([UIScreen mainScreen].bounds.size.height <= 568){
    //        //[navigationController.view addSubview:tarviewController.view];
    //        // }else{
    //        //  [orgviewController.view addSubview:tarviewController.view];
    //        // }
    //        [orgviewController.view addSubview:tarviewController.view];
    //        [tarviewController didMoveToParentViewController:navigationController];
    //
    //        [self.drawerController setCenterViewController:navigationController];
    //    }
    
    // Check if a Other/sibling item is selected
    if ([relationship isEqualToString:kBBNavigationFlowRelationshipOther] ||[relationship isEqualToString:kBBNavigationFlowRelationshipSibling] || [relationship isEqualToString:kBBNavigationFlowRelationshipSelf]) {
        
        // Loop through the tabs of the app to see what item is selected
        [self loadViewControllerForId:target];
    }
}

#pragma mark - ModelDelegate
/**
 * This method is executed when the model is loaded. It's creating a reference to the model so we can use it at a later
 * stage.
 */
- (void)modelDidLoad:(NSObject<Model> *)model {
    self.model = model;
}

/**
 * This method is executed when the model couldn't be loaded.
 */
- (void)modelDidFailLoadWithError:(NSError *)error {
    // Show a non-closable error indicating that something bad happened
    [[[UIAlertView alloc] initWithTitle:@"Error while loading resources !"
                                message:@"Some or one of the resource files could not be loaded. This is most likely because of poor network response."
      @"Please try again in some time."
                               delegate:nil
                      cancelButtonTitle:@"OK"
                      otherButtonTitles:nil] show];
}

#pragma mark - SecurityViolationDelegate
/**
 * This method is executed when a (security) policy violation has occurred. It can be used to block the usage of the
 * app.
 */
- (void)securityDidReceiveViolation:(NSError *)error {
    // Show a non-closable error indicating that something bad happened
    //    [[[UIAlertView alloc] initWithTitle:@"Security policy violation"
    //                                message:@"The app's security policy has been violated. Please inform the organisation. "
    //                                @"Restart or reinstall the application to continue using it."
    //                               delegate:nil
    //                      cancelButtonTitle:nil
    //                      otherButtonTitles:nil] show];
}

#pragma mark - MMDrawer

- (BOOL)application:(UIApplication *)application shouldSaveApplicationState:(NSCoder *)coder{
    return YES;
}

- (BOOL)application:(UIApplication *)application shouldRestoreApplicationState:(NSCoder *)coder{
    return YES;
}

- (UIViewController *)application:(UIApplication *)application viewControllerWithRestorationIdentifierPath:(NSArray *)identifierComponents coder:(NSCoder *)coder
{
    NSString * key = [identifierComponents lastObject];
    if([key isEqualToString:@"MMDrawer"]){
        return self.window.rootViewController;
    }else if ([key isEqualToString:@"MMExampleCenterNavigationControllerRestorationKey"]) {
        return ((MMDrawerController *)self.window.rootViewController).centerViewController;
    }else if ([key isEqualToString:@"MMExampleRightNavigationControllerRestorationKey"]) {
        return ((MMDrawerController *)self.window.rootViewController).rightDrawerViewController;
    }else if ([key isEqualToString:@"MMExampleLeftNavigationControllerRestorationKey"]) {
        return ((MMDrawerController *)self.window.rootViewController).leftDrawerViewController;
    }else if ([key isEqualToString:@"MMExampleLeftSideMenuDrawerController"]){
        UIViewController * leftVC = ((MMDrawerController *)self.window.rootViewController).leftDrawerViewController;
        if([leftVC isKindOfClass:[UINavigationController class]]){
            return [(UINavigationController*)leftVC topViewController];
        }else {
            return leftVC;
        }
        
    }else if ([key isEqualToString:@"MMExampleRightSideDrawerController"]){
        UIViewController * rightVC = ((MMDrawerController *)self.window.rootViewController).rightDrawerViewController;
        if([rightVC isKindOfClass:[UINavigationController class]]){
            return [(UINavigationController*)rightVC topViewController];
        }else {
            return rightVC;
        }
    }
    return nil;
}

#pragma mark - Post Login

-(void)handleLogin:(NSNotification *)notification
{
    if ([Backbase invalidateModel])
    {
        //        if([Backbase currentModel]){
        //            NSObject<Model> *isDerModel = [Backbase currentModel];
        //            NSLog(@"@ Inside if");
        //        }
        [Backbase model:self order:@[ kModelSourceServer]];
        //  [self setupDrawerMenu:notification];
        
        //to start session timeout
        [self startTimer];
        
        // Register observer that observes session logout
        [Backbase registerObserver:self
                          selector:@selector(sessionLogout:)
                          forEvent:@"session.call.invalid"];
        
        
        self.userName = [[notification userInfo] objectForKey:@"customerName"];
        
        if ([[notification userInfo] objectForKey:@"lastLoggedIn"] == nil)
        {
            _lastlogin = @"Last Visited: First Login ";
        }
        else
        {
            NSDateFormatter *format = [[NSDateFormatter alloc] init];
            [format setDateFormat:@"dd-MMM-yyyy hh:mm:ss a"];
            NSString* takeOffTime = [[notification userInfo] objectForKey:@"lastLoggedIn"];
            double miliSec = takeOffTime.doubleValue;
            NSDate* takeOffDate = [NSDate dateWithTimeIntervalSince1970:miliSec/1000.0];
            NSString *dateString = [format stringFromDate:takeOffDate];
            self.lastlogin = [NSString stringWithFormat:@"Last Login: %@",dateString];
        }
    }
}

-(void)handleLogOut:(NSNotification *)notification
{
    [Backbase clearSession];
    
    //Author: Taral Soni
    //Date: 26 May 2017
    //This is to reoslve the bug of SDK. After clearSession, it doesnt clear the cookie. Hence in few
    //cases user continues to see post login screen even after logout
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (NSHTTPCookie *cookie in [storage cookies]) {
        NSLog(@"------- Cookies ------------ %@",cookie);
        [storage deleteCookie:cookie];
    }
    [[NSUserDefaults standardUserDefaults] synchronize];
    
    int waitTime = 2;
    wait(&waitTime);
    
    // SDK bug resolution ends here
    
    if ([Backbase invalidateModel])
    {
        self.lastlogin = nil;
        self.userName = nil;
        [self stopTimer];
        // Get a list of pages from the main navigation
        
        //25-07-2017 kini Local Model load
        
        //[Backbase model:self order:@[ kModelSourceServer]];
        NSLog(@"Model from server here");
        [Backbase model:self order:@[ kModelSourceServer]];
        
        /*Mobile 2.5 3D Touch*/
        [[NSUserDefaults standardUserDefaults] setValue:nil forKey:TOUCH3D_VALUE];
        [[NSUserDefaults standardUserDefaults] setValue:nil forKey:BILLPAY3D_VALUE];
        [[NSUserDefaults standardUserDefaults] setValue:nil forKey:ACCOUNTS3D_VALUE];
        [[NSUserDefaults standardUserDefaults] setValue:nil forKey:FUNDSTRANSFER3D_VALUE];
        [[NSUserDefaults standardUserDefaults] setValue:nil forKey:QUICKPAY3D_VALUE];
        //        [self setupDrawerMenu:notification];
    }
}

/* Mobile 2.5 - insert marketing screen after clicking logout */
-(void)logoutUserAndClearSession:(NSNotification *)notification
{
    
    [Backbase clearSession];
    self.lastlogin = nil;
    self.userName = nil;
    [self stopTimer];
    [Backbase unregisterObserver:self forEvent:@"session.call.invalid"];
    
    
    /*Mobile 2.5 3D Touch*/
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:TOUCH3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:BILLPAY3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:ACCOUNTS3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:FUNDSTRANSFER3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:QUICKPAY3D_VALUE];
    [self loadViewControllerForId:[[NSUserDefaults standardUserDefaults] valueForKey:LOGOUT_MARKETING]];
    
}

-(void)openUPILink{
    
    
    NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"mailto://ziggit" ]];
    NSURL *itunesURL = [NSURL URLWithString:[NSString stringWithFormat:@"https://itunes.apple.com/in/app/hdfc-bank/id626154179?mt=8" ]];
    
    if([[UIApplication sharedApplication] canOpenURL:url]){
        [[UIApplication sharedApplication] openURL:url];
    }
    else if([[UIApplication sharedApplication] canOpenURL:itunesURL]){
        [[UIApplication sharedApplication] openURL:itunesURL];
    }
}

-(void)restrictBBuser:(NSNotification *)notification
{
    [[[UIAlertView alloc] initWithTitle:@""
                                message:@"Mobile banking is currently unavailable for Business Banking customers. We are working to enable it."
                               delegate:nil
                      cancelButtonTitle:@"OK"
                      otherButtonTitles:nil] show];
    
}

-(void)BlankUserType:(NSNotification *)notification
{
    [[[UIAlertView alloc] initWithTitle:@""
                                message:@"This facility is not available at this time."
                               delegate:nil
                      cancelButtonTitle:@"OK"
                      otherButtonTitles:nil] show];
}


#pragma mark - Connection

-(void)noInternet:(NSNotification *)notification
{
    UIAlertView *toast = [[UIAlertView alloc] initWithTitle:@"Network Issue"
                                                    message:@"Check Your Internet Connection"
                                                   delegate:nil
                                          cancelButtonTitle:nil
                                          otherButtonTitles:nil, nil];
    [toast show];
    
    int duration=2;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, duration * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [toast dismissWithClickedButtonIndex:0 animated:YES];
    });
}


-(void)noConnection{
    // Initialize and configure library
    NSError *error = nil;
    //change config file for testing
    [Backbase initialize:@"assets/backbase/static/conf/configs.json" forceDecryption:false error:&error];
    if (error) {
        [Backbase logError:self
                   message:[NSString stringWithFormat:@"Unable to read configuration due error: %@",
                            error.localizedDescription ?: @"Unknown error"]];
    }
    
    
    [Backbase model:self order:@[ kModelSourceFile ]];
}


-(void)showPasswordResetPopup:(NSNotification *)notification
{
    UIImageView *image = [[UIImageView alloc] initWithFrame:CGRectMake(40, 40,0,0)];
    UIAlertView *passReset = [[UIAlertView alloc]initWithTitle:@"Success" message:@"Congratulations ! Your password has been changed."delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil];
    passReset.tag = 103;
    
    [passReset show];
}
#pragma mark - Session Not Created
-(void)sessionNotCreated:(NSNotification *)notification
{
    UIAlertView *toast = [[UIAlertView alloc] initWithTitle:@"You could not be logged in"
                                                    message:@"There is an issue in our systems. Please try again later."
                                                   delegate:nil
                                          cancelButtonTitle:nil
                                          otherButtonTitles:nil, nil];
    [toast show];
    
    int duration=2;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, duration * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [toast dismissWithClickedButtonIndex:0 animated:YES];
    });
}

#pragma mark - Initialize Timer
- (void)startTimer{
    timer = [NSTimer scheduledTimerWithTimeInterval:SESSION_TIMER
                                             target:self
                                           selector:@selector(sessionHandling:)
                                           userInfo:nil
                                            repeats:YES];
}
- (void)stopTimer{
    [timer invalidate];
}

#pragma mark - Session Handling
-(void)sessionLogout:(NSNotification*)notification {
    if(_lastlogin != nil){
        [Backbase unregisterObserver:self forEvent:@"session.call.invalid"];
        
        [Backbase clearSession];
        self.handleNotification = notification;
        [self stopTimer];
        [self openSessionExpireDialog];
        //        [self handleLogOut:notification];
        //       // [Backbase invalidateModel];
        //        // Get a list of pages from the main navigation
        
        //        [Backbase model:self order:@[ kModelSourceServer]];
        
        
        //        if([self doesAlertViewExist]){
        //            [sessExpire dismissWithClickedButtonIndex:0 animated:YES];
        //        }
        //        else{
        //            if(!((SESSION_ALERT_TIME %(int)SESSION_IDEAL_ALERT_END) == 0)){
        //                [self openSessionExpireDialog];
        //            }
        //        }
    }
}

- (void)sessionHandling:(NSTimer*)timer {
    //CURRENT_RUNNING_TIMER will set 0 when user will sign in
    SESSION_ALERT_TIME += SESSION_TIMER;
    CURRENT_RUNNING_TIMER += SESSION_TIMER;
    
    if(SESSION_ALERT_TIME%(int)SESSION_IDEAL_ALERT_END == 0) {
        [Backbase unregisterObserver:self forEvent:@"session.call.invalid"];
        [self stopTimer];
        CURRENT_RUNNING_TIMER = 0;
    }else if(SESSION_ALERT_TIME%(int)SESSION_IDEAL_ALERT == 0) {
        if([self doesAlertViewExist]){
            //[sessExpire dismissWithClickedButtonIndex:0 animated:YES];
        }else{
            //Open Alert session is going to expire
            [self openPreSessionExpireDialog];
        }
    }
    if((CURRENT_RUNNING_TIMER/1000)%(int)SESSION_SERVICE_CALL_TIME == 0) {
        Reachability *networkReachability = [Reachability reachabilityForInternetConnection];
        NetworkStatus networkStatus = [networkReachability currentReachabilityStatus];
        if (networkStatus != NotReachable)
        {
            [Backbase publishEvent:@"session.call.native" payload:@{@"data" : @"Session call from native"}];
            NSLog(@"Inside payload");
        }
    }
}
#pragma mark - Alert View

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    //  the user clicked one of the OK/Cancel buttons
    if(alertView.tag == 101)
    {
        if (buttonIndex == 0){
            
            //            // Create and iterate over the sitemap
            //            NSArray *sitemap = [self.model siteMapItemChildrenFor:@"Main Navigation"];
            //
            //            //Taking first controller for initial view
            //            NSObject<SiteMapItemChild> *siteMapObject = [sitemap objectAtIndex:([sitemap count] - 1)];
            //            [self loadViewControllerForId:siteMapObject.itemRef];
            //
            /*** Mobile 2.5 ***/
            /*** Fixing issue for user not getting logged out when session expires ***/
            
            // [self handleLogOut:self.handleNotification];
            //[self logoutUserAndClearSession];
            [self loadViewControllerForId:[[NSUserDefaults standardUserDefaults] valueForKey:PAGE_LOGOUT]];
            /*** end ***/
            
        }
        
        SESSION_ALERT_TIME = 0;
        CURRENT_RUNNING_TIMER = 0;
        
    }else if(alertView.tag == 102){
        if (SESSION_ALERT_TIME % (int)SESSION_IDEAL_ALERT_END == 0) {
            [self openSessionExpireDialog];
        }
        [self resetTimeOutVaraible];
    }else if(alertView.tag == 103){
        [Backbase publishEvent:@"loginPostPasswordReset" payload:NULL];
    }else if (alertView.tag == 501){
        if (buttonIndex == 0){
            UIApplication *app = [UIApplication sharedApplication];
            [app performSelector:@selector(suspend)];
            //wait 2 seconds while app is going background
            [NSThread sleepForTimeInterval:2.0];
            //exit app when app is in background
            NSLog(@"exit(0)");
            exit(0);
        }
    }
    else if(alertView.tag == 901)
    {
        if (buttonIndex == 0){
            UIApplication *app = [UIApplication sharedApplication];
            [app performSelector:@selector(suspend)];
            //wait 2 seconds while app is going background
            //[NSThread sleepForTimeInterval:2.0];
            //exit app when app is in background
            NSLog(@"exit(0)");
            exit(0);
        }
    }
    
    /*Mobile 2.5*/
    /* If no network, user should be directed to setting page*/
    else if(alertView.tag == ErrTAG){
        if(buttonIndex == 0){
            NSURL *url = [NSURL URLWithString:@"prefs:root=WIFI"];
            if ([[UIApplication sharedApplication] canOpenURL:url]) {
                [[UIApplication sharedApplication] openURL:url];
            } else {
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"App-Prefs:root=WIFI"]];
            }
            
            //            BOOL canOpenSetting = (&UIApplicationOpenSettingsURLString != nil);
            //            if(canOpenSetting){
            //                NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
            //                [[UIApplication sharedApplication] openURL:url];
            //            }
        }
        else if(buttonIndex == 1){
            [self connectToBackend:@"deviceFootPrint"];
        }
    }
    
    
}
- (void) openPreSessionExpireDialog
{
    sessExpire = [[UIAlertView alloc]initWithTitle:@"Continue working" message:@"Session is about to expire. Please click on the Continue Working to continue"  delegate:self cancelButtonTitle:@"Continue Working" otherButtonTitles:nil];
    sessExpire.tag = 102;
    [sessExpire show];
}
- (void) openSessionExpireDialog
{
    UIAlertView *sessionAlert=[[UIAlertView alloc]initWithTitle:@"Session Expired" message:@"Please login again to access IDFC Mobile banking App"  delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil];
    sessionAlert.tag = 101;
    [sessionAlert show];
}
-(BOOL) doesAlertViewExist {
    for (UIWindow* window in [UIApplication sharedApplication].windows) {
        NSArray* subviews = window.subviews;
        if ([subviews count] > 0) {
            
            BOOL alertBool = [[subviews objectAtIndex:0] isKindOfClass:[UIAlertView class]];
            BOOL action = [[subviews objectAtIndex:0] isKindOfClass:[UIActionSheet class]];
            
            if (alertBool || action)
                return YES;
        }
    }
    return NO;
}
- (void) resetTimeOutVaraible{
    SESSION_ALERT_TIME = 0;
}
#pragma mark - Shared AppDelegate
+ (AppDelegate *)sharedAppDelegate
{
    return (AppDelegate *)[[UIApplication sharedApplication] delegate];
}


#pragma mark  - Submit device footprint

-(void) connectToBackend: (NSString*) requestType{
    if (![WebService_API checkConnectivity]) {
        
        self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
        UIColor * tintColor = [UIColor whiteColor];
        [self.window setTintColor:tintColor];
        [self.window setBackgroundColor:tintColor];
        [self.window setRootViewController:[self initialViewController]];
        [self.window makeKeyAndVisible];
        
        
        alert = [[UIAlertView alloc] initWithTitle:@"Error"
                                           message:@"No network connection."
                                          delegate:self
                                 cancelButtonTitle:nil
                                 otherButtonTitles:@"SETTINGS", @"RETRY", nil];
        alert.tag= ErrTAG;
        [alert show];
    }  else {
        NSDictionary *jsonDict;
        
        if([requestType isEqualToString:@"deviceFootPrint"]){
            GetDeviceFootprint *apiJSON = [[GetDeviceFootprint alloc]init];
            jsonDict =[WebService_API getResponseFromServerServiceName:@"deviceFootPrint"
                                                           serviceData:(NSData *)[apiJSON splashAPI_Body_JSON]];
        }else if ([requestType isEqualToString:@"userPreference"]){
            GetDeviceFootprint *apiJSON = [[GetDeviceFootprint alloc]init];
            BOOL notificationFlagBool = [[UIApplication sharedApplication] isRegisteredForRemoteNotifications];
            NSString *notificationFlag = @"false";
            if(notificationFlagBool){
                notificationFlag = @"true";
            }
            NSString *notificationTokenValue = [[NSUserDefaults standardUserDefaults]valueForKey:PUSH_NOTIFICATION_TOKEN];
            NSString *smsReadingFlag = @"false";
            NSString *bioAuthFlag = [[NSUserDefaults standardUserDefaults] valueForKey:FP_SETUP_FLAG];
            if([bioAuthFlag isKindOfClass:[NSNull class]] || bioAuthFlag == nil || bioAuthFlag == NULL){
                bioAuthFlag =@"false";
            }else{
                bioAuthFlag = @"true";
            }
            NSString *bioAuthToken = [[NSUserDefaults standardUserDefaults]valueForKey:FP_TOKEN];
            if([bioAuthToken isKindOfClass:[NSNull class]] || bioAuthToken == nil || bioAuthToken == NULL || [bioAuthToken isEqualToString:@""]){
                bioAuthToken =@"not available";
            }
            
            jsonDict =[WebService_API getResponseFromServerServiceNameFormPost:@"userPreference"
                                                                   serviceData:(NSString*)[apiJSON userPreference_Body_JSON]
                                                              notificationFlag:notificationFlag
                                                             notificationToken:notificationTokenValue
                                                                smsReadingFlag:smsReadingFlag
                                                                   bioAuthFlag:bioAuthFlag
                                                                  bioAuthToken:bioAuthToken];
        }
        
        if (jsonDict == nil) {
            
            self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
            UIColor * tintColor = [UIColor whiteColor];
            [self.window setTintColor:tintColor];
            [self.window setBackgroundColor:tintColor];
            [self.window setRootViewController:[self initialViewController]];
            [self.window makeKeyAndVisible];
            
            
            //25-07-2017 Kini check Device Footprint asynchronously
            
            //[self connectToBackend:@"deviceFootPrint"];
            
            alert = [[UIAlertView alloc] initWithTitle:@"Sorry our machines our not working. Humans are trying to fixing the problem."
                                               message:@""
                                              delegate:nil
                                     cancelButtonTitle:@"OK"
                                     otherButtonTitles:nil];
            [alert show];
            
            
        } else {
            gotDeviceFootPrint = true;
            
            NSString *hostStatus = [jsonDict valueForKeyPath:@"msgHeader.hostStatus"];
            if([hostStatus isEqualToString:@"E"]){
                NSString *errorCode = [jsonDict valueForKeyPath:@"msgHeader.error.errorCode"];
                NSString *errorDesc = [jsonDict valueForKeyPath:@"msgHeader.error.errorDesc"];
                alert = [[UIAlertView alloc] initWithTitle:[NSString stringWithFormat:@" Error Code = %@",errorCode]
                                                   message:[NSString stringWithFormat:@"%@",errorDesc]
                                                  delegate:nil
                                         cancelButtonTitle:@"OK"
                                         otherButtonTitles:nil];
                [alert show];
            }else if([hostStatus isEqualToString:@"S"]){
                NSString *appVersionStatus = [jsonDict valueForKeyPath:@"data.appVersionStatus"];
                if(appVersionStatus == nil || appVersionStatus == NULL || [appVersionStatus isKindOfClass:[NSNull class]])
                    appVersionStatus=@"L";
                
                NSString *newVersionDescription = [jsonDict valueForKeyPath:@"data.newVersionDescription"];
                if(newVersionDescription == nil || newVersionDescription == NULL || [newVersionDescription isKindOfClass:[NSNull class]])
                    newVersionDescription =@"";
                
                NSString *activeVersionNo = [jsonDict valueForKeyPath:@"data.activeVersionNo"];
                if(activeVersionNo == nil || activeVersionNo == NULL || [activeVersionNo isKindOfClass:[NSNull class]])
                    activeVersionNo =@"";
                NSString *gracePeriod = [jsonDict valueForKeyPath:@"data.gracePeriod"];
                if(gracePeriod == nil | gracePeriod == NULL || [gracePeriod isKindOfClass:[NSNull class]])
                    gracePeriod = @"";
                
                NSString *appUpgradeMessage = [jsonDict valueForKeyPath:@"data.appUpgradeMessage"];
                if(appUpgradeMessage == nil | appUpgradeMessage == NULL || [appUpgradeMessage isKindOfClass:[NSNull class]])
                    appUpgradeMessage = @"";
                
                NSString *appDownloadLink = [jsonDict valueForKeyPath:@"data.appDownloadLink"];
                if(appDownloadLink == nil | appDownloadLink == NULL || [appDownloadLink isKindOfClass:[NSNull class]])
                    appDownloadLink = @"";
                
                NSNumber *deviceBlockFlagBool = (NSNumber*)[jsonDict valueForKeyPath:@"data.deviceBlockFlag"];
                NSString *deviceBlockFlag = @"";
                
                if([deviceBlockFlagBool boolValue]== true)
                    deviceBlockFlag = @"true";
                else  if ([deviceBlockFlagBool boolValue]== false)
                    deviceBlockFlag =@"false";
                
                NSString *deviceBLockErrMsg = [jsonDict valueForKeyPath:@"data.deviceBLockErrMsg"];
                if(deviceBLockErrMsg == nil | deviceBLockErrMsg == NULL || [deviceBLockErrMsg isKindOfClass:[NSNull class]])
                    deviceBLockErrMsg = @"";
                
                
                
                
                
                [[NSUserDefaults standardUserDefaults] setValue:appVersionStatus forKey:APP_VERSION_STATUS];
                [[NSUserDefaults standardUserDefaults] setValue:newVersionDescription forKey:NEW_VERSION_DESCRIPTION];
                [[NSUserDefaults standardUserDefaults] setValue:activeVersionNo forKey:ACTIVE_VERSION_NO];
                [[NSUserDefaults standardUserDefaults] setValue:gracePeriod forKey:GRACE_PERIOD];
                [[NSUserDefaults standardUserDefaults] setValue:appUpgradeMessage forKey:VERSION_UPGRADE_MESSAGE];
                [[NSUserDefaults standardUserDefaults] setValue:appDownloadLink forKey:APP_DOWNLOAD_LINK];
                [[NSUserDefaults standardUserDefaults] setValue:deviceBlockFlag forKey:IS_BLACK_LISTED];
                [[NSUserDefaults standardUserDefaults] setValue:deviceBLockErrMsg forKey:BLACKLIST_MESSAGE];
                
                
                //Mobile 2.5 checking app version before loading backbase
                [self checkAppVersion];
                
                //                if([requestType isEqualToString:@"deviceFootPrint"]){
                //                    [self setupBackbaseCXP];
                //                }
                
                /** Mobile 2.5 end **/
            }
        }
    }
}

/** Mobile 2.5 **/
/** Check App version before launching backbase **/

-(void) checkAppVersion{
    
    //check device blacklisted
    NSString *deviceBlacklisted = [[NSUserDefaults standardUserDefaults] valueForKey:IS_BLACK_LISTED];
    NSString *appVersionStatus = [[NSUserDefaults standardUserDefaults] valueForKey:APP_VERSION_STATUS];
    if([deviceBlacklisted isEqualToString:@"true"]){
        NSString *blackListMessage = [[NSUserDefaults standardUserDefaults] valueForKey:BLACKLIST_MESSAGE];
        
        [self showPopup:@"DVCEBLCKLIST" withMessage:blackListMessage];
    }
    //Check if app is deprecated
    else if([appVersionStatus isEqualToString:@"D"]){
        NSString* gracePeriod = [[NSUserDefaults standardUserDefaults] valueForKey:GRACE_PERIOD];
        //Check if grace period is over
        if([gracePeriod isEqualToString:@""] || ![gracePeriod isEqualToString:@"0"]){
            NSString *message = [NSString stringWithFormat:@"New App version %@ is available for download.Download now to get the best version of this App.",[[NSUserDefaults standardUserDefaults] valueForKey:ACTIVE_VERSION_NO]];
            NSString *data = @"APPUPWTHNGP";
            [self showPopup3:data withMessage:message];
            
        }
        else if([gracePeriod isEqualToString:@"0"]){
            NSString *message = [NSString stringWithFormat:@"Your App version is too old! We are better now.Download our New App version %@ now to continue using the App.'",[[NSUserDefaults standardUserDefaults] valueForKey:ACTIVE_VERSION_NO]];
            NSString *data = @"APPUPBYNDGP";
            [self showPopup3:data withMessage:message];
        }
        
    }
    else{
        
        [self loadBackbase];
    }
}



-(void)showPopup:(NSString*)data withMessage:(NSString*)message{
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    UIColor * tintColor = [UIColor whiteColor];
    [self.window setTintColor:tintColor];
    [self.window setBackgroundColor:tintColor];
    [self.window setRootViewController:[self initialViewController]];
    [self.window makeKeyAndVisible];
    
    
    if([data isEqualToString: @"DVCEBLCKLIST"]){
        if([deviceBlacklistPopupView isEqualToString:@"false"] || [deviceBlacklistPopupView isEqualToString:@""]){
            viewDialog = [[ViewDialog alloc]init];
            UIView *view = [[[UIApplication sharedApplication] delegate] window];
            [viewDialog showInView:view animated:YES txnType:data msg:message];
        }
    }
    /** Was showing only one button - not consistennt with Adroid for Mpin register post login **/
    /** Neha Chandak **/
    else if([data isEqualToString: @"MPINREGDONE"]){
        viewDialog3 = [[ViewDialog3 alloc]init];
        UIView *view = [[[UIApplication sharedApplication] delegate] window];
        [viewDialog3 showInView:view animated:YES txnType:data msg:message];
    }
    else{
        viewDialog = [[ViewDialog alloc]init];
        UIView *view = [[[UIApplication sharedApplication] delegate] window];
        [viewDialog showInView:view animated:YES txnType:data msg:message];
    }
}


-(void)showPopup3:(NSString*)data withMessage:(NSString*)message{
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    UIColor * tintColor = [UIColor whiteColor];
    [self.window setTintColor:tintColor];
    [self.window setBackgroundColor:tintColor];
    [self.window setRootViewController:[self initialViewController]];
    [self.window makeKeyAndVisible];
    
    // NSString *data = notifcation.userInfo[@"data"];
    //NSString *message = notifcation.userInfo[@"message"];
    if([data isEqualToString:@"APPUPWTHNGP"]){
        
        if([appversionpopupview isEqualToString:@"false"] || [appversionpopupview isEqualToString:@""]){
            appversionpopupview=@"true";
            viewDialog3 = [[ViewDialog3 alloc]init];
            UIView *view = [[[UIApplication sharedApplication] delegate] window];
            [viewDialog3 showInView:view animated:YES txnType:data msg:message];
        }
    }else if([data isEqualToString:@"APPUPBYNDGP"]){
        if([appversionpopupview isEqualToString:@"false"] || [appversionpopupview isEqualToString:@""]){
            appversionpopupview=@"true";
            viewDialog3 = [[ViewDialog3 alloc]init];
            UIView *view = [[[UIApplication sharedApplication] delegate] window];
            [viewDialog3 showInView:view animated:YES txnType:data msg:message];
        }
    }else{
        viewDialog3 = [[ViewDialog3 alloc]init];
        UIView *view = [[[UIApplication sharedApplication] delegate] window];
        [viewDialog3 showInView:view animated:YES txnType:data msg:message];
    }
}

-(void) loadBackbase{
    [self setupBackbaseBackbase];
}


/** Check ap version before launching backbase **/
/** Mobile 2.5 **/


#pragma mark -- Custom Firebase code

-(void)tokenRefreshCallback :(NSNotification *)notification{
    
    NSString *refreshedToken = [[FIRInstanceID instanceID]token];
    NSLog(@"Rrefreshed Token: %@",refreshedToken);
    
    [[NSUserDefaults standardUserDefaults] setValue:refreshedToken forKey:PUSH_NOTIFICATION_TOKEN];
    NSLog(@"Token from shared preference: %@",[[NSUserDefaults standardUserDefaults]valueForKey:PUSH_NOTIFICATION_TOKEN]);
    //Connect to FCM as the connectin may have been intrupped when attempting before token
    [self connectToFirebase];
    
    //Send user preference to server
    //[self connectToBackend:@"userPreference"];
}

-(void)connectToFirebase{
    [[FIRMessaging messaging] connectWithCompletion:^(NSError * _Nullable error){
        if(error != nil){
            NSLog(@"Unable to connect to FCM. %@",error);
        }else{
            NSLog(@"Connected to FCM");
        }
    }];
}


#pragma mark -- 3D touch options

-(void)application:(UIApplication *)application performActionForShortcutItem:(UIApplicationShortcutItem *)shortcutItem completionHandler:(void (^)(BOOL))completionHandler{
    
    
    if([shortcutItem.type isEqualToString:@"com.idfcbank.mobileBanking.viewBalance"] && ![self.userName isEqualToString:@"Guest"]){
        if([[NSUserDefaults standardUserDefaults] valueForKey:ACCOUNTS3D_VALUE]){
            [self loadViewControllerForId:[[NSUserDefaults standardUserDefaults] valueForKey:ACCOUNTS3D_VALUE]];
        }
        else{
            [[NSUserDefaults standardUserDefaults] setValue:@"MY ACCOUNTS" forKey:TOUCH3D_VALUE];
        }
    }
    else if([shortcutItem.type isEqualToString:@"com.idfcbank.mobileBanking.fundsTransfer"] && ![self.userName isEqualToString:@"Guest"]){
        if([[NSUserDefaults standardUserDefaults] valueForKey:FUNDSTRANSFER3D_VALUE]){
            [self loadViewControllerForId:[[NSUserDefaults standardUserDefaults] valueForKey:FUNDSTRANSFER3D_VALUE]];
        }
        else{
            [[NSUserDefaults standardUserDefaults] setValue:@"FUNDS TRANSFER" forKey:TOUCH3D_VALUE];
        }
        
    }
    else if([shortcutItem.type isEqualToString:@"com.idfcbank.mobileBanking.billPay"] && ![self.userName isEqualToString:@"Guest"]){
        if([[NSUserDefaults standardUserDefaults] valueForKey:BILLPAY3D_VALUE]){
            [self loadViewControllerForId:[[NSUserDefaults standardUserDefaults] valueForKey:BILLPAY3D_VALUE]];
        }
        else{
            [[NSUserDefaults standardUserDefaults] setValue:@"BILL PAY" forKey:TOUCH3D_VALUE];
        }
    }
    if([shortcutItem.type isEqualToString:@"com.idfcbank.mobileBanking.quickPay"] && ![self.userName isEqualToString:@"Guest"]){
        if([[NSUserDefaults standardUserDefaults] valueForKey:QUICKPAY3D_VALUE]){
            [self loadViewControllerForId:[[NSUserDefaults standardUserDefaults] valueForKey:QUICKPAY3D_VALUE]];
        }
        else{
            [[NSUserDefaults standardUserDefaults] setValue:@"QUICK PAY" forKey:TOUCH3D_VALUE];
        }
    }
    
}

#pragma mark - Web Utils
+(void)disableDefaultActionSheetForWeb:(UIWebView *)webView {
    if (webView != nil) {
        webView.dataDetectorTypes = UIDataDetectorTypeNone ;
    }
}

-(void)closeApp:(NSNotification*)notification{
    exit(0);
}


@end
