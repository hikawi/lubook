import { cleanup } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getMock, postMock, putMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock(import("../../utils/fetcher"), async (factory) => {
  const actual = await factory();
  return {
    ...actual,
    getJson: getMock,
    postJson: postMock,
    putJson: putMock,
    deleteJson: deleteMock,
  };
});

describe("tags management", () => {
  const fakeRes = {
    results: [
      { id: 1, name: "Test", publications: 0 },
      { id: 2, name: "Tag", publications: 1 },
      { id: 3, name: "Game", publications: 10000 },
    ],
    total: 3,
    total_pages: 2,
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("1+1 is 2", async () => {
    expect(1 + 1).toBe(2);
  });
});
