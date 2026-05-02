import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { PointerSmoother } from '../utils/gestureUtils';

// Smoother instances
const rightSmoother = new PointerSmoother(0.18);
const drawSmoother = new PointerSmoother(0.12);

const DrawingPath = ({ points, color }: { points: number[][], color: string }) => {
  const lineGeometry = useMemo(() => {
    if (points.length < 2) return null;
    const pts = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [points]);

  const line = useMemo(() => {
    if (!lineGeometry) return null;
    const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
    return new THREE.Line(lineGeometry, material);
  }, [lineGeometry, color]);

  if (!line) return null;
  return <primitive object={line} />;
};

const DrawingLines = () => {
  const { strokes, currentStroke, brushColor } = useStore();
  return (
    <group>
      {strokes.map((stroke, i) => (
        <DrawingPath key={i} points={stroke.points} color={stroke.color} />
      ))}
      {currentStroke && currentStroke.length >= 2 && (
        <DrawingPath points={currentStroke} color={brushColor} />
      )}
    </group>
  );
};

// Pinch zoom controller
const ZoomController = () => {
  const { camera } = useThree();
  const { leftHand, rightHand, setCameraZoom, cameraZoom } = useStore();
  const prevPinchDist = useRef<number | null>(null);

  useFrame(() => {
    const lPinch = leftHand?.gesture === 'PINCH';
    const rPinch = rightHand?.gesture === 'PINCH';

    if (lPinch && rPinch && leftHand && rightHand) {
      // Dono haath ki pinch distance measure karo
      const dist = Math.abs(leftHand.position.x - rightHand.position.x) +
                   Math.abs(leftHand.position.y - rightHand.position.y);

      if (prevPinchDist.current !== null) {
        const delta = prevPinchDist.current - dist;
        const newZoom = Math.max(3, Math.min(20, cameraZoom + delta * 15));
        setCameraZoom(newZoom);
        (camera as THREE.PerspectiveCamera).position.z +=
          ((newZoom - cameraZoom) * 0.3);
      }
      prevPinchDist.current = dist;
    } else {
      prevPinchDist.current = null;
    }
  });

  return null;
};

const InteractiveBox = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { rightHand } = useStore();

  useFrame(() => {
    if (!meshRef.current) return;

    if (rightHand?.gesture === 'GRAB' || rightHand?.gesture === 'PINCH') {
      const raw = rightHand.position;
      const smooth = rightSmoother.smooth(raw.x, raw.y, raw.z);
      const tx = (smooth.x - 0.5) * -10;
      const ty = (smooth.y - 0.5) * -10;
      meshRef.current.position.lerp(new THREE.Vector3(tx, ty, 0), 0.15);
    }

    if (rightHand?.gesture === 'ROTATE') {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.rotation.x += 0.02;
    } else {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <MeshDistortMaterial
          color="#00f2ff"
          speed={2}
          distort={0.3}
          radius={1}
          emissive="#00f2ff"
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>
    </Float>
  );
};

// Drawing pointer indicator
const DrawingPointer = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { rightHand } = useStore();

  useFrame(() => {
    if (!meshRef.current) return;

    if (rightHand?.gesture === 'DRAW') {
      const raw = rightHand.position;
      const smooth = drawSmoother.smooth(raw.x, raw.y, raw.z);
      const tx = (smooth.x - 0.5) * -10;
      const ty = (smooth.y - 0.5) * -10;
      meshRef.current.position.set(tx, ty, 0);
      meshRef.current.visible = true;
    } else {
      meshRef.current.visible = false;
      drawSmoother.reset();
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#ff2e63" />
    </mesh>
  );
};

const SceneContent = () => {
  const { rightHand, addStrokePoint, finishStroke } = useStore();
  const isDrawing = useRef(false);

  useFrame(() => {
    if (rightHand?.gesture === 'DRAW') {
      const raw = rightHand.position;
      const smooth = drawSmoother.smooth(raw.x, raw.y, raw.z);
      const tx = (smooth.x - 0.5) * -10;
      const ty = (smooth.y - 0.5) * -10;
      const tz = smooth.z * -3;
      addStrokePoint([tx, ty, tz]);
      isDrawing.current = true;
    } else {
      if (isDrawing.current) {
        finishStroke();
        isDrawing.current = false;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00F2FF" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#FF4E00" />
      <pointLight position={[0, 0, 5]} intensity={0.8} color="#ffffff" />

      <InteractiveBox />
      <DrawingLines />
      <DrawingPointer />
      <ZoomController />

      <gridHelper
        args={[30, 30, '#00F2FF', '#081a26']}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -4]}
      />
    </>
  );
};

export const ThreeScene: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas>
        <color attach="background" args={['#05070A']} />
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={false} />
        <SceneContent />
      </Canvas>
    </div>
  );
};