// 创建需要用到的东西
let camera = new Camera(new Transform(new Vector3([0.0, 2.0, 6.0]), new Vector3([-20, 0, 0])), 60, 0.1, 100);
let simpleCamera = new simpleRotateCamera();
let light = new Light(new Transform(new Vector3([0.0, 5.0, 0.0]), new Vector3([-45, 45, 0])), new Vector3([1.0, 1.0, 1.0]), 10);

let shadowCaster1 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let shadowCaster2 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let diffuseShader = new Shader('./DefaultShader/Diffuse.vert', './DefaultShader/Diffuse.frag');
let diffuseMaterial = new Material(diffuseShader, shadowCaster1);
let texShader = new Shader('./DefaultShader/DiffuseTex.vert', './DefaultShader/DiffuseTex.frag');
let texMaterial = new Material(texShader, shadowCaster2);

let cube = new Model('./Res/Model/Cube.obj');
let plane = new Model('./Res/Model/Plane.obj');
let sphere = new Model('./Res/Model/Sphere.obj')

let meshCube = new Mesh(new Transform(), cube, texMaterial);
let floor = new Mesh(new Transform(new Vector3([0, -1, 0])), plane, diffuseMaterial);

let textureSky = new Texture('./Res/Image/Sky.jpg', gl.TEXTURE_2D);
let textureOnion = new Texture('./Res/Image/Test.jpg', gl.TEXTURE_2D);

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [texShader];
this.clearColor = [0.1, 0.1, 0.11, 1.0];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [cube, sphere, plane];
    scene.materialList = [diffuseMaterial, texMaterial];
    scene.textureList = [textureSky, textureOnion];
    scene.meshList = [meshCube, floor];
    scene.lightList = [light];
    scene.camera = simpleCamera;
}

// 在运行时执行一次
this.customBeginPlay = () =>
{
    meshCube.setRotation(new Vector3([0.0, 0.0, 0.0]));
    diffuseMaterial.setVector3f('u_AmbientColor', 0.2, 0.2, 0.2);
    texMaterial.setVector3f('u_AmbientColor', 0.2, 0.2, 0.2);
    texMaterial.setTexture('u_Texture', textureOnion);
}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
    meshCube.addRotationOffset(new Vector3([0, 1.5, 0]).multiplyf(deltaSecond));
}