import type { SimulationSchemaT } from "@/lib/sim-lab.functions";

export type Vec3 = [number, number, number];

export type SimObjectState = {
  index: number;
  type: string;
  position: Vec3;
  velocity: Vec3;
  mass: number;
  radius: number;
  size: Vec3;
  color: string;
  label?: string;
  fixed: boolean;
};

const PALETTE = ["#7c3aed", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#fb923c"];

function toVec3(v: unknown, fallback: Vec3): Vec3 {
  if (Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === "number")) return v as Vec3;
  if (typeof v === "number") return [v, 0, 0];
  return fallback;
}
function toSize(v: unknown, fallback: Vec3): Vec3 {
  if (typeof v === "number") return [v, v, v];
  return toVec3(v, fallback);
}

export function buildInitialState(schema: SimulationSchemaT): SimObjectState[] {
  return schema.objects.map((o, i) => {
    const type = (o.type || "cube").toLowerCase();
    return {
      index: i,
      type,
      position: toVec3((o as any).position, [i * 2 - schema.objects.length, type === "plane" ? 0 : 1, 0]),
      velocity: toVec3((o as any).velocity, [0, 0, 0]),
      mass: typeof (o as any).mass === "number" ? (o as any).mass : 1,
      radius: typeof (o as any).radius === "number" ? (o as any).radius : 0.6,
      size: toSize(
        (o as any).size,
        type === "wall"
          ? [0.5, 4, 6]
          : type === "plane"
            ? [40, 0.1, 40]
            : type === "car"
              ? [2, 1, 1]
              : [1, 1, 1],
      ),
      color: (o as any).color || PALETTE[i % PALETTE.length],
      label: (o as any).label,
      fixed: !!(o as any).fixed || type === "wall" || type === "plane",
    };
  });
}

export function stepSim(state: SimObjectState[], rules: string[], dt: number) {
  const hasGravity = rules.includes("gravity");
  const hasCollision = rules.includes("collision_response");
  const hasFlow = rules.includes("flow_dynamics");
  const g = 9.81;

  for (const o of state) {
    if (o.fixed) continue;
    if (hasGravity) o.velocity[1] -= g * dt;
    if (hasFlow) {
      // gentle circular drift
      o.velocity[0] += Math.sin(performance.now() * 0.0005 + o.index) * 0.05 * dt;
      o.velocity[2] += Math.cos(performance.now() * 0.0005 + o.index) * 0.05 * dt;
    }
    o.position[0] += o.velocity[0] * dt;
    o.position[1] += o.velocity[1] * dt;
    o.position[2] += o.velocity[2] * dt;

    // floor
    if (o.position[1] < o.radius) {
      o.position[1] = o.radius;
      if (o.velocity[1] < 0) o.velocity[1] = -o.velocity[1] * 0.5;
    }
  }

  if (hasCollision) {
    for (let i = 0; i < state.length; i++) {
      for (let j = i + 1; j < state.length; j++) {
        const a = state[i];
        const b = state[j];
        const dx = b.position[0] - a.position[0];
        const dy = b.position[1] - a.position[1];
        const dz = b.position[2] - a.position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minD = (a.radius + b.radius) * 0.9;
        if (dist > 0 && dist < minD) {
          const nx = dx / dist, ny = dy / dist, nz = dz / dist;
          const overlap = minD - dist;
          if (!a.fixed) {
            a.position[0] -= nx * overlap * 0.5;
            a.position[1] -= ny * overlap * 0.5;
            a.position[2] -= nz * overlap * 0.5;
          }
          if (!b.fixed) {
            b.position[0] += nx * overlap * 0.5;
            b.position[1] += ny * overlap * 0.5;
            b.position[2] += nz * overlap * 0.5;
          }
          // simple elastic-ish exchange along normal (Newton 2nd / collision_response)
          const avn = a.velocity[0] * nx + a.velocity[1] * ny + a.velocity[2] * nz;
          const bvn = b.velocity[0] * nx + b.velocity[1] * ny + b.velocity[2] * nz;
          const ma = a.fixed ? Infinity : a.mass;
          const mb = b.fixed ? Infinity : b.mass;
          const newAvn = (avn * (ma - mb) + 2 * mb * bvn) / (ma + mb);
          const newBvn = (bvn * (mb - ma) + 2 * ma * avn) / (ma + mb);
          if (!a.fixed) {
            a.velocity[0] += (newAvn - avn) * nx;
            a.velocity[1] += (newAvn - avn) * ny;
            a.velocity[2] += (newAvn - avn) * nz;
          }
          if (!b.fixed) {
            b.velocity[0] += (newBvn - bvn) * nx;
            b.velocity[1] += (newBvn - bvn) * ny;
            b.velocity[2] += (newBvn - bvn) * nz;
          }
        }
      }
    }
  }
}
