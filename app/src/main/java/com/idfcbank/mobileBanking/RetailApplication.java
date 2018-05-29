package com.idfcbank.mobileBanking;

import android.app.Application;
import android.content.Context;
import android.support.multidex.MultiDex;

import com.backbase.android.Backbase;


public class RetailApplication extends Application {

    private static String configFilePath = "backbase/static/conf/configs.json";

    @Override
    public void onCreate() {
        super.onCreate();
        Backbase.setLogLevel(Backbase.LogLevel.DEBUG);
        Backbase.initialize(this, configFilePath, false);

        //Backbase.setAppVersion(BuildConfig.VERSION_NAME);

        //Cxp.setAppVersion(BuildConfig.VERSION_NAME);
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);
    }
}
