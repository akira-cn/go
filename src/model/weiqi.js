define(function(require, exports, module){

var sgf = require('src/model/sgf.js');
var EventEmitter = require('cqwrap/events').EventEmitter;

//棋盘
function initBoard(size){
	var ret = [];
	for(var i = 0; i < size; i++){
		ret[i] = [];
		for(var j = 0; j < size; j++){
			ret[i][j] = null;
		}
	}
	return ret;
}

function Weiqi(size){
	//构造一个x * y的棋盘
	size = size || 19;

	this._board = initBoard(size);
	this._forbid = {x:-1, y:-1};	//用来存放禁手点（打劫用）
}

cc.inherits(Weiqi, EventEmitter);

Weiqi.prototype.hasStone = function(x, y, type){
	cc.Assert(this.valid(x, y), 'invalid position: ' + x + ',' + y);
	if(!type){
		return !!this._board[x][y];
	}else{
		return !!this._board[x][y] && this._board[x][y].type == type;
	}
}

Weiqi.prototype.putStone = function(x, y, type, cursor){
	//cc.log('put:' + [x,y, type]);
	cc.Assert(this.valid(x, y), 'invalid position: ' + x + ',' + y);
	cc.Assert(!this.hasStone(x, y), 'already has stone: ' + [x, y]);

	if(this._forbid.x == x && this._forbid.y == y){
		return false;
	}
	this._forbid = {x:-1, y:-1};

	this._board[x][y] = {x:x, y:y, type: type, sprite: null};

	var opType = type == 'black' ? 'white' : 'black';
	var self = this;
	var takes = [];

	function takeStones(x, y){
		if(self.valid(x, y) && self.hasStone(x, y, opType)){
			var res = self.getJointStones(x, y);
			if(res.liberties.length <= 0){
				for(var i = 0; i < res.stones.length; i++){
					var stone = res.stones[i];
					self.takeStone(stone.x, stone.y);
					takes.push([stone.x, stone.y]);
				}
			}	
		}	
	}

	takeStones(x - 1, y);
	takeStones(x + 1, y);
	takeStones(x, y - 1);
	takeStones(x, y + 1);

	var res = this.getJointStones(x, y);
	if(res.liberties.length <= 0){
		this._board[x][y] = null;
		return false;
	}
	if(res.stones.length == 1 && res.liberties.length == 1 && takes.length == 1){
		//只有一口气，并且提过一子
		this._forbid = {x:takes[0][0], y:takes[0][1]};
	}

	this.emit('put', this._board[x][y], this._board, cursor);

	return true;
}

Weiqi.prototype.takeStone = function(x, y){
	cc.Assert(this.hasStone(x, y), 'no stone');
	var stone = this._board[x][y];
	this._board[x][y] = null;
	this.emit('take', stone);
}

Weiqi.prototype.valid = function(x, y){
	var size = this._board.length;
	return x >= 0 && x < size && y >= 0 && y < size;
}

Weiqi.prototype.getStone = function(x, y){
	cc.Assert(this.valid(x, y), 'invalid position: ' + x + ',' + y);
	return this._board[x][y];
}

//获得所有相连的棋子和"气"
Weiqi.prototype.getJointStones = function(x, y){
	var size = this._board.length;
	var tmp =  initBoard(size);

	var ret = {stones: [], liberties: []};
	if(!this.hasStone(x,y)){
		return ret;
	}

	var type = this._board[x][y].type;
	var self = this;

	function getJoints(x, y){
		if(!self.valid(x, y) || tmp[x][y]){
			return;
		}
		tmp[x][y] = 1;
		if(self.hasStone(x, y, type)){
			ret.stones.push(self.getStone(x, y));
			getJoints(x-1, y);
			getJoints(x+1, y);
			getJoints(x, y-1);
			getJoints(x, y+1);
		}
		if(!self.hasStone(x, y)){
			ret.liberties.push([x, y]);
		}
	}

	getJoints(x, y);

	return ret;
}

Weiqi.prototype.reset = function(){
	var size = this._board.length;
	for(var i = 0; i < size; i++){
		for(var j = 0; j < size; j++){
			if(this.hasStone(i, j)){
				this.takeStone(i, j);
			}
		}
	}
}

Weiqi.prototype.loadGame = function(mode, level){
	this.reset();

	level = level % WeiqiData[mode].length;

	var parser = new sgf.Parser();
	var res = parser.parse(WeiqiData[mode][level]);
	//cc.log(JSON.stringify(res));	
	if(res){
		var game = res[0],
			firstNode = game[0];

		this.mode = [0, 0];

		if(firstNode){
			//cc.log(JSON.stringify(firstNode));
			var aw = firstNode.AW;
			if(aw){
				//检查象限
				for(var i = 0; i < aw.length; i++){
					var p = aw[i];
					if(p[0] > 'k'){
						this.mode[0] = 1;
					}
					if(p[1] > 'k'){
						this.mode[1] = 1;
					}
				}
				for(var i = 0; i < aw.length; i++){
					var pos = this.getXY(aw[i]);
					//console.log(pos);
					this.putStone(pos[0], pos[1], 'white');
				}
			}

			var ab = firstNode.AB;
			if(ab){
				for(var i = 0; i < ab.length; i++){
					var pos = this.getXY(ab[i]);
					//console.log(pos);
					this.putStone(pos[0], pos[1], 'black');
				}
			}
			firstNode.C = firstNode.C || [];
			firstNode.C.unshift('[ ' + mode[0].toUpperCase() + mode.slice(1) + ' - ' + (level + 1) + ' ]');
			this.emit('comment', firstNode.C);
			this.emit('label', firstNode.LB || []);
		}

		var gameNode = game.slice(1);
		if(gameNode && gameNode instanceof Array){
			this.gameNode = {branch:gameNode, idx: 0};
		}else{
			throw new Error('game data corrupt!');
		}
	}
	return level;
}

Weiqi.prototype.getXY = function(pos){
	var self = this;
	return pos.split('').map(function(o, i){
		var p = "abcdefghijk".indexOf(o);
		if(self.mode[i]){
			p = 10 - "ijklmnopqrs".indexOf(o);
		}
		cc.Assert(p >= 0, "invalid pos!" + pos + ':' + self.mode);
		return p;
	});
}

//得到下一步棋
Weiqi.prototype.proceed = function(x, y){
	var branch = this.gameNode.branch,
		idx = this.gameNode.idx,
		self = this;

	var human = 'black', pc = 'white';

	if(!branch[idx]){
		//cc.log('游戏结束');
		this.emit('gameover', -3);
		return false;
	}

	humanSide = branch[idx] instanceof Array? branch[idx][0] : branch[idx];
	if(!humanSide[human[0].toUpperCase()]){
		var tmp = human;
		human = pc;
		pc = tmp;
	}
	
	if(branch[idx] instanceof Array){
		var sel = [branch[idx][0]];
		var i = 1;
		while(branch[idx + i]){
			sel.push(branch[idx + i][0]);
			i++;
		}
		//cc.log(JSON.stringify(sel));
		for(var i = 0; i < sel.length; i++){
			var currentStep = sel[i];
			//console.log(JSON.stringify(currentStep));
			var pos = currentStep[human[0].toUpperCase()][0];
			cc.Assert(pos, 'no step!!');
			pos = this.getXY(pos);
			if(pos[0] == x && pos[1] == y){
				this.putStone(x, y, human, true);
				this.emit('comment', currentStep.C);
				this.emit('label', currentStep.LB || []);

				var nextStep = branch[idx + i][1];
				if(!nextStep){
					//cc.log('游戏结束');
					this.emit('gameover', currentStep.SC?currentStep.SC[0]:2);
					return false;
				}
				//cc.log('step:'+JSON.stringify(nextStep));
				pos = nextStep[pc[0].toUpperCase()][0];
				cc.Assert(pos, 'no step!!');
				pos = this.getXY(pos);
				setTimeout(function(){
					self.putStone(pos[0], pos[1], pc, true);
					self.emit('comment', nextStep.C);
					self.emit('label', nextStep.LB || []);

					if(!self.gameNode.branch[self.gameNode.idx]){
						//cc.log('游戏结束');
						self.emit('gameover', nextStep.SC?nextStep.SC[0]:-3);
					}
				}, 500);
				
				this.gameNode.branch = branch[idx + i];
				this.gameNode.idx = 2;

				return true;
			}			
		}
	}else{
		var currentStep = branch[idx];
		var pos = currentStep[human[0].toUpperCase()][0];
		cc.Assert(pos, 'no step!!');
		pos = this.getXY(pos);

		if(pos[0] == x && pos[1] == y){
			this.putStone(x, y, human, true);
			this.emit('comment', currentStep.C);
			this.emit('label', currentStep.LB || []);

			var nextStep = branch[idx + 1];
			if(!nextStep){
				//cc.log('游戏结束');
				this.emit('gameover', currentStep.SC?currentStep.SC[0]:2);
				return false;
			}
			pos = nextStep[pc[0].toUpperCase()][0];
			cc.Assert(pos, 'no step!!');
			pos = this.getXY(pos);

			setTimeout(function(){
				self.putStone(pos[0], pos[1], pc, true);
				self.emit('comment', nextStep.C);
				self.emit('label', nextStep.LB || []);

				if(!self.gameNode.branch[self.gameNode.idx]){
					//cc.log('游戏结束');
					self.emit('gameover', nextStep.SC?nextStep.SC[0]:-3);
				}
			}, 500);

			this.gameNode.idx += 2;
						
			return true;
		}
	}

	this.emit('put_error', x, y);
	return false;
}

module.exports = Weiqi;

});