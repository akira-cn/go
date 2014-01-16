define(function(require, exports, module){

var PlayScene = require('src/view/play_scene');
var Button = require('cqwrap/buttons').Button;
var BgLayer = require('cqwrap/layers').BgLayer,
    GameLayer = require('cqwrap/layers').GameLayer;

var BaseSprite = require('cqwrap/sprites').BaseSprite;

var Audio = require('cqwrap/audio').Audio;

var MainLayer = GameLayer.extend({

    init: function(){
        this._super();

        //this.addSprite('logo.png', cc.p(0, 800), 0, cc.p(0, 1.0));
        /*var logo = new BaseSprite();
        
        var Style = require('cqwrap/style').StyleManager;
        
        Style.setStyle(logo, {
            texture: 'res/logo.png',
            anchor: '0, 1.0',
            position: '0, 800',
            'z-order': 12
        });       

        this.addChild(logo);*/

        var Style = require('cqwrap/style').StyleManager;
        var label = cc.LabelTTF.create("abc", "Times New Roman", 16);
        Style.setStyle(label, {
            'anchor': [0, 1.0],
            'x': 0,
            'y': 600,
            'color': '#f00',
            'font-size': 55,
            'font-family': 'Times New Roman',
            'text-align': 'center',
            'v-align': 'middle',
            'width': 480,
            'scale': 0.6,
        });
        this.addChild(label);

        setTimeout(function(){
            //var texture = cc.TextureCache.getInstance().addImage('res/buttons-c.png');
            //ar texture = Style.getStyle(logo, 'texture');          
            //cc.log(texture instanceof cc.Texture2D);
            //cc.log(logo.getZOrder());
        });

        var easyButton = new Button('button-easy.png',
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('easy');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);            
            });

        this.addSprite(easyButton, cc.p(240, 355), 0, cc.p(0.5, 0));

        var normalButton = new Button('button-normal.png',
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('normal');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);                
            });

        this.addSprite(normalButton, cc.p(240, 230), 0, cc.p(0.5, 0));


        var hardButton = new Button('button-hard.png', 
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('hard');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);
            });

        this.addSprite(hardButton, cc.p(240, 105), 0, cc.p(0.5, 0));

        var gameSettings = sys.localStorage.getItem('gameSettings');
        if(gameSettings){
            gameSettings = JSON.parse(gameSettings);
        }else{
            gameSettings = {sound: 1};
        }
        Audio.setEnable(gameSettings.sound);

        var sound_btn_pic = ['btn_sound_disabled.png', 'btn_sound.png']

        var soundButton = new Button(sound_btn_pic[gameSettings.sound], 
            function(touch, item){
                Audio.playEffect('audio/btnclick.ogg');
                gameSettings.sound = !gameSettings.sound - 0;
                Audio.setEnable(gameSettings.sound);
                item.setContentSprite(cc.Sprite.createWithSpriteFrameName(sound_btn_pic[gameSettings.sound]));
                sys.localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
            });  

        this.addSprite(soundButton, cc.p(400, 40));

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