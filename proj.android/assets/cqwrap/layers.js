define(function(require, exports, module){

    'use strict';

    cc.BaseLayer = cc.Layer.extend({
        ctor: function(){
            this._super();
            this.init.apply(this, arguments);
            cc.associateWithNative( this, cc.Layer );
        },
        onEnter: function(){
            this._super();
        },
        onExit: function(){
            this._super();
            this.clearAllTimers();
        }
    });

    cc.BgLayer = cc.BaseLayer.extend({
        init:function (bgImg) {
            this._super();
            var winSize = director.getWinSize();
            var sprite = cc.Sprite.createWithSpriteFrameName(bgImg);
            sprite.setPosition(cc.p(winSize.width/2, winSize.height/2));
            this.addChild(sprite);
            return true;
        }
    });

    cc.GameLayer = cc.BaseLayer.extend({
        init: function () {
            this._super();
            var offsetY = director.offsetY;
            this.setPosition(cc.p(0, offsetY));
        }
    });

    cc.ControlLayer = cc.BaseLayer.extend({
        init: function (bgImg) {

        }
    });

});