#version 100

#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

uniform mat4 u_Matrix_M;
uniform mat4 u_Matrix_M_I;
uniform mat4 u_Matrix_MVP;
uniform vec4 u_LightPos;
uniform vec4 u_LightColor;
uniform vec4 u_CameraPos;
uniform mat4 u_Matrix_Light;

uniform vec3 u_AmbientColor;
uniform samplerCube u_CubeMap;

varying vec2 v_TexCoord;
varying vec3 v_WorldNormal;
varying vec3 v_WorldTangent;
varying vec3 v_WorldBinormal;
varying vec3 v_WorldPos;

varying vec4 v_PositionFromLight;

// Main函数在这里
void main() {
    vec3 worldNormal = normalize(v_WorldNormal);
    vec3 viewDir = normalize(u_CameraPos.xyz - v_WorldPos);

    bool twoSizeSign = dot(viewDir, worldNormal) > 0.0;
    worldNormal *= twoSizeSign ? 1.0 : -1.0;

    float bias = float(1);
    vec3 albedo = textureCube(u_CubeMap, viewDir, bias).xyz;

    vec3 finalColor = albedo;
    gl_FragColor = vec4(finalColor, 1);
}