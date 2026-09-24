/**
 * Reference engine: 1-D mechanics (Newton's second law).
 *
 * This is a deliberately small, pure reference implementation of the Model-Class
 * contract. It is renderer-independent, subject-neutral, and deterministic:
 * time is an explicit accumulator and no wall clock, randomness, `eval`, or
 * `new Function` is used anywhere.
 *
 * It is intended as the first of several model classes, not as the permanent
 * architecture. Additional STEM and quantitative model classes live beside it
 * and share the same contract.
 */
import type { ModelClassSpec, ModelInstance } from "../model-class";
import { validateModelInstance } from "../validation";

export const ENGINE_VERSION = "1.0.0";
export const NEWTON_2_MODEL_CLASS_ID = "physics.mechanics.1d.newton2";
export const NEWTON_2_MODEL_CLASS_VERSION = "1.0.0";

const METRE = { symbol: "m", dimension: "L" } as const;
const METRE_PER_SECOND = { symbol: "m/s", dimension: "L/T" } as const;
const METRE_PER_SECOND_SQUARED = { symbol: "m/s^2", dimension: "L/T^2" } as const;
const KILOGRAM = { symbol: "kg", dimension: "M" } as const;
const NEWTON = { symbol: "N", dimension: "M*L/T^2" } as const;

export const NEWTON_2_MODEL_CLASS: ModelClassSpec = {
  id: NEWTON_2_MODEL_CLASS_ID,
  version: NEWTON_2_MODEL_CLASS_VERSION,
  subjectNeutral: true,
  quantities: [
    { id: "position", kind: "variable", unit: METRE, initial: 0 },
    { id: "velocity", kind: "variable", unit: METRE_PER_SECOND, initial: 0 },
    { id: "acceleration", kind: "variable", unit: METRE_PER_SECOND_SQUARED, initial: 0 },
    { id: "mass", kind: "parameter", unit: KILOGRAM },
    { id: "force", kind: "parameter", unit: NEWTON },
  ],
  constraints: [{ id: "mass_positive", quantityId: "mass", kind: "positive" }],
  observables: [
    { id: "position", unit: METRE },
    { id: "velocity", unit: METRE_PER_SECOND },
    { id: "acceleration", unit: METRE_PER_SECOND_SQUARED },
    { id: "net_force", unit: NEWTON },
  ],
  timeModel: { kind: "fixed-step", defaultDt: 0.01, maxSteps: 1_000_000 },
  integrator: "euler",
};

export interface MechanicsModel {
  mass: number;
  force: number;
  dt: number;
  maxSteps: number;
}

export interface MechanicsState {
  /** Explicit simulated time in seconds. */
  t: number;
  /** Number of steps executed so far. */
  step: number;
  position: number;
  velocity: number;
  acceleration: number;
}

export interface Observation {
  step: number;
  t: number;
  observables: {
    position: number;
    velocity: number;
    acceleration: number;
    net_force: number;
  };
}

export interface RunOptions {
  steps?: number;
  dt?: number;
}

function spec(): ModelClassSpec {
  return NEWTON_2_MODEL_CLASS;
}

function quantityValue(instance: ModelInstance, id: string): number {
  const quantity = spec().quantities.find((candidate) => candidate.id === id);
  if (!quantity) throw new Error(`unknown quantity "${id}"`);
  if (quantity.kind === "variable") {
    const supplied = instance.variables?.[id];
    if (supplied !== undefined) return supplied;
    if (quantity.initial !== undefined) return quantity.initial;
    throw new Error(`variable "${id}" has no value`);
  }
  if (quantity.kind === "parameter") return instance.parameters[id];
  const constant = instance.constants?.[id];
  if (constant === undefined) throw new Error(`constant "${id}" has no value`);
  return constant;
}

/**
 * Validate an instance against the 1-D mechanics model class and derive the
 * execution model. Throws with the structured validation issues on failure.
 */
export function buildModel(instance: ModelInstance): MechanicsModel {
  const result = validateModelInstance(instance, spec());
  if (!result.ok) {
    const detail = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`invalid 1-D mechanics instance — ${detail}`);
  }
  const modelClass = spec();
  return {
    mass: quantityValue(instance, "mass"),
    force: quantityValue(instance, "force"),
    dt: instance.dt ?? modelClass.timeModel.defaultDt,
    maxSteps: modelClass.timeModel.maxSteps,
  };
}

/** Initial state at t = 0. The instance must already have been validated. */
export function createState(instance: ModelInstance, model: MechanicsModel): MechanicsState {
  return {
    t: 0,
    step: 0,
    position: quantityValue(instance, "position"),
    velocity: quantityValue(instance, "velocity"),
    acceleration: model.force / model.mass,
  };
}

/** Semi-implicit (symplectic) Euler step. Pure: returns a new state. */
export function step(state: MechanicsState, model: MechanicsModel, dt: number): MechanicsState {
  const acceleration = model.force / model.mass;
  const velocity = state.velocity + acceleration * dt;
  const position = state.position + velocity * dt;
  return {
    t: state.t + dt,
    step: state.step + 1,
    position,
    velocity,
    acceleration,
  };
}

export function toObservables(
  state: MechanicsState,
  model: MechanicsModel,
): Observation["observables"] {
  return {
    position: state.position,
    velocity: state.velocity,
    acceleration: state.acceleration,
    net_force: model.mass * state.acceleration,
  };
}

export function toObservation(state: MechanicsState, model: MechanicsModel): Observation {
  return { step: state.step, t: state.t, observables: toObservables(state, model) };
}

/**
 * Execute a fixed number of deterministic steps. Returns the full trajectory
 * including the t = 0 initial observation.
 */
export function run(instance: ModelInstance, options: RunOptions = {}): Observation[] {
  const model = buildModel(instance);
  const dt = options.dt ?? model.dt;
  if (!Number.isFinite(dt) || dt <= 0) {
    throw new Error("dt must be a finite number greater than zero");
  }
  const steps = options.steps ?? instance.steps;
  if (!Number.isInteger(steps) || steps < 0 || steps > model.maxSteps) {
    throw new Error(`steps must be an integer between 0 and ${model.maxSteps}`);
  }

  let state = createState(instance, model);
  const history: Observation[] = [toObservation(state, model)];
  for (let index = 0; index < steps; index += 1) {
    state = step(state, model, dt);
    history.push(toObservation(state, model));
  }
  return history;
}
