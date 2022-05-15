'use strict';
const SMALL_NUMBER = 1e-8;

let clamp = function (float, min = 0, max = 1) {
    return (float < min) ? min : (float < max) ? float : max;
}

let fInterpTo = function (current, target, deltaSecond, interpSpeed) {
    if (interpSpeed <= 0.0) return target;

    const dist = target - current;
    if((dist * dist) < SMALL_NUMBER) return target;

    const deltaMove = dist * clamp(deltaSecond * interpSpeed, 0, 1);
    return current + deltaMove;
}

Vector3.prototype.x = function () {
    return this.elements[0];
}

Vector3.prototype.y = function () {
    return this.elements[1];
}

Vector3.prototype.z = function () {
    return this.elements[2];
}

Vector3.prototype.add = function (vector3) {
    this.elements = [this.x() + vector3.x(), this.y() + vector3.y(), this.z() + vector3.z()];
    return this;
}

Vector3.prototype.addf = function (float) {
    this.elements = [this.x() + float, this.y() + float, this.z() + float];
    return this;
}

Vector3.prototype.substract = function (vector3) {
    this.elements = [this.x() - vector3.x(), this.y() - vector3.y(), this.z() - vector3.z()];
    return this;
}

Vector3.prototype.substractf = function (float) {
    this.elements = [this.x() - float, this.y() - float, this.z() - float];
    return this;
}

Vector3.prototype.multiply = function (vector3) {
    this.elements = [this.x() * vector3.x(), this.y() * vector3.y(), this.z() * vector3.z()];
    return this;
}

Vector3.prototype.multiplyf = function (float) {
    this.elements = [this.x() * float, this.y() * float, this.z() * float];
    return this;
}

Vector3.prototype.copy = function () {
    return new Vector3([this.elements[0], this.elements[1], this.elements[2]]);
}



Transform.prototype.copy = function () {
    let newTrans = new Transform(this.location.copy(), this.rotation.copy(), this.scale.copy());
    return newTrans;
}