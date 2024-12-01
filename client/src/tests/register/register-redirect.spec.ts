import RegisterForm from "@/components/register/RegisterForm.vue";
import { render } from "@testing-library/vue";
import { page, userEvent } from "@vitest/browser/context";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

describe("register success redirects", () => {

  beforeAll(() => {
    // Mock
    vi.resetModules();
    vi.mock("../../utils/fetcher.ts", () => {
      return {
        redirect: vi.fn((url) => { }),
        postJson: vi.fn(async (url, any) => new Response(null, { status: 201 })),
      }
    })
  });

  afterAll(() => {
    // Unmock
    vi.restoreAllMocks();
    vi.unmock("../../utils/fetcher.ts");
  });

  it("should navigate to login if status 201", async () => {
    // Mock fetch()
    render(RegisterForm);

    const name = page.getByRole("textbox", { name: "Pen Name" });
    const username = page.getByRole("textbox", { name: "Username" });
    const password = page.getByRole("textbox", { name: "Password", exact: true });
    const confirm = page.getByRole("textbox", { name: "Confirm Password" });
    const submit = page.getByRole("button", { name: "Register" });

    await userEvent.type(name, "Luna");
    await userEvent.type(username, "luna");
    await userEvent.type(password, "12345");
    await userEvent.type(confirm, "12345");
    await submit.click();

    const module = await vi.importMock("../../utils/fetcher.ts");
    expect(module.redirect).toHaveBeenCalledWith("/login");
  });
})

