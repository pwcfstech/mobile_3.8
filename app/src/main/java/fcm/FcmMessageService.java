package fcm;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.os.Build;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.idfcbank.mobileBanking.MainActivity;
import com.idfcbank.mobileBanking.R;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Random;

/**
 * Created by taralsoni on 05/08/16.
 */
public class FcmMessageService extends FirebaseMessagingService {
    String image;
    String title;
    String text;
    String sound;
    int id = 0;
    String navigationP;


    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {

        Log.d("FCM", "onMessageReceived called");

        image = remoteMessage.getNotification().getIcon();
        title = remoteMessage.getNotification().getTitle();
        text = remoteMessage.getNotification().getBody();
        sound = remoteMessage.getNotification().getSound();
        if (remoteMessage.getData().containsKey("callToAction")) {
            navigationP = remoteMessage.getData().get("callToAction");
        }


        Random rand = new Random();
        id = rand.nextInt(20000 - 1 + 1) + 1;


        //onMessageReceived will be called when ever you receive new message from server.. (app in background and foreground )
        Log.d("FCM", "From: " + remoteMessage.getFrom());


        //This gets displayed to customer in the tray
        if (remoteMessage.getNotification() != null) {
            Log.d("FCM", "Notification Message Body: " + remoteMessage.getNotification().getBody().toString());

            //Need to put in logic to handle notification when app is in foreground and background
            //Cxp cxpInstance = Cxp.getInstance();

        }

        //This gets the custom message that we send from server to handle additional information like call to action, image url etc.
        if (remoteMessage.getData().size() > 0) {
            Log.d("FCM", "Message data payload: " + remoteMessage.getData());
        }

        //This handles custom data and defines logic basis data points that are displayed
        if (remoteMessage.getData().containsKey("post_id") && remoteMessage.getData().containsKey("post_title")) {
            Log.d("Post ID", remoteMessage.getData().get("post_id").toString());
            Log.d("Post Title", remoteMessage.getData().get("post_title").toString());
            // eg. Server Send Structure data:{"post_id":"12345","post_title":"A Blog Post"}
        }

        this.sendNotification(new NotificationData(image, id, title, text, sound, navigationP));
    }

    private void sendNotification(NotificationData notificationData) {

        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT);

        // Log.d("NavigartionP",notificationData.getNavigationProperty());
        //  cxpInstance.publishEvent(navigationP,navigationP);
        if (navigationP != null) {
            intent.putExtra("fcmData", navigationP);
            pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT);
        }

        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        NotificationCompat.Builder notifiBuilder = null;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {

                notifiBuilder = new NotificationCompat.Builder(this);

                notifiBuilder.setStyle(new NotificationCompat.BigTextStyle().bigText(URLDecoder.decode(notificationData.getTextMessage(), "UTF-8")))
                        .setContentTitle(URLDecoder.decode(notificationData.getTitle(), "UTF-8"))
                        .setContentText(URLDecoder.decode(notificationData.getTextMessage(), "UTF-8"))
                        .setAutoCancel(true)
                        .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
                        .setContentIntent(pendingIntent)
                        .setSmallIcon(R.drawable.appicon)
                        .setColor(Color.BLACK);
            } else {
                notifiBuilder = new NotificationCompat.Builder(this)
                        .setSmallIcon(R.drawable.appiconcoloured)
                        .setContentTitle(URLDecoder.decode(notificationData.getTitle(), "UTF-8"))
                        .setStyle(new NotificationCompat.BigTextStyle().bigText(notificationData.getTextMessage()))
                        .setContentText(URLDecoder.decode(notificationData.getTextMessage(), "UTF-8"))
                        .setAutoCancel(true)
                        .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
                        .setContentIntent(pendingIntent);
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        if (notifiBuilder != null) {
            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.notify(notificationData.getId(), notifiBuilder.build());
        } else {
            Log.d("FCM", "No object in notification builder");
        }
    }
}
