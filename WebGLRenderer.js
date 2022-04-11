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
    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene)
    {
        this.scene = scene;

        this.meshLoadedNum = 0;
        this.textureLodedNum = 0;
    }

    start()
    {
        this.loadScene();
        this.customBeginPlay();

    }

    loadScene()
    {
        console.log('loading scene');
        // 加载MeshList
        this.scene.meshList.forEach((mesh, index, arr) =>
        {
            console.log('loading mesh');
            mesh.loadOver = this.meshLoadOver.bind(this);
            mesh.loadMesh();
        });

        // 加载贴图
        this.scene.textureList.forEach((texture, index, arr) =>
        {
            console.log(texture);
            texture.loadOver = this.textureLoadOver.bind(this);
            texture.loadTexture();
        })
    }

    meshLoadOver()
    {
        console.log('mesh load over');
        this.meshLoadedNum++;
        if (this.meshLoadedNum === this.scene.meshList.length && this.textureLodedNum === this.scene.textureList.length)
            this.startRenderLoop();
    }

    textureLoadOver()
    {
        console.log('texture load over');
        this.textureLodedNum++;
        if (this.meshLoadedNum === this.scene.meshList.length && this.textureLodedNum === this.scene.textureList.length)
        this.startRenderLoop();
    }

    customBeginPlay()
    {

    }

    startRenderLoop()
    {
        let renderLoop = () =>
        {
            this.customTick();
            this.calculateMatrices();
            this.render();
            // requestAnimationFrame(renderLoop);
        }
        renderLoop();
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