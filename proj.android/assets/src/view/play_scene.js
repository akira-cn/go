define(function(require, exports, module){

var BgLayer = require('src/view/bg_layer.js');
var Weiqi = require('src/model/weiqi.js');

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

var LevelLayer = cc.Layer.extend({
    ctor:function(parent){
        this._super();
        this.parent = parent;
        cc.associateWithNative( this, cc.Layer );
    },
    init:function(){
        //this.parent.setAnchorPoint(cc.p(0.5, 0.5));
        //var effect = cc.ScaleBy.create(0.5, 1.15);
        //this.parent.setScale(1.15);
        //this.parent.runAction(effect);
        var self = this;

        var layer = cc.LayerColor.create(cc.c4b(0, 0, 0, 128));
        this.addChild(layer);

        var levelsBg = cc.Sprite.createWithSpriteFrameName('bg-levels.png');
        levelsBg.setAnchorPoint(cc.p(0, 0));
        this.addChild(levelsBg);

        var mode = this.parent.mode;
        var n = WeiqiData[mode].length -  1,
            h = (n / 3) | 0;

        var container = cc.Layer.create();
        container.setAnchorPoint(cc.p(0, 0));
        container.setPosition(cc.p(0, 0));
        container.setContentSize(cc.size(450, 150 * (h+1)));

        var menu = cc.Menu.create();
        menu.setAnchorPoint(cc.p(0, 0));
        menu.setPosition(cc.p(0,  150 * h + 22));
        container.addChild(menu);

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
                        var levelSelected = cc.Sprite.createWithSpriteFrameName(name);
                            levelSelected.setScaleY(0.9);
                            levelSelected.setOpacity(180);        
                        
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

                        labelId = cc.LabelTTF.create((c + 1), "Arial", 27);
                        labelId.setAnchorPoint(cc.p(0.5, 0.5));
                        labelId.setPosition(cc.p(60, 60));
                        labelId.setColor(cc.c3b(0, 0, 0));                 
                        levelSelected.addChild(labelId);

                        var score = self.parent.gameData[self.parent.mode].scores[c];
                        if(score){
                            var labelScore = cc.LabelTTF.create(score, "Arial", 19);
                            labelScore.setAnchorPoint(cc.p(0, 0));
                            labelScore.setPosition(cc.p(82, 82));
                            labelScore.setColor(cc.c3b(155, 0, 0));                 
                            levelNormal.addChild(labelScore);
                        }

                        var menuItem = cc.MenuItemSprite.create(
                            levelNormal,
                            levelSelected,
                            (function(c){
                                return function() {
                                    var offset = scrollView.getContentOffset();
                                    var duce = Math.abs(Math.abs(offset.y) - Math.abs(oldOffset.y));
                                    oldOffset = offset;
                                    //如果移动大于10px，则为移动
                                    if (duce > 10) {
                                        return true;
                                    };
                                    self.parent.loadGame(c);
                                    self.removeFromParent(true);
                                    self.parent.levelLayer = null;

                                    Audio.playEffect('audio/submenu_click.ogg');
                                }
                            })(c), 
                            self                
                        );
                        menuItem.setAnchorPoint(cc.p(0, 0));
                        menuItem.setPosition(cc.p(150 * j, - 150 * i));

                        menu.addChild(menuItem);  

                    }
                    if(Math.abs(level - c) < 9){
                        f();
                    }else{
                        self.setTimeout(f, 0);
                    }
                })(i, j, c);
            }         
        }

        var scrollView = cc.ScrollView.create(cc.size(480, 441), container);
        scrollView.setAnchorPoint(cc.p(0, 0));
        scrollView.setPosition(cc.p(0, 122));
        scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        var offset = scrollView.minContainerOffset();
        offset.y += ((level / 9) | 0) * 450;
        //offset.y += Math.min(h - 2, Math.max(0, ((level / 3) | 0) - 1)) * 300;
        scrollView.setContentOffset(offset);

        this.addChild(scrollView);

        var oldOffset = scrollView.getContentOffset();
        //cc.log([oldOffset.x, oldOffset.y]);

        this.scrollView = scrollView;

        this.resetOffset = function(){
            oldOffset = scrollView.getContentOffset();
        }

        this.setTimeout(function(){
             menu.setHandlerPriority(1);
        },0);
    },
    onExit: function(){
        this._super();
        this.clearAllTimers();
    }
});


var MainLayer = cc.Layer.extend({
    ctor:function(mode){
        this._super();
        this.mode = mode;
        cc.associateWithNative( this, cc.Layer );
    },

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
            levelLayer.init();
            this.addChild(levelLayer, 30);
            this.levelLayer = levelLayer;
        }
    },

    loadGame: function(level){

        if(cc.offsetY > 25){
            cc.native.call('showAd');
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

    init:function () {

        var self = this;
        this.gameData = {
            'easy':{current:0, scores:[]}, 
            'normal':{current:0, scores:[]}, 
            'hard':{current:0, scores:[]}
        };

        var gameData = sys.localStorage.getItem('gameData');
        if(gameData){
            this.gameData = JSON.parse(gameData);
        } 

        this._super();
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);

        this.setTimeout(function(){
            var bgBoard = cc.Sprite.createWithSpriteFrameName("bg-board.png");
            bgBoard.setAnchorPoint(cc.p(0, 0));
            bgBoard.setPosition(cc.p(0, 0));
            self.addChild(SpriteFadeInTR.create(0.5, bgBoard), 0);           

            self.loadGame(self.gameData[self.mode].current);

            var boardFrame = cc.Sprite.createWithSpriteFrameName("board-border.png");
            boardFrame.setAnchorPoint(cc.p(0, 0));
            boardFrame.setPosition(cc.p(0, 0));
            self.addChild(SpriteFadeInTR.create(0.5, boardFrame), 1);

            var nextButton = MenuButton.create('button-next.png', self, function(){
                self.goNext();
            });

            var backButton = MenuButton.create('button-back.png', self, function(){
                self.goBack();
            });
            
            //var size = cc.Director.getInstance().getWinSize();

            var menu = cc.Menu.create(nextButton, backButton);
            menu.setPosition(cc.p(0, 0));
            self.addChild(menu, 128);
            menu.setHandlerPriority(-1000);

            nextButton.setAnchorPoint(cc.p(0, 0));
            nextButton.setPosition(250, 5);

            backButton.setAnchorPoint(cc.p(0, 0));
            backButton.setPosition(cc.p(10, 5));
        }, 800);

        if(this.setKeypadEnabled){   
            this.setKeypadEnabled(true);
        }

        return true;
    },
    onEnter: function(){
        this._super();
        cc.registerTargetedDelegate(0, true, this);
    },
    onExit: function(){
        this.gameData[this.mode].current = this.level;
        sys.localStorage.setItem('gameData', JSON.stringify(this.gameData));
        this.clearAllTimers();
        cc.unregisterTouchDelegate(this);
        if(cc.offsetY > 25){
            cc.native.call('showAd');
        }
    },
    backClicked: function(){
        //cc.Director.getInstance().end();
        this.goBack();
    },
    onTouchBegan:function (touch, event) {
        //cc.log('touchBegain');
        if(this.levelLayer){
            var touchLocation = touch.getLocation();
            var scrollView = this.levelLayer.scrollView;

            this.levelLayer.resetOffset();

            var local = scrollView.convertToNodeSpace(touchLocation);

            var r = cc.rect(0, 0, 480, 441);
            //cc.log([local.x, local.y]);
            if (cc.rectContainsRect(r, local)) {
                return false;
            }else{
                return true;
            }         
        }
        return true;
    },
    onTouchEnded: function(touch, event){
        if(this.gameover || this.levelLayer){
            return;
        }
        var touchLocation = touch.getLocation();
        touchLocation = this.convertToNodeSpace(touchLocation);
        var x = Math.round((441 - touchLocation.x) / 43),
            y = Math.round((touchLocation.y - 145) / 43);
        var self = this;

        if(x <= 10 && y <= 10){
            //console.log('>>>' + [x, y]);
            if(!this.weiqi.hasStone(x,y)){
                this.weiqi.proceed(x, y);
                if(cc.offsetY > 25){
                    cc.native.call('hideAd');
                }
                this.gameInit = false;
                cc.unregisterTouchDelegate(this);
                this.setTimeout(function(){
                    cc.registerTargetedDelegate(0, true, self);
                }, 500);
            }/*else{
                cc.log(JSON.stringify(this.weiqi.getJointStones(x,y)));
            }*/
        }
        //cc.log([touchLocation.x, touchLocation.y, x, y]);
    }
});

var PlayScene = cc.Scene.extend({
    ctor:function(mode) {
        this._super();
        this.mode = mode;
        cc.associateWithNative( this, cc.Scene );
    },

    onEnter:function () {
        this._super();

        var bg = new BgLayer('bg-play.png');
        this.addChild(bg);
        bg.init();

        cc.offsetY = cc.offsetY || 0;
        
        var main = new MainLayer(this.mode);
        main.setAnchorPoint(cc.p(0, 0));
        main.setPosition(cc.p(0, cc.offsetY));
        this.addChild(main);
        main.init();
    }
});

module.exports = PlayScene;
});