/**
 * cc base Extends
 */

(function(global){

define(function(require, exports, module){

'use strict';

if(!global.console){
	global.console = {
    log: cc.log,
    error: cc.log,
    trace: cc.log,
    warn: cc.log
	};
}

if(!cc.Assert){
  cc.Assert = function(cond, msg){
    if(!cond){
      throw new Error(msg);
    }
  }
}

var isHtml5 = navigator.userAgent.indexOf('Cocos2dx') < 0;
var isAndroid = navigator.userAgent.indexOf('Android') >= 0;
var isIOS = navigator.userAgent.indexOf('iOS') >= 0;

cc.isHtml5 = isHtml5;
cc.isAndroid = isAndroid;
cc.isIOS = isIOS;
cc.isOpenGL = isIOS || isAndroid || cc.Browser && cc.Browser.supportWebGL;

if(!cc.isOpenGL){
  cc.TransitionCrossFade = cc.TransitionFadeBL = cc.TransitionFadeTR = cc.TransitionFade;
}

var timers = [null];
function setTimer(target, callback, interval, repeat, delay, paused) {
  if(isHtml5){
    setTimeout(function(){
      cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(target, callback, interval / 1000, repeat, delay, paused);
    }, 0);
  }else{
    cc.Director.getInstance().getScheduler().unscheduleCallbackForTarget(target, callback);
    cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(target, callback, interval / 1000, repeat, delay, paused);
  }
  timers.push(callback);
  return timers.length - 1
}
function clearTimer(target, id) {
  var callback = timers[id];
  if (callback != null) {
    cc.Director.getInstance().getScheduler().unscheduleCallbackForTarget(target, callback);
    timers[id] = null;
  }
}
function clearAllTimers(target){
  cc.Director.getInstance().getScheduler().unscheduleAllCallbacksForTarget(target);
}
cc.Node.prototype.setTimeout = function (callback, interval) {
  return setTimer(this||global, callback, interval||0, 0, 0, false);
};
cc.Node.prototype.setInterval = function (callback, interval) {
  return setTimer(this||global, callback, interval||0, cc.REPEAT_FOREVER, 0, false);
};
cc.Node.prototype.clearAllTimers = function(){
  return clearAllTimers(this||global);
};

cc.Node.prototype.clearInterval = cc.Node.prototype.clearTimeout = function (id) {
  return clearTimer(this||global, id);
};

if (global.setTimeout == undefined) {
  global.setTimeout = cc.Node.prototype.setTimeout;
  global.setInterval = cc.Node.prototype.setInterval;
  global.clearTimeout = cc.Node.prototype.clearTimeout;
  global.clearInterval = cc.Node.prototype.clearInterval
}

//修复cc.MenuItemSprite.create(sprite, sprite)在浏览器下重复使用报错的问题
if (isHtml5) {
  var create = cc.MenuItemSprite.create;
  cc.MenuItemSprite.create = function(){
    var sprite = arguments[0];
    var args = [].slice.call(arguments).map(function(item, i){
      if (i && item === sprite) {
        item = null;
      };
      return item;
    });
    return create.apply(create, args);
  }
}

cc.mixin = function(des, src, mixer) {
	mixer = mixer || function(d, s){
		if(typeof d === 'undefined'){
			return s;
		}
	}
	
	if(mixer == true){
		mixer = function(d, s){return s};
	} 		

	for (var i in src) {
		var v = mixer(des[i], src[i], i, des, src);
		if(typeof v !== 'undefined'){
			des[i] = v;
		}
	}

	return des;
};

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
cc.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
cc.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
cc.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
cc.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
cc.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
cc.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
cc.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
cc.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
cc.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
cc.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
cc.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
cc.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
cc.isFunction = isFunction;

Object.defineProperty(global, 'director', {
  get: function(){
    return cc.Director.getInstance();
  },
  enumerable: true,
  configurable: false,
});

Object.defineProperty(global, 'scene', {
  get: function(){
    return cc.Director.getInstance().getRunningScene();
  },     
  enumerable: true,
  configurable: false, 
});

cc.random = function(n, m){
  if(typeof n === 'number'){
    m = m || 0;
    return 0 | (n + Math.random() * (m - n));
  }
  else if(n instanceof Array){
    var len = n.length;
    if(m == null){
      return n[0 | Math.random() * (len)];
    }else{
      var ret = cc.arrayShuffle(n.slice(0));
      return ret.slice(0, m);
    }   
  }
  else{
    return Math.random();
  }
}

cc.tmpl = function(str, data, format){      
  str = str.replace(/\{([^\{\}]*)\}/g, function(sub, expr){
    if(!expr) return '';
      try{
        var r = (new Function("data", "with(data){return (" + expr + ");}"))(data);
        return format? format(r, expr) : r;
      }catch(ex){
        return sub;
      }
    }
  );

  return str;
};

cc.arrayShuffle = function(arr){
  for (var i = arr.length - 1; i > 0; i--) {
    var j = 0|(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }  
  return arr;
}

cc.strToArray = function(value){
  return value.trim().split(/\s*,\s*/).map(function(o){return parseInt(o)});
}

function hex_color_to_cxb(str){
  if(typeof str !== 'string'){
    return str;
  }
  var c3b, c4b, c4f;

  str = str.trim();
  var values = [0, 0, 0];
  if(str[0] === '#'){
    str = str.slice(1);
    if(str.length === 3){
      str = str.replace(/(\w)/g, '$1$1');
    }
    values = str.match(/\w\w/g).map(function(o){
      return parseInt(o, 16);
    });
    c3b = cc.c3b.apply(null, values);
    c4b = cc.c4b.apply(null, values.concat([255]));
    c4f = cc.c4f(c4b.r/255, c4b.g/255, c4b.b/255, c4b.a/255);
    return {c3b:c3b, c4b:c4b, c4f:c4f};
  }else if(str.slice(0, 4) === 'rgb('){
    str = str.slice(4, -1);
    values = cc.strToArray(str);
    c3b = cc.c3b.apply(null, values);
    c4b = cc.c4b.apply(null, values.concat([255]));
    c4f = cc.c4f(c4b.r/255, c4b.g/255, c4b.b/255, c4b.a/255);
    return {c3b:c3b, c4b:c4b, c4f:c4f};
  }else if(str.slice(0, 5) === 'rgba('){
    str = str.slice(5, -1);
    values = cc.strToArray(str);
    c3b = cc.c3b.apply(null, values.slice(-1));
    c4b = cc.c4b.apply(null, values);
    c4f = cc.c4f(c4b.r/255, c4b.g/255, c4b.b/255, c4b.a/255);
    return {c3b:c3b, c4b:c4b, c4f:c4f};    
  }else if(isFunction(cc[str])){
    var ret = cc[str]();   //cc.red(), etc.
    cc.Assert(ret instanceof cc.Color3B);
    if(ret instanceof cc.Color3B){
      return cc.color(ret);
    }
  }
}

cc.color = function(r, g, b, a){
  if(typeof(r) === 'string'){
    return hex_color_to_cxb(r);
  }else if(r instanceof cc.Color3B){
    return cc.color(r.r, r.g, r.b); 
  }else if(r instanceof cc.Color4B){
    return cc.color(r.r, r.g, r.b, r.a);
  }else if(r instanceof cc.Color4F){
    return cc.color(255 * r.r, 255 * r.g, 255 * r.b, 255 * r.a);
  }else{
    a = a || 255;
    var c3b, c4b, c4f;
    c3b = cc.c3b(r, g, b);
    c4b = cc.c4b(r, g, b, a);
    c4f = cc.c4f(c4b.r/255, c4b.g/255, c4b.b/255, c4b.a/255);
    return {c3b:c3b, c4b:c4b, c4f:c4f}; 
  }
}

if(!isHtml5){
  cc.Director.prototype.pauseAllActions = function(){
    var ret = [];
    var actionManager = director.getActionManager();
    var _pausedTargets = director.getActionManager().pauseAllRunningActions();
    var count = _pausedTargets.count();
    for(var i = 0; i < count; i++){
      var obj = _pausedTargets.anyObject();
      ret.push(obj);
      _pausedTargets.removeObject(obj);
    }
    return ret;
  }
  cc.Director.prototype.resumeActions = function(actions){
    var actionManager = director.getActionManager();
    for(var i = 0; i < actions.length; i++){
      actionManager.resumeTarget(actions[i]);
    }    
  }
  
  if(cc.RESOLUTION_POLICY.EXACT_FIT == null){
    cc.RESOLUTION_POLICY.EXACT_FIT = cc.RESOLUTION_POLICY.EXACTFIT;
    cc.RESOLUTION_POLICY.NO_BORDER = cc.RESOLUTION_POLICY.NOBORDER;
    cc.RESOLUTION_POLICY.FIXED_HEIGHT = cc.RESOLUTION_POLICY.HEIGHT;
    cc.RESOLUTION_POLICY.FIXED_WIDTH = cc.RESOLUTION_POLICY.WIDTH;
  }
}else{
  cc.Director.prototype.pauseAllActions = function(){
    var actionManager = director.getActionManager();
    return actionManager.pauseAllRunningActions();
  }
  cc.Director.prototype.resumeActions = function(actions){
    var actionManager = director.getActionManager();
    return actionManager.resumeTargets(actions);
  }
  //修复 director.end
  cc.Director.prototype.end = function(){}
}

cc.showMessage = function(container, msg, width, height){
  width = width || 250;
  height = height || 80;
  var mask = cc.LayerColor.create(cc.c4b(0, 0, 0, 192));
  var winSize = director.getWinSize();

  mask.setContentSize(width, height);
  mask.setPosition(winSize.width / 2 - width / 2, winSize.height / 2 - height / 2);
  container.addChild(mask, 9999);

  var loadingText = cc.createSprite('@' + msg, {
      xy: [width / 2, height / 2],
      fontSize: 26
  });
  mask.addChild(loadingText);
  return mask;
}

cc.getSpriteFrame = function(key){
    var cache = cc.SpriteFrameCache.getInstance();
    var frame = cache.getSpriteFrame(key);

    if(!frame){
        var texture = cc.TextureCache.getInstance().addImage(key);
        if(texture){
          var size = texture.getContentSize();
          var frame = new cc.SpriteFrame();
          frame.initWithTexture(texture, cc.rect(0, 0, size.width, size.height));
        }
    }

    return frame;
}

});

})(this);