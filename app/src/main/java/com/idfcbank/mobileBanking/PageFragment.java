package com.idfcbank.mobileBanking;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.backbase.android.Backbase;
import com.backbase.android.core.utils.BBConstants;
import com.backbase.android.model.Model;
import com.backbase.android.model.Renderable;
import com.backbase.android.rendering.BBRenderer;
import com.backbase.android.rendering.Renderer;
import com.backbase.android.rendering.inner.BBItemRenderer;
import com.backbase.android.rendering.inner.BBRendererFactory;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * PageFragment encapsulating a page for use in the tab layout
 */
public class PageFragment extends Fragment {

    private final String logTag = PageFragment.class.getSimpleName();
    private Renderer renderer;
    private String mTitle;
    Activity mActivity;
    Backbase cxpInstance;

    /**
     * Create a new page fragment instance for pageId
     *
     * @param pageId id of the page to be created
     */
    static public PageFragment newInstance(String pageId) {
        PageFragment fragment = new PageFragment();
        Bundle args = new Bundle(1);
        args.putString("pageId", pageId);
        fragment.setArguments(args);
        return fragment;
    }

    /**
     * Create the view for the fragment by inflating the page layout. The layout file has to provide
     * a framelayout whose id is to be used as insertion point for the item renderer. The renderable
     * item is then requested from the model and the mRenderer.start method executed to insert the
     * item renderer into the layout.
     */
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {

        Model currentModel = cxpInstance.getInstance().getCurrentModel();
        View layout = inflater.inflate(R.layout.page_fragment, container, false);
        System.out.println("Inside Page Fragment");
        String pageId = getArguments().getString("pageId");

        //crash fix-null pointer exception
        try {
            Renderable item = currentModel.getAllPages().get(pageId);
            if (item != null) {
                if (item.getPreference("background") != null) {
                    String bg = item.getPreference("background").toLowerCase();
                    if (bg != null) {
                        Resources resources = getActivity().getResources();
                        int identifier = resources.getIdentifier(bg, "drawable", getActivity().getPackageName());
                        if (identifier != 0) {
                            container.setBackgroundResource(identifier);
                        }
                    }
                }

                mTitle = item.getPreference("title");
                if (mTitle.equalsIgnoreCase("Loan Apply Now")) {
                    mTitle = "Apply Now";
                }
                if (mTitle.equalsIgnoreCase("loans")) {
                    mTitle = "Apply Now";
                }
                renderer = new BBRenderer(getActivity()).getItemRenderer(getActivity(), item);
                Log.d("pagefrag", "mTitle: " + mTitle);
                Log.d("pagefrag", "item chid size: " + item.getChildren().size());
                if (item.getChildren().size() > 0)
                    renderer.start(item.getChildren().get(0), (ViewGroup) layout.findViewById(R.id.insert_point));


            /*mVisa Added by Kriti - to change page title in mVisa flow*/
                cxpInstance = cxpInstance.getInstance();
                cxpInstance.initializeXwalk(mActivity);


            
            /*mVisa Added by mithun - to change page title after login*/
                cxpInstance.registerObserver("mvisa.header.title", new BroadcastReceiver() {
                    @Override
                    public void onReceive(final Context context, Intent intent) {
                        Log.d(logTag, "change title observer registered");
                        String title = "";
                        String data = intent.getExtras().getString(BBConstants.EVENTBUS_EVTDATA);
                        JSONObject jsonObj = null;
                        try {
                            jsonObj = new JSONObject(data);
                            title = jsonObj.getString("data");
                            Log.d(logTag, title);
                            ((AppCompatActivity) mActivity).getSupportActionBar().setTitle(title);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }

                    }
                });
           /*mVisa Added by mithun - to change page title after login*/
            }
        } catch (Exception e) {
            e.printStackTrace();
            getActivity().finish();
            System.exit(0);
        }
        return layout;
    }


    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof Activity) {
            mActivity = (Activity) context;
        }
    }

    /**
     * Make sure to call Cxp renderer lifecycle function in onResume method
     */
    @Override
    public void onResume() {
        super.onResume();
        //set correct title to the action bar when fragment is (re)shown
        ((AppCompatActivity) getActivity()).getSupportActionBar().setTitle(mTitle);
        if (renderer != null) {
            renderer.resume();
        }
    }

    /**
     * Make sure to call Cxp renderer lifecycle function in onPause method
     */
    @Override
    public void onPause() {
        super.onPause();
        if (renderer != null) {
            renderer.pause();
        }
    }

    /**
     * Make sure to call Cxp renderer lifecycle function in onDestroyView method
     */
    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (renderer != null) {
            renderer.destroy();
        }
    }


}