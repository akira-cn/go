define(function(require, exports, module){

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

module.exports = {
    Audio: Audio
}

});