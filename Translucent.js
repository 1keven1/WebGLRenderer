// 创建需要用到的东西
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
let sSpecularBC = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/SpecularBC.frag');
let sShadowCaster2 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
// 材质
let mTrans = new Material(sSpecularTrans, sShadowCaster1, MATERIAL_TYPE.TRANSLUCENT, 0)
let mFloor = new Material(sSpecularBC, sShadowCaster2, MATERIAL_TYPE.OPAQUE, 0);
// 模型
let smQuad = new Model('./Res/Model/Quad.obj', 1);
let smFloor = new Model('/Res/Model/Plane.obj', 1);
// Mesh(Actor)
let quad = new Mesh(new Transform(new Vector3([0, 1.5, 0])), smQuad, mTrans, false);
let floor = new Mesh(new Transform(), smFloor, mFloor, true);
// 贴图
let tFloor = new Texture('./Res/Material/SpanishPavement_BC.png');

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [
    sSpecularTrans.FS.bind(sSpecularTrans)
]; 

this.clearColor = [0, 0, 0, 1];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [smQuad, smFloor];
    scene.materialList = [mTrans, mFloor];
    scene.textureList = [tFloor];
    scene.meshList = [floor, quad];
    scene.lightList = [light];
    scene.camera = simpleCamera;
    scene.ambientColor = [0.1, 0.1, 0.1];
}

// 在运行前执行一次
this.customBeginPlay = () =>
{
    mFloor.setTexture('u_TexBC', tFloor);
    mTrans.setCullMode(CULL_MODE.OFF);
}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
   
}