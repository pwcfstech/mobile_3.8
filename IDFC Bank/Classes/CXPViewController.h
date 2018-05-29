//
//  CXPViewController.h
//  IDFC Retail Banking
//
//  Created by Backbase R&D B.V.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface CXPViewController : UIViewController <UIAlertViewDelegate>

@property (strong) NSObject<Renderable>* page;
@property (strong) NSObject<Renderer>* renderer;

- (id)initWithRenderable:(NSObject<Renderable>*)renderable;

@property (nonatomic,strong)NSString *pageName;


/**mVisa **/
-(void) showLogoutPopup:(id)sender;
-(void) changeNavBarTitle:(NSString *)title;

@end
