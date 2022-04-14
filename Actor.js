'use strict';
function Transform(location = new Vector3([0, 0, 0]), rotation = new Vector3([0, 0, 0]), scale = new Vector3([1, 1, 1]))
{
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

class Actor
{
    /**
     * 
     * @param {Transform} transform 
     */
    constructor(transform = new Transform())
    {
        this.transform = transform;
    }

    getLocation()
    {
        return this.transform.location.copy();
    }

    getRotation()
    {
        return this.transform.rotation.copy();
    }

    getScale()
    {
        return this.transform.scale.copy();
    }

    setLocation(location)
    {
        this.transform.location = location;
    }

    setRotation(rotation)
    {
        this.transform.rotation = rotation;
    }

    setLocationAndRotation(location, rotation)
    {
        this.transform.location = location;
        this.transform.rotation = rotation;
    }

    setScale(scale)
    {
        this.transform.scale = scale;
    }

    addLocationOffset(offset)
    {
        this.transform.location.add(offset);
    }

    addRotationOffset(offset)
    {
        this.transform.rotation.add(offset);
    }
}

class Mesh extends Actor
{
    /**
     * 
     * @param {Transform} transform 
     * @param {Model} model 
     * @param {Material} material 
     * @param {Boolean} bCastShadow 
     */
    constructor(transform, model, material, bCastShadow = true)
    {
        super(transform);
        this.model = model;
        this.material = material;
        this.bCastShadow = bCastShadow;
        this.mMatrix = new Matrix4();
        this.mIMatrix = new Matrix4();

        this.bModelLoaded = false;
        this.bShaderLoaded = false;
    }

    /**
     * 
     * @param {Mesh} mesh 
     */
    copy()
    {
        let newMesh = new Mesh(this.transform.copy(), this.model, this.material, this.bCastShadow);

        return newMesh;
    }

    /**
     * 构造M矩阵
     */
    bulidMMatrix()
    {
        this.mMatrix.setTranslate(this.transform.location.x(), this.transform.location.y(), this.transform.location.z()).
            rotate(this.transform.rotation.x(), 1, 0, 0).rotate(this.transform.rotation.y(), 0, 1, 0).rotate(this.transform.rotation.z(), 0, 0, 1).
            scale(this.transform.scale.x(), this.transform.scale.y(), this.transform.scale.z());
        this.mIMatrix.setInverseOf(this.mMatrix);
    }

    loadMesh()
    {
        // 加载Obj模型
        if (!this.model.bLoaded)
        {
            this.model.loadOver = this.modelLoadOver.bind(this);
            this.model.load();
        }
        else this.modelLoadOver();

        // 加载Shader
        if (!this.material.bLoaded)
        {
            this.material.loadOver = this.shaderLoadOver.bind(this);
            this.material.load();
        }
        else this.shaderLoadOver();
    }

    modelLoadOver()
    {
        this.bModelLoaded = true;
        if (this.bModelLoaded && this.bShaderLoaded) this.loadOver();
    }

    shaderLoadOver()
    {
        this.bShaderLoaded = true;
        if (this.bModelLoaded && this.bShaderLoaded) this.loadOver();
    }

    loadOver() { }
}

class Light extends Actor
{
    /**
     * 
     * @param {Transform} transform 变换 
     * @param {Vector3} lightColor 灯光颜色
     * @param {Number} intensity 强度
     * @param {LIGHT_TYPE} lightType 灯光类型
     */
    constructor(transform, lightColor, intensity, lightType = LIGHT_TYPE.DIRECTIONAL)
    {
        super(transform);
        this.lightColor = lightColor;
        this.intensity = intensity;
        this.lightType = lightType;
        this.vpMatrix = new Matrix4();
        this.shadowMap = null;

        if (lightType === LIGHT_TYPE.DIRECTIONAL) this.w = 0;
        else this.w = 1;
    }

    bulidVPMatrix()
    {
        switch (this.lightType)
        {
            case LIGHT_TYPE.DIRECTIONAL:
                let rotateMatrix = new Matrix4().setRotate(this.transform.rotation.x(), 1, 0, 0).rotate(this.transform.rotation.y(), 0, 1, 0).rotate(this.transform.rotation.z(), 0, 0, 1);
                let lookVec = rotateMatrix.multiplyVector3(new Vector3([0, 0, -1]));
                let upVec = rotateMatrix.multiplyVector3(new Vector3([0, 1, 0]));

                this.vpMatrix.setOrtho(-7, 7, -7, 7, 1, 100).
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

    initShadowMap()
    {

    }
}

class Camera extends Actor
{
    constructor(transform, FOV = 60, nearClip = 0.1, farClip = 100)
    {
        super(transform);
        this.FOV = FOV;
        this.nearClip = nearClip;
        this.farClip = farClip;

        this.vpMatrix = new Matrix4();
    }

    bulidVPMatrix()
    {
        let rotateMatrix = new Matrix4().setRotate(this.transform.rotation.x(), 1, 0, 0).rotate(this.transform.rotation.y(), 0, 1, 0).rotate(this.transform.rotation.z(), 0, 0, 1);
        let lookVec = rotateMatrix.multiplyVector3(new Vector3([0, 0, -1]));
        let upVec = rotateMatrix.multiplyVector3(new Vector3([0, 1, 0]));

        this.vpMatrix.setPerspective(this.FOV, width / height, this.nearClip, this.farClip).
            lookAt(
                this.transform.location.x(), this.transform.location.y(), this.transform.location.z(),
                lookVec.x() + this.transform.location.x(), lookVec.y() + this.transform.location.y(), lookVec.z() + this.transform.location.z(),
                upVec.x(), upVec.y(), upVec.z());
    }
}