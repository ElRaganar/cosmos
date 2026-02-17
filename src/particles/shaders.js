export const particleVertexShader = `
    uniform float uTime;
    uniform float uMix; // 0.0 = start position, 1.0 = target position
    uniform float uSize;
    
    attribute vec3 targetPosition;
    attribute float aSize;
    attribute vec3 aColor; // Target color
    
    varying vec3 vColor;
    
    // Simplex noise function (omitted for brevity, assume standard GLSL noise)
    // float noise(vec3 v) { ... }

    void main() {
        vColor = aColor;
        
        // Morph logic
        vec3 pos = mix(position, targetPosition, uMix);
        
        // Add organic wobble if uMix is low (Cell phase)
        // float wobble = sin(uTime * 2.0 + pos.x) * 0.5 * (1.0 - uMix);
        // pos += normal * wobble;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        
        // Size attenuation
        gl_PointSize = (uSize * aSize) * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

export const particleFragmentShader = `
    varying vec3 vColor;
    
    void main() {
        // Soft circular particle
        float r = distance(gl_PointCoord, vec2(0.5));
        if (r > 0.5) discard;
        
        // Soft edge glow
        float glow = 1.0 - (r * 2.0);
        glow = pow(glow, 1.5); 
        
        gl_FragColor = vec4(vColor, glow);
    }
`;