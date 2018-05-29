package fcm;

/**
 * Created by taralsoni on 05/08/16.
 */
public class NotificationData {

    public static final String TEXT = "text";

    private String imageName;
    private int id; //Identifier of the notification
    private String title;
    private String textMessage;
    private String sound;
    private String navigationProperty;

    public NotificationData(){}

    public NotificationData (String imageName, int id, String title, String textMessage, String sound,String navigationProperty)
    {
        this.imageName = imageName;
        this.id = id;
        this.title = title;
        this.textMessage = textMessage;
        this.sound = sound;
        this.navigationProperty=navigationProperty;
    }

    public String getImageName(){return imageName;}

    public void  setImageName (String imageName){this.imageName = imageName;}

    public int getId(){return id;}

    public void setId(int id){this.id = id;}

    public String getTitle(){return title;}

    public void setTitle(String title){this.title = title;}

    public String getTextMessage(){return textMessage;}

    public void setTextMessage(String textMessage){this.textMessage = textMessage;}

    public String getSound(){return sound;}

    public void setSound(String sound){this.sound = sound;}

    public String getNavigationProperty(){return navigationProperty;}

    public void setNavigationProperty(String sound){this.navigationProperty = navigationProperty;}

}
