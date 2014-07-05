define(function(require, exports, module){

'use strict';

var BaseSprite = require('cqwrap/sprites').BaseSprite;

var EventEmitter = require('cqwrap/events').EventEmitter;

var Button = BaseSprite.extend({
    init: function(style, event, callback){
        var self = this, sprite = this;

        this.enabled = true;

        if(typeof event === 'function'){
            callback = event;
            event = 'click';
        }

        if(typeof style === 'string'){
            this._super(style);
            style = null;
        }
        else if(typeof style === 'object' && 
            !(style instanceof cc.Sprite)){
            this._super(style.texture);
            delete style.texture;
        }else{
            sprite = style;
            this._super();
        }

        cc.mixin(this, new EventEmitter);

        var locked = false; //防止重复点击

        this.on('touchstart', function(){
            if(!self.isEnabled() || locked) return;
            if(!self.activated){
                var scale = self.getScaleY(); 
                self.setScale(scale * 0.95);
                //sprite.setOpacity(sprite.getOpacity() * 0.8);
                self.activated = true;
            }
        });

        this.on('touchend', function(){
            if(self.activated){
                var scale = self.getScaleY();
                self.setScale(scale / 0.95);
                //sprite.setOpacity(sprite.getOpacity() / 0.8);
                self.activated = false;
            }
        });
        
        this.on(event, function(){
            if(!self.isEnabled() || locked) return;
            callback && callback.apply(this, arguments);
            locked = true;
            setTimeout(function(){
                locked = false;
            }, 300);
        });

        if(cc.canvas && cc.canvas.style){
            this.on('mouseenter', function(){
                if(self.isEnabled()){
                    cc.canvas.style.cursor = 'pointer';
                }
            });
            
            this.on('mouseleave', function(){
                if(self.isEnabled){
                    cc.canvas.style.cursor = '';
                }
            });
        }

        function setSprite(){
            sprite.setAnchorPoint(cc.p(0, 0));
            sprite.setPosition(cc.p(0, 0));
            self.addChild(sprite);
            self.setContentSize(sprite.getContentSize());
        }

        if(sprite != this){
            setSprite();
        }

        if(style){
            this.setStyle(style);
        }

        this.setContentSprite = function(newSprite){
            if(sprite != self){
                sprite.removeFromParent(true);
            }
            sprite = newSprite;
            setSprite();
        }

        this.getContentSprite = function(){
            return sprite;
        }

        this.isEnabled = function(){
            return this.enabled && callback != null;
        }
    }
});

module.exports = {
    Button: Button
}
});