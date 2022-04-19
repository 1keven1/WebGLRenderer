'use strict';
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


class Model
{
    constructor(objFile, scale=1)
    {
        this.objFile = objFile;
        this.objSource = null;
        this.scale = scale;

        this.vertices = new Array(0);
        this.texCoords = new Array(0);
        this.normals = new Array(0);
        this.faces = new Array(0);

        this.vertexBuffer = null;
        this.texcoordBuffer = null;
        this.normalBuffer = null;
        this.indexBuffer = null;
        this.indexNum = -1;

        this.bLoaded = false;
    }

    load()
    {
        this.bLoaded = true;
        this.loadOBJFile()
    }

    loadOver() {}

    loadOBJFile()
    {
        let request = new XMLHttpRequest();
        request.onreadystatechange = () =>
        {
            if (request.readyState === 4 && request.status !== 404)
            {
                // 读取Obj文件
                this.objSource = request.responseText;
                // 分析为信息
                if (!this.parseOBJ())
                {
                    console.log("分析OBJ文件失败: " + this.objFile);
                }
                // 解码数据为WebGL可用的Buffer
                this.decodeBufferArrays();
                this.loadOver()
            }
        }
        request.open('GET', this.objFile, true);
        request.send();
    }

    parseOBJ()
    {
        let lines = this.objSource.split('\n');
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
                    let vertex = this.parseVertex(sp, this.scale);
                    this.vertices.push(vertex);
                    continue;
                case 'vt':
                    let texCoord = this.parseTexcoord(sp);
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

    parseVertex(sp, scale)
    {
        let x = sp.getFloat() * scale;
        let y = sp.getFloat() * scale;
        let z = sp.getFloat() * scale;
        return (new Vertex(x, y, z));
    }

    parseTexcoord(sp)
    {
        let u = sp.getFloat();
        let v = sp.getFloat();
        return (new TexCoord(u, v));
    }

    parseNormal(sp)
    {
        let x = sp.getFloat();
        let y = sp.getFloat();
        let z = sp.getFloat();
        return (new Normal(x, y, z));
    }

    parseFace(sp)
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
                console.log('there is no Normal in OBJ: ', this.objFile);
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
            console.log('有多边面 OBJ: ', this.objFile);
        }

        return face;
    }

    decodeBufferArrays()
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

        this.vertexBuffer = this.createModelBuffer(gl.ARRAY_BUFFER, vertices, 3, gl.FLOAT, gl.STATIC_DRAW);
        this.texCoordBuffer = this.createModelBuffer(gl.ARRAY_BUFFER, texCoords, 2, gl.FLOAT, gl.STATIC_DRAW);
        this.normalBuffer = this.createModelBuffer(gl.ARRAY_BUFFER, normals, 3, gl.FLOAT, gl.STATIC_DRAW);
        this.indexBuffer = this.createModelBuffer(gl.ELEMENT_ARRAY_BUFFER, indices, 3, gl.UNSIGNED_SHORT, gl.STATIC_DRAW);
        if (!this.vertexBuffer || !this.normalBuffer || !this.texCoordBuffer || !this.indexBuffer)
        {
            console.error(this.objFile + '：解码到buffer失败');
        }

        this.indexNum = indices.length;

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    createModelBuffer(bufferTarget, data, dataNum, dataType, usage)
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

