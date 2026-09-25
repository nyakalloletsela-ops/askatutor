import { describe, expect, test } from "bun:test";
import { SupabaseSimulationRepository } from "../src/infrastructure/repositories/simulation-repository";
import type { UserDataClient } from "../src/infrastructure/repositories/helpers";
import type { SaveSimulationInput } from "../src/domain/ports/simulation-repository";

const input: SaveSimulationInput = {
  requestId: "00000000-0000-4000-8000-000000000003",
  prompt: "Explain forces",
  subject: "Physics",
  title: "Forces",
  schema: { subject: "Physics", title: "Forces" },
  embedding: null,
  thumbnailUrl: null,
  tags: ["mechanics"],
};

function setup(response: { data: unknown; error: { message: string } | null }) {
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  const client = {
    rpc(name: string, args: Record<string, unknown>) {
      calls.push({ name, args });
      return { single: async () => response };
    },
  } as unknown as UserDataClient;
  return { repository: new SupabaseSimulationRepository(client), calls };
}

describe("SupabaseSimulationRepository.save", () => {
  test("uses the atomic owner-derived simulation and initial-version RPC", async () => {
    const row = {
      id: "00000000-0000-4000-8000-000000000002",
      prompt: input.prompt,
      subject: input.subject,
      title: input.title,
      schema_json: input.schema,
      thumbnail_url: null,
      created_at: "2026-09-23T00:00:00.000Z",
      tags: input.tags,
    };
    const { repository, calls } = setup({ data: row, error: null });

    await expect(repository.save(input)).resolves.toEqual(row);
    expect(calls).toEqual([
      {
        name: "save_simulation_with_initial_version",
        args: {
          _save_request_id: input.requestId,
          _prompt: input.prompt,
          _subject: input.subject,
          _title: input.title,
          _schema_json: input.schema,
          _embedding: null,
          _thumbnail_url: null,
          _tags: input.tags,
        },
      },
    ]);
  });

  test("propagates persistence errors instead of reporting a partial save as successful", async () => {
    const { repository } = setup({ data: null, error: { message: "version insert denied" } });
    await expect(repository.save(input)).rejects.toThrow("version insert denied");
  });
});
