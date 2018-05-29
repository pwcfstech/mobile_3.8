package com.idfcbank.mobileBanking;

/**
 * Created by Yash.Kapila on 04-01-2016.
 */

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.provider.Settings;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.widget.Toast;

import com.backbase.android.Backbase;
import com.google.firebase.analytics.FirebaseAnalytics;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SplashScreen extends AppCompatActivity {
    private static boolean splashLoaded = false;
    public String splashResponse;

    //static final String splashUrl = "https://my.idfcbank.com/rs/deviceFootPrint";
    //static final String splashUrl = "https://my.idfcbank.com/rs/deviceFootPrint"; // existing
    static final String splashUrl = "https://my.idfcbank.com/rs/deviceFootPrintSSL";
    //static final String splashUrl = "http://10.5.8.135:7001/rs/deviceFootPrint";
    //static final String splashUrl = "http://10.5.4.13:7003/rs/deviceFootPrint";

    int CONNECTION_TIMEOUT = 15;
    int DATARETRIEVAL_TIMEOUT = 45;
    public JSONObject responseJsonObj;
    public String responseString = "";
    private Backbase cxpInstance;
    private CommonUtil commonUtil;

    public static String DEVICE_FOOTPRINT_RESPONSE_STRING;
    public static boolean IS_DEVICE_FOOTPRINT_SUCCESS = false;
    public GlobalVariables globalVariablePlugin; //3.6
    //AlertDialog alertDialog;
    @Override
    protected void onPostCreate(@Nullable Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
    }

    protected void onCreate(Bundle savedInstanceState) {
        // TODO Auto-generated method stub
        super.onCreate(savedInstanceState);
        FirebaseAnalytics.getInstance(this).setAnalyticsCollectionEnabled(false);
        cxpInstance = Backbase.getInstance();//3.6
        globalVariablePlugin = new GlobalVariables(); //3.6
        globalVariablePlugin.initialize(this, null); //3.6
        cxpInstance.registerPlugin(globalVariablePlugin); //3.6

        if (!splashLoaded) {
            setContentView(R.layout.splash);

            if (checkInternetConnectivity()) {
                //comment for local usage


                PostData(splashUrl);

                //uncomment for local usage

                Intent intent = new Intent(SplashScreen.this, MainActivity.class);
                String responseString = null;
                intent.putExtra("data", responseString);
                startActivity(intent);
//                try {
//                    Thread.sleep(3000);
//                }
//                catch (Exception e)
//                {
//                    e.printStackTrace();
//                }
                splashLoaded = true;

                finish();
                /*Intent intent = new Intent(SplashScreen.this, MainActivity.class);
                intent.putExtra("data", responseString);
                startActivity(intent);
                finish();*/
            } else {
                Toast.makeText(SplashScreen.this, "Please check you internet connectivity and try again", Toast.LENGTH_SHORT).show();
                Timer timer = new Timer();
                timer.schedule(new TimerTask() {
                    @Override
                    public void run() {
                        startActivity(new Intent(Settings.ACTION_WIFI_SETTINGS));
                    }
                }, 3000);
            }

        }
        Log.d("SPLASH", "FINISHED SPLASH");
    }

    @Override
    protected void onPause() {
        // TODO Auto-generated method stub
        super.onPause();
        finish();
    }

    @Override
    public void onPostCreate(Bundle savedInstanceState, PersistableBundle persistentState) {
        super.onPostCreate(savedInstanceState, persistentState);
    }

    /**
     * Aync Task to make http call
     */

    public void PostData(final String serviceUrl) {

        Log.d("CheckLoadTime", "start");
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    OkHttpClient client = new OkHttpClient();

                    JSONObject jsonObject = getDeviceFootPrint();
                    MediaType mediaType = MediaType.parse("application/json");
                    RequestBody body = RequestBody.create(mediaType, jsonObject.toString());
                    Request request = new Request.Builder()
                            .url(serviceUrl)
                            .post(body)
                            .addHeader("content-type", "application/json")
                            .addHeader("cache-control", "no-cache")
                            .build();

                    Response response = client.newCall(request).execute();

//                    Log.d("In additional block", response.body().string());

                    responseString = response.body().string();

                    Log.d("DEVICE_FOOTPRINT", responseString);
                    getRSAData();

                    //responseJsonObj = new JSONObject(responseString);
                    //deviceAppVersion(responseString);
                    splashLoaded = true;
                    DEVICE_FOOTPRINT_RESPONSE_STRING = responseString;
                    IS_DEVICE_FOOTPRINT_SUCCESS = true;
                    Log.d("DEVICE_FOOTPRINT", "DEVICE_FOOTPRINT_EXECUTED: " + responseString);

//                    Intent intent = new Intent(SplashScreen.this, MainActivity.class);
//                    intent.putExtra("data", responseString);
//                    startActivity(intent);
//                    finish();
                } catch (Exception e) {
                    e.printStackTrace();

                    SplashScreen.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(SplashScreen.this, "Sorry our machines are not talking to each other. Humans are trying to fix the problem. Please come back in a few moments", Toast.LENGTH_SHORT).show();

                            // alert box 22-08-2017
                               /* if(MainActivity.conSplash == null)
                                {
                                }
                                else {

                                    alertDialog = new AlertDialog.Builder(MainActivity.conSplash).create();
                                    alertDialog.setTitle("");
                                    alertDialog.setMessage("We apologise. Currently the app is under maintenance. Please try after sometime.");
                                    alertDialog.setIcon(android.R.drawable.ic_dialog_alert);
                                    alertDialog.setButton("OK", new DialogInterface.OnClickListener() {
                                        public void onClick(DialogInterface dialog, int which) {
                                            finish();
                                            System.exit(0);
                                        }
                                    });

                                    alertDialog.show();
                                }*/
                        }
                    });

                }
            }


        }).start();

    }
    private void getRSAData() { //3.6 change
        RSAUtil rsaUtil = new RSAUtil();
        String rsaJsonData = rsaUtil.getRSAJSONData(SplashScreen.this);
        Log.d("RSAJSON in Splash", rsaJsonData);
        JSONObject rsaJsonObject = null;
        try {
            rsaJsonObject = new JSONObject(rsaJsonData);
            if(rsaJsonObject != null)
            {
                globalVariablePlugin.setRSAObject(rsaJsonObject);
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
    public static void connect_failure(Context con) {


        new AlertDialog.Builder(con)
                .setTitle("")
                .setMessage("Currently we are under maintenance. Please try after sometime")
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {

                        System.exit(0);
                    }
                })
                .create().show();


    }

    private JSONObject getDeviceFootPrint() {
        Log.d("CheckLoadTime", "end");
        JSONObject jsonObjectChild = new JSONObject();
        JSONObject jsonObjectParent = new JSONObject();
        GetDeviceFootprint getDeviceFootprint = new GetDeviceFootprint();
//        TelephonyManager telephonyManager = (TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);
        GlobalVariables globalVariables = new GlobalVariables();
        commonUtil = new CommonUtil(this);
        globalVariables.initialize(this, null);
        PackageManager PM = this.getPackageManager();


        try {
            //jsonObjectChild.put("deviceId", getDeviceFootprint.getDeviceId(this));

            if (globalVariables.getDeviceId().equalsIgnoreCase("")) {
                String deviceId = UUID.randomUUID().toString();
                globalVariables.setDeviceId(deviceId);
            }
            jsonObjectChild.put("deviceId", globalVariables.getDeviceId());
            jsonObjectChild.put("deviceName", " ");
            jsonObjectChild.put("dualSim", false);
            jsonObjectChild.put("activeSIM", "No Perm");

//            jsonObjectChild.put("nwProviderLine1",telephonyManager.getNetworkOperatorName());
            jsonObjectChild.put("nwProviderLine2", "");
            jsonObjectChild.put("networkTypeLine1", getDeviceType());
            jsonObjectChild.put("networkTypeLine2", "");

            jsonObjectChild.put("phoneNoLine1", "");
            jsonObjectChild.put("phoneNoLine2", "");
            // Interchange OSname is Android
            jsonObjectChild.put("osName", "Android");
            jsonObjectChild.put("osVersion", getDeviceFootprint.getOsNameAndAPILevel());

            jsonObjectChild.put("touchIdStatus", "false");
            jsonObjectChild.put("deviceModelNo", Build.MODEL);
            jsonObjectChild.put("deviceManufacturer", Build.MANUFACTURER.toUpperCase());
            jsonObjectChild.put("batteryLevel", getBatteryLevel());

            jsonObjectChild.put("language", Locale.getDefault().getDisplayLanguage());
//            jsonObjectChild.put("country", telephonyManager.getNetworkCountryIso().toUpperCase());
            jsonObjectChild.put("multitaskingSupport", true);
            jsonObjectChild.put("proximityMonitoringEnabled", PM.hasSystemFeature(PackageManager.FEATURE_SENSOR_PROXIMITY));

            jsonObjectChild.put("timeZone", TimeZone.getDefault().getID().replace("\\/", ""));
            jsonObjectChild.put("geoLatitude", "No Perm");
            jsonObjectChild.put("geoLongitude", "No Perm");
            jsonObjectChild.put("ipAddress", getIPAddress(true));

            jsonObjectChild.put("connectionMode", commonUtil.getNetworkClass());
            jsonObjectChild.put("jailBrokenRooted", false);
            jsonObjectChild.put("emailId", "");

            if (commonUtil.getNetworkClass().equals("WIFI")) {
                jsonObjectChild.put("wifiStationName", "No Perm");

                jsonObjectChild.put("wifiBBSID", "No Perm");
                jsonObjectChild.put("wifiSignalStrength", "No Perm");
            } else {
                jsonObjectChild.put("wifiStationName", "Not on Wifi");

                jsonObjectChild.put("wifiBBSID", "Not on Wifi");
                jsonObjectChild.put("wifiSignalStrength", "Not on Wifi");
            }
            jsonObjectChild.put("cellTowerID", "No Perm");
            jsonObjectChild.put("locationAreaCode", "No Perm");

            jsonObjectChild.put("mcc", "No Perm");
            jsonObjectChild.put("mnc", "No Perm");
            jsonObjectChild.put("GSMsignalStrength", "No Perm");

            jsonObjectChild.put("appVersionId", getDeviceFootprint.getAppVersionName(this));

            /*IDFC 3.0- Added to show marketing screen everytime App it updated*/
            globalVariables.setCurrentVersionOnDevice(getDeviceFootprint.getAppVersionName(this));

            jsonObjectChild.put("notificationPermissionFlag", "false");
            jsonObjectChild.put("notificationTokenId", globalVariables.getNotificationToken());
            jsonObjectChild.put("smsReadFlag", getDeviceFootprint.checkSmsReadPermission(this));

            jsonObjectParent.accumulate("data", jsonObjectChild);

            Log.d("Splash", "devicefoot print:" + jsonObjectParent.toString());
            return jsonObjectParent;

        } catch (JSONException e) {
            e.printStackTrace();
        }

        return null;
    }

    /*private JSONObject getDeviceFootPrint() {
        JSONObject jsonObjectChild = new JSONObject();
        JSONObject jsonObjectParent = new JSONObject();
        GetDeviceFootprint getDeviceFootprint = new GetDeviceFootprint();
        TelephonyManager telephonyManager = (TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);
        GlobalVariables globalVariables = new GlobalVariables();
        globalVariables.initialize(this, null);

        try {
            //jsonObjectChild.put("deviceId", getDeviceFootprint.getDeviceId(this));

            if(globalVariables.getDeviceId().equalsIgnoreCase("")){
                String deviceId = UUID.randomUUID().toString();
                globalVariables.setDeviceId(deviceId);
            }
            jsonObjectChild.put("deviceId", globalVariables.getDeviceId());
            jsonObjectChild.put("deviceName", "My Phone");
            jsonObjectChild.put("dualSim", false);
            jsonObjectChild.put("activeSIM", "9174917917234791237498");

            jsonObjectChild.put("nwProviderLine1",telephonyManager.getNetworkOperatorName());
            jsonObjectChild.put("nwProviderLine2", "");
            jsonObjectChild.put("networkTypeLine1", "GSM");
            jsonObjectChild.put("networkTypeLine2", "");

            jsonObjectChild.put("phoneNoLine1", telephonyManager.getLine1Number());
            jsonObjectChild.put("phoneNoLine2", "");
            jsonObjectChild.put("osName", "Android");
            jsonObjectChild.put("osVersion", getDeviceFootprint.getOsNameAndAPILevel());

            jsonObjectChild.put("touchIdStatus", getDeviceFootprint.checkFpCapability(this));
            jsonObjectChild.put("deviceModelNo", Build.MODEL);
            jsonObjectChild.put("deviceManufacturer", Build.MANUFACTURER.toUpperCase());
            jsonObjectChild.put("batteryLevel", "45");

            jsonObjectChild.put("language", Locale.getDefault().getDisplayLanguage());
            jsonObjectChild.put("country", telephonyManager.getNetworkCountryIso().toUpperCase());
            jsonObjectChild.put("multitaskingSupport", true);
            jsonObjectChild.put("proximityMonitoringEnabled", true);

            jsonObjectChild.put("timeZone", TimeZone.getDefault().getID().replace("\\/",""));
            jsonObjectChild.put("geoLatitude", "45.9937884");
            jsonObjectChild.put("geoLongitude", "67.837747");
            jsonObjectChild.put("ipAddress", getDeviceFootprint.getIPAddress(true));

            jsonObjectChild.put("connectionMode", "Wifi");
            jsonObjectChild.put("jailBrokenRooted", false);
            jsonObjectChild.put("emailId", "");
            jsonObjectChild.put("wifiStationName", "IDFC_BYOD");

            jsonObjectChild.put("wifiBBSID", "8712399");
            jsonObjectChild.put("wifiSignalStrength", "91db");
            jsonObjectChild.put("cellTowerID", "BTS63774");
            jsonObjectChild.put("locationAreaCode", "2637");

            jsonObjectChild.put("mcc", "190");
            jsonObjectChild.put("mnc", "192");
            jsonObjectChild.put("GSMsignalStrength", "34");
            jsonObjectChild.put("appVersionId", getDeviceFootprint.getAppVersionName(this));

            jsonObjectChild.put("notificationPermissionFlag", false);
            jsonObjectChild.put("notificationTokenId", "");
            jsonObjectChild.put("smsReadFlag", getDeviceFootprint.checkSmsReadPermission(this));

            jsonObjectParent.accumulate("data", jsonObjectChild);
            return jsonObjectParent;

        } catch (JSONException e) {
            e.printStackTrace();
        }

        return null;
    }*/

    private boolean checkInternetConnectivity() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo netInfo = cm.getActiveNetworkInfo();
        if (netInfo != null && netInfo.isConnectedOrConnecting()) {
            return true;
        } else {
            return false;
        }
    }

    //Native Popup for Appversion Check and Device Blacklist
    private void deviceAppVersion(String parsingData) {
        //Toast.makeText(mainactivity_backup.this, parsingData, Toast.LENGTH_LONG).show();
        cxpInstance = cxpInstance.getInstance();
        try {
            JSONObject jsonObject = new JSONObject(parsingData);

            JSONObject msgHeader = jsonObject.getJSONObject("msgHeader");

            String hostStatus = msgHeader.getString("hostStatus");

            if (hostStatus.equalsIgnoreCase("S")) {
                JSONObject data = jsonObject.getJSONObject("data");

                String appVersionStatus = data.getString("appVersionStatus");
                String newVersonDescription = data.getString("newVersionDescription");
                String activeVersionNo = data.getString("activeVersionNo");
                String gracePeriod = data.getString("gracePeriod");
                String appUpgradeMessage = data.getString("appUpgradeMessage");
                String appDownloadLink = data.getString("appDownloadLink");
                String deviceBlockFlag = data.getString("deviceBlockFlag");
                String deviceBLockErrMsg = data.getString("deviceBLockErrMsg");

                if (deviceBlockFlag == "true") {
                    JSONObject deviceBlackList = new JSONObject();
                    deviceBlackList.put("data", "DVCEBLCKLIST");
                    deviceBlackList.put("message", deviceBLockErrMsg);
                    ViewDialog alert = new ViewDialog();
                    alert.showDialog(this, deviceBlackList.toString(), this);
                } else {
                    if ("D".equalsIgnoreCase(appVersionStatus)) {
                        if (!gracePeriod.equalsIgnoreCase("0") || gracePeriod.isEmpty()) {
                            JSONObject appversionObj = new JSONObject();
                            appversionObj.put("data", "APPUPWTHNGP");
                            appversionObj.put("url", appDownloadLink);
                            String message = "This version of your app requires updating in " + gracePeriod
                                    + " days. Upgrade to latest version? ";
                            appversionObj.put("message", message);
                            appversionObj.put("appDetails", newVersonDescription);
                            ViewDialog alert = new ViewDialog();
                            alert.showDialog(this, appversionObj.toString(), this);
                        } else if (gracePeriod.equalsIgnoreCase("0")) {
                            JSONObject appversionObj = new JSONObject();
                            appversionObj.put("data", "APPUPBYNDGP");
                            appversionObj.put("url", appDownloadLink);
                            String message = "Your IDFC app version is too old and is no longer supported. Upgrade to version " +
                                    activeVersionNo + " to access new features?";
                            appversionObj.put("message", message);
                            appversionObj.put("appDetails", newVersonDescription);
                            ViewDialog alert = new ViewDialog();
                            alert.showDialog(this, appversionObj.toString(), this);
                            // cxpInstance.publishEvent("display.1btn.popup", appversionObj);
                        }
                    }
                }

                /*globalVariablePlugin.setAppVersionStatus(appVersionStatus);
                globalVariablePlugin.setNewVersionDescription(data.getString("newVersionDescription"));
                globalVariablePlugin.setActiveVersionNo(data.getString("activeVersionNo"));
                globalVariablePlugin.setGracePeriod(data.getString("gracePeriod"));
                globalVariablePlugin.setAppUpgradeMessage(data.getString("appUpgradeMessage"));
                globalVariablePlugin.setAppDownloadLink(data.getString("appDownloadLink"));
                globalVariablePlugin.setDeviceBlacklistFlag(data.getString("deviceBlockFlag"));
                globalVariablePlugin.setBlacklistMessage(data.getString("deviceBLockErrMsg"));*/
            } else {
                Log.e("SPLASH", "Host status is not success");
            }
        } catch (JSONException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getDeviceType() {
        String phoneType = new String();
        TelephonyManager telephonyManager = ((TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE));

        phoneType = telephonyManager.getPhoneType() == TelephonyManager.PHONE_TYPE_GSM ? "GSM" : phoneType;
        phoneType = telephonyManager.getPhoneType() == TelephonyManager.PHONE_TYPE_CDMA ? "CDMA" : phoneType;

        return phoneType;
    }

    public String getBatteryLevel() {
        Intent batteryIntent = registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
        int level = batteryIntent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = batteryIntent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);

        // Error checking that probably isn't needed but I added just in case.
        if (level == -1 || scale == -1) {
            return String.valueOf(50.0f);
        }

        return String.valueOf(((float) level / (float) scale) * 100.0f);
    }

    public static String getIPAddress(boolean useIPv4) {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface intf : interfaces) {
                List<InetAddress> addrs = Collections.list(intf.getInetAddresses());
                for (InetAddress addr : addrs) {
                    if (!addr.isLoopbackAddress()) {
                        String sAddr = addr.getHostAddress();
                        //boolean isIPv4 = InetAddressUtils.isIPv4Address(sAddr);
                        boolean isIPv4 = sAddr.indexOf(':') < 0;

                        if (useIPv4) {
                            if (isIPv4)
                                return sAddr;
                        } else {
                            if (!isIPv4) {
                                int delim = sAddr.indexOf('%'); // drop ip6 zone suffix
                                return delim < 0 ? sAddr.toUpperCase() : sAddr.substring(0, delim).toUpperCase();
                            }
                        }
                    }
                }
            }
        } catch (Exception ex) {
        } // for now eat exceptions
        return "";
    }


}