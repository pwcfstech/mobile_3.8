//
//  ViewDialog.m
//  IDFC UAT
//
//  Created by Taral Soni on 24/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import "ViewDialog3.h"
#import "GlobalVariables.h"
#import "AppDelegate.h"

@interface ViewDialog3 ()

@end

@implementation ViewDialog3
@synthesize popupview;
@synthesize okBtn;
@synthesize message;
@synthesize transactionType;
@synthesize messageToBedisplayed;
@synthesize btn3;
@synthesize btn2;

- (void)viewDidLoad {
    self.view.backgroundColor=[[UIColor blackColor] colorWithAlphaComponent:.6];
    self.popupview.layer.cornerRadius = 5;
    self.popupview.layer.shadowOpacity = 0.8;
    self.popupview.layer.shadowOffset = CGSizeMake(0.0f, 0.0f);
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
    [self.message setText:messageToBedisplayed];
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

- (void)showInView:(UIView *)aView animated:(BOOL)animated txnType:(NSString*)txnType msg:(NSString*)msg
{
    self.transactionType = txnType;
    self.messageToBedisplayed = msg;
    [aView addSubview:self.view];
    
    if(([transactionType isEqualToString:@"APPUPWTHNGP"]) || ([transactionType isEqualToString:@"APPUPBYNDGP"])){
        [okBtn setTitle:@"UPGRADE NOW" forState:UIControlStateNormal];
        [btn2 setTitle:@"VIEW DETAILS" forState:UIControlStateNormal];
        [okBtn setNeedsLayout];
        [okBtn layoutIfNeeded];
        [btn2 setNeedsLayout];
        [btn2 layoutIfNeeded];
        
        if([transactionType isEqualToString:@"APPUPBYNDGP"]){
            //[btn3 setHidden:YES];
            [btn3 setTitle:@"CANCEL" forState:UIControlStateNormal];
        }else{
            [btn3 setTitle:@"LATER" forState:UIControlStateNormal];
            [btn3 setNeedsLayout];
            [btn3 layoutIfNeeded];
        }
    }else if([transactionType isEqualToString:@"AUTHERR003"]){
        /*[okBtn setTitle:@"CONTACT CALL CENTER" forState:UIControlStateNormal];
        [btn2 setTitle:@"LOGIN WITH USERNAME AND PASSWORD" forState:UIControlStateNormal];
        [btn2.titleLabel setTextAlignment:NSTextAlignmentCenter];
        btn2.titleLabel.numberOfLines=2;
        btn2.titleLabel.lineBreakMode = NSLineBreakByWordWrapping;
        //Changes for new requirement Change in text
        [btn3 setTitle:@"RESET MPIN" forState:UIControlStateNormal];
        //Added for Mpin Setup*/
        [okBtn setTitle:@"RESET MPIN" forState:UIControlStateNormal];
        [btn2 setTitle:@"LOGIN WITH USERNAME AND PASSWORD" forState:UIControlStateNormal];
        [btn2.titleLabel setTextAlignment:NSTextAlignmentCenter];
        btn2.titleLabel.numberOfLines=2;
        btn2.titleLabel.lineBreakMode = NSLineBreakByWordWrapping;
        //Changes for new requirement Change in text
        btn3.hidden = true;
        
    }else if([transactionType isEqualToString:@"MPINREGDONE"]){
        [okBtn setTitle:@"YES" forState:UIControlStateNormal];
        [btn2 setTitle:@"NO" forState:UIControlStateNormal];
        [btn2.titleLabel setTextAlignment:NSTextAlignmentCenter];
        btn2.titleLabel.numberOfLines=2;
        btn2.titleLabel.lineBreakMode = NSLineBreakByWordWrapping;
        //Using as Two Button
        [btn3 setHidden:YES];
    }
    
    
    //[aView bringSubviewToFront:self.view];
    if (animated) {
        [self showAnimate];
    }
    
}

/*
 #pragma mark - Navigation
 
 // In a storyboard-based application, you will often want to do a little preparation before navigation
 - (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
 // Get the new view controller using [segue destinationViewController].
 // Pass the selected object to the new view controller.
 }
 */

- (IBAction)okBtnClick:(id)sender {
    
    //Allocating specific transaction type
    GlobalVariables *globalVaribles = [[GlobalVariables alloc]init];
    
    if(([transactionType isEqualToString:@"APPUPWTHNGP"]) || ([transactionType isEqualToString:@"APPUPBYNDGP"])){
        
        NSString *downloadUrl = [globalVaribles getAppDownloadLink];
        //Open App store
        //[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"itms-apps://itunes.apple.com/app/id1103178366?mt=8"]];
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString: downloadUrl]];
        exit(0);// Fix for Defect 5242
        
    } else if ([transactionType isEqualToString:@"AUTHERR003"]){
        //Call 18004194332
        //[[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"tel://18004194332"]];
        //Added for Mpin Setup Yes No
        NSDictionary *result = [[NSDictionary alloc]init];
        result = @{ @"data":@true};
        [Backbase publishEvent:@"FORGOTMPIN" payload:result];
    }else if ([transactionType isEqualToString:@"MPINREGDONE"]){
        NSDictionary *result = [[NSDictionary alloc]init];
        result = @{ @"data":@true};
        [Backbase publishEvent:@"MPINREGDONE" payload:result];
        [self removeAnimate];
    }
    [self removeAnimate];
}

- (IBAction)btn2Clicked:(id)sender {
    GlobalVariables *globalVaribles = [[GlobalVariables alloc]init];
    NSDictionary *result = [[NSDictionary alloc]init];
    
    if(([transactionType isEqualToString:@"APPUPWTHNGP"]) || ([transactionType isEqualToString:@"APPUPBYNDGP"])){
        NSString *description = [globalVaribles getNewVersionDescription];
        [message setText:description];
    }else if ([transactionType isEqualToString:@"AUTHERR003"]){
        result = @{ @"data":@true};
        [Backbase publishEvent:@"LOGINUSRPWD" payload:result];
        [self removeAnimate];
        //Added for Mpin Setup Yes No
    }else if ([transactionType isEqualToString:@"MPINREGDONE"]){
        NSDictionary *result = [[NSDictionary alloc]init];
        result = @{ @"data":@false};
        [Backbase publishEvent:@"MPINREGDONE" payload:result];
        [self removeAnimate];
    }
    
    
}

- (IBAction)btn3Clicked:(id)sender {
    NSDictionary *result = [[NSDictionary alloc]init];
    
    if([transactionType isEqualToString:@"APPUPWTHNGP"]){
        [[AppDelegate sharedAppDelegate] loadBackbase];
    }else if([transactionType isEqualToString:@"APPUPBYNDGP"]){
        exit(0);
    }
    else if  ([transactionType isEqualToString:@"AUTHERR003"]){
        result = @{ @"data":@true};
        [Backbase publishEvent:@"FORGOTMPIN" payload:result];
    }
    [self removeAnimate];
}
@end
