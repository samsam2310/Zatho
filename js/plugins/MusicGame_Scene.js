/** Music Game Plugin of Zatho
  * Scene.
  *
  * TODO: doc
*/


// Scene of Music Game

function Scene_MG() {
    this.initialize.apply(this, arguments);
}

Scene_MG.prototype = Object.create(Scene_Base.prototype);
Scene_MG.prototype.constructor = Scene_MG;

Scene_MG.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    MGInput.initialize();
    
    // 1920,1080 is tmp data;
    this._width = 1920;
    this._height = 1080;
};

Scene_MG.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    // this.createBackground();
    
    // 1680,1080 is tmp data;
    this._board= new Sprite_MG(1680, 1080);
    this._board.move((this._width - this._board._width)/2, 0);
    this.addChild(this._board);
    MGInput.setOffset((this._width - this._board._width)/2, 0);
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
    MGManager.sync();
};

Scene_MG.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
};

Scene_MG.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    MGInput.clear();
};

Scene_MG.prototype.createBackground = function() {
    this._backSprite = new Sprite();
    this._backSprite.bitmap = ImageManager.loadMG('background');
    this.addChild(this._backSprite);
};
