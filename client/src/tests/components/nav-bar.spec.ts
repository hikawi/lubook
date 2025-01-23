import NavigationBar from "@/components/main/NavigationBar.vue";
import { cleanup, render } from "@testing-library/vue";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("navigation bar", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows desktop navigation bar on large screens", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    await page.viewport(1280, 1080);
    render(NavigationBar);

    await expect.element(page.getByTestId("desktop-nav-bar")).toBeVisible();
    await expect.element(page.getByTestId("mobile-nav-bar")).not.toBeInTheDocument();
  });

  it("shows mobile navigation bar on small screens", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    await page.viewport(375, 800);
    render(NavigationBar);

    await expect.element(page.getByTestId("desktop-nav-bar")).not.toBeVisible();
    await expect.element(page.getByTestId("mobile-nav-bar")).toBeInTheDocument();
  });

  it("shows login button if not logged in", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 401 }));
    await page.viewport(1280, 1080);
    render(NavigationBar);

    await expect.element(page.getByTestId("desktop-nav-bar")).toBeVisible();
    await expect.element(page.getByText("Login")).toBeVisible();
  });

  it("shows search bar if turned on", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 401 }));
    await page.viewport(1280, 1080);
    render(NavigationBar, { props: { showSearchBar: true } });

    await expect.element(page.getByPlaceholder("Search")).toBeVisible();
  });

  it("shows links when hovered over profile", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    await page.viewport(1280, 1080);
    render(NavigationBar);

    const img = page.getByLabelText("My Profile");
    await expect.element(img).toBeVisible();

    await img.hover();
    await expect.element(page.getByLabelText("Home")).toBeVisible();
    await img.unhover();
    await expect.element(page.getByLabelText("Home")).not.toBeVisible();
  });
});
