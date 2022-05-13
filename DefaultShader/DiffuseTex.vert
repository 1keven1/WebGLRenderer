attribute vec4 a_Position;
attribute vec2 a_TexCoord;
attribute vec3 a_Normal;

uniform mat4 u_Matrix_M_I;
uniform mat4 u_Matrix_MVP;
uniform vec4 u_LightPos;
uniform vec4 u_LightColor;
uniform mat4 u_Matrix_Light;

varying vec2 v_TexCoord;
varying vec3 v_WorldNormal;
varying vec4 v_PositionFromLight;

// Main函数在这里
void main() {
    gl_Position = u_Matrix_MVP * a_Position;
    vec3 worldNormal = (vec4(a_Normal.xyz, 0.0) * u_Matrix_M_I).xyz;

    v_TexCoord = a_TexCoord;
    v_WorldNormal = worldNormal;
    v_PositionFromLight = u_Matrix_Light * a_Position;
}