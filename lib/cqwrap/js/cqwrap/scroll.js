define(function(require, exports, module){

'use strict';

var GameLayer = require('cqwrap/layers').GameLayer;
var EventEmitter = require('cqwrap/events').EventEmitter;

var ScrollLayer = GameLayer.extend({
    onEnter: function(){
        this._super();
        if(!this._touchRect){
            this.setTouchRect(this.getParent().getBoundingBox());
        }
        this.getParent().setTouchPriority(this.getTouchPriority() - 1);
    }
});

var TouchCaptureLayer = cc.Layer.extend({
    ctor: function(){
        this._super();
        this.init.apply(this, arguments);
        cc.associateWithNative( this, cc.Layer );
        cc.mixin(this, new EventEmitter);
    },
    onEnter: function(){
        this._super();
        cc.registerTargetedDelegate(-999999, false, this);
    },
    onExit: function(){
        cc.unregisterTouchDelegate(this);
        this._super();
    },
    onTouchBegan: function(touch, event){
        this.emit('beforescroll', touch, event);
        return true;
    },
    onTouchMoved: function(touch, event){
        this.emit('scroll', touch, event);
        return true;
    },
    onTouchEnded: function(touch, event){
        this.emit('afterscroll', touch, event);
        return true;
    }
});

var BaseScrollView = cc.ScrollView.extend({
    ctor: function(viewport, contentSize){
        this._super.apply(this, arguments);
        this.init.apply(this, arguments);
        cc.associateWithNative(this, cc.ScrollView);        
    },
    init: function(viewport, contentSize){
        var scrollLayer = new ScrollLayer();
        scrollLayer.setAnchorPoint(cc.p(0, 0));
        scrollLayer.setPosition(cc.p(0, 0));
        scrollLayer.setContentSize(contentSize);
        scrollLayer.setClickAndMove(false);

        this.initWithViewSize(viewport, scrollLayer);

        this.getContentLayer = function(){
            return scrollLayer;
        }       
    }
});

var ScrollView = BaseScrollView.extend({
    init: function(viewport, contentSize){
        this._super(viewport, contentSize);

        var scrollLayer = this.getContentLayer();

        var touchCaptureLayer = new TouchCaptureLayer();
        this.addChild(touchCaptureLayer);
        this._touchCaptureLayer = touchCaptureLayer;

        var self = this;
        var startTime, startOffset, originOffset;

        touchCaptureLayer.on('beforescroll', function(touch, event){
            scrollLayer.stopAllActions();
            originOffset = self.getContentOffset();
        });

        touchCaptureLayer.on('scroll', function(touch, event){
            var now = Date.now();
            if(!startTime || now - startTime > 500){
                startOffset = self.getContentOffset();
                startTime = Date.now();
            }
        });

        touchCaptureLayer.on('afterscroll', function(touch, event){
            if(startOffset){
                var offset = self.getContentOffset();
                var dur = Date.now() - startTime;
                var speed = cc.p((offset.x - startOffset.x)/dur, (offset.y - startOffset.y)/dur);             
                var t = 500;
                var minOffset = self.minContainerOffset();
                var maxOffset = self.maxContainerOffset();
                var s = cc.p(0.5 * speed.x * t, 0.5 * speed.y * t);

                s = cc.pAdd(offset, s);

                if(s.x < minOffset.x || s.y < minOffset.y){
                    return;
                }
                if(s.x > maxOffset.x || s.y > maxOffset.x){
                    return;
                }

                scrollLayer.moveTo(t/1000,s , cc.EaseOut, 2).act();
            }
        });
    }
});

var PageView = BaseScrollView.extend({
    init: function(viewport, pagewidth, pages){
        if(arguments.length <= 2){
            pages = pagewidth;
            pagewidth = viewport.width;
        }
        var offsetX = 0.5 * (viewport.width - pagewidth);
        this._offsetX = offsetX;

        var contentSize = cc.size(pagewidth * pages + 2 * offsetX, viewport.height);
        this._super(viewport, contentSize);
        //this.setBounceable(false);

        cc.mixin(this, new EventEmitter);

        this.on('touchstart', function(touch){
            touch.preventDefault();
        });

        this.setStyle('direction', cc.SCROLLVIEW_DIRECTION_HORIZONTAL);

        this._pagewidth = pagewidth;

        var scrollLayer = this.getContentLayer();
        for(var i = 0; i < pages; i++){
            var pageLayer = new GameLayer();
            
            pageLayer.setStyle({
                xy: [offsetX + pagewidth * i, 0],
                tag: i,
                size: [pagewidth, viewport.height],
                //backgroundColor: 'rgb('+i*50+',88,87)'
            });

            if(cc.isHtml5){
                pageLayer.setStyle('zOrder', 1);
            }

            pageLayer.setClickAndMove(false);

            scrollLayer.addChild(pageLayer);
        }

        var touchCaptureLayer = new TouchCaptureLayer();
        this.addChild(touchCaptureLayer);

        var self = this;
        var startTime, startOffset, originOffset, currentPage;

        touchCaptureLayer.on('beforescroll', function(touch, event){
            scrollLayer.stopAllActions();
            currentPage = self.getPage();
            originOffset = self.getContentOffset();
        });

        touchCaptureLayer.on('scroll', function(touch, event){
            var now = Date.now();
            if(!startTime || now - startTime > 500){
                startOffset = self.getContentOffset();
                startTime = Date.now();
            }
        });

        touchCaptureLayer.on('afterscroll', function(touch, event){
            if(startOffset){
                var offset = self.getContentOffset();
                var dur = Date.now() - startTime;
                var minOffset = self.minContainerOffset();
                var maxOffset = self.maxContainerOffset();

                if(offset.x < minOffset.x){
                    self.setPage(self.getMaxPage(), -1);
                    return;
                }
                if(offset.x > maxOffset.x){
                    self.setPage(0, -1);
                    return;
                }

                var speed = cc.p((offset.x - startOffset.x)/dur, (offset.y - startOffset.y)/dur);
                
                if(Math.max(offset.x - originOffset.x, offset.y - originOffset.y) < 15){
                    speed = 0;
                }

                //cc.log(offset, speed.x );
                if(Math.abs(speed.x) > 0.3){
                    var t = 500;
                    if(speed.x > 0){
                        //move left
                        var page = Math.max(0, currentPage - 1);
                        self.setPage(page, 0.2);
                        
                    }else{
                        //move right
                        var page = Math.min(self.getMaxPage(), currentPage + 1);
                        self.setPage(page, 0.2);
                    }
                }else{
                    self.setPage(self.getPage(), 0.2);
                }
            }else{
                self.setPage(self.getPage(), 0.2);
            }
        });

        this._page = null;
    },
    setPage: function(page, dur){
        var oldPage = this._page;
        
        if(oldPage !== page){
            this.emit('change', page, oldPage);
        }

        dur = dur || 0;

        if(dur >= 0){
            var self = this;
            var offset = cc.p(-this._pagewidth * page, 0);

            var scrollLayer = this.getContentLayer();
            scrollLayer.stopAllActions();
            scrollLayer.moveTo(dur, offset).then(function(){
                scrollLayer.moveTo(dur, offset).act();
            }).act();
        }

        this._page = page;
    },
    getPage: function(){
        var offsetX = this.getContentOffset().x;
        return Math.min(Math.round(-offsetX / this._pagewidth), this.getMaxPage());
    },
    getPageLayer: function(page){
        return this.getContentLayer().getChildByTag(page);
    },
    getMaxPage: function(){
        var offsetX = this.minContainerOffset().x;
        return Math.round(-offsetX / this._pagewidth);        
    }
});

ScrollView.create = function(viewport, contentSize){
    return new ScrollView(viewport, contentSize);
}

module.exports = {
    ScrollView: ScrollView,
    PageView: PageView,
};

});