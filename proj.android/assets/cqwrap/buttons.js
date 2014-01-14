define(function(require, exports, module){

var EventEmitter = require('cqwrap/events').EventEmitter;

var Button = function(sprite, event, callback){
    if(typeof event === 'function'){
        callback = event;
        event = 'click';
    }
    
    var box = new cc.Node();

    cc.mixin(box, new EventEmitter);

    box.on('touchstart', function(){
        sprite.setScaleY(0.9);
        sprite.setOpacity(sprite.getOpacity() * 0.8);
    });
    box.on('touchend', function(){
        var scale = sprite.getScaleY();
        if(Math.abs(scale - 0.9) < 0.01){
            sprite.setScaleY(1.0);
            sprite.setOpacity(sprite.getOpacity() / 0.8);
        }
    });

    if(callback){
        box.on('click', callback);
    }
    
    function setSprite(){
        sprite.setAnchorPoint(cc.p(0, 0));
        sprite.setPosition(cc.p(0, 0));
        box.addChild(sprite);
        box.setContentSize(sprite.getContentSize());
    }

    setSprite();

    box.setContentSprite = function(newSprite){
        sprite.removeFromParent(true);
        sprite = newSprite;
        setSprite();
    }

    box.getContentSprite = function(){
        return sprite;
    }

    return box;
    //return sprite;
}

Button.create = function(img, callback){
    var sprite;
    
    if(typeof img == 'object'){
        sprite = img;
    }else{
        try{
            sprite = cc.Sprite.createWithSpriteFrameName(img);
        }catch(ex){
            sprite = cc.Sprite.create(img);
        }
    }

    return new Button(sprite, callback);
}

module.exports = {
    Button: Button
}
});