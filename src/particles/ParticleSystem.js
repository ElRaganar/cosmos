import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from './shaders.js';

export class ParticleSystem {
    constructor(scene, count = 20000) {
        this.scene = scene;
        this.count = count;
        
        this.geometry = new THREE.BufferGeometry();
        this.material = null;
        this.mesh = null;
        
        this.init();
    }

    init() {
        const positions = new Float32Array(this.count * 3);
        const targets = new Float32Array(this.count * 3);
        const sizes = new Float32Array(this.count);
        const colors = new Float32Array(this.count * 3);

        const color = new THREE.Color();

        for (let i = 0; i < this.count; i++) {
            // Initial State: Random dispersion (Space dust)
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            
            // Default sizes
            sizes[i] = Math.random();
            
            // Base Color (Blue/Purple/Biotech)
            color.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.6);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targets, 3)); // Initialize targets same as pos
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMix: { value: 0 }, // Controls morphing
                uSize: { value: 1.0 }
            },
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.mesh = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    // Set the target shape for the particles to morph into
    setTargetShape(shapeType, data = {}) {
        const targetAttr = this.geometry.attributes.targetPosition;
        const array = targetAttr.array;
        
        // Before setting new targets, snap current positions to previous targets 
        // (This prevents jumping if we morph while uMix is 1.0)
        if (this.material.uniforms.uMix.value > 0.9) {
            const currentPos = this.geometry.attributes.position;
            currentPos.array.set(targetAttr.array);
            currentPos.needsUpdate = true;
            this.material.uniforms.uMix.value = 0; // Reset mix
        }

        let i3 = 0;
        for (let i = 0; i < this.count; i++) {
            i3 = i * 3;
            let x, y, z;

            if (shapeType === 'CELL') {
                // Sphere
                const r = 5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            } 
            else if (shapeType === 'DNA') {
                // Double Helix
                const t = (i / this.count) * 20 * Math.PI; // Length
                const r = 3;
                // Split into two strands
                const offset = (i % 2 === 0) ? 0 : Math.PI; 
                x = r * Math.cos(t + offset);
                y = (i / this.count) * 40 - 20; // Height
                z = r * Math.sin(t + offset);
            }
            else if (shapeType === 'GALAXY') {
                // Spiral
                const angle = (i / this.count) * Math.PI * 10;
                const radius = (i / this.count) * 20;
                // Logarithmic spiral arms
                x = Math.cos(angle) * radius + (Math.random()-0.5);
                y = (Math.random() - 0.5) * 2; // Flat galaxy
                z = Math.sin(angle) * radius + (Math.random()-0.5);
            }
            else if (shapeType === 'TEXT') {
                 // Use data.points (pre-calculated text coordinates)
                 // If more particles than text points, random scatter
                 if (i < data.points.length) {
                     x = data.points[i].x;
                     y = data.points[i].y;
                     z = 0;
                 } else {
                     x = (Math.random() - 0.5) * 50;
                     y = (Math.random() - 0.5) * 50;
                     z = (Math.random() - 0.5) * 50;
                 }
            }

            array[i3] = x;
            array[i3 + 1] = y;
            array[i3 + 2] = z;
        }

        targetAttr.needsUpdate = true;
    }

    update(time, deltaTime) {
        this.material.uniforms.uTime.value = time;
        // Slowly rotate the whole system for ambience
        this.mesh.rotation.y += 0.05 * deltaTime;
    }
}