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
    // 1920,1080 is tmp data;
    this._width = 1920;
    this._height = 1080;

    MGInput.initialize();
};

Scene_MG.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    // 1680,1080 is tmp data;
    this._board= new Sprite_MG(1680, 1080);
    this._board.move((this._width - this._board._width)/2, 0);
    this.addChild(this._board);
    MGInput.setOffset((this._width - this._board._width)/2, 0);
};

Scene_MG.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    MGManager.saveWidthAndHight();
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
    AudioManager.fadeOutMe(1000);
    this.startFadeOut(this.slowFadeSpeed(), false);
};

Scene_MG.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    MGInput.clear();
};

// Scene_MG.prototype.createBackground = function() {
//     this._backSprite = new Sprite();
//     this._backSprite.bitmap = ImageManager.loadMG('background');
//     this.addChild(this._backSprite);
// };


// Scene of Music Game Score Page

function Scene_MGScore() {
    this.initialize.apply(this, arguments);
}

Scene_MGScore.prototype = Object.create(Scene_Base.prototype);
Scene_MGScore.prototype.constructor = Scene_MGScore;

Scene_MGScore.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    // 1920,1080 is tmp data;
    this._width = 1920;
    this._height = 1080;
};

Scene_MGScore.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    // TODO: Score Page Sprite;
    // 1680,1080 is tmp data;
    // this._board= new Sprite_MGScore(1680, 1080);
    // this._board.move((this._width - this._board._width)/2, 0);
    // this.addChild(this._board);
    // MGInput.setOffset((this._width - this._board._width)/2, 0);
};

Scene_MGScore.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    this.startFadeIn(this.slowFadeSpeed(), false);
    // TODO: Play Me, Show Score Animation;
};

// Scene_MGScore.prototype.update = function() {
//     Scene_Base.prototype.update.call(this);
// };

Scene_MGScore.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
    this.startFadeOut(this.slowFadeSpeed(), false);
};

Scene_MGScore.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    MGManager.terminate();
    MGManager.resetWidthAndHight();
};

// Scene_MGScore.prototype.createBackground = function() {
//     this._backSprite = new Sprite();
//     this._backSprite.bitmap = ImageManager.loadMG('background');
//     this.addChild(this._backSprite);
// };
