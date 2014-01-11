define(function(require, exports, module){

var frameCaches = [
    ["res/misc.plist", "res/misc.png"],
    ["res/game_map.plist", "res/game_map.png"],
    ["res/backgrounds.plist", "res/backgrounds.jpg"],
    ["res/board_and_levels.plist", "res/board_and_levels.png"],
];

function loadFrames(cache, frames, callback){
    callback(frames);

    if(frames.length <= 0){
        return;
    }
    cache.addSpriteFrames(frames[0][0], frames[0][1]);
    
    setTimeout(function(){
        loadFrames(cache, frames.slice(1), callback);
    }, 100);
}

var MainLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    init: function(){
        this._super();

        var bg = cc.Sprite.create('res/bg-loading.png');
        var winSize = cc.Director.getInstance().getWinSize();
        bg.setPosition(cc.p(winSize.width/2, winSize.height/2));        
        this.addChild(bg);

        this.initProcessBar();

        var self = this;

        setTimeout(function(){
            var cache = cc.SpriteFrameCache.getInstance();
            loadFrames(cache, frameCaches, function(frames){
                self.setProcessor(1 - frames.length / frameCaches.length);
                if(frames.length <= 0){
                    setTimeout(function(){
                        var MenuScene = require('src/view/menu_scene.js');
                        var scene = new MenuScene();
                        director.replaceScene(scene); 
                    }, 200); 
                }
            });                      
        }, 100);

        if(this.setKeypadEnabled){   
            this.setKeypadEnabled(true);
        }
        
        return true;  
    },
    setProcessor: function(rate){
        //cc.log(rate);
        var p = 339 * rate;
        this.processor[1].setTextureRect(cc.rect(10, 0, p, 16));
        this.processor[2].setPosition(cc.p(10 + p, 0));   
    },
    initProcessBar: function(){
        var winSize = cc.Director.getInstance().getWinSize();

        var m_processor_texture = cc.SpriteBatchNode.create('res/processor.png').getTexture();
        //m_processor = cc.Sprite.create('res/processor.png');
        var m_processor = cc.Sprite.create();
        m_processor.setAnchorPoint(cc.p(0, 0));
        m_processor.setPosition(cc.p((winSize.width - 359) / 2, 86));
        m_processor.setContentSize(cc.size(359, 16));
        
        var leftSprite = cc.Sprite.createWithTexture(m_processor_texture, cc.rect(0, 0, 10, 16));
        leftSprite.setAnchorPoint(cc.p(0, 0));
        
        var centerSprite = cc.Sprite.createWithTexture(m_processor_texture, cc.rect(10, 0, 0, 16));
        centerSprite.setPosition(cc.p(10, 0));
        centerSprite.setAnchorPoint(cc.p(0, 0));
        
        var rightSprite = cc.Sprite.createWithTexture(m_processor_texture, cc.rect(348, 0, 10, 16));
        rightSprite.setPosition(cc.p(10, 0));
        rightSprite.setAnchorPoint(cc.p(0, 0));
        
        m_processor.addChild(leftSprite);
        m_processor.addChild(centerSprite);
        m_processor.addChild(rightSprite);
        
        this.processor = [leftSprite, centerSprite, rightSprite];

        this.addChild(m_processor);       
    },

    backClicked: function(){
        cc.Director.getInstance().end();
        //director.popScene();
    }
});

var LoadingScene = cc.Scene.extend({
    ctor:function(locale) {
        //cc.log(locale.country);
        var country = locale.country;

        global.WeiqiData = global.WeiqiData || {};

        if(country == 'CN' || country == 'TW'){
            WeiqiData.easy = require('src/data/zh_cn/easy.js');
            WeiqiData.normal = require('src/data/zh_cn/normal.js');
            WeiqiData.hard = require('src/data/zh_cn/hard.js');
            frameCaches.push(["res/buttons-c.plist", "res/buttons-c.png"]);
        }else{
            WeiqiData.easy = require('src/data/en_us/easy.js');
            WeiqiData.normal = require('src/data/en_us/normal.js');
            WeiqiData.hard = require('src/data/en_us/hard.js');
            frameCaches.push(["res/buttons.plist", "res/buttons.png"]);
        }

        this._super();
        cc.associateWithNative( this, cc.Scene );
    },

    onEnter:function () {
        this._super();

        var main = new MainLayer();
        this.addChild(main);
        main.init();
    }
});

module.exports = LoadingScene;
});