/**
 * Knowledge contracts for the Virtual Lab architecture.
 *
 * Knowledge concepts are a minimal, subject-neutral taxonomy layer. They
 * declare concepts by id with free-form metadata and explicit prerequisite /
 * related-concept references, but carry no executable logic. Knowledge
 * concepts do NOT reference model classes, engines, or pedagogies: those
 * connections are declared by the LabDefinition.
 *
 * This module is pure and deterministic. No `eval`, no wall clock, no
 * randomness. Zero executable code.
 */
import type { ValidationResult, ValidationIssue } from "./validation";
import { isRecord } from "./guards";

export interface KnowledgeConcept {
  /** snake_case identifier, unique within a lab catalog. */
  id: string;
  /** Human-readable title for this concept. */
  title: string;
  /** Plain-text or markdown description. */
  description: string;
  /**
   * Free-form domain label (e.g. "physics", "chemistry", "economics"). This is
   * a taxonomy tag, NOT an engine binding or subject-specific claim. It does
   * not route to a particular engine or renderer.
   */
  domain: string;
  /** Optional ids of concepts that must be mastered first. */
  prerequisites?: string[];
  /** Optional ids of related concepts for navigation/discovery. */
  relatedConcepts?: string[];
}

const ID_RE = /^[a-z][a-z0-9_]*$/;

function reject(path: string, message: string): ValidationIssue {
  return { path, message };
}

/**
 * Deterministically validate a knowledge concept record. Returns structured
 * issues rather than throwing. Does NOT cross-reference against other concepts
 * — that is the responsibility of the LabDefinition / LabCatalog validator.
 */
export function validateKnowledgeConcept(concept: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isRecord(concept)) {
    return { ok: false, issues: [{ path: "", message: "knowledge concept must be an object" }] };
  }

  if (typeof concept.id !== "string" || !ID_RE.test(concept.id)) {
    issues.push(reject("id", "knowledge concept id must be snake_case"));
  }
  if (typeof concept.title !== "string" || concept.title.trim() === "") {
    issues.push(reject("title", "knowledge concept title must be a non-empty string"));
  }
  if (typeof concept.description !== "string" || concept.description.trim() === "") {
    issues.push(reject("description", "knowledge concept description must be a non-empty string"));
  }
  if (typeof concept.domain !== "string" || concept.domain.trim() === "") {
    issues.push(reject("domain", "knowledge concept domain must be a non-empty string"));
  }

  for (const field of ["prerequisites", "relatedConcepts"] as const) {
    const value = concept[field];
    if (value !== undefined) {
      if (!Array.isArray(value)) {
        issues.push(reject(field, `${field} must be an array of strings`));
      } else {
        value.forEach((item, index) => {
          if (typeof item !== "string" || !ID_RE.test(item)) {
            issues.push(reject(`${field}[${index}]`, `${field}[${index}] must be a snake_case id`));
          }
        });
      }
    }
  }

  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}
