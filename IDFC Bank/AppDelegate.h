
//
//  AppDelegate.h
//  IDFC Retail Banking
//
//  Created by Backbase R&D B.V.
//

#import <UIKit/UIKit.h>
#import "ViewDialog.h"
#import "ViewDialog3.h"
#import "mVisaQrReader.h"
#import "CXPViewController.h"

@class MobileAPI;

@interface AppDelegate : UIResponder <UIApplicationDelegate, ModelDelegate, SecurityViolationDelegate, UIAlertViewDelegate>
{
    UIActivityIndicatorView *spinner;
    NSTimer *timer;
    int SESSION_ALERT_TIME, CURRENT_RUNNING_TIMER;
    UIAlertView *sessExpire;
    bool gotDeviceFootPrint;
    
    //RSA-Mobile
    MobileAPI *mMobileAPI;
    BOOL mMobileAPIInitialized;
    NSString *mJSONInfoString;
    int mConfiguration;
}

@property (strong, nonatomic) UIWindow *window;
@property (nonatomic, strong, readonly) NSObject<Model> *model;
@property (strong, nonatomic) NSString *userName;
@property (strong, nonatomic) NSString *lastlogin;
@property (nonatomic, strong) ViewDialog *viewDialog;
@property (nonatomic, strong) ViewDialog3 *viewDialog3;
@property (nonatomic,strong) NSString *appversionpopupview;
@property (nonatomic, strong) NSString *deviceBlacklistPopupView;

#pragma mark - mVisa
@property (nonatomic, strong) mVisaQrReader *mVisaQrReaderObject;
@property (nonatomic,strong) CXPViewController *cxpViewControllerObject;
-(void)hideQrCode:(NSNotification*)notification;

+ (AppDelegate *)sharedAppDelegate;
- (void)loadViewControllerForId:(NSString *)widgetId;
- (void) resetTimeOutVaraible;
- (UIActivityIndicatorView *)loadSpinner;
- (void) stopSpinner;
- (void)handleLogOut:(NSNotification *)notification;
- (void)stopTimer;
- (void)loadBackbase;
- (void)logoutUserAndClearSession:(NSNotification *)notification;


#pragma mark - Web Utils
+(void)disableDefaultActionSheetForWeb:(UIWebView *)webView;
    
@end
