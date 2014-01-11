/****************************************************************************
Copyright (c) 2010-2012 cocos2d-x.org

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.weizoo.game.go.HappyGo;

import java.lang.reflect.Method;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.ads.*;
import com.umeng.analytics.MobclickAgent;
import com.weizoo.utils.CocosMessageDelegate;
import com.weizoo.utils.CocosMessageInterface;

import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;

public class HappyGo extends Cocos2dxActivity implements CocosMessageInterface {
	private AdView adView;
	private boolean yunTest = false;
	protected void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		getWindow().setFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,  
				WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
		
		if(!this.yunTest){
			//don't show ad view when testing
			initAd();
		}
		
		//MobclickAgent.onError(this);
		CocosMessageDelegate.register(this);
	}
	
	@Override
	public void onPause(){
		super.onPause();
		MobclickAgent.onPause(this);
	}
	
	@Override
	public void onResume(){
		super.onResume();
		MobclickAgent.onResume(this);
	}
	
    static {
        System.loadLibrary("cocos2djs");
    }
    
    public JSONObject getLocale(JSONObject params){
    	JSONObject ret = new JSONObject();
    	String country = getResources().getConfiguration().locale.getCountry();
    	
    	try{
    		ret.put("country", country);
    	}catch(JSONException e){
    		e.printStackTrace();
    	}
    	return ret;
    }
    
    public JSONObject showAd(JSONObject params){
    	if(!this.yunTest){
			this.runOnUiThread(new Runnable(){
				public void run(){
					adView.setVisibility(AdView.VISIBLE);
					adView.loadAd(new AdRequest());
				}
			});
    	}
    	
    	return null;
    }
    
    public JSONObject hideAd(JSONObject params){
    	if(!this.yunTest){
			this.runOnUiThread(new Runnable(){
				public void run(){
					adView.setVisibility(AdView.GONE);
					adView.loadAd(new AdRequest());
				}
			});
    	}
    	
    	return null;    	
    }
    
    private void initAd(){
    	try{
    		LinearLayout layout = new LinearLayout(this);
    		layout.setOrientation(LinearLayout.VERTICAL);
    		addContentView(layout, new LayoutParams(LayoutParams.MATCH_PARENT,LayoutParams.MATCH_PARENT));

            // Create the adView.
            adView = new AdView(this, AdSize.SMART_BANNER, "a152c6a39379a40");

            // Add the adView to it.
            layout.addView(adView); 

            // Initiate a generic request.
            AdRequest adRequest = new AdRequest();
            adRequest.addTestDevice("355296050198170");
            // Load the adView with the ad request.
            adView.loadAd(adRequest);
        }catch (Exception e) {
        	e.printStackTrace();
        }    	
    }
    
	@Override
	public void onMessage(String message, String data) {
		Log.d("Log", message);
		if(message.equals("message")){
			try {
				JSONObject jsonData = new JSONObject(data);
				if(jsonData.has("jsonrpc")){
					JSONObject result = new JSONObject();
					result.put("id", jsonData.getInt("id"));
					result.put("jsonrpc", "2.0");
					try {
						@SuppressWarnings("rawtypes")
						Class[] cargs = new Class[1];
						cargs[0] = JSONObject.class;
						Method method = this.getClass().getMethod(jsonData.getString("method"), cargs);
						result.put("result", method.invoke(this, jsonData.getJSONObject("params")));
						this.postMessage("message", result.toString());
					} catch (Exception e) {
						result.put("error", e.getMessage());
						e.printStackTrace();
					}		
				}
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} 
		}
	}

	@Override
	public void postMessage(String message, String data) {
		CocosMessageDelegate.postMessage(message, data);
	}
}
