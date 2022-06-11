// 创建需要用到的东西
let simpleCamera = new SimpleRotateCamera(new Vector3([0, 1, 0]));
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
let sDiffuseBC = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/DiffuseBC.frag');
let sShadowCaster1 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let sSpecularBC = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/SpecularBC.frag');
let sShadowCaster2 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
// 材质
let mBox = new Material(sDiffuseBC, sShadowCaster1, MATERIAL_TYPE.OPAQUE, 0);
let mFloor = new Material(sSpecularBC, sShadowCaster2, MATERIAL_TYPE.OPAQUE, 0);
// 模型
let smBox = new Model('./Res/Model/Cube.obj', 1);
let smFloor = new Model('/Res/Model/Plane.obj', 1);
// Mesh(Actor)
let box = new Mesh(new Transform(new Vector3([0, 1.001, 0]), new Vector3([0, 0, 0])), smBox, mBox, true);
let floor = new Mesh(new Transform(), smFloor, mFloor, true);
// 贴图
let tYangCong = new Texture('./Res/Image/YangCong256.jpg');
let tFloor = new Texture('./Res/Material/SpanishPavement_BC.png');

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [
    sDiffuseBC.FS.bind(sDiffuseBC),
    sSpecularBC.FS.bind(sSpecularBC)
]; 

this.clearColor = [0.1, 0.1, 0.11, 1];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [smBox, smFloor];
    scene.materialList = [mBox, mFloor];
    scene.textureList = [tYangCong, tFloor];
    scene.meshList = [box, floor];
    scene.lightList = [light];
    scene.camera = simpleCamera;
    scene.ambientColor = [0.1, 0.1, 0.11];
}

// 在运行前执行一次
this.customBeginPlay = () =>
{
    mBox.setTexture('u_TexBC', tYangCong);
    mFloor.setTexture('u_TexBC', tFloor);
    mFloor.setCullMode(CULL_MODE.OFF);
}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
    box.addRotationOffset(new Vector3([0, 15, 0]).multiplyf(deltaSecond));
}