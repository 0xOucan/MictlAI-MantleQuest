import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PMREMGenerator } from 'three';
import useThree from './useThree';

interface ThreeBackgroundProps {
  className?: string;
}

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scene, renderer, camera, isInitialized, animate } = useThree();
  
  // Initialize and set up the scene when component mounts
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;
    
    const container = containerRef.current;
    
    // Setup renderer and append it to our container
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0D0D0D, 1); // mictlai-obsidian background color
    container.appendChild(renderer.domElement);

    // Set up camera position
    camera.position.z = 5;
    
    // Create environment map for metallic materials
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Create a simple environment map (you can replace with an HDR image for better results)
    const envScene = new THREE.Scene();
    const envGeometry = new THREE.SphereGeometry(100, 32, 32);
    const envMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333, 
      side: THREE.BackSide,
      envMap: null
    });
    const envMesh = new THREE.Mesh(envGeometry, envMaterial);
    envScene.add(envMesh);

    // Generate environment map
    const renderTarget = pmremGenerator.fromScene(envScene);
    const envMap = renderTarget.texture;
    
    // Add grid floor with metallic material
    const gridGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    const gridMaterial = new THREE.MeshStandardMaterial({
      color: 0x40E0D0, // mictlai-turquoise
      metalness: 0.9,
      roughness: 0.2,
      envMap: envMap,
      flatShading: true,
    });
    
    // Add displacement for a more dynamic look
    gridGeometry.rotateX(-Math.PI / 2);
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.position.y = -1.5;
    scene.add(grid);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xFFD700, 1); // mictlai-gold color
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add point lights with different colors for the iridescent effect
    const pointLight1 = new THREE.PointLight(0xFF0000, 0.5); // Red
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00FF00, 0.5); // Green
    pointLight2.position.set(-2, 2, -2);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x0000FF, 0.5); // Blue
    pointLight3.position.set(0, -2, 0);
    scene.add(pointLight3);
    
    // Add metallic torus knot objects
    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);
    const metallicMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.2,
      envMap: envMap,
      envMapIntensity: 1.0,
    });
    
    const torusKnot = new THREE.Mesh(torusKnotGeometry, metallicMaterial);
    torusKnot.position.set(2, 0, 0);
    scene.add(torusKnot);
    
    const torusKnot2 = new THREE.Mesh(torusKnotGeometry, metallicMaterial.clone());
    torusKnot2.material.color.setHex(0xFFD700); // Gold color
    torusKnot2.position.set(-2, 0, 0);
    scene.add(torusKnot2);
    
    // Add pixelated effect by using low-res render target
    const pixelRatio = 0.25; // Adjust for more/less pixelation
    
    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio * pixelRatio);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Animation function to update the scene
    const animateScene = () => {
      // Rotate the torus knots
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
      
      torusKnot2.rotation.x += 0.01;
      torusKnot2.rotation.y -= 0.01;
      
      // Animate grid for a wave effect
      const positions = gridGeometry.attributes.position;
      const time = Date.now() * 0.0005;
      
      for (let i = 0; i < positions.count; i++) {
        const x = gridGeometry.attributes.position.getX(i);
        const z = gridGeometry.attributes.position.getZ(i);
        const y = Math.sin(x * 0.05 + time) * Math.sin(z * 0.05 + time) * 0.5;
        
        gridGeometry.attributes.position.setY(i, y);
      }
      
      gridGeometry.attributes.position.needsUpdate = true;
      gridGeometry.computeVertexNormals();
      
      // Animate point lights for rainbow effect
      const t = Date.now() * 0.001;
      pointLight1.position.x = Math.sin(t * 0.7) * 3;
      pointLight1.position.z = Math.cos(t * 0.7) * 3;
      
      pointLight2.position.x = Math.sin(t * 0.3) * 3;
      pointLight2.position.z = Math.cos(t * 0.3) * 3;
      
      pointLight3.position.x = Math.sin(t * 0.5) * 3;
      pointLight3.position.z = Math.cos(t * 0.5) * 3;
    };
    
    animate(animateScene);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [camera, renderer, scene, isInitialized, animate]);
  
  return (
    <div 
      ref={containerRef} 
      className={`fixed top-0 left-0 w-full h-full z-0 pointer-events-none ${className}`}
    />
  );
};

export default ThreeBackground; 