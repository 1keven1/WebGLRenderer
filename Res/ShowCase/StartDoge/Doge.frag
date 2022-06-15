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

uniform sampler2D u_ShadowMap;
uniform vec4 u_ShadowMap_TexelSize;

uniform vec3 u_AmbientColor;
uniform sampler2D u_TexBC;
uniform sampler2D u_TexN;

varying vec2 v_TexCoord;
varying vec3 v_WorldNormal;
varying vec3 v_WorldTangent;
varying vec3 v_WorldBinormal;
varying vec3 v_WorldPos;

varying vec4 v_PositionFromLight;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

// 获得阴影
float getShadow() {
    vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
    float sum;

    // PCF采样 percentage closer filtering的近似
    vec2 PCFFilter[9];
    PCFFilter[0] = vec2(0, 0);
    PCFFilter[1] = vec2(1, 0);
    PCFFilter[2] = vec2(-1, 0);
    PCFFilter[3] = vec2(0, -1);
    PCFFilter[4] = vec2(0, 1);
    PCFFilter[5] = vec2(0.707, 0.707);
    PCFFilter[6] = vec2(-0.707, 0.707);
    PCFFilter[7] = vec2(0.707, -0.707);
    PCFFilter[8] = vec2(-0.707, -0.707);

    for(int i = 0; i < 9; i++) {
        vec2 offset = PCFFilter[i] * u_ShadowMap_TexelSize.zw * vec2(1);
        vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy + offset);
        float depth = unpackDepth(rgbaDepth);
        float shadow = (shadowCoord.z > depth + 0.0001) ? 0.0 : 1.0;
        sum += shadow;
    }

    return sum / 9.0;
}

// Main函数在这里
void main() {
    vec2 uv = v_TexCoord;

    // 法线
    vec3 worldNormal = normalize(v_WorldNormal);
    vec3 worldTangent = normalize(v_WorldTangent);
    vec3 WorldBinormal = normalize(v_WorldBinormal);
    vec3 tangentNormal = texture2D(u_TexN, uv).xyz * vec3(2) - vec3(1);
    tangentNormal.xy *= 0.7;
    vec3 finalNormal = normalize(vec3(tangentNormal.x) * worldTangent + vec3(tangentNormal.y) * WorldBinormal + vec3(tangentNormal.z) * worldNormal);

    // 漫反射
    vec3 albedo = texture2D(u_TexBC, uv).xyz;
    vec3 lightDir = normalize(u_LightPos.xyz);
    float nDotL = max(0.0, dot(finalNormal, lightDir));
    vec3 diffuse = albedo * nDotL * u_LightColor.xyz;

    // 高光
    vec3 viewDir = normalize(u_CameraPos.xyz - v_WorldPos);
    vec3 halfVec = normalize(lightDir + viewDir);
    float nDotH = max(0.0, dot(finalNormal, halfVec));
    nDotH = pow(nDotH, 8.0);
    nDotH = smoothstep(0.8, 1.0, nDotH);
    vec3 specular = nDotH * u_LightColor.xyz * 0.1;

    vec3 ambient = u_AmbientColor.xyz * albedo;

    float shadow = getShadow();

    vec3 finalColor = (diffuse + specular) * shadow + ambient;
    gl_FragColor = vec4(finalColor, 1);
}