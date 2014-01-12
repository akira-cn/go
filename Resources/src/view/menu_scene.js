define(function(require, exports, module){

var PlayScene = require('src/view/play_scene.js');

var MainLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    init: function(){
        var logoSprite = cc.Sprite.createWithSpriteFrameName('logo.png');
        logoSprite.setAnchorPoint(cc.p(0, 1.0));
        logoSprite.setPosition(cc.p(0, 800));
        this.addChild(logoSprite);

        var easyButton = MenuButton.create('button-easy.png', this, function(){
            var playScene = new PlayScene('easy');
            var scene = cc.TransitionFade.create(0.8, playScene);
            director.pushScene(scene);
        });

        var normalButton = MenuButton.create('button-normal.png', this, function(){
            var playScene = new PlayScene('normal');
            var scene = cc.TransitionFade.create(0.8, playScene);
            director.pushScene(scene);
        });

        var hardButton = MenuButton.create('button-hard.png', this, function(){
            var playScene = new PlayScene('hard');
            var scene = cc.TransitionFade.create(0.8, playScene);
            director.pushScene(scene);
        });

        var gameSettings = sys.localStorage.getItem('gameSettings');
        if(gameSettings){
            gameSettings = JSON.parse(gameSettings);
        }else{
            gameSettings = {sound: 1};
        }

        var sound_btn_pic = ['btn_sound_disabled.png', 'btn_sound.png']

        var soundButton = MenuButton.create(sound_btn_pic[gameSettings.sound], this, function(item){
            //cc.log(item);
            gameSettings.sound = !gameSettings.sound - 0;
            Audio.setEnable(gameSettings.sound);
            item.setNormalImage(cc.Sprite.createWithSpriteFrameName(sound_btn_pic[gameSettings.sound]));
            sys.localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
        });  

        Audio.setEnable(gameSettings.sound);

        var menu = cc.Menu.create(easyButton, normalButton, hardButton, soundButton);
        menu.setPosition(cc.p(0, 0));
        this.addChild(menu, 128); 

        easyButton.setAnchorPoint(cc.p(0.5, 0));
        easyButton.setPosition(240, 355); 

        normalButton.setAnchorPoint(cc.p(0.5, 0));
        normalButton.setPosition(240, 230);

        hardButton.setAnchorPoint(cc.p(0.5, 0));
        hardButton.setPosition(240, 105);

        soundButton.setAnchorPoint(cc.p(0, 0));
        soundButton.setPosition(400, 40);

        if(this.setKeypadEnabled){   
            this.setKeypadEnabled(true);
        }
        
        return true;  
    },

    backClicked: function(){
        cc.Director.getInstance().end();
        //director.popScene();
    }
});

var MenuScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.Scene );
    },

    onEnter:function () {
        this._super();
        var bg = new cc.BgLayer('bg-menu.png');
        this.addChild(bg);

        var main = new MainLayer();
        this.addChild(main);
        main.init();
    }
});

module.exports = MenuScene;

});