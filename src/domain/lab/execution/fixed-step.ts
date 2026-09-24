/**
 * Generic fixed-step execution contract.
 *
 * Domain-agnostic scheduling for any pure state transition over a bounded
 * number of explicit, fixed steps. No wall clock, randomness, `eval`, or
 * `new Function` is used: time is derived deterministically from the step index
 * and the step size.
 *
 * A model class supplies its `TimeModelSpec`; an engine supplies a pure
 * `advance`. This keeps execution semantics (bounds, time accounting) separate
 * from domain physics, so additional model classes reuse it unchanged.
 */
import type { TimeModelSpec } from "../model-class";

export interface FixedStepSchedule {
  /** Number of steps to execute. */
  steps: number;
  /** Step size in the model class's time unit. */
  dt: number;
  /** Hard upper bound on `steps`, from the model class `timeModel`. */
  maxSteps: number;
}

/** Deterministic context for the step that is about to be executed. */
export interface StepContext {
  /** 1-based index of the step about to be executed. */
  step: number;
  /** Simulated time at the start of the step. */
  t: number;
  /** Step size. */
  dt: number;
}

export interface FixedStepExecution<TState> {
  /** Initial state at step 0. */
  state: TState;
  schedule: FixedStepSchedule;
  /** Pure transition. Must return a new state and never mutate its input. */
  advance(state: TState, context: StepContext): TState;
}

/** Derive a validated schedule from a model class time model and options. */
export function resolveFixedStepSchedule(
  timeModel: TimeModelSpec,
  options: { steps?: number; dt?: number } = {},
): FixedStepSchedule {
  const steps = options.steps;
  const dt = options.dt ?? timeModel.defaultDt;
  if (steps === undefined || !Number.isInteger(steps) || steps < 0 || steps > timeModel.maxSteps) {
    throw new Error(`steps must be an integer between 0 and ${timeModel.maxSteps}`);
  }
  if (!Number.isFinite(dt) || dt <= 0) {
    throw new Error("dt must be a finite number greater than zero");
  }
  return { steps, dt, maxSteps: timeModel.maxSteps };
}

function assertSchedule(schedule: FixedStepSchedule): void {
  if (!Number.isInteger(schedule.steps) || schedule.steps < 0) {
    throw new Error("steps must be a non-negative integer");
  }
  if (schedule.steps > schedule.maxSteps) {
    throw new Error(`steps must not exceed maxSteps (${schedule.maxSteps})`);
  }
  if (!Number.isFinite(schedule.dt) || schedule.dt <= 0) {
    throw new Error("dt must be a finite number greater than zero");
  }
}

/**
 * Execute a bounded number of fixed steps. Returns the full state history,
 * including the initial state at index 0, so `history.length === steps + 1`.
 */
export function executeFixedStep<TState>(execution: FixedStepExecution<TState>): TState[] {
  assertSchedule(execution.schedule);
  const { steps, dt } = execution.schedule;
  let state = execution.state;
  const history: TState[] = [state];
  for (let index = 0; index < steps; index += 1) {
    state = execution.advance(state, { step: index + 1, t: index * dt, dt });
    history.push(state);
  }
  return history;
}
