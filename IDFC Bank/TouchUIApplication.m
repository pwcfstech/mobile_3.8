//
//  TouchUIApplication.m
//  IDFC Retail Banking
//
//  Created by Mac_admin on 17/12/15.
//  Copyright © 2015 Mac_admin. All rights reserved.
//

#import "TouchUIApplication.h"
#import "AppDelegate.h"

@implementation TouchUIApplication

//here we are listening for any touch. If the screen receives touch, the timer is reset
-(void)sendEvent:(UIEvent *)event
{
    [super sendEvent:event];
    
    NSSet *allTouches = [event allTouches];
    if ([allTouches count] > 0)
    {
        UITouchPhase phase = ((UITouch *)[allTouches anyObject]).phase;
        UIView *view = ((UITouch *)[allTouches anyObject]).view;
        Class theClass = NSClassFromString(@"_UIAlertControllerActionView");
        if(![view isKindOfClass:theClass]){
            if(phase == UITouchPhaseBegan || phase == UITouchPhaseMoved){
            [[AppDelegate sharedAppDelegate] resetTimeOutVaraible];
            }
        }
    }
}
@end