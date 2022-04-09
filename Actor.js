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
    constructor(transform = new Transform())
    {
        this.transform = transform;
    }
}

class Mesh extends Actor
{
    constructor(transform, model, material, bCastShadow = true)
    {
        super(transform);
        this.model = model;
        this.material = material;
        this.bCastShadow = bCastShadow;
        this.mMatrix = new Matrix4();
    }

    /**
     * 构造M矩阵
     */
    bulidMMatrix()
    {
        this.mMatrix.setTranslate(this.transform.location[0], this.transform.location[1], this.transform.location[2]).
            rotate(this.transform.rotation[0], 1, 0, 0).rotate(this.transform.rotation[1], 0, 1, 0).rotate(this.transform.rotation[2], 0, 0, 1).
            scale(this.transform.scale[0], this.transform.scale[1], this.transform.scale[2]);
    };
}

class Light extends Actor
{
    /**
     * 
     * @param {*} transform 变换 
     * @param {*} lightColor 灯光颜色
     * @param {*} intensity 强度
     * @param {*} lightType 灯光类型
     */
    constructor(transform, lightColor, intensity, lightType = LIGHT_TYPE.DIRECTIONAL)
    {
        super(transform);
        this.lightColor = lightColor;
        this.intensity = intensity;
        this.lightType = lightType;
        this.vpMatrix = new Matrix4();
        this.shadowMap = null;
    }

    bulidVPMatrix()
    {
        switch (this.lightType)
        {
            case LIGHT_TYPE.DIRECTIONAL:
                console.log('ok');
                break;
            case LIGHT_TYPE.POINT:
                break;
            case LIGHT_TYPE.SPOT:
                break;
            default:
                console.log('not ok');
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
        let rotateMatrix = new Matrix4().setRotate(this.transform.rotation[0], 1, 0, 0).rotate(this.transform.rotation[1], 0, 1, 0).rotate(this.transform.rotation[2], 0, 0, 1);
        let lookVec = rotateMatrix.multiplyVector3(new Vector3([0, 0, -1]));
        let upVec = rotateMatrix.multiplyVector3(new Vector3[0, 1, 0]);

        this.vpMatrix.setPerspective(this.FOV, width / height, this.nearClip, this.farClip).
            lookAt(
                this.transform.location[0], this.transform.location[1], this.transform.location[2],
                lookVec[0] + this.transform.location[0], lookVec[1] + this.transform.location[1], lookVec[2] + this.transform.location[2],
                upVec[0], upVec[1], upVec[2]);
    }
}