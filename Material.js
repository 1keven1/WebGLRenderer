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
    constructor(baseShader, materialType=MATERIAL_TYPE.OPAQUE, queueOffset=0)
    {
        this.baseShader = baseShader;

        switch (materialType)
        {
            case MATERIAL_TYPE.OPAQUE:
                this.bDepthTest = true;
                this.bCull = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1000 + queueOffset;
                break;
            case MATERIAL_TYPE.MASKED:
                this.bDepthTest = true;
                this.bCull = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1500 + queueOffset;
                break;
            case MATERIAL_TYPE.TRANSLUCENT:
                this.bDepthTest = false;
                this.bCull = true;
                this.bBlend = true;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 2000 + queueOffset;
                break;
            case MATERIAL_TYPE.ADDITIVE:
                this.bDepthTest = false;
                this.bCull = true;
                this.bBlend = true;
                this.srcFactor = gl.ONE;
                this.desFactor = gl.ONE;
                this.renderQueue = 2000 + queueOffset;
                break;
            default:
                this.bDepthTest = true;
                this.bCull = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1000 + queueOffset;
                console.error('材质类型不存在：' + materialType);
                break;
        }
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
                this.renderQueue = 1000 + Offset;
                break;
            case MATERIAL_TYPE.MASKED:
                this.bDepthTest = true;
                this.bCull = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1500 + Offset;
                break;
            case MATERIAL_TYPE.TRANSLUCENT:
                this.bDepthTest = false;
                this.bCull = true;
                this.bBlend = true;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 2000 + Offset;
                break;
            case MATERIAL_TYPE.ADDITIVE:
                this.bDepthTest = false;
                this.bCull = true;
                this.bBlend = true;
                this.srcFactor = gl.ONE;
                this.desFactor = gl.ONE;
                this.renderQueue = 2000 + Offset;
                break;
            default:
                this.bDepthTest = true;
                this.bCull = true;
                this.bBlend = false;
                this.srcFactor = gl.SRC_ALPHA;
                this.desFactor = gl.ONE_MINUS_SRC_ALPHA;
                this.renderQueue = 1000 + Offset;
                console.error('材质类型不存在：' + materialType);
                break;
        }
    }

    setBlendFactor(srcFactor, desFactor)
    {
        this.srcFactor = srcFactor;
        this.desFactor = desFactor;
    }
}