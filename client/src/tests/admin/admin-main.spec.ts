import AdminBanner from "@/components/admin/AdminBanner.vue";
import { cleanup, render } from "@testing-library/vue";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";

describe("admin tools panel", () => {
  afterEach(() => {
    cleanup();
  });

  it("should show banner", async () => {
    render(AdminBanner);
    await expect.element(page.getByText("administrator tools")).toBeVisible();
  });
});
