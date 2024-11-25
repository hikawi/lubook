import { afterEach, describe, expect, it } from "vitest";
import { pool } from "../db";
import { resetDatabase } from "../utils/test-utils";

describe("database connection", () => {
  afterEach(async () => {
    await resetDatabase();

    const conn = await pool.connect();
    await expect(conn.query("select * from user")).resolves.toEqual([]);
    conn.release();
  });

  it("should query fine", async () => {
    const conn = await pool.connect();
    await expect(conn.query("select * from user")).resolves.toHaveLength(0);
    conn.release();
  });
});
