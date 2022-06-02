'use strict'
class Texture
{
    /**
     * 贴图文件 会自动绑定到Texture Unit
     * @constructor
     * @param {String} texFile 贴图文件路径
     * @param {GLenum} texType 贴图类型
     */
    constructor(texFile, texType = gl.TEXTURE_2D)
    {
        this.texFile = texFile;
        this.texType = texType;

        this.texIndex = null;
        this.texUnit = null;

        this.texture = null;
    }

    load(texIndex)
    {
        this.texIndex = texIndex;
        this.texUnit = gl.TEXTURE0 + texIndex;
        // 创建Texture
        let texture = gl.createTexture();
        if (!texture)
        {
            console.error(this.texFile + '：创建Texture失败');
        }

        // 创建Image
        let image = new Image();  

        image.onload = () =>
        {
            // Write the image data to texture object
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate

            gl.activeTexture(this.texUnit);
            gl.bindTexture(this.texType, texture);
            gl.texParameteri(this.texType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texImage2D(this.texType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            this.loadOver();
        };
        image.src = this.texFile;

        this.texture = texture;
    }

    loadOver() { }
}