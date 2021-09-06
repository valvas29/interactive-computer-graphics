precision mediump float;

attribute vec3 a_position;
// Pass the vertex position in view space
// to the fragment shader
varying vec3 v_position;

attribute vec3 a_normal;
varying vec3 v_normal;

// Pass color as attribute and forward it
// to the fragment shader
attribute vec4 a_color;
varying vec4 v_color;

uniform vec3 lightPosition1;
uniform vec3 lightPosition2;
uniform vec3 lightPosition3;
varying vec3 v_lightPosition1;
varying vec3 v_lightPosition2;
varying vec3 v_lightPosition3;

uniform vec3 cameraPosition;
varying vec3 v_cameraPosition;

uniform mat4 M; // From Object CS to World CS
uniform mat4 V; // From World CS to View (Camera) CS -> view matrix
uniform mat4 P; // From View CS to Normalized Device CS
uniform mat4 N; // normal matrix

void main() {
  gl_Position = P * V * M * vec4(a_position, 1.0);

  v_lightPosition1 = (V * vec4(lightPosition1, 1.0)).xyz;
  v_lightPosition2 = (V * vec4(lightPosition2, 1.0)).xyz;
  v_lightPosition3 = (V * vec4(lightPosition3, 1.0)).xyz;

  v_cameraPosition = (V * vec4(cameraPosition, 1.0)).xyz;

  // Pass the color and transformed vertex position through
  v_position = (V * M * vec4(a_position, 1.0)).xyz;
  v_color = a_color;
  
  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);
}
