'use strict';
let camera = new Camera(new Transform(new Vector3([0.0, 2.0, 6.0]), new Vector3([-20, 0, 0])), 60, 0.1, 100);
let light = new Light(new Transform(new Vector3([10.0, 10.0, 10.0]), new Vector3([0, 0, 0])), new Vector3([1.0, 1.0, 1.0]), 10);
let shader = new Shader('7_ReadOBJ.vert', '7_ReadOBJ.frag');
let material = new Material(shader, MATERIAL_TYPE.OPAQUE, 0);
let model = new Model('../resource/Cube.obj');

let mesh = new Mesh(new Transform(), model, material);

let scene = new Scene(
    [mesh],
    [light],
    camera,
    []
);


let renderer = new WebGLRenderer(scene);


renderer.customBeginPlay = () =>
{
    gl.useProgram(material.getProgram());
    let u_AmbientColor = gl.getUniformLocation(shader.program, 'u_AmbientColor');
    gl.uniform3f(u_AmbientColor, 0.2, 0.2, 0.2);
    gl.useProgram(null);
}
renderer.customTick = () =>
{
    mesh.transform.rotation = new Vector3([mesh.transform.rotation.x(), mesh.transform.rotation.y() + 0.5, mesh.transform.rotation.z()])
}


renderer.start();