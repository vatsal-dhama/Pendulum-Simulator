export const GfragmentShader = `      		
uniform sampler2D checkerTexture;
varying vec2 vertexUV;
varying vec4 color;
void main() {
    vec3 modelColor = texture2D(checkerTexture,vertexUV).xyz;
    modelColor = modelColor * color.xyz;
    gl_FragColor = vec4(modelColor,1.0f);
}                         
`;