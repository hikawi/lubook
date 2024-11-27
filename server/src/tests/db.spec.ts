import { afterAll, describe, expect, it } from "vitest";
import { db, disconnect } from "../db";

describe("database", () => {
  afterAll(async () => {
    await disconnect();
  });

  it("should connect fine", async () => {
    const result = await db.execute("select 1;");
    expect(result.rowCount).toBe(1);
    expect(result.rows[0]).toMatchObject({ "?column?": 1 });
  });
});
