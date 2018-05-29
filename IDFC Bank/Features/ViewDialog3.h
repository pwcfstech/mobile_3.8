//
//  ViewDialog3.h
//  IDFC UAT
//
//  Created by Taral Soni on 24/07/16.
//  Copyright © 2016 IDFC Bank. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ViewDialog3 : UIViewController

- (void)showInView:(UIView *)aView animated:(BOOL)animated txnType:(NSString*)txnType msg:(NSString*)msg;
@property (strong, nonatomic) IBOutlet UIView *popupview;
@property (strong, nonatomic) IBOutlet UILabel *message;

@property (strong, nonatomic) IBOutlet UIButton *okBtn;
@property (strong, nonatomic) IBOutlet UIButton *btn2;
@property (strong, nonatomic) IBOutlet UIButton *btn3;

@property (strong, nonatomic) NSString *transactionType;
@property (strong, nonatomic) NSString *messageToBedisplayed;

- (IBAction)okBtnClick:(id)sender;
- (IBAction)btn2Clicked:(id)sender;
- (IBAction)btn3Clicked:(id)sender;


@end
