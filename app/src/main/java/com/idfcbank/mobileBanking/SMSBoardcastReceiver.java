package com.idfcbank.mobileBanking;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsManager;
import android.telephony.SmsMessage;
import android.util.Log;

import com.backbase.android.Backbase;

import org.json.JSONObject;

/**
 * Created by taralkumars481 on 12/07/2016.
 * This broadcaster keeps reading incoming SMS and match it with the predefined format and sender for OTP
 * if both of them matches, it sends OTP to originating widget
 */
public class SMSBoardcastReceiver extends BroadcastReceiver {

    final SmsManager smsManager = SmsManager.getDefault();
    JSONObject jsonObject = new JSONObject();
    String otp = new String();
    String publisher = new String();

    public SMSBoardcastReceiver(String publisher) {
        this.publisher = publisher;
    }

    public SMSBoardcastReceiver(){
    }
    @Override
    public void onReceive(Context context, Intent intent) {

        final Bundle bundle = intent.getExtras();
        try {
            if (bundle != null) {

                final Object[] pduObj = (Object[]) bundle.get("pdus");
                for (int i = 0; i < 1; i++) {
                    SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pduObj[i]);

                    String phoneNumber = smsMessage.getDisplayOriginatingAddress();
                    String message = smsMessage.getMessageBody();
                    String intendedSender = context.getString(R.string.otpSender);
                    String intendedSender2 = context.getString(R.string.otpSender2);
                    String smsFormat = context.getString(R.string.smsformat);

                    if (phoneNumber.contains(intendedSender) ||
                            phoneNumber.equalsIgnoreCase(intendedSender2)) {
                        if (message.toUpperCase().contains(smsFormat.toUpperCase())) {
                            //get first 6 characters of the message
                            otp = message.substring(0, 6);
                            jsonObject.put("otp", otp);
                            Backbase.getInstance().publishEvent(publisher, jsonObject);
                        }
                    } else {
                        Log.d("OTP-READING", "Format or sender doesnt match");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
