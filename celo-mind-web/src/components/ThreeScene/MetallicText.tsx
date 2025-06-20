import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

interface MetallicTextProps {
  text: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: number;
  height?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  scene: THREE.Scene;
  envMap?: THREE.Texture;
}

const MetallicText: React.FC<MetallicTextProps> = ({
  text,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = 0.5,
  height = 0.1,
  color = '#FFD700', // Default to gold color
  metalness = 1.0,
  roughness = 0.2,
  scene,
  envMap,
}) => {
  const textMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    // Load the font
    const fontLoader = new FontLoader();
    
    fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      // Create pixelated text geometry
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: height,
        curveSegments: 4, // Low curve segments for pixelated look
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 1
      });
      
      // Center the text
      textGeometry.computeBoundingBox();
      const textWidth = textGeometry.boundingBox ? 
        (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) : 0;
      
      // Create the material with metallic properties
      const textMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: metalness,
        roughness: roughness,
        envMap: envMap,
        envMapIntensity: 1.0,
      });
      
      // Create the mesh with the geometry and material
      const mesh = new THREE.Mesh(textGeometry, textMaterial);
      
      // Position and rotate the text
      mesh.position.set(position[0] - textWidth / 2, position[1], position[2]);
      mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
      
      // Store the mesh reference for later updates
      textMeshRef.current = mesh;
      
      // Add to scene
      scene.add(mesh);
    });
    
    // Cleanup function
    return () => {
      if (textMeshRef.current) {
        scene.remove(textMeshRef.current);
        textMeshRef.current.geometry.dispose();
        if (Array.isArray(textMeshRef.current.material)) {
          textMeshRef.current.material.forEach(material => material.dispose());
        } else {
          textMeshRef.current.material.dispose();
        }
        textMeshRef.current = null;
      }
    };
  }, [text, position, rotation, size, height, color, metalness, roughness, scene, envMap]);
  
  // This component doesn't render anything directly in the DOM
  return null;
};

export default MetallicText; 