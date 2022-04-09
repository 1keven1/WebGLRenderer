/**
 * 已弃用
 * @param {*} gl 
 * @param {string} fileName 
 * @param {*} shader 
 */
// Load shader from file
function loadShaderFile(gl, fileName, shader) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 404) {
            OnLoadShader(gl, request.responseText, shader);
        }
    }
    request.open('GET', fileName, true);
    request.send();
}

function OnLoadShader(gl, fileString, type) {
    if (type == gl.VERTEX_SHADER) {
        VSHADER_SOURCE = fileString;
    }
    else if (type == gl.FRAGMENT_SHADER) {
        FSHADER_SOURCE = fileString;
    }
    if (VSHADER_SOURCE && FSHADER_SOURCE) {
        // 开始渲染函数
        start(gl);
    }
}

/**
 * 加载完后调用 shaderReadOver(gl, material)事件
 * @param {*} gl 
 * @param {string} vFile 
 * @param {string} fFile 
 * @param {*} material 
 */
function readShaderFile(gl, vFile, fFile, material){
    var vRequest = new XMLHttpRequest();
    var fRequest = new XMLHttpRequest();

    vRequest.onreadystatechange = function () {
        if (vRequest.readyState === 4 && vRequest.status !== 404) {
            material.VSHADER_SOURCE = vRequest.responseText;
            if(material.VSHADER_SOURCE && material.FSHADER_SOURCE) shaderReadOver(gl, material);
        }
    }
    fRequest.onreadystatechange = function () {
        if (fRequest.readyState === 4 && fRequest.status !== 404) {
            material.FSHADER_SOURCE = fRequest.responseText;
            if(material.VSHADER_SOURCE && material.FSHADER_SOURCE) shaderReadOver(gl, material);
        }
    }

    vRequest.open('GET', vFile, true);
    vRequest.send();
    fRequest.open('GET', fFile, true);
    fRequest.send();
}
