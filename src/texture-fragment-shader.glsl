precision mediump float;

varying vec3 v_position;
uniform sampler2D sampler;
varying vec2 v_texCoord;
varying vec3 v_normal;

const vec3 lightPos = vec3(1.0, 1.0, 1.0); // TODO
uniform float shininess;
uniform float kA;
uniform float kD;
uniform float kS;
const vec3 camera = vec3(0.0, 0.0, 0.0); // TODO

void main(void) {
  // Read fragment color from texture
  // TODO
  gl_FragColor = texture2D(sampler, vec2(v_texCoord.s, v_texCoord.t));
  //https://developer.mozilla.org/de/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL

  /*
  vec4 textureColorVec4 = texture2D(sampler, vec2(v_texCoord.s, v_texCoord.t));
  vec3 textureColorVec3 = textureColorVec4.rgb;

  vec3 viewDirection = normalize(camera - v_position);
  vec3 lightDirection = normalize(lightPos - v_position);
  vec3 reflectDirection = normalize(v_normal * (dot(v_normal, lightDirection) * 2.0) - lightDirection);

  vec3 ambient = textureColorVec3 * kA;
  vec3 diffuse = textureColorVec3 * max(0.0, dot(v_normal, lightDirection)) * kD;
  vec3 specular = textureColorVec3 * pow(max(0.0, dot(reflectDirection, viewDirection)), shininess) * kS;

  gl_FragColor = vec4(ambient + diffuse + specular, textureColorVec4.z);
  */
}
