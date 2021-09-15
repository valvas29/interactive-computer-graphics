attribute vec3 a_position;
// TODO
attribute vec4 a_color;
attribute vec3 a_normal;
varying vec4 v_color;
varying vec3 v_position;
varying vec3 v_normal;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;
uniform mat4 N;

void main() {
  gl_Position = P*V * M*vec4(a_position, 1.0);
  // TODO
  v_position = gl_Position.xyz;
  v_color = a_color;
  v_normal = normalize((V * N * vec4(a_normal, 0)).xyz);
}
