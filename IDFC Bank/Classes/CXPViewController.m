	//
//  CXPViewController.m
//  IDFC Retail Banking
//
//  Created by Backbase R&D B.V.
//

#import "CXPViewController.h"
#import "UIViewController+MMDrawerController.h"
#import "MMDrawerBarButtonItem.h"
#import "Reachability.h"
#import "MMExampleLeftSideMenuDrawerViewController.h"
#import "MMNavigationController.h"
#import "AppDelegate.h"
#import "constant.h"
#import "GlobalVariables.h"
#import "ViewDialog.h"

@interface CXPViewController()
@property (strong,nonatomic) UIWebView *cxpWebView;
@end

@implementation CXPViewController
@synthesize pageName;

- (id)initWithRenderable:(NSObject<Renderable> *)renderable {
    self = [super init];
    if (self) {
        
        _page = renderable;
        
    }
    return self;
}

- (void)dealloc {
    // Unregister any observers
    _cxpWebView = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    Reachability *reach = [Reachability reachabilityForInternetConnection];
    [reach startNotifier];
    self.view.backgroundColor = [UIColor whiteColor];
    [self setupLogoutAndNotification];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(reachabilityDidChange:) name:kReachabilityChangedNotification object:reach];
    [[NSNotificationCenter defaultCenter] postNotificationName:kReachabilityChangedNotification object:reach];
    
    
    
    if([[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"LOGOUT"]){
        
        [self.navigationController setNavigationBarHidden:YES];
        [self.navigationItem setLeftBarButtonItems:nil animated:YES];
        [self.mm_drawerController setOpenDrawerGestureModeMask:MMOpenDrawerGestureModeNone];
        [self.mm_drawerController setCloseDrawerGestureModeMask:MMCloseDrawerGestureModeNone];
        
        
        /* To Keep Status Bar Static */
        if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 7.0) {
            CGRect screen = [[UIScreen mainScreen] bounds];
            if (self.navigationController) {
                CGRect frame = self.navigationController.view.frame;
                frame.origin.y = 20;
                frame.size.height = screen.size.height - 20;
                self.navigationController.view.frame = frame;
            } else {
                if ([self respondsToSelector: @selector(containerView)]) {
                    UIView *containerView = (UIView *)[self performSelector: @selector(containerView)];
                    
                    CGRect frame = containerView.frame;
                    frame.origin.y = 20;
                    frame.size.height = screen.size.height - 20;
                    containerView.frame = frame;
                } else {
                    CGRect frame = self.view.frame;
                    frame.origin.y = 20;
                    frame.size.height = screen.size.height - 20;
                    self.view.frame = frame;
                }
            }
        }
    }
    
    
    if([[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"SIGN IN"] ){
       
        MMDrawerBarButtonItem * leftDrawerButton = [[MMDrawerBarButtonItem alloc] initWithTarget:self action:@selector(leftDrawerButtonPress:)];
        [leftDrawerButton setTintColor:[UIColor colorWithRed:201.0/255.0 green:139.0/255.0 blue:219.0/255.0 alpha:1]];
        //Change for Phase 4
        UIImage *logImage = [UIImage imageNamed:@"idfcLogo"];
        UIImageView *logoView = [[UIImageView alloc]initWithImage:logImage];
        
        self.navigationItem.titleView = logoView;
        //Change for Phase 4
        [self.navigationItem setLeftBarButtonItem:leftDrawerButton animated:YES];
        [self setupNavigationBarTransparency];
        [self setupNavigationColorWhite];
        [self.mm_drawerController setOpenDrawerGestureModeMask:MMOpenDrawerGestureModeAll];
        [self.mm_drawerController setCloseDrawerGestureModeMask:MMCloseDrawerGestureModeAll];
        [self.navigationController.navigationBar setShadowImage:[[UIImage alloc] init]];
        [self.navigationController.navigationBar setBackgroundImage:[[UIImage alloc]init] forBarMetrics:UIBarMetricsDefault];
         self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"notifications.png"] style:UIBarButtonItemStylePlain target:self action:@selector(notificationPressed:)];
        [self.navigationItem.rightBarButtonItem setTintColor:[UIColor colorWithRed:201.0/255.0 green:139.0/255.0 blue:219.0/255.0 alpha:1]];

        
        
        
        CGRect navFrame = self.navigationController.navigationBar.frame;
        navFrame.size.height = navFrame.size.height - 20;
//        navFrame.origin.y = 20;
        self.navigationController.navigationBar.frame = navFrame;
        
        /* To Keep Status Bar Static */
        if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 7.0) {
            CGRect screen = [[UIScreen mainScreen] bounds];
            if (self.navigationController) {
                CGRect frame = self.navigationController.view.frame;
                //Neha commented this
                frame.origin.y = 20;
                frame.size.height = screen.size.height - 20;
                self.navigationController.view.frame = frame;
            } else {
                if ([self respondsToSelector: @selector(containerView)]) {
                    UIView *containerView = (UIView *)[self performSelector: @selector(containerView)];
                    
                    CGRect frame = containerView.frame;
                    frame.origin.y = 20;
                    frame.size.height = screen.size.height - 20;
                    containerView.frame = frame;
                } else {
                    CGRect frame = self.view.frame;
                    frame.origin.y = 20;
                    frame.size.height = screen.size.height - 20;
                    self.view.frame = frame;
                }
            }
        }
        
    }
    else if(([[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"MPIN LOGIN"])){
        MMDrawerBarButtonItem * leftDrawerButton = [[MMDrawerBarButtonItem alloc] initWithTarget:self action:@selector(leftDrawerButtonPress:)];
        [leftDrawerButton setTintColor:[UIColor colorWithRed:201.0/255.0 green:139.0/255.0 blue:219.0/255.0 alpha:1]];
        UIImage *logImage = [UIImage imageNamed:@"idfcLogo"];
        UIImageView *logoView = [[UIImageView alloc]initWithImage:logImage];
        self.navigationItem.titleView = logoView;
        [self.navigationItem setLeftBarButtonItem:leftDrawerButton animated:YES];
        [self setupNavigationBarTransparency];
        [self setupNavigationColorWhite];
        [self.mm_drawerController setOpenDrawerGestureModeMask:MMOpenDrawerGestureModeAll];
        [self.mm_drawerController setCloseDrawerGestureModeMask:MMCloseDrawerGestureModeAll];
        [self.navigationController.navigationBar setShadowImage:[[UIImage alloc] init]];
        [self.navigationController.navigationBar setBackgroundImage:[[UIImage alloc]init] forBarMetrics:UIBarMetricsDefault];
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"notifications.png"] style:UIBarButtonItemStylePlain target:self action:@selector(notificationPressed:)];
        [self.navigationItem.rightBarButtonItem setTintColor:[UIColor colorWithRed:201.0/255.0 green:139.0/255.0 blue:219.0/255.0 alpha:1]];
        
        CGRect navFrame = self.navigationController.navigationBar.frame;
        navFrame.size.height = navFrame.size.height - 20;
//        navFrame.origin.y = 20;
        self.navigationController.navigationBar.frame = navFrame;

        /* To Keep Status Bar Static */
        if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 7.0) {
            CGRect screen = [[UIScreen mainScreen] bounds];
            if (self.navigationController) {
                CGRect frame = self.navigationController.view.frame;
                frame.origin.y = 20;
                frame.size.height = screen.size.height - 20;
                self.navigationController.view.frame = frame;
            } else {
                if ([self respondsToSelector: @selector(containerView)]) {
                    UIView *containerView = (UIView *)[self performSelector: @selector(containerView)];
                    
                    CGRect frame = containerView.frame;
                    frame.origin.y = 20;
                    frame.size.height = screen.size.height - 20;
                    containerView.frame = frame;
                } else {
                    CGRect frame = self.view.frame;
                    frame.origin.y = 20;
                    frame.size.height = screen.size.height - 20;
                    self.view.frame = frame;
                }
            }
        }
        
    }
    else if(([[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"MARKETING"]) || ([[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"LOGOUTMARKETING"]) || ([[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"LOGOUT"])){
        
        CGRect navFrame = self.navigationController.navigationBar.frame;
        navFrame.size.height = navFrame.size.height - 20;
        //        navFrame.origin.y = 20;
        self.navigationController.navigationBar.frame = navFrame;
        
        /* To Keep Status Bar Static */
        if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 7.0) {
            CGRect screen = [[UIScreen mainScreen] bounds];
            if (self.navigationController) {
                CGRect frame = self.navigationController.view.frame;
                //Neha commented this
                frame.origin.y = 20;
                frame.size.height = screen.size.height - 20;
                self.navigationController.view.frame = frame;
            } else {
                if ([self respondsToSelector: @selector(containerView)]) {
                    UIView *containerView = (UIView *)[self performSelector: @selector(containerView)];
                    
                    CGRect frame = containerView.frame;
                    frame.origin.y = 20;
                    frame.size.height = screen.size.height - 20;
                    containerView.frame = frame;
                } else {
                    CGRect frame = self.view.frame;
                    frame.origin.y = 20;
                    frame.size.height = screen.size.height - 20;
                    self.view.frame = frame;
                }
            }
        }
        [self.navigationController setNavigationBarHidden:YES];
        [self.navigationItem setLeftBarButtonItems:nil animated:YES];
        [self.mm_drawerController setOpenDrawerGestureModeMask:MMOpenDrawerGestureModeNone];
        [self.mm_drawerController setCloseDrawerGestureModeMask:MMCloseDrawerGestureModeNone];
        [self.navigationController.navigationBar setShadowImage:[[UIImage alloc] init]];
        [self.navigationController.navigationBar setBackgroundImage:[[UIImage alloc]init] forBarMetrics:UIBarMetricsDefault];
    }else{
        
        self.navigationController.navigationBar.topItem.title = [self.page.allPreferences valueForKey:@"title"];
        NSLog(@"Page Name- %@",self.page.itemName);
        [self setupNavigationBarTransparency];
        [self setupNavigationColor];
    //        /** Mobile 2.5**/
//        if([[self.page.itemName uppercaseString] isEqualToString:@"VIEW/PAY BILLS"]){
//            
//            UIBarButtonItem *addButton = [[UIBarButtonItem alloc]
//                                          
//                                          initWithBarButtonSystemItem:UIBarButtonSystemItemAdd
//                                          
//                                          target:self action:@selector(addPayButtonPressed:)];
//            
//            self.navigationItem.rightBarButtonItem = addButton;
//            [self.navigationController.navigationBar setShadowImage:[[UIImage alloc] init]];
//            [self.navigationController.navigationBar setBackgroundImage:[[UIImage alloc]init] forBarMetrics:UIBarMetricsDefault];
//            
//        }else
        /** end **/
            
        if([[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"NOTIFICATIONS"]){
            self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"" style:UIBarButtonItemStylePlain target:nil action:nil];
            [self.navigationController.navigationBar setShadowImage:[[UIImage alloc] init]];
            [self.navigationController.navigationBar setBackgroundImage:[[UIImage alloc]init] forBarMetrics:UIBarMetricsDefault];
            
        }
        else{
//            self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"" style:UIBarButtonItemStylePlain target:nil action:nil];

            [self.navigationController.navigationBar setShadowImage:[[UIImage alloc] init]];
            [self.navigationController.navigationBar setBackgroundImage:[[UIImage alloc]init] forBarMetrics:UIBarMetricsDefault];
        }
        
        
        
        // Set background image if presented/Users/admin/Desktop/Infosys_Mobility_Team/Yash/29 feb/New Text Document.txt
        NSString *background = [self.page preferenceForKey:@"background"];
        if (background) {
            UIImage *image = [UIImage imageNamed:background];
            if (image) {
                UIImageView *backgroundImageView = [[UIImageView alloc] initWithImage:image];
                backgroundImageView.contentMode = UIViewContentModeScaleAspectFill;
                backgroundImageView.frame = self.view.bounds;
                backgroundImageView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
                backgroundImageView.clipsToBounds = YES;
                [self.view addSubview:backgroundImageView];
            }
        }
        
        if ([self respondsToSelector:@selector(edgesForExtendedLayout)])
            self.edgesForExtendedLayout = UIRectEdgeNone;   // iOS 7 specific
        
        // To show Gesture on all pages
        /** mVisa - Block left swipe **/
        if([[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"SCAN AND PAY"] || [[[self.page.allPreferences valueForKey:@"title"] uppercaseString] isEqualToString:@"CARD SELECTION"]){
            NSLog(@"Blocked Swipe");
            [self.mm_drawerController setOpenDrawerGestureModeMask:MMOpenDrawerGestureModeNone];
            [self.mm_drawerController setCloseDrawerGestureModeMask:MMCloseDrawerGestureModeNone];
        }else{
            NSLog(@"Unblocked Swipe");
            [self.mm_drawerController setOpenDrawerGestureModeMask:MMOpenDrawerGestureModeAll];
            [self.mm_drawerController setCloseDrawerGestureModeMask:MMCloseDrawerGestureModeAll];
        }
        
        //tab gesture added
        UITapGestureRecognizer * doubleTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(doubleTap:)];
        [doubleTap setNumberOfTapsRequired:2];
        [self.view addGestureRecognizer:doubleTap];
        
        // Register observer that set back button from user
        [Backbase registerObserver:self
                     selector:@selector(handleBack:)
                     forEvent:@"js.back"];

        

        
        
        if([self.navigationController.viewControllers count] == 1)  {
            //Current view controller is root controller
            [self setupLeftMenuButton];
        }else{
            // Create the title of the tab bar.
            [self setupBackButton];
        }
    }
}

-(void)setupLogoutAndNotification{
    if (([AppDelegate sharedAppDelegate].userName != nil) && !([[AppDelegate sharedAppDelegate].userName isEqualToString:@"Guest"]) )
    {
        //Setup logout button
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"logout_img.png"] style:UIBarButtonItemStylePlain target:self action:@selector(showLogoutPopup:)];
    }else{
        //Setup Navigation
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"notifications.png"] style:UIBarButtonItemStylePlain target:self action:@selector(notificationPressed:)];
    }
}

/*** Mobile 2.5 ***/
/*** Show Logout popup ***/

-(void) showLogoutPopup:(id)sender{
    UIAlertView *toast = [[UIAlertView alloc] initWithTitle:@"Logout"
                                                    message:@"Are you sure you want to Logout"
                                                   delegate:self
                                          cancelButtonTitle:nil
                                          otherButtonTitles:@"Yes", @"No", nil];
    toast.tag = 101;
    [toast show];
}


- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    //  the user clicked one of the OK/Cancel buttons
    if(alertView.tag == 101)
    {
        if (buttonIndex == 0){
            [self logoutPressed:nil];
        }
    }
}

/*** Mobile 2.5 end ***/



-(void)logoutPressed:(id)sender{
    //This method get after pressed + right bar button
    //
    //[[AppDelegate sharedAppDelegate] stopTimer];
    //[[AppDelegate sharedAppDelegate] logoutUserAndClearSession];
    
    
    /*Mobile 2.5 3D Touch*/
/*    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:TOUCH3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:BILLPAY3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:ACCOUNTS3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:FUNDSTRANSFER3D_VALUE];
    [[NSUserDefaults standardUserDefaults] setValue:nil forKey:QUICKPAY3D_VALUE];*/

    [[AppDelegate sharedAppDelegate] loadViewControllerForId:[[NSUserDefaults standardUserDefaults] valueForKey:PAGE_LOGOUT]];
}

-(void)notificationPressed:(id)sender{
    //This method get after pressed + right bar button
    
    [[AppDelegate sharedAppDelegate] hideQrCode:nil];
    
    [[AppDelegate sharedAppDelegate] loadViewControllerForId:[[NSUserDefaults standardUserDefaults] valueForKey:PAGE_NOTIFICATIONS]];
}

- (void)setupNavigationBarTransparency {
    self.automaticallyAdjustsScrollViewInsets = YES;
}
- (void) setupNavigationColor{
    [self.navigationController.navigationBar setTitleTextAttributes:
     @{NSForegroundColorAttributeName:[UIColor whiteColor]}];
    NSArray *ver = [[UIDevice currentDevice].systemVersion componentsSeparatedByString:@"."];
    if ([[ver objectAtIndex:0] intValue] >= 7) {
        self.navigationController.navigationBar.barTintColor = [UIColor colorWithRed:0.788 green:0.545 blue:0.859 alpha:1]; /*#c98bdb*/
        self.navigationController.navigationBar.translucent = NO;
    }else{
        self.navigationController.navigationBar.tintColor =[UIColor colorWithRed:0.788 green:0.545 blue:0.859 alpha:1]; /*#c98bdb*/
    }
}

- (void) setupNavigationColorWhite{
    [self.navigationController.navigationBar setTitleTextAttributes:
     @{NSForegroundColorAttributeName:[UIColor whiteColor]}];
    NSArray *ver = [[UIDevice currentDevice].systemVersion componentsSeparatedByString:@"."];
    if ([[ver objectAtIndex:0] intValue] >= 7) {
        self.navigationController.navigationBar.barTintColor = [UIColor whiteColor];
        self.navigationController.navigationBar.translucent = NO;
    }else{
        self.navigationController.navigationBar.tintColor =[UIColor whiteColor];
    }
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    
    NSObject<Renderable> *renderableObject = [self.page itemChildren][0];
    
    // Create renderer
    NSError *error = nil;
    _renderer = [BBRendererFactory rendererForItem:renderableObject error:&error];
    if (error || !_renderer) {
        [Backbase logError:self
              message:[NSString stringWithFormat:@"Error while creating renderer: %@",
                       error.localizedDescription ?: @"Unknown error"]];
        return;
    }
    
    [_renderer enableBouncing:false];
    
    
    // Render page
    
    BOOL result = [_renderer start:self.view error:&error];
    
    if (!result || error) {
        [Backbase logError:self
              message:[NSString stringWithFormat:@"Error while loading page: %@",
                       error.localizedDescription ?: @"Unknown error"]];
        return;
    }
    
    /** mVisa - js.back not working so trying a different implementation **/
    [Backbase registerObserver:self
                 selector:@selector(handleBack:)
                 forEvent:@"handleMvisaBack"];
}
    
-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    if (_cxpWebView == nil) {
        for (id aView in self.view.subviews) {
            NSLog(@"%@",[[aView class] description]);
            if ([aView isKindOfClass:[UIWebView class]]) {
                _cxpWebView = aView;
            }
        }
        [AppDelegate disableDefaultActionSheetForWeb:_cxpWebView];
    }
}
    
-(void)setupLeftMenuButton{
    MMDrawerBarButtonItem * leftDrawerButton = [[MMDrawerBarButtonItem alloc] initWithTarget:self action:@selector(leftDrawerButtonPress:)];
    
    [self.navigationItem setLeftBarButtonItem:leftDrawerButton animated:YES];
}
-(void)setupBackButton{
    UIBarButtonItem *backBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"BackButton.png"] style:UIBarButtonItemStylePlain target:self action:@selector(leftDrawerBackButtonPress:)];
    
    [self.navigationItem setLeftBarButtonItem:backBarButtonItem animated:YES];
}

/** MVisa Backbtn purple **/
-(void)setupBackButtonPurple{
    UIBarButtonItem *backBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"BackButton.png"] style:UIBarButtonItemStylePlain target:self action:@selector(leftDrawerBackButtonPress:)];
    [backBarButtonItem setTintColor:[UIColor colorWithRed:0.788 green:0.545 blue:0.859 alpha:1]];
    
    [self.navigationItem setLeftBarButtonItem:backBarButtonItem animated:YES];
}

-(void) changeNavBarTitle:(NSString *)title{
    self.navigationController.navigationBar.topItem.title = title;
}

/** MVisa end **/

#pragma mark - Back Button Navigation
-(void)handleBack:(NSNotification *)notification{
    NSString *temp = [[notification userInfo] objectForKey:@"data"];
    NSString *trackId = [[notification userInfo] objectForKey:@"trSerID"];
    if([temp isEqual:@"ENABLE_HOME"]){
        [self setupLeftMenuButton];
        
    }
    /** mVisa - Show Back btn on mpin login and login page **/
    else if([temp isEqual:@"ENABLE_BACK_PURPLE"]){
        [self setupBackButtonPurple];
        [self.mm_drawerController setOpenDrawerGestureModeMask:MMOpenDrawerGestureModeNone];
        [self.mm_drawerController setCloseDrawerGestureModeMask:MMCloseDrawerGestureModeNone];
    }
    else{
        [self setupBackButton];
    }
    
    if ([trackId length]>0) {
        self.navigationController.navigationBar.topItem.title = trackId;
    }
}


#pragma mark - Button Handlers
-(void)leftDrawerButtonPress:(id)sender{
    [self.mm_drawerController toggleDrawerSide:MMDrawerSideLeft animated:YES completion:^(BOOL finished){
        //[self startTransparentProcess];
    }];
}
-(void)leftDrawerBackButtonPress:(id)sender{
    [Backbase publishEvent:@"native.back" payload:@{@"data" : [self.page.allPreferences valueForKey:@"title"]}];
    
    /** mVisa 3.0 **/
    /** Pressing back on card selection page should not change item **/
    if([[self.page.allPreferences valueForKey:@"title"] isEqualToString:@"Card Selection"]){
        return;
    }
    //Parent controller navigation title changes
    //SDk 2.0 migration
    //pageName = [self.page preferenceForKey:@"name"];
    NSLog(@"%@",self.page.itemName);
    self.navigationController.navigationBar.topItem.title = [self.page.allPreferences valueForKey:@"title"];
    //self.navigationController.navigationBar.topItem.title = pageName;
    [self.navigationController popViewControllerAnimated:YES];
    [self setupLeftMenuButton];
}
-(void)doubleTap:(UITapGestureRecognizer*)gesture{
    [self.mm_drawerController bouncePreviewForDrawerSide:MMDrawerSideLeft completion:^(BOOL finished){
        //[self startTransparentProcess];
    }];
}
- (void)reachabilityDidChange:(NSNotification *)notification {
    Reachability *networkReachability = (Reachability *)[notification object];
    NetworkStatus networkStatus = [networkReachability currentReachabilityStatus];
    if (networkStatus == NotReachable) {
        [[[UIAlertView alloc]
          initWithTitle:@"No Internet Connection"
          message:
          @"Connect to the internet to use this application."
          delegate:nil
          cancelButtonTitle:@"OK"
          otherButtonTitles:nil] show];
    }
}


-(void)addPayButtonPressed:(id)sender{
    //This method get after pressed + right bar button
    [Backbase publishEvent:@"native-right-button-pressed" payload:@{@"text" : @"pressed + right bar button"}];
}

#pragma mark - Touch Action
- (void) touchesBegan:(NSSet *)touches
            withEvent:(UIEvent *)event {
    [[AppDelegate sharedAppDelegate] resetTimeOutVaraible];
}
- (void) touchesMoved:(NSSet *)touches
            withEvent:(UIEvent *)event {
    [[AppDelegate sharedAppDelegate] resetTimeOutVaraible];
}

@end
