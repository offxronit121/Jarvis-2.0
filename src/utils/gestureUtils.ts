import { GestureType } from '../store/useStore';

export const calculateDistance = (p1: any, p2: any) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
};

// Finger extended check — tip vs middle joint
const isFingerExtended = (tip: any, mid: any, base: any) => {
  return tip.y < mid.y && mid.y < base.y; // y axis mein upar = extended
};

export const recognizeGesture = (landmarks: any[]): GestureType => {
  if (!landmarks || landmarks.length < 21) return 'NONE';

  const thumbTip  = landmarks[4];
  const indexTip  = landmarks[8];
  const indexMid  = landmarks[7];
  const indexBase = landmarks[6];
  const middleTip  = landmarks[12];
  const middleMid  = landmarks[11];
  const middleBase = landmarks[10];
  const ringTip   = landmarks[16];
  const ringMid   = landmarks[15];
  const ringBase  = landmarks[14];
  const pinkyTip  = landmarks[20];
  const pinkyMid  = landmarks[19];
  const pinkyBase = landmarks[18];

  const indexUp  = isFingerExtended(indexTip, indexMid, indexBase);
  const middleUp = isFingerExtended(middleTip, middleMid, middleBase);
  const ringUp   = isFingerExtended(ringTip, ringMid, ringBase);
  const pinkyUp  = isFingerExtended(pinkyTip, pinkyMid, pinkyBase);

  // PINCH — thumb + index close (grab ke liye)
  const pinchDist = calculateDistance(thumbTip, indexTip);
  if (pinchDist < 0.06) return 'PINCH';

  // DRAW — sirf index finger upar
  if (indexUp && !middleUp && !ringUp && !pinkyUp) return 'DRAW';

  // ROTATE — index + middle dono upar (V sign)
  if (indexUp && middleUp && !ringUp && !pinkyUp) return 'ROTATE';

  // OPEN — saari ungliyaan upar
  if (indexUp && middleUp && ringUp && pinkyUp) return 'OPEN';

  // GRAB — saari ungliyaan band
  if (!indexUp && !middleUp && !ringUp && !pinkyUp) return 'GRAB';

  return 'NONE';
};

// Pointer smoothing — EMA filter
export class PointerSmoother {
  private smoothX = 0;
  private smoothY = 0;
  private smoothZ = 0;
  private alpha: number;
  private initialized = false;

  constructor(alpha = 0.2) {
    this.alpha = alpha; // 0.1 = very smooth, 0.5 = responsive
  }

  smooth(x: number, y: number, z: number) {
    if (!this.initialized) {
      this.smoothX = x;
      this.smoothY = y;
      this.smoothZ = z;
      this.initialized = true;
    } else {
      this.smoothX = this.alpha * x + (1 - this.alpha) * this.smoothX;
      this.smoothY = this.alpha * y + (1 - this.alpha) * this.smoothY;
      this.smoothZ = this.alpha * z + (1 - this.alpha) * this.smoothZ;
    }
    return { x: this.smoothX, y: this.smoothY, z: this.smoothZ };
  }

  reset() {
    this.initialized = false;
  }
}