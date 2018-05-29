package com.idfcbank.mobileBanking;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.webkit.JavascriptInterface;


import com.backbase.android.plugins.CallbackId;
import com.backbase.android.plugins.Plugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

/**
 * Created by taralkumars481 on 06/07/2016.
 * This class is extends native plugin to set global preference in the app. Following preferences will be set
 * 1. Set Marketing page walkthrough
 * 2. Set MPIN setup flag
 */
public class GlobalVariables extends Plugin {

    private Context context;
    private String marketingFlag;
    private String mpinFlag;
    private String fingerPrintSetup;
    SharedPreferences prefs;
    Activity activity;
    private CommonUtil commonUtil;
    private final String logTag = GlobalVariables.class.getSimpleName();

    public GlobalVariables() {}

    @Override
    public void initialize(Context context, Map<String, Object> map) {
        this.context = context;
        prefs = context.getSharedPreferences("pref",0);
        activity = (Activity)context;
        instilizeprefvalue();
    }

    public boolean containKey(String Key) {
        return prefs.contains(Key);
    }

    public void instilizeprefvalue() {
        if (!containKey("deviceId")) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("deviceId", "");
            editor.commit();
        }
        if (!containKey("marketingFlag")) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("marketingFlag", "");
            editor.commit();
        }
        if (!containKey("mpinFlag")) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("mpinFlag", "");
            editor.commit();
        }
        if (!containKey("fpKeyForToken")) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("fpKeyForToken", "");
            editor.commit();
        }
        if (!containKey("fpToken")) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("fpToken", "");
            editor.commit();
        }

        //Adding all the value used in Plugin
        if (!containKey("loginType")) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("loginType", "");
            editor.commit();
        }
        if (!containKey("appVersionViewed")) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("appVersionViewed", "false");
            editor.commit();
        }
        if(!containKey("appVersionStatus")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("appVersionStatus","");
            editor.commit();
        }
        if(!containKey("newVersionDescription")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("newVersionDescription","");
            editor.commit();
        }
        if(!containKey("activeVersionNo")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("activeVersionNo","");
            editor.commit();
        }
        if(!containKey("gracePeriod")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("gracePeriod","");
            editor.commit();
        }
        if(!containKey("upgradeMessage")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("upgradeMessage","");
            editor.commit();
        }
        if(!containKey("appDownloadLink")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("appDownloadLink","");
            editor.commit();
        }
        if(!containKey("deviceBlacklistFlag")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("deviceBlacklistFlag","");
            editor.commit();
        }
        if(!containKey("blacklistMessage")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("blacklistMessage","");
            editor.commit();
        }
        if(!containKey("notificationToken")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("notificationToken","");
            editor.commit();
        }
        if(!containKey("assetFlag")){
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("assetFlag","");
            editor.commit();
        }
        if(!containKey("navigateToProfile")){   //3.5 change
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("navigateToProfile","");
            editor.commit();
        }
        if(!containKey("rsaData")){   //3.6 change
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("rsaData","");
            editor.commit();
        }


    }

    //Setting up Global parameters
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setMarketingFlag(@CallbackId String callbackId, String flagValue) {
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("marketingFlag", flagValue);
            editor.commit();
            //publishData(callbackId, "setMarketingFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setMpinFlag(@CallbackId String callbackId, String flagValue) {
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("mpinFlag", flagValue);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    /**
     * Set Login Type Current MPIN or IB
     * @param callbackId
     * @param flagValue
     */
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setLoginType(@CallbackId String callbackId, String flagValue) {
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("loginType", flagValue);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    /**
     * Setting App version viewed
     * @param callbackId
     * @param flagValue
     */
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setAppVersionViewed(@CallbackId String callbackId, String flagValue) {
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("appVersionViewed", flagValue);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setNavigateToProfile(@CallbackId String callbackId, String flagValue) { //3.5 change
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("navigateToProfile", flagValue);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getNavigateToProfile(@CallbackId String callbackId){ //3.5 change
        String flag = prefs.getString("navigateToProfile", "");
        JSONObject result = new JSONObject();
        try {
            result.put("navigateToProfile",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }


    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getMarketingFlag(@CallbackId String callbackId)
    {
        String flag = prefs.getString("marketingFlag", "");
        JSONObject result = new JSONObject();
        try {
            result.put("marketingFlag",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }


    /**
     * Combine flag for fetching marketing page decider
     * @param callbackId
     */
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getMarketingDecider(@CallbackId String callbackId)
    {
        String marketingFlag = prefs.getString("marketingFlag", "false");
        String appVersionStatus = getAppVersionStatus();
        String isBlackListed = getDeviceBlacklistFlag();
        String mpinFlag = prefs.getString("mpinFlag", "false");
        String blacklistMessage = prefs.getString("blacklistMessage", "false");
        JSONObject result = new JSONObject();
        try {
            result.put("marketingFlag",marketingFlag);
            result.put("appVersionStatus",appVersionStatus);
            result.put("isBlackListed",isBlackListed);
            result.put("mpinFlag",mpinFlag);
            result.put("blacklistMessage",blacklistMessage);
    } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    /**
     * This Call is called to fetch value of Device FootPrint Header
     * @param callbackId
     */
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getDeviceFootPrintHeader(@CallbackId String callbackId)
    {
        commonUtil = new CommonUtil(context);
        JSONObject result = new JSONObject();
        try {

            //Call Device FootPrint Code
            result.put("deviceId",getDeviceId());
            result.put("channel","M");
            result.put("ipAddress",getIPAddress(true));
            result.put("timeZone", TimeZone.getDefault().getID().replace("\\/",""));
            result.put("nwProvider","No Perm");
            result.put("connectionMode",commonUtil.getNetworkClass());
            result.put("geoLatitude","No Perm");
            result.put("geoLongitude","No Perm");

        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }


    /**
     * Get App Version Details
     * @param callbackId
     */
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getAppVersionData(@CallbackId String callbackId)
    {
        JSONObject result = new JSONObject();
        try {
            result.put("appVersionId","1.1");
            result.put("versionDescription",getNewVersionDescription());
            result.put("activeVersionNo",getActiveVersionNo());
            result.put("gracePeriod",getGracePeriod());
            result.put("appUpgradeMessage",getAppUpgradeMessage());
            result.put("appVersionStatus",getAppVersionStatus());
            result.put("appDownloadLink",getAppDownloadLink());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getMpinFlag(@CallbackId String callbackId){
        String flag = prefs.getString("mpinFlag", "");
        JSONObject result = new JSONObject();
        try {
            result.put("mpinFlag",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getLoginType(@CallbackId String callbackId){
        String flag = prefs.getString("loginType", "");
        JSONObject result = new JSONObject();
        try {
            result.put("loginType",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getFCMNotificationToken(@CallbackId String callbackId){
        String flag = prefs.getString("notificationToken", "");
        JSONObject result = new JSONObject();
        try {
            result.put("notificationToken",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setFingerPrintSetupJS(@CallbackId String callbackId , String fingerPrintSetup){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("fingerPrintSetup", fingerPrintSetup);
        editor.commit();
    }

    //5278
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getFingerPrintSetup(@CallbackId String callbackId , String fingerPrintSetup){
        String flag = prefs.getString("fingerPrintSetup", "");
        JSONObject result = new JSONObject();
        try {
            result.put("fingerPrintSetup",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void resetDevice(@CallbackId String callbackId){
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("mpinFlag", "");
            editor.putString("marketingFlag", "");
            editor.putString("fpKeyForToken", "");
            editor.putString("fpToken", "");
            editor.commit();
            activity.finish();

            result.put("successFlag",true);

        }catch (Exception e){
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    private void publishData(String callbackId, String type)
    {
        try {
            if (type=="setMarketingFlag") {
                String marketingFlagVlue = prefs.getString("marketingFlag", "");
                this.onSuccess(context, new JSONObject("{ success : " + marketingFlagVlue + " }"), callbackId);
            } else if(type == "setMpinFlag") {
                String mpinFlagValue = prefs.getString("mpinFlag", "");
                this.onSuccess(context, new JSONObject("{ data : " + mpinFlagValue + "}"), callbackId);
            }
        } catch (JSONException e){
            Log.d("Network Feature", e.toString());
            e.printStackTrace();
        }
    }

    public void setFpKeyForToken(String tokenValue) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("fpKeyForToken", tokenValue);
        editor.commit();
    }
    public void setRSAObject(JSONObject rsaData) { //3.6 change
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("rsaData", rsaData.toString());
        editor.commit();
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getRSAObject(@CallbackId String callbackId){
        String flag = prefs.getString("rsaData", "");
        JSONObject result = new JSONObject();
        try {
            result.put("rsaData",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }
    public String getFpKeyForToken(){
        return prefs.getString("fpKeyForToken", "");
    }

    public void setFpToken(String tokenValue) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("fpToken", tokenValue);
        editor.commit();
    }

    public String getFpToken(){
        return prefs.getString("fpToken", "");
    }

    public String getLoginType(){
        return prefs.getString("loginType", "");
    }

    public String getMpinSetup(){
        return prefs.getString("mpinFlag", "");
    }

    public String getMarketingFlag(){
        return prefs.getString("marketingFlag", "");
    }

    public String getFingerPrintSetup(){return  prefs.getString("fingerPrintSetup","");}

    public void setFingerPrintSetup(String fingerPrintSetup){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("fingerPrintSetup", fingerPrintSetup);
        editor.commit();
    }


    public void setAppVersionStatus(String appVersionStatus){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("appVersionStatus", appVersionStatus);
        editor.commit();
    }

    public String getAppVersionStatus(){return prefs.getString("appVersionStatus","");}

    public void setNewVersionDescription(String newVersionDescription){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("newVersionDescription", newVersionDescription);
        editor.commit();
    }

    public String getNewVersionDescription(){return prefs.getString("newVersionDescription","");}

    /*IDFC 3.0- Added to show marketing screen everytime widget it updated*/

    public void setLastVersionOnDevice(String lastActiveVersion){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("lastActiveVersion", lastActiveVersion);
        editor.commit();
    }

    public String getLastVersionOnDevice(){return prefs.getString("lastActiveVersion","");}

    public void setCurrentVersionOnDevice(String currentVersion){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("currentVersion", currentVersion);
        editor.commit();
    }

    public String getCurrentVersionOnDevice(){return prefs.getString("currentVersion","");}

    /*IDFC 3.0- Added to show marketing screen everytime App it updated*/

    public void setActiveVersionNo(String activeVersionNo){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("activeVersionNo", activeVersionNo);
        editor.commit();
    }

    public String getActiveVersionNo(){return prefs.getString("activeVersionNo","");}


    public void setGracePeriod(String gracePeriod){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("gracePeriod", gracePeriod);
        editor.commit();
    }

    public String getGracePeriod(){return prefs.getString("gracePeriod","");}

    public void setAppUpgradeMessage(String upgradeMessage){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("upgradeMessage", upgradeMessage);
        editor.commit();
    }

    public String getAppUpgradeMessage(){return prefs.getString("upgradeMessage","");}

    public void setAppDownloadLink(String appDownloadLink){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("appDownloadLink", appDownloadLink);
        editor.commit();
    }

    public String getAppDownloadLink(){return prefs.getString("appDownloadLink","");}

    public void setDeviceBlacklistFlag(String deviceBlacklistFlag){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("deviceBlacklistFlag", deviceBlacklistFlag);
        editor.commit();
    }

    public String getDeviceBlacklistFlag(){return prefs.getString("deviceBlacklistFlag","");}

    public void setBlacklistMessage(String blacklistMessage){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("blacklistMessage", blacklistMessage);
        editor.commit();
    }

    public String getBlacklistMessage(){return prefs.getString("blacklistMessage","");}

    public void setDeviceId(String deviceId){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("deviceId", deviceId);
        editor.commit();
    }

    public String getDeviceId(){return prefs.getString("deviceId","");}


    public String getNotificationToken(){return prefs.getString("notificationToken","");}

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

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setUPIFlag(@CallbackId String callbackId, String UPIFlag) {
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("upiFlag", UPIFlag);
            editor.commit();
            //Log.d(logTag,"sharedpref after commit:"+ prefs.getString("upiFlag", ""));
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setAssetFlag(@CallbackId String callbackId, String assetFlag) {
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("assetFlag", assetFlag);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
         }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getAssetFlag(@CallbackId String callbackId){
        String flag = prefs.getString("assetFlag", "");
        JSONObject result = new JSONObject();
        try {
            result.put("assetFlag",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }


    public String getAssetFlagLocally(){
        return prefs.getString("assetFlag", "");
    }

    public String getUPIFlagLocally(){
        return prefs.getString("upiFlag", "");
    }

    public void clearUPIFlagLocally(){

        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("upiFlag", "");
        editor.commit();
    }


    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setLoanTypeFlag(@CallbackId String callbackId, String loanTypeFlag) {
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("loanTypeFlag", loanTypeFlag);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getLoanTypeFlag(@CallbackId String callbackId){
        String flag = prefs.getString("loanTypeFlag", "");
        JSONObject result = new JSONObject();
        try {
            result.put("loanTypeFlag",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }
    public String getLoanTypeFlagLocally(){
        return prefs.getString("loanTypeFlag", "");
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setLoanAvailFlag(@CallbackId String callbackId, String loanAvailFlag) {
        JSONObject result = new JSONObject();
        //Log.d(logTag,"setLoanAvailFlag loanAvailFlag:"+loanAvailFlag);
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("loanAvailFlag", loanAvailFlag);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getLoanAvailFlag(@CallbackId String callbackId){
        String flag = prefs.getString("loanAvailFlag", "");
        JSONObject result = new JSONObject();
        try {
            result.put("loanAvailFlag",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }
    public String getLoanAvailFlagLocally()
    {
        //Log.d(logTag,"getLoanAvailFlagLocally loanAvailFlag:"+prefs.getString("loanAvailFlag", ""));
        return prefs.getString("loanAvailFlag", "");
    }


    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setSRrequest(@CallbackId String callbackId, String sidebarClickFlag) {
        JSONObject result = new JSONObject();
        //Log.d(logTag,"setSidebarClickFlag sidebarClickFlag:"+sidebarClickFlag);
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("sidebarClickFlag", sidebarClickFlag);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getSRrequest(@CallbackId String callbackId){
        String flag = prefs.getString("sidebarClickFlag", "");
        JSONObject result = new JSONObject();
        try {
            result.put("sidebarClickFlag",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }
    public String getSRrequestLocally()
    {
        //Log.d(logTag,"getSidebarClickFlagLocally sidebarClickFlag:"+prefs.getString("sidebarClickFlag", ""));
        return prefs.getString("sidebarClickFlag", "");
    }

    public void setSRrequestLocally(String sidebarClickFlag){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("sidebarClickFlag", sidebarClickFlag);
        editor.commit();
        //Log.d(logTag,"setSRrequestLocally:"+prefs.getString("sidebarClickFlag", ""));
    }

    /*For Home saver flag  mobile 2.5 */
    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setHSFlag(@CallbackId String callbackId, String hsFlag) {
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("hsFlag", hsFlag);
            editor.commit();
            //publishData(callbackId, "setMpinFlag");
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getHSFlag(@CallbackId String callbackId){
        String flag = prefs.getString("hsFlag", "");
        JSONObject result = new JSONObject();
        try {
            result.put("hsFlag",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
    }


    public String getHSFlagLocally(){
        return prefs.getString("hsFlag", "");
    }

	public void setMVisaJsonLocally(String mVisaJsonString){
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("mVisaJsonString", mVisaJsonString);

        editor.commit();
        Log.d(logTag,"setMVisaJsonLocally"+prefs.getString("mVisaJsonString",""));
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setMVisaJson(@CallbackId String callbackId, String mVisaJsonString) {

        Log.d(logTag,mVisaJsonString);
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("mVisaJsonString", mVisaJsonString);
            editor.commit();
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
        Log.d(logTag,"setMVisaJson:"+prefs.getString("mVisaJsonString",""));
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getMVisaJson(@CallbackId String callbackId){
        String mVisaJsonString = prefs.getString("mVisaJsonString", "");
        JSONObject result = new JSONObject();
        try {
            result.put("mVisaJsonString",mVisaJsonString);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
        Log.d(logTag,"getMVisaJson:"+mVisaJsonString);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void clearMVisaJson(@CallbackId String callbackId, String flag) {
        Log.d(logTag,"clearMVisaJson called flag:");
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("mVisaJsonString","");
            editor.commit();
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        //Log.d(logTag,"setMVisaLoginFlag mVisa:"+ prefs.getString("mVisaFlag", ""));
        super.onSuccess(context, result, callbackId);
    }


    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setMVisaLoginFlag(@CallbackId String callbackId, String flag) {
        Log.d(logTag,"setMVisaLoginFlag called flag:"+flag);
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("mVisaFlag",flag);
            editor.commit();
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        //Log.d(logTag,"setMVisaLoginFlag mVisa:"+ prefs.getString("mVisaFlag", ""));
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getMVisaLoginFlag(@CallbackId String callbackId){
        String mVisaFlag = prefs.getString("mVisaFlag", "");
        JSONObject result = new JSONObject();
        try {
            result.put("mVisaFlag",mVisaFlag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
        Log.d(logTag,"getmVisaFlag:"+mVisaFlag);
    }

    public String getMVisaLoginFlagLocally(){
        Log.d(logTag,"getMVisaLoginFlagLocally called");
        String mVisaFlag= prefs.getString("mVisaFlag", "");
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("mVisaFlag","");
        editor.commit();
        return mVisaFlag;
    }

    public void clearMVisaLoginFlagLocally(){
        Log.d(logTag,"clearMVisaLoginFlagLocally called");
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("mVisaFlag","");
        editor.commit();
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void clearMVisaLoginFlag(@CallbackId String callbackId, String flag) {
        Log.d(logTag,"clearMVisaLoginFlag called flag:"+flag);
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("mVisaFlag",flag);
            editor.commit();
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        //Log.d(logTag,"setMVisaLoginFlag mVisa:"+ prefs.getString("mVisaFlag", ""));
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void setScanAndPayFlag(@CallbackId String callbackId, String flag) {
        Log.d(logTag,"setScanAndPayFlag called flag:"+flag);
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("scanAndPay",flag);
            editor.commit();
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
        //Log.d(logTag,"setMVisaLoginFlag mVisa:"+ prefs.getString("mVisaFlag", ""));
        super.onSuccess(context, result, callbackId);
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void getScanAndPayFlag(@CallbackId String callbackId){
        String flag = prefs.getString("scanAndPay", "");
        JSONObject result = new JSONObject();
        try {
            result.put("scanAndPay",flag);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result, callbackId);
        Log.d(logTag,"scan and pay:"+flag);
        clearScanAndPayFlagLocally();
    }

    @JavascriptInterface
    @org.xwalk.core.JavascriptInterface
    public void clearScanAndPayFlag(@CallbackId String callbackId, String flag){
        JSONObject result = new JSONObject();
        try{
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("scanAndPay","");
            editor.commit();
            result.put("successFlag", true);
        }catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void clearScanAndPayFlagLocally(){
        Log.d(logTag,"clearScanAndPayFlag called");
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("scanAndPay","");
        editor.commit();
    }

    public void setCameraPermissionAskedFlagLocally() {
        Log.d(logTag,"setCameraPermissionAskedFlag called ");
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean("cameraPermissionAskedOnce",true);
        editor.commit();
    }


    public boolean getCameraPermissionAskedFlagLocally(){
        boolean flag = prefs.getBoolean("cameraPermissionAskedOnce", false);
        return flag;
    }
}
