'use strict';
// 材质和模型

let myMaterial = new Object();
myMaterial.VSHADER_SOURCE = null;
myMaterial.FSHADER_SOURCE = null;
myMaterial.shaderReadOver = false;
myMaterial.program = null;

let modelCube = new Object();
modelCube.loaded = false;
modelCube.vertexBuffer = null;
modelCube.texCoordBuffer = null;
modelCube.normalBuffer = null;
modelCube.indexBuffer = null;
modelCube.indexNum = -1;

let canvas;
let rotateSpeed = 20;

let bufferWidth = 1024;
let bufferHeight = 1024;

let cameraPos = [0.0, 2.0, 6.0];
let lightPos = [10.0, 10.0, 10.0, 0.0];
let lightColor = [1.0, 1.0, 1.0, 1.0];

let frameRequest;

function main()
{
    canvas = document.getElementById("webgl");

    // canvas.addEventListener('webglcontextlost', contextLost, false);
    // canvas.addEventListener('webglcontextrestored', function (event)
    // {
    //     let gl = getWebGLContext(canvas);
    //     start(gl);
    // })

    let gl = getWebGLContext(canvas);
    if (!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    // 读取shader文件到material中
    readShaderFile(gl, '7_ReadOBJ.vert', '7_ReadOBJ.frag', myMaterial);
}

// 都读完了之后开始渲染
function shaderReadOver(gl, material)
{
    material.shaderReadOver = true;
    start(gl);
}

function start(gl)
{
    // 创建shaderProgram
    myMaterial.program = createProgram(gl, myMaterial.VSHADER_SOURCE, myMaterial.FSHADER_SOURCE);
    if (!myMaterial.program)
    {
        console.log('Create Program fail');
        return;
    }

    // 初始化材质 获取默认shader变量位置
    initMaterial(gl, myMaterial.program);

    // // 获取并给自定义变量赋值
    gl.useProgram(myMaterial.program);
    myMaterial.u_AmbientColor = gl.getUniformLocation(myMaterial.program, 'u_AmbientColor');
    gl.uniform3f(myMaterial.u_AmbientColor, 0.2, 0.2, 0.2);
    gl.useProgram(null);

    initOBJ('../resource/Bunny5k.obj', gl, modelCube, 1, false);

    // 准备开始渲染
    gl.clearColor(0, 0, 0, 1);

    // 摄像机相关
    let vpMatrix = new Matrix4();
    vpMatrix.setPerspective(45, 1, 0.1, 100);
    vpMatrix.lookAt(cameraPos[0], cameraPos[1], cameraPos[2], 0, 0, 0, 0, 1, 0);

    // 光照相关
    let lightVPMatrix = new Matrix4();
    lightVPMatrix.setOrtho(-7, 7, -7, 7, 1, 100);
    lightVPMatrix.lookAt(lightPos[0], lightPos[1], lightPos[2], 0, 0, 0, 0, 1, 0);

    // 自定义初始化
    let currentAngle = 0;

    let tick = function ()
    {
        currentAngle = animate(currentAngle, rotateSpeed);

        // 绘制
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (modelCube.loaded) draw(gl, modelCube, myMaterial, vpMatrix, lightVPMatrix, 0.7, currentAngle)

        frameRequest = requestAnimationFrame(tick);
    }
    tick();
}

function initMaterial(gl, flatProgram)
{
    flatProgram.a_Position = gl.getAttribLocation(flatProgram, 'a_Position');
    flatProgram.a_TexCoord = gl.getAttribLocation(flatProgram, 'a_TexCoord');
    flatProgram.a_Normal = gl.getAttribLocation(flatProgram, 'a_Normal');

    flatProgram.u_Matrix_MVP = gl.getUniformLocation(flatProgram, 'u_Matrix_MVP');
    flatProgram.u_Matrix_M_I = gl.getUniformLocation(flatProgram, 'u_Matrix_M_I');
    flatProgram.u_LightPos = gl.getUniformLocation(flatProgram, 'u_LightPos');
    flatProgram.u_LightColor = gl.getUniformLocation(flatProgram, 'u_LightColor');
    flatProgram.u_Matrix_Light = gl.getUniformLocation(flatProgram, 'u_Matrix_Light');
    flatProgram.u_ShadowMap = gl.getUniformLocation(flatProgram, 'u_ShadowMap');
}

function initOBJ(fileName, gl, model, scale, reverse)
{
    let request = new XMLHttpRequest();
    request.onreadystatechange = function ()
    {
        if (request.readyState === 4 && request.status !== 404)
        {
            let objDoc = new OBJDoc(fileName);
            // 读取OBJ数据
            if (!objDoc.parse(request.responseText, scale, reverse))
            {
                console.log('读入OBJ文件失败');
                return;
            }
            // 解码数据为数组
            let bufferArrays = objDoc.DecodeBufferArrays();
            initModelBuffers(gl, model, bufferArrays);
            model.loaded = true;
        }
    }
    request.open('GET', fileName, true);
    request.send();
}

function initModelBuffers(gl, model, bufferArrays)
{
    model.vertexBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, bufferArrays.vertices, 3, gl.FLOAT, gl.STATIC_DRAW);
    model.texCoordBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, bufferArrays.texCoords, 2, gl.FLOAT, gl.STATIC_DRAW);
    model.normalBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, bufferArrays.normals, 3, gl.FLOAT, gl.STATIC_DRAW);
    model.indexBuffer = createModelBuffers(gl, gl.ELEMENT_ARRAY_BUFFER, bufferArrays.indices, 3, gl.UNSIGNED_SHORT, gl.STATIC_DRAW);
    if (!model.vertexBuffer || !model.normalBuffer || !model.texCoordBuffer || !model.indexBuffer) return false;

    model.indexNum = bufferArrays.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return true;
}

function initCubeBuffers(gl, model)
{
    let vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
    ]);

    let texCoords = new Float32Array([   // Texture coordinates
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
    ]);

    let normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    let indices = new Uint16Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    model.vertexBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, vertices, 3, gl.FLOAT, gl.STATIC_DRAW);
    model.texCoordBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, texCoords, 2, gl.FLOAT, gl.STATIC_DRAW);
    model.normalBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, normals, 3, gl.FLOAT, gl.STATIC_DRAW);
    model.indexBuffer = createModelBuffers(gl, gl.ELEMENT_ARRAY_BUFFER, indices, 3, gl.UNSIGNED_SHORT, gl.STATIC_DRAW);
    if (!model.vertexBuffer || !model.normalBuffer || !model.texCoordBuffer || !model.indexBuffer) return false;

    model.indexNum = indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return true;
}

function createModelBuffers(gl, bufferTarget, data, dataNum, dataType, usage)
{
    let buffer = gl.createBuffer();
    if (!buffer)
    {
        console.log('Create Buffer Fail');
        return null;
    }

    gl.bindBuffer(bufferTarget, buffer);
    gl.bufferData(bufferTarget, data, usage);

    buffer.dataNum = dataNum;
    buffer.dataType = dataType;
    return buffer;
}

function initArrayBuffer(gl, data, num, type, attribute)
{
    // Create a buffer object
    let buffer = gl.createBuffer();
    if (!buffer)
    {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute letiable
    let a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0)
    {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment to a_attribute letiable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

function initTexture(gl, texSrc, texUnit, texType = gl.TEXTURE_2D)
{
    let texture = gl.createTexture();   // Create a texture object
    if (!texture)
    {
        console.log('Failed to create the texture object');
        return null;
    }

    let image = new Image();  // Create a image object
    if (!image)
    {
        console.log('Failed to create the image object');
        return null;
    }

    // 当图片加载好时
    image.onload = function ()
    {
        // Write the image data to texture object
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate

        gl.activeTexture(texUnit);
        gl.bindTexture(texType, texture);
        gl.texParameteri(texType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(texType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // gl.activeTexture(null);
    };

    // Tell the browser to load an Image
    image.src = texSrc;

    return texture;
}

function draw(gl, model, material, vpMatrix, lightVPMatrix, scale, rotY = 0, rotX = 0)
{
    // 使用对应shader
    gl.useProgram(material.program);
    gl.enable(gl.DEPTH_TEST);

    // 绑定Vertex Buffer
    if (material.program.a_Position >= 0) bindAttributeToBuffer(gl, material.program.a_Position, model.vertexBuffer);
    if (material.program.a_TexCoord >= 0) bindAttributeToBuffer(gl, material.program.a_TexCoord, model.texCoordBuffer);
    if (material.program.a_Normal >= 0) bindAttributeToBuffer(gl, material.program.a_Normal, model.normalBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

    // 传入默认变量
    if (material.program.u_LightPos) gl.uniform4fv(material.program.u_LightPos, lightPos);
    if (material.program.u_LightColor) gl.uniform4fv(material.program.u_LightColor, lightColor);


    // 计算各种矩阵
    let mMatrix = new Matrix4().setTranslate(0, 0, 0).scale(scale, scale, scale).rotate(rotY, 0, 1, 0).rotate(rotX, 1, 0, 0);
    let mIMatrix = new Matrix4().setInverseOf(mMatrix);
    let mvpMatrix = new Matrix4().set(vpMatrix).multiply(mMatrix);

    gl.uniformMatrix4fv(material.program.u_Matrix_MVP, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(material.program.u_Matrix_M_I, false, mIMatrix.elements);

    let mvpMatrixLight = new Matrix4().set(lightVPMatrix).multiply(mMatrix);
    if (material.program.u_Matrix_Light) gl.uniformMatrix4fv(material.program.u_Matrix_Light, false, mvpMatrixLight.elements);

    // 绘制
    gl.drawElements(gl.TRIANGLES, model.indexNum, model.indexBuffer.dataType, 0);
}

function bindAttributeToBuffer(gl, a_attribute, buffer)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.dataNum, buffer.dataType, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

let lastTime = Date.now();
function animate(angle, speed)
{
    let deltaTime = Date.now() - lastTime;
    lastTime = Date.now();

    let newAngle = angle + (speed * deltaTime) / 1000.0;
    return newAngle % 360;
}

function contextLost(event)
{
    cancelAnimationFrame(frameRequest);
    event.preventDefault();
}

//OBJ Props------------------------------------------------------------
let Vertex = function (x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
}

let TexCoord = function (u, v)
{
    this.u = u;
    this.v = v;
}

let Normal = function (x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
}

let Face = function ()
{
    this.vIndex = new Array(0);
    this.tIndex = new Array(0);
    this.nIndex = new Array(0);
}

let BufferArrays = function (vertices, texCoords, normals, indices)
{
    this.vertices = vertices;
    this.texCoords = texCoords;
    this.normals = normals;
    this.indices = indices;
}

//OBJDoc----------------------------------------------------------------
let OBJDoc = function (fileName)
{
    this.fileName = fileName;
    this.vertices = new Array(0);
    this.texCoords = new Array(0);
    this.normals = new Array(0);
    this.faces = new Array(0);
}

OBJDoc.prototype.parse = function (fileString, scale, reverseNormal)
{
    let lines = fileString.split('\n');
    lines.push(null);
    let index = 0;

    let line;
    let sp = new StringParser();
    while ((line = lines[index++]) != null)
    {
        sp.init(line);
        let command = sp.getWord();
        if (command == null) continue;

        switch (command)
        {
            case '#':
                continue;
            case 'mtllib':
                continue;
            case 'usemtl':
                continue;
            case 's':
                continue;
            case 'o':
                console.log('More Than 1 Object in OBJ: ', this.fileName);
                return false;
            case 'g':
                console.log('More Than 1 Object in OBJ: ', this.fileName);
                return false;
            case 'v':
                let vertex = this.parseVertex(sp, scale);
                this.vertices.push(vertex);
                continue;
            case 'vt':
                let texCoord = this.parseTexCoord(sp);
                this.texCoords.push(texCoord);
                continue;
            case 'vn':
                let normal = this.parseNormal(sp);
                this.normals.push(normal);
                continue;
            case 'f':
                let face = this.parseFace(sp);
                this.faces.push(face);
                continue;
            default:
                console.log('Undefined OBJ Head: ', command);
                return false;
        }
    }
    return true;
}

OBJDoc.prototype.parseVertex = function (sp, scale)
{
    let x = sp.getFloat() * scale;
    let y = sp.getFloat() * scale;
    let z = sp.getFloat() * scale;
    return (new Vertex(x, y, z));
}

OBJDoc.prototype.parseTexCoord = function (sp)
{
    let u = sp.getFloat();
    let v = sp.getFloat();
    return (new TexCoord(u, v));
}

OBJDoc.prototype.parseNormal = function (sp)
{
    let x = sp.getFloat();
    let y = sp.getFloat();
    let z = sp.getFloat();
    return (new Normal(x, y, z));
}

OBJDoc.prototype.parseFace = function (sp)
{
    let face = new Face();
    // get indices
    for (; ;)
    {
        let point = sp.getWord();
        if (point == null) break;
        let pointAttri = point.split('/');
        if (pointAttri.length != 3)
        {
            console.log('there is no Normal in OBJ: ', this.fileName);
            break;
        }

        let vi = parseInt(pointAttri[0]) - 1;
        let vt;
        if (pointAttri[1] != '') vt = parseInt(pointAttri[1]) - 1;
        else vt = -1;
        let vn = parseInt(pointAttri[2]) - 1;

        face.vIndex.push(vi);
        face.tIndex.push(vt);
        face.nIndex.push(vn);
    }

    if (face.nIndex.length != 3)
    {
        console.log('有多边面 OBJ: ', this.fileName);
    }

    return face;
}

OBJDoc.prototype.DecodeBufferArrays = function ()
{
    // Create an arrays for vertex coordinates, normals, colors, and indices
    let numIndices = this.faces.length * 3;

    let numVertices = numIndices;
    let vertices = new Float32Array(numVertices * 3);
    let texCoords = new Float32Array(numVertices * 2);
    let normals = new Float32Array(numVertices * 3);
    let indices = new Uint16Array(numIndices);

    // Set vertex, normal and color
    let index_indices = 0;
    for (let i = 0; i < this.faces.length; i++)
    {
        let face = this.faces[i];
        for (let j = 0; j < 3; j++)
        {
            // Set index
            indices[index_indices] = index_indices;
            // Copy vertex
            let vIndex = face.vIndex[j];
            let vertex = this.vertices[vIndex];
            vertices[index_indices * 3 + 0] = vertex.x;
            vertices[index_indices * 3 + 1] = vertex.y;
            vertices[index_indices * 3 + 2] = vertex.z;
            // UV坐标
            let tIndex = face.tIndex[j];
            let texCoord;
            if (tIndex >= 0) texCoord = this.texCoords[tIndex];
            else texCoord = new TexCoord(0, 0);
            texCoords[index_indices * 2 + 0] = texCoord.u;
            texCoords[index_indices * 2 + 1] = texCoord.v;
            // Copy normal
            let nIdx = face.nIndex[j];
            let normal = this.normals[nIdx];
            normals[index_indices * 3 + 0] = normal.x;
            normals[index_indices * 3 + 1] = normal.y;
            normals[index_indices * 3 + 2] = normal.z;
            index_indices++;
        }
    }

    return new BufferArrays(vertices, texCoords, normals, indices);
}

// StringParser---------------------------------------------------------
// Constructor
let StringParser = function (str)
{
    this.str;   // Store the string specified by the argument
    this.index; // Position in the string to be processed
    this.init(str);
}
// Initialize StringParser object
StringParser.prototype.init = function (str)
{
    this.str = str;
    this.index = 0;
}

// Skip delimiters
StringParser.prototype.skipDelimiters = function ()
{
    let i = this.index;
    for (let len = this.str.length; i < len; i++)
    {
        let c = this.str.charAt(i);
        // Skip TAB, Space, '(', ')
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
        break;
    }
    this.index = i;
}

// Skip to the next word
StringParser.prototype.skipToNextWord = function ()
{
    this.skipDelimiters();
    let n = getWordLength(this.str, this.index);
    this.index += (n + 1);
}

// Get word
StringParser.prototype.getWord = function ()
{
    this.skipDelimiters();
    let n = getWordLength(this.str, this.index);
    if (n == 0) return null;
    let word = this.str.substr(this.index, n);
    this.index += (n + 1);

    return word;
}

// Get integer
StringParser.prototype.getInt = function ()
{
    return parseInt(this.getWord());
}

// Get floating number
StringParser.prototype.getFloat = function ()
{
    return parseFloat(this.getWord());
}

// Get the length of word
function getWordLength(str, start)
{
    let n = 0;
    let i, len;
    for (i = start, len = str.length; i < len; i++)
    {
        let c = str.charAt(i);
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
            break;
    }
    return i - start;
}

