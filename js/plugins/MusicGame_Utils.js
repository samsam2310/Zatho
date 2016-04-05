/** Music Game Plugin of Zatho
  * Utils.
*/

// TODO: add math function like: dot, cross, distance, ...etc;

function MGMath() {
    throw new Error('This is a static class');
}

MGMath.dot = function(x1, y1, x2, y2) {
    return x1*x2+y1*y2;
}

MGMath.distance = function(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

MGMath._triangleArea = function(x1,y1,x2,y2,x3,y3) {
    return Math.abs(x1*y2-y1*x2+x2*y3-y2*x3+x3*y1-y3*x1)/2;
}

MGMath.isPointInPolygon = function(x, y, pol) {
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

// Shape is INT;
MGMath.rotate = function(x, y, shape, rot) {
    var s = Math.sin(rot), c = Math.cos(rot), res = [];
    res.length = shape.length;
    for(var i=0;i<shape.length;i+=2){
        res[i] = Math.floor(shape[i]*c - shape[i+1]*s + x);
        res[i+1] = Math.floor(shape[i]*s + shape[i+1]*c + y);
    }
    return res;
}