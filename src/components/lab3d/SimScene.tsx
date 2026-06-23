import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SimulationSchemaT } from "@/lib/sim-lab.functions";
import { buildInitialState, stepSim, type SimObjectState } from "./physics";

type Props = {
  schema: SimulationSchemaT | null;
  playing: boolean;
  resetKey: number;
  timeScale: number;
  onCanvasReady?: (gl: THREE.WebGLRenderer) => void;
};

function ObjectMesh({ s }: { s: SimObjectState }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.set(s.position[0], s.position[1], s.position[2]);
  });
  const color = s.color;
  let geom: ReactNode;
  switch (s.type) {
    case "sphere":
    case "particle":
      geom = <mesh castShadow><sphereGeometry args={[s.radius, 24, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} /></mesh>;
      break;
    case "wall":
      geom = <mesh receiveShadow castShadow><boxGeometry args={s.size} /><meshStandardMaterial color="#475569" /></mesh>;
      break;
    case "plane":
      geom = <mesh receiveShadow><boxGeometry args={s.size} /><meshStandardMaterial color="#1e293b" /></mesh>;
      break;
    case "car":
      geom = (
        <group>
          <mesh castShadow position={[0, 0.4, 0]}><boxGeometry args={s.size} /><meshStandardMaterial color={color} /></mesh>
          {[-0.6, 0.6].map((x) => [-0.4, 0.4].map((z) => (
            <mesh key={`${x}-${z}`} castShadow position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          )))}
        </group>
      );
      break;
    case "arrow":
      geom = <mesh><coneGeometry args={[s.radius, s.radius * 2, 12]} /><meshStandardMaterial color={color} /></mesh>;
      break;
    default:
      geom = <mesh castShadow><boxGeometry args={s.size} /><meshStandardMaterial color={color} /></mesh>;
  }
  return (
    <group ref={ref}>
      {geom}
      {s.label && (
        <Html distanceFactor={12} position={[0, s.radius + 0.6, 0]} center>
          <div className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">{s.label}</div>
        </Html>
      )}
    </group>
  );
}

function SimRunner({ schema, playing, resetKey, timeScale }: Omit<Props, "onCanvasReady">) {
  const state = useMemo<SimObjectState[]>(() => (schema ? buildInitialState(schema) : []), [schema, resetKey]);
  useFrame((_, dt) => {
    if (!schema || !playing) return;
    stepSim(state, schema.rules, Math.min(dt, 0.05) * timeScale);
  });
  return <>{state.map((s) => <ObjectMesh key={s.index} s={s} />)}</>;
}

function CanvasReadyBridge({ onReady }: { onReady?: (gl: THREE.WebGLRenderer) => void }) {
  const { gl } = useThree();
  useEffect(() => { onReady?.(gl); }, [gl, onReady]);
  return null;
}

export function SimScene({ schema, playing, resetKey, timeScale, onCanvasReady }: Props) {
  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [10, 8, 12], fov: 50 }}
      style={{ background: "#0b1020" }}
    >
      <CanvasReadyBridge onReady={onCanvasReady} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <Grid args={[40, 40]} cellColor="#1e293b" sectionColor="#334155" fadeDistance={40} infiniteGrid />
      <OrbitControls makeDefault enableDamping />
      {schema && <SimRunner schema={schema} playing={playing} resetKey={resetKey} timeScale={timeScale} />}
    </Canvas>
  );
}
