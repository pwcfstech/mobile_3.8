package com.idfcbank.mobileBanking;

import android.app.Activity;
import android.app.Application;
import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.support.v4.content.ContextCompat;
import android.test.ActivityUnitTestCase;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.backbase.android.Backbase;


/**
 * Created by taralsoni on 31/07/16.
 */
public class FingerprintPopups extends Application{

    Backbase cxpInstance = Backbase.getInstance();
    public Activity globalActivity;
    public Context globalContext;
    public fingerPrintPlugin fingerPrintPlugin;
    Dialog fpLoginDialog;
    Dialog noFpRegDialog;


    public Dialog showDialog(Context context, Activity activity, String popupType) {
        globalContext = context;
        globalActivity = activity;
        fpLoginDialog = new Dialog(globalActivity);
        noFpRegDialog = new Dialog(globalActivity);
        fingerPrintPlugin = new fingerPrintPlugin();

        //Show popup for no fingerprint registered
        if(popupType.equalsIgnoreCase("no.fp.registered")){

            noFpRegDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
            noFpRegDialog.setCancelable(false);
            noFpRegDialog.setCanceledOnTouchOutside(false);

            noFpRegDialog.setContentView(R.layout.fp_no_registration);
            Button laterBtn = (Button) noFpRegDialog.findViewById(R.id.later_btn);
            Button settingsBtn = (Button) noFpRegDialog.findViewById(R.id.settings_btn);

            laterBtn.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    noFpRegDialog.dismiss();
                }
            });

            settingsBtn.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    globalContext.startActivity(new Intent(Settings.ACTION_SECURITY_SETTINGS));
                    noFpRegDialog.dismiss();
                }
            });
            noFpRegDialog.show();
            return noFpRegDialog;
        }

        //Fingerprint Authentication popup which indicates to user that login can be done using fingerprint
        if(popupType.equalsIgnoreCase("login.using.fp")){
            fpLoginDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
            fpLoginDialog.setCancelable(true);
            Window window = fpLoginDialog.getWindow();
            window.setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT);

            fpLoginDialog.setContentView(R.layout.fp_authentication);
            Button mpinBtn = (Button) fpLoginDialog.findViewById(R.id.mpin_btn);
            TextView messageText = (TextView) fpLoginDialog.findViewById(R.id.message_text);
            ImageView fpImage = (ImageView) fpLoginDialog.findViewById(R.id.fp_image);

            mpinBtn.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    fingerPrintPlugin.stopSensor(globalContext);
                    fpLoginDialog.dismiss();
                }
            });
            fpLoginDialog.show();
            return fpLoginDialog;
        }
        return null;
    }

    public void updateFpAuthDialog (final Boolean authStatus, final int attemptCount){
        if(!authStatus){
            if(attemptCount<3){
                final String message = "That's not a fingerprint match! Try again please.";
                globalActivity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        TextView messageText = (TextView) fpLoginDialog.findViewById(R.id.message_text);
                        ImageView fpImage = (ImageView) fpLoginDialog.findViewById(R.id.fp_image);
                        messageText.setText(message);
                        messageText.setTextColor(ContextCompat.getColor(globalContext, R.color.warning_color));
                    }
                });
            }
            else{
                globalActivity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        TextView messageText = (TextView) fpLoginDialog.findViewById(R.id.message_text);
                        ImageView fpImage = (ImageView) fpLoginDialog.findViewById(R.id.fp_image);
                        messageText.setText("Sorry - that's not the fingerprint we have registered for you. Please log in with your MPIN instead.");
                        //messageText.setText("3 Stirkes! Use MPIN login");
                        messageText.setTextColor(ContextCompat.getColor(globalContext, R.color.warning_color));
                    }
                });
            }
        }else{
            globalActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    fpLoginDialog.dismiss();
                   // Toast.makeText(globalActivity, "Fingerprint Authentication successful", Toast.LENGTH_LONG).show();
                }
            });
        }


    }
}
