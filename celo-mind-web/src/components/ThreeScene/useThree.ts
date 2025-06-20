import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Custom hook for managing Three.js scene, camera, renderer and animation loop
 */
const useThree = () => {
  // Create Three.js resources once and store in refs
  const sceneRef = useRef(new THREE.Scene());
  const rendererRef = useRef(
    new THREE.WebGLRenderer({ 
      antialias: false, // Turn off antialiasing for pixelated effect
      alpha: true,
      powerPreference: 'high-performance',
    })
  );
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    )
  );
  
  // State to track if scene has been initialized
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Animation refs
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  // Animation callback storage - will be populated by the component using this hook
  const animationCallbackRef = useRef<((delta: number) => void) | null>(null);
  
  // The animation loop
  const animationLoop = useCallback((time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;
    
    // Call the animation callback if it exists
    if (animationCallbackRef.current) {
      animationCallbackRef.current(deltaTime);
    }
    
    // Render the scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    // Continue the animation loop
    requestRef.current = requestAnimationFrame(animationLoop);
  }, []);
  
  // Start the animation with a provided animation function
  const animate = useCallback((callback: (delta: number) => void) => {
    animationCallbackRef.current = callback;
    
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(animationLoop);
      setIsInitialized(true);
    }
    
    // Cleanup function to stop animation when component unmounts
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };
  }, [animationLoop]);
  
  // Cleanup when the hook unmounts
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      // Dispose of Three.js resources
      sceneRef.current.clear();
      rendererRef.current.dispose();
    };
  }, []);
  
  return {
    scene: sceneRef.current,
    renderer: rendererRef.current,
    camera: cameraRef.current,
    animate,
    isInitialized
  };
};

export default useThree; 