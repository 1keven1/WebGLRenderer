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
            this.shaderLoadOver();
    }

    shaderLoadOver()
    {
        if (this.baseShader.program && this.shadowCaster.program)
        {
            this.initShaderProperties(this.baseShader);
            this.initShaderProperties(this.shadowCaster);
            this.loadOver();
        }
    }

    initShaderProperties(shader)
    {
        // 初始化必要Shader变量
        shader.a_Position = gl.getAttribLocation(shader.program, 'a_Position');
        shader.a_TexCoord = gl.getAttribLocation(shader.program, 'a_TexCoord');
        shader.a_Normal = gl.getAttribLocation(shader.program, 'a_Normal');

        shader.u_Matrix_MVP = gl.getUniformLocation(shader.program, 'u_Matrix_MVP');
        shader.u_Matrix_M_I = gl.getUniformLocation(shader.program, 'u_Matrix_M_I');
        shader.u_LightPos = gl.getUniformLocation(shader.program, 'u_LightPos');
        shader.u_LightColor = gl.getUniformLocation(shader.program, 'u_LightColor');
        shader.u_Matrix_Light = gl.getUniformLocation(shader.program, 'u_Matrix_Light');
        shader.u_ShadowMap = gl.getUniformLocation(shader.program, 'u_ShadowMap');
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
    setUniformVector3f(param, x = 0.0, y = 0.0, z = 0.0)
    {
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
    setUniformVector4f(param, x = 0.0, y = 0.0, z = 0.0, w = 1.0)
    {
        gl.useProgram(this.getBaseProgram());
        let u_Param = gl.getUniformLocation(this.getBaseProgram(), param);
        gl.uniform4f(u_Param, x, y, z, w);
        gl.useProgram(null);
    }

    /**
     * 
     * @param {String} param 
     * @param {Number} texUnitNum 
     */
    setTexture(param, texUnitNum)
    {
        gl.useProgram(this.getBaseProgram());
        let u_Param = gl.getUniformLocation(this.getBaseProgram(), param);
        gl.uniform1i(u_Param, texUnitNum);
        gl.useProgram(null);
    }
}