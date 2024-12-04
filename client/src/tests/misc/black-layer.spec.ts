import BlackLayer from "@/components/misc/BlackLayer.vue";
import { $blackLayer } from "@/stores/black-layer";
import { render } from "@testing-library/vue";
import { page } from "@vitest/browser/context";
import { allTasks } from "nanostores";
import { describe, expect, it } from "vitest";

describe("black layer", () => {
  it("should show black layer if store is true", async () => {
    render(BlackLayer);
    $blackLayer.set(true);
    await allTasks();
    await expect.element(page.getByTestId("black-layer")).toBeVisible();
  });

  it("should not show black layer if store is false", async () => {
    render(BlackLayer);
    $blackLayer.set(false);
    await allTasks();
    await expect
      .element(page.getByTestId("black-layer"))
      .not.toBeInTheDocument();
  });
});
