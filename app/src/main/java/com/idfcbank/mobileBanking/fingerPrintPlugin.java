package com.idfcbank.mobileBanking;
import android.Manifest;
import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.content.ContextCompat;
import android.support.v4.hardware.fingerprint.FingerprintManagerCompat;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.afollestad.digitus.Digitus;
import com.afollestad.digitus.DigitusCallback;
import com.afollestad.digitus.DigitusErrorType;
import com.backbase.android.Backbase;
import com.backbase.android.plugins.CallbackId;
import com.backbase.android.plugins.Plugin;

import org.json.JSONException;
import org.json.JSONObject;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.Map;
import javax.crypto.KeyGenerator;

/**
 * Created by taralkumars481 on 06/07/2016.
 * This class is extends native plugin to check whether device has fingerprint capability or not. If it does, it extends
 * a function for taking user's permission to user bio metric authentication. It also has function to check whether user
 * has provided fingerprint permission or not along with setting / updating fingerprint permission. It has following
 * functions
 * 1. Check whether device has fingerprint scanner or not - To be used during MPIN setup last step
 * 2. Take user's permission for using fingerprint - To be used during MPIN setup last step if above functions output is true
 * 3. Check whether user has provided permission for fingerprint or not - On login screen (on load) to open fingerprint feature
 * 4. Update fingerprint permission in global variable (calls a function mentioned in GlobalVariablees class)
 * 5. Authenticate user's fingerprint
 */
public class fingerPrintPlugin extends Plugin implements DigitusCallback{

    private Context context;
    private Activity activity;
    private static final int PERMISSION_REQUEST_CODE = 1;
    private View view;
    private KeyStore keyStore;
    private KeyGenerator keyGenerator;
    private String errorDesc="";
    private Boolean fpLibraryInit = false;
    FingerprintPopups fingerprintPopups;
    Dialog fpLoginDialog;

    Backbase cxpInstance = Backbase.getInstance();
    private int authTryCount = 0;

    public fingerPrintPlugin() {}

    public boolean getFingerPrintCapable(){
        FingerprintManagerCompat manager = FingerprintManagerCompat.from(context);
        if(manager.isHardwareDetected()){
            return true;
        }else{
            return  false;
        }
    }

    @Override
    public void initialize(Context context,  Map<String, Object> map) {
        //crash fix-java.lang.IllegalStateException: At least one fingerprint must be enrolled to create keys requiring user authentication for every use near/at com.idfcbank.mobileBanking.fingerPrintPlugin.initialize:77
        try {
            this.context = context;
            this.activity = (Activity) context;
            Digitus.init(activity, "198723990837884", 69, this);
            fingerprintPopups = new FingerprintPopups();
        }catch(Exception e){
            e.printStackTrace();
            Toast.makeText(context, "Please enroll atleast one fingerprint on your device and try again", Toast.LENGTH_SHORT).show();
        }
    }

    //Check Fingerprint capability of the device once MPIN registration is done and deciding whether to show
    //fingerprint authentication option to user or not
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void checkFingerprintCapability(@CallbackId String callbackId) {

        JSONObject result = new JSONObject();
        try{
            FingerprintManagerCompat manager = FingerprintManagerCompat.from(context);

            if (!manager.isHardwareDetected()) {
                // Device doesn't support fingerprint authentication
                result.put("scannerFlag", false);
            } else if (!manager.hasEnrolledFingerprints()) {
                // User hasn't enrolled any fingerprints to authenticate with
                result.put("scannerFlag", "none");
            } else {
                // Everything is ready for fingerprint authentication
                result.put("scannerFlag", true);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    //This is to setup fingerprint if device has the fingerprint capability
    //This shall take user to two different routes
    // 1 . if user doesnt have fingerprint registered on the device, it shall show a popup to user with option to go to settings
    // 2. Everything is fine and user can move forward with enabling fingerprint for login. This scenario will not show any popup
    // to user. It shall send out the confirmation to user
    // 3. In case of any error during the setup, it shall throw popup with an error. Native popup.

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setupFingerPrint(@CallbackId String callbackId) {

        JSONObject result = new JSONObject();
        try{
            GlobalVariables gv = new GlobalVariables();
            gv.initialize(context,null);

                FingerprintManagerCompat manager = FingerprintManagerCompat.from(context);

                if (!manager.isHardwareDetected()) {
                    // Device doesn't support fingerprint authentication
                    errorDesc = errorDesc  + " | Device doesnt have fingerprint scanning capability";
                    result.put("successFlag", false);
                    result.put("errorDesc",  errorDesc);
                } else if (!manager.hasEnrolledFingerprints()) {
                    // User hasn't enrolled any fingerprints to authenticate with
                    errorDesc = errorDesc +" | You dont have any fingerprint setup";
                    result.put("successFlag", false);
                    result.put("errorDesc",  errorDesc);

                    //1. popup - No fingerprint registered
                    fingerprintPopups.showDialog(context,activity,"no.fp.registered");
                } else {
                    // Everything is ready for fingerprint authentication
                    Digitus.init(activity,"198723990837884",69, this);
                    String fpTokne = generateRandomKey();
                    gv.setFpToken(fpTokne);
                    gv.setFingerPrintSetup("true");
                    result.put("successFlag", true);
                    result.put("fpToken", fpTokne);
                    //Toast.makeText(context, fpTokne, Toast.LENGTH_SHORT).show();
                    result.put("scannerFlag", true);
                }

        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
        Digitus.deinit();
    }

    public boolean checkPermission(){
        int result = ContextCompat.checkSelfPermission(context, Manifest.permission.USE_FINGERPRINT);
        if(result == 0)
        {
            return false;
        }else{
            return true;
        }
    }


    protected String generateRandomKey(){
        final String AB = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder(70);
        for (int i =0;i<70;i++) //Size limited to 70
            sb.append(AB.charAt(rnd.nextInt(AB.length())));
        return sb.toString();
    }

    /**
     * Authenticates user using fingerprint
     * This function shall authenticate user against fingerprint if user has setup fingerprint authentication in global varaible
     * and user has atleast one fingerprint registered. Else it shall throw error popup
     *
     * Success: Sensor starts reading fingerprint and it automatically shows small popup to indicate user that he can login using fingerprint
     * Failure: Popup 1: User has done setup but doesnt have fingerprint registered
     *          Popup 2: Authentication fails
     *          Popup 3: Clean sensor error
     * @param callbackId
     */
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void authenticateUser(@CallbackId String callbackId){
        //Started listening
        GlobalVariables gv = new GlobalVariables();
        gv.initialize(context,null);
        String fpsetupflag = gv.getFingerPrintSetup();
        Log.i("fpsetupflag" , fpsetupflag);
        JSONObject data = new JSONObject();
        //Device Black List or Appversion Grace Period is 0
        if(!gv.getDeviceBlacklistFlag().equalsIgnoreCase("true") && !gv.getGracePeriod().equalsIgnoreCase("0")) {
            if (fpsetupflag.equalsIgnoreCase("false") || fpsetupflag.equalsIgnoreCase("")) {
                try {
                    data.put("startSensor", false);
                    data.put("message", "You have not setup fingerprint authentication. Please eanble fingerprint to authenticate");
                    super.onError(context, data, callbackId);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            } else {
                FingerprintManagerCompat manager = FingerprintManagerCompat.from(context);
                if (!manager.hasEnrolledFingerprints()) {
                    // User hasn't enrolled any fingerprints to authenticate with
                    errorDesc = errorDesc + " | You dont have any fingerprint setup";
                    try {
                        data.put("startSensor", false);
                        data.put("message", errorDesc);
                    } catch (JSONException je) {
                        je.printStackTrace();
                    }
                    //popup for no fingerprint setup
                    fingerprintPopups.showDialog(context, activity, "no.fp.registered");

                    super.onError(context, data, callbackId);
                } else {
                    //Everything is fine. Start reading fingerprint
                    Digitus.init(activity, "198723990837884", 69, this);
                    if (fpLibraryInit) {
                        Digitus.get().startListening();
                        try {
                            data.put("startSensor", true);
                            data.put("message", "Sensor started");
                        } catch (JSONException je) {
                            je.printStackTrace();
                        }

                        //Fingerprint authentication popup
                        activity.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                fingerprintPopups.showDialog(context, activity, "login.using.fp");
                                authTryCount = 0;
                            }
                        });

                        super.onSuccess(context, data, callbackId);
                    } else { //Could not start sensor
                        try {
                            data.put("startSensor", false);
                            data.put("message", "Something wrong with sensor. Could not be started");
                        } catch (JSONException je) {
                            je.printStackTrace();
                        }
                        super.onError(context, data, callbackId);
                    }
                }
            }
        }else{
            try {
                data.put("startSensor", false);
                data.put("message", "Device BlackListed or app version");
            } catch (JSONException je) {
                je.printStackTrace();
            }
        }
    }

    @Override
    public void onDigitusReady(Digitus digitus) {
        //Setting up the flag to check whether scanner is ready or not
        fpLibraryInit = true;
    }

    @Override
    public void onDigitusListening(boolean newFingerprint) {
        // TODO update UI to indicate the user can imprint their finger
       // Toast.makeText(activity, "Started listening for auth", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onDigitusAuthenticated(Digitus digitus) {
        // TODO authentication was successful
       // Toast.makeText(activity, "Authenticated", Toast.LENGTH_SHORT).show();
        Digitus.deinit();
        GlobalVariables gv = new GlobalVariables();
        gv.initialize(context,null);

        JSONObject data = new JSONObject();
        try{
            data.put("successFlag",true);
            data.put("fpToken",gv.getFpToken());
            data.put("tryAgain",false);
            data.put("useMPIN",false);
            data.put("noFP",false); //no fingerprint registered
            data.put("message","Authentication Successful");
        }catch (JSONException e){
            e.printStackTrace();
        }
        fingerprintPopups.updateFpAuthDialog(true,authTryCount);
        authTryCount = 0;
        cxpInstance.publishEvent("fp.auth.result",data);
    }

    @Override
    public void onDigitusError(Digitus digitus, DigitusErrorType type, Exception e) {
        switch (type) {
            case FINGERPRINT_NOT_RECOGNIZED:
                // Fingerprint wasn't recognized, try again
                JSONObject data = new JSONObject();
                try{
                    data = new JSONObject();
                    data.put("successFlag",false);
                    data.put("fpToken","");
                    if(authTryCount <3){
                        data.put("tryAgain",true);
                        data.put("useMPIN",false);
                        data.put("noFP",false);
                        data.put("message","Could not recognize your fingerprint. Try Again!");
                    } else{
                        data.put("tryAgain",false);
                        data.put("useMPIN",true);
                        data.put("noFP",false);
                        data.put("message","3 strikes! Lets try MPIN");
                    }
                }catch (JSONException je){
                    je.printStackTrace();
                }
                authTryCount = authTryCount+ 1;
                cxpInstance.publishEvent("fp.auth.result",data);
                fingerprintPopups.updateFpAuthDialog(false,authTryCount);
                break;
            case FINGERPRINTS_UNSUPPORTED:
                // Fingerprints are not supported by the device (e.g. no sensor, or no API support).
                // Hide the authentication method
                JSONObject data3 = new JSONObject();
                try{
                    data3.put("successFlag",false);
                    data3.put("fpToken","");
                    data3.put("tryAgain",false);
                    data3.put("useMPIN",true);
                    data3.put("noFP",false);
                    data3.put("message","Your device / API doesnt support fingerprint scanning. Let's try MPIN");

                }catch (JSONException je){
                    je.printStackTrace();
                }
                authTryCount = authTryCount+ 1;
                cxpInstance.publishEvent("fp.auth.result",data3);
                break;
            case HELP_ERROR:
                // A help message for the user, e.g. "Clean the sensor", "Swiped too fast, try again", etc.
                // e.getMessage() should be displayed in UI so the user knows to try again.
                JSONObject data4 = new JSONObject();
                try{

                    data4.put("successFlag",false);
                    data4.put("fpToken","");
                    if(authTryCount <3){
                        data4.put("tryAgain",true);
                        data4.put("useMPIN",false);
                        data4.put("noFP",false);
                        data4.put("message",e.getMessage());
                    } else{
                        data4.put("tryAgain",false);
                        data4.put("useMPIN",true);
                        data4.put("noFP",false);
                        data4.put("message",e.getMessage());
                    }
                }catch (JSONException je){
                    je.printStackTrace();
                }
                authTryCount = authTryCount+ 1;
                cxpInstance.publishEvent("fp.auth.result",data4);
                break;
            case PERMISSION_DENIED:
                // The USE_FINGERPRINT permission was denied by the user or device.
                // You should fallback to password authentication.
                break;
            case REGISTRATION_NEEDED:
                // There are no fingerprints registered on the device.
                // You can open the Security Settings system screen using the code below...
                // ...but probably with a button click instead of doing it automatically.
              //  Toast.makeText(activity, e.getMessage(), Toast.LENGTH_SHORT).show();
                JSONObject data5 = new JSONObject();
                try{
                    data5.put("successFlag",false);
                    data5.put("fpToken","");
                    data5.put("tryAgain",false);
                    data5.put("useMPIN",true);
                    data5.put("noFP",true);
                    data5.put("message",e.getMessage());

                }catch (JSONException je){
                    je.printStackTrace();
                }
                authTryCount = authTryCount+ 1;
                cxpInstance.publishEvent("fp.auth.result",data5);

                digitus.openSecuritySettings();
                break;
            case UNRECOVERABLE_ERROR:
                // An recoverable error occurred, no further callbacks are sent until you start listening again.
                JSONObject data6 = new JSONObject();
                try{
                    data6.put("successFlag",false);
                    data6.put("fpToken","");
                    data6.put("tryAgain",false);
                    data6.put("useMPIN",true);
                    data6.put("noFP",true);
                    data6.put("message",e.getMessage());

                }catch (JSONException je){
                    je.printStackTrace();
                }
                authTryCount = authTryCount+ 1;
                cxpInstance.publishEvent("fp.auth.result",data6);
                break;
        }
    }

    public void stopSensor(Context context)
    {
        Digitus digitus = Digitus.get();

        //crash fix- java.lang.NullPointerException: Attempt to invoke virtual method 'boolean com.afollestad.digitus.Digitus.stopListening()' on a null object reference
        if(digitus!=null) {
            digitus.stopListening();
        }
       // Toast.makeText(context, "Stopped", Toast.LENGTH_SHORT).show();
    }

}
