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
const editP = document.querySelector('textarea');

class WebGLRenderer
{
    /**
     * 
     * @param {Scene} scene 
     * @param {Material} editableMat
     */
    constructor(editableMat = null)
    {
        this.scene = new Scene([], [], [], [], [], null);
        // this.editableMat = editableMat;

        this.customJS = null;

        gl.clearColor(0, 0, 0, 1);
    }

    start()
    {
        this.bulidScene(this.scene);
        // 加载场景
        this.scene.loadOver = this.startRenderLoop.bind(this);
        this.scene.load();
    }

    /**
     * 
     * @param {Scene} scene 
     */
    bulidScene(scene) {}

    startRenderLoop()
    {
        this.customBeginPlay();
        editP.textContent = this.customJS;

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

    customBeginPlay()
    {
        console.warn('未重写Custom Begin Play');
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