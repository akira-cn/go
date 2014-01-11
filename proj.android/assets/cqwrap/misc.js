(function(global){
var MenuButton = {
    create: function(img, target, callback){
        var spriteNormal = cc.Sprite.createWithSpriteFrameName(img);
        var spriteSelected = cc.Sprite.createWithSpriteFrameName(img);
        spriteSelected.setScaleY(0.9);
        spriteSelected.setOpacity(180);

        return cc.MenuItemSprite.create(
            spriteNormal,
            spriteSelected,
            function(){
                callback.apply(this, arguments);
                Audio.playEffect('audio/btnclick.ogg');
            }, 
            target
        );
    }
};

var SpriteFadeInTR = {
    create: function(dur, sprite, to){
        to = to || 255;
        sprite.setOpacity(0);
        var effect = cc.FadeTo.create(dur, to);
        sprite.runAction(effect);
        return sprite;        
    }
};

var audo_enable = true;
var Audio = {
    playEffect: function(name){
        if(audo_enable){
            cc.AudioEngine.getInstance().playEffect(name, false);
        }
    },
    setEnable: function(enable){
        audo_enable = enable;
    }
};

global.MenuButton = MenuButton;
global.SpriteFadeInTR = SpriteFadeInTR;
global.Audio = Audio;
})(this);