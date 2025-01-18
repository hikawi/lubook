import BlackLayer from "@/components/misc/BlackLayer.vue";
import { $blackLayer } from "@/stores/black-layer";
import { cleanup, render } from "@testing-library/vue";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";

describe("black layer", () => {
  afterEach(() => {
    cleanup();
  });

  it("doesn't display when toggled off", async () => {
    $blackLayer.set(false);
    render(BlackLayer);
    await expect.element(page.getByTestId("black-layer")).not.toBeVisible();
  });

  it("displays when toggled on", async () => {
    $blackLayer.set(true);
    render(BlackLayer);
    await expect.element(page.getByTestId("black-layer")).toBeVisible();
  });
})
