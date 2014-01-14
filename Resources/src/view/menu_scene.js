define(function(require, exports, module){

var PlayScene = require('src/view/play_scene.js');
var Button = require('cqwrap/buttons.js').Button;
var BgLayer = require('cqwrap/layers.js').BgLayer,
    GameLayer = require('cqwrap/layers.js').GameLayer;

var MainLayer = GameLayer.extend({

    init: function(){
        this._super();

        var logoSprite = cc.Sprite.createWithSpriteFrameName('logo.png');
        logoSprite.setAnchorPoint(cc.p(0, 1.0));
        logoSprite.setPosition(cc.p(0, 800));
        this.addChild(logoSprite);

        var easyButton = Button.create('button-easy.png',
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('easy');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);            
            });
        easyButton.setAnchorPoint(cc.p(0.5, 0));
        easyButton.setPosition(240, 355); 
        this.addChild(easyButton);

        var normalButton = Button.create('button-normal.png',
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('normal');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);                
            });
        normalButton.setAnchorPoint(cc.p(0.5, 0));
        normalButton.setPosition(240, 230);
        this.addChild(normalButton);


        var hardButton = Button.create('button-hard.png', 
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('hard');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);
            });
        hardButton.setAnchorPoint(cc.p(0.5, 0));
        hardButton.setPosition(240, 105);
        this.addChild(hardButton);

        var gameSettings = sys.localStorage.getItem('gameSettings');
        if(gameSettings){
            gameSettings = JSON.parse(gameSettings);
        }else{
            gameSettings = {sound: 1};
        }

        var sound_btn_pic = ['btn_sound_disabled.png', 'btn_sound.png']

        var soundButton = Button.create(sound_btn_pic[gameSettings.sound], 
            function(touch, item){
                Audio.playEffect('audio/btnclick.ogg');
                gameSettings.sound = !gameSettings.sound - 0;
                Audio.setEnable(gameSettings.sound);
                item.setContentSprite(cc.Sprite.createWithSpriteFrameName(sound_btn_pic[gameSettings.sound]));
                sys.localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
            });  

        Audio.setEnable(gameSettings.sound);

        soundButton.setAnchorPoint(cc.p(0, 0));
        soundButton.setPosition(400, 40);
        this.addChild(soundButton);

        if(this.setKeypadEnabled){   
            this.setKeypadEnabled(true);
        }
        
        return true;  
    },

    backClicked: function(){
        director.end();
        //director.popScene();
    }
});

var BaseScene = require('cqwrap/scenes.js').BaseScene;

var MenuScene = BaseScene.extend({
    init:function () {
        this._super();
        var bg = new BgLayer('bg-menu.png');
        this.addChild(bg);

        var main = new MainLayer();
        this.addChild(main);
    }
});

module.exports = MenuScene;

});