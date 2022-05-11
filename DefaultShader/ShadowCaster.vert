attribute vec4 a_Position;
attribute vec4 a_TexCoord;
attribute vec4 a_Normal;

uniform mat4 u_Matrix_M_I;
uniform mat4 u_Matrix_MVP;
uniform vec4 u_LightPos;
uniform vec4 u_LightColor;

// Main函数在这里
void main()
{
    gl_Position = u_Matrix_MVP * a_Position;
}