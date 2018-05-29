package com.idfcbank.mobileBanking;

import android.app.Activity;
import android.app.Application;
import android.app.Dialog;
import android.content.Context;
import android.graphics.Typeface;
import android.os.CountDownTimer;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

import com.backbase.android.Backbase;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by taralsoni on 28/07/16.
 */
public class smsTimerPopup extends Application{


    Backbase cxpInstance = Backbase.getInstance();
    public Activity globalActivity;
    public Context globalContext;
    public Dialog dialog;

    public void showDialog(Activity activity, final Context context) {

        globalActivity = activity;
        globalContext = context;

        dialog = new Dialog(activity);

        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.setCancelable(false);
        dialog.setCanceledOnTouchOutside(false);

        dialog.setContentView(R.layout.sms_timer_popup);
        final TextView timerText = (TextView) dialog.findViewById(R.id.timer);
        final TextView popupText = (TextView) dialog.findViewById(R.id.popup_msg);
        final Button resendBtn = (Button) dialog.findViewById(R.id.btn_resend_otp);
        Button enterManuallyBtn = (Button) dialog.findViewById(R.id.btn_enter_manually);
        resendBtn.setEnabled(false);


//        Typeface tf = Typeface.createFromAsset(getAssets(), "fonts/gotham_book.ttf");
//        timerText.setTypeface(tf);
try{
        Typeface font = Typeface.createFromAsset(globalContext.getAssets(), "fonts/gotham_book.ttf");
        timerText.setTypeface(font);
        popupText.setTypeface(font);
    } catch (Exception e) {
        e.printStackTrace();
        Log.e("smstimerPopup", "font not loaded: ");
    }


        resendBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Publishing event for Resend otp
                JSONObject eventData = new JSONObject();
                try{
                    eventData.put("resendOtpFlag",true);
                }catch (JSONException e){
                    e.printStackTrace();;
                }
                cxpInstance.publishEvent("resend.otp", eventData);
                dialog.dismiss();
            }
        });

        enterManuallyBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Backbase cxpInstance = Backbase.getInstance();
                JSONObject jsonObject = new JSONObject();
                try{
                    jsonObject.put("data",true);
                    cxpInstance.publishEvent("stopReceiver",jsonObject);
                    dialog.dismiss();
                }catch (JSONException e){
                    e.printStackTrace();
                }


            }
        });


        dialog.show();

        new CountDownTimer(30000, 1000) {

            public void onTick(long millisUntilFinished) {
                timerText.setText(millisUntilFinished / 1000 + " seconds remaining");
                //here you can have your logic to set text to edittext
            }

            public void onFinish() {
                timerText.setText("Time's up!");
                resendBtn.setEnabled(true);
                resendBtn.setTextColor(ContextCompat.getColor(context,R.color.white));
                resendBtn.setBackgroundColor(ContextCompat.getColor(context, R.color.popupBtn_pink));
            }

        }.start();
    }

    public void dismissPopup(){
        dialog.dismiss();
    }
}
