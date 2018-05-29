package com.idfcbank.mobileBanking;

import android.Manifest;
import android.app.Activity;
import android.app.Application;
import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

import com.backbase.android.Backbase;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by taralsoni on 20/07/16.
 */
public class ViewDialog extends Application{

    public String txnType = "";
    public String msgToDisplay = "";
    public JSONObject jsonObject;
    Backbase cxpInstance = Backbase.getInstance();
    GlobalVariables globalVariables;
    public Activity globalActivity;
    public Context globalContext;

    public void showDialog(final Activity activity, String data, Context context) {

        String txnType = "";
        globalActivity = activity;
        globalContext = context;

        try {
            JSONObject txnJsonObject = new JSONObject(data);
            txnType = txnJsonObject.getString("data");
            msgToDisplay = txnJsonObject.getString("message");
        } catch (JSONException e) {
            e.printStackTrace();
        }

        final Dialog dialog = new Dialog(activity);

        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.setCancelable(false);
        dialog.setCanceledOnTouchOutside(false);
        Log.i("txnType" , txnType);
        //Popup with single button
        if(!(txnType.equalsIgnoreCase("APPUPWTHNGP") || txnType.equalsIgnoreCase("APPUPBYNDGP")
                || txnType.equalsIgnoreCase("AUTHERR003") || txnType.equalsIgnoreCase("MPINREGDONE"))){
            dialog.setContentView(R.layout.custom_popup_1btn);
            TextView textViewMsg = (TextView) dialog.findViewById(R.id.popup_msg);
            textViewMsg.setText(msgToDisplay);
            Button dialogButton = (Button) dialog.findViewById(R.id.btn_dialog);

            final String finalTxnType = txnType;

            dialogButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (finalTxnType.equalsIgnoreCase("DVCEBLCKLIST")) {
                        System.exit(0);
                    }else if (finalTxnType.equalsIgnoreCase("CHNGMPINSUC")){
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",true);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("CHNGMPINSUC", jsonObject);
                    }else if (finalTxnType.equalsIgnoreCase("MPINDONTMATCH") || finalTxnType.equalsIgnoreCase("WEAKMPIN") || finalTxnType.equalsIgnoreCase("USEDMPIN")){
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",true);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("CHNGMPINRESETFIELDS", jsonObject);
                    }else if (finalTxnType.equalsIgnoreCase("MPINVALMSG") || finalTxnType.equalsIgnoreCase("CHNGMPINFAIL") || finalTxnType.equalsIgnoreCase("CHNGMPINERR")){
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",true);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("CHNGMPINRESETFIELDS", jsonObject);
                    }else if (finalTxnType.equalsIgnoreCase("ALREADYHAVEMPIN")){
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",true);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("ALREADYHAVEMPIN", jsonObject);
                    }
                    dialog.dismiss();
                }
            });
        }

        //Popup with multiple buttons
        else{
            dialog.setContentView(R.layout.custom_popup_3btn);
            final TextView textViewMsg = (TextView) dialog.findViewById(R.id.popup_msg);
            textViewMsg.setText(msgToDisplay);
            Button preferredBtn = (Button) dialog.findViewById(R.id.preferredActionBtn);
            Button unPreferredBtn1 = (Button) dialog.findViewById(R.id.unpreferredBtn1);
            Button unPreferredBtn2 = (Button) dialog.findViewById(R.id.unpreferredBtn2);

            globalVariables = new GlobalVariables();
            globalVariables.initialize(context, null);
            if(txnType.equalsIgnoreCase("APPUPWTHNGP") || txnType.equalsIgnoreCase("APPUPBYNDGP")){
                //App version upgrade popup
                preferredBtn.setText("UPGRADE NOW");
                unPreferredBtn1.setText("VIEW DETAILS");

                if(txnType.equalsIgnoreCase("APPUPBYNDGP"))
                    unPreferredBtn2.setText("CANCEL");
                else
                    unPreferredBtn2.setText("LATER");

                final String finalTxnType = txnType;

                preferredBtn.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        String appDownloadLink = globalVariables.getAppDownloadLink();
                        Intent intent = new Intent(Intent.ACTION_VIEW);
                        intent.setData(Uri.parse(appDownloadLink));

                        //crash fix- for activity not found exception
                        //ideally it shud not happen, bcz devicefootprint shud always return app download link
                        try {
                            globalContext.startActivity(intent);
                        }catch (Exception e){
                            e.printStackTrace();
                        }
                        dialog.dismiss();
                        //Closing APP
                       System.exit(0);
                    }
                });

                unPreferredBtn1.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        String appDescription = globalVariables.getNewVersionDescription();
                        textViewMsg.setText(appDescription);
                    }
                });
                if(txnType.equalsIgnoreCase("APPUPBYNDGP")){
                    //Close App
                    unPreferredBtn2.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            System.exit(0);
                        }
                    });
                }else{
                    unPreferredBtn2.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            dialog.dismiss();
                            //Kriti- 2.5 load model after upgrade pop up is dismissed
                            Log.e("viewdialog","my receiver called");
                            Intent i = new Intent("android.intent.action.MAIN").putExtra("ViewDialog", "call Receiver to load Model");
                            globalActivity.sendBroadcast(i);
                            //Kriti- 2.5 load model after upgrade pop up is dismissed
                        }
                    });
                }


            }else if (txnType.equalsIgnoreCase("AUTHERR003")){
                //Blocked MPIN while login
                /*preferredBtn.setText("CONTACT CALL CENTER");
                unPreferredBtn1.setText("LOGIN WITH USERNAME AND PASSWORD");
                unPreferredBtn2.setText("RESET MPIN");*/

                preferredBtn.setText("RESET MPIN");
                unPreferredBtn1.setText("LOGIN WITH USERNAME AND PASSWORD");
                unPreferredBtn2.setVisibility(View.INVISIBLE);
                //For defect
                dialog.setCanceledOnTouchOutside(true);
                final String finalTxnType = txnType;

                preferredBtn.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",true);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("FORGOTMPIN", jsonObject);
                        dialog.dismiss();
                    }
                });

                unPreferredBtn1.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",true);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("LOGINUSRPWD", jsonObject);
                        dialog.dismiss();
                    }
                });

                unPreferredBtn2.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",true);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("FORGOTMPIN", jsonObject);
                        dialog.dismiss();
                    }
                });

            }else if (txnType.equalsIgnoreCase("MPINREGDONE")){
                preferredBtn.setText("YES");
                unPreferredBtn1.setText("NO");
                unPreferredBtn2.setVisibility(View.INVISIBLE);

                preferredBtn.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",true);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("MPINREGDONE", jsonObject);
                        dialog.dismiss();
                    }
                });

                unPreferredBtn1.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        jsonObject = new JSONObject();
                        try{
                            jsonObject.put("data",false);
                        }catch (JSONException e){
                            e.printStackTrace();
                        }
                        cxpInstance.publishEvent("MPINREGDONE", jsonObject);
                        dialog.dismiss();
                    }
                });
            }
        }
        dialog.show();
    }

    private boolean checkCallPermission(){
        PackageManager packageManager = globalContext.getPackageManager();
        int hasPerm = packageManager.checkPermission(Manifest.permission.CALL_PHONE, globalContext.getPackageName());
        if (hasPerm == PackageManager.PERMISSION_GRANTED)
            return true;
        return false;
    }
}
