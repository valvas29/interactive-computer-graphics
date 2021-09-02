precision mediump float;

attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;
varying vec2 v_texCoord;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;
uniform mat4 N; // normal matrix

varying vec3 v_normal;
varying vec3 v_position;

void main() {
  gl_Position = P * V * M * vec4(a_position, 1.0);
  v_texCoord = a_texCoord;
  v_position = (V * M * vec4(a_position, 1.0)).xyz;

  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);
}
