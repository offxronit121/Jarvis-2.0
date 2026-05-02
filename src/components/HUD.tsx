import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Activity, Radio, Database, Wind } from 'lucide-react';

export const HUD: React.FC = () => {
  const { leftHand, rightHand, isCameraReady } = useStore();
  const [permissionError, setPermissionError] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCameraReady) setPermissionError(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isCameraReady]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none p-6 grid grid-cols-[280px_1fr_280px] grid-rows-[80px_1fr_120px] gap-5">

      {/* Camera Permission Error */}
      {permissionError && !isCameraReady && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-50">
          <div className="bg-hud-bg/90 border-2 border-hud-warning p-8 text-center backdrop-blur-xl pointer-events-auto">
            <h2 className="text-hud-warning text-2xl font-bold mb-4">CAMERA_ACCESS_DENIED</h2>
            <p className="text-hud-cyan text-sm max-w-md font-mono">
              UNABLE TO INITIALIZE OPTICAL SENSORS. PLEASE ENABLE CAMERA PERMISSIONS IN YOUR BROWSER AND REFRESH SYSTEM.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="col-span-3 flex justify-between items-center px-5 border-b-2 border-hud-dim pointer-events-auto">
        <div className="font-mono text-lg tracking-[0.25em] text-hud-cyan">
          JARVIS 2.0 // HAND_DETECTION_SYSTEM
        </div>
        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-hud-cyan shadow-[0_0_10px_#00F2FF] animate-pulse" />
            <span>SYSTEM ACTIVE</span>
          </div>
          <div className="opacity-50">CORE_TEMP: 34°C</div>
          <div className="opacity-50">STABLE_0x82</div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="row-start-2 flex flex-col gap-4 pointer-events-auto">
        <div className="hud-panel p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold tracking-widest flex items-center gap-2 border-b border-hud-dim pb-2 mb-2 uppercase">
            <Radio size={14} /> HAND_TRACKING
          </h3>
          <DataRow label="L_HAND_ID" value={leftHand ? '0xAF23' : isCameraReady ? 'SEARCHING...' : 'OFFLINE'} />
          <DataRow label="R_HAND_ID" value={rightHand ? '0xBF88' : isCameraReady ? 'SEARCHING...' : 'OFFLINE'} />
          <DataRow label="CAMERA_STAT" value={isCameraReady ? 'OK' : 'ERROR'} />
          <DataRow label="FPS_PROC" value={isCameraReady ? '120.4' : '0'} />
        </div>

        <div className="hud-panel p-4 flex flex-col gap-3 flex-grow">
          <h3 className="text-xs font-bold tracking-widest flex items-center gap-2 border-b border-hud-dim pb-2 mb-2">
            <Activity size={14} /> GESTURE_LOG
          </h3>
          <div className="flex flex-col gap-2 overflow-hidden">
            <GestureLogItem
              time="LIVE"
              gesture={rightHand?.gesture || 'IDLE'}
              color={rightHand?.gesture && rightHand.gesture !== 'NONE' ? 'var(--color-hud-cyan)' : undefined}
            />
            <GestureLogItem time="--:--:--" gesture="PINCH_ZOOM_IN" />
            <GestureLogItem time="--:--:--" gesture="GRAB_OBJECT_01" color="var(--color-hud-warning)" />
            <GestureLogItem time="--:--:--" gesture="ROTATE_AXIS_Y" />
          </div>
        </div>
      </aside>

      {/* Center Viewport */}
      <main className="row-start-2 col-start-2 relative flex items-center justify-center">
        {/* Rotating Reticles */}
        <div className="absolute w-[500px] h-[500px] border-t-2 border-hud-dim rounded-full animate-[spin_20s_linear_infinite]" />
        <div className="absolute w-[400px] h-[400px] border-l-2 border-hud-dim rounded-full animate-[spin_15s_linear_infinite_reverse]" />

        {/* Hand Position Indicators */}
        <AnimatePresence>
          {leftHand && (
            <motion.div
              key="left"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute pointer-events-none"
              style={{
                left: `${leftHand.position.x * 100}%`,
                top: `${leftHand.position.y * 100}%`,
              }}
            >
              <div className="w-4 h-4 border border-hud-cyan rounded-full -translate-x-1/2 -translate-y-1/2 scale-150 animate-pulse" />
              <div className="absolute left-6 top-6 text-[10px] font-mono whitespace-nowrap bg-hud-bg/80 px-2 py-1 border border-hud-dim">
                <div className="text-hud-cyan opacity-50 text-[8px]">GAUNTLET_L</div>
                <div>{leftHand.gesture}</div>
              </div>
            </motion.div>
          )}

          {rightHand && (
            <motion.div
              key="right"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute pointer-events-none"
              style={{
                left: `${rightHand.position.x * 100}%`,
                top: `${rightHand.position.y * 100}%`,
              }}
            >
              <div className={`w-4 h-4 border ${rightHand.gesture === 'GRAB' ? 'border-hud-warning' : 'border-hud-cyan'} rounded-full -translate-x-1/2 -translate-y-1/2 scale-150 animate-pulse`} />
              <div className="absolute left-6 top-6 text-[10px] font-mono whitespace-nowrap bg-hud-bg/80 px-2 py-1 border border-hud-dim">
                <div className={`${rightHand.gesture === 'GRAB' ? 'text-hud-warning' : 'text-hud-cyan'} opacity-50 text-[8px]`}>
                  GAUNTLET_R
                </div>
                <div className={rightHand.gesture === 'GRAB' ? 'text-hud-warning' : 'text-white'}>
                  {rightHand.gesture}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Right Sidebar */}
      <aside className="row-start-2 col-start-3 flex flex-col gap-4 pointer-events-auto">
        <div className="hud-panel p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold tracking-widest flex items-center gap-2 border-b border-hud-dim pb-2 mb-2">
            <Database size={14} /> OBJECT_METRICS
          </h3>
          <DataRow label="X_POS" value={rightHand ? `${((rightHand.position.x - 0.5) * -10).toFixed(2)}` : '+000.00'} />
          <DataRow label="Y_POS" value={rightHand ? `${((rightHand.position.y - 0.5) * -10).toFixed(2)}` : '+000.00'} />
          <DataRow label="Z_POS" value={rightHand ? `${((rightHand.position.z - 0.5) * -5).toFixed(2)}` : '+000.00'} />
          <DataRow label="GESTURE" value={rightHand?.gesture || 'NONE'} />
        </div>

        <div className="hud-panel p-4 flex flex-col gap-3 flex-grow">
          <h3 className="text-xs font-bold tracking-widest flex items-center gap-2 border-b border-hud-dim pb-2 mb-2">
            <Wind size={14} /> ENVIRONMENT
          </h3>
          <div className="h-20 w-full border border-hud-dim flex items-end gap-1 p-2">
            {[40, 60, 30, 80, 50, 90, 70, 45, 65, 85].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: `${h}%` }}
                className={`w-full ${i === 5 ? 'bg-hud-warning' : 'bg-hud-cyan'}`}
              />
            ))}
          </div>
          <div className="text-[10px] font-mono opacity-60 mt-2">
            SPATIAL_INTERFERENCE: LOW
          </div>
        </div>
      </aside>

      {/* Footer */}
      <footer className="col-span-3 flex gap-4 pointer-events-auto">
        <div className="hud-panel flex-grow p-4 font-mono text-[10px] tracking-widest overflow-hidden whitespace-nowrap opacity-50">
          00101101 11001010 00101111 11110000 00010111 10101010 11100110 00101011 11000111 01010101 10101010 11100110 00101011 11000111 01010101
        </div>
        <div className="hud-panel w-48 flex items-center justify-center font-bold text-sm tracking-widest">
          NAV: 04 // COMP: 88%
        </div>
      </footer>

    </div>
  );
};

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between font-mono text-[10px]">
    <span className="text-hud-cyan/50">{label}</span>
    <span className="text-hud-cyan">{value}</span>
  </div>
);

const GestureLogItem = ({ time, gesture, color }: { time: string; gesture: string; color?: string }) => (
  <div className="p-2 border-l-2 bg-hud-cyan/5" style={{ borderColor: color || 'var(--color-hud-cyan)' }}>
    <div className="text-[8px] opacity-50 font-mono">{time}</div>
    <div className="text-[10px] font-bold tracking-wider" style={{ color }}>{gesture}</div>
  </div>
);