/** Music Game Plugin of Zatho
  * Sprite.
  *
  * TODO: doc
*/


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
    this.initMembers();

    this.bitmap = new Bitmap(this._width, this._height);
    this.bitmap.fillAll('#aaa');

    this.createXTrack();
    this.createButton();
    this.createSlideTrack();
    this.inputInit();
}

Sprite_MG.prototype.initMembers = function() {
    // 160 is tmp data;
    this._trackw = 160;
    this._trackh = Math.sqrt(Math.pow(this._width, 2) + Math.pow(this._height, 2) - Math.pow(this._trackw, 2));
    this._trackr = Math.atan2(this._width, this._height) - Math.atan2(this._trackw, this._trackh);
    this._heartw = this._trackw/Math.cos(this._trackr);
    this._hearth = this._trackw/Math.sin(this._trackr);
    this._trackl = Math.sqrt(Math.pow((this._width - 2*this._heartw)/2, 2) + Math.pow((this._height - this._hearth)/2, 2));
    this._beatr = this._trackr*2 - Math.PI/2;
    this._buttonw = this._heartw+Math.pow(this._hearth,2)/this._heartw;
    this._buttonShape = [
        [0,0, this._heartw,this._hearth, this._buttonw,0],
        [0,this._height, this._heartw,this._height-this._hearth, this._buttonw,this._height],
        [this._width,this._height, this._width-this._heartw,this._height-this._hearth, this._width-this._buttonw,this._height],
        [this._width,0, this._width-this._heartw,this._hearth, this._width-this._buttonw,0]
    ];
    this._line = [];
    this._track = [];
    // 10 is tmp data;
    this._sTrackShift = 10;
    this._sTrackh = this._height - 2*this._sTrackShift;
    this._sTrackw = this._sTrackh/2*Math.tan(this._trackr);
    this._sTrack = [];
    // shape is tmp data;
    this._sTrackShape = [
        [0,30, 100,30, 100,this._height-30, 0,this._height-30]
    ];
}

Sprite_MG.prototype.createXTrack = function(_trackw) {
    var tmpb = new Bitmap(this._trackw, this._trackh);
    tmpb.fillAll('#444');

    this._line[0] = new Sprite(tmpb);
    this._line[1] = new Sprite(tmpb);

    this._line[0].rotation = -this._trackr;
    this._line[1].rotation = this._trackr;

    this._line[1].move(this._width - Math.cos(this._trackr)*this._trackw, -Math.sin(this._trackr)*this._trackw);

    this.addChild(this._line[0]);
    this.addChild(this._line[1]);

    // is tmp data;
    var tmpb = new Bitmap(this._trackw, this._trackl);
    // tmpb.fillAll('#a55');
    var shift = this._trackw * Math.tan(this._beatr);
    console.log(this._beatr);
    var maskshape = [];
    maskshape[0] = [0,0, 0,this._trackl, this._trackw,this._trackl+shift, this._trackw,shift];
    maskshape[1] = [0,0, 0,this._trackl, this._trackw,this._trackl-shift, this._trackw,-shift];

    for(var i=0; i<4; i++) {
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

Sprite_MG.prototype.createSlideTrack = function() {
    this._sTrack[0] = new Sprite_SlideTrack(0, this._sTrackShift, 
                                                this._sTrackw, this._sTrackh, 0);
    this._sTrack[1] = new Sprite_SlideTrack(this._width, this._height - this._sTrackShift,
                                                this._sTrackw, this._sTrackh, Math.PI);
    this.addChild(this._sTrack[0]);
    this.addChild(this._sTrack[1]);
}

Sprite_MG.prototype.createButton = function() {
    for(var i=0;i<4;i++){
        var btn = new PIXI.Graphics();
        btn.beginFill(0xdd3333, 0.8);
        btn.drawPolygon(this._buttonShape[i]);
        this.addChild(btn);
    }
}

Sprite_MG.prototype.inputInit = function() {
    var make_fun = function(that, id, ispush){
        return function(){
            console.log('trigger :' + id);
            that.triggerButton(id, ispush);
        };
    }
    for(var i=0;i<4;i++){
        MGInput.addButtonEvent(this._buttonShape[i], make_fun(this,i,true), make_fun(this,i,false));
    }
}

Sprite_MG.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    MGManager.sync();
    var newBeats = MGManager.updateBeats();
    newBeats.forEach(function(item){
        this.createNewBeat(item);
    }, this);
    this.checkBeats();
}

// TODO: creat SLIDE Beat;
Sprite_MG.prototype.createNewBeat = function(_beat) {
    if(_beat.type === Beat_Base.SINGLE){
        var r = this._beatr * (_beat.position%2*2-1) * -1;
        var beat = new Beat_Single(_beat.stTime, r);
        this._track[_beat.position].addChild(beat);
    }else if(_beat.type === Beat_Base.LONG){
        var r = this._beatr * (_beat.position%2*2-1) * -1;
        var beat = new Beat_Long(_beat.stTime, _beat.length, r, _beat.position%2);
        this._track[_beat.position].addChild(beat);
    }else if(_beat.type === Beat_Base.SLIDE){
        this._sTrack[_beat.position>=3?1:0].createNewBeat(_beat);
    }
}

Sprite_MG.prototype.checkBeats = function() {
    for(var i=0;i<4;i++){
        if(this._track[i].children.length && this._track[i].children[0].checkMiss()){
            this._track[i].removeChildAt(0);
        }
    }
}

Sprite_MG.prototype.triggerButton = function(trackid, ispush) {
    if(this._track[trackid].children.length && this._track[trackid].children[0].trigger(ispush)){
        this._track[trackid].removeChildAt(0);
    }
}


// Sprite of Slide Track

function Sprite_SlideTrack() {
    this.initialize.apply(this, arguments);
}

Sprite_SlideTrack.prototype = Object.create(Sprite_Base.prototype);
Sprite_SlideTrack.prototype.constructor = Sprite_SlideTrack;

Sprite_SlideTrack.prototype.initialize = function(_x, _y, _width, _height, _rot) {
    Sprite_Base.prototype.initialize.call(this);
    this.x = _x;
    this.y = _y;
    this._width = _width;
    this._height = _height;
    this.rotation = _rot;
    this.initMembers();

    this.bitmap = new Bitmap(this._width, this._height);
    this.bitmap.fillAll('#339933');

    this.mask = new PIXI.Graphics();
    this.mask.beginFill(0xffffff);
    this.mask.drawPolygon(0,0, this._width, this._height/2, 0, this._height);
    this.addChild(this.mask);

    this.createTrack();
}

Sprite_SlideTrack.prototype.initMembers = function() {
    // is tmp data;
    this._track = [];
    this._track.length = 3;
    this._trackx = [0, this._width/10, this._width - this._width/10];
    this._tracky = [this._height/5, this._height - this._height/20, this._height/2 - this._height/20];
    this._trackw = [100, 100, 100];
    this._trackl = [this._height/5*3, 700, 700];
    this._trackr = [0, Math.atan2(-this._width, -this._height/2), Math.atan2(this._width, -this._height/2)];
}

Sprite_SlideTrack.prototype.createTrack = function() {
    for(var i=0;i<3;i++){
        this._track[i] = new Sprite();
        this._track[i].bitmap = new Bitmap(this._trackw[i], this._trackl[i]);
        this._track[i].bitmap.fillAll('#333');
        this._track[i].x = this._trackx[i];
        this._track[i].y = this._tracky[i];
        this._track[i].rotation = this._trackr[i];
        this.addChild(this._track[i]);
    }
}

Sprite_SlideTrack.prototype.createNewBeat = function(_beat) {
    console.log("Create Slide beat!");
    var pos = _beat.position % 3;
    var newBeat = new Beat_Slide(_beat.stTime, _beat.length, this._trackw[pos], this._trackl[pos], _beat.isRev);
    this._track[pos].addChild(newBeat);
}

Sprite_SlideTrack.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
}
