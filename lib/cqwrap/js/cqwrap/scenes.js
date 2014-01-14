define(function(require, exports, module){

    var BaseScene = cc.Scene.extend({
        ctor:function() {
            this._super();
            this.init.apply(this, arguments);
            cc.associateWithNative( this, cc.Scene );
        }
    });

    module.exports = {
        BaseScene: BaseScene
    }

});