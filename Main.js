'use strict';

let customJS;
let request = new XMLHttpRequest();

request.onreadystatechange = () =>
{
    if (request.readyState === 4 && request.status !== 404)
    {
        customJS = request.responseText;
        console.log(customJS);

        let renderer = new WebGLRenderer();
        renderer.customJS = customJS;

        eval(customJS);

        renderer.start();
    }
}
request.open('GET', './CustomScript.js', true);
request.send();

