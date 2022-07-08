// 创建需要用到的东西
// 摄像机
let simpleCamera = new SimpleRotateCamera(new Vector3([0, 1.5, 0]));
simpleCamera.yawSpeed = 10;
simpleCamera.pitchSpeed = 10;
simpleCamera.zoomSpeed = 1;
// 光源
let light = new Light(
    new Transform(new Vector3([0.0, 5.0, 0.0]), new Vector3([-45, 45, 0])), new Vector3([1.0, 1.0, 1.0]),
    10,
    LIGHT_TYPE.DIRECTIONAL
);
// Shader
let sSpecularTrans = new Shader('./DefaultShader/DefaultVert.vert', './Res/ShowCase/Translucent/SpecularTrans.frag');
let sShadowCaster1 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let sFloor = new Shader('./DefaultShader/DefaultVert.vert', './Res/ShowCase/Translucent/Floor.frag');
let sShadowCaster2 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let sSpecularTrans2 = new Shader('./DefaultShader/DefaultVert.vert', './Res/ShowCase/Translucent/SpecularTrans.frag');
let sShadowCaster3 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
// 材质
let mTrans = new Material(sSpecularTrans, sShadowCaster1, MATERIAL_TYPE.TRANSLUCENT, 0)
let mTrans2 = new Material(sSpecularTrans2, sShadowCaster3, MATERIAL_TYPE.TRANSLUCENT, 0);
let mFloor = new Material(sFloor, sShadowCaster2, MATERIAL_TYPE.OPAQUE, 0);
// 模型
let smQuad = new Model('./Res/Model/Quad.obj', 1);
let smFloor = new Model('/Res/Model/Plane.obj', 1);
// Mesh(Actor)
let quad = new Mesh(new Transform(new Vector3([0, 1.5, 0])), smQuad, mTrans, false);
let quad2 = new Mesh(new Transform(new Vector3([0, 1.5, 0.5])), smQuad, mTrans2, false);
let floor = new Mesh(new Transform(), smFloor, mFloor, true);
// 贴图
let tFloor = new Texture('./Res/Material/SpanishPavement_BC.jpg');
let tFloorN = new Texture('./Res/Material/SpanishPavement_N.jpg')

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [
    sSpecularTrans.FS.bind(sSpecularTrans),
    sSpecularTrans2.FS.bind(sSpecularTrans2)
]; 

this.clearColor = [0, 0, 0, 1];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [smQuad, smFloor];
    scene.materialList = [mTrans, mFloor, mTrans2];
    scene.textureList = [tFloor, tFloorN];
    scene.meshList = [floor, quad, quad2];
    scene.lightList = [light];
    scene.camera = simpleCamera;
    scene.ambientColor = [0.1, 0.1, 0.1];
}

// 在运行前执行一次
this.customBeginPlay = () =>
{
    mFloor.setTexture('u_TexBC', tFloor);
    mFloor.setTexture('u_TexN', tFloorN);
    mTrans.setVector3f('u_Color', 1.0, 0.3, 0.8);
    mTrans2.setVector3f('u_Color', 0.3, 0.8, 1.0);

    mTrans.setCullMode(CULL_MODE.OFF);
    mTrans2.setCullMode(CULL_MODE.OFF);
}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
    quad.addRotationOffset(new Vector3([0, 15, 0]).multiplyf(deltaSecond));
}