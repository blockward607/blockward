import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const InteractiveLogo = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(100, 100);
    mountRef.current.appendChild(renderer.domElement);

    // Create cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x6d28d9,
      specular: 0x050505,
      shininess: 100 
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    camera.position.z = 2;

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-[100px] h-[100px]" />;
};