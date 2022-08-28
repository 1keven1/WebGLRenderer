// 创建需要用到的东西
let simpleCamera = new SimpleRotateCamera(new Vector3([0, 0, 0]));
simpleCamera.yawSpeed = 10;
simpleCamera.pitchSpeed = 10;
simpleCamera.zoomSpeed = 1;
// 光源
let sun = new Light(new Transform(new Vector3([0.0, 5.0, 0.0]), new Vector3([-45, 45, 0])), new Vector3([1, 1, 1]), 1, LIGHT_TYPE.DIRECTIONAL);
// Shader
let sPBR = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/PBR.frag');
let sSC = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let sSpecular = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/Specular.frag');
let sSkyBox = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/SkyBox.frag')
// 材质
let mPBR = new Material(sPBR, sSC);
let mFloor = new Material(sSpecular);
let mSkyBox = new Material(sSkyBox, null, MATERIAL_TYPE.SKYBOX);
// 模型
let smSphere = new Model('./Res/Model/Sphere.obj');
let smFloor = new Model('./Res/Model/Plane.obj');
let smSkyBox = new Model('./Res/Model/SkyBox.obj');
// Mesh(Actor)
let sphere = new Mesh(new Transform(new Vector3([0, 0, 0])), smSphere, mPBR, true);
let floor = new Mesh(new Transform(new Vector3([0, -1, 0])), smFloor, mFloor, false);
let skyBox = new Mesh(new Transform(), smSkyBox, mSkyBox, false);
// 贴图
let tAmbientCubemap = new AmbientCubemap('./Res/Cubemap/TestSky1');
let tBRDFLut = new Texture('./Res/PBR/BRDFLut.jpg');
tBRDFLut.bGenerateMipmap = false;
tBRDFLut.setWrapMode(gl.CLAMP_TO_EDGE);

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [
    sPBR.FS.bind(sPBR),
    sSkyBox.FS.bind(sSkyBox)
]; 

this.clearColor = [0, 0, 0, 1];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [smSphere, smFloor, smSkyBox];
    scene.materialList = [mPBR, mFloor, mSkyBox];
    scene.textureList = [tAmbientCubemap, tBRDFLut];
    scene.meshList = [sphere, skyBox];
    scene.lightList = [sun];
    scene.camera = simpleCamera;
    scene.ambientCubemap = tAmbientCubemap;
    scene.ambientColor = [0.03, 0.03, 0.03];
}

// 在运行前执行一次
this.customBeginPlay = () =>
{
    mSkyBox.setTexture('u_CubeMap', tAmbientCubemap);

    mPBR.setTexture('u_BRDFLut', tBRDFLut);
}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
   
}