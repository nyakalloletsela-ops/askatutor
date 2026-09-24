/**
 * Model class: 1-D Newtonian N-body gravitation.
 *
 * A reference implementation of the Model-Class contract for a
 * variable-cardinality system. It exercises the generic entity-collection
 * mechanism: each instance allocates a bounded set of bodies, each body carries
 * its own quantities, and net forces are accumulated pairwise.
 *
 * Deterministic by construction: bodies are processed in declared order, time
 * is an explicit counter, and no wall clock, randomness, `eval`, or
 * `new Function` is used. Gravitational attraction uses Plummer softening, so
 * forces stay finite even when two bodies coincide.
 */
import type { EntityRecord, ModelClassSpec, ModelInstance } from "../../model-class";
import { validateModelInstance } from "../../validation";
import { executeFixedStep, resolveFixedStepSchedule } from "../../execution/fixed-step";

export const NBODY_ENGINE_VERSION = "1.0.0";
export const NBODY_MODEL_CLASS_ID = "physics.mechanics.1d.nbody";
export const NBODY_MODEL_CLASS_VERSION = "1.0.0";

const METRE = { symbol: "m", dimension: "L" } as const;
const METRE_PER_SECOND = { symbol: "m/s", dimension: "L/T" } as const;
const KILOGRAM = { symbol: "kg", dimension: "M" } as const;
const NEWTON = { symbol: "N", dimension: "M*L/T^2" } as const;
const MOMENTUM = { symbol: "kg*m/s", dimension: "M*L/T" } as const;
const ENERGY = { symbol: "J", dimension: "M*L^2/T^2" } as const;
const GRAVITATIONAL_CONSTANT = { symbol: "m^3/(kg*s^2)", dimension: "L^3/M*T^2" } as const;

export const NBODY_MODEL_CLASS: ModelClassSpec = {
  id: NBODY_MODEL_CLASS_ID,
  version: NBODY_MODEL_CLASS_VERSION,
  subjectNeutral: true,
  quantities: [
    { id: "gravitational_constant", kind: "parameter", unit: GRAVITATIONAL_CONSTANT },
    { id: "softening", kind: "parameter", unit: METRE },
  ],
  constraints: [{ id: "softening_positive", quantityId: "softening", kind: "positive" }],
  observables: [
    { id: "total_momentum", unit: MOMENTUM },
    { id: "total_kinetic_energy", unit: ENERGY },
    { id: "center_of_mass", unit: METRE },
  ],
  entities: [
    {
      id: "bodies",
      maxEntities: 64,
      quantities: [
        { id: "mass", kind: "parameter", unit: KILOGRAM },
        { id: "position", kind: "variable", unit: METRE, initial: 0 },
        { id: "velocity", kind: "variable", unit: METRE_PER_SECOND, initial: 0 },
      ],
      constraints: [{ id: "body_mass_positive", quantityId: "mass", kind: "positive" }],
    },
  ],
  timeModel: { kind: "fixed-step", defaultDt: 0.01, maxSteps: 1_000_000 },
  integrator: "euler",
};

export interface NBodyModel {
  gravitationalConstant: number;
  softening: number;
  dt: number;
  maxSteps: number;
}

export interface BodyState {
  id: string;
  mass: number;
  position: number;
  velocity: number;
}

export interface NBodyState {
  /** Explicit simulated time in seconds. */
  t: number;
  /** Number of steps executed so far. */
  step: number;
  bodies: BodyState[];
  /** Current accelerations, aligned with `bodies` by index. */
  accelerations: number[];
}

export interface BodyObservation {
  id: string;
  position: number;
  velocity: number;
  acceleration: number;
  net_force: number;
}

export interface NBodyObservation {
  step: number;
  t: number;
  observables: {
    total_momentum: number;
    total_kinetic_energy: number;
    center_of_mass: number;
  };
  bodies: BodyObservation[];
}

export interface RunOptions {
  steps?: number;
  dt?: number;
}

function spec(): ModelClassSpec {
  return NBODY_MODEL_CLASS;
}

function parameterValue(instance: ModelInstance, id: string): number {
  const quantity = spec().quantities.find((candidate) => candidate.id === id);
  if (!quantity) throw new Error(`unknown quantity "${id}"`);
  if (quantity.kind === "parameter") {
    const value = instance.parameters?.[id];
    if (value === undefined) throw new Error(`parameter "${id}" has no value`);
    return value;
  }
  const supplied = instance.variables?.[id] ?? instance.constants?.[id] ?? quantity.initial;
  if (supplied === undefined) throw new Error(`quantity "${id}" has no value`);
  return supplied;
}

function entityValue(record: EntityRecord, id: string): number {
  const supplied = record.variables?.[id] ?? record.parameters?.[id] ?? record.constants?.[id];
  if (supplied === undefined) throw new Error(`entity quantity "${id}" has no value`);
  return supplied;
}

function readBodies(instance: ModelInstance): BodyState[] {
  const records = instance.entities?.bodies;
  if (!records) {
    throw new Error('an n-body instance requires an "entities.bodies" collection');
  }
  return records.map((record) => ({
    id: record.id,
    mass: entityValue(record, "mass"),
    position: record.variables?.position ?? 0,
    velocity: record.variables?.velocity ?? 0,
  }));
}

/**
 * Validate an instance and derive the execution model. Throws with the
 * structured validation issues on failure.
 */
export function buildModel(instance: ModelInstance): NBodyModel {
  const result = validateModelInstance(instance, spec());
  if (!result.ok) {
    const detail = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`invalid n-body instance — ${detail}`);
  }
  const bodies = readBodies(instance);
  if (bodies.length === 0) {
    throw new Error("n-body execution requires at least one body");
  }
  const modelClass = spec();
  return {
    gravitationalConstant: parameterValue(instance, "gravitational_constant"),
    softening: parameterValue(instance, "softening"),
    dt: instance.dt ?? modelClass.timeModel.defaultDt,
    maxSteps: modelClass.timeModel.maxSteps,
  };
}

/**
 * Net acceleration on each body from pairwise softened gravitation.
 * Body `i` attracts toward body `j` with magnitude proportional to `m_j`, so a
 * body's own mass does not affect its acceleration.
 */
export function computeAccelerations(bodies: readonly BodyState[], model: NBodyModel): number[] {
  const { gravitationalConstant, softening } = model;
  const softeningSquared = softening * softening;
  const accelerations: number[] = [];
  for (let i = 0; i < bodies.length; i += 1) {
    let acceleration = 0;
    for (let j = 0; j < bodies.length; j += 1) {
      if (i === j) continue;
      const delta = bodies[j].position - bodies[i].position;
      const inverseDistance = 1 / Math.sqrt(delta * delta + softeningSquared);
      acceleration += gravitationalConstant * bodies[j].mass * delta * inverseDistance ** 3;
    }
    accelerations.push(acceleration);
  }
  return accelerations;
}

/** Initial state at t = 0. The instance must already have been validated. */
export function createState(instance: ModelInstance, model: NBodyModel): NBodyState {
  const bodies = readBodies(instance);
  return { t: 0, step: 0, bodies, accelerations: computeAccelerations(bodies, model) };
}

/** Semi-implicit (symplectic) Euler step. Pure: returns a new state. */
export function step(state: NBodyState, model: NBodyModel, dt: number): NBodyState {
  if (!Number.isFinite(dt) || dt <= 0) {
    throw new Error("dt must be a finite number greater than zero");
  }
  const accelerations = computeAccelerations(state.bodies, model);
  const bodies = state.bodies.map((body, index) => {
    const velocity = body.velocity + accelerations[index] * dt;
    return { ...body, velocity, position: body.position + velocity * dt };
  });
  return {
    t: state.t + dt,
    step: state.step + 1,
    bodies,
    accelerations: computeAccelerations(bodies, model),
  };
}

export function toObservables(
  state: NBodyState,
  _model: NBodyModel,
): NBodyObservation["observables"] {
  let totalMomentum = 0;
  let totalKineticEnergy = 0;
  let totalMass = 0;
  let weightedPosition = 0;
  for (const body of state.bodies) {
    totalMomentum += body.mass * body.velocity;
    totalKineticEnergy += 0.5 * body.mass * body.velocity ** 2;
    totalMass += body.mass;
    weightedPosition += body.mass * body.position;
  }
  return {
    total_momentum: totalMomentum,
    total_kinetic_energy: totalKineticEnergy,
    center_of_mass: totalMass === 0 ? 0 : weightedPosition / totalMass,
  };
}

export function toObservation(state: NBodyState, model: NBodyModel): NBodyObservation {
  return {
    step: state.step,
    t: state.t,
    observables: toObservables(state, model),
    bodies: state.bodies.map((body, index) => {
      const acceleration = state.accelerations[index];
      return {
        id: body.id,
        position: body.position,
        velocity: body.velocity,
        acceleration,
        net_force: body.mass * acceleration,
      };
    }),
  };
}

/**
 * Execute a bounded number of deterministic steps via the generic fixed-step
 * contract. Returns the full trajectory including the t = 0 observation.
 */
export function run(instance: ModelInstance, options: RunOptions = {}): NBodyObservation[] {
  const model = buildModel(instance);
  const schedule = resolveFixedStepSchedule(spec().timeModel, {
    steps: options.steps ?? instance.steps,
    dt: options.dt ?? instance.dt ?? model.dt,
  });
  const initial = createState(instance, model);
  const states = executeFixedStep({
    state: initial,
    schedule,
    advance: (state, context) => step(state, model, context.dt),
  });
  return states.map((state) => toObservation(state, model));
}
