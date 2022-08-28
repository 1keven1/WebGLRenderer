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
uniform samplerCube u_AmbientCubeMap;
uniform vec3 u_AmbientColor;

uniform sampler2D u_BRDFLut;

varying vec2 v_TexCoord;
varying vec3 v_WorldNormal;
varying vec3 v_WorldTangent;
varying vec3 v_WorldBinormal;
varying vec3 v_WorldPos;

varying vec4 v_PositionFromLight;

const float PI = 3.14159265359;

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
        vec2 offset = PCFFilter[i] * u_ShadowMap_TexelSize.zw * vec2(1.5);
        vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy + offset);
        float depth = unpackDepth(rgbaDepth);
        float shadow = (shadowCoord.z > depth + 0.0001) ? 0.0 : 1.0;
        sum += shadow;
    }

    return sum / 9.0;
}

// 法线分布函数 Trowbridge-Reitz GGX
float DistrubutionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float nDotH = max(dot(N, H), 0.0);

    float denom = (nDotH * nDotH * (a * a - 1.0) + 1.0);
    return (a * a) / (PI * denom * denom);
}

// 菲涅尔项 Fresnel-Schlick近似法
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// 考虑粗糙度的菲涅尔
vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}


// 几何函数 GGX与Schlick-Beckmann近似的结合体
float GeometrySchlickGGX(float nDotV, float roughness) {
    float k = ((roughness + 1.0) * (roughness + 1.0)) / 8.0;
    return nDotV / (nDotV * (1.0 - k) + k);
}

// 结合几何遮蔽和几何阴影 Smith’s method
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float nDotV = max(dot(N, V), 0.0);
    float nDotL = max(dot(N, L), 0.0);
    float ggx1 = GeometrySchlickGGX(nDotV, roughness);
    float ggx2 = GeometrySchlickGGX(nDotL, roughness);
    return ggx1 * ggx2;
}

vec3 albedo = vec3(1, 1, 1);
float metallic = 0.0;
float specular = 0.5;
float roughness = 0.05;
float ao = 0.99;
// Main函数在这里
void main() {
    vec3 worldNormal = normalize(v_WorldNormal);
    vec3 viewDir = normalize(u_CameraPos.xyz - v_WorldPos);
    vec3 lightDir = normalize(u_LightPos.xyz);
    vec3 halfVec = normalize(viewDir + lightDir);

    bool twoSizeSign = dot(viewDir, worldNormal) > 0.0;
    worldNormal *= twoSizeSign ? 1.0 : -1.0;

    float nDotL = max(dot(worldNormal, lightDir), 0.0);

    // 法线分布
    float NDF = DistrubutionGGX(worldNormal, halfVec, roughness);
    // 菲涅尔项
    vec3 F0 = mix(vec3(0.04), albedo, metallic);
    vec3 F = fresnelSchlick(max(dot(halfVec, viewDir), 0.0), F0);
    // 几何遮蔽
    float G = GeometrySmith(worldNormal, viewDir, lightDir, roughness);

    // Cook-Torrance BRDF
    vec3 nominator = NDF * F * G;
    float denomiator = 4.0 * max(dot(worldNormal, viewDir), 0.0) * max(dot(worldNormal, lightDir), 0.0) + 0.0001;
    vec3 spec = nominator / denomiator;

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;
    vec3 lO = (kD * albedo / PI + spec) * u_LightColor.xyz * nDotL;

    // ambient IBL
    // 折射
    kS = fresnelSchlickRoughness(max(dot(worldNormal, viewDir), 0.0), F0, roughness);
    kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;
    vec3 irradiance = textureCube(u_AmbientCubeMap, worldNormal, float(4)).rgb;
    vec3 diffuse = irradiance * albedo;
    
    //反射
    vec3 reflectDir = reflect(-viewDir, worldNormal);
    vec3 prefliteredColor = textureCube(u_AmbientCubeMap, reflectDir, roughness * float(5)).rgb;
    vec2 envBRDF = texture2D(u_BRDFLut, vec2(max(dot(worldNormal, viewDir), 0.0), roughness)).rg;
    vec3 indirectSpec = prefliteredColor * (kS * envBRDF.x + envBRDF.y);

    vec3 ambient = (kD * diffuse + indirectSpec * specular) * ao;

    float shadow = getShadow();

    vec3 finalColor = lO + ambient;

    // 色调映射
    finalColor = finalColor / (finalColor + vec3(1.0));
    // gamma矫正
    finalColor = pow(finalColor, vec3(1.0 / 2.2));

    gl_FragColor = vec4(finalColor, 1);
}