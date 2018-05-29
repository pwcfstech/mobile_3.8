package com.idfcbank.mobileBanking;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.support.design.widget.NavigationView;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.FragmentManager;
import android.support.v4.content.ContextCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.ExpandableListAdapter;
import android.widget.ExpandableListView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.afollestad.digitus.Digitus;
import com.backbase.android.Backbase;
import com.backbase.android.core.utils.BBConstants;
import com.backbase.android.core.utils.BBLogger;
import com.backbase.android.listeners.ModelListener;
import com.backbase.android.listeners.NavigationEventListener;
import com.backbase.android.listeners.SecurityViolationListener;
import com.backbase.android.model.Model;
import com.backbase.android.model.ModelSource;
import com.backbase.android.model.Renderable;
import com.backbase.android.model.SiteMapItemChild;
import com.backbase.android.navigation.NavigationEvent;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

import org.json.JSONException;
import org.json.JSONObject;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import mVisa.ScanQRcodePopup;


/**
 * Main Activity class for drawer based template
 * This example uses the new v22 design support library to implement navigation drawer pattern.
 * <p/>
 * <p/>
 * Version  Changes
 * SP2_MOB Changes for Sprint 2 Mobile
 */

public class MainActivity extends AppCompatActivity implements SecurityViolationListener, View.OnTouchListener {

    BroadcastReceiver laterUpgradeReceiverBtn = null;
    Toolbar toolbar;

    ScanQRcodePopup scanQRcodePopup;
    public RelativeLayout.LayoutParams lp;
    public SurfaceView cameraView, cameraFocusView;
    public TextView scanErrorTextView, payUsingMobileTextView;
    public Button payeeKeyBtn, tryAgainBtn;
    public LinearLayout contentFrameLL;
    public ProgressBar loadingSpinner;

    boolean isAppUpdated;


    String pageName = "";
    String mVisaFlag = new String();
    //to check if asset or liablity user
    String assetFlag = new String();
    //to identify which loan user have pl,lap or hl
    String loanAvailFlag = new String();
    //to decide landing page in case of asset
    String loanTypeFlag = new String();

    String hsflag = new String();
    boolean isFirstTime = false;
    private final String logTag = MainActivity.class.getSimpleName();

    private DrawerLayout mDrawerLayout;
    private NavigationView mNavigationView;
    private android.support.v4.app.ActionBarDrawerToggle mDrawerToggle;
    private String mActivityTitle;
    private ExpandableListView mExpandableListView;
    private ExpandableListAdapter mExpandableListAdapter;
    private List<NDGroup> mExpandableListTitle;
    private HashMap<String, List<String>> mExpandableListData;
    private String[] payBillArray;
    private String versionUpgradeFlagGlobal;
    private String blacklistFlagGlobal;
    private String applyNowScreen;

    public Backbase cxpInstance;

    //2.0 migration
    private List<SiteMapItemChild> mPageList = new ArrayList<>();
    //  private List<SiteMapItemChild> siteMapItemChildren = new ArrayList<>();
    private HashMap<String, String> mGroupChildPageList = new HashMap<>();
    private String currentItemId = "";
    private String backEnable = "";
    private String trackSRId = "";
    private String from = "";
    private String mActivityParent = "";
    private TextView lastLoginTime;
    private TextView contextName;
    private TimerTask doAsynchronousTask;
    private Timer timer;
    private static BroadcastReceiver sessionReceiver;

    private static final long SESSION_TIMER = 1000; //Time in ms

    //IDFC 2.5 version- change to 2.5 mins
    private static final int SESSION_IDEAL_ALERT = 150000; //Time in ms
    /*private static final int SESSION_IDEAL_ALERT = 2* 60 * 1000; //Time in ms*/

    //IDFC 2.5 version- change to 3 mins
    private static final int SESSION_IDEAL_ALERT_END = 3 * 60 * 1000; //Time in ms
    /*private static final int SESSION_IDEAL_ALERT_END = 4 * 60 * 1000; //Time in ms*/

    private static final int SESSION_SERVICE_CALL_TIME = 2; //Time in Seconds

    private static int SESSION_ALERT_TIME = 0;
    private static int CURRENT_RUNNING_TIMER = 0;
    private Dialog preSessionExpireDialog = null;
    private Dialog sessionExpireialog = null;
    private MenuItem versionName;
    private String originResource = "";
    public GlobalVariables globalVariablePlugin;
    private Context appContext;
    private fingerPrintPlugin fingerPrintPlugin;

    //Added Yushae
    SharedPreferences prefs;

    //OTP Reading - start
    private BroadcastReceiver smsReceiver = null;
    smsTimerPopup smsTimerPopp;
    public static final String SMS_RECEIVED = "android.provider.Telephony.SMS_RECEIVED";
    //OTP Reading - End

    // SOB3 FingerPrint
    public int SMS_PERMISSION_CODE = 1;
    public int PHONE_STATE_PERMISSION_CODE = 2;
    public int FP_PERMISSOIN_CODE = 3;
    public int CAMERA_PERMISSOIN_CODE = 4;
    public int REQUEST_CODE_ASK_MULTIPLE_PERMISSIONS = 153;


    private final static int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;

    ArrayList<String> liabilityPageList = null;

    // NYAL : Added flag to set DEVICE FOOT PRINT FLAGS
    private static boolean ARE_DEVICEFOOTPRINTS_FLAGS_SET = false;
    Boolean isRequestSuccessfull = false, isRequestSuccessfull1 = false, isRequestSuccessfull2 = false;

    //public static Context conSplash;
    private String SUBSCRIBE_RSA_SDK = "getMobileSdkData";
    private String PUBLISH_RSA_SDK = "putMobileSdkData";
    private RSAUtil rsaUtil;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        liabilityPageList = new ArrayList<String>();

        scanQRcodePopup = new ScanQRcodePopup(this);

        prefs = getSharedPreferences("pref", 0);

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //conSplash = this;


        contentFrameLL = (LinearLayout) findViewById(R.id.content_frame);
        cameraView = (SurfaceView) findViewById(R.id.camera_view);
        cameraFocusView = (SurfaceView) findViewById(R.id.camera_focus_view);

        scanErrorTextView = (TextView) findViewById(R.id.scanErrorTextview);
        payUsingMobileTextView = (TextView) findViewById(R.id.payUsingMobileTextview);
        payeeKeyBtn = (Button) findViewById(R.id.payeeKeyBtn);
        tryAgainBtn = (Button) findViewById(R.id.tryAgainBtn);
        loadingSpinner = (ProgressBar) findViewById(R.id.loadingSpinner);
        loadingSpinner.getIndeterminateDrawable().setColorFilter(ContextCompat.getColor(this, R.color.popupBtn_pink), PorterDuff.Mode.MULTIPLY);
        lp = new RelativeLayout.LayoutParams(150, 150);
        lp.addRule(RelativeLayout.CENTER_IN_PARENT);
        loadingSpinner.setLayoutParams(lp);

        tryAgainBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (tryAgainBtn.getText().equals("Try Again")) {
                    scanQRcodePopup.tryAgain();
                } else {
                    scanQRcodePopup.payUsingPayeeKey();
                }
            }
        });

        payeeKeyBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (payeeKeyBtn.getText().equals("Pay using Payee Key")) {
                    scanQRcodePopup.payUsingPayeeKey();
                } else {
                    //Grant access- show native popup to ask runtime permission
                    ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSOIN_CODE);
                }
            }
        });


        appContext = this;
        rsaUtil = new RSAUtil();
        cxpInstance = Backbase.getInstance();
        //Register GlobalVariableSetup plugin
        //cxpInstance = Backbase.getInstance();
        cxpInstance.initializeXwalk(this);
        globalVariablePlugin = new GlobalVariables();
        globalVariablePlugin.initialize(this, null);

        cxpInstance.registerPlugin(globalVariablePlugin);

        //Register FingeprintPlugin
        fingerPrintPlugin = new fingerPrintPlugin();
        fingerPrintPlugin.initialize(this, null);
        cxpInstance.registerPlugin(fingerPrintPlugin);

        //Register SMS Reading
        SMSPlugin smsPlugin = new SMSPlugin();
        smsPlugin.initialize(this, null);
        cxpInstance.registerPlugin(smsPlugin);

        //setup toolbar as action bar
        toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        /* enable ActionBar icon to toggle nav drawer */

        getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        //register backstack listener to handle action bar icon changes
        getSupportFragmentManager().addOnBackStackChangedListener(mOnBackStackChangedListener);
        //setup the drawer navigation
        mDrawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
        /*For removing menu on sign in page*/
        mDrawerLayout.setDrawerLockMode(DrawerLayout.LOCK_MODE_LOCKED_CLOSED);
        mActivityTitle = getTitle().toString();
        mExpandableListView = (ExpandableListView) findViewById(R.id.navList);

        LayoutInflater inflater = getLayoutInflater();

        //adding here for emulator
        LayoutInflater li = getLayoutInflater();
        final View listHeaderView = li.inflate(R.layout.nd_header, null, false);
        final TextView name = (TextView) listHeaderView.findViewById(R.id.name);
        contextName = (TextView) listHeaderView.findViewById(R.id.name);
        lastLoginTime = (TextView) listHeaderView.findViewById(R.id.lastLoginTime);
        lastLoginTime.setVisibility(View.GONE);
        setupDrawer();

        final DisplayMetrics metrics = new DisplayMetrics();
        if (Backbase.isDeviceRooted(this)) {
            showSecurityViolationMessage(getString(R.string.device_rooted_title), getString(R.string.device_rooted_message));
            return;
        }

        Log.d("MAIN ACTIVITY", "FETCH INTENT");
        // NYAL : Commented out for optimisation.

        //Getting splash response from splash and setting it up in Global variable
        Intent splashIntent = getIntent();
//        String deviceFpResponse = splashIntent.getStringExtra("data");
//        if(deviceFpResponse!=null){
//            updateGlobalVariable(deviceFpResponse);
//            deviceAppVersion(deviceFpResponse);
//        }
        // NYAL : Loading model none the less.
        loadModelAfterUpgradePopupDismissed();

        new Thread(new Runnable() {
            @Override
            public void run() {
                Log.d("THREAD", "ENTERED THREAD");
                while (true) {
                    if (SplashScreen.IS_DEVICE_FOOTPRINT_SUCCESS) {
                        Log.d("THREAD", "CHECKING...");
                        ;
                        if (SplashScreen.DEVICE_FOOTPRINT_RESPONSE_STRING != null) {
                            updateGlobalVariable(SplashScreen.DEVICE_FOOTPRINT_RESPONSE_STRING);
                            deviceAppVersion(SplashScreen.DEVICE_FOOTPRINT_RESPONSE_STRING);
                            MainActivity.ARE_DEVICEFOOTPRINTS_FLAGS_SET = true;
                            break;
                        }
                    }
                    try {
                        Thread.sleep(500);
                    } catch (Exception e) {
                    }
                }
            }
        }).start();

        getWindowManager().getDefaultDisplay().getMetrics(metrics);
        int width = metrics.widthPixels;

        cxpInstance.setSecurityViolationListener(this);

        //Register phone call and Email features
        ContactFeature feature = new ContactFeature();
        feature.initialize(this, null);
        //2.0 migration
        cxpInstance.registerPlugin(feature);

        //Mobile 3.0- not required bcz its getting called from loadmodelafterpopupupgradedismissed
        /*System.out.println("Is session valid before: " + cxpInstance.isSessionValid());
        cxpInstance.clearSession();
        System.out.println("Is session valid after: " + cxpInstance.isSessionValid());*/


        String notificationNavigator = splashIntent.getStringExtra("fcmData");
        if (notificationNavigator != null) {
            //Pusub for navigation
            if (contextName.getText() != null && contextName.getText() != "Guest") {
                cxpInstance.publishEvent(notificationNavigator, null);
            }
        }


        try {
            TextView tvWelcome = (TextView) listHeaderView.findViewById(R.id.tvWelcome);
//            Typeface font = Typeface.createFromAsset(getAssets(), "/backbase/static/features/[BBHOST]/theme-mobile-demo/css/font/font/gotham_book.woff");
//            tvWelcome.setTypeface(font);
        } catch (Exception e) {
            e.printStackTrace();
            Log.d("MainActivity", "font not loaded");
        }

        try {
//            Typeface font = Typeface.createFromAsset(getAssets(), "/backbase/static/features/[BBHOST]/theme-mobile-demo/css/font/font/gotham_book.woff");
//            lastLoginTime.setTypeface(font);
        } catch (Exception e) {
            e.printStackTrace();
        }
        // User Profile Summary-Pre Login
        name.setText("Guest");
        try {
//            Typeface font = Typeface.createFromAsset(getAssets(), "/backbase/static/features/[BBHOST]/theme-mobile-demo/css/font/font/gotham_book.woff" +
//                    "");
//            name.setTypeface(font);
        } catch (Exception e) {
            e.printStackTrace();
        }

        mExpandableListView.addHeaderView(listHeaderView);

		/*uncomment for local usage*/
        //loadModelFrom(ModelSource.SERVER);
        // mDrawerLayout.setBackgroundResource(0);
        /*uncomment for local usage*/

        cxpInstance.registerObserver("cxp.load.model", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {

                if (MainActivity.ARE_DEVICEFOOTPRINTS_FLAGS_SET) {
                    Log.d("Last Login", "Inside Model Load");
                    cxpInstance.invalidateModel();
                    loadModelFrom(ModelSource.SERVER);
                } else {
                    Log.d("ERROR", "DEVICE_FOOTPRINT_NOT_LOADED");
                    new AlertDialog.Builder(MainActivity.this)
                            .setTitle("")
                            .setIcon(R.drawable.appiconcoloured)
                            .setMessage("Seems like an unstable network.")
                            .setCancelable(false)
                            .setNegativeButton("Exit", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
                                    MainActivity.this.finish();
                                    System.exit(0);
                                }
                            })
//                            .setPositiveButton("Retry", new DialogInterface.OnClickListener() {
//                                @Override
//                                public void onClick(DialogInterface dialog, int which) {
//
//                                }
//                            })
                            .create().show();
                }
            }
        });

        // User Profile Summary-Post Login
        LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(MainActivity.this);

        final BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {

                String data = intent.getExtras().getString(BBConstants.EVENTBUS_EVTDATA);

                try {
                    JSONObject myJson = new JSONObject(data);
                    String customerName = myJson.optString("customerName");
                    String lastLoggedIn = myJson.optString("lastLoggedIn");
                    if (lastLoggedIn == null || lastLoggedIn.equals("null")) {
                        lastLoginTime.setText("Last Login: " + "First Login");
                    } else {
                        Timestamp timestamp = new Timestamp(Long.parseLong(lastLoggedIn));
                        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd MMM yyyy' 'hh:mm aaa");
                        lastLoginTime.setText("Last Login: " + simpleDateFormat.format(timestamp));
                    }

                    lastLoginTime.setVisibility(View.VISIBLE);
                    name.setText(customerName);
                    initializeAsynchronousTask();
                    startAsynchronousTask();
                    registerSessionReceiver();

                } catch (Exception e) {
                    e.printStackTrace();
                }

            }
        };

        BroadcastReceiver clostAppReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.d("mainactivity", "Close App");
                System.exit(1);
            }
        };

        BroadcastReceiver receiver1 = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {

                try {
                    String data = intent.getExtras().getString(BBConstants.EVENTBUS_EVTDATA);
                    JSONObject jsonObj = new JSONObject(data);
                    backEnable = jsonObj.getString("data");
                    if (jsonObj.has("from")) {
                        from = jsonObj.getString("from");
                    }
                    Log.d("Main Activity@@!!!!", "Json Data..." + jsonObj);
                    try {
                        trackSRId = jsonObj.getString("trSerID");
                    } catch (Exception e) {
                        trackSRId = "";
                    }
                    Log.d("Main Activity@@!!!!", "Data..." + backEnable + "trackSRId.." + trackSRId);
                    //Change icon and increase count
                    if (backEnable.equals("ENABLE_BACK")) {
                        //mvisa
                        if (currentItemId.equalsIgnoreCase(pageIdNormalLogin) || currentItemId.equalsIgnoreCase(pageIdMpinLogin)) {
                            getSupportActionBar().setHomeAsUpIndicator(R.drawable.btn_back_purple);
                        } else {
                            getSupportActionBar().setHomeAsUpIndicator(R.drawable.btn_back);
                        }
                    } else {
                        //mvisa
                        if (currentItemId.equalsIgnoreCase(pageIdNormalLogin)) {
                            getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_primary);
                        } else {
                            getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                        }
                    }

                    if (trackSRId.length() > 0 && !(trackSRId.equals("email") || trackSRId.equals("aadhaar") || trackSRId.equals("pan"))) {
                        mActivityParent = mActivityTitle;
                        mActivityTitle = trackSRId;
                        Log.d("Main Activity@@!!!!", "mActivityTitle...111" + mActivityTitle);
                        Log.d("Main Activity@@!!!!", "mActivityParent" + mActivityParent);

                        getSupportActionBar().setTitle(mActivityTitle);
                    }


                } catch (JSONException e) {
                    e.printStackTrace();
                }

            }
        };

        BroadcastReceiver backButtonActionReceiver1 = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.d("mainactivity", "disable go back");
            }
        };

        BroadcastReceiver backButtonActionReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {

                if (contextName.getText() == "Guest") {
                    new AlertDialog.Builder(MainActivity.this)
                            .setIcon(R.drawable.appiconcoloured)
                            .setTitle("Confirmation")
                            .setMessage("Do you want to exit the app?")
                            .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    //2.0 MIgration
                                    //replaceFragment(mPageList.get(0)) ;
                                    MainActivity.this.finishAffinity();
                                    System.exit(0);
                                    //replaceFragment(mPageList.get(0));
                                    //moveTaskToBack(true);
                                }

                            })
                            .setNegativeButton("No", null)
                            .show();
                } else {
                    new AlertDialog.Builder(MainActivity.this)
                            .setIcon(R.drawable.appiconcoloured)
                            .setTitle("Confirmation")
                            .setMessage("Do you want to logout from the app?")
                            .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {

                                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                                    backEnable = "";

                                    //2.0 MIgration
                                    //replaceFragment(mPageList.get(mPageList.size() - 1));
                                    replaceFragment(pageIdLogout);
                                    //mDrawerLayout.closeDrawers();
                                    SESSION_ALERT_TIME = 0;
                                    CURRENT_RUNNING_TIMER = 0;
                                }

                            })
                            .setNegativeButton("No", null)
                            .show();
                }
            }
        };

        BroadcastReceiver passwordResetReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);
                builder.setIcon(R.drawable.appiconcoloured)
                        .setTitle("Success")
                        .setMessage("Congratulations ! Your password has been changed.")
                        .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {

                                String eventName = "loginPostPasswordReset";
                                cxpInstance.publishEvent(eventName, null);
                            }
                        });
                AlertDialog alert = builder.create();
                alert.show();
                alert.getWindow().getAttributes();
                TextView msgTxt = (TextView) alert.findViewById(android.R.id.message);
                msgTxt.setTextSize(14);
            }
        };

        cxpInstance.registerObserver("js.back", receiver1);

        cxpInstance.registerObserver("passwordResetSuccess", passwordResetReceiver);

        cxpInstance.registerObserver("device.GoBack", backButtonActionReceiver);

        cxpInstance.registerObserver("disable.GoBack", backButtonActionReceiver1);

        cxpInstance.registerObserver("cxp.load.model", receiver);

        cxpInstance.registerObserver("cxplogout", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                stopAsynchronousTask();//stop the timer
                cxpInstance.unregisterObserver(sessionReceiver);//will stop show session continuew or expire popup cj
                name.setText("Guest");
                replaceFragment(logoutMarketingPageId);
            }
        });

        cxpInstance.registerObserver("cxpGoToSignIn", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.d(logTag,"cxpGoToSignIn receiver");
                cxpInstance.invalidateModel();
                cxpInstance.clearSession();
                mActivityTitle = "Sign In";
                lastLoginTime.setVisibility(View.GONE);
                try {
                    loadModelFrom(ModelSource.SERVER);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                name.setText("Guest");

                //Stop Session
                Log.d("Session.....", "Session Stopped");
                mDrawerLayout.closeDrawers();
            }
        });

        cxpInstance.registerObserver("hideKeyboard", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                hideSoftKeyboard(MainActivity.this);
            }
        });


        cxpInstance.registerObserver("no.internet", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Toast.makeText(getApplicationContext(), "Network Issue. Check Your Internet Connection", Toast.LENGTH_LONG).show();
            }
        });

        cxpInstance.registerObserver("restrictBBUser", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {

                        if (!isFinishing()) {
                            new AlertDialog.Builder(MainActivity.this)
                                    .setTitle("")
                                    .setIcon(R.drawable.appiconcoloured)
                                    .setMessage("Mobile banking is currently unavailable for Business Banking customers. We are working to enable it.")
                                    .setCancelable(false)
                                    .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            // Whatever...
                                        }
                                    }).create().show();
                        }
                    }
                });
            }
        });

/** This receiver receives  the instruction and send back the rsa mobiel sdk data ***/
        cxpInstance.registerObserver(SUBSCRIBE_RSA_SDK, new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                takeUserPermission(REQUEST_CODE_ASK_MULTIPLE_PERMISSIONS);
            }
        });



        //Kriti 2.5- to handle user wo has no accounts- type1=""
        cxpInstance.registerObserver("BlankUserType", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {

                        if (!isFinishing()) {
                            new AlertDialog.Builder(MainActivity.this)
                                    .setTitle("")
                                    .setIcon(R.drawable.appiconcoloured)
                                    .setMessage("This facility is not available at this time.")
                                    .setCancelable(false)
                                    .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            // Whatever...
                                        }
                                    }).create().show();
                        }
                    }
                });
            }
        });

        cxpInstance.registerObserver("session.not.created", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Toast.makeText(getApplicationContext(), "You could not be logged in. There is an issue in our systems. Please try again later.", Toast.LENGTH_LONG).show();
            }
        });

        //Kriti 2.5- load model after upgrade pop up is dismissed
        IntentFilter intentFilter = new IntentFilter(
                "android.intent.action.MAIN");
        laterUpgradeReceiverBtn = new BroadcastReceiver() {

            @Override
            public void onReceive(Context context, Intent intent) {
                Log.d(logTag, "Receiver listened to load Model");
                loadModelAfterUpgradePopupDismissed();
            }
        };
        this.registerReceiver(laterUpgradeReceiverBtn, intentFilter);
        //Kriti- 2.5 load model after upgrade pop up is dismissed

        /**
         * Custom popup with 1 button
         */
        BroadcastReceiver displayPopupReceiver1Btn = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                context = appContext;
                String data = intent.getExtras().getString(BBConstants.EVENTBUS_EVTDATA);
                JSONObject txnJsonObject;
                ViewDialog alert = new ViewDialog();
                alert.showDialog(MainActivity.this, data, context);
            }
        };


        cxpInstance.registerObserver("display.1btn.popup", displayPopupReceiver1Btn);
        cxpInstance.registerObserver("display.2btn.popup", displayPopupReceiver1Btn);
        cxpInstance.registerObserver("display.3btn.popup", displayPopupReceiver1Btn);

        cxpInstance.registerObserver("closeAppForAus", clostAppReceiver);

        //show progress dialog
        final Dialog splash = new Dialog(MainActivity.this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);

        splash.setContentView(R.layout.splash);

        //Comment this for local usage
        //  splash.show();
        //register navigation and preload receivers
        cxpInstance.registerNavigationEventListener(new NavigationReceiver());
        cxpInstance.registerPreloadGlobalObserver(new BroadcastReceiver() {
                                                      @Override
                                                      public void onReceive(Context context, Intent intent) {
                                                          splash.dismiss();
                                                      }
                                                  }
        );

        //SMS Reading -- start
        //Registering for SMS reading Pubsub
        cxpInstance.registerObserver("readSMS", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String publisher = new String();
                String data = intent.getExtras().getString(BBConstants.EVENTBUS_EVTDATA);

                smsTimerPopp = new smsTimerPopup();
                smsTimerPopp.showDialog(MainActivity.this, context);

                //Toast.makeText(MainActivity.this, "SMS broadcaster registration", Toast.LENGTH_SHORT).show();

                try {
                    JSONObject obj = new JSONObject(data);
                    publisher = obj.optString("data");
                } catch (JSONException e) {
                    Log.d("SMSRead", e.getLocalizedMessage());
                }

                smsReceiver = new SMSBoardcastReceiver(publisher);
                IntentFilter filter = new IntentFilter(SMS_RECEIVED);
                registerReceiver(smsReceiver, filter);
            }
        });


        //mVisa QR code scanning -- start
        //Registering for QR code scan Pubsub

        cxpInstance.registerObserver("scan.mvisa.qr", new BroadcastReceiver() {
            @Override
            public void onReceive(final Context context, Intent intent) {
                Log.d(logTag, "show QRCodeScan observer registered");
                checkPlayServices();
                takeUserPermission(CAMERA_PERMISSOIN_CODE);
            }
        });

        cxpInstance.registerObserver("hide.mvisa.qr", new BroadcastReceiver() {
            @Override
            public void onReceive(final Context context, Intent intent) {
                Log.d(logTag, "hide QRCodeScan observer registered");
                scanQRcodePopup.showQRCodeScanPopup(false);
            }
        });

        cxpInstance.registerObserver("invalid.qr.merchant", new BroadcastReceiver() {
            @Override
            public void onReceive(final Context context, Intent intent) {
                Log.d(logTag, "invalid.qr.merchant observer registered");
                ScanQRcodePopup.qrCodeParserResponseString = "invalidQRCode";
                scanQRcodePopup.showQRCodeScanPopup(false);
            }
        });


        cxpInstance.registerObserver("stopReceiver", new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                try {
                    //Desctroy timer popup
                    smsTimerPopp.dismissPopup();
                    unregisterSMSReceiver();
                    //Toast.makeText(MainActivity.this, "SMS broadcaster DE-registration", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Log.d("SMS Reader", e.getLocalizedMessage());
                }
            }
        });


        /**
         * For Finger Print
         */
        takeUserPermission(SMS_PERMISSION_CODE);
        takeUserPermission(FP_PERMISSOIN_CODE);

    }

    public void unregisterSMSReceiver() {
        this.unregisterReceiver(smsReceiver);
        smsReceiver = null;
    }


    private boolean checkPlayServices() {
        GoogleApiAvailability googleAPI = GoogleApiAvailability.getInstance();
        int result = googleAPI.isGooglePlayServicesAvailable(this);
        Log.d(logTag, "result:" + result);
        if (result != ConnectionResult.SUCCESS) {

            if (googleAPI.isUserResolvableError(result)) {
                googleAPI.getErrorDialog(this, result,
                        PLAY_SERVICES_RESOLUTION_REQUEST).show();
            }

            return false;
        }

        return true;
    }


    //SMS Reading -- End

    @Override
    public void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
    }


    @Override

    public void onSaveInstanceState(Bundle outState) {
    }

    public void initializeAsynchronousTask() {
        final Handler handler = new Handler();
        timer = new Timer();
        doAsynchronousTask = new TimerTask() {
            @Override
            public void run() {
                handler.post(new Runnable() {
                    public void run() {

                        try {
                            //CURRENT_RUNNING_TIMER will set 0 when user will sign in
                            SESSION_ALERT_TIME += SESSION_TIMER;
                            CURRENT_RUNNING_TIMER += SESSION_TIMER;

                            if (SESSION_ALERT_TIME % SESSION_IDEAL_ALERT_END == 0) {
                                //If 4mns alert opens than close it and  open 5 mins dialog session Expire dialog
                                Log.d("MainActivitySession", "Method Called !!!!! Idle session expire" + SESSION_ALERT_TIME + "%" + SESSION_IDEAL_ALERT_END + " == 0");
                                cxpInstance.unregisterObserver(sessionReceiver);
                                stopAsynchronousTask();
                                CURRENT_RUNNING_TIMER = 0;
                            } else if (SESSION_ALERT_TIME % SESSION_IDEAL_ALERT == 0) {
                                //Open Alert,session is going to expire
                                if (preSessionExpireDialog == null || !preSessionExpireDialog.isShowing()) {
                                    openPreSessionExpireDialog();
                                    Log.d("MainActivitySession", "Method Called !!!!! Alert Call" + SESSION_ALERT_TIME + "%" + SESSION_IDEAL_ALERT + " == 0");
                                } else {
                                    Log.d("MainActivitySession", "Method Called !!!!! Alert Call Inside Else");
                                }
                            }
                            if ((CURRENT_RUNNING_TIMER / 1000) % SESSION_SERVICE_CALL_TIME == 0) {
                                Log.d("MainActivitySession", "Method Called !!!!! Multiple user login" + CURRENT_RUNNING_TIMER + "%" + SESSION_SERVICE_CALL_TIME + " == 0");
                                ConnectivityManager conMgr1 = (ConnectivityManager) getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
                                NetworkInfo netInfo1 = conMgr1.getActiveNetworkInfo();
                                if (!(netInfo1 == null || !netInfo1.isConnected() || !netInfo1.isAvailable())) {
                                    new SessionTask().execute(1);
                                }
                            }

                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                });
            }
        };
    }

    public void startAsynchronousTask() {
        timer.schedule(doAsynchronousTask, SESSION_TIMER, SESSION_TIMER);
    }

    public void stopAsynchronousTask() {
        try {
            timer.cancel();
        } catch (Exception e) {
            System.out.println("Null pointer exception at timer cancel: ");
            e.printStackTrace();
        }
    }

    public boolean onTouch(View v, MotionEvent event) {
        int action = event.getAction();
        float eventX = event.getX();
        float eventY = event.getY();
        Log.d("SessionManagement*****", "ACTION_UP Called" + eventX + ":" + eventY);

        //if(!(lastLoginTime.getVisibility()== View.GONE)){
        if (lastLoginTime.getVisibility() == View.GONE) {
            //User in POST LOGIN
            switch (action) {
                case MotionEvent.ACTION_DOWN:
                    SESSION_ALERT_TIME = 0;
                    break;
                case MotionEvent.ACTION_MOVE:
                    SESSION_ALERT_TIME = 0;
                    break;
                case MotionEvent.ACTION_UP:
                    Log.d("Session Management", "ACTION_UP Called");

                    SESSION_ALERT_TIME = 0;
                    break;
                case MotionEvent.ACTION_CANCEL:
                    break;
                default:
                    break;
            }
        } else {
            //User in PRE LOGIN
        }
        return true;
    }

    class SessionTask extends AsyncTask<Integer, Integer, String> {
        @Override
        protected String doInBackground(Integer... params) {
            String result = "";
            Log.i("MainActivity...####", "doInBackground()");
            return result.trim();
        }

        @Override
        protected void onPostExecute(String result) {
            Log.d("MainActivity", "AsyncTask Task Result..onPostExecute()." + result);
            validateSassionFromNative();
        }

        @Override
        protected void onPreExecute() {

        }

        @Override
        protected void onProgressUpdate(Integer... values) {

        }
    }


    public static void hideSoftKeyboard(Activity activity) {
        InputMethodManager inputMethodManager = (InputMethodManager) activity.getSystemService(Activity.INPUT_METHOD_SERVICE);
        inputMethodManager.hideSoftInputFromWindow(activity.getCurrentFocus().getWindowToken(), 0);
    }


    public boolean isOnline() {
        ConnectivityManager conMgr = (ConnectivityManager) getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo netInfo = conMgr.getActiveNetworkInfo();
        if (netInfo == null || !netInfo.isConnected() || !netInfo.isAvailable()) {
            Toast.makeText(getApplicationContext(), "No Internet connection!", Toast.LENGTH_LONG).show();
            return false;
        }
        return true;
    }

    private void showSecurityViolationMessage(String title, String message) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(title)
                .setMessage(message)
                .setPositiveButton("Get me out", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        System.exit(1);
                    }
                }).create().show();
    }

    String pageIdNormalLogin = "";
    String pageIdLogout = "";
    String pageIdScanAndPay = "";
    String pageIdAccountSelection = "";
    String pageIdNotifications = "";
    String pageIdNoCasaLogin = "";
    String pageIdPlSummary = "";
    String pageIdLapSummary = "";
    String pageIdHlSummary = "";
    String pageIdMpinLogin = "";
    String logoutMarketingPageId = "";
    String menuType, linkUrl;

    void loadModelFrom(ModelSource modelSource) {
        //load the model
        if (isOnline()) {
            //load the model
            Backbase myInstance = Backbase.getInstance();
            myInstance.getModel(new ModelListener<Model>() {

                @Override
                public void onModelReady(Model cxpModel) {

                    BBLogger.info(logTag, "model loaded");

                    isRequestSuccessfull1 = false;
                    while (!isRequestSuccessfull1) {


                        if (cxpModel != null) {
                            mVisaFlag = globalVariablePlugin.getMVisaLoginFlagLocally();
                            Log.d(logTag, "mVisaFlag: " + mVisaFlag);
                            assetFlag = globalVariablePlugin.getAssetFlagLocally();
                            Log.d(logTag, "assetFlag: " + assetFlag);
                            loanTypeFlag = globalVariablePlugin.getLoanTypeFlagLocally();
                            Log.d(logTag, "loanTypeFlag: " + loanTypeFlag);
                            loanAvailFlag = globalVariablePlugin.getLoanAvailFlagLocally();
                            Log.d(logTag, "loanAvailFlag: " + loanAvailFlag);
                            hsflag = globalVariablePlugin.getHSFlagLocally();
                            Log.d(logTag, "homesaver flag:" + hsflag);
                            //2.0 mihration
                            mPageList = cxpModel.getSiteMapItemChildrenFor("navroot_mainmenu");
                            //KRITI--IDFC 2.5 to show notification page on click of notification icon top right corner pre login
                            for (SiteMapItemChild siteMapItemChild : mPageList) {
                                //crash fix-null pointer exception
                                isRequestSuccessfull = false;
                                while (!isRequestSuccessfull) {
                                    try {
                                        Model model = cxpInstance.getCurrentModel();
                                        Renderable renderableObject = model.getAllPages().get(siteMapItemChild.getItemRef());
                                        Log.e(logTag, " Renderable object name : --- " + renderableObject.getName());
                                        Log.e(logTag, "siteMapItemChild title : " + siteMapItemChild.getTitle());
                                        // Kriti Win merge code
                                        if ("NOTIFICATIONS".equalsIgnoreCase(siteMapItemChild.getTitle())) {
                                            pageIdNotifications = siteMapItemChild.getItemRef();
                                        }
                                        //Jay for cross sell
                                        if ("My profile".equalsIgnoreCase(siteMapItemChild.getTitle())) {
                                            pageIdNoCasaLogin = siteMapItemChild.getItemRef();
                                        }
                                        isRequestSuccessfull = true;
                                    } catch (Exception e) {
                                        e.printStackTrace();
                                        // finish();
                                        // System.exit(0);
                                        isRequestSuccessfull = false;

                                        new AlertDialog.Builder(MainActivity.this)
                                                .setTitle("")
                                                .setIcon(R.drawable.appiconcoloured)
                                                .setMessage("Seems like an unstable network. Please try again.")
                                                .setCancelable(false)
                                                .setNegativeButton("Exit", new DialogInterface.OnClickListener() {
                                                    @Override
                                                    public void onClick(DialogInterface dialogInterface, int i) {
                                                        MainActivity.this.finish();
                                                        System.exit(0);
                                                    }
                                                })
                                                .setPositiveButton("Retry", new DialogInterface.OnClickListener() {
                                                    @Override
                                                    public void onClick(DialogInterface dialog, int which) {

                                                    }
                                                }).create().show();

                                    }
                                }
                            }
                            //KRITI--IDFC 2.5 to show notification page onn click of notification icon top right corner pre login

                            // siteMapItemChildren = cxpModel.getSiteMapItemChildrenFor("navroot_mainmenu");
                            //SP2_MOB Not adding Marketing screen in Navigation Start Here__________________________
                            String pageRefId = null;
                            boolean notInNavigationMar = false;

                            List<SiteMapItemChild> notInNavigation = cxpModel.getSiteMapItemChildrenFor("navroot_notinmenu");
                            for (SiteMapItemChild siteMapItemChild : notInNavigation
                                    ) {
                                try {
                                    Model model = cxpInstance.getCurrentModel();
                                    Renderable renderableObject = model.getItemById(siteMapItemChild.getItemRef());
                                    if ("Marketing".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                        notInNavigationMar = true;
                                        pageRefId = siteMapItemChild.getItemRef();
                                        break;
                                    }
                                    if ("MPIN LOGIN".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                        pageIdMpinLogin = siteMapItemChild.getItemRef();
                                    }
                                    // Jay Cross sell
                                    if ("LOAN APPLY NOW".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                        applyNowScreen = siteMapItemChild.getItemRef();
                                    }
                                    if ("LogoutMarketing".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                        logoutMarketingPageId = siteMapItemChild.getItemRef();
                                    }
                                    if ("SCAN AND PAY".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                        pageIdScanAndPay = siteMapItemChild.getItemRef();
                                    }
                                    if ("CARD SELECTION".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                        pageIdAccountSelection = siteMapItemChild.getItemRef();
                                    }
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }

                            }

                    /*Add Widgets Name which you want to remove from Navigation Menu*/
                            ArrayList<String> removePageList = new ArrayList<String>();
                            removePageList.add("ACCOUNT STATEMENT");
                            removePageList.add("REVIEW TRANSFER");
                          //  removePageList.add("SET CHALLENGE QUESTION");
                            removePageList.add("CONTACT US");
                            //Migration 2.0 added to remove extra menu item
                            removePageList.add("PASSWORD RESET");
                            removePageList.add("Logout");
                            //SP2_MOB Yushae PwC To Remove Change MPIN Option and Setup Mpin Option Start Here_________________
                            String loginType = globalVariablePlugin.getLoginType();
                            String mpinSetup = globalVariablePlugin.getMpinSetup();
                            String marketing = globalVariablePlugin.getMarketingFlag();
//                    String pageIdNormalLogin = "";
                            //Remove Change MPIN when it is not logged using MPIN

                            //Fix for defect 5133 On username login
                            if ((loginType == null || !loginType.equalsIgnoreCase("MPINLOGIN"))) {
                                removePageList.add("CHANGE MPIN");
                            }

                            //Remove Setup Mpin from Hamburger Menu when User logged with MPIN and When Pre-Login Mpin Setup is true
                            if (loginType.equalsIgnoreCase("MPINLOGIN")) {
                                removePageList.add("SETUP MPIN");
                            }
                            //Remove Forgot MPIN if MPIN is not set on device
                            if (mpinSetup == null || mpinSetup.isEmpty() || "false".equalsIgnoreCase(mpinSetup)) {
                                removePageList.add("FORGOT MPIN");
                            }
                            //SP2_MOB Check Finger Print Capablity and depending show Finger Print
                            String fingerPrintSetup = globalVariablePlugin.getFingerPrintSetup();
                            boolean fingerPrintCapable = fingerPrintPlugin.getFingerPrintCapable();
                            Log.d("Finger Print Setup", fingerPrintSetup);
                            Log.d("Finger Print Capable", new Boolean(fingerPrintCapable).toString());
                            if (!fingerPrintCapable || !loginType.equalsIgnoreCase("MPINLOGIN") || (fingerPrintCapable && "true".equalsIgnoreCase(fingerPrintSetup))) {
                                removePageList.add("ENABLE FINGERPRINT");
                            }


                            //SP2_MOB Yushae PwC To Remove Change MPIN Option and Setup Mpin Option End Here______________________
                            //SP2_MOB Yushae PwC To Remove Change MPIN Option and Setup Mpin Option End Here______________________
                            //2.0 migration
                            List<SiteMapItemChild> tempPageList = new ArrayList<>(mPageList);
                            //List<SiteMapItemChild> tempPageList = new ArrayList<SiteMapItemChild>(mPageList);
                            //crash fix-null pointer exception

                            isRequestSuccessfull2 = false;
                            while (!isRequestSuccessfull2) {
                                try {

                                    Model model = cxpInstance.getCurrentModel();
                                    for (int i = 0; i < tempPageList.size(); i++) {
                                        //2.0 migration
                                        //Renderable renderableObject = model.getItemById(tempPageList.get(i));

                                        //SP2_MOB Get Page ID for MPIN Login and Sign In which is used for redirection after Marketing Page
                                        Renderable renderableObject = model.getItemById(tempPageList.get(i).getItemRef());


                                        String menuToBeRemoved = renderableObject.getPreference("title").toUpperCase();

                                        //KRITI-- IDFC 2.5 dont show logout in hamburger menu
                                        if ("LOGOUT".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                            mPageList.remove(tempPageList.get(i));
                                            pageIdLogout = tempPageList.get(i).getItemRef();
                                        }
                                        if ("LOAN APPLY NOW".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                            mPageList.remove(tempPageList.get(i));
                                            applyNowScreen = tempPageList.get(i).getItemRef();
                                        }


                                        //KRITI-- IDFC 2.5 -create dynamic liabilityPagelist-- postlogin menus
                                        String isLiabilityPage = renderableObject.getPreference("isLiabilityPage");
                                        if (isLiabilityPage != null) {
                                            if (isLiabilityPage.equalsIgnoreCase("true")) {
                                                liabilityPageList.add(renderableObject.getPreference("title"));
                                                //Log.d(logTag, "isLiabilityPage thru preference:" + renderableObject.getName() + " " + isLiabilityPage);
                                            }
                                        }

                                        if ("Sign in".equalsIgnoreCase(renderableObject.getPreference("title"))) {
                                            pageIdNormalLogin = tempPageList.get(i).getItemRef();
                                        }
                                        //2.0 Migration
                        /*if(removePageList.toString().contains(renderableObject.getName())) {
                            mPageList.remove(tempPageList.get(i));
                        }*/

                                        if (removePageList.toString().contains(menuToBeRemoved)) {
                                            mPageList.remove(tempPageList.get(i));
                                        }
                                    }
                                    isRequestSuccessfull2 = true;
                                } catch (Exception e) {
                                    e.printStackTrace();
                                    //finish();
                                    //System.exit(0);
                                    isRequestSuccessfull2 = false;
                                    new AlertDialog.Builder(MainActivity.this)
                                            .setTitle("")
                                            .setIcon(R.drawable.appiconcoloured)
                                            .setMessage("Seems like an unstable network. Please try again.")
                                            .setCancelable(false)
                                            .setNegativeButton("Exit", new DialogInterface.OnClickListener() {
                                                @Override
                                                public void onClick(DialogInterface dialogInterface, int i) {
                                                    MainActivity.this.finish();
                                                    System.exit(0);
                                                }
                                            })
                                            .setPositiveButton("Retry", new DialogInterface.OnClickListener() {
                                                @Override
                                                public void onClick(DialogInterface dialog, int which) {

                                                }
                                            }).create().show();

                                }
                            }
                            //create the main navigation drawer menu from the page list
                            addDrawerItems(mPageList, cxpModel);

                            //2.0 migration
                            //replaceFragment(mPageList.get(0));


                            //check if the app is updated -by comparing last active and current active version of app
                            Log.d(logTag, "getLastVersionOnDevice:" + globalVariablePlugin.getLastVersionOnDevice());
                            Log.d(logTag, "getCurrentVersionOnDevice:" + globalVariablePlugin.getCurrentVersionOnDevice());
                            if (globalVariablePlugin.getLastVersionOnDevice().equalsIgnoreCase(globalVariablePlugin.getCurrentVersionOnDevice())) {
                                isAppUpdated = false;
                            } else {
                                globalVariablePlugin.setLastVersionOnDevice(globalVariablePlugin.getCurrentVersionOnDevice());
                                isAppUpdated = true;
                            }

                            //SP2_MOB Adding Marketing in non-Navigation and redirecting on Sign In Or Mpin Login Start Here ------------
                            if (notInNavigationMar && pageRefId != null) {
                                if (marketing == null || marketing.isEmpty() || marketing.equalsIgnoreCase("false") || isAppUpdated) {
                                    //If Marketing Flag not set show Marketing page
                                    Log.e(logTag, "Marketing flag value : " + marketing);
                                    replaceFragment(pageRefId);
                                } else {
                                    //If Mpin is set up Redirect to login Page
                                    if (mpinSetup.equalsIgnoreCase("true")) {
                                        replaceFragment(pageIdMpinLogin);
                                    } else {
                                        //Else to existing flow
                                        replaceFragment(pageIdNormalLogin);
                                    }
                                }
                            } else {
                                if (mVisaFlag.equalsIgnoreCase("true")) {
                                    //load debit card selection widget pageIdAccountSelection

                                    replaceFragment(pageIdAccountSelection);

                                } else if (assetFlag.equalsIgnoreCase("true")) {
                                    //JAY- IDFC 2.5 cross sell
                                    isFirstTime = true;
                                    if (loanTypeFlag.equalsIgnoreCase("hl")) {
                                        // Log.d(logTag,"loading pageIdHlSummary:"+pageIdHlSummary);
                                        replaceFragment(pageIdHlSummary);
                                    } else if (loanTypeFlag.equalsIgnoreCase("pl")) {
                                        replaceFragment(pageIdPlSummary);
                                    } else if (loanTypeFlag.equalsIgnoreCase("lap")) {
                                        replaceFragment(pageIdLapSummary);
                                    }
                                    //replaceFragment(pageIdNoCasaLogin);
                                } else {
                                    replaceFragment(mPageList.get(0).getItemRef());
                                }
                            }
                            isRequestSuccessfull1 = true;
                        } else {
                            //finish();
                            //System.exit(0);
                            isRequestSuccessfull1 = false;
                            new AlertDialog.Builder(MainActivity.this)
                                    .setTitle("")
                                    .setIcon(R.drawable.appiconcoloured)
                                    .setMessage("Seems like an unstable network. Please try again.")
                                    .setCancelable(false)
                                    .setNegativeButton("Exit", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialogInterface, int i) {
                                            MainActivity.this.finish();
                                            System.exit(0);
                                        }
                                    })
                                    .setPositiveButton("Retry", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {

                                        }
                                    }).create().show();

                        }
                    }
                    //SP2_MOB Adding Marketing in non-Navigation and redirecting on Sign In Or Mpin Login End Here ------
                }

                @Override
                public void onError(String error) {
                    System.out.println("ERROR MESSAGE " + error);
                }
            }, modelSource);
        } else {
            try {
                AlertDialog alertDialog = new AlertDialog.Builder(getApplicationContext()).create();
                alertDialog.setTitle("Info");
                alertDialog.setMessage("Internet not available, Cross isOnline internet connectivity and try again");
                alertDialog.setIcon(android.R.drawable.ic_dialog_alert);
                alertDialog.setButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                        finish();

                    }
                });

                alertDialog.show();
            } catch (Exception e) {
                //Log.d(Constants.TAG, "Show Dialog: "+e.getMessage());
            }
        }
    }

    @Override
    protected void onDestroy() {
        getSupportFragmentManager().removeOnBackStackChangedListener(mOnBackStackChangedListener);

        //mobile 3.0 - crash fix- unregister receiver
        this.unregisterReceiver(laterUpgradeReceiverBtn);
        laterUpgradeReceiverBtn = null;

        super.onDestroy();
    }

    //backstack handler changing the action bar icon from drawer to back appearance
    private FragmentManager.OnBackStackChangedListener mOnBackStackChangedListener = new FragmentManager.OnBackStackChangedListener() {
        @Override
        public void onBackStackChanged() {
            int count = getSupportFragmentManager().getBackStackEntryCount();
            //if top level display hamburger icon, else standard back arraow
            if (count == 0) {
                getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                //getSupportActionBar().setHomeAsUpIndicator(null);
            } else {
                getSupportActionBar().setHomeAsUpIndicator(R.drawable.btn_back);
            }
            currentItemId = "";
        }
    };

    @Override
    public void onSecurityViolation(String message) {
//        showSecurityViolationMessage("Security Violation", message);
    }

/* The click listener for NavigationView in the navigation drawer */

    private class DrawerItemClickListener implements NavigationView.OnNavigationItemSelectedListener {
        @Override
        public boolean onNavigationItemSelected(final MenuItem menuItem) {
            mDrawerLayout.closeDrawers();
            //delay the fragment replacement a little bit so that the drawer close animation runs more smoothly
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    //2.0 migration
                    //replaceFragment(mPageList.get(menuItem.getItemId()));
                    replaceFragment(mPageList.get(menuItem.getItemId()).getItemRef());
                }
            }, 200);
            return true;
        }
    }
/* Swaps fragments in the main content view and updates the drawer*/

    //2.0 migration
    //private void replaceFragment(String targetPageId) {
    private void replaceFragment(String targetPageId) {
        // Log.d("mainactivity","replacefragemnt called with pageoid: "+targetPageId);
        //crash fix-null pointer exception
        isRequestSuccessfull = false;
        while (!isRequestSuccessfull) {

            try {

                Model model = cxpInstance.getCurrentModel();
                Renderable obj = model.getItemById(targetPageId);


                pageName = obj.getPreference("title");

                Log.e(logTag, "pageName : " + pageName);

                //IDFC 2.5
                //This is pure asset customer and redirect user to apply now when tries to access liability widgets
                if (assetFlag.equalsIgnoreCase("true")) {

                    if (liabilityPageList.contains(pageName)) {
                        //This means user is trying to access liability widget hence transfer him to apply now
                        //page id for apply now

                        //pass SR request to apply now to identify which page it is coming from

                        if (pageName.equalsIgnoreCase("Recurring deposit")) {
                            globalVariablePlugin.setSRrequestLocally("rdRequest");
                        } else if (pageName.equalsIgnoreCase("Fixed deposit")) {
                            globalVariablePlugin.setSRrequestLocally("fdRequest");
                        } else {
                            globalVariablePlugin.setSRrequestLocally("casaAccount");
                        }
                        targetPageId = applyNowScreen;
                    }
                }

                //This is casa customer and redirect user to apply now when tries to access home loan summary if he does not have home loan
                if (pageName.equalsIgnoreCase("home") && !loanAvailFlag.contains("hl")) {

                    globalVariablePlugin.setSRrequestLocally("homeLoan");
                    targetPageId = applyNowScreen;
                }
                //This is casa customer and redirect user to apply now when tries to access personal loan summary if he does not have personal loan
                if (pageName.equalsIgnoreCase("personal") && !loanAvailFlag.contains("pl")) {

                    //pass SR request to apply now to identify which page it is coming from
                    globalVariablePlugin.setSRrequestLocally("personalLoan");
                    targetPageId = applyNowScreen;
                }
                //This is casa customer and redirect user to apply now when tries to access against property summary if he does not have against property loan
                if (pageName.equalsIgnoreCase("against property") && !loanAvailFlag.contains("lap")) {
                    globalVariablePlugin.setSRrequestLocally("loanAgainstProperty");
                    targetPageId = applyNowScreen;
                }
                //IDFC 2.5

                List<String> mPageItemRefList = new ArrayList<>();
                for (int i = 0; i < mPageList.size(); i++) {
                    mPageItemRefList.add(mPageList.get(i).getItemRef());
                }

                //TO chnage the color of action bar
                if (!mPageItemRefList.contains(targetPageId)) {
                    if (pageName.equalsIgnoreCase("MPIN Login")) {
                        getSupportActionBar().show();
                        ActionBar actionBar = getSupportActionBar();
                        actionBar.setBackgroundDrawable(new ColorDrawable(Color.WHITE));
                        actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_primary);
                        actionBar.setDisplayShowCustomEnabled(false);
                        //actionBar.setLogo(R.drawable.ic_menu_primary);
                        View view = getLayoutInflater().inflate(R.layout.custom_action_bar, null);
                        ActionBar.LayoutParams layoutParams = new ActionBar.LayoutParams(ViewGroup.LayoutParams.FILL_PARENT, ViewGroup.LayoutParams.FILL_PARENT);
                        actionBar.setCustomView(view, layoutParams);
                        actionBar.setDisplayShowCustomEnabled(true);
                        //Added change for Forgot MPIN hiding of Drawer
                    } else if (pageName.equalsIgnoreCase("SETUP MPIN") || pageName.equalsIgnoreCase("Forgot MPIN")) {
                        getSupportActionBar().show();
                        ActionBar actionBar = getSupportActionBar();
                        actionBar.setBackgroundDrawable(new ColorDrawable(getResources().getColor(R.color.colorPrimary)));
                        //versionName.setIcon(R.drawable.notifications_white);
                        actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_white);
                        actionBar.setDisplayShowCustomEnabled(false);
                    } else if (pageName.equalsIgnoreCase("Marketing")) {
                        //To hide action bar in case of MArketing
                        getSupportActionBar().hide();
                    } else if (pageName.equalsIgnoreCase("Logout")) {
                        getSupportActionBar().hide();
                    } else if (pageName.equalsIgnoreCase("Apply Now") || pageName.equalsIgnoreCase("Home") || pageName.equalsIgnoreCase("Personal") || pageName.equalsIgnoreCase("Against property")) {
                        getSupportActionBar().show();
                        ActionBar actionBar = getSupportActionBar();
                        actionBar.setBackgroundDrawable(new ColorDrawable(getResources().getColor(R.color.colorPrimary)));
                        actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_white);
                        //versionName.setIcon(R.drawable.notifications);

                        actionBar.setDisplayShowCustomEnabled(false);
                    } else if (pageName.equalsIgnoreCase("Scan and Pay") || pageName.equalsIgnoreCase("Card Selection")) {
                        getSupportActionBar().show();
                        ActionBar actionBar = getSupportActionBar();
                        actionBar.setBackgroundDrawable(new ColorDrawable(getResources().getColor(R.color.colorPrimary)));
                        actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_white);
                        //versionName.setIcon(R.drawable.notifications);
                        actionBar.setDisplayShowCustomEnabled(false);
                    }

                } else {
                    if (pageName.equalsIgnoreCase("Sign In")) {
                        getSupportActionBar().show();
                        ActionBar actionBar = getSupportActionBar();
                        actionBar.setBackgroundDrawable(new ColorDrawable(Color.WHITE));
                        actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_primary);
                        actionBar.setDisplayShowCustomEnabled(false);
                        View view = getLayoutInflater().inflate(R.layout.custom_action_bar, null);
                        ActionBar.LayoutParams layoutParams = new ActionBar.LayoutParams(ViewGroup.LayoutParams.FILL_PARENT, ViewGroup.LayoutParams.FILL_PARENT);
                        actionBar.setCustomView(view, layoutParams);
                        actionBar.setDisplayShowCustomEnabled(true);
                    } else if (pageName.equalsIgnoreCase("MPIN Login")) {
                        getSupportActionBar().show();
                        ActionBar actionBar = getSupportActionBar();
                        actionBar.setBackgroundDrawable(new ColorDrawable(Color.WHITE));
                        //versionName.setIcon(R.drawable.notifications);
                        actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_primary);
                        actionBar.setDisplayShowCustomEnabled(false);
                        //actionBar.setLogo(R.drawable.ic_menu_primary);
                        View view = getLayoutInflater().inflate(R.layout.custom_action_bar, null);
                        ActionBar.LayoutParams layoutParams = new ActionBar.LayoutParams(ViewGroup.LayoutParams.FILL_PARENT, ViewGroup.LayoutParams.FILL_PARENT);
                        actionBar.setCustomView(view, layoutParams);
                        actionBar.setDisplayShowCustomEnabled(true);
                    } else if (pageName.equalsIgnoreCase("Logout")) {
                        getSupportActionBar().hide();
                    } else if (pageName.equalsIgnoreCase("LogoutMarketing")) {
                        getSupportActionBar().hide();
                    } else if (pageName.equalsIgnoreCase("Apply Now") || pageName.equalsIgnoreCase("Home") || pageName.equalsIgnoreCase("Personal") || pageName.equalsIgnoreCase("Against property")) {
                        ActionBar actionBar = getSupportActionBar();
                        actionBar.setBackgroundDrawable(new ColorDrawable(getResources().getColor(R.color.colorPrimary)));
                        actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_white);
                        actionBar.setDisplayShowCustomEnabled(false);
                    } else {
                        //For rest of the cases
                        getSupportActionBar().show();
                        ActionBar actionBar = getSupportActionBar();
                        actionBar.setBackgroundDrawable(new ColorDrawable(getResources().getColor(R.color.colorPrimary)));
                        actionBar.setHomeAsUpIndicator(R.drawable.ic_menu_white);
                        actionBar.setDisplayShowCustomEnabled(false);
                    }
                }

                if (currentItemId == targetPageId) {
                    if (mPageList.get(0).getItemRef().equals(targetPageId) && lastLoginTime.getVisibility() == View.GONE) {
                        getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_primary);
                    } else {
                        getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                    }
                    backEnable = "";
                }


                currentItemId = targetPageId;

                System.out.println("Current Item ID: " + currentItemId);

                // Create a new fragment and specify the page to show
                PageFragment pageFragment = PageFragment.newInstance(targetPageId);

                // Insert the fragment by replacing any existing fragment
                FragmentManager fragmentManager = getSupportFragmentManager();
                if (fragmentManager.getBackStackEntryCount() != 0) {
                    fragmentManager.popBackStack(null, FragmentManager.POP_BACK_STACK_INCLUSIVE);

                    for (int i = 0; i < fragmentManager.getBackStackEntryCount(); ++i) {
                        fragmentManager.popBackStack();
                    }
                }

                //mvisa- to change frame to full size for any other page
                if (!targetPageId.equalsIgnoreCase(pageIdScanAndPay)) {
                    lp = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT);
                    contentFrameLL.setLayoutParams(lp);
                    cameraView.setVisibility(View.INVISIBLE);
                    cameraFocusView.setVisibility(View.INVISIBLE);
                }

                boolean isRootPage = mPageList.contains(targetPageId);
                if (isRootPage) {
                    //mark item in the menu and clear backstack
                    //mNavigationView.getMenu().getItem(mPageList.indexOf(targetPageId)).setChecked(true);
                    fragmentManager.beginTransaction().
                            //setCustomAnimations(R.anim.fade_in, R.anim.fade_out).
                                    replace(R.id.content_frame, pageFragment)
                            .commitAllowingStateLoss();
                    //commitAllowingStateLoss();
                } else {
                    //child fragments are added to a back stack for proper back navigation
                    fragmentManager.beginTransaction().
                            //setCustomAnimations(R.anim.slide_in_left, R.anim.slide_in_left, R.anim.slide_out_right, R.anim.slide_out_right).
                                    replace(R.id.content_frame, pageFragment).commitAllowingStateLoss();
                    //addToBackStack(null).
                    //commitAllowingStateLoss();
                }


                mActivityTitle = pageName;
                this.invalidateOptionsMenu();
                isRequestSuccessfull = true;
            } catch (Exception e) {
                e.printStackTrace();
                //finish();
                //System.exit(0);
                isRequestSuccessfull = false;
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("")
                        .setIcon(R.drawable.appiconcoloured)
                        .setMessage("Seems like an unstable network. Please try again.")
                        .setCancelable(false)
                        .setNegativeButton("Exit", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                MainActivity.this.finish();
                                System.exit(0);
                            }
                        })
                        .setPositiveButton("Retry", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {

                            }
                        }).create().show();
            }
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {

        // Handle action buttons
        switch (item.getItemId()) {
            case android.R.id.home:
                // The action bar back/up action should either go to the last fragment or open the drawer when at top level
                if (backEnable.equals("ENABLE_BACK")) {
                    publishBackEventDromNative();

                    //Added for mVisa-Kriti
                    Log.d(logTag, "back pressed on currentItemId" + currentItemId);

                    if (!currentItemId.equalsIgnoreCase(pageIdAccountSelection)) {
                        getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                        backEnable = "ENABLE_HOME";
                    }

                    if (trackSRId.length() > 0) {
                        mActivityTitle = mActivityParent;
                        getSupportActionBar().setTitle(mActivityTitle);
                        trackSRId = "";
                    }
                } else if (backEnable.equalsIgnoreCase("ENABLE_BACK_CHILD")) {

                    replaceFragment(originResource);
                    backEnable = "ENABLE_HOME";
                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                } else {
                    if (!getSupportFragmentManager().popBackStackImmediate())
                        mDrawerLayout.openDrawer(GravityCompat.START);

                    //IDFC 2.5- for asset customer- to show loans drop down menu first time after login
                    if (isFirstTime && assetFlag.equalsIgnoreCase("true")) {
                        Log.d(logTag, "mExpandableListView expandGroup called for asset customer to show loans drop down");
                        mExpandableListView.expandGroup(6);
                        isFirstTime = false;
                    }
                }
                return true;
            case R.id.action_versionName:

               /* Log.d("Main@@@!!!", "Add Payee Called" + mActivityTitle);
                publishPlusIconEventFromNative();
                mActivityTitle = "ADD BILLER";
                invalidateOptionsMenu();*/

                /*IDFC 2.5 notifications Option to be given on the top right corner prelogin*/

                String actionBtnFlagIndicator = prefs.getString("actionBtnFlag", "");
                if (actionBtnFlagIndicator.equalsIgnoreCase("logout")) {
                    new AlertDialog.Builder(MainActivity.this)
                            .setIcon(R.drawable.appiconcoloured)
                            .setTitle("Confirmation")
                            .setMessage("Do you want to logout from the app?")
                            .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {

                                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                                    backEnable = "";

                                    //2.0 MIgration
                                    //replaceFragment(mPageList.get(mPageList.size() - 1));
                                    replaceFragment(pageIdLogout);
                                    //mDrawerLayout.closeDrawers();
                                    SESSION_ALERT_TIME = 0;
                                    CURRENT_RUNNING_TIMER = 0;
                                }

                            })
                            .setNegativeButton("No", null)
                            .show();
                } else if (actionBtnFlagIndicator.equalsIgnoreCase("notification")) {
                    replaceFragment(pageIdNotifications);
                }
                return true;
                 /*if(versionName.getIcon().getConstantState().equals(ContextCompat.getDrawable(this,R.drawable.logout).getConstantState())){
                     new AlertDialog.Builder(MainActivity.this)
                             .setIcon(R.drawable.appiconcoloured)
                             .setTitle("Confirmation")
                             .setMessage("Do you want to logout from the app?")
                             .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                                 @Override
                                 public void onClick(DialogInterface dialog, int which) {

                                     getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                                     backEnable = "";

                                     //2.0 MIgration
                                     //replaceFragment(mPageList.get(mPageList.size() - 1));
                                     replaceFragment(pageIdLogout);
                                     //mDrawerLayout.closeDrawers();
                                     SESSION_ALERT_TIME = 0;
                                     CURRENT_RUNNING_TIMER = 0;
                                 }

                             })
                             .setNegativeButton("No", null)
                             .show();
                 }
                else {
                     //String notificationPageId="page_1471845789406";
                     replaceFragment(pageIdNotifications);
                }
                return true;*/
            default:
                return super.onOptionsItemSelected(item);
        }
    }


    //listener for navigation events from the SDK
    private class NavigationReceiver implements NavigationEventListener {
        @Override
        public void onNavigationEvent(NavigationEvent navigationEvent) {

            backEnable = "ENABLE_HOME";
            //getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);

            String targetResource = navigationEvent.getTargetPageUri();

            Log.i(logTag, "navigation event " + navigationEvent.getRelationship() + ":" + targetResource);
            switch (navigationEvent.getRelationship()) {
                case EXTERNAL:
                    //open external links in browser
                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                    if (!targetResource.startsWith("http://") && !targetResource.startsWith("https://"))
                        targetResource = "http://" + targetResource;
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(targetResource));
                    startActivity(i);
                    break;
                case ROOT:
                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                    replaceFragment(targetResource);
                    break;
                case CHILD:
                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                    //replace current fragment with new ROOT/CHILD
                    getSupportActionBar().setHomeAsUpIndicator(null);
                    replaceFragment(targetResource);
                    originResource = navigationEvent.getOriginPageUri();
                    backEnable = "ENABLE_BACK_CHILD";
                    break;
                case SIBLING:
                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                    //replace current fragment with new SIBLING
                    replaceFragment(targetResource);
                    break;
                case SELF:
                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                    //replace current fragment with SELF
                    replaceFragment(targetResource);
                    break;
                case OTHER:
                    getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                    //replace current fragment with new OTHER
                    replaceFragment(targetResource);
                    break;
                case NONE:
                    Log.d(logTag, "getUPIFlagLocally:" + globalVariablePlugin.getUPIFlagLocally());
                    if (globalVariablePlugin.getUPIFlagLocally().equalsIgnoreCase("true")) {
                        globalVariablePlugin.clearUPIFlagLocally();
                        getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_primary);
                        goToUPIApp();
                    }
                    break;
                default:
                    break;
            }

        }
    }


    private void goToUPIApp() {
        try {
            Intent launchIntent = getPackageManager().getLaunchIntentForPackage("com.fss.idfcpsp");
            startActivity(launchIntent);
            Log.d(logTag, "app installed");
        } catch (Exception e) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=com.fss.idfcpsp")));
            } catch (android.content.ActivityNotFoundException anfe) {
                Log.d(logTag, "ex: " + e.getMessage());
            }
            Log.d(logTag, "ex: " + e.getMessage());
        }
    }

    //2.0 migration
    //private void addDrawerItems(List<String> mPageList, Model cxpModel) {
    private void addDrawerItems(List<SiteMapItemChild> mPageList, Model cxpModel) {
        mExpandableListTitle = new ArrayList<NDGroup>();
        mExpandableListData = new HashMap<String, List<String>>();

        //IDFc 2.5 removing dashboard from menu when asset customer
        ArrayList<SiteMapItemChild> tempPageList = new ArrayList<>(mPageList);
        String itemName = "";
        if (assetFlag.equalsIgnoreCase("true")) {
            if(tempPageList.size() > 0) { //3.5 change
                for (int i = 0; i < tempPageList.size(); i++) {
                    if(cxpModel.getAllPages().get(tempPageList.get(i))!=null) {
                        itemName = cxpModel.getAllPages().get(tempPageList.get(i)).getName();
                        if (itemName != null) {
                            if (itemName.equalsIgnoreCase("Dashboard")) {
                                mPageList.remove(tempPageList.get(i));
                                break;
                            }
                        }
                    }
                }
            }
        }

        Renderable renderableItem = null;
        for (int i = 0; i < mPageList.size(); i++) {

            isRequestSuccessfull = false;
            //2.0 migration
            //String pageId = mPageList.get(i);
            String pageId = mPageList.get(i).getItemRef();
            String rendarableItemName = "";
            //Group Title
            //SP2_MOB Removal of Marketing Page from Navigation
            //  if (!"Marketing".equalsIgnoreCase(cxpModel.getAllPages().get(pageId).getPreference("title"))) {

            //Excute while start
            Log.w("request successful", isRequestSuccessfull + "");
            while (!isRequestSuccessfull) {
//crash fix-null pointer exception
                Log.w("1", "1");
                try {

                    renderableItem = cxpModel.getAllPages().get(pageId);

                    //Satyam Garg
                    if (i == 0) {
                        //2.0 migration
                        String groupTitleName = renderableItem.getPreference("title");
                        //String groupTitleName = renderableItem.getPreference();
                        mActivityTitle = groupTitleName;
                    }

                    /***************************Satyam Android Menu - 0402**************************************/
                    Drawable myIcon;
                    try {
                        //2.0 MIGRATION
                        rendarableItemName = renderableItem.getPreference("title");
                        rendarableItemName = rendarableItemName.replace('/', ' ');
                        /*rendarableItemName = rendarableItemName.replace('(', ' ');
                        rendarableItemName = rendarableItemName.replace(')', ' ');*/
                        String[] nameArray = rendarableItemName.split(" ");
                        String mDrawableName = "";
                        for (int j = 0; j < nameArray.length; j++) {
                            if (j > 0) {
                                mDrawableName += "_";
                            }
                            mDrawableName += nameArray[j].toLowerCase();
                        }

                        Log.d("@@@@@@@mDrawableName", "" + mDrawableName);
                        Resources res = getResources();
                        int resourceId = -1;
                        if (mDrawableName.equalsIgnoreCase("bharat_bill_pay_(bbps)")) {
                            mDrawableName = mDrawableName.replace('(', ' ');
                            mDrawableName = mDrawableName.replace(')', ' ');
                            String[] newName = mDrawableName.split(" ");
                            String newDrawableName = "";
                            for (int j = 0; j < newName.length; j++) {
                                newDrawableName += newName[j].toLowerCase();
                            }
                            resourceId = res.getIdentifier(newDrawableName, "drawable", getPackageName());
                        } else {
                            resourceId = res.getIdentifier(mDrawableName, "drawable", getPackageName());
                        }

                        myIcon = ContextCompat.getDrawable(this, resourceId);
                    } catch (Exception e) {
                        //If icon not found default icon will set
                        //myIcon = ContextCompat.getDrawable(this, R.drawable.locate);
                        Drawable transparentDrawable = new ColorDrawable(Color.TRANSPARENT);
                        myIcon = transparentDrawable;
                    }
                    //2.0 migration
                    if((lastLoginTime.getVisibility() ==  View.GONE) && rendarableItemName.equalsIgnoreCase("Update Challenge Questions")){
                        // Skipping Update Challenge Questions from showing in pre-login screen
                        Log.d("Last Login Time", "NOt Visible");
                    }
                    else {
                        mExpandableListTitle.add(new NDGroup(rendarableItemName, myIcon));
                    }

                    /*******************************************************************************************/
                    //Group's Childs
                    //2.0 Migration
                    List<SiteMapItemChild> childListIds = tempPageList.get(i).getChildren(); //cxpModel.getSiteMapItemChildrenFor(renderableItem.getId());
                    ArrayList<String> childListTitles = new ArrayList<String>();
/**********************************************CHILD MENU*******************************************/
                    if (childListIds.size() > 0) {
                        for (int j = 0; j < childListIds.size(); j++) {
                            //2.0 migration
                            //String childItemId = childListIds.get(j);
                            SiteMapItemChild childItemId = childListIds.get(j);
                            Renderable render = cxpModel.getAllPages().get(childItemId.getItemRef());

                            //IDFC 2.5- save pageids of HL,PL,and LAP to use as landing page in case of asset customer
                            Log.e(logTag, "render.getName() :: " + render.getPreference("title"));
                            if (render.getPreference("title").equalsIgnoreCase("Personal")) {
                                pageIdPlSummary = childItemId.getItemRef();
                            }
                            if (render.getPreference("title").equalsIgnoreCase("Against property")) {
                                pageIdLapSummary = childItemId.getItemRef();
                            }
                            if (render.getPreference("title").equalsIgnoreCase("Home")) {
                                //Log.d(logTag,"initialising pageIdHlSummary:"+pageIdHlSummary);
                                pageIdHlSummary = childItemId.getItemRef();
                            }
                            if (assetFlag.equalsIgnoreCase("true")) {
                                if (hsflag.equalsIgnoreCase("true")) {
                                    liabilityPageList.clear();
                                    liabilityPageList.add("My Accounts");
                                    // Log.d(logTag, "liabilityPageList after clear:" + liabilityPageList);
                                }
                            }

                            //IDFC 2.5 for hiding hamburger submenus of casa/liability menu in asset user
                            boolean showChild = true;
                            // Log.d(logTag,"liabilityPageList:"+liabilityPageList);
                            if (assetFlag.equalsIgnoreCase("true")) {
                                if (liabilityPageList.contains(renderableItem.getPreference("title"))) {
                                    showChild = false;
                                }
                            }
                            //IDFC 2.5- for casa customer- to hide loans drop down menu when no loans
                    /*loanAvailFlag= globalVariablePlugin.getLoanAvailFlagLocally();
                    Log.d(logTag,"loanAvailFlag: "+loanAvailFlag);*/
                            if (assetFlag.equalsIgnoreCase("false") && loanAvailFlag.equalsIgnoreCase("You have no loans from us")) {
                                if (renderableItem.getPreference("title").equalsIgnoreCase("loans")) {
                                    showChild = false;
                                }
                            }
                            if (assetFlag.equalsIgnoreCase("false") && !loanAvailFlag.equalsIgnoreCase("You have no loans from us") && !loanAvailFlag.equalsIgnoreCase("Sorry, Our machines are not talking to each other! Please try in a while")) {
                                if (renderableItem.getPreference("title").equalsIgnoreCase("loans")) {
                                    showChild = true;
                                }
                            }
                            if (showChild) {
                                childListTitles.add(render.getPreference("title"));
                                mGroupChildPageList.put(i + "" + j, childListIds.get(j).getItemRef());
                            } else {
                                mGroupChildPageList.put(i + "" + 0, mPageList.get(i).getItemRef());
                                break;
                            }
                            //Log.d(logTag,"showChild:"+showChild);
                        }
                    } else {
                        //2.0 migration
                        mGroupChildPageList.put(i + "" + 0, mPageList.get(i).getItemRef());
                    }
/***************************************************************************************************/

                    //2.0 migration
                    mExpandableListData.put(rendarableItemName, childListTitles);
                    isRequestSuccessfull = true;
                } catch (Exception e) {
                    e.printStackTrace();
                    isRequestSuccessfull = false;
                    new AlertDialog.Builder(MainActivity.this)
                            .setTitle("")
                            .setIcon(R.drawable.appiconcoloured)
                            .setMessage("Seems like an unstable network. Please try again.")
                            .setCancelable(false)
                            .setNegativeButton("Exit", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
                                    MainActivity.this.finish();
                                }
                            })
                            .setPositiveButton("Retry", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {

                                }
                            }).create().show();
                    //Toast.makeText(MainActivity.this, "Seems like an unstable network. Please try again.", Toast.LENGTH_SHORT).show();
                }
            }//while To

        }

        mExpandableListAdapter = new NDCustomExpandableListAdapter(this, mExpandableListTitle, mExpandableListData);
        mExpandableListView.setAdapter(mExpandableListAdapter);
        mExpandableListView.setOnGroupExpandListener(new ExpandableListView.OnGroupExpandListener() {
            @Override
            public void onGroupExpand(int groupPosition) {

                int len = mExpandableListAdapter.getGroupCount();
                for (int i = 0; i < len; i++) {
                    if (i != groupPosition) {
                        mExpandableListView.collapseGroup(i);
                    }
                }
            }
        });

        mExpandableListView.setOnGroupCollapseListener(new ExpandableListView.OnGroupCollapseListener() {
            @Override
            public void onGroupCollapse(int groupPosition) {

            }
        });

        mExpandableListView.setOnChildClickListener(new ExpandableListView.OnChildClickListener() {
            @Override
            public boolean onChildClick(ExpandableListView parent, View v,
                                        int groupPosition, int childPosition, long id) {

                int index = parent.getFlatListPosition(ExpandableListView.getPackedPositionForChild(groupPosition, childPosition));
                parent.setItemChecked(index, true);

                NDGroup groupDtl = mExpandableListTitle.get(groupPosition);
                String groupTitle = groupDtl.getTitle();

                List<String> values = mExpandableListData.get(groupTitle);
                String childTitle = values.get(childPosition);

                mActivityTitle = childTitle;

                mDrawerLayout.closeDrawer(GravityCompat.START);

                String key = groupPosition + "" + childPosition;
                String navigationPageId = mGroupChildPageList.get(key);
                replaceFragment(navigationPageId);

                return true;
            }

        });

        mExpandableListView.setOnGroupClickListener(new ExpandableListView.OnGroupClickListener() {
            @Override
            public boolean onGroupClick(ExpandableListView parent, View v, int groupPosition, long id) {
                int index = parent.getFlatListPosition(ExpandableListView.getPackedPositionForGroup(groupPosition));
                parent.setItemChecked(index, true);

                NDGroup groupDtl = mExpandableListTitle.get(groupPosition);
                String groupTitle = groupDtl.getTitle();
                List<String> values = mExpandableListData.get(groupTitle);
                String mpinSetup = globalVariablePlugin.getMpinSetup();
                // Log.d("mainactivity","group title: "+groupTitle+mpinSetup);


                /*IDFC 2.5 -Hamburger Menu - redirection on login*/
                if (values.size() == 0) {
                    mActivityTitle = groupTitle.trim();
                    mDrawerLayout.closeDrawer(GravityCompat.START);


                    if (groupTitle.equalsIgnoreCase("sign in")) {

                         /*mVisa- break mVisa flow if visited other widget after
                    scan and pay, before login*/
                        globalVariablePlugin.clearMVisaLoginFlagLocally();
                        globalVariablePlugin.clearScanAndPayFlagLocally();

                        //Log.d("mainactivity", "if " + groupTitle);
                        if ((mpinSetup == null || mpinSetup.isEmpty() || "false".equalsIgnoreCase(mpinSetup))) {
                            // Log.d("mainactivity", "if " + true);
                            replaceFragment(pageIdNormalLogin);
                        } else {
                            //Log.d("mainactivity", "else " + false);
                            replaceFragment(pageIdMpinLogin);
                        }
                    } else {

                        String navigationPageId = mGroupChildPageList.get(groupPosition + "" + 0);
                        Log.e(logTag, "navigationPageId::" + navigationPageId + " groupPosition " + groupPosition);
                        //IDFC 2.5 open link in url if menutype is link- for ex. Baharat bill pay

                        //crash fix-null pointer exception
                        isRequestSuccessfull = false;
                        while (!isRequestSuccessfull) {
                            try {
                                Model model = cxpInstance.getCurrentModel();


                                Renderable obj = model.getItemById(navigationPageId);

                                //Renderable obj = model.getAllPages().get(navigationPageId);
                                /*menuType = obj.getPreference("menuType");
                                linkUrl = obj.getPreference("linkUrl");
                                if (menuType != null) {
                                    if (menuType.equalsIgnoreCase("link")) {
                                        if (linkUrl != null) {
                                            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(linkUrl));
                                            startActivity(browserIntent);
                                            //Log.d(logTag, "isLiabilityPage thru preference:" + renderableObject.getName() + " " + isLiabilityPage);
                                        }
                                    }
                                } else {
                                    replaceFragment(navigationPageId);
                                }*/

                                /** This code is for handling the bharat bill pay link Url the above actual code has been commented **/
                                linkUrl = obj.getPreference("linkUrl");
                                if (linkUrl != null) {
                                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(linkUrl));
                                    startActivity(browserIntent);
                                    //Log.d(logTag, "isLiabilityPage thru preference:" + renderableObject.getName() + " " + isLiabilityPage);
                                } else {
                                    replaceFragment(navigationPageId);
                                }
                                /** This code is for handling the bharat bill pay link Url the above actual code has been commented **/
                                isRequestSuccessfull = true;
                            } catch (Exception e) {
                                e.printStackTrace();
                                // finish();
                                //System.exit(0);

                                isRequestSuccessfull = false;
                                new AlertDialog.Builder(MainActivity.this)
                                        .setTitle("")
                                        .setIcon(R.drawable.appiconcoloured)
                                        .setMessage("Seems like an unstable network. Please try again.")
                                        .setCancelable(false)
                                        .setNegativeButton("Exit", new DialogInterface.OnClickListener() {
                                            @Override
                                            public void onClick(DialogInterface dialogInterface, int i) {
                                                MainActivity.this.finish();
                                                System.exit(0);
                                            }
                                        })
                                        .setPositiveButton("Retry", new DialogInterface.OnClickListener() {
                                            @Override
                                            public void onClick(DialogInterface dialog, int which) {

                                            }
                                        }).create().show();


                            }
                        }
                    }
                }
                return false;
            }

        });
    }


    public void hideSoftKeyboard(View view) {
        InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
    }

    private void setupDrawer() {
        mDrawerToggle = new android.support.v4.app.ActionBarDrawerToggle(this, mDrawerLayout, R.drawable.ic_menu_white, R.string.drawer_open, R.string.drawer_close) {
            //mDrawerToggle = new ActionBarDrawerToggle(this, mDrawerLayout, R.string.drawer_open, R.string.drawer_close) {

            /** Called when a drawer has settled in a completely open state. */

            public void onDrawerOpened(View drawerView) {


                super.onDrawerOpened(drawerView);
                // getSupportActionBar().setTitle(mActivityTitle.toUpperCase());
                invalidateOptionsMenu(); // creates call to onPrepareOptionsMenu()
                //Hides keyboard programatically
                hideSoftKeyboard(drawerView);
            }


            /** Called when a drawer has settled in a completely closed state. */
            public void onDrawerClosed(View view) {
                super.onDrawerClosed(view);
                //getSupportActionBar().setTitle(mActivityTitle.toUpperCase());
                invalidateOptionsMenu(); // creates call to onPrepareOptionsMenu()
            }
        };
        mDrawerToggle.setDrawerIndicatorEnabled(true);
        mDrawerLayout.setDrawerListener(mDrawerToggle);
        mDrawerToggle.setHomeAsUpIndicator(R.drawable.ic_menu_white);
    }

    public int GetPixelFromDips(float pixels) {
        // Get the screen's density scale
        final float scale = getResources().getDisplayMetrics().density;
        // Convert the dps to pixels, based on density scale
        return (int) (pixels * scale + 0.5f);
    }


    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        // Sync the toggle state after onRestoreInstanceState has occurred.
        mDrawerToggle.syncState();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        mDrawerToggle.onConfigurationChanged(newConfig);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.

        getMenuInflater().inflate(R.menu.menu_main, menu);
        versionName = (MenuItem) menu.findItem(R.id.action_versionName);
        return true;
    }


    //Satyam
    private void publishBackEventDromNative() {
        //======Send Data from Native to JS=======
        try {
            JSONObject eventData = new JSONObject();
            eventData.put("text", "Sending data from native");
            if (from.equals("review")) {
                eventData.put("from", "review");
            }
            hideSoftKeyboard(MainActivity.this);
            String eventName = "native.back";
            cxpInstance.publishEvent(eventName, eventData);
            from = "";
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    //Satyam
    private void validateSassionFromNative() {
        //======Call from Native to JS for session validation=======
        try {
            JSONObject eventData = new JSONObject();
            eventData.put("data", "Session Call from native");
            String eventName = "session.call.native";
            cxpInstance.publishEvent(eventName, eventData);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void registerSessionReceiver() {
        sessionReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {

                try {
                    if (lastLoginTime.getVisibility() == View.VISIBLE) {
                        cxpInstance.unregisterObserver(sessionReceiver);
                        stopAsynchronousTask();
                        cxpInstance.clearSession();
                        Log.d("MainActivity", "Session Logout");
                        if ((sessionExpireialog == null || (!sessionExpireialog.isShowing())) && (!(SESSION_ALERT_TIME % SESSION_IDEAL_ALERT_END == 0))) {
                            openSessionExpireDialog();
                            if (preSessionExpireDialog.isShowing()) {
                                preSessionExpireDialog.dismiss();
                            }
                            Log.d("SessionExpire", "Inside registerSessionReceiver()");
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }

            }
        };
        cxpInstance.registerObserver("session.call.invalid", sessionReceiver);
    }

    private void openPreSessionExpireDialog() {
        preSessionExpireDialog = new Dialog(MainActivity.this);
        preSessionExpireDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        preSessionExpireDialog.setContentView(R.layout.dialog);

        //adding text dynamically
        TextView tvTitle = (TextView) preSessionExpireDialog.findViewById(R.id.tvTitle);
        tvTitle.setVisibility(View.GONE);
        TextView txt = (TextView) preSessionExpireDialog.findViewById(R.id.textView);
        txt.setText("Session is about to expire. \nPlease click on continue");
        Log.d("mainactivity", "continue: " + SESSION_ALERT_TIME + " " + SESSION_IDEAL_ALERT_END);
        //ImageView image = (ImageView)preSessionExpireDialog.findViewById(R.id.image);
        //image.setVisibility(View.GONE);
        //Adding button click event
        Button dismissButton = (Button) preSessionExpireDialog.findViewById(R.id.button);
        dismissButton.setText("Continue working");
        dismissButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                preSessionExpireDialog.dismiss();
                //Dismission SMS Timer Dialog for 5235
                if (smsTimerPopp != null) {
                    smsTimerPopp.dismissPopup();
                }
                if (SESSION_ALERT_TIME % SESSION_IDEAL_ALERT_END == 0) {
                    openSessionExpireDialog();
                    if (smsTimerPopp != null) {
                        smsTimerPopp.dismissPopup();
                    }
                    Log.d("SessionExpire", "Inside openPreSessionExpireDialog()");
                }
                SESSION_ALERT_TIME = 0;
            }
        });
        preSessionExpireDialog.show();
        preSessionExpireDialog.setCancelable(false);
    }

    private void openSessionExpireDialog() {
        sessionExpireialog = new Dialog(MainActivity.this);
        sessionExpireialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        sessionExpireialog.setContentView(R.layout.dialog);
        Log.d("mainactivity", "expire: " + SESSION_ALERT_TIME + " " + SESSION_IDEAL_ALERT_END);
        //adding text dynamically
        TextView txt = (TextView) sessionExpireialog.findViewById(R.id.textView);
        //ImageView image = (ImageView) sessionExpireialog.findViewById(R.id.image);

        //adding button click event
        Button dismissButton = (Button) sessionExpireialog.findViewById(R.id.button);
        dismissButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sessionExpireialog.dismiss();
                //Enable Home icon if session will when back button enable
                getSupportActionBar().setHomeAsUpIndicator(R.drawable.ic_menu_white);
                //getSupportActionBar().setHomeAsUpIndicator(null);
                backEnable = "";
                Log.d("SessionExpirePageId", "" + mPageList.get(mPageList.size() - 1));
                if (smsTimerPopp != null) {
                    smsTimerPopp.dismissPopup();
                }
                //2.0 migration
                //replaceFragment(mPageList.get(mPageList.size() - 1));
                //IFSC issue CPU-7016 start
                mDrawerLayout.closeDrawer(GravityCompat.START);
                //IFSC issue CPU-7016 end
                replaceFragment(pageIdLogout);
                SESSION_ALERT_TIME = 0;
                CURRENT_RUNNING_TIMER = 0;
            }
        });
        sessionExpireialog.show();
        sessionExpireialog.setCancelable(false);
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        int eventaction = event.getAction();
        switch (eventaction) {
            case MotionEvent.ACTION_DOWN:
                SESSION_ALERT_TIME = 0;
                break;
            case MotionEvent.ACTION_MOVE:
                SESSION_ALERT_TIME = 0;
                break;
            case MotionEvent.ACTION_UP:
                SESSION_ALERT_TIME = 0;
                break;
            case MotionEvent.ACTION_CANCEL:
                SESSION_ALERT_TIME = 0;
                break;
            default:
                SESSION_ALERT_TIME = 0;
                break;
        }

        return super.dispatchTouchEvent(event);
    }

    @Override
    public void onBackPressed() {
//        moveTaskToBack(true);
//        finish();
        if (mDrawerLayout.isDrawerOpen(GravityCompat.START)) {
            mDrawerLayout.closeDrawer(GravityCompat.START);
        } else {
            try {
                JSONObject eventData = new JSONObject();
                eventData.put("text", "Device Back button Click Initiated");
                String eventName = "GoBackInitiate";
                cxpInstance.publishEvent(eventName, eventData);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
//        return;
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
//        if (keyCode == KeyEvent.KEYCODE_BACK) {
//            //preventing default implementation previous to android.os.Build.VERSION_CODES.ECLAIR
//            return true;
//        }
        return super.onKeyDown(keyCode, event);
    }

    public List<String> getChildList(int groupPosition) {
        NDGroup groupDtl = mExpandableListTitle.get(groupPosition);
        String groupTitle = groupDtl.getTitle();
        return mExpandableListData.get(groupTitle);
    }

    public void setActionBtnFlag(String flag) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("actionBtnFlag", flag);
        editor.commit();
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        /*IDFC 2.5 logout 7 notifications Option to be given on the top right corner*/
        versionName.setEnabled(true);
        if (contextName.getText() != null && contextName.getText() != "Guest") {
            //String action_logout = getResources().getString(R.string.action_logout);
            versionName.setIcon(R.drawable.logout);
            setActionBtnFlag("logout");
        } else {
            //crash fix-null pointer exception
            isRequestSuccessfull = false;
            while (!isRequestSuccessfull) {
                try {
                    if (pageName.equalsIgnoreCase("MPIN Login") || pageName.equalsIgnoreCase("Sign in")) {
                        versionName.setIcon(R.drawable.notifications_actionbar);
                        setActionBtnFlag("notification");
                    } else if (pageName.equalsIgnoreCase("notifications")) {
                        versionName.setIcon(R.drawable.notifications_actionbar);
                        versionName.setEnabled(false);
                        setActionBtnFlag("notification");
                    } else {
                        versionName.setIcon(R.drawable.notifications_white);
                        setActionBtnFlag("notification");
                    }
                    isRequestSuccessfull = true;
                } catch (Exception e) {
                    e.printStackTrace();
                    // finish();
                    // System.exit(0);
                    isRequestSuccessfull = false;
                    new AlertDialog.Builder(MainActivity.this)
                            .setTitle("")
                            .setIcon(R.drawable.appiconcoloured)
                            .setMessage("Seems like an unstable network. Please try again.")
                            .setCancelable(false)
                            .setNegativeButton("Exit", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
                                    MainActivity.this.finish();
                                    System.exit(0);
                                }
                            })
                            .setPositiveButton("Retry", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {

                                }
                            }).create().show();

                }
            }
        }

        return super.onPrepareOptionsMenu(menu);
    }

    private void publishPlusIconEventFromNative() {
        try {
            JSONObject eventData = new JSONObject();
            eventData.put("text", "VIEW-BILLS");
            String eventName = "native-right-button-pressed";
            cxpInstance.publishEvent(eventName, eventData);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void updateGlobalVariable(String parsingData) {
        Log.e(logTag, parsingData);
        //Toast.makeText(MainActivity.this, parsingData, Toast.LENGTH_LONG).show();

        try {
            JSONObject jsonObject = new JSONObject(parsingData);
            JSONObject msgHeader = jsonObject.getJSONObject("msgHeader");

            String hostStatus = msgHeader.getString("hostStatus");

            if (hostStatus.equalsIgnoreCase("S")) {
                JSONObject data = jsonObject.getJSONObject("data");

                String appVersionStatus = data.getString("appVersionStatus");
                globalVariablePlugin.setAppVersionStatus(appVersionStatus);
                globalVariablePlugin.setNewVersionDescription(data.getString("newVersionDescription"));

                globalVariablePlugin.setActiveVersionNo(data.getString("activeVersionNo"));

                globalVariablePlugin.setGracePeriod(data.getString("gracePeriod"));
                globalVariablePlugin.setAppUpgradeMessage(data.getString("appUpgradeMessage"));
                globalVariablePlugin.setAppDownloadLink(data.getString("appDownloadLink"));
                globalVariablePlugin.setDeviceBlacklistFlag(data.getString("deviceBlockFlag"));
                globalVariablePlugin.setBlacklistMessage(data.getString("deviceBLockErrMsg"));
            } else {
                Log.d("SPLASH", "Host status is not success");
            }
        } catch (JSONException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }


            /*String errorFlag = jsonObject.getString("connectionError");
            if(errorFlag.equalsIgnoreCase("true")){
                //dont do anything here
            }else{
                JSONObject msgHeader = jsonObject.getJSONObject("msgHeader");

                String hostStatus = msgHeader.getString("hostStatus");

                if (hostStatus.equalsIgnoreCase("S")) {
                    JSONObject data = jsonObject.getJSONObject("data");

                    String appVersionStatus = data.getString("appVersionStatus");

                    globalVariablePlugin.setAppVersionStatus(appVersionStatus);
                    globalVariablePlugin.setNewVersionDescription(data.getString("newVersionDescription"));
                    globalVariablePlugin.setActiveVersionNo(data.getString("activeVersionNo"));
                    globalVariablePlugin.setGracePeriod(data.getString("gracePeriod"));
                    globalVariablePlugin.setAppUpgradeMessage(data.getString("appUpgradeMessage"));
                    globalVariablePlugin.setAppDownloadLink(data.getString("appDownloadLink"));
                    globalVariablePlugin.setDeviceBlacklistFlag(data.getString("deviceBlockFlag"));
                    globalVariablePlugin.setBlacklistMessage(data.getString("deviceBLockErrMsg"));
                } else {
                    Log.d("SPLASH", "Host status is not success");
                }
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }*/


    }

    //Test
    //Native Popup for Appversion Check and Device Blacklist
    private void deviceAppVersion(String parsingData) {
        //Toast.makeText(MainActivity.this, parsingData, Toast.LENGTH_LONG).show();
        cxpInstance = Backbase.getInstance();
        try {
            JSONObject jsonObject = new JSONObject(parsingData);
            JSONObject msgHeader = jsonObject.getJSONObject("msgHeader");
            String hostStatus = msgHeader.getString("hostStatus");
            if (hostStatus.equalsIgnoreCase("S")) {
                JSONObject data = jsonObject.getJSONObject("data");
                String appVersionStatus = data.getString("appVersionStatus");
                String newVersonDescription = data.getString("newVersionDescription");
                String activeVersionNo = data.getString("activeVersionNo");
                String gracePeriod = data.getString("gracePeriod");
                String appUpgradeMessage = data.getString("appUpgradeMessage");
                String appDownloadLink = data.getString("appDownloadLink");
                String deviceBlockFlag = data.getString("deviceBlockFlag");
                String deviceBLockErrMsg = data.getString("deviceBLockErrMsg");
                //gracePeriod="0";//for testing
                if (deviceBlockFlag.equalsIgnoreCase("true")) {
                    final JSONObject deviceBlackList = new JSONObject();
                    deviceBlackList.put("data", "DVCEBLCKLIST");
                    deviceBlackList.put("message", deviceBLockErrMsg);
                    blacklistFlagGlobal = "true";
                    MainActivity.this.runOnUiThread(new Runnable() { //3.5
                        public void run() { //3.5
                            ViewDialog alert = new ViewDialog(); //existing
                            alert.showDialog(MainActivity.this, deviceBlackList.toString(), MainActivity.this); //existing
                        } //3.5
                    });//3.5
                } else {
                    if ("D".equalsIgnoreCase(appVersionStatus)) {
                        versionUpgradeFlagGlobal = "true";
                        if (!gracePeriod.equalsIgnoreCase("0") || gracePeriod.isEmpty()) {
                            final JSONObject appversionObj = new JSONObject();
                            appversionObj.put("data", "APPUPWTHNGP");
                            appversionObj.put("url", appDownloadLink);
                            String message = "New App version " + activeVersionNo
                                    + " is available for download. Download now to get the best version of this App. ";
                            appversionObj.put("message", message);
                            appversionObj.put("appDetails", newVersonDescription);
                            MainActivity.this.runOnUiThread(new Runnable() { //3.5
                                public void run() { //3.5
                                    ViewDialog alert = new ViewDialog(); //existing
                                    alert.showDialog(MainActivity.this, appversionObj.toString(), MainActivity.this); //existing
                                } //3.5
                            });//3.5
                        } else if (gracePeriod.equalsIgnoreCase("0")) {
                            final JSONObject appversionObj = new JSONObject();
                            appversionObj.put("data", "APPUPBYNDGP");
                            appversionObj.put("url", appDownloadLink);
                            String message = "Your App version is too old! We're better now. Download our New App version  " +
                                    activeVersionNo + " now to continue using the App.";
                            appversionObj.put("message", message);
                            appversionObj.put("appDetails", newVersonDescription);
                            MainActivity.this.runOnUiThread(new Runnable() { //3.5
                                public void run() { //3.5
                                    ViewDialog alert = new ViewDialog(); //existing
                                    alert.showDialog(MainActivity.this, appversionObj.toString(), MainActivity.this); //existing
                                } //3.5
                            });//3.5
                            // cxpInstance.publishEvent("display.1btn.popup", appversionObj);
                        }
                    } else {
                        //Kriti- 2.5 load model if app is of current version

                        // NYAL : Commenting since the login screen is initialised earlier.
                        // loadModelAfterUpgradePopupDismissed();
                    }
                }

                /*globalVariablePlugin.setAppVersionStatus(appVersionStatus);
                globalVariablePlugin.setNewVersionDescription(data.getString("newVersionDescription"));
                globalVariablePlugin.setActiveVersionNo(data.getString("activeVersionNo"));
                globalVariablePlugin.setGracePeriod(data.getString("gracePeriod"));
                globalVariablePlugin.setAppUpgradeMessage(data.getString("appUpgradeMessage"));
                globalVariablePlugin.setAppDownloadLink(data.getString("appDownloadLink"));
                globalVariablePlugin.setDeviceBlacklistFlag(data.getString("deviceBlockFlag"));
                globalVariablePlugin.setBlacklistMessage(data.getString("deviceBLockErrMsg"));*/
            } else {
                Log.d("SPLASH", "Host status is not success");
            }
        } catch (JSONException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //Kriti- 2.5 load model after upgrade pop up is dismissed
    public void loadModelAfterUpgradePopupDismissed() {

        Log.d(logTag, "loadModelAfterUpgradePopupDismissed called");
        mDrawerLayout.setBackgroundResource(0);
        toolbar.setVisibility(View.VISIBLE);

        /**added to fix issue-after killing app dashboard was coming on restart*/
        cxpInstance.clearSession();
        /**added to fix issue-after killing app dashboard was coming on restart*/

        loadModelFrom(ModelSource.SERVER);
    }
    //Kriti- 2.5 load model after upgrade pop up is dismissed


    /**
     * For Finger Print
     * PwC
     */
    private void takeUserPermission(int permissionCode) {
        if (permissionCode == SMS_PERMISSION_CODE) {
            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.RECEIVE_SMS}, permissionCode);
            } else {
                //Permission is already granted
            }
        }

        if (permissionCode == FP_PERMISSOIN_CODE) {
            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.USE_FINGERPRINT) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.USE_FINGERPRINT}, permissionCode);
            } else {
                //Permission is already granted
            }
        }
        List<String> permissionsList = new ArrayList<>();
        if(permissionCode == REQUEST_CODE_ASK_MULTIPLE_PERMISSIONS){
            if (!addPermission(permissionsList, Manifest.permission.READ_PHONE_STATE)){
            }
            if (!addPermission(permissionsList, Manifest.permission.ACCESS_COARSE_LOCATION)){
            }
            if (!addPermission(permissionsList, Manifest.permission.ACCESS_FINE_LOCATION)){
            }
            if(!permissionsList.isEmpty()){
                ActivityCompat.requestPermissions(this, permissionsList.toArray(new String[permissionsList.size()]), REQUEST_CODE_ASK_MULTIPLE_PERMISSIONS);
            }
            else{
               // sendRSAData();
            }
        }

        if (permissionCode == CAMERA_PERMISSOIN_CODE) {
            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                Log.d(logTag, "Camera permission not granted");
                boolean cameraPermissionAsked = globalVariablePlugin.getCameraPermissionAskedFlagLocally();
                if (!cameraPermissionAsked) {
                    Log.d(logTag, "cameraPermissionAsked not set--> first time ");
                    globalVariablePlugin.setCameraPermissionAskedFlagLocally();
                    ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.CAMERA}, permissionCode);
                }
                /*A black screen shall be displayed to the customer
                        instead of the camera input with msg “Unable to access camera”*/
                scanQRcodePopup.qrCodeParserResponseString = "cameraPermissionDenied";
                scanQRcodePopup.showQRCodeScanPopup(false);
            } else {
                //Permission is already granted
                if (currentItemId.equalsIgnoreCase(pageIdScanAndPay)) {
                    scanQRcodePopup.showQRCodeScanPopup(true);
                }
            }
        }
    }

    private boolean addPermission(List<String> permissionsList, String permission) {
        if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
            permissionsList.add(permission);
            if (!ActivityCompat.shouldShowRequestPermissionRationale(this, permission)){
                return false;
            }
        }
        return true;
    }
    @Override
    public void onRequestPermissionsResult(final int requestCode, String[] permissions, int[] grantResults) {

        if(requestCode == REQUEST_CODE_ASK_MULTIPLE_PERMISSIONS){
            if(grantResults.length > 0) {
               // sendRSAData(); //3.6 change
            }
        }

        if (requestCode == SMS_PERMISSION_CODE) {
            //crash fix- array index out of bound exception
            if (grantResults.length > 0) {
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    //Permission granted
                } else if (grantResults[0] == PackageManager.PERMISSION_DENIED) {
                    if (ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this, Manifest.permission.RECEIVE_SMS)) {
                        final android.support.v7.app.AlertDialog.Builder builder = new android.support.v7.app.AlertDialog.Builder(this);
                        builder.setMessage("By allowing this permission, you can complete your transaction faster")
                                .setTitle("Read OTP");
                        builder.setPositiveButton("THIS MAKES SENSE", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.RECEIVE_SMS}, requestCode);
                            }
                        });
                        builder.setNegativeButton("GOT IT! BUT NOT RIGHT NOW", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {

                            }
                        });

                        builder.show();
                    } else {
                        takeUserPermission(FP_PERMISSOIN_CODE);
                    }
                }
            }
        }
        if (requestCode == CAMERA_PERMISSOIN_CODE) {
            if (grantResults.length > 0) {
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    //Permission granted
                    if (currentItemId.equalsIgnoreCase(pageIdScanAndPay)) {
                        scanQRcodePopup.showQRCodeScanPopup(true);
                    }
                } else if (grantResults[0] == PackageManager.PERMISSION_DENIED) {
                    if (ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this, Manifest.permission.CAMERA)) {
                        final android.support.v7.app.AlertDialog.Builder builder = new android.support.v7.app.AlertDialog.Builder(this);
                        builder.setMessage("By allowing this permission, you can scan your QR code ")
                                .setTitle("Scan QR code");
                        builder.setPositiveButton("THIS MAKES SENSE", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.CAMERA}, requestCode);
                            }
                        });
                        builder.setNegativeButton("GOT IT! BUT NOT RIGHT NOW", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {

                            }
                        });

                        builder.show();
                    } else {
                    }
                }
            }
        }
        if (requestCode == FP_PERMISSOIN_CODE) {
            //crash fix- array index out of bound exception
            if (grantResults.length > 0) {
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    //Permission granted
                } else if (grantResults[0] == PackageManager.PERMISSION_DENIED) {
                    if (ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this, Manifest.permission.USE_FINGERPRINT)) {
                        final android.support.v7.app.AlertDialog.Builder builder = new android.support.v7.app.AlertDialog.Builder(this);
                        builder.setMessage("By allowing this permission, you can complete your transaction faster")
                                .setTitle("Read OTP");
                        builder.setPositiveButton("THIS MAKES SENSE", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.USE_FINGERPRINT}, requestCode);
                            }
                        });
                        builder.setNegativeButton("GOT IT! BUT NOT RIGHT NOW", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {

                            }
                        });

                        builder.show();
                    } else {

                    }
                }
            }
        } else {
            try
            {
              if(Digitus.get() != null)
              {
                  Digitus.get().handleResult(requestCode, permissions, grantResults);
              }
            }
            catch(NullPointerException w)
            {
                Log.e("Permission Error", "Null Pointer Exception"+w);
            }

        }
    }

    @Override
    public void onResume() {
        super.onResume();
    }

  /*  @Override
    public void onPause() {
        super.onPause();
        rsaUtil.destroyMobileApiInstance();
    }*/

    private void sendRSAData(){
        String rsaJsonData = rsaUtil.getRSAJSONData(MainActivity.this);
        Log.d("RSAJSON", rsaJsonData);
        JSONObject rsaJsonObject = null;
        try {
            rsaJsonObject = new JSONObject(rsaJsonData);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        cxpInstance.publishEvent(PUBLISH_RSA_SDK, rsaJsonObject);
    }
}