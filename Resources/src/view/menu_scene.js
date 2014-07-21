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

        //使用中文
        this.addSprite({
            'texture': 'res/logo-c.png',
            'anchor': [0.5, 0.5],
            'xy': [240, 636],
            'z-order': 0,
        });

        /*this.addSprite({
            'texture': 'logo.png',
            'anchor': [0.5, 0.5],
            'xy': [240, 636],
            'z-order': 0,
        });*/

        var easyButton = new Button('button-easy.png',
            function(){
                Audio.playEffect('audio/btnclick.mp3');
                
                //var MyScene = require('src/view/physics_scene');
                //var playScene = new MyScene();
                //director.pushScene(playScene);
                
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
                Audio.playEffect('audio/btnclick.mp3');
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
                Audio.playEffect('audio/btnclick.mp3');
                var playScene = new PlayScene('hard');
                var scene = cc.TransitionFade.create(0.8, playScene);
                director.pushScene(scene);
            });

        this.addSprite(hardButton, {
                'xy': [240, 105],
                'anchor': [0.5, 0],
            });

        var aboutButton = new Button('button_about.png', function(touch, item){
            alert('发行商：成都华逸创展科技有限公司\n' +
               '客服电话：15828696731\n' + 
               '客服邮箱：\n15828696731@139.com');  
        });

        this.addSprite(aboutButton, {
            xy: [200, 40]
        });

        var moreButton = new Button('button_more.png', function(touch, item){
            native.call("showMoreGames");  
        });

        this.addSprite(moreButton, {
            xy: [280, 40]
        });

        var GameSettings = require('cqwrap/data').GameSettings;
        var UserData = require('cqwrap/data').UserData;

        var enabelSound = GameSettings.get('sound', 1);

        Audio.setEnable(enabelSound);

        var sound_btn_pic = ['btn_sound_disabled.png', 'btn_sound.png'];

        var soundButton = new Button(sound_btn_pic[enabelSound], 
            function(touch, item){
                Audio.playEffect('audio/btnclick.mp3');
                enabelSound = !enabelSound - 0;
                Audio.setEnable(enabelSound);
                item.setContentSprite(cc.Sprite.createWithSpriteFrameName(sound_btn_pic[enabelSound]));
                GameSettings.set('sound', enabelSound);
            });  

        this.addSprite(soundButton, {
                'xy': [400, 40]
            });

        //移动sdk在进入游戏之前设置音效
        native.call("getSoundEnabled").then(function(res){
            enabelSound = res.enabled | 0;
            Audio.setEnable(enabelSound);
            soundButton.setContentSprite(
                cc.createSprite(sound_btn_pic[enabelSound])
            );
            GameSettings.set('sound', enabelSound);
        });

        if(!cc.__needActivate){
            cc.__needActivate = true;

            var isActivated = GameSettings.get('activated', 0);
            var self = this;
            if(!isActivated){
                var lifeTicks = UserData.get('lifeTicks', 300); //300秒

                //5秒钟检查一次
                var activateChecker = setInterval(function(){
                    //var mask = cc.showMessage(self, "通讯中，请稍候");
                    lifeTicks -= 5;
                    UserData.set('lifeTicks', Math.max(lifeTicks, 5));

                    if(lifeTicks <= 5){
                        clearInterval(activateChecker);
                        //alert('支持正版游戏，请购买激活');
                        setTimeout(function(){
                            native.call('pay', {pointNumber: "1"}).then(function(data){
                                //mask.removeFromParent(true);
                                if (data.errno) {
                                    alert("正版激活失败，5秒后退出游戏！");
                                    native.call('logEvent', {event:'payError', message:{err:data.errno}});
                                    setTimeout(function(){
                                        director.end();
                                    }, 5000)
                                }else{
                                    //支付成功
                                    native.call('logPay', {
                                        money:6, 
                                        price:600, 
                                        source:5,
                                        number:1,
                                        item:'activated'
                                    });
                                    GameSettings.set('activated', 1);
                                }
                            }).otherwise(function(err){
                                //mask.removeFromParent(true);
                            }); 
                        }, 0);
                    }
                }, 5000); 
            }
        }

        return true;  
    },

    backClicked: function(){
        native.call("exitGame").then(function(){
            director.end();
        }).otherwise(function(){
            director.end();
        });
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