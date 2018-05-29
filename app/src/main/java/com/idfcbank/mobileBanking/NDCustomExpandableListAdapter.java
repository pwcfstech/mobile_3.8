package com.idfcbank.mobileBanking;


import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseExpandableListAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.HashMap;
import java.util.List;

public class NDCustomExpandableListAdapter extends BaseExpandableListAdapter {

    private List<NDGroup> parentRecord;
    private HashMap<String, List<String>> childRecord;
    private LayoutInflater inflater = null;
    private Activity mContext;

    public NDCustomExpandableListAdapter(Activity context, List<NDGroup> parentList, HashMap<String, List<String>> childList) {
        this.parentRecord = parentList;
        this.childRecord = childList;
        mContext = context;
        inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }

   /* public NDCustomExpandableListAdapter(mainactivity_backup context, List<NDGroup> parentList, HashMap<String, List<String>> childList) {

        this.parentRecord = parentList;
        this.childRecord = childList;
        mContext = context;
        inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }*/

    public NDCustomExpandableListAdapter(MainActivity context, List<NDGroup> parentList) {

        this.parentRecord = parentList;
        mContext = context;
        inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }

    @Override
    public String getChild(int groupPosition, int childPosition) {
        return this.childRecord.get(((NDGroup) getGroup(groupPosition)).getTitle()).get(childPosition);
    }

    @Override
    public long getChildId(int groupPosition, int childPosition) {
        return childPosition;
    }

    @Override
    public View getChildView(int groupPosition, final int childPosition, boolean isLastChild, View convertView, ViewGroup parent) {

        String childConfig = getChild(groupPosition, childPosition);

        ViewHolder holder;
        try {
            if (convertView == null) {
                holder = new ViewHolder();

                convertView = inflater.inflate(R.layout.nd_list_item, null);
                holder.childTitle = (TextView) convertView.findViewById(R.id.expandedListItem);
                convertView.setTag(holder);
            } else {
                holder = (ViewHolder) convertView.getTag();
            }

            holder.childTitle.setText(childConfig);
//            try {
//                Typeface font = Typeface.createFromAsset(mContext.getAssets(), "/backbase/static/features/[BBHOST]/theme-mobile-demo/css/font/font/gotham_book.woff");
//                holder.childTitle.setTypeface(font);
//            } catch (Exception e) {
//                e.printStackTrace();
//            }

        } catch (Exception e) {
        }
        return convertView;
    }

    @Override
    public View getGroupView(int groupPosition, boolean isExpanded, View convertView, ViewGroup parent) {

        NDGroup parentSampleTo = parentRecord.get(groupPosition);

        final ViewHolder holder;
        try {
            if (convertView == null) {
                convertView = inflater.inflate(R.layout.nd_list_group, null);
                holder = new ViewHolder();

                holder.parentTitle = (TextView) convertView.findViewById(R.id.listTitle);
                holder.parentIcon = (ImageView) convertView.findViewById(R.id.groupIcon);
                holder.parentArrow = (ImageView) convertView.findViewById(R.id.parentArrow);

                convertView.setTag(holder);
            } else {
                holder = (ViewHolder) convertView.getTag();
            }

            holder.parentIcon.setImageDrawable(parentSampleTo.getIcon());
            holder.parentTitle.setText(parentSampleTo.getTitle());
//            try {
//                Typeface font = Typeface.createFromAsset(mContext.getAssets(), "/backbase/static/features/[BBHOST]/theme-mobile-demo/css/font/font/gotham_book.woff");
//                holder.parentTitle.setTypeface(font);
//            } catch (Exception e) {
//                e.printStackTrace();
//            }

            holder.parentTitle.setAllCaps(true);

            MainActivity activity = (MainActivity) mContext;
            List<String> childNames = activity.getChildList(groupPosition);
            Log.d("Arrow1111", "Group Position="+groupPosition+ "Child Count="+childNames.size());

            if(isExpanded) {
                if (childNames.size() == 0) {
                    holder.parentArrow.setBackgroundResource(R.drawable.disabled_view);
                }
                else {
                    holder.parentArrow.setBackgroundResource(R.drawable.arrow_up);
                }
                Log.d("Arraow1111", "isExpanded" + childNames.size());

            }
            else {
                Log.d("Arraow1111", "isExpanded"+childNames.size());
                if (childNames.size() == 0) {
                    holder.parentArrow.setBackgroundResource(R.drawable.disabled_view);
                }
                else {
                    holder.parentArrow.setBackgroundResource(R.drawable.arrow_down);
                }
            }

        } catch (Exception e) {
        }
        return convertView;
    }

    public static class ViewHolder {

        private TextView childTitle;
        // Content
        private TextView parentTitle;
        private ImageView parentIcon;
        private ImageView parentArrow;

    }

    @Override
    public int getChildrenCount(int groupPosition) {
        return this.childRecord.get(((NDGroup) getGroup(groupPosition)).getTitle()).size();
    }

    @Override
    public NDGroup getGroup(int groupPosition) {
        return this.parentRecord.get(groupPosition);
    }

    @Override
    public int getGroupCount() {
        return this.parentRecord.size();
    }

    @Override
    public long getGroupId(int groupPosition) {
        return groupPosition;
    }

    @Override
    public boolean hasStableIds() {
        return false;
    }

    @Override
    public boolean isChildSelectable(int groupPosition, int childPosition) {
        return true;
    }

}
