// src/core/Interaction.js
import * as THREE from 'three';

export class Interaction {
    constructor(engine, sceneManager) {
        this.engine = engine;
        this.sceneManager = sceneManager;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Threshold for particle interaction
        this.raycaster.params.Points.threshold = 0.5;

        this.isActive = false; // Toggle based on scene
        this.hoveredIndex = -1;

        this.init();
    }

    init() {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
    }

    onMouseMove(event) {
        // Normalize mouse coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Optimization: Only update hover state if in Neural Network scene
        if (this.sceneManager.currentScene === 2) { 
            this.checkIntersections();
        }
    }

    onClick() {
        if (this.hoveredIndex !== -1) {
            // Trigger a ripple or spark effect at this particle
            console.log(`Synapse fired at node ${this.hoveredIndex}`);
            
            // Optional: Add a localized glow uniform to the shader here
            // this.sceneManager.particles.triggerPulse(this.hoveredIndex);
        }
    }

    checkIntersections() {
        if (!this.sceneManager.particles.mesh) return;

        this.raycaster.setFromCamera(this.mouse, this.engine.camera);

        // Raycast against the particle system
        const intersects = this.raycaster.intersectObject(this.sceneManager.particles.mesh);

        if (intersects.length > 0) {
            const index = intersects[0].index;
            this.hoveredIndex = index;

            // Visual Feedback: Cursor change
            document.body.style.cursor = 'pointer';
        } else {
            this.hoveredIndex = -1;
            document.body.style.cursor = 'default';
        }
    }
}