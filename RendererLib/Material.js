'use scrict';

/*
渲染队列：
500：天空盒
1000：不透明
1500：蒙版
2000：半透明 叠加
*/

/**
 * @enum
 */
const MATERIAL_TYPE = {
    SKYBOX: Symbol(-1),
    OPAQUE: Symbol(0),
    MASKED: Symbol(1),
    TRANSLUCENT: Symbol(2),
    ADDITIVE: Symbol(3)
}
Object.freeze(MATERIAL_TYPE);

/**
 * 剔除模式
 * @enum
 */
const CULL_MODE = {
    BACK: Symbol(0),
    FRONT: Symbol(1),
    OFF: Symbol(2)
}
Object.freeze(CULL_MODE);

const ATTRIBURE_TYPE = {
    SCALAR: Symbol(0),
    VECTOR3: Symbol(1),
    VECTOR4: Symbol(2),
    TEXTURE: Symbol(3),
}
Object.freeze(ATTRIBURE_TYPE);

class Material {
    /**
     * 材质 现在需要一个Base着色器与阴影投射着色器 种类有MATERIAL_TYPE
     * @constructor
     * @param {Shader} baseShader Base着色器 用于计算主光源
     * @param {Shader} shadowCaster 阴影投射着色器 用于投射阴影
     * @param {MATERIAL_TYPE} materialType 材质类型
     * @param {Number} queueOffset 渲染队列偏移
     */
    constructor(baseShader, shadowCaster = null, materialType = MATERIAL_TYPE.OPAQUE, queueOffset = 0) {
        this.baseShader = baseShader;
        this.shadowCaster = shadowCaster;
        this.bBaseShaderLoaded = false;
        this.bShadowCasterLoaded = false;

        this.cullMode = CULL_MODE.BACK;

        this.materialType = materialType;
        this.setMaterialType(materialType, queueOffset);

        this.bLoaded = false;
        this.attributeList = [];
    }

    /**
     * 设置材质类型
     * @param {MATERIAL_TYPE} materialType 材质类型
     * @param {Number} offset 渲染队列偏移
     */
    setMaterialType(materialType, offset) {
        this.materialType = materialType;
        switch (materialType) {
            case MATERIAL_TYPE.SKYBOX:
                this.bDepthTest = false;
                this.bDepthWrite = false;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 500 + offset;
                break;
            case MATERIAL_TYPE.OPAQUE:
                this.bDepthTest = true;
                this.bDepthWrite = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1000 + offset;
                break;
            case MATERIAL_TYPE.MASKED:
                this.bDepthTest = true;
                this.bDepthWrite = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1500 + offset;
                break;
            case MATERIAL_TYPE.TRANSLUCENT:
                this.bDepthTest = true;
                this.bDepthWrite = false;
                this.bBlend = true;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 2000 + offset;
                break;
            case MATERIAL_TYPE.ADDITIVE:
                this.bDepthTest = true;
                this.bDepthWrite = false;
                this.bBlend = true;
                this.srcFactor = gl.ONE;
                this.desFactor = gl.ONE;
                this.renderQueue = 2000 + offset;
                break;
            default:
                this.bDepthTest = true;
                this.bDepthWrite = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1000 + offset;
                console.error('材质类型不存在：' + materialType);
                break;
        }
    }

    /**
     * 设置混合系数
     * @param {GLenum} srcFactor 源混合系数
     * @param {GLenum} desFactor 目标混合系数
     */
    setBlendFactor(srcFactor, desFactor) {
        this.srcFactor = srcFactor;
        this.desFactor = desFactor;
    }

    /**
     * 设置材质剔除模式
     * @param {CULL_MODE} cullMode 剔除模式
     */
    setCullMode(cullMode) {
        this.cullMode = cullMode;
    }

    load() {
        this.bLoaded = true;
        this.loadShader();
    }

    loadOver() { }

    loadShader() {
        // 加载Base Shader
        if (!this.baseShader) {
            this.bBaseShaderLoaded = true;
        }
        else if (!this.baseShader.bLoaded) {
            this.baseShader.loadOver = this.baseShaderLoadOver.bind(this);
            this.baseShader.load();
        }

        // 加载Shadow Caster
        if (!this.shadowCaster) {
            this.bShadowCasterLoaded = true;
        }
        else if (this.shadowCaster && !this.shadowCaster.bLoaded) {
            this.shadowCaster.loadOver = this.shadowCasterLoadOver.bind(this);
            this.shadowCaster.load();
        }

        this.checkShaderLoaded();
    }

    baseShaderLoadOver() {
        this.bBaseShaderLoaded = true;
        this.checkShaderLoaded();
    }

    shadowCasterLoadOver() {
        this.bShadowCasterLoaded = true;
        this.checkShaderLoaded();
    }

    checkShaderLoaded() {
        if (this.bBaseShaderLoaded && this.bShadowCasterLoaded) {
            if (this.baseShader) this.baseShader.loadOver = this.shaderChanged.bind(this);
            if (this.shadowCaster) this.shadowCaster.loadOver = this.shaderChanged.bind(this);
            this.loadOver();
        }
    }

    /**
     * 获得基础Shader程序
     * @returns {WebGLProgram} 基础着色器
     */
    getBaseProgram() {
        return this.baseShader.program;
    }

    /**
     * 获取阴影投射Shader程序
     * @returns {WebGLProgram} 阴影投射着色器
     */
    getShadowCasterProgram() {
        if (this.shadowCaster) return this.shadowCaster.program;
        else return null;
    }

    /**
     * 设置shader三维参数
     * @param {String} param 参数名称
     * @param {Number} x x
     * @param {Number} y y
     * @param {Number} z z
     */
    setVector3f(param, x = 0.0, y = 0.0, z = 0.0) {
        this.addAttribute(ATTRIBURE_TYPE.VECTOR3, param, [x, y, z]);

        let bExist = false;
        gl.useProgram(this.getBaseProgram());
        let u_Param = gl.getUniformLocation(this.getBaseProgram(), param);
        if (u_Param) {
            gl.uniform3f(u_Param, x, y, z);
            bExist = true;
        }

        gl.useProgram(this.getShadowCasterProgram());
        u_Param = gl.getUniformLocation(this.getShadowCasterProgram(), param);
        if (u_Param) {
            gl.uniform3f(u_Param, x, y, z);
            bExist = true;
        }
        gl.useProgram(null);

        if (!bExist) console.warn(param + '：参数不存在');
    }

    /**
     * 设置shader四维参数
     * @param {String} param 参数名称
     * @param {Number} x x
     * @param {Number} y y
     * @param {Number} z z
     * @param {Number} w w
     */
    setVector4f(param, x = 0.0, y = 0.0, z = 0.0, w = 1.0) {
        this.addAttribute(ATTRIBURE_TYPE.VECTOR4, param, [x, y, z, w]);

        let bExist = false;
        gl.useProgram(this.getBaseProgram());
        let u_Param = gl.getUniformLocation(this.getBaseProgram(), param);
        if (u_Param) {
            gl.uniform4f(u_Param, x, y, z, w);
            bExist = true;
        }

        gl.useProgram(this.getShadowCasterProgram());
        u_Param = gl.getUniformLocation(this.getShadowCasterProgram(), param);
        if (u_Param) {
            gl.uniform4f(u_Param, x, y, z, w);
            bExist = true;
        }
        gl.useProgram(null);

        if (!bExist) console.warn(param + '：参数不存在');
    }

    /**
     * 设置Shader贴图采样器参数
     * @param {String} param 参数名称
     * @param {Texture} texture 贴图
     */
    setTexture(param, texture) {
        this.addAttribute(ATTRIBURE_TYPE.TEXTURE, param, texture);
        let bExist = false;

        if(this.baseShader){
            gl.useProgram(this.getBaseProgram());
            let u_Param = gl.getUniformLocation(this.getBaseProgram(), param);
            if (u_Param) {
                gl.uniform1i(u_Param, texture.texIndex);
                bExist = true;
                // 设置_TexelSize参数
                let u_Param_TexelSize = gl.getUniformLocation(this.getBaseProgram(), param + '_TexelSize');
                if (u_Param_TexelSize) gl.uniform4f(u_Param_TexelSize, texture.height, texture.width, 1 / texture.height, 1 / texture.width);
            }
        }
        

        // 阴影投射shader 基本与上面一样
        if(this.shadowCaster){
            gl.useProgram(this.getShadowCasterProgram());
            let u_Param = gl.getUniformLocation(this.getShadowCasterProgram(), param);
            if (u_Param) {
                gl.uniform1i(u_Param, texture.texIndex);
                bExist = true;

                let u_Param_TexelSize = gl.getUniformLocation(this.getShadowCasterProgram(), param + '_TexelSize');
                if (u_Param_TexelSize) gl.uniform4f(u_Param_TexelSize, texture.height, texture.width, 1 / texture.height, 1 / texture.width);
            }
        }

        gl.useProgram(null);

        if (!bExist) console.warn(param + '：参数不存在');
    }

    /**
     * 将参数储存到Material中
     * @param {ATTRIBURE_TYPE} attributeType 参数类型
     * @param {String} name 参数名称
     * @param {*} value 参数值
     */
    addAttribute(attributeType, name, value) {
        let attri = this.attributeList.find((attribute) => {
            return attribute.type === attributeType && attribute.name === name;
        })
        if (attri) attri.value = value;
        else {
            attri = new Object();
            attri.type = attributeType;
            attri.name = name;
            attri.value = value;
            this.attributeList.push(attri);
        }
    }

    /**
     * Shader重新编译后 将材质中储存的参数重新赋值给Shader
     */
    shaderChanged() {
        gl.useProgram(this.getBaseProgram());
        for (let i = 0; i < this.attributeList.length; i++) {
            let u_Param = gl.getUniformLocation(this.getBaseProgram(), this.attributeList[i].name);
            if (!u_Param) {
                // this.attributeList.splice(i, 1);
                // i--;
            }
            else {
                switch (this.attributeList[i].type) {
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