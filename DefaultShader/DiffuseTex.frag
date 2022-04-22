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
uniform sampler2D u_Texture;

varying vec4 v_TexCoord;
varying vec3 v_WorldNormal;
varying vec4 v_PositionFromLight;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

float getShadow() {
    // 阴影
    vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
    vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
    float depth = unpackDepth(rgbaDepth);
    float shadow = (shadowCoord.z > depth + 0.0001) ? 0.0 : 1.0;
    return shadow;
}

void main() {
    vec3 albedo = texture2D(u_Texture, v_TexCoord.xy).xyz;

    vec3 worldNormal = normalize(v_WorldNormal);
    vec3 lightDir = normalize(u_LightPos.xyz);
    float nDotL = max(0.0, dot(worldNormal, lightDir));
    vec3 diffuse = albedo * nDotL * u_LightColor.xyz;
    vec3 ambient = u_AmbientColor.xyz * albedo;

    float shadow = getShadow();

    vec3 finalColor = diffuse * shadow + ambient;
    gl_FragColor = vec4(finalColor, 1);
}