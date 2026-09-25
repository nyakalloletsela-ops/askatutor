/**
 * Experiment contracts for the Virtual Lab architecture.
 *
 * An ExperimentDefinition provides the concrete inputs an execution engine
 * needs: variable overrides, parameters, entity allocations, step/dt budget,
 * and declarative control + observation metadata. It reuses the same shape as
 * ModelInstance (and therefore the same validation logic) for the runtime
 * fields; no model duplication.
 *
 * This module is pure and deterministic. No `eval`, no wall clock, no
 * randomness.
 */
import type { EntityRecord, ModelClassSpec } from "./model-class";
import { validateModelInstance, type ValidationResult, type ValidationIssue } from "./validation";
import { isRecord } from "./guards";

export interface ExperimentDefinition {
  /** snake_case identifier, unique within a lab catalog. */
  id: string;
  /** Declarative control metadata (free-form; not interpreted at runtime). */
  controls: Record<string, unknown>;
  /** Observable ids to request from the engine after execution. */
  requestedObservations: string[];
  /** Declarative measurement metadata (free-form; not interpreted at runtime). */
  measurements: Record<string, unknown>;
  /** Runtime inputs — same shape as ModelInstance fields. */
  modelClassId: string;
  modelClassVersion?: string;
  variables?: Record<string, number>;
  parameters: Record<string, number>;
  constants?: Record<string, number>;
  entities?: Record<string, EntityRecord[]>;
  steps: number;
  dt?: number;
}

const ID_RE = /^[a-z][a-z0-9_]*$/;

/**
 * Deterministically validate an ExperimentDefinition against a given
 * ModelClassSpec. The runtime fields (modelClassId, variables, parameters,
 * constants, entities, steps, dt) are validated via `validateModelInstance`.
 * The declarative fields (controls, requestedObservations, measurements) are
 * validated structurally here.
 *
 * Returns structured issues rather than throwing. Pure and deterministic.
 */
export function validateExperimentDefinition(
  experiment: unknown,
  spec: ModelClassSpec,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isRecord(experiment)) {
    return {
      ok: false,
      issues: [{ path: "", message: "experiment definition must be an object" }],
    };
  }

  if (typeof experiment.id !== "string" || !ID_RE.test(experiment.id)) {
    issues.push({ path: "id", message: "experiment definition id must be snake_case" });
  }

  if (!isRecord(experiment.controls)) {
    issues.push({ path: "controls", message: "controls must be an object" });
  }
  if (!Array.isArray(experiment.requestedObservations)) {
    issues.push({
      path: "requestedObservations",
      message: "requestedObservations must be an array",
    });
  } else {
    experiment.requestedObservations.forEach((obs: unknown, index: number) => {
      if (typeof obs !== "string" || !ID_RE.test(obs)) {
        issues.push({
          path: `requestedObservations[${index}]`,
          message: "requested observation id must be snake_case",
        });
      }
    });
  }
  if (!isRecord(experiment.measurements)) {
    issues.push({ path: "measurements", message: "measurements must be an object" });
  }

  // Delegate runtime-field validation to the same path that ModelInstance uses.
  const instanceValidation = validateModelInstance(experiment, spec);
  if (!instanceValidation.ok) {
    for (const issue of instanceValidation.issues) {
      issues.push(issue);
    }
  }

  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}
