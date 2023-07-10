export const PvertexShader = `      
varying vec2 vertexUV;
varying vec3 vertexNormal;
varying vec3 vertPos;
varying vec3 newNormal;
uniform vec3 viewSrc;
uniform vec3 lightdir;
varying vec3 ldir;
void main()
{
    vertexUV = uv; //already have access to this in vert shader.
    vertexNormal = normal;
    ldir = vec3(viewMatrix*vec4(lightdir,1.0));
    vec4 vertPos4 = modelViewMatrix * vec4(position, 1.0);
    vertPos = vec3(vertPos4) / vertPos4.w;
    // newNormal = vec3(normalMatrix * vertexNormal);
    newNormal = vec3(normalMatrix * vertexNormal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}                         
`