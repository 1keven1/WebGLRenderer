// 创建需要用到的东西

// 光源

// Shader

// 材质

// 模型

// Mesh(Actor)

// 贴图


// 想编辑的Shader列表
this.codeEditor.editableShaderList = [

]; 

this.clearColor = [0, 0, 0, 1];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [];
    scene.materialList = [];
    scene.textureList = [];
    scene.meshList = [];
    scene.lightList = [];
    scene.camera = simpleCamera;
    scene.ambientColor = [0.1, 0.1, 0.1];
}

// 在运行前执行一次
this.customBeginPlay = () =>
{

}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
   
}