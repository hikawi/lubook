import RegisterSuccess from "@/components/register/RegisterSuccess.vue";
import { cleanup, render } from "@testing-library/vue";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";

describe("register success", async () => {
  afterEach(() => {
    cleanup();
  });

  it("should be visible", async () => {
    render(RegisterSuccess);

    const heading = page.getByRole("heading", { name: "check your email!" });
    const link = page.getByRole("link", { name: "login" });
    await expect.element(heading).toBeVisible();
    await expect.element(link).toBeVisible();
  });
});
