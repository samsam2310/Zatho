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

Beat_Base.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this._pos = 0;
    // 10 is tmp data;
    this._width = 160;
    this._height = 10;

    // 1000 is tmp data;
    this.move(0, 1000);
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

Beat_Base.prototype._getResult = function(gap) {
    if(gap < MGManager._preOKTime){
        return Beat_Base.BAD;
    }else if(gap < MGManager._preGoodTime){
        return Beat_Base.OK;
    }else if(gap < MGManager._goodTime){
        return Beat_Base.GOOD;
    }else if(gap < MGManager._okTime){
        return Beat_Base.OK;
    }else if(gap < MGManager._badTime){
        return Beat_Base.BAD;
    }else{
        return Beat_Base.MISS;
    }
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
    if(MGManager.seek() - this._time > MGManager._badTime){
        MGManager.submit(Beat_Base.MISS);
        return true;
    }
    return false;
}

Beat_Single.prototype.trigger = function(ispush) {
    if(ispush){
        var gap = MGManager.seek() - this._time;
        if(gap < MGManager._preBadTime){
            return false;
        }else {
            MGManager.submit(this._getResult(gap));
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

Beat_Long.prototype.initialize = function(_time, _length, _rotation, _isInverse) {
    Beat_Base.prototype.initialize.call(this);
    this._time = _time;
    this._length = _length;
    this.rotation = _rotation;
    this._isInverse = _isInverse;
    this._firstState = -1;

    this.createBitmap();
}

Beat_Long.prototype.update = function() {
    Beat_Base.prototype.update.call(this);
    this.updatePosition();
    this.move(0, this._pos);
    // this.move(0,10);
}

Beat_Long.prototype.createBitmap = function() {
    Beat_Base.prototype.createBitmap.call(this);
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
    Beat_Base.prototype.updatePosition.call(this);
    this._pos = (this._time - MGManager.seek()) * MGManager.speed;
}

Beat_Long.prototype.setfirstState = function(_state) {
    this._firstState = _state;
}

Beat_Long.prototype.submitResult = function(_state) {
    MGManager.submit(Math.max(this._firstState, _state));
}

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

Beat_Long.prototype.trigger = function(ispush) {
    if(ispush){
        var gap = MGManager.seek() - this._time;
        if(gap < MGManager._preBadTime){
            return false;
        }else{
            this.setfirstState(this._getResult(gap));
        }
        return false;
    }else{
        var gap = MGManager.seek() - this._time - this._length;
        if(this._firstState === -1){
            return false;
        }else if(gap < MGManager._preBadTime){
            this.submitResult(Beat_Base.MISS);
        }else{
            this.submitResult(this._getResult(gap));
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
