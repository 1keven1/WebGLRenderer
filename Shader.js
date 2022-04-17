'use strict';
class Shader
{
    /**
     * 
     * @param {String} vShaderFile 
     * @param {String} fShaderFile 
     */
    constructor(vShaderFile, fShaderFile)
    {
        this.vShaderFile = vShaderFile;
        this.fShaderFile = fShaderFile;
        this.vShaderSource = null;
        this.fShaderSource = null;
        this.program = null;
        this.bLoaded = false;

        
        this.a_Position = -1;
        this.a_TexCoord = -1;
        this.a_Normal = -1;
        this.u_Matrix_MVP = null;
        this.u_Matrix_M_I = null;
        this.u_LightPos = null;
        this.u_LightColor = null;
        this.u_Matrix_Light = null;
    }

    load()
    {
        this.bLoaded = true;
        this.readShaderFile()
    }

    loadOver() { }

    readShaderFile()
    {
        let vRequest = new XMLHttpRequest();
        let fRequest = new XMLHttpRequest();

        vRequest.onreadystatechange = () =>
        {
            if (vRequest.readyState === 4 && vRequest.status !== 404)
            {
                this.vShaderSource = vRequest.responseText;
                if (this.vShaderSource && this.fShaderSource) this.compileShader();
            }
        }
        fRequest.onreadystatechange = () =>
        {
            if (fRequest.readyState === 4 && fRequest.status !== 404)
            {
                this.fShaderSource = fRequest.responseText;
                if (this.vShaderSource && this.fShaderSource) this.compileShader();
            }
        }

        vRequest.open('GET', this.vShaderFile, true);
        vRequest.send();
        fRequest.open('GET', this.fShaderFile, true);
        fRequest.send();
    }

    compileShader()
    {
        this.program = createProgram(gl, this.vShaderSource, this.fShaderSource);
        if (!this.program)
        {
            console.error(this.vShaderFile + '：编译失败');
        }
        this.loadOver();
    }
}