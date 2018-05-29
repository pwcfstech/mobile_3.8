//
//  FingerprintPopups.h
//  IDFC UAT
//
//  Created by Taral Soni on 02/08/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface FingerprintPopups : UIViewController

- (IBAction)goToSettings:(id)sender;
- (IBAction)later:(id)sender;
- (void)showInView:(UIView *)aView animated:(BOOL)animated;

@property (strong, nonatomic) IBOutlet UIView *popupView;


@end
