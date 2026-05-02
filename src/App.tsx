import { ThreeScene } from './components/ThreeScene';
import { HandTracker } from './components/HandTracker';
import { HUD } from './components/HUD';

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-hud-bg">
      <div className="atmosphere" />
      <div className="grid-overlay" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-hud-cyan/10 pointer-events-none animate-[scan_8s_linear_infinite]" />
      <ThreeScene />
      <HUD />
      <HandTracker />
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-8 items-center pointer-events-none z-50">
        <div className="flex gap-4 text-[10px] font-mono tracking-[0.2em] text-hud-cyan uppercase">
          <div className="flex items-center gap-2 bg-hud-dim px-3 py-1 border border-hud-cyan">
            <span className="w-1.5 h-1.5 bg-hud-cyan rounded-full animate-pulse"></span>
            <span>DRAW_MODE: INDEX_UP</span>
          </div>
          <div className="flex items-center gap-2 bg-hud-dim px-3 py-1 border border-hud-warning/40 text-hud-warning">
            <span className="w-1.5 h-1.5 bg-hud-warning rounded-full animate-pulse"></span>
            <span>GRAB_OP: FIST_CLOSED</span>
          </div>
        </div>
      </div>
    </div>
  );
}