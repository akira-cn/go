define(function(require, exports, module){

var frameCaches = [
    ["res/misc.plist", "res/misc.png"],
    ["res/game_map.plist", "res/game_map.png"],
    ["res/backgrounds.plist", "res/backgrounds.jpg"],
    ["res/board_and_levels.plist", "res/board_and_levels.png"],
];

var CCLoadingScene = require('cqwrap/scenes').LoadingScene,
    BgLayer = require('cqwrap/layers').BgLayer,
    BaseSprite = require('cqwrap/sprites').BaseSprite;

var LoadingScene = CCLoadingScene.extend({
    init: function(locale){
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

        this._super(frameCaches);

        var bgLayer = new BgLayer('res/bg-loading.png');
        this.addChild(bgLayer);

        //progress bar intialize
        var winSize = cc.Director.getInstance().getWinSize();

        var progress_box_texture = cc.SpriteBatchNode.create('res/processor.png').getTexture();
        var progress_box = cc.Sprite.create();
        progress_box.setAnchorPoint(cc.p(0, 0));
        progress_box.setPosition(cc.p((winSize.width - 359) / 2, 87));
        progress_box.setContentSize(cc.size(359, 16));

        var leftSprite = cc.Sprite.createWithTexture(progress_box_texture, cc.rect(0, 0, 10, 16));
        leftSprite.setAnchorPoint(cc.p(0, 0));
        
        var centerSprite = cc.Sprite.createWithTexture(progress_box_texture, cc.rect(10, 0, 0, 16));
        centerSprite.setPosition(cc.p(10, 0));
        centerSprite.setAnchorPoint(cc.p(0, 0));
        
        var rightSprite = cc.Sprite.createWithTexture(progress_box_texture, cc.rect(348, 0, 10, 16));
        rightSprite.setPosition(cc.p(10, 0));
        rightSprite.setAnchorPoint(cc.p(0, 0));
        
        progress_box.addChild(leftSprite);
        progress_box.addChild(centerSprite);
        progress_box.addChild(rightSprite);
        
        this.progressor = [leftSprite, centerSprite, rightSprite];

        this.addChild(progress_box);       
    },
    onProgressChange: function(rate){
        var p = 339 * rate;
        this.progressor[1].setTextureRect(cc.rect(10, 0, p, 16));
        this.progressor[2].setPosition(cc.p(10 + p, 0));   
    },
    onLoaded: function(){
        var MenuScene = require('src/view/menu_scene.js');
        var scene = new MenuScene();
        director.replaceScene(scene);
    } 
});

module.exports = LoadingScene;

});