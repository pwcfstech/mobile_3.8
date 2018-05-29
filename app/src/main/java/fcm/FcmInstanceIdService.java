package fcm;

import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.widget.Toast;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;
import com.idfcbank.mobileBanking.GetDeviceFootprint;
import com.idfcbank.mobileBanking.GlobalVariables;
import com.idfcbank.mobileBanking.MainActivity;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.StringTokenizer;
import java.util.TimeZone;
import java.util.UUID;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Created by taralsoni on 05/08/16.
 */
public class FcmInstanceIdService extends FirebaseInstanceIdService {
    String fcmToken;

    public FcmInstanceIdService() {
        super();
    }

    @Override
    public void onTokenRefresh() {
        Log.d("FCM","onTokenRefresh called");

        fcmToken = FirebaseInstanceId.getInstance().getToken();
        Log.d("firebase TOKEN",fcmToken);
        SharedPreferences prefs = this.getSharedPreferences("pref",0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("notificationToken", fcmToken);
        editor.putString("NotificationPermissionFlag", "true");
        editor.commit();
        Log.d("firebase TOKEN",prefs.getString("notificationToken", ""));

       /* //Update user preference
        JSONObject jsonObjectChild = new JSONObject();
        String deviceId =  prefs.getString("deviceId","");
        GetDeviceFootprint getDeviceFootprint = new GetDeviceFootprint();
        if(deviceId.equalsIgnoreCase("")){
            deviceId = UUID.randomUUID().toString();
            editor.putString("deviceId", deviceId);
            editor.commit();
        }
        OkHttpClient okHttpClient = new OkHttpClient();

        try{
            jsonObjectChild.put("deviceId", deviceId);
            jsonObjectChild.put("timeZone", TimeZone.getDefault().getID().replace("\\/",""));
            jsonObjectChild.put("channel", "Mobile");
            jsonObjectChild.put("nwProviderLine1","Airtel");
            jsonObjectChild.put("geoLatitude", "45.9937884");
            jsonObjectChild.put("geoLongitude", "67.837747");
            jsonObjectChild.put("ipAddress", "172.67.54.32");
            jsonObjectChild.put("connectionMode", "Wifi");
        }catch (JSONException e){
            e.printStackTrace();
        }

        String notificationFlag = "true";
        String notificationToken = fcmToken;
        String smsReadingFlag = "false";
        String bioAuthFlag = prefs.getString("fingerPrintSetup", "false");
        String bioAuthToken = prefs.getString("fpToken", "");

        //RequestBody formBody = null;
        MediaType mediaType = MediaType.parse("application/x-www-form-urlencoded");

        RequestBody dummyBody = RequestBody.create(mediaType,"");


        //MediaType mediaType = MediaType.parse("application/x-www-form-urlencoded");
        //  String result = "msgHeader="+String.valueOf(jsonObjectChild)+"&notificationFlag="+notificationFlag+"&notificationToken="+notificationToken+"&smsReadingFlag="+smsReadingFlag+"&bioAuthFlag="+bioAuthFlag+"&bioAuthToken="+bioAuthToken;

       *//* try{
             formBody = RequestBody.create(mediaType,java.net.URLEncoder.encode(result,"UTF-8"));
        }catch (Exception e){
            Log.d("UPDATE USER PREF - ERR", e.getMessage());

        }*//*

        Log.d("Calling server","Before");
        Request dummy = null;
        dummy = new Request.Builder()
              //   .url("https://my.idfcbank.com/rs/updateUserPreference")
                .url("http://10.5.8.135:7003/rs/updateUserPreference")
                .post(dummyBody)
                .addHeader("cache-control", "no-cache, no-store, must-revalidate")
                .addHeader("Pragma", "no-cache")
                .addHeader("Expires", "0")
                .addHeader("Accept", "application/json")
                .build();
        try {
            Response dummyResponse = okHttpClient.newCall(dummy).execute();
            if(dummyResponse.isSuccessful()){
                Log.d("Succes Response",dummyResponse.body().toString());
            }else{
                Log.d("Error Response",dummyResponse.body().toString());

            }
        }catch (Exception e){
            Log.e("Error in dummy Response","",e);
        }

        OkHttpClient okHttpClientNew = new OkHttpClient();
        String result = null;
        Log.d("Notification Token",notificationToken);
        try {
            result = "notificationFlag="+"true"+"&notificationToken="+URLEncoder.encode(notificationToken,"UTF-8")+"&smsReadingFlag="+"false"+"&bioAuthFlag="+"false"+"&msgHeader="+ URLEncoder.encode(jsonObjectChild.toString(),"UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        Log.d("Requst",result);
        RequestBody body = RequestBody.create(mediaType,result);
        Log.d("Calling server","Before");
        Request request = null;
        request = new Request.Builder()
               //.url("https://my.idfcbank.com/rs/updateUserPreference")
                .url("http://10.5.8.135:7003/rs/updateUserPreference")
                .post(body)
                .addHeader("cache-control", "no-cache, no-store, must-revalidate")
                .addHeader("Pragma", "no-cache")
                .addHeader("Expires", "0")
                .addHeader("Accept", "application/json")
                .build();
        try{
        Response actualResponse = okHttpClientNew.newCall(request).execute();
            if(actualResponse.isSuccessful()){
                Log.d("Succes Response",actualResponse.body().toString());
            }else{
                Log.d("Errror Response",actualResponse.body().toString());

            }
        }catch (Exception e){
            Log.e("Error in actual","",e);
        }*/




    }
}
