//
//  ViewDialog.m
//  IDFC UAT
//
//  Created by Taral Soni on 24/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import "ViewDialog.h"
#import "GlobalVariables.h"

@interface ViewDialog ()

@end

@implementation ViewDialog
@synthesize popupview;
@synthesize okBtn;
@synthesize message;
@synthesize transactionType;
@synthesize messageToBedisplayed;

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
    //Allocating specific transaction type
    GlobalVariables *globalVaribles = [[GlobalVariables alloc]init];
    NSDictionary *result = [[NSDictionary alloc]init];
    
    if([transactionType isEqualToString:@"DVCEBLCKLIST"]){
        //restting device
        [globalVaribles resetDevice:@"DVCEBLCKLIST"];
        exit(0);
    }else if ([transactionType isEqualToString:@"CHNGMPINSUC"]){
        result = @{ @"data":@true};
        [CXP publishEvent:@"CHNGMPINSUC" payload:result];
    }else if(([transactionType isEqualToString:@"MPINDONTMATCH"]) || ([transactionType isEqualToString:@"WEAKMPIN"]) || ([transactionType isEqualToString:@"USEDMPIN"])){
        result = @{ @"data":@true};
        [CXP publishEvent:@"CHNGMPINRESETFIELDS" payload:result];
    }else if (([transactionType isEqualToString:@"MPINVALMSG"]) || ([transactionType isEqualToString:@"CHNGMPINFAIL"]) || ([transactionType isEqualToString:@"CHNGMPINERR"])){
        result = @{ @"data":@true};
        [CXP publishEvent:@"CHNGMPINRESETFIELDS" payload:result];
    }else if([transactionType isEqualToString:@"ALREADYHAVEMPIN"]){
        result = @{ @"data":@true};
        [CXP publishEvent:@"ALREADYHAVEMPIN" payload:result];
    }
    
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
    [self removeAnimate];
}
@end
