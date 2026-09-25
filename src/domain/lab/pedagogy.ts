/**
 * Pedagogical contracts for the Virtual Lab architecture.
 *
 * A PedagogicalSpec is a level-specific teaching configuration: objectives,
 * scaffolding strategy, allowed controls, assessment intent. It deliberately
 * does NOT reference a model class, engine, or knowledge concept — those
 * connections are declared by the LabDefinition, which composes by reference.
 *
 * This module is pure and deterministic. No `eval`, no wall clock, no
 * randomness. Config only; no engine references.
 */
import type { ValidationResult, ValidationIssue } from "./validation";
import { isRecord } from "./guards";

export type Level = "primary" | "secondary" | "tertiary" | "advanced";

export const ALLOWED_LEVELS: readonly Level[] = ["primary", "secondary", "tertiary", "advanced"];

export interface PedagogicalSpec {
  /** snake_case identifier, unique within a lab catalog. */
  id: string;
  /** The learner level this pedagogy targets. Strict union. */
  level: Level;
  /** Learning objectives stated as plain strings. */
  objectives: string[];
  /** Free-form scaffolding instructions for the AI / rendering layer. */
  scaffolding: string;
  /** Domain terminology to use when presenting this level. */
  terminology: string;
  /**
   * Declarative names of controls the learner may use at this level.
   * These are free-form strings; they are cross-validated against a model
   * class only at the LabDefinition level.
   */
  allowedControls: string[];
  /**
   * Free-form instructions for how measurements / observations should be
   * explained at this level.
   */
  measurementInstructions: string;
  /**
   * Free-form description of what the assessment should test at this level.
   */
  assessmentIntent: string;
}

const ID_RE = /^[a-z][a-z0-9_]*$/;

function reject(path: string, message: string): ValidationIssue {
  return { path, message };
}

/**
 * Deterministically validate a PedagogicalSpec. The level must be one of the
 * four strict-union values. No cross-references are validated here — that is
 * the responsibility of the LabDefinition validator.
 */
export function validatePedagogicalSpec(spec: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isRecord(spec)) {
    return { ok: false, issues: [{ path: "", message: "pedagogical spec must be an object" }] };
  }

  if (typeof spec.id !== "string" || !ID_RE.test(spec.id)) {
    issues.push(reject("id", "pedagogical spec id must be snake_case"));
  }
  if (
    typeof spec.level !== "string" ||
    !(ALLOWED_LEVELS as readonly string[]).includes(spec.level)
  ) {
    issues.push(
      reject(
        "level",
        `pedagogy level must be one of ${ALLOWED_LEVELS.join(", ")} (got "${String(spec.level)}")`,
      ),
    );
  }
  if (!Array.isArray(spec.objectives) || spec.objectives.length === 0) {
    issues.push(reject("objectives", "objectives must be a non-empty array"));
  } else {
    spec.objectives.forEach((item: unknown, index: number) => {
      if (typeof item !== "string" || (item as string).trim() === "") {
        issues.push(reject(`objectives[${index}]`, "each objective must be a non-empty string"));
      }
    });
  }
  if (typeof spec.scaffolding !== "string" || spec.scaffolding.trim() === "") {
    issues.push(reject("scaffolding", "scaffolding must be a non-empty string"));
  }
  if (typeof spec.terminology !== "string" || spec.terminology.trim() === "") {
    issues.push(reject("terminology", "terminology must be a non-empty string"));
  }
  if (!Array.isArray(spec.allowedControls)) {
    issues.push(reject("allowedControls", "allowedControls must be an array of strings"));
  }
  if (
    typeof spec.measurementInstructions !== "string" ||
    spec.measurementInstructions.trim() === ""
  ) {
    issues.push(
      reject("measurementInstructions", "measurementInstructions must be a non-empty string"),
    );
  }
  if (typeof spec.assessmentIntent !== "string" || spec.assessmentIntent.trim() === "") {
    issues.push(reject("assessmentIntent", "assessmentIntent must be a non-empty string"));
  }

  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}
