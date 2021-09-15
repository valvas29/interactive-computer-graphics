attribute vec3 a_position;

// TODO
attribute vec4 a_color;
attribute vec3 a_normal;
varying vec4 v_color;

uniform mat4 M;

void main() {
  gl_Position = M*vec4(a_position, 1.0);

  // TODO
  v_color = a_color;
  a_normal;
}
