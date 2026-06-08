import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { Slider } from "@/components/ui/slider";

/**
 * Isolated 3D vector / projectile visualisation.
 * Only reacts to the two sliders — no text inputs, no DOM events touch tldraw.
 */
export function PhysicsOverlay() {
  const [vx, setVx] = useState(3);
  const [vy, setVy] = useState(5);

  // Projectile trajectory points
  const points = useMemo(() => {
    const g = 9.81;
    const pts: [number, number, number][] = [];
    for (let t = 0; t <= 2; t += 0.05) {
      const x = vx * t;
      const y = Math.max(0, vy * t - 0.5 * g * t * t);
      pts.push([x, y, 0]);
      if (t > 0 && y === 0) break;
    }
    return pts;
  }, [vx, vy]);

  return (
    <div className="flex h-full w-full flex-col bg-muted/30">
      <div className="grid grid-cols-2 gap-4 border-b bg-card p-3">
        <label className="text-xs font-medium">
          <div className="mb-1 flex justify-between">
            <span>Velocity x</span>
            <span className="tabular-nums text-muted-foreground">{vx.toFixed(1)} m/s</span>
          </div>
          <Slider value={[vx]} min={0} max={10} step={0.1} onValueChange={(v) => setVx(v[0])} />
        </label>
        <label className="text-xs font-medium">
          <div className="mb-1 flex justify-between">
            <span>Velocity y</span>
            <span className="tabular-nums text-muted-foreground">{vy.toFixed(1)} m/s</span>
          </div>
          <Slider value={[vy]} min={0} max={15} step={0.1} onValueChange={(v) => setVy(v[0])} />
        </label>
      </div>
      <div className="min-h-0 flex-1" style={{ pointerEvents: "auto" }}>
        <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading 3D…</div>}>
          <Canvas camera={{ position: [6, 6, 10], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <Grid args={[20, 20]} cellColor="#94a3b8" sectionColor="#475569" position={[0, 0, 0]} />
            {/* trajectory */}
            {points.map((p, i) =>
              i === 0 ? null : (
                <mesh key={i} position={p}>
                  <sphereGeometry args={[0.08, 12, 12]} />
                  <meshStandardMaterial color="#3b82f6" />
                </mesh>
              ),
            )}
            {/* velocity vector arrow */}
            <mesh position={[vx / 2, vy / 2, 0]}>
              <boxGeometry args={[Math.hypot(vx, vy), 0.06, 0.06]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <OrbitControls makeDefault enablePan={false} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
