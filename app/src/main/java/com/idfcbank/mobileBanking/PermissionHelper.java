package com.idfcbank.mobileBanking;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

/**
 * Created by taralsoni on 21/07/16.
 */
public class PermissionHelper extends Activity {

    Activity globalActivity;
    Context context;

    public PermissionHelper(Context context, Activity activity, int permissionCode){
        globalActivity = activity;
        this.context = context;
        if(permissionCode==101){
            ActivityCompat.requestPermissions(globalActivity,new String[]{Manifest.permission.RECEIVE_SMS},permissionCode);
        }
    }

    public void onRequestPermissionResult(int requestCode, String[] permissions, int[] grantResult){
        if(requestCode == 1001){
            if(grantResult.length>0 && grantResult[0] == PackageManager.PERMISSION_GRANTED){
                Log.d("PERMISSION","Receive SMS permission granted");
            }else{
                Log.d("PERMISSION","Receive SMS permission is rejected");
            }
        }
    }
}
