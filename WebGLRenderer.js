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
// const editP = document.querySelector('textarea');

class WebGLRenderer
{
    /**
     * 
     * @param {Scene} scene 
     * @param {Material} editableMat
     */
    constructor(scene, editableMat = null)
    {
        this.scene = scene;
        // this.editableMat = editableMat;

        gl.clearColor(0, 0, 0, 1);
    }

    start()
    {
        // 加载场景
        this.scene.loadOver = this.startRenderLoop.bind(this);
        this.scene.load();
    }

    customBeginPlay()
    {
        console.warn('未重写Custom Begin Play');
    }

    startRenderLoop()
    {
        this.customBeginPlay();
        // if (this.editableMat) editP.textContent = this.editableMat.baseShader.fShaderSource;

        console.log('开始渲染循环');
        let lastTime = 0;
        let deltaSecond = 0;
        let renderLoop = (timeStamp) =>
        {
            deltaSecond = (timeStamp - lastTime) * 0.01;
            lastTime = timeStamp;

            this.customTick(deltaSecond);
            this.scene.calculateMatrices();
            this.scene.render();
            requestAnimationFrame(renderLoop);
        }
        renderLoop(0);
    }

    /**
     * 
     * @param {Number} deltaSecond 
     */
    customTick(deltaSecond)
    {
        console.warn('未重写Custom Tick');
    }
}