import { create } from 'zustand';

export type GestureType = 'NONE' | 'DRAW' | 'GRAB' | 'PINCH' | 'OPEN' | 'ROTATE';

interface HandData {
  landmarks: any[];
  gesture: GestureType;
  isRight: boolean;
  position: { x: number; y: number; z: number };
}

interface InteractionState {
  leftHand: HandData | null;
  rightHand: HandData | null;
  isCameraReady: boolean;
  brushColor: string;
  strokes: { points: number[][]; color: string }[];
  currentStroke: number[][] | null;
  cameraZoom: number;

  setLeftHand: (hand: HandData | null) => void;
  setRightHand: (hand: HandData | null) => void;
  setCameraReady: (ready: boolean) => void;
  addStrokePoint: (point: number[]) => void;
  finishStroke: () => void;
  setBrushColor: (color: string) => void;
  clearStrokes: () => void;
  setCameraZoom: (zoom: number) => void;
}

export const useStore = create<InteractionState>((set) => ({
  leftHand: null,
  rightHand: null,
  isCameraReady: false,
  brushColor: '#00f2ff',
  strokes: [],
  currentStroke: null,
  cameraZoom: 8,

  setLeftHand: (leftHand) => set({ leftHand }),
  setRightHand: (rightHand) => set({ rightHand }),
  setCameraReady: (isCameraReady) => set({ isCameraReady }),

  addStrokePoint: (point) => set((state) => ({
    currentStroke: state.currentStroke
      ? [...state.currentStroke, point]
      : [point],
  })),

  finishStroke: () => set((state) => {
    if (!state.currentStroke || state.currentStroke.length < 2) {
      return { currentStroke: null };
    }
    return {
      strokes: [...state.strokes, { points: state.currentStroke, color: state.brushColor }],
      currentStroke: null,
    };
  }),

  setBrushColor: (brushColor) => set({ brushColor }),
  clearStrokes: () => set({ strokes: [], currentStroke: null }),
  setCameraZoom: (cameraZoom) => set({ cameraZoom }),
}));