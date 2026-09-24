/**
 * Stable learning-topic identity and prerequisite graph primitives.
 *
 * A topic is the common node for concepts and skills. This module intentionally
 * contains no assessment, mastery, curriculum-level, or entitlement rules.
 */
export type TopicKind = "concept" | "skill";
export type PrerequisiteKind = "required" | "recommended";

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  kind: TopicKind;
}

export interface TopicPrerequisite {
  /** The topic whose entry is gated or informed by the prerequisite. */
  topicId: string;
  /** The topic that must or should be considered first. */
  prerequisiteTopicId: string;
  kind: PrerequisiteKind;
}

export interface TopicGraphIssue {
  path: string;
  code: "invalid_topic" | "duplicate_topic" | "invalid_edge" | "duplicate_edge" | "cycle";
  message: string;
}

export type TopicGraphValidation = { ok: true } | { ok: false; issues: TopicGraphIssue[] };

/**
 * Validate topic identity and prerequisite references, including cycles.
 * All prerequisite kinds participate in DAG validation: a recommended edge
 * may inform sequence but must not create an impossible curriculum graph.
 */
export function validateTopicGraph(
  topics: readonly Topic[],
  edges: readonly TopicPrerequisite[],
): TopicGraphValidation {
  const issues: TopicGraphIssue[] = [];
  const topicIds = new Set<string>();

  topics.forEach((topic, index) => {
    const path = `topics[${index}]`;
    if (!topic.id.trim() || !topic.subjectId.trim() || !topic.name.trim()) {
      issues.push({
        path,
        code: "invalid_topic",
        message: "topic id, subjectId, and name must be non-empty",
      });
    }
    if (topicIds.has(topic.id)) {
      issues.push({
        path: `${path}.id`,
        code: "duplicate_topic",
        message: "topic id must be unique",
      });
    }
    topicIds.add(topic.id);
    if (topic.kind !== "concept" && topic.kind !== "skill") {
      issues.push({
        path: `${path}.kind`,
        code: "invalid_topic",
        message: "topic kind must be concept or skill",
      });
    }
  });

  const edgeKeys = new Set<string>();
  const prerequisiteCount = new Map(topics.map(({ id }) => [id, 0]));
  const dependentsByPrerequisite = new Map<string, string[]>();
  edges.forEach((edge, index) => {
    const path = `prerequisites[${index}]`;
    if (
      !topicIds.has(edge.topicId) ||
      !topicIds.has(edge.prerequisiteTopicId) ||
      edge.topicId === edge.prerequisiteTopicId ||
      (edge.kind !== "required" && edge.kind !== "recommended")
    ) {
      issues.push({
        path,
        code: "invalid_edge",
        message:
          "prerequisite edge must reference two distinct known topics and have a supported kind",
      });
      return;
    }

    const key = `${edge.topicId}\u0000${edge.prerequisiteTopicId}`;
    if (edgeKeys.has(key)) {
      issues.push({
        path,
        code: "duplicate_edge",
        message: "a topic may have only one edge to a given prerequisite",
      });
      return;
    }
    edgeKeys.add(key);
    prerequisiteCount.set(edge.topicId, (prerequisiteCount.get(edge.topicId) ?? 0) + 1);
    const dependents = dependentsByPrerequisite.get(edge.prerequisiteTopicId) ?? [];
    dependents.push(edge.topicId);
    dependentsByPrerequisite.set(edge.prerequisiteTopicId, dependents);
  });

  if (issues.length > 0) return { ok: false, issues };

  // Kahn's algorithm detects cycles without recursion-depth limits.
  const ready = topics
    .map(({ id }) => id)
    .filter((topicId) => prerequisiteCount.get(topicId) === 0);
  let visitedCount = 0;
  for (let index = 0; index < ready.length; index += 1) {
    const topicId = ready[index];
    visitedCount += 1;
    for (const dependentId of dependentsByPrerequisite.get(topicId) ?? []) {
      const remaining = (prerequisiteCount.get(dependentId) ?? 0) - 1;
      prerequisiteCount.set(dependentId, remaining);
      if (remaining === 0) ready.push(dependentId);
    }
  }

  if (visitedCount !== topics.length) {
    return {
      ok: false,
      issues: [
        {
          path: "prerequisites",
          code: "cycle",
          message: "topic prerequisite relationships must be acyclic",
        },
      ],
    };
  }

  return { ok: true };
}
