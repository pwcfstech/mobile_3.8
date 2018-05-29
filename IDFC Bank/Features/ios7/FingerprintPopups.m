//
//  FingerprintPopups.m
//  IDFC UAT
//
//  Created by Taral Soni on 02/08/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import "FingerprintPopups.h"
#import "GlobalVariables.h"

@interface FingerprintPopups ()

@end

@implementation FingerprintPopups
@synthesize popupView;

- (void)viewDidLoad {
    self.view.backgroundColor=[[UIColor blackColor] colorWithAlphaComponent:.6];
    self.popupView.layer.cornerRadius = 5;
    self.popupView.layer.shadowOpacity = 0.8;
    self.popupView.layer.shadowOffset = CGSizeMake(0.0f, 0.0f);
    [super viewDidLoad];

    // Do any additional setup after loading the view from its nib.
}

-(void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    [[self view] setFrame:[[UIScreen mainScreen]bounds]];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (void)showAnimate
{
    self.view.transform = CGAffineTransformMakeScale(1.3, 1.3);
    self.view.alpha = 0;
    [UIView animateWithDuration:.25 animations:^{
        self.view.alpha = 1;
        self.view.transform = CGAffineTransformMakeScale(1, 1);
    }];
}

- (void)removeAnimate
{
    
    [UIView animateWithDuration:.25 animations:^{
        self.view.transform = CGAffineTransformMakeScale(1.3, 1.3);
        self.view.alpha = 0.0;
    } completion:^(BOOL finished) {
        if (finished) {
            [self.view removeFromSuperview];
        }
    }];
}

- (void)showInView:(UIView *)aView animated:(BOOL)animated
{
    [aView addSubview:self.view];
    //[aView bringSubviewToFront:self.view];
    if (animated) {
        [self showAnimate];
    }
    
}

- (IBAction)goToSettings:(id)sender {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
}

- (IBAction)later:(id)sender {
    [self removeAnimate];
}
@end
