// 创建需要用到的东西
let simpleCamera = new SimpleRotateCamera(new Vector3([0, 0, 0]));
simpleCamera.yawSpeed = 10;
simpleCamera.pitchSpeed = 10;
simpleCamera.zoomSpeed = 1;
// 光源
let sun = new Light(new Transform(new Vector3([0.0, 5.0, 0.0]), new Vector3([-45, 45, 0])), new Vector3([1, 1, 1]), 1, LIGHT_TYPE.DIRECTIONAL);
// Shader
let sPBR = new Shader('../DefaultShader/DefaultVert.vert', '../DefaultShader/PBR.frag');
let sSC = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let sSpecular = new Shader('../DefaultShader/DefaultVert.vert', '../DefaultShader/Specular.frag');
// 材质
let mPBR = new Material(sPBR, sSC);
let mFloor = new Material(sSpecular);
// 模型
let smSphere = new Model('../Res/Model/Sphere.obj');
let smFloor = new Model('../Res/Model/Plane.obj');
// Mesh(Actor)
let sphere = new Mesh(new Transform(new Vector3([0, 0, 0])), smSphere, mPBR, true);
let floor = new Mesh(new Transform(new Vector3([0, -1, 0])), smFloor, mFloor, false);
// 贴图


// 想编辑的Shader列表
this.codeEditor.editableShaderList = [
    sPBR.FS.bind(sPBR)
]; 

this.clearColor = [0, 0, 0, 1];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [smSphere, smFloor];
    scene.materialList = [mPBR, mFloor];
    scene.textureList = [];
    scene.meshList = [sphere, floor];
    scene.lightList = [sun];
    scene.camera = simpleCamera;
    scene.ambientColor = [0.03, 0.03, 0.03];
}

// 在运行前执行一次
this.customBeginPlay = () =>
{

}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
   
}