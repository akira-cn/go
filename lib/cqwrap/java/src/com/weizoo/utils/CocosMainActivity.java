package com.weizoo.utils;

import java.lang.reflect.Method;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class CocosMainActivity extends Cocos2dxActivity implements CocosMessageInterface{
	protected void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		//you must call this method on sub-class
		//CocosMessageDelegate.register(this);
	}
	
    public JSONObject open(final JSONObject params){
    	this.runOnUiThread(new Runnable(){
			@Override
			public void run() {
    			Intent intent= new Intent(CocosMainActivity.this, CocosWebActivity.class);        
    			try {
					intent.putExtra("url", params.getString("url"));
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
    			startActivity(intent);
			}			
		});    
    	return null;
    }
    
	@Override
	public void onMessage(String message, String data) {
		Log.d("Log", data);

		if(message.equals("message")){
			try {
				final JSONObject jsonData = new JSONObject(data);
				if(jsonData.has("jsonrpc")){
					JSONObject result = new JSONObject();
					result.put("id", jsonData.getInt("id"));
					result.put("jsonrpc", "2.0");
					try {
						@SuppressWarnings("rawtypes")
						Class[] cargs = new Class[1];
						cargs[0] = JSONObject.class;
						Method method = this.getClass().getMethod(jsonData.getString("method"), cargs);

						JSONObject ret = (JSONObject) method.invoke(this, jsonData.getJSONObject("params"));
						if(null != result){
							result.put("result", ret);
						}
						this.postMessage("message", result.toString());
					} catch (Exception e) {
						try{
							@SuppressWarnings("rawtypes")
							Class[] cargs = new Class[1];
							cargs[0] = JSONObject.class;
							Method method = this.getClass().getMethod(jsonData.getString("method") + "Async", cargs);
							method.invoke(this, jsonData);
						} catch (Exception ex){
							result.put("error", "Method Not Found.");
							e.printStackTrace();
							this.postMessage("message", result.toString());
						}
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
