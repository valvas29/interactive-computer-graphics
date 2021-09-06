precision mediump float;

attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;
varying vec2 v_texCoord;

uniform vec3 lightPosition1;
uniform vec3 lightPosition2;
uniform vec3 lightPosition3;
varying vec3 v_lightPosition1;
varying vec3 v_lightPosition2;
varying vec3 v_lightPosition3;

uniform vec3 cameraPosition;
varying vec3 v_cameraPosition;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;
uniform mat4 N; // normal matrix

varying vec3 v_normal;
varying vec3 v_position;

void main() {
  gl_Position = P * V * M * vec4(a_position, 1.0);

  v_lightPosition1 = (V * vec4(lightPosition1, 1.0)).xyz;
  v_lightPosition2 = (V * vec4(lightPosition2, 1.0)).xyz;
  v_lightPosition3 = (V * vec4(lightPosition3, 1.0)).xyz;

  v_cameraPosition = (V * vec4(cameraPosition, 1.0)).xyz;

  v_texCoord = a_texCoord;
  v_position = (V * M * vec4(a_position, 1.0)).xyz;

  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);
}
