package com.idfcbank.mobileBanking;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;


import com.backbase.android.plugins.CallbackId;
import com.backbase.android.plugins.Plugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class ContactFeature extends Plugin {

    Context context;
    private String callbackId;

    public ContactFeature() {}

    @JavascriptInterface
    public void isEmailAvailable (@CallbackId String callbackId) {
        JSONObject result = new JSONObject();
        this.callbackId = callbackId;
        try {
            result.put("result",true);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        super.onSuccess(context, result,callbackId);
    }

    @JavascriptInterface
    public void sendEmail (String recipient, String subject, String body,@CallbackId String callbackId) {

        String errorMessage="";
        this.callbackId = callbackId;
        if (recipient.isEmpty())
            errorMessage="No recipient provided";
        else if (subject.isEmpty())
            errorMessage="No subject provided";
        else if (body.isEmpty())
            errorMessage="No body provided";

        if (!errorMessage.isEmpty()){
            JSONObject error = new JSONObject();
            try {
                error.put("error", errorMessage);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            super.onError(context, error, callbackId);
            return;
        }

        subject = "";
        body = "";

        Intent sendIntent = new Intent(Intent.ACTION_SENDTO, Uri.fromParts("mailto",recipient, null));
        sendIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
        sendIntent.putExtra(Intent.EXTRA_TEXT, body);
        context.startActivity(Intent.createChooser(sendIntent, "Send Mail"));
    }

    @JavascriptInterface
    public void callPhoneNumber (@CallbackId String callbackId,String phoneNumber) {
        this.callbackId = callbackId;
        if (phoneNumber.isEmpty()){
            JSONObject error = new JSONObject();
            try {
                error.put("error", "No phone number provided");
            } catch (JSONException e) {
                e.printStackTrace();
            }
            super.onError(context, error,callbackId);
            return;
        }

        String uri = "tel:" + phoneNumber;
        Intent intent = new Intent(Intent.ACTION_DIAL);
        intent.setData(Uri.parse(uri));
        context.startActivity(intent);
    }

    @Override
    public void initialize(Context context, Map<String, Object> map) {
        this.context = context;
    }
}
