precision mediump float;

varying vec3 v_position;
varying vec2 v_texCoord;
//varying vec2 v_normalTexCoord;
varying vec3 v_normal;
varying mat3 v_TBN;

varying vec3 v_lightPosition1;
varying vec3 v_lightPosition2;
varying vec3 v_lightPosition3;

uniform sampler2D sampler;
// https://learnopengl.com/Advanced-Lighting/Normal-Mapping
uniform sampler2D normalSampler;
uniform float shininess;
uniform float kA;
uniform float kD;
uniform float kS;
varying vec3 v_cameraPosition;

void main(void) {
    // vec3 normal = normalize(v_normal);

    //https://developer.mozilla.org/de/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
    vec3 normal = texture2D(normalSampler, v_texCoord).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    normal = normalize(v_TBN * normal);


    vec4 textureColorVec4 = texture2D(sampler, v_texCoord);
    vec3 textureColorVec3 = textureColorVec4.rgb;

    vec3 ambient = textureColorVec3 * kA;

    vec3 viewDirection = normalize(v_cameraPosition - v_position);

    float diff = 0.0;
    float spec = 0.0;

    vec3 lightDirection1 = normalize(v_lightPosition1 - v_position);
    vec3 reflectDirection1 = normalize(normal * (dot(normal, lightDirection1) * 2.0) - lightDirection1);

    diff += max(0.0, dot(normal, lightDirection1));
    if (max(0.0, dot(normal, lightDirection1)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection1, viewDirection)), shininess);
    }

    vec3 lightDirection2 = normalize(v_lightPosition2 - v_position);
    vec3 reflectDirection2 = normalize(normal * (dot(normal, lightDirection2) * 2.0) - lightDirection1);

    diff += max(0.0, dot(normal, lightDirection2));
    if (max(0.0, dot(normal, lightDirection2)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection2, viewDirection)), shininess);
    }

    vec3 lightDirection3 = normalize(v_lightPosition3 - v_position);
    vec3 reflectDirection3 = normalize(normal * (dot(normal, lightDirection3) * 2.0) - lightDirection1);

    diff += max(0.0, dot(normal, lightDirection3));
    if (max(0.0, dot(normal, lightDirection3)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection3, viewDirection)), shininess);
    }


    vec3 diffuse = textureColorVec3 * diff * kD;
    vec3 specular = textureColorVec3 * spec * kS;

    gl_FragColor = vec4(ambient + diffuse + specular, textureColorVec4.w);
}