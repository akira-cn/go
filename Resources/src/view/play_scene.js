define(function(require, exports, module){

var Weiqi = require('src/model/weiqi');
var Button = require('cqwrap/buttons').Button;
var BgLayer = require('cqwrap/layers').BgLayer,
    GameLayer = require('cqwrap/layers').GameLayer,
    BaseSprite = require('cqwrap/sprites').BaseSprite;

var Audio = require('cqwrap/audio').Audio;
var TransitionFade = require('cqwrap/transitions').TransitionFade;

var UserData = require('cqwrap/data').UserData;

function putStone(stone, boardSprite, cursor){
    var color = stone.type;
    var x = 437 - stone.x * 43,
        y = 40 + stone.y * 43;

    var stoneSprite = cc.createSprite(color + '.png', {
            anchor: [0.5, 0.5],
            xy: [x, y],
        });

    boardSprite.addChild(TransitionFade.create(0.5, stoneSprite));
    stone.sprite = stoneSprite;

    if(cursor){
        var cursorSprite = boardSprite.cursor;
        
        if(!boardSprite.cursor){
            cursorSprite = cc.createSprite('cursor.png', {
                anchor: [0.5, 0.5],
                xy: [x, y],
                zOrder: 10
            });

            boardSprite.addChild(cursorSprite);
            boardSprite.cursor = cursorSprite;
        }else{
            cursorSprite.setPosition(cc.p(x, y));
        }
        Audio.playEffect('audio/putstone.ogg');
    }else{
        if(boardSprite.cursor){
            boardSprite.removeChild(boardSprite.cursor, true);
            boardSprite.cursor = null;
        }
    }

    return stoneSprite;   
}

var WeiqiLayer = GameLayer.extend({

    init: function(parent){

        this._super();
        this.parent = parent;

        var boardSprite = new BaseSprite("board.png");
        this.addSprite(TransitionFade.create(0.5, boardSprite, 150), {
                x: 5,
                y: 110,
                anchor: [0, 0],
            });

        var self = this;

        var weiqi = new Weiqi();

        weiqi.on('put', function(stone, board, cursor){
            //cc.log('put it...');
            putStone(stone, boardSprite, cursor);
        });

        weiqi.on('take', function(stone, board){
            boardSprite.removeChild(stone.sprite, true);
        });
        
        weiqi.on('comment', function(comment){
            comment = comment || [];
            self.parent.setComment(comment.join('\n'));
        });

        weiqi.on('put_error', function(){
            if(self.parent.score > 0){ 
                self.parent.score--;
                self.setTimeout(function(){
                    self.parent.updateScore();
                }, 500);
            }
            Audio.playEffect('audio/wrong.ogg');
        });

        weiqi.on('gameover', function(score){

            var scores = 'EDCBAS';
            score = Math.max(0, score-0+self.parent.score);
            self.parent.showScore(scores[score]);
            self.parent.gameover = true;
        });

        var labelSprites = [];

        weiqi.on('label', function(labels){
            for(var i = 0; i < labelSprites.length; i++){
                boardSprite.removeChild(labelSprites[i], true);
            }
            labelSprites.length = 0;
            for(var i = 0; i < labels.length; i++){
                var label = labels[i].split(":");
                var pos = weiqi.getXY(label[0]);
                var mark = label[1];
                x = 437 - pos[0] * 43;
                y = 40 + pos[1] * 43;

                var labelSprite = cc.createSprite("@"+mark, {
                    fontFamily: "Arial",
                    anchor: [0.5, 0.5],
                    xy: [x, y],
                    color: "#000",
                });
                
                boardSprite.addChild(labelSprite); 
                labelSprites.push(labelSprite);                             
            }
        });

        this.weiqi = weiqi;

        return true;      
    },
    onExit: function(){
        this._super();
        this.weiqi.removeAllListeners();
        this.clearAllTimers();
    }
});

var LevelLayer = GameLayer.extend({

    init:function(parent){
        this._super();
        this.parent = parent;

        var self = this;

        var layer = cc.LayerColor.create(cc.c4b(0, 0, 0, 128));
        this.addChild(layer);

        this.addSprite('bg-levels.png', {
                anchor: [0, 0]
            });

        var mode = this.parent.mode;
        var n = WeiqiData[mode].length -  1,
            h = (n / 3) | 0;

        var ScrollView = require('cqwrap/scroll.js').ScrollView;

        var scrollView = ScrollView.create(cc.size(480, 441), cc.size(450, 150 * (h+1)));
        var scrollLayer = scrollView.getContentLayer();

        var level = self.parent.level;
        //cc.log(offset);

        for(var i = 0; i <= h; i++){
            for(var j = 0; j < 3; j++){
                var c = i * 3 + j;
                if(c > n){
                    break;
                }
                (function(i, j, c){

                    function f(){
                        var name = "game_"+ (c % 8 + 1) + ".png";
                        var levelNormal = new BaseSprite(name);      
                        
                        var labelId = cc.createSprite('@'+(c + 1), {
                            anchor: [0.5, 0.5],
                            xy: [60, 60],
                            color: '#000',
                            fontSize: 27  
                        });
             
                        levelNormal.addChild(labelId);

                        if(c == level){
                            var levelCurrent = cc.createSprite('selected.png', {
                                anchor: [0.5, 0.5],
                                xy: [65, 55]
                            });

                            levelNormal.addChild(levelCurrent);
                        }

                        var score = self.parent.gameData.scores[c];
                        if(score){
                            var labelScore = cc.createSprite('@'+score, {
                                fontFamily: 'Arial',
                                fontSize: 19,
                                anchor: [0, 0],
                                xy: [82, 82],
                                color: 'rgb(155, 0, 0)'
                            });
               
                            levelNormal.addChild(labelScore);
                        }

                        var menuItem = new Button(
                            levelNormal,
                            (function(c){
                                return function(item) {

                                    self.parent.loadGame(c);
                                    self.removeFromParent(true);
                                    self.parent.levelLayer = null;

                                    Audio.playEffect('audio/submenu_click.ogg');
                                }
                            })(c)            
                        );

                        menuItem.setStyle({
                            anchor: [0, 0],
                            xy: [150 * j, 150 * (h - i) + 16]
                        });

                        scrollLayer.addChild(menuItem);
                    }
                    if(Math.abs(level - c) < 9){
                        f();
                    }else{
                        self.setTimeout(f, 0);
                    }
                })(i, j, c);
            }         
        }

        var offset = scrollView.minContainerOffset();
        offset.y += ((level / 9) | 0) * 450;

        scrollView.setStyle({
            anchor: [0, 0],
            xy: [0, 122],
            direction: cc.SCROLLVIEW_DIRECTION_VERTICAL,
            contentOffset: offset,
            zOrder: 1
        });

        this.addChild(scrollView);
        this.scrollView = scrollView;
    },
    onExit: function(){
        this._super();
        this.clearAllTimers();
    }
});


var MainLayer = GameLayer.extend({

    setComment:function(comment){
        if(this.commentLabel){
            this.commentLabel.setString(comment);
            return false;
        }

        var label = cc.createSprite('@'+comment, {
            fontFamily: "Arial",
            fontSize: 19,
            xy: [35, 670],
            anchor: [0, 1.0],
            color: '#000',
            textAlign: 'left',
            size: [410, 80],
            zOrder: 15
        });

        this.addChild(label); 
        this.commentLabel = label;

        return true;     
    },

    updateScore: function(){
        var score = this.score;
        if(this.scoreSprite){
            this.removeChild(this.scoreSprite, true);
            this.scoreSprite = null;
        }
        this.scoreSprite = new BaseSprite();

        for(var i = 0; i < 3; i++){
            if(i < score){
                var heart = cc.createSprite("heart-red.png", {
                    xy: [438 - i * 45, 700],
                    anchor: [0.5, 0.5],
                    zOrder: 15
                });

                this.scoreSprite.addChild(heart); 
            }else{
                var heart = cc.createSprite("heart-grey.png", {
                    xy: [438 - i * 45, 700],
                    anchor: [0.5, 0.5],
                    zOrder: 15                   
                })

                this.scoreSprite.addChild(heart); 
            }
        }
        this.addChild(this.scoreSprite, 15);
    },

    showScore: function(score){
        var label = cc.createSprite('@'+score, {
            fontFamily: "Arial",
            fontSize: 277,
            xy: [235, 300],
            anchor: [0, 0],
            color: "rgb(200, 0, 0)",
            zOrder: 15
        });

        this.addChild(label);

        this.scoreLabel = label;

        var effect = cc.MoveBy.create(0.5, cc._p(-150, 150) ),
            effect2 = cc.ScaleBy.create(0.5, 0.2);

        label.runAction(effect);
        label.runAction(effect2);


        this.gameData.scores[this.level] = score;
        UserData.set(this.mode, this.gameData);
    },

    goBack: function(){
        if(this.levelLayer){
            this.removeChild(this.levelLayer, true);
            this.levelLayer = null;
        }else{
            if(this.gameInit){
                director.popScene();
            }else{
                this.loadGame(this.level);
            }
        }
    },

    goNext: function(){
        if(this.levelLayer){
            this.loadGame(this.level + 1);
            this.removeChild(this.levelLayer, true);
            this.levelLayer = null;
        }else{
            var levelLayer = new LevelLayer(this);
            this.addChild(levelLayer, 30);
            this.levelLayer = levelLayer;
        }
    },

    loadGame: function(level){

        if(director.offsetY > 25){
            native.call('showAd');
        }

        level = level || 0;
        var mode = this.mode || 'easy';

        if(!this.weiqi){
            var weiqiLayer = new WeiqiLayer(this);
            this.addChild(weiqiLayer);
            this.weiqi = weiqiLayer.weiqi;
        }

        level = this.weiqi.loadGame(mode, level);
        this.gameover = false;
        if(this.scoreLabel){
            this.removeChild(this.scoreLabel);
            this.scoreLabel = null
        }
        //当前游戏分数
        this.score = 3;
        this.updateScore();

        this.level = level;
        this.gameInit = true;
    },

    init:function (mode) {
        this._super();

        var self = this;

        this.mode = mode;

        this.gameData = UserData.get(this.mode, {current:0, scores:[]}); 
        
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);

        var bgBoard = cc.createSprite('bg-board.png', {
            anchor: [0, 0],
            xy: [0, 0]
        });

        var boardLayer = new GameLayer();
        boardLayer.addChild(TransitionFade.create(0.5, bgBoard));
        boardLayer.delegate(bgBoard);
        boardLayer.setClickAndMove(false);
        this.addChild(boardLayer);           

        this.loadGame(this.gameData.current);

        var boardFrame = cc.createSprite("board-border.png", {
            anchor: [0, 0],
            xy: [0, 0],
            zOrder: 1
        });

        this.addChild(TransitionFade.create(0.5, boardFrame));

        var nextButton = new Button({
                texture: 'button-next.png',
                anchor: [0, 0],
                xy: [250, 5],
                zOrder: 128
            },
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                self.goNext();
            });

        var backButton = new Button({
                texture: 'button-back.png',
                anchor: [0, 0],
                xy: [10, 5],
                zOrder: 128 
            },
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                self.goBack();
            });
        
        this.addChild(nextButton);
        this.addChild(backButton);

        if(this.setKeypadEnabled){   
            this.setKeypadEnabled(true);
        }

        bgBoard.on('touchstart', function(touch){
            if(self.levelLayer){
                var touchLocation = touch.getLocation();
                var scrollView = self.levelLayer.scrollView;

                var local = scrollView.convertToNodeSpace(touchLocation);

                var r = cc.rect(0, 0, 480, 441);
                //cc.log([local.x, local.y]);
                if (cc.rectContainsRect(r, local)) {
                    touch.preventDefault();
                }      
            }
        });

        bgBoard.on('click', function(touch){
            if(self.gameover || self.levelLayer){
                return;
            }
            var touchLocation = touch.getLocation();
            touchLocation = self.convertToNodeSpace(touchLocation);
            var x = Math.round((441 - touchLocation.x) / 43),
                y = Math.round((touchLocation.y - 145) / 43);

            if(x <= 10 && y <= 10){
                if(!self.weiqi.hasStone(x,y)){
                    self.weiqi.proceed(x, y);
                    if(director.offsetY > 25){
                        native.call('hideAd');
                    }
                    self.gameInit = false;
                    self.unregisterDelegate();
                    self.setTimeout(function(){
                        self.registerDelegate();
                    }, 500);
                }
            }
        });

        return true;
    },
    onEnter: function(){
        this._super();
    },
    onExit: function(){
        this._super();

        this.gameData.current = this.level;
        UserData.set(this.mode, this.gameData);

        if(director.offsetY > 25){
            native.call('showAd');
        }
    },
    backClicked: function(){
        this.goBack();
    },
});

var BaseScene = require('cqwrap/scenes.js').BaseScene;

var PlayScene = BaseScene.extend({

    init:function (mode) {
        this._super();

        var bg = new BgLayer('bg-play.png');
        this.addChild(bg);
        
        var main = new MainLayer(mode);
        this.addChild(main, 1);
    },
});

module.exports = PlayScene;
});