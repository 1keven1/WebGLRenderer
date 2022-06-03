'use strict';
const SMALL_NUMBER = 1e-8;

/**
 * 将输入值钳制在上下限之间
 * @param {Number} float 输入数据
 * @param {Number} min 下限
 * @param {Number} max 上限
 * @returns {Number} 钳制后的值
 */
let clamp = function (float, min = 0, max = 1) {
    return (float < min) ? min : (float < max) ? float : max;
}

/**
 * 对浮点数向目标值进行平滑差值 距离越近速度越慢
 * @param {Number} current 当前值
 * @param {Number} target 目标值
 * @param {Number} deltaSecond 世界Delta Time
 * @param {Number} interpSpeed 插值速度
 * @returns {Number} 下一帧的值
 */
let fInterpTo = function (current, target, deltaSecond, interpSpeed) {
    if (interpSpeed <= 0.0) return target;

    const dist = target - current;
    if((dist * dist) < SMALL_NUMBER) return target;

    const deltaMove = dist * clamp(deltaSecond * interpSpeed, 0, 1);
    return current + deltaMove;
}

/**
 * 判断某个数是否是二的整数次幂
 * @param {Number} number 要检测的数据
 * @returns {Boolean} 是否是二的整数次幂
 */
let isPowerOf2 = function(number){
    if((number & (number - 1)) === 0) return true;
    return false;
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


/**
 * 复制一份Transform出来
 * @returns {Transform} 复制出的Transform
 */
Transform.prototype.copy = function () {
    let newTrans = new Transform(this.location.copy(), this.rotation.copy(), this.scale.copy());
    return newTrans;
}