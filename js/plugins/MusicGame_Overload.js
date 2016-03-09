/** Music Game Plugin of Zatho
  * Overload.
*/


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
