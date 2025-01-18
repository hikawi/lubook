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

  it("show links when hovered", async () => {
    getJsonMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          avatar: "https://avatars.githubusercontent.com/hikawi",
        }),
        { status: 200 },
      ),
    );
    render(TopNavBar);

    const img = page.getByRole("img", { name: "My Profile" });
    await expect.element(img).toBeVisible();

    await img.hover();
    await expect.element(page.getByLabelText("Home")).toBeVisible();

    await img.unhover();
    await expect.element(page.getByLabelText("Home")).not.toBeVisible();
  });

  it("show login button if unauthorized", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    render(TopNavBar);

    await expect
      .element(page.getByRole("link", { name: "Login" }))
      .toBeVisible();
  });
});
