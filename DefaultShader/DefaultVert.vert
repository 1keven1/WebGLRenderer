attribute vec4 a_Position;
attribute vec2 a_TexCoord;
attribute vec3 a_Normal;
attribute vec3 a_Tangent;

uniform mat4 u_Matrix_M;
uniform mat4 u_Matrix_M_I;
uniform mat4 u_Matrix_MVP;
uniform vec4 u_LightPos;
uniform vec4 u_LightColor;
uniform vec4 u_CameraPos;
uniform mat4 u_Matrix_Light;

varying vec2 v_TexCoord;
varying vec3 v_WorldNormal;
varying vec3 v_WorldTangent;
varying vec3 v_WorldBinormal;
varying vec3 v_WorldPos;

varying vec4 v_PositionFromLight;

// Main函数在这里
void main() {
    gl_Position = u_Matrix_MVP * a_Position;
    vec3 worldPosition = (u_Matrix_M * a_Position).xyz;
    vec3 worldNormal = (vec4(a_Normal.xyz, 0.) * u_Matrix_M_I).xyz;
    vec3 worldTangent = (u_Matrix_M * vec4(a_Tangent, 0)).xyz;
    vec3 worldBinormal = normalize(cross(worldNormal, worldTangent));

    v_TexCoord = a_TexCoord;
    v_WorldNormal = worldNormal;
    v_WorldTangent = worldTangent;
    v_WorldBinormal = worldBinormal;
    v_WorldPos = worldPosition;

    v_PositionFromLight = u_Matrix_Light * a_Position;
}