
define(function(require, exports, module) {

'use strict';

var AnimationTool = {};

var BaseSprite = require('cqwrap/sprites').BaseSprite;

var getAnimFrames = function(name) {
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
    var frames = getAnimFrames(name),
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
        this.animate = null;
        return true;
    },
    animate: function(delay, repeat){
        if(!this.animate){
            var img = this.img;
            if(!/%d/.test(this.img)){
                img = this.img.replace(/\./, '%d.');
            }
            var method = repeat? 'createRFAnimFromPng' : 'createAnimFromPng';
            this.animate = AnimationTool[method](img, delay);
        }
        this.runAction(this.animate);
    }
});


function AnimationTask(sprite){
    this._sprite = sprite;
    this._animSeq = [];
}

cc.mixin(AnimationTask.prototype, {
    addAction: function(actionCls, args, easing, rate){
        for(var i = args.length - 1; i >= 0; i--){
            if(args[i] !== undefined){
                args.length = i + 1;
                break;
            }
        }
        var actions = [actionCls.create.apply(actionCls, args)];
        if(easing){
            rate = rate || 2;
            actions[0] = easing.create(actions[0], rate);
        }
        this._animSeq.push.apply(this._animSeq, actions);
        return this;
    },
    join: function(task){
        this._animSeq = this._animSeq.concat(task._animSeq);
        return this;
    },
    act: function(clear){
        if(this._animSeq.length > 0){
            var action = cc.Sequence.create.apply(cc.Sequence, this._animSeq);
            this._sprite.runAction(action);
            if(clear){
                this._animSeq.length = 0;
            }
        }
        return this;      
    },
    actOnce: function(){
        return this.act(true);
    },
    delay: function(time){
        return this.addAction(cc.DelayTime, [time]);
    },
    repeat: function(times){
        if(this._animSeq.length > 0){
            var action = this._animSeq[this._animSeq.length - 1];
            if(!times){
                action = cc.RepeatForever.create(action);
            }else{
                action = cc.Repeat.create(action, times);
            }
            this._animSeq.length = 0;
            this._animSeq.push(action);
        }
        return this;        
    },
    repeatAll: function(times){
        if(this._animSeq.length > 0){
            var action = cc.Sequence.create.apply(cc.Sequence, this._animSeq);
            if(!times){
                action = cc.RepeatForever.create(action);
            }else{
                action = cc.Repeat.create(action, times);
            }
            this._animSeq.length = 0;
            this._animSeq.push(action);
        }
        return this;
    },
    reverse: function(){
        if(this._animSeq.length > 0){
            var action = this._animSeq[this._animSeq.length - 1];
            this._animSeq.push(action.reverse());
        }
        return this;
    },
    reverseAll: function(){
        if(this._animSeq.length > 0){
            var action = cc.Sequence.create.apply(cc.Sequence, this._animSeq);
            this._animSeq.push(action.reverse());
        }
        return this;
    },
    then: function(callback){
        callback = cc.CallFunc.create(callback, this._sprite);
        this._animSeq.push(callback);            
        return this;
    },
    
    /**
        sprite.animate(0.2, 'a.png', 'b.png', 'c.png');
        sprite.animate(0.2, 'abc_%d.png');
     */
    animate: function(delay /* frames */){
        var frames = [].slice.call(arguments, 1);
        if(/%d/.test(frames[0])){
            frames = getAnimFrames(frames[0]);
        }
        var animation = cc.Animation.create(frames, delay);
        this._animSeq.push(cc.Animate.create(animation));
        return this;
    },
    bezierBy: function(dur, conf, easing, rate){
        return this.addAction(cc.BezierBy, [dur, conf], easing, rate);
    },
    bezierTo: function(dur, conf, easing, rate){
        return this.addAction(cc.BezierTo, [dur, conf], easing, rate);
    },
    blink: function(dur, blinks, easing, rate){
        return this.addAction(cc.Blink, [dur, blinks], easing, rate);
    },
    fadeIn: function(dur, easing, rate){
        return this.addAction(cc.FadeIn, [dur], easing, rate);
    },
    fadeOut: function(dur, easing, rate){
        return this.addAction(cc.FadeOut, [dur], easing, rate);
    },
    fadeTo: function(dur, opacity, easing, rate){
        return this.addAction(cc.FadeTo, [dur, opacity], easing, rate);
    },
    jumpBy: function(dur, pos, height, times, easing, rate){
        return this.runAction(cc.JumpBy, [dur, pos, height, times || 1], easing, rate);        
    },
    jumpTo: function(dur, pos, height, times, easing, rate){
        return this.runAction(cc.JumpTo, [dur, pos, height, times || 1], easing, rate);
    },
    moveBy: function(dur, pos, easing, rate){
        return this.addAction(cc.MoveBy, [dur, pos], easing, rate);
    },
    moveTo: function(dur, pos, easing, rate){
        return this.addAction(cc.MoveTo, [dur, pos], easing, rate);
    },
    rotateBy: function(dur, deltaX, deltaY, easing, rate){
        return this.addAction(cc.RotateBy, [dur, deltaX, deltaY], easing, rate);
    },
    rotateTo: function(dur, deltaX, deltaY, easing, rate){
        return this.addAction(cc.RotateTo, [dur, deltaX, deltaY], easing, rate);
    },
    scaleBy: function(dur, sx, sy, easing, rate){
        return this.addAction(cc.ScaleBy, [dur, sx, sy], easing, rate);
    },
    scaleTo: function(dur, sx, sy, easing, rate){
        return this.addAction(cc.ScaleTo, [dur, sx, sy], easing, rate);
    },
    skewBy: function(dur, sx, sy, easing, rate){
        return this.addAction(cc.SkewBy, [dur, sx, sy], easing, rate);
    },
    skewTo: function(dur, sx, sy, easing, rate){
        return this.addAction(cc.SkewTo, [dur, sx, sy], easing, rate);
    },
    tineBy: function(dur, deltaR, deltaG, deltaB, easing, rate){
        return this.addAction(cc.TineBy, [dur, deltaR, deltaG, deltaB], easing, rate);
    },
    tineTo: function(dur, deltaR, deltaG, deltaB, easing, rate){
        return this.addAction(cc.TineTo, [dur, deltaR, deltaG, deltaB], easing, rate);        
    }
});


module.exports = {
    AnimationTool: AnimationTool,
    AnimationTask: AnimationTask,
    FrameAnimSprite: FrameAnimSprite
}
});