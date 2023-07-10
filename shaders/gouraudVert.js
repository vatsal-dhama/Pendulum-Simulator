export const GvertexShader = `      
varying vec2 vertexUV;
varying vec3 vertexNormal;
varying vec3 vertPos;
varying vec3 newNormal;
uniform vec3 lightdir;
varying vec4 color;
uniform vec4 Coefs;
void main()
{
    vertexUV = uv; //already have access to this in vert shader.
    vertexNormal = normal;
    vec4 vertPos4 = modelViewMatrix * vec4(position, 1.0);
    vertPos = vec3(vertPos4) / vertPos4.w;
    newNormal = vec3(normalMatrix * vertexNormal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    vec3 N = normalize(newNormal);
    vec3 lightSource = lightdir;
    lightSource = normalize(lightSource - vertPos);

    // Lambert's cosine law
    float lambertian = max(dot(N, lightSource), 0.0);
    float specular = 0.0;
    if(lambertian > 0.0) {
    vec3 R = reflect(-lightSource, N);      // Reflected light vector
    vec3 V = normalize(-vertPos);       // Vector to viewer

    //Specular term
    float shininessVal = 1.0;
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, Coefs.w);
    }
    
    
    vec3 ambient = vec3(0.5, 0.5, 0.5);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    color = vec4(Coefs.x * ambient +
               Coefs.y * lambertian * lightColor +
               Coefs.z * specular * lightColor, 1.0);
}               
`;