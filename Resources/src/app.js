define(function(require, exports, module){
    //preload cqwrap file
    require('cqwrap/index.js'); 

    var LoadingScene = require('src/view/loading_scene.js');

    native.call('getLocale').then(function(res){
        var loadingScene = new LoadingScene(res);
        director.runWithScene(loadingScene);
    }).otherwise(function(){
        var loadingScene = new LoadingScene({country: 'EN'});
        director.runWithScene(loadingScene);    
    }).otherwise(function(err){
        cc.log(err);
    });

});

