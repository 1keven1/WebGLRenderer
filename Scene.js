'use strict';
class Scene
{
    /**
     * 
     * @param {Model[]} modelList 
     * @param {Material[]} materialList 
     * @param {Texture[]} textureList 
     * @param {Mesh[]} meshList 
     * @param {Light[]} lightList 
     * @param {Camera} camera 
     */
    constructor(modelList, materialList, textureList, meshList, lightList, camera)
    {
        this.modelList = modelList;
        this.materialList = materialList;
        this.textureList = textureList;
        this.meshList = meshList;
        this.lightList = lightList;
        this.camera = camera;

        this.modelLoadedNum = 0;
        this.materialLoadedNum = 0;
        this.textureLodedNum = 0;
        this.lightLoadedNum = 0;
    }

    load()
    {
        console.log('loading scene');
        // 加载Model
        this.modelList.forEach((model, index, arr) =>
        {
            model.loadOver = this.modelLoadOver.bind(this);
            model.load()
        })
        // 加载Material
        this.materialList.forEach((material, index, arr) =>
        {
            material.loadOver = this.materialLoadOver.bind(this);
            material.load();
        })
        // 加载贴图
        this.textureList.forEach((texture, index, arr) =>
        {
            texture.loadOver = this.textureLoadOver.bind(this);
            texture.load(index);
        })

        // 初始化灯光ShadowMap
        this.lightList.forEach((light, index, arr) =>
        {
            light.initShadowMap(index, this.textureList.length);
            this.lightLoadOver();
        })
    }

    loadOver() { }

    modelLoadOver()
    {
        console.log('model load over');
        this.modelLoadedNum++;
        this.checkIfLoadOver();
    }

    materialLoadOver()
    {
        console.log('material load over');
        this.materialLoadedNum++;
        this.checkIfLoadOver();
    }

    textureLoadOver()
    {
        console.log('texture load over');
        this.textureLodedNum++;
        this.checkIfLoadOver();
    }

    lightLoadOver()
    {
        this.lightLoadedNum++;
        this.checkIfLoadOver();
    }

    checkIfLoadOver()
    {
        if (this.modelLoadedNum === this.modelList.length &&
            this.materialLoadedNum === this.materialList.length &&
            this.textureLodedNum === this.textureList.length &&
            this.lightLoadedNum === this.lightList.length)
        {
            for (let i = 0; i < this.meshList.length; i++)
            {
                if (!this.meshList[i].model.bLoaded || !this.meshList[i].material.bLoaded)
                {
                    if (!this.meshList[i].model.bLoaded) console.warn(this.meshList[i].model.objFile + '：没有加载完整');
                    if (!this.meshList[i].material.bLoaded) console.warn(this.meshList[i].material.baseShader.vShaderFile + '：没有加载');
                    this.meshList.splice(i, 1);
                    i--;
                }
            }
            this.loadOver();
        }
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

    render(clearColor)
    {
        // 绘制灯光ShadowMap
        this.lightList.forEach((light, lightIndex, arr) =>
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, light.shadowMap);
            gl.viewport(0, 0, light.shadowMapRes, light.shadowMapRes);
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            this.meshList.forEach((mesh, meshIndex, arr) =>
            {
                this.drawShadowMap(mesh, light);
            })
        })

        // 绘制到屏幕
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.drawingBufferHeight = 500;
        // gl.drawingBufferWidth = 500;
        gl.viewport(0, 0, width, height);
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.lightList.forEach((light, lightIndex, arr) =>
        {
            this.meshList.forEach((mesh, meshIndex, arr) =>
            {
                this.drawMesh(mesh, light, lightIndex);
            })
        })
    }

    /**
     * 
    * @param {Mesh} mesh 
    * @param {Light} light 
    */
    drawShadowMap(mesh, light)
    {
        gl.useProgram(mesh.material.getShadowCasterProgram());

        if (mesh.material.bDepthTest) gl.enable(gl.DEPTH_TEST);
        else gl.disable(gl.DIPTH_TEST);

        // 绑定Vertex Buffer
        if (mesh.material.shadowCaster.a_Position >= 0) this.bindAttributeToBuffer(mesh.material.shadowCaster.a_Position, mesh.model.vertexBuffer);
        if (mesh.material.shadowCaster.a_TexCoord >= 0) this.bindAttributeToBuffer(mesh.material.shadowCaster.a_TexCoord, mesh.model.texCoordBuffer);
        if (mesh.material.shadowCaster.a_Normal >= 0) this.bindAttributeToBuffer(mesh.material.shadowCaster.a_Normal, mesh.model.normalBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.model.indexBuffer);

        let mvpMatrix = new Matrix4().set(light.vpMatrix).multiply(mesh.mMatrix);
        gl.uniformMatrix4fv(mesh.material.shadowCaster.u_Matrix_MVP, false, mvpMatrix.elements);
        gl.uniformMatrix4fv(mesh.material.shadowCaster.u_Matrix_M_I, false, mesh.mIMatrix.elements);

        // 绘制
        gl.drawElements(gl.TRIANGLES, mesh.model.indexNum, mesh.model.indexBuffer.dataType, 0);
    }

    /**
     * 
     * @param {Mesh} mesh 
     * @param {Light} light 
     */
    drawMesh(mesh, light)
    {
        // Base Shader进行渲染
        if (light.lightIndex === 0)
        {
            gl.useProgram(mesh.material.getBaseProgram());

            if (mesh.material.bDepthTest) gl.enable(gl.DEPTH_TEST);
            else gl.disable(gl.DIPTH_TEST);

            // 绑定Vertex Buffer
            if (mesh.material.baseShader.a_Position >= 0) this.bindAttributeToBuffer(mesh.material.baseShader.a_Position, mesh.model.vertexBuffer);
            if (mesh.material.baseShader.a_TexCoord >= 0) this.bindAttributeToBuffer(mesh.material.baseShader.a_TexCoord, mesh.model.texCoordBuffer);
            if (mesh.material.baseShader.a_Normal >= 0) this.bindAttributeToBuffer(mesh.material.baseShader.a_Normal, mesh.model.normalBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.model.indexBuffer);

            // 传入默认变量
            if (mesh.material.baseShader.u_LightPos) gl.uniform4f(mesh.material.baseShader.u_LightPos, light.getLightPos().x(), light.getLightPos().y(), light.getLightPos().z(), light.w);
            if (mesh.material.baseShader.u_LightColor) gl.uniform4f(mesh.material.baseShader.u_LightColor, light.lightColor.x(), light.lightColor.y(), light.lightColor.z(), 1);

            let mvpMatrix = new Matrix4().set(this.camera.vpMatrix).multiply(mesh.mMatrix);
            gl.uniformMatrix4fv(mesh.material.baseShader.u_Matrix_MVP, false, mvpMatrix.elements);
            gl.uniformMatrix4fv(mesh.material.baseShader.u_Matrix_M_I, false, mesh.mIMatrix.elements);

            // 阴影相关变量
            let mvpMatrixLight = new Matrix4().set(light.vpMatrix).multiply(mesh.mMatrix);
            if (mesh.material.baseShader.u_Matrix_Light) gl.uniformMatrix4fv(mesh.material.baseShader.u_Matrix_Light, false, mvpMatrixLight.elements);
            if (mesh.material.baseShader.u_ShadowMap) gl.uniform1i(mesh.material.baseShader.u_ShadowMap, light.shadowMapTexUnit - gl.TEXTURE0);

            // 绘制
            gl.drawElements(gl.TRIANGLES, mesh.model.indexNum, mesh.model.indexBuffer.dataType, 0);
        }
        else { }
    }

    bindAttributeToBuffer(a_attribute, buffer)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, buffer.dataNum, buffer.dataType, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }

    clear()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.modelList = [];
        this.materialList = [];
        this.textureList = [];
        this.meshList = [];
        this.lightList = [];
        this.camera = [];

        this.modelLoadedNum = 0;
        this.materialLoadedNum = 0;
        this.textureLodedNum = 0;
        this.lightLoadedNum = 0;
    }
}