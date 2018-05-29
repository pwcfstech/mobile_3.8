package mVisa;
import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.graphics.Rect;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.content.ContextCompat;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.SparseArray;
import android.view.SurfaceHolder;
import android.view.View;
import android.widget.RelativeLayout;
import com.google.android.gms.vision.CameraSource;
import com.google.android.gms.vision.Detector;
import com.google.android.gms.vision.barcode.Barcode;
import com.google.android.gms.vision.barcode.BarcodeDetector;
import com.idfcbank.mobileBanking.MainActivity;
import com.idfcbank.mobileBanking.R;
import com.visa.mvisa.tlvparser.QrCodeParser;
import com.visa.mvisa.tlvparser.QrCodeParserResponse;

import org.json.JSONException;
import org.json.JSONObject;

public class ScanQRcodePopup implements SurfaceHolder.Callback{

    private final String logTag = ScanQRcodePopup.class.getSimpleName();
    private RelativeLayout.LayoutParams lp;
    private MainActivity context;
    private JSONObject jsonObject;
    public static String qrCodeParserResponseString="";
    private BarcodeDetector barcodeDetector;
    private CameraSource cameraSource;

    private int screenHeight,screenWidth;


    public ScanQRcodePopup(MainActivity context){
        this.context = context;

        DisplayMetrics displayMetrics = new DisplayMetrics();
        context.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        screenHeight = displayMetrics.heightPixels;
        screenWidth = displayMetrics.widthPixels;
        Log.d(logTag,"screen w/h:"+screenWidth+"/"+screenHeight);

        initialiseCamera();
    }

    public void showQRCodeScanPopup(boolean value) {
        boolean showScanner = value;
        Log.d(logTag, "showQRCodeScanPopup called:" +" showScanner: "+ showScanner + " qrCodeParserResponseString: "+ qrCodeParserResponseString);
        if (showScanner) {
            context.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    /*lp = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, 400);*/
                    lp = new RelativeLayout.LayoutParams(screenWidth, (int)(screenHeight*0.23f));
                    context.contentFrameLL.setLayoutParams(lp);

                    context.scanErrorTextView.setVisibility(View.INVISIBLE);
                    context.payUsingMobileTextView.setVisibility(View.INVISIBLE);
                    context.payeeKeyBtn.setVisibility(View.INVISIBLE);
                    context.tryAgainBtn.setVisibility(View.INVISIBLE);

                    //changing surface view size depending on device size
                    context.cameraView.setVisibility(View.VISIBLE);
                    lp = new RelativeLayout.LayoutParams(screenWidth, (int)(screenHeight*0.77f));
                    context.cameraView.setLayoutParams(lp);
                    /*lp = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, 1500);*/


                    context.cameraFocusView.setVisibility(View.VISIBLE);
                    lp = new RelativeLayout.LayoutParams(screenWidth, (int)(screenHeight*0.77f));
                    context.cameraFocusView.setLayoutParams(lp);
                }
            });
            startCamera();

        } else {
            if (qrCodeParserResponseString.equalsIgnoreCase("invalidQRCode")) {
                context.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        /*lp = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, 400);*/
                        lp = new RelativeLayout.LayoutParams(screenWidth, (int)(screenHeight*0.23f));
                        context.contentFrameLL.setLayoutParams(lp);

                        lp = new RelativeLayout.LayoutParams(0, 0);
                        context.cameraFocusView.setLayoutParams(lp);

                        /*lp = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, 600);*/
                        lp = new RelativeLayout.LayoutParams(screenWidth, (int)(screenHeight*0.35f));
                        // lp.topMargin=130;
                        lp.topMargin=(int)(screenHeight*0.07f);
                        context.cameraView.setLayoutParams(lp);

                        context.cameraView.setVisibility(View.VISIBLE);
                        context.scanErrorTextView.setVisibility(View.VISIBLE);
                        context.scanErrorTextView.setText(context.getString(R.string.invalid_QR));
                        context.payUsingMobileTextView.setText(context.getString(R.string.pay_using_mobile));
                        context.payUsingMobileTextView.setVisibility(View.INVISIBLE);
                        context.payeeKeyBtn.setVisibility(View.VISIBLE);
                        context.payeeKeyBtn.setText(context.getString(R.string.pay_using_key));
                        context.tryAgainBtn.setVisibility(View.VISIBLE);
                        context.tryAgainBtn.setText(context.getString(R.string.try_again));
                        context.cameraFocusView.setVisibility(View.INVISIBLE);
                        cameraSource.stop();

                    }
                });
            } else if(qrCodeParserResponseString.equalsIgnoreCase("cameraPermissionDenied")){
                context.runOnUiThread(new Runnable() {
                      @Override
                      public void run() {
                          /*lp = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, 400);*/
                          lp = new RelativeLayout.LayoutParams(screenWidth, (int)(screenHeight*0.23f));
                          context.contentFrameLL.setLayoutParams(lp);

                          context.cameraView.setVisibility(View.VISIBLE);
                          /*lp = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, 600);*/
                          lp = new RelativeLayout.LayoutParams(screenWidth, (int)(screenHeight*0.35f));
                          /*lp.topMargin = 130;*/
                          lp.topMargin=(int)(screenHeight*0.07f);
                          context.cameraView.setLayoutParams(lp);

                          context.scanErrorTextView.setText(context.getString(R.string.unable_to_access_camera));
                          context.scanErrorTextView.setVisibility(View.VISIBLE);
                          context.payUsingMobileTextView.setText(context.getString(R.string.camera_permission_text));
                          context.payUsingMobileTextView.setVisibility(View.VISIBLE);
                          context.payeeKeyBtn.setText(context.getString(R.string.grant_access));
                          context.payeeKeyBtn.setVisibility(View.VISIBLE);
                          context.tryAgainBtn.setText(context.getString(R.string.pay_using_key));
                          context.tryAgainBtn.setVisibility(View.VISIBLE);
                          context.cameraFocusView.setVisibility(View.INVISIBLE);
                      }
                });
            }
            else{
                context.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        /*for going to payee key page thru toggle or payee key btn
                        or going to confirmation page after successful scan
                        for qrCodeParserResponseString=validQRCode || "" */
                        context.cameraView.setVisibility(View.INVISIBLE);
                        context.scanErrorTextView.setVisibility(View.INVISIBLE);
                        context.payUsingMobileTextView.setVisibility(View.INVISIBLE);
                        context.payeeKeyBtn.setVisibility(View.INVISIBLE);
                        context.tryAgainBtn.setVisibility(View.INVISIBLE);
                        context.cameraFocusView.setVisibility(View.INVISIBLE);

                        lp = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT);
                        context.contentFrameLL.setLayoutParams(lp);

                    }
                });
            }

        }
        qrCodeParserResponseString = "";
    }

    private void initialiseCamera(){
        barcodeDetector =
                new BarcodeDetector.Builder(context)
                        .setBarcodeFormats(Barcode.QR_CODE)
                        .build();
        cameraSource = new CameraSource
                .Builder(context, barcodeDetector)
                .setRequestedPreviewSize(640,480)
                .setAutoFocusEnabled(true)
                .build();
    }

    private void startCamera(){
        Log.d(logTag,"startCamera called");
        context.cameraFocusView.getHolder().addCallback(this);
        context.cameraFocusView.getHolder().setFormat(PixelFormat.TRANSLUCENT);
        context.cameraFocusView.setZOrderMediaOverlay(true);
        context.cameraView.getHolder().addCallback(this);
    }

    private void fetchQRcodeString(){
        Log.d(logTag,"fetchQRcodeString called");
        Log.d(logTag,"barcodeDetector operational? "+barcodeDetector.isOperational());
        barcodeDetector.setProcessor(new Detector.Processor<Barcode>() {
            @Override
            public void release() {}
            @Override
            public void receiveDetections(Detector.Detections<Barcode> detections) {
                final SparseArray<Barcode> barcodes = detections.getDetectedItems();
                if (barcodes.size() != 0) {
                    Log.d(logTag,"barcodes.valueAt(0).displayValue:"+barcodes.valueAt(0).displayValue);
                    context.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            context.loadingSpinner.setVisibility(View.VISIBLE);
                            Log.d(logTag,"make spinner VISIBLE");
                        }
                    });
                    processQRcodeString(barcodes.valueAt(0).displayValue);
                }
            }
        });
    }

    /** Kriti - code to initialise and test QrCodeParser SDK
     * to parse the barcodes received from QRcode */
    private void processQRcodeString(String barcodeValue){

        Log.d(logTag,"processQRcodeString called");
        String qrCodeValue=barcodeValue;

        //hide loading spinner after 10s-to indicate scan start and stop
        final Handler handler=new Handler(Looper.getMainLooper());
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                context.loadingSpinner.setVisibility(View.INVISIBLE);
                Log.d(logTag,"make spinner invisible after 10s");
            }
        },500);

        QrCodeParser qrCodeParser = new QrCodeParser();
        QrCodeParserResponse qrCodeParserResponse = qrCodeParser.parseQrData(qrCodeValue);


        //Method 2 :Calling the sdk to get the respnse as json.
        //not required-kept it just for testing
        String qrCodeParserResponse1 = new QrCodeParser().parseQrDataAsJson(qrCodeValue);
        Log.d(logTag, "qrCodeParserResponse1 JSON RESPONSE : " + qrCodeParserResponse1);




        if (qrCodeParserResponse != null) {
            //Checking if error codes list is not empty
            if(qrCodeParserResponse.getQrCodeError() != null && !qrCodeParserResponse.getQrCodeError().isEmpty()) {
                Log.d(logTag, "Error Codes : " + qrCodeParserResponse.getQrCodeError());
                Log.d(logTag, "Data : " + qrCodeParserResponse.getQrCodeData());
                qrCodeParserResponseString="invalidQRCode";
                showQRCodeScanPopup(false);
            }else if(qrCodeParserResponse.getQrCodeData().getmVisaMerchantId()==null && qrCodeParserResponse.getQrCodeData().getNpciid1()==null && qrCodeParserResponse.getQrCodeData().getMasterCardPan1()==null){
                Log.d(logTag, "No Merchant id is present : " + qrCodeParserResponse.getQrCodeData());
                qrCodeParserResponseString="invalidQRCode";
                showQRCodeScanPopup(false);
            }
            else if (qrCodeParserResponse.getQrCodeData() != null) {
                /**if error code list is empty,
                then getting the value from the parsed response and printing*/
                qrCodeParserResponseString = new QrCodeParser().parseQrDataAsJson(qrCodeValue);
                Log.d(logTag, "JSON RESPONSE : " + qrCodeParserResponseString);
                context.globalVariablePlugin.setMVisaJsonLocally(qrCodeParserResponseString);

                jsonObject = new JSONObject();
                try {
                    jsonObject.put("successFlag","true");
                    jsonObject.put("message","QR");
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                context.cxpInstance.publishEvent("scan.mvisa.success",jsonObject);
                qrCodeParserResponseString="validQRCode";
                showQRCodeScanPopup(false);
            }
        }else{
            Log.d(logTag,"invalid qr code");
            qrCodeParserResponseString="invalidQRCode";
            showQRCodeScanPopup(false);
        }
    }

    public void tryAgain(){
        Log.d(logTag,"tryAgain called");
        showQRCodeScanPopup(true);
    }

    public void payUsingPayeeKey(){
        Log.d(logTag,"payUsingPayeeKey called");
        jsonObject = new JSONObject();
        //send from key to stop changing page when forcefully changing toggle from controller
        try {
            jsonObject.put("from","nativePayeeKeyBtn");
        } catch (JSONException e) {
            e.printStackTrace();
        }
        qrCodeParserResponseString="";
        showQRCodeScanPopup(false);
        context.cxpInstance.publishEvent("mvisa.show.payeekey",jsonObject);
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        Log.d(logTag,"surfaceCreated for holder:");

        try {
            if(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                cameraSource.start(context.cameraView.getHolder());

              //  synchronized (context.cameraFocusView.getHolder()) {
                    context.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            drawFrame();
                        }
                    });
                //}
            }

            fetchQRcodeString();
        } catch (Exception ie) {
            Log.d(logTag, ie.getMessage());
        }
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {

    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {cameraSource.stop();}

    private void drawFrame(){
        Log.d(logTag,"drawFrame");

        context.cameraFocusView.setVisibility(View.VISIBLE);
        Canvas canvas = context.cameraFocusView.getHolder().lockCanvas();
        if(canvas!=null) {
            canvas.drawColor(0, PorterDuff.Mode.CLEAR);
            Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
            paint.setStyle(Paint.Style.STROKE);
            paint.setColor(Color.WHITE);
            paint.setStrokeWidth(10);

            // float lines[] = {100, 200, 100, 400, 100, 200, 300, 200, 1000, 200, 1000, 400, 1000, 200, 800, 200, 100, 1100, 100, 900, 100, 1100, 300, 1100, 1000, 1100, 1000, 900, 1000, 1100, 800, 1100};
            // canvas.drawLines(lines, paint);

            canvas.drawLine(screenWidth*0.15f, screenHeight*0.1f, screenWidth*0.15f, screenHeight*0.2f, paint);
            canvas.drawLine(screenWidth*0.15f, screenHeight*0.1f, screenWidth*0.25f, screenHeight*0.1f, paint);

            canvas.drawLine(screenWidth*0.85f, screenHeight*0.1f, screenWidth*0.85f, screenHeight*0.2f, paint);
            canvas.drawLine(screenWidth*0.85f, screenHeight*0.1f, screenWidth*0.75f, screenHeight*0.1f, paint);

            canvas.drawLine(screenWidth*0.15f, screenHeight*0.6f, screenWidth*0.15f, screenHeight*0.5f, paint);
            canvas.drawLine(screenWidth*0.15f, screenHeight*0.6f, screenWidth*0.25f, screenHeight*0.6f, paint);

            canvas.drawLine(screenWidth*0.85f, screenHeight*0.6f, screenWidth*0.85f, screenHeight*0.5f, paint);
            canvas.drawLine(screenWidth*0.85f, screenHeight*0.6f, screenWidth*0.75f, screenHeight*0.6f, paint);

            context.cameraFocusView.getHolder().unlockCanvasAndPost(canvas);

        }
    }
}
