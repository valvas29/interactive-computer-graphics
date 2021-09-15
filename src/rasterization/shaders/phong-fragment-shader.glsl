precision mediump float;

// Receive color and position values
// TODO
varying vec4 v_color;
varying vec3 v_position;
varying vec3 v_normal;

varying vec3 v_lightPosition1;
varying vec3 v_lightPosition2;
varying vec3 v_lightPosition3;

//const vec3 lightPos = vec3(2.0, 10.0, 10.0);// TODO
uniform float shininess;
uniform float kA;
uniform float kD;
uniform float kS;
//const vec3 camera = vec3(2.0, 0.0, 10.0); // wenn cam nicht im Render gepasst wird, mus sie hier definiert sein
varying vec3 v_cameraPosition;
/*
uniform vec3 lightPosition1;
uniform vec3 lightPosition2;
uniform vec3 lightPosition3;
*/

void main(void) {
    vec3 color3 = v_color.rgb;

    vec3 ambient = color3 * kA;

    vec3 viewDirection = normalize( - v_position);


    float diff = 0.0;
    float spec = 0.0;

    vec3 normalizedNormal = normalize(v_normal);

    vec3 lightDirection1 = normalize(v_lightPosition1 - v_position);
    vec3 reflectDirection1 = normalize(normalizedNormal * (dot(normalizedNormal, lightDirection1) * 2.0) - lightDirection1);
    // vec3 reflectDirection1 = reflect(-lightDirection1, normalizedNormal);

    diff += max(0.0, dot(normalizedNormal, lightDirection1));
    // https://stackoverflow.com/questions/20008089/specular-lighting-appears-on-both-eye-facing-and-rear-sides-of-object
    if (max(0.0, dot(normalizedNormal, lightDirection1)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection1, viewDirection)), shininess);
    }

    vec3 lightDirection2 = normalize(v_lightPosition2 - v_position);
    vec3 reflectDirection2 = normalize(normalizedNormal * (dot(normalizedNormal, lightDirection2) * 2.0) - lightDirection2);

    diff += max(0.0, dot(normalizedNormal, lightDirection2));
    if (max(0.0, dot(normalizedNormal, lightDirection2)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection2, viewDirection)), shininess);
    }

    vec3 lightDirection3 = normalize(v_lightPosition3 - v_position);
    vec3 reflectDirection3 = normalize(normalizedNormal * (dot(normalizedNormal, lightDirection3) * 2.0) - lightDirection3);

    diff += max(0.0, dot(normalizedNormal, lightDirection3));
    if (max(0.0, dot(normalizedNormal, lightDirection3)) > 0.0){
        spec += pow(max(0.0, dot(reflectDirection3, viewDirection)), shininess);
    }

    vec3 diffuse = color3 * diff * kD;
    vec3 specular = color3 * spec * kS;

    gl_FragColor = vec4(ambient + diffuse + specular, v_color.a);
}
