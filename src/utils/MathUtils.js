// src/utils/MathUtils.js

/**
 * Generates a Double Helix (B-DNA approximation).
 * @param {number} index - The particle index (0 to count)
 * @param {number} total - Total particles
 * @returns {Object} {x, y, z} coordinates
 */
export function getDNAPoint(index, total) {
    // We want the DNA to span a visible length in the scene
    const length = 60; // Total length in 3D units
    const radius = 4;  // Radius of the helix
    
    // Normalized progress (0 to 1)
    const t = index / total;
    
    // Calculate the 'rung' of the ladder. 
    // A full turn is 2*PI. We want ~10 turns for dramatic effect.
    const angle = t * Math.PI * 20; 

    // Calculate Y position (height along the strand)
    const y = (t * length) - (length / 2); // Center it on Y-axis

    // Determine which strand (A or B) this particle belongs to
    // We alternate even/odd particles to split them into two strands
    const isStrandA = index % 2 === 0;
    const offset = isStrandA ? 0 : Math.PI; // 180 degree offset for second strand

    // Parametric Circle Equation + Y Rise
    const x = radius * Math.cos(angle + offset);
    const z = radius * Math.sin(angle + offset);

    // Add "Base Pair" bridges:
    // Every 100th particle moves towards the center to form the connecting rung
    if (index % 50 < 5) {
        return {
            x: x * (index % 50) / 5, // Lerp towards center
            y: y,
            z: z * (index % 50) / 5
        };
    }

    return { x, y, z };
}

/**
 * Generates a Golden Spiral Galaxy.
 * Uses Logarithmic Spiral equation: r = a * e^(b * theta)
 */
export function getGalaxyPoint(index, total) {
    const arms = 3; // Number of spiral arms
    const spin = index / total;
    const armIndex = index % arms;
    
    // Spiral constants
    const radiusMax = 35;
    const spiralTightness = 0.5;

    // Calculate angle based on progress + arm offset
    // The (spin * 10) creates the winding
    const angle = (spin * Math.PI * 2 * 3) + (armIndex * (Math.PI * 2 / arms));
    
    // Radius grows with angle (logarithmic)
    const radius = Math.pow(spin, spiralTightness) * radiusMax;

    // Add randomness for "star dust" spread
    // We use a Gaussian-like distribution (more mass in center)
    const randomSpread = () => (Math.random() - 0.5) * (10 - spin * 8); 

    const x = Math.cos(angle) * radius + randomSpread();
    const y = (Math.random() - 0.5) * (radius * 0.1); // Flattened disk
    const z = Math.sin(angle) * radius + randomSpread();

    return { x, y, z };
}

/**
 * Generates a Neural/Cellular Sphere with surface noise.
 */
export function getCellPoint(index, total) {
    const u = Math.random();
    const v = Math.random();
    
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    
    const r = 8; // Base radius

    // Convert spherical to cartesian
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);

    // Add Membrane "wobble" (Vertex Displacement) via noise
    // Simple pseudo-noise based on position
    const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5);
    const displacement = 1 + (noise * 0.2);

    return { 
        x: x * displacement, 
        y: y * displacement, 
        z: z * displacement 
    };
}