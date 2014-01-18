
define(function(require, exports, module) {

'use strict';

var AnimationTool = {};

var BaseSprite = require('cqwrap/sprites').BaseSprite;

var getAnimFrame = function(name) {
    var cache = cc.SpriteFrameCache.getInstance(),
        frames = [],
        i = 0;

    do {
        var frameName = name.replace('%d', i),
            frame = cache.getSpriteFrame(frameName);
        
        if(frame) {
            frames.push(frame);
        }else {
            break;
        }

    } while (++i);

    return frames; 
};

//将PNG序列转成一次性动画
AnimationTool.createAnimFromPng = function(name, delay) {
    var frames = getAnimFrame(name),
        animation = cc.Animation.create(frames, delay);

    return cc.Animate.create(animation);
};

//将PNG序列转成永久性动画
AnimationTool.createRFAnimFromPng = function(name, delay) {
    return cc.RepeatForever.create(AnimationTool.createAnimFromPng(name, delay));
};

/**
    var animSprite = new FrameAnimSprite('abc.png');
    -> play abc0.png、abc1.png ... abcn.png
 */
var FrameAnimSprite = BaseSprite.extend({
    init: function(img){
        this._super();
        this.img = img;
        return true;
    },
    animate: function(delay){
        var img = this.img;
        if(!/%d/.test(this.img)){
            img = this.img.replace(/\./, '%d.');
        }
        var action = AnimationTool.createRFAnimFromPng(img, delay);
        this.runAction(action);
    }
});

module.exports = {
    AnimationTool: AnimationTool
}
});