package com.idfcbank.mobileBanking;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

//import com.fastaccess.permission.base.PermissionHelper;
//import com.fastaccess.permission.base.callback.OnPermissionCallback;

import java.util.Arrays;

/**
 * Created by taralkumars481 on 18/07/2016.
 */
public class RuntimePermission extends AppCompatActivity {
    private static final int REQUEST_SMS_READ = 200;
    Context mainContext;
    Activity mainActivity;

    public void requestPermission(Context context, Activity activity){
        this.mainContext = context;
        this.mainActivity = activity;
        ActivityCompat.requestPermissions(mainActivity, new String[]{Manifest.permission.RECEIVE_SMS},REQUEST_SMS_READ);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if(requestCode == REQUEST_SMS_READ){
            if(grantResults[0] == PackageManager.PERMISSION_GRANTED){
                //Return True to requesting method
            }else if(grantResults[0] == PackageManager.PERMISSION_DENIED){
                if(ActivityCompat.shouldShowRequestPermissionRationale(mainActivity, Manifest.permission.RECEIVE_SMS)){
                    android.support.v7.app.AlertDialog.Builder builder = new android.support.v7.app.AlertDialog.Builder(this);
                    builder.setMessage("This permission is important for faster completion of transaction")
                            .setTitle("Important permission required");
                    builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            ActivityCompat.requestPermissions(mainActivity, new  String[]{Manifest.permission.RECEIVE_SMS}, REQUEST_SMS_READ);
                        }
                    });
                    ActivityCompat.requestPermissions(mainActivity, new String[]{Manifest.permission.RECEIVE_SMS}, REQUEST_SMS_READ);
                }else{
                    //return false
                }
            }
        }
    }
}
