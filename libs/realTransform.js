var contextPrototype = CanvasRenderingContext2D.prototype;

contextPrototype.xform = Matrix.I(3);

contextPrototype.realSave = contextPrototype.save;
contextPrototype.save = function() {
    if (!this.xformStack) {
        this.xformStack = [];
    }
    this.xformStack.push(this.xform.dup());
    this.realSave();
}

contextPrototype.realRestore = contextPrototype.restore;
contextPrototype.restore = function() {
    if (this.xformStack && this.xformStack.length > 0) {
        this.xform = this.xformStack.pop();
    }
    this.realRestore();
}

contextPrototype.realScale = contextPrototype.scale;
contextPrototype.scale = function(x, y) {
    this.xform = this.xform.multiply($M([
        [x, 0, 0],
        [0, y, 0],
        [0, 0, 1]
    ]));
    this.realScale(x, y);
}

contextPrototype.realRotate = contextPrototype.rotate;
contextPrototype.rotate = function(angle) {
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    this.xform = this.xform.multiply($M([
        [cos, -sin, 0],
        [sin,  cos, 0],
        [   0,   0, 1]
    ]));
    this.realRotate(angle);
}

contextPrototype.realTranslate = contextPrototype.translate;
contextPrototype.translate = function(x, y) {
    this.xform = this.xform.multiply($M([
        [1, 0, x],
        [0, 1, y],
        [0, 0, 1]
    ]));
    this.realTranslate(x, y);
}

contextPrototype.realTransform = contextPrototype.transform;
contextPrototype.transform = function(m11, m12, m21, m22, dx, dy) {
    this.xform = this.xform.multiply($M([
        [m11, m21, dx],
        [m12, m22, dy],
        [  0,   0,  1]
    ]));
    this.realTransform(m11, m12, m21, m22, dx, dy);
}

contextPrototype.realSetTransform = contextPrototype.setTransform;
contextPrototype.setTransform = function(m11, m12, m21, m22, dx, dy) {
    this.xform = $M([
        [m11, m21, dx],
        [m12, m22, dy],
        [  0,   0,  1]
    ]);
    this.realSetTransform(m11, m12, m21, m22, dx, dy);
}
// Get the transformed point as [x, y]
contextPrototype.getTransformedPoint = function(x, y) {
    var point = this.xform.multiply($V([x, y, 1]));
    return [point.e(1), point.e(2)];
}