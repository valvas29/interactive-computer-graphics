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


    vec3 diffuse = color3 * diff * kD;
    vec3 specular = color3 * spec * kS;

    gl_FragColor = vec4(ambient + diffuse + specular, v_color.a);
}
