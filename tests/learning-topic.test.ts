import { describe, expect, test } from "bun:test";
import {
  validateTopicGraph,
  type Topic,
  type TopicPrerequisite,
} from "../src/domain/learning/topic";

const topics: Topic[] = [
  { id: "fractions", subjectId: "math", name: "Fractions", kind: "concept" },
  { id: "add-fractions", subjectId: "math", name: "Add fractions", kind: "skill" },
  { id: "word-problems", subjectId: "math", name: "Fraction word problems", kind: "skill" },
];

describe("validateTopicGraph", () => {
  test("accepts a valid graph with required and recommended edges", () => {
    const edges: TopicPrerequisite[] = [
      { topicId: "add-fractions", prerequisiteTopicId: "fractions", kind: "required" },
      { topicId: "word-problems", prerequisiteTopicId: "add-fractions", kind: "recommended" },
    ];
    expect(validateTopicGraph(topics, edges)).toEqual({ ok: true });
  });

  test("rejects blank topic identity and duplicate topic ids", () => {
    const result = validateTopicGraph(
      [...topics, { id: "fractions", subjectId: "", name: " ", kind: "concept" }],
      [],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.code)).toContain("invalid_topic");
      expect(result.issues.map((issue) => issue.code)).toContain("duplicate_topic");
    }
  });

  test("rejects unknown endpoints, self edges, and duplicate edges", () => {
    const result = validateTopicGraph(topics, [
      { topicId: "fractions", prerequisiteTopicId: "fractions", kind: "required" },
      { topicId: "missing", prerequisiteTopicId: "fractions", kind: "required" },
      { topicId: "add-fractions", prerequisiteTopicId: "fractions", kind: "required" },
      { topicId: "add-fractions", prerequisiteTopicId: "fractions", kind: "recommended" },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.code)).toContain("invalid_edge");
      expect(result.issues.map((issue) => issue.code)).toContain("duplicate_edge");
    }
  });

  test("rejects indirect cycles, including cycles with recommended edges", () => {
    const indirect = validateTopicGraph(topics, [
      { topicId: "fractions", prerequisiteTopicId: "word-problems", kind: "recommended" },
      { topicId: "word-problems", prerequisiteTopicId: "add-fractions", kind: "required" },
      { topicId: "add-fractions", prerequisiteTopicId: "fractions", kind: "required" },
    ]);
    expect(indirect.ok).toBe(false);
    if (!indirect.ok) expect(indirect.issues[0]?.code).toBe("cycle");
  });

  test("validates deep prerequisite chains without recursive traversal", () => {
    const deepTopics = Array.from({ length: 12_000 }, (_, index) => ({
      id: `topic-${index}`,
      subjectId: "math",
      name: `Topic ${index}`,
      kind: "concept" as const,
    }));
    const deepEdges = deepTopics.slice(1).map((topic, index) => ({
      topicId: topic.id,
      prerequisiteTopicId: deepTopics[index].id,
      kind: "required" as const,
    }));
    expect(validateTopicGraph(deepTopics, deepEdges)).toEqual({ ok: true });
  });
});
