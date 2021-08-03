precision mediump float;

uniform sampler2D sampler;
varying vec2 v_texCoord;

void main(void) {
  gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);
  // Read fragment color from texture
  // TODO
  gl_FragColor = texture2D(sampler, vec2(v_texCoord.s, v_texCoord.t));
  //https://developer.mozilla.org/de/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
}
