import { getJson } from "@/utils/fetcher";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

describe("fetcher utils", () => {
  const fetchMock = vi.fn();

  beforeAll(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockClear();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("should correct format fetch GET", async () => {
    fetchMock.mockImplementationOnce(async (url, opts) => {
      expect(opts).toHaveProperty("mode", "cors");
      expect(url).toContainEqual("test");
    });

    getJson("test");
  });
});
