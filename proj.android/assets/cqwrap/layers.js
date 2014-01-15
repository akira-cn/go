define(function(require, exports, module){

'use strict';

var EventEmitter = require('cqwrap/events').EventEmitter;
var BaseSprite = require('cqwrap/sprites').BaseSprite;

var BaseLayer = cc.Layer.extend({
    ctor: function(){
        this._super();
        this.init.apply(this, arguments);
        cc.associateWithNative( this, cc.Layer );
    },
    onEnter: function(){
        this._super();
    },
    onExit: function(){
        this._super();
        this.clearAllTimers();
    }
});

var BgLayer = BaseLayer.extend({
    init:function (bgImg) {
        this._super();
        var winSize = director.getWinSize();
        var sprite = new BaseSprite(bgImg);
        sprite.setPosition(cc.p(winSize.width/2, winSize.height/2));
        this.addChild(sprite);
        return true;
    }
});

function delegateTouch(layer, touch, event){
    var touchLocation = touch.getLocation();
    var targets = layer._touchTargets;

    for(var i = 0; i < targets.length; i++){
        var node = targets[i];
        var local = node.convertToNodeSpace(touchLocation);
        var size = node.getContentSize();
        var rect = cc.rect(0, 0, size.width, size.height);

        if (cc.rectContainsPoint(rect, local)) {
            touch.returnValue = true;
            touch.preventDefault = function(){
                touch.returnValue = false;
            }

            if(event === 'touchstart'){
                layer._touchedTarget = node;
            }

            if(layer._touchedTarget &&
                event === 'touchmove' && node !== layer._touchedTarget){
                layer._touchedTarget.emit('touchend', touch, layer._touchedTarget, layer);
                layer._moved = true;
                delete layer._touchedTarget;
            }

            node.emit(event, touch, node, layer);
            return touch.returnValue;
        } 
    }
    
    if(layer._touchedTarget &&
        (event === 'touchmove' || event === 'touchend')){
        layer._touchedTarget.emit('touchend', touch, layer._touchedTarget, layer);
        layer._moved = true;
        delete layer._touchedTarget;
    } 

    return false;        
}

var GameLayer = BaseLayer.extend({
    init: function () {
        this._super();
        var offsetY = director.offsetY;
        this.setPosition(cc.p(0, offsetY));
        this._touchTargets = [];
        this._clickAndMove = true;

        if(this.setKeypadEnabled && this.backClicked){
            this.setKeypadEnabled(true);
        }
    },
    addChild: function(node){
        this._super.apply(this, arguments);
        if(node.on){
            this.delegate(node);
        }
    },
    setTouchRect: function(rect){
        this._touchRect = rect;
    },
    setClickAndMove: function(clickAndMove){
        this._clickAndMove = clickAndMove;
    },
    addSprite: function(sprite, parent, pos, zOrder, anchor){
        if(typeof sprite === 'string'){
            sprite = new BaseSprite(sprite);
        }
        if(!(parent instanceof cc.Node)){
            anchor = zOrder;
            zOrder = pos;
            pos = parent;
            parent = this;
        }
        sprite.setAnchorPoint(anchor || cc.p(0, 0));
        sprite.setPosition(pos || cc.p(0, 0));
        parent.addChild(sprite, zOrder || 0);
    },
    /**
     *  touchstart, touchend, touchmove, touchcancelled
     */
    delegate: function(node, event, func) {
        if(this._touchTargets.indexOf(node) < 0){
            if(!node.on){
                cc.mixin(node, new EventEmitter);
            }
            this._touchTargets.push(node);
            this._touchTargets.sort(function(a, b){
                return b.getZOrder() - a.getZOrder();
            });
        }
        if(event){
            node.on(event, func);
        }
    },
    undelegate: function(node, event){
        var idx = this._touchTargets.indexOf(node);
        if(idx >= 0){
            if(!event){
                this._touchTargets.splice(idx, 1);
                node.removeAllListeners();
            }else{
                node.removeAllListeners(event);
            }
        }
    },
    registerDelegate: function(){
        cc.registerTargetedDelegate(-this.getZOrder(), true, this);
    },
    unregisterDelegate: function(){
        cc.unregisterTouchDelegate(this);
    },
    onEnter: function(){
        this._super();
        this.registerDelegate();
    },
    onExit: function(){
        //for(var i = 0; i < this._touchTargets.length; i++){
        //    this._touchTargets[i].removeAllListeners();
        //}
        this.unregisterDelegate();
        this._super();
    },
    onTouchBegan: function(touch, event){
        if(this._touchRect){
            if(!cc.rectContainsPoint(this._touchRect, touch.getLocation())){
                return false;
            }
        }
        this._touchPoint = touch.getLocation();
        return delegateTouch(this, touch, 'touchstart');
    },
    onTouchMoved: function(touch, event){
        var location = touch.getLocation();
        var size = director.getWinSize();

        if(!this._clickAndMove && (Math.abs(this._touchPoint.x - location.x) >= size.width / 30
            || Math.abs(this._touchPoint.y - location.y) >= size.height / 30)){
            this._moved = true;
        }            
        return delegateTouch(this, touch, 'touchmove');
    },
    onTouchEnded: function(touch, event){
        delegateTouch(this, touch, 'touchend');

        if(!this._moved){
            delegateTouch(this, touch, 'click');
        }
        this._moved = false;
        return touch.returnValue;
    },
    onTouchCancelled: function(touch, event){
        return delegateTouch(this, touch, 'touchcancel');
    }
});

module.exports = {
    BaseLayer: BaseLayer,
    BgLayer: BgLayer,
    GameLayer: GameLayer
};

});