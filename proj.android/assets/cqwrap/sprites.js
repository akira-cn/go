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

cc.createSprite = function(sprite, pos, anchor, rect){
  if(typeof sprite === 'string'){
      sprite = new BaseSprite(sprite);
  }
  sprite.setAnchorPoint(anchor || cc.p(0, 0));
  sprite.setPosition(pos || cc.p(0, 0));
  if(rect){
    sprite.setTextureRect(rect);
  }
  return sprite;
}

module.exports = {
    BaseSprite: BaseSprite
};

});