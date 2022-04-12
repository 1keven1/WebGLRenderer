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

        gl.clearColor(0, 0, 0, 1);
    }

    start()
    {
        // 加载场景
        this.scene.loadOver = this.startRenderLoop.bind(this);
        this.scene.load()

        
    }

    customBeginPlay()
    {
        console.warn('未重写Custom Begin Play');
    }

    startRenderLoop()
    {
        this.customBeginPlay();
        
        let renderLoop = () =>
        {
            this.customTick();
            this.scene.calculateMatrices();
            this.scene.render();
            requestAnimationFrame(renderLoop);
        }
        renderLoop();
    }

    customTick()
    {
        console.warn('未重写Custom Tick');
    }
}