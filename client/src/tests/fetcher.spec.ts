import { fetcher, getJson, putJson } from "@/utils/fetcher";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

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
      expect(url).toEqual(`${import.meta.env.PUBLIC_API}/test`);
    });

    getJson("test");
  });

  it("should correct format fetch PUT", async () => {
    fetchMock.mockImplementationOnce(async (url, opts) => {
      expect(opts).toHaveProperty("mode", "cors");
      expect(opts).toHaveProperty("method", "PUT");
      expect(opts).toHaveProperty("credentials", "include");
      expect(url).toEqual(`${import.meta.env.PUBLIC_API}/lol`);
    });

    putJson("lol", {});
  });

  it("should correct format fetcher", async () => {
    fetchMock.mockImplementationOnce(async (url, opts) => {
      expect(opts).toHaveProperty("mode", "cors");
      expect(opts).toHaveProperty("method", "METHOD");
      expect(opts).toHaveProperty("credentials", "include");
      expect(url).toEqual(`${import.meta.env.PUBLIC_API}/lol`);
    });

    fetcher({ path: "lol", method: "METHOD" });
  });
});

