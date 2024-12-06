import RegisterForm from "@/components/register/RegisterForm.vue";
import { render } from "@testing-library/vue";
import { page, userEvent } from "@vitest/browser/context";
import { beforeAll, describe, expect, it, vi } from "vitest";

describe("register success redirects", () => {
  const { redirectMock, postJsonMock, authMock } = vi.hoisted(() => ({
    redirectMock: vi.fn((url) => { }),
    postJsonMock: vi.fn(
      async (url, body) => new Response(null, { status: 201 })
    ),
    authMock: vi.fn(async (prof, pass) => new Response(null, { status: 200 })),
  }));

  beforeAll(() => {
    vi.mock("../../utils/fetcher.ts", () => ({
      redirect: redirectMock,
      postJson: postJsonMock,
      authenticate: authMock,
    }));
  });

  it("should navigate to login if status 201", async () => {
    render(RegisterForm);

    const name = page.getByRole("textbox", { name: "Pen Name" });
    const username = page.getByRole("textbox", { name: "Username" });
    const email = page.getByRole("textbox", { name: "Email" });
    const password = page.getByRole("textbox", {
      name: "Password",
      exact: true,
    });
    const confirm = page.getByRole("textbox", { name: "Confirm Password" });
    const submit = page.getByRole("button", { name: "Register" });

    await userEvent.type(name, "Luna");
    await userEvent.type(username, "luna");
    await userEvent.type(email, "luna@example.com");
    await userEvent.type(password, "12345");
    await userEvent.type(confirm, "12345");
    await submit.click();

    expect(redirectMock).toHaveBeenCalledWith("/register/success");
  });
});
