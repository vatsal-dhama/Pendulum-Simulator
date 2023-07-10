export const BPfragmentShader = `      		
uniform sampler2D checkerTexture;
varying vec3 vertexNormal;
varying vec3 vertPos; 
varying vec3 newNormal;
uniform vec3 lightdir;
uniform vec3 lightdir2;
uniform vec4 Coefs;

varying vec2 vertexUV; //u v of 3d to 2d map essentially. overlay unwrapped 3d on 2d and then just see u,v of pixel
void main() {
    //params
    vec3 lighting = vec3(0.0, 0.0, 0.0);
    vec3 ambient = vec3(0.5, 0.5, 0.5);
    vec3 normal = normalize(newNormal.xyz);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    // for light source 1:

    vec3 lightSource = lightdir;
    lightSource = normalize(lightSource - vertPos);
    //diffuse compute high dot more reflect.
    float diffuseStr = max(0.0, dot(lightSource, normal));
    vec3 diffuse = diffuseStr * lightColor;

    //specular reflection strength based on view direction. looking at reflection source directly? more specular.
    
    vec3 cameraSource = vec3(0.0, 0.0, 1.0);
    vec3 viewSource = normalize(cameraSource);
    vec3 halfwaySource = normalize(lightSource+viewSource);
    float specularStr = max(0.0, dot(normal,halfwaySource));
    specularStr = pow(specularStr,Coefs.w);
    vec3 specular = specularStr * lightColor;

    //compute the lighting
    lighting = ambient;
    lighting = ambient * 0.5 + diffuse;
    lighting = ambient * Coefs.x + diffuse*Coefs.y + specular * Coefs.z;

    //model texture and lighting multiplication
    vec3 modelColor1 = texture2D(checkerTexture,vertexUV).xyz;
    vec3 color1 = modelColor1 * lighting;



    // for light source 2:
    
    lightSource = lightdir2;
    lightSource = normalize(lightSource - vertPos);
    //diffuse compute high dot more reflect.
    diffuseStr = max(0.0, dot(lightSource, normal));
    diffuse = diffuseStr * lightColor;

    //specular reflection strength based on view direction. looking at reflection source directly? more specular.
    
    cameraSource = vec3(0.0, 0.0, 1.0);
    viewSource = normalize(cameraSource);
    halfwaySource = normalize(lightSource+viewSource);
    specularStr = max(0.0, dot(normal,halfwaySource));
    specularStr = pow(specularStr,Coefs.w);
    specular = specularStr * lightColor;

    //compute the lighting
    lighting = ambient;
    lighting = ambient * 0.5 + diffuse;
    lighting = ambient * Coefs.x + diffuse*Coefs.y + specular * Coefs.z;

    //model texture and lighting multiplication
    vec3 modelColor2 = texture2D(checkerTexture,vertexUV).xyz;
    vec3 color2 = modelColor2 * lighting;

    gl_FragColor = vec4(color1+color2,1.0f);
} 
                          
`;