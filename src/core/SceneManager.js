import * as THREE from 'three';
import { sampleTextCoordinates } from '../utils/TextSampler.js';
import { getDNAPoint, getGalaxyPoint, getCellPoint } from '../utils/MathUtils.js';

export class SceneManager {
    constructor(engine, particles, interaction) {
        this.engine = engine;
        this.particles = particles;
        this.interaction = interaction; // Hook up interaction system
        
        this.currentScene = 0;
        this.customName = "Explorer"; // Default name
        
        // Narrative Texts
        this.texts = [
            "Encoded with brilliance.",  // Scene 1: DNA
            "Driven by curiosity.",      // Scene 2: Network
            "Built to explore.",         // Scene 3: Galaxy
            "Happy Birthday, "           // Scene 4: Name
        ];

        // UI Elements
        this.ui = {
            container: document.getElementById('text-container'),
            heading: document.getElementById('main-text'),
            btn: document.getElementById('trigger-btn')
        };

        this.setupBindings();
        
        // Initialize Scene 0: Single Cell
        this.setShape('CELL');
        this.animateMix(0, 0, 1.0); // Ensure we start at 0
    }

    setupBindings() {
        // The "Begin Life" button triggers the sequence
        this.ui.btn.addEventListener('click', () => this.nextScene());
    }

    // --- Core Shape Setter ---
    // Calculates target positions based on the requested shape type
    setShape(type, extraData = {}) {
        const pSystem = this.particles;
        const count = pSystem.count;
        const targetAttr = pSystem.geometry.attributes.targetPosition;
        const array = targetAttr.array;

        // 1. Snapshot current positions to prevent jumping
        // We copy target -> position so the morph starts from where particles currently are
        if (pSystem.material.uniforms.uMix.value > 0.5) {
            const currentPos = pSystem.geometry.attributes.position;
            currentPos.array.set(targetAttr.array);
            currentPos.needsUpdate = true;
            pSystem.material.uniforms.uMix.value = 0.0;
        }

        // 2. Calculate New Targets
        for (let i = 0; i < count; i++) {
            let p = { x: 0, y: 0, z: 0 };
            const i3 = i * 3;

            switch (type) {
                case 'CELL':
                    p = getCellPoint(i, count);
                    break;
                case 'DNA':
                    p = getDNAPoint(i, count);
                    break;
                case 'GALAXY':
                    p = getGalaxyPoint(i, count);
                    break;
                case 'TEXT':
                    // If we have a text point, use it. Otherwise, float in background.
                    if (i < extraData.points.length) {
                        p = extraData.points[i];
                        // Scale text points to fit scene
                         p.x *= 1.5; 
                         p.y *= 1.5;
                    } else {
                        // Background stars
                        p = getGalaxyPoint(i, count);
                        p.x *= 6; p.y *= 6; p.z *= 6; // Push far back
                    }
                    break;
            }

            array[i3]     = p.x;
            array[i3 + 1] = p.y;
            array[i3 + 2] = p.z;
        }

        targetAttr.needsUpdate = true;
    }

    // --- Transition Logic ---
    async nextScene() {
        this.currentScene++;
        const p = this.particles;

        // Hide button after first click
        if (this.currentScene === 1) this.ui.btn.style.display = 'none';

        switch(this.currentScene) {
            case 1: // -> DNA
                await this.updateText(this.texts[0]);
                this.setShape('DNA');
                p.material.uniforms.uSize.value = 1.0; 
                this.animateMix(0, 1, 3.0); // 3s Morph
                
                // Enable interaction for next scene
                setTimeout(() => this.nextScene(), 7000);
                break;

            case 2: // -> NEURAL NETWORK
                await this.updateText(this.texts[1]);
                this.setShape('CELL'); // Re-use sphere logic but bigger
                p.material.uniforms.uSize.value = 2.0; // Bigger nodes
                
                // Enable interaction (hover effects)
                this.interaction.isActive = true; 
                
                this.animateMix(0, 1, 2.5);
                setTimeout(() => {
                    this.interaction.isActive = false;
                    this.nextScene();
                }, 6000);
                break;

            case 3: // -> GALAXY
                await this.updateText(this.texts[2]);
                this.setShape('GALAXY');
                p.material.uniforms.uSize.value = 1.0;
                this.animateMix(0, 1, 4.0); // Slow expansion
                setTimeout(() => this.nextScene(), 7000);
                break;

            case 4: // -> NAME REVEAL
                await this.updateText(this.texts[3] + this.customName);
                
                // Sample text points
                const textPoints = sampleTextCoordinates(this.customName, p.count, 120);
                this.setShape('TEXT', { points: textPoints });
                
                this.animateMix(0, 1, 4.0);
                this.zoomCamera(40, 60); // Zoom out to see full text
                break;
        }
    }

    // --- Utilities ---
    
    // Smoothly interpolates the uMix uniform from 0 to 1
    animateMix(start, end, duration) {
        const startTime = performance.now();
        const startVal = this.particles.material.uniforms.uMix.value;
        
        const loop = () => {
            const now = performance.now();
            const p = Math.min((now - startTime) / (duration * 1000), 1);
            
            // Ease Out Cubic function for organic feel
            const ease = 1 - Math.pow(1 - p, 3);
            
            this.particles.material.uniforms.uMix.value = startVal + (end - startVal) * ease;

            if (p < 1) requestAnimationFrame(loop);
        };
        loop();
    }

    // Fades UI text out and in
    async updateText(newText) {
        this.ui.container.classList.remove('fade-in');
        this.ui.container.classList.add('fade-out');
        
        await new Promise(r => setTimeout(r, 1000));
        
        this.ui.heading.innerText = newText;
        this.ui.container.classList.remove('fade-out');
        this.ui.container.classList.add('fade-in');
    }

    // Simple camera dolly effect
    zoomCamera(startZ, endZ) {
        let currentZ = startZ;
        const animate = () => {
            currentZ += (endZ - currentZ) * 0.02; // Smooth damping
            this.engine.camera.position.z = currentZ;
            
            if (Math.abs(endZ - currentZ) > 0.1) requestAnimationFrame(animate);
        };
        animate();
    }
}