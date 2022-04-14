'use strict';
class Scene
{
    /**
     * 
     * @param {Mesh[]} meshList 
     * @param {Light[]} lightList 
     * @param {Camera} camera 
     * @param {Texture[]} textureList 
     */
    constructor(meshList, lightList, camera, textureList)
    {
        this.meshList = meshList;
        this.lightList = lightList;
        this.camera = camera;
        this.textureList = textureList;

        this.meshLoadedNum = 0;
        this.textureLodedNum = 0;
    }

    load()
    {
        console.log('loading scene');
        // 加载MeshList
        this.meshList.forEach((mesh, index, arr) =>
        {
            console.log('loading mesh');
            mesh.loadOver = this.meshLoadOver.bind(this);
            mesh.loadMesh();
        });

        // 加载贴图
        this.textureList.forEach((texture, index, arr) =>
        {
            console.log(texture);
            texture.loadOver = this.textureLoadOver.bind(this);
            texture.load();
        })
    }

    loadOver() { }

    meshLoadOver()
    {
        console.log('mesh load over');
        this.meshLoadedNum++;
        if (this.meshLoadedNum === this.meshList.length && this.textureLodedNum === this.textureList.length)
            this.loadOver();
    }

    textureLoadOver()
    {
        console.log('texture load over');
        this.textureLodedNum++;
        if (this.meshLoadedNum === this.meshList.length && this.textureLodedNum === this.textureList.length)
            this.loadOver();
    }

    calculateMatrices()
    {
        // 计算Mesh的M矩阵
        this.meshList.forEach((mesh, index, arr) =>
        {
            mesh.bulidMMatrix();
        })
        // 计算灯光VP矩阵
        this.lightList.forEach((light, index, arr) =>
        {
            light.bulidVPMatrix();
        })
        // 计算相机VP矩阵
        this.camera.bulidVPMatrix();
    }

    render()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.lightList.forEach((light, lightIndex, arr) =>
        {
            this.meshList.forEach((mesh, meshIndex, arr) =>
            {
                this.drawMesh(mesh, light);
            })
        })
    }

    /**
     * 
     * @param {Mesh} mesh 
     * @param {Light} light 
     */
    drawMesh(mesh, light)
    {
        gl.useProgram(mesh.material.getProgram());

        if (mesh.material.bDepthTest) gl.enable(gl.DEPTH_TEST);
        else gl.disable(gl.DIPTH_TEST);

        // 绑定Vertex Buffer
        if (mesh.material.a_Position >= 0) this.bindAttributeToBuffer(mesh.material.a_Position, mesh.model.vertexBuffer);
        if (mesh.material.a_TexCoord >= 0) this.bindAttributeToBuffer(mesh.material.a_TexCoord, mesh.model.texCoordBuffer);
        if (mesh.material.a_Normal >= 0) this.bindAttributeToBuffer(mesh.material.a_Normal, mesh.model.normalBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.model.indexBuffer);

        // 传入默认变量
        if (mesh.material.u_LightPos) gl.uniform4f(mesh.material.u_LightPos, light.getLocation().x(), light.getLocation().y(), light.getLocation().z(), light.w);
        if (mesh.material.u_LightColor) gl.uniform4f(mesh.material.u_LightColor, light.lightColor.x(), light.lightColor.y(), light.lightColor.z(), 1);

        let mvpMatrix = new Matrix4().set(camera.vpMatrix).multiply(mesh.mMatrix);
        gl.uniformMatrix4fv(mesh.material.u_Matrix_MVP, false, mvpMatrix.elements);
        gl.uniformMatrix4fv(mesh.material.u_Matrix_M_I, false, mesh.mIMatrix.elements);

        let mvpMatrixLight = new Matrix4().set(light.vpMatrix).multiply(mesh.mMatrix);
        if (mesh.material.u_Matrix_Light) gl.uniformMatrix4fv(mesh.material.u_Matrix_Light, false, mvpMatrixLight.elements);

        // 绘制
        gl.drawElements(gl.TRIANGLES, mesh.model.indexNum, mesh.model.indexBuffer.dataType, 0);
    }

    bindAttributeToBuffer(a_attribute, buffer)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, buffer.dataNum, buffer.dataType, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }

}