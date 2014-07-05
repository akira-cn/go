define(function(require, exports, module){

'use strict';

var when = require('cqwrap/when');

var id = 0,
    callbacks = [];

if(!global.native){
    var _native = {postMessage: function(data){
        //cc.log('native interface not found, ignored.');
        var msg = JSON.parse(data);
        msg.error = 'native interface not found, ignored.'
        native.onmessage(JSON.stringify(msg));
    }};

    Object.defineProperty(global, 'native', {
      get: function(){
        return _native;
      },
      enumerable: true,
      configurable: false,
    });
}

Object.defineProperty(native, 'onmessage', {
    value: function(data){
        //try{
        var data = JSON.parse(data);
        if(data && data.jsonrpc == "2.0"){
            var callback = callbacks[data.id];
            if(callback){
                callback(data);
            }
        }
        //{protocal, code}
        else if(data && data.protocal == "weizoo"){
            var code = decodeURIComponent(data.code);
            if(code){
                (new Function(code))();
            }
        }
        //}catch(ex){
        //  cc.log('error parse json string:' + data);  
        //}        
    },
    enumerable: false,
    writable: false,
    configurable: false,
});

native.call = function(method, params){
    var deferred = when.defer();

    params = params || {};

    var data = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: id++,
    };

    callbacks[data.id] = function(data){
        if(data.error){
            deferred.reject(data.error);
        }else{
            deferred.resolve(data.result);
        }
    }

    //var acts = director.pauseAllActions();

    //setTimeout(function(){
        //解决某些手机上切换activity会闪动画面的问题
        native.postMessage(JSON.stringify(data));
        //if(acts && acts.length){
        //    director.resumeActions(acts);
        //}
    //}, 100);
    
    return deferred.promise;
};

if(cc.isAndroid){
    global.open = function(url){
        if(!/^(http(s)?|file):\/\//.test(url)){
            url = 'file:///android_asset/' + url;
        }
        native.call('open', {url: url});
    },
    global.close = function(url){
        //TODO
    } 
}

module.exports = native;
});
    