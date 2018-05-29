//
//  MMExampleLeftSideMenuDrawerViewController.h
//  IDFC Retail banking
//
//  Created by mac_admin on 30/11/15.
//  Copyright © 2015 Backbase R&D B.V. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CXPViewController.h"
#import "MMExampleViewController.h"

@interface MMExampleLeftSideMenuDrawerViewController : MMExampleViewController<UITableViewDataSource, UITableViewDelegate, UIAlertViewDelegate, UIGestureRecognizerDelegate>
{
    int sectionTouched,openedTab;
    /*Mobile 2.5*/
    bool assetSectionOpened;
    /*end*/
    NSTimer *timer;
}

@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, strong) NSMutableArray *mainMenus;
@property (nonatomic, strong) NSMutableArray *collapsedSections;
@property (nonatomic, strong) NSMutableArray *sitemap;

@end
