'use scrict';

/*
渲染队列：
1000：不透明
1500：蒙版
2000：半透明 叠加
*/
let MATERIAL_TYPE = {
    OPAQUE: Symbol(0),
    MASKED: Symbol(1),
    TRANSLUCENT: Symbol(2),
    ADDITIVE: Symbol(3)
}
Object.freeze(MATERIAL_TYPE);

let ATTRIBURE_TYPE = {
    SCALAR: Symbol(0),
    VECTOR3: Symbol(1),
    VECTOR4: Symbol(2),
    TEXTURE: Symbol(3),
}
Object.freeze(ATTRIBURE_TYPE);

class Material
{
    /**
     * 
     * @param {Shader} baseShader 
     * @param {Shader} shadowCaster
     * @param {MATERIAL_TYPE} materialType 
     * @param {Number} queueOffset 
     */
    constructor(baseShader, shadowCaster, materialType = MATERIAL_TYPE.OPAQUE, queueOffset = 0)
    {
        this.baseShader = baseShader;
        this.shadowCaster = shadowCaster;

        this.setMaterialType(materialType, queueOffset);

        this.bLoaded = false;
        this.attributeList = [];
    }

    setMaterialType(materialType, offset)
    {
        switch (materialType)
        {
            case MATERIAL_TYPE.OPAQUE:
                this.bDepthTest = true;
                this.bCull = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1000 + offset;
                break;
            case MATERIAL_TYPE.MASKED:
                this.bDepthTest = true;
                this.bCull = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1500 + offset;
                break;
            case MATERIAL_TYPE.TRANSLUCENT:
                this.bDepthTest = false;
                this.bCull = true;
                this.bBlend = true;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 2000 + offset;
                break;
            case MATERIAL_TYPE.ADDITIVE:
                this.bDepthTest = false;
                this.bCull = true;
                this.bBlend = true;
                this.srcFactor = gl.ONE;
                this.desFactor = gl.ONE;
                this.renderQueue = 2000 + offset;
                break;
            default:
                this.bDepthTest = true;
                this.bCull = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1000 + offset;
                console.error('材质类型不存在：' + materialType);
                break;
        }
    }

    setBlendFactor(srcFactor, desFactor)
    {
        this.srcFactor = srcFactor;
        this.desFactor = desFactor;
    }

    load()
    {
        this.bLoaded = true;
        this.loadShader();
    }

    loadOver() { }

    loadShader()
    {
        // console.log(this);
        // 加载Base Shader
        if (!this.baseShader.bLoaded)
        {
            this.baseShader.loadOver = this.shaderLoadOver.bind(this);
            this.baseShader.load();
        }
        if (!this.shadowCaster.bLoaded)
        {
            this.shadowCaster.loadOver = this.shaderLoadOver.bind(this);
            this.shadowCaster.load();
        }
        if (this.baseShader.program && this.shadowCaster.program)
            this.loadOver();
    }

    shaderLoadOver()
    {
        if (this.baseShader.program && this.shadowCaster.program)
        {
            this.baseShader.loadOver = this.shaderChanged.bind(this);
            this.shadowCaster.loadOver = this.shaderChanged.bind(this);
            this.loadOver();
        }
    }

    getBaseProgram()
    {
        return this.baseShader.program;
    }

    getShadowCasterProgram()
    {
        return this.shadowCaster.program;
    }

    /**
     * 
     * @param {String} param 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    setVector3f(param, x = 0.0, y = 0.0, z = 0.0)
    {
        this.addAttribute(ATTRIBURE_TYPE.VECTOR3, param, [x, y, z]);

        gl.useProgram(this.getBaseProgram());
        let u_Param = gl.getUniformLocation(this.getBaseProgram(), param);
        gl.uniform3f(u_Param, x, y, z);
        gl.useProgram(null);
    }

    /**
     * 
     * @param {String} param 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @param {Number} w 
     */
    setVector4f(param, x = 0.0, y = 0.0, z = 0.0, w = 1.0)
    {
        this.addAttribute(ATTRIBURE_TYPE.VECTOR4, param, [x, y, z, w]);

        gl.useProgram(this.getBaseProgram());
        let u_Param = gl.getUniformLocation(this.getBaseProgram(), param);
        gl.uniform4f(u_Param, x, y, z, w);
        gl.useProgram(null);
    }

    /**
     * 
     * @param {String} param 
     * @param {Texture} texture 
     */
    setTexture(param, texture)
    {
        this.addAttribute(ATTRIBURE_TYPE.TEXTURE, param, texture);
        gl.useProgram(this.getBaseProgram());
        let u_Param = gl.getUniformLocation(this.getBaseProgram(), param);
        gl.uniform1i(u_Param, texture.texIndex);
        gl.useProgram(null);
    }

    addAttribute(attributeType, name, value)
    {
        let attri = this.attributeList.find((attribute) =>
        {
            return attribute.type === attributeType && attribute.name === name;
        })
        if (attri) attri.value = value;
        else
        {
            attri = new Object();
            attri.type = attributeType;
            attri.name = name;
            attri.value = value;
            this.attributeList.push(attri);
        }
    }

    shaderChanged()
    {
        console.log(this.attributeList);
        gl.useProgram(this.getBaseProgram());
        for (let i = 0; i < this.attributeList.length; i++)
        {
            let u_Param = gl.getUniformLocation(this.getBaseProgram(), this.attributeList[i].name);
            if (!u_Param)
            {
                // this.attributeList.splice(i, 1);
                // i--;
            }
            else
            {
                switch (this.attributeList[i].type)
                {
                    case ATTRIBURE_TYPE.SCALAR:
                        break;
                    case ATTRIBURE_TYPE.VECTOR3:
                        gl.uniform3fv(u_Param, this.attributeList[i].value);
                        break;
                    case ATTRIBURE_TYPE.VECTOR4:
                        gl.uniform4fv(u_Param, this.attributeList[i].value);
                        break;
                    case ATTRIBURE_TYPE.TEXTURE:
                        gl.uniform1i(u_Param, this.attributeList[i].value.texIndex);
                        break;
                    default:
                        break;
                }
            }
        }
        gl.useProgram(null);
    }
}