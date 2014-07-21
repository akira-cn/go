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
package com.weizoo.go;

import java.util.HashMap;
import java.util.Iterator;

import org.json.JSONException;
import org.json.JSONObject;

import cn.cmgame.billing.api.BillingResult;
import cn.cmgame.billing.api.GameInterface;
import cn.cmgame.billing.api.GameInterface.GameExitCallback;

import com.umeng.analytics.game.UMGameAgent;
import com.weizoo.utils.CocosMainActivity;
import com.weizoo.utils.CocosMessageDelegate;
import com.weizoo.utils.CocosMessageInterface;

import android.os.Bundle;
import android.view.WindowManager;

public class HappyGo extends CocosMainActivity implements CocosMessageInterface {
	private static JSONObject JSONParams = null;
	private GameInterface.IPayCallback payCallback;
	
	protected void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		getWindow().setFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,  
				WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

	    payCallback = new GameInterface.IPayCallback() {
	        @Override
	        public void onResult(int resultCode, String billingIndex, Object obj) {
	          String result = "";
	          JSONObject ret = new JSONObject();
	          switch (resultCode) {
	            case BillingResult.SUCCESS:
	            	result = "购买道具：[" + billingIndex + "] 成功！";
	              	try {
						ret.put("message", result);
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
	              	break;
	            case BillingResult.FAILED:
	            	result = "购买道具：[" + billingIndex + "] 失败！";
	            	try {
	            		ret.put("errno", 304);
	            	} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
	            	break;
	            default:
	            	result = "购买道具：[" + billingIndex + "] 取消！";
	            	try {
	            		ret.put("errno", 101);
	            	} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}	            	
	            	break;
	          }
	          try {
				  JSONParams.put("result", ret);
			  } catch (JSONException e) {
				  // TODO Auto-generated catch block
				  e.printStackTrace();
			  }
	          
	          HappyGo.this.postMessage("message", JSONParams.toString());
	        }
	    };		
		
		GameInterface.initializeApp(this);
		CocosMessageDelegate.register(this);
		
		UMGameAgent.init(this);
	}
	
	@Override
	public void onPause(){
		super.onPause();
		UMGameAgent.onPause(this);
	}
	
	@Override
	public void onResume(){
		super.onResume();
		UMGameAgent.onResume(this);
	}
	
	
    public JSONObject logPageStart(final JSONObject params){
    	try {
			String pageName = params.getString("page");
			UMGameAgent.onPageStart(pageName);
			//Log.d("cocos2d-x debug info", "enter " + pageName);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	return null;
    }
    
    public JSONObject logPageEnd(final JSONObject params){
    	try {
			String pageName = params.getString("page");
			UMGameAgent.onPageEnd(pageName);
			//Log.d("cocos2d-x debug info", "leave " + pageName);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	return null;
    }

	public JSONObject logEvent(final JSONObject params){
		String event;
		JSONObject message;
		try {
			HashMap<String,String> map = new HashMap<String,String>();
			
			event = params.getString("event");
			message = params.getJSONObject("message");
			Iterator<?> it = message.keys(); 
			
			while (it.hasNext()) {  
                String key = (String) it.next();  
                String value = message.getString(key);  
    			map.put(key, value);
            }   	
			
			UMGameAgent.onEvent(getContext(), event, map);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	public JSONObject logLevelState(final JSONObject params){
		String level;
		String state;
		try {
			state = params.getString("state");
			level = params.getString("level");
			if(state.equals("start")){
				UMGameAgent.startLevel(level);
			}else if(state.equals("finish")){
				UMGameAgent.finishLevel(level);
			}else if(state.equals("fail")){
				UMGameAgent.failLevel(level);
			}
			//Log.d("cocos2d-x debug info", "level:" + level + "," + state);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return null;
	}
	
	//用户付费的记录
	public JSONObject logPay(final JSONObject params){
		double money; 
		String item;
		int number;
		double price;
		int source;
		
		try {
			money = params.getDouble("money");
			item = params.getString("item");
			number = params.getInt("number");
			price = params.getDouble("price");
			source = params.getInt("source");
			UMGameAgent.pay(money, item, number, price, source);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return null;
	}
	
	//用户消费金币的记录
	public JSONObject logBuy(final JSONObject params){
		String item;
		int number;
		double price;
		
		try {
			item = params.getString("item");
			number = params.getInt("number");
			price = params.getDouble("price");
			UMGameAgent.buy(item, number, price);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return null;
	}
	
	//用户使用道具的记录
	public JSONObject logUse(final JSONObject params){
		String item;
		int number;
		double price;
		
		try {
			item = params.getString("item");
			number = params.getInt("number");
			price = params.getDouble("price");
			UMGameAgent.use(item, number, price);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return null;		
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

    
	public JSONObject getSoundEnabled(JSONObject params){
		JSONObject ret = new JSONObject();
		try {
			ret.put("enabled", GameInterface.isMusicEnabled());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return ret;
	}
	
	public boolean exitGameAsync(final JSONObject message){
		
		GameInterface.exit(HappyGo.this, new GameExitCallback() {
			@Override
			public void onConfirmExit() {
				//确认退出逻辑
				try {
					message.put("result", "ok");
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				HappyGo.this.postMessage("message", message.toString());
			}
			@Override
			public void onCancelExit() {
				//取消退出逻辑
				//ignore
			}
		});
		
		return true;
	}

	public JSONObject showMoreGames(JSONObject params){
		GameInterface.viewMoreGames(this);
		return null;
	}
	
	/**
	 * 支付
	 * 
	 * @param params
	 * @return
	 */
	public boolean payAsync(final JSONObject message) {
		JSONParams = message;
		
		this.runOnUiThread(new Runnable(){

			@Override
			public void run() {
				String billingIndex;
				try {
					billingIndex = "00" + message.getJSONObject("params").getString("pointNumber");
					GameInterface.doBilling(HappyGo.this,true, true, billingIndex, null, payCallback);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		
		});
		return true;
	}
}
