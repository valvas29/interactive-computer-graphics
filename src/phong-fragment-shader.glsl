precision mediump float;

// Receive color and position values
// TODO
varying vec4 v_color;
varying vec3 v_position;

varying vec3 v_normal;

const vec3 lightPos = vec3(2.0, 10.0, 10.0); // TODO
uniform float shininess;
uniform float kA;
uniform float kD;
uniform float kS;
const vec3 camera = vec3(2.0, 0.0, 10.0); // TODO

void main(void) {
  vec3 color3 = v_color.rgb;

  vec3 viewDirection = normalize(camera - v_position);
  vec3 lightDirection = normalize(lightPos - v_position);
  vec3 reflectDirection = normalize(v_normal * (dot(v_normal, lightDirection) * 2.0) - lightDirection);

  vec3 ambient = color3 * kA;
  vec3 diffuse = color3 * max(0.0, dot(v_normal, lightDirection)) * kD;
  vec3 specular = color3 * pow(max(0.0, dot(reflectDirection, viewDirection)), shininess) * kS;

  gl_FragColor = vec4(ambient + diffuse + specular, v_color.a);
}
