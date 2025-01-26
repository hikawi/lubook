import ProfileView from "@/components/profile/ProfileView.vue";
import { $locale } from "@/stores/i18n";
import { cleanup, render } from "@testing-library/vue";
import { allTasks, cleanStores } from "nanostores";
import { afterEach, describe, it, vi } from "vitest";

vi.mock(import("../utils/fetcher"), async (factory) => {
  const actual = await factory();
  return {
    ...actual,
    getJson: vi.fn(
      async () => new Response(JSON.stringify({}), { status: 200 }),
    ),
  };
});

describe("i18n store", () => {
  afterEach(() => {
    cleanStores($locale);
    cleanup();
  });

  it("should import new translations if locale changes", async () => {
    $locale.set("ja");
    render(ProfileView, { props: { username: "@strawberry" } });
    await allTasks();
  });
});
