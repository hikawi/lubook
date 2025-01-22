import ProfileEdit from "@/components/profile/ProfileEdit.vue";
import { cleanup, render } from "@testing-library/vue";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

const { getJsonMock, redirectMock, putJsonMock, fetcherMock } = vi.hoisted(() => ({
  getJsonMock: vi.fn(),
  redirectMock: vi.fn(),
  putJsonMock: vi.fn(),
  fetcherMock: vi.fn(),
}))

vi.mock(import("../utils/fetcher"), async factory => {
  const actual = await factory();
  return {
    ...actual,
    getJson: getJsonMock,
    redirect: redirectMock,
    putJson: putJsonMock,
    fetcher: fetcherMock,
  };
});

describe("profile edit", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should have fields to edit", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))
    render(ProfileEdit);

    expect(getJsonMock).toHaveBeenCalledOnce();
    await expect.element(page.getByLabelText("username")).toBeVisible();
  });

  it("redirects to login if not 200", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(null, { status: 400 }))
    render(ProfileEdit);

    await nextTick();
    expect(getJsonMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledOnce();
  });

  it("redirects to same page after deleting avatar", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    fetcherMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    render(ProfileEdit);

    const btn = page.getByRole("button", { name: "Delete Avatar" });
    await btn.click();

    expect(fetcherMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/profile/edit");
  });

  it("does nothing if deleting avatar didn't 200 OK", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    fetcherMock.mockResolvedValueOnce(new Response(null, { status: 400 }));
    render(ProfileEdit);

    const btn = page.getByRole("button", { name: "Delete Avatar" });
    await btn.click();

    expect(fetcherMock).toHaveBeenCalledOnce();
    expect(redirectMock).not.toHaveBeenCalledOnce();
  });

  it("redirects to /profile clicking discard changes", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    render(ProfileEdit);

    const btn = page.getByRole("button", { name: "Discard Changes" });
    await btn.click();

    expect(redirectMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/profile");
  });

  it("uploads avatar on file upload", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    fetcherMock.mockResolvedValueOnce(new Response(JSON.stringify({ location: "test" }), { status: 201 }));
    render(ProfileEdit);

    const uploadBtn = page.getByRole("button", { name: "Upload" });
    await uploadBtn.click();

    const fileInput = page.getByTestId("image-chooser");
    await userEvent.upload(fileInput, "./images/profile-test.png");
    expect(fetcherMock).toHaveBeenCalledOnce();
  });

  it("changes nothing on file upload if not 201", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    fetcherMock.mockResolvedValueOnce(new Response(JSON.stringify({ location: "test" }), { status: 200 }));
    render(ProfileEdit);

    const uploadBtn = page.getByRole("button", { name: "Upload" });
    await uploadBtn.click();

    const fileInput = page.getByTestId("image-chooser");
    await userEvent.upload(fileInput, "./images/profile-test.png");
    expect(fetcherMock).toHaveBeenCalledOnce();
  });

  it("saves changes sends a PUT request", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    putJsonMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    render(ProfileEdit);

    const nameField = page.getByLabelText("Pen Name");
    const usernameField = page.getByLabelText("Username");
    const bioField = page.getByLabelText("Biography");

    await userEvent.type(nameField, "Test");
    await userEvent.type(usernameField, "test");
    await userEvent.type(bioField, "Test Bio");

    const btn = page.getByRole("button", { name: "Save Changes" });
    await btn.click();

    expect(putJsonMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/profile");
  });

  it("shows error if username is invalid", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    putJsonMock.mockResolvedValueOnce(new Response(null, { status: 400 }));
    render(ProfileEdit);

    const usernameField = page.getByLabelText("Username");

    await expect.element(usernameField).not.toHaveAccessibleErrorMessage();
    const btn = page.getByRole("button", { name: "Save Changes" });
    await btn.click();
    await expect.element(usernameField).toHaveAccessibleErrorMessage("Username is invalid");
  });

  it("shows error if username is taken", async () => {
    getJsonMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
    putJsonMock.mockResolvedValueOnce(new Response(null, { status: 409 }));
    render(ProfileEdit);

    const usernameField = page.getByLabelText("Username");

    await expect.element(usernameField).not.toHaveAccessibleErrorMessage();
    const btn = page.getByRole("button", { name: "Save Changes" });
    await btn.click();
    await expect.element(usernameField).toHaveAccessibleErrorMessage("That username is taken");
  });
})
