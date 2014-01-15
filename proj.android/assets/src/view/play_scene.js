define(function(require, exports, module){

var Weiqi = require('src/model/weiqi');
var Button = require('cqwrap/buttons').Button;
var BgLayer = require('cqwrap/layers').BgLayer,
    GameLayer = require('cqwrap/layers').GameLayer;

var Audio = require('cqwrap/audio').Audio;
var SpriteFadeInTR = require('cqwrap/effects').SpriteFadeInTR;

function putStone(stone, boardSprite, cursor){
    var x = stone.x, y = stone.y, color = stone.type;
    var stoneSprite = cc.Sprite.createWithSpriteFrameName(color+".png");
    x = 437 - x * 43;
    y = 40 + y * 43;
    //console.log([x, y]);
    stoneSprite.setAnchorPoint(cc.p(0.5, 0.5));
    stoneSprite.setPosition(cc.p(x, y));
    boardSprite.addChild(SpriteFadeInTR.create(0.5, stoneSprite));
    stone.sprite = stoneSprite;

    if(cursor){
        var cursorSprite = boardSprite.cursor;
        
        if(!boardSprite.cursor){
            cursorSprite = cc.Sprite.createWithSpriteFrameName("cursor.png");
            cursorSprite.setAnchorPoint(cc.p(0.5, 0.5));
            cursorSprite.setPosition(cc.p(x, y));
            boardSprite.addChild(cursorSprite, 10);
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

var WeiqiLayer = cc.Layer.extend({
    ctor: function(parent){
        this._super();
        this.parent = parent;
        cc.associateWithNative( this, cc.Layer );        
    },

    init: function(){
        var boardSprite = cc.Sprite.createWithSpriteFrameName("board.png");
        boardSprite.setAnchorPoint(cc.p(0, 0));
        boardSprite.setPosition(cc.p(5, 110));
        this.addChild(SpriteFadeInTR.create(0.5, boardSprite, 150));

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
                var labelSprite = cc.LabelTTF.create(mark, "Arial", 16);
                labelSprite.setAnchorPoint(cc.p(0.5, 0.5));
                labelSprite.setPosition(cc.p(x, y));
                labelSprite.setColor(cc.c3b(0, 0, 0));                 
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

        var levelsBg = cc.Sprite.createWithSpriteFrameName('bg-levels.png');
        levelsBg.setAnchorPoint(cc.p(0, 0));
        this.addChild(levelsBg);

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
                        var levelNormal = cc.Sprite.createWithSpriteFrameName(name);      
                        
                        var labelId = cc.LabelTTF.create((c + 1), "Arial", 27);
                        labelId.setAnchorPoint(cc.p(0.5, 0.5));
                        labelId.setPosition(cc.p(60, 60));
                        labelId.setColor(cc.c3b(0, 0, 0));                 
                        levelNormal.addChild(labelId);

                        if(c == level){
                            var levelCurrent = cc.Sprite.createWithSpriteFrameName('selected.png');
                            levelCurrent.setAnchorPoint(cc.p(0.5, 0.5));
                            levelCurrent.setPosition(cc.p(65, 55));
                            levelNormal.addChild(levelCurrent);
                        }

                        var score = self.parent.gameData[self.parent.mode].scores[c];
                        if(score){
                            var labelScore = cc.LabelTTF.create(score, "Arial", 19);
                            labelScore.setAnchorPoint(cc.p(0, 0));
                            labelScore.setPosition(cc.p(82, 82));
                            labelScore.setColor(cc.c3b(155, 0, 0));                 
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

                        menuItem.setAnchorPoint(cc.p(0, 0));
                        menuItem.setPosition(cc.p(150 * j, 150 * (h - i) + 16));
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

        
        scrollView.setAnchorPoint(cc.p(0, 0));
        scrollView.setPosition(cc.p(0, 122));
        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        var offset = scrollView.minContainerOffset();
        offset.y += ((level / 9) | 0) * 450;
        scrollView.setContentOffset(offset);

        this.addChild(scrollView, 1);

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
        var label = cc.LabelTTF.create(comment, "Arial", 19);
        label.setPosition(cc.p(35, 670));
        label.setAnchorPoint(cc.p(0, 1.0));
        label.setColor(cc.c3b(0, 0, 0)); 
        label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        label.setDimensions(cc.size(410, 80));
        this.addChild(label, 15); 
        this.commentLabel = label;  
        return true;     
    },

    updateScore: function(){
        var score = this.score;
        if(this.scoreSprite){
            this.removeChild(this.scoreSprite, true);
            this.scoreSprite = null;
        }
        this.scoreSprite = cc.Sprite.create();

        for(var i = 0; i < 3; i++){
            if(i < score){
                var heart = cc.Sprite.createWithSpriteFrameName("heart-red.png");
                heart.setPosition(cc.p(438 - i * 45, 700));
                heart.setAnchorPoint(cc.p(0.5, 0.5));
                this.scoreSprite.addChild(heart, 15); 
            }else{
                var heart = cc.Sprite.createWithSpriteFrameName("heart-grey.png");
                heart.setPosition(cc.p(438 - i * 45, 700));
                heart.setAnchorPoint(cc.p(0.5, 0.5));
                this.scoreSprite.addChild(heart, 15); 
            }
        }
        this.addChild(this.scoreSprite, 15);
    },

    showScore: function(score){
        var label = cc.LabelTTF.create(score, "Arial", 277);
        label.setPosition(cc.p(235, 300));
        label.setAnchorPoint(cc.p(0, 0));
        label.setColor(cc.c3b(200, 0, 0)); 
        this.addChild(label, 15); 
        this.scoreLabel = label;

        var effect = cc.MoveBy.create(0.5, cc._p(-150, 150) ),
            effect2 = cc.ScaleBy.create(0.5, 0.2);
        label.runAction(effect);
        label.runAction(effect2);

        this.gameData[this.mode].scores[this.level] = score;
        sys.localStorage.setItem('gameData', JSON.stringify(this.gameData));
    },

    goBack: function(){
        if(this.levelLayer){
            this.removeChild(this.levelLayer, true);
            this.levelLayer = null;
        }else{
            if(this.gameInit){
                var MenuScene = require('src/view/menu_scene.js');
                var playScene = new MenuScene();
                var scene = cc.TransitionFade.create(0.8, playScene);

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
            weiqiLayer.init();
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

        this.gameData = {
            'easy':{current:0, scores:[]}, 
            'normal':{current:0, scores:[]}, 
            'hard':{current:0, scores:[]}
        };

        var gameData = sys.localStorage.getItem('gameData');
        if(gameData){
            this.gameData = JSON.parse(gameData);
        } 

        
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);

        var bgBoard = cc.Sprite.createWithSpriteFrameName("bg-board.png");
        bgBoard.setAnchorPoint(cc.p(0, 0));
        bgBoard.setPosition(cc.p(0, 0));

        var boardLayer = new GameLayer();
        boardLayer.setClickAndMove(false);
        boardLayer.addChild(SpriteFadeInTR.create(0.5, bgBoard));
        boardLayer.delegate(bgBoard);
        boardLayer.setClickAndMove(false);
        this.addChild(boardLayer);           

        this.loadGame(this.gameData[this.mode].current);

        var boardFrame = cc.Sprite.createWithSpriteFrameName("board-border.png");
        boardFrame.setAnchorPoint(cc.p(0, 0));
        boardFrame.setPosition(cc.p(0, 0));
        this.addChild(SpriteFadeInTR.create(0.5, boardFrame), 1);

        var nextButton = new Button('button-next.png', 
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                self.goNext();
            });

        var backButton = new Button('button-back.png', 
            function(){
                Audio.playEffect('audio/btnclick.ogg');
                self.goBack();
            });
        
        //var size = cc.Director.getInstance().getWinSize();
        
        nextButton.setAnchorPoint(cc.p(0, 0));
        nextButton.setPosition(250, 5);
        this.addChild(nextButton, 128);

        backButton.setAnchorPoint(cc.p(0, 0));
        backButton.setPosition(cc.p(10, 5));
        this.addChild(backButton, 128);

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
        this.gameData[this.mode].current = this.level;
        sys.localStorage.setItem('gameData', JSON.stringify(this.gameData));
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