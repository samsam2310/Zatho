/** Music Game Plugin of Zatho
  * Object.
  *
  * TODO: doc
*/


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

Beat_Base.GOOD_SCORE = 300;
Beat_Base.OK_SCORE = 200;
Beat_Base.BAD_SCORE = 100;
Beat_Base.MISS_SCORE = 0;

Beat_Base.getGrade = function(gap) {
    if(gap < MGManager._preBadTime){
        return this.MISS;
    }else if(gap < MGManager._preOKTime){
        return this.BAD;
    }else if(gap < MGManager._preGoodTime){
        return this.OK;
    }else if(gap < MGManager._goodTime){
        return this.GOOD;
    }else if(gap < MGManager._okTime){
        return this.OK;
    }else if(gap < MGManager._badTime){
        return this.BAD;
    }else{
        return this.MISS;
    }
}

Beat_Base.getScore = function(grade) {
    if(grade === Beat_Base.MISS){
        return this.MISS_SCORE;
    }else if(grade === Beat_Base.BAD){
        return this.BAD_SCORE;
    }else if(grade === Beat_Base.OK){
        return this.OK_SCORE;
    }else if(grade === Beat_Base.GOOD){
        return this.GOOD_SCORE;
    }
}

Beat_Base.prototype.initialize = function(id) {
    Sprite_Base.prototype.initialize.call(this);
    this._id = id;
}

Beat_Base.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    this.updatePosition();
}

Beat_Base.prototype.submitResult = function(grade) {
    MGManager.submit(this._id, grade, Beat_Base.getScore(grade));
}


// Single Beat

function Beat_Single() {
    this.initialize.apply(this, arguments);
}

Beat_Single.prototype = Object.create(Beat_Base.prototype);
Beat_Single.prototype.constructor = Beat_Single;

Beat_Single.prototype.initialize = function(id, _time, _rotation) {
    Beat_Base.prototype.initialize.call(this, id);
    this._time = _time;
    this.rotation = _rotation;
    // 1000 is tmp data;
    this.y = 1000;

    this.createBitmap();
}

// Beat_Single.prototype.update = function() {
//     Beat_Base.prototype.update.call(this);
// }

Beat_Single.prototype.createBitmap = function() {
    this.bitmap = new Bitmap(160, 10);
    this.bitmap.fillAll('#0f0');
}

Beat_Single.prototype.updatePosition = function() {
    this.y = (this._time - MGManager.seek()) * MGManager.speed;
}

// return true will remove this beat;
Beat_Single.prototype.checkMiss = function() {
    if(MGManager.seek() - this._time > MGManager._badTime){
        this.submitResult(Beat_Base.MISS);
        return true;
    }
    return false;
}

// return true will remove this beat;
Beat_Single.prototype.trigger = function(ispush) {
    if(ispush){
        var gap = MGManager.seek() - this._time;
        if(gap < MGManager._preBadTime){
            return false;
        }else {
            this.submitResult(Beat_Base.getGrade(gap));
        }
        return true;
    }
}

// Long Beat 

function Beat_Long() {
    this.initialize.apply(this, arguments);
}

Beat_Long.prototype = Object.create(Beat_Base.prototype);
Beat_Long.prototype.constructor = Beat_Long;

Beat_Long.prototype.initialize = function(id, _time, _length, _rotation, _isInverse) {
    Beat_Base.prototype.initialize.call(this, id);
    this._time = _time;
    this._length = _length;
    this.rotation = _rotation;
    this._isInverse = _isInverse;
    this._firstState = -1;
     // 1000 is tmp data;
    this.y = 1000;

    this.createBitmap();
}

// Beat_Long.prototype.update = function() {
//     Beat_Base.prototype.update.call(this);
// }

Beat_Long.prototype.createBitmap = function() {
    var _back, _fir, _sec;
    _back = new Sprite();
    _back.bitmap = new Bitmap(320, this._length*MGManager._speed);
    _back.bitmap.fillAll('#55a');
    _back.move(this._isInverse?-160:0, 5);
    _fir = new Sprite();
    _fir.bitmap = new Bitmap(320, 10);
    _fir.bitmap.fillAll('#0f0');
    _fir.move(this._isInverse?-160:0, 0);
    _sec = new Sprite();
    _sec.bitmap = new Bitmap(320, 10);
    _sec.bitmap.fillAll('#0f0');
    _sec.move(this._isInverse?-160:0, this._length*MGManager._speed);
    this.addChild(_back);
    this.addChild(_fir);
    this.addChild(_sec);
}

Beat_Long.prototype.updatePosition = function() {
    this.y = (this._time - MGManager.seek()) * MGManager.speed;
}

Beat_Long.prototype.setfirstState = function(_state) {
    this._firstState = _state;
}

Beat_Long.prototype.submitResult = function(_state) {
    Beat_Base.prototype.submitResult.call(this, Math.max(this._firstState, _state));
}

// return true will remove this beat;
Beat_Long.prototype.checkMiss = function() {
    if(this._firstState === -1){
        if(MGManager.seek() - this._time > MGManager._badTime){
            this.setfirstState(Beat_Base.MISS);
            return false;
        }
    }else{
        if(MGManager.seek() - this._time - this._length > MGManager._badTime){
            this.submitResult(Beat_Base.MISS);
            return true;
        }
    }
    return false;
}

// return true will remove this beat;
Beat_Long.prototype.trigger = function(ispush) {
    if(ispush){
        var gap = MGManager.seek() - this._time;
        if(gap < MGManager._preBadTime){
            return false;
        }else{
            this.setfirstState(Beat_Base.getGrade(gap));
        }
        return false;
    }else{
        var gap = MGManager.seek() - this._time - this._length;
        if(this._firstState === -1){
            return false;
        }else{
            this.submitResult(Beat_Base.getGrade(gap));
        }
        return true;
    }
}


// Slide Beat

function Beat_Slide() {
    this.initialize.apply(this, arguments);
}

Beat_Slide.prototype = Object.create(Beat_Base.prototype);
Beat_Slide.prototype.constructor = Beat_Slide;

Beat_Slide.prototype.initialize = function(id, _time, _length, _width, _height, _isRev) {
    Beat_Base.prototype.initialize.call(this, id);
    this._time = _time;
    this._length = _length;
    this._width = _width;
    this._height = _height;
    this._isRev = _isRev;
    this.x = _isRev?_width:0;
    this.y = _isRev?_height:0;
    this.rotation = _isRev?Math.PI:0;
    this.visible = false;
    this.initMembers();

    this.createBitmap();
}

Beat_Slide.prototype.initMembers = function() {
    this._pointer = null;
    this._playerPos = this._height/20;
    this._checkPoint = [];
    this._checkPoint.length = 10;
}

// Beat_Slide.prototype.update = function() {
//     Beat_Base.prototype.update.call(this);
// }

Beat_Slide.prototype.createBitmap = function() {
    this.bitmap = new Bitmap(this._width, this._height);
    this.mask = new PIXI.Graphics();
    this.mask.beginFill(0xffffff);
    this.mask.drawRect(0,0, this._width, this._height);
    this.addChild(this.mask);

    this._pointer = new Sprite();
    this._pointer.bitmap = new Bitmap(this._width, 10);
    this._pointer.bitmap.fillAll('#3d3');
    this.addChild(this._pointer);

    for(var i=0;i<10;i++){
        this._checkPoint[i] = new Sprite();
        this._checkPoint[i].bitmap = new Bitmap(this._width, 10);
        this._checkPoint[i].bitmap.fillAll('#33d');
        this._checkPoint[i].y = this._height/10*i + this._height/20;
        this.addChild(this._checkPoint[i]);
    }
}

Beat_Slide.prototype.updatePosition = function() {
    this._pointer.y  = (MGManager.seek() - this._time) / this._length * (this._height-this._height/20);
    // 1000 is tmp data;
    if(!this.visible && (this._time - MGManager.seek()) < 1000)this.visible = true;
}

// return true will remove this beat;
Beat_Slide.prototype.checkMiss = function() {
    if(MGManager.seek() - this._time - this._length > MGManager._badTime){
        this.submitResult(Beat_Base.MISS);
        return true;
    }
    return false;
}

// return true will remove this beat;
Beat_Slide.prototype.trigger = function(x1, x2) {
    if(!this.visible)return false;
    if(x1-x2 > 0 !== this._isRev)return false;
    if(this._isRev){
        x1 = this._height - x1;
        x2 = this._height - x2;
    }
    // 5 is tmp data;
    if(x1>this._playerPos+5 && x2>this._playerPos)return false;
    this._playerPos = x2;
    while(this._checkPoint[0].y>this._playerPos === this._isRev){
        this._checkPoint[0].bitmap.fillAll('#d33');
        this._checkPoint.shift();
        if(this._checkPoint.length === 0){
            var gap = MGManager.seek() - this._time - this._length;
            console.log("Slide Gap: "+gap);
            this.submitResult(Beat_Base.getGrade(gap));
            return true;
        }
    }
    return false;
}