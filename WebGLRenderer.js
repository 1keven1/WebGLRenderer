'use strict';
const canvas = document.querySelector('canvas');
const gl = getWebGLContext(canvas);
let initCanvasAndWebGL = function () {
    if (!canvas) {
        console.console.error('获取Canvas失败');
    }
    canvas.bLeftMouse = false;
    canvas.bRightMouse = false;
    canvas.bMiddleMouse = false;
    canvas.mouseX = 0.0;
    canvas.mouseY = 0.0;
    canvas.wheel = 0;

    if (!gl) {
        console.error("Get WebGL Render Context Failed");
    }
}
initCanvasAndWebGL();

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
        this.clearColor = [0.0, 0.0, 0.0, 1.0];

        this.codeEditor.changeSize(window.innerWidth * this.codeEditor.sizePercent);

        this.implementEvents();
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

            this.scene.update(deltaSecond);

            this.customTick(deltaSecond);

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

    implementEvents() {
        // 禁用右键菜单
        document.oncontextmenu = function(){
            return false;
        }

        window.onresize = () => {
            this.codeEditor.changeSize(window.innerWidth * this.codeEditor.sizePercent);
        }

        canvas.addEventListener('mousemove', (ev) => {
            canvas.mouseX = ev.offsetX;
            canvas.mouseY = ev.offsetY;
        })
        canvas.addEventListener('mousedown', (ev) => {
            switch (ev.button) {
                // 左键
                case 0:
                    canvas.bLeftMouse = true;
                    break;
                // 中键
                case 1:
                    canvas.bMiddleMouse = true;
                    break;
                // 右键
                case 2:
                    canvas.bRightMouse = true;
                    break;
                default:
                    console.warn('mousedown事件返回值button值错误：', ev.button);
                    break;
            }
        })
        canvas.addEventListener('mouseup', (ev) => {
            switch (ev.button) {
                // 左键
                case 0:
                    canvas.bLeftMouse = false;
                    break;
                // 中键
                case 1:
                    canvas.bMiddleMouse = false;
                    break;
                // 右键
                case 2:
                    canvas.bRightMouse = false;
                    break;
                default:
                    console.warn('mouseup事件返回值button值错误：', ev.button);
                    break;
            }
        })
        canvas.addEventListener('mouseleave', (ev) => {
            canvas.bLeftMouse = false;
            canvas.bRightMouse = false;
            canvas.bMiddleMouse = false;
        })
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
        this.sizePercent = 0.4;

        this.codeEditor = document.querySelector('.code-editor');
        this.toogleCode = this.codeEditor.querySelector('.toggle-code');
        this.tabContainer = this.codeEditor.querySelector('.tabs');
        this.panelContainer = this.codeEditor.querySelector('.panels');
        this.applyButton = this.codeEditor.querySelector('.apply-code');
        this.resizeHandler = this.codeEditor.querySelector('.resize-handler');
        this.choise = -1;
        this.visability = false;

        this.implementEvents();
    }

    implementEvents() {
        // 切换代码显示
        this.toogleCode.addEventListener('click', () => {
            this.setVisability(!this.visability);
        })

        // 确定按钮
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

        // resize操作
        this.resizeHandler.addEventListener('mousedown', (ev) => {
            this.resizeHandler.holding = true;
            this.panelContainer.blur();
        })

        document.addEventListener('mouseup', (ev) => {
            this.resizeHandler.holding = false;
        })

        document.addEventListener('mousemove', (ev) => {
            if (this.resizeHandler.holding) {
                let w = window.innerWidth - ev.clientX;
                this.sizePercent = w / window.innerWidth;
                this.changeSize(w);
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

        this.setVisability(this.visability);
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
        let tabNames = ['Script'];
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

    changeSize(w, clamp = true) {
        if (!this.visability) {
            this.codeEditor.style.width = 0 + 'px';
            height = canvas.clientHeight;
            width = canvas.clientWidth;
            canvas.height = height;
            canvas.width = width;
            return;
        }
        if (clamp) {
            if (w > window.innerWidth * 0.9) w = window.innerWidth * 0.9;
            if (w < window.innerWidth * 0.1) w = window.innerWidth * 0.1;
        }
        this.codeEditor.style.width = w + 'px';
        height = canvas.clientHeight;
        width = canvas.clientWidth;
        canvas.height = height;
        canvas.width = width;
    }

    setVisability(visability) {
        if (this.visability === visability) return;
        this.visability = visability;
        if (visability) {
            this.changeSize(window.innerWidth * this.sizePercent);
        }
        else {
            this.changeSize(0, false);
        }
    }
}

