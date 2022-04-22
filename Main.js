'use strict';

let customJS;
let request = new XMLHttpRequest();
let renderer;

request.onreadystatechange = () =>
{
    if (request.readyState === 4 && request.status !== 404)
    {
        customJS = request.responseText;
        // console.log(customJS);

        renderer = new WebGLRenderer();
        renderer.customJS = customJS;

        renderer.start();
    }
}
request.open('GET', './CustomScript.js', true);
request.send();

