'use strict';
const canvas = document.querySelector('canvas');
if (!canvas) {
    console.console.error('获取Canvas失败');
}
const gl = getWebGLContext(canvas);
if (!gl) {
    console.error("Get WebGL Render Context Failed");
}

let width = canvas.clientWidth;
let height = canvas.clientHeight;

class WebGLRenderer {
    /**
     * 
     * @param {Scene} scene 
     * @param {Material} editableMat
     */
    constructor() {
        this.scene = new Scene([], [], [], [], [], null);
        this.customJS = null;
        this.frameRequest = null;
        this.codeEditor = new CodeEditor(this);
        this.codeEditorSize = 0.4;
        this.clearColor = [0.0, 0.0, 0.0, 1.0];

        this.codeEditor.changeSize(window.innerWidth * this.codeEditorSize);
        height = canvas.clientHeight;
        width = canvas.clientWidth;
        canvas.height = height;
        canvas.width = width;

        window.onresize = () => {
            this.codeEditor.changeSize(window.innerWidth * this.codeEditorSize);
            height = canvas.clientHeight;
            width = canvas.clientWidth;
            canvas.height = height;
            canvas.width = width;
        }
    }

    start() {
        this.codeEditor.customJS = this.customJS;

        eval(this.customJS);

        this.bulidScene(this.scene);
        // 加载场景
        this.scene.loadOver = this.startRenderLoop.bind(this);
        this.scene.load();
    }

    /**
     * 
     * @param {Scene} scene 
     */
    bulidScene(scene) { }

    startRenderLoop() {
        this.codeEditor.refresh();

        this.customBeginPlay();

        console.log('开始渲染循环');
        this.lastTime = 0;
        let renderLoop = (timeStamp) => {
            let deltaSecond = (timeStamp - this.lastTime) * 0.01;
            this.lastTime = timeStamp;

            if (deltaSecond > 1) deltaSecond = 0.01;
            this.customTick(deltaSecond);
            // console.log(canvas.width)

            this.scene.calculateMatrices();
            this.scene.render(this.clearColor);
            this.frameRequest = requestAnimationFrame(renderLoop);
        }
        renderLoop(0);
    }

    customBeginPlay() {
        console.warn('未重写Custom Begin Play');
    }

    /**
     * 
     * @param {Number} deltaSecond 
     */
    customTick(deltaSecond) {
        console.warn('未重写Custom Tick');
    }

    stop() {
        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
            this.frameRequest = null;
        }
    }

    clear() {
        this.lastTime = 0;
        this.scene.clear();
    }

    initWebGL() {
        gl = getWebGLContext(canvas);
        if (!gl) {
            console.error("Get WebGL Render Context Failed");
        }
    }
}

let CODE_TYPE = {
    JS: Symbol(0),
    VSHADER: Symbol(1),
    FSAHDER: Symbol(2)
}
Object.freeze(CODE_TYPE);

class CodeEditor {
    /**
     * 
     * @param {WebGLRenderer} renderer 
     */
    constructor(renderer) {
        this.renderer = renderer;

        this.customJS = null;
        this.editableShaderList = [];
        this.tabs = [];
        this.panels = [];

        this.codeEditor = document.querySelector('.code-editor');
        this.tabContainer = document.querySelector('.tabs');
        this.panelContainer = document.querySelector('.panels');
        this.applyButton = document.querySelector('.apply-code');
        this.choise = -1;

        this.applyButton.addEventListener('click', () => {
            let tab = this.tabs[this.choise];
            let code = this.panels[this.choise].textContent;
            switch (tab.type) {
                case CODE_TYPE.JS:
                    this.applyJSCode(code);
                    break;
                case CODE_TYPE.VSHADER:
                    // console.log(code);
                    this.applyVShaderCode(tab.target, code);
                    break;
                case CODE_TYPE.FSAHDER:
                    this.applyFShaderCode(tab.target, code);
                    break;
                default:
                    console.error('标签页种类错误：' + tab.type);
                    break;
            }
        })
    }

    refresh() {
        this.removeTabs();

        this.spawnTabs();

        this.tabs.forEach((tab, index, arr) => {
            tab.index = index;
            tab.addEventListener('click', () => {
                this.chooseTab(tab);
            })
        })

        this.chooseTab(this.tabs[0]);
    }

    removeTabs() {
        this.tabs.forEach((tab, index, arr) => {
            tab.remove();
        })
        this.panels.forEach((panel, index, arr) => {
            panel.remove();
        })
        this.tabs = [];
        this.panels = [];
        this.choise = -1;
    }

    spawnTabs() {
        // 生成标签
        let tabNames = ['script'];
        let tabTarget = ['js'];
        let tabType = [CODE_TYPE.JS];
        let panelContents = [this.customJS];
        this.editableShaderList.forEach((shader, index, arr) => {
            let vShaderName = shader.vShaderFile.split('/');
            let fShaderName = shader.fShaderFile.split('/');
            tabNames.push(vShaderName[vShaderName.length - 1]);
            tabNames.push(fShaderName[fShaderName.length - 1]);
            tabType.push(CODE_TYPE.VSHADER);
            tabType.push(CODE_TYPE.FSAHDER);
            tabTarget.push(shader);
            tabTarget.push(shader);

            panelContents.push(shader.vShaderSource);
            panelContents.push(shader.fShaderSource);
        })

        tabNames.forEach((tabName, index, arr) => {
            let tab = document.createElement('div');
            tab.textContent = tabName;
            tab.classList.add('tab');
            tab.target = tabTarget[index];
            tab.type = tabType[index];
            this.tabContainer.appendChild(tab);
            this.tabs.push(tab);

            let panel = document.createElement('div');
            panel.textContent = panelContents[index];
            panel.contentEditable = true;
            panel.classList.add('panel');
            this.panelContainer.appendChild(panel);
            this.panels.push(panel);
        })
    }

    chooseTab(tab) {
        if (tab.index === this.choise) return;

        // 取消选择现在的标签
        if (this.choise >= 0) {
            this.panels[this.choise].classList.remove('enable');
            this.tabs[this.choise].classList.remove('enable');
        }
        // 选择标签
        this.panels[tab.index].classList.add('enable');
        tab.classList.add('enable');
        this.choise = tab.index;
    }

    applyJSCode(code) {
        this.renderer.stop();
        this.renderer.clear();
        this.renderer.customJS = code;
        this.renderer.start();
    }

    /**
     * 
     * @param {Shader} shader 
     */
    applyVShaderCode(shader, code) {

        shader.applyChange(code, shader.fShaderSource);
    }
    applyFShaderCode(shader, code) {
        shader.applyChange(shader.vShaderSource, code);
    }

    changeSize(width) {
        this.codeEditor.style.width = width + 'px';
    }
}

