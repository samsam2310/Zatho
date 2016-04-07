/** Music Game Plugin of Zatho
  * MGManager.
  * 
  * TODO: doc
*/


// Music Game Manager

function MGManager() {
    throw new Error('This is a static class');
}

MGManager._timeBeforeStart = 5000;
MGManager._timeAfterEnd = 5000;
MGManager._speed = 0.1;
MGManager._preBadTime = -1000;
MGManager._preOKTime = -150;
MGManager._preGoodTime = -50;
MGManager._goodTime = 50;
MGManager._okTime = 150;
MGManager._badTime = 300;

Object.defineProperty(MGManager, 'speed', {
    get: function() {
        return this._speed;
    },
    set: function(value) {
        this._speed = value;
    },
    configurable: true
});

MGManager.setup = function(songId, difficulty) {
    this.initMembers();
    this.setupSong(songId, difficulty);
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
    this._score.count = [0,0,0,0];
    this._score.comb = 0;
    this._score.point = 0;
    this._score.comprate = 0.0;
    this._curComb = 0;
    this._passBeat = 0;

    this._saveWidth = 0;
    this._saveHight = 0;
    this._saveBoxWidth = 0;
    this._saveBoxHight = 0;
    // this._statusWindow = null;
};

MGManager.setupSong = function(songId, difficulty) {
    this._song = $dataMGSongs[songId].file;
    this._beats = $dataMGSongs[songId].difficulty[difficulty].beats.clone();
    for(var i = 0; i < this._beats; i++) {
        this._beats[i].id = i;
        this._beats[i].cmplt = 0;
    }
}

MGManager.startGame = function() {
    if(this._phase !== 'init'){
        console.error('MGManager Start Game Error, Not Init yet!!');
        return;
    }
    AudioManager.loadMe(this._song, function(){
        this._phase = 'play';
        this._startTime = (new Date()).valueOf() + this._timeBeforeStart;
        setTimeout(function(){AudioManager.playLoadMe();}, this._timeBeforeStart);
    }.bind(this));
}

MGManager.endGame = function() {
    this._phase = 'end';
    console.log('End Game');
    setTimeout(function(){
        SceneManager.goto(Scene_MGScore);
    }, this._timeAfterEnd);
}

MGManager.terminate = function() {
    this._phase = 'terminate';
}

MGManager.updateBeats = function() {
    if(this._phase !== 'play')return [];
    var newBeats = [], p = 0;
    while(this._checkNewBeat()){
        this._beatpointer++;
        p++;
    }
    newBeats.length = p;
    for(var i=0;i<p;i++){
        newBeats[i] = JsonEx.makeDeepCopy(this._beats[this._beatpointer-p+i]);
        newBeats[i].id = this._beatpointer-p+i;
    }
    return newBeats;
}

MGManager._checkNewBeat = function() {
    // 10000 is tmp data;
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

MGManager.saveWidthAndHight = function() {
    this._saveBoxWidth = Graphics.boxWidth;
    this._saveWidth = Graphics.width;
    this._saveBoxHight = Graphics.boxHeight;
    this._saveHight = Graphics.height;
}

MGManager.resetWidthAndHight = function() {
    Graphics.boxWidth = this._saveBoxWidth;
    Graphics.width = this._saveWidth;
    Graphics.boxHeight = this._saveBoxHight;
    Graphics.height = this._saveHight;
}

MGManager.seek = function() {
    return new Date() - this._startTime;
}

MGManager.sync = function() {
    if(AudioManager.isMePlaying()){
        this._startTime = (new Date()).valueOf() - AudioManager.seekMe()*1000;
    }
}

MGManager.submit = function(id, grade, point) {
    this._beats[id].state++;
    if(this._beats[id].state>1)console.error("JIZZ! beats submit twice!! beat ID: "+id);
    this._score.count[grade]++;
    this._score.point += point;
    if(grade<2){
        this._curComb++;
    }else{
        this._score.comb = Math.max(this._score.comb, this._curComb);
        this._curComb = 0;
    }
    this._passBeat++;
    if(this._passBeat === this._beats.length){
        this.endGame();
    }
    console.log("Beat id: "+id +' ; Status : ' + this.getResultText(grade));
}

MGManager.getResultText = function(grade) {
    switch(grade){
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
