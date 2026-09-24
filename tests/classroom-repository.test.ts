import { describe, expect, test } from "bun:test";
import { SupabaseClassroomRepository } from "../src/infrastructure/repositories/classroom-repository";
import type { UserDataClient } from "../src/infrastructure/repositories/helpers";
import type { JsonValue } from "../src/domain/ports/json";

function setup(
  options: {
    boardId?: string | null;
    ensureError?: { message: string } | null;
    snapshot?: unknown;
    snapshotError?: { message: string } | null;
    insertError?: { message: string } | null;
  } = {},
) {
  const calls: { type: string; name: string; args?: Record<string, unknown> }[] = [];
  const query = {
    select(name: string) {
      calls.push({ type: "select", name });
      return query;
    },
    eq(name: string, value: unknown) {
      calls.push({ type: "eq", name, args: { value } });
      return query;
    },
    order(name: string, args: Record<string, unknown>) {
      calls.push({ type: "order", name, args });
      return query;
    },
    limit(value: number) {
      calls.push({ type: "limit", name: "limit", args: { value } });
      return query;
    },
    async maybeSingle() {
      return {
        data: options.snapshot ?? null,
        error: options.snapshotError ?? null,
      };
    },
  };
  const client = {
    async rpc(name: string, args: Record<string, unknown>) {
      calls.push({ type: "rpc", name, args });
      return {
        data: options.boardId === undefined ? "whiteboard-id" : options.boardId,
        error: options.ensureError ?? null,
      };
    },
    from(table: string) {
      calls.push({ type: "from", name: table });
      return {
        select: () => query.select("snapshot_data, created_at"),
        async insert(row: Record<string, unknown>) {
          calls.push({ type: "insert", name: table, args: row });
          return { error: options.insertError ?? null };
        },
      };
    },
  } as unknown as UserDataClient;

  return { repository: new SupabaseClassroomRepository(client), calls };
}

describe("SupabaseClassroomRepository whiteboard persistence", () => {
  test("loads the most recent saved snapshot", async () => {
    const snapshot = { snapshot_data: { shapes: [] }, created_at: "2026-09-23T00:00:00Z" };
    const { repository, calls } = setup({ snapshot });
    await expect(repository.loadWhiteboard("room-1")).resolves.toEqual(snapshot);
    expect(calls[0]).toEqual({
      type: "rpc",
      name: "ensure_whiteboard",
      args: { _room_id: "room-1" },
    });
  });

  test("propagates whiteboard authorization/setup errors on load", async () => {
    const { repository } = setup({ ensureError: { message: "Not authorized" } });
    await expect(repository.loadWhiteboard("room-private")).rejects.toThrow("Not authorized");
  });

  test("propagates snapshot read errors instead of treating them as an empty board", async () => {
    const { repository } = setup({ snapshotError: { message: "snapshot query failed" } });
    await expect(repository.loadWhiteboard("room-1")).rejects.toThrow("snapshot query failed");
  });

  test("propagates whiteboard authorization/setup errors on save", async () => {
    const { repository } = setup({ ensureError: { message: "Not authorized" } });
    await expect(repository.saveWhiteboard("room-private", {})).rejects.toThrow("Not authorized");
  });

  test("propagates snapshot insert errors", async () => {
    const { repository } = setup({ insertError: { message: "snapshot insert failed" } });
    await expect(repository.saveWhiteboard("room-1", { shapes: [] } as JsonValue)).rejects.toThrow(
      "snapshot insert failed",
    );
  });
});
