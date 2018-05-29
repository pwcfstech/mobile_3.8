package com.idfcbank.mobileBanking;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.ListFragment;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;


import com.rsa.mobilesdk.sdk.MobileAPI;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
/**
 * Test class for demonstration of the sdk usage. It presents the list of
 * available API methods. When clicking a list item, there is displayed dialog
 * box with the requested information. The non-implemented API entries are
 * disabled for the while. The disabled items have gray background color.
 *
 * @author serg
 *
 */
public class RSAUtil{

    private static final int REQUEST_CODE_ASK_MULTIPLE_PERMISSIONS = 153;//A unique code in this app
    /**
     * Properties values
     */

    /**
     * the configuration property value
     */
    public static final int CONFIGURATION_VALUE = MobileAPI.CONFIGURATION_DEFAULT_VALUE;
    /**
     * max period of the waiting for location value (ms)
     */
    public static final int TIMEOUT_VALUE = MobileAPI.TIMEOUT_DEFAULT_VALUE;
    /**
     * the max age of the best location, minutes value
     */
    public static final int BEST_LOCATION_AGE_MINUTES_VALUE = MobileAPI.BEST_LOCATION_AGE_MINUTES_DEFAULT_VALUE;
    /**
     * the max age of the oldest suitable location, days value
     */
    public static final int MAX_LOCATION_AGE_DAYS_VALUE = MobileAPI.MAX_LOCATION_AGE_DAYS_DEFAULT_VALUE;
    /**
     * the max suitable horizontal accuracy, meters value
     */
    public static final int MAX_ACCURACY_VALUE = MobileAPI.MAX_ACCURACY_DEFAULT_VALUE;

    private int CONFIGURATION = 2;
    MobileAPI mobileAPI;
    private String RSA_JSON_MODIFIER = "data";

    public RSAUtil() {

    }

    public String getRSAJSONData(Activity activity) {
        mobileAPI = MobileAPI.getInstance(activity);
        mobileAPI.initSDK(getSdkProperties());
        String retrievedRsaJsonData = mobileAPI.collectInfo();
        String modifiedRsaString = "";
        JSONObject modifiedRsaJsonObject = new JSONObject();
        try {
            JSONObject rsaJsonObject = new JSONObject(retrievedRsaJsonData);
            modifiedRsaJsonObject.put(RSA_JSON_MODIFIER,rsaJsonObject);

        } catch (JSONException e) {
            e.printStackTrace();
        }
        modifiedRsaString = modifiedRsaJsonObject.toString();
        return modifiedRsaString;

    }

    public Properties getSdkProperties() {
        Properties properties = new Properties();

        properties.setProperty(MobileAPI.CONFIGURATION_KEY, String.valueOf(CONFIGURATION));
        properties.setProperty(MobileAPI.TIMEOUT_MINUTES_KEY,String.valueOf(TIMEOUT_VALUE));
        properties.setProperty(MobileAPI.BEST_LOCATION_AGE_MINUTES_KEY, String.valueOf(BEST_LOCATION_AGE_MINUTES_VALUE));
        properties.setProperty(MobileAPI.MAX_LOCATION_AGE_DAYS_KEY,String.valueOf(MAX_LOCATION_AGE_DAYS_VALUE));
        properties.setProperty(MobileAPI.ADD_TIMESTAMP_KEY, String.valueOf(1));
        properties.setProperty(MobileAPI.MAX_ACCURACY_KEY, String.valueOf(50));

        return properties;
    }

    public void destroyMobileApiInstance() {
        if(mobileAPI != null) {
            mobileAPI.destroy();
        }
    }
}