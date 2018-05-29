package com.idfcbank.mobileBanking;

import android.graphics.drawable.Drawable;

public class NDGroup {
    String title;

    Drawable icon;

    /**
     * @param title
     * @param icon
     */
    public NDGroup(String title, Drawable icon) {
        super();
        this.title = title;
        this.icon = icon;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title
     *            the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the icon
     */
    public Drawable getIcon() {
        return icon;
    }

    /**
     * @param icon
     *            the icon to set
     */
    public void setIcon(Drawable icon) {
        this.icon = icon;
    }

    @Override
    public String toString() {
        return ""+title;
    }
}
