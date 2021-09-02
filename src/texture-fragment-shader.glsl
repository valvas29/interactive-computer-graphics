precision mediump float;

varying vec3 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;

const vec3 lightPos = vec3(1.0, 1.0, 1.0); // TODO
uniform sampler2D sampler;
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


  vec4 textureColorVec4 = texture2D(sampler, vec2(v_texCoord.s, v_texCoord.t));
  vec3 textureColorVec3 = textureColorVec4.rgb;

  vec3 viewDirection = normalize(camera - v_position);
  vec3 lightDirection = normalize(lightPos - v_position);
  vec3 reflectDirection = normalize(v_normal * (dot(v_normal, lightDirection) * 2.0) - lightDirection);

  vec3 ambient = textureColorVec3 * kA;
  vec3 diffuse = textureColorVec3 * max(0.0, dot(v_normal, lightDirection)) * kD;
  vec3 specular = textureColorVec3 * pow(max(0.0, dot(reflectDirection, viewDirection)), shininess) * kS;

  gl_FragColor = vec4(ambient + diffuse + specular, textureColorVec4.w);
}
/*
export default "precision mediump float;
// Receive color and position values
varying vec3 v_position;
varying vec3 v_normal;
varying vec3 v_view;
varying vec2 v_texCoord;
uniform sampler2D sampler;
uniform sampler2D otherTexture;
uniform vec3 lightPos0;
uniform vec3 lightPos1;
uniform vec3 lightPos2;
// phong constants

uniform float kA;
uniform float kD;
uniform float kS;
uniform float kE;
// Phong lighting calculation
void main(void) { } vec3 i_color = (texture2D(sampler, v_texCoord)).xyz; //(texture2D(sampler, v_texCoord)).xyz;
vec3 i_color =  texture2D(sampler, v_texCoord).xyz; //(texture2D(sampler, v_texCoord)).xyz; //(texture2D(sampler, v_texCoord) +
// ambient
vec3 ambient = i_color * kA;
// LIGHT POS 0
// diffuse
vec3 s = normalize(lightPos0 - v_position); //vector from point of intersection to lightsource
vec3 normal = normalize(v_normal);
vec3 diffuse = i_color * ( max( 0.0, dot( normal, s ) ));
// specular
vec3 r = normalize( normal * ( 2.0 * dot( normal, s ) ) - s); // r = 2(n*l)n - l   (l = s)
vec3 specular = i_color * pow( max( 0.0, dot(r, s)), kE );
// LIGHT POS 1
// diffuse
s = normalize(lightPos1 - v_position); //vector from point of intersection to lightsource
normal = normalize(v_normal);
diffuse = diffuse + (i_color * ( max( 0.0, dot( normal, s ) )));
// specular
r = normalize( normal * ( 2.0 * dot( normal, s ) ) - s); // r = 2(n*l)n - l   (l = s)
specular = specular + (i_color * pow( max( 0.0, dot(r, s)), kE ));
// LIGHT POS 2
// diffuse
s = normalize(lightPos2 - v_position); //vector from point of intersection to lightsource
normal = normalize(v_normal);
diffuse = diffuse + (i_color * ( max( 0.0, dot( normal, s ) )));
// specular
r = normalize( normal * ( 2.0 * dot( normal, s ) ) - s); // r = 2(n*l)n - l   (l = s)
specular = specular + (i_color * pow( max( 0.0, dot(r, s)), kE ));
// get phong constant value from texture
diffuse = diffuse * kD;
specular = specular * kS;
diffuse = 0.5 * texture2D(otherTexture, v_texCoord).xyz;
// (texture2D(sampler, v_texCoord)) = vec4(ambient + diffuse + specular, 1.0);
gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
// gl_FragColor = vec4(kA, kD, kS, 1.0);
// gl_FragColor = texture2D(sampler, v_texCoord);
// gl_FragColor = texture2D(sampler, v_texCoord); // * texture2D(otherTexture, v_texCoord);
// shininess = texture2D(otherTexture, v_texCoord);
// gl_FragColor = vec4(ambient, 1.0);
// gl_FragColor = texture2D(sampler, v_texCoord) + texture2D(otherTexture, v_texCoord);\n}\n";
*/
