#version 100

#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

uniform mat4 u_Matrix_M_I;
uniform mat4 u_Matrix_MVP;
uniform vec4 u_LightPos;
uniform vec4 u_LightColor;
uniform sampler2D u_ShadowMap;

uniform vec3 u_AmbientColor;

varying vec4 v_TexCoord;
varying vec3 v_WorldNormal;
varying vec4 v_PositionFromLight;

void main()
{
    vec3 albedo = vec3(0.5, 0.5, 0.5);
    vec3 worldNormal = normalize(v_WorldNormal);
    vec3 lightDir = normalize(u_LightPos.xyz);
    float nDotL = max(0.0, dot(worldNormal, lightDir));
    vec3 diffuse = albedo * nDotL * u_LightColor.xyz;
    vec3 ambient = u_AmbientColor * albedo;

    vec3 finalColor = diffuse + ambient;
    gl_FragColor = vec4(finalColor, 1.0);
}