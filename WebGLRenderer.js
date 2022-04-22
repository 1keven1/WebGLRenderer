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
     * @param {Material} editableMat
     */
    constructor()
    {
        this.scene = new Scene([], [], [], [], [], null);
        this.customJS = null;
        this.frameRequest = null;
        this.codeEditor = new CodeEditor(this);

        gl.clearColor(0, 0, 0, 1);
    }

    start()
    {
        this.codeEditor.customJS = this.customJS;

        eval(this.customJS);

        this.codeEditor.refresh();
        
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

        console.log('开始渲染循环');
        this.lastTime = 0;
        let renderLoop = (timeStamp) =>
        {
            let deltaSecond = (timeStamp - this.lastTime) * 0.01;
            this.lastTime = timeStamp;

            if (deltaSecond > 1) deltaSecond = 0.01;
            this.customTick(deltaSecond);

            this.scene.calculateMatrices();
            this.scene.render();
            this.frameRequest = requestAnimationFrame(renderLoop);
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

    stop()
    {
        if (this.frameRequest)
        {
            cancelAnimationFrame(this.frameRequest);
            this.frameRequest = null;
        }
    }

    clear()
    {
        this.lastTime = 0;
        this.scene.clear();
    }
}

class CodeEditor
{
    /**
     * 
     * @param {WebGLRenderer} renderer 
     */
    constructor(renderer)
    {
        this.renderer = renderer;

        this.customJS = null;

        this.editP = document.querySelector('textarea');
        this.applyButton = document.querySelector('.apply-code');

        this.applyButton.addEventListener('click', () =>
        {
            this.applyCode();
        })
    }

    refresh()
    {
        this.editP.textContent = this.customJS;
    }

    applyCode()
    {
        this.renderer.stop();
        this.renderer.clear();
        this.renderer.customJS = this.editP.value;
        this.renderer.start();
    }
}