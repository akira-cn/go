define(function(require, exports, module){
    var BgLayer = cc.Layer.extend({
        ctor:function(bgImg) {
            this._super();
            this.bgImg = bgImg;
            cc.associateWithNative( this, cc.Layer );
        },
        init:function () {
            this._super();
            
            var file = this.bgImg;
            var sprite = cc.Sprite.createWithSpriteFrameName(file);
            var winSize = cc.Director.getInstance().getWinSize();
            sprite.setPosition(cc.p(winSize.width/2, winSize.height/2));
            this.addChild(sprite);
            return true;
        }
    });

    module.exports = BgLayer;
});
