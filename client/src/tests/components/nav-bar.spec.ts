import TopNavBar from "@/components/main/TopNavBar.vue";
import { cleanup, render } from "@testing-library/vue";
import { page } from "@vitest/browser/context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getJsonMock } = vi.hoisted(() => ({
  getJsonMock: vi.fn(),
}));

vi.mock(import("../../utils/fetcher"), async (factory) => {
  const actual = await factory();
  return {
    ...actual,
    getJson: getJsonMock,
  };
});

describe("top nav bar", () => {
  beforeEach(async () => {
    await page.viewport(1440, 1020);
  });

  afterEach(() => {
    cleanup();
  });

  it("should not render on small screens", async () => {
    getJsonMock.mockImplementationOnce(
      async () => new Response(null, { status: 404 }),
    );
    await page.viewport(375, 500);
    render(TopNavBar);
    await expect.element(page.getByText("Lubook")).not.toBeVisible();
  });

  it("should show 'log in' if not logged in", async () => {
    getJsonMock.mockImplementationOnce(
      async () => new Response(null, { status: 404 }),
    );
    render(TopNavBar);
    await expect.element(page.getByText("Login")).toBeVisible();
  });

  it("should show search bar if provided", async () => {
    getJsonMock.mockImplementationOnce(
      async () => new Response(null, { status: 404 }),
    );
    render(TopNavBar, { props: { showSearchBar: true } });
    await expect.element(page.getByRole("textbox")).toBeVisible();
  });
});
