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
uniform mat4 u_Matrix_Light;
uniform vec4 u_LightPos;
uniform vec4 u_LightColor;
uniform vec4 u_CameraPos;

uniform sampler2D u_ShadowMap;

uniform vec3 u_AmbientColor;
uniform sampler2D u_Texture;
uniform sampler2D u_Normal;
uniform sampler2D u_Roughness;
uniform sampler2D u_AO;

varying vec2 v_TexCoord;
varying vec3 v_WorldNormal;
varying vec3 v_WorldTangent;
varying vec3 v_WorldBinormal;
varying vec3 v_viewDir;

varying vec4 v_PositionFromLight;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

// 获取阴影函数
float getShadow() {
    vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
    vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
    float depth = unpackDepth(rgbaDepth);
    float shadow = (shadowCoord.z > depth + 0.0001) ? 0.0 : 1.0;
    return shadow;
}

// Main函数在这里
void main() {
    vec2 uv = v_TexCoord.xy * vec2(2);

    vec3 albedo = texture2D(u_Texture, uv).xyz;

    // 法线
    vec3 worldNormal = normalize(v_WorldNormal);
    vec3 worldTangent = normalize(v_WorldTangent);
    vec3 WorldBinormal = normalize(v_WorldBinormal);
    vec3 tangentNormal = texture2D(u_Normal, uv).xyz * vec3(2) - vec3(1);
    tangentNormal.xy *= 0.9; 
    vec3 finalNormal = normalize(vec3(tangentNormal.x) * worldTangent + vec3(-tangentNormal.y) * WorldBinormal + vec3(tangentNormal.z) * worldNormal);

    // 漫反射
    vec3 lightDir = normalize(u_LightPos.xyz);
    float nDotL = max(0.0, dot(finalNormal, lightDir));
    vec3 diffuse = albedo * nDotL * u_LightColor.xyz;

    // 高光
    vec3 viewDir = normalize(v_viewDir);
    vec3 halfVec = normalize(lightDir + viewDir);
    float nDotH = max(0.0, dot(finalNormal, halfVec));
    float roughness = texture2D(u_Roughness, uv).x;

    vec3 specular = pow(nDotH, 128.0) * u_LightColor.xyz * (1.0 - roughness);

    // 环境光
    vec3 ambient = u_AmbientColor.xyz * albedo;

    float shadow = getShadow();

    float ao = texture2D(u_AO, uv).x;
    vec3 finalColor = (diffuse + specular) * shadow * ao + ambient;
    gl_FragColor = vec4(finalColor, 1);
}