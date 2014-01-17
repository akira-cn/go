# Api 范例

## 模块定义与加载规范

```js

define(function(require, exports, module){

    var ClassA = require('moduleA').ClassA;

    var obj = new ClassA();

    dosth...

    module.exports = {
        sth: sth
    };

});

```