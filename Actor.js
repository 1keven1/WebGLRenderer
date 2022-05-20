'use strict';
function Transform(location = new Vector3([0, 0, 0]), rotation = new Vector3([0, 0, 0]), scale = new Vector3([1, 1, 1])) {
    this.location = location;
    this.rotation = rotation;
    this.scale = scale;
}

/**
 * @enum
 */
const LIGHT_TYPE = {
    DIRECTIONAL: Symbol(0),
    POINT: Symbol(1),
    SPOT: Symbol(2)
}
Object.freeze(LIGHT_TYPE);

class Actor {
    /**
     * Actor是可以放置在世界中的物体的基类
     * @constructor
     * @param {Transform} transform 变换
     */
    constructor(transform = new Transform()) {
        this.transform = transform;

        this.rotationMatrix = new Matrix4();

    }

    update(deltaSecond) { }

    updateMatrics() {
        if (this.getRotation().x() > 360) this.transform.rotation.substract(new Vector3([360, 0, 0]));
        if (this.getRotation().y() > 360) this.transform.rotation.substract(new Vector3([0, 360, 0]));
        if (this.getRotation().z() > 360) this.transform.rotation.substract(new Vector3([0, 0, 360]));
        if (this.getRotation().x() < 0) this.transform.rotation.add(new Vector3([360, 0, 0]));
        if (this.getRotation().y() < 0) this.transform.rotation.add(new Vector3([0, 360, 0]));
        if (this.getRotation().z() < 0) this.transform.rotation.add(new Vector3([0, 0, 360]));

        // 构建旋转矩阵 顺规为ZYX
        this.rotationMatrix.setRotate(this.transform.rotation.z(), 0, 0, 1).
            rotate(this.transform.rotation.y(), 0, 1, 0).
            rotate(this.transform.rotation.x(), 1, 0, 0);
    }

    /**
     * 返回位移信息
     * @returns {Vector3} 位移的拷贝
     */
    getLocation() {
        return this.transform.location.copy();
    }

    /**
     * 返回旋转信息
     * @returns {Vector3} 旋转的拷贝
     */
    getRotation() {
        return this.transform.rotation.copy();
    }

    /**
     * 返回缩放信息
     * @returns {Vector3} 缩放的拷贝
     */
    getScale() {
        return this.transform.scale.copy();
    }

    /**
     * 设置位置
     * @param {Vector3} location 位置信息
     */
    setLocation(location) {
        this.transform.location = location;
    }

    /**
     * 设置旋转值
     * @param {Vector3} rotation 旋转信息
     */
    setRotation(rotation) {
        this.transform.rotation = rotation;
    }

    /**
     * 设置位置和旋转值
     * @param {Vector3} location 位置信息
     * @param {Vector3} rotation 旋转信息
     */
    setLocationAndRotation(location, rotation) {
        this.transform.location = location;
        this.transform.rotation = rotation;
    }

    /**
     * 设置缩放值
     * @param {Vector3} scale 缩放信息
     */
    setScale(scale) {
        this.transform.scale = scale;
    }

    /**
     * 添加位移偏移
     * @param {Vector3} offset 位移偏移 
     */
    addLocationOffset(offset) {
        this.transform.location.add(offset);
    }

    /**
     * 添加旋转偏移
     * @param {Vector3} offset 旋转偏移
     */
    addRotationOffset(offset) {
        this.transform.rotation.add(offset);
    }

    /**
     * 获取旋转矩阵
     * @returns {Matrix4} 旋转矩阵
     */
    getRotateMatrix() {
        return this.rotationMatrix;
    }

    /**
     * 获取向前向量
     * @returns {Vector3} 向前向量
     */
    getForwardVector() {
        return this.rotationMatrix.multiplyVector3(new Vector3([0, 0, -1]));
    }

    /**
     * 获取向上向量
     * @returns {Vector3} 向上向量
     */
    getUpVector() {
        return this.rotationMatrix.multiplyVector3(new Vector3([0, 1, 0]));
    }

    /**
     * 获取向右向量
     * @returns {Vector3} 向右向量
     */
    getRightVector() {
        return this.rotationMatrix.multiplyVector3(new Vector3([1, 0, 0]));
    }
}

class Mesh extends Actor {
    /**
     * 可以被渲染的Actor 有一个Model和一个Material
     * @constructor
     * @param {Transform} transform 变换
     * @param {Model} model 模型
     * @param {Material} material 材质
     * @param {Boolean} bCastShadow 投射阴影
     */
    constructor(transform, model, material, bCastShadow = true) {
        super(transform);
        this.model = model;
        this.material = material;
        this.bCastShadow = bCastShadow;

        this.mMatrix = new Matrix4();
        this.mIMatrix = new Matrix4();
    }

    /**
     * 设置是否投射阴影
     * @param {boolean} bCastShadow 投射阴影
     */
    setCastShadow(bCastShadow) {
        this.bCastShadow = bCastShadow;
    }

    /**
     * 复制一个相同的Mesh出来
     * @returns {Mesh} 复制的Mesh
     */
    copy() {
        let newMesh = new Mesh(this.transform.copy(), this.model, this.material, this.bCastShadow);
        return newMesh;
    }

    /**
     * 构造M矩阵
     */
    bulidMMatrix() {
        this.updateMatrics();

        this.mMatrix.setTranslate(this.transform.location.x(), this.transform.location.y(), this.transform.location.z()).
            multiply(this.rotationMatrix).
            scale(this.transform.scale.x(), this.transform.scale.y(), this.transform.scale.z());
        this.mIMatrix.setInverseOf(this.mMatrix);
    }
}

class Light extends Actor {
    /**
     * 照亮场景的灯光 种类为LIGHT_TYPE 目前只实现了定向光
     * @constructor
     * @param {Transform} transform 变换 
     * @param {Vector3} lightColor 灯光颜色
     * @param {Number} intensity 强度
     * @param {LIGHT_TYPE} lightType 灯光类型
     */
    constructor(transform, lightColor = new Vector3([1, 1, 1]), intensity = 1, lightType = LIGHT_TYPE.DIRECTIONAL) {
        super(transform);
        this.lightColor = lightColor;
        this.intensity = intensity;
        this.lightType = lightType;
        this.vpMatrix = new Matrix4();
        this.shadowMap = null;

        if (lightType === LIGHT_TYPE.DIRECTIONAL) this.w = 0;
        else this.w = 1;

        this.lightIndex = null;
        this.shadowMapTexUnit = null;
        this.shadowMapRes = 2048;
    }

    bulidVPMatrix() {
        this.updateMatrics();
        switch (this.lightType) {
            case LIGHT_TYPE.DIRECTIONAL:
                let lookVec = this.getForwardVector();
                let upVec = this.getUpVector();
                this.vpMatrix.setOrtho(-14, 14, -14, 14, -20, 50).
                    lookAt(this.transform.location.x(), this.transform.location.y(), this.transform.location.z(),
                        lookVec.x() + this.transform.location.x(), lookVec.y() + this.transform.location.y(), lookVec.z() + this.transform.location.z(),
                        upVec.x(), upVec.y(), upVec.z());
                break;
            case LIGHT_TYPE.POINT:
                break;
            case LIGHT_TYPE.SPOT:
                break;
            default:
                break;
        }
    }

    initShadowMap(lightIndex, startTexUnit) {
        this.lightIndex = lightIndex;
        this.shadowMapTexUnit = gl.TEXTURE0 + startTexUnit + lightIndex;
        let texture, depthbuffer;

        // 错误函数
        var error = () => {
            if (texture) gl.deleteTexture(texture);
            if (depthbuffer) gl.deleteRenderbuffer(depthbuffer);
            if (framebuffer) gl.deleteFramebuffer(framebuffer);
            console.error('灯光Shadow Map加载失败');
        }

        // 创建贴图作为rgb通道
        texture = gl.createTexture();
        if (!texture) error();

        gl.activeTexture(this.shadowMapTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.shadowMapRes, this.shadowMapRes, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // 创建renderbuffer 作为深度通道
        depthbuffer = gl.createRenderbuffer();
        if (!depthbuffer) error();

        gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.shadowMapRes, this.shadowMapRes);

        // 创建framebuffer
        this.shadowMap = gl.createFramebuffer();
        if (!this.shadowMap) error();

        // 绑定贴图和renderbuffer到framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowMap);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthbuffer);

        // 检查framebuffer是否完整
        let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (e !== gl.FRAMEBUFFER_COMPLETE) {
            console.log('Framebuffer不完整');
            error();
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    getLightPos() {
        switch (this.lightType) {
            case LIGHT_TYPE.DIRECTIONAL:
                return this.getForwardVector().multiply(new Vector3([-1, -1, -1]));
                break;
            case LIGHT_TYPE.POINT:
                break;
            default:
                break;
        }
    }
}

class Camera extends Actor {
    /**
     * 最简单的渲染世界的摄像机
     * @constructor
     * @param {Transform} transform 变换
     * @param {Number} FOV 视野角度
     * @param {Number} nearClip 近剪裁平面
     * @param {Number} farClip 远剪裁平面
     */
    constructor(transform, FOV = 60, nearClip = 0.1, farClip = 100) {
        super(transform);
        this.FOV = FOV;
        this.nearClip = nearClip;
        this.farClip = farClip;

        this.vpMatrix = new Matrix4();
    }

    bulidVPMatrix() {
        this.updateMatrics();
        let lookVec = this.rotationMatrix.multiplyVector3(new Vector3([0, 0, -1]));
        let upVec = this.rotationMatrix.multiplyVector3(new Vector3([0, 1, 0]));

        this.vpMatrix.setPerspective(this.FOV, width / height, this.nearClip, this.farClip).
            lookAt(
                this.transform.location.x(), this.transform.location.y(), this.transform.location.z(),
                lookVec.x() + this.transform.location.x(), lookVec.y() + this.transform.location.y(), lookVec.z() + this.transform.location.z(),
                upVec.x(), upVec.y(), upVec.z());
    }
}

class SimpleRotateCamera extends Camera {
    /**
     * 始终看向一点 并可以绕其旋转的相机
     * @constructor
     * @param {Vector3} lookAtPoint 看向的目标点
     * @param {Number} distance 距目标点的距离
     * @param {Number} FOV 视野角度
     * @param {Number} nearClip 近剪裁平面
     * @param {Number} farClip 远剪裁平面
     */
    constructor(lookAtPoint = new Vector3([0, 0, 0]), distance = 6, FOV = 60, nearClip = 0.1, farClip = 100) {
        super(new Transform(new Vector3([0, 0, 0]), new Vector3([0, 0, 0])), FOV, nearClip, farClip);
        this.lookAtPoint = lookAtPoint;
        this.distance = distance;

        this.pitchSpeed = 1;
        this.yawSpeed = 1;
        this.zoomSpeed = 0.1;

        this.yaw = 0;
        this.pitch = 20;
        this.pitchMin = -80;
        this.pitchMax = 80;
        this.distanceMin = 2;
        this.distanceMax = 10;

        this.mouseLastX = 0.0;
        this.mouseLastY = 0.0;

        canvas.addEventListener('wheel', (ev) => {
            this.distance += ev.deltaY * 0.01;
            // 限制距离
            this.distance = clamp(this.distance, this.distanceMin, this.distanceMax);
        })
    }

    // 重写Update
    update(deltaSecond) {
        // 如果啥都没按直接返回
        if (!canvas.bLeftMouse && !canvas.bMiddleMouse && !canvas.bRightMouse) {
            this.mouseLastX = 0.0;
            this.mouseLastY = 0.0;
            return;
        }

        let ddX, ddY;
        // 如果是第一次按 赋值直接返回
        if (this.mouseLastX === 0 && this.mouseLastY === 0) {
            this.mouseLastX = canvas.mouseX;
            this.mouseLastY = canvas.mouseY;
            return;
        }
        // 如果不是 则计算鼠标DDX和XXY
        else {
            ddX = canvas.mouseX - this.mouseLastX;
            ddY = canvas.mouseY - this.mouseLastY;
            this.mouseLastX = canvas.mouseX;
            this.mouseLastY = canvas.mouseY;
        }

        // 如果按了左键 就旋转视角
        if (canvas.bLeftMouse) {
            this.yaw += ddX * deltaSecond * this.yawSpeed * -1;
            this.pitch += ddY * deltaSecond * this.pitchSpeed;

            // 限制俯仰角度
            if (this.pitch > this.pitchMax) this.pitch = this.pitchMax;
            if (this.pitch < this.pitchMin) this.pitch = this.pitchMin;
        }

        // 如果按了右键 就前后移动
        if (canvas.bRightMouse) {
            this.distance += ddY * deltaSecond * this.zoomSpeed * -1;
            // 限制距离
            this.distance = clamp(this.distance, this.distanceMin, this.distanceMax);
        }

    }

    // 重写updateMatrix
    updateMatrics() {
        if (this.yaw >= 360) this.yaw -= 360;
        if (this.yaw <= 0) this.yaw += 360;

        this.rotationMatrix.setRotate(this.yaw, 0, 1, 0).rotate(this.pitch * -1, 1, 0, 0);
    }

    bulidVPMatrix() {
        this.updateMatrics();
        let backVec = this.getForwardVector().multiplyf(-1 * this.distance);
        let eyePoint = this.lookAtPoint.copy().add(backVec);
        this.setLocation(eyePoint);
        let upVec = this.rotationMatrix.multiplyVector3(new Vector3([0, 1, 0]));

        this.vpMatrix.setPerspective(this.FOV, width / height, this.nearClip, this.farClip).
            lookAt(
                eyePoint.x(), eyePoint.y(), eyePoint.z(),
                this.lookAtPoint.x(), this.lookAtPoint.y(), this.lookAtPoint.z(),
                upVec.x(), upVec.y(), upVec.z()
            );
    }
}