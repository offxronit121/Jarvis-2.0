import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { recognizeGesture } from '../utils/gestureUtils';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });

// Finger landmark groups
const FINGER_DOTS = {
  thumb:  [1, 2, 3, 4],
  index:  [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring:   [13, 14, 15, 16],
  pinky:  [17, 18, 19, 20],
  wrist:  [0],
};

const FINGER_COLORS = {
  thumb:  '#FF4E00',  // orange
  index:  '#00F2FF',  // cyan
  middle: '#00FF88',  // green
  ring:   '#FFD700',  // gold
  pinky:  '#FF69B4',  // pink
  wrist:  '#ffffff',  // white
};

const drawHandVisualization = (ctx: CanvasRenderingContext2D, landmarks: any[], gesture: string) => {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Draw connections first (lines between joints)
  const connections = [
    // Palm
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
    [0, 13], [13, 14], [14, 15], [15, 16],// Ring
    [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
    [5, 9], [9, 13], [13, 17],            // Knuckle line
  ];

  connections.forEach(([a, b]) => {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    ctx.beginPath();
    ctx.moveTo(p1.x * w, p1.y * h);
    ctx.lineTo(p2.x * w, p2.y * h);
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw dots for each finger with different colors
  Object.entries(FINGER_DOTS).forEach(([finger, indices]) => {
    const color = FINGER_COLORS[finger as keyof typeof FINGER_COLORS];
    indices.forEach((idx, i) => {
      const lm = landmarks[idx];
      const x = lm.x * w;
      const y = lm.y * h;
      const isTip = i === indices.length - 1;

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(x, y, isTip ? 10 : 6, 0, Math.PI * 2);
      ctx.fillStyle = color + '33';
      ctx.fill();

      // Main dot
      ctx.beginPath();
      ctx.arc(x, y, isTip ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Tip number label
      if (isTip) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${idx}`, x + 8, y - 8);
      }
    });
  });

  // Gesture label on hand
  const wrist = landmarks[0];
  const wx = wrist.x * w;
  const wy = wrist.y * h;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(wx - 40, wy + 15, 80, 22);
  ctx.fillStyle = gesture === 'DRAW' ? '#00F2FF'
    : gesture === 'GRAB' ? '#FF4E00'
    : gesture === 'PINCH' ? '#FFD700'
    : gesture === 'ROTATE' ? '#00FF88'
    : '#ffffff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(gesture, wx, wy + 30);
  ctx.textAlign = 'left';
};

export const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setLeftHand, setRightHand, setCameraReady } = useStore();

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const init = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

        const hands = new window.Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.75,
          minTrackingConfidence: 0.75,
        });

        hands.onResults((results: any) => {
          const canvasCtx = canvasRef.current!.getContext('2d');
          if (!canvasCtx) return;

          const w = canvasRef.current!.width;
          const h = canvasRef.current!.height;

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, w, h);

          // Mirror flip
          canvasCtx.translate(w, 0);
          canvasCtx.scale(-1, 1);

          if (results.multiHandLandmarks && results.multiHandedness) {
            let left: any = null;
            let right: any = null;

            results.multiHandLandmarks.forEach((landmarks: any, index: number) => {
              const classification = results.multiHandedness[index];
              const isRight = classification.label === 'Right';
              const gesture = recognizeGesture(landmarks);
              const pos = landmarks[8];

              const handData = {
                landmarks,
                gesture,
                isRight,
                position: { x: pos.x, y: pos.y, z: pos.z },
              };

              if (isRight) right = handData;
              else left = handData;

              // Custom visualization
              drawHandVisualization(canvasCtx, landmarks, gesture);
            });

            setLeftHand(left);
            setRightHand(right);
          } else {
            setLeftHand(null);
            setRightHand(null);
          }

          canvasCtx.restore();
        });

        const camera = new window.Camera(videoRef.current!, {
          onFrame: async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              await hands.send({ image: videoRef.current });
            } catch (e) {}
          },
          width: 640,
          height: 480,
        });

        camera.start()
          .then(() => {
            console.log('Camera started!');
            setCameraReady(true);
          })
          .catch((err: any) => {
            console.error('Camera failed:', err);
            setCameraReady(false);
          });

      } catch (err) {
        console.error('Init error:', err);
        setCameraReady(false);
      }
    };

    init();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-64 h-48 border-2 border-[#00f2ff]/40 rounded-lg overflow-hidden bg-black/70 z-50">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-full object-cover"
      />
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 flex gap-2 flex-wrap">
        {[
          { color: '#FF4E00', label: 'Thumb' },
          { color: '#00F2FF', label: 'Index' },
          { color: '#00FF88', label: 'Middle' },
          { color: '#FFD700', label: 'Ring' },
          { color: '#FF69B4', label: 'Pinky' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[8px] font-mono" style={{ color }}>{label}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0 p-1 text-[10px] font-mono text-[#00f2ff] bg-black/50">
        HAND_SCAN
      </div>
    </div>
  );
};