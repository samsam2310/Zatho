/** Music Game Plugin of Zatho
  * MG Input
  * mgtouch objece: for MGInput
  * mgtouch.identifier: 0 if it is mouse event,
  * mgtouch.x, mgtouch.y: x,y to canvas;
*/


function MGInput() {
    throw new Error('This is a static class');
}

MGInput.initialize = function() {
    this._initMembers();
    this._setupEventHandlers();
};

MGInput.clear = function() {
    console.log('MGInput stop');
    this._initMembers();
    this._clearEventHandlers();
}

MGInput.setOffset = function(_offsetX, _offsetY) {
    this._offsetX = _offsetX;
    this._offsetY = _offsetY;
}

MGInput._initMembers = function() {
    this._offsetX = 0;
    this._offsetY = 0;
    this._buttonShape = [];
    this._buttonTouchStart = [];
    this._buttonTouchEnd = [];
    this._buttonState = [];
    this._buttonNewState = [];
    this._triggerBtn = {};
    this._slideShape = [];
    this._slideEvent = [];
    this._touchs = {};
    this._mousePressed = false;
};

/**shape: PIXI shape,ex: An array [x,y,x,y...];
  *startfun: callback when button is pushed;
  *endfun: callback when button is released;
*/
MGInput.addButtonEvent = function(shape, startfun, endfun) {
    this._buttonShape.push(shape);
    this._buttonTouchStart.push(startfun);
    this._buttonTouchEnd.push(endfun);
    this._buttonState.push(0);
    this._buttonNewState.push(0);
}

MGInput.addSlideEvent = function(shape, eventfun) {
    this._slideShape.push(shape);
    this._slideEvent.push(eventfun);
}

MGInput.pageToTouchX = function(pageX) {
    return Graphics.pageToCanvasX(pageX) - this._offsetX;
}

MGInput.pageToTouchY = function(pageY) {
    return Graphics.pageToCanvasY(pageY) - this._offsetY;
}

MGInput._setupEventHandlers = function() {
    document.addEventListener('mousedown', this._onMouseDown.bind(this));
    document.addEventListener('mousemove', this._onMouseMove.bind(this));
    document.addEventListener('mouseup', this._onMouseUp.bind(this));
    document.addEventListener('wheel', this._onWheel.bind(this));
    document.addEventListener('touchstart', this._onTouchStart.bind(this));
    document.addEventListener('touchmove', this._onTouchMove.bind(this));
    document.addEventListener('touchend', this._onTouchEnd.bind(this));
    document.addEventListener('touchcancel', this._onTouchCancel.bind(this));
    document.addEventListener('pointerdown', this._onPointerDown.bind(this));
};

MGInput._clearEventHandlers = function() {
    document.removeEventListener('mousedown', this._onMouseDown.bind(this));
    document.removeEventListener('mousemove', this._onMouseMove.bind(this));
    document.removeEventListener('mouseup', this._onMouseUp.bind(this));
    document.removeEventListener('wheel', this._onWheel.bind(this));
    document.removeEventListener('touchstart', this._onTouchStart.bind(this));
    document.removeEventListener('touchmove', this._onTouchMove.bind(this));
    document.removeEventListener('touchend', this._onTouchEnd.bind(this));
    document.removeEventListener('touchcancel', this._onTouchCancel.bind(this));
    document.removeEventListener('pointerdown', this._onPointerDown.bind(this));
}

MGInput._onMouseDown = function(event) {
    if (event.button === 0) {
        this._onLeftButtonDown(event);
    } else if (event.button === 1) {
        this._onMiddleButtonDown(event);
    } else if (event.button === 2) {
        this._onRightButtonDown(event);
    }
};

/**
 * @static
 * @method _onLeftButtonDown
 * @param {MouseEvent} event
 * @private
 */
MGInput._onLeftButtonDown = function(event) {
    var x = MGInput.pageToTouchX(event.pageX);
    var y = MGInput.pageToTouchY(event.pageY);
    if (Graphics.isInsideCanvas(x, y)) {
        this._mousePressed = true;
        this._onTrigger({identifier:0, x:x, y:y}, false);
        this._update();
    }
};

/**
 * @static
 * @method _onMiddleButtonDown
 * @param {MouseEvent} event
 * @private
 */
MGInput._onMiddleButtonDown = function(event) {
};

/**
 * @static
 * @method _onRightButtonDown
 * @param {MouseEvent} event
 * @private
 */
MGInput._onRightButtonDown = function(event) {
};

/**
 * @static
 * @method _onMouseMove
 * @param {MouseEvent} event
 * @private
 */
MGInput._onMouseMove = function(event) {
    if (this._mousePressed) {
        var x = MGInput.pageToTouchX(event.pageX);
        var y = MGInput.pageToTouchY(event.pageY);
        this._onTrigger({identifier:0, x:x, y:y}, false);
        this._update();
    }
};

/**
 * @static
 * @method _onMouseUp
 * @param {MouseEvent} event
 * @private
 */
MGInput._onMouseUp = function(event) {
    if (event.button === 0) {
        var x = MGInput.pageToTouchX(event.pageX);
        var y = MGInput.pageToTouchY(event.pageY);
        this._mousePressed = false;
        this._onTrigger({identifier:0, x:x, y:y}, true);
        this._update();
    }
};

/**
 * @static
 * @method _onWheel
 * @param {WheelEvent} event
 * @private
 */
MGInput._onWheel = function(event) {
    event.preventDefault();
};

/**
 * @static
 * @method _onTouchStart
 * @param {TouchEvent} event
 * @private
 */
MGInput._onTouchStart = function(event) {
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var x = MGInput.pageToTouchX(touch.pageX);
        var y = MGInput.pageToTouchY(touch.pageY);
        if (Graphics.isInsideCanvas(x, y)) {
            this._onTrigger({identifier:touch.identifier, x:x, y:y}, false);
            event.preventDefault();
        }
    }
    this._update();
    if (window.cordova || window.navigator.standalone) {
        event.preventDefault();
    }
};

/**
 * @static
 * @method _onTouchMove
 * @param {TouchEvent} event
 * @private
 */
MGInput._onTouchMove = function(event) {
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var x = MGInput.pageToTouchX(touch.pageX);
        var y = MGInput.pageToTouchY(touch.pageY);
        this._onTrigger({identifier:touch.identifier, x:x, y:y}, false);
    }
    this._update();
};

/**
 * @static
 * @method _onTouchEnd
 * @param {TouchEvent} event
 * @private
 */
MGInput._onTouchEnd = function(event) {
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var x = MGInput.pageToTouchX(touch.pageX);
        var y = MGInput.pageToTouchY(touch.pageY);
        this._onTrigger({identifier:touch.identifier, x:x, y:y}, true);
    }
    this._update();
};

/**
 * @static
 * @method _onTouchCancel
 * @param {TouchEvent} event
 * @private
 */
MGInput._onTouchCancel = function(event) {
};

/**
 * @static
 * @method _onPointerDown
 * @param {PointerEvent} event
 * @private
 */
MGInput._onPointerDown = function(event) {
    if (event.pointerType === 'touch' && !event.isPrimary) {
        var x = MGInput.pageToTouchX(event.pageX);
        var y = MGInput.pageToTouchY(event.pageY);
        if (Graphics.isInsideCanvas(x, y)) {
            // For Microsoft Edge
            // onCancel(x, y);
            event.preventDefault();
        }
    }
};

MGInput._onTrigger = function(mgtouch, isremove) {
    if(mgtouch.identifier in this._touchs){
        if(this._touchs[mgtouch.identifier].tgBtn != -1){
            this._buttonNewState[this._touchs[mgtouch.identifier].tgBtn]--;
        }
        if(isremove){
            delete this._touchs[mgtouch.identifier];
            return;
        }
    }else{
        this._touchs[mgtouch.identifier] = {
            'x': 0,
            'y': 0,
            'preRes': -1,
            'tgSlide': -1,
            'tgBtn': -1
        };
    }
    this._touchs[mgtouch.identifier].tgBtn = -1;
    this._touchs[mgtouch.identifier].x = mgtouch.x;
    this._touchs[mgtouch.identifier].y = mgtouch.y;
    for(var i=0;i<this._buttonShape.length;i++){
        if(this.isPointInPolygon(mgtouch.x, mgtouch.y, this._buttonShape[i])){
            this._buttonNewState[i]++;
            this._touchs[mgtouch.identifier].tgBtn = i;
            break;
        }
    }
}

MGInput.isPointInPolygon = function(x, y, pol) {
    var polygon_area = 0, test_area = 0;
    for(var i=0;i<pol.length-2;i+=2){
        if(i>0){
            polygon_area += this._triangleArea(pol[0], pol[1], pol[i],pol[i+1], pol[i+2],pol[i+3]);
        }
        test_area += this._triangleArea(x,y, pol[i],pol[i+1], pol[i+2],pol[i+3]);
    }
    test_area += this._triangleArea(x,y, pol[0], pol[1], pol[pol.length-2], pol[pol.length-1]);
    // 1e-3 is tmp data;
    return Math.abs(polygon_area - test_area) < 1e-3;
}

MGInput._triangleArea = function(x1,y1,x2,y2,x3,y3) {
    return Math.abs(x1*y2-y1*x2+x2*y3-y2*x3+x3*y1-y3*x1)/2;
}

MGInput._dot = function(x1, y1, x2, y2) {
    return x1*x2+y1*y2;
}

MGInput._distance = function(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

MGInput._update = function() {
    for(var i=0;i<this._buttonState.length;i++){
        if(this._buttonNewState[i] && !this._buttonState[i]){
            this._buttonTouchStart[i]();
        }else if(!this._buttonNewState[i] && this._buttonState[i]){
            this._buttonTouchEnd[i]();
        }
        this._buttonState[i] = this._buttonNewState[i];
    }
    for(var i=0;i<this._touchs.length;i++){
        var tgSlide = -1;
        for(var j=0;j<this._slideShape.length;j++){
            if(this.isPointInPolygon(this._touchs[i].x, this._touchs[i].y, this._slideShape[j])){
                tgSlide = j;
            }
        }
        if(tgSlide!==-1 && this._touchs[i].tgSlide === tgSlide){
            var sp = this._slideShape[tgSlide],
                res = this._dot(this._touchs[i].x-sp[0], this._touchs[i].y-sp[1], sp[2]-sp[0], sp[3]-sp[1]) / this._distance(sp[0],sp[1],sp[2],sp[3]);
            this._slideEvent[tgSlide](this._touchs[i].preRes, res);
            this._touchs[i].preRes = res;
        }
        this._touchs[i].x = this._touchs[i].preX;
        this._touchs[i].y = this._touchs[i].preY;
        this._touchs[i].tgSlide = tgSlide;
    }
}
