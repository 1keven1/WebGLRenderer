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
     * @param {MATERIAL_TYPE} materialType 
     * @param {Number} queueOffset 
     */
    constructor(baseShader, materialType = MATERIAL_TYPE.OPAQUE, queueOffset = 0)
    {
        this.baseShader = baseShader;

        this.setMaterialType(materialType, queueOffset);

        this.a_Position = -1;
        this.a_TexCoord = -1;
        this.a_Normal = -1;
        this.u_Matrix_MVP = null;
        this.u_Matrix_M_I = null;
        this.u_LightPos = null;
        this.u_LightColor = null;
        this.u_Matrix_Light = null;

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
        // 加载Base Shader
        this.baseShader.loadOver = this.shaderLoadOver.bind(this);
        this.baseShader.load();
    }

    shaderLoadOver()
    {
        // 初始化必要Shader变量
        this.a_Position = gl.getAttribLocation(this.baseShader.program, 'a_Position');
        this.a_TexCoord = gl.getAttribLocation(this.baseShader.program, 'a_TexCoord');
        this.a_Normal = gl.getAttribLocation(this.baseShader.program, 'a_Normal');

        this.u_Matrix_MVP = gl.getUniformLocation(this.baseShader.program, 'u_Matrix_MVP');
        this.u_Matrix_M_I = gl.getUniformLocation(this.baseShader.program, 'u_Matrix_M_I');
        this.u_LightPos = gl.getUniformLocation(this.baseShader.program, 'u_LightPos');
        this.u_LightColor = gl.getUniformLocation(this.baseShader.program, 'u_LightColor');
        this.u_Matrix_Light = gl.getUniformLocation(this.baseShader.program, 'u_Matrix_Light');
        // this.u_ShadowMap = gl.getUniformLocation(this.baseShader.program, 'u_ShadowMap');

        this.loadOver();
    }

    getProgram()
    {
        return this.baseShader.program;
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
        gl.useProgram(this.getProgram());
        let u_Param = gl.getUniformLocation(this.getProgram(), param);
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
        gl.useProgram(this.getProgram());
        let u_Param = gl.getUniformLocation(this.getProgram(), param);
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
        gl.useProgram(this.getProgram());
        let u_Param = gl.getUniformLocation(this.getProgram(), param);
        gl.uniform1i(u_Param, texUnitNum);
        gl.useProgram(null);
    }
}