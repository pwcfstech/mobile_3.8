package com.idfcbank.mobileBanking;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.support.v4.content.ContextCompat;
import android.webkit.JavascriptInterface;

import com.backbase.android.plugins.CallbackId;
import com.backbase.android.plugins.Plugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

/**
 * Created by taralkumars481 on 06/07/2016.
 * This class extends SMS reading and permission capabilities. It has following functions
 * 1. Check whether user has given SMS reading permission
 * 2. Update SMS reading flag in Global variable
 * 3. Read SMS and return the OTP
 */
public class SMSPlugin extends Plugin {

    private Context context;
    private String callbackIdGlobal;
    Activity activity;
    private Intent intent;

    private String PERMISSION = Manifest.permission.RECEIVE_SMS;
    private String DIALOG_TITLE = "Read Incoming SMS";
    private String DIALOG_MESSAGE = "We need to access your incoming SMS for pulling out OTP";

    //Naked constructor
    public SMSPlugin() {
    }

    @Override
    public void initialize(Context context, Map<String, Object> map) {
        this.intent = intent;
        this.context = context;
        activity = (Activity) context;
    }

    //Before calling OTP service, call this function to check whether user has SMS reading permission or not
    //If it returns false, send request to OTP web service
    //If it returns true, call publisher "readSMS" and call OTP service
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void checkSMSReadPermission(@CallbackId String callbackId) {
        JSONObject result = new JSONObject();
        try {
            if (!checkPermission()) {
                //User has not provided SMS reading permission
                result.put("successFlag", false);
                onSuccess(context, result, callbackId);
            } else if (checkPermission()) {
                // User has provided SMS reading permission
                result.put("successFlag", true);
                onSuccess(context, result, callbackId);
            } else {
                result.put("error", "Cant read permission");
                onError(context, result, callbackId);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    //Check SMS reading permission on the device from user
    private boolean checkPermission() {
        int result = ContextCompat.checkSelfPermission(context, Manifest.permission.RECEIVE_SMS);
        if (result == PackageManager.PERMISSION_GRANTED) {
            return true;
        } else {
            return false;
        }
    }


    //This function to be called on login and MPIN login screen to take permission from user
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void takeSMSPermission(@CallbackId String callbackId) {
        RuntimePermission runtimePermission = new RuntimePermission();
        runtimePermission.requestPermission(context, activity);


    }

}
