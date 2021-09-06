precision mediump float;

varying vec3 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;

varying vec3 v_lightPosition1;
varying vec3 v_lightPosition2;
varying vec3 v_lightPosition3;

//const vec3 lightPos = vec3(1.0, 1.0, 1.0);// TODO
uniform sampler2D sampler;
uniform float shininess;
uniform float kA;
uniform float kD;
uniform float kS;
//const vec3 camera = vec3(0.0, 0.0, 0.0);// TODO
varying vec3 v_cameraPosition;

void main(void) {
    // Read fragment color from texture
    // TODO
    gl_FragColor = texture2D(sampler, vec2(v_texCoord.s, v_texCoord.t));
    //https://developer.mozilla.org/de/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL

    vec4 textureColorVec4 = texture2D(sampler, vec2(v_texCoord.s, v_texCoord.t));
    vec3 textureColorVec3 = textureColorVec4.rgb;

    vec3 ambient = textureColorVec3 * kA;

    vec3 viewDirection = normalize(v_cameraPosition - v_position);

    float diff = 0.0;
    float spec = 0.0;

    vec3 lightDirection1 = normalize(v_lightPosition1 - v_position);
    vec3 reflectDirection1 = normalize(v_normal * (dot(v_normal, lightDirection1) * 2.0) - lightDirection1);

    diff += max(0.0, dot(v_normal, lightDirection1));
    if (max(0.0, dot(v_normal, lightDirection1)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection1, viewDirection)), shininess);
    }

    vec3 lightDirection2 = normalize(v_lightPosition2 - v_position);
    vec3 reflectDirection2 = normalize(v_normal * (dot(v_normal, lightDirection2) * 2.0) - lightDirection1);

    diff += max(0.0, dot(v_normal, lightDirection2));
    if (max(0.0, dot(v_normal, lightDirection2)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection2, viewDirection)), shininess);
    }

    vec3 lightDirection3 = normalize(v_lightPosition3 - v_position);
    vec3 reflectDirection3 = normalize(v_normal * (dot(v_normal, lightDirection3) * 2.0) - lightDirection1);

    diff += max(0.0, dot(v_normal, lightDirection3));
    if (max(0.0, dot(v_normal, lightDirection3)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection3, viewDirection)), shininess);
    }


    vec3 diffuse = textureColorVec3 * diff * kD;
    vec3 specular = textureColorVec3 * spec * kS;

    gl_FragColor = vec4(ambient + diffuse + specular, textureColorVec4.w);
}