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
    }

    load()
    {
        
    }
}