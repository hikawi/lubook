import RegisterForm from "@/components/register/RegisterForm.vue";
import { cleanup, render } from "@testing-library/vue";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("register form", () => {
  afterEach(() => {
    cleanup();
  });

  it("should show", async () => {
    render(RegisterForm);
    await expect
      .element(page.getByRole("heading", { name: "Register" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("textbox", { name: "Pen Name" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("textbox", { name: "Username" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("textbox", { name: "Password", exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByRole("textbox", { name: "Confirm Password" }))
      .toBeVisible();
  });

  it("should show errors if invalid fields", async () => {
    const fetchMock = vi.fn(
      async (url, options) => new Response(new Blob(), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(RegisterForm);

    const name = page.getByRole("textbox", { name: "Pen Name" });
    const username = page.getByRole("textbox", { name: "Username" });
    const password = page.getByRole("textbox", {
      name: "Password",
      exact: true,
    });
    const confirm = page.getByRole("textbox", { name: "Confirm Password" });
    const submit = page.getByRole("button", { name: "Register" });

    await userEvent.type(name, "Luna");
    await userEvent.type(username, "luna@$");
    await userEvent.type(password, "1");
    await userEvent.type(confirm, "1234");
    await submit.click();

    expect(fetchMock).not.toHaveBeenCalled();
    await expect
      .element(username)
      .toHaveAccessibleErrorMessage(
        "Username can't contain special characters"
      );
    await expect
      .element(password)
      .toHaveAccessibleErrorMessage("Password too short");
    await expect
      .element(confirm)
      .toHaveAccessibleErrorMessage("Passwords don't match");

    fetchMock.mockRestore();
    vi.unstubAllGlobals();
  });

  it("should call fetch post if valid fields", async () => {
    const fetchMock = vi.fn(
      async (url, options) => new Response(null, { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(RegisterForm);

    const name = page.getByRole("textbox", { name: "Pen Name" });
    const username = page.getByRole("textbox", { name: "Username" });
    const password = page.getByRole("textbox", {
      name: "Password",
      exact: true,
    });
    const confirm = page.getByRole("textbox", { name: "Confirm Password" });
    const submit = page.getByRole("button", { name: "Register" });

    await userEvent.type(name, "Luna");
    await userEvent.type(username, "luna");
    await userEvent.type(password, "12345");
    await userEvent.type(confirm, "12345");
    await submit.click();

    expect(fetchMock).toHaveBeenCalledWith(
      `${import.meta.env.PUBLIC_API}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Luna",
          username: "luna",
          password: "12345",
        }),
      }
    );

    fetchMock.mockRestore();
    vi.unstubAllGlobals();
  });

  it("should show 'invalid' fields if error code 400", async () => {
    const fetchMock = vi.fn(
      async (url, options) => new Response(null, { status: 400 })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(RegisterForm);

    const name = page.getByRole("textbox", { name: "Pen Name" });
    const username = page.getByRole("textbox", { name: "Username" });
    const password = page.getByRole("textbox", {
      name: "Password",
      exact: true,
    });
    const confirm = page.getByRole("textbox", { name: "Confirm Password" });
    const submit = page.getByRole("button", { name: "Register" });

    await userEvent.type(name, "Luna");
    await userEvent.type(username, "luna");
    await userEvent.type(password, "12345");
    await userEvent.type(confirm, "12345");
    await submit.click();

    await expect
      .element(username)
      .toHaveAccessibleErrorMessage("Username might be invalid?");
    await expect
      .element(password)
      .toHaveAccessibleErrorMessage("Password might be invalid?");
    await expect
      .element(confirm)
      .toHaveAccessibleErrorMessage("Confirm might be invalid?");

    fetchMock.mockRestore();
    vi.unstubAllGlobals();
  });

  it("should show 'taken username' if error code 409", async () => {
    const fetchMock = vi.fn(
      async (url, options) => new Response(null, { status: 409 })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(RegisterForm);

    const name = page.getByRole("textbox", { name: "Pen Name" });
    const username = page.getByRole("textbox", { name: "Username" });
    const password = page.getByRole("textbox", {
      name: "Password",
      exact: true,
    });
    const confirm = page.getByRole("textbox", { name: "Confirm Password" });
    const submit = page.getByRole("button", { name: "Register" });

    await userEvent.type(name, "Luna");
    await userEvent.type(username, "luna");
    await userEvent.type(password, "12345");
    await userEvent.type(confirm, "12345");
    await submit.click();

    await expect
      .element(username)
      .toHaveAccessibleErrorMessage("Username already taken");
    await expect.element(password).not.toHaveAccessibleErrorMessage();
    await expect.element(confirm).not.toHaveAccessibleErrorMessage();

    // Unmock.
    fetchMock.mockRestore();
    vi.unstubAllGlobals();
  });
});
