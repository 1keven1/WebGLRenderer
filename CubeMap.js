// 创建需要用到的东西
let simpleCamera = new SimpleRotateCamera(new Vector3([0, 2, 0]));
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
let sCubeMap = new Shader('./DefaultShader/DefaultVert.vert', './Res/ShowCase/CubeMap/CubeMap.frag');
let sShadowCaster1 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let sSpecular = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/Specular.frag');
let sShadowCaster2 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
// 材质
let mCubeMap = new Material(sCubeMap, sShadowCaster1, MATERIAL_TYPE.OPAQUE, 0);
let mFloor = new Material(sSpecular, sShadowCaster2, MATERIAL_TYPE.OPAQUE, 0);
// 模型
let smQuad = new Model('./Res/Model/Quad.obj', 1);
let smFloor = new Model('./Res/Model/Plane.obj', 1);
// Mesh(Actor)
let box = new Mesh(new Transform(new Vector3([0, 2, 0]), new Vector3([0, 0, 0]), new Vector3([2, 2, 2])), smQuad, mCubeMap, true);
let floor = new Mesh(new Transform(), smFloor, mFloor, true);
// 贴图
let cubeMap = new Texture('./Res/Cubemap/TestSky1', gl.TEXTURE_CUBE_MAP);

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [
    sCubeMap.FS.bind(sCubeMap),
    sSpecular.FS.bind(sSpecular)
]; 

this.clearColor = [0.1, 0.1, 0.11, 1];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [smQuad, smFloor];
    scene.materialList = [mCubeMap, mFloor];
    scene.textureList = [cubeMap];
    scene.meshList = [box, floor];
    scene.lightList = [light];
    scene.camera = simpleCamera;
    scene.ambientColor = [0.1, 0.1, 0.11];
}

// 在运行前执行一次
this.customBeginPlay = () =>
{
    mCubeMap.setTexture('u_Cube', cubeMap);
    mCubeMap.setCullMode(CULL_MODE.OFF);
    box.setCastShadow(false);
}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{

}