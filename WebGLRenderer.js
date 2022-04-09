'use strict';
const canvas = document.querySelector('canvas');
if (!canvas)
{
    console.console.error('获取Canvas失败');
}
const gl = getWebGLContext(canvas);
if (!gl)
{
    console.error("Get WebGL Render Context Failed");
}
let width = canvas.width;
let height = canvas.height;

class WebGLRenderer
{
    constructor(scene)
    {
        this.scene = scene;
    }

    startRender()
    {
        this.loadScene();
        this.customBeginPlay();

        let renderLoop = () =>
        {
            console.log(scene);
            this.customTick();
            this.calculateMatrices();
            this.render;
            // requestAnimationFrame(renderLoop);
        }
        renderLoop();
    }

    loadScene()
    {
        // console.log(scene);
        // 加载MeshList
        this.scene.meshList.forEach((mesh, index, arr) =>
        {
            // console.log(mesh);
            // 加载OBJ模型 并解析

            // 加载shader 并编译 初始化shader变量

        });

        // 加载贴图
        this.scene.textureList.forEach((texture, index, arr) =>
        {
            console.log(texture);
        })
    }

    customBeginPlay()
    {

    }

    customTick()
    {
        console.log('custom tick');
    }

    calculateMatrices()
    {

    }

    render()
    {
        console.log('render');
    }
}