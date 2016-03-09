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
    // This two Graphics is tmp data;
    var left = new PIXI.Graphics(),
        right = new PIXI.Graphics();
    left.x = 0;
    left.y = this._sTrackShift;
    left.beginFill(0x33dd33);
    left.drawPolygon(0,0, this._sTrackw, this._sTrackh/2, 0, this._sTrackh);

    right.x = this._width;
    right.y = this._sTrackShift;
    right.beginFill(0x33dd33);
    right.drawPolygon(0,0, -this._sTrackw, this._sTrackh/2, 0, this._sTrackh);

    this.addChild(left);
    this.addChild(right);

    this._sTrack.length = 1;
    this._sTrack[0] = new PIXI.Graphics();
    this._sTrack[0].x = 0;
    this._sTrack[0].y = 30;
    this._sTrack[0].beginFill(0x666666, 0.8);
    this._sTrack[0].drawRect(0, 0, 100, this._sTrackh - 60);
    this.addChild(this._sTrack[0]);
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
        this.createBeat(item);
    }, this);
    this.checkBeats();
}

// TODO: creat SLIDE Beat;
Sprite_MG.prototype.createBeat = function(_beat) {
    if(_beat.type === Beat_Base.SINGLE){
        var r = this._beatr * (_beat.position%2*2-1) * -1;
        var beat = new Beat_Single(_beat.stTime, r);
        this._track[_beat.position].addChild(beat);
    }else if(_beat.type === Beat_Base.LONG){
        var r = this._beatr * (_beat.position%2*2-1) * -1;
        var beat = new Beat_Long(_beat.stTime, _beat.length, r, _beat.position%2);
        this._track[_beat.position].addChild(beat);
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

Sprite_MG.prototype.triggerButton = function(trackid, ispush) {
    if(this._track[trackid].children.length && this._track[trackid].children[0].trigger(ispush)){
        this._track[trackid].removeChildAt(0);
    }
}
