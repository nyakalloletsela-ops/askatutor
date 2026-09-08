/**
 * Learning lifecycle boundaries — interface-only. These are the Domain-facing
 * seams the learning engine will implement (Diagnosis → Intervention →
 * Evidence → Mastery → Decision). No algorithms are implemented here; the
 * rest of the Application depends only on these shapes once Domain logic lands.
 */
export type LearningStage = "diagnosis" | "intervention" | "evidence" | "mastery" | "decision";

export interface LearningStageEvidence {
  id?: string;
  stage: LearningStage;
  studentId: string;
  sessionId?: string | null;
  occurredAt: string;
  payload: unknown;
}

export interface LearningRecordRepository {
  recordEvidence(evidence: LearningStageEvidence): Promise<void>;
  listStageEvidence(studentId: string, stage: LearningStage): Promise<LearningStageEvidence[]>;
}