//
//  MMExampleLeftSideMenuDrawerViewController.m
//  IDFC Retail banking
//
//  Created by mac_admin on 30/11/15.
//  Copyright © 2015 Backbase R&D B.V. All rights reserved.
//

#import "MMExampleLeftSideMenuDrawerViewController.h"
#import "MMNavigationController.h"
#import "UIViewController+MMDrawerController.h"
#import "CXPViewController.h"
#import "AppDelegate.h"
#import "GlobalVariables.h"
#import "constant.h"
#import <LocalAuthentication/LocalAuthentication.h>


@implementation MMExampleLeftSideMenuDrawerViewController

@synthesize mainMenus;
@synthesize collapsedSections;
@synthesize sitemap;

-(id)init{
    self = [super init];
    if(self){
        [self setRestorationIdentifier:@"MMExampleLeftSideMenuDrawerController"];
    }
    return self;
}

-(void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    //    [self.tableView reloadSections:[NSIndexSet indexSetWithIndexesInRange:NSMakeRange(0, self.tableView.numberOfSections-1)] withRowAnimation:UITableViewRowAnimationNone];
    
    //create a new view with the same size for transparency
    UIView *coverView = [[UIView alloc] initWithFrame:CGRectMake(self.view.bounds.origin.x, (self.mm_drawerController.centerViewController.view.bounds.origin.y - (self.mm_drawerController.centerViewController.view.bounds.origin.y-64)), self.mm_drawerController.centerViewController.view.bounds.size.width, self.mm_drawerController.centerViewController.view.bounds.size.height)];
    // change the background color to black and the opacity to 0.6
    coverView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.6];
    coverView.tag = 100;
    // add this new view to your main view
    [self.mm_drawerController.centerViewController.view addSubview:coverView];
    
    /* To Keep Status Bar Static */
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 7.0) {
        CGRect screen = [[UIScreen mainScreen] bounds];
        if (self.navigationController)
        {
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

-(void)viewDidAppear:(BOOL)animated{
    [super viewDidAppear:animated];
}

-(void)viewWillDisappear:(BOOL)animated{
    [super viewWillDisappear:animated];
    [self remvTransparent];
}

-(void)viewDidDisappear:(BOOL)animated{
    [super viewDidDisappear:animated];
}
-(void)viewDidLoad {
    [super viewDidLoad];
    GlobalVariables *globalVariables = [[GlobalVariables alloc]init];
    bool notInNavigationMar = nil;
    NSString *pageRefId = [[NSString alloc]init];
    NSString *pageMpinLoginId = [[NSString alloc]init];
    NSString *pageLogoutId = [[NSString alloc]init];
    NSString *pageIdNormalLogin = [[NSString alloc]init];
    NSString *pageIdHomeLoan = [[NSString alloc]init];
    NSString *pageIdPersonalLoan = [[NSString alloc]init];
    NSString *pageIdLAPLoan = [[NSString alloc]init];
    NSString *mpinSetup = [globalVariables getMpinSetup];
    NSString *pageNotificationId = [[NSString alloc]init];
    NSString *pageApplyNowId = [[NSString alloc]init];
    NSString *logoutMarketing = [[NSString alloc]init];
    /** mVisa **/
    /** Author - Neha Chandak **/
    NSString *mVisaLandingPage = [[NSString alloc]init];

    
    
    
    bool assetFlag = [[[NSUserDefaults standardUserDefaults] valueForKey:ASSET_FLAG] boolValue];
    bool hsFlag = [[[NSUserDefaults standardUserDefaults] valueForKey:HS_FLAG] boolValue];
    
    [self.view setUserInteractionEnabled:YES];
    //hide navigation bar
    self.navigationController.navigationBarHidden = YES;
    
    //hide status bar
    [[UIApplication sharedApplication] setStatusBarHidden:NO
                                            withAnimation:UIStatusBarAnimationFade];
    //setting status bar color to white
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleLightContent];
    
    [self.view setBackgroundColor:[UIColor whiteColor]];
    
    NSArray *mainArray = [[Backbase currentModel] siteMapItemChildrenFor:@"navroot_mainmenu"];
    //NSArray *mainArray = [[Backbase currentModel] siteMapItemChildrenFor:@"Main Navigation"];

    sitemap = [[NSMutableArray alloc] init];
    
    NSArray *notInnavigation = [[Backbase currentModel] siteMapItemChildrenFor:@"navroot_notinmenu"];
    //NSArray *notInnavigation = [[Backbase currentModel] siteMapItemChildrenFor:@"Main Navigation"];

    for (NSObject<SiteMapItemChild> *siteMapObject in notInnavigation){
        if([[siteMapObject.title uppercaseString] isEqualToString:@"MARKETING"]){
            notInNavigationMar = true;
            pageRefId = siteMapObject.itemRef;
            [[NSUserDefaults standardUserDefaults] setValue:pageRefId forKey:PAGE_REF_ID];
            break;
        }
        if([[siteMapObject.title uppercaseString] isEqualToString:@"MPIN LOGIN"]){
            pageMpinLoginId = siteMapObject.itemRef;
            [[NSUserDefaults standardUserDefaults] setValue:pageMpinLoginId forKey:PAGE_MPIN_LOGIN];
        }
        
        if([[siteMapObject.title uppercaseString] isEqualToString:@"APPLY FOR LOAN"]){
            
            pageApplyNowId = siteMapObject.itemRef;
            [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:PAGE_APPLYNOW];
            //break;
        }
        
        if([[siteMapObject.title uppercaseString] isEqualToString:@"LOGOUTMARKETING"]){
            logoutMarketing = siteMapObject.itemRef;
            [[NSUserDefaults standardUserDefaults] setValue:logoutMarketing forKey:LOGOUT_MARKETING];
            //break;
        }
        
        /** mVisa - Store page id for mVisa landing page post login **/
        /** Author - Neha Chandak **/
        if([[siteMapObject.title uppercaseString] isEqualToString:@"CARD SELECTION"]){
            mVisaLandingPage = siteMapObject.itemRef;
        }
    }
    for (NSObject<SiteMapItemChild> *siteMapObject in mainArray){
        NSLog(@"%@", [siteMapObject.title uppercaseString]);
        if([[siteMapObject.title uppercaseString] isEqualToString:@"SIGN IN"]){
            pageIdNormalLogin = siteMapObject.itemRef;
            [[NSUserDefaults standardUserDefaults] setValue:pageIdNormalLogin forKey:PAGE_NORMAL_LOGIN];
            //break;
        }
        if([[siteMapObject.title uppercaseString] isEqualToString:@"NOTIFICATIONS"]){
            pageNotificationId = siteMapObject.itemRef;
            [[NSUserDefaults standardUserDefaults] setValue:pageNotificationId forKey:PAGE_NOTIFICATIONS];
        }
        if([[siteMapObject.title uppercaseString] isEqualToString:@"LOGOUT"]){
            pageLogoutId = siteMapObject.itemRef;
            [[NSUserDefaults standardUserDefaults] setValue:pageLogoutId forKey:PAGE_LOGOUT];
        }
    }
    
    
    
    //Static array value set for transaction to hide
    //RSA-Mobile
    NSMutableArray *tempArray = [[NSMutableArray alloc] initWithObjects:@"Account Statement",@"Review Transfer",@"Contact us",@"Password Reset", nil];
    
    //RSA-Mobile - check if user logged in - "Update Challenge Question" else dont show "Update Challenge Question"
    if ([AppDelegate sharedAppDelegate].lastlogin == nil) {
        tempArray = [[NSMutableArray alloc] initWithObjects:@"Account Statement",@"Review Transfer",@"Contact us",@"Update Challenge Questions",@"Password Reset", nil];
    }
    
    //Removing Change MPIN
    if((globalVariables.getLoginType == NULL)  || !([globalVariables.getLoginType.uppercaseString isEqualToString:@"MPINLOGIN"])){
        [tempArray addObject:@"Change MPIN"];
    }
    
    
    BOOL hasTouchID = NO;
    // if the LAContext class is available
    if ([LAContext class]) {
        LAContext *context = [LAContext new];
        NSError *error = nil;
        hasTouchID = [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error];
    }
    
    if(([globalVariables.getFingerPrintSetup.uppercaseString isEqualToString:@"TRUE"]) || (![globalVariables.getLoginType isEqualToString:@"MPINLOGIN"]) || hasTouchID == NO){
        [tempArray addObject:@"Enable Fingerprint"];
    }
    //For show stopper defect
    /*
     if((globalVariables.getMpinSetup == NULL) || (globalVariables.getMpinSetup == nil)||([globalVariables.getMpinSetup.uppercaseString isEqualToString:@"MPINLOGIN"]) || ([globalVariables.getMpinSetup.uppercaseString isEqualToString:@"TRUE" ]))
     {
     [tempArray addObject:@"Setup MPIN"];
     }
     */
    
    if(([globalVariables.getLoginType.uppercaseString isEqualToString:@"MPINLOGIN"]))
    {
        [tempArray addObject:@"Setup MPIN"];
    }
    
    if((globalVariables.getMpinSetup == NULL) || ([globalVariables.getMpinSetup isEqualToString:@""]) || (![globalVariables.getMpinSetup.uppercaseString isEqualToString:@"TRUE"])){
        [tempArray addObject:@"Forgot MPIN"];
    }
    
    //ADd finger print capability check here
    /*
     String fingerPrintSetup = globalVariablePlugin.getFingerPrintSetup();
     fingerPrintPlugin fingerPrintPlugin = new fingerPrintPlugin();
     boolean fingerPrintCapable = fingerPrintPlugin.getFingerPrintCapable();
     Log.d("Finger Print Setup", fingerPrintSetup);
     Log.d("Finger Print Capable", new Boolean(fingerPrintCapable).toString());
     if (!fingerPrintCapable || (fingerPrintCapable && "true".equalsIgnoreCase(fingerPrintSetup))) {
     removePageList.add("ENABLE FINGERPRINT");
     }
     */
    
    
    // NSLog(@"Main Array %@",_mainArray);
    
    for (NSObject<SiteMapItemChild> *siteMapObject in mainArray) {
        
        
        //Check whether children pages exist or not
        //SDK 2.0 Migration
        if (![[tempArray valueForKey:@"lowercaseString"] containsObject:[siteMapObject.title lowercaseString]])
            //if (![[tempArray valueForKey:@"lowercaseString"] containsObject:[siteMapObject.title lowercaseString]])
        {
            
            [sitemap addObject:siteMapObject];
        }
    }
    
    mainMenus = [[NSMutableArray alloc] initWithCapacity:(sitemap.count+1)];
    collapsedSections = [[NSMutableArray alloc] init];
    
    //Section static added for user avatar and username
    NSMutableDictionary * menuDictionary = [[NSMutableDictionary alloc] init];
    [menuDictionary setObject:@"" forKey:@"menuTitle"];
    [menuDictionary setObject:@"" forKey:@"menuIDs"];
    NSMutableArray *subMenuArray = [[NSMutableArray alloc] init];
    [menuDictionary setObject:subMenuArray forKey:@"subMenuArray"];
    [mainMenus insertObject:menuDictionary atIndex:0];
    int mainMenuCntr = 1;
    
    for (int i = 0; i < sitemap.count; i++)
    {
        // Set icon (if available)
        NSMutableDictionary * menuDictionary = [[NSMutableDictionary alloc] init];
        [menuDictionary setObject:[[sitemap objectAtIndex:i] itemRef] forKey:@"menuIDs"];
        [menuDictionary setObject:[[sitemap objectAtIndex:i] title] forKey:@"menuTitle"];
        
        
        /*Mobile 2.5 - Stop pure asset customers from opening any liability options*/
        NSArray *siteMapChildrenObject;
        bool hideDashboard = false;
        
        
        NSString *tempAssetType = [[NSUserDefaults standardUserDefaults]  valueForKey:ASSET_TYPE];
        //NSString *menuOption = [[[sitemap objectAtIndex:i] valueForKey:@"name"] uppercaseString];
        NSString *menuOption = [[[sitemap objectAtIndex:i] valueForKey:@"title"] uppercaseString];

        /* Do not show LOAN APPLY NOW in Navigation*/
        // [menuOption isEqualToString:@"LOAN APPLY NOW"] ||
        if([menuOption isEqualToString:@"LOGOUT"] || [menuOption isEqualToString:@"LOAN APPLY NOW"] ){
            hideDashboard = true;
        }
        
        NSString *touch3DValue = [[NSUserDefaults standardUserDefaults] valueForKey:TOUCH3D_VALUE];
        NSString *subOption;
        if([touch3DValue isEqualToString:@"QUICK PAY"]){
            touch3DValue = @"BILL PAY";
            subOption = @"Quick pay";
        }
        else if ([touch3DValue isEqualToString:@"BILL PAY"]){
            subOption = @"Recharges";
            
        }
        /*In case user is a pure asset customer*/
        if(assetFlag){
            NSMutableArray *tempLiabilityArray;
            if(hsFlag){
                tempLiabilityArray = [[NSMutableArray alloc] initWithObjects:@"DASHBOARD",@"MY ACCOUNTS", nil];
            }
            else{
                tempLiabilityArray = [[NSMutableArray alloc] initWithObjects:@"DASHBOARD",@"MY ACCOUNTS", @"FUNDS TRANSFER", @"BILL PAY", @"FIXED DEPOSIT", @"RECURRING DEPOSIT", @"DEBIT CARD", @"LIMIT MANAGEMENT", nil];
            }
            
            //NSString *menuOption = [[[sitemap objectAtIndex:i] valueForKey:@"name"] uppercaseString];
            NSString *menuOption = [[[sitemap objectAtIndex:i] valueForKey:@"title"] uppercaseString];

            if([tempLiabilityArray containsObject:menuOption]){
                siteMapChildrenObject = [[NSArray alloc] init];
                
                
                
                /* Mobile 2.5 */
                /** Pure asset customer, if selects any 3D shortcut should see Apply Now Screen **/
                if([menuOption isEqualToString:@"MY ACCOUNTS"] && [touch3DValue isEqualToString:@"MY ACCOUNTS"]){
                    [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:TOUCH3D_VALUE];
                }
                
                if([touch3DValue isEqualToString:@"FUNDS TRANSFER"] && [menuOption isEqualToString:@"FUNDS TRANSFER"]){
                    [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:TOUCH3D_VALUE];
                }
                
                if([touch3DValue isEqualToString:@"BILL PAY"] && [menuOption isEqualToString:@"BILL PAY"]){
                    [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:TOUCH3D_VALUE];
                }
                
                
                /** If application active and user presses any 3D touch options, application should direct user the pages **/
                if([menuOption isEqualToString:@"MY ACCOUNTS"]){
                    [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:ACCOUNTS3D_VALUE];
                }
                else if([menuOption isEqualToString:@"BILL PAY"]){
                    [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:BILLPAY3D_VALUE];
                    [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:QUICKPAY3D_VALUE];
                }else if([menuOption isEqualToString:@"FUNDS TRANSFER"]){
                    [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:FUNDSTRANSFER3D_VALUE];
                }
                
                /* end */
                
                /*If My Accounts selected, take user to Apply Now*/
                if([menuOption isEqualToString:@"MY ACCOUNTS"]){
                    [menuDictionary setObject:pageApplyNowId forKey:@"menuIDs"];
                }
                
                if(assetFlag && !hsFlag){
                    if([menuOption isEqualToString:@"LIMIT MANAGEMENT"]){
                        [menuDictionary setObject:pageApplyNowId forKey:@"menuIDs"];
                    }
                }
                
                if([menuOption isEqualToString:@"DASHBOARD"]){
                    hideDashboard = true;
                }
                
            }
            else{
                siteMapChildrenObject = [[sitemap objectAtIndex:i] children];
            }
        }
        /*In case user is a pure liabilty customer*/
        else if([menuOption isEqualToString:@"LOANS"] && [tempAssetType isEqualToString:@"You have no loans from us"]){
            // [menuDictionary setObject:pageApplyNowId forKey:@"menuIDs"];
            siteMapChildrenObject = [[NSArray alloc] init];
        }
        else{
            siteMapChildrenObject = [[sitemap objectAtIndex:i] children];
        }
        /* end */
        
        
        /* Mobile 2.5 */
        /*In case of liability customer show accounts page on touch of 3D shortcut */
        if(!assetFlag){
            if(touch3DValue!= nil && [menuOption isEqualToString:touch3DValue] && [touch3DValue isEqualToString:@"MY ACCOUNTS"]){
                [[NSUserDefaults standardUserDefaults] setValue:[[sitemap objectAtIndex:i] itemRef] forKey:TOUCH3D_VALUE];
            }
            
            if([menuOption isEqualToString:@"MY ACCOUNTS"]){
                [[NSUserDefaults standardUserDefaults] setValue:[[sitemap objectAtIndex:i] itemRef] forKey:ACCOUNTS3D_VALUE];
            }
            
        }
        
        /** end **/
        
        NSMutableArray *subMenuArray = [[NSMutableArray alloc] init];
        
        for (NSObject<SiteMapItemChild> *siteMapObject in siteMapChildrenObject) {
            
            
            /* Mobile 2.5 - Check for 3D Touch and get Page Id for Redirection */
            if(![touch3DValue isEqual: @""] || touch3DValue!= nil){
                if([menuOption isEqualToString:touch3DValue] && [touch3DValue isEqualToString:@"FUNDS TRANSFER"] && [siteMapObject.title isEqualToString:@"Transfer now"]){
                    [[NSUserDefaults standardUserDefaults] setValue:siteMapObject.itemRef forKey:@"TOUCH3D_VALUE"];
                }
                else if([menuOption isEqualToString:touch3DValue] && [touch3DValue isEqualToString:@"BILL PAY"] && [siteMapObject.title isEqualToString:@"Recharges"] && [subOption isEqualToString:@"Recharges"]){
                    [[NSUserDefaults standardUserDefaults] setValue:siteMapObject.itemRef forKey:@"TOUCH3D_VALUE"];
                }
                else if([menuOption isEqualToString:touch3DValue] && [touch3DValue isEqualToString:@"BILL PAY"] && [siteMapObject.title isEqualToString:@"Quick pay"] && [subOption isEqualToString:@"Quick pay"]){
                    [[NSUserDefaults standardUserDefaults] setValue:siteMapObject.itemRef forKey:@"TOUCH3D_VALUE"];
                }
            }
            
            if([menuOption isEqualToString:@"FUNDS TRANSFER"] && [siteMapObject.title isEqualToString:@"Transfer now"]){
                [[NSUserDefaults standardUserDefaults] setValue:siteMapObject.itemRef forKey:FUNDSTRANSFER3D_VALUE];
            }
            if([menuOption isEqualToString:@"BILL PAY"] && [siteMapObject.title isEqualToString:@"Recharges"]){
                [[NSUserDefaults standardUserDefaults] setValue:siteMapObject.itemRef forKey:BILLPAY3D_VALUE];
            }
            if([menuOption isEqualToString:@"BILL PAY"] && [siteMapObject.title isEqualToString:@"Quick pay"]){
                [[NSUserDefaults standardUserDefaults] setValue:siteMapObject.itemRef forKey:QUICKPAY3D_VALUE];
            }
            
            
            /* end */
            
            
            //Mobile 2.5 Check for LOANS here
            bool noLoan = false;
            
            if([menuOption isEqualToString:@"LOANS"]){
                
                if([siteMapObject.title isEqualToString:@"Home"]){
                    NSRange hl = [tempAssetType rangeOfString:@"hl"];
                    if(hl.location == NSNotFound){
                        [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:HOME_LOANS];
                        noLoan = true;
                    }
                    else{
                        pageIdHomeLoan = siteMapObject.itemRef;
                        [[NSUserDefaults standardUserDefaults] setValue:pageIdHomeLoan forKey:HOME_LOANS];
                    }
                }
                else if([siteMapObject.title isEqualToString:@"Personal"] ){
                    NSRange pl = [tempAssetType rangeOfString:@"pl"];
                    if(pl.location == NSNotFound){
                        [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:PERSONAL_LOANS];
                        noLoan = true;
                        
                    }
                    else{
                        pageIdPersonalLoan = siteMapObject.itemRef;
                        [[NSUserDefaults standardUserDefaults] setValue:pageIdPersonalLoan forKey:PERSONAL_LOANS];
                    }
                }
                else if([siteMapObject.title isEqualToString:@"Against property"]){
                    NSRange lap = [tempAssetType rangeOfString:@"lap"];
                    if(lap.location == NSNotFound){
                        [[NSUserDefaults standardUserDefaults] setValue:pageApplyNowId forKey:LAP_LOANS];
                        noLoan = true;
                    }
                    else{
                        pageIdLAPLoan = siteMapObject.itemRef;
                        [[NSUserDefaults standardUserDefaults] setValue:pageIdLAPLoan forKey:LAP_LOANS];
                    }
                }
            }
            
            /*Mobile 2.5 end*/
            
            //Remove manually Transactions from child map into site map (main)
            NSMutableDictionary * menuChildDictionary = [[NSMutableDictionary alloc] init];
            //SDK 2.0 migration code
            [menuChildDictionary setObject:siteMapObject.title forKey:@"menuTitle"];
            //[menuChildDictionary setObject:siteMapObject.name forKey:@"menuTitle"];
            
            if(noLoan)
            {
                [menuChildDictionary setObject:pageApplyNowId forKey:@"menuIDs"];
            }
            else{
                [menuChildDictionary setObject:siteMapObject.itemRef forKey:@"menuIDs"];
            }
            [subMenuArray addObject:menuChildDictionary];
        }
        [menuDictionary setObject:subMenuArray forKey:@"subMenuArray"];
        
        
        /*Mobile 2.5 - Hide Dashboard for pure asset customer*/
        if(!hideDashboard)
            [mainMenus insertObject:menuDictionary atIndex:(mainMenuCntr++)];
    }
    
    self.tableView = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStylePlain];
    [self.tableView setDelegate:self];
    [self.tableView setDataSource:self];
    [self.view addSubview:self.tableView];
    [self.tableView setAutoresizingMask:UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight];
    [self.tableView setBackgroundColor:[UIColor whiteColor]];
    [self.tableView setSeparatorInset:UIEdgeInsetsMake(0, 0, 0, 0)];
    
    for (int i = 0; i < mainMenus.count; i++)
    {
        [collapsedSections addObject:@(i)];
    }
    
    if(notInNavigationMar && pageRefId != NULL){
        if((globalVariables.getMarketingFlag == nil) || (globalVariables.getMarketingFlag == NULL) || ([globalVariables.getMarketingFlag.uppercaseString isEqualToString:@"FALSE"])){
            [[AppDelegate sharedAppDelegate] loadViewControllerForId:pageRefId];
            [[NSUserDefaults standardUserDefaults] setValue:@"false" forKey:SHOW_MARKETING_FLAG];
        }
        /** Mobile 3.0 - show marketing screens when app upgrade **/
        else if([[[NSUserDefaults standardUserDefaults] valueForKey:SHOW_MARKETING_FLAG] isEqualToString:@"true"]){
            [[AppDelegate sharedAppDelegate] loadViewControllerForId:pageRefId];
            [[NSUserDefaults standardUserDefaults] setValue:@"false" forKey:SHOW_MARKETING_FLAG];
        }
        /** Mobile 3.0 end **/
        
        else{
            //Direct login page
            if([mpinSetup isEqualToString:@"true"]){
                [[AppDelegate sharedAppDelegate] loadViewControllerForId:pageMpinLoginId];
            }
            else{
                
                [[AppDelegate sharedAppDelegate] loadViewControllerForId:pageIdNormalLogin
                 ];
            }
        }
    }else{
        //To handle default case got to page 0
        //[[AppDelegate sharedAppDelegate] loadViewControllerForId:[[sitemap objectAtIndex:0] itemRef]];
        
        
        //If asset customer only, do not go dashboard
        /*Mobile 2.5*/
        
        NSString *touch3DValue = [[NSUserDefaults standardUserDefaults] valueForKey:TOUCH3D_VALUE];
        NSString *mVisaLogin = [[NSUserDefaults standardUserDefaults] valueForKey:MVISA_LOGIN_FLAG];
        if(touch3DValue!= nil)
        {
            [[AppDelegate sharedAppDelegate] loadViewControllerForId:touch3DValue];
            [[NSUserDefaults standardUserDefaults] setValue:nil forKey:TOUCH3D_VALUE];
        }
        else{
            /** mVisa **/
            /** If mVisa flow, landing page for user should be Account selection page **/
            /** Author - Neha Chandak **/
            if([mVisaLogin isEqualToString:@"true"]){
                [globalVariables clearMVisaLoginFlagLocally];
                [[AppDelegate sharedAppDelegate] loadViewControllerForId:mVisaLandingPage];
                
            }
            /** mVisa end **/
            else if(assetFlag){
                NSString *assetLandingPage = [[NSUserDefaults standardUserDefaults] valueForKey:ASSET_LANDING_PAGE];
                if([assetLandingPage isEqualToString:@"hl"]){
                    [[AppDelegate sharedAppDelegate] loadViewControllerForId:pageIdHomeLoan];
                }
                else if([assetLandingPage isEqualToString:@"pl"]){
                    [[AppDelegate sharedAppDelegate] loadViewControllerForId:pageIdPersonalLoan];
                }
                else if([assetLandingPage isEqualToString:@"lap"]){
                    [[AppDelegate sharedAppDelegate] loadViewControllerForId:pageIdLAPLoan];
                }
            }
            
            else{
                [[AppDelegate sharedAppDelegate] loadViewControllerForId:[[sitemap objectAtIndex:0] itemRef]];
            }
        }
    }
    
    
}
-(void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - Table view data source

-(NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return self.mainMenus.count;
}

-(NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section
{
    return [[self.mainMenus objectAtIndex:section] valueForKey:@"menuTitle"];
}

-(UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
{
    // Header view
    UIControl *headerView = [[UIControl alloc] initWithFrame:CGRectMake(0, 0, self.tableView.frame.size.width, 100)];
    if(section == 0){
        //logo view
        UIView *userView = [[UIView alloc] init];
        //        UIImageView * userAvr = [[UIImageView alloc] initWithFrame:CGRectMake(CGRectGetMidX(self.tableView.bounds)-49.0, 40, 97, 86)];
        //        userAvr.image = [UIImage imageNamed:@"iconImages/profile.png"];
        /* coloured bar */
        UIImageView *colouredBar = [[UIImageView alloc] initWithFrame:CGRectMake(0,0,self.tableView.frame.size.width,3)];
        colouredBar.image=[UIImage imageNamed:@"iconImages/coloured_bar/bitmap.png"];
        [userView addSubview:colouredBar];
        
        UILabel *welcme = [[UILabel alloc] initWithFrame:CGRectMake((self.tableView.frame.size.width - (self.tableView.frame.size.width-11)), -35, 150, 120)];
        [welcme setTextColor:[UIColor colorWithRed:255/255.0 green:143/255.0 blue:27/255.0 alpha:1]];
        welcme.numberOfLines = 0;
        welcme.autoresizingMask = UIViewAutoresizingFlexibleWidth;
        [welcme setFont:[UIFont fontWithName:@"GothamBook" size:12]];
        [welcme setText:[NSString stringWithFormat:@"%@", @"Welcome"]];
        
        
        UILabel *usrName = [[UILabel alloc] initWithFrame:CGRectMake((self.tableView.frame.size.width - (self.tableView.frame.size.width-11)), welcme.frame.origin.y+30, 300, 120)];// 17 march
        [usrName setTextColor:[UIColor colorWithRed:74/255.0 green:74/255.0 blue:74/255.0 alpha:1]];
        usrName.numberOfLines = 2; //17 March
        usrName.autoresizingMask = UIViewAutoresizingFlexibleWidth;
        /*********** Prakash Changes *************/
        [usrName setFont:[UIFont fontWithName:@"GothamBook" size:15]];
        /******************** 17 March **********************/
        NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
        
        paragraphStyle.lineSpacing = 3;
        paragraphStyle.lineBreakMode = NSLineBreakByTruncatingTail;
        
        NSDictionary *attrsDictionary =
        @{ NSParagraphStyleAttributeName: paragraphStyle };
        /****************************************************/
        AppDelegate *appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
        
        if ([AppDelegate sharedAppDelegate].userName == nil) {
            
            usrName.attributedText = [[NSAttributedString alloc] initWithString:@"Guest" attributes:attrsDictionary];
        }else{
            //            [usrName setText:[NSString stringWithFormat:@"%@",appDelegate.userName]];
            //17 March
            usrName.attributedText = [[NSAttributedString alloc] initWithString:appDelegate.userName attributes:attrsDictionary];
        }
        UILabel *lastLogin = [[UILabel alloc] initWithFrame:CGRectMake((self.tableView.frame.size.width - (self.tableView.frame.size.width-11)), usrName.frame.origin.y+76, 300, 20)]; // 17 march
        
        [lastLogin setFont:[UIFont fontWithName:@"GothamBook" size:10]];
        /********** Prakash Changes **********/
        [lastLogin setTextColor:[UIColor colorWithRed:171/255.0 green:171/255.0 blue:171/255.0 alpha:0.8]];
        
        if ([AppDelegate sharedAppDelegate].lastlogin == nil) {
            //            [lastLogin setText:@"Last login not available"];
        }else{
            [lastLogin setText:[AppDelegate sharedAppDelegate].lastlogin];
        }
        [userView addSubview:lastLogin];
        [userView addSubview:welcme];
        [userView addSubview:usrName];
        [headerView addSubview:userView];
    }else{
        //Horozintal view
        UIView *lineViewAbv = [[UIView alloc] initWithFrame:CGRectMake(0,-02, self.tableView.frame.size.width, 1)];
        lineViewAbv.backgroundColor = [UIColor colorWithRed:29/255.0 green:29/255.0 blue:38/255.0 alpha:0.1];
        [headerView addSubview:lineViewAbv];
        
        UIView *lineViewBlw = [[UIView alloc] initWithFrame:CGRectMake(0,44, self.tableView.frame.size.width, 1)];
        lineViewBlw.backgroundColor = [UIColor colorWithRed:29/255.0 green:29/255.0 blue:38/255.0 alpha:0.1];
        [headerView addSubview:lineViewBlw];
        
        //Menu Name
        UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(40, -5, self.tableView.frame.size.width, 55)];
        [label setTextColor:[UIColor colorWithRed:29/255.0 green:29/255.0 blue:38/255.0 alpha:1]];
        label.numberOfLines = 0;
        label.autoresizingMask = UIViewAutoresizingFlexibleWidth;
        [label setFont:[UIFont fontWithName:@"GothamBook" size:11]];
        [label setText:[[[self.mainMenus objectAtIndex:section] valueForKey:@"menuTitle"] uppercaseString]];
        [headerView setBackgroundColor:[UIColor whiteColor]];
        [headerView addSubview:label];
        label.opaque = NO;
        label.backgroundColor = [UIColor clearColor];
        
        //b4 04Feb
        //        // Icon View
        //        UIImageView * logo = [[UIImageView alloc] initWithFrame:CGRectMake(8, 15 , 22, 23)];
        //        logo.image = [UIImage imageNamed:[iconImages objectAtIndex:(section%7)]];
        //        [headerView addSubview:logo];
        
        
        
        /*------------------------------------------------------------
         Changes made on - 26th April
         Auther: Taral
         Purpose: Menu icons were stretched as the CGrect height and
         width of logo imageview was static. As the logo images are
         not of the equal height and width, size of the image view
         should be derived from the size of respective image. Hence
         added the same
         Structure / Hierarchy:
         
         headerView(UIControl) --> LogoHolder(UIView) --> logo(UIImageView) -->  logoImage(UIImage)
         ------------------------------------------------------------*/
        
        //1. Taral - 26 April 2016 - Added Height and Width
        UIView *logoHolder = [[UIView alloc]initWithFrame:CGRectMake(13, 13, 21, 21)];
        
        //2. Start - Taral - 26 April 2016
        //UIImageView * logo = [[UIImageView alloc] initWithFrame:CGRectMake(13, 13, 15, 16)];
        //End - Taral - 26 April 2016
        
        
        
        //        NSString *iconNme = @"_";
        //        if ([AppDelegate sharedAppDelegate].userName != nil){
        //
        //            NSString *iconNme = [[[[self.mainMenus objectAtIndex:section] valueForKey:@"menuTitle"] lowercaseString] stringByReplacingOccurrencesOfString:@" " withString:@"_"];
        //
        //        }
        
        
        
        
        //This is a testing code for image taking dynamically
        NSString *iconNme = [[[[self.mainMenus objectAtIndex:section] valueForKey:@"menuTitle"] lowercaseString] stringByReplacingOccurrencesOfString:@" " withString:@"_"];
        
        /*Mobile 2.5 change image icon name for pin/password management*/
        if([[iconNme lowercaseString] isEqualToString:@"pin_or_password_management"]){
            iconNme = [NSString stringWithFormat:@"password_management"];
        }
        /*end*/
        
        //NSString *iconPath = [NSString stringWithFormat:@"iconImages/%@/", iconNme];
        NSString *iconName = [iconNme stringByAppendingPathExtension:@"png"];
        //NSLog(@"test stub %@", [iconPath stringByAppendingString:iconName]);
        //logo.image = [UIImage imageNamed:[iconPath stringByAppendingString:iconName]];
        
        //3. Start Added by Taral - (2)
        UIImage *logoImage = [UIImage imageNamed:iconName];
        UIImageView * logo = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, logoImage.size.width*0.9, logoImage.size.height*0.9)];
        logo.image = [UIImage imageNamed:iconName];
        [logoHolder addSubview:logo];
        [headerView addSubview:logoHolder];
        //End addition / modification by Taral -(2)
        
        // Drop Button
        UIButton *dropDownButton = [[UIButton alloc] initWithFrame:CGRectMake(headerView.frame.size.width - 27, 15, 15, 15)];
        
        NSArray *childrenPages = [[self.mainMenus objectAtIndex:section] valueForKey:@"subMenuArray"];
        if (childrenPages.count < 1)
        {
            /*Mobile 2.5 remove right arrow*/
            //[dropDownButton setImage:[UIImage imageNamed:@"right_normal.png"] forState:UIControlStateNormal];
            /*end*/
        }else{
            [dropDownButton setImage:[UIImage imageNamed:@"dropdown_normal.png"] forState:UIControlStateNormal];
        }
        [headerView addSubview:dropDownButton];
        [headerView setTag:section];
        [headerView addTarget:self action:@selector(sectionButtonTouchUpInside:) forControlEvents:UIControlEventTouchUpInside];
        
        
        /*Mobile 2.5, open loans navigation for Pure Asset Customer*/
        if(!assetSectionOpened && [[[NSUserDefaults standardUserDefaults] valueForKey:ASSET_FLAG] boolValue]){
            if([[[self.mainMenus objectAtIndex:section] valueForKey:@"menuTitle"] isEqualToString:@"Loans"]){
                [self sectionButtonTouchUpInside:headerView];
            }
            assetSectionOpened = true;
        }
        /*end*/
        
        
    }
    return headerView;
}

-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return [collapsedSections containsObject:@(section)] ? 0 : [[[mainMenus objectAtIndex:section] valueForKey:@"subMenuArray"] count];
}

-(NSArray*) indexPathsForSection:(int)section withNumberOfRows:(int)numberOfRows
{
    
    NSMutableArray* indexPaths = [NSMutableArray new];
    for (int i = 0; i < numberOfRows; i++)
    {
        NSIndexPath* indexPath = [NSIndexPath indexPathForRow:i inSection:section];
        [indexPaths addObject:indexPath];
    }
    return indexPaths;
}

-(void)sectionButtonTouchUpInside:(UIControl *)sender {
    int section = (int)sender.tag; //default is 0, but section will return value of the menu(Section) in mainMenus array.
    sectionTouched = (int)sender.tag;
    
    
    
    if(openedTab && openedTab != sectionTouched){
        // Previous Menu Open Check (To close previous menu icon)
        NSArray *preChildrenPages = [[self.mainMenus objectAtIndex:openedTab] valueForKey:@"subMenuArray"];
        if (preChildrenPages.count > 1)
        {
            [self.tableView beginUpdates];
            int numOfRows = (int)[self.tableView numberOfRowsInSection:openedTab];
            NSArray* indexPaths = [self indexPathsForSection:openedTab withNumberOfRows:numOfRows];
            [self.tableView deleteRowsAtIndexPaths:indexPaths withRowAnimation:UITableViewRowAnimationNone];
            [self.tableView reloadSections:[NSIndexSet indexSetWithIndex:openedTab] withRowAnimation:UITableViewRowAnimationNone];
            [collapsedSections addObject:@(openedTab)];
            [self.tableView endUpdates];
        }
    }
    
    
    //Check here, if widget have any chlidren pages?
    NSString *tempPageId = [[self.mainMenus objectAtIndex:section] valueForKey:@"menuIDs"];
    
    // Reusing Array childrenPages
    NSArray *childrenPages = [[self.mainMenus objectAtIndex:section] valueForKey:@"subMenuArray"];
    if (childrenPages.count < 1)
    {
        //20 May
        NSString *menuName = [[[self.mainMenus objectAtIndex:section] valueForKey:@"menuTitle"] uppercaseString];
        
        /*Mobile 2.5 */
        /*Sign In - Clicking on Sign in should show user MPIN or Login page */
        
        if([menuName isEqualToString:@"SIGN IN"]){
            
            GlobalVariables *globalVariables = [[GlobalVariables alloc]init];
            
            /*mVisa Neha Chandak **/
            [globalVariables clearScanAndPayFlagLocally];
            [globalVariables clearMVisaLoginFlagLocally];
            
            NSString *mpinSetup = [globalVariables getMpinSetup];
            if([mpinSetup isEqualToString:@"true"]){
                tempPageId = [[NSUserDefaults standardUserDefaults] valueForKey:PAGE_MPIN_LOGIN];
            }
        }
        
        
        
        
        /* In case of Apply now, send value of product to apply now */
        if([[[NSUserDefaults standardUserDefaults] valueForKey:ASSET_FLAG] boolValue]){
            NSMutableArray *tempLiabilityArray = [[NSMutableArray alloc] initWithObjects:@"MY ACCOUNTS", @"FUNDS TRANSFER", @"BILL PAY", @"DEBIT CARD", nil];
            if([tempLiabilityArray containsObject:[menuName uppercaseString]]){
                [[NSUserDefaults standardUserDefaults] setValue:@"casaAccount" forKey:APPLY_NOW_TYPE];
            }
            
            else if([[menuName uppercaseString] isEqualToString:@"FIXED DEPOSIT"]){
                [[NSUserDefaults standardUserDefaults] setValue:@"fdRequest" forKey:APPLY_NOW_TYPE];
            }
            
            else if([[menuName uppercaseString] isEqualToString:@"RECURRING DEPOSIT"]){
                [[NSUserDefaults standardUserDefaults] setValue:@"rdRequest" forKey:APPLY_NOW_TYPE];
            }
        }
        /*Mobile 2.5 end*/
        
        
        
        [[AppDelegate sharedAppDelegate] loadViewControllerForId:tempPageId];
        
    }else{
        openedTab = sectionTouched;
        
        [self.tableView beginUpdates];
        bool shouldCollapse = ![collapsedSections containsObject:@(section)];
        UIButton *dropDown = [sender.subviews lastObject];
        if (shouldCollapse)
        {
            [dropDown setImage:[UIImage imageNamed:@"dropdown_normal.png"] forState:UIControlStateNormal];
            int numOfRows = (int)[self.tableView numberOfRowsInSection:section];
            NSArray* indexPaths = [self indexPathsForSection:section withNumberOfRows:numOfRows];
            [self.tableView deleteRowsAtIndexPaths:indexPaths withRowAnimation:UITableViewRowAnimationNone];
            [collapsedSections addObject:@(section)];
        }else{
            [dropDown setImage:[UIImage imageNamed:@"dropdown_up_normal.png"] forState:UIControlStateNormal];
            int numOfRows = (int)[[[mainMenus objectAtIndex:section] valueForKey:@"subMenuArray"] count];
            NSArray* indexPaths = [self indexPathsForSection:section withNumberOfRows:numOfRows];
            [self.tableView insertRowsAtIndexPaths:indexPaths withRowAnimation:UITableViewRowAnimationNone];
            [collapsedSections removeObject:@(section)];
        }
        [self.tableView endUpdates];
    }
}

-(UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *CellIdentifier = @"Cell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
    }
    bool isExpanded = ![collapsedSections containsObject:@(sectionTouched)];
    if (isExpanded){
        NSDictionary *childValue = [[[mainMenus objectAtIndex:sectionTouched] valueForKey:@"subMenuArray"]objectAtIndex:indexPath.row];
        cell.textLabel.text = [NSString stringWithFormat:@"        %@",[childValue objectForKey:@"menuTitle"]];
        [cell.textLabel setFont:[UIFont fontWithName:@"GothamBook" size:10]];
        [cell.textLabel setTextColor:[UIColor colorWithRed:74/255.0 green:74/255.0 blue:74/255.0 alpha:1]];
        [cell setBackgroundColor:[UIColor colorWithRed:250/255.0 green:250/255.0 blue:250/255.0 alpha:1]];
        return cell;
    }else{
        cell.textLabel.text = [[mainMenus objectAtIndex:indexPath.row] valueForKey:@"menuTitle"];
        return cell;
    }
    
}

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSArray *mainArry = [[self.mainMenus objectAtIndex:sectionTouched] valueForKey:@"subMenuArray"];
    NSDictionary *childrenPage = [mainArry objectAtIndex:indexPath.row];
    
    NSString *menuName = [[childrenPage valueForKey:@"menuTitle"] uppercaseString];
    
    if([menuName  isEqualToString:@"HOME"]){
        [[NSUserDefaults standardUserDefaults] setValue:@"homeLoan" forKey:APPLY_NOW_TYPE];
    }
    else if([menuName isEqualToString:@"PERSONAL"]){
        [[NSUserDefaults standardUserDefaults] setValue:@"personalLoan" forKey:APPLY_NOW_TYPE];
    }
    else if([menuName isEqualToString:@"AGAINST PROPERTY"]){
        [[NSUserDefaults standardUserDefaults] setValue:@"loanAgainstProperty" forKey:APPLY_NOW_TYPE];
    }
    
    
    [[AppDelegate sharedAppDelegate] loadViewControllerForId:[childrenPage objectForKey:@"menuIDs"]];
    
    
    
}
-(CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section{
    if(section == 0){
        return 95.0; // return 206.0
    }
    return 44.0;
}

-(CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    return 40.0;
}

-(CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section{
    return 0.0;
}

-(void)viewDidLayoutSubviews
{
    if ([self.tableView respondsToSelector:@selector(setSeparatorInset:)]) {
        [self.tableView setSeparatorInset:UIEdgeInsetsZero];
    }
    
    if ([self.tableView respondsToSelector:@selector(setLayoutMargins:)]) {
        [self.tableView setLayoutMargins:UIEdgeInsetsZero];
    }
}

-(void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath
{
    if ([cell respondsToSelector:@selector(setSeparatorInset:)]) {
        [cell setSeparatorInset:UIEdgeInsetsZero];
    }
    
    if ([cell respondsToSelector:@selector(setLayoutMargins:)]) {
        [cell setLayoutMargins:UIEdgeInsetsZero];
    }
}

-(void)contentSizeDidChange:(NSString *)size{
    [self.tableView reloadData];
}

#pragma mark - Remove Transparent

- (void) remvTransparent{
    for (UIView *view in self.mm_drawerController.centerViewController.view.subviews)
    {
        if ([view isKindOfClass:[UIView class]])
        {
            if (view.tag == 100 ) {
                [view removeFromSuperview];
            }
        }
    }
}
@end
