/**
 * LabDefinition and LabCatalog contracts for the Virtual Lab architecture.
 *
 * A LabDefinition is a composition layer: it references knowledge concepts,
 * a model class, a pedagogy, and an experiment by id — never by value. This
 * keeps each layer independent and independently testable.
 *
 * A LabCatalog is the aggregate "library" that holds all referenced objects.
 * The LabDefinition validator resolves references against the catalog and
 * rejects unresolvable or mismatched references.
 *
 * This module is pure and deterministic. No `eval`, no wall clock, no
 * randomness.
 */
import type { KnowledgeConcept } from "./knowledge";
import type { ModelClassSpec } from "./model-class";
import type { PedagogicalSpec } from "./pedagogy";
import type { ExperimentDefinition } from "./experiment";
import type { ValidationResult, ValidationIssue } from "./validation";
import { isRecord } from "./guards";

export interface LabDefinition {
  /** snake_case identifier. */
  id: string;
  /** Semantic version. */
  version: string;
  /** Ordered references to knowledge concept ids. */
  knowledgeConceptIds: string[];
  /** Reference to a model class id (resolved from catalog). */
  modelClassId: string;
  /** Reference to a pedagogical spec id (resolved from catalog). */
  pedagogyId: string;
  /** Reference to an experiment definition id (resolved from catalog). */
  experimentId: string;
  /** Free-form learning objectives for this lab. */
  learningObjectives: string[];
  /** Declarative control metadata (free-form). */
  controls: Record<string, unknown>;
  /** Free-form hypotheses the learner may test. */
  hypotheses: string[];
  /** Rendering hints — mode must be one of the five known renderers. */
  renderingHints: { mode: "2d" | "3d" | "graph" | "table" | "instrument" };
}

export const RENDERING_MODES = ["2d", "3d", "graph", "table", "instrument"] as const;

export interface LabCatalog {
  modelClasses: readonly ModelClassSpec[];
  knowledgeConcepts: readonly KnowledgeConcept[];
  pedagogicalSpecs: readonly PedagogicalSpec[];
  experiments: readonly ExperimentDefinition[];
  labs: readonly LabDefinition[];
}

const ID_RE = /^[a-z][a-z0-9_]*$/;

function reject(path: string, message: string): ValidationIssue {
  return { path, message };
}

/**
 * Deterministically validate a LabDefinition against a LabCatalog.
 * - Resolves all referenced ids (knowledgeConceptIds, modelClassId, pedagogyId,
 *   experimentId) against the catalog and rejects unresolvable refs.
 * - Validates that the referenced experiment's modelClassId matches the
 *   lab-definition's modelClassId.
 * - Validates renderingHints.mode is one of the five known modes.
 *
 * Returns structured issues rather than throwing. Pure and deterministic.
 */
export function validateLabDefinition(lab: unknown, catalog: LabCatalog): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isRecord(lab)) {
    return { ok: false, issues: [{ path: "", message: "lab definition must be an object" }] };
  }

  if (typeof lab.id !== "string" || !ID_RE.test(lab.id)) {
    issues.push(reject("id", "lab definition id must be snake_case"));
  }
  if (typeof lab.version !== "string" || lab.version.trim() === "") {
    issues.push(reject("version", "lab definition version must be a non-empty string"));
  }

  // --- Knowledge concept refs ---
  if (!Array.isArray(lab.knowledgeConceptIds)) {
    issues.push(reject("knowledgeConceptIds", "knowledgeConceptIds must be an array"));
  } else {
    const conceptIds = new Set(catalog.knowledgeConcepts.map((c) => c.id));
    lab.knowledgeConceptIds.forEach((ref: unknown, index: number) => {
      if (typeof ref !== "string") {
        issues.push(reject(`knowledgeConceptIds[${index}]`, "must be a string"));
      } else if (!conceptIds.has(ref)) {
        issues.push(
          reject(`knowledgeConceptIds[${index}]`, `unresolvable knowledge concept id "${ref}"`),
        );
      }
    });
  }

  // --- Model class ref ---
  if (typeof lab.modelClassId !== "string" || !ID_RE.test(lab.modelClassId)) {
    issues.push(reject("modelClassId", "modelClassId must be a snake_case identifier"));
  } else {
    const modelClass = catalog.modelClasses.find((m) => m.id === lab.modelClassId);
    if (!modelClass) {
      issues.push(reject("modelClassId", `unresolvable model class id "${lab.modelClassId}"`));
    }
  }

  // --- Pedagogy ref ---
  if (typeof lab.pedagogyId !== "string" || !ID_RE.test(lab.pedagogyId)) {
    issues.push(reject("pedagogyId", "pedagogyId must be a snake_case identifier"));
  } else {
    const pedagogy = catalog.pedagogicalSpecs.find((p) => p.id === lab.pedagogyId);
    if (!pedagogy) {
      issues.push(reject("pedagogyId", `unresolvable pedagogy id "${lab.pedagogyId}"`));
    }
  }

  // --- Experiment ref ---
  if (typeof lab.experimentId !== "string" || !ID_RE.test(lab.experimentId)) {
    issues.push(reject("experimentId", "experimentId must be a snake_case identifier"));
  } else {
    const experiment = catalog.experiments.find((e) => e.id === lab.experimentId);
    if (!experiment) {
      issues.push(reject("experimentId", `unresolvable experiment id "${lab.experimentId}"`));
    } else if (
      typeof lab.modelClassId === "string" &&
      experiment.modelClassId !== lab.modelClassId
    ) {
      issues.push(
        reject(
          "experimentId",
          `experiment modelClassId ("${experiment.modelClassId}") does not match lab modelClassId ("${lab.modelClassId}")`,
        ),
      );
    }
  }

  // --- Declarative metadata ---
  if (!Array.isArray(lab.learningObjectives)) {
    issues.push(reject("learningObjectives", "learningObjectives must be an array"));
  }
  if (!isRecord(lab.controls)) {
    issues.push(reject("controls", "controls must be an object"));
  }
  if (!Array.isArray(lab.hypotheses)) {
    issues.push(reject("hypotheses", "hypotheses must be an array"));
  }

  // --- Rendering hints ---
  if (!isRecord(lab.renderingHints)) {
    issues.push(reject("renderingHints", "renderingHints must be an object"));
  } else {
    if (
      typeof lab.renderingHints.mode !== "string" ||
      !(RENDERING_MODES as readonly string[]).includes(lab.renderingHints.mode)
    ) {
      issues.push(
        reject(
          "renderingHints.mode",
          `renderingHints.mode must be one of ${RENDERING_MODES.join(", ")}`,
        ),
      );
    }
  }

  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}
