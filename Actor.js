'use strict';
function Transform(location = new Vector3([0, 0, 0]), rotation = new Vector3([0, 0, 0]), scale = new Vector3([1, 1, 1])) {
    this.location = location;
    this.rotation = rotation;
    this.scale = scale;
}

let LIGHT_TYPE = {
    DIRECTIONAL: Symbol(0),
    POINT: Symbol(1),
    SPOT: Symbol(2)
}
Object.freeze(LIGHT_TYPE);

class Actor {
    /**
     * 
     * @constructor
     * @param {Transform} transform 
     */
    constructor(transform = new Transform()) {
        this.transform = transform;

        this.rotateMatrix = new Matrix4();

    }

    updateMatrics() {
        if (this.getRotation().x() > 360) this.transform.rotation.substract(new Vector3([360, 0, 0]));
        if (this.getRotation().y() > 360) this.transform.rotation.substract(new Vector3([0, 360, 0]));
        if (this.getRotation().z() > 360) this.transform.rotation.substract(new Vector3([0, 0, 360]));

        // 构建旋转矩阵 顺规为ZYX
        this.rotateMatrix.setRotate(this.transform.rotation.z(), 0, 0, 1).
            rotate(this.transform.rotation.y(), 0, 1, 0).
            rotate(this.transform.rotation.x(), 1, 0, 0);
    }

    getLocation() {
        return this.transform.location.copy();
    }

    getRotation() {
        return this.transform.rotation.copy();
    }

    getScale() {
        return this.transform.scale.copy();
    }

    setLocation(location) {
        this.transform.location = location;
    }

    setRotation(rotation) {
        this.transform.rotation = rotation;
    }

    setLocationAndRotation(location, rotation) {
        this.transform.location = location;
        this.transform.rotation = rotation;
    }

    setScale(scale) {
        this.transform.scale = scale;
    }

    addLocationOffset(offset) {
        this.transform.location.add(offset);
    }

    addRotationOffset(offset) {
        this.transform.rotation.add(offset);
    }

    getRotateMatrix() {
        return this.rotateMatrix;
    }

    getForwardVector() {
        return this.rotateMatrix.multiplyVector3(new Vector3([0, 0, -1]));
    }

    getUpVector() {
        let rotateMatrix = this.getRotateMatrix();
        return this.rotateMatrix.multiplyVector3(new Vector3([0, 1, 0]));
    }
}

class Mesh extends Actor {
    /**
     * 
     * @constructor
     * @param {Transform} transform 
     * @param {Model} model 
     * @param {Material} material 
     * @param {Boolean} bCastShadow 
     */
    constructor(transform, model, material, bCastShadow = true) {
        super(transform);
        this.model = model;
        this.material = material;
        this.bCastShadow = bCastShadow;

        this.mMatrix = new Matrix4();
        this.mIMatrix = new Matrix4();
    }

    setCastShadow(bCastShadow) {
        this.bCastShadow = bCastShadow;
    }

    /**
     * 
     * @param {Mesh} mesh 
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
            multiply(this.rotateMatrix).
            scale(this.transform.scale.x(), this.transform.scale.y(), this.transform.scale.z());
        this.mIMatrix.setInverseOf(this.mMatrix);

        console.log(this.getRotation().x(), this.getRotation().y(), this.getRotation().z());
    }
}

class Light extends Actor {
    /**
     * 
     * @constructor
     * @param {Transform} transform 变换 
     * @param {Vector3} lightColor 灯光颜色
     * @param {Number} intensity 强度
     * @param {LIGHT_TYPE} lightType 灯光类型
     */
    constructor(transform, lightColor, intensity, lightType = LIGHT_TYPE.DIRECTIONAL) {
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
                // console.log(this.vpMatrix);
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
    constructor(transform, FOV = 60, nearClip = 0.1, farClip = 100) {
        super(transform);
        this.FOV = FOV;
        this.nearClip = nearClip;
        this.farClip = farClip;

        this.vpMatrix = new Matrix4();
    }

    bulidVPMatrix() {
        this.updateMatrics();
        let lookVec = this.rotateMatrix.multiplyVector3(new Vector3([0, 0, -1]));
        let upVec = this.rotateMatrix.multiplyVector3(new Vector3([0, 1, 0]));

        this.vpMatrix.setPerspective(this.FOV, width / height, this.nearClip, this.farClip).
            lookAt(
                this.transform.location.x(), this.transform.location.y(), this.transform.location.z(),
                lookVec.x() + this.transform.location.x(), lookVec.y() + this.transform.location.y(), lookVec.z() + this.transform.location.z(),
                upVec.x(), upVec.y(), upVec.z());
    }
}

class simpleRotateCamera extends Camera {
    constructor(lookAtPoint = new Vector3([0, 0, 0]), distance = 6, FOV = 60, nearClip = 0.1, farClip = 100) {
        super(new Transform(new Vector3([0, 0, 0]), new Vector3([-20, 0, 0])), FOV, nearClip, farClip);
        this.lookAtPoint = lookAtPoint;
        this.distance = distance;
    }

    bulidVPMatrix() {
        this.updateMatrics();
        let backVec = this.getForwardVector().multiplyf(-1 * this.distance);
        let eyePoint = this.getLocation().add(backVec);
        let upVec = this.rotateMatrix.multiplyVector3(new Vector3([0, 1, 0]));

        this.vpMatrix.setPerspective(this.FOV, width / height, this.nearClip, this.farClip).
            lookAt(
                eyePoint.x(), eyePoint.y(), eyePoint.z(),
                this.getLocation().x(), this.getLocation().y(), this.getLocation().z(),
                upVec.x(), upVec.y(), upVec.z()
            );
    }
}