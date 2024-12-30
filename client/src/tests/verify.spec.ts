import VerifyFailed from "@/components/verify/VerifyFailed.vue";
import VerifySuccess from "@/components/verify/VerifySuccess.vue";
import { cleanup, render } from "@testing-library/vue";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { postJson, redirect } = vi.hoisted(() => ({
  postJson: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock(import("../utils/fetcher"), async (factory) => {
  const original = await factory();
  return {
    ...original,
    postJson,
    redirect,
  }
})

describe("verify success page", () => {
  beforeEach(() => {
    render(VerifySuccess);
  });

  afterEach(() => {
    cleanup();
  });

  it("should show correct elements", async () => {
    await expect.element(page.getByText("Verify Success")).toBeVisible();
  });
});

describe("verify failed page", () => {
  beforeEach(() => {
    render(VerifyFailed);
  });

  afterEach(() => {
    cleanup();
    postJson.mockClear();
  });

  it("should show correct elements", async () => {
    await expect.element(page.getByText("Verify Failed...")).toBeVisible();
  });

  it("should show field after click", async () => {
    await page.getByRole("button").click();
    await expect.element(page.getByLabelText("Username")).toBeVisible();
  });

  it("should show error if profile invalid", async () => {
    postJson.mockImplementationOnce(async () => new Response(null, { status: 400 }));
    const button = page.getByRole("button");
    await button.click();

    const input = page.getByRole("textbox");
    await button.click();
    await expect.element(input).toHaveAccessibleErrorMessage(/invalid/i);
  });

  it("should show error if profile doesn't exist", async () => {
    postJson.mockImplementationOnce(async () => new Response(null, { status: 404 }));
    const button = page.getByRole("button");
    await button.click();

    const input = page.getByRole("textbox");
    await button.click();
    await expect.element(input).toHaveAccessibleErrorMessage(/not exist/i);
  });

  it("should show error if request too recent", async () => {
    postJson.mockImplementationOnce(async () => new Response(null, { status: 304 }));
    const button = page.getByRole("button");
    await button.click();

    const input = page.getByRole("textbox");
    await button.click();
    await expect.element(input).toHaveAccessibleErrorMessage(/already/i);
  });

  it("should show error if correct", async () => {
    postJson.mockImplementationOnce(async () => new Response(null, { status: 201 }));
    const button = page.getByRole("button");
    await button.click();

    const input = page.getByRole("textbox");
    await userEvent.type(input, "1234");
    await button.click();
    await expect.element(input).not.toHaveAccessibleErrorMessage();
    expect(redirect).toHaveBeenCalledWith("/register/success");
  });
})
