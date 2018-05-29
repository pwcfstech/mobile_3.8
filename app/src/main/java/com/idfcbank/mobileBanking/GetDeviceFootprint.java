package com.idfcbank.mobileBanking;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.v4.content.ContextCompat;
import android.support.v4.hardware.fingerprint.FingerprintManagerCompat;
import android.telephony.TelephonyManager;

import java.lang.reflect.Field;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;

/**
 * Created by taralsoni on 19/07/16.
 */
public class GetDeviceFootprint {

    public String getDeviceId(Context context){
        TelephonyManager telephonyManager = (TelephonyManager)context.getSystemService(Context.TELEPHONY_SERVICE);
        return telephonyManager.getDeviceId();
    }

    public String getOsNameAndAPILevel(){
        StringBuilder builder = new StringBuilder();
        String osName = new String();
        builder.append("android : ").append(Build.VERSION.RELEASE);

        Field[] fields = Build.VERSION_CODES.class.getFields();
        for (Field field : fields) {
            String fieldName = field.getName();
            int fieldValue = -1;

            try {
                fieldValue = field.getInt(new Object());
            } catch (IllegalArgumentException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (NullPointerException e) {
                e.printStackTrace();
            }

            if (fieldValue == Build.VERSION.SDK_INT) {
                builder.append(" | ").append(fieldName).append(" | ");
                builder.append("SDK=").append(fieldValue);
            }
        }
        osName = builder.toString();
        return osName;
    }

    public Boolean checkFpCapability(Context context){
        /*FingerprintManagerCompat manager = FingerprintManagerCompat.from(context);

        if (!manager.isHardwareDetected()) {
            // Device doesn't support fingerprint authentication
            return false;
        } else if (!manager.hasEnrolledFingerprints()) {
            // User hasn't enrolled any fingerprints to authenticate with
            return true;
        } else {
            //Device is ready for FP
            return true;
        }*/
        return false;
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

    public boolean checkSmsReadPermission(Context context){
        /*int result = ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS);
        if(result == PackageManager.PERMISSION_GRANTED)
        {
            return true;
        }else{
            return false;
        }*/
        return false;
    }

    public String getAppVersionName(Context context){
        final PackageManager packageManager = context.getPackageManager();
        String appVersion = "";
        if(packageManager != null){
            try{
                PackageInfo packageInfo = packageManager.getPackageInfo(context.getPackageName(),0);
                appVersion = packageInfo.versionName;
            }catch (PackageManager.NameNotFoundException e){
                appVersion = "1.0";
            }
        }
        else{
            appVersion = "3.0";
        }
        return appVersion;
    }


}
