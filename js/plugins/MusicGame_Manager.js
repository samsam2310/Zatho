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
    this._score.num = [0,0,0,0];
    this._score.comb = 0;
    this._score.comprate = 0.0;
    this._curComb = 0;
    this._passBeat = 0;
    // this._statusWindow = null;
};

MGManager.setupSong = function(songId, difficulty) {
    this._song = $dataMGSongs[songId].file;
    this._beats = $dataMGSongs[songId].difficulty[difficulty].beats;
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
    while(this._checkNewBeat()){
        this._beatpointer++;
        p++;
    }
    newBeats.length = p;
    for(var i=0;i<p;i++){
        newBeats[i] = this._beats[this._beatpointer-p+i];
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

MGManager.seek = function() {
    return new Date() - this._startTime;
}

MGManager.sync = function() {
    if(AudioManager.isMePlaying()){
        this._startTime = (new Date()).valueOf() - AudioManager.seekMe()*1000;
    }
}

MGManager.submit = function(res) {
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
