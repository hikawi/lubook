import ProfileView from "@/components/profile/ProfileView.vue";
import { cleanup, render } from "@testing-library/vue";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getJsonMock } = vi.hoisted(() => ({
  getJsonMock: vi.fn(),
}))

vi.mock(import("../utils/fetcher"), async (factory) => {
  const actual = await factory();
  return {
    ...actual,
    getJson: getJsonMock,
  }
});

describe("/profile route", () => {
  afterEach(() => {
    cleanup();
    getJsonMock.mockClear();
  });

  it("displays an error view if profile not found", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    render(ProfileView);

    await expect.element(page.getByText("that profile doesn't exist")).toBeVisible();
  });

  it("calls correct get request if not given username", () => {
    getJsonMock.mockImplementationOnce(async (url) => {
      expect(url).toEqual("profile");
      return new Response(null, { status: 400 });
    });
    render(ProfileView);
  });

  it("calls correct get request if given username", () => {
    getJsonMock.mockImplementationOnce(async (url) => {
      expect(url).toEqual("profile?username=test");
      return new Response(null, { status: 400 });
    });
    render(ProfileView, { props: { username: "test" } });
  });

  it("shows bio if there is bio in the data", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({ bio: "Weehee" }), { status: 200 }));
    render(ProfileView);

    await expect.element(page.getByText("Weehee")).toBeVisible();
  });

  it("shows 'no bio' if there isn't bio in the data", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    render(ProfileView);

    await expect.element(page.getByText("No biography set")).toBeVisible();
  });

  it("displays correct view if viewing my profile", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({ self: true }), { status: 200 }));
    render(ProfileView);

    await expect.element(page.getByText("Edit")).toBeVisible();
  });

  it("displays correct view if viewing others", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({ self: false }), { status: 200 }));
    render(ProfileView);

    await expect.element(page.getByText("Block")).toBeVisible();
    await expect.element(page.getByText("Follow", { exact: true })).toBeVisible();
  });
});
