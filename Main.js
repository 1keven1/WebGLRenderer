'use strict';
let camera = new Camera(new Transform(new Vector3([0.0, 2.0, 6.0]), new Vector3([-20, 0, 0])), 60, 0.1, 100);
let light = new Light(new Transform(new Vector3([10.0, 10.0, 10.0]), new Vector3([0, 0, 0])), new Vector3([1.0, 1.0, 1.0]), 10);

let diffuseShader = new Shader('./Resource/DefaultShader/Diffuse.vert', './Resource/DefaultShader/Diffuse.frag');
let diffuseMaterial = new Material(diffuseShader, MATERIAL_TYPE.OPAQUE, 0);
let texShader = new Shader('./Resource/DefaultShader/DiffuseTex.vert', './Resource/DefaultShader/DiffuseTex.frag');
let texMaterial = new Material(texShader);

let cube = new Model('./Resource/Cube.obj');
let plane = new Model('./Resource/Plane.obj');
let sphere = new Model('./Resource/Sphere.obj')

let meshCube = new Mesh(new Transform(), cube, texMaterial);
let floor = new Mesh(new Transform(new Vector3([0, -1, 0])), plane, diffuseMaterial);

let texture = new Texture('./Resource/test.jpg', gl.TEXTURE0, gl.TEXTURE_2D);

let scene = new Scene(
    [meshCube, floor],
    [light],
    camera,
    [texture]
);

let renderer = new WebGLRenderer(scene);


renderer.customBeginPlay = () =>
{
    diffuseMaterial.setUniformVector3f('u_AmbientColor', 0.2, 0.2, 0.2);
    texMaterial.setUniformVector3f('u_AmbientColor', 0.2, 0.2, 0.2);
    texMaterial.setTexture('u_Tex', 0);

    document.onmousedown = () =>
    {
        meshCube.material = diffuseMaterial;
        floor.material = texMaterial;
    }
    document.onmouseup = () =>
    {
        meshCube.material = texMaterial;
        floor.material = diffuseMaterial;
    }
}

renderer.customTick = (deltaSecond) =>
{
    meshCube.addRotationOffset(new Vector3([0, 1.5, 0]).multiplyf(deltaSecond));
}


renderer.start();