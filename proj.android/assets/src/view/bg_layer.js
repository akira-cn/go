define(function(require, exports, module){
    var BgLayer = cc.BaseLayer.extend({
        init:function (bgImg) {
            this._super();

            var sprite = cc.Sprite.createWithSpriteFrameName(bgImg);
            var winSize = director.getWinSize();
            sprite.setPosition(cc.p(winSize.width/2, winSize.height/2));
            this.addChild(sprite);
            return true;
        }
    });

    module.exports = BgLayer;
});
