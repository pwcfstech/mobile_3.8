//
//  mVisaQrReader.m
//  IDFC UAT
//
//  Created by Taral Soni on 28/02/17.
//  Copyright © 2017 IDFC Bank. All rights reserved.
//

#import "mVisaQrReader.h"
#import <AVFoundation/AVFoundation.h>
#import "MVisaQRParser.framework/Headers/MVisaQRParser.h"
#import <QuartzCore/QuartzCore.h>


@interface mVisaQrReader () <AVCaptureMetadataOutputObjectsDelegate>

@property (weak, nonatomic) IBOutlet UIView *cameraPreviewView;
@property (nonatomic, strong) AVCaptureSession *captureSession;
@property (nonatomic, strong) AVCaptureVideoPreviewLayer *captureLayer;
@property (nonatomic, strong) NSString *scannedBarcode;

@end

@implementation mVisaQrReader
@synthesize errorContainer, lblErrorMsg;
@synthesize payWithEntryContainer;
@synthesize btnPayeeKey, btnTryAgain;
@synthesize globalVariableObject;
@synthesize cameraPermissionView, camErrMsg,btnCamPayeeKey,btnCamGrantAccess, authStatus;

- (void)viewDidLoad {
    [super viewDidLoad];
    globalVariableObject = [[GlobalVariables alloc]init];
    self.view.backgroundColor=[[UIColor blackColor] colorWithAlphaComponent:0.0];
    [self setupScanningSession];
}

-(void)viewWillAppear:(BOOL)animated{
     NSString *mediaType = AVMediaTypeVideo;
     authStatus = [AVCaptureDevice authorizationStatusForMediaType:mediaType];
    [errorContainer setHidden:YES];
    [payWithEntryContainer setHidden:YES];
    [cameraPermissionView setHidden: YES];
    if(authStatus ==AVAuthorizationStatusAuthorized){
        [errorContainer setHidden:YES];
        [payWithEntryContainer setHidden:YES];
        [cameraPermissionView setHidden: YES];
    }else if (authStatus == AVAuthorizationStatusDenied){
        [self showPermissionError:@"Allow IDFC Bank mobile app to access your camera to use this feature" topErrMessage:@"Unable to access camera"];
    }else if (authStatus == AVAuthorizationStatusRestricted){
        [self showPermissionError:@"Allow IDFC Bank mobile app to access your camera to use this feature" topErrMessage:@"Unable to access camera"];
    }
//    else if(authStatus == AVAuthorizationStatusNotDetermined){
//        [self showPermissionError:@"Allow IDFC Bank mobile app to access your camera to use this feature" topErrMessage:@"Unable to access camera"];
//    }
    
    [self setupPayWithEntryContainer];
    [self.captureSession startRunning];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    [self.captureSession startRunning];
}

-(void)setupPayWithEntryContainer{
    [[btnPayeeKey layer]setBorderWidth:1.0f];
    [[btnPayeeKey layer]setCornerRadius:3.0f];
    [[btnPayeeKey layer] setBorderColor:[UIColor colorWithRed:251.0/255.00 green:99.0/255.0 blue:126.0/255.0 alpha:1.0].CGColor];
    
    [[btnTryAgain layer]setBorderWidth:1.0f];
    [[btnTryAgain layer]setCornerRadius:3.0f];
    [[btnTryAgain layer] setBorderColor:[UIColor colorWithRed:251.0/255.00 green:99.0/255.0 blue:126.0/255.0 alpha:1.0].CGColor];
    
    [[btnCamGrantAccess layer] setBorderWidth:1.0f];
    [[btnCamGrantAccess layer]setCornerRadius:3.0f];
    [[btnCamGrantAccess layer] setBorderColor:[UIColor colorWithRed:251.0/255.00 green:99.0/255.0 blue:126.0/255.0 alpha:1.0].CGColor];
    
    [[btnCamPayeeKey layer]setBorderWidth:1.0f];
    [[btnCamPayeeKey layer]setCornerRadius:3.0f];
    [[btnCamPayeeKey layer] setBorderColor:[UIColor colorWithRed:251.0/255.00 green:99.0/255.0 blue:126.0/255.0 alpha:1.0].CGColor];
}

- (IBAction)rescanButtonPressed:(id)sender {
    // Start scanning again.
    [self.captureSession startRunning];
}

- (IBAction)copyButtonPressed:(id)sender {
    // Copy the barcode text to the clipboard.
    [UIPasteboard generalPasteboard].string = self.scannedBarcode;
}

// Local method to setup camera scanning session.
- (void)setupScanningSession {
    
    //Check for camera permission
    NSString *mediaType = AVMediaTypeVideo;
    authStatus = [AVCaptureDevice authorizationStatusForMediaType:mediaType];
    
    if(authStatus == AVAuthorizationStatusAuthorized){
        [self startCameraScanning];
    }else if (authStatus == AVAuthorizationStatusDenied){
        //show error window and message
        NSLog(@"Camera permissioned is denied. Ask again");
        
    }else if (authStatus == AVAuthorizationStatusRestricted){
        //This is a special error which generally doesnt occure
        NSLog(@"Camera access authorization is restricted");
        
    }else if (authStatus == AVAuthorizationStatusNotDetermined){
        [AVCaptureDevice requestAccessForMediaType:mediaType completionHandler:^(BOOL granted) {
            if(granted){
                NSLog(@"Granted access to %@", mediaType);
                //Start camera session again and hide everything
                dispatch_async(dispatch_get_main_queue(), ^{
                    // code here
                    [errorContainer setHidden:YES];
                    [payWithEntryContainer setHidden:YES];
                    [cameraPermissionView setHidden: YES];
                    [self startCameraScanning];
                });
            }else {
                NSLog(@"Not granted access to %@", mediaType);
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self showPermissionError:@"Allow IDFC Bank mobile app to access your camera to use this feature" topErrMessage:@"Unable to access camera"];
                });
            }
        }];
    }else{
        //impossible, unknown authorization status which can never be handled by code
        NSLog(@"Something went wrong, You cant access this feature");
    }
        
}

-(void)startCameraScanning{
    // Initalising hte Capture session before doing any video capture/scanning.
    self.captureSession = [[AVCaptureSession alloc] init];
    
    NSError *error;
    // Set camera capture device to default and the media type to video.
    AVCaptureDevice *captureDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
    // Set video capture input: If there a problem initialising the camera, it will give am error.
    AVCaptureDeviceInput *input = [AVCaptureDeviceInput deviceInputWithDevice:captureDevice error:&error];
    
    if (!input) {
        NSLog(@"Error Getting Camera Input");
        return;
    }
    // Adding input souce for capture session. i.e., Camera
    [self.captureSession addInput:input];
    
    AVCaptureMetadataOutput *captureMetadataOutput = [[AVCaptureMetadataOutput alloc] init];
    // Set output to capture session. Initalising an output object we will use later.
    [self.captureSession addOutput:captureMetadataOutput];
    
    // Create a new queue and set delegate for metadata objects scanned.
    dispatch_queue_t dispatchQueue;
    dispatchQueue = dispatch_queue_create("scanQueue", NULL);
    [captureMetadataOutput setMetadataObjectsDelegate:self queue:dispatchQueue];
    // Delegate should implement captureOutput:didOutputMetadataObjects:fromConnection: to get callbacks on detected metadata.
    [captureMetadataOutput setMetadataObjectTypes:[captureMetadataOutput availableMetadataObjectTypes]];
    
    // Layer that will display what the camera is capturing.
    
    self.captureLayer = [[AVCaptureVideoPreviewLayer alloc] initWithSession:self.captureSession];
    [self.captureLayer setVideoGravity:AVLayerVideoGravityResizeAspectFill];
    [self.captureLayer setFrame:self.cameraPreviewView.bounds];
    float t= self.captureLayer.frame.size.height;
    [self.captureLayer setFrame:CGRectMake(self.captureLayer.frame.origin.x, self.captureLayer.frame.origin.y, self.captureLayer.frame.size.width, t+140)];
    
    // Adding the camera AVCaptureVideoPreviewLayer to our view's layer.
    [self.cameraPreviewView.layer addSublayer:self.captureLayer];
    [self.captureSession startRunning];
    [self.cameraPreviewView bringSubviewToFront:errorContainer];
    [self.cameraPreviewView bringSubviewToFront:payWithEntryContainer];
}

// AVCaptureMetadataOutputObjectsDelegate method
- (void)captureOutput:(AVCaptureOutput *)captureOutput didOutputMetadataObjects:(NSArray *)metadataObjects fromConnection:(AVCaptureConnection *)connection {
    NSLog(@"Inside setupScanningSession");
    
    // Do your action on barcode capture here:
    NSString *capturedBarcode = nil;
    
    // Specify the barcodes you want to read here:
    NSArray *supportedBarcodeTypes = @[AVMetadataObjectTypeQRCode];
    
    // In all scanned values..
    for (AVMetadataObject *barcodeMetadata in metadataObjects) {
        // ..check if it is a suported barcode
        for (NSString *supportedBarcode in supportedBarcodeTypes) {
            
            if ([supportedBarcode isEqualToString:barcodeMetadata.type]) {
                // This is a supported barcode
                // Note barcodeMetadata is of type AVMetadataObject
                // AND barcodeObject is of type AVMetadataMachineReadableCodeObject
                AVMetadataMachineReadableCodeObject *barcodeObject = (AVMetadataMachineReadableCodeObject *)[self.captureLayer transformedMetadataObjectForMetadataObject:barcodeMetadata];
                capturedBarcode = [barcodeObject stringValue];
                // Got the barcode. Set the text in the UI and break out of the loop.
                
                dispatch_sync(dispatch_get_main_queue(), ^{
                    [self.captureSession stopRunning];
                    self.scannedBarcode = capturedBarcode;
                    NSLog(@"Scanned Bar code: %@", self.scannedBarcode);
                    [self parseQr:self.scannedBarcode];
                });
                return;
            }else{
                NSLog(@"Bar code is not suported");
                [self showError:@"We are unable to process the QR Code"];
            }
        }
    }
}

- (void)showAnimate
{
    
    self.view.alpha = 1;
    //self.view.transform = CGAffineTransformMakeScale(1, 1.3);
    
    /** mVisa - Camera postition changing, hence commenting **/
    /** Neha Chandak **/
//    self.view.transform = CGAffineTransformMakeScale(1.3, 1.3);
//    self.view.alpha = 0;
//    [UIView animateWithDuration:.25 animations:^{
//        self.view.alpha = 1;
//        self.view.transform = CGAffineTransformMakeScale(1, 1);
//    }];
}

- (void)removeAnimate
{
    
    
    self.view.alpha = 0.0;
   // self.view.transform = CGAffineTransformMakeScale(1, 1);
    [self.captureSession stopRunning];
    [self.view removeFromSuperview];

    /** mVisa - Camera postition changing, hence commenting **/
    /** Neha Chandak **/
    
//    [UIView animateWithDuration:.25 animations:^{
//        self.view.transform = CGAffineTransformMakeScale(1.3, 1.3);
//        self.view.alpha = 0.0;
//    } completion:^(BOOL finished) {
//        if (finished) {
//            self.view.transform = CGAffineTransformMakeScale(1, 1);
//            [self.captureSession stopRunning];
//            [self.view removeFromSuperview];
//            /*
//            [self dismissViewControllerAnimated:YES completion:nil];*/
//        }
//    }];
}

- (void)showInView:(UIView *)aView animated:(BOOL)animated
{
    [self.view setFrame:CGRectMake(0, 140, aView.frame.size.width, aView.frame.size.height-140)];
    NSLog(@"Error : %f %f %f %f",aView.frame.origin.x, aView.frame.origin.y,aView.frame.size.width,aView.frame.size.height);

    
    [aView addSubview:self.view];
    if (animated) {
        [self showAnimate];
    }
}

-(void)hideQrScanner{
    [self removeAnimate];
}


-(void)parseQr:(NSString*)barcodeValue{
    QRCodeParserResponse *parserResponse = [QRCodeParser parseQRDataWithQrCodeString:barcodeValue];
    [self displayQRData:parserResponse];
}

- (void)displayQRData:(QRCodeParserResponse *)parserResponse {
    
    if (parserResponse.qrCodeError) {
        NSLog(@"Error : %@",parserResponse.qrCodeError.description);
        [self showError:@"We are unable to process the QR Code"];
    }
    else {
        QRCodeData *qrCodeData = parserResponse.qrCodeData;
        NSLog(@"Response :\n %@",parserResponse.qrCodeData.description);
        NSLog(@"JSON Response :\n %@",parserResponse.qrCodeData.jsonOutput);
        
        //Update mVIsa QR JSON in global variables
        [globalVariableObject setMVisaJsonInternal:parserResponse.qrCodeData.jsonOutput];
        
        //Send event to hybrid
        NSDictionary *data = @{ @"successFlag":@true,
                                @"message":@"Scaning successful",
                                @"OS":@"iOS"};
        [Backbase publishEvent:@"scan.mvisa.success" payload:data];
        
        
        NSString *dataStr = @"\n";
        dataStr = [dataStr stringByAppendingFormat:@"mVisaMerchantID = %@\n",(qrCodeData.mVisaMerchantID?qrCodeData.mVisaMerchantID:@"nil")];
        dataStr = [dataStr stringByAppendingFormat:@"mVisaMerchantPAN = %@\n",(qrCodeData.mVisaMerchantPAN?qrCodeData.mVisaMerchantPAN:@"nil")];
        dataStr = [dataStr stringByAppendingFormat:@"merchantName = %@\n",(qrCodeData.merchantName?qrCodeData.merchantName:@"nil")];
        dataStr = [dataStr stringByAppendingFormat:@"merchantCategoryCode = %@\n",(qrCodeData.merchantCategoryCode?qrCodeData.merchantCategoryCode:@"nil")];
        NSLog(@"Parsed String: %@", dataStr);
        
        /** mVisa **/
        /** Author - Neha Chandak **/
        [self hideQrScanner];
    }
}

-(void)showError:(NSString*)errorMessage{
    [errorContainer setHidden:NO];
    [self.cameraPreviewView bringSubviewToFront:errorContainer];
    [lblErrorMsg setText:errorMessage];
    [payWithEntryContainer setHidden:NO];
    [cameraPermissionView setHidden:YES];
}

-(void)showPermissionError:(NSString*)errorMessage topErrMessage:(NSString*) topErrMessage{
    [cameraPermissionView setHidden:NO];
    [errorContainer setHidden:NO];
    [payWithEntryContainer setHidden:YES];
    [lblErrorMsg setText:topErrMessage];
    [self.cameraPreviewView bringSubviewToFront:cameraPermissionView];
    [camErrMsg setText:errorMessage];
}


- (IBAction)goToPayeeKeyEntry:(id)sender {
    [Backbase publishEvent:@"mvisa.show.payeekey" payload:@{@"from":@"nativePayeeKeyBtn"}];
}

- (IBAction)tryAgain:(id)sender {
    [self.captureSession startRunning];
    [errorContainer setHidden:YES];
    [payWithEntryContainer setHidden:YES];
}
- (IBAction)btnCamGrantAccessAction:(id)sender {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
}
@end
