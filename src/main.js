import { Engine } from './core/Engine.js';
import { ParticleSystem } from './particles/ParticleSystem.js';
import { SceneManager } from './core/SceneManager.js';
import { Interaction } from './core/Interaction.js';

// 1. Initialize the Core 3D Engine
const engine = new Engine('canvas-container');

// 2. Create the Particle System (30k particles for mid-range laptops)
const particles = new ParticleSystem(engine.scene, 30000);

// 3. Initialize Scene Manager (Placeholder until interaction set up)
// We need to pass null first or adjust dependency injection, 
// but here we will instantiate Interaction first then pass it.
const interaction = new Interaction(engine, null); 

// 4. Initialize Scene Manager with dependencies
const sceneManager = new SceneManager(engine, particles, interaction);

// 5. Link SceneManager back to Interaction (Cyclic dependency resolution)
interaction.sceneManager = sceneManager;

// 6. Check for URL Name Parameter
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name');
if (name) {
    sceneManager.customName = name;
}

// 7. The Main Render Loop
function animate() {
    requestAnimationFrame(animate);
    
    const time = engine.clock.getElapsedTime();
    const deltaTime = engine.clock.getDelta();
    
    // Update Particles (Shader Uniforms)
    particles.update(time, deltaTime);
    
    // Render Scene (with Bloom)
    engine.render();
}

// Start the show
animate();