// 创建需要用到的东西
let simpleCamera = new SimpleRotateCamera(new Vector3([0, 2, 0]));
simpleCamera.yawSpeed = 4;
simpleCamera.pitchSpeed = 4;
simpleCamera.zoomSpeed = 0.4;
let light = new Light(new Transform(new Vector3([0.0, 5.0, 0.0]), new Vector3([-45, 45, 0])), new Vector3([1.0, 1.0, 1.0]), 10);

let dogeShader = new Shader('./DefaultShader/DefaultVert.vert', './Res/ShowCase/StartDoge/Doge.frag');
let floorShader = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/S_BCNRAO.frag');
let shadowCaster1 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let shadowCaster2 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');

let mDoge = new Material(dogeShader, shadowCaster1);
let mFloor = new Material(floorShader, shadowCaster2);

let smDoge = new Model('./Res/ShowCase/StartDoge/Doge.obj');
let smPlane = new Model('./Res/Model/Plane.obj');

let doge = new Mesh(new Transform(new Vector3([0, 0, 0]), new Vector3([0,0,0]), new Vector3([0.4, 0.4, 0.4])), smDoge, mDoge);
let floor = new Mesh(new Transform(), smPlane, mFloor);

let tFloorBC = new Texture('./Res/Material/Floor_BC.jpg', gl.TEXTURE_2D);
let tFloorN = new Texture('./Res/Material/Floor_N.jpg', gl.TEXTURE_2D);
let tFloorR = new Texture('./Res/Material/Floor_R.jpg', gl.TEXTURE_2D);
let tFloorAO = new Texture('./Res/Material/Floor_AO.jpg', gl.TEXTURE_2D);
let tDogeBC = new Texture('./Res/ShowCase/StartDoge/Doge_BC.png');
let tDogeN = new Texture('./Res/ShowCase/StartDoge/Doge_N.png');

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [floorShader, dogeShader];
this.clearColor = [0.1, 0.1, 0.11, 1.0];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [smDoge, smPlane];
    scene.materialList = [mDoge, mFloor];
    scene.textureList = [tFloorBC, tFloorN, tFloorR, tFloorAO, tDogeBC, tDogeN];
    scene.meshList = [floor, doge];
    scene.lightList = [light];
    scene.camera = simpleCamera;
}

// 在运行前执行一次
this.customBeginPlay = () =>
{
    mFloor.setVector3f('u_AmbientColor', 0.2, 0.2, 0.2);
    mFloor.setTexture('u_Texture', tFloorBC);
    mFloor.setTexture('u_Normal', tFloorN);
    mFloor.setTexture('u_Roughness', tFloorR);
    mFloor.setTexture('u_AO', tFloorAO);

    mDoge.setVector3f('u_AmbientColor', 0.15, 0.15, 0.15);
    mDoge.setTexture('u_TexBC', tDogeBC);
    mDoge.setTexture('u_TexN', tDogeN);
}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
    doge.addRotationOffset(new Vector3([0, 1.5, 0]).multiplyf(deltaSecond));
}