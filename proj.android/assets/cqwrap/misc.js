(function(global){

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

global.SpriteFadeInTR = SpriteFadeInTR;
global.Audio = Audio;
})(this);