precision mediump float;

// Receive color and position values
// TODO
varying vec4 v_color;
varying vec3 v_position;

varying vec3 v_normal;

const vec3 lightPos = vec3(1.0, 1.0, 1.0);
const float shininess = 16.0;
const float kA = 0.3;
const float kD = 0.6;
const float kS = 0.7;
const vec3 camera = vec3(0.0, 0.0, 0.0);

void main(void) {
  //gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);

  // Phong lighting calculation
  // TODO
  /*
  vec3 viewDirection = normalize(camera - v_position);
  vec3 vectorToLight = normalize(lightPos - v_position);

  vec3 ambient = v_color * kA;

  vec3 diffuse = v_color * max(0.0, dot(v_normal, vectorToLight));

  vec3 reflectionVector = reflect(- vectorToLight, v_normal);

  vec3 specular = v_color * pow(max(0.0, dot(reflectionVector, viewDirection)), shininess);
  diffuse = diffuse * kD;
  specular = specular * kS;
  vec3 phongResult = ambient + diffuse + specular;
  gl_FragColor = vec4(phongResult, 1.0);
  */

  vec3 color3 = v_color.rgb;

  vec3 viewDirection = normalize(camera - v_position);
  vec3 lightDirection = normalize(lightPos - v_position);
  vec3 reflectDirection = normalize(v_normal * (dot(v_normal, lightDirection) * 2.0) - lightDirection);

  vec3 ambient = color3 * kA;
  vec3 diffuse = color3 * max(0.0, dot(v_normal, lightDirection)) * kD;
  vec3 specular = color3 * pow(max(0.0, dot(reflectDirection, viewDirection)), shininess) * kS;

  gl_FragColor = vec4(ambient + diffuse + specular, v_color.a);
}
