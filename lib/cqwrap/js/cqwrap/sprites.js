define(function(require, exports, module){

'use strict';

var BaseSprite = cc.Sprite.extend({
    ctor: function(){
        this._super();
        this.init.apply(this, arguments);
        cc.associateWithNative( this, cc.Sprite );            
    },
    init: function(img, rect){
        var spriteFrame = img && cc.SpriteFrameCache.getInstance().getSpriteFrame(img);
        if(spriteFrame){
            this.initWithSpriteFrame(spriteFrame);                
        }else{
            this._super.apply(this, arguments);
        }            
    }
});

module.exports = {
    BaseSprite: BaseSprite
};

});