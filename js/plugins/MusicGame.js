// var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
// Game_Interpreter.prototype.pluginCommand = function(command, args) {
//     _Game_Interpreter_pluginCommand.call(this, command, args);
//     if (command === 'MusicGame' && args[0] === 'go') {
//         console.log("JIZZ");
//         setInterval(function(){console.log("JIZZ: " + Input.isTriggered('k'));}, 1000);
//     }
// };


// Add a function to ImageManerger to load MG Image;
ImageManager.loadMG = function(filename) {
    return this.loadBitmap('img/MG/', filename, 0, true);
};

// Make savefile id -2 to Music Game Score;
(function(){
    var old = StorageManager.localFilePath;
    StorageManager.localFilePath = function(savefileId){
        if(savefileId == -2)return 'score.rpgsave';
        else return old(savefileId);
    }
    var old = StorageManager.webStorageKey;
    StorageManager.webStorageKey = function(savefileId){
        if(savefileId == -2)return 'RPG Score';
        else return old(savefileId);
    }
})();


// Add seek me function;
AudioManager.seekMe = function() {
    return this._meBuffer.seek();
}

AudioManager.isMePlaying = function() {
    return this._meBuffer && this._meBuffer.isPlaying();
}

AudioManager.loadMe = function(me, fun) {
    if (me.name) {
        this._meBuffer = this.createBuffer('mg', me.name);
        this.updateMeParameters(me);
        this._meBuffer.addLoadListener(fun);
        this._meBuffer.addStopListener(this.stopMe.bind(this));
    }
}

AudioManager.playLoadMe = function() {
    this._meBuffer.play(false);
}


// Music Game Manager

function MGManager() {
    throw new Error('This is a static class');
}

MGManager._difficulty = 0;
MGManager._timeBeforeStart = 5000;
MGManager._speed = 0.1;
MGManager._goodTime = 50;
MGManager._okTime = 150;
MGManager._badTime = 300;

Object.defineProperty(MGManager, 'difficulty', {
    get: function() {
        return this._difficulty;
    },
    set: function(value) {
        this._difficulty = value;
    },
    configurable: true
});

Object.defineProperty(MGManager, 'speed', {
    get: function() {
        return this._speed;
    },
    set: function(value) {
        this._speed = value;
    },
    configurable: true
});

MGManager.setup = function(songId) {
    this.initMembers();
    this.setupSong(songId);
};

MGManager.initMembers = function() {
    this._phase = 'init';
    this._mapBgm = null;
    this._mapBgs = null;
    this._startTime = 0;
    this._song = null;
    this._beats = [];
    this._beatpointer = 0;
    this._score = {};
    this._score.num = [0,0,0,0];
    this._score.comb = 0;
    this._score.comprate = 0.0;
    this._curComb = 0;
    this._passBeat = 0;
    // this._statusWindow = null;
};

MGManager.setupSong = function(songId) {
    this._song = $dataMGSongs[songId].file;
    this._beats = $dataMGSongs[songId].difficulty[this._difficulty].beats;
}

MGManager.startGame = function() {
    AudioManager.loadMe(this._song, function(){
        this._phase = 'play';
        this._startTime = (new Date()).valueOf() + this._timeBeforeStart;
        setTimeout(function(){AudioManager.playLoadMe();}, this._timeBeforeStart);
    }.bind(this));
}

MGManager.updateBeats = function() {
    if(this._phase !== 'play')return [];
    var newBeats = [], p = 0;
    while(this.checkNewBeat()){
        this._beatpointer++;
        p++;
    }
    newBeats.length = p;
    for(var i=0;i<p;i++){
        newBeats[i] = this._beats[this._beatpointer-p+i];
    }
    return newBeats;
}

MGManager.checkNewBeat = function() {
    // 3000 is tmp data;
    return this._beatpointer < this._beats.length &&
            this._beats[this._beatpointer].stTime < this.seek() + 10000;
}

MGManager.saveBgmAndBgs = function() {
    this._mapBgm = AudioManager.saveBgm();
    this._mapBgs = AudioManager.saveBgs();
};

MGManager.replayBgmAndBgs = function() {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    if (this._mapBgs) {
        AudioManager.replayBgs(this._mapBgs);
    }
};

MGManager.seek = function() {
    return new Date() - this._startTime;
}

MGManager.sync = function() {
    if(AudioManager.isMePlaying()){
        this._startTime = (new Date()).valueOf() - AudioManager.seekMe()*1000;
    }
}

MGManager.submit = function(res) {
    console.log(res);
    this._score.num[res]++;
    if(res<2){
        this._curComb++;
    }else{
        this._score.comb = Math.max(this._score.comb, this._curComb);
        this._curComb = 0;
    }
    this.passBeat++;
    console.log("Status :" + this.getResultText(res));
}

MGManager.getResultText = function(res) {
    switch(res){
        case Beat_Base.GOOD:
            return 'GOOD';
        case Beat_Base.OK:
            return 'OK';
        case Beat_Base.BAD:
            return 'BAD';
        case Beat_Base.MISS:
            return 'MISS';
    }
}


// Sprite of Music Game table

function Sprite_MG() {
    this.initialize.apply(this, arguments);
}

Sprite_MG.prototype = Object.create(Sprite_Base.prototype);
Sprite_MG.prototype.constructor = Sprite_MG;

Sprite_MG.prototype.initialize = function(_width, _height) {
    Sprite_Base.prototype.initialize.call(this);
    this._width = _width;
    this._height = _height;
    // 160 is tmp data;
    this._trackw = 160;
    this._trackh = Math.sqrt(Math.pow(this._width, 2) + Math.pow(this._height, 2) - Math.pow(this._trackw, 2));
    this._trackr = Math.atan2(this._width, this._height) - Math.atan2(this._trackw, this._trackh);
    this._heartw = 1/Math.cos(this._trackr)*this._trackw;
    this._hearth = 1/Math.sin(this._trackr)*this._trackw;
    this._trackl = Math.sqrt(Math.pow((this._width - 2*this._heartw)/2, 2) + Math.pow((this._height - this._hearth)/2, 2));
    this._beatr = this._trackr*2 - Math.PI/2;

    this.bitmap = new Bitmap(this._width, this._height);
    this.bitmap.fillAll('#aaa');

    this.createTrack();
}

Sprite_MG.prototype.createTrack = function(_trackw) {
    var tmpb = new Bitmap(this._trackw, this._trackh);
    tmpb.fillAll('#444');

    this._line = [];
    this._line[0] = new Sprite(tmpb);
    this._line[1] = new Sprite(tmpb);

    this._line[0].rotation = -this._trackr;
    this._line[1].rotation = this._trackr;

    this._line[1].move(this._width - Math.cos(this._trackr)*this._trackw, -Math.sin(this._trackr)*this._trackw);

    this.addChild(this._line[0]);
    this.addChild(this._line[1]);

    // is tmp data;
    var tmpb = new Bitmap(this._trackw, this._trackl);
    tmpb.fillAll('#a55');
    var shift = this._trackw * Math.tan(this._beatr);
    console.log(this._beatr);
    var maskshape = [];
    maskshape[0] = [0,0, 0,this._trackl, this._trackw,this._trackl+shift, this._trackw,shift];
    maskshape[1] = [0,0, 0,this._trackl, this._trackw,this._trackl-shift, this._trackw,-shift];

    this._track = [];
    for(var i=0;i<4;i++){
        this._track[i] = new Sprite(tmpb);
        var rot = ((i%2)*2-1)*this._trackr + (i==0||i==3)*Math.PI;
        var x = (this._width + (i-2)%2*this._heartw)/2, y = (this._height + (i-1)%2*this._hearth)/2;
        this._track[i].rotation = rot;
        this._track[i].move(x, y);
        var mask = new PIXI.Graphics();
        mask.beginFill(0);
        mask.drawPolygon(maskshape[i%2]);
        mask.rotation = rot;
        mask.x = x;
        mask.y = y;
        this.addChild(this._track[i]);
        this.addChild(mask);
        this._track[i].mask = mask;
        
    }
}

Sprite_MG.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    MGManager.sync();
    var newBeats = MGManager.updateBeats();
    newBeats.forEach(function(item){
        this.createBeat(item);
    }, this);
    this.checkBeats();
}

Sprite_MG.prototype.createBeat = function(_beat) {
    if(_beat.type === Beat_Base.SINGLE){
        var r = this._beatr * (_beat.position%2*2-1) * -1;
        var beat = new Beat_Single(_beat.stTime, r);
        this._track[_beat.position].addChild(beat);
    }else if(_beat.type === Beat_Base.LONG){
        ;
    }else if(_beat.type === Beat_Base.SLIDE){
        ;
    }
}

Sprite_MG.prototype.checkBeats = function() {
    for(var i=0;i<4;i++){
        if(this._track[i].children.length && this._track[i].children[0].checkMiss()){
            this._track[i].removeChildAt(0);
        }
    }
}


// Scene of Music Game

function Scene_MG() {
    this.initialize.apply(this, arguments);
}

Scene_MG.prototype = Object.create(Scene_Base.prototype);
Scene_MG.prototype.constructor = Scene_MG;

Scene_MG.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);

    // 1920,1080 is tmp data;
    this._width = 1920;
    this._height = 1080;
};

Scene_MG.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    // this.createBackground();

    // 1680,1080 is tmp data;
    this._board = new Sprite_MG(1680, 1080);
    this._board.move((this._width - this._board._width)/2, 0);
    this.addChild(this._board);
};

Scene_MG.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    Graphics.boxWidth = Graphics.width = this._width;
    Graphics.boxHeight = Graphics.height = this._height;
    this.startFadeIn(this.slowFadeSpeed(), false);
    setTimeout(function(){MGManager.startGame();}, 1000);
};

Scene_MG.prototype.update = function() {
    Scene_Base.prototype.update.call(this);

};

Scene_MG.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
};

Scene_MG.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
};

Scene_MG.prototype.createBackground = function() {
    this._backSprite = new Sprite();
    this._backSprite.bitmap = ImageManager.loadMG('background');
    this.addChild(this._backSprite);
};


// Sprite of Music Game Beat

function Beat_Base() {
    this.initialize.apply(this, arguments);
}

Beat_Base.prototype = Object.create(Sprite_Base.prototype);
Beat_Base.prototype.constructor = Beat_Base;

Beat_Base.SINGLE = 0;
Beat_Base.LONG = 1;
Beat_Base.SLIDE = 2;

Beat_Base.GOOD = 0;
Beat_Base.OK = 1;
Beat_Base.BAD = 2;
Beat_Base.MISS = 3;

Beat_Base.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this._pos = 0;
    // 10 is tmp data;
    this._width = 160;
    this._height = 10;

}

Beat_Base.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
}

Beat_Base.prototype.createBitmap = function() {
    ;
}

Beat_Base.prototype.updatePosition = function() {
    ;
}

// Single Beat

function Beat_Single() {
    this.initialize.apply(this, arguments);
}

Beat_Single.prototype = Object.create(Beat_Base.prototype);
Beat_Single.prototype.constructor = Beat_Single;

Beat_Single.prototype.initialize = function(_time, _rotation) {
    Beat_Base.prototype.initialize.call(this);
    this._time = _time;
    this._pos = 0;
    this.rotation = _rotation;

    this.createBitmap();
}

Beat_Single.prototype.update = function() {
    Beat_Base.prototype.update.call(this);
    this.updatePosition();
    this.move(0, this._pos);
}

Beat_Single.prototype.createBitmap = function() {
    Beat_Base.prototype.createBitmap.call(this);
    this.bitmap = new Bitmap(160, 10);
    this.bitmap.fillAll('#0f0');
}

Beat_Single.prototype.updatePosition = function() {
    Beat_Base.prototype.updatePosition.call(this);
    this._pos = (this._time - MGManager.seek()) * MGManager.speed;
}

Beat_Single.prototype.checkMiss = function() {
    // console.log(MGManager.seek() - this._time);
    if(MGManager.seek() - this._time > MGManager._badTime){
        MGManager.submit(Beat_Base.MISS);
        return true;
    }
    return false;
}

// Long Beat 

function Beat_Long() {
    this.initialize.apply(this, arguments);
}

Beat_Long.prototype = Object.create(Beat_Base.prototype);
Beat_Long.prototype.constructor = Beat_Long;

Beat_Long.prototype.initialize = function() {
    Beat_Base.prototype.initialize.call(this);
    this._pos = 0;
    // 10 is tmp data;
    this._width = 160;
    this._height = 10;
    
    this.createBitmap();
}

Beat_Long.prototype.update = function() {
    Beat_Base.prototype.update.call(this);
}

Beat_Long.prototype.createBitmap = function() {
    Beat_Base.prototype.createBitmap.call(this);
}

Beat_Long.prototype.updatePosition = function() {
    Beat_Base.prototype.updatePosition.call(this);
}


// Slide Beat

function Beat_Slide() {
    this.initialize.apply(this, arguments);
}

Beat_Slide.prototype = Object.create(Beat_Base.prototype);
Beat_Slide.prototype.constructor = Beat_Slide;

Beat_Slide.prototype.initialize = function() {
    Beat_Base.prototype.initialize.call(this);
    this._pos = 0;
    // 10 is tmp data;
    this._width = 160;
    this._height = 10;
    
    this.createBitmap();
}

Beat_Slide.prototype.update = function() {
    Beat_Base.prototype.update.call(this);
}

Beat_Slide.prototype.createBitmap = function() {
    Beat_Base.prototype.createBitmap.call(this);
}

Beat_Slide.prototype.updatePosition = function() {
    Beat_Base.prototype.updatePosition.call(this);
}
