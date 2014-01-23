define(function(require, exports, module){

var PlayScene = require('src/view/play_scene');
var Button = require('cqwrap/buttons').Button;
var BgLayer = require('cqwrap/layers').BgLayer,
    GameLayer = require('cqwrap/layers').GameLayer;

var BaseSprite = require('cqwrap/sprites').BaseSprite,
    BaseLabel = require('cqwrap/labels').BaseLabel;

var Audio = require('cqwrap/audio');

var MainLayer = GameLayer.extend({

    init: function(){
        this._super();     

        this.addSprite({
            'texture': 'logo.png',
            'anchor': [0.5, 0.5],
            'xy': [240, 636],
            'z-order': 0,
        });

        /*this.addSprite("@Hello World", {
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
            'rotate': 30,
        });*/

        var easyButton = new Button('button-easy.png',
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('easy');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);            
            });

        this.addSprite(easyButton, {
                'xy': [240, 355],
                'anchor': [0.5, 0],
            });

        var normalButton = new Button('button-normal.png',
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('normal');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);                
            });

        this.addSprite(normalButton, {
                'xy': [240, 230],
                'anchor': [0.5, 0],
            });


        var hardButton = new Button('button-hard.png', 
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                var playScene = new PlayScene('hard');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);
            });

        this.addSprite(hardButton, {
                'xy': [240, 105],
                'anchor': [0.5, 0],
            });

        var GameSettings = require('cqwrap/data').GameSettings;
        var enabelSound = GameSettings.get('sound', 1);

        Audio.setEnable(enabelSound);

        var sound_btn_pic = ['btn_sound_disabled.png', 'btn_sound.png']

        var soundButton = new Button(sound_btn_pic[enabelSound], 
            function(touch, item){
                Audio.playEffect('audio/btnclick.ogg');
                enabelSound = !enabelSound - 0;
                Audio.setEnable(enabelSound);
                item.setContentSprite(cc.Sprite.createWithSpriteFrameName(sound_btn_pic[enabelSound]));
                GameSettings.set('sound', enabelSound);
            });  

        this.addSprite(soundButton, {
                'xy': [400, 40]
            });

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