# Api 范例

## 模块定义与加载规范

```js

define(function(require, exports, module){

    var ClassA = require('/path/to/moduleA').ClassA;

    var obj = new ClassA();

    dosth...

    module.exports = {
        sth: sth
    };

});

```

## 标准计时器和 Layer 计时器

实现了 setTimeout 和 setInterval

如果在当前某个 Layer 中异步执行某个操作，不建议用全局的 Timer，可以用当前Layer的 Timer，这样如果 Timer 还没触发用户退出了这个 Layer，会自动销毁所有的 Timer

例如：

```js

define(function(require, exports, module){
    
    var BaseLayer = require('cqwrap/layers').BaseLayer;

    var MyLayer = BaseLayer.extend({
        
        init: function(){
            var self = this;

            //这里用this.setTimeout，如果这个Layer退出了，timer就不会被触发，避免了过期事件的触发
            this.setTimeout(function(){
                    cc.log('触发timer');
                    self.addSprite('mysprite.png');
                }, 5000);
        }
        
    });

});

```

## Events

直接引入了标准的 node.js 的 Events 模块，所以文档可以直接看这里： http://nodejs.org/api/events.html

## Promise

直接引入了 when.js，所以文档可以直接看这里： https://github.com/cujojs/when

## native接口和原生设备通信

采用 json-rpc 规范的 Promise 接口调用

例如：

```js

native.call('getDeviceInfo').then(function(res){
    //会调用 java 的 当前 Activity 上对应的 getDeviceInfo 方法
    cc.log('设备ID是：' + res.deviceID);
}).otherwise(function(err){
    cc.log('接口调用出错');
});

```

## 声明式 Sprite 创建

提供了 cc.createSprite 方法，可以用json的属性描述参数

```js

//创建一个图片Sprite，图片可以是FrameCache名也可以是文件名
this.sprite = cc.createSprite("res/HelloWorld.png", {
    xy: [size.width / 2, size.height / 2],
    anchor: [0.5, 0.5]
});

//创建一个Hello World的LabelTTF
cc.createSprite("@Hello World", {
            'anchor': [0, 1.0],
            'x': 0,
            'y': 600,
            'color': '#f00',
            'font-size': 55,
            'font-family': 'Times New Roman',
            'text-align': 'center',
            'v-align': 'middle',
            'width': 480,
            'scale': 0.6,
            'rotate': 30,
        });

//创建一个Button
var closeButton = new Button({
        texture: 'res/CloseNormal.png',
        anchor: [0.5, 0.5],
        zOrder: 1,
        xy: [size.width - 20, 20]
    },
    function(){
        cc.log('close button was clicked.')
    });

```

## 基于 Layer 的事件代理

提供了一个 GameLayer 的类，它是一个 cc.Layer 的派生类，实现了一个 delegate 方法可以代理 Sprite 的 touch 和 click 事件。

touch事件的种类为 touchstart、 touchmove、 touchend、 touchcancel 和 click

touch事件的优先级顺序为先比较 Sprite 所在 Layer 的 zOrder， zOrder 大的 Layer 的事件优先触发。同一层 Layer 代理的多个 Sprite， zOrder 大的 Sprite 的事件优先触发。

你可以在一个被先触发的事件中使用 touch.preventDefault() 阻止默认事件，从而让事件被后面低优先级的元素触发。

```js

    var GameLayer = require('cqwrap/layers').GameLayer;

    var MyLayer = GameLayer.extend({
        
        init: function(){
            var self = this;

            var sprite = cc.createSprite("res/HelloWorld.png", {
                xy: [size.width / 2, size.height / 2],
                anchor: [0.5, 0.5],
                zOrder: 10
            });
            
            this.add(sprite);

            this.delegate(sprite, 'click', function(touch, target, self){
                    cc.log('be clicked!');
                });

            this.setClickAndMove(false);    //移动的时候不触发 click
        }

    });

```

## 动画

提供了好用的 AnimationTask 对象，用来代理Sprite的动画

```js

sprite.moveBy(0.5, cc.p(50, 50)).moveBy(0.5, cc.p(0, 100)).repeatAll(2).act();

sprite.clearActions().scaleBy(0.5, 0.2).act();

```

## 其他
