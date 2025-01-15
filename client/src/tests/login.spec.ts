import LoginForm from "@/components/login/LoginForm.vue";
import { cleanup, render } from "@testing-library/vue";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { postMock, redirectMock } = vi.hoisted(() => {
  return {
    postMock: vi.fn(),
    redirectMock: vi.fn((url) => {}),
  };
});

vi.mock(import("../utils/fetcher"), async (factory) => {
  const original = await factory();
  return {
    ...original,
    postJson: postMock,
    redirect: redirectMock,
  };
});

describe("login form", () => {
  afterEach(() => {
    cleanup();
    postMock.mockClear();
    redirectMock.mockClear();
  });

  it("should display", async () => {
    render(LoginForm);

    await expect
      .element(page.getByRole("heading", { name: "Login" }))
      .toBeVisible();
  });

  it("should show profile not exists", async () => {
    render(LoginForm);
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 404 }),
    );

    const usernameField = page.getByLabelText(/username/i);
    const loginButton = page.getByRole("button");
    await loginButton.click();
    await expect
      .element(usernameField)
      .toHaveAccessibleErrorMessage("This account does not exist");
  });

  it("should show wrong password", async () => {
    render(LoginForm);
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 401 }),
    );

    const passwordField = page.getByLabelText(/password/i);
    const loginButton = page.getByRole("button");
    await loginButton.click();
    await expect
      .element(passwordField)
      .toHaveAccessibleErrorMessage("Wrong password");
  });

  it("should show unknown error if 200 and fail", async () => {
    render(LoginForm);
    postMock.mockImplementationOnce(
      async () =>
        new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const usernameField = page.getByLabelText(/username/i);
    const loginButton = page.getByRole("button");
    await loginButton.click();
    expect(redirectMock).not.toHaveBeenCalled();
    await expect
      .element(usernameField)
      .toHaveAccessibleErrorMessage("An unknown error has happened");
  });

  it("should show verify if 403", async () => {
    render(LoginForm);
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 403 }),
    );

    const loginButton = page.getByRole("button");
    await loginButton.click();

    const verifyField = page.getByLabelText("Verification");
    await expect.element(verifyField).toBeVisible();
  });

  it("should redirect if 200 and success", async () => {
    render(LoginForm);
    postMock.mockImplementationOnce(
      async () =>
        new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const loginButton = page.getByRole("button");
    await loginButton.click();
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});

describe("login requests code", () => {
  beforeEach(async () => {
    render(LoginForm);
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 403 }),
    );

    const loginButton = page.getByRole("button");
    await loginButton.click();

    const verifyField = page.getByLabelText("Verification");
    await expect.element(verifyField).toBeVisible();
  });

  afterEach(() => {
    cleanup();
    postMock.mockClear();
    redirectMock.mockClear();
  });

  it("should show 'requested too recently'", async () => {
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 304 }),
    );

    const requestButton = page.getByRole("button", { name: "Get Code" });
    await requestButton.click();

    const verifyField = page.getByLabelText("Verification Code");
    await expect
      .element(verifyField)
      .toHaveAccessibleErrorMessage("You have already requested a code");
  });

  it("should show 'profile is invalid'", async () => {
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 400 }),
    );

    const requestButton = page.getByRole("button", { name: "Get Code" });
    await requestButton.click();

    const verifyField = page.getByLabelText("Verification Code");
    await expect
      .element(verifyField)
      .toHaveAccessibleErrorMessage(/is invalid/i);
  });

  it("should show 'account does not exist'", async () => {
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 404 }),
    );

    const requestButton = page.getByRole("button", { name: "Get Code" });
    await requestButton.click();

    const verifyField = page.getByLabelText("Verification Code");
    await expect
      .element(verifyField)
      .toHaveAccessibleErrorMessage(/does not exist/i);
  });

  it("should show 'code sent' on the button", async () => {
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 201 }),
    );

    const requestButton = page.getByRole("button", { name: "Get Code" });
    await requestButton.click();

    const verifyField = page.getByLabelText("Verification Code");
    await expect.element(verifyField).not.toHaveAccessibleErrorMessage();
    await expect
      .element(page.getByRole("button", { name: "Sent!" }))
      .toBeVisible();
  });

  it("should show 'code invalid' if bad code", async () => {
    postMock.mockImplementationOnce(
      async () => new Response(null, { status: 400 }),
    );

    const loginButton = page.getByRole("button", { name: "Login" });
    await loginButton.click();

    const verifyField = page.getByLabelText("Verification Code");
    expect(postMock).toHaveBeenCalledTimes(2);
    await expect.element(verifyField).toHaveAccessibleErrorMessage(/invalid/i);
  });

  it("should show 'code invalid' if unsuccessful", async () => {
    postMock.mockImplementationOnce(
      async () =>
        new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const loginButton = page.getByRole("button", { name: "Login" });
    await loginButton.click();

    const verifyField = page.getByLabelText("Verification Code");
    expect(postMock).toHaveBeenCalledTimes(2);
    await expect.element(verifyField).toHaveAccessibleErrorMessage(/invalid/i);
  });

  it("should post login after successful verification", async () => {
    postMock
      .mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true }), { status: 200 }),
      )
      .mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

    const profileField = page.getByLabelText("Username");
    const passwordField = page.getByLabelText("Password");
    const verifyField = page.getByLabelText("Verification");

    await userEvent.type(profileField, "luna");
    await userEvent.type(passwordField, "12345");
    await userEvent.type(verifyField, "123456");

    const loginButton = page.getByRole("button", { name: "Login" });
    await loginButton.click();

    expect(postMock).toHaveBeenCalledTimes(3);
    expect(redirectMock).toHaveBeenCalledOnce();
  });
});
